-- AlterTable
ALTER TABLE "user" ADD COLUMN     "bio" VARCHAR(1000),
ADD COLUMN     "schools" VARCHAR(500),
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
