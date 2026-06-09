-- Capture the deliverable the creator submits for brand review and the approval timestamp.
ALTER TABLE "Offer" ADD COLUMN IF NOT EXISTS "deliverableUrl" TEXT;
ALTER TABLE "Offer" ADD COLUMN IF NOT EXISTS "deliverableNote" TEXT;
ALTER TABLE "Offer" ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3);
ALTER TABLE "Offer" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);
