import api, { unwrap } from "./api"

export interface Creator {
  id: string
  name: string
  handle: string
  niche: string
  bio: string
  followers: number
  engagement: number
  baseRate: number
  platforms: string[]
  avatar: string | null
  location: string
  usageRightsPolicy?: string | null
  createdAt: string
}

interface CreatorListResponse {
  creators: Creator[]
  nextCursor: string | null
}

export interface ListCreatorsParams {
  niche?: string
  search?: string
  location?: string
  minFollowers?: number
  limit?: number
  cursor?: string
}

export async function fetchCreators(params: ListCreatorsParams = {}): Promise<CreatorListResponse> {
  const query: Record<string, string> = {}
  if (params.search) query.search = params.search
  if (params.niche && params.niche !== "All Niches") query.niche = params.niche
  if (params.location && params.location !== "All Locations") query.location = params.location
  if (params.minFollowers) query.minFollowers = String(params.minFollowers)
  if (params.limit) query.limit = String(params.limit)
  if (params.cursor) query.cursor = params.cursor

  const res = await api.get("/creators", { params: query })
  return unwrap<CreatorListResponse>(res)
}

export async function fetchCreatorById(id: string): Promise<Creator> {
  const res = await api.get(`/creators/${id}`)
  return unwrap<{ creator: Creator }>(res).creator
}

export type UpdateCreatorInput = Partial<{
  name: string
  handle: string
  niche: string
  bio: string
  followers: number
  engagement: number
  baseRate: number
  platforms: string[]
  avatar: string
  location: string
  usageRightsPolicy: string
}>

export async function updateCreator(id: string, data: UpdateCreatorInput): Promise<Creator> {
  const res = await api.put(`/creators/${id}`, data)
  return unwrap<{ creator: Creator }>(res).creator
}

export interface Bank {
  name: string
  code: string
  slug?: string
}

export async function fetchBanks(): Promise<Bank[]> {
  const res = await api.get("/payments/banks", { params: { country: "nigeria" } })
  return unwrap<{ banks: Bank[] }>(res).banks ?? []
}

export interface AddBankAccountInput {
  accountNumber: string
  bankCode: string
  bankName?: string
}

export interface BankAccountResult {
  message: string
  bankLast4: string | null
  bankName: string | null
  bankVerifiedAt: string | null
  accountName: string | null
}

export async function addBankAccount(creatorId: string, data: AddBankAccountInput): Promise<BankAccountResult> {
  const res = await api.post(`/creators/${creatorId}/bank`, data)
  return unwrap<BankAccountResult>(res)
}

export async function verifyBankAccount(accountNumber: string, bankCode: string): Promise<{ accountName: string }> {
  const res = await api.get("/payments/verify-account", { params: { accountNumber, bankCode } })
  return unwrap<{ accountName: string }>(res)
}
