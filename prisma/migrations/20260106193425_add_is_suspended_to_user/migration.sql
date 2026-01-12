/*
  Warnings:

  - You are about to drop the column `accountId` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `OtpCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RefreshToken` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[provider,providerAccountId]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[refreshTokenHash]` on the table `session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `providerAccountId` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshTokenHash` to the `session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OtpCode" DROP CONSTRAINT "OtpCode_userId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_userId_fkey";

-- DropIndex
DROP INDEX "account_provider_providerId_key";

-- DropIndex
DROP INDEX "session_token_key";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "accountId",
DROP COLUMN "password",
DROP COLUMN "providerId",
ADD COLUMN     "providerAccountId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "session" DROP COLUMN "token",
ADD COLUMN     "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "refreshTokenHash" TEXT NOT NULL,
ADD COLUMN     "revoked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "provider",
ADD COLUMN     "isSuspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedBy" TEXT,
ADD COLUMN     "suspensionReason" TEXT,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;

-- DropTable
DROP TABLE "OtpCode";

-- DropTable
DROP TABLE "RefreshToken";

-- CreateTable
CREATE TABLE "otp_code" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "code" TEXT,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_code_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "otp_code_userId_idx" ON "otp_code"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_provider_providerAccountId_key" ON "account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "session_refreshTokenHash_key" ON "session"("refreshTokenHash");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_code" ADD CONSTRAINT "otp_code_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
