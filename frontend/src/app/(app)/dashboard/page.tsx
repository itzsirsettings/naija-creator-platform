"use client"

import { useAuth } from "@/context/AuthContext"
import BrandDashboard from "@/pages/app/BrandDashboard"
import CreatorDashboard from "@/pages/app/CreatorDashboard"

export default function DashboardRoute() {
  const { user } = useAuth()
  if (user?.role === "creator") return <CreatorDashboard />
  return <BrandDashboard />
}
