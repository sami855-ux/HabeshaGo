/*
  Warnings:

  - You are about to drop the column `busNumber` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `route` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `stationId` on the `ChargingSession` table. All the data in the column will be lost.
  - You are about to drop the column `occupied` on the `EVStation` table. All the data in the column will be lost.
  - You are about to drop the column `slots` on the `EVStation` table. All the data in the column will be lost.
  - You are about to drop the column `driverName` on the `Minibus` table. All the data in the column will be lost.
  - You are about to drop the column `route` on the `Minibus` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[driverId]` on the table `Minibus` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `busId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slotId` to the `ChargingSession` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "BusStatus" AS ENUM ('ACTIVE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE');

-- DropForeignKey
ALTER TABLE "ChargingSession" DROP CONSTRAINT "ChargingSession_stationId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "busNumber",
DROP COLUMN "route",
ADD COLUMN     "busId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ChargingSession" DROP COLUMN "stationId",
ADD COLUMN     "slotId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "EVStation" DROP COLUMN "occupied",
DROP COLUMN "slots";

-- AlterTable
ALTER TABLE "Minibus" DROP COLUMN "driverName",
DROP COLUMN "route",
ADD COLUMN     "driverId" INTEGER,
ADD COLUMN     "routeId" INTEGER;

-- CreateTable
CREATE TABLE "ChargingSlot" (
    "id" SERIAL NOT NULL,
    "slotNumber" TEXT NOT NULL,
    "status" "SlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "stationId" INTEGER NOT NULL,

    CONSTRAINT "ChargingSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "licenseNo" TEXT NOT NULL,
    "experience" INTEGER,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bus" (
    "id" SERIAL NOT NULL,
    "busNumber" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "BusStatus" NOT NULL DEFAULT 'ACTIVE',
    "driverId" INTEGER,
    "routeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_key" ON "Driver"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_busNumber_key" ON "Bus"("busNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_driverId_key" ON "Bus"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "Minibus_driverId_key" ON "Minibus"("driverId");

-- AddForeignKey
ALTER TABLE "ChargingSlot" ADD CONSTRAINT "ChargingSlot_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "EVStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChargingSession" ADD CONSTRAINT "ChargingSession_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ChargingSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bus" ADD CONSTRAINT "Bus_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bus" ADD CONSTRAINT "Bus_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Minibus" ADD CONSTRAINT "Minibus_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Minibus" ADD CONSTRAINT "Minibus_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
