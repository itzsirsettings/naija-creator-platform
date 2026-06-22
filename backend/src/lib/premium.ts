import type { PremiumTier } from '@prisma/client';

export type PaidTier = 'STANDARD' | 'POPULAR' | 'PREMIUM';

// Tier ranking — used to decide "everything in the tier below" inheritance.
export const TIER_RANK: Record<PaidTier, number> = { STANDARD: 1, POPULAR: 2, PREMIUM: 3 };

const rankOf = (tier: PremiumTier): number =>
  tier === 'NONE' ? 0 : TIER_RANK[tier as PaidTier];

// ─── Feature catalogue (single source of truth) ──────────────────────────────
// Labels are the exact strings shown on the marketing pricing cards so the cards,
// the comparison table, the in-app Premium page and backend enforcement can never
// drift apart. `minTier` is the lowest paid tier that unlocks the feature.
//
// status:
//   'live'        — enforced in the product today
//   'rolling-out' — entitlement is granted the moment the plan is active; the
//                   deeper experience is being shipped incrementally
export type FeatureStatus = 'live' | 'rolling-out';

export interface FeatureDef {
  key: string;
  label: string;
  minTier: PaidTier;
  status: FeatureStatus;
}

export const FEATURES: FeatureDef[] = [
  // ── Standard ──
  { key: 'verifiedProfile', label: 'Verified Profile', minTier: 'STANDARD', status: 'live' },
  { key: 'creatorPortfolio', label: 'Basic Creator Portfolio', minTier: 'STANDARD', status: 'live' },
  { key: 'activeListings', label: '10 Active Listings', minTier: 'STANDARD', status: 'rolling-out' },
  { key: 'directMessaging', label: 'Direct Messaging', minTier: 'STANDARD', status: 'rolling-out' },
  { key: 'escrowProtection', label: 'Escrow Protection', minTier: 'STANDARD', status: 'live' },
  { key: 'standardSupport', label: 'Standard Support', minTier: 'STANDARD', status: 'live' },
  { key: 'offerManagement', label: 'Offer Management', minTier: 'STANDARD', status: 'live' },
  { key: 'analytics', label: 'Analytics Dashboard', minTier: 'STANDARD', status: 'live' },

  // ── Popular ──
  { key: 'unlimitedListings', label: 'Unlimited Listings', minTier: 'POPULAR', status: 'rolling-out' },
  { key: 'prioritySearchRanking', label: 'Priority Search Ranking', minTier: 'POPULAR', status: 'live' },
  { key: 'advancedAnalytics', label: 'Advanced Analytics', minTier: 'POPULAR', status: 'rolling-out' },
  { key: 'proposalTemplates', label: 'Proposal Templates', minTier: 'POPULAR', status: 'rolling-out' },
  { key: 'teamCollaboration', label: 'Team Collaboration', minTier: 'POPULAR', status: 'rolling-out' },
  { key: 'priorityEscrow', label: 'Priority Escrow Processing', minTier: 'POPULAR', status: 'rolling-out' },
  { key: 'performanceReports', label: 'Creator Performance Reports', minTier: 'POPULAR', status: 'rolling-out' },
  { key: 'featuredPlacement', label: 'Featured Profile Placement', minTier: 'POPULAR', status: 'live' },
  { key: 'fasterPayouts', label: 'Faster Payout Requests', minTier: 'POPULAR', status: 'rolling-out' },
  { key: 'prioritySupport', label: 'Priority Support', minTier: 'POPULAR', status: 'live' },
  // Applying to posted campaigns is unlocked at Popular (enforced today).
  { key: 'applyToCampaigns', label: 'Apply to Posted Campaigns', minTier: 'POPULAR', status: 'live' },
  { key: 'smartMatching', label: 'Smart Campaign Matching', minTier: 'POPULAR', status: 'live' },
  { key: 'affiliateDeals', label: 'Affiliate & Commission Deals', minTier: 'POPULAR', status: 'live' },

  // ── Premium ──
  { key: 'unlimitedTeam', label: 'Unlimited Team Members', minTier: 'PREMIUM', status: 'live' },
  { key: 'teamManagement', label: 'Team Member Management', minTier: 'PREMIUM', status: 'live' },
  { key: 'salesAttribution', label: 'Sales Attribution Analytics', minTier: 'PREMIUM', status: 'live' },
  { key: 'usageRightsControl', label: 'Content Usage Rights Controls', minTier: 'PREMIUM', status: 'live' },
  { key: 'proposalTemplateManager', label: 'Proposal Template Manager', minTier: 'PREMIUM', status: 'live' },
  { key: 'dedicatedManager', label: 'Dedicated Account Manager — weekly strategy call', minTier: 'PREMIUM', status: 'rolling-out' },
  { key: 'aiInsights', label: 'AI Campaign Insights', minTier: 'PREMIUM', status: 'rolling-out' },
  { key: 'advancedEscrowControls', label: 'Advanced Escrow Controls', minTier: 'PREMIUM', status: 'rolling-out' },
  { key: 'earlyAccess', label: 'Early Access Features', minTier: 'PREMIUM', status: 'rolling-out' },
  { key: 'apiAccess', label: 'API Access', minTier: 'PREMIUM', status: 'rolling-out' },
  { key: 'customBrandPages', label: 'Custom Brand Pages', minTier: 'PREMIUM', status: 'rolling-out' },
  { key: 'premiumVerification', label: 'Premium Creator Verification', minTier: 'PREMIUM', status: 'rolling-out' },
  { key: 'enterpriseAnalytics', label: 'Enterprise Analytics', minTier: 'PREMIUM', status: 'rolling-out' },
  { key: 'whiteLabelReports', label: 'White Label Reports', minTier: 'PREMIUM', status: 'rolling-out' },
  { key: 'priorityPayouts', label: 'Priority Payouts', minTier: 'PREMIUM', status: 'rolling-out' },
  { key: 'vipSupport', label: 'VIP Support', minTier: 'PREMIUM', status: 'live' },
  { key: 'growthConsultation', label: 'Strategic Growth Consultation', minTier: 'PREMIUM', status: 'rolling-out' },
];

// Does the (possibly inherited) catalogue grant `featureKey` at `tier`?
export const tierHasFeature = (tier: PremiumTier, featureKey: string): boolean => {
  const feature = FEATURES.find((f) => f.key === featureKey);
  if (!feature) return false;
  return rankOf(tier) >= TIER_RANK[feature.minTier];
};

// The full display list for a tier's card: every feature at its level and below,
// prefixed with "Everything in <lower tier>" exactly like the marketing card.
const buildFeatureList = (tier: PaidTier): string[] => {
  const own = FEATURES.filter((f) => f.minTier === tier).map((f) => f.label);
  if (tier === 'STANDARD') return own;
  if (tier === 'POPULAR') return ['Everything in Standard', ...own];
  return ['Everything in Popular', ...own];
};

// ─── Entitlements (what code actually checks) ────────────────────────────────
// `null` on a limit means unlimited (JSON-safe — Infinity would serialise to null
// anyway, so we make the sentinel explicit).
export interface Entitlements {
  tier: PremiumTier;
  active: boolean;
  listingsLimit: number | null;
  teamSeats: number;
  analyticsLevel: 'none' | 'basic' | 'advanced' | 'enterprise';
  supportLevel: 'none' | 'standard' | 'priority' | 'vip';
  payoutSpeed: 'standard' | 'fast' | 'priority';
  escrowProcessing: 'standard' | 'priority';
  canApplyToBrands: boolean;
  canApplyToCampaigns: boolean;
  prioritySearchRanking: boolean;
  featuredPlacement: boolean;
  proposalTemplates: boolean;
  teamCollaboration: boolean;
  performanceReports: boolean;
  // Popular feature flags
  smartMatching: boolean;
  affiliateDeals: boolean;
  dedicatedManager: boolean;
  aiInsights: boolean;
  advancedEscrowControls: boolean;
  earlyAccess: boolean;
  apiAccess: boolean;
  customBrandPages: boolean;
  premiumVerification: boolean;
  whiteLabelReports: boolean;
  growthConsultation: boolean;
  // Premium feature flags
  salesAttribution: boolean;
  usageRightsControl: boolean;
  proposalTemplateManager: boolean;
  teamManagement: boolean;
}

const EMPTY_ENTITLEMENTS = (tier: PremiumTier): Entitlements => ({
  tier,
  active: false,
  listingsLimit: 0,
  teamSeats: 0,
  analyticsLevel: 'none',
  supportLevel: 'none',
  payoutSpeed: 'standard',
  escrowProcessing: 'standard',
  canApplyToBrands: false,
  canApplyToCampaigns: false,
  prioritySearchRanking: false,
  featuredPlacement: false,
  proposalTemplates: false,
  teamCollaboration: false,
  performanceReports: false,
  smartMatching: false,
  affiliateDeals: false,
  dedicatedManager: false,
  aiInsights: false,
  advancedEscrowControls: false,
  earlyAccess: false,
  apiAccess: false,
  customBrandPages: false,
  premiumVerification: false,
  whiteLabelReports: false,
  growthConsultation: false,
  salesAttribution: false,
  usageRightsControl: false,
  proposalTemplateManager: false,
  teamManagement: false,
});

export const isPremiumActive = (tier: PremiumTier, until: Date | null | undefined): boolean =>
  tier !== 'NONE' && !!until && until.getTime() > Date.now();

/**
 * Resolve the full entitlement set for a creator. When the plan is inactive
 * (no tier or expired) everything is locked — the free experience.
 */
export const getEntitlements = (tier: PremiumTier, until: Date | null | undefined): Entitlements => {
  if (!isPremiumActive(tier, until)) return EMPTY_ENTITLEMENTS(tier);
  const rank = rankOf(tier);
  const isPopularPlus = rank >= TIER_RANK.POPULAR;
  const isPremium = rank >= TIER_RANK.PREMIUM;

  return {
    tier,
    active: true,
    listingsLimit: isPopularPlus ? null : 10,
    teamSeats: isPremium ? Number.MAX_SAFE_INTEGER : isPopularPlus ? 5 : 1,
    analyticsLevel: isPremium ? 'enterprise' : isPopularPlus ? 'advanced' : 'basic',
    supportLevel: isPremium ? 'vip' : isPopularPlus ? 'priority' : 'standard',
    payoutSpeed: isPremium ? 'priority' : isPopularPlus ? 'fast' : 'standard',
    escrowProcessing: isPopularPlus ? 'priority' : 'standard',
    canApplyToBrands: true,
    canApplyToCampaigns: isPopularPlus,
    prioritySearchRanking: isPopularPlus,
    featuredPlacement: isPopularPlus,
    proposalTemplates: isPopularPlus,
    teamCollaboration: isPopularPlus,
    performanceReports: isPopularPlus,
    smartMatching: isPopularPlus,
    affiliateDeals: isPopularPlus,
    dedicatedManager: isPremium,
    aiInsights: isPremium,
    advancedEscrowControls: isPremium,
    earlyAccess: isPopularPlus,
    apiAccess: isPremium,
    customBrandPages: isPremium,
    premiumVerification: isPremium,
    whiteLabelReports: isPremium,
    growthConsultation: isPremium,
    salesAttribution: isPremium,
    usageRightsControl: isPremium,
    proposalTemplateManager: isPremium,
    teamManagement: isPremium,
  };
};

export interface TierInfo {
  tier: PaidTier;
  name: string;
  priceKobo: number;
  priceNaira: number;
  canApplyToBrands: boolean;
  canApplyToCampaigns: boolean;
  features: string[];
  /** @deprecated kept for backward compatibility — mirrors `features`. */
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
    features: buildFeatureList('STANDARD'),
    perks: buildFeatureList('STANDARD'),
  },
  POPULAR: {
    tier: 'POPULAR',
    name: 'Popular',
    priceKobo: 2_250_000,
    priceNaira: 22_500,
    canApplyToBrands: true,
    canApplyToCampaigns: true,
    features: buildFeatureList('POPULAR'),
    perks: buildFeatureList('POPULAR'),
  },
  PREMIUM: {
    tier: 'PREMIUM',
    name: 'Premium',
    priceKobo: 5_000_000,
    priceNaira: 50_000,
    canApplyToBrands: true,
    canApplyToCampaigns: true,
    features: buildFeatureList('PREMIUM'),
    perks: buildFeatureList('PREMIUM'),
  },
};

// Any active paid tier can apply to brands.
export const canApplyToBrands = (tier: PremiumTier, until: Date | null | undefined): boolean =>
  isPremiumActive(tier, until);

// Only Popular and Premium can apply to posted campaigns.
export const canApplyToCampaigns = (tier: PremiumTier, until: Date | null | undefined): boolean =>
  isPremiumActive(tier, until) && (tier === 'POPULAR' || tier === 'PREMIUM');

// ═══════════════════════════════════════════════════════════════════════════
// BRAND subscriptions — a parallel tier ladder for brand/agency accounts.
// Basic posting/offers stay free; the high-value tools below are gated.
// ═══════════════════════════════════════════════════════════════════════════

export const BRAND_FEATURES: FeatureDef[] = [
  // ── Standard ──
  { key: 'postCampaigns', label: 'Post Campaigns', minTier: 'STANDARD', status: 'live' },
  { key: 'sendOffers', label: 'Send Creator Offers', minTier: 'STANDARD', status: 'live' },
  { key: 'escrowProtection', label: 'Escrow Protection', minTier: 'STANDARD', status: 'live' },
  { key: 'basicCampaignAnalytics', label: 'Basic Campaign Analytics', minTier: 'STANDARD', status: 'live' },
  { key: 'standardSupport', label: 'Standard Support', minTier: 'STANDARD', status: 'live' },

  // ── Popular ──
  { key: 'creatorMatching', label: 'AI Creator Matching', minTier: 'POPULAR', status: 'live' },
  { key: 'suggestedCreators', label: 'Suggested Creators per Campaign', minTier: 'POPULAR', status: 'live' },
  { key: 'unlimitedCampaigns', label: 'Unlimited Active Campaigns', minTier: 'POPULAR', status: 'live' },
  { key: 'advancedCampaignAnalytics', label: 'Advanced Campaign Analytics', minTier: 'POPULAR', status: 'live' },
  { key: 'priorityListing', label: 'Priority Campaign Placement', minTier: 'POPULAR', status: 'rolling-out' },
  { key: 'brandPrioritySupport', label: 'Priority Support', minTier: 'POPULAR', status: 'live' },

  // ── Premium ──
  { key: 'campaignPerformance', label: 'Campaign Performance & ROAS Analytics', minTier: 'PREMIUM', status: 'live' },
  { key: 'agencyWorkspace', label: 'Multi-Brand Agency Workspace', minTier: 'PREMIUM', status: 'live' },
  { key: 'bulkOutreach', label: 'Bulk Creator Outreach', minTier: 'PREMIUM', status: 'rolling-out' },
  { key: 'brandDedicatedManager', label: 'Dedicated Account Manager', minTier: 'PREMIUM', status: 'rolling-out' },
  { key: 'brandApiAccess', label: 'API Access', minTier: 'PREMIUM', status: 'rolling-out' },
  { key: 'brandVipSupport', label: 'VIP Support — dedicated Slack + 24h SLA', minTier: 'PREMIUM', status: 'live' },
];

const buildBrandFeatureList = (tier: PaidTier): string[] => {
  const own = BRAND_FEATURES.filter((f) => f.minTier === tier).map((f) => f.label);
  if (tier === 'STANDARD') return own;
  if (tier === 'POPULAR') return ['Everything in Starter', ...own];
  return ['Everything in Growth', ...own];
};

export interface BrandEntitlements {
  tier: PremiumTier;
  active: boolean;
  campaignsLimit: number | null;
  managedBrandSeats: number;
  analyticsLevel: 'basic' | 'advanced' | 'enterprise';
  supportLevel: 'standard' | 'priority' | 'vip';
  creatorMatching: boolean;
  advancedCampaignAnalytics: boolean;
  campaignPerformance: boolean;
  agencyWorkspace: boolean;
  bulkOutreach: boolean;
  dedicatedManager: boolean;
  apiAccess: boolean;
}

const EMPTY_BRAND_ENTITLEMENTS = (tier: PremiumTier): BrandEntitlements => ({
  tier,
  active: false,
  // Basic posting stays available even without a paid plan (capped).
  campaignsLimit: 2,
  managedBrandSeats: 0,
  analyticsLevel: 'basic',
  supportLevel: 'standard',
  creatorMatching: false,
  advancedCampaignAnalytics: false,
  campaignPerformance: false,
  agencyWorkspace: false,
  bulkOutreach: false,
  dedicatedManager: false,
  apiAccess: false,
});

export const getBrandEntitlements = (
  tier: PremiumTier,
  until: Date | null | undefined,
): BrandEntitlements => {
  if (!isPremiumActive(tier, until)) return EMPTY_BRAND_ENTITLEMENTS(tier);
  const rank = rankOf(tier);
  const isPopularPlus = rank >= TIER_RANK.POPULAR;
  const isPremium = rank >= TIER_RANK.PREMIUM;
  return {
    tier,
    active: true,
    campaignsLimit: isPopularPlus ? null : 10,
    managedBrandSeats: isPremium ? 25 : 0,
    analyticsLevel: isPremium ? 'enterprise' : isPopularPlus ? 'advanced' : 'basic',
    supportLevel: isPremium ? 'vip' : isPopularPlus ? 'priority' : 'standard',
    creatorMatching: isPopularPlus,
    advancedCampaignAnalytics: isPopularPlus,
    campaignPerformance: isPremium,
    agencyWorkspace: isPremium,
    bulkOutreach: isPremium,
    dedicatedManager: isPremium,
    apiAccess: isPremium,
  };
};

export const BRAND_PREMIUM_TIERS: Record<PaidTier, TierInfo> = {
  STANDARD: {
    tier: 'STANDARD',
    name: 'Starter',
    priceKobo: 2_500_000,
    priceNaira: 25_000,
    canApplyToBrands: false,
    canApplyToCampaigns: false,
    features: buildBrandFeatureList('STANDARD'),
    perks: buildBrandFeatureList('STANDARD'),
  },
  POPULAR: {
    tier: 'POPULAR',
    name: 'Growth',
    priceKobo: 6_000_000,
    priceNaira: 60_000,
    canApplyToBrands: false,
    canApplyToCampaigns: false,
    features: buildBrandFeatureList('POPULAR'),
    perks: buildBrandFeatureList('POPULAR'),
  },
  PREMIUM: {
    tier: 'PREMIUM',
    name: 'Scale',
    priceKobo: 15_000_000,
    priceNaira: 150_000,
    canApplyToBrands: false,
    canApplyToCampaigns: false,
    features: buildBrandFeatureList('PREMIUM'),
    perks: buildBrandFeatureList('PREMIUM'),
  },
};
