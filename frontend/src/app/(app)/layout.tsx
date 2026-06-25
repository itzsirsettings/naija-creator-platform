"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import AppShell from "@/AppShell"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    } else if (user?.role === "admin") {
      router.replace("/admin")
    }
  }, [isLoading, isAuthenticated, user, pathname, router])

  if (isLoading || !isAuthenticated || user?.role === "admin") {
    return null
  }

  return <AppShell>{children}</AppShell>
}
