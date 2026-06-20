"use client"

import { Suspense } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/Sidebar"
import Navbar from "@/components/Navbar"
import { RouteFallback } from "@/components/RouteFallback"
import { Toaster } from "@/components/ui/sonner"

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col bg-background">
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-6">
          <SidebarTrigger className="border border-border bg-card rounded-lg shadow-sm hover:bg-muted size-8" />
          <Navbar />
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Suspense fallback={<RouteFallback label="Loading" />}>
            {children}
          </Suspense>
        </div>
      </main>
      <Toaster />
    </SidebarProvider>
  )
}
