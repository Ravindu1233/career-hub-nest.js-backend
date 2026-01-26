-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "deadline" TIMESTAMP(6),
ADD COLUMN     "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "responsibilities" TEXT[] DEFAULT ARRAY[]::TEXT[];
