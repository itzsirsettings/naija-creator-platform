"use client"

import { Component, type ReactNode } from "react"

export function captureError(error: unknown, context?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error)
  if (process.env.NODE_ENV !== "production") {
    console.error("[tehilla:error]", { message, error, context })
  }
}

export function initErrorReporter() {
  const onError = (event: ErrorEvent) => captureError(event.error ?? event.message)
  const onRejection = (event: PromiseRejectionEvent) => captureError(event.reason)
  window.addEventListener("error", onError)
  window.addEventListener("unhandledrejection", onRejection)
  return () => {
    window.removeEventListener("error", onError)
    window.removeEventListener("unhandledrejection", onRejection)
  }
}

interface ErrorBoundaryProps { children: ReactNode; fallback?: ReactNode }
interface ErrorBoundaryState { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) { return { hasError: true, error } }

  componentDidCatch(error: Error, info: React.ErrorInfo) { captureError(error, { componentStack: info.componentStack }) }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <main className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="text-center">
            <h1 className="font-heading text-lg">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">An unexpected error occurred. You can try again below.</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
