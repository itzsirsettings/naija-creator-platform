"use client"

import { useCallback, useEffect, useState } from "react"
import { Building2, Crown, Globe, Loader2, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Link } from "@/lib/router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { useBrandPremium } from "@/hooks/useBrandPremium"
import {
  fetchManagedBrands, createManagedBrand, deleteManagedBrand, type ManagedBrand,
} from "@/services/managedBrands"
import { initials } from "@/utils/format"

export default function Agency() {
  const { user } = useAuth()
  const ent = useBrandPremium()
  const [brands, setBrands] = useState<ManagedBrand[]>([])
  const [seats, setSeats] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", industry: "", website: "" })
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!ent.agencyWorkspace) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const data = await fetchManagedBrands()
      setBrands(data.brands)
      setSeats(data.seats)
    } catch { /* zero-state */ } finally { setIsLoading(false) }
  }, [ent.agencyWorkspace])

  useEffect(() => { load() }, [load])

  const add = async () => {
    if (!form.name.trim() || !form.industry.trim()) { toast.error("Name and industry are required"); return }
    setBusy(true)
    try {
      const brand = await createManagedBrand({
        name: form.name,
        industry: form.industry,
        website: form.website.trim() || undefined,
      })
      setBrands((prev) => [brand, ...prev])
      setForm({ name: "", industry: "", website: "" })
      setShowForm(false)
      toast.success("Brand profile added")
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not add brand")
    } finally { setBusy(false) }
  }

  const remove = async (id: string) => {
    try {
      await deleteManagedBrand(id)
      setBrands((prev) => prev.filter((b) => b.id !== id))
      toast("Brand profile removed")
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not remove brand")
    }
  }

  if (user && user.role !== "brand") {
    return <div className="py-16 text-center text-sm text-muted-foreground">The agency workspace is for brands.</div>
  }

  if (!ent.agencyWorkspace) {
    return (
      <div className="space-y-6">
        <Header />
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10">
            <Crown className="size-6 text-amber-500" />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold">Multi-Brand Agency Workspace</p>
            <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
              Manage multiple brand profiles from one login. Available on the Scale plan.
            </p>
          </div>
          <Link to="/app/premium" className="rounded-lg border border-amber-500/60 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50">
            Upgrade to Scale
          </Link>
        </div>
      </div>
    )
  }

  const atLimit = brands.length >= seats

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Header />
        <Button size="sm" onClick={() => setShowForm((s) => !s)} disabled={atLimit}>
          <Plus className="mr-1 size-4" /> Add brand
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        {brands.length} of {seats} brand profiles used{atLimit ? " (limit reached)" : ""}
      </div>

      {showForm ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold">Add brand profile</h3>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input placeholder="Brand name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            <Input placeholder="Website (optional)" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
          <Button onClick={add} disabled={busy}>{busy ? "Adding…" : "Add brand"}</Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading brands…</p>
        </div>
      ) : brands.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <div key={b.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#0A0A9F]/10 text-xs font-bold text-[#0A0A9F]">
                  {initials(b.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{b.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{b.industry}</p>
                  {b.website ? (
                    <a href={b.website} target="_blank" rel="noreferrer" className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-[#5E5AA8] hover:underline">
                      <Globe className="size-2.5" /> Website
                    </a>
                  ) : null}
                </div>
              </div>
              <button onClick={() => remove(b.id)} className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"><Trash2 className="size-3.5" /></button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <Building2 className="size-10 text-muted-foreground" />
          <strong className="font-heading text-sm">No brand profiles yet</strong>
          <p className="max-w-sm text-xs text-muted-foreground">Add the brands your agency manages to organize campaigns under each one.</p>
        </div>
      )}
    </div>
  )
}

function Header() {
  return (
    <div>
      <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
        <Building2 className="size-6 text-[#0A0A9F]" /> Agency Workspace
      </h1>
      <p className="text-muted-foreground">Manage every brand your agency runs from one account.</p>
    </div>
  )
}
