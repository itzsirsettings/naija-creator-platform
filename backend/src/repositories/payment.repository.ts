import type { PaymentProvider as PrismaPaymentProvider, Prisma, LedgerEntryType } from '@prisma/client';
import prisma from '../lib/prisma';
import { calculateSplitKobo } from '../utils/money';

/** Look up a single ledger entry of a given type for a transaction (HOLD/RELEASE/DEBIT/REFUND). */
export const findLedgerEntryByType = (transactionId: string, type: LedgerEntryType) =>
  prisma.ledgerEntry.findFirst({ where: { transactionId, type } });

export const findTransactionByOfferId = (offerId: string) =>
  prisma.transaction.findUnique({ where: { offerId } });

export const findTransactionById = (id: string) =>
  prisma.transaction.findUnique({ where: { id } });

export const createTransaction = (offerId: string, creatorId: string, amountKobo: number) => {
  const { grossKobo, feeKobo, netKobo } = calculateSplitKobo(amountKobo);
  return prisma.transaction.create({
    data: { offerId, creatorId, grossKobo, feeKobo, netKobo },
  });
};

export const updateTransactionRef = (id: string, paystackRef: string, status = 'pending') =>
  prisma.transaction.update({ where: { id }, data: { paystackRef, status } });

export const updateTransactionStatus = (id: string, status: string) =>
  prisma.transaction.update({ where: { id }, data: { status } });

export const findTransactionByRef = (paystackRef: string) =>
  prisma.transaction.findFirst({ where: { paystackRef } });

export const listCreatorTransactions = (creatorId: string) =>
  prisma.transaction.findMany({
    where: { creatorId },
    include: {
      offer: { select: { id: true, title: true, platform: true, brand: { select: { name: true } } } },
      payout: true,
    },
    orderBy: { createdAt: 'desc' },
  });

export const listAllTransactions = (limit = 50) =>
  prisma.transaction.findMany({
    include: {
      offer: { select: { id: true, title: true } },
      creator: { select: { id: true, name: true } },
      payout: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

export const storeWebhookEvent = async (
  provider: PrismaPaymentProvider,
  eventId: string,
  eventType: string,
  payload: Record<string, unknown>,
) => {
  try {
    return await prisma.providerWebhookEvent.create({
      data: { provider, eventId, eventType, payload: payload as Prisma.InputJsonValue, status: 'RECEIVED' },
    });
  } catch (err) {
    const prismaErr = err as { code?: string };
    if (prismaErr.code === 'P2002') return null; // duplicate — already processed
    throw err;
  }
};

export const markWebhook = (id: string, status: 'PROCESSED' | 'FAILED', error?: string) =>
  prisma.providerWebhookEvent.update({
    where: { id },
    data: { status, processedAt: new Date(), ...(error && { error }) },
  });

export interface RecordPaidParams {
  transaction: { id: string; creatorId: string; grossKobo: number; feeKobo: number; netKobo: number };
  paystackRef: string;
}

/**
 * Brand funded the offer → hold the net amount in escrow (heldKobo).
 * Funds are NOT withdrawable until the brand approves the deliverable
 * (see releaseCreatorFunds). No payout is created here — payout only
 * happens after APPROVED via requestPayout.
 * Idempotent against duplicate charge.success webhooks via @@unique([transactionId, HOLD]).
 */
export const recordPaidTransaction = async (params: RecordPaidParams) => {
  const { transaction, paystackRef } = params;
  const { id: transactionId, creatorId, netKobo } = transaction;

  try {
    return await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: 'paid', paystackRef },
      });

      const creator = await tx.creator.update({
        where: { id: creatorId },
        data: { heldKobo: { increment: netKobo } },
      });

      await tx.ledgerEntry.create({
        data: {
          creatorId,
          transactionId,
          type: 'HOLD',
          amountKobo: netKobo,
          balanceAfterKobo: creator.balanceKobo,
          description: 'Escrow hold — brand funded offer',
          metadata: { heldAfterKobo: creator.heldKobo },
        },
      });

      return creator;
    });
  } catch (err) {
    // HOLD already recorded by a concurrent verify/webhook — idempotent no-op.
    // The $transaction rolled back, so heldKobo was not double-incremented.
    if ((err as { code?: string }).code === 'P2002') {
      return prisma.creator.findUnique({ where: { id: creatorId } });
    }
    throw err;
  }
};

export const findPayoutByTransactionId = (transactionId: string) =>
  prisma.payout.findUnique({ where: { transactionId } });

export const findPayoutByProviderRef = (providerRef: string) =>
  prisma.payout.findFirst({
    where: { providerRef },
    include: {
      transaction: { select: { id: true, offerId: true, creatorId: true, netKobo: true } },
    },
  });

/**
 * Create the payout row. The Payout.transactionId @unique constraint is the
 * double-payout backstop: a concurrent second request throws P2002.
 */
export const createPayoutForTransaction = (
  transactionId: string,
  creatorId: string,
  amountKobo: number,
  provider: PrismaPaymentProvider = 'PAYSTACK',
) =>
  prisma.payout.create({
    data: { transactionId, creatorId, amountKobo, provider, status: 'PENDING' },
  });

export interface UpdatePayoutParams {
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  providerRef?: string;
  failureReason?: string;
}

export const updatePayout = (id: string, params: UpdatePayoutParams) =>
  prisma.payout.update({ where: { id }, data: params });

/**
 * Atomically claim a payout for processing. Only transitions from a non-terminal,
 * non-in-flight state (PENDING/FAILED/REVERSED → PROCESSING). Returns true only if
 * THIS caller won the claim — the guard that guarantees at most one provider
 * transfer per payout under concurrent requests.
 */
export const claimPayoutForProcessing = async (payoutId: string): Promise<boolean> => {
  const res = await prisma.payout.updateMany({
    where: { id: payoutId, status: { in: ['PENDING', 'FAILED', 'REVERSED'] } },
    data: { status: 'PROCESSING' },
  });
  return res.count === 1;
};

/**
 * Brand approved the deliverable → move funds from escrow hold to withdrawable.
 * heldKobo -= net, balanceKobo += net, immutable RELEASE ledger entry.
 * Idempotent: a second RELEASE for the same transaction throws P2002 and the
 * whole $transaction rolls back, so balances never double-apply.
 */
export const releaseCreatorFunds = async (
  creatorId: string,
  transactionId: string,
  amountKobo: number,
  description: string,
) => {
  return prisma.$transaction(async (tx) => {
    const creator = await tx.creator.update({
      where: { id: creatorId },
      data: {
        heldKobo: { decrement: amountKobo },
        balanceKobo: { increment: amountKobo },
      },
    });
    await tx.ledgerEntry.create({
      data: {
        creatorId,
        transactionId,
        type: 'RELEASE',
        amountKobo,
        balanceAfterKobo: creator.balanceKobo,
        description,
        metadata: { heldAfterKobo: creator.heldKobo },
      },
    });
    return creator;
  });
};

/**
 * Dispute refunded → reverse the escrow hold back out (gross is refunded to the
 * brand via the provider separately). heldKobo -= net, withdrawable untouched,
 * immutable REFUND ledger entry. Idempotent via @@unique([transactionId, REFUND]).
 */
export const refundCreatorHold = async (
  creatorId: string,
  transactionId: string,
  amountKobo: number,
  description: string,
) => {
  return prisma.$transaction(async (tx) => {
    const creator = await tx.creator.update({
      where: { id: creatorId },
      data: { heldKobo: { decrement: amountKobo } },
    });
    await tx.ledgerEntry.create({
      data: {
        creatorId,
        transactionId,
        type: 'REFUND',
        amountKobo,
        balanceAfterKobo: creator.balanceKobo,
        description,
        metadata: { heldAfterKobo: creator.heldKobo },
      },
    });
    return creator;
  });
};

export const debitCreatorBalance = async (
  creatorId: string,
  transactionId: string | null,
  amountKobo: number,
  description: string,
) => {
  return prisma.$transaction(async (tx) => {
    const creator = await tx.creator.update({
      where: { id: creatorId },
      data: { balanceKobo: { decrement: amountKobo } },
    });
    await tx.ledgerEntry.create({
      data: {
        creatorId,
        transactionId,
        type: 'DEBIT',
        amountKobo,
        balanceAfterKobo: creator.balanceKobo,
        description,
      },
    });
    return creator;
  });
};

/**
 * Atomically reserve (debit) balance at payout initiation time.
 * Prevents overdraft from concurrent payout requests across different offers.
 * Idempotent via @@unique([transactionId, DEBIT]).
 */
export const reserveBalanceForPayout = async (
  creatorId: string,
  transactionId: string,
  amountKobo: number,
): Promise<boolean> => {
  try {
    await prisma.$transaction(async (tx) => {
      const creator = await tx.creator.findUniqueOrThrow({ where: { id: creatorId } });
      if (creator.balanceKobo < amountKobo) {
        throw new Error('INSUFFICIENT_BALANCE');
      }
      const updated = await tx.creator.update({
        where: { id: creatorId },
        data: { balanceKobo: { decrement: amountKobo } },
      });
      await tx.ledgerEntry.create({
        data: {
          creatorId,
          transactionId,
          type: 'DEBIT',
          amountKobo,
          balanceAfterKobo: updated.balanceKobo,
          description: 'Payout reserved — pending bank transfer',
        },
      });
    });
    return true;
  } catch (err) {
    if ((err as Error).message === 'INSUFFICIENT_BALANCE') return false;
    if ((err as { code?: string }).code === 'P2002') return true;
    throw err;
  }
};

/**
 * Reverse a payout reservation when the transfer fails or is reversed.
 * Credits the balance back. Idempotent via @@unique([transactionId, ADJUSTMENT]).
 */
export const refundPayoutReservation = async (
  creatorId: string,
  transactionId: string,
  amountKobo: number,
  description: string,
): Promise<void> => {
  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.creator.update({
        where: { id: creatorId },
        data: { balanceKobo: { increment: amountKobo } },
      });
      await tx.ledgerEntry.create({
        data: {
          creatorId,
          transactionId,
          type: 'ADJUSTMENT',
          amountKobo,
          balanceAfterKobo: updated.balanceKobo,
          description,
        },
      });
    });
  } catch (err) {
    if ((err as { code?: string }).code === 'P2002') return;
    throw err;
  }
};

/**
 * Compute balance from ledger entries (source of truth) for reconciliation.
 */
export const computeLedgerBalance = async (creatorId: string) => {
  const entries = await prisma.ledgerEntry.groupBy({
    by: ['type'],
    where: { creatorId },
    _sum: { amountKobo: true },
  });

  const sums: Record<string, number> = {};
  for (const entry of entries) {
    sums[entry.type] = entry._sum.amountKobo ?? 0;
  }

  const release = sums['RELEASE'] ?? 0;
  const credit = sums['CREDIT'] ?? 0;
  const adjustment = sums['ADJUSTMENT'] ?? 0;
  const debit = sums['DEBIT'] ?? 0;
  const hold = sums['HOLD'] ?? 0;
  const refund = sums['REFUND'] ?? 0;

  return {
    computedBalanceKobo: release + credit + adjustment - debit,
    computedHeldKobo: hold - release - refund,
    breakdown: sums,
  };
};

export const listWebhookEvents = (limit = 50) =>
  prisma.providerWebhookEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

// Lean projection for the admin monitor — excludes the (potentially large) payload.
export const listRecentWebhookEvents = (limit = 50) =>
  prisma.providerWebhookEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      provider: true,
      eventType: true,
      status: true,
      error: true,
      createdAt: true,
      processedAt: true,
    },
  });

export const countWebhookEventsByStatus = () =>
  prisma.providerWebhookEvent.groupBy({ by: ['status'], _count: { _all: true } });