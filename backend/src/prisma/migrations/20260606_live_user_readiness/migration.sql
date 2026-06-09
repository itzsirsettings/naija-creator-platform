-- Extend offer lifecycle for funded work, creator submission, brand approval, and disputes.
ALTER TYPE "OfferStatus" ADD VALUE IF NOT EXISTS 'FUNDED';
ALTER TYPE "OfferStatus" ADD VALUE IF NOT EXISTS 'SUBMITTED';
ALTER TYPE "OfferStatus" ADD VALUE IF NOT EXISTS 'APPROVED';
ALTER TYPE "OfferStatus" ADD VALUE IF NOT EXISTS 'DISPUTED';

-- Email verification and verified bank display metadata.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);

ALTER TABLE "Creator" ADD COLUMN IF NOT EXISTS "bankAccountName" TEXT;
ALTER TABLE "Creator" ADD COLUMN IF NOT EXISTS "bankAccountLast4" TEXT;
ALTER TABLE "Creator" ADD COLUMN IF NOT EXISTS "bankBankCode" TEXT;
ALTER TABLE "Creator" ADD COLUMN IF NOT EXISTS "bankBankName" TEXT;
ALTER TABLE "Creator" ADD COLUMN IF NOT EXISTS "bankVerifiedAt" TIMESTAMP(3);

-- Password reset and email verification tokens store hashes only.
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

CREATE UNIQUE INDEX IF NOT EXISTS "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_expiresAt_idx" ON "EmailVerificationToken"("expiresAt");

ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Prevent duplicate credit ledger entries for the same payout transaction.
CREATE UNIQUE INDEX IF NOT EXISTS "LedgerEntry_transactionId_type_key" ON "LedgerEntry"("transactionId", "type");
