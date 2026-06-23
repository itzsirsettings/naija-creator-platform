import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { calculateFees, formatNaira } from "@/utils/format"

export default function OfferModal({
  creator, onClose, onSubmit
}: {
  creator: any; onClose: () => void; onSubmit: (data: any) => Promise<any>
}) {
  const [form, setForm] = useState({
    title: "Sponsored creator post",
    description: `Create a short campaign story for ${creator?.handle ? `@${creator.handle}` : "this creator"} with tracked links and usage rights for brand reposting.`,
    amount: creator?.baseRate || 75000,
    platform: creator?.platforms?.[0] || "Instagram Reels",
    deadline: "2026-06-14",
    dealType: "FIXED" as "FIXED" | "AFFILIATE",
    commissionRate: 15,
    usageRights: "ORGANIC_ONLY" as "ORGANIC_ONLY" | "PAID_ADS_30D" | "PAID_ADS_90D" | "PERPETUAL",
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fees = calculateFees(form.amount)
  const isAffiliate = form.dealType === "AFFILIATE"

  const usageRightsOptions: { value: typeof form.usageRights; label: string }[] = [
    { value: "ORGANIC_ONLY", label: "Organic use only" },
    { value: "PAID_ADS_30D", label: "Paid ads (30 days)" },
    { value: "PAID_ADS_90D", label: "Paid ads (90 days)" },
    { value: "PERPETUAL", label: "Perpetual rights" },
  ]

  const updateField = (field: string, value: string | number) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    if (Number(form.amount) < 10000) { setError("Offers must be at least ₦10,000."); return }
    if (!form.title.trim() || !form.description.trim()) { setError("Add a clear title and campaign description before sending."); return }
    if (isAffiliate && (Number(form.commissionRate) < 1 || Number(form.commissionRate) > 100)) {
      setError("Commission rate must be between 1% and 100%."); return
    }
    setIsSubmitting(true)
    try {
      const result = await onSubmit({
        creatorId: creator.id,
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        amount: Number(form.amount),
        commissionRate: isAffiliate ? Number(form.commissionRate) : undefined,
      })
      if (result !== null) onClose()
    } catch (submitError: any) {
      setError(submitError.message || "Could not send this offer. Please try again.")
    } finally { setIsSubmitting(false) }
  }

  if (!creator) return null

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Offer</DialogTitle>
          <DialogDescription>{creator.name} &middot; @{creator.handle}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign title</Label>
            <Input id="title" value={form.title} onChange={(e) => updateField("title", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={form.description} onChange={(e) => updateField("description", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount in NGN</Label>
            <Input id="amount" min="10000" step="5000" type="number" value={form.amount} onChange={(e) => updateField("amount", e.target.value)} required />
            <p className="text-xs text-muted-foreground">Tehilla records a 10% platform fee before creator payout.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={form.platform} onValueChange={(v) => updateField("platform", v)}>
              <SelectTrigger id="platform"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Instagram Reels", "Instagram Stories", "TikTok Video", "YouTube Short", "X Thread"].map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input id="deadline" type="date" value={form.deadline} onChange={(e) => updateField("deadline", e.target.value)} required />
          </div>

          {/* Deal type - fixed fee vs affiliate/commission */}
          <div className="space-y-2">
            <Label>Deal type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateField("dealType", "FIXED")}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${!isAffiliate ? "border-[#0A0A9F] bg-[#0A0A9F]/10 text-[#0A0A9F]" : "border-border text-muted-foreground hover:bg-muted"}`}
              >
                Fixed fee
              </button>
              <button
                type="button"
                onClick={() => updateField("dealType", "AFFILIATE")}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${isAffiliate ? "border-[#8B5CF6] bg-[#8B5CF6]/10 text-[#8B5CF6]" : "border-border text-muted-foreground hover:bg-muted"}`}
              >
                Affiliate + commission
              </button>
            </div>
          </div>

          {isAffiliate ? (
            <div className="space-y-2">
              <Label htmlFor="commission">Commission rate (%)</Label>
              <Input id="commission" type="number" min="1" max="100" step="1" value={form.commissionRate} onChange={(e) => updateField("commissionRate", e.target.value)} />
              <p className="text-xs text-muted-foreground">
                The creator earns the fixed fee plus {form.commissionRate || 0}% of attributed sales via a unique tracking code.
              </p>
            </div>
          ) : null}

          {/* Content usage rights */}
          <div className="space-y-2">
            <Label htmlFor="usageRights">Content usage rights</Label>
            <Select value={form.usageRights} onValueChange={(v) => updateField("usageRights", v)}>
              <SelectTrigger id="usageRights"><SelectValue /></SelectTrigger>
              <SelectContent>
                {usageRightsOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {creator?.usageRightsPolicy ? (
              <p className="text-xs text-amber-600">Creator policy: {creator.usageRightsPolicy}</p>
            ) : null}
          </div>

          <div className="rounded-lg border bg-muted/50 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span>Brand pays</span><strong>{formatNaira(fees.grossAmount)}</strong></div>
            <div className="flex justify-between"><span>Platform fee (10%)</span><strong>{formatNaira(fees.platformFee)}</strong></div>
            <div className="flex justify-between"><span>Creator receives</span><strong className="text-primary">{formatNaira(fees.netAmount)}</strong></div>
            {isAffiliate ? (
              <div className="flex justify-between border-t pt-1.5"><span>+ Commission</span><strong className="text-[#8B5CF6]">{form.commissionRate || 0}% of sales</strong></div>
            ) : null}
          </div>

          {error ? <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</div> : null}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending offer..." : "Send offer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
