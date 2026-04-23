"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TripCard from "@/components/user-dashboard/trip/TripCard"
import TripSkeleton from "@/components/user-dashboard/trip/TripSkeleton"
import TripsEmptyState from "@/components/user-dashboard/trip/TripsEmptyState"
import { Trip, TripCategory } from "@/types/trips"
import { getUserBookings } from "@/services/booking.api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Search,
  SlidersHorizontal,
  Calendar,
  MapPin,
  X,
  Filter,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Clock,
  TrendingUp,
  Ticket,
  Download,
  RefreshCw,
  Headset,
  Car,
  Smartphone,
  Bus,
  BatteryCharging,
  ParkingCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { format, subDays, isWithinInterval, parseISO } from "date-fns"

type SortOption =
  | "date-asc"
  | "date-desc"
  | "price-asc"
  | "price-desc"
  | "duration"
type DateFilter = "all" | "today" | "week" | "month" | "custom"
type BookingTypeFilter = "all" | "bus" | "ev" | "parking"

// Helper function to normalize trip data from API response
const normalizeTripData = (booking: any): Trip => {
  // Check if it's a BUS booking
  if (booking.type === "BUS") {
    return {
      id: booking.id,
      type: "BUS",
      bookingCode: booking.bookingCode,
      date: booking.date,
      status: booking.status,
      totalAmount: booking.totalAmount,
      amountPaid: booking.amountPaid,
      currency: booking.currency,
      origin: booking.origin,
      destination: booking.destination,
      bookedAt: booking.bookedAt,
      bus: {
        id: booking.bus?.id,
        busNumber: booking.bus?.busNumber,
        capacity: booking.bus?.capacity,
        status: booking.bus?.status,
        isActive: booking.bus?.isActive,
        currentStop: booking.bus?.currentStop,
        nextDestination: booking.bus?.nextDestination,
        departureTime: booking.bus?.departureTime,
        estimatedArrival: booking.bus?.estimatedArrival,
        delayMinutes: booking.bus?.delayMinutes,
        vehicle: booking.bus?.vehicle,
        driver: booking.bus?.driver,
      },
      payment: booking.payment,
      tickets: booking.tickets,
    }
  }

  // Check if it's an EV booking
  if (booking.type === "EV") {
    return {
      id: booking.id,
      type: "EV",
      bookingCode: booking.reservationCode,
      date: booking.startTime,
      status: booking.status,
      totalAmount: booking.totalAmount,
      amountPaid: booking.totalAmount,
      currency: "ETB",
      origin: booking.chargingPoint?.name || "Charging Station",
      destination: "N/A",
      bookedAt: booking.createdAt,
      startTime: booking.startTime,
      endTime: booking.endTime,
      targetBatteryPercentage: booking.targetBatteryPercentage,
      targetKwh: booking.targetKwh,
      vehicle: booking.vehicle,
      chargingPoint: booking.chargingPoint,
      payments: booking.payments,
    }
  }

  // Check if it's a PARKING booking
  if (booking.type === "PARKING") {
    return {
      id: booking.id,
      type: "PARKING",
      bookingCode: booking.bookingCode || booking.reservationCode,
      date: booking.startTime || booking.date,
      status: booking.status,
      totalAmount: booking.totalAmount,
      amountPaid: booking.amountPaid || booking.totalAmount,
      currency: booking.currency || "ETB",
      origin: booking.parkingLot?.name || "Parking Lot",
      destination: "N/A",
      bookedAt: booking.bookedAt || booking.createdAt,
      startTime: booking.startTime,
      endTime: booking.endTime,
      parkingLot: booking.parkingLot,
      vehicle: booking.vehicle,
    }
  }

  // Return a default structure for unknown types
  return {
    id: booking.id,
    type: booking.type || "UNKNOWN",
    bookingCode: booking.bookingCode || booking.reservationCode,
    date: booking.date || booking.startTime,
    status: booking.status,
    totalAmount: booking.totalAmount,
    amountPaid: booking.amountPaid || booking.totalAmount,
    currency: booking.currency || "ETB",
    origin: booking.origin || "N/A",
    destination: booking.destination || "N/A",
    bookedAt: booking.bookedAt || booking.createdAt,
  }
}

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState<TripCategory>("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRoute, setSelectedRoute] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("date-desc")
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [showFilters, setShowFilters] = useState(false)
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({ from: undefined, to: undefined })
  const [bookingTypeFilter, setBookingTypeFilter] = useState<BookingTypeFilter>("all")

  const {
    data: rawBookings,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["user_bookings"],
    queryFn: getUserBookings,
  })

  // Transform and normalize the bookings data
  const trips = useMemo(() => {
    if (!rawBookings) return []
    return rawBookings.map(normalizeTripData)
  }, [rawBookings])

  // Extract unique routes for filter (for bus trips)
  const uniqueRoutes = useMemo(() => {
    if (!trips) return []
    const routes = new Set(
      trips
        .filter((trip) => trip.type === "BUS")
        .map((trip) => `${trip.origin} → ${trip.destination}`),
    )
    return Array.from(routes)
  }, [trips])

  // Filter trips based on active tab, search, filters, and booking type
  const filterTrips = (trips: Trip[] | undefined, category: TripCategory) => {
    if (!trips) return []

    const now = new Date()

    // First filter by category
    const categoryFiltered = trips.filter((trip) => {
      const tripDate = new Date(trip.date)
      const isCancelled = trip.status === "CANCELLED"

      if (category === "upcoming") {
        return tripDate > now && !isCancelled
      } else {
        return tripDate <= now || isCancelled
      }
    })

    // Then apply booking type filter
    const typeFiltered = categoryFiltered.filter((trip) => {
      if (bookingTypeFilter === "all") return true
      if (bookingTypeFilter === "bus") return trip.type === "BUS"
      if (bookingTypeFilter === "ev") return trip.type === "EV"
      if (bookingTypeFilter === "parking") return trip.type === "PARKING"
      return true
    })

    // Then apply search and other filters
    return typeFiltered.filter((trip) => {
      // Search filter
      const searchMatch =
        searchQuery === "" ||
        trip.origin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.bookingCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trip.type === "BUS" &&
          trip.bus?.busNumber
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (trip.type === "EV" &&
          trip.vehicle?.plateNumber
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (trip.type === "PARKING" &&
          trip.parkingLot?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()))

      // Route filter (only for bus trips)
      let routeMatch = true
      if (trip.type === "BUS" && selectedRoute !== "all") {
        routeMatch = `${trip.origin} → ${trip.destination}` === selectedRoute
      }

      // Date filter
      let dateMatch = true
      const tripDate = new Date(trip.date)

      switch (dateFilter) {
        case "today":
          dateMatch =
            format(tripDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")
          break
        case "week":
          const weekAgo = subDays(now, 7)
          dateMatch = tripDate >= weekAgo && tripDate <= now
          break
        case "month":
          const monthAgo = subDays(now, 30)
          dateMatch = tripDate >= monthAgo && tripDate <= now
          break
        case "custom":
          if (customDateRange.from && customDateRange.to) {
            dateMatch = isWithinInterval(tripDate, {
              start: customDateRange.from,
              end: customDateRange.to,
            })
          }
          break
        default:
          dateMatch = true
      }

      // Price filter
      const amount = parseFloat(trip.totalAmount)
      const priceMatch = amount >= priceRange[0] && amount <= priceRange[1]

      return searchMatch && routeMatch && dateMatch && priceMatch
    })
  }

  // Sort trips
  const sortTrips = (trips: Trip[]) => {
    return [...trips].sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.bookedAt).getTime() - new Date(b.bookedAt).getTime()
        case "date-desc":
          return new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
        case "price-asc":
          return parseFloat(a.totalAmount) - parseFloat(b.totalAmount)
        case "price-desc":
          return parseFloat(b.totalAmount) - parseFloat(a.totalAmount)
        case "duration":
          // For EV trips, calculate duration from start/end time
          if (a.type === "EV" && a.startTime && a.endTime) {
            const durationA =
              new Date(a.endTime).getTime() - new Date(a.startTime).getTime()
            const durationB =
              new Date(b.endTime).getTime() - new Date(b.startTime).getTime()
            return durationA - durationB
          }
          // For Parking trips, calculate duration from start/end time
          if (a.type === "PARKING" && a.startTime && a.endTime) {
            const durationA =
              new Date(a.endTime).getTime() - new Date(a.startTime).getTime()
            const durationB =
              new Date(b.endTime).getTime() - new Date(b.startTime).getTime()
            return durationA - durationB
          }
          return 0
        default:
          return 0
      }
    })
  }

  const filteredUpcomingTrips = sortTrips(filterTrips(trips, "upcoming"))
  const filteredPastTrips = sortTrips(filterTrips(trips, "past"))

  // Count by type for stats
  const upcomingBusCount = filteredUpcomingTrips.filter(
    (t) => t.type === "BUS",
  ).length
  const upcomingEvCount = filteredUpcomingTrips.filter(
    (t) => t.type === "EV",
  ).length
  const upcomingParkingCount = filteredUpcomingTrips.filter(
    (t) => t.type === "PARKING",
  ).length
  const pastBusCount = filteredPastTrips.filter((t) => t.type === "BUS").length
  const pastEvCount = filteredPastTrips.filter((t) => t.type === "EV").length
  const pastParkingCount = filteredPastTrips.filter((t) => t.type === "PARKING").length

  const activeFiltersCount = [
    searchQuery,
    selectedRoute !== "all",
    dateFilter !== "all",
    priceRange[0] > 0 || priceRange[1] < 5000,
    bookingTypeFilter !== "all",
  ].filter(Boolean).length

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedRoute("all")
    setDateFilter("all")
    setPriceRange([0, 5000])
    setCustomDateRange({ from: undefined, to: undefined })
    setBookingTypeFilter("all")
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12 border-red-200 bg-red-50">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-red-100 rounded-full">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-600">
              Error Loading Trips
            </h1>
            <p className="text-gray-600 max-w-md">
              Please try refreshing the page or contact support if the problem
              persists.
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header with Stats */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase font-semibold text-muted-foreground">
              My Travel Dashboard
            </p>
            <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your bus tickets, EV charging sessions, and parking reservations all in one place.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-3">
            <Card className="relative overflow-hidden px-5 py-3 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 rounded-full -mr-10 -mt-10 opacity-30" />
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs font-medium text-orange-600 uppercase tracking-wider">
                    Upcoming
                  </p>
                  <p className="text-3xl font-bold text-orange-700 mt-1">
                    {filteredUpcomingTrips.length}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {upcomingBusCount > 0 && (
                    <Badge variant="outline" className="bg-white/50 text-xs">
                      {upcomingBusCount} Bus
                    </Badge>
                  )}
                  {upcomingEvCount > 0 && (
                    <Badge variant="outline" className="bg-white/50 text-xs">
                      {upcomingEvCount} EV
                    </Badge>
                  )}
                  {upcomingParkingCount > 0 && (
                    <Badge variant="outline" className="bg-white/50 text-xs">
                      {upcomingParkingCount} Parking
                    </Badge>
                  )}
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden px-5 py-3 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gray-300 rounded-full -mr-10 -mt-10 opacity-30" />
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Past
                  </p>
                  <p className="text-3xl font-bold text-gray-700 mt-1">
                    {filteredPastTrips.length}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {pastBusCount > 0 && (
                    <Badge variant="outline" className="bg-white/50 text-xs">
                      {pastBusCount} Bus
                    </Badge>
                  )}
                  {pastEvCount > 0 && (
                    <Badge variant="outline" className="bg-white/50 text-xs">
                      {pastEvCount} EV
                    </Badge>
                  )}
                  {pastParkingCount > 0 && (
                    <Badge variant="outline" className="bg-white/50 text-xs">
                      {pastParkingCount} Parking
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Type Filter Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={bookingTypeFilter === "all" ? "default" : "outline"}
            onClick={() => setBookingTypeFilter("all")}
            className={cn(
              "rounded-full px-4 gap-2",
              bookingTypeFilter === "all" && "bg-gradient-to-r from-orange-500 to-amber-500"
            )}
          >
            <Ticket className="h-4 w-4" />
            All Bookings
            <Badge variant="secondary" className="ml-1 bg-white/20">
              {filteredUpcomingTrips.length + filteredPastTrips.length}
            </Badge>
          </Button>

          <Button
            variant={bookingTypeFilter === "bus" ? "default" : "outline"}
            onClick={() => setBookingTypeFilter("bus")}
            className={cn(
              "rounded-full px-4 gap-2",
              bookingTypeFilter === "bus" && "bg-gradient-to-r from-blue-500 to-cyan-500"
            )}
          >
            <Bus className="h-4 w-4" />
            Bus Tickets
            <Badge variant="secondary" className="ml-1 bg-white/20">
              {upcomingBusCount + pastBusCount}
            </Badge>
          </Button>

          <Button
            variant={bookingTypeFilter === "ev" ? "default" : "outline"}
            onClick={() => setBookingTypeFilter("ev")}
            className={cn(
              "rounded-full px-4 gap-2",
              bookingTypeFilter === "ev" && "bg-gradient-to-r from-purple-500 to-indigo-500"
            )}
          >
            <BatteryCharging className="h-4 w-4" />
            EV Charging
            <Badge variant="secondary" className="ml-1 bg-white/20">
              {upcomingEvCount + pastEvCount}
            </Badge>
          </Button>

          <Button
            variant={bookingTypeFilter === "parking" ? "default" : "outline"}
            onClick={() => setBookingTypeFilter("parking")}
            className={cn(
              "rounded-full px-4 gap-2",
              bookingTypeFilter === "parking" && "bg-gradient-to-r from-green-500 to-emerald-500"
            )}
            disabled
          >
            <ParkingCircle className="h-4 w-4" />
            Parking
            <Badge variant="secondary" className="ml-1 bg-white/20">
              {upcomingParkingCount + pastParkingCount}
            </Badge>
            <Badge variant="outline" className="ml-1 text-xs bg-yellow-100 text-yellow-700 border-yellow-200">
              Soon
            </Badge>
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by route, booking code, bus number, plate number, or parking lot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 bg-white border-gray-200 focus:border-orange-400 focus:ring-orange-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-12 px-4 gap-2 relative",
              showFilters && "border-orange-400 bg-orange-50",
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-orange-600">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 px-4 gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setSortBy("date-desc")}>
                  <SortDesc className="h-4 w-4 mr-2" />
                  Newest first
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("date-asc")}>
                  <SortAsc className="h-4 w-4 mr-2" />
                  Oldest first
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price-desc")}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Price: High to low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price-asc")}>
                  <TrendingUp className="h-4 w-4 mr-2 rotate-180" />
                  Price: Low to high
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("duration")}>
                  <Clock className="h-4 w-4 mr-2" />
                  Duration (EV/Parking only)
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export Button (Optional) */}
          <Button variant="outline" className="h-12 px-4 gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Card className="p-4 bg-gray-50 border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Route Filter (only relevant for bus) */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Route
                    </label>
                    <Select
                      value={selectedRoute}
                      onValueChange={setSelectedRoute}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All routes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All routes</SelectItem>
                        {uniqueRoutes.map((route) => (
                          <SelectItem key={route} value={route}>
                            {route}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Date
                    </label>
                    <Select
                      value={dateFilter}
                      onValueChange={(value: DateFilter) =>
                        setDateFilter(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All dates" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All dates</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">Last 7 days</SelectItem>
                        <SelectItem value="month">Last 30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Price Range (ETB)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={(e) =>
                          setPriceRange([Number(e.target.value), priceRange[1]])
                        }
                        className="h-9"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([priceRange[0], Number(e.target.value)])
                        }
                        className="h-9"
                      />
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear all
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Tags */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setSearchQuery("")}
                />
              </Badge>
            )}
            {bookingTypeFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 capitalize">
                Type: {bookingTypeFilter === "bus" ? "Bus" : bookingTypeFilter === "ev" ? "EV" : "Parking"}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setBookingTypeFilter("all")}
                />
              </Badge>
            )}
            {selectedRoute !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Route: {selectedRoute}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setSelectedRoute("all")}
                />
              </Badge>
            )}
            {dateFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Date: {dateFilter}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setDateFilter("all")}
                />
              </Badge>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 5000) && (
              <Badge variant="secondary" className="gap-1">
                Price: {priceRange[0]} - {priceRange[1]} ETB
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setPriceRange([0, 5000])}
                />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Upcoming/Past Tabs */}
      <Tabs
        defaultValue="upcoming"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TripCategory)}
        className="w-full"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <TabsList className="grid grid-cols-2 w-full sm:w-auto">
            <TabsTrigger value="upcoming" className="relative">
              Upcoming
              {filteredUpcomingTrips.length > 0 && (
                <Badge className="ml-2 bg-orange-100 text-orange-700 border-0">
                  {filteredUpcomingTrips.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">
              Past
              {filteredPastTrips.length > 0 && (
                <Badge className="ml-2 bg-gray-100 text-gray-700 border-0">
                  {filteredPastTrips.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            {activeTab === "upcoming"
              ? filteredUpcomingTrips.length
              : filteredPastTrips.length}{" "}
            booking
            {activeTab === "upcoming"
              ? filteredUpcomingTrips.length !== 1 && "s"
              : filteredPastTrips.length !== 1 && "s"}
          </p>
        </div>

        {/* Upcoming Trips Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          {isLoading || isRefetching ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <TripSkeleton />
                </motion.div>
              ))}
            </motion.div>
          ) : filteredUpcomingTrips.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 gap-4"
            >
              {filteredUpcomingTrips.map((trip, index) => (
                <motion.div
                  key={`${trip.type}-${trip.id}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TripCard trip={trip} category="upcoming" />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <TripsEmptyState
              category="upcoming"
              hasFilters={activeFiltersCount > 0}
              onClearFilters={clearFilters}
            />
          )}
        </TabsContent>

        {/* Past Trips Tab */}
        <TabsContent value="past" className="space-y-4">
          {isLoading || isRefetching ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <TripSkeleton key={i} />
              ))}
            </div>
          ) : filteredPastTrips.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredPastTrips.map((trip) => (
                <TripCard
                  key={`${trip.type}-${trip.id}`}
                  trip={trip}
                  category="past"
                />
              ))}
            </div>
          ) : (
            <TripsEmptyState
              category="past"
              hasFilters={activeFiltersCount > 0}
              onClearFilters={clearFilters}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Floating Action Button for Mobile (Optional) */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg bg-orange-600 hover:bg-orange-700"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}