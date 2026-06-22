"use client"

import { useState } from "react"
import { FileText, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface TemplateOption {
  id: string
  title: string
  body: string
}

export default function ApplyModal({
  title, description, onClose, onSubmit, templates,
}: {
  title: string
  description: string
  onClose: () => void
  onSubmit: (message: string) => Promise<void>
  /** Premium proposal templates - when provided, an insert control is shown. */
  templates?: TemplateOption[]
}) {
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)

  const insertTemplate = (id: string) => {
    const t = templates?.find((x) => x.id === id)
    if (t) setMessage(t.body)
  }

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

        {templates && templates.length > 0 ? (
          <div className="flex items-center gap-2">
            <FileText className="size-4 shrink-0 text-[#8B5CF6]" />
            <Select onValueChange={insertTemplate}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Insert a saved proposal template…" /></SelectTrigger>
              <SelectContent>
                {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ) : null}

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
