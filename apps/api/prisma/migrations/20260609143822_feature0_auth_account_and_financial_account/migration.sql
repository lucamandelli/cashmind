/*
  Warnings:

  - You are about to drop the column `accessToken` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `accessTokenExpiresAt` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `idToken` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `refreshTokenExpiresAt` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `scope` on the `account` table. All the data in the column will be lost.
  - Added the required column `name` to the `account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "account" DROP COLUMN "accessToken",
DROP COLUMN "accessTokenExpiresAt",
DROP COLUMN "accountId",
DROP COLUMN "idToken",
DROP COLUMN "password",
DROP COLUMN "providerId",
DROP COLUMN "refreshToken",
DROP COLUMN "refreshTokenExpiresAt",
DROP COLUMN "scope",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "auth_account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auth_account_userId_idx" ON "auth_account"("userId");

-- AddForeignKey
ALTER TABLE "auth_account" ADD CONSTRAINT "auth_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
