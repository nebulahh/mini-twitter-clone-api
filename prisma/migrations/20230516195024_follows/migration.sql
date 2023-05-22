/*
  Warnings:

  - You are about to drop the `_UserFollows` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserFollows" DROP CONSTRAINT "_UserFollows_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserFollows" DROP CONSTRAINT "_UserFollows_B_fkey";

-- DropTable
DROP TABLE "_UserFollows";

-- CreateTable
CREATE TABLE "Following" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "followId" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Following_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Following" ADD CONSTRAINT "Following_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
