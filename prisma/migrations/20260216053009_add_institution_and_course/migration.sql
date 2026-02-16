-- CreateTable
CREATE TABLE "institution" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "logo" VARCHAR(255),
    "location" VARCHAR(255),
    "description" TEXT,
    "website" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "founded" VARCHAR(50),
    "students" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course" (
    "id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "duration" VARCHAR(100) NOT NULL,
    "startDate" VARCHAR(100) NOT NULL,
    "price" VARCHAR(100) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "spots" INTEGER,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "institution_user_id_idx" ON "institution"("user_id");

-- CreateIndex
CREATE INDEX "course_institution_id_idx" ON "course"("institution_id");

-- AddForeignKey
ALTER TABLE "institution" ADD CONSTRAINT "institution_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
