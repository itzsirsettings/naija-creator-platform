import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/repositories/payment.repository', () => ({
  findTransactionByOfferId: vi.fn(),
  findPayoutByTransactionId: vi.fn(),
  createPayoutForTransaction: vi.fn(),
  claimPayoutForProcessing: vi.fn(),
  updatePayout: vi.fn(),
}));
vi.mock('../src/repositories/offer.repository', () => ({
  findOfferById: vi.fn(),
  updateOfferStatus: vi.fn(),
}));
vi.mock('../src/repositories/creator.repository', () => ({
  findCreatorById: vi.fn(),
}));
vi.mock('../src/services/payment.service', () => ({
  paymentProvider: { sendPayoutKobo: vi.fn(), verifyTransaction: vi.fn(), createRefund: vi.fn() },
  paystack: {},
  flutterwave: {},
}));

import * as paymentRepo from '../src/repositories/payment.repository';
import * as offerRepo from '../src/repositories/offer.repository';
import * as creatorRepo from '../src/repositories/creator.repository';
import { paymentProvider } from '../src/services/payment.service';
import { requestPayout } from '../src/services/payout.service';

const payRepo = vi.mocked(paymentRepo);
const offRepo = vi.mocked(offerRepo);
const crRepo = vi.mocked(creatorRepo);
const provider = vi.mocked(paymentProvider);

const offer = (status: string) => ({
  id: 'offer_1',
  title: 'Brand Deal',
  status,
  creatorId: 'creator_1',
  brand: { userId: 'brand_user' },
  creator: { userId: 'creator_user' },
});

beforeEach(() => vi.clearAllMocks());

describe('requestPayout — escrow guard', () => {
  it('rejects payout before the brand approves (offer not APPROVED)', async () => {
    offRepo.findOfferById.mockResolvedValue(offer('FUNDED') as never);
    await expect(requestPayout('offer_1', 'brand_user', 'BRAND')).rejects.toMatchObject({
      code: 'PAYOUT_NOT_APPROVED',
    });
    expect(provider.sendPayoutKobo).not.toHaveBeenCalled();
  });

  it('rejects a second payout on an already-COMPLETED offer', async () => {
    offRepo.findOfferById.mockResolvedValue(offer('COMPLETED') as never);
    await expect(requestPayout('offer_1', 'brand_user', 'BRAND')).rejects.toThrow(/already been paid out/i);
  });

  it('forbids an unrelated user', async () => {
    offRepo.findOfferById.mockResolvedValue(offer('APPROVED') as never);
    await expect(requestPayout('offer_1', 'stranger', 'CREATOR')).rejects.toThrow();
    expect(provider.sendPayoutKobo).not.toHaveBeenCalled();
  });

  it('rejects when withdrawable balance is insufficient', async () => {
    offRepo.findOfferById.mockResolvedValue(offer('APPROVED') as never);
    payRepo.findTransactionByOfferId.mockResolvedValue({ id: 'tx_1', netKobo: 90_000 } as never);
    crRepo.findCreatorById.mockResolvedValue({ id: 'creator_1', balanceKobo: 0, paystackCode: 'RCP_1' } as never);
    await expect(requestPayout('offer_1', 'creator_user', 'CREATOR')).rejects.toMatchObject({
      code: 'INSUFFICIENT_BALANCE',
    });
  });
});

describe('requestPayout — happy path + concurrency', () => {
  beforeEach(() => {
    offRepo.findOfferById.mockResolvedValue(offer('APPROVED') as never);
    payRepo.findTransactionByOfferId.mockResolvedValue({ id: 'tx_1', netKobo: 90_000 } as never);
    crRepo.findCreatorById.mockResolvedValue({ id: 'creator_1', balanceKobo: 90_000, paystackCode: 'RCP_1' } as never);
  });

  it('admin can trigger payout; stores the provider transfer_code as providerRef', async () => {
    payRepo.findPayoutByTransactionId.mockResolvedValue(null as never);
    payRepo.createPayoutForTransaction.mockResolvedValue({ id: 'payout_1', status: 'PENDING' } as never);
    payRepo.claimPayoutForProcessing.mockResolvedValue(true);
    provider.sendPayoutKobo.mockResolvedValue({
      status: true,
      reference: 'transfer_ref_1',
      data: { transfer_code: 'TRF_abc' },
    } as never);

    const result = await requestPayout('offer_1', 'admin_user', 'ADMIN');

    expect(provider.sendPayoutKobo).toHaveBeenCalledWith('RCP_1', 90_000, expect.any(String), expect.any(String));
    expect(payRepo.updatePayout).toHaveBeenCalledWith('payout_1', {
      status: 'PROCESSING',
      providerRef: 'TRF_abc',
    });
    expect(result).toMatchObject({ success: true, reference: 'TRF_abc' });
  });

  it('rejects when a payout is already in progress (PROCESSING)', async () => {
    payRepo.findPayoutByTransactionId.mockResolvedValue({ id: 'payout_1', status: 'PROCESSING' } as never);
    await expect(requestPayout('offer_1', 'creator_user', 'CREATOR')).rejects.toThrow(/in progress/i);
    expect(provider.sendPayoutKobo).not.toHaveBeenCalled();
  });

  it('loses the claim race gracefully (claim returns false → conflict, no transfer)', async () => {
    payRepo.findPayoutByTransactionId.mockResolvedValue(null as never);
    payRepo.createPayoutForTransaction.mockResolvedValue({ id: 'payout_1', status: 'PENDING' } as never);
    payRepo.claimPayoutForProcessing.mockResolvedValue(false);
    await expect(requestPayout('offer_1', 'creator_user', 'CREATOR')).rejects.toThrow(/in progress/i);
    expect(provider.sendPayoutKobo).not.toHaveBeenCalled();
  });

  it('marks the payout FAILED if the provider transfer throws', async () => {
    payRepo.findPayoutByTransactionId.mockResolvedValue(null as never);
    payRepo.createPayoutForTransaction.mockResolvedValue({ id: 'payout_1', status: 'PENDING' } as never);
    payRepo.claimPayoutForProcessing.mockResolvedValue(true);
    provider.sendPayoutKobo.mockRejectedValue(new Error('Paystack down'));

    await expect(requestPayout('offer_1', 'admin_user', 'ADMIN')).rejects.toThrow('Paystack down');
    expect(payRepo.updatePayout).toHaveBeenCalledWith('payout_1', {
      status: 'FAILED',
      failureReason: 'Paystack down',
    });
  });
});
