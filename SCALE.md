# Tehilla Viral-Launch Architecture

## Production Shape

- React frontend on Vercel or equivalent CDN hosting.
- Express API as stateless containers on Render/Fly/Railway, minimum two instances.
- Supabase Postgres Pro for relational data and durable money records.
- Redis for distributed rate limits, cache, queues, and idempotency coordination.
- Payments worker process for Paystack webhook jobs and payout workflows.
- Prometheus-compatible `/metrics` plus hosted error tracking.

## Data Rules

- Money is stored as integer kobo: `amountKobo`, `grossKobo`, `feeKobo`, `netKobo`, `balanceKobo`.
- Public API responses may include legacy naira fields for frontend compatibility.
- Balance changes require a `LedgerEntry`.
- Creator payout balance credits only happen after Paystack `transfer.success`.
- Offers move through `PENDING -> ACCEPTED -> FUNDED -> SUBMITTED -> APPROVED -> COMPLETED`; `DISPUTED` pauses payout review.
- Provider webhook IDs are unique per provider and must be replay-safe.
- Write endpoints that can create money side effects should accept `Idempotency-Key`.

## Performance Rules

- Public lists use cursor pagination and cap `limit` at 50.
- Cache discovery and dashboard summary reads.
- Keep database queries bounded and indexed before increasing traffic.
- Use Supabase pooler for runtime connections and direct connection for migrations.

## Launch Gates

- `/health`, `/ready`, and `/metrics` healthy.
- `npm run build`, `npm test`, and audits pass.
- `npm run readiness:env` passes for frontend, API, and worker envs.
- `npm run readiness:db` confirms Prisma schema and migration status.
- k6 viral launch script meets thresholds.
- Paystack test-mode webhooks replay without duplicate side effects.
- Production env fails closed if live Paystack, Redis, email, Sentry, KYC encryption, migration URL, or frontend origin config are missing.
- Separate demo deployment uses `VITE_APP_MODE=demo` and never shares the live database.
- Database restore and failed payout runbooks have been rehearsed.
- Supabase free/shared launches are capped to a small controlled audience until the project is upgraded.
