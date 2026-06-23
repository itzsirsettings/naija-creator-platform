import { Badge as ShadcnBadge } from "@/components/ui/badge"

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-[#0A0A9F]/10 text-[#0A0A9F]",
  FUNDED: "bg-[#0A0A9F]/10 text-[#0A0A9F]",
  SUBMITTED: "bg-orange-100 text-orange-700",
  APPROVED: "bg-[#0A0A9F]/10 text-[#0A0A9F]",
  DISPUTED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
  COMPLETED: "bg-[#0A0A9F]/10 text-[#0A0A9F]",
  PROCESSING: "bg-purple-100 text-purple-700",
}

export default function Badge({ children, tone, className = "" }: { children: React.ReactNode; tone?: string; className?: string }) {
  const cls = tone ? statusColors[tone] || "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground"
  return (
    <ShadcnBadge variant="outline" className={`border-transparent font-medium rounded-md text-[10px] px-2 py-0.5 uppercase tracking-wide ${cls} ${className}`}>
      {children}
    </ShadcnBadge>
  )
}
