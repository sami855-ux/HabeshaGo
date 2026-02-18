// components/bus-details-sheet.tsx
"use client"

import React, { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import {
  Clock,
  MapPin,
  Users,
  Car,
  User,
  Calendar,
  Shield,
  AlertCircle,
  Star,
  Bus,
  Gauge,
  CreditCard,
  CalendarClock,
  Phone,
  Mail,
  ChevronRight,
  ArrowLeftRight,
  Navigation,
  Wifi,
  Coffee,
  Wind,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Settings,
  FileText,
  Download,
  Share2,
  Heart,
  MoreHorizontal,
  ArrowUpDown,
  CircleDot,
  Circle,
  Check,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface BusSchedule {
  scheduleId: number
  startTime: string
  endTime: string
  availableSeats: number
  direction?: "FORWARD" | "REVERSE"
  date?: string
}

interface BusRoute {
  id: number
  name: string
  price: string
  currency: string
  estimatedTimeMin: number
  midPoints: string[]
  startPoint?: string
  endPoint?: string
  distance?: string
  amenities?: string[]
  distanceKm: string
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
  amenities?: string[]
  features?: string[]
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
  user?: {
    name?: string
    firstName?: string
    lastName?: string
    avaterUrl?: string
    email?: string
    phone?: string
  }
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
  driverName?: string
  driver: BusDriver
  vehicle: BusVehicle
  route: BusRoute
  amenities?: string[]
  rating?: number
  totalReviews?: number
}

interface BusDetailsSheetProps {
  bus: BusData | null
  schedule?: BusSchedule | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onBook: (busId: number, scheduleId: number) => void
  onSave?: (busId: number) => void
  onShare?: (busId: number) => void
  searchParams?: {
    from: string
    to: string
    date: Date
    time: string
    passengers: number
  }
}

export default function BusDetailsSheet({
  bus,
  schedule,
  open,
  onOpenChange,
  onBook,
  onSave,
  onShare,
  searchParams,
}: BusDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isSaved, setIsSaved] = useState(false)

  if (!bus) return null

  const isForward = schedule?.direction === "FORWARD"
  const pricePerSeat = parseFloat(bus.route.price) || 0
  const totalPrice = searchParams
    ? pricePerSeat * searchParams.passengers
    : pricePerSeat
  const availableSeats =
    schedule?.availableSeats || bus.capacity - bus.reservedSeats
  const hasEnoughSeats = searchParams
    ? availableSeats >= searchParams.passengers
    : availableSeats > 0

  // Get driver name
  const getDriverName = () => {
    if (bus.driverName) return bus.driverName
    if (bus.driver.user?.name) return bus.driver.user.name
    if (bus.driver.user?.firstName) {
      return `${bus.driver.user.firstName} ${bus.driver.user.lastName || ""}`
    }
    return `Driver (${bus.driver.licenseNo})`
  }

  // Get origin and destination based on direction
  const origin = isForward
    ? bus.route.startPoint || searchParams?.from || "Origin"
    : bus.route.endPoint || searchParams?.to || "Destination"

  const destination = isForward
    ? bus.route.endPoint || searchParams?.to || "Destination"
    : bus.route.startPoint || searchParams?.from || "Origin"

  // Mock amenities
  const amenities = [
    { icon: Wifi, label: "WiFi", available: true },
    { icon: Coffee, label: "Refreshments", available: true },
    { icon: Wind, label: "AC", available: true },
    {
      icon: Briefcase,
      label: "Storage",
      available: bus.vehicle.type === "LUXURY",
    },
    { icon: Users, label: "Restroom", available: bus.capacity > 30 },
    { icon: Shield, label: "Security", available: true },
  ]

  // Mock features
  const features = [
    { label: "Power Outlets", available: true },
    { label: "Reclining Seats", available: true },
    { label: "Entertainment", available: bus.vehicle.type === "LUXURY" },
    { label: "Reading Light", available: true },
    { label: "USB Charging", available: true },
    { label: "Foot Rest", available: bus.vehicle.type !== "STANDARD" },
  ]

  // Mock reviews
  const recentReviews = [
    {
      user: "John D.",
      rating: 5,
      comment: "Very comfortable ride, on time!",
      date: "2 days ago",
    },
    {
      user: "Sarah M.",
      rating: 4,
      comment: "Clean bus, professional driver",
      date: "1 week ago",
    },
    {
      user: "Robert K.",
      rating: 5,
      comment: "Best bus service I've used",
      date: "2 weeks ago",
    },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl p-0 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold">{bus.busNumber}</h2>
                <p className="text-sm text-gray-500">{bus.route.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSave?.(bus.id)}
                className="rounded-full"
              >
                <Heart
                  className={cn(
                    "w-5 h-5",
                    isSaved && "fill-red-500 text-red-500",
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onShare?.(bus.id)}
                className="rounded-full"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="px-6 py-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="flex items-center justify-between mb-4">
            <Badge
              variant="outline"
              className={cn(
                "px-3 py-1",
                isForward
                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
                  : "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400",
              )}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 mr-1" />
              {isForward ? "Forward Trip" : "Return Trip"}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{bus.rating || 4.8}</span>
              <span className="text-sm text-gray-500">
                ({bus.totalReviews || 128} reviews)
              </span>
            </div>
          </div>

          {/* Route Timeline */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <CircleDot className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">{origin}</p>
                  <p className="text-sm text-gray-500">
                    {schedule?.startTime || "10:00 AM"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white dark:bg-gray-950 text-xs text-gray-500">
                    {bus.route.estimatedTimeMin} min
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 text-right">
              <div className="flex items-center justify-end gap-3">
                <div>
                  <p className="font-medium">{destination}</p>
                  <p className="text-sm text-gray-500">
                    {schedule?.endTime || "12:30 PM"}
                  </p>
                </div>
                <Circle className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{bus.route.estimatedTimeMin}</p>
              <p className="text-xs text-gray-500">Minutes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{availableSeats}</p>
              <p className="text-xs text-gray-500">Seats Left</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{bus.capacity}</p>
              <p className="text-xs text-gray-500">Total Seats</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {bus.route.distanceKm || "250"}
              </p>
              <p className="text-xs text-gray-500">km</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="overview"
          className="px-6"
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full justify-start rounded-none border-b border-gray-200 dark:border-gray-800 bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className="rounded-lg border-b-2 border-transparent data-[state=active]:border-orange-300 bg-transparent px-4 py-3"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="amenities"
              className="rounded-lg border-b-2 border-transparent data-[state=active]:border-orange-300 bg-transparent px-4 py-3"
            >
              Amenities
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-lg border-b-2 border-transparent data-[state=active]:border-orange-300 bg-transparent px-4 py-3"
            >
              Reviews
            </TabsTrigger>
            <TabsTrigger
              value="bus"
              className="rounded-lg border-b-2 border-transparent data-[state=active]:border-orange-300 bg-transparent px-4 py-3"
            >
              Bus Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-6 pb-20">
            {/* Journey Details */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Journey Details</h3>
                <div className="space-y-4">
                  {/* Stops */}
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-700"></div>
                      </div>
                      <div className="flex-1 pb-3">
                        <p className="font-medium">{origin}</p>
                        <p className="text-sm text-gray-500">
                          Departure • {schedule?.startTime}
                        </p>
                      </div>
                    </div>

                    {/* Midpoints */}
                    {bus.route.midPoints &&
                      bus.route.midPoints.length > 0 &&
                      (isForward
                        ? bus.route.midPoints
                        : [...bus.route.midPoints].reverse()
                      )
                        .filter((m) => m !== origin && m !== destination)
                        .slice(0, 2)
                        .map((midpoint, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                              {idx < 1 && (
                                <div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-700"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-3">
                              <p className="font-medium">{midpoint}</p>
                              <p className="text-sm text-gray-500">
                                Intermediate Stop
                              </p>
                            </div>
                          </div>
                        ))}

                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <div className="flex-1">
                        <p className="font-medium">{destination}</p>
                        <p className="text-sm text-gray-500">
                          Arrival • {schedule?.endTime}
                          {bus.delayMinutes > 0 && (
                            <span className="text-amber-600 ml-2">
                              +{bus.delayMinutes} min delay
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Driver Info Card */}
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={bus.driver.user?.avaterUrl} />
                        <AvatarFallback className="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                          {getDriverName().charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{getDriverName()}</p>
                            <p className="text-sm text-gray-500">
                              {bus.driver.experience} years experience
                            </p>
                          </div>
                          <Badge
                            variant={
                              bus.driver.isOnDuty ? "default" : "secondary"
                            }
                          >
                            {bus.driver.isOnDuty ? "On Duty" : "Off Duty"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Price Breakdown */}
                  <Card className="p-4 bg-orange-50 dark:bg-orange-950/20">
                    <h4 className="font-medium mb-3">Price Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Base fare ({bus.route.currency})
                        </span>
                        <span>{pricePerSeat.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Service fee
                        </span>
                        <span>{(pricePerSeat * 0.1).toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>
                          Total for {searchParams?.passengers || 1} passenger(s)
                        </span>
                        <span className="text-orange-600 dark:text-orange-400">
                          {bus.route.currency} {(totalPrice * 1.1).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="amenities" className="pt-6 pb-20">
            <div className="space-y-6">
              {/* Amenities Grid */}
              <div>
                <h3 className="font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <amenity.icon
                        className={cn(
                          "w-5 h-5",
                          amenity.available
                            ? "text-green-500"
                            : "text-gray-400",
                        )}
                      />
                      <div>
                        <p className="font-medium">{amenity.label}</p>
                        <p className="text-xs text-gray-500">
                          {amenity.available ? "Available" : "Not Available"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-3">Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {feature.available ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          !feature.available && "text-gray-400",
                        )}
                      >
                        {feature.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="pt-6 pb-20">
            <div className="space-y-6">
              {/* Rating Summary */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold">{bus.rating || 4.8}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-4 h-4",
                          star <= Math.floor(bus.rating || 4.8)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-600",
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {bus.totalReviews || 128} reviews
                  </p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-8">{rating} ★</span>
                      <Progress
                        value={rating === 5 ? 70 : rating === 4 ? 20 : 5}
                        className="h-2"
                      />
                      <span className="text-sm text-gray-500 w-8">
                        {rating === 5 ? "70%" : rating === 4 ? "20%" : "5%"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reviews */}
              <div>
                <h3 className="font-semibold mb-3">Recent Reviews</h3>
                <div className="space-y-4">
                  {recentReviews.map((review, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{review.user}</p>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-3 h-3",
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 dark:text-gray-600",
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {review.comment}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bus" className="pt-6 pb-20">
            <div className="space-y-6">
              {/* Bus Details */}
              <div>
                <h3 className="font-semibold mb-3">Bus Information</h3>
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Model</span>
                      <span className="font-medium">
                        {bus.vehicle.manufacturer} {bus.vehicle.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Year</span>
                      <span className="font-medium">{bus.vehicle.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Plate Number</span>
                      <span className="font-medium">
                        {bus.vehicle.plateNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Capacity</span>
                      <span className="font-medium">
                        {bus.vehicle.capacity} seats
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mileage</span>
                      <span className="font-medium">
                        {bus.vehicle.mileage.toLocaleString()} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Service</span>
                      <span className="font-medium">
                        {bus.lastServiceDate
                          ? format(
                              new Date(bus.lastServiceDate),
                              "MMM do, yyyy",
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Owner Info */}
              {bus.vehicle.ownerName && (
                <div>
                  <h3 className="font-semibold mb-3">Owner Information</h3>
                  <Card className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name</span>
                        <span className="font-medium">
                          {bus.vehicle.ownerName}
                        </span>
                      </div>
                      {bus.vehicle.ownerPhone && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Phone</span>
                          <span className="font-medium">
                            {bus.vehicle.ownerPhone}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Price</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {bus.route.currency} {(totalPrice * 1.1).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">incl. taxes & fees</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-2"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (schedule) {
                    onBook(bus.id, schedule.scheduleId)
                    onOpenChange(false)
                  }
                }}
                disabled={
                  !hasEnoughSeats ||
                  bus.status === "UNDER_MAINTENANCE" ||
                  !schedule
                }
                className="bg-orange-500 hover:bg-orange-600 text-white min-w-[140px]"
              >
                {!schedule
                  ? "No Schedule"
                  : bus.status === "UNDER_MAINTENANCE"
                    ? "Unavailable"
                    : !hasEnoughSeats
                      ? "Sold Out"
                      : "Book Now"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
