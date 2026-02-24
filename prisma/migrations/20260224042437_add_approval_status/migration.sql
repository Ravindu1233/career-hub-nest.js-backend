-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "rejection_reason" VARCHAR(1000),
ADD COLUMN     "reviewed_at" TIMESTAMP(6),
ADD COLUMN     "reviewed_by_admin_id" INTEGER,
ADD COLUMN     "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "company" ADD COLUMN     "rejection_reason" VARCHAR(1000),
ADD COLUMN     "reviewed_at" TIMESTAMP(6),
ADD COLUMN     "reviewed_by_admin_id" INTEGER,
ADD COLUMN     "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "institution" ADD COLUMN     "rejection_reason" VARCHAR(1000),
ADD COLUMN     "reviewed_at" TIMESTAMP(6),
ADD COLUMN     "reviewed_by_admin_id" INTEGER,
ADD COLUMN     "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "rejection_reason" VARCHAR(1000),
ADD COLUMN     "reviewed_at" TIMESTAMP(6),
ADD COLUMN     "reviewed_by_admin_id" INTEGER,
ADD COLUMN     "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';
