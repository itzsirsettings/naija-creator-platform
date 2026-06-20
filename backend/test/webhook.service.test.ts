import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/repositories/payment.repository', () => ({
  findTransactionByRef: vi.fn(),
  findPayoutByProviderRef: vi.fn(),
  recordPaidTransaction: vi.fn(),
  updatePayout: vi.fn(),
  debitCreatorBalance: vi.fn(),
  // True-escrow: a failed/reversed transfer restores the reserved balance.
  refundPayoutReservation: vi.fn(),
  markWebhook: vi.fn(),
}));
vi.mock('../src/repositories/offer.repository', () => ({
  updateOfferStatus: vi.fn(),
}));
vi.mock('../src/services/payment.service', () => ({
  paymentProvider: { verifyTransaction: vi.fn(), sendPayoutKobo: vi.fn(), createRefund: vi.fn() },
  paystack: {},
  flutterwave: {},
}));

import * as paymentRepo from '../src/repositories/payment.repository';
import * as offerRepo from '../src/repositories/offer.repository';
import { paymentProvider } from '../src/services/payment.service';
import { processPaystackWebhook } from '../src/services/payout.service';

const payRepo = vi.mocked(paymentRepo);
const offRepo = vi.mocked(offerRepo);
const provider = vi.mocked(paymentProvider);

beforeEach(() => vi.clearAllMocks());

describe('processPaystackWebhook — transfer.success', () => {
  it('completes the payout and marks the offer COMPLETED (balance already reserved)', async () => {
    payRepo.findPayoutByProviderRef.mockResolvedValue({
      id: 'payout_1',
      creatorId: 'creator_1',
      transactionId: 'tx_1',
      amountKobo: 90_000,
      transaction: { id: 'tx_1', offerId: 'offer_1', creatorId: 'creator_1', netKobo: 90_000 },
    } as never);

    await processPaystackWebhook({
      webhookId: 'wh_1',
      event: 'transfer.success',
      data: { transfer_code: 'TRF_abc' },
    });

    expect(payRepo.findPayoutByProviderRef).toHaveBeenCalledWith('TRF_abc');
    expect(payRepo.updatePayout).toHaveBeenCalledWith('payout_1', {
      status: 'COMPLETED',
      providerRef: 'TRF_abc',
    });
    // Balance was debited at reservation time, so success must NOT debit again.
    expect(payRepo.debitCreatorBalance).not.toHaveBeenCalled();
    expect(offRepo.updateOfferStatus).toHaveBeenCalledWith('offer_1', { status: 'COMPLETED' });
    expect(payRepo.markWebhook).toHaveBeenCalledWith('wh_1', 'PROCESSED');
  });
});

describe('processPaystackWebhook — charge.success', () => {
  it('is a no-op when the transaction is already paid (duplicate webhook)', async () => {
    payRepo.findTransactionByRef.mockResolvedValue({ id: 'tx_1', status: 'paid' } as never);

    await processPaystackWebhook({
      webhookId: 'wh_2',
      event: 'charge.success',
      data: { reference: 'charge_ref_1' },
    });

    expect(payRepo.recordPaidTransaction).not.toHaveBeenCalled();
    expect(payRepo.markWebhook).toHaveBeenCalledWith('wh_2', 'PROCESSED');
  });

  it('holds funds and marks the offer FUNDED on a verified first-time charge', async () => {
    payRepo.findTransactionByRef.mockResolvedValue({ id: 'tx_1', status: 'pending', offerId: 'offer_1' } as never);
    provider.verifyTransaction.mockResolvedValue({ status: true, data: { status: 'success' } } as never);

    await processPaystackWebhook({
      webhookId: 'wh_3',
      event: 'charge.success',
      data: { reference: 'charge_ref_1' },
    });

    expect(payRepo.recordPaidTransaction).toHaveBeenCalledWith({
      transaction: expect.objectContaining({ id: 'tx_1' }),
      paystackRef: 'charge_ref_1',
    });
    expect(offRepo.updateOfferStatus).toHaveBeenCalledWith('offer_1', { status: 'FUNDED' });
    expect(payRepo.markWebhook).toHaveBeenCalledWith('wh_3', 'PROCESSED');
  });
});

describe('processPaystackWebhook — transfer.failed', () => {
  it('marks the payout FAILED and restores the reserved balance', async () => {
    payRepo.findPayoutByProviderRef.mockResolvedValue({
      id: 'payout_1',
      creatorId: 'creator_1',
      transactionId: 'tx_1',
      amountKobo: 90_000,
      transaction: { offerId: 'offer_1' },
    } as never);

    await processPaystackWebhook({
      webhookId: 'wh_4',
      event: 'transfer.failed',
      data: { transfer_code: 'TRF_abc', gateway_response: 'Bank declined' },
    });

    expect(payRepo.updatePayout).toHaveBeenCalledWith('payout_1', {
      status: 'FAILED',
      failureReason: 'Bank declined',
    });
    // Failed transfer must credit the reserved amount back to the creator.
    expect(payRepo.refundPayoutReservation).toHaveBeenCalledWith(
      'creator_1',
      'tx_1',
      90_000,
      expect.any(String),
    );
    expect(payRepo.debitCreatorBalance).not.toHaveBeenCalled();
  });
});
