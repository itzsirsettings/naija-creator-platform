"use client"

import { usePathname } from "next/navigation"
import { useNavigate } from "@/lib/router"
import { useAuth } from "@/context/AuthContext"
import {
  Bell, Cpu, HelpCircle, LayoutGrid, ListChecks,
  LogOut, Settings, Users, Webhook,
} from "lucide-react"

const NAV = [
  { label: "Overview",   icon: LayoutGrid, to: "/admin",            exact: true },
  { label: "Webhooks",   icon: Webhook,    to: "/admin/webhooks"               },
  { label: "Operations", icon: ListChecks, to: "/admin/operations"             },
  { label: "Users",      icon: Users,      to: "/admin/users"                  },
  { label: "Settings",   icon: Settings,   to: "/admin/settings"               },
  { label: "Help",       icon: HelpCircle, to: "/admin/help"                   },
]

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/admin":            { title: "Overview",    subtitle: "Platform health at a glance" },
  "/admin/webhooks":   { title: "Webhooks",    subtitle: "Live Paystack delivery & processing" },
  "/admin/operations": { title: "Operations",  subtitle: "Offers, disputes, and resolution" },
  "/admin/users":      { title: "Users",       subtitle: "Platform accounts and verification" },
  "/admin/settings":   { title: "Settings",    subtitle: "Platform configuration" },
  "/admin/help":       { title: "Help",        subtitle: "Documentation and support" },
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const pathname = usePathname() ?? "/admin"

  const meta = PAGE_META[pathname] ?? { title: "Admin", subtitle: "" }
  const userName = user?.name ?? "Admin"

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(130%_130%_at_75%_-12%,#5E5AA8_0%,#0A0A9F_44%,#1A1B2E_100%)] p-3 sm:p-6">
      <div className="mx-auto flex max-w-[1180px] overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,#F4F4F7,#EDEAF6)] shadow-[0_30px_80px_-20px_rgba(10,10,159,0.45)] ring-1 ring-white/40">

        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col justify-between bg-white/90 px-5 py-6 lg:flex">
          <div>
            <div className="mb-9 flex items-center gap-2 px-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#0A0A9F,#5E5AA8)] text-white">
                <Cpu className="size-4" />
              </span>
              <span className="font-heading text-lg font-bold tracking-tight text-slate-900">Tehilla</span>
            </div>
            <nav className="space-y-1">
              {NAV.map((item) => {
                const Icon = item.icon
                const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to)
                return (
                  <button
                    key={item.to}
                    onClick={() => navigate(item.to)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#0A0A9F] text-white shadow-[0_8px_20px_-6px_rgba(10,10,159,0.7)]"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                  >
                    <Icon className="size-[18px]" />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </div>
          <button
            onClick={() => { void logout(); navigate("/login") }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <LogOut className="size-[18px]" /> Log Out
          </button>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7">
          <header className="mb-6 flex items-center gap-3">
            <div className="flex-1">
              <h1 className="font-heading text-lg font-bold tracking-tight text-slate-900">{meta.title}</h1>
              <p className="text-xs text-slate-400">{meta.subtitle}</p>
            </div>
            <button className="flex size-10 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200">
              <Bell className="size-[18px]" />
            </button>
            <div className="flex items-center gap-2 pl-1">
              <span className="flex size-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0A0A9F,#5E5AA8)] text-sm font-semibold text-white">
                {userName.charAt(0).toUpperCase()}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-semibold text-slate-800">{userName}</p>
                <p className="text-[11px] text-slate-400">Platform Admin</p>
              </div>
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  )
}
