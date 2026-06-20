import { AlertTriangle, CalendarDays, Check, CreditCard, Send, ShieldCheck, X } from "lucide-react"
import Badge from "@/components/Badge"
import { calculateFees, formatNaira } from "@/utils/format"

const readableStatus: Record<string, string> = {
  PENDING: "Pending", ACCEPTED: "Accepted", FUNDED: "Funded", SUBMITTED: "Submitted",
  APPROVED: "Approved", DISPUTED: "Disputed", REJECTED: "Rejected", COMPLETED: "Completed",
}

export default function OfferCard({
  offer, role = "creator", onAccept, onApprove, onDispute, onPay, onReject, onSubmit, isBusy = false
}: {
  offer: any; role?: string; onAccept?: (id: string) => void; onApprove?: (id: string) => void
  onDispute?: (id: string) => void; onPay?: (id: string) => void; onReject?: (id: string) => void
  onSubmit?: (offer: any) => void; isBusy?: boolean
}) {
  const fees = calculateFees(offer.amount)
  const canCreatorAct = role === "creator" && offer.status === "PENDING"
  const canBrandPay = role === "brand" && offer.status === "ACCEPTED"
  const canCreatorSubmit = role === "creator" && offer.status === "FUNDED"
  const canBrandApprove = role === "brand" && offer.status === "SUBMITTED"
  const canDispute = ["FUNDED", "SUBMITTED", "APPROVED"].includes(offer.status)

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between text-card-foreground">
      <div className="space-y-2 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-semibold text-sm text-foreground truncate">{offer.title}</h3>
          <Badge tone={offer.status}>{readableStatus[offer.status] || offer.status}</Badge>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-muted-foreground">
          <span>{role === "brand" ? offer.creatorName : offer.brandName}</span>
          <span>{offer.platform}</span>
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3 stroke-[2.5]" /> Due {new Date(offer.deadline).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{offer.description}</p>
      </div>

      <div className="flex flex-row items-center gap-4 sm:flex-col sm:items-end justify-between sm:justify-start">
        <div className="text-left sm:text-right">
          <div className="text-lg font-semibold font-heading tabular-nums text-foreground">{formatNaira(offer.amount)}</div>
          <div className="text-[10px] font-medium text-muted-foreground">{formatNaira(fees.netAmount)} creator net</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canCreatorAct ? (
            <>
              <button
                onClick={() => onAccept?.(offer.id)}
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#1A24B8] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0A0F7A] disabled:opacity-60"
              >
                <Check className="size-3.5 stroke-[2.5]" /> {isBusy ? "Saving" : "Accept"}
              </button>
              <button
                onClick={() => onReject?.(offer.id)}
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-muted disabled:opacity-60"
              >
                <X className="size-3.5 stroke-[2.5]" /> Reject
              </button>
            </>
          ) : null}
          {canBrandPay ? (
            <button
              onClick={() => onPay?.(offer.id)}
              disabled={isBusy}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#1A24B8] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0A0F7A] disabled:opacity-60"
            >
              <CreditCard className="size-3.5 stroke-[2.5]" /> {isBusy ? "Paying" : "Pay"}
            </button>
          ) : null}
          {canCreatorSubmit ? (
            <button
              onClick={() => onSubmit?.(offer)}
              disabled={isBusy}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#1A24B8] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0A0F7A] disabled:opacity-60"
            >
              <Send className="size-3.5 stroke-[2.5]" /> {isBusy ? "Saving" : "Submit"}
            </button>
          ) : null}
          {canBrandApprove ? (
            <button
              onClick={() => onApprove?.(offer.id)}
              disabled={isBusy}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#1A24B8] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0A0F7A] disabled:opacity-60"
            >
              <ShieldCheck className="size-3.5 stroke-[2.5]" /> {isBusy ? "Queuing" : "Approve"}
            </button>
          ) : null}
          {canDispute ? (
            <button
              onClick={() => onDispute?.(offer.id)}
              disabled={isBusy}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              <AlertTriangle className="size-3.5 stroke-[2.5]" /> Dispute
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
