"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { TrendingUp, BarChart3, CheckCircle2, Crown, DollarSign, Handshake, Lock, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import StatCard from "@/components/StatCard"
import { Link } from "@/lib/router"
import { useAuth } from "@/context/AuthContext"
import { usePremium } from "@/hooks/usePremium"
import { useBrandPremium } from "@/hooks/useBrandPremium"
import { fetchBrandOffers, fetchCreatorOffers, type Offer } from "@/services/offers"
import { fetchTransactions, type Transaction } from "@/services/payments"
import { fetchBrandPerformance, type BrandPerformance } from "@/services/campaigns"
import { formatNaira } from "@/utils/format"

const STATUS_ORDER = ["PENDING", "ACCEPTED", "FUNDED", "SUBMITTED", "APPROVED", "COMPLETED", "REJECTED", "REFUNDED", "DISPUTED"]
const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-500",
  ACCEPTED: "bg-blue-500",
  FUNDED: "bg-indigo-500",
  SUBMITTED: "bg-violet-500",
  APPROVED: "bg-teal-500",
  COMPLETED: "bg-emerald-600",
  REJECTED: "bg-rose-500",
  REFUNDED: "bg-slate-500",
  DISPUTED: "bg-red-600",
}

export default function Analytics() {
  const { user } = useAuth()
  const ent = usePremium()
  const brandEnt = useBrandPremium()
  const isBrand = user?.role === "brand"

  const [offers, setOffers] = useState<Offer[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [performance, setPerformance] = useState<BrandPerformance | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      if (isBrand && user.brandId) {
        setOffers(await fetchBrandOffers(user.brandId))
      } else if (!isBrand && user.creatorId) {
        const [offerData, txData] = await Promise.all([
          fetchCreatorOffers(user.creatorId),
          fetchTransactions(user.creatorId),
        ])
        setOffers(offerData)
        setTransactions(txData)
      }
    } catch {
      // Degrade to zero-state.
    } finally {
      setIsLoading(false)
    }
  }, [user, isBrand])

  useEffect(() => { loadData() }, [loadData])

  // Brand (Scale): campaign performance analytics.
  useEffect(() => {
    if (!isBrand || !brandEnt.campaignPerformance) return
    fetchBrandPerformance().then(setPerformance).catch(() => { /* zero-state */ })
  }, [isBrand, brandEnt.campaignPerformance])

  const metrics = useMemo(() => {
    const completed = offers.filter((o) => o.status === "COMPLETED")
    const active = offers.filter((o) => ["ACCEPTED", "FUNDED", "SUBMITTED", "APPROVED"].includes(o.status))
    const completedValue = completed.reduce((s, o) => s + o.amountKobo, 0) / 100
    const earned = transactions
      .filter((tx) => tx.status === "paid" || tx.status === "completed")
      .reduce((s, tx) => s + tx.netKobo, 0) / 100
    const revenue = isBrand ? completedValue : earned
    const dealCount = isBrand ? offers.length : completed.length + active.length
    const avgDeal = dealCount ? revenue / Math.max(completed.length, 1) : 0
    const completionRate = offers.length ? Math.round((completed.length / offers.length) * 100) : 0

    const byStatus = STATUS_ORDER
      .map((status) => ({ status, count: offers.filter((o) => o.status === status).length }))
      .filter((s) => s.count > 0)
    const maxStatus = Math.max(...byStatus.map((s) => s.count), 1)

    return { completed, active, revenue, avgDeal, completionRate, byStatus, maxStatus }
  }, [offers, transactions, isBrand])

  const overviewStats = isBrand
    ? [
        { label: "Total Spend", value: formatNaira(metrics.revenue), icon: DollarSign },
        { label: "Active Campaigns", value: metrics.active.length, icon: Handshake },
        { label: "Completed", value: metrics.completed.length, icon: CheckCircle2 },
        { label: "Completion Rate", value: `${metrics.completionRate}%`, icon: TrendingUp },
      ]
    : [
        { label: "Total Earned", value: formatNaira(metrics.revenue), icon: DollarSign },
        { label: "Active Offers", value: metrics.active.length, icon: Handshake },
        { label: "Completed", value: metrics.completed.length, icon: CheckCircle2 },
        { label: "Completion Rate", value: `${metrics.completionRate}%`, icon: TrendingUp },
      ]

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2 py-24 text-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading analytics…</p>
      </div>
    )
  }

  const hasData = offers.length > 0 || transactions.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          {isBrand ? "Your campaign spend and offer performance." : "Your earnings and collaboration performance."}
        </p>
      </div>

      {/* Upgrade prompt for creators without any active premium plan */}
      {!isBrand && !ent.active && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm dark:border-amber-700/40 dark:bg-amber-950/20">
          <Crown className="mt-0.5 size-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">Analytics Dashboard requires a Standard plan or higher</p>
            <p className="mt-0.5 text-amber-700 dark:text-amber-400">Upgrade to access your earnings, offer performance, and campaign analytics.</p>
            <Link to="/app/premium" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-900 underline dark:text-amber-300">
              View plans
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      {/* Brand (Scale): campaign performance analytics */}
      {isBrand && brandEnt.campaignPerformance && performance ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Campaign Performance</CardTitle>
            <CardDescription>Spend, deliverables, and your offer-to-completion funnel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Total spend", value: formatNaira(performance.totalSpendKobo / 100) },
                { label: "In escrow", value: formatNaira(performance.inEscrowKobo / 100) },
                { label: "Deliverables", value: String(performance.deliverablesSubmitted) },
                { label: "Approval rate", value: `${performance.approvalRate}%` },
              ].map((m) => (
                <div key={m.label} className="rounded-lg border border-border bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="mt-1 font-heading text-lg font-semibold tabular-nums">{m.value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {([
                { label: "Offers sent", value: performance.funnel.sent },
                { label: "Funded", value: performance.funnel.funded },
                { label: "Completed", value: performance.funnel.completed },
              ]).map((step) => {
                const pct = performance.funnel.sent ? Math.round((step.value / performance.funnel.sent) * 100) : 0
                return (
                  <div key={step.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{step.label}</span>
                      <span className="text-muted-foreground tabular-nums">{step.value}</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted">
                      <div className="h-full rounded-full bg-[#0A0A9F]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {performance.campaigns.total} campaign{performance.campaigns.total === 1 ? "" : "s"} · {performance.campaigns.totalApplications} application{performance.campaigns.totalApplications === 1 ? "" : "s"} received
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Brand: locked performance prompt for non-Scale plans */}
      {isBrand && !brandEnt.campaignPerformance ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10">
              <Lock className="size-6 text-amber-500" />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold">Campaign Performance & ROAS Analytics</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                See spend, deliverables, approval rates, and your offer funnel. Available on the Scale plan.
              </p>
            </div>
            <Link to="/app/premium" className="rounded-lg border border-amber-500/60 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50">
              Upgrade to Scale
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {!hasData ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <BarChart3 className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No analytics yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {isBrand
                ? "Once you fund campaigns, your spend and performance will appear here."
                : "Once you complete offers, your earnings and performance will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Offer Status</CardTitle>
              <CardDescription>Distribution of your {offers.length} offer{offers.length === 1 ? "" : "s"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {metrics.byStatus.length ? metrics.byStatus.map((s) => (
                <div key={s.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{s.status.toLowerCase()}</span>
                    <span className="text-muted-foreground tabular-nums">{s.count}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${STATUS_COLOR[s.status] ?? "bg-slate-400"}`}
                      style={{ width: `${(s.count / metrics.maxStatus) * 100}%` }}
                    />
                  </div>
                </div>
              )) : (
                <p className="py-6 text-center text-sm text-muted-foreground">No offers to break down yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Performance</CardTitle>
              <CardDescription>{isBrand ? "Spend efficiency" : "Earnings summary"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion rate</span>
                  <span className="font-medium tabular-nums">{metrics.completionRate}%</span>
                </div>
                <Progress value={metrics.completionRate} className="mt-2 h-2 [&>div]:bg-teal-500" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="rounded-lg border border-border bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Avg. completed deal</p>
                  <p className="mt-1 font-heading text-lg font-semibold tabular-nums">{formatNaira(metrics.avgDeal)}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">{isBrand ? "Total spent" : "Total earned"}</p>
                  <p className="mt-1 font-heading text-lg font-semibold tabular-nums">{formatNaira(metrics.revenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Locked Advanced Analytics for non-Popular creators */}
      {!isBrand && ent.active && ent.analyticsLevel === "basic" && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#0A0A9F]/10">
              <Lock className="size-6 text-[#0A0A9F]" />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold">Advanced Analytics</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Proposal win rates, creator performance reports, and campaign ROI breakdowns. Available on the Popular plan.
              </p>
            </div>
            <Link
              to="/app/premium"
              className="mt-1 inline-flex items-center gap-1 rounded-lg bg-[#0A0A9F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5E5AA8] transition-colors"
            >
              Upgrade to Popular
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Locked Enterprise Analytics for non-Premium creators */}
      {!isBrand && ent.active && ent.analyticsLevel === "advanced" && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10">
              <Lock className="size-6 text-amber-500" />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold">Enterprise Analytics</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                White-label reports, multi-campaign aggregates, and strategic growth insights. Available on the Premium plan.
              </p>
            </div>
            <Link
              to="/app/premium"
              className="mt-1 inline-flex items-center gap-1 rounded-lg border border-amber-500/60 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
            >
              Upgrade to Premium
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
