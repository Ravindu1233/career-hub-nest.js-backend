-- AlterTable
ALTER TABLE "user"
ADD COLUMN "login_otp_hash" VARCHAR(255),
ADD COLUMN "login_otp_expires_at" TIMESTAMP(3),
ADD COLUMN "email_notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "push_notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "dark_mode_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "company"
ADD COLUMN "login_otp_hash" VARCHAR(255),
ADD COLUMN "login_otp_expires_at" TIMESTAMP(3),
ADD COLUMN "email_notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "push_notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "dark_mode_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false;
