"use client"

import { useCallback, useEffect, useState } from "react"
import { BarChart3, Copy, Crown, Link2, Loader2, Lock, MousePointerClick, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { Link } from "@/lib/router"
import { useAuth } from "@/context/AuthContext"
import { usePremium } from "@/hooks/usePremium"
import { fetchAffiliateOffers, type Offer } from "@/services/offers"
import { fetchAttribution, trackAffiliateEvent, type Attribution } from "@/services/affiliate"
import { formatNaira } from "@/utils/format"

export default function Affiliate() {
  const { user } = useAuth()
  const ent = usePremium()
  const [offers, setOffers] = useState<Offer[]>([])
  const [attribution, setAttribution] = useState<Attribution | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    if (!ent.affiliateDeals) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [offerData] = await Promise.all([fetchAffiliateOffers()])
      setOffers(offerData)
      if (ent.salesAttribution) {
        try { setAttribution(await fetchAttribution()) } catch { /* zero-state */ }
      }
    } catch {
      // zero-state
    } finally {
      setIsLoading(false)
    }
  }, [ent.affiliateDeals, ent.salesAttribution])

  useEffect(() => { load() }, [load])

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code)
    toast.success(`Copied ${code}`)
    trackAffiliateEvent(code, "CLICK").catch(() => { /* fire-and-forget */ })
  }

  if (user && user.role !== "creator") {
    return <div className="py-16 text-center text-sm text-muted-foreground">Affiliate deals are for creators.</div>
  }

  // Locked: needs Popular+
  if (!ent.affiliateDeals) {
    return (
      <div className="space-y-6">
        <Header />
        <LockedCard
          title="Affiliate & Commission Deals"
          body="Earn commission on the sales you drive. Upgrade to Popular to receive affiliate deals with unique tracking codes."
          cta="Upgrade to Popular"
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2 py-24 text-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading affiliate deals…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Header />

      {/* Premium: attribution summary */}
      {ent.salesAttribution ? (
        <div className="grid gap-4 sm:grid-cols-4">
          <SummaryCard label="Clicks" value={String(attribution?.summary.clicks ?? 0)} icon={MousePointerClick} />
          <SummaryCard label="Conversions" value={String(attribution?.summary.conversions ?? 0)} icon={TrendingUp} />
          <SummaryCard label="Attributed revenue" value={formatNaira((attribution?.summary.attributedKobo ?? 0) / 100)} icon={BarChart3} />
          <SummaryCard label="Conversion rate" value={`${attribution?.summary.conversionRate ?? 0}%`} icon={TrendingUp} />
        </div>
      ) : (
        <LockedInline
          title="Sales Attribution Analytics"
          body="See clicks, conversions, and attributed revenue per code. Available on Premium."
        />
      )}

      {/* Affiliate deals + codes */}
      {offers.length ? (
        <div className="space-y-3">
          {offers.map((o) => (
            <div key={o.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                    <Link2 className="size-3.5 text-[#8B5CF6]" /> {o.brand?.name ?? "Brand"}
                  </div>
                  <h3 className="mt-1 font-heading text-sm font-semibold">{o.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {o.commissionRate ?? 0}% commission · {formatNaira(o.amountKobo / 100)} base
                  </p>
                </div>
                {o.affiliateCode ? (
                  <button
                    onClick={() => copyCode(o.affiliateCode!)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#8B5CF6]/50 px-3 py-1.5 font-mono text-xs font-semibold text-[#8B5CF6] transition-colors hover:bg-[#8B5CF6]/10"
                  >
                    {o.affiliateCode} <Copy className="size-3" />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <Link2 className="size-10 text-muted-foreground" />
          <strong className="font-heading text-sm">No affiliate deals yet</strong>
          <p className="max-w-sm text-xs text-muted-foreground">
            When a brand sends you an affiliate offer, your unique tracking code and commission terms appear here.
          </p>
        </div>
      )}
    </div>
  )
}

function Header() {
  return (
    <div>
      <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
        <Link2 className="size-6 text-[#8B5CF6]" /> Affiliate Deals
      </h1>
      <p className="text-muted-foreground">Track your commission-based partnerships and the sales they drive.</p>
    </div>
  )
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof BarChart3 }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 font-heading text-xl font-bold tabular-nums">{value}</p>
    </div>
  )
}

function LockedInline({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-amber-400/50 bg-amber-50 p-4 dark:bg-amber-950/20">
      <div className="flex items-start gap-3">
        <Lock className="mt-0.5 size-5 shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{title}</p>
          <p className="text-xs text-amber-700 dark:text-amber-400">{body}</p>
        </div>
      </div>
      <Link to="/app/premium" className="shrink-0 rounded-lg border border-amber-500/60 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100">
        Upgrade to Premium
      </Link>
    </div>
  )
}

function LockedCard({ title, body, cta }: { title: string; body: string; cta: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-[#0A0A9F]/10">
        <Crown className="size-6 text-[#0A0A9F]" />
      </div>
      <div>
        <p className="font-heading text-sm font-semibold">{title}</p>
        <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">{body}</p>
      </div>
      <Link to="/app/premium" className="rounded-lg bg-[#0A0A9F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5E5AA8]">
        {cta}
      </Link>
    </div>
  )
}
