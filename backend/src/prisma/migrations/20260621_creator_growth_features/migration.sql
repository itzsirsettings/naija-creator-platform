-- CreateEnum
CREATE TYPE "OfferDealType" AS ENUM ('FIXED', 'AFFILIATE');

-- CreateEnum
CREATE TYPE "AffiliateEventType" AS ENUM ('CLICK', 'CONVERSION');

-- AlterTable: Offer — affiliate deals + usage rights
ALTER TABLE "Offer" ADD COLUMN     "dealType" "OfferDealType" NOT NULL DEFAULT 'FIXED',
ADD COLUMN     "commissionRate" INTEGER,
ADD COLUMN     "affiliateCode" TEXT,
ADD COLUMN     "usageRights" TEXT NOT NULL DEFAULT 'ORGANIC_ONLY';

-- AlterTable: Creator — usage rights policy
ALTER TABLE "Creator" ADD COLUMN     "usageRightsPolicy" TEXT;

-- CreateTable
CREATE TABLE "AffiliateEvent" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "type" "AffiliateEventType" NOT NULL,
    "amountKobo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalTemplate" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "ownerCreatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Offer_affiliateCode_key" ON "Offer"("affiliateCode");

-- CreateIndex
CREATE INDEX "Offer_dealType_idx" ON "Offer"("dealType");

-- CreateIndex
CREATE INDEX "AffiliateEvent_offerId_type_idx" ON "AffiliateEvent"("offerId", "type");

-- CreateIndex
CREATE INDEX "AffiliateEvent_createdAt_idx" ON "AffiliateEvent"("createdAt");

-- CreateIndex
CREATE INDEX "ProposalTemplate_creatorId_createdAt_idx" ON "ProposalTemplate"("creatorId", "createdAt");

-- CreateIndex
CREATE INDEX "TeamMember_ownerCreatorId_idx" ON "TeamMember"("ownerCreatorId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_ownerCreatorId_email_key" ON "TeamMember"("ownerCreatorId", "email");

-- AddForeignKey
ALTER TABLE "AffiliateEvent" ADD CONSTRAINT "AffiliateEvent_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalTemplate" ADD CONSTRAINT "ProposalTemplate_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_ownerCreatorId_fkey" FOREIGN KEY ("ownerCreatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
