# Tehilla Backend — Go-Live Runbook

Production entry point is the **Fastify/TypeScript** app (`src/app.ts` → `dist/app.js`).
The legacy Express files under `src/controllers/*.js` are **not** used in production.

## 1. Required environment variables

`src/config/config.ts` validates these at boot and **exits the process** if any
production guard fails.

| Variable | Requirement |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Real Postgres URL (pooled). Must not contain placeholder text. |
| `DIRECT_URL` | Direct (non-pooled) URL for migrations, if using a pooler. |
| `JWT_SECRET` | ≥ 48 chars, random. |
| `KYC_ENCRYPTION_KEY` | 32 bytes, base64-encoded (AES-256-GCM). Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `PAYSTACK_SECRET_KEY` | Live key `sk_live_...` |
| `PAYMENT_PROVIDER` | `paystack` (the only supported provider at launch — boot fails otherwise). |
| `PAYMENT_MOCKS_ENABLED` | `false` (boot fails if `true` in production). |
| `FRONTEND_URL` | Production frontend origin (CORS allowlist + Paystack callback). |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Upstash — cache, login throttle. |
| `REDIS_URL` | ioredis-compatible URL for BullMQ (`rediss://...`). |
| `REDIS_REQUIRED` | `true` in production so a missing queue fails loudly. |
| `RESEND_API_KEY` (or SMTP_*) | Transactional email. |
| `SENTRY_DSN` | Recommended. |

## 2. Run BOTH processes (critical)

Webhooks are processed asynchronously via BullMQ. If `REDIS_URL` is set, webhook
jobs are **enqueued** and a separate worker must consume them — otherwise payout
webhooks queue forever and **payouts silently never complete**.

`Procfile`:
```
web:    npm start                  # the API (railway.toml)
worker: npm run worker:payments    # the BullMQ consumer (railway.worker.toml)
```

On Railway/Render/Fly, deploy **two services** from this repo: the web service and
the worker service. Both share the same env. Do not ship only the web service.

> Fallback: if `REDIS_URL` is unset, `enqueueOrRun` runs webhook handlers inline in
> the request (works, but with no retry/backoff). Production should use Redis + worker.

## 3. Database migrations
```
npm run db:migrate:deploy      # prisma migrate deploy (also wired as Railway releaseCommand)
```
Never run `prisma migrate reset` against production. The `20260619_true_escrow`
migration is additive (`heldKobo` column, `REFUNDED`/`REFUND` enum values) and safe
on live data.

## 4. Paystack dashboard
- Set the webhook URL to `https://<api-host>/api/payments/webhook/paystack`.
- Confirm webhook events: `charge.success`, `transfer.success`, `transfer.failed`, `transfer.reversed`.
- Ensure the live secret key matches `PAYSTACK_SECRET_KEY` (used for HMAC-SHA512 verification).

## 5. Health & readiness
- `GET /health` → liveness (200).
- `GET /ready` → DB connectivity (`SELECT 1`); returns 503 if DB is unreachable.
- Container `HEALTHCHECK` already wired in `Dockerfile`.

## 6. Pre-flight checklist
- [ ] `npm run build` → zero TS errors
- [ ] `npm test` → green
- [ ] `npm run db:migrate:deploy` applied
- [ ] Web **and** worker services both deployed and healthy
- [ ] Paystack webhook URL + events configured, signature verified with live key
- [ ] `PAYMENT_MOCKS_ENABLED=false`, `PAYMENT_PROVIDER=paystack`, `REDIS_REQUIRED=true`
- [ ] Run one live ₦-test offer end-to-end (fund → approve → payout → refund) on a low amount

## 7. Smoke test (the money path)
See `ESCROW.md` for the full lifecycle. Quick path:
1. Brand funds an ACCEPTED offer → offer `FUNDED`, creator `heldKobo` rises.
2. Creator submits, brand approves → `heldKobo` → `balanceKobo` (RELEASE).
3. Creator/admin `POST /api/payments/payout` → `transfer.success` webhook → offer `COMPLETED`, `balanceKobo` debited.
4. On a separate funded offer, admin `PUT /api/offers/:id/dispute` then `PUT /api/offers/:id/refund` → offer `REFUNDED`, brand refunded.
