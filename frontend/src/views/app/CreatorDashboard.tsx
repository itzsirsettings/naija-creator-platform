"use client"

import { useCallback, useEffect, useState } from "react"
import { Building2, Wallet, ArrowRight, CalendarClock, Loader2, Plus } from "lucide-react"
import { Link } from "@/lib/router"
import { useAuth } from "@/context/AuthContext"
import { isDemoApp } from "@/services/api"
import { fetchCreatorOffers, type Offer } from "@/services/offers"
import { fetchTransactions, type Transaction } from "@/services/payments"
import { mockCreatorDashboard } from "@/data/mockData"
import { formatNaira, formatCompactNumber } from "@/utils/format"
import {
  StatTile,
  Panel,
  PanelHeading,
  ProgressDonut,
  StatusPill,
  IconTile,
} from "@/components/dashboard/widgets"

export default function CreatorDashboard() {
  const { user } = useAuth()
  const [offers, setOffers] = useState<Offer[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(!isDemoApp)

  const loadData = useCallback(async () => {
    if (!user?.creatorId || isDemoApp) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const [offerData, txData] = await Promise.all([
        fetchCreatorOffers(user.creatorId),
        fetchTransactions(user.creatorId),
      ])
      setOffers(offerData)
      setTransactions(txData)
    } catch {
      // Silently degrade — dashboard shows zeros
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  // Derive stats from real data
  const active = isDemoApp ? mockCreatorDashboard.activeOffers : offers.filter((o) => ["ACCEPTED", "FUNDED", "SUBMITTED"].includes(o.status)).length
  const completed = isDemoApp ? mockCreatorDashboard.completedCampaigns : offers.filter((o) => o.status === "COMPLETED").length
  const pending = isDemoApp ? mockCreatorDashboard.pendingApprovals : offers.filter((o) => o.status === "PENDING").length
  const earnings = isDemoApp ? mockCreatorDashboard.earnings : transactions.filter((tx) => tx.status === "paid").reduce((sum, tx) => sum + tx.netKobo, 0) / 100
  const totalCampaigns = completed + active + pending || 1
  const completionPct = Math.round((completed / totalCampaigns) * 100)

  const recentOffers = isDemoApp
    ? mockCreatorDashboard.recentPayments
    : offers.slice(0, 5).map((o) => ({
        id: o.id,
        brandName: o.brand?.name ?? "Brand",
        amount: o.amountKobo / 100,
        status: o.status,
        date: new Date(o.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" }),
      }))

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2 py-24 text-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="text-foreground">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Track your offers, earnings, and campaign performance.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/offers"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1A24B8] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0A0F7A]"
          >
            <Plus className="size-4 stroke-[3]" /> View Offers
          </Link>
          <Link
            to="/payments"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-[13px] font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            Payments
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile variant="filled" label="Active Offers" value={active} delta="Current active campaigns" />
        <StatTile label="Earnings" value={formatNaira(earnings)} delta="Total earned" />
        <StatTile label="Pending" value={pending} delta="Awaiting your review" />
        <StatTile label="Completed" value={completed} delta="Successfully delivered" />
      </div>

      {/* Row 2 */}
      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-6">
          <PanelHeading
            title="Brand Collaboration"
            action={
              <Link to="/offers" className="text-[11px] font-semibold uppercase tracking-wide text-[#1A24B8] hover:underline">
                View all
              </Link>
            }
          />
          {recentOffers.length ? (
            <div className="space-y-1">
              {recentOffers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1A24B8] text-[12px] font-semibold text-white">
                    {p.brandName.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-foreground">{p.brandName}</p>
                    <p className="truncate text-[11.5px] font-medium text-muted-foreground">Campaign · {formatNaira(p.amount)}</p>
                  </div>
                  <StatusPill status={p.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No offers yet. Brands will discover you in Discover.</p>
          )}
        </Panel>

        <Panel className="lg:col-span-3">
          <PanelHeading title="Campaign Progress" />
          <ProgressDonut
            centerValue={`${completionPct}%`}
            centerLabel="Completed"
            segments={[
              { label: "Completed", value: completed, color: "#1A24B8" },
              { label: "Active", value: active, color: "#0A0F7A" },
              { label: "Pending", value: pending, color: "#C8CCE6" },
            ]}
          />
        </Panel>

        {/* Wallet */}
        <div className="lg:col-span-3 flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#1A24B8]">
              <Wallet className="size-4" /> Wallet Balance
            </div>
            <div className="mt-5 font-heading text-[32px] font-semibold tracking-tight tabular-nums text-foreground">
              {formatNaira(user?.walletBalance ?? 0)}
            </div>
            {(user?.walletHeld ?? 0) > 0 && (
              <p className="mt-1 text-[11.5px] font-medium text-amber-600">
                {formatNaira(user?.walletHeld ?? 0)} held in escrow
              </p>
            )}
          </div>
          <div className="mt-6 flex gap-2.5">
            <Link
              to="/payments"
              className="flex-1 rounded-lg bg-[#1A24B8] py-2.5 text-center text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0A0F7A]"
            >
              Withdraw
            </Link>
            <Link
              to="/payments"
              className="flex-1 rounded-lg border border-border bg-card py-2.5 text-center text-[12.5px] font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
            >
              History
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
