# Tehilla Deployment

Current stack: **Next.js (App Router) frontend on Vercel**, **Fastify + TypeScript API
on Railway**, **BullMQ worker on Railway**, **Neon Postgres**, **Railway Redis**.

| Surface     | Where   | What                                               |
| ----------- | ------- | -------------------------------------------------- |
| `frontend`  | Vercel  | Next.js app built from `frontend/`                 |
| `api`       | Railway | Fastify/TypeScript API from `backend/`             |
| `worker`    | Railway | BullMQ payment worker from `backend/`              |
| `postgres`  | Neon    | Managed Postgres (pooled + direct endpoints)       |
| `redis`     | Railway | Managed Redis (rate limits, queues, cache)         |

Production domains:

- Frontend: `https://tehilla.work` (apex 308-redirects to `https://www.tehilla.work`)
- API: `https://api.tehilla.work` (Railway custom domain → CNAME at the DNS provider)

---

## Frontend (Vercel)

- **Root directory:** `frontend/` (set in Vercel → Project → Settings → Build & Deployment → Root Directory)
- **Framework preset:** Next.js (auto-detected; see `frontend/vercel.json`)
- **Build command:** `npm run build` (`next build`)
- **Output:** `.next` (managed by Vercel; do **not** set output directory to `dist`)
- **Security headers:** `frontend/vercel.json`

### Frontend env vars (set in Vercel → Project → Settings → Environment Variables)

| Variable                   | Value / Notes                                                                 |
| -------------------------- | ----------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`      | Live API base ending in `/api`, e.g. `https://api.tehilla.work/api`. The browser calls this directly. |
| `BACKEND_URL`              | API origin (no `/api`), e.g. `https://api.tehilla.work`. Used by `next.config.mjs` to rewrite `/api/*` server-side. Baked at **build time**. |
| `NEXT_PUBLIC_DEMO_FALLBACK`| `false` in production (must not serve mock data).                             |
| `NEXT_PUBLIC_SENTRY_DSN`   | Frontend Sentry DSN (`https://...@sentry.io/...`).                            |

> `BACKEND_URL` is read at build time by `next.config.mjs`, so changing it requires a
> redeploy. If `NEXT_PUBLIC_API_URL` is blank, the browser falls back to the same-origin
> `/api` proxy, which `next.config.mjs` rewrites to `BACKEND_URL`.

### Frontend preflight

```bash
cd frontend
npm run readiness:env   # validates NEXT_PUBLIC_* + BACKEND_URL against .env.production
npm run build
```

---

## Backend (Railway `api` service)

- **Root directory:** `backend/`
- **Builder:** Nixpacks (see `backend/railway.toml`)
- **Build command:** `npx prisma generate --schema src/prisma/schema.prisma && npm run build`
- **Release command** (runs before each deploy): `npx prisma migrate deploy --schema src/prisma/schema.prisma`
- **Start command:** `npm start` (`node dist/app.js`)
- **Health check:** `GET /health` → `{ "status": "ok" }`
- **Readiness:** `GET /ready` → runs `SELECT 1` against Postgres
- **Metrics:** `GET /metrics` (Prometheus, when `METRICS_ENABLED=true`)

Environment is validated at startup by `backend/src/config/config.ts` (Zod). In
production the process **exits on boot** if any required secret is missing or still a
placeholder, if `REDIS_REQUIRED=true` but `REDIS_URL` is empty, if
`PAYMENT_MOCKS_ENABLED` is not `false`, or if `PAYMENT_PROVIDER` is not `paystack`.

### Backend env vars (set in the Railway service, NOT in a committed `.env`)

| Variable                | Value / Notes                                                                 |
| ----------------------- | ----------------------------------------------------------------------------- |
| `NODE_ENV`              | `production`                                                                   |
| `PORT`                  | `5000` (Railway injects its own; leave unset if Railway provides it)           |
| `DATABASE_URL`          | Neon **pooled** connection (`...-pooler...neon.tech/...?sslmode=require`)      |
| `DIRECT_URL`            | Neon **unpooled/direct** connection — used by `prisma migrate deploy`          |
| `JWT_SECRET`            | ≥48 chars. `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `ACCESS_TOKEN_TTL`      | `15m`                                                                          |
| `REFRESH_TOKEN_DAYS`    | `30`                                                                           |
| `FRONTEND_URL`          | `https://www.tehilla.work` (drives CORS allow-list)                            |
| `ALLOWED_ORIGINS`       | Extra comma-separated origins if needed (e.g. `https://tehilla.work`)          |
| `REDIS_URL`             | Railway Redis URL. `redis.railway.internal` only resolves **inside** Railway.  |
| `REDIS_REQUIRED`        | `true` (service exits on boot if Redis is unreachable)                         |
| `PAYSTACK_SECRET_KEY`   | `sk_live_...`                                                                  |
| `PAYMENT_PROVIDER`      | `paystack` (only provider wired at launch)                                     |
| `PAYMENT_MOCKS_ENABLED` | `false` (startup fails in production if `true`)                                |
| `KYC_ENCRYPTION_KEY`    | base64 of 32 bytes. `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `RESEND_API_KEY`        | Resend key (or set `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`)            |
| `EMAIL_FROM`            | e.g. `Tehilla <no-reply@tehilla.work>`                                         |
| `SENTRY_DSN`            | Backend Sentry DSN                                                             |
| `LOG_LEVEL`             | `info`                                                                         |
| `METRICS_ENABLED`       | `true`                                                                         |
| `REQUEST_TIMEOUT_MS`    | `30000`                                                                        |
| `RATE_LIMIT_WINDOW_MS`  | `900000`                                                                       |
| `API_RATE_LIMIT`        | `300`                                                                          |
| `AUTH_RATE_LIMIT`       | `20`                                                                           |

Optional (Upstash REST cache, if used instead of/alongside Redis):
`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

### Backend custom domain (api.tehilla.work)

1. Railway → `api` service → Settings → Networking → **Custom Domain** → add `api.tehilla.work`.
2. Railway returns a CNAME target (e.g. `<id>.up.railway.app`).
3. At the DNS provider (Spaceship for `tehilla.work`): add a `CNAME` record
   `api` → that Railway target.
4. Verify: `curl https://api.tehilla.work/health` returns `{ "status": "ok" }`.
   Until the record resolves on public DNS (`nslookup api.tehilla.work 1.1.1.1`),
   the frontend cannot reach the API.

### Backend preflight

```bash
cd backend
npm run db:generate     # prisma generate
npm run build           # tsc
npm test                # vitest
npx prisma migrate status --schema src/prisma/schema.prisma
```

---

## Worker (Railway `worker` service)

- **Root directory:** `backend/` (same repo path; uses `backend/railway.worker.toml`)
- **Build command:** `npx prisma generate --schema src/prisma/schema.prisma`
- **Start command:** `npm run worker:payments`
- Shares `DATABASE_URL`, `DIRECT_URL`, `REDIS_URL`, `SENTRY_DSN`,
  `PAYSTACK_SECRET_KEY`, and email/KYC vars with the `api` service.
- Does **not** need `FRONTEND_URL` or `JWT_SECRET`.

To add it: Railway → New Service → "Deploy from the same repo" → root `backend/` →
override start command to `npm run worker:payments` (or point it at `railway.worker.toml`).

---

## Postgres (Neon) & Redis (Railway)

- **Neon:** copy the **pooled** connection string into `DATABASE_URL` and the
  **direct** (non-pooled) string into `DIRECT_URL`. Both need `sslmode=require`.
  Migrations run via the Railway release command (`prisma migrate deploy`).
  Neon serverless compute can suspend; the direct endpoint may drop the first
  connection while waking — retry once.
- **Redis:** create a Redis service in the Railway project and copy its `REDIS_URL`
  into both the `api` and `worker` services. Enable Neon point-in-time restore /
  backups before launch (see `RUNBOOKS.md`).

---

## First Admin

The demo seed has been removed — the only seed is the real admin bootstrap below.

```bash
cd backend
ADMIN_EMAIL=admin@tehilla.work ADMIN_TEMP_PASSWORD=<secure-temp-password> npm run db:seed:admin
```

After first login, rotate the password via the reset-password flow and remove
`ADMIN_EMAIL` / `ADMIN_TEMP_PASSWORD` from the environment.

---

## Live Payment Flow (escrow)

- Brand creates an offer → creator accepts.
- Brand funds via Paystack Checkout; `charge.success` (or backend verification)
  records the transaction paid and moves the offer to `FUNDED` (funds held).
- Creator submits work → offer `SUBMITTED`.
- Brand approves → offer `APPROVED`; balance becomes withdrawable.
- Payout request **reserves** (debits) the creator balance atomically, then calls
  Paystack Transfer → offer/payout `PROCESSING`.
- `transfer.success` marks payout `COMPLETED` and offer `COMPLETED` (no second debit —
  the balance was already reserved).
- `transfer.failed` / `transfer.reversed` marks the payout `FAILED`/`REVERSED` and
  **refunds the reservation** back to the creator balance.

---

## Staging vs Production

- **staging** — Vercel preview branch + a Railway `staging` environment with Paystack
  **test** keys; `NEXT_PUBLIC_API_URL` pointing at the staging API.
- **production** — `master` branch + Railway `production` environment with Paystack
  **live** keys; `NEXT_PUBLIC_API_URL` pointing at the production API.

Never run a production migration against a staging DB seeded with test data — branch
the database or restore a snapshot instead.

---

## Local Verification

Local API against Docker Postgres + Redis (uses `backend/.env.local.example` values):

```bash
# PowerShell example that doesn't overwrite backend/.env:
$env:DATABASE_URL="postgresql://tehilla:password@127.0.0.1:15432/tehilla?schema=public"
$env:DIRECT_URL=$env:DATABASE_URL
$env:REDIS_URL="redis://localhost:6379"
$env:REDIS_REQUIRED="false"

cd backend
npm run db:migrate:deploy
npm start
```

Then:

```bash
curl http://localhost:5000/health
curl http://localhost:5000/ready
curl http://localhost:5000/metrics
```

Frontend locally:

```bash
cd frontend
# .env points NEXT_PUBLIC_API_URL="" and BACKEND_URL=http://localhost:5000
npm run dev    # http://localhost:3000, proxies /api to the local API
```
