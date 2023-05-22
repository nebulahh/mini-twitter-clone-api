/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Following` table. All the data in the column will be lost.
  - You are about to drop the `Followers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `avatar` to the `Following` table without a default value. This is not possible if the table is not empty.
  - Added the required column `followId` to the `Following` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Following` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Followers" DROP CONSTRAINT "Followers_userId_fkey";

-- DropForeignKey
ALTER TABLE "Following" DROP CONSTRAINT "Following_userId_fkey";

-- AlterTable
ALTER TABLE "Following" DROP COLUMN "createdAt",
ADD COLUMN     "avatar" TEXT NOT NULL,
ADD COLUMN     "followId" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- DropTable
DROP TABLE "Followers";

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bio" TEXT,
    "location" TEXT,
    "website" TEXT,
    "avatar" TEXT,
    "userId" INTEGER,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "Following" ADD CONSTRAINT "Following_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
