/*
  Warnings:

  - The values [CHARGING_MANAGER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `alightingStop` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `boardingStop` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `cancelledAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `checkedIn` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `checkedInAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `payNow` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `qrCode` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `seatsBooked` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `sharedAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `sharedTicketUsed` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `sharedToId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `validUntil` on the `Booking` table. All the data in the column will be lost.
  - The `estimatedArrival` column on the `Bus` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ParkingLot` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `location` on the `ParkingLot` table. All the data in the column will be lost.
  - You are about to drop the column `occupied` on the `ParkingLot` table. All the data in the column will be lost.
  - The primary key for the `ParkingReservation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `lotId` on the `ParkingReservation` table. All the data in the column will be lost.
  - You are about to drop the column `slotNumber` on the `ParkingReservation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,parkingLotId]` on the table `ratings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `ParkingLot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `availableSlots` to the `ParkingLot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `ParkingLot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `ParkingLot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `ParkingLot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerMinute` to the `ParkingLot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parkingLotId` to the `ParkingReservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slotId` to the `ParkingReservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ParkingReservation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SlotType" AS ENUM ('CAR', 'BIKE', 'TRUCK', 'EV');

-- CreateEnum
CREATE TYPE "ParkingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "LotStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'FULL');

-- CreateEnum
CREATE TYPE "EntryMethod" AS ENUM ('MANUAL', 'QR', 'SENSOR');

-- CreateEnum
CREATE TYPE "LedgerStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('BUS_TICKET', 'PARKING', 'EV_CHARGING', 'NULL');

-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('BOOKING', 'PARKING_RESERVATION', 'EV_CHARGING_SESSION');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ConnectorType" ADD VALUE 'TESLA';
ALTER TYPE "ConnectorType" ADD VALUE 'GBT';

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'BOOKING_SHARE_CANCELLED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentGateway" ADD VALUE 'MPESA';
ALTER TYPE "PaymentGateway" ADD VALUE 'TELEBIRR';

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'MOBILE_MONEY';

-- AlterEnum
ALTER TYPE "ShareStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SlotStatus" ADD VALUE 'RESERVED';
ALTER TYPE "SlotStatus" ADD VALUE 'MAINTENANCE';
ALTER TYPE "SlotStatus" ADD VALUE 'BLOCKED';

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'COMMISSION';

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('PASSENGER', 'DRIVER', 'ADMIN', 'EV_CHARGER_MANAGER', 'PARKING_MANAGER');
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TABLE "AuditLog" ALTER COLUMN "actorRole" TYPE "UserRole_new" USING ("actorRole"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'PASSENGER';
COMMIT;

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_sharedToId_fkey";

-- DropForeignKey
ALTER TABLE "ParkingReservation" DROP CONSTRAINT "ParkingReservation_lotId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "alightingStop",
DROP COLUMN "boardingStop",
DROP COLUMN "cancelledAt",
DROP COLUMN "checkedIn",
DROP COLUMN "checkedInAt",
DROP COLUMN "payNow",
DROP COLUMN "qrCode",
DROP COLUMN "seatsBooked",
DROP COLUMN "sharedAt",
DROP COLUMN "sharedTicketUsed",
DROP COLUMN "sharedToId",
DROP COLUMN "validUntil";

-- AlterTable
ALTER TABLE "Bus" DROP COLUMN "estimatedArrival",
ADD COLUMN     "estimatedArrival" INTEGER;

-- AlterTable
ALTER TABLE "ParkingLot" DROP CONSTRAINT "ParkingLot_pkey",
DROP COLUMN "location",
DROP COLUMN "occupied",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "availableSlots" INTEGER NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "closingTime" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "hasCCTV" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasSecurity" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "openingTime" TIMESTAMP(3),
ADD COLUMN     "pricePerMinute" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "status" "LotStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ParkingLot_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ParkingLot_id_seq";

-- AlterTable
ALTER TABLE "ParkingReservation" DROP CONSTRAINT "ParkingReservation_pkey",
DROP COLUMN "lotId",
DROP COLUMN "slotNumber",
ADD COLUMN     "checkInTime" TIMESTAMP(3),
ADD COLUMN     "checkOutTime" TIMESTAMP(3),
ADD COLUMN     "isNoShow" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "parkingLotId" TEXT NOT NULL,
ADD COLUMN     "qrCode" TEXT,
ADD COLUMN     "slotId" TEXT NOT NULL,
ADD COLUMN     "status" "ParkingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ParkingReservation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ParkingReservation_id_seq";

-- AlterTable
ALTER TABLE "WalletTransaction" ADD COLUMN     "serviceType" "ServiceType" NOT NULL DEFAULT 'NULL';

-- AlterTable
ALTER TABLE "ratings" ADD COLUMN     "parkingLotId" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TransactionLedger" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT,
    "paymentId" INTEGER,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "commission" DECIMAL(65,30) NOT NULL,
    "providerAmount" DECIMAL(65,30) NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "referenceId" TEXT NOT NULL,
    "referenceType" "ReferenceType",
    "paymentMethod" "PaymentMethod",
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "status" "LedgerStatus" NOT NULL DEFAULT 'PENDING',
    "isSettled" BOOLEAN NOT NULL DEFAULT false,
    "externalRef" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "seatNumber" INTEGER,
    "boardingStop" TEXT,
    "alightingStop" TEXT,
    "qrCode" TEXT,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkedInAt" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "sharedToId" TEXT,
    "sharedAt" TIMESTAMP(3),
    "sharedTicketUsed" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingSlot" (
    "id" TEXT NOT NULL,
    "parkingLotId" TEXT NOT NULL,
    "slotNumber" TEXT NOT NULL,
    "slotType" "SlotType" NOT NULL DEFAULT 'CAR',
    "status" "SlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isOccupied" BOOLEAN NOT NULL DEFAULT false,
    "floor" INTEGER,
    "section" TEXT,
    "isEV" BOOLEAN NOT NULL DEFAULT false,
    "hasCharger" BOOLEAN NOT NULL DEFAULT false,
    "lastOccupiedAt" TIMESTAMP(3),
    "sensorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParkingSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingSession" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "parkingReservationId" TEXT,
    "entryTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitTime" TIMESTAMP(3),
    "duration" INTEGER,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "entryMethod" "EntryMethod" NOT NULL DEFAULT 'MANUAL',
    "exitMethod" "EntryMethod",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParkingSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransactionLedger_externalRef_key" ON "TransactionLedger"("externalRef");

-- CreateIndex
CREATE INDEX "TransactionLedger_userId_idx" ON "TransactionLedger"("userId");

-- CreateIndex
CREATE INDEX "TransactionLedger_providerId_idx" ON "TransactionLedger"("providerId");

-- CreateIndex
CREATE INDEX "TransactionLedger_referenceId_idx" ON "TransactionLedger"("referenceId");

-- CreateIndex
CREATE INDEX "TransactionLedger_serviceType_idx" ON "TransactionLedger"("serviceType");

-- CreateIndex
CREATE INDEX "ParkingSlot_parkingLotId_idx" ON "ParkingSlot"("parkingLotId");

-- CreateIndex
CREATE INDEX "ParkingSlot_parkingLotId_status_idx" ON "ParkingSlot"("parkingLotId", "status");

-- CreateIndex
CREATE INDEX "ParkingSlot_status_isOccupied_idx" ON "ParkingSlot"("status", "isOccupied");

-- CreateIndex
CREATE UNIQUE INDEX "ParkingSlot_parkingLotId_slotNumber_key" ON "ParkingSlot"("parkingLotId", "slotNumber");

-- CreateIndex
CREATE INDEX "ParkingSession_slotId_status_idx" ON "ParkingSession"("slotId", "status");

-- CreateIndex
CREATE INDEX "ParkingLot_city_idx" ON "ParkingLot"("city");

-- CreateIndex
CREATE INDEX "ParkingReservation_userId_status_idx" ON "ParkingReservation"("userId", "status");

-- CreateIndex
CREATE INDEX "ParkingReservation_slotId_startTime_endTime_idx" ON "ParkingReservation"("slotId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "ratings_parkingLotId_idx" ON "ratings"("parkingLotId");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_userId_parkingLotId_key" ON "ratings"("userId", "parkingLotId");

-- AddForeignKey
ALTER TABLE "TransactionLedger" ADD CONSTRAINT "TransactionLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionLedger" ADD CONSTRAINT "TransactionLedger_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_sharedToId_fkey" FOREIGN KEY ("sharedToId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_parkingLotId_fkey" FOREIGN KEY ("parkingLotId") REFERENCES "ParkingLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSlot" ADD CONSTRAINT "ParkingSlot_parkingLotId_fkey" FOREIGN KEY ("parkingLotId") REFERENCES "ParkingLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingReservation" ADD CONSTRAINT "ParkingReservation_parkingLotId_fkey" FOREIGN KEY ("parkingLotId") REFERENCES "ParkingLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingReservation" ADD CONSTRAINT "ParkingReservation_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ParkingSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSession" ADD CONSTRAINT "ParkingSession_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ParkingSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSession" ADD CONSTRAINT "ParkingSession_parkingReservationId_fkey" FOREIGN KEY ("parkingReservationId") REFERENCES "ParkingReservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
