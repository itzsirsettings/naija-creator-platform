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
