/*
  Warnings:

  - You are about to drop the column `userId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `companyUserId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the `AdminProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompanyProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserProfile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[jobId,user_id]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AdminProfile" DROP CONSTRAINT "AdminProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_userId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyProfile" DROP CONSTRAINT "CompanyProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_companyUserId_fkey";

-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_userId_fkey";

-- DropIndex
DROP INDEX "Application_jobId_userId_key";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "userId",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "companyUserId",
ADD COLUMN     "company_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "AdminProfile";

-- DropTable
DROP TABLE "CompanyProfile";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UserProfile";

-- DropEnum
DROP TYPE "AccountStatus";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "admin" (
    "admin_id" SERIAL NOT NULL,
    "address" VARCHAR(255),
    "dob" TIMESTAMP(6),
    "email" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "mobile_number" VARCHAR(255),
    "password" VARCHAR(255) NOT NULL,
    "image" BYTEA,
    "profile_pic" VARCHAR(255),

    CONSTRAINT "admin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "user" (
    "user_id" SERIAL NOT NULL,
    "address" VARCHAR(255),
    "certification" VARCHAR(255),
    "dob" TIMESTAMP(6),
    "email" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "mobile" VARCHAR(255),
    "ol_pass_count" INTEGER,
    "password" VARCHAR(255) NOT NULL,
    "image" BYTEA,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "company" (
    "company_id" SERIAL NOT NULL,
    "address" VARCHAR(255),
    "company_name" VARCHAR(255) NOT NULL,
    "date" TIMESTAMP(6),
    "description" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "image" BYTEA,
    "industry" VARCHAR(255),
    "mobile" VARCHAR(255),
    "password" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255),
    "subscription_id" INTEGER,

    CONSTRAINT "company_pkey" PRIMARY KEY ("company_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "company_email_key" ON "company"("email");

-- CreateIndex
CREATE INDEX "Application_user_id_idx" ON "Application"("user_id");

-- CreateIndex
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_jobId_user_id_key" ON "Application"("jobId", "user_id");

-- CreateIndex
CREATE INDEX "Job_company_id_idx" ON "Job"("company_id");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
