ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"ApprovalStatus";

UPDATE "user" SET status = 'ACTIVE' WHERE status = 'PENDING';