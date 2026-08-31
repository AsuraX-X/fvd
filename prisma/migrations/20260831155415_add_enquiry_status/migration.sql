-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('new', 'read', 'archived');

-- AlterTable
ALTER TABLE "enquiry" ADD COLUMN     "status" "EnquiryStatus" NOT NULL DEFAULT 'new';

-- CreateIndex
CREATE INDEX "enquiry_status_idx" ON "enquiry"("status");
