import api, { unwrap } from "./api"

export interface Brand {
  id: string
  name: string
  industry: string
  website: string | null
  logo: string | null
  createdAt: string
}

interface BrandListResponse {
  brands: Brand[]
  nextCursor: string | null
}

export interface ListBrandsParams {
  industry?: string
  search?: string
  limit?: number
  cursor?: string
}

export async function fetchBrands(params: ListBrandsParams = {}): Promise<BrandListResponse> {
  const query: Record<string, string> = {}
  if (params.search) query.search = params.search
  if (params.industry) query.industry = params.industry
  if (params.limit) query.limit = String(params.limit)
  if (params.cursor) query.cursor = params.cursor

  const res = await api.get("/brands", { params: query })
  const body = unwrap<BrandListResponse>(res)
  return { brands: body.brands ?? [], nextCursor: body.nextCursor ?? null }
}
