-- True escrow hardening: escrow hold balance + refund states
-- All statements are additive and non-destructive (safe on live data).

-- AlterTable: escrow hold balance (funds held at funding, released on approval)
ALTER TABLE "Creator" ADD COLUMN "heldKobo" INTEGER NOT NULL DEFAULT 0;

-- AlterEnum: refundable offer terminal state
ALTER TYPE "OfferStatus" ADD VALUE 'REFUNDED';

-- AlterEnum: refund ledger entry type (reverses an escrow HOLD back to the brand)
ALTER TYPE "LedgerEntryType" ADD VALUE 'REFUND';
