"use client"

import { useCallback, useEffect, useState } from "react"
import { Users, Wallet, ArrowRight, Loader2, Plus } from "lucide-react"
import { Link } from "@/lib/router"
import { useAuth } from "@/context/AuthContext"
import { isDemoApp } from "@/services/api"
import { fetchBrandOffers, type Offer } from "@/services/offers"
import { mockBrandDashboard } from "@/data/mockData"
import { formatNaira } from "@/utils/format"
import {
  StatTile,
  Panel,
  PanelHeading,
  ProgressDonut,
  StatusPill,
  IconTile,
} from "@/components/dashboard/widgets"

export default function BrandDashboard() {
  const { user } = useAuth()
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(!isDemoApp)

  const loadData = useCallback(async () => {
    if (!user?.brandId || isDemoApp) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const data = await fetchBrandOffers(user.brandId)
      setOffers(data)
    } catch {
      // Silently degrade
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  // Derive stats from real data
  const active = isDemoApp ? mockBrandDashboard.activeCampaigns : offers.filter((o) => ["PENDING", "ACCEPTED", "FUNDED", "SUBMITTED"].includes(o.status)).length
  const completed = isDemoApp ? mockBrandDashboard.completedCampaigns : offers.filter((o) => o.status === "COMPLETED").length
  const pending = isDemoApp ? mockBrandDashboard.pendingApprovals : offers.filter((o) => ["SUBMITTED", "APPROVED"].includes(o.status)).length
  const totalSpent = isDemoApp ? mockBrandDashboard.totalSpent : offers.filter((o) => ["FUNDED", "SUBMITTED", "APPROVED", "COMPLETED"].includes(o.status)).reduce((sum, o) => sum + o.amountKobo, 0) / 100
  const totalCampaigns = completed + active + pending || 1
  const completionPct = Math.round((completed / totalCampaigns) * 100)

  const recentOffers = isDemoApp
    ? mockBrandDashboard.recentOffers
    : offers.slice(0, 5).map((o) => ({
        id: o.id,
        creatorName: o.creator?.name ?? "Creator",
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
            Shortlist creators, send offers, and pay securely.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1A24B8] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0A0F7A]"
          >
            <Plus className="size-4 stroke-[3]" /> Find Creators
          </Link>
          <Link
            to="/offers"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-[13px] font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            All Offers
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile variant="filled" label="Active Campaigns" value={active} delta="Current campaigns" />
        <StatTile label="Total Spent" value={formatNaira(totalSpent)} delta="All-time spend" />
        <StatTile label="Pending Review" value={pending} delta="Awaiting your action" />
        <StatTile label="Completed" value={completed} delta="Successfully delivered" />
      </div>

      {/* Row 2 */}
      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-6">
          <PanelHeading
            title="Creator Collaboration"
            action={
              <Link to="/discover" className="text-[11px] font-semibold uppercase tracking-wide text-[#1A24B8] hover:underline">
                Find more
              </Link>
            }
          />
          {recentOffers.length ? (
            <div className="space-y-1">
              {recentOffers.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1A24B8] text-[12px] font-semibold text-white">
                    {o.creatorName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-foreground">{o.creatorName}</p>
                    <p className="truncate text-[11.5px] font-medium text-muted-foreground">Sponsorship offer · {formatNaira(o.amount)}</p>
                  </div>
                  <StatusPill status={o.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No offers yet. Start by finding creators in Discover.</p>
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

        {/* Budget card */}
        <div className="lg:col-span-3 flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#1A24B8]">
              <Wallet className="size-4" /> Campaign Budget
            </div>
            <div className="mt-5 font-heading text-[32px] font-semibold tracking-tight tabular-nums text-foreground">
              {formatNaira(totalSpent)}
            </div>
            <p className="mt-1 text-[11.5px] font-medium text-muted-foreground">
              {offers.length} offers sent · {completed} completed
            </p>
          </div>
          <div className="mt-6 flex gap-2.5">
            <Link
              to="/discover"
              className="flex-1 rounded-lg bg-[#1A24B8] py-2.5 text-center text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0A0F7A]"
            >
              New campaign
            </Link>
            <Link
              to="/offers"
              className="flex-1 rounded-lg border border-border bg-card py-2.5 text-center text-[12.5px] font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
            >
              All offers
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
