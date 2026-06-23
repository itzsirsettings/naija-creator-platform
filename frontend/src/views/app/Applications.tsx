"use client"

import { useCallback, useEffect, useState } from "react"
import { Inbox, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext"
import {
  fetchReceivedApplications, fetchMyApplications, respondToApplication,
  type Application,
} from "@/services/applications"
import { initials } from "@/utils/format"

const STATUS_TONE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-300",
  ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-300",
  DECLINED: "bg-rose-50 text-rose-700 border-rose-300",
}

export default function Applications() {
  const { user } = useAuth()
  return user?.role === "brand" ? <BrandApplications /> : <CreatorApplications />
}

function BrandApplications() {
  const [apps, setApps] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try { setApps(await fetchReceivedApplications()) } catch { /* zero-state */ } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const respond = async (id: string, status: "ACCEPTED" | "DECLINED") => {
    try {
      await respondToApplication(id, status)
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
      toast.success(status === "ACCEPTED" ? "Application accepted" : "Application declined")
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not update")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Applications</h1>
        <p className="text-muted-foreground">Creators who applied to work with you.</p>
      </div>
      {isLoading ? <Loading /> : apps.length ? (
        <div className="space-y-3">
          {apps.map((a) => (
            <div key={a.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar className="size-10 border border-border">
                    {a.creator?.avatar && /^https?:\/\//i.test(a.creator.avatar) ? <AvatarImage src={a.creator.avatar} alt="" /> : null}
                    <AvatarFallback className="bg-[#2f6bff]/10 text-[#2f6bff] font-semibold">{initials(a.creator?.name || "?")}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{a.creator?.name} <span className="text-muted-foreground">@{a.creator?.handle}</span></p>
                    <p className="text-xs text-muted-foreground">{a.creator?.niche} · {a.creator?.followers?.toLocaleString()} followers</p>
                    {a.message ? <p className="mt-1.5 text-sm text-foreground">{a.message}</p> : null}
                  </div>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_TONE[a.status]}`}>{a.status}</span>
              </div>
              {a.status === "PENDING" ? (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => respond(a.id, "ACCEPTED")} className="rounded-lg bg-[#2f6bff] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1e40af]">Accept</button>
                  <button onClick={() => respond(a.id, "DECLINED")} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">Decline</button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : <Empty title="No applications yet" hint="When creators apply to work with you, they'll appear here." />}
    </div>
  )
}

function CreatorApplications() {
  const [apps, setApps] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try { setApps(await fetchMyApplications()) } catch { /* zero-state */ } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground">Brands you've applied to work with.</p>
      </div>
      {isLoading ? <Loading /> : apps.length ? (
        <div className="space-y-3">
          {apps.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{a.brand?.name ?? "Brand"}</p>
                <p className="text-xs text-muted-foreground">{a.brand?.industry}</p>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_TONE[a.status]}`}>{a.status}</span>
            </div>
          ))}
        </div>
      ) : <Empty title="No applications yet" hint="Discover brands and apply to start collaborations." />}
    </div>
  )
}

function Loading() {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  )
}

function Empty({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <Inbox className="size-12 text-muted-foreground" />
      <strong className="font-heading text-lg">{title}</strong>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  )
}
