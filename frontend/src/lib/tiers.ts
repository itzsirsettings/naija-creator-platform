// Single source of truth for plan tiers + feature entitlements on the frontend.
// Mirrors backend/src/lib/premium.ts — keep the two in sync. The backend remains
// authoritative for enforcement; this module drives display (marketing pricing
// cards, comparison table, in-app Premium page) and client-side gating.

export type Tier = "NONE" | "STANDARD" | "POPULAR" | "PREMIUM"
export type PaidTier = "STANDARD" | "POPULAR" | "PREMIUM"

export const TIER_RANK: Record<PaidTier, number> = { STANDARD: 1, POPULAR: 2, PREMIUM: 3 }

const rankOf = (tier: Tier): number => (tier === "NONE" ? 0 : TIER_RANK[tier])

export type FeatureStatus = "live" | "rolling-out"

export interface FeatureDef {
  key: string
  label: string
  minTier: PaidTier
  status: FeatureStatus
}

export const FEATURES: FeatureDef[] = [
  // Standard
  { key: "verifiedProfile", label: "Verified Profile", minTier: "STANDARD", status: "live" },
  { key: "creatorPortfolio", label: "Basic Creator Portfolio", minTier: "STANDARD", status: "live" },
  { key: "activeListings", label: "10 Active Listings", minTier: "STANDARD", status: "rolling-out" },
  { key: "directMessaging", label: "Direct Messaging", minTier: "STANDARD", status: "rolling-out" },
  { key: "escrowProtection", label: "Escrow Protection", minTier: "STANDARD", status: "live" },
  { key: "standardSupport", label: "Standard Support", minTier: "STANDARD", status: "live" },
  { key: "offerManagement", label: "Offer Management", minTier: "STANDARD", status: "live" },
  { key: "analytics", label: "Analytics Dashboard", minTier: "STANDARD", status: "live" },
  // Popular
  { key: "unlimitedListings", label: "Unlimited Listings", minTier: "POPULAR", status: "rolling-out" },
  { key: "prioritySearchRanking", label: "Priority Search Ranking", minTier: "POPULAR", status: "live" },
  { key: "advancedAnalytics", label: "Advanced Analytics", minTier: "POPULAR", status: "rolling-out" },
  { key: "proposalTemplates", label: "Proposal Templates", minTier: "POPULAR", status: "rolling-out" },
  { key: "teamCollaboration", label: "Team Collaboration", minTier: "POPULAR", status: "rolling-out" },
  { key: "priorityEscrow", label: "Priority Escrow Processing", minTier: "POPULAR", status: "rolling-out" },
  { key: "performanceReports", label: "Creator Performance Reports", minTier: "POPULAR", status: "rolling-out" },
  { key: "featuredPlacement", label: "Featured Profile Placement", minTier: "POPULAR", status: "live" },
  { key: "fasterPayouts", label: "Faster Payout Requests", minTier: "POPULAR", status: "rolling-out" },
  { key: "prioritySupport", label: "Priority Support", minTier: "POPULAR", status: "live" },
  { key: "applyToCampaigns", label: "Apply to Posted Campaigns", minTier: "POPULAR", status: "live" },
  // Premium
  { key: "unlimitedTeam", label: "Unlimited Team Members", minTier: "PREMIUM", status: "rolling-out" },
  { key: "dedicatedManager", label: "Dedicated Account Manager", minTier: "PREMIUM", status: "rolling-out" },
  { key: "aiInsights", label: "AI Campaign Insights", minTier: "PREMIUM", status: "rolling-out" },
  { key: "advancedEscrowControls", label: "Advanced Escrow Controls", minTier: "PREMIUM", status: "rolling-out" },
  { key: "earlyAccess", label: "Early Access Features", minTier: "PREMIUM", status: "rolling-out" },
  { key: "apiAccess", label: "API Access", minTier: "PREMIUM", status: "rolling-out" },
  { key: "customBrandPages", label: "Custom Brand Pages", minTier: "PREMIUM", status: "rolling-out" },
  { key: "premiumVerification", label: "Premium Creator Verification", minTier: "PREMIUM", status: "rolling-out" },
  { key: "enterpriseAnalytics", label: "Enterprise Analytics", minTier: "PREMIUM", status: "rolling-out" },
  { key: "whiteLabelReports", label: "White Label Reports", minTier: "PREMIUM", status: "rolling-out" },
  { key: "priorityPayouts", label: "Priority Payouts", minTier: "PREMIUM", status: "rolling-out" },
  { key: "vipSupport", label: "VIP Support", minTier: "PREMIUM", status: "live" },
  { key: "growthConsultation", label: "Strategic Growth Consultation", minTier: "PREMIUM", status: "rolling-out" },
]

export interface PlanDef {
  tier: PaidTier
  name: string
  monthlyPriceNaira: number
  description: string
  cta: string
  featured: boolean
  /** Full display list, with the "Everything in <lower tier>" prefix. */
  features: string[]
}

const ownFeatures = (tier: PaidTier): string[] =>
  FEATURES.filter((f) => f.minTier === tier).map((f) => f.label)

const featureListFor = (tier: PaidTier): string[] => {
  if (tier === "STANDARD") return ownFeatures("STANDARD")
  if (tier === "POPULAR") return ["Everything in Standard", ...ownFeatures("POPULAR")]
  return ["Everything in Popular", ...ownFeatures("PREMIUM")]
}

export const PLANS: PlanDef[] = [
  {
    tier: "STANDARD",
    name: "Standard",
    monthlyPriceNaira: 10_000,
    description: "Perfect for new creators and brands getting started.",
    cta: "Get Started",
    featured: false,
    features: featureListFor("STANDARD"),
  },
  {
    tier: "POPULAR",
    name: "Popular",
    monthlyPriceNaira: 22_500,
    description: "Best value for serious creators and growing brands.",
    cta: "Start Growing",
    featured: true,
    features: featureListFor("POPULAR"),
  },
  {
    tier: "PREMIUM",
    name: "Premium",
    monthlyPriceNaira: 50_000,
    description: "Built for agencies, top creators, and enterprise brands.",
    cta: "Get Started",
    featured: false,
    features: featureListFor("PREMIUM"),
  },
]

// A curated subset for the marketing comparison table (matches the original copy).
export const COMPARISON_KEYS: string[] = [
  "verifiedProfile",
  "escrowProtection",
  "analytics",
  "unlimitedListings",
  "prioritySearchRanking",
  "advancedAnalytics",
  "teamCollaboration",
  "featuredPlacement",
  "prioritySupport",
  "dedicatedManager",
  "aiInsights",
  "apiAccess",
  "whiteLabelReports",
  "vipSupport",
]

export interface ComparisonRow {
  name: string
  standard: boolean
  popular: boolean
  premium: boolean
}

// Short, table-friendly labels keyed by feature key (falls back to the catalogue label).
const COMPARISON_LABELS: Record<string, string> = {
  verifiedProfile: "Verified profile",
  escrowProtection: "Escrow protection",
  analytics: "Analytics dashboard",
  unlimitedListings: "Unlimited listings",
  prioritySearchRanking: "Priority search ranking",
  advancedAnalytics: "Advanced analytics",
  teamCollaboration: "Team collaboration",
  featuredPlacement: "Featured profile placement",
  prioritySupport: "Priority support",
  dedicatedManager: "Dedicated account manager",
  aiInsights: "AI campaign insights",
  apiAccess: "API access",
  whiteLabelReports: "White label reports",
  vipSupport: "VIP support",
}

export const tierHasFeatureKey = (tier: Tier, featureKey: string): boolean => {
  const feature = FEATURES.find((f) => f.key === featureKey)
  if (!feature) return false
  return rankOf(tier) >= TIER_RANK[feature.minTier]
}

export const COMPARISON_ROWS: ComparisonRow[] = COMPARISON_KEYS.map((key) => {
  const feature = FEATURES.find((f) => f.key === key)
  return {
    name: COMPARISON_LABELS[key] ?? feature?.label ?? key,
    standard: tierHasFeatureKey("STANDARD", key),
    popular: tierHasFeatureKey("POPULAR", key),
    premium: tierHasFeatureKey("PREMIUM", key),
  }
})

// ─── Client-side entitlements (mirror of backend getEntitlements) ────────────
export interface Entitlements {
  tier: Tier
  active: boolean
  listingsLimit: number | null
  teamSeats: number
  analyticsLevel: "none" | "basic" | "advanced" | "enterprise"
  supportLevel: "none" | "standard" | "priority" | "vip"
  payoutSpeed: "standard" | "fast" | "priority"
  escrowProcessing: "standard" | "priority"
  canApplyToBrands: boolean
  canApplyToCampaigns: boolean
  prioritySearchRanking: boolean
  featuredPlacement: boolean
  proposalTemplates: boolean
  teamCollaboration: boolean
  performanceReports: boolean
  dedicatedManager: boolean
  aiInsights: boolean
  advancedEscrowControls: boolean
  earlyAccess: boolean
  apiAccess: boolean
  customBrandPages: boolean
  premiumVerification: boolean
  whiteLabelReports: boolean
  growthConsultation: boolean
}

export const emptyEntitlements = (tier: Tier = "NONE"): Entitlements => ({
  tier,
  active: false,
  listingsLimit: 0,
  teamSeats: 0,
  analyticsLevel: "none",
  supportLevel: "none",
  payoutSpeed: "standard",
  escrowProcessing: "standard",
  canApplyToBrands: false,
  canApplyToCampaigns: false,
  prioritySearchRanking: false,
  featuredPlacement: false,
  proposalTemplates: false,
  teamCollaboration: false,
  performanceReports: false,
  dedicatedManager: false,
  aiInsights: false,
  advancedEscrowControls: false,
  earlyAccess: false,
  apiAccess: false,
  customBrandPages: false,
  premiumVerification: false,
  whiteLabelReports: false,
  growthConsultation: false,
})

export const computeEntitlements = (tier: Tier, active: boolean): Entitlements => {
  if (!active || tier === "NONE") return emptyEntitlements(tier)
  const rank = rankOf(tier)
  const isPopularPlus = rank >= TIER_RANK.POPULAR
  const isPremium = rank >= TIER_RANK.PREMIUM
  return {
    tier,
    active: true,
    listingsLimit: isPopularPlus ? null : 10,
    teamSeats: isPremium ? Number.MAX_SAFE_INTEGER : isPopularPlus ? 5 : 1,
    analyticsLevel: isPremium ? "enterprise" : isPopularPlus ? "advanced" : "basic",
    supportLevel: isPremium ? "vip" : isPopularPlus ? "priority" : "standard",
    payoutSpeed: isPremium ? "priority" : isPopularPlus ? "fast" : "standard",
    escrowProcessing: isPopularPlus ? "priority" : "standard",
    canApplyToBrands: true,
    canApplyToCampaigns: isPopularPlus,
    prioritySearchRanking: isPopularPlus,
    featuredPlacement: isPopularPlus,
    proposalTemplates: isPopularPlus,
    teamCollaboration: isPopularPlus,
    performanceReports: isPopularPlus,
    dedicatedManager: isPremium,
    aiInsights: isPremium,
    advancedEscrowControls: isPremium,
    earlyAccess: isPremium,
    apiAccess: isPremium,
    customBrandPages: isPremium,
    premiumVerification: isPremium,
    whiteLabelReports: isPremium,
    growthConsultation: isPremium,
  }
}
