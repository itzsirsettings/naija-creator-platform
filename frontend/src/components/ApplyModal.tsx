"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function ApplyModal({
  title, description, onClose, onSubmit,
}: {
  title: string
  description: string
  onClose: () => void
  onSubmit: (message: string) => Promise<void>
}) {
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    try {
      await onSubmit(message)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Introduce yourself, your audience, and why you're a great fit…"
          rows={5}
        />
        <Button onClick={submit} disabled={busy}>
          <Send className="mr-1 size-3" /> {busy ? "Sending…" : "Send application"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
