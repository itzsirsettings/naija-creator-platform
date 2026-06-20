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
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fees = calculateFees(form.amount)

  const updateField = (field: string, value: string | number) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    if (Number(form.amount) < 10000) { setError("Offers must be at least ₦10,000."); return }
    if (!form.title.trim() || !form.description.trim()) { setError("Add a clear title and campaign description before sending."); return }
    setIsSubmitting(true)
    try {
      const result = await onSubmit({ creatorId: creator.id, ...form, title: form.title.trim(), description: form.description.trim(), amount: Number(form.amount) })
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

          <div className="rounded-lg border bg-muted/50 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span>Brand pays</span><strong>{formatNaira(fees.grossAmount)}</strong></div>
            <div className="flex justify-between"><span>Platform fee (10%)</span><strong>{formatNaira(fees.platformFee)}</strong></div>
            <div className="flex justify-between"><span>Creator receives</span><strong className="text-primary">{formatNaira(fees.netAmount)}</strong></div>
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
