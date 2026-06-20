"use client"

import { useEffect } from "react"
import { ThemeProvider } from "@/context/ThemeContext"
import { AuthProvider } from "@/context/AuthContext"
import { AppDataProvider } from "@/context/AppDataContext"
import { ErrorBoundary, initErrorReporter } from "@/lib/errorReporter"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppLoader } from "@/components/AppLoader"

const errorFallback = (
  <main className="flex min-h-screen items-center justify-center bg-background p-6">
    <section className="tehilla-panel rounded-lg px-6 py-5 text-center">
      <h1 className="font-heading text-lg">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Refresh the page or contact support if this continues.
      </p>
    </section>
  </main>
)

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const teardown = initErrorReporter()
    return teardown
  }, [])

  return (
    <ErrorBoundary fallback={errorFallback}>
      <AppLoader>
        <ThemeProvider>
          <AuthProvider>
            <AppDataProvider>
              <TooltipProvider delayDuration={0}>
                <ErrorBoundary>{children}</ErrorBoundary>
              </TooltipProvider>
            </AppDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </AppLoader>
    </ErrorBoundary>
  )
}
