import { Loader2 } from "lucide-react";

export function RouteFallback({ label = "Loading" }) {
  return (
    <main className="route-fallback" role="status" aria-live="polite" aria-busy="true">
      <div className="route-fallback-card">
        <Loader2 className="route-fallback-spinner" aria-hidden="true" />
        <p className="route-fallback-label">{label}</p>
      </div>
    </main>
  );
}
