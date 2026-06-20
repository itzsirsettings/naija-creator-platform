# Tehilla Escrow & Ledger — Money Flow Reference

This is the canonical reference for how money moves through Tehilla. The wallet is
a financial system: every balance change is an **immutable ledger entry**, and the
materialized balances on `Creator` (`balanceKobo`, `heldKobo`) are derived from those
entries.

## Balances

| Field | Meaning |
|---|---|
| `Creator.heldKobo` | Funds in escrow — brand has paid, but the deliverable is not yet approved. **Not withdrawable.** |
| `Creator.balanceKobo` | Withdrawable balance — released to the creator after the brand approves. |

## Ledger entry types (`LedgerEntry.type`)

The table is append-only. `@@unique([transactionId, type])` makes each step
idempotent — a duplicated event can never double-apply.

| Type | When | Effect |
|---|---|---|
| `HOLD` | Brand funds the offer | `heldKobo += net` |
| `RELEASE` | Brand approves deliverable | `heldKobo -= net`, `balanceKobo += net` |
| `DEBIT` | Payout transfer succeeds | `balanceKobo -= net` |
| `REFUND` | Dispute refunded to brand | `heldKobo -= net` (withdrawable untouched) |
| `CREDIT` / `ADJUSTMENT` | Reserved for manual corrections | — |

## Lifecycle

```
PENDING ──accept(creator)──► ACCEPTED ──fund(brand pays)──► FUNDED
   │                                                          │
   │                                              HOLD: heldKobo += net
   │                                                          │
   ▼                                          submit(creator) ▼
REJECTED                                                  SUBMITTED
                                                              │
                                              approve(brand)  ▼
                                  RELEASE: heldKobo -= net,  APPROVED
                                           balanceKobo += net  │
                                                               │ requestPayout (only when APPROVED)
                                                               ▼
                                              transfer.success webhook
                                          DEBIT: balanceKobo -= net
                                                               ▼
                                                           COMPLETED

DISPUTED ──refund(admin)──► REFUNDED      (REFUND: heldKobo -= net; Paystack refunds GROSS to brand)
```

### Invariants
- **Payout is impossible before `APPROVED`.** `requestPayout` hard-rejects any other status (`PAYOUT_NOT_APPROVED`).
- **At most one transfer per payout.** `Payout.transactionId @unique` + an atomic `claimPayoutForProcessing` (PENDING/FAILED/REVERSED → PROCESSING) guard double payouts under concurrency.
- **Funding is idempotent.** Duplicate `charge.success` / `/verify` are absorbed by `@@unique([transactionId, HOLD])`.
- **After a completed deal:** the deal's contribution to both `heldKobo` and `balanceKobo` returns to 0; net cash has left via Paystack transfer.
- **After a refund:** `heldKobo` returns to 0; gross is refunded to the brand; the platform earns no fee on refunded deals.

## Refund ordering (money-safety)
`refundFunds` runs: (1) reverse the hold (unique `REFUND` ledger entry), (2) call the
provider refund, (3) mark the transaction `refunded`. The transaction is only marked
`refunded` after the provider refund succeeds, so a mid-way failure is safely retryable;
the unique `REFUND` entry plus Paystack's own "already fully reversed" guard prevent
double refunds.

## Code map
- `src/services/escrow.service.ts` — `releaseFunds`, `refundFunds`
- `src/services/payout.service.ts` — `requestPayout` (APPROVED guard), `processPaystackWebhook`
- `src/repositories/payment.repository.ts` — `recordPaidTransaction` (HOLD), `releaseCreatorFunds`, `refundCreatorHold`, `debitCreatorBalance`, `claimPayoutForProcessing`
- `src/services/offer.service.ts` — state machine; RELEASE on `APPROVED`, REFUND on `REFUNDED`
