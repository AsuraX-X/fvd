-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "review_expertId_createdAt_idx" ON "review"("expertId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "review_userId_expertId_key" ON "review"("userId", "expertId");

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Prisma can't declare CHECK constraints, so these are hand-written.
-- AddCheckConstraint
ALTER TABLE "review" ADD CONSTRAINT "review_rating_range_check" CHECK ("rating" BETWEEN 1 AND 5);

-- AddCheckConstraint
ALTER TABLE "review" ADD CONSTRAINT "review_comment_length_check" CHECK (char_length(btrim("comment")) BETWEEN 1 AND 2000);

-- AddCheckConstraint (Profile.id === User.id, so this blocks self-reviews)
ALTER TABLE "review" ADD CONSTRAINT "review_no_self_review_check" CHECK ("userId" <> "expertId");
