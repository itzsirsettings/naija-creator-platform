-- AlterTable: Brand — subscription tier
ALTER TABLE "Brand" ADD COLUMN     "premiumTier" "PremiumTier" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "premiumUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ManagedBrand" (
    "id" TEXT NOT NULL,
    "agencyBrandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "website" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManagedBrand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ManagedBrand_agencyBrandId_createdAt_idx" ON "ManagedBrand"("agencyBrandId", "createdAt");

-- AddForeignKey
ALTER TABLE "ManagedBrand" ADD CONSTRAINT "ManagedBrand_agencyBrandId_fkey" FOREIGN KEY ("agencyBrandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
