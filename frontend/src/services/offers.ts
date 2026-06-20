import api, { unwrap } from "./api"

export interface Offer {
  id: string
  title: string
  description: string
  amountKobo: number
  platform: string
  status: string
  deadline: string
  deliverableUrl?: string | null
  deliverableNote?: string | null
  submittedAt?: string | null
  approvedAt?: string | null
  createdAt: string
  brandId: string
  creatorId: string
  brand?: { id: string; name: string; logo?: string | null }
  creator?: { id: string; name: string; handle?: string; avatar?: string | null; niche?: string }
}

export async function fetchCreatorOffers(creatorId: string): Promise<Offer[]> {
  const res = await api.get(`/offers/creator/${creatorId}`)
  return unwrap<{ offers: Offer[] }>(res).offers ?? []
}

export async function fetchBrandOffers(brandId: string): Promise<Offer[]> {
  const res = await api.get(`/offers/brand/${brandId}`)
  return unwrap<{ offers: Offer[] }>(res).offers ?? []
}

export interface CreateOfferInput {
  creatorId: string
  title: string
  description: string
  amount: number
  platform: string
  deadline: string
}

export async function createOffer(data: CreateOfferInput): Promise<Offer> {
  const res = await api.post("/offers", data)
  return unwrap<{ offer: Offer }>(res).offer
}

export async function acceptOffer(offerId: string): Promise<Offer> {
  const res = await api.put(`/offers/${offerId}/accept`)
  return unwrap<{ offer: Offer }>(res).offer
}

export async function rejectOffer(offerId: string): Promise<Offer> {
  const res = await api.put(`/offers/${offerId}/reject`)
  return unwrap<{ offer: Offer }>(res).offer
}

export async function submitWork(offerId: string, data: { deliverableUrl: string; deliverableNote?: string }): Promise<Offer> {
  const res = await api.put(`/offers/${offerId}/submit`, data)
  return unwrap<{ offer: Offer }>(res).offer
}

export async function approveOffer(offerId: string): Promise<Offer> {
  const res = await api.put(`/offers/${offerId}/approve`)
  return unwrap<{ offer: Offer }>(res).offer
}

export async function disputeOffer(offerId: string): Promise<Offer> {
  const res = await api.put(`/offers/${offerId}/dispute`)
  return unwrap<{ offer: Offer }>(res).offer
}

export async function initiatePayment(offerId: string, successUrl: string) {
  const res = await api.post("/payments/initiate", { offerId, successUrl })
  return unwrap<{ authorizationUrl: string; reference: string }>(res)
}

export async function verifyPayment(reference: string) {
  const res = await api.post("/payments/verify", { reference })
  return unwrap(res)
}
