"use client"
import { Suspense } from "react"
import ResetPassword from "@/pages/ResetPassword"

export default function ResetPasswordRoute() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  )
}
