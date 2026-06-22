import { useMemo } from "react"
import { useAuth } from "@/context/AuthContext"
import { computeBrandEntitlements, type BrandEntitlements } from "@/lib/tiers"

export function useBrandPremium(): BrandEntitlements {
  const { user } = useAuth()
  return useMemo(
    () => computeBrandEntitlements(user?.premiumTier ?? "NONE", user?.premiumActive ?? false),
    [user?.premiumTier, user?.premiumActive],
  )
}
