-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "max_applicants" INTEGER;

-- AlterTable
ALTER TABLE "company" ALTER COLUMN "description" SET DATA TYPE TEXT,
ALTER COLUMN "benefitsAndPerks" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
