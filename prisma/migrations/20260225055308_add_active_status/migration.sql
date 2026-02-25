-- Step 1: Add ACTIVE to the enum BEFORE using it
-- Must be outside a transaction block — Prisma will handle this
ALTER TYPE "ApprovalStatus" ADD VALUE IF NOT EXISTS 'ACTIVE';