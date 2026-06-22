import crypto from 'crypto';
import type { PremiumTier } from '@prisma/client';
import * as creatorRepo from '../repositories/creator.repository';
import * as brandRepo from '../repositories/brand.repository';
import {
  PREMIUM_TIERS, BRAND_PREMIUM_TIERS, isPremiumActive, getEntitlements,
  getBrandEntitlements, type PaidTier,
} from '../lib/premium';
import { paymentProvider } from './payment.service';
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

// ─── Brand subscriptions ─────────────────────────────────────────────────────
export const getBrandStatus = async (userId: string) => {
  const brand = await brandRepo.findBrandByUserId(userId);
  if (!brand) throw AppError.forbidden('Only brands have a brand subscription');
  return {
    tier: brand.premiumTier,
    until: brand.premiumUntil,
    active: isPremiumActive(brand.premiumTier, brand.premiumUntil),
    entitlements: getBrandEntitlements(brand.premiumTier, brand.premiumUntil),
    tiers: Object.values(BRAND_PREMIUM_TIERS),
  };
};

// Grants 30-day brand access immediately. Paystack subscription replaces this once wired.
export const requestBrandUpgrade = async (userId: string, tier: PaidTier) => {
  const brand = await brandRepo.findBrandByUserId(userId);
  if (!brand) throw AppError.forbidden('Only brands can upgrade');
  const until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await brandRepo.updateBrandPremium(brand.id, tier, until);
  const info = BRAND_PREMIUM_TIERS[tier];
  return {
    status: 'activated',
    message: `Welcome to ${info.name}! Your plan is now active for 30 days.`,
    tier: info.tier,
    priceKobo: info.priceKobo,
    priceNaira: info.priceNaira,
    until: until.toISOString(),
  };
};

// ─── Paystack subscription checkout ──────────────────────────────────────────
const ANNUAL_DISCOUNT = 0.15;

export const initiateSubscriptionPayment = async (
  userId: string,
  email: string,
  role: 'CREATOR' | 'BRAND',
  tier: PaidTier,
  billingPeriod: 'monthly' | 'annual',
  successUrl?: string,
) => {
  const tierInfo = role === 'BRAND' ? BRAND_PREMIUM_TIERS[tier] : PREMIUM_TIERS[tier];
  const monthlyKobo = tierInfo.priceKobo;
  const amountKobo = billingPeriod === 'annual'
    ? Math.round(monthlyKobo * 12 * (1 - ANNUAL_DISCOUNT))
    : monthlyKobo;

  const reference = `sub_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const result = await paymentProvider.initializeTransaction({
    email,
    amountKobo,
    reference,
    callbackUrl: successUrl,
    metadata: { type: 'subscription', userId, role, tier, billingPeriod },
  });

  return { authorizationUrl: result.authorizationUrl, reference, amountKobo, tier };
};

export const verifySubscriptionPayment = async (
  userId: string,
  role: 'CREATOR' | 'BRAND',
  reference: string,
  tier: PaidTier,
  billingPeriod: 'monthly' | 'annual',
) => {
  const result = await paymentProvider.verifyTransaction(reference);
  if (!result.data || result.data.status !== 'success') {
    throw AppError.badRequest('Payment not confirmed by Paystack');
  }

  const daysToAdd = billingPeriod === 'annual' ? 365 : 30;
  const until = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

  if (role === 'BRAND') {
    const brand = await brandRepo.findBrandByUserId(userId);
    if (!brand) throw AppError.forbidden('Brand not found');
    await brandRepo.updateBrandPremium(brand.id, tier, until);
    const info = BRAND_PREMIUM_TIERS[tier];
    return {
      status: 'activated',
      message: `Welcome to ${info.name}! Your plan is active.`,
      tier,
      until: until.toISOString(),
    };
  } else {
    const creator = await creatorRepo.findCreatorByUserId(userId);
    if (!creator) throw AppError.forbidden('Creator not found');
    await creatorRepo.updateCreatorPremium(creator.id, tier, until);
    const info = PREMIUM_TIERS[tier];
    return {
      status: 'activated',
      message: `Welcome to ${info.name}! Your plan is active.`,
      tier,
      until: until.toISOString(),
    };
  }
};
