// components/bus-details-sheet.tsx
"use client"

import React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
  Clock,
  MapPin,
  Users,
  Car,
  User,
  Calendar,
  Shield,
  CheckCircle,
  AlertCircle,
  Wifi,
  Coffee,
  Droplets,
  Wind,
  Star,
} from "lucide-react"
import { format } from "date-fns"
import { Bus } from "@/types/bus"

interface BusDetailsSheetProps {
  bus: Bus | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onBook: (busId: number) => void
}

export default function BusDetailsSheet({
  bus,
  open,
  onOpenChange,
  onBook,
}: BusDetailsSheetProps) {
  if (!bus) return null

  const departureTime = new Date(bus.departureTime)
  const arrivalTime = new Date(bus.estimatedArrival)

  const seatCategories = {
    NORMAL: "Normal Seat",
    ELDERLY: "Elderly Priority",
    DISABLED: "Accessible Seat",
  }

  const amenities = [
    { icon: <Wifi className="w-5 h-5" />, label: "Free WiFi", available: true },
    {
      icon: <Coffee className="w-5 h-5" />,
      label: "Refreshments",
      available: true,
    },
    { icon: <Droplets className="w-5 h-5" />, label: "AC", available: true },
    {
      icon: <Wind className="w-5 h-5" />,
      label: "Air Freshener",
      available: true,
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "Insurance",
      available: true,
    },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-4 px-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {bus.busNumber}
              </span>
              <span className="text-sm font-normal px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {bus.status}
              </span>
            </SheetTitle>
            <SheetDescription>
              Complete details for {bus.route.name}
            </SheetDescription>
          </SheetHeader>

          {/* Main Info Card */}
          <Card className="p-6 mb-6 shadow-none bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ${Math.round(bus.route.distanceKm * 0.15)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Per Person
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-xl font-bold">
                    {format(departureTime, "hh:mm a")} -{" "}
                    {format(arrivalTime, "hh:mm a")}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {bus.route.estimatedTimeMin} min journey
                </p>
              </div>

              <div className="text-center">
                <div className="text-xl font-bold">{bus.availableSeats}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Available Seats
                </p>
              </div>
            </div>
          </Card>

          {/* Route Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Route Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="w-0.5 h-12 bg-green-500"></div>
                </div>
                <div>
                  <p className="font-semibold">Departure</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {bus.route.origin}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(departureTime, "EEEE, MMMM do, yyyy")}
                  </p>
                </div>
              </div>

              {/* Midpoints */}
              {bus.route.midPoints.map((midpoint, index) => (
                <div key={midpoint.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    {index < bus.route.midPoints.length - 1 && (
                      <div className="w-0.5 h-12 bg-blue-500"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">Stop {index + 1}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {midpoint.name}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                </div>
                <div>
                  <p className="font-semibold">Arrival</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {bus.route.destination}
                  </p>
                  <p className="text-sm text-gray-500">
                    Estimated: {format(arrivalTime, "hh:mm a")}
                    {bus.delayMinutes > 0 && (
                      <span className="text-amber-600 ml-2">
                        (+{bus.delayMinutes} min delay)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Car className="w-5 h-5" />
              Vehicle Information
            </h3>
            <Card className="p-4 shadow-none">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="font-medium">{bus.vehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Manufacturer</p>
                  <p className="font-medium">{bus.vehicle.manufacturer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year</p>
                  <p className="font-medium">{bus.vehicle.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plate Number</p>
                  <p className="font-medium">{bus.vehicle.plateNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{bus.vehicle.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="font-medium">{bus.vehicle.capacity} seats</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Driver Info */}
          {bus.driver && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Driver Information
              </h3>
              <Card className="p-4 shadow-none">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    {bus.driver.profileImage ? (
                      <img
                        src={bus.driver.profileImage}
                        alt={bus.driver.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">
                          {bus.driver.name}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          License: {bus.driver.licenseNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i <
                              Math.min(
                                5,
                                Math.floor(bus.driver.yearsOfExperience / 2),
                              )
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300 dark:text-gray-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="font-medium">
                          {bus.driver.yearsOfExperience} years
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Contact</p>
                        <p className="font-medium">{bus.driver.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Seat Layout Preview */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Seat Categories</h3>
            <div className="flex flex-wrap gap-4">
              {Object.entries(seatCategories).map(([key, label]) => {
                const seats = bus.seats.filter((s) => s.category === key)
                const available = seats.filter((s) => !s.isReserved).length

                return (
                  <Card
                    key={key}
                    className="p-4 flex-1 min-w-[150px] shadow-none"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center ${
                          key === "NORMAL"
                            ? "bg-blue-100 text-blue-600"
                            : key === "ELDERLY"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {available} available
                        </p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Service Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Service Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bus.lastServiceDate && (
                <Card className="p-4">
                  <p className="text-sm text-gray-500">Last Service</p>
                  <p className="font-medium">
                    {format(new Date(bus.lastServiceDate), "MMMM do, yyyy")}
                  </p>
                </Card>
              )}
              {bus.nextServiceDate && (
                <Card className="p-4">
                  <p className="text-sm text-gray-500">Next Service Due</p>
                  <p className="font-medium">
                    {format(new Date(bus.nextServiceDate), "MMMM do, yyyy")}
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-background pt-4 border-t">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}
