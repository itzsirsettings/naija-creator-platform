"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertTriangle, Building2, Check, Coins, CreditCard,
  FileLock2, Link2, Send, ShieldCheck, X,
} from "lucide-react"
import { formatNaira } from "@/utils/format"

const STATUS_CONFIG: Record<string, {
  label: string; color: string; bg: string; dot: string
}> = {
  PENDING:   { label: "Awaiting your response",         color: "text-amber-700 dark:text-amber-400",  bg: "bg-amber-500/10",   dot: "bg-amber-500"   },
  ACCEPTED:  { label: "Accepted — awaiting escrow",     color: "text-[#0098f2]",                      bg: "bg-[#0098f2]/10",   dot: "bg-[#0098f2]"   },
  FUNDED:    { label: "Escrow funded, ready to start",  color: "text-[#5d9c06]",                      bg: "bg-[#5d9c06]/10",   dot: "bg-[#5d9c06]"   },
  SUBMITTED: { label: "Work submitted for review",      color: "text-[#1A24B8]",                      bg: "bg-[#1A24B8]/10",   dot: "bg-[#1A24B8]"   },
  APPROVED:  { label: "Approved — payout queued",       color: "text-[#5d9c06]",                      bg: "bg-[#5d9c06]/10",   dot: "bg-[#5d9c06]"   },
  DISPUTED:  { label: "Under dispute",                  color: "text-red-700",                        bg: "bg-red-500/10",     dot: "bg-red-500"     },
  REJECTED:  { label: "Offer declined",                 color: "text-red-700",                        bg: "bg-red-500/10",     dot: "bg-red-500"     },
  COMPLETED: { label: "Completed",                      color: "text-[#5d9c06]",                      bg: "bg-[#5d9c06]/10",   dot: "bg-[#5d9c06]"   },
  REFUNDED:  { label: "Refunded",                       color: "text-[#8d8d8d]",                      bg: "bg-[#8d8d8d]/10",   dot: "bg-[#8d8d8d]"   },
}

const USAGE_LABELS: Record<string, string> = {
  ORGANIC_ONLY: "Organic use only",
  PAID_ADS_30D: "Paid ads (30 days)",
  PAID_ADS_90D: "Paid ads (90 days)",
  PERPETUAL:    "Perpetual rights",
}

function offerNumber(id: string): string {
  const hex = id.replace(/-/g, "").slice(-4)
  return String(parseInt(hex, 16) % 10000).padStart(4, "0")
}

type PayoutTab = "bank" | "card" | "usdc"

export interface OfferCardProps {
  offer: {
    id: string
    title: string
    description?: string
    amount: number
    platform: string
    status: string
    deadline: string
    brandName?: string
    creatorName?: string
    dealType?: string
    commissionRate?: number | null
    affiliateCode?: string | null
    usageRights?: string | null
    deliverableUrl?: string | null
    deliverableNote?: string | null
    bankName?: string | null
    bankLast4?: string | null
  }
  role?: "creator" | "brand"
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
  onPay?: (id: string) => void
  onSubmit?: (offer: OfferCardProps["offer"]) => void
  onApprove?: (id: string) => void
  onDispute?: (id: string) => void
  isBusy?: boolean
}

export default function OfferCard({
  offer, role = "creator", onAccept, onReject, onPay, onSubmit, onApprove, onDispute, isBusy = false,
}: OfferCardProps) {
  const [payoutTab, setPayoutTab] = useState<PayoutTab>("bank")

  const s = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.PENDING

  const canCreatorAct    = role === "creator" && offer.status === "PENDING"
  const canBrandPay      = role === "brand"   && offer.status === "ACCEPTED"
  const canCreatorSubmit = role === "creator" && offer.status === "FUNDED"
  const canBrandApprove  = role === "brand"   && offer.status === "SUBMITTED"
  const canDispute       = ["FUNDED", "SUBMITTED", "APPROVED"].includes(offer.status)

  const ctaLabel = canCreatorAct    ? `Accept offer: ${formatNaira(offer.amount)}`
    : canBrandPay      ? `Pay into escrow: ${formatNaira(offer.amount)}`
    : canCreatorSubmit ? "Submit deliverable"
    : canBrandApprove  ? "Approve & release payment"
    : null

  const handleCta = () => {
    if (canCreatorAct)    onAccept?.(offer.id)
    else if (canBrandPay)      onPay?.(offer.id)
    else if (canCreatorSubmit) onSubmit?.(offer)
    else if (canBrandApprove)  onApprove?.(offer.id)
  }

  const showPayoutTabs = role === "creator" && [
    "PENDING", "ACCEPTED", "FUNDED", "SUBMITTED", "APPROVED", "COMPLETED",
  ].includes(offer.status)

  const PAYOUT_TABS: { key: PayoutTab; icon: React.ReactNode; label: string }[] = [
    { key: "bank", icon: <Building2 className="size-3.5" />, label: "Bank" },
    { key: "card", icon: <CreditCard className="size-3.5" />, label: "Card" },
    { key: "usdc", icon: <Coins className="size-3.5" />,     label: "USDC" },
  ]

  return (
    <div className="w-full rounded-3xl border border-[#d8d8d8] bg-white p-6 shadow-xl relative overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-[#d8d8d8]/60 pb-5 mb-5">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8d8d8d]">Offer NO</span>
          <div className="font-digital text-[18.2px] text-[#0f0f0f] leading-tight">{offerNumber(offer.id)}</div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8d8d8d]">Amount</span>
          <div className="font-runde text-[20px] font-semibold text-[#0098f2] leading-tight">{formatNaira(offer.amount)}</div>
        </div>
      </div>

      {/* ── Brand / Creator ── */}
      <div className="grid grid-cols-2 gap-4 mb-5 border-b border-[#d8d8d8]/60 pb-5">
        <div>
          <span className="text-[#8d8d8d] block font-medium uppercase tracking-wider text-[9.1px]">Brand</span>
          <strong className="text-[#0f0f0f] block text-[11.8px] mt-0.5 leading-snug">{offer.brandName ?? "Brand"}</strong>
          <span className="text-[10.9px] text-[#666]">{offer.platform}</span>
        </div>
        <div>
          <span className="text-[#8d8d8d] block font-medium uppercase tracking-wider text-[9.1px]">Creator</span>
          <strong className="text-[#0f0f0f] block text-[11.8px] mt-0.5 leading-snug">{offer.creatorName ?? "Creator"}</strong>
          <span className="text-[10.9px] text-[#666]">
            Due {new Date(offer.deadline).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* ── Status ── */}
      <div className="mb-5">
        <span className="text-[#8d8d8d] block font-medium uppercase tracking-wider text-[9.1px] mb-2">Status</span>
        <div className={`flex items-center gap-2 rounded-xl ${s.bg} px-4 py-3`}>
          <div className={`size-2 shrink-0 rounded-full ${s.dot} animate-pulse`} />
          <span className={`text-[11.8px] font-medium ${s.color}`}>{s.label}</span>
        </div>
      </div>

      {/* ── Payout method tabs (creator only) ── */}
      {showPayoutTabs && (
        <div className="mb-5">
          <span className="text-[#8d8d8d] block font-medium uppercase tracking-wider text-[9.1px] mb-2">Payout Method</span>
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#fafafa] p-1 border border-[#d8d8d8]/60">
            {PAYOUT_TABS.map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setPayoutTab(key)}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-3 text-[11.8px] font-medium transition-all ${payoutTab === key ? "bg-white text-[#0f0f0f] shadow-xs border border-[#d8d8d8]" : "text-[#666] hover:text-[#0f0f0f]"}`}
              >
                {icon}<span>{label}</span>
              </button>
            ))}
          </div>

          <div className="min-h-[108px] flex flex-col justify-center mt-3">
            <AnimatePresence mode="wait">
              {payoutTab === "bank" && (
                <motion.div key="bank" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }} className="space-y-3">
                  <div className="rounded-xl border border-[#d8d8d8]/80 bg-[#fafafa] p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[9.1px] font-semibold text-[#8d8d8d] uppercase tracking-wider block">Bank Transfer</span>
                      <span className="text-[12.7px] font-medium text-[#0f0f0f]">
                        {offer.bankName && offer.bankLast4
                          ? `${offer.bankName} •••• ${offer.bankLast4}`
                          : "Your verified bank account"}
                      </span>
                    </div>
                    <span className="text-[10.9px] font-semibold text-[#5d9c06] bg-[#5d9c06]/10 px-2.5 py-1 rounded-full shrink-0 ml-3">Instant</span>
                  </div>
                  <p className="text-[10.9px] text-[#666] leading-relaxed">
                    Funds land in your verified Nigerian bank account within 24 hours. Supported via Paystack.
                  </p>
                </motion.div>
              )}

              {payoutTab === "card" && (
                <motion.div key="card" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }} className="space-y-3">
                  <div className="rounded-xl border border-[#d8d8d8]/80 bg-[#fafafa] p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[9.1px] font-semibold text-[#8d8d8d] uppercase tracking-wider block">Card Payout</span>
                      <span className="text-[12.7px] font-medium text-[#0f0f0f]">Withdraw via Paystack</span>
                    </div>
                    <span className="text-[10.9px] font-semibold text-[#0098f2] bg-[#0098f2]/10 px-2.5 py-1 rounded-full shrink-0 ml-3">2.7% Fee</span>
                  </div>
                  <p className="text-[10.9px] text-[#666] leading-relaxed">
                    Withdraw directly to your debit card. Funds are available instantly after approval.
                  </p>
                </motion.div>
              )}

              {payoutTab === "usdc" && (
                <motion.div key="usdc" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }} className="space-y-3">
                  <div className="rounded-xl border border-[#d8d8d8]/80 bg-[#fafafa] p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[9.1px] font-semibold text-[#8d8d8d] uppercase tracking-wider block">Stablecoin</span>
                      <span className="text-[12.7px] font-medium text-[#0f0f0f]">USDC via Polygon</span>
                    </div>
                    <span className="text-[10.9px] font-semibold text-[#1A24B8] bg-[#1A24B8]/10 px-2.5 py-1 rounded-full shrink-0 ml-3">1% Fee</span>
                  </div>
                  <p className="text-[10.9px] text-[#666] leading-relaxed">
                    Receive payment in USDC on the Polygon network. Add your wallet address in Settings.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Deal chips ── */}
      {(offer.dealType === "AFFILIATE" || offer.usageRights || offer.affiliateCode) && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {offer.dealType === "AFFILIATE" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/10 px-2.5 py-1 text-[10px] font-semibold text-[#8B5CF6]">
              <Link2 className="size-2.5" /> Affiliate · {offer.commissionRate ?? 0}%
            </span>
          )}
          {offer.usageRights && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#d8d8d8] bg-[#fafafa] px-2.5 py-1 text-[10px] font-medium text-[#666]">
              <FileLock2 className="size-2.5" /> {USAGE_LABELS[offer.usageRights] ?? offer.usageRights}
            </span>
          )}
          {offer.affiliateCode && (
            <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#8B5CF6]/50 px-2.5 py-1 font-mono text-[10px] font-semibold text-[#8B5CF6]">
              {offer.affiliateCode}
            </span>
          )}
        </div>
      )}

      {/* ── Primary CTA ── */}
      {ctaLabel && (
        <button
          onClick={handleCta}
          disabled={isBusy}
          className="mt-1 w-full rounded-full bg-[#0f0f0f] py-4 text-[12.7px] font-medium text-white hover:bg-[#1e1e1e] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isBusy ? "Processing…" : ctaLabel}
        </button>
      )}

      {/* ── Secondary actions ── */}
      {(canCreatorAct || canDispute) && (
        <div className="flex gap-2 mt-3">
          {canCreatorAct && (
            <button
              onClick={() => onReject?.(offer.id)}
              disabled={isBusy}
              className="flex-1 rounded-full border border-[#d8d8d8] py-3 text-[11.8px] font-medium text-[#666] hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              <X className="size-3.5 inline mr-1 -mt-0.5" /> Decline
            </button>
          )}
          {canDispute && (
            <button
              onClick={() => onDispute?.(offer.id)}
              disabled={isBusy}
              className="rounded-full border border-red-200 px-5 py-3 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <AlertTriangle className="size-3 inline mr-1 -mt-0.5" /> Dispute
            </button>
          )}
        </div>
      )}

      {/* ── Status-only secondary info ── */}
      {offer.status === "SUBMITTED" && offer.deliverableUrl && (
        <div className="mt-4 rounded-xl border border-[#d8d8d8]/60 bg-[#fafafa] p-3 flex items-center gap-2">
          <Send className="size-3.5 text-[#1A24B8] shrink-0" />
          <a href={offer.deliverableUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-[#1A24B8] hover:underline truncate">
            {offer.deliverableUrl}
          </a>
          {canBrandApprove && (
            <ShieldCheck className="size-3.5 text-[#5d9c06] shrink-0 ml-auto" />
          )}
        </div>
      )}
      {offer.status === "SUBMITTED" && offer.deliverableNote && (
        <p className="mt-2 text-[10.9px] text-[#666] leading-relaxed px-1">{offer.deliverableNote}</p>
      )}

      {canBrandApprove && (
        <div className="mt-3 flex items-center gap-1.5 text-[10.9px] text-[#8d8d8d]">
          <Check className="size-3 text-[#5d9c06]" />
          Approving releases escrow directly to the creator&apos;s bank account.
        </div>
      )}
    </div>
  )
}
