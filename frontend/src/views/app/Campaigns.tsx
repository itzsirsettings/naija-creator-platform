"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowUpRight, Crown, Inbox, Lock, Loader2, Megaphone, Plus, Users } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import ApplyModal from "@/components/ApplyModal"
import { useAuth } from "@/context/AuthContext"
import { Link, useNavigate } from "@/lib/router"
import {
  fetchCampaigns, fetchMyCampaigns, createCampaign, closeCampaign,
  applyToCampaign, fetchCampaignApplications,
  type Campaign, type CampaignApplication,
} from "@/services/campaigns"
import { formatNaira } from "@/utils/format"

export default function Campaigns() {
  const { user } = useAuth()
  return user?.role === "brand" ? <BrandCampaigns /> : <CreatorCampaigns />
}

// ─── Brand: post and manage campaigns ────────────────────────────────────────
function BrandCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", budget: "", platform: "", deadline: "" })
  const [busy, setBusy] = useState(false)
  const [applicantsFor, setApplicantsFor] = useState<string | null>(null)
  const [applicants, setApplicants] = useState<CampaignApplication[]>([])

  const load = useCallback(async () => {
    setIsLoading(true)
    try { setCampaigns(await fetchMyCampaigns()) } catch { /* zero-state */ } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const create = async () => {
    if (!form.title || !form.description || !form.budget || !form.platform) {
      toast.error("Fill in title, description, budget and platform")
      return
    }
    setBusy(true)
    try {
      await createCampaign({
        title: form.title,
        description: form.description,
        budget: Number(form.budget),
        platform: form.platform,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      })
      toast.success("Campaign posted")
      setForm({ title: "", description: "", budget: "", platform: "", deadline: "" })
      setShowForm(false)
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not post campaign")
    } finally {
      setBusy(false)
    }
  }

  const close = async (id: string) => {
    try { await closeCampaign(id); toast("Campaign closed"); load() }
    catch (err: any) { toast.error(err?.response?.data?.error || "Could not close") }
  }

  const viewApplicants = async (id: string) => {
    if (applicantsFor === id) { setApplicantsFor(null); return }
    setApplicantsFor(id)
    setApplicants([])
    try { setApplicants(await fetchCampaignApplications(id)) } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Post open campaigns for creators to apply to.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}><Plus className="mr-1 size-4" /> New campaign</Button>
      </div>

      {showForm ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
          <Input placeholder="Campaign title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="Describe what you need…" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Input type="number" placeholder="Budget (₦)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            <Input placeholder="Platform (e.g. Instagram)" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} />
            <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <Button onClick={create} disabled={busy}>{busy ? "Posting…" : "Post campaign"}</Button>
        </div>
      ) : null}

      {isLoading ? (
        <Loading label="Loading campaigns…" />
      ) : campaigns.length ? (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-heading text-sm font-semibold">{c.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.platform} · {formatNaira(c.budgetKobo / 100)} · <span className="capitalize">{c.status.toLowerCase()}</span></p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => viewApplicants(c.id)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted">
                    <Users className="size-3.5" /> {c._count?.applications ?? 0}
                  </button>
                  {c.status === "OPEN" ? (
                    <button onClick={() => close(c.id)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">Close</button>
                  ) : null}
                </div>
              </div>
              {applicantsFor === c.id ? (
                <div className="mt-3 border-t border-border pt-3">
                  {applicants.length ? (
                    <div className="space-y-2">
                      {applicants.map((a) => (
                        <div key={a.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="font-medium">{a.creator?.name ?? "Creator"} <span className="text-muted-foreground">@{a.creator?.handle}</span></span>
                          <span className="text-xs text-muted-foreground">{a.creator?.followers?.toLocaleString()} followers</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">No applicants yet.</p>}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <Empty title="No campaigns yet" hint="Post your first campaign to start receiving applications." />
      )}
    </div>
  )
}

// ─── Creator: browse and apply to campaigns (Popular/Premium) ────────────────
function CreatorCampaigns() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [applyTo, setApplyTo] = useState<Campaign | null>(null)

  const canApply = user?.premiumActive && (user.premiumTier === "POPULAR" || user.premiumTier === "PREMIUM")

  const load = useCallback(async () => {
    setIsLoading(true)
    try { setCampaigns(await fetchCampaigns({ limit: 50 })) } catch { /* zero-state */ } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const handleApply = (c: Campaign) => {
    if (!canApply) {
      toast("Applying to campaigns requires a Popular or Premium plan")
      navigate("/premium")
      return
    }
    setApplyTo(c)
  }

  const submit = async (message: string) => {
    if (!applyTo) return
    try {
      await applyToCampaign(applyTo.id, message)
      toast.success("Application sent")
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Could not apply"
      if (err?.response?.status === 402) { toast(msg); navigate("/premium") }
      else toast.error(msg)
      throw new Error(msg)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground">Open brand campaigns you can apply to.</p>
      </div>

      {/* Locked banner for creators without Popular/Premium */}
      {!canApply && (
        <div className="flex items-start gap-3 rounded-xl border border-[#1A24B8]/30 bg-[#1A24B8]/5 p-4 text-sm">
          <Crown className="mt-0.5 size-5 shrink-0 text-[#1A24B8]" />
          <div className="flex-1">
            <p className="font-semibold text-[#1A24B8]">Popular plan required to apply to campaigns</p>
            <p className="mt-0.5 text-muted-foreground">Upgrade to Popular or Premium to send applications directly to brand campaigns.</p>
          </div>
          <Link
            to="/app/premium"
            className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-[#1A24B8] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0A0F7A] transition-colors"
          >
            Upgrade <ArrowUpRight className="size-3" />
          </Link>
        </div>
      )}

      {isLoading ? (
        <Loading label="Loading campaigns…" />
      ) : campaigns.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {campaigns.map((c) => (
            <div key={c.id} className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                  <Megaphone className="size-3.5" /> {c.brand?.name ?? "Brand"}
                </div>
                <h3 className="mt-1 font-heading text-sm font-semibold">{c.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
                <p className="mt-2 text-xs font-medium text-foreground">{c.platform} · {formatNaira(c.budgetKobo / 100)}</p>
              </div>
              <button
                onClick={() => handleApply(c)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold shadow-sm transition-colors ${
                  canApply
                    ? "bg-[#1A24B8] text-white hover:bg-[#0A0F7A]"
                    : "border border-border bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {!canApply && <Lock className="size-3" />}
                Apply to campaign
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Empty title="No open campaigns" hint="Check back soon — brands post campaigns here." />
      )}

      {applyTo ? (
        <ApplyModal
          title={`Apply: ${applyTo.title}`}
          description="Tell the brand why you're a great fit for this campaign."
          onClose={() => setApplyTo(null)}
          onSubmit={submit}
        />
      ) : null}
    </div>
  )
}

function Loading({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function Empty({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <Inbox className="size-12 text-muted-foreground" />
      <strong className="font-heading text-lg">{title}</strong>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  )
}
