"use client"
import { Suspense } from "react"
import VerifyEmail from "@/pages/VerifyEmail"

export default function VerifyEmailRoute() {
  return (
    <Suspense fallback={null}>
      <VerifyEmail />
    </Suspense>
  )
}
