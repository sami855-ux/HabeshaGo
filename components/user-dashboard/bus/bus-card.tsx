"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Clock, MapPin, Users, AlertCircle, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { Bus } from "@/types/bus"

interface BusCardProps {
  bus: Bus
  onViewDetails: (busId: number) => void
  onBook: (busId: number) => void
}

export default function BusCard({ bus, onViewDetails, onBook }: BusCardProps) {
  const departureTime = new Date(bus.departureTime)
  const arrivalTime = new Date(bus.estimatedArrival)
  const duration = Math.round(
    (arrivalTime.getTime() - departureTime.getTime()) / (1000 * 60),
  )

  const seatPercentage = Math.round((bus.reservedSeats / bus.capacity) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 shadow-none transition-all duration-300 border border-gray-200 dark:border-gray-800 overflow-hidden group">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Section - Bus Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {bus.busNumber}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {bus.status}
                  </span>
                  {bus.delayMinutes > 0 && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      <AlertCircle className="w-3 h-3" />
                      {bus.delayMinutes} min delay
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold">{bus.route.name}</h3>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "ETB",
                    minimumFractionDigits: 2,
                  }).format(bus.route.distanceKm * 0.15)}
                </div>
                <p className="text-sm text-gray-500">per person</p>
              </div>
            </div>

            {/* Route Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-medium">{bus.route.origin}</span>
                  </div>
                  <div className="ml-1.5 mt-2 border-l-2 border-dashed border-gray-300 dark:border-gray-700 h-8"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="font-medium">{bus.route.destination}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center">
                  <Clock className="w-5 h-5 text-gray-500 mb-1" />
                  <span className="text-sm font-medium">{duration} min</span>
                  <span className="text-xs text-gray-500">Duration</span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <MapPin className="w-5 h-5 text-gray-500 mb-1" />
                  <span className="text-sm font-medium">
                    {bus.route.distanceKm} km
                  </span>
                  <span className="text-xs text-gray-500">Distance</span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <Users className="w-5 h-5 text-gray-500 mb-1" />
                  <span className="text-sm font-medium">
                    {bus.availableSeats}
                  </span>
                  <span className="text-xs text-gray-500">Available</span>
                </div>
              </div>

              {/* Midpoints */}
              {bus.route.midPoints.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Stops:{" "}
                    {bus.route.midPoints.map((mp) => mp.name).join(" → ")}
                  </p>
                </div>
              )}
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Departure</p>
                <p className="font-medium">
                  {format(departureTime, "hh:mm a")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Arrival</p>
                <p className="font-medium">{format(arrivalTime, "hh:mm a")}</p>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex flex-col gap-3 md:w-64">
            {/* Seat Availability Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Seat Availability
                </span>
                <span className="font-medium">
                  {bus.availableSeats}/{bus.capacity}
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${seatPercentage}%` }}
                  transition={{ duration: 1 }}
                  className={`h-full rounded-full ${
                    seatPercentage > 80
                      ? "bg-red-500"
                      : seatPercentage > 50
                        ? "bg-amber-500"
                        : "bg-green-500"
                  }`}
                />
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="text-sm p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="font-medium">{bus.vehicle.model}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {bus.vehicle.manufacturer} • {bus.vehicle.year}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => onBook(bus.id)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  disabled={bus.availableSeats === 0}
                >
                  {bus.availableSeats === 0 ? "Sold Out" : "Book Now"}
                </Button>
              </motion.div>

              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={() => onViewDetails(bus.id)}
                  className="w-full group"
                >
                  View Details
                  <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
