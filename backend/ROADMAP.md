# Tehilla Backend — Post-Launch Hardening Roadmap

The launch scope was deliberately bounded to **financial-integrity correctness**:
true escrow (HOLD → RELEASE → DEBIT), refunds, payout guards, Paystack-only, tests,
and docs. The items below are from the enterprise fintech spec
(`TEHILLA FINTECH BACKEND ARCHITECT.txt`). They are **real and intended**, but were
explicitly deferred so launch ships verified rather than rushed. Nothing here is
silently dropped — each is a tracked work item.

## P1 — First post-launch sprint
- **Automated reconciliation.** Hourly/daily/weekly jobs that recompute each creator's
  `balanceKobo`/`heldKobo` from the immutable ledger and alert on any drift. Block
  affected payouts on mismatch. (Ledger already supports this — the entries exist;
  the reconciler does not yet.)
- **Payout risk controls.** Per-creator daily/weekly withdrawal limits, velocity checks,
  cooldown after bank-account change, and a review queue for large/rapid/new-account payouts.
- **Provider abstraction completion.** Wire Flutterwave fully (enum `FLUTTERWAVE`, payout
  + webhook + signature) so `PAYMENT_PROVIDER` can switch. Currently guarded to Paystack only.

## P2 — Fraud & identity
- **Fraud/risk engine.** `fraudScore` (0–100) from device fingerprint, IP reputation,
  login anomalies, rapid balance movement, multi-account signals; threshold-triggered review.
- **Device/session tracking.** Persist device + IP + login history; "log out all devices",
  revoke-device, forced logout. (JWT refresh-rotation + reuse detection already exist.)

## P3 — Wallet depth & lending
- **Full 4-tier wallet.** Split into Available / Pending / Reserved / Withdrawable
  balances (current model is the 2-tier held/withdrawable subset).
- **Permission-based access control.** Move beyond role checks to granular permissions
  (`wallet.freeze`, `offers.refund`, `users.suspend`, …).
- **Lending operations** — as a separate, later product surface.

## Already in place (not roadmap — shipped)
Immutable double-entry ledger with uniqueness guards, idempotency keys, webhook
HMAC + dedup, AES-256-GCM KYC encryption, JWT refresh-rotation with reuse detection,
Paystack circuit breakers, structured logging + Prometheus + Sentry, true escrow with
refunds, and the payout double-spend guard.
