"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Crown, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { fetchPremiumStatus, requestUpgrade, type PremiumStatus } from "@/services/premium"
import { formatNaira } from "@/utils/format"

const ACCENT: Record<string, string> = {
  STANDARD: "border-border",
  POPULAR: "border-[#1A24B8] ring-1 ring-[#1A24B8]",
  PREMIUM: "border-amber-500/60",
}

export default function Premium() {
  const { user } = useAuth()
  const [status, setStatus] = useState<PremiumStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [busyTier, setBusyTier] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      setStatus(await fetchPremiumStatus())
    } catch {
      // ignore — show catalogue with no active status
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const upgrade = async (tier: "STANDARD" | "POPULAR" | "PREMIUM") => {
    setBusyTier(tier)
    try {
      const res = await requestUpgrade(tier)
      toast(res.message)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not start the upgrade")
    } finally {
      setBusyTier(null)
    }
  }

  if (user && user.role !== "creator") {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Premium subscriptions are for creators.
      </div>
    )
  }

  const currentTier = status?.tier ?? "NONE"
  const active = status?.active ?? false
  const tiers = status?.tiers ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
          <Crown className="size-6 text-amber-500" /> Premium
        </h1>
        <p className="text-muted-foreground">
          Unlock the ability to apply to brands and campaigns directly.
        </p>
      </div>

      {active ? (
        <div className="rounded-xl border border-[#1A24B8]/30 bg-[#1A24B8]/5 p-4 text-sm">
          <span className="font-semibold text-[#1A24B8]">You're on {currentTier.toLowerCase()}.</span>{" "}
          {status?.until ? (
            <span className="text-muted-foreground">
              Active until {new Date(status.until).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}.
            </span>
          ) : null}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading plans…</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {tiers.map((t) => {
            const isCurrent = currentTier === t.tier && active
            return (
              <div key={t.tier} className={`flex flex-col rounded-2xl border bg-card p-5 shadow-sm ${ACCENT[t.tier] ?? "border-border"}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-semibold">{t.name}</h3>
                  {t.tier === "POPULAR" ? (
                    <span className="rounded-full bg-[#1A24B8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Popular</span>
                  ) : null}
                </div>
                <div className="mt-3 font-heading text-3xl font-bold tabular-nums">
                  {formatNaira(t.priceNaira)}
                  <span className="text-sm font-medium text-muted-foreground"> /mo</span>
                </div>
                <ul className="mt-4 flex-1 space-y-2 text-sm">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-[#1A24B8]" /> <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => upgrade(t.tier)}
                  disabled={isCurrent || busyTier === t.tier}
                  className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1A24B8] py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0A0F7A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCurrent ? "Current plan" : busyTier === t.tier ? "Processing…" : `Upgrade to ${t.name}`}
                </button>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Card payments are coming soon. Your selection is recorded and our team will activate your plan.
      </p>
    </div>
  )
}
