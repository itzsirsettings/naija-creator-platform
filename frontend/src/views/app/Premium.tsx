"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AlertTriangle, ArrowUpRight, Check, Crown, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import {
  fetchPremiumStatus,
  fetchBrandPremiumStatus,
  initiateSubscriptionPayment,
  initiateBrandSubscriptionPayment,
  verifySubscriptionPayment,
  verifyBrandSubscriptionPayment,
  fetchSubscription,
  fetchBrandSubscription,
  cancelSubscription,
  cancelBrandSubscription,
  type PremiumStatus,
  type SubscriptionInfo,
  type BillingPeriod,
} from "@/services/premium"
import { PLANS, BRAND_PLANS } from "@/lib/tiers"
import { formatNaira } from "@/utils/format"

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })

const ANNUAL_DISCOUNT = 0.15
const TIER_RANK: Record<string, number> = { NONE: 0, STANDARD: 1, POPULAR: 2, PREMIUM: 3 }

const monthlyEquiv = (monthly: number, annual: boolean): number =>
  annual ? Math.round(monthly * (1 - ANNUAL_DISCOUNT)) : monthly

const annualTotal = (monthly: number): number =>
  Math.round(monthly * 12 * (1 - ANNUAL_DISCOUNT))

export default function Premium() {
  const { user, refreshUser } = useAuth()
  const isBrand = user?.role === "brand"
  const plans = isBrand ? BRAND_PLANS : PLANS
  const [status, setStatus] = useState<PremiumStatus | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionInfo["subscription"]>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnnual, setIsAnnual] = useState(true)
  const [busyTier, setBusyTier] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const verifiedRef = useRef(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const [premium, sub] = await Promise.all([
        isBrand ? fetchBrandPremiumStatus() : fetchPremiumStatus(),
        (isBrand ? fetchBrandSubscription() : fetchSubscription()).catch(() => null),
      ])
      setStatus(premium)
      setSubscription(sub?.subscription ?? null)
    } catch {
      // zero-state - show catalogue with no active plan
    } finally {
      setIsLoading(false)
    }
  }, [isBrand])

  const handleCancel = async () => {
    if (!window.confirm("Cancel auto-renewal? You'll keep access until the end of your current billing period.")) {
      return
    }
    setIsCancelling(true)
    try {
      const fn = isBrand ? cancelBrandSubscription : cancelSubscription
      const res = await fn()
      toast.success(res.message)
      await load()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      toast.error(e?.response?.data?.error || "Could not cancel your subscription")
    } finally {
      setIsCancelling(false)
    }
  }

  useEffect(() => { load() }, [load])

  // Handle Paystack callback: ?reference=<ref>&trxref=<ref>&tier=<tier>&billing=<period>
  useEffect(() => {
    if (verifiedRef.current) return
    const params = new URLSearchParams(window.location.search)
    const reference = params.get("reference") ?? params.get("trxref")
    const tier = params.get("tier") as "STANDARD" | "POPULAR" | "PREMIUM" | null
    const billing = (params.get("billing") ?? "monthly") as BillingPeriod
    if (!reference || !tier) return
    verifiedRef.current = true
    window.history.replaceState({}, "", window.location.pathname)
    const fn = isBrand ? verifyBrandSubscriptionPayment : verifySubscriptionPayment
    fn(reference, tier, billing)
      .then(async (res) => {
        toast.success(res.message)
        await Promise.all([load(), refreshUser()])
      })
      .catch((err: unknown) => {
        const e = err as { response?: { data?: { error?: string } } }
        toast.error(e?.response?.data?.error || "Could not confirm your payment")
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBrand])

  const upgrade = async (tier: "STANDARD" | "POPULAR" | "PREMIUM") => {
    setBusyTier(tier)
    try {
      const billingPeriod: BillingPeriod = isAnnual ? "annual" : "monthly"
      const successUrl = `${window.location.origin}/app/premium?tier=${tier}&billing=${billingPeriod}`
      const fn = isBrand ? initiateBrandSubscriptionPayment : initiateSubscriptionPayment
      const res = await fn(tier, billingPeriod, successUrl)
      // Redirect to Paystack — Paystack will replace REFERENCE in the callback URL
      window.location.href = res.authorizationUrl
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      toast.error(e?.response?.data?.error || "Could not start the checkout")
      setBusyTier(null)
    }
  }

  if (user && user.role !== "creator" && user.role !== "brand") {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Subscriptions are for creators and brands.
      </div>
    )
  }

  const currentTier = status?.tier ?? "NONE"
  const active = status?.active ?? false
  const currentRank = TIER_RANK[currentTier] ?? 0

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes premium-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .premium-float { animation: premium-float 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .premium-float { animation: none; } }
      `}</style>

      {/* Page header */}
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
          <Crown className="size-6 text-amber-500" /> {isBrand ? "Brand Plans" : "Premium Plans"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isBrand
            ? "Unlock AI creator matching, performance analytics, and agency tools to get more from every campaign."
            : "Unlock tools, visibility, and trust features to win more deals and earn more revenue."}
        </p>
      </div>

      {/* Dunning banner — renewal charge failed */}
      {subscription?.status === "PAST_DUE" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-50 p-4 text-sm dark:bg-amber-950/30">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              We couldn&apos;t process your last renewal payment.
            </p>
            <p className="mt-0.5 text-amber-700/90 dark:text-amber-300/80">
              Paystack will retry automatically. To avoid losing access
              {subscription.currentPeriodEnd ? ` after ${formatDate(subscription.currentPeriodEnd)}` : ""},
              make sure your card has sufficient funds or re-subscribe below.
            </p>
          </div>
        </div>
      )}

      {/* Active plan banner */}
      {active && (
        <div className="flex flex-col gap-3 rounded-xl border border-[#1A24B8]/30 bg-[#1A24B8]/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span>
            <span className="font-semibold text-[#1A24B8]">
              You&apos;re on the{" "}
              {currentTier.charAt(0) + currentTier.slice(1).toLowerCase()} plan.
            </span>
            {status?.until && (
              <span className="ml-2 text-muted-foreground">
                {subscription?.cancelAtPeriodEnd ? "Access until" : "Renews"}{" "}
                {formatDate(status.until)}
                {subscription && !subscription.cancelAtPeriodEnd && subscription.hasPaymentMethod
                  ? " (auto-renews)"
                  : "."}
              </span>
            )}
          </span>
          <div className="flex shrink-0 items-center gap-3">
            {subscription?.cancelAtPeriodEnd ? (
              <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Cancels at period end
              </span>
            ) : (
              <span className="rounded-full bg-[#1A24B8] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                Active
              </span>
            )}
            {subscription?.hasPaymentMethod && !subscription.cancelAtPeriodEnd && (
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive disabled:opacity-60"
              >
                {isCancelling ? "Cancelling…" : "Cancel auto-renewal"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Outcome stat chips */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {(isBrand
          ? [
              { icon: "🎯", text: "AI matching fills campaigns 3× faster" },
              { icon: "📊", text: "Track ROAS on every deal" },
              { icon: "🏢", text: "Run multiple brands from one login" },
            ]
          : [
              { icon: "📈", text: "Popular creators win 3× more campaigns" },
              { icon: "⚡", text: "48% faster payouts" },
              { icon: "💰", text: "₦12M+ in total creator payouts" },
            ]
        ).map((s) => (
          <span key={s.text} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-4 py-2 text-xs font-medium">
            <span>{s.icon}</span> {s.text}
          </span>
        ))}
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3 rounded-full border border-border bg-muted/30 p-1.5">
          <button
            onClick={() => setIsAnnual(false)}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
              !isAnnual
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-all ${
              isAnnual
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Annually
            <span className="rounded-full bg-[#0098f2]/20 px-2 py-0.5 text-[9px] font-bold text-[#0098f2]">
              Save 15%
            </span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading plans…</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3 items-stretch">
          {plans.map((plan) => {
            const perMonth = monthlyEquiv(plan.monthlyPriceNaira, isAnnual)
            const yearly = annualTotal(plan.monthlyPriceNaira)
            const isCurrent = currentTier === plan.tier && active
            const planRank = TIER_RANK[plan.tier] ?? 0
            const isDowngrade = active && planRank < currentRank
            const isBusy = busyTier === plan.tier

            const ctaLabel = isCurrent
              ? "Current Plan"
              : isBusy
              ? "Activating…"
              : isDowngrade
              ? "Downgrade"
              : active && planRank > currentRank
              ? `Upgrade to ${plan.name}`
              : plan.cta

            if (plan.featured) {
              return (
                <div
                  key={plan.tier}
                  className="premium-float relative flex flex-col justify-between rounded-2xl p-8 text-white z-10"
                  style={{
                    background: "linear-gradient(135deg, #0F172A, #1E293B)",
                    border: "2px solid #8B5CF6",
                    boxShadow:
                      "0 0 20px rgba(139,92,246,0.5), 0 0 40px rgba(139,92,246,0.4), 0 0 80px rgba(139,92,246,0.3)",
                  }}
                >
                  {/* Badge */}
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg"
                    style={{ background: "linear-gradient(135deg, #EC4899, #8B5CF6)" }}
                  >
                    🔥 Most Popular
                  </div>

                  <div>
                    <div className="border-b border-white/10 pb-6 text-center">
                      <h3 className="font-heading text-[18px] font-semibold text-white">{plan.name}</h3>
                      <div className="mt-4 flex items-baseline justify-center">
                        <span className="font-heading text-[40px] font-bold tabular-nums text-white">
                          {formatNaira(perMonth)}
                        </span>
                        <span className="ml-1 text-sm font-medium text-purple-200">/month</span>
                      </div>
                      <div className="mt-1 h-4 text-[11px] text-purple-200/80">
                        {isAnnual ? `Billed ${formatNaira(yearly)} yearly` : ""}
                      </div>
                      <p className="mt-3 min-h-[40px] text-sm leading-relaxed text-slate-300">
                        {plan.description}
                      </p>
                    </div>
                    <ul className="mt-8 space-y-4">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-sm text-slate-200">
                          <Check className="mt-0.5 size-4 shrink-0 text-[#8B5CF6]" />
                          <span className="leading-tight">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-6">
                    <button
                      onClick={() => !isCurrent && !isDowngrade && upgrade(plan.tier)}
                      disabled={isCurrent || isDowngrade || isBusy}
                      className="flex w-full items-center justify-center rounded-full py-3 text-[13px] font-semibold text-white transition-all hover:scale-[1.04] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                      style={{
                        background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                        boxShadow: "0 0 15px rgba(236,72,153,0.5), 0 0 35px rgba(139,92,246,0.5)",
                      }}
                    >
                      {ctaLabel}
                      {!isCurrent && !isDowngrade && <ArrowUpRight className="ml-2 size-4" />}
                    </button>
                  </div>
                </div>
              )
            }

            // Standard and Premium cards
            const isAmber = plan.tier === "PREMIUM"
            return (
              <div
                key={plan.tier}
                className={`flex flex-col justify-between rounded-2xl border bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
                  isCurrent
                    ? "ring-2 ring-[#1A24B8] border-[#1A24B8]/40"
                    : isAmber
                    ? "border-amber-500/40"
                    : "border-border"
                }`}
              >
                <div>
                  <div className="border-b border-border pb-6 text-center">
                    <h3 className="font-heading text-[18px] font-semibold">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline justify-center">
                      <span className="font-heading text-[40px] font-bold tabular-nums">
                        {formatNaira(perMonth)}
                      </span>
                      <span className="ml-1 text-sm font-medium text-muted-foreground">/month</span>
                    </div>
                    <div className="mt-1 h-4 text-[11px] text-muted-foreground">
                      {isAnnual ? `Billed ${formatNaira(yearly)} yearly` : ""}
                    </div>
                    <p className="mt-3 min-h-[40px] text-sm leading-relaxed text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <Check
                          className={`mt-0.5 size-4 shrink-0 ${
                            isAmber ? "text-amber-500" : "text-[#0098f2]"
                          }`}
                        />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8 border-t border-border pt-6">
                  <button
                    onClick={() => !isCurrent && !isDowngrade && upgrade(plan.tier)}
                    disabled={isCurrent || isDowngrade || isBusy}
                    className={`flex w-full items-center justify-center rounded-full border py-3 text-[13px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
                      isAmber
                        ? "border-amber-500/60 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                        : "border-border bg-foreground text-background hover:opacity-90"
                    }`}
                  >
                    {ctaLabel}
                    {!isCurrent && !isDowngrade && <ArrowUpRight className="ml-2 size-4" />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Prices in Nigerian Naira (₦).{" "}
        {isAnnual
          ? "Annual plans are billed yearly at a 15% discount."
          : "Switch to annual billing to save 15%."}{" "}
        Subscriptions renew automatically via Paystack — cancel anytime; access continues until the end of your billing period.
      </p>
    </div>
  )
}
