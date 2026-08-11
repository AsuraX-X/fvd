-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "specialty" TEXT;

-- CreateTable
CREATE TABLE "profile_link" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "profile_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "selected_project" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "selected_project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profile_link_profileId_idx" ON "profile_link"("profileId");

-- CreateIndex
CREATE INDEX "selected_project_profileId_idx" ON "selected_project"("profileId");

-- AddForeignKey
ALTER TABLE "profile_link" ADD CONSTRAINT "profile_link_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selected_project" ADD CONSTRAINT "selected_project_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
