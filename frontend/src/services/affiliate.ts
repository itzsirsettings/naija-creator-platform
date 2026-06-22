import api, { unwrap } from "./api"

export interface AttributionSummary {
  clicks: number
  conversions: number
  attributedKobo: number
  conversionRate: number
}

export interface AttributionOffer {
  id: string
  title: string
  affiliateCode: string | null
  commissionRate: number | null
  brand?: { id: string; name: string; logo?: string | null }
  clicks: number
  conversions: number
  attributedKobo: number
}

export interface Attribution {
  summary: AttributionSummary
  offers: AttributionOffer[]
}

export async function fetchAttribution(): Promise<Attribution> {
  const res = await api.get("/affiliate/attribution")
  return unwrap<Attribution>(res)
}

export async function trackAffiliateEvent(
  code: string,
  type: "CLICK" | "CONVERSION",
  amount?: number,
): Promise<void> {
  await api.post("/affiliate/track", { code, type, ...(amount !== undefined && { amount }) })
}
