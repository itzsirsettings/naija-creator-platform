-- AlterEnum
BEGIN;
CREATE TYPE "PaymentProvider_new" AS ENUM ('PAYSTACK');
ALTER TABLE "ProviderWebhookEvent" ALTER COLUMN "provider" TYPE "PaymentProvider_new" USING ("provider"::text::"PaymentProvider_new");
ALTER TABLE "Payout" ALTER COLUMN "provider" TYPE "PaymentProvider_new" USING ("provider"::text::"PaymentProvider_new");
ALTER TYPE "PaymentProvider" RENAME TO "PaymentProvider_old";
ALTER TYPE "PaymentProvider_new" RENAME TO "PaymentProvider";
DROP TYPE "public"."PaymentProvider_old";
COMMIT;

-- DropIndex
DROP INDEX "Transaction_stripeRef_idx";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "stripeRef";
