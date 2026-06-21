import { useMemo } from "react"
import { useAuth } from "@/context/AuthContext"
import { computeEntitlements, type Entitlements } from "@/lib/tiers"

export function usePremium(): Entitlements {
  const { user } = useAuth()
  return useMemo(
    () => computeEntitlements(user?.premiumTier ?? "NONE", user?.premiumActive ?? false),
    [user?.premiumTier, user?.premiumActive],
  )
}
