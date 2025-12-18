/*
  Warnings:

  - A unique constraint covering the columns `[minibusId,seat,date]` on the table `MinibusReservation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- AlterTable
ALTER TABLE "MinibusReservation" ADD COLUMN     "paymentId" INTEGER,
ADD COLUMN     "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "minibusReservationId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "MinibusReservation_minibusId_seat_date_key" ON "MinibusReservation"("minibusId", "seat", "date");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_minibusReservationId_fkey" FOREIGN KEY ("minibusReservationId") REFERENCES "MinibusReservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
