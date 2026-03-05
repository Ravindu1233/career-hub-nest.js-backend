-- CreateTable
CREATE TABLE "saved_job" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "job_id" TEXT NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_job_user_id_idx" ON "saved_job"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_job_user_id_job_id_key" ON "saved_job"("user_id", "job_id");

-- AddForeignKey
ALTER TABLE "saved_job" ADD CONSTRAINT "saved_job_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_job" ADD CONSTRAINT "saved_job_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
