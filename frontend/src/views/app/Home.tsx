"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowRight, ArrowUpRight, BarChart3, Handshake, Loader2, Search, Sparkles, Wallet } from "lucide-react"
import { Link } from "@/lib/router"
import { useAuth } from "@/context/AuthContext"
import { fetchBrandOffers, fetchCreatorOffers, type Offer } from "@/services/offers"
import { fetchTransactions, type Transaction } from "@/services/payments"
import { formatNaira } from "@/utils/format"
import { StatTile, StatusPill } from "@/components/dashboard/widgets"

function timeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

const ACTIVE_STATUSES = ["ACCEPTED", "FUNDED", "SUBMITTED", "APPROVED"]

interface QuickAction {
  label: string
  desc: string
  to: string
  icon: typeof Search
}

interface ActivityItem {
  id: string
  label: string
  detail: string
  status: string
  date: string
}

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { month: "short", day: "numeric" })

export default function Home() {
  const { user } = useAuth()

  const [offers, setOffers] = useState<Offer[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const isBrand = user?.role === "brand"

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
      // Degrade gracefully to zero-state rather than crashing the home screen.
    } finally {
      setIsLoading(false)
    }
  }, [user, isBrand])

  useEffect(() => { loadData() }, [loadData])

  if (!user) return null

  const name = isBrand ? user.brandName || user.name : user.name

  // ─── Derived, real stats ──────────────────────────────────────────────────
  const activeCount = offers.filter((o) => ACTIVE_STATUSES.includes(o.status)).length
  const completedCount = offers.filter((o) => o.status === "COMPLETED").length
  const pendingApprovals = offers.filter((o) => o.status === "SUBMITTED").length
  const pendingCreator = offers.filter((o) => o.status === "PENDING").length
  const totalSpent = offers
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.amountKobo, 0) / 100
  const earnings = transactions
    .filter((tx) => tx.status === "paid" || tx.status === "completed")
    .reduce((sum, tx) => sum + tx.netKobo, 0) / 100

  const stats = isBrand
    ? [
        { label: "Active Campaigns", value: activeCount, delta: "Across all creators" },
        { label: "Total Spent", value: formatNaira(totalSpent), delta: "Lifetime" },
        { label: "Pending Approvals", value: pendingApprovals, delta: "Awaiting your review" },
        { label: "Total Offers", value: offers.length, delta: "Sent to creators" },
      ]
    : [
        { label: "Active Offers", value: activeCount, delta: "In progress" },
        { label: "Earnings", value: formatNaira(earnings), delta: "Lifetime" },
        { label: "Pending Approvals", value: pendingCreator, delta: "Awaiting review" },
        { label: "Completed", value: completedCount, delta: "Campaigns done" },
      ]

  const quickActions: QuickAction[] = isBrand
    ? [
        { label: "Discover creators", desc: "Find your next match", to: "/discover", icon: Search },
        { label: "Review offers", desc: "Manage active briefs", to: "/offers", icon: Handshake },
        { label: "Payments", desc: "Fund & track payouts", to: "/payments", icon: Wallet },
        { label: "Analytics", desc: "Campaign performance", to: "/analytics", icon: BarChart3 },
      ]
    : [
        { label: "Browse offers", desc: "Accept new briefs", to: "/offers", icon: Handshake },
        { label: "Discover brands", desc: "See who's hiring", to: "/discover", icon: Search },
        { label: "Payments", desc: "Withdraw earnings", to: "/payments", icon: Wallet },
        { label: "Analytics", desc: "Your performance", to: "/analytics", icon: BarChart3 },
      ]

  const primary = isBrand
    ? { label: "Find creators", to: "/discover" }
    : { label: "Browse offers", to: "/offers" }

  // ─── Real recent activity ─────────────────────────────────────────────────
  const recent: ActivityItem[] = isBrand
    ? offers.slice(0, 5).map((o) => ({
        id: o.id,
        label: o.title,
        detail: `${o.creator?.name ?? "Creator"} · ${formatNaira(o.amountKobo / 100)}`,
        status: o.status,
        date: shortDate(o.createdAt),
      }))
    : transactions.slice(0, 5).map((tx) => ({
        id: tx.id,
        label: "Campaign payment",
        detail: `${tx.offer?.brand?.name ?? "Brand"} · +${formatNaira(tx.netKobo / 100)}`,
        status: tx.status,
        date: shortDate(tx.createdAt),
      }))

  return (
    <div className="space-y-6">
      {/* Hero - the single bold, premium moment of the app */}
      <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0A0A9F,#5E5AA8)] p-6 text-white shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-white/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 right-32 size-44 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <Sparkles className="size-3.5" /> {isBrand ? "Brand workspace" : "Creator workspace"}
          </span>
          <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight sm:text-[34px]">
            {timeGreeting()}, {name}
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/85">
            {isBrand
              ? "Here's what's moving across your campaigns today."
              : "Here's your earnings and collaboration snapshot."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={primary.to}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-[13px] font-semibold text-[#0f0f0f] shadow-sm transition-colors hover:bg-white/90"
            >
              {primary.label} <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-4 py-2.5 text-[13px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* KPI snapshot - consistent with the dashboard widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatTile key={s.label} label={s.label} value={isLoading ? "-" : s.value} delta={s.delta} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-[15px] font-semibold text-foreground">Recent activity</h2>
            <Link to={isBrand ? "/offers" : "/payments"} className="text-[11px] font-semibold uppercase tracking-wide text-[#0A0A9F] hover:underline">
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : recent.length ? (
            <div className="divide-y divide-border">
              {recent.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{a.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.detail}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs tabular-nums text-muted-foreground">{a.date}</span>
                    <StatusPill status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {isBrand ? "No offers yet. Discover creators to send your first brief." : "No activity yet. Accept an offer to get started."}
            </p>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-heading text-[15px] font-semibold text-foreground">Quick actions</h2>
          <div className="space-y-1">
            {quickActions.map((a) => {
              const Icon = a.icon
              return (
                <Link
                  key={a.to}
                  to={a.to}
                  className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0A0A9F]/10 text-[#0A0A9F]">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{a.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
