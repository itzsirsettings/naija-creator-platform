-- CreateEnum
CREATE TYPE "PremiumTier" AS ENUM ('NONE', 'STANDARD', 'POPULAR', 'PREMIUM');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "premiumTier" "PremiumTier" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "premiumUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "message" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budgetKobo" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "status" "CampaignStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignApplication" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "message" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Application_brandId_createdAt_idx" ON "Application"("brandId", "createdAt");

-- CreateIndex
CREATE INDEX "Application_creatorId_createdAt_idx" ON "Application"("creatorId", "createdAt");

-- CreateIndex
CREATE INDEX "Application_status_createdAt_idx" ON "Application"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Application_creatorId_brandId_key" ON "Application"("creatorId", "brandId");

-- CreateIndex
CREATE INDEX "Campaign_brandId_createdAt_idx" ON "Campaign"("brandId", "createdAt");

-- CreateIndex
CREATE INDEX "Campaign_status_createdAt_idx" ON "Campaign"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CampaignApplication_campaignId_createdAt_idx" ON "CampaignApplication"("campaignId", "createdAt");

-- CreateIndex
CREATE INDEX "CampaignApplication_creatorId_createdAt_idx" ON "CampaignApplication"("creatorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignApplication_campaignId_creatorId_key" ON "CampaignApplication"("campaignId", "creatorId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignApplication" ADD CONSTRAINT "CampaignApplication_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignApplication" ADD CONSTRAINT "CampaignApplication_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

