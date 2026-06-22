"use client"

import { ArrowUpRight, TrendingUp, type LucideIcon } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Stat tile - clean surface, single pink accent for the featured KPI */
/* ------------------------------------------------------------------ */

interface StatTileProps {
  label: string
  value: string | number
  delta?: string
  variant?: "filled" | "plain"
}

export function StatTile({ label, value, delta, variant = "plain" }: StatTileProps) {
  const filled = variant === "filled"
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        filled
          ? "border-transparent bg-[#1A24B8] text-white"
          : "border-border bg-card text-card-foreground"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className={`text-[13.5px] font-medium tracking-tight ${filled ? "text-white/85" : "text-muted-foreground"}`}>
          {label}
        </span>
        <span
          className={`flex size-7 items-center justify-center rounded-full transition-colors ${
            filled
              ? "bg-white/15 text-white"
              : "bg-muted text-muted-foreground group-hover:bg-[#1A24B8]/10 group-hover:text-[#1A24B8]"
          }`}
        >
          <ArrowUpRight className="size-3.5" />
        </span>
      </div>
      <div className="mt-6 font-heading text-[40px] font-semibold leading-none tracking-tight tabular-nums">{value}</div>
      {delta ? (
        <div className={`mt-4 flex items-center gap-1.5 text-[12px] ${filled ? "text-white/85" : "text-muted-foreground"}`}>
          <TrendingUp className="size-3.5" />
          <span>{delta}</span>
        </div>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Card shell                                                        */
/* ------------------------------------------------------------------ */

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 shadow-sm ${className}`}>{children}</div>
  )
}

export function PanelHeading({
  title,
  action,
}: {
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-heading text-[15px] font-semibold tracking-tight text-foreground">{title}</h3>
      {action}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Weekly bar chart - "Earnings Analytics"                           */
/* ------------------------------------------------------------------ */

export interface WeeklyBar {
  label: string
  value: number
  highlight?: boolean
  badge?: string
}

export function WeeklyBars({ data }: { data: WeeklyBar[] }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex h-[190px] items-end justify-between gap-2.5">
      {data.map((b, i) => {
        const h = Math.max(6, Math.round((b.value / max) * 100))
        return (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2.5">
            <div className="relative flex w-full flex-1 items-end justify-center">
              {b.badge ? (
                <span className="absolute -top-1 z-10 rounded-md bg-[#1A24B8] px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                  {b.badge}
                </span>
              ) : null}
              <div
                className={`w-full max-w-[34px] rounded-t-md transition-all duration-300 ${
                  b.highlight ? "bg-[#1A24B8]" : "bg-[#1A24B8]/15"
                }`}
                style={{ height: `${h}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">{b.label}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Progress donut - "Campaign Progress"                              */
/* ------------------------------------------------------------------ */

export interface DonutSegment {
  label: string
  value: number
  color: string
}

export function ProgressDonut({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: DonutSegment[]
  centerLabel: string
  centerValue: string
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1
  const r = 66
  const circ = 2 * Math.PI * r
  const gap = 6 // px gap between segments
  let offset = 0

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg width="172" height="172" viewBox="0 0 172 172" className="-rotate-90">
          <circle cx="86" cy="86" r={r} fill="none" strokeWidth={16} className="stroke-muted" />
          {segments.map((s, i) => {
            const len = (s.value / total) * circ
            const dash = `${Math.max(len - gap, 0)} ${circ - Math.max(len - gap, 0)}`
            const node = (
              <circle
                key={i}
                cx="86"
                cy="86"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={16}
                strokeLinecap="round"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                style={{ stroke: s.color }}
              />
            )
            offset += len
            return node
          })}
        </svg>
        <div className="absolute text-center">
          <div className="font-heading text-[32px] font-semibold tracking-tight tabular-nums text-foreground">{centerValue}</div>
          <div className="text-[11px] font-medium text-muted-foreground">{centerLabel}</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[11.5px] font-medium text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Status pill - soft tinted badges, no hard borders                 */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-[#1A24B8]/10 text-[#1A24B8]",
  approved: "bg-[#1A24B8]/10 text-[#1A24B8]",
  paid: "bg-[#1A24B8]/10 text-[#1A24B8]",
  "in progress": "bg-amber-100 text-amber-700",
  accepted: "bg-amber-100 text-amber-700",
  pending: "bg-orange-100 text-orange-700",
  rejected: "bg-rose-100 text-rose-700",
}

export function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase()
  const cls = STATUS_STYLES[key] ?? "bg-muted text-muted-foreground"
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${cls}`}>
      {status.toLowerCase()}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Colored icon tile (project/offer list rows)                       */
/* ------------------------------------------------------------------ */

const TILE_PALETTE = [
  "bg-[#1A24B8]/10 text-[#1A24B8]",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700",
]

export function IconTile({ icon: Icon, index = 0 }: { icon: LucideIcon; index?: number }) {
  const cls = TILE_PALETTE[index % TILE_PALETTE.length]
  return (
    <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${cls}`}>
      <Icon className="size-4" />
    </span>
  )
}
