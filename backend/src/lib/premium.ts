import type { PremiumTier } from '@prisma/client';

export type PaidTier = 'STANDARD' | 'POPULAR' | 'PREMIUM';

export interface TierInfo {
  tier: PaidTier;
  name: string;
  priceKobo: number;
  priceNaira: number;
  canApplyToBrands: boolean;
  canApplyToCampaigns: boolean;
  perks: string[];
}

// Monthly tiers. Prices in kobo (naira * 100).
export const PREMIUM_TIERS: Record<PaidTier, TierInfo> = {
  STANDARD: {
    tier: 'STANDARD',
    name: 'Standard',
    priceKobo: 1_000_000,
    priceNaira: 10_000,
    canApplyToBrands: true,
    canApplyToCampaigns: false,
    perks: ['Apply to brands directly', 'Express interest to work with any brand'],
  },
  POPULAR: {
    tier: 'POPULAR',
    name: 'Popular',
    priceKobo: 2_250_000,
    priceNaira: 22_500,
    canApplyToBrands: true,
    canApplyToCampaigns: true,
    perks: ['Everything in Standard', 'Apply to posted brand campaigns'],
  },
  PREMIUM: {
    tier: 'PREMIUM',
    name: 'Premium',
    priceKobo: 5_000_000,
    priceNaira: 50_000,
    canApplyToBrands: true,
    canApplyToCampaigns: true,
    perks: ['Everything in Popular', 'Priority placement to brands', 'Apply to posted brand campaigns'],
  },
};

export const isPremiumActive = (tier: PremiumTier, until: Date | null | undefined): boolean =>
  tier !== 'NONE' && !!until && until.getTime() > Date.now();

// Any active paid tier can apply to brands.
export const canApplyToBrands = (tier: PremiumTier, until: Date | null | undefined): boolean =>
  isPremiumActive(tier, until);

// Only Popular and Premium can apply to posted campaigns.
export const canApplyToCampaigns = (tier: PremiumTier, until: Date | null | undefined): boolean =>
  isPremiumActive(tier, until) && (tier === 'POPULAR' || tier === 'PREMIUM');
