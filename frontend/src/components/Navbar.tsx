"use client"

import { Bell, ChevronDown, LogOut, Moon, ShieldCheck, ShieldX, Sun, WalletCards } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { initials } from "@/utils/format"
import { toast } from "sonner"

const kycBadge: Record<string, { label: string; Icon: typeof ShieldCheck; className: string }> = {
  NONE: { label: "ID not submitted", Icon: ShieldX, className: "bg-red-50 text-red-700 border-red-500" },
  PENDING: { label: "ID under review", Icon: ShieldX, className: "bg-amber-50 text-amber-700 border-amber-500" },
  VERIFIED: { label: "ID verified", Icon: ShieldCheck, className: "bg-[#1A24B8]/10 text-[#1A24B8] border-[#1A24B8]" },
  REJECTED: { label: "ID needs update", Icon: ShieldX, className: "bg-red-100 text-red-800 border-red-600" },
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { isLight, toggleTheme } = useTheme()
  const currentKyc = user ? (kycBadge[user.kycStatus] || kycBadge.NONE) : null
  const ThemeIcon = isLight ? Moon : Sun

  return (
    <div className="flex flex-1 items-center justify-end py-2 text-foreground">
      <div className="flex items-center gap-3">
        {currentKyc ? (
          <Badge className={`hidden gap-1 sm:inline-flex border-2 rounded-lg px-2.5 py-0.5 text-xs font-bold ${currentKyc.className}`}>
            <currentKyc.Icon className="size-3 stroke-[2.5]" />
            {currentKyc.label}
          </Badge>
        ) : null}

        <button
          onClick={() => toast("Currency is set to NGN for this marketplace.")}
          aria-label="Currency: Nigerian Naira"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <WalletCards className="size-3.5 stroke-[2.5]" /> NGN <ChevronDown className="size-3" />
        </button>

        <button
          onClick={() => toast("3 campaign messages are ready in Offers.")}
          aria-label="Notifications (3 unread)"
          className="relative hidden sm:inline-flex items-center justify-center size-8 rounded-lg border border-border bg-card shadow-sm transition-colors hover:bg-muted"
        >
          <Bell className="size-4 stroke-[2.5]" />
          <span aria-hidden="true" className="absolute -top-1 -right-1 size-2 rounded-full border border-white bg-[#1A24B8]" />
        </button>

        <button
          onClick={toggleTheme}
          aria-label={isLight ? "Switch to dark" : "Switch to light"}
          className="inline-flex items-center justify-center size-8 rounded-lg border border-border bg-card shadow-sm transition-colors hover:bg-muted"
        >
          <ThemeIcon className="size-4 stroke-[2.5]" />
        </button>

        <button
          onClick={() => { logout(); toast("Signed out.") }}
          aria-label="Log out"
          className="hidden sm:inline-flex items-center justify-center size-8 rounded-lg border border-border bg-card shadow-sm transition-colors hover:bg-muted"
        >
          <LogOut className="size-4 stroke-[2.5]" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted">
              <Avatar className="size-6 border border-border">
                {user?.avatar && /^https?:\/\//i.test(user.avatar) ? <AvatarImage src={user.avatar} alt="" /> : null}
                <AvatarFallback className="text-[10px] bg-[#1A24B8]/10 text-[#1A24B8] font-black">{user ? initials(user.name) : "?"}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline max-w-[100px] truncate">{user?.brandName || user?.name || "Guest"}</span>
              <ChevronDown className="size-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white/75 backdrop-blur-xl border border-white/40 shadow-xl dark:bg-neutral-900/80 dark:border-white/10">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-foreground">{user?.brandName || user?.name || "Guest"}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{user?.role || "guest"} account</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast("Profile settings coming soon.")} className="font-medium text-xs text-foreground focus:bg-[#1A24B8]/10 focus:text-[#1A24B8]">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { logout(); toast("Signed out.") }} className="font-semibold text-xs text-red-600 focus:bg-red-50 focus:text-red-700">
              <LogOut className="mr-2 size-4 stroke-[2.5]" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
