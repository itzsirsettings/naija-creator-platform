import * as creatorRepo from '../repositories/creator.repository';
import * as cache from '../lib/cache';
import { addMoneyFields } from '../utils/money';
import { paymentProvider } from './payment.service';
import { getEntitlements } from '../lib/premium';
import { AppError } from '../errors/AppError';

export const listCreators = async (params: creatorRepo.ListCreatorsParams) => {
  const cacheKey = `creators:list:${JSON.stringify(params)}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const result = await creatorRepo.listCreators(params);
  await cache.set(cacheKey, result, 45);
  return result;
};

export const getCreatorById = async (id: string) => {
  const creator = await creatorRepo.findCreatorById(id);
  if (!creator) throw AppError.notFound('Creator not found');

  const { paystackCode, ...publicProfile } = creator;
  void paystackCode; // strip from response

  return {
    ...addMoneyFields(publicProfile as Record<string, unknown>),
    offersReceived: (publicProfile.offersReceived ?? []).map(addMoneyFields),
  };
};

export const updateCreator = async (
  id: string,
  userId: string,
  data: creatorRepo.UpdateCreatorParams,
) => {
  const creator = await creatorRepo.findCreatorById(id);
  if (!creator) throw AppError.notFound('Creator not found');
  if (creator.userId !== userId) throw AppError.forbidden('Not authorized');

  // Usage-rights policy is a Premium control — strip it for lower tiers.
  if (data.usageRightsPolicy !== undefined) {
    const ent = getEntitlements(creator.premiumTier, creator.premiumUntil);
    if (!ent.usageRightsControl) {
      throw new AppError(
        'Setting a usage-rights policy requires a Premium subscription',
        402,
        'PREMIUM_REQUIRED',
      );
    }
  }

  const normalizedHandle = data.handle
    ? data.handle.startsWith('@')
      ? data.handle.slice(1)
      : data.handle
    : undefined;

  const updated = await creatorRepo.updateCreator(id, {
    ...data,
    ...(normalizedHandle && { handle: normalizedHandle }),
  });
  return addMoneyFields(updated as unknown as Record<string, unknown>);
};

export const addBankAccount = async (
  id: string,
  userId: string,
  accountNumber: string,
  bankCode: string,
  bankName?: string,
) => {
  const creator = await creatorRepo.findCreatorById(id);
  if (!creator) throw AppError.notFound('Creator not found');
  if (creator.userId !== userId) throw AppError.forbidden('Not authorized');

  const verification = await paymentProvider.verifyBankAccount(accountNumber, bankCode);
  if (!verification.status) {
    throw AppError.badRequest('Could not verify bank account');
  }

  const recipientCode = await paymentProvider.createTransferRecipient(
    verification.data.account_name,
    accountNumber,
    bankCode,
  );

  const updated = await creatorRepo.setBankDetails(id, {
    paystackCode: recipientCode,
    bankAccountName: verification.data.account_name,
    bankAccountLast4: accountNumber.slice(-4),
    bankBankCode: bankCode,
    bankBankName:
      bankName ??
      (verification.data.bank_name as string | undefined) ??
      (verification.data.bank?.name as string | undefined) ??
      null,
    bankVerifiedAt: new Date(),
  });

  return {
    message: 'Bank account added successfully',
    accountName: verification.data.account_name,
    bankLast4: updated.bankAccountLast4,
    bankName: updated.bankBankName,
    bankVerifiedAt: updated.bankVerifiedAt,
  };
};

export const getBalance = async (id: string, userId: string) => {
  const creator = await creatorRepo.findCreatorById(id);
  if (!creator) throw AppError.notFound('Creator not found');
  if (creator.userId !== userId) throw AppError.forbidden('Not authorized');
  return {
    // Withdrawable funds (released after the brand approves).
    balanceKobo: creator.balanceKobo,
    balance: creator.balanceKobo / 100,
    // Funds in escrow — brand has paid but not yet approved the deliverable.
    heldKobo: creator.heldKobo,
    held: creator.heldKobo / 100,
  };
};