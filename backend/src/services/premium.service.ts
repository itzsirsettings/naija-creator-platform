import type { PremiumTier } from '@prisma/client';
import * as creatorRepo from '../repositories/creator.repository';
import { PREMIUM_TIERS, isPremiumActive, getEntitlements, type PaidTier } from '../lib/premium';
import { AppError } from '../errors/AppError';

export const getStatus = async (userId: string) => {
  const creator = await creatorRepo.findCreatorByUserId(userId);
  if (!creator) throw AppError.forbidden('Only creators have a premium status');
  return {
    tier: creator.premiumTier,
    until: creator.premiumUntil,
    active: isPremiumActive(creator.premiumTier, creator.premiumUntil),
    entitlements: getEntitlements(creator.premiumTier, creator.premiumUntil),
    tiers: Object.values(PREMIUM_TIERS),
  };
};

// Grants 30-day access immediately. Paystack subscription replaces this flow once wired.
export const requestUpgrade = async (userId: string, tier: PaidTier) => {
  const creator = await creatorRepo.findCreatorByUserId(userId);
  if (!creator) throw AppError.forbidden('Only creators can upgrade');
  const until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await creatorRepo.updateCreatorPremium(creator.id, tier, until);
  const info = PREMIUM_TIERS[tier];
  return {
    status: 'activated',
    message: `Welcome to ${info.name}! Your plan is now active for 30 days.`,
    tier: info.tier,
    priceKobo: info.priceKobo,
    priceNaira: info.priceNaira,
    until: until.toISOString(),
  };
};

// Admin grants/sets a creator's premium tier (operates the feature until
// the Paystack subscription is wired).
export const grantPremium = async (creatorId: string, tier: PremiumTier, days: number) => {
  const creator = await creatorRepo.findCreatorById(creatorId);
  if (!creator) throw AppError.notFound('Creator not found');
  const until =
    tier === 'NONE' || days <= 0 ? null : new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return creatorRepo.updateCreatorPremium(creatorId, tier, until);
};
