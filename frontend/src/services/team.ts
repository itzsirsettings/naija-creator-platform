import api, { unwrap } from "./api"

export interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export interface TeamData {
  members: TeamMember[]
  seats: number
}

export async function fetchTeam(): Promise<TeamData> {
  const res = await api.get("/team")
  return unwrap<TeamData>(res)
}

export async function addTeamMember(data: { name: string; email: string; role?: string }): Promise<TeamMember> {
  const res = await api.post("/team", data)
  return unwrap<{ member: TeamMember }>(res).member
}

export async function removeTeamMember(id: string): Promise<void> {
  await api.delete(`/team/${id}`)
}
