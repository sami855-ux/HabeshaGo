/*
  Warnings:

  - The values [CHAPA,CARD] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `deletedAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `seatNumbers` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `bookingId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `referenceId` on the `Payment` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `deletedAt` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `Wallet` table. All the data in the column will be lost.
  - You are about to alter the column `balance` on the `Wallet` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `meta` on the `WalletTransaction` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `WalletTransaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `deletedAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorEnabled` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorSecret` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `ChargingSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChargingSlot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EVStation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[vehicleId]` on the table `Bus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vehicleId]` on the table `Minibus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reference]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reference]` on the table `WalletTransaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[appleId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `driverLicenseUrl` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idBackUrl` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idFrontUrl` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idType` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flow` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `method` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `balanceAfter` to the `WalletTransaction` table without a default value. This is not possible if the table is not empty.
  - Made the column `reference` on table `WalletTransaction` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ChatSessionStatus" AS ENUM ('OPEN', 'ASSIGNED', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "MessageSenderType" AS ENUM ('USER', 'AGENT', 'BOT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ');

-- CreateEnum
CREATE TYPE "ChatPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('IMAGE', 'PDF', 'FILE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('LICENSE', 'PERMIT', 'TAX_CERTIFICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'VERIFY', 'REJECT', 'ACTIVATE', 'DEACTIVATE', 'DELETE');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('DRIVER', 'VEHICLE', 'BUS', 'USER', 'WALLET');

-- CreateEnum
CREATE TYPE "PassengerCategory" AS ENUM ('NORMAL', 'ELDERLY', 'DISABLED');

-- CreateEnum
CREATE TYPE "PointTransactionType" AS ENUM ('EARN', 'SPEND', 'EXPIRE', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

-- CreateEnum
CREATE TYPE "ScheduleDirection" AS ENUM ('FORWARD', 'REVERSE');

-- CreateEnum
CREATE TYPE "ShareStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('CHAPA', 'INTERNAL');

-- CreateEnum
CREATE TYPE "PaymentFlow" AS ENUM ('WALLET_TOPUP', 'WALLET_PAYMENT', 'DIRECT_PAYMENT');

-- CreateEnum
CREATE TYPE "SeatType" AS ENUM ('NORMAL', 'DISABLED');

-- CreateEnum
CREATE TYPE "StationStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ChargingPointStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'FAULTED', 'OFFLINE');

-- CreateEnum
CREATE TYPE "ChargingSpeed" AS ENUM ('SLOW', 'FAST', 'SUPER_FAST');

-- CreateEnum
CREATE TYPE "ConnectorType" AS ENUM ('CCS', 'TYPE2', 'CHADEMO');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SeatCategory" AS ENUM ('NORMAL', 'DISABLED', 'ELDERLY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'BOOKING', 'PAYMENT', 'ROUTE', 'BUS', 'WALLET', 'ALERT', 'REMINDER', 'BOOKING_SHARE', 'BOOKING_SHARE_ACCEPTED');

-- CreateEnum
CREATE TYPE "IdType" AS ENUM ('PASSPORT', 'NATIONAL_ID', 'KEBELE_ID');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('BUS', 'MINIBUS', 'TAXI', 'VAN', 'TRUCK');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ON_LEAVE');

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('WALLET', 'TELEBIRR', 'CBE', 'BANK_TRANSFER', 'CASH');
ALTER TABLE "Payment" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING ("method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "PaymentMethod_old";
COMMIT;

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionType" ADD VALUE 'TRANSFER_OUT';
ALTER TYPE "TransactionType" ADD VALUE 'TRANSFER_IN';
ALTER TYPE "TransactionType" ADD VALUE 'PAYMENT_OUT';
ALTER TYPE "TransactionType" ADD VALUE 'PAYMENT_IN';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'CHARGING_MANAGER';

-- DropForeignKey
ALTER TABLE "ChargingSession" DROP CONSTRAINT "ChargingSession_slotId_fkey";

-- DropForeignKey
ALTER TABLE "ChargingSession" DROP CONSTRAINT "ChargingSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "ChargingSlot" DROP CONSTRAINT "ChargingSlot_stationId_fkey";

-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_userId_fkey";

-- DropIndex
DROP INDEX "Booking_paymentId_key";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "deletedAt",
DROP COLUMN "isDeleted",
DROP COLUMN "seatNumbers",
ADD COLUMN     "amountPaid" DECIMAL(65,30),
ADD COLUMN     "checkedIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "checkedInAt" TIMESTAMP(3),
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'ETB',
ADD COLUMN     "discount" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "pointsConversionRate" DECIMAL(65,30),
ADD COLUMN     "pointsUsed" INTEGER,
ADD COLUMN     "pointsValue" DECIMAL(65,30),
ADD COLUMN     "promoCode" TEXT,
ADD COLUMN     "qrCode" TEXT,
ADD COLUMN     "reminder24Sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminder2hSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduleId" INTEGER,
ADD COLUMN     "seatsBooked" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sharedAt" TIMESTAMP(3),
ADD COLUMN     "sharedTicketUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sharedToId" TEXT,
ADD COLUMN     "totalAmount" DECIMAL(65,30),
ADD COLUMN     "validUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Bus" ADD COLUMN     "delayMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "departureTime" TIMESTAMP(3),
ADD COLUMN     "estimatedArrival" TIMESTAMP(3),
ADD COLUMN     "lastServiceDate" TIMESTAMP(3),
ADD COLUMN     "nextServiceDate" TIMESTAMP(3),
ADD COLUMN     "vehicleId" INTEGER;

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "complaintsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "driverLicenseUrl" TEXT NOT NULL,
ADD COLUMN     "idBackUrl" TEXT NOT NULL,
ADD COLUMN     "idFrontUrl" TEXT NOT NULL,
ADD COLUMN     "idStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "idType" "IdType" NOT NULL,
ADD COLUMN     "isOnDuty" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastActiveAt" TIMESTAMP(3),
ADD COLUMN     "licenseStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "totalTrips" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedById" TEXT;

-- AlterTable
ALTER TABLE "Minibus" ADD COLUMN     "vehicleId" INTEGER;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "bookingId",
DROP COLUMN "referenceId",
ADD COLUMN     "flow" "PaymentFlow" NOT NULL,
ADD COLUMN     "gateway" "PaymentGateway" NOT NULL DEFAULT 'CHAPA',
ADD COLUMN     "pointsUsed" INTEGER,
ADD COLUMN     "pointsValue" DECIMAL(65,30),
ADD COLUMN     "reference" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
DROP COLUMN "method",
ADD COLUMN     "method" "PaymentMethod" NOT NULL;

-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'ETB',
ADD COLUMN     "isSuspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "RouteMidPoint" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "deletedAt",
DROP COLUMN "isDeleted",
ADD COLUMN     "biometricEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "biometricToken" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pinAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pinHash" TEXT,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "WalletTransaction" DROP COLUMN "meta",
ADD COLUMN     "balanceAfter" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "recipientWalletId" INTEGER,
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "reference" SET NOT NULL;

-- AlterTable
ALTER TABLE "otp_code" ALTER COLUMN "codeHash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "deletedAt",
DROP COLUMN "image",
DROP COLUMN "isDeleted",
DROP COLUMN "twoFactorEnabled",
DROP COLUMN "twoFactorSecret",
ADD COLUMN     "appleId" TEXT,
ADD COLUMN     "avaterUrl" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "passengerCategory" "PassengerCategory" NOT NULL DEFAULT 'NORMAL';

-- DropTable
DROP TABLE "ChargingSession";

-- DropTable
DROP TABLE "ChargingSlot";

-- DropTable
DROP TABLE "EVStation";

-- DropTable
DROP TABLE "account";

-- DropTable
DROP TABLE "verification";

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "actionUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_chat_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT,
    "status" "ChatSessionStatus" NOT NULL DEFAULT 'OPEN',
    "subject" TEXT,
    "priority" "ChatPriority" NOT NULL DEFAULT 'NORMAL',
    "lastMessageAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_messages" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "senderType" "MessageSenderType" NOT NULL,
    "senderId" TEXT,
    "message" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "attachmentType" "AttachmentType",
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_typing_status" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isTyping" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_typing_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_agent_status" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "activeChats" INTEGER NOT NULL DEFAULT 0,
    "lastSeen" TIMESTAMP(3),

    CONSTRAINT "support_agent_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointTransaction" (
    "id" SERIAL NOT NULL,
    "walletId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "PointTransactionType" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingShare" (
    "id" TEXT NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "status" "ShareStatus" NOT NULL DEFAULT 'PENDING',
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "BookingShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusSchedule" (
    "id" SERIAL NOT NULL,
    "busId" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "direction" "ScheduleDirection" NOT NULL DEFAULT 'FORWARD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" SERIAL NOT NULL,
    "busId" INTEGER NOT NULL,
    "category" "SeatCategory" NOT NULL DEFAULT 'NORMAL',
    "isReserved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "vin" TEXT,
    "type" "VehicleType" NOT NULL,
    "model" TEXT NOT NULL,
    "manufacturer" TEXT,
    "year" INTEGER,
    "capacity" INTEGER NOT NULL,
    "vehicleImageUrl" TEXT DEFAULT '',
    "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT,
    "ownerName" TEXT,
    "ownerPhone" TEXT,
    "gpsDeviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleLocation" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverAssignment" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "driverId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "DriverAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "maxUsage" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "minAmount" DOUBLE PRECISION,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "stationId" INTEGER,
    "score" SMALLINT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charging_stations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "status" "StationStatus" NOT NULL DEFAULT 'ACTIVE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charging_stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "station_documents" (
    "id" SERIAL NOT NULL,
    "stationId" INTEGER NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "station_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "station_images" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "stationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "station_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charging_points" (
    "id" SERIAL NOT NULL,
    "stationId" INTEGER NOT NULL,
    "connectorType" "ConnectorType" NOT NULL,
    "powerKw" INTEGER NOT NULL,
    "status" "ChargingPointStatus" NOT NULL DEFAULT 'AVAILABLE',
    "averageSessionDuration" INTEGER,
    "slotNumber" TEXT,
    "maxVoltage" INTEGER,
    "maxCurrent" INTEGER,
    "chargingSpeed" "ChargingSpeed" NOT NULL DEFAULT 'SLOW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charging_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tariffs" (
    "id" SERIAL NOT NULL,
    "stationId" INTEGER NOT NULL,
    "pricePerKwh" DECIMAL(10,4) NOT NULL,
    "pricePerMinute" DECIMAL(10,4),
    "idleFeePerMinute" DECIMAL(10,4),
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tariffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charging_sessions" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "stationId" INTEGER NOT NULL,
    "chargingPointId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "meterStart" DECIMAL(10,3),
    "meterEnd" DECIMAL(10,3),
    "energyConsumedKwh" DECIMAL(10,3),
    "durationMinutes" INTEGER,
    "energyCost" DECIMAL(12,2),
    "timeCost" DECIMAL(12,2),
    "idleFee" DECIMAL(12,2),
    "totalCost" DECIMAL(12,2),
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charging_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "energy_meter_logs" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "meterValue" DECIMAL(10,3) NOT NULL,
    "powerKw" DECIMAL(6,2),
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "energy_meter_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "vehicleVin" VARCHAR(17),
    "chargingPointId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "reservationCode" TEXT,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "targetBatteryPercentage" INTEGER,
    "targetKwh" DECIMAL(12,2),
    "calculatedAmount" DECIMAL(12,2),
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "preAuthorizedAmount" DECIMAL(12,2),
    "isConnectorLocked" BOOLEAN NOT NULL DEFAULT true,
    "chargingSessionId" INTEGER,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "actorId" TEXT,
    "actorRole" "UserRole",
    "targetUserId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "support_chat_sessions_userId_idx" ON "support_chat_sessions"("userId");

-- CreateIndex
CREATE INDEX "support_chat_sessions_agentId_idx" ON "support_chat_sessions"("agentId");

-- CreateIndex
CREATE INDEX "support_messages_sessionId_idx" ON "support_messages"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_typing_status_sessionId_userId_key" ON "chat_typing_status"("sessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "support_agent_status_agentId_key" ON "support_agent_status"("agentId");

-- CreateIndex
CREATE INDEX "BookingShare_bookingId_idx" ON "BookingShare"("bookingId");

-- CreateIndex
CREATE INDEX "BookingShare_targetUserId_idx" ON "BookingShare"("targetUserId");

-- CreateIndex
CREATE UNIQUE INDEX "BusSchedule_busId_startTime_direction_key" ON "BusSchedule"("busId", "startTime", "direction");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_busId_key" ON "Seat"("busId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plateNumber_key" ON "vehicles"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vin_key" ON "vehicles"("vin");

-- CreateIndex
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");

-- CreateIndex
CREATE INDEX "vehicles_type_idx" ON "vehicles"("type");

-- CreateIndex
CREATE INDEX "vehicles_ownerId_idx" ON "vehicles"("ownerId");

-- CreateIndex
CREATE INDEX "VehicleLocation_vehicleId_recordedAt_idx" ON "VehicleLocation"("vehicleId", "recordedAt");

-- CreateIndex
CREATE INDEX "DriverAssignment_vehicleId_idx" ON "DriverAssignment"("vehicleId");

-- CreateIndex
CREATE INDEX "DriverAssignment_driverId_idx" ON "DriverAssignment"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "ratings_userId_idx" ON "ratings"("userId");

-- CreateIndex
CREATE INDEX "ratings_stationId_idx" ON "ratings"("stationId");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_userId_stationId_key" ON "ratings"("userId", "stationId");

-- CreateIndex
CREATE UNIQUE INDEX "charging_stations_name_lat_lng_key" ON "charging_stations"("name", "lat", "lng");

-- CreateIndex
CREATE INDEX "station_images_stationId_idx" ON "station_images"("stationId");

-- CreateIndex
CREATE INDEX "charging_points_stationId_idx" ON "charging_points"("stationId");

-- CreateIndex
CREATE INDEX "charging_points_status_idx" ON "charging_points"("status");

-- CreateIndex
CREATE INDEX "tariffs_stationId_idx" ON "tariffs"("stationId");

-- CreateIndex
CREATE INDEX "charging_sessions_vehicleId_idx" ON "charging_sessions"("vehicleId");

-- CreateIndex
CREATE INDEX "charging_sessions_stationId_idx" ON "charging_sessions"("stationId");

-- CreateIndex
CREATE INDEX "charging_sessions_status_idx" ON "charging_sessions"("status");

-- CreateIndex
CREATE INDEX "energy_meter_logs_sessionId_recordedAt_idx" ON "energy_meter_logs"("sessionId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_reservationCode_key" ON "reservations"("reservationCode");

-- CreateIndex
CREATE INDEX "reservations_chargingPointId_idx" ON "reservations"("chargingPointId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_vehicleId_key" ON "Bus"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "Minibus_vehicleId_key" ON "Minibus"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_reference_key" ON "WalletTransaction"("reference");

-- CreateIndex
CREATE INDEX "WalletTransaction_recipientWalletId_idx" ON "WalletTransaction"("recipientWalletId");

-- CreateIndex
CREATE UNIQUE INDEX "user_googleId_key" ON "user"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_appleId_key" ON "user"("appleId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_chat_sessions" ADD CONSTRAINT "support_chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_chat_sessions" ADD CONSTRAINT "support_chat_sessions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "support_chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_agent_status" ADD CONSTRAINT "support_agent_status_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_recipientWalletId_fkey" FOREIGN KEY ("recipientWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_sharedToId_fkey" FOREIGN KEY ("sharedToId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "BusSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingShare" ADD CONSTRAINT "BookingShare_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingShare" ADD CONSTRAINT "BookingShare_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingShare" ADD CONSTRAINT "BookingShare_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bus" ADD CONSTRAINT "Bus_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusSchedule" ADD CONSTRAINT "BusSchedule_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleLocation" ADD CONSTRAINT "VehicleLocation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverAssignment" ADD CONSTRAINT "DriverAssignment_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverAssignment" ADD CONSTRAINT "DriverAssignment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "charging_stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "station_documents" ADD CONSTRAINT "station_documents_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "charging_stations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "station_images" ADD CONSTRAINT "station_images_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "charging_stations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_points" ADD CONSTRAINT "charging_points_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "charging_stations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariffs" ADD CONSTRAINT "tariffs_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "charging_stations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "charging_stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_chargingPointId_fkey" FOREIGN KEY ("chargingPointId") REFERENCES "charging_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_meter_logs" ADD CONSTRAINT "energy_meter_logs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "charging_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_chargingSessionId_fkey" FOREIGN KEY ("chargingSessionId") REFERENCES "charging_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_chargingPointId_fkey" FOREIGN KEY ("chargingPointId") REFERENCES "charging_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Minibus" ADD CONSTRAINT "Minibus_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
