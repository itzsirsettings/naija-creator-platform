import { type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function StatCard({
  label, value, sub, icon: Icon, color = "var(--teal)"
}: {
  label: string
  value: string | number
  sub?: string
  icon?: LucideIcon
  color?: string
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            <div className="text-2xl font-bold font-heading" style={{ color }}>{value}</div>
            {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
          </div>
          {Icon ? (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted" aria-hidden="true">
              <Icon className="size-4" style={{ color }} />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
