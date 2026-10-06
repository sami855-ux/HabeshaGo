-- Repair historical schema drift: these fields exist in schema.prisma but
-- were never introduced by a migration. Backfill current users before making
-- referralCode required.
ALTER TABLE "user"
ADD COLUMN "referralCode" TEXT,
ADD COLUMN "referredById" TEXT;

UPDATE "user"
SET "referralCode" = 'REF-' || UPPER(SUBSTRING(MD5("id" || RANDOM()::TEXT), 1, 20))
WHERE "referralCode" IS NULL;

ALTER TABLE "user"
ALTER COLUMN "referralCode" SET NOT NULL;

ALTER TABLE "user"
ADD CONSTRAINT "user_referredById_fkey"
FOREIGN KEY ("referredById") REFERENCES "user"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "user_referredById_idx" ON "user"("referredById");
