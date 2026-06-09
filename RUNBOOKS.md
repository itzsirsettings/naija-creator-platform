# Tehilla Production Runbooks

## Database Restore

- Confirm incident scope and pause payment/payout workers if data integrity is uncertain.
- In Supabase, restore the latest safe backup to a new database or point-in-time clone.
- Run `npm run db:migrate:deploy` against the restored database.
- Run smoke checks: `/ready`, login, creator list, offer list, and payment transaction lookup.
- Switch `DATABASE_URL` and `DIRECT_URL` only after the restored database passes checks.

## Failed Payout Recovery

- Search `Payout` by `providerRef`, `transactionId`, or creator.
- Confirm Paystack transfer state in the Paystack dashboard.
- If Paystack failed before money moved, keep `Offer.status=APPROVED`, set `Payout.status=FAILED`, and set `Transaction.status=paid` so payout can be retried.
- If Paystack succeeded but webhook failed, replay the stored `ProviderWebhookEvent` so the balance increment and ledger entry happen together.
- If manual repair is unavoidable, mark `Payout.status=COMPLETED`, `Transaction.status=completed`, `Offer.status=COMPLETED`, and create exactly one `LedgerEntry(type=CREDIT)` for the transaction.
- Never increment `Creator.balanceKobo` without a matching ledger entry.

## Webhook Replay

- Paystack provider event IDs are stored in `ProviderWebhookEvent`.
- Duplicate events must be acknowledged but not reprocessed.
- For a failed event, inspect `ProviderWebhookEvent.error`, correct the underlying data/config issue, then replay by queueing the payload through the payments worker.
- Validate replay by checking transaction/payout state and `/metrics` webhook counters.

## Secret Rotation

- Generate new `JWT_SECRET`, Paystack, Redis, and database credentials in the provider dashboard.
- Deploy new secrets to staging and run auth/payment smoke tests.
- Deploy to production during a low-traffic window.
- Revoke old provider keys only after logs confirm the new keys are active.

## Incident Response

- Check `/health`, `/ready`, `/metrics`, provider dashboards, Redis status, queue depth, and Supabase CPU/connections.
- Scale API containers first for CPU-bound request pressure.
- Scale Redis/worker containers for queue backlog.
- Scale Supabase vertically or reduce query pressure if DB CPU exceeds 70%.
- For payment incidents, disable payout workers before changing transaction or ledger state.

## Live Paystack Smoke Test

- Use a low-value accepted offer between a test brand and test creator.
- Confirm the creator has a verified Paystack transfer recipient.
- Brand funds the offer through live Paystack Checkout.
- Confirm `charge.success` is stored in `ProviderWebhookEvent` and transaction status becomes `paid`.
- Creator submits a deliverable URL and brand approves it.
- Confirm payout is queued and the payment worker records the Paystack transfer reference.
- Confirm `transfer.success` marks payout `COMPLETED`, transaction `completed`, offer `COMPLETED`, and creates exactly one creator ledger credit.
- If any step fails, pause the worker before manual repair.

## First Admin Bootstrap

- Set `ADMIN_EMAIL` and `ADMIN_TEMP_PASSWORD` only in the production shell/session used for bootstrap.
- Run `npm run db:seed:admin` from `backend/`.
- Log in as the admin, confirm `/admin/users`, `/admin/webhooks`, and `/admin/audit` load.
- Rotate the temporary password through the reset-password flow.
- Remove `ADMIN_EMAIL` and `ADMIN_TEMP_PASSWORD` from the host environment.

## Scale-Up Checklist

- `REDIS_REQUIRED=true` in production.
- `PAYMENT_MOCKS_ENABLED=false` in production.
- `VITE_APP_MODE=production` on the live frontend; `VITE_APP_MODE=demo` only on a separate demo deployment.
- At least two API containers and one payments worker.
- Supabase backups enabled and restore tested.
- k6 viral-launch test passes before public campaign traffic.
- Sentry/OpenTelemetry alerts configured for 5xx spikes, webhook failures, queue failures, DB saturation, and payout errors.

## Supabase Free/Shared Soft Launch Guardrails

- Keep launch traffic to a small controlled audience until the database is upgraded.
- Watch Supabase connection count, CPU, slow queries, and failed migration attempts.
- Do not run broad public campaigns while the database remains on free/shared capacity.
- Rehearse restore to a new database before enabling a larger launch.
