import api, { unwrap } from "./api"

export interface Campaign {
  id: string
  title: string
  description: string
  budgetKobo: number
  platform: string
  deadline: string | null
  status: "OPEN" | "CLOSED"
  createdAt: string
  brand?: { id: string; name: string; industry: string; logo: string | null }
  _count?: { applications: number }
}

export interface CampaignApplication {
  id: string
  status: "PENDING" | "ACCEPTED" | "DECLINED"
  message: string | null
  createdAt: string
  creator?: { id: string; name: string; handle: string; niche: string; avatar: string | null; followers: number; engagement: number }
}

export async function fetchCampaigns(params: { search?: string; limit?: number } = {}): Promise<Campaign[]> {
  const query: Record<string, string> = {}
  if (params.search) query.search = params.search
  if (params.limit) query.limit = String(params.limit)
  const res = await api.get("/campaigns", { params: query })
  return unwrap<{ campaigns: Campaign[] }>(res).campaigns ?? []
}

export async function fetchMyCampaigns(): Promise<Campaign[]> {
  const res = await api.get("/campaigns/mine")
  return unwrap<{ campaigns: Campaign[] }>(res).campaigns ?? []
}

export interface CreateCampaignInput {
  title: string
  description: string
  budget: number
  platform: string
  deadline?: string
}

export async function createCampaign(data: CreateCampaignInput): Promise<Campaign> {
  const res = await api.post("/campaigns", data)
  return unwrap<{ campaign: Campaign }>(res).campaign
}

export async function closeCampaign(id: string): Promise<Campaign> {
  const res = await api.put(`/campaigns/${id}/close`)
  return unwrap<{ campaign: Campaign }>(res).campaign
}

export async function applyToCampaign(id: string, message?: string): Promise<CampaignApplication> {
  const res = await api.post(`/campaigns/${id}/apply`, { message: message || undefined })
  return unwrap<{ application: CampaignApplication }>(res).application
}

export async function fetchCampaignApplications(id: string): Promise<CampaignApplication[]> {
  const res = await api.get(`/campaigns/${id}/applications`)
  return unwrap<{ applications: CampaignApplication[] }>(res).applications ?? []
}
