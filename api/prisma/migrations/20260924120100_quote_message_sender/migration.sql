-- AlterTable
ALTER TABLE "QuoteMessage" ADD COLUMN "fromStaff" BOOLEAN NOT NULL DEFAULT false;

-- Messages written by staff before this column existed were saved without a user id.
UPDATE "QuoteMessage" SET "fromStaff" = true WHERE "userId" IS NULL;
