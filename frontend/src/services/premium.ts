import api, { unwrap } from "./api"

export type Tier = "NONE" | "STANDARD" | "POPULAR" | "PREMIUM"

export interface PremiumTierInfo {
  tier: "STANDARD" | "POPULAR" | "PREMIUM"
  name: string
  priceKobo: number
  priceNaira: number
  canApplyToBrands: boolean
  canApplyToCampaigns: boolean
  perks: string[]
}

export interface PremiumStatus {
  tier: Tier
  until: string | null
  active: boolean
  tiers: PremiumTierInfo[]
}

export async function fetchPremiumStatus(): Promise<PremiumStatus> {
  const res = await api.get("/premium")
  return unwrap<PremiumStatus>(res)
}

export async function requestUpgrade(tier: "STANDARD" | "POPULAR" | "PREMIUM") {
  const res = await api.post("/premium/upgrade", { tier })
  return unwrap<{ status: string; message: string; priceNaira: number }>(res)
}

export type BillingPeriod = "monthly" | "annual"

export interface SubscriptionPaymentResult {
  authorizationUrl: string
  reference: string
  amountKobo: number
  tier: string
}

export async function initiateSubscriptionPayment(
  tier: "STANDARD" | "POPULAR" | "PREMIUM",
  billingPeriod: BillingPeriod,
  successUrl: string,
): Promise<SubscriptionPaymentResult> {
  const res = await api.post("/premium/upgrade/pay", { tier, billingPeriod, successUrl })
  return unwrap<SubscriptionPaymentResult>(res)
}

export async function verifySubscriptionPayment(
  reference: string,
  tier: "STANDARD" | "POPULAR" | "PREMIUM",
  billingPeriod: BillingPeriod,
): Promise<{ status: string; message: string; tier: string; until: string }> {
  const res = await api.post("/premium/upgrade/verify", { reference, tier, billingPeriod })
  return unwrap<{ status: string; message: string; tier: string; until: string }>(res)
}

// ─── Brand subscriptions ─────────────────────────────────────────────────────
export async function fetchBrandPremiumStatus(): Promise<PremiumStatus> {
  const res = await api.get("/premium/brand")
  return unwrap<PremiumStatus>(res)
}

export async function requestBrandUpgrade(tier: "STANDARD" | "POPULAR" | "PREMIUM") {
  const res = await api.post("/premium/brand/upgrade", { tier })
  return unwrap<{ status: string; message: string; priceNaira: number }>(res)
}

export async function initiateBrandSubscriptionPayment(
  tier: "STANDARD" | "POPULAR" | "PREMIUM",
  billingPeriod: BillingPeriod,
  successUrl: string,
): Promise<SubscriptionPaymentResult> {
  const res = await api.post("/premium/brand/upgrade/pay", { tier, billingPeriod, successUrl })
  return unwrap<SubscriptionPaymentResult>(res)
}

export async function verifyBrandSubscriptionPayment(
  reference: string,
  tier: "STANDARD" | "POPULAR" | "PREMIUM",
  billingPeriod: BillingPeriod,
): Promise<{ status: string; message: string; tier: string; until: string }> {
  const res = await api.post("/premium/brand/upgrade/verify", { reference, tier, billingPeriod })
  return unwrap<{ status: string; message: string; tier: string; until: string }>(res)
}

// ─── Recurring subscription management ────────────────────────────────────────

export type SubscriptionState =
  | "PENDING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED"

export interface SubscriptionInfo {
  active: boolean
  subscription: {
    tier: Tier
    interval: BillingPeriod
    status: SubscriptionState
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
    hasPaymentMethod: boolean
  } | null
}

export interface CancelSubscriptionResult {
  status: string
  message: string
  currentPeriodEnd: string | null
}

export async function fetchSubscription(): Promise<SubscriptionInfo> {
  const res = await api.get("/premium/subscription")
  return unwrap<SubscriptionInfo>(res)
}

export async function cancelSubscription(): Promise<CancelSubscriptionResult> {
  const res = await api.post("/premium/subscription/cancel")
  return unwrap<CancelSubscriptionResult>(res)
}

export async function fetchBrandSubscription(): Promise<SubscriptionInfo> {
  const res = await api.get("/premium/brand/subscription")
  return unwrap<SubscriptionInfo>(res)
}

export async function cancelBrandSubscription(): Promise<CancelSubscriptionResult> {
  const res = await api.post("/premium/brand/subscription/cancel")
  return unwrap<CancelSubscriptionResult>(res)
}
