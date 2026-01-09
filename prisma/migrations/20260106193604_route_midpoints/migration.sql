/*
  Warnings:

  - You are about to drop the column `midPoints` on the `Route` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Route" DROP COLUMN "midPoints";

-- CreateTable
CREATE TABLE "RouteMidPoint" (
    "id" SERIAL NOT NULL,
    "routeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RouteMidPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RouteMidPoint_routeId_idx" ON "RouteMidPoint"("routeId");

-- AddForeignKey
ALTER TABLE "RouteMidPoint" ADD CONSTRAINT "RouteMidPoint_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
