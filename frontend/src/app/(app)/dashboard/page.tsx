"use client"

import { useAuth } from "@/context/AuthContext"
import BrandDashboard from "@/pages/app/BrandDashboard"
import CreatorDashboard from "@/pages/app/CreatorDashboard"

export default function DashboardRoute() {
  const { user } = useAuth()
  // Only an explicit brand role sees the brand dashboard. Everyone else -
  // creators, or any ambiguous/loading state - gets the creator view, so a
  // creator can never be shown a brand account.
  if (user?.role === "brand") return <BrandDashboard />
  return <CreatorDashboard />
}
