import crypto from 'crypto';
import * as paymentRepo from '../repositories/payment.repository';
import * as offerRepo from '../repositories/offer.repository';
import * as creatorRepo from '../repositories/creator.repository';
import { paymentProvider } from './payment.service';
import { calculateSplitKobo } from '../utils/money';
import { recordAudit } from './audit.service';
import { AppError } from '../errors/AppError';
import logger from '../lib/logger';

export const initiatePayment = async (
  offerId: string,
  brandUserId: string,
  successUrl?: string,
) => {
  const offer = await offerRepo.findOfferById(offerId);
  if (!offer) throw AppError.notFound('Offer not found');
  if (offer.brand.userId !== brandUserId) throw AppError.forbidden('Not authorized');
  if (offer.status !== 'ACCEPTED') {
    throw AppError.badRequest('Offer must be ACCEPTED before payment');
  }

  const existing = await paymentRepo.findTransactionByOfferId(offerId);
  if (existing) throw AppError.conflict('Payment already initiated for this offer');

  const reference = `tehilla_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const transaction = await paymentRepo.createTransaction(offerId, offer.creatorId, offer.amountKobo);
  await paymentRepo.updateTransactionRef(transaction.id, reference);

  const result = await paymentProvider.initializeTransaction({
    email: offer.brand.user?.email ?? 'noreply@tehilla.app',
    amountKobo: offer.amountKobo,
    reference,
    callbackUrl: successUrl,
    metadata: { offerId, transactionId: transaction.id },
  });

  await recordAudit({
    actorId: brandUserId,
    action: 'payment.initiate',
    entityType: 'Transaction',
    entityId: transaction.id,
    metadata: { offerId, amountKobo: offer.amountKobo, reference },
  });

  return { ...result, transactionId: transaction.id };
};

export const verifyPayment = async (reference: string) => {
  const transaction = await paymentRepo.findTransactionByRef(reference);
  if (!transaction) throw AppError.notFound('Transaction not found');
  if (transaction.status === 'paid') {
    return { alreadyPaid: true, transactionId: transaction.id };
  }

  const result = await paymentProvider.verifyTransaction(reference);
  if (!result.data || result.data.status !== 'success') {
    throw AppError.badRequest('Payment not successful');
  }

  await paymentRepo.recordPaidTransaction({
    transaction,
    paystackRef: reference,
  });

  // Update offer to FUNDED
  const tx = await paymentRepo.findTransactionById(transaction.id);
  if (tx) {
    await offerRepo.updateOfferStatus(tx.offerId, { status: 'FUNDED' });
  }

  return { success: true, transactionId: transaction.id };
};

export const requestPayout = async (offerId: string, actorUserId: string, actorRole: string) => {
  const offer = await offerRepo.findOfferById(offerId);
  if (!offer) throw AppError.notFound('Offer not found');

  const isAuthorized =
    actorRole === 'ADMIN' ||
    offer.brand.userId === actorUserId ||
    offer.creator.userId === actorUserId;
  if (!isAuthorized) throw AppError.forbidden('Not authorized for this payout');

  // Escrow guard: funds are only withdrawable AFTER the brand approves the
  // deliverable (APPROVED triggers the RELEASE from held → withdrawable balance).
  if (offer.status === 'COMPLETED') {
    throw AppError.conflict('This offer has already been paid out');
  }
  if (offer.status !== 'APPROVED') {
    throw AppError.badRequest(
      'Funds can only be paid out after the brand approves the deliverable',
      'PAYOUT_NOT_APPROVED',
    );
  }

  const transaction = await paymentRepo.findTransactionByOfferId(offerId);
  if (!transaction) throw AppError.notFound('Transaction not found for this offer');

  const creator = await creatorRepo.findCreatorById(offer.creatorId);
  if (!creator) throw AppError.notFound('Creator not found');
  if (!creator.paystackCode) {
    throw AppError.badRequest('Creator has no bank account on file', 'NO_BANK_ACCOUNT');
  }
  let payout = await paymentRepo.findPayoutByTransactionId(transaction.id);
  if (payout?.status === 'COMPLETED') throw AppError.conflict('Already paid out');
  if (payout?.status === 'PROCESSING') throw AppError.conflict('Payout already in progress');
  if (!payout) {
    try {
      payout = await paymentRepo.createPayoutForTransaction(
        transaction.id,
        offer.creatorId,
        transaction.netKobo,
      );
    } catch (err) {
      if ((err as { code?: string }).code === 'P2002') {
        throw AppError.conflict('Payout already in progress');
      }
      throw err;
    }
  }

  const claimed = await paymentRepo.claimPayoutForProcessing(payout.id);
  if (!claimed) throw AppError.conflict('Payout already in progress');

  const reserved = await paymentRepo.reserveBalanceForPayout(
    offer.creatorId,
    transaction.id,
    transaction.netKobo,
  );
  if (!reserved) {
    await paymentRepo.updatePayout(payout.id, {
      status: 'FAILED',
      failureReason: 'Insufficient withdrawable balance',
    });
    throw AppError.badRequest('Insufficient withdrawable balance for this payout', 'INSUFFICIENT_BALANCE');
  }

  const payoutReference = `payout_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const reason = `Tehilla offer payment: ${offer.title}`;

  try {
    const result = await paymentProvider.sendPayoutKobo(
      creator.paystackCode,
      transaction.netKobo,
      reason,
      payoutReference,
    );
    const providerRef =
      (result.data?.['transfer_code'] as string | undefined) ?? result.reference ?? payoutReference;
    await paymentRepo.updatePayout(payout.id, { status: 'PROCESSING', providerRef });

    await recordAudit({
      actorId: actorUserId,
      action: 'payout.request',
      entityType: 'Payout',
      entityId: payout.id,
      metadata: { offerId, amountKobo: transaction.netKobo, providerRef },
    });

    return { success: true, reference: providerRef };
  } catch (err) {
    await paymentRepo.refundPayoutReservation(
      offer.creatorId,
      transaction.id,
      transaction.netKobo,
      'Payout failed — balance restored',
    );
    await paymentRepo.updatePayout(payout.id, {
      status: 'FAILED',
      failureReason: (err as Error).message,
    });
    throw err;
  }
};

export interface ProcessWebhookEventParams {
  webhookId: string;
  event: string;
  data: Record<string, unknown>;
}

export const processPaystackWebhook = async (params: ProcessWebhookEventParams) => {
  const { webhookId, event, data } = params;

  try {
    if (event === 'charge.success') {
      const reference = data['reference'] as string | undefined;
      if (!reference) return;

      const existing = await paymentRepo.findTransactionByRef(reference);
      if (existing?.status === 'paid') {
        await paymentRepo.markWebhook(webhookId, 'PROCESSED');
        return;
      }

      const verified = await paymentProvider.verifyTransaction(reference);
      if (verified.data.status === 'success' && existing) {
        await paymentRepo.recordPaidTransaction({ transaction: existing, paystackRef: reference });
        await offerRepo.updateOfferStatus(existing.offerId, { status: 'FUNDED' });
        await recordAudit({
          action: 'payment.received',
          entityType: 'Transaction',
          entityId: existing.id,
          metadata: { reference, amountKobo: existing.grossKobo, offerId: existing.offerId },
        });
      }
    }

    if (event === 'transfer.success') {
      const transferCode = (data['transfer_code'] ?? data['id']) as string | undefined;
      if (!transferCode) return;

      const payout = await paymentRepo.findPayoutByProviderRef(String(transferCode));
      if (payout) {
        await paymentRepo.updatePayout(payout.id, {
          status: 'COMPLETED',
          providerRef: String(transferCode),
        });
        await offerRepo.updateOfferStatus(payout.transaction.offerId, { status: 'COMPLETED' });
        await recordAudit({
          action: 'payout.completed',
          entityType: 'Payout',
          entityId: payout.id,
          metadata: { transferCode, amountKobo: payout.amountKobo, creatorId: payout.creatorId },
        });
      }
    }

    if (event === 'transfer.failed' || event === 'transfer.reversed') {
      const transferCode = (data['transfer_code'] ?? data['id']) as string | undefined;
      if (transferCode) {
        const payout = await paymentRepo.findPayoutByProviderRef(String(transferCode));
        if (payout) {
          const newStatus = event === 'transfer.reversed' ? 'REVERSED' as const : 'FAILED' as const;
          await paymentRepo.updatePayout(payout.id, {
            status: newStatus,
            failureReason: (data['gateway_response'] as string | undefined) ?? event,
          });
          await paymentRepo.refundPayoutReservation(
            payout.creatorId,
            payout.transactionId,
            payout.amountKobo,
            `Payout ${newStatus.toLowerCase()} — balance restored`,
          );
          await recordAudit({
            action: `payout.${newStatus.toLowerCase()}`,
            entityType: 'Payout',
            entityId: payout.id,
            metadata: { transferCode, reason: data['gateway_response'], amountKobo: payout.amountKobo },
          });
        }
      }
    }

    await paymentRepo.markWebhook(webhookId, 'PROCESSED');
  } catch (err) {
    logger.error({ err: (err as Error).message, webhookId, event }, 'webhook processing failed');
    await paymentRepo.markWebhook(webhookId, 'FAILED', (err as Error).message);
    throw err;
  }
};