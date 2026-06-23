"use client"

import { Suspense } from "react"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/Sidebar"
import Navbar from "@/components/Navbar"
import { RouteFallback } from "@/components/RouteFallback"
import { Toaster } from "@/components/ui/sonner"

// Shared app chrome — a blue gradient frame with the sidebar + content sitting in
// a floating inset panel, matching the admin dashboard's design language.
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="bg-[radial-gradient(130%_130%_at_75%_-12%,#5E5AA8_0%,#0A0A9F_44%,#1A1B2E_100%)]">
      <AppSidebar />
      <SidebarInset className="bg-[linear-gradient(135deg,#F4F4F7,#EDEAF6)] dark:bg-none dark:bg-background">
        <header className="flex h-14 items-center gap-2 border-b border-border/60 bg-transparent px-4 sm:gap-4 sm:px-6">
          <SidebarTrigger className="border border-border bg-card rounded-lg shadow-sm hover:bg-muted size-8 shrink-0" />
          <Navbar />
        </header>
        <div className="min-w-0 flex-1 overflow-auto p-4 sm:p-6">
          <Suspense fallback={<RouteFallback label="Loading" />}>
            {children}
          </Suspense>
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
