# Tehilla Deployment

This project runs as three Railway services plus Vercel for the frontend:

| Surface       | Where        | What                                       |
| ------------- | ------------ | ------------------------------------------ |
| `frontend`    | Vercel       | Static SPA built from `frontend/`          |
| `api`         | Railway      | Express API from `backend/`                |
| `worker`      | Railway      | BullMQ payment worker from `backend/`      |
| `postgres`    | Railway      | Managed Postgres (or Supabase Pro)         |
| `redis`       | Railway      | Managed Redis (rate limits, queues, cache) |

## Frontend (Vercel)

- App root: `frontend/`
- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrite: `frontend/vercel.json`
- Production env vars (required):
  - `VITE_API_URL=https://<api-service>.up.railway.app/api`
  - `VITE_APP_MODE=production`
  - `VITE_DEMO_FALLBACK=false`
  - `VITE_SENTRY_DSN=https://...@sentry.io/...`

The Vite config (`frontend/vite.config.js`) refuses to build for production if any of
`VITE_DEMO_FALLBACK`, `VITE_APP_MODE`, `VITE_API_URL`, or `VITE_SENTRY_DSN` are
misconfigured. Demo builds use `vite build --mode demo` so the assertion is skipped.

Before deploying the live frontend:

```bash
cd frontend
npm run readiness:env
npm run build
```

Run demo deployments as a separate Vercel project with `VITE_APP_MODE=demo`.
Never point a demo deployment at live payment credentials or production data.

## Backend (Railway `api` service)

- App root: `backend/`
- Build: Nixpacks (see `backend/railway.toml`)
- Build command: `npx prisma generate --schema src/prisma/schema.prisma`
- Release command (runs before each deploy): `npx prisma migrate deploy --schema src/prisma/schema.prisma`
- Start command: `npm start`
- Health check: `GET /health`
- Required env vars (set in the Railway service, not in `.env`):
  - `NODE_ENV=production`
  - `PORT=5000` (Railway assigns this automatically; leave unset if Railway injects it)
  - `DATABASE_URL` — pooled Postgres connection
  - `DIRECT_URL` — migration-capable Postgres connection
  - `JWT_SECRET` — `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
  - `ACCESS_TOKEN_TTL=15m`
  - `REFRESH_TOKEN_DAYS=30`
  - `REDIS_URL` — Railway Redis `REDIS_URL` from the `redis` service
  - `REDIS_REQUIRED=true`
  - `PAYSTACK_SECRET_KEY=sk_live_...`
  - `PAYMENT_MOCKS_ENABLED=false` (fails startup in production if true)
  - `FRONTEND_URL=https://<your-vercel-app>.vercel.app`
  - `SENTRY_DSN=https://...@sentry.io/...`
  - `RESEND_API_KEY`, `EMAIL_FROM` (or complete SMTP credentials)
  - `KYC_ENCRYPTION_KEY` — `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
  - `LOG_LEVEL=info`
  - `METRICS_ENABLED=true`
  - `REQUEST_TIMEOUT_MS=30000`
  - `RATE_LIMIT_WINDOW_MS=900000`
  - `API_RATE_LIMIT=300`
  - `AUTH_RATE_LIMIT=20`

`backend/src/config/env.js` fails startup in production when any required secret
is missing, when `REDIS_REQUIRED` is not true, when `PAYMENT_MOCKS_ENABLED` is not
explicitly `false`, or when Sentry/KYC encryption is missing.

Before deploying the live API:

```bash
cd backend
npm run readiness:env
npm run readiness:db
npm test
```

## Worker (Railway `worker` service)

- App root: `backend/` (same repo path; uses `backend/railway.worker.toml`)
- Build command: `npx prisma generate --schema src/prisma/schema.prisma`
- Start command: `npm run worker:payments`
- Shares the same `DATABASE_URL`, `DIRECT_URL`, `REDIS_URL`, `SENTRY_DSN`,
  `PAYSTACK_SECRET_KEY`, and SMTP vars as the `api` service.
- A worker service does not need `FRONTEND_URL` or `JWT_SECRET`.

To add it in Railway: New Service → "Deploy from the same repo" → set root to
`backend/` → override the start command to `npm run worker:payments` (or use the
provided `railway.worker.toml`).

Run `npm run readiness:env` against the worker env too. The worker should share
the same Redis, database, Paystack, Sentry, email, and KYC settings as the API.

## Postgres & Redis (Railway)

- Create a Postgres service in the same project. Copy the pooled connection
  string into `DATABASE_URL` and the direct (non-pooled) string into
  `DIRECT_URL`.
- For Supabase, use the pooler/runtime URL in `DATABASE_URL`. If the deploy
  environment cannot reach Supabase's IPv6-only direct host, use Supabase's
  session pooler URL in `DIRECT_URL` so Prisma migrations can still run.
- Create a Redis service in the same project. Copy its `REDIS_URL` into both
  the `api` and `worker` services.
- Enable automatic daily backups on the Postgres service. Document the
  restore runbook in `RUNBOOKS.md` before launch.

## First Admin

Do not run the demo seed in production. Demo seed now refuses `NODE_ENV=production`.

To create the first admin:

```bash
cd backend
ADMIN_EMAIL=admin@tehilla.work ADMIN_TEMP_PASSWORD=<secure-temporary-password> npm run db:seed:admin
```

After first login, rotate the password through the reset-password flow and remove
`ADMIN_EMAIL` / `ADMIN_TEMP_PASSWORD` from the hosting environment.

## Live Payment Flow

- Brand creates an offer.
- Creator accepts the offer.
- Brand starts Paystack Checkout from the accepted offer.
- Paystack `charge.success` or backend transaction verification records the transaction as paid and moves the offer to `FUNDED`.
- Creator submits work, moving the offer to `SUBMITTED`.
- Brand approves work, moving the offer to `APPROVED`, then queues Paystack payout.
- Paystack `transfer.success` is the only path that marks payout `COMPLETED`, marks transaction `completed`, credits creator balance, writes the ledger entry, and marks the offer `COMPLETED`.
- Paystack failure/reversal returns the transaction to `paid`, restores the offer to `APPROVED`, and leaves payout retryable.

## Load Testing

Local smoke load test:

```bash
docker run --rm -i grafana/k6:latest run -e BASE_URL=http://host.docker.internal:5000 - < load/k6-smoke.js
```

Staging/production viral launch test:

```bash
k6 run -e BASE_URL=https://<api-service>.up.railway.app load/k6-viral-launch.js
```

Acceptance targets:

- Cached read p95 under 300ms
- Write p95 under 800ms
- Error rate under 1%
- No unbounded list responses

For a Supabase free/shared soft launch, keep the first week to a small controlled
audience and upgrade before any broad public campaign.

## Staging vs Production

Use two Railway environments in the same project:

- **staging** — Vercel preview branch, Railway `staging` environment with
  Paystack test keys, `VITE_API_URL` pointing at the staging API.
- **production** — main branch, Railway `production` environment with
  Paystack live keys, `VITE_API_URL` pointing at the production API.

Never run a production migration against staging after staging has been seeded
with test data — branch the database or restore a snapshot instead.

## Local Verification

For local readiness checks, start Docker Postgres + Redis and use `backend/.env.local.example` values:

```bash
cd backend
npm run infra:up

# Windows PowerShell example if you do not want to overwrite backend/.env:
$env:DATABASE_URL="postgresql://tehilla:password@127.0.0.1:15432/tehilla?schema=public"
$env:DIRECT_URL=$env:DATABASE_URL
$env:REDIS_URL="redis://localhost:6379"

npm run db:migrate:deploy
npm run db:seed:demo
npm start
```

Then verify:

```bash
curl http://localhost:5000/health
curl http://localhost:5000/ready
curl http://localhost:5000/metrics
```

Full local checks:

```bash
cd frontend
npm run build
npm audit --audit-level=moderate

cd ../backend
npm run db:generate
npm test
npm audit --audit-level=moderate
```
