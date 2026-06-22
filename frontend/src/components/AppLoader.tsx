"use client"

import { useEffect, useState } from "react"

const MIN_DISPLAY_MS = 0

export function AppLoader({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), MIN_DISPLAY_MS)
    return () => clearTimeout(timer)
  }, [])

  if (!ready) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          zIndex: 9999,
        }}
      >
        <img
          src="/Tehilla_logo_loading.gif"
          alt="Loading Tehilla…"
          className="w-[56px] sm:w-[72px] md:w-[90px] h-auto"
          priority-hint="high"
        />
      </div>
    )
  }

  return <>{children}</>
}
