import { Badge as ShadcnBadge } from "@/components/ui/badge"

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-[#1A24B8]/10 text-[#1A24B8]",
  FUNDED: "bg-[#1A24B8]/10 text-[#1A24B8]",
  SUBMITTED: "bg-orange-100 text-orange-700",
  APPROVED: "bg-[#1A24B8]/10 text-[#1A24B8]",
  DISPUTED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
  COMPLETED: "bg-[#1A24B8]/10 text-[#1A24B8]",
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
