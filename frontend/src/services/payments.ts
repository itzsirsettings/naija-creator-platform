import api, { unwrap } from "./api"

export interface Transaction {
  id: string
  offerId: string
  creatorId: string
  grossKobo: number
  feeKobo: number
  netKobo: number
  status: string
  paystackRef: string | null
  createdAt: string
  offer?: { id: string; title: string; platform: string; brand?: { name: string } }
  payout?: { id: string; status: string; providerRef?: string | null } | null
}

export async function fetchTransactions(creatorId: string): Promise<Transaction[]> {
  const res = await api.get(`/payments/transactions/${creatorId}`)
  return unwrap<{ transactions: Transaction[] }>(res).transactions ?? []
}

export interface Balance {
  balanceKobo: number
  balance: number
  heldKobo: number
  held: number
}

export async function fetchBalance(creatorId: string): Promise<Balance> {
  const res = await api.get(`/creators/${creatorId}/balance`)
  return unwrap<Balance>(res)
}

export interface Bank {
  name: string
  code: string
  longcode?: string
}

export async function fetchBanks(country = "nigeria"): Promise<Bank[]> {
  const res = await api.get("/payments/banks", { params: { country } })
  return unwrap<{ banks: Bank[] }>(res).banks ?? []
}
