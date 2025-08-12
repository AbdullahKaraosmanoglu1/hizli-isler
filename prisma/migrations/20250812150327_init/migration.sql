-- CreateTable
CREATE TABLE "public"."Request" (
    "id" SERIAL NOT NULL,
    "citizen_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Açık',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_to" TEXT,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Survey" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER,
    "comment" TEXT,
    "answered_at" TIMESTAMP(3),

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Survey_request_id_key" ON "public"."Survey"("request_id");

-- AddForeignKey
ALTER TABLE "public"."Survey" ADD CONSTRAINT "Survey_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
