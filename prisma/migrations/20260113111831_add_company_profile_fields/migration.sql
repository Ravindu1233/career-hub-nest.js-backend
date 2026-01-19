/*
  Warnings:

  - You are about to drop the column `date` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `mobile` on the `company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "company" DROP COLUMN "date",
DROP COLUMN "image",
DROP COLUMN "mobile",
ADD COLUMN     "benefitsAndPerks" VARCHAR(255),
ADD COLUMN     "companySize" VARCHAR(255),
ADD COLUMN     "founded" TIMESTAMP(6),
ADD COLUMN     "location" VARCHAR(255),
ADD COLUMN     "phone" VARCHAR(255);
