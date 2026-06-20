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
