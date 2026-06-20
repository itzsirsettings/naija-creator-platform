"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { RouteFallback } from "@/components/RouteFallback"
import AppShell from "@/AppShell"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    } else if (user?.role !== "admin") {
      router.replace("/dashboard")
    }
  }, [isLoading, isAuthenticated, user, pathname, router])

  if (isLoading || !isAuthenticated || user?.role !== "admin") {
    return <RouteFallback label="Checking access" />
  }

  return <AppShell>{children}</AppShell>
}
