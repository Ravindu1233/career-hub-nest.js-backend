-- AlterTable
ALTER TABLE "user"
ADD COLUMN "password_reset_otp_hash" VARCHAR(255),
ADD COLUMN "password_reset_otp_expires_at" TIMESTAMP(3),
ADD COLUMN "password_reset_otp_verified_at" TIMESTAMP(3);
