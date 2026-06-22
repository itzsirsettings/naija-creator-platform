import api, { unwrap } from "./api"

export interface ManagedBrand {
  id: string
  name: string
  industry: string
  website: string | null
  logo: string | null
  createdAt: string
}

export interface ManagedBrandData {
  brands: ManagedBrand[]
  seats: number
}

export async function fetchManagedBrands(): Promise<ManagedBrandData> {
  const res = await api.get("/managed-brands")
  return unwrap<ManagedBrandData>(res)
}

export async function createManagedBrand(data: {
  name: string
  industry: string
  website?: string
  logo?: string
}): Promise<ManagedBrand> {
  const res = await api.post("/managed-brands", data)
  return unwrap<{ brand: ManagedBrand }>(res).brand
}

export async function deleteManagedBrand(id: string): Promise<void> {
  await api.delete(`/managed-brands/${id}`)
}
