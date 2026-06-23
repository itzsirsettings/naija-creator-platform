import { Badge as ShadcnBadge } from "@/components/ui/badge"

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-[#2f6bff]/10 text-[#2f6bff]",
  FUNDED: "bg-[#2f6bff]/10 text-[#2f6bff]",
  SUBMITTED: "bg-orange-100 text-orange-700",
  APPROVED: "bg-[#2f6bff]/10 text-[#2f6bff]",
  DISPUTED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
  COMPLETED: "bg-[#2f6bff]/10 text-[#2f6bff]",
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
