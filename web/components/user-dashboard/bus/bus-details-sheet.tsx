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
  Timer,
  TrendingUp,
  Award,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Types based on actual API response
interface RatingDistribution {
  "1": number
  "2": number
  "3": number
  "4": number
  "5": number
}

interface Rating {
  id: number
  score: number
  comment: string
  userName: string
  createdAt: string
}

interface Ratings {
  averageRating: string
  totalRatings: number
  distribution: RatingDistribution
  latest: Rating[]
}

interface Route {
  id: number
  name: string
  price: number
  currency: string
  estimatedTimeMin: number
  midPoints: string[]
  origin: string
  destination: string
  distanceKm: number
}

interface Vehicle {
  id: number
  plateNumber: string
  model: string
  year: number
}

interface DriverUser {
  id: string
  name: string
}

interface Driver {
  id: number
  licenseNumber: string
  phone: string
  user: DriverUser
}

interface NearestSchedule {
  scheduleId: number
  startTime: string
  endTime: string
  direction: string
  availableSeats: number
  estimatedArrival: string
}

interface BusData {
  id: number
  busNumber: string
  capacity: number
  currentStop: string | null
  nextDestination: string | null
  status: "ACTIVE" | "UNDER_MAINTENANCE" | "ON_TRIP" | "OFF_DUTY"
  departureTime: string
  driver: Driver
  driverName: string
  vehicle: Vehicle
  route: Route
  travelDirection: "UP" | "DOWN"
  ratings: Ratings
  nearestSchedule: NearestSchedule | null
}

interface BusDetailsSheetProps {
  bus: BusData | null
  schedule?: NearestSchedule | null
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

  // Use nearestSchedule if provided, otherwise use bus departure time
  const activeSchedule = schedule || bus.nearestSchedule
  const isForward = bus.travelDirection === "UP"
  const pricePerSeat = parseFloat(bus.route.price)
  const totalPrice = searchParams
    ? pricePerSeat * searchParams.passengers
    : pricePerSeat
  const availableSeats = activeSchedule?.availableSeats || bus.capacity
  const hasEnoughSeats = searchParams
    ? availableSeats >= searchParams.passengers
    : availableSeats > 0

  // Get driver name
  const getDriverName = () => {
    if (bus.driverName) return bus.driverName
    if (bus.driver.user?.name) return bus.driver.user.name
    return `Driver (${bus.driver.licenseNumber})`
  }

  // Get origin and destination based on direction
  const origin = bus.route.origin
  const destination = bus.route.destination

  // Calculate rating percentage distribution
  const getRatingPercentage = (score: number) => {
    if (!bus.ratings.totalRatings) return 0
    const count =
      bus.ratings.distribution[score as keyof RatingDistribution] || 0
    return (count / bus.ratings.totalRatings) * 100
  }

  // Format amenities based on bus features
  const amenities = [
    {
      icon: Wifi,
      label: "WiFi",
      available: bus.vehicle.model?.includes("Luxury") || false,
    },
    {
      icon: Coffee,
      label: "Refreshments",
      available: bus.route.distanceKm > 100,
    },
    { icon: Wind, label: "Air Conditioning", available: true },
    { icon: Briefcase, label: "Luggage Storage", available: true },
    { icon: Users, label: "Restroom", available: bus.capacity > 30 },
    { icon: Shield, label: "Security", available: true },
  ]

  // Features based on bus type
  const features = [
    { label: "Power Outlets", available: true },
    { label: "Reclining Seats", available: true },
    { label: "USB Charging", available: true },
    { label: "Reading Light", available: true },
    { label: "Extra Legroom", available: bus.route.distanceKm > 150 },
    {
      label: "TV/Entertainment",
      available: bus.vehicle.model?.includes("Luxury") || false,
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
                onClick={() => {
                  setIsSaved(!isSaved)
                  onSave?.(bus.id)
                }}
                className="rounded-full"
              >
                <Heart
                  className={cn(
                    "w-5 h-5 transition-all",
                    isSaved && "fill-red-500 text-red-500 scale-110",
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
        <div className="px-6 py-4 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:to-gray-950">
          <div className="flex items-center justify-between mb-4">
            <Badge
              variant="outline"
              className={cn(
                "px-3 py-1 font-medium",
                isForward
                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
                  : "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400",
              )}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 mr-1" />
              {isForward ? "Departure Trip" : "Return Trip"}
            </Badge>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">
                  {bus.ratings.averageRating}
                </span>
                <span className="text-sm text-gray-500">
                  ({bus.ratings.totalRatings} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Route Timeline */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CircleDot className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{origin}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activeSchedule?.startTime || bus.departureTime}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-dashed border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 py-1 bg-white dark:bg-gray-950 text-xs font-medium text-gray-600 rounded-full border">
                      {bus.route.estimatedTimeMin} min
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {bus.route.distanceKm} km
                </p>
              </div>

              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-3">
                  <div>
                    <p className="font-semibold text-lg">{destination}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {activeSchedule?.endTime ||
                        format(
                          new Date(
                            `2000-01-01T${bus.departureTime}:00`,
                          ).getTime() +
                            bus.route.estimatedTimeMin * 60000,
                          "HH:mm",
                        )}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Circle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Midpoints */}
            {bus.route.midPoints && bus.route.midPoints.length > 0 && (
              <div className="ml-6 pl-6 border-l-2 border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 mb-2">Via:</p>
                <div className="flex flex-wrap gap-2">
                  {bus.route.midPoints.map((point, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {point}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 pt-2">
            <div className="text-center p-3 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
              <Timer className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="text-xl font-bold">{bus.route.estimatedTimeMin}</p>
              <p className="text-xs text-gray-500">Minutes</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
              <Users className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="text-xl font-bold">{availableSeats}</p>
              <p className="text-xs text-gray-500">Seats Left</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
              <Bus className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="text-xl font-bold">{bus.capacity}</p>
              <p className="text-xs text-gray-500">Total Seats</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
              <Navigation className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="text-xl font-bold">{bus.route.distanceKm}</p>
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
          <TabsList className="w-full justify-start rounded-none border-b border-gray-200 dark:border-gray-800 bg-transparent p-0 h-auto">
            <TabsTrigger
              value="overview"
              className="rounded-lg border-b-2 border-transparent data-[state=active]:border-orange-500 bg-transparent px-4 py-3 data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-950/20"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-lg border-b-2 border-transparent data-[state=active]:border-orange-500 bg-transparent px-4 py-3 data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-950/20"
            >
              Reviews
            </TabsTrigger>
            <TabsTrigger
              value="bus"
              className="rounded-lg border-b-2 border-transparent data-[state=active]:border-orange-500 bg-transparent px-4 py-3 data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-950/20"
            >
              Bus Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-6 pb-20 space-y-6">
            {/* Journey Details */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-orange-500" />
                Journey Details
              </h3>

              <Card className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-[80px]">
                    <p className="text-sm font-medium text-gray-500">From</p>
                  </div>
                  <div>
                    <p className="font-medium">{origin}</p>
                    <p className="text-sm text-gray-500">
                      Departure:{" "}
                      {activeSchedule?.startTime || bus.departureTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="min-w-[80px]">
                    <p className="text-sm font-medium text-gray-500">To</p>
                  </div>
                  <div>
                    <p className="font-medium">{destination}</p>
                    <p className="text-sm text-gray-500">
                      Arrival:{" "}
                      {activeSchedule?.endTime ||
                        format(
                          new Date(
                            `2000-01-01T${bus.departureTime}:00`,
                          ).getTime() +
                            bus.route.estimatedTimeMin * 60000,
                          "HH:mm",
                        )}
                    </p>
                  </div>
                </div>

                {bus.currentStop && (
                  <div className="flex items-start gap-3">
                    <div className="min-w-[80px]">
                      <p className="text-sm font-medium text-gray-500">
                        Current
                      </p>
                    </div>
                    <div>
                      <Badge variant="outline" className="bg-blue-50">
                        {bus.currentStop}
                      </Badge>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Driver Info */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                Driver Information
              </h3>

              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 border-2 border-orange-200">
                    <AvatarImage
                      src={bus.driver?.user?.avaterUrl || "/default-avatar.png"}
                      alt={getDriverName()}
                    />

                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white text-lg">
                      {getDriverName().charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-semibold text-lg capitalize">
                          {getDriverName()}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />+{bus.driver.user.phone}
                        </p>
                      </div>
                      <Badge variant="default" className="bg-green-500">
                        Licensed
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Experience: {bus.driver.experience} Years
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Price Breakdown */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-500" />
                Price Breakdown
              </h3>

              <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Base fare per passenger
                    </span>
                    <span className="font-medium">
                      {bus.route.currency} {pricePerSeat.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Service fee (10%)
                    </span>
                    <span className="font-medium">
                      {bus.route.currency} {(pricePerSeat * 0.1).toFixed(2)}
                    </span>
                  </div>
                  <Separator className="bg-orange-200 dark:bg-orange-800" />
                  <div className="flex justify-between font-semibold">
                    <span>
                      Total for {searchParams?.passengers || 1} passenger(s)
                    </span>
                    <span className="text-orange-600 dark:text-orange-400 text-lg">
                      {bus.route.currency} {(totalPrice * 1.1).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    *Includes all taxes and service fees
                  </p>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="pt-6 pb-20 space-y-6">
            {/* Rating Summary */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                Rating Summary
              </h3>

              <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="text-center md:border-r md:pr-6">
                    <p className="text-5xl font-bold text-orange-600">
                      {bus.ratings.averageRating}
                    </p>
                    <div className="flex items-center justify-center gap-0.5 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "w-4 h-4",
                            star <=
                              Math.floor(parseFloat(bus.ratings.averageRating))
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 dark:text-gray-600",
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {bus.ratings.totalRatings} total reviews
                    </p>
                  </div>

                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm w-12">{rating} ★</span>
                        <Progress
                          value={getRatingPercentage(rating)}
                          className="h-2 flex-1"
                          indicatorClassName="bg-yellow-400"
                        />
                        <span className="text-sm text-gray-500 w-12">
                          {getRatingPercentage(rating).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Reviews */}
            <div>
              <h3 className="font-semibold mb-3">Recent Reviews</h3>
              <div className="space-y-3">
                {bus.ratings.latest.map((review, idx) => (
                  <Card
                    key={idx}
                    className="p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                            {review.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {review.userName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(review.createdAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-3 h-3",
                              star <= review.score
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 dark:text-gray-600",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {review.comment}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bus" className="pt-6 pb-20 space-y-6">
            {/* Vehicle Details */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Car className="w-4 h-4 text-orange-500" />
                Vehicle Information
              </h3>

              <Card className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">Model</span>
                    <span className="font-medium">{bus.vehicle.model}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">Year</span>
                    <span className="font-medium">{bus.vehicle.year}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">Plate Number</span>
                    <Badge variant="outline">{bus.vehicle.plateNumber}</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">Capacity</span>
                    <span className="font-medium">{bus.capacity} seats</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Status</span>
                    <Badge
                      className={cn(
                        bus.status === "ACTIVE" && "bg-green-500",
                        bus.status === "ON_TRIP" && "bg-blue-500",
                        bus.status === "UNDER_MAINTENANCE" && "bg-red-500",
                        bus.status === "OFF_DUTY" && "bg-gray-500",
                      )}
                    >
                      {bus.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>

            {/* Bus Service Status */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-orange-500" />
                Service Status
              </h3>

              <Card className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Schedule Time</p>
                      <p className="text-sm text-gray-500">
                        Departs at {bus.departureTime} daily
                      </p>
                    </div>
                  </div>

                  {bus.currentStop && (
                    <div className="flex items-start gap-3">
                      <Navigation className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Current Location</p>
                        <p className="text-sm text-gray-500">
                          {bus.currentStop}
                        </p>
                      </div>
                    </div>
                  )}

                  {bus.nextDestination && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Next Destination</p>
                        <p className="text-sm text-gray-500">
                          {bus.nextDestination}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Route Info */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                Route Information
              </h3>

              <Card className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Route Name</span>
                    <span className="font-medium text-sm">
                      {bus.route.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Distance</span>
                    <span className="font-medium">
                      {bus.route.distanceKm} km
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Est. Duration</span>
                    <span className="font-medium">
                      {bus.route.estimatedTimeMin} minutes
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Base Price</span>
                    <span className="font-medium">
                      {bus.route.currency} {bus.route.price}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm dark:bg-gray-950/95 border-t border-gray-200 dark:border-gray-800 px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
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
                  if (activeSchedule) {
                    onBook(bus.id, activeSchedule.scheduleId)
                    onOpenChange(false)
                  }
                }}
                disabled={
                  !hasEnoughSeats ||
                  bus.status === "UNDER_MAINTENANCE" ||
                  !activeSchedule
                }
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white min-w-[140px] shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                {!activeSchedule
                  ? "No Schedule"
                  : bus.status === "UNDER_MAINTENANCE"
                    ? "Unavailable"
                    : !hasEnoughSeats
                      ? "Sold Out"
                      : `Book Now${searchParams?.passengers && searchParams.passengers > 1 ? ` (${searchParams.passengers} seats)` : ""}`}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
