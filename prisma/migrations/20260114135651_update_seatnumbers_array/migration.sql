/*
  Warnings:

  - You are about to drop the column `seatNumber` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `codeHash` to the `otp_code` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "seatNumber",
ADD COLUMN     "seatNumbers" INTEGER[];

-- AlterTable
ALTER TABLE "otp_code" ADD COLUMN     "codeHash" TEXT NOT NULL,
ALTER COLUMN "code" DROP NOT NULL;
