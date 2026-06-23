-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "planCode" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "tier" "PremiumTier" NOT NULL,
    "interval" TEXT NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "tier" "PremiumTier" NOT NULL,
    "interval" TEXT NOT NULL,
    "planCode" TEXT NOT NULL,
    "customerCode" TEXT,
    "subscriptionCode" TEXT,
    "emailToken" TEXT,
    "paystackRef" TEXT,
    "lastChargeRef" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_planCode_key" ON "SubscriptionPlan"("planCode");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_role_tier_interval_idx" ON "SubscriptionPlan"("role", "tier", "interval");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subscriptionCode_key" ON "Subscription"("subscriptionCode");

-- CreateIndex
CREATE INDEX "Subscription_userId_createdAt_idx" ON "Subscription"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Subscription_status_createdAt_idx" ON "Subscription"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Subscription_planCode_idx" ON "Subscription"("planCode");

-- CreateIndex
CREATE INDEX "Subscription_paystackRef_idx" ON "Subscription"("paystackRef");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
