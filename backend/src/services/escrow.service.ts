import * as paymentRepo from '../repositories/payment.repository';
import { paymentProvider } from './payment.service';
import { AppError } from '../errors/AppError';
import logger from '../lib/logger';

/** Prisma unique-constraint violation — used to make ledger writes idempotent. */
const isUniqueViolation = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && (err as { code?: string }).code === 'P2002';

/**
 * Brand approved the deliverable → release escrow hold to the creator's
 * withdrawable balance. Safe to call more than once: a duplicate RELEASE
 * ledger entry is rejected by @@unique([transactionId, type]) and treated
 * as a no-op, so balances never double-apply.
 */
export const releaseFunds = async (offerId: string) => {
  const transaction = await paymentRepo.findTransactionByOfferId(offerId);
  if (!transaction) throw AppError.notFound('No funded transaction for this offer');
  if (transaction.status !== 'paid') {
    throw AppError.badRequest('Cannot release escrow: offer is not funded', 'ESCROW_NOT_FUNDED');
  }

  try {
    const creator = await paymentRepo.releaseCreatorFunds(
      transaction.creatorId,
      transaction.id,
      transaction.netKobo,
      'Escrow released — brand approved deliverable',
    );
    logger.info({ offerId, transactionId: transaction.id }, 'escrow released to withdrawable balance');
    return creator;
  } catch (err) {
    if (isUniqueViolation(err)) {
      logger.info({ offerId, transactionId: transaction.id }, 'escrow already released (idempotent no-op)');
      return null;
    }
    throw err;
  }
};

/**
 * Dispute resolved in the brand's favour → reverse the escrow hold and refund
 * the gross amount to the brand via the payment provider.
 *
 * Ordering is deliberate for money-safety:
 *   1. Reverse the hold (creates the unique REFUND ledger entry).
 *   2. Refund the brand via the provider.
 *   3. Mark the transaction `refunded`.
 * The transaction is only marked `refunded` after the provider refund succeeds,
 * so a mid-way failure is safely retryable. The unique REFUND ledger entry plus
 * the provider's own "already fully reversed" guard prevent double refunds.
 */
export const refundFunds = async (offerId: string, actorId: string) => {
  const transaction = await paymentRepo.findTransactionByOfferId(offerId);
  if (!transaction) throw AppError.notFound('No funded transaction for this offer');
  if (transaction.status === 'refunded') {
    return { alreadyRefunded: true, transactionId: transaction.id };
  }
  if (transaction.status !== 'paid') {
    throw AppError.badRequest('Cannot refund: offer is not in a refundable state', 'ESCROW_NOT_REFUNDABLE');
  }
  if (!transaction.paystackRef) {
    throw AppError.badRequest('Cannot refund: missing payment reference', 'MISSING_PAYMENT_REF');
  }

  // Funds that were already RELEASED to the creator's withdrawable balance (offer
  // reached APPROVED) cannot be refunded by reversing the hold — the hold is gone.
  const released = await paymentRepo.findLedgerEntryByType(transaction.id, 'RELEASE');
  if (released) {
    throw AppError.badRequest(
      'Cannot refund: funds were already released to the creator',
      'ALREADY_RELEASED',
    );
  }

  try {
    await paymentRepo.refundCreatorHold(
      transaction.creatorId,
      transaction.id,
      transaction.netKobo,
      'Escrow refunded — dispute resolved in brand favour',
    );
  } catch (err) {
    // Hold already reversed by a prior partial attempt — continue to finalize
    // the provider refund + status. Any other error is fatal.
    if (!isUniqueViolation(err)) throw err;
    logger.info({ offerId, transactionId: transaction.id }, 'escrow hold already reversed; finalizing refund');
  }

  try {
    await paymentProvider.createRefund(transaction.paystackRef, transaction.grossKobo);
  } catch (err) {
    logger.error(
      { offerId, transactionId: transaction.id, err: (err as Error).message },
      'provider refund failed — ledger reversed but provider refund pending manual resolution',
    );
    throw new AppError(
      'Refund partially completed — provider refund failed, requires manual resolution',
      500,
      'PROVIDER_REFUND_FAILED',
    );
  }
  await paymentRepo.updateTransactionStatus(transaction.id, 'refunded');

  logger.info({ offerId, transactionId: transaction.id, actorId }, 'escrow refunded to brand');
  return { refunded: true, transactionId: transaction.id };
};
