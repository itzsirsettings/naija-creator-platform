import * as Sentry from "@sentry/react";

export function initErrorReporter() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 0,
  });
}

export const ErrorBoundary = Sentry.ErrorBoundary;
