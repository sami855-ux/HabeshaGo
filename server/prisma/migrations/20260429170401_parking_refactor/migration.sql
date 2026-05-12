/*
  Warnings:

  - You are about to drop the column `availableSlots` on the `ParkingLot` table. All the data in the column will be lost.
  - You are about to drop the column `checkInTime` on the `ParkingReservation` table. All the data in the column will be lost.
  - You are about to drop the column `checkOutTime` on the `ParkingReservation` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `ParkingReservation` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `ParkingReservation` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `ParkingSession` table. All the data in the column will be lost.
  - You are about to drop the column `isOccupied` on the `ParkingSlot` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ReservationStatus" ADD VALUE 'EXPIRED';
ALTER TYPE "ReservationStatus" ADD VALUE 'COMPLETED';

-- DropIndex
DROP INDEX "ParkingReservation_slotId_startTime_endTime_idx";

-- DropIndex
DROP INDEX "ParkingSlot_parkingLotId_idx";

-- DropIndex
DROP INDEX "ParkingSlot_status_isOccupied_idx";

-- AlterTable
ALTER TABLE "ParkingLot" DROP COLUMN "availableSlots";

-- AlterTable
ALTER TABLE "ParkingReservation" DROP COLUMN "checkInTime",
DROP COLUMN "checkOutTime",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "reservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ParkingSession" DROP COLUMN "duration",
ADD COLUMN     "durationMinutes" INTEGER,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "entryMethod" SET DEFAULT 'QR';

-- AlterTable
ALTER TABLE "ParkingSlot" DROP COLUMN "isOccupied";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "evReservationId" INTEGER,
ADD COLUMN     "parkingReservationId" TEXT,
ADD COLUMN     "parkingSessionId" TEXT;

-- AlterTable
ALTER TABLE "charging_stations" ADD COLUMN     "managerId" TEXT NOT NULL DEFAULT 'cmo38u4ub00007zvj8qcqu4qn';

-- CreateIndex
CREATE INDEX "ParkingReservation_slotId_idx" ON "ParkingReservation"("slotId");

-- CreateIndex
CREATE INDEX "ParkingSession_userId_idx" ON "ParkingSession"("userId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_evReservationId_fkey" FOREIGN KEY ("evReservationId") REFERENCES "reservations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_parkingReservationId_fkey" FOREIGN KEY ("parkingReservationId") REFERENCES "ParkingReservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_parkingSessionId_fkey" FOREIGN KEY ("parkingSessionId") REFERENCES "ParkingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_stations" ADD CONSTRAINT "charging_stations_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSession" ADD CONSTRAINT "ParkingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
