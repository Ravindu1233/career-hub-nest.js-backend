/*
  Warnings:

  - You are about to drop the column `certification` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "certification",
ADD COLUMN     "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[];
