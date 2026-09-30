-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('listed', 'unlisted_by_expert', 'unlisted_by_admin');

-- DropForeignKey
ALTER TABLE "enquiry" DROP CONSTRAINT "enquiry_userId_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_userId_fkey";

-- AlterTable
ALTER TABLE "enquiry" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "listingStatus" "ListingStatus" NOT NULL DEFAULT 'listed';

-- AlterTable
ALTER TABLE "review" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "profile_role_listingStatus_idx" ON "profile"("role", "listingStatus");

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiry" ADD CONSTRAINT "enquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
