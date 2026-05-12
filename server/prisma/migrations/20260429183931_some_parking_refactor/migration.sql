-- DropIndex
DROP INDEX "ParkingReservation_slotId_idx";

-- DropIndex
DROP INDEX "ParkingReservation_userId_status_idx";

-- DropIndex
DROP INDEX "ParkingSession_slotId_status_idx";

-- DropIndex
DROP INDEX "ParkingSession_userId_idx";

-- AlterTable
ALTER TABLE "WalletTransaction" ADD COLUMN     "parkingReservationId" TEXT,
ADD COLUMN     "parkingSessionId" TEXT;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_parkingSessionId_fkey" FOREIGN KEY ("parkingSessionId") REFERENCES "ParkingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_parkingReservationId_fkey" FOREIGN KEY ("parkingReservationId") REFERENCES "ParkingReservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
