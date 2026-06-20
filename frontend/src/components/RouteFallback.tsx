export function RouteFallback({ label = "Loading" }: { label?: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white" role="status" aria-live="polite" aria-busy="true">
      <div className="rounded-2xl border border-border px-8 py-6 text-center shadow-sm">
        <div className="mx-auto mb-3 size-8 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-[#1A24B8]" aria-hidden="true" />
        <p className="text-sm font-runde text-muted-foreground">{label}</p>
      </div>
    </main>
  )
}
