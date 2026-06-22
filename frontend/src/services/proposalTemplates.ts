import api, { unwrap } from "./api"

export interface ProposalTemplate {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
}

export async function fetchTemplates(): Promise<ProposalTemplate[]> {
  const res = await api.get("/proposal-templates")
  return unwrap<{ templates: ProposalTemplate[] }>(res).templates ?? []
}

export async function createTemplate(data: { title: string; body: string }): Promise<ProposalTemplate> {
  const res = await api.post("/proposal-templates", data)
  return unwrap<{ template: ProposalTemplate }>(res).template
}

export async function updateTemplate(id: string, data: { title?: string; body?: string }): Promise<ProposalTemplate> {
  const res = await api.put(`/proposal-templates/${id}`, data)
  return unwrap<{ template: ProposalTemplate }>(res).template
}

export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(`/proposal-templates/${id}`)
}
