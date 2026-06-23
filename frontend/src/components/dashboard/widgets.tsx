"use client"

import { type LucideIcon } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Stat card - colored icon chip + value + delta badge (admin style)  */
/*  Shared by the admin, creator, and brand dashboards.                */
/* ------------------------------------------------------------------ */

interface StatTileProps {
  label: string
  value: string | number
  delta?: string
  icon?: LucideIcon
  /** Icon-chip color classes, e.g. "bg-emerald-100 text-emerald-600". */
  tint?: string
  variant?: "filled" | "plain"
  /** Controls the delta badge color. */
  positive?: boolean
}

export function StatTile({
  label, value, delta, icon: Icon, tint = "bg-[#2f6bff]/10 text-[#2f6bff]", variant = "plain", positive = true,
}: StatTileProps) {
  const filled = variant === "filled"
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        filled ? "border-transparent bg-[#2f6bff] text-white" : "border-border bg-card text-card-foreground"
      }`}
    >
      <div className="flex items-center gap-2.5">
        {Icon ? (
          <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${filled ? "bg-white/15 text-white" : tint}`}>
            <Icon className="size-4" />
          </span>
        ) : null}
        <span className={`text-xs font-medium ${filled ? "text-white/85" : "text-muted-foreground"}`}>{label}</span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <span className={`font-heading text-2xl font-bold leading-none tracking-tight tabular-nums ${filled ? "text-white" : "text-foreground"}`}>
          {value}
        </span>
        {delta ? (
          <span
            className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
              filled
                ? "bg-white/15 text-white"
                : positive
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
            }`}
          >
            {delta}
          </span>
        ) : null}
      </div>
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
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}>{children}</div>
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
                <span className="absolute -top-1 z-10 rounded-md bg-[#2f6bff] px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                  {b.badge}
                </span>
              ) : null}
              <div
                className={`w-full max-w-[34px] rounded-t-md transition-all duration-300 ${
                  b.highlight ? "bg-[#2f6bff]" : "bg-[#2f6bff]/15"
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
  completed: "bg-[#2f6bff]/10 text-[#2f6bff]",
  approved: "bg-[#2f6bff]/10 text-[#2f6bff]",
  paid: "bg-[#2f6bff]/10 text-[#2f6bff]",
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
  "bg-[#2f6bff]/10 text-[#2f6bff]",
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
