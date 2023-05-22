-- CreateTable
CREATE TABLE "Retweet" (
    "id" SERIAL NOT NULL,
    "tweetId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Retweet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Retweet_tweetId_userId_key" ON "Retweet"("tweetId", "userId");

-- AddForeignKey
ALTER TABLE "Retweet" ADD CONSTRAINT "Retweet_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "Tweet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Retweet" ADD CONSTRAINT "Retweet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
