import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
})

export function setAccessToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common["Authorization"]
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("tehilla:auth-expired"))
    }
    return Promise.reject(error)
  },
)

// The API wraps every response as { success, data, error }. Unwrap to the payload.
export function unwrap<T = unknown>(response: { data: unknown }): T {
  const body = response.data
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: T }).data
  }
  return body as T
}

// ─── Admin: offers & disputes ──────────────────────────────────────────────
export interface AdminOffer {
  id: string
  title: string
  status: string
  amountKobo: number
  brand?: { id: string; name: string } | null
  creator?: { id: string; name: string; handle?: string } | null
}

export async function adminListOffers(status?: string): Promise<AdminOffer[]> {
  const res = await api.get("/admin/offers", { params: status ? { status } : {} })
  return unwrap<{ offers: AdminOffer[] }>(res).offers ?? []
}

// Offer lifecycle actions an admin can drive (the state machine enforces validity).
export const disputeOffer = (offerId: string) => api.put(`/offers/${offerId}/dispute`)
export const refundOffer = (offerId: string) => api.put(`/offers/${offerId}/refund`)
export const completeOffer = (offerId: string) => api.put(`/offers/${offerId}/complete`)

// ─── Admin: webhook delivery monitor ───────────────────────────────────────
export type WebhookStatus = "RECEIVED" | "PROCESSING" | "PROCESSED" | "FAILED" | "DUPLICATE"

export interface WebhookEvent {
  id: string
  provider: string
  eventType: string
  status: WebhookStatus
  error: string | null
  createdAt: string
  processedAt: string | null
}

export interface WebhookSummary {
  total: number
  processed: number
  failed: number
  duplicate: number
  pending: number
  successRate: number
}

export interface RecentWebhooks {
  events: WebhookEvent[]
  summary: WebhookSummary
}

export async function adminListRecentWebhooks(limit = 50): Promise<RecentWebhooks> {
  const res = await api.get("/admin/webhooks/recent", { params: { limit } })
  return unwrap<RecentWebhooks>(res)
}

export default api
