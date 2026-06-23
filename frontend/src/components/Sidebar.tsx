"use client"

import {
  BarChart3, Building2, ChevronsUpDown, Crown, FileText, Handshake, LayoutDashboard, Link2, LogOut,
  Megaphone, Search, Settings, Users, Wallet,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { Link, useNavigate } from "@/lib/router"
import { usePremium } from "@/hooks/usePremium"
import { useBrandPremium } from "@/hooks/useBrandPremium"
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext"
import { initials } from "@/utils/format"

const activeClass =
  "rounded-xl data-[active=true]:bg-[#2f6bff] data-[active=true]:text-white data-[active=true]:font-semibold data-[active=true]:shadow-[0_8px_20px_-6px_rgba(47,107,255,0.7)] data-[active=true]:hover:bg-[#2563eb] data-[active=true]:hover:text-white"

export function AppSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname() ?? ""
  const navigate = useNavigate()
  const ent = usePremium()
  const brandEnt = useBrandPremium()

  const displayName = user?.brandName || user?.name || "Guest"
  const isBrand = user?.role === "brand"

  const navItems = [
    { label: "Home", to: "/home", icon: LayoutDashboard },
    { label: "Dashboard", to: "/dashboard", icon: BarChart3 },
    { label: "Discover", to: "/discover", icon: Search },
    { label: "Campaigns", to: "/campaigns", icon: Megaphone },
    { label: "Offers", to: "/offers", icon: Handshake },
    { label: isBrand ? "Applications" : "My Applications", to: "/applications", icon: FileText },
    // Creator premium tools - surfaced once unlocked by the active plan.
    ...(!isBrand && ent.affiliateDeals ? [{ label: "Affiliate", to: "/affiliate", icon: Link2 }] : []),
    ...(!isBrand && ent.proposalTemplateManager ? [{ label: "Templates", to: "/templates", icon: FileText }] : []),
    ...(!isBrand && ent.teamManagement ? [{ label: "Team", to: "/team", icon: Users }] : []),
    // Brand premium tools.
    ...(isBrand && brandEnt.agencyWorkspace ? [{ label: "Agency", to: "/agency", icon: Building2 }] : []),
    { label: "Payments", to: "/payments", icon: Wallet },
    { label: isBrand ? "Brand Plans" : "Premium", to: "/premium", icon: Crown },
  ]

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip={displayName} className="group-data-[collapsible=icon]:justify-center">
                  <Avatar className="size-8 shrink-0 rounded-lg border border-border">
                    {user?.avatar && /^https?:\/\//i.test(user.avatar) ? <AvatarImage src={user.avatar} alt="" /> : null}
                    <AvatarFallback className="rounded-lg bg-[#2f6bff]/10 text-[11px] font-semibold text-[#2f6bff]">
                      {user ? initials(user.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="break-words text-sm font-semibold text-foreground">{displayName}</span>
                    <span className="break-words text-[11px] capitalize text-muted-foreground">{user?.role || "guest"}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="start"
                sideOffset={8}
                className="min-w-[220px] bg-white/75 backdrop-blur-xl border border-white/40 shadow-xl dark:bg-neutral-900/80 dark:border-white/10"
              >
                <DropdownMenuLabel className="p-0">
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <Avatar className="size-9 shrink-0 rounded-lg border border-border">
                      {user?.avatar && /^https?:\/\//i.test(user.avatar) ? <AvatarImage src={user.avatar} alt="" /> : null}
                      <AvatarFallback className="rounded-lg bg-[#2f6bff]/10 text-[11px] font-semibold text-[#2f6bff]">
                        {user ? initials(user.name) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid min-w-0 flex-1 leading-tight">
                      <span className="truncate text-[13px] font-semibold text-foreground">{displayName}</span>
                      <span className="truncate text-[11px] capitalize text-muted-foreground">{user?.role || "guest"}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="gap-2.5 text-[13px] text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30"
                >
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.to || (item.to !== "/home" && pathname.startsWith(item.to))
              return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.label} className={activeClass}>
                    <Link to={item.to}>
                      <Icon className="shrink-0" />
                      <span className="whitespace-nowrap group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel>Utilities</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/settings"} tooltip="Settings" className={activeClass}>
                <Link to="/settings">
                  <Settings className="shrink-0" />
                  <span className="whitespace-nowrap group-data-[collapsible=icon]:hidden">Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
