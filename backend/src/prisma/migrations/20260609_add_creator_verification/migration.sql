-- AlterTable: Add isVerified, verifiedAt, verifiedBy to Creator
ALTER TABLE "Creator" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Creator" ADD COLUMN "verifiedAt" TIMESTAMP(3);
ALTER TABLE "Creator" ADD COLUMN "verifiedBy" TEXT;
