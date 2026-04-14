"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import {
  Bus as BusIcon,
  Filter,
  X,
  Clock,
  MapPin,
  Users,
  IndianRupee,
  AlertCircle,
  User,
  ArrowRight,
  Flag,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { calculatePayment, formatCurrencyIntl } from "@/lib/utils"

interface BusSchedule {
  scheduleId: number
  startTime: string
  endTime: string
  availableSeats: number
  direction: "FORWARD" | "REVERSE"
}

interface BusRoute {
  id: number
  name: string
  price: string
  currency: string
  estimatedTimeMin: number
  midPoints: string[]
  origin: string
  destination: string
}

interface BusVehicle {
  id: number
  plateNumber: string
  vin: string
  type: string
  model: string
  manufacturer: string
  year: number
  capacity: number
  vehicleImageUrl: string
  status: string
  mileage: number
  ownerName: string | null
  ownerPhone: string | null
  gpsDeviceId: string
  createdAt: string
  updatedAt: string
}

interface BusDriver {
  id: string
  userId: string
  licenseNo: string
  experience: number
  status: string
  driverLicenseUrl: string
  licenseStatus: string
  idType: string
  idFrontUrl: string
  idBackUrl: string
  idStatus: string
  verifiedById: string | null
  verifiedAt: string | null
  rejectionReason: string | null
  isOnDuty: boolean
  lastActiveAt: string | null
  rating: number
  totalTrips: number
  complaintsCount: number
  createdAt: string
}

interface BusData {
  id: number
  busNumber: string
  capacity: number
  reservedSeats: number
  currentStop: string | null
  nextDestination: string | null
  status: "ACTIVE" | "UNDER_MAINTENANCE" | "ON_TRIP" | "OFF_DUTY"
  departureTime: string | null
  estimatedArrival: string | null
  delayMinutes: number
  lastServiceDate: string
  nextServiceDate: string
  driver: BusDriver
  vehicle: BusVehicle
  route: BusRoute
}

interface BusListItem {
  bus: BusData
  nearestSchedule: BusSchedule
}

interface BusListProps {
  buses: BusListItem[]
  isLoading: boolean
  onViewDetails: (busId: number) => void
  onBook: (busId: number, scheduleId: number) => void
  searchParams: {
    from: string
    to: string
    date: Date
    time: string
    passengers: number
  }
}

export default function BusList({
  buses,
  isLoading,
  onViewDetails,
  onBook,
  searchParams,
}: BusListProps) {
  const [sortBy, setSortBy] = useState("departure")
  const [filterStatus, setFilterStatus] = useState("all")

  // Sorting logic based on the new data structure
  const sortedBuses = useMemo(() => {
    return [...buses].sort((a, b) => {
      switch (sortBy) {
        case "departure":
          // Sort by schedule start time
          return a.nearestSchedule.startTime.localeCompare(
            b.nearestSchedule.startTime,
          )
        case "price":
          // Sort by route price (converted to number)
          const priceA = parseFloat(a.bus.route.price) || 0
          const priceB = parseFloat(b.bus.route.price) || 0
          return priceA - priceB
        case "duration":
          // Sort by estimated time
          return a.bus.route.estimatedTimeMin - b.bus.route.estimatedTimeMin
        case "seats":
          // Sort by available seats
          return (
            b.nearestSchedule.availableSeats - a.nearestSchedule.availableSeats
          )
        case "delay":
          // Sort by delay minutes
          return a.bus.delayMinutes - b.bus.delayMinutes
        default:
          return 0
      }
    })
  }, [buses, sortBy])

  // Filter logic
  const filteredBuses = useMemo(() => {
    return sortedBuses.filter((item) => {
      const { bus, nearestSchedule } = item

      switch (filterStatus) {
        case "all":
          return true
        case "available":
          return (
            (nearestSchedule.availableSeats > 0 && bus.status === "ACTIVE") ||
            bus.status === "ON_TRIP"
          )
        case "no-delay":
          return bus.delayMinutes === 0
        case "active":
          return bus.status === "ACTIVE" || bus.status === "ON_TRIP"
        case "premium":
          return (
            bus.vehicle.model?.toLowerCase().includes("luxury") ||
            bus.vehicle.manufacturer?.toLowerCase().includes("mercedes")
          )
        default:
          return true
      }
    })
  }, [sortedBuses, filterStatus])

  // Get bus status badge color
  const getBusStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "ON_TRIP":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "UNDER_MAINTENANCE":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "OFF_DUTY":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 px-10 mb-10">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="p-6 animate-pulse border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="h-4 bg-gray-300 dark:bg-gray-700 rounded"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="md:w-56 space-y-3">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (buses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 px-10 mb-10"
      >
        <Card className="p-8 max-w-lg mx-auto border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="w-20 h-20 mx-auto bg-orange-50 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
            <BusIcon className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No buses available</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            We couldn't find any buses matching your search criteria.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-left">
            <p className="text-sm font-medium mb-2">Your search:</p>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {searchParams.from} →{" "}
                {searchParams.to}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> {format(searchParams.date, "PPP")}{" "}
                at {searchParams.time}
              </p>
              <p className="flex items-center gap-2">
                <Users className="w-4 h-4" /> {searchParams.passengers}{" "}
                passenger{searchParams.passengers > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Try adjusting your search criteria or choose a different time.
          </p>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6 px-10 mb-10">
      {/* Results Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">
              Available Buses ({filteredBuses.length})
            </h2>
            <Badge
              variant="outline"
              className="bg-orange-50 dark:bg-orange-900/30"
            >
              {buses.reduce(
                (acc, item) => acc + item.nearestSchedule.availableSeats,
                0,
              )}{" "}
              total seats
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            {searchParams.from} → {searchParams.to}
            <span className="mx-2">•</span>
            <Clock className="w-4 h-4 text-orange-500" />
            {searchParams.time}
            <span className="mx-2">•</span>
            <Users className="w-4 h-4 text-orange-500" />
            {searchParams.passengers} passenger
            {searchParams.passengers > 1 ? "s" : ""}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="departure">Departure Time</SelectItem>
                <SelectItem value="price">Price (Low to High)</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="seats">Available Seats</SelectItem>
                <SelectItem value="delay">Least Delay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buses</SelectItem>
              <SelectItem value="available">Has Available Seats</SelectItem>
              <SelectItem value="active">Active/On Trip</SelectItem>
              <SelectItem value="no-delay">No Delay</SelectItem>
              <SelectItem value="premium">Premium Buses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Buses List */}
      <AnimatePresence>
        <div className="space-y-4">
          {filteredBuses.map((item, index) => {
            const { bus, nearestSchedule } = item
            const availableSeats = nearestSchedule.availableSeats
            const seatAvailabilityPercentage =
              (availableSeats / bus.capacity) * 100
            const isForward = nearestSchedule.direction === "FORWARD"

            return (
              <motion.div
                key={bus.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left Section - Bus Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            {/* Bus Icon/Image */}
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                              <BusIcon className="w-8 h-8 text-white" />
                            </div>

                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-semibold">
                                  {bus.busNumber}
                                </h3>
                                <Badge
                                  className={getBusStatusBadge(bus.status)}
                                >
                                  {bus.status.replace("_", " ")}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {bus.vehicle.manufacturer} {bus.vehicle.model} •{" "}
                                {bus.vehicle.year}
                              </p>
                            </div>
                          </div>

                          {/* Delay Warning & Direction */}
                          <div className="flex items-center gap-2">
                            {bus.delayMinutes > 0 && (
                              <Badge
                                variant="destructive"
                                className="flex items-center gap-1"
                              >
                                <AlertCircle className="w-3 h-3" />
                                Delayed {bus.delayMinutes} min
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Route Info with Direction Context */}
                        <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-800/50 dark:to-gray-800/30 rounded-lg p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-sm font-medium">
                                  Route: {bus.route.name}
                                </span>
                              </div>
                              {/* Direction-aware route display */}
                              <div className="flex items-center gap-2 mt-2 ml-5">
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {isForward
                                      ? bus.route.origin
                                      : bus.route.destination}
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-gray-400" />
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {isForward
                                      ? bus.route.destination
                                      : bus.route.origin}
                                  </span>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5"
                                >
                                  {isForward ? "Forward Trip" : "Return Trip"}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 ml-5">
                                {bus.route.midPoints.slice(0, 3).join(" → ")}
                                {bus.route.midPoints.length > 3 && " ..."}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                {bus.route.currency}{" "}
                                {parseFloat(bus.route.price).toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500">
                                per seat
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Schedule & Features Grid with Direction Icons */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Departure
                            </p>
                            <p className="font-semibold">
                              {nearestSchedule.startTime}
                            </p>
                            <p className="text-xs text-gray-500">
                              {isForward
                                ? bus.route.origin
                                : bus.route.destination}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Flag className="w-3 h-3" />
                              Arrival
                            </p>
                            <p className="font-semibold">
                              {nearestSchedule.endTime}
                            </p>
                            <p className="text-xs text-gray-500">
                              {isForward
                                ? bus.route.origin
                                : bus.route.destination}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Duration
                            </p>
                            <p className="font-semibold">
                              {bus.route.estimatedTimeMin} min
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Driver
                            </p>
                            <p className="font-semibold text-sm">
                              {bus.driver.experience}+ yrs exp.
                              {bus.driver.rating > 0 &&
                                ` • ${bus.driver.rating}⭐`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Booking */}
                      <div className="lg:w-64 space-y-4 lg:border-l lg:border-gray-200 dark:lg:border-gray-700 lg:pl-6">
                        {/* Seat Availability */}
                        <div className="text-center">
                          <div className="inline-flex items-baseline gap-1">
                            <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                              {availableSeats}
                            </span>
                            <span className="text-sm text-gray-500">
                              /{bus.capacity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Seats Available
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${seatAvailabilityPercentage}%`,
                              }}
                            />
                          </div>

                          {/* Price */}
                          <div className="mb-4">
                            <p className="text-sm text-gray-500">Total Price</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {formatCurrencyIntl(
                                calculatePayment({
                                  baseAmount: bus.route.price,
                                  passengers: searchParams.passengers,
                                }),
                                "ETB",
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              for {searchParams.passengers} passenger
                              {searchParams.passengers > 1 ? "s" : ""}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="space-y-2">
                            <Button
                              onClick={() => onViewDetails(bus.id)}
                              variant="outline"
                              className="w-full border-2 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                            >
                              View Details
                            </Button>
                            <Button
                              onClick={() =>
                                onBook(bus.id, nearestSchedule.scheduleId)
                              }
                              disabled={
                                availableSeats < searchParams.passengers ||
                                bus.status === "UNDER_MAINTENANCE"
                              }
                              className={cn(
                                "w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white",
                                (availableSeats < searchParams.passengers ||
                                  bus.status === "UNDER_MAINTENANCE") &&
                                  "opacity-50 cursor-not-allowed",
                              )}
                            >
                              {availableSeats < searchParams.passengers
                                ? "Not Enough Seats"
                                : bus.status === "UNDER_MAINTENANCE"
                                  ? "Unavailable"
                                  : "Book Now"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </AnimatePresence>
    </div>
  )
}

// Helper function for className merging
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
