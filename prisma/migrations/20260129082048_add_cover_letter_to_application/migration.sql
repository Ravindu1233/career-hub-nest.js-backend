-- DropIndex
DROP INDEX "Application_jobId_idx";

-- DropIndex
DROP INDEX "Application_user_id_idx";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "coverLetter" TEXT;
