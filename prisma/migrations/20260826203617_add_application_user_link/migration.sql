/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `application` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "application" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "application_userId_key" ON "application"("userId");

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
