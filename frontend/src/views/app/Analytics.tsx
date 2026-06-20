"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { TrendingUp, BarChart3, CheckCircle2, DollarSign, Handshake, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import StatCard from "@/components/StatCard"
import { useAuth } from "@/context/AuthContext"
import { isDemoApp } from "@/services/api"
import { fetchBrandOffers, fetchCreatorOffers, type Offer } from "@/services/offers"
import { fetchTransactions, type Transaction } from "@/services/payments"
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
  const isBrand = user?.role === "brand"

  const [offers, setOffers] = useState<Offer[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(!isDemoApp)

  const loadData = useCallback(async () => {
    if (isDemoApp || !user) {
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

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
    </div>
  )
}
