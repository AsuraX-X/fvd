-- CreateTable
CREATE TABLE "saved_expert" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,

    CONSTRAINT "saved_expert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_expert_expertId_idx" ON "saved_expert"("expertId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_expert_userId_expertId_key" ON "saved_expert"("userId", "expertId");

-- AddForeignKey
ALTER TABLE "saved_expert" ADD CONSTRAINT "saved_expert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_expert" ADD CONSTRAINT "saved_expert_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
