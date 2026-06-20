import { describe, it, expect, vi, beforeEach } from 'vitest';

// Factory mocks fully replace the real modules, so neither Prisma nor Paystack
// is ever instantiated. We assert the escrow ORCHESTRATION rules.
vi.mock('../src/repositories/payment.repository', () => ({
  findTransactionByOfferId: vi.fn(),
  findLedgerEntryByType: vi.fn(),
  releaseCreatorFunds: vi.fn(),
  refundCreatorHold: vi.fn(),
  updateTransactionStatus: vi.fn(),
}));

vi.mock('../src/services/payment.service', () => ({
  paymentProvider: { createRefund: vi.fn() },
  paystack: {},
  flutterwave: {},
}));

import * as paymentRepo from '../src/repositories/payment.repository';
import { paymentProvider } from '../src/services/payment.service';
import * as escrow from '../src/services/escrow.service';

const repo = vi.mocked(paymentRepo);
const provider = vi.mocked(paymentProvider);

const fundedTx = {
  id: 'tx_1',
  creatorId: 'creator_1',
  grossKobo: 100_000,
  netKobo: 90_000,
  status: 'paid',
  paystackRef: 'charge_ref_1',
};

beforeEach(() => vi.clearAllMocks());

describe('escrow.releaseFunds', () => {
  it('releases held funds to the withdrawable balance for a funded offer', async () => {
    repo.findTransactionByOfferId.mockResolvedValue(fundedTx as never);
    repo.releaseCreatorFunds.mockResolvedValue({ id: 'creator_1', balanceKobo: 90_000, heldKobo: 0 } as never);

    await escrow.releaseFunds('offer_1');

    expect(repo.releaseCreatorFunds).toHaveBeenCalledWith('creator_1', 'tx_1', 90_000, expect.any(String));
  });

  it('is idempotent: a duplicate RELEASE (P2002) is a no-op, not an error', async () => {
    repo.findTransactionByOfferId.mockResolvedValue(fundedTx as never);
    repo.releaseCreatorFunds.mockRejectedValue({ code: 'P2002' });

    await expect(escrow.releaseFunds('offer_1')).resolves.toBeNull();
  });

  it('refuses to release when the offer is not funded', async () => {
    repo.findTransactionByOfferId.mockResolvedValue({ ...fundedTx, status: 'pending' } as never);

    await expect(escrow.releaseFunds('offer_1')).rejects.toMatchObject({ code: 'ESCROW_NOT_FUNDED' });
    expect(repo.releaseCreatorFunds).not.toHaveBeenCalled();
  });

  it('throws when there is no transaction for the offer', async () => {
    repo.findTransactionByOfferId.mockResolvedValue(null as never);
    await expect(escrow.releaseFunds('offer_1')).rejects.toThrow();
  });
});

describe('escrow.refundFunds', () => {
  it('reverses the hold and refunds the brand the GROSS amount, then marks refunded', async () => {
    repo.findTransactionByOfferId.mockResolvedValue(fundedTx as never);
    repo.findLedgerEntryByType.mockResolvedValue(null as never);
    repo.refundCreatorHold.mockResolvedValue({} as never);
    provider.createRefund.mockResolvedValue({ status: true, data: {} } as never);
    repo.updateTransactionStatus.mockResolvedValue({} as never);

    await escrow.refundFunds('offer_1', 'admin_1');

    expect(repo.refundCreatorHold).toHaveBeenCalledWith('creator_1', 'tx_1', 90_000, expect.any(String));
    expect(provider.createRefund).toHaveBeenCalledWith('charge_ref_1', 100_000); // gross, not net
    expect(repo.updateTransactionStatus).toHaveBeenCalledWith('tx_1', 'refunded');
  });

  it('does not double-refund an already-refunded transaction', async () => {
    repo.findTransactionByOfferId.mockResolvedValue({ ...fundedTx, status: 'refunded' } as never);

    const result = await escrow.refundFunds('offer_1', 'admin_1');

    expect(result).toEqual({ alreadyRefunded: true, transactionId: 'tx_1' });
    expect(provider.createRefund).not.toHaveBeenCalled();
    expect(repo.refundCreatorHold).not.toHaveBeenCalled();
  });

  it('refuses to refund without a payment reference', async () => {
    repo.findTransactionByOfferId.mockResolvedValue({ ...fundedTx, paystackRef: null } as never);
    await expect(escrow.refundFunds('offer_1', 'admin_1')).rejects.toThrow();
    expect(provider.createRefund).not.toHaveBeenCalled();
  });

  it('refuses to refund once funds were already RELEASED to the creator', async () => {
    repo.findTransactionByOfferId.mockResolvedValue(fundedTx as never);
    repo.findLedgerEntryByType.mockResolvedValue({ id: 'ledger_release_1', type: 'RELEASE' } as never);

    await expect(escrow.refundFunds('offer_1', 'admin_1')).rejects.toMatchObject({
      code: 'ALREADY_RELEASED',
    });
    expect(provider.createRefund).not.toHaveBeenCalled();
    expect(repo.refundCreatorHold).not.toHaveBeenCalled();
  });
});
