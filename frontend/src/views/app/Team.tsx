"use client"

import { useCallback, useEffect, useState } from "react"
import { Crown, Loader2, Mail, Plus, Trash2, Users, X } from "lucide-react"
import { toast } from "sonner"
import { Link } from "@/lib/router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { usePremium } from "@/hooks/usePremium"
import { fetchTeam, addTeamMember, removeTeamMember, type TeamMember } from "@/services/team"
import { initials } from "@/utils/format"

export default function Team() {
  const { user } = useAuth()
  const ent = usePremium()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [seats, setSeats] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", role: "Member" })
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!ent.teamManagement) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const data = await fetchTeam()
      setMembers(data.members)
      setSeats(data.seats)
    } catch { /* zero-state */ } finally { setIsLoading(false) }
  }, [ent.teamManagement])

  useEffect(() => { load() }, [load])

  const add = async () => {
    if (!form.name.trim() || !form.email.trim()) { toast.error("Name and email are required"); return }
    setBusy(true)
    try {
      const member = await addTeamMember(form)
      setMembers((prev) => [member, ...prev])
      setForm({ name: "", email: "", role: "Member" })
      setShowForm(false)
      toast.success("Team member added")
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not add member")
    } finally { setBusy(false) }
  }

  const remove = async (id: string) => {
    try {
      await removeTeamMember(id)
      setMembers((prev) => prev.filter((m) => m.id !== id))
      toast("Member removed")
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not remove member")
    }
  }

  if (user && user.role !== "creator") {
    return <div className="py-16 text-center text-sm text-muted-foreground">Team management is for creators.</div>
  }

  if (!ent.teamManagement) {
    return (
      <div className="space-y-6">
        <Header />
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10">
            <Crown className="size-6 text-amber-500" />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold">Team Member Management</p>
            <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
              Invite managers and editors to help run your account. Premium includes unlimited team seats.
            </p>
          </div>
          <Link to="/app/premium" className="rounded-lg border border-amber-500/60 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50">
            Upgrade to Premium
          </Link>
        </div>
      </div>
    )
  }

  const seatLabel = seats >= 1_000_000 ? "Unlimited" : String(seats)
  const atLimit = seats < 1_000_000 && members.length >= seats

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Header />
        <Button size="sm" onClick={() => setShowForm((s) => !s)} disabled={atLimit}>
          <Plus className="mr-1 size-4" /> Add member
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        {members.length} member{members.length === 1 ? "" : "s"} · {seatLabel} seat{seatLabel === "1" ? "" : "s"} on your plan
        {atLimit ? " (seat limit reached)" : ""}
      </div>

      {showForm ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold">Add team member</h3>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Role (e.g. Manager)" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </div>
          <Button onClick={add} disabled={busy}>{busy ? "Adding…" : "Add member"}</Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading team…</p>
        </div>
      ) : members.length ? (
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#2f6bff]/10 text-[11px] font-bold text-[#2f6bff]">
                  {initials(m.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{m.name}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Mail className="size-3" /> {m.email}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{m.role}</span>
                <button onClick={() => remove(m.id)} className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"><Trash2 className="size-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <Users className="size-10 text-muted-foreground" />
          <strong className="font-heading text-sm">No team members yet</strong>
          <p className="max-w-sm text-xs text-muted-foreground">Invite a manager or editor to collaborate on your account.</p>
        </div>
      )}
    </div>
  )
}

function Header() {
  return (
    <div>
      <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
        <Users className="size-6 text-[#2f6bff]" /> Team
      </h1>
      <p className="text-muted-foreground">Invite people to help manage your creator account.</p>
    </div>
  )
}
