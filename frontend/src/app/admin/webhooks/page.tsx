"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Activity, CheckCircle2, Copy, RefreshCw, ShieldCheck, XCircle, Zap } from "lucide-react"
import { adminListRecentWebhooks, type WebhookEvent, type WebhookStatus, type WebhookSummary } from "@/services/api"

const EMPTY_SUMMARY: WebhookSummary = { total: 0, processed: 0, failed: 0, duplicate: 0, pending: 0, successRate: 0 }
const WEBHOOK_URL = "https://api.tehilla.work/api/payments/webhook/paystack"

const STATUS_STYLE: Record<WebhookStatus, { dot: string; badge: string; label: string }> = {
  PROCESSED:  { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700", label: "Processed"  },
  FAILED:     { dot: "bg-rose-500",    badge: "bg-rose-100 text-rose-700",       label: "Failed"     },
  DUPLICATE:  { dot: "bg-slate-400",   badge: "bg-slate-100 text-slate-600",     label: "Duplicate"  },
  RECEIVED:   { dot: "bg-sky-500",     badge: "bg-sky-100 text-sky-700",         label: "Received"   },
  PROCESSING: { dot: "bg-amber-500",   badge: "bg-amber-100 text-amber-700",     label: "Processing" },
}

function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return "Just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
}

function fmt(n: number): string { return n.toLocaleString("en-NG") }

interface Bucket { label: string; count: number }

function buildChart(events: WebhookEvent[]): Bucket[] {
  const days = 9
  const now = new Date()
  const buckets: Bucket[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    buckets.push({ label: d.toLocaleDateString("en-NG", { month: "short", day: "numeric" }), count: 0 })
  }
  const startMs = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1)).getTime()
  for (const e of events) {
    const t = new Date(e.createdAt)
    const idx = Math.round((new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime() - startMs) / 86400000)
    if (idx >= 0 && idx < days) buckets[idx].count += 1
  }
  return buckets
}

function StatCard({ icon: Icon, tint, label, value, delta, positive }: {
  icon: typeof Zap; tint: string; label: string; value: string; delta: string; positive: boolean
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className={`flex size-8 items-center justify-center rounded-full ${tint}`}>
          <Icon className="size-4" />
        </span>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <span className="font-heading text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
          {delta}
        </span>
      </div>
    </div>
  )
}

function BarChart({ buckets }: { buckets: Bucket[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.count))
  const peakIdx = buckets.reduce((best, b, i, arr) => (b.count >= arr[best].count ? i : best), buckets.length - 1)
  return (
    <div className="mt-5 flex h-40 items-end gap-2 sm:gap-3">
      {buckets.map((b, i) => {
        const isPeak = i === peakIdx && b.count > 0
        const h = b.count === 0 ? 12 : Math.round(40 + (b.count / max) * 60)
        return (
          <div key={b.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-full w-full items-end justify-center">
              {isPeak && (
                <span className="absolute -top-1 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white">
                  {b.count}
                </span>
              )}
              <div
                className={`w-full max-w-[26px] rounded-md transition-all ${isPeak ? "bg-[#0A0A9F]" : "bg-slate-200"}`}
                style={{ height: `${h}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400">{b.label.split(" ")[1]}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function WebhooksPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [summary, setSummary] = useState<WebhookSummary>(EMPTY_SUMMARY)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await adminListRecentWebhooks(50)
      setEvents(data.events)
      setSummary(data.summary)
    } catch { setError("Could not load webhook events.") }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const chart = useMemo(() => buildChart(events), [events])

  const copyUrl = async () => {
    try { await navigator.clipboard.writeText(WEBHOOK_URL); setCopied(true); setTimeout(() => setCopied(false), 1800) }
    catch { /* clipboard unavailable */ }
  }

  return (
    <div>
      {/* Stat cards */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Zap}          tint="bg-[#fdecec] text-[#e25563]" label="Total Events"  value={fmt(summary.total)}        delta={`${summary.pending} pending`}                   positive />
        <StatCard icon={CheckCircle2} tint="bg-[#e7f6ee] text-[#22a565]" label="Processed"     value={fmt(summary.processed)}    delta={`${summary.successRate}% ok`}                   positive />
        <StatCard icon={XCircle}      tint="bg-[#fdecec] text-[#e25563]" label="Failed"         value={fmt(summary.failed)}       delta={summary.failed === 0 ? "all clear" : "needs attention"} positive={summary.failed === 0} />
        <StatCard icon={Activity}     tint="bg-[#fbe9f3] text-[#d6489a]" label="Success Rate"   value={`${summary.successRate}%`} delta={`${fmt(summary.duplicate)} dup`}                positive={summary.successRate >= 90} />
      </section>

      {/* Chart + health card */}
      <section className="mt-4 grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Webhook Volume</p>
              <p className="mt-1 font-heading text-2xl font-bold text-slate-900">{fmt(summary.total)}</p>
            </div>
            <button
              onClick={load}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
          <BarChart buckets={chart} />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0A0A9F,#5E5AA8)] p-5 text-white shadow-sm">
          <div className="absolute -right-8 -top-10 size-36 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -right-2 size-28 rounded-full bg-white/10" />
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
            <ShieldCheck className="size-3" /> {summary.failed === 0 ? "Healthy" : "Check failures"}
          </span>
          <h3 className="mt-3 font-heading text-lg font-semibold leading-snug">Paystack webhook endpoint</h3>
          <p className="mt-1 break-all text-[11px] leading-relaxed text-blue-100/90">{WEBHOOK_URL}</p>
          <button
            onClick={copyUrl}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#5E5AA8] transition-transform hover:scale-[1.03]"
          >
            <Copy className="size-3.5" /> {copied ? "Copied!" : "Copy URL"}
          </button>
        </div>
      </section>

      {/* Activities + table */}
      <section className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="font-heading text-base font-semibold text-slate-900">Activities</h3>
          <div className="mt-4 space-y-4">
            {isLoading && events.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="size-2.5 rounded-full bg-slate-200" />
                    <div className="h-3 flex-1 animate-pulse rounded bg-slate-100" />
                  </div>
                ))
              : events.length === 0
              ? <p className="py-8 text-center text-sm text-slate-400">No webhook activity yet.</p>
              : events.slice(0, 5).map((e) => {
                  const s = STATUS_STYLE[e.status]
                  return (
                    <div key={e.id} className="flex items-start gap-3">
                      <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${s.dot}`} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          <span className="font-semibold">{e.eventType}</span> {s.label.toLowerCase()}
                        </p>
                        <p className="text-xs text-slate-400">{e.provider} · {timeAgo(e.createdAt)}</p>
                      </div>
                    </div>
                  )
                })}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading text-base font-semibold text-slate-900">Recent Webhooks</h3>
            <span className="text-xs text-slate-400">{events.length} shown</span>
          </div>
          {error ? (
            <div className="py-10 text-center text-sm text-rose-600">{error}</div>
          ) : isLoading && events.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="size-2.5 rounded-full bg-slate-200" />
                <div className="h-3 flex-1 animate-pulse rounded bg-slate-100" />
              </div>
            ))
          ) : events.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No events received yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="pb-2 pr-3 font-medium">Event</th>
                    <th className="pb-2 pr-3 font-medium">Provider</th>
                    <th className="pb-2 pr-3 font-medium">Received</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.slice(0, 8).map((e) => (
                    <tr key={e.id} className="text-slate-700">
                      <td className="py-3 pr-3 font-medium text-slate-800">{e.eventType}</td>
                      <td className="py-3 pr-3 capitalize text-slate-500">{e.provider.toLowerCase()}</td>
                      <td className="py-3 pr-3 whitespace-nowrap text-slate-500">{shortDate(e.createdAt)}</td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[e.status].badge}`}>
                          {STATUS_STYLE[e.status].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
