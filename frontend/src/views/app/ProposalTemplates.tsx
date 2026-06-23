"use client"

import { useCallback, useEffect, useState } from "react"
import { Crown, FileText, Loader2, Pencil, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Link } from "@/lib/router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/AuthContext"
import { usePremium } from "@/hooks/usePremium"
import {
  fetchTemplates, createTemplate, updateTemplate, deleteTemplate,
  type ProposalTemplate,
} from "@/services/proposalTemplates"

export default function ProposalTemplates() {
  const { user } = useAuth()
  const ent = usePremium()
  const [templates, setTemplates] = useState<ProposalTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState<ProposalTemplate | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", body: "" })
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!ent.proposalTemplateManager) { setIsLoading(false); return }
    setIsLoading(true)
    try { setTemplates(await fetchTemplates()) } catch { /* zero-state */ } finally { setIsLoading(false) }
  }, [ent.proposalTemplateManager])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm({ title: "", body: "" }); setShowForm(true) }
  const openEdit = (t: ProposalTemplate) => { setEditing(t); setForm({ title: t.title, body: t.body }); setShowForm(true) }

  const save = async () => {
    if (!form.title.trim() || !form.body.trim()) { toast.error("Add a title and body"); return }
    setBusy(true)
    try {
      if (editing) {
        const updated = await updateTemplate(editing.id, form)
        setTemplates((prev) => prev.map((t) => (t.id === editing.id ? updated : t)))
        toast.success("Template updated")
      } else {
        const created = await createTemplate(form)
        setTemplates((prev) => [created, ...prev])
        toast.success("Template created")
      }
      setShowForm(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not save template")
    } finally { setBusy(false) }
  }

  const remove = async (id: string) => {
    try {
      await deleteTemplate(id)
      setTemplates((prev) => prev.filter((t) => t.id !== id))
      toast("Template deleted")
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not delete")
    }
  }

  if (user && user.role !== "creator") {
    return <div className="py-16 text-center text-sm text-muted-foreground">Proposal templates are for creators.</div>
  }

  if (!ent.proposalTemplateManager) {
    return (
      <div className="space-y-6">
        <Header />
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10">
            <Crown className="size-6 text-amber-500" />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold">Proposal Template Manager</p>
            <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
              Save reusable proposals and insert them with one click when applying to campaigns. Available on Premium.
            </p>
          </div>
          <Link to="/app/premium" className="rounded-lg border border-amber-500/60 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50">
            Upgrade to Premium
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Header />
        <Button size="sm" onClick={openCreate}><Plus className="mr-1 size-4" /> New template</Button>
      </div>

      {showForm ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold">{editing ? "Edit template" : "New template"}</h3>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
          </div>
          <Input placeholder="Template title (e.g. Fashion brand pitch)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea rows={6} placeholder="Write your reusable proposal. Mention your audience, rates, and why you're a fit…" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <Button onClick={save} disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Create template"}</Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading templates…</p>
        </div>
      ) : templates.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((t) => (
            <div key={t.id} className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading text-sm font-semibold">{t.title}</h3>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => openEdit(t)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="size-3.5" /></button>
                  <button onClick={() => remove(t.id)} className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"><Trash2 className="size-3.5" /></button>
                </div>
              </div>
              <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-xs text-muted-foreground">{t.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <FileText className="size-10 text-muted-foreground" />
          <strong className="font-heading text-sm">No templates yet</strong>
          <p className="max-w-sm text-xs text-muted-foreground">Create reusable proposals to apply to campaigns faster.</p>
        </div>
      )}
    </div>
  )
}

function Header() {
  return (
    <div>
      <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
        <FileText className="size-6 text-[#0A0A9F]" /> Proposal Templates
      </h1>
      <p className="text-muted-foreground">Reusable pitches you can drop into any campaign application.</p>
    </div>
  )
}
