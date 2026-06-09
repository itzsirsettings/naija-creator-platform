const crypto = require('crypto');
const env = require('../config/env');
const prisma = require('../lib/prisma');
const { enqueueOrRun } = require('../queues');
const {
  getBanks,
  initializeTransaction,
  sendPayoutKobo,
  verifyTransaction,
  verifyWebhookSignature,
} = require('../services/paystack.service');
const { recordAudit } = require('../services/audit.service');
const { addLegacyMoneyFields, calculateSplitKobo } = require('../utils/money');
const { webhookEvents } = require('../lib/metrics');

const transactionResponse = (transaction) => addLegacyMoneyFields(transaction);

const webhookIdFor = (provider, event) => {
  const id = event?.id || event?.data?.id || event?.data?.reference || event?.data?.transfer_code;
  if (id) return String(id);
  return crypto.createHash('sha256').update(JSON.stringify(event || {})).digest('hex');
};

const storeWebhookEvent = async ({ provider, eventId, eventType, payload }) => {
  try {
    return await prisma.providerWebhookEvent.create({
      data: { provider, eventId, eventType, payload },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      webhookEvents.labels(provider, eventType, 'duplicate').inc();
      return null;
    }
    throw err;
  }
};

const markWebhook = async (webhookId, status, error) => {
  if (!webhookId) return;
  await prisma.providerWebhookEvent.update({
    where: { id: webhookId },
    data: {
      status,
      error: error ? String(error).slice(0, 1000) : null,
      processedAt: ['PROCESSED', 'FAILED'].includes(status) ? new Date() : undefined,
    },
  });
};

const assertBrandOwner = (offer, userId) => {
  if (offer.brand.userId !== userId) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }
};

const assertSuccessfulPaystackCharge = (offer, payment) => {
  if (!payment) return;

  if (payment.status && payment.status !== 'success') {
    const err = new Error(`Paystack transaction is ${payment.status}`);
    err.statusCode = 409;
    throw err;
  }

  if (payment.currency && String(payment.currency).toUpperCase() !== 'NGN') {
    const err = new Error('Paystack transaction currency mismatch');
    err.statusCode = 400;
    throw err;
  }

  if (payment.amount !== undefined && Number(payment.amount) !== Number(offer.amountKobo)) {
    const err = new Error('Paystack transaction amount mismatch');
    err.statusCode = 400;
    throw err;
  }
};

const recordPaidTransaction = async ({ offerId, paystackRef, payment }) => {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { creator: true, brand: true },
  });

  if (!offer) return null;
  assertSuccessfulPaystackCharge(offer, payment);

  const split = calculateSplitKobo(offer.amountKobo);
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.upsert({
      where: { offerId },
      update: {
        ...split,
        paystackRef,
        status: 'paid',
      },
      create: {
        offerId,
        creatorId: offer.creatorId,
        ...split,
        paystackRef,
        status: 'paid',
      },
    });

    await tx.offer.updateMany({
      where: { id: offerId, status: { in: ['ACCEPTED', 'FUNDED'] } },
      data: { status: 'FUNDED' },
    });

    return transaction;
  });
};

const initiatePayment = async (req, res, next) => {
  try {
    const { offerId, successUrl, cancelUrl } = req.validated?.body || req.body;

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { brand: true, creator: true, transaction: true },
    });

    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    assertBrandOwner(offer, req.user.id);

    if (offer.status !== 'ACCEPTED') {
      return res.status(409).json({ error: 'Creator must accept the offer before brand payment' });
    }

    if (['paid', 'processing', 'completed'].includes(offer.transaction?.status)) {
      return res.json({
        mode: 'existing',
        paystackRef: offer.transaction.paystackRef,
        transaction: transactionResponse(offer.transaction),
      });
    }

    const paymentReference = `offer_${offer.id}_${Date.now()}`;
    const session = await initializeTransaction({
      email: req.user.email,
      amountKobo: offer.amountKobo,
      reference: paymentReference,
      callbackUrl: successUrl || `${env.frontendUrl}/payments`,
      metadata: {
        offerId: offer.id,
        brandId: offer.brandId,
        creatorId: offer.creatorId,
        cancelUrl,
      },
    });
    const split = calculateSplitKobo(offer.amountKobo);
    const nextTransactionStatus = session.mode === 'mock' ? 'paid' : 'pending';

    const transaction = await prisma.transaction.upsert({
      where: { offerId },
      update: {
        ...split,
        paystackRef: session.paystackRef,
        status: nextTransactionStatus,
      },
      create: {
        offerId,
        creatorId: offer.creatorId,
        ...split,
        paystackRef: session.paystackRef,
        status: nextTransactionStatus,
      },
    });

    if (session.mode === 'mock') {
      await prisma.offer.update({
        where: { id: offerId },
        data: { status: 'FUNDED' },
      });
    }

    await recordAudit({ req, action: 'payment.initiate', entityType: 'Offer', entityId: offerId, metadata: { transactionId: transaction.id } });
    return res.json({ ...session, transaction: transactionResponse(transaction) });
  } catch (err) {
    next(err);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.validated?.body || req.body;

    const verification = await verifyTransaction(reference);
    const payment = verification?.data;

    if (!verification?.status || payment?.status !== 'success') {
      return res.status(409).json({ error: 'Paystack transaction is not successful yet' });
    }

    const existingTransaction = await prisma.transaction.findFirst({
      where: { paystackRef: reference },
      include: { offer: { include: { brand: true } } },
    });
    const offerId = payment?.metadata?.offerId || existingTransaction?.offerId;

    if (!offerId) {
      return res.status(404).json({ error: 'No offer found for this Paystack reference' });
    }

    const offer = existingTransaction?.offer || await prisma.offer.findUnique({
      where: { id: offerId },
      include: { brand: true },
    });

    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    if (req.user.role === 'BRAND') assertBrandOwner(offer, req.user.id);

    const transaction = await recordPaidTransaction({ offerId, paystackRef: reference, payment });
    await recordAudit({ req, action: 'payment.verify', entityType: 'Offer', entityId: offerId, metadata: { paystackRef: reference } });

    res.json({ success: true, transaction: transactionResponse(transaction) });
  } catch (err) {
    next(err);
  }
};

const payout = async (req, res, next) => {
  try {
    const { offerId } = req.validated?.body || req.body;

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { creator: { include: { user: true } }, brand: true, transaction: { include: { payout: true } } },
    });

    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    if (req.user.role === 'BRAND') assertBrandOwner(offer, req.user.id);

    if (offer.status !== 'APPROVED') {
      return res.status(409).json({ error: 'Brand must approve submitted work before payout' });
    }

    if (!offer.creator.isVerified) {
      return res.status(409).json({ error: 'Creator must be verified by an admin before receiving payouts. Please contact support.' });
    }

    if (!offer.creator.paystackCode) {
      return res.status(409).json({ error: 'Creator must add a verified bank account before payout' });
    }

    if (!offer.transaction || !['paid', 'processing', 'completed'].includes(offer.transaction.status)) {
      return res.status(409).json({ error: 'Brand payment must be recorded before payout' });
    }

    if (offer.transaction.status === 'completed') {
      return res.json({ success: true, transaction: transactionResponse(offer.transaction), alreadyCompleted: true });
    }

    if (offer.transaction.status === 'processing' || offer.transaction.payout?.status === 'PROCESSING') {
      return res.json({ success: true, transaction: transactionResponse(offer.transaction), processing: true });
    }

    if (offer.transaction.status !== 'paid') {
      return res.status(409).json({ error: 'Payout can only be queued from a paid transaction' });
    }

    const split = calculateSplitKobo(offer.amountKobo);
    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { offerId },
        data: { ...split, creatorId: offer.creatorId, status: 'processing' },
      });
      await tx.payout.upsert({
        where: { transactionId: offer.transaction.id },
        update: { amountKobo: split.netKobo, provider: 'PAYSTACK', status: 'PROCESSING' },
        create: {
          transactionId: offer.transaction.id,
          creatorId: offer.creatorId,
          amountKobo: split.netKobo,
          provider: 'PAYSTACK',
          status: 'PROCESSING',
        },
      });
    });

    const payoutReference = `payout_${offer.transaction.id}_${Date.now()}`;
    let payoutResult;
    try {
      payoutResult = await sendPayoutKobo(
        offer.creator.paystackCode,
        split.netKobo,
        `Payment for ${offer.title}`,
        payoutReference,
      );
      if (payoutResult?.status === false) {
        const err = new Error(payoutResult?.message || 'Paystack transfer failed');
        err.statusCode = 502;
        throw err;
      }
    } catch (err) {
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({ where: { offerId }, data: { status: 'paid' } });
        await tx.payout.update({
          where: { transactionId: offer.transaction.id },
          data: { status: 'FAILED', failureReason: err.message },
        });
      });
      throw err;
    }

    const paystackRef = payoutResult?.data?.transfer_code || payoutResult?.reference || payoutReference;

    const transaction = await prisma.$transaction(async (tx) => {
      const updatedTransaction = await tx.transaction.update({
        where: { offerId },
        data: {
          ...split,
          creatorId: offer.creatorId,
          paystackRef,
          status: 'processing',
        },
      });

      await tx.payout.update({
        where: { transactionId: offer.transaction.id },
        data: { providerRef: paystackRef, status: 'PROCESSING', failureReason: null },
      });

      return updatedTransaction;
    });

    await recordAudit({ req, action: 'payment.payout', entityType: 'Transaction', entityId: transaction.id, metadata: { paystackRef } });
    res.json({ success: true, transaction: transactionResponse(transaction), split: addLegacyMoneyFields(split) });
  } catch (err) {
    next(err);
  }
};

const listBanks = async (req, res, next) => {
  try {
    const banks = await getBanks(req.validated?.query?.country || req.query.country || 'NG');
    res.json({ banks });
  } catch (err) {
    next(err);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const creator = await prisma.creator.findUnique({ where: { id: req.params.creatorId } });
    if (!creator) return res.status(404).json({ error: 'Creator not found' });
    if (req.user.role === 'CREATOR' && creator.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const transactions = await prisma.transaction.findMany({
      where: { creatorId: req.params.creatorId },
      include: {
        offer: {
          include: {
            brand: {
              select: { id: true, name: true, logo: true },
            },
          },
        },
        payout: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ transactions: transactions.map(transactionResponse) });
  } catch (err) {
    next(err);
  }
};

const processPaystackWebhook = async ({ webhookId, event }) => {
  await markWebhook(webhookId, 'PROCESSING');
  try {
    if (event.event === 'charge.success') {
      const reference = event?.data?.reference;
      if (reference) {
        const verification = await verifyTransaction(reference);
        const payment = { ...(event.data || {}), ...(verification?.data || {}) };
        const existingTransaction = await prisma.transaction.findFirst({ where: { paystackRef: reference } });
        const offerId = payment?.metadata?.offerId || event?.data?.metadata?.offerId || existingTransaction?.offerId;

        if (offerId) {
          await recordPaidTransaction({ offerId, paystackRef: reference, payment });
        }
      }
    }

    const transferCode = event?.data?.transfer_code || event?.data?.reference;

    if (transferCode && ['transfer.success', 'transfer.failed', 'transfer.reversed'].includes(event.event)) {
      if (event.event === 'transfer.success') {
        await prisma.$transaction(async (tx) => {
          const payoutRecord = await tx.payout.findFirst({
            where: { providerRef: transferCode },
            include: {
              transaction: {
                include: { offer: true },
              },
            },
          });

          if (!payoutRecord) return;

          await tx.transaction.update({
            where: { id: payoutRecord.transactionId },
            data: { status: 'completed' },
          });
          await tx.payout.update({
            where: { id: payoutRecord.id },
            data: { status: 'COMPLETED', failureReason: null },
          });
          await tx.offer.update({
            where: { id: payoutRecord.transaction.offerId },
            data: { status: 'COMPLETED' },
          });

          const existingCredit = await tx.ledgerEntry.findFirst({
            where: { transactionId: payoutRecord.transactionId, type: 'CREDIT' },
          });
          if (existingCredit) return;

          const creator = await tx.creator.update({
            where: { id: payoutRecord.creatorId },
            data: { balanceKobo: { increment: payoutRecord.amountKobo } },
          });

          await tx.ledgerEntry.create({
            data: {
              creatorId: payoutRecord.creatorId,
              transactionId: payoutRecord.transactionId,
              type: 'CREDIT',
              amountKobo: payoutRecord.amountKobo,
              balanceAfterKobo: creator.balanceKobo,
              description: `Payout for ${payoutRecord.transaction.offer.title}`,
              metadata: { paystackRef: transferCode, offerId: payoutRecord.transaction.offerId },
            },
          });
        });
      } else {
        const payoutStatus = event.event === 'transfer.reversed' ? 'REVERSED' : 'FAILED';
        await prisma.$transaction(async (tx) => {
          const payoutRecord = await tx.payout.findFirst({
            where: { providerRef: transferCode },
            include: { transaction: true },
          });
          if (!payoutRecord) return;
          await tx.transaction.update({ where: { id: payoutRecord.transactionId }, data: { status: 'paid' } });
          await tx.payout.update({
            where: { id: payoutRecord.id },
            data: { status: payoutStatus, failureReason: event?.data?.reason || event.event },
          });
          await tx.offer.update({
            where: { id: payoutRecord.transaction.offerId },
            data: { status: 'APPROVED' },
          });
        });
      }
    }

    await markWebhook(webhookId, 'PROCESSED');
    webhookEvents.labels('PAYSTACK', event.event || 'unknown', 'processed').inc();
  } catch (err) {
    await markWebhook(webhookId, 'FAILED', err.message);
    webhookEvents.labels('PAYSTACK', event.event || 'unknown', 'failed').inc();
    throw err;
  }
};

const paystackWebhook = async (req, res, next) => {
  try {
    const event = verifyWebhookSignature(req.body, req.headers['x-paystack-signature']);
    const eventId = webhookIdFor('PAYSTACK', event);
    const eventType = event.event || 'unknown';
    const stored = await storeWebhookEvent({ provider: 'PAYSTACK', eventId, eventType, payload: event });

    if (!stored) return res.json({ received: true, duplicate: true });

    await enqueueOrRun('payments', 'paystack-webhook', { webhookId: stored.id, event }, processPaystackWebhook, {
      jobId: `paystack:${eventId}`,
    });

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
  payout,
  listBanks,
  getTransactions,
  paystackWebhook,
  recordPaidTransaction,
  processPaystackWebhook,
};
