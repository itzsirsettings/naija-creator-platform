import api, { unwrap } from "./api"

export interface Application {
  id: string
  status: "PENDING" | "ACCEPTED" | "DECLINED"
  message: string | null
  createdAt: string
  creator?: { id: string; name: string; handle: string; niche: string; avatar: string | null; followers: number; engagement: number }
  brand?: { id: string; name: string; industry: string; logo: string | null }
}

export async function applyToBrand(brandId: string, message?: string): Promise<Application> {
  const res = await api.post("/applications", { brandId, message: message || undefined })
  return unwrap<{ application: Application }>(res).application
}

export async function fetchMyApplications(): Promise<Application[]> {
  const res = await api.get("/applications/mine")
  return unwrap<{ applications: Application[] }>(res).applications ?? []
}

export async function fetchReceivedApplications(): Promise<Application[]> {
  const res = await api.get("/applications/received")
  return unwrap<{ applications: Application[] }>(res).applications ?? []
}

export async function respondToApplication(id: string, status: "ACCEPTED" | "DECLINED"): Promise<Application> {
  const res = await api.put(`/applications/${id}`, { status })
  return unwrap<{ application: Application }>(res).application
}
