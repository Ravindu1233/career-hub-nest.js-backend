/*
  Fix: add required columns with DEFAULTs so existing rows can be updated.
  Also ensure location is not null before setting NOT NULL.
*/

-- 1) Drop old columns (safe)
ALTER TABLE "Job"
  DROP COLUMN IF EXISTS "imagePath",
  DROP COLUMN IF EXISTS "olPassRequired",
  DROP COLUMN IF EXISTS "qualification",
  DROP COLUMN IF EXISTS "workingHours";

-- 2) Add new required columns with DEFAULTS (so existing rows won't break)
ALTER TABLE "Job"
  ADD COLUMN IF NOT EXISTS "jobType" TEXT NOT NULL DEFAULT 'full-time',
  ADD COLUMN IF NOT EXISTS "requirements" TEXT NOT NULL DEFAULT 'N/A',
  ADD COLUMN IF NOT EXISTS "salaryRange" TEXT NOT NULL DEFAULT 'N/A';

-- 3) Backfill location if any nulls exist, then enforce NOT NULL
UPDATE "Job"
SET "location" = 'N/A'
WHERE "location" IS NULL;

ALTER TABLE "Job"
  ALTER COLUMN "location" SET NOT NULL;

-- 4) (Optional) remove defaults so API must always send values
ALTER TABLE "Job"
  ALTER COLUMN "jobType" DROP DEFAULT,
  ALTER COLUMN "requirements" DROP DEFAULT,
  ALTER COLUMN "salaryRange" DROP DEFAULT;
