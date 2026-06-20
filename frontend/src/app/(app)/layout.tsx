"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { RouteFallback } from "@/components/RouteFallback"
import AppShell from "@/AppShell"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isLoading, isAuthenticated, pathname, router])

  if (isLoading || !isAuthenticated) {
    return <RouteFallback label="Checking access" />
  }

  return <AppShell>{children}</AppShell>
}
