import { useState } from "react"
import { Link2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function SubmitWorkModal({
  offer, onClose, onSubmit
}: {
  offer: any; onClose: () => void; onSubmit: (data: any) => Promise<any>
}) {
  const [deliverableUrl, setDeliverableUrl] = useState(offer?.deliverableUrl || "")
  const [deliverableNote, setDeliverableNote] = useState(offer?.deliverableNote || "")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    if (!deliverableUrl.trim()) { setError("Add a link to your deliverable before submitting for approval."); return }
    if (!/^https?:\/\//i.test(deliverableUrl.trim())) { setError("Deliverable link must start with http:// or https://"); return }
    setIsSubmitting(true)
    try {
      const result = await onSubmit({ deliverableUrl: deliverableUrl.trim(), deliverableNote: deliverableNote.trim() || undefined })
      if (result !== null) onClose()
    } catch (submitError: any) {
      setError(submitError.message || "Could not submit this work. Please try again.")
    } finally { setIsSubmitting(false) }
  }

  if (!offer) return null

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Submit Work for Approval</DialogTitle>
          <DialogDescription>{offer.brandName} &middot; {offer.title}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url"><Link2 className="mr-1 inline size-3" /> Deliverable link</Label>
            <Input
              id="url"
              type="url"
              inputMode="url"
              placeholder="https://drive.google.com/... or your hosted video URL"
              value={deliverableUrl}
              onChange={(e) => setDeliverableUrl(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Share a Google Drive, Dropbox, YouTube (unlisted), or hosted link. The brand can review before approval.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note to brand (optional)</Label>
            <Textarea
              id="note"
              rows={3}
              maxLength={1000}
              placeholder="Add any context, captions, or usage notes the brand should know."
              value={deliverableNote}
              onChange={(e) => setDeliverableNote(e.target.value)}
            />
          </div>
          {error ? <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</div> : null}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Send className="mr-1 size-3" /> {isSubmitting ? "Submitting..." : "Submit for approval"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
