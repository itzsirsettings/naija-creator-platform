"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "@/lib/router"
import { BarChart3, HelpCircle, ListChecks, Loader2, Settings, Users, Webhook } from "lucide-react"
import {
  adminListRecentWebhooks,
  adminOverview,
  type AdminOverview,
  type WebhookEvent,
  type WebhookStatus,
} from "@/services/api"

const STATUS_DOT: Record<WebhookStatus, string> = {
  PROCESSED:  "bg-emerald-500",
  FAILED:     "bg-rose-500",
  DUPLICATE:  "bg-slate-400",
  RECEIVED:   "bg-sky-500",
  PROCESSING: "bg-amber-500",
}

function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return "Just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`
}

const SECTIONS = [
  { label: "Webhooks",   icon: Webhook,    to: "/admin/webhooks",   desc: "Delivery monitoring" },
  { label: "Operations", icon: ListChecks, to: "/admin/operations", desc: "Disputes & offers"   },
  { label: "Users",      icon: Users,      to: "/admin/users",      desc: "Accounts & KYC"      },
  { label: "Settings",   icon: Settings,   to: "/admin/settings",   desc: "Platform config"     },
]

export default function AdminOverviewPage() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([adminOverview(), adminListRecentWebhooks(5)])
      .then(([ov, wh]) => {
        if (!active) return
        setOverview(ov)
        setEvents(wh.events)
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const stats = [
    { label: "Total Users", value: overview?.totalUsers, tint: "bg-[#0A0A9F]/10 text-[#0A0A9F]", icon: Users },
    { label: "Creators",    value: overview?.creators,   tint: "bg-sky-100 text-sky-700",         icon: Users },
    { label: "Brands",      value: overview?.brands,     tint: "bg-purple-100 text-purple-700",   icon: BarChart3 },
    { label: "Pending KYC", value: overview?.pendingKyc, tint: "bg-amber-100 text-amber-700",     icon: HelpCircle },
  ]

  return (
    <div>
      {/* Platform stats */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className={`flex size-8 items-center justify-center rounded-full ${s.tint}`}>
                  <Icon className="size-4" />
                </span>
                <span className="text-xs font-medium text-slate-500">{s.label}</span>
              </div>
              <div className="mt-3 font-heading text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {loading
                  ? <Loader2 className="size-5 animate-spin text-slate-300" />
                  : (s.value ?? 0).toLocaleString("en-NG")}
              </div>
            </div>
          )
        })}
      </section>

      {/* Quick links + recent activity */}
      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="font-heading text-base font-semibold text-slate-900">Admin Sections</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {SECTIONS.map((s) => {
              const Icon = s.icon
              return (
                <button
                  key={s.to}
                  onClick={() => navigate(s.to)}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-left transition-colors hover:border-[#0A0A9F]/20 hover:bg-[#0A0A9F]/5"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0A0A9F]/10 text-[#0A0A9F]">
                    <Icon className="size-[18px]" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{s.label}</p>
                    <p className="text-[11px] text-slate-400">{s.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base font-semibold text-slate-900">Recent Activity</h3>
            <button
              onClick={() => navigate("/admin/webhooks")}
              className="text-[11px] font-semibold uppercase tracking-wide text-[#0A0A9F] hover:underline"
            >
              See all
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="size-2.5 rounded-full bg-slate-200" />
                  <div className="h-3 flex-1 animate-pulse rounded bg-slate-100" />
                </div>
              ))
            ) : events.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No webhook events yet.</p>
            ) : (
              events.map((e) => (
                <div key={e.id} className="flex items-start gap-3">
                  <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${STATUS_DOT[e.status]}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{e.eventType}</p>
                    <p className="text-xs text-slate-400">{e.provider} · {timeAgo(e.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
