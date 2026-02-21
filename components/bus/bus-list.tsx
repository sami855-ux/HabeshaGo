import { useThemeContext } from "@/context/ThemeContext"
import { calculatePayment, formatCurrencyIntl } from "@/lib/utils"
import { Ionicons } from "@expo/vector-icons"
import { format, isValid } from "date-fns"
import React, { useMemo, useState } from "react"
import {
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

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

// Helper function for className merging
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export default function BusList({
  buses,
  isLoading,
  onViewDetails,
  onBook,
  searchParams,
}: BusListProps) {
  const { colors } = useThemeContext()
  const [sortBy, setSortBy] = useState("departure")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedBusForModal, setSelectedBusForModal] =
    useState<BusData | null>(null)
  const [selectedScheduleForModal, setSelectedScheduleForModal] =
    useState<BusSchedule | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Sorting logic based on the new data structure
  const sortedBuses = useMemo(() => {
    return [...buses].sort((a, b) => {
      switch (sortBy) {
        case "departure":
          return a.nearestSchedule.startTime.localeCompare(
            b.nearestSchedule.startTime,
          )
        case "price":
          const priceA = parseFloat(a.bus.route.price) || 0
          const priceB = parseFloat(b.bus.route.price) || 0
          return priceA - priceB
        case "duration":
          return a.bus.route.estimatedTimeMin - b.bus.route.estimatedTimeMin
        case "seats":
          return (
            b.nearestSchedule.availableSeats - a.nearestSchedule.availableSeats
          )
        case "delay":
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
        return "bg-green-100 text-green-800"
      case "ON_TRIP":
        return "bg-blue-100 text-blue-800"
      case "UNDER_MAINTENANCE":
        return "bg-yellow-100 text-yellow-800"
      case "OFF_DUTY":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleViewDetailsPress = (busId: number) => {
    const busItem = buses.find((item) => item.bus.id === busId)
    if (busItem) {
      setSelectedBusForModal(busItem.bus)
      setSelectedScheduleForModal(busItem.nearestSchedule)
      setShowDetailsModal(true)
    }
  }

  const handleBookFromModal = () => {
    if (selectedBusForModal && selectedScheduleForModal) {
      setShowDetailsModal(false)
      onBook(selectedBusForModal.id, selectedScheduleForModal.scheduleId)
    }
  }

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isValid(date)) {
        return format(date, "MMM d, yyyy")
      }
      return "N/A"
    } catch (error) {
      return "N/A"
    }
  }

  const renderBusCard = ({
    item,
    index,
  }: {
    item: BusListItem
    index: number
  }) => {
    const { bus, nearestSchedule } = item
    const availableSeats = nearestSchedule.availableSeats
    const seatAvailabilityPercentage = (availableSeats / bus.capacity) * 100
    const isForward = nearestSchedule.direction === "FORWARD"

    return (
      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
        className="rounded-lg mb-4 overflow-hidden border"
      >
        <View className="p-3">
          {/* Header - Bus Info */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-row items-center flex-1">
              <View className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl items-center justify-center mr-3">
                <Ionicons name="bus" size={28} color="#ffffff" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text
                    style={{ color: colors.text }}
                    className="text-lg font-geistBold"
                  >
                    {bus.busNumber}
                  </Text>
                  <View
                    style={{
                      backgroundColor:
                        bus.status === "ACTIVE"
                          ? "#22c55e20"
                          : bus.status === "ON_TRIP"
                            ? "#3b82f620"
                            : bus.status === "UNDER_MAINTENANCE"
                              ? "#eab30820"
                              : "#6b728020",
                    }}
                    className="px-2 py-0.5 rounded-full"
                  >
                    <Text
                      style={{
                        color:
                          bus.status === "ACTIVE"
                            ? "#22c55e"
                            : bus.status === "ON_TRIP"
                              ? "#3b82f6"
                              : bus.status === "UNDER_MAINTENANCE"
                                ? "#eab308"
                                : "#6b7280",
                      }}
                      className="text-xs font-geist"
                    >
                      {bus.status.replace("_", " ")}
                    </Text>
                  </View>
                </View>
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-xs font-geist capitalize"
                >
                  {bus.vehicle.manufacturer} {bus.vehicle.model} •{" "}
                  {bus.vehicle.year}
                </Text>
              </View>
            </View>

            {/* Direction & Delay */}
            <View className="items-end">
              <View
                style={{
                  backgroundColor: isForward ? "#3b82f620" : "#a855f720",
                  borderColor: isForward ? "#3b82f6" : "#a855f7",
                }}
                className="flex-row items-center gap-1 px-2 py-1 rounded-full border mt-3"
              >
                <Ionicons
                  name={isForward ? "arrow-down" : "arrow-up"}
                  size={12}
                  color={isForward ? "#3b82f6" : "#a855f7"}
                />
                <Text
                  style={{ color: isForward ? "#3b82f6" : "#a855f7" }}
                  className="text-xs font-geist"
                >
                  {isForward ? "Forward" : "Reverse"}
                </Text>
              </View>
              {bus.delayMinutes > 0 && (
                <View className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full flex-row items-center gap-1">
                  <Ionicons name="alert-circle" size={12} color="#ef4444" />
                  <Text className="text-xs text-red-600 dark:text-red-400 font-geist">
                    Delayed {bus.delayMinutes} min
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Route Info */}
          <View
            style={{ backgroundColor: colors.background }}
            className="rounded-xl p-3 mb-3"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <View className="w-2 h-2 rounded-full bg-green-500" />
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-xs font-geist"
                  >
                    Route: {bus.route.name}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1 ml-4">
                  <Text
                    style={{ color: colors.text }}
                    className="text-sm font-geist capitalize"
                  >
                    {isForward ? bus.route.origin : bus.route.destination}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={12}
                    color={colors.mutedText}
                  />
                  <Text
                    style={{ color: colors.text }}
                    className="text-sm font-geist"
                  >
                    {isForward ? bus.route.destination : bus.route.origin}
                  </Text>
                </View>
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-xs font-geist ml-4 mt-1"
                >
                  {bus.route.midPoints.slice(0, 3).join(" → ")}
                  {bus.route.midPoints.length > 3 && " ..."}
                </Text>
              </View>
              <View className="items-end">
                <Text
                  style={{ color: colors.primary }}
                  className="text-lg font-groteskBold"
                >
                  {bus.route.currency} {parseFloat(bus.route.price).toFixed(2)}
                </Text>
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-xs font-geist"
                >
                  per seat
                </Text>
              </View>
            </View>
          </View>

          {/* Schedule Grid - Enhanced */}
          <View className="flex-row flex-wrap mb-3 pl-16">
            {/* Departure */}
            <View className="w-1/2 pr-2 mb-3">
              <View className="flex-row items-center gap-1 mb-1.5">
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-[10px] font-geist uppercase tracking-wider"
                >
                  Departure
                </Text>
              </View>
              <View className="flex-row items-baseline gap-1">
                <Text
                  style={{ color: colors.primary }}
                  className="text-base font-groteskBold"
                >
                  {nearestSchedule.startTime}
                </Text>
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-[10px] font-geist"
                >
                  {isForward
                    ? bus.route.origin.split(" ")[0]
                    : bus.route.destination.split(" ")[0]}
                </Text>
              </View>
              <View className="flex-row items-center gap-1 mt-0.5">
                <View className="w-1 h-1 rounded-full bg-green-500" />
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-[10px] font-geist"
                  numberOfLines={1}
                >
                  {isForward ? bus.route.origin : bus.route.destination}
                </Text>
              </View>
            </View>

            {/* Arrival */}
            <View className="w-1/2 pl-2 mb-3">
              <View className="flex-row items-center gap-1 mb-1.5">
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-[10px] font-geist uppercase tracking-wider"
                >
                  Arrival
                </Text>
              </View>
              <View className="flex-row items-baseline gap-1">
                <Text
                  style={{ color: colors.text }}
                  className="text-base font-groteskBold"
                >
                  {nearestSchedule.endTime}
                </Text>
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-[10px] font-geist"
                >
                  {isForward
                    ? bus.route.destination.split(" ")[0]
                    : bus.route.origin.split(" ")[0]}
                </Text>
              </View>
              <View className="flex-row items-center gap-1 mt-0.5">
                <View className="w-1 h-1 rounded-full bg-red-500" />
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-[10px] font-geist"
                  numberOfLines={1}
                >
                  {isForward ? bus.route.destination : bus.route.origin}
                </Text>
              </View>
            </View>

            {/* Duration */}
            <View className="w-1/2 pr-2">
              <View className="flex-row items-center gap-1 mb-1.5">
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-[10px] font-geist uppercase tracking-wider"
                >
                  Duration
                </Text>
              </View>
              <View className="flex-row items-baseline gap-1">
                <Text
                  style={{ color: colors.text }}
                  className="text-base font-groteskBold"
                >
                  {Math.floor(bus.route.estimatedTimeMin / 60)}h{" "}
                  {bus.route.estimatedTimeMin % 60}m
                </Text>
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-[10px] font-geist"
                >
                  total
                </Text>
              </View>
              <View className="flex-row items-center gap-1 mt-0.5">
                <Ionicons
                  name="speedometer-outline"
                  size={10}
                  color={colors.mutedText}
                />
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-[10px] font-geist"
                >
                  {Math.round(bus.route.estimatedTimeMin / 60)} stops
                </Text>
              </View>
            </View>

            {/* Driver */}
            <View className="w-1/2 pl-2">
              <View className="flex-row items-center gap-1 mb-1.5">
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-[10px] font-geist uppercase tracking-wider"
                >
                  Driver
                </Text>
              </View>
              <View className="flex-row items-baseline gap-1">
                <Text
                  style={{ color: colors.text }}
                  className="text-base font-groteskBold"
                >
                  {bus.driver.experience}+
                </Text>
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-[10px] font-geist"
                >
                  years
                </Text>
              </View>
              <View className="flex-row items-center gap-1 mt-0.5">
                <Ionicons name="star" size={10} color={colors.primary} />
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-[10px] font-geist"
                >
                  {bus.driver.rating > 0 ? bus.driver.rating.toFixed(1) : "New"}{" "}
                  • {bus.driver.totalTrips} trips
                </Text>
              </View>
            </View>
          </View>

          {/* Seat Availability & Actions - Enhanced */}
          <View
            className="pt-4"
            style={{ borderTopWidth: 1, borderTopColor: colors.border }}
          >
            {/* Price & Availability Header */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <View className="w-1 h-6 rounded-full bg-gradient-to-b from-orange-500 to-amber-500" />
                <View>
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-xs font-geist uppercase tracking-wider"
                  >
                    Availability
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text
                      style={{ color: colors.primary }}
                      className="text-2xl font-groteskBold"
                    >
                      {availableSeats}
                    </Text>
                    <Text
                      style={{ color: colors.mutedText }}
                      className="text-sm font-geist"
                    >
                      of {bus.capacity} seats
                    </Text>
                  </View>
                </View>
              </View>

              {/* Price Badge */}
              <View className="items-end">
                <View className="bg-orange-50 dark:bg-orange-900/30 px-3 py-1.5 rounded-xl">
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-[10px] font-geist text-center"
                  >
                    Total
                  </Text>
                  <Text
                    style={{ color: colors.primary }}
                    className="text-lg font-groteskBold"
                  >
                    {formatCurrencyIntl(
                      calculatePayment({
                        baseAmount: bus.route.price,
                        passengers: searchParams.passengers,
                      }),
                      "ETB",
                    )}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => handleViewDetailsPress(bus.id)}
                style={{
                  borderColor: colors.primary,
                  backgroundColor: colors.background,
                }}
                className="flex-1 py-3 rounded-xl border items-center flex-row justify-center gap-2"
              >
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={colors.primary}
                />
                <Text
                  style={{ color: colors.primary }}
                  className="text-sm font-geist"
                >
                  Details
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onBook(bus.id, nearestSchedule.scheduleId)}
                disabled={
                  availableSeats < searchParams.passengers ||
                  bus.status === "UNDER_MAINTENANCE"
                }
                style={{
                  backgroundColor:
                    availableSeats < searchParams.passengers ||
                    bus.status === "UNDER_MAINTENANCE"
                      ? colors.mutedText + "40"
                      : colors.primary,
                }}
                className="flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2"
              >
                <Ionicons
                  name={
                    availableSeats < searchParams.passengers
                      ? "close-circle-outline"
                      : bus.status === "UNDER_MAINTENANCE"
                        ? "construct-outline"
                        : "ticket-outline"
                  }
                  size={16}
                  color="#ffffff"
                />
                <Text className="text-white text-sm font-geist">
                  {availableSeats < searchParams.passengers
                    ? "Sold Out"
                    : bus.status === "UNDER_MAINTENANCE"
                      ? "Unavailable"
                      : "Book Now"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    )
  }

  const renderDetailsModal = () => {
    if (!selectedBusForModal || !selectedScheduleForModal) return null

    const bus = selectedBusForModal
    const schedule = selectedScheduleForModal
    const isForward = schedule.direction === "FORWARD"
    const availableSeats = schedule.availableSeats

    return (
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <SafeAreaView className="flex-1 bg-black/50">
          <View className="flex-1 justify-end">
            <View
              style={{ backgroundColor: colors.card }}
              className="rounded-t-3xl h-[90%]"
            >
              {/* Header */}
              <View
                style={{ borderBottomColor: colors.border }}
                className="py-4 px-2 border-b flex-row justify-between items-center"
              >
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity
                    onPress={() => setShowDetailsModal(false)}
                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 justify-center items-center"
                  >
                    <Ionicons name="close" size={22} color={colors.icon} />
                  </TouchableOpacity>
                  <Text
                    style={{ color: colors.text }}
                    className="text-xl font-geistBold"
                  >
                    Bus Details
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: isForward ? "#3b82f620" : "#a855f720",
                    borderColor: isForward ? "#3b82f6" : "#a855f7",
                  }}
                  className="px-3 py-1 rounded-full border"
                >
                  <Text
                    style={{ color: isForward ? "#3b82f6" : "#a855f7" }}
                    className="text-xs font-geistMedium"
                  >
                    {isForward ? "Forward Trip" : "Return Trip"}
                  </Text>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="p-4">
                {/* Bus Info Card */}
                <View
                  style={{ backgroundColor: colors.background }}
                  className="rounded-2xl p-4 mb-4"
                >
                  <View className="flex-row items-center gap-4 mb-4">
                    <View className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl items-center justify-center">
                      <Ionicons name="bus" size={32} color="#ffffff" />
                    </View>
                    <View className="flex-1">
                      <Text
                        style={{ color: colors.text }}
                        className="text-xl font-geistBold"
                      >
                        {bus.busNumber}
                      </Text>
                      <Text
                        style={{ color: colors.mutedText }}
                        className="text-sm font-geist"
                      >
                        {bus.vehicle.manufacturer} {bus.vehicle.model} •{" "}
                        {bus.vehicle.year}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between">
                    <View>
                      <Text
                        style={{ color: colors.mutedText }}
                        className="text-xs font-geist mb-1"
                      >
                        Capacity
                      </Text>
                      <Text
                        style={{ color: colors.text }}
                        className="font-geistBold"
                      >
                        {bus.capacity} seats
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={{ color: colors.mutedText }}
                        className="text-xs font-geist mb-1"
                      >
                        Status
                      </Text>
                      <View
                        style={{
                          backgroundColor:
                            bus.status === "ACTIVE"
                              ? "#22c55e20"
                              : bus.status === "ON_TRIP"
                                ? "#3b82f620"
                                : bus.status === "UNDER_MAINTENANCE"
                                  ? "#eab30820"
                                  : "#6b728020",
                        }}
                        className="px-3 py-1 rounded-full"
                      >
                        <Text
                          style={{
                            color:
                              bus.status === "ACTIVE"
                                ? "#22c55e"
                                : bus.status === "ON_TRIP"
                                  ? "#3b82f6"
                                  : bus.status === "UNDER_MAINTENANCE"
                                    ? "#eab308"
                                    : "#6b7280",
                          }}
                          className="text-xs font-geistMedium"
                        >
                          {bus.status.replace("_", " ")}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Route Details */}
                <View
                  style={{ backgroundColor: colors.background }}
                  className="rounded-2xl p-4 mb-4"
                >
                  <Text
                    style={{ color: colors.text }}
                    className="text-lg font-geistBold mb-3"
                  >
                    Route Information
                  </Text>

                  <View className="mb-4">
                    <View className="flex-row items-center mb-3">
                      <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                        <View className="w-3 h-3 rounded-full bg-green-500" />
                      </View>
                      <View className="flex-1">
                        <Text
                          style={{ color: colors.mutedText }}
                          className="text-xs font-geist"
                        >
                          Departure
                        </Text>
                        <Text
                          style={{ color: colors.text }}
                          className="font-geistBold"
                        >
                          {isForward ? bus.route.origin : bus.route.destination}
                        </Text>
                        <Text
                          style={{ color: colors.mutedText }}
                          className="text-xs font-geist mt-1"
                        >
                          {schedule.startTime}
                        </Text>
                      </View>
                    </View>

                    <View className="ml-4 pl-7 mb-3">
                      {bus.route.midPoints.map((point, index) => (
                        <View
                          key={index}
                          className="flex-row items-center mb-2"
                        >
                          <View className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-3" />
                          <Text
                            style={{ color: colors.mutedText }}
                            className="text-sm font-geist"
                          >
                            {point}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View className="flex-row items-center">
                      <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-3">
                        <View className="w-3 h-3 rounded-full bg-red-500" />
                      </View>
                      <View className="flex-1">
                        <Text
                          style={{ color: colors.mutedText }}
                          className="text-xs font-geist"
                        >
                          Destination
                        </Text>
                        <Text
                          style={{ color: colors.text }}
                          className="font-geistBold"
                        >
                          {isForward ? bus.route.destination : bus.route.origin}
                        </Text>
                        <Text
                          style={{ color: colors.mutedText }}
                          className="text-xs font-geist mt-1"
                        >
                          {schedule.endTime}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    className="flex-row justify-between pt-3 border-t"
                    style={{ borderColor: colors.border }}
                  >
                    <View>
                      <Text
                        style={{ color: colors.mutedText }}
                        className="text-xs font-geist"
                      >
                        Duration
                      </Text>
                      <Text
                        style={{ color: colors.text }}
                        className="font-geistBold"
                      >
                        {bus.route.estimatedTimeMin} minutes
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={{ color: colors.mutedText }}
                        className="text-xs font-geist"
                      >
                        Price per seat
                      </Text>
                      <Text
                        style={{ color: colors.primary }}
                        className="font-groteskBold"
                      >
                        {bus.route.currency}{" "}
                        {parseFloat(bus.route.price).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Driver Info */}
                <View
                  style={{ backgroundColor: colors.background }}
                  className="rounded-2xl p-4 mb-4"
                >
                  <Text
                    style={{ color: colors.text }}
                    className="text-lg font-geistBold mb-3"
                  >
                    Driver Information
                  </Text>

                  <View className="flex-row items-center mb-3">
                    <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-3">
                      <Ionicons name="person" size={24} color="#3b82f6" />
                    </View>
                    <View className="flex-1">
                      <Text
                        style={{ color: colors.text }}
                        className="font-geistBold"
                      >
                        License: {bus.driver.licenseNo}
                      </Text>
                      <Text
                        style={{ color: colors.mutedText }}
                        className="text-sm font-geist"
                      >
                        Experience: {bus.driver.experience} years
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between">
                    <View className="items-center flex-1">
                      <Text
                        style={{ color: colors.primary }}
                        className="text-xl font-groteskBold"
                      >
                        {bus.driver.rating > 0
                          ? bus.driver.rating.toFixed(1)
                          : "N/A"}
                      </Text>
                      <Text
                        style={{ color: colors.mutedText }}
                        className="text-xs font-geist"
                      >
                        Rating
                      </Text>
                    </View>
                    <View className="items-center flex-1">
                      <Text
                        style={{ color: colors.primary }}
                        className="text-xl font-groteskBold"
                      >
                        {bus.driver.totalTrips}
                      </Text>
                      <Text
                        style={{ color: colors.mutedText }}
                        className="text-xs font-geist"
                      >
                        Total Trips
                      </Text>
                    </View>
                    <View className="items-center flex-1">
                      <Text
                        style={{ color: colors.primary }}
                        className="text-xl font-groteskBold"
                      >
                        {bus.driver.experience}+
                      </Text>
                      <Text
                        style={{ color: colors.mutedText }}
                        className="text-xs font-geist"
                      >
                        Years Exp
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Vehicle Info */}
                <View
                  style={{ backgroundColor: colors.background }}
                  className="rounded-2xl p-4 mb-4"
                >
                  <Text
                    style={{ color: colors.text }}
                    className="text-lg font-geistBold mb-3"
                  >
                    Vehicle Information
                  </Text>

                  <View className="space-y-2">
                    <View className="flex-row justify-between">
                      <Text
                        style={{ color: colors.mutedText }}
                        className="font-geist"
                      >
                        Plate Number
                      </Text>
                      <Text
                        style={{ color: colors.text }}
                        className="font-geistMedium"
                      >
                        {bus.vehicle.plateNumber}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text
                        style={{ color: colors.mutedText }}
                        className="font-geist"
                      >
                        Type
                      </Text>
                      <Text
                        style={{ color: colors.text }}
                        className="font-geistMedium"
                      >
                        {bus.vehicle.type}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text
                        style={{ color: colors.mutedText }}
                        className="font-geist"
                      >
                        Mileage
                      </Text>
                      <Text
                        style={{ color: colors.text }}
                        className="font-geistMedium"
                      >
                        {bus.vehicle.mileage.toLocaleString()} km
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text
                        style={{ color: colors.mutedText }}
                        className="font-geist"
                      >
                        Last Service
                      </Text>
                      <Text
                        style={{ color: colors.text }}
                        className="font-geistMedium"
                      >
                        {formatDate(bus.lastServiceDate)}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Footer with Booking */}
              <View
                style={{ borderTopColor: colors.border }}
                className="p-4 border-t"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View>
                    <Text
                      style={{ color: colors.mutedText }}
                      className="text-sm font-geist"
                    >
                      Total for {searchParams.passengers} passenger
                      {searchParams.passengers > 1 ? "s" : ""}
                    </Text>
                    <Text
                      style={{ color: colors.primary }}
                      className="text-2xl font-groteskBold"
                    >
                      {formatCurrencyIntl(
                        calculatePayment({
                          baseAmount: bus.route.price,
                          passengers: searchParams.passengers,
                        }),
                        "ETB",
                      )}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text
                      style={{ color: colors.mutedText }}
                      className="text-sm font-geist"
                    >
                      Available Seats
                    </Text>
                    <Text
                      style={{ color: colors.text }}
                      className="text-xl font-groteskBold"
                    >
                      {availableSeats}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleBookFromModal}
                  disabled={
                    availableSeats < searchParams.passengers ||
                    bus.status === "UNDER_MAINTENANCE"
                  }
                  style={{
                    backgroundColor:
                      availableSeats < searchParams.passengers ||
                      bus.status === "UNDER_MAINTENANCE"
                        ? colors.mutedText + "40"
                        : colors.primary,
                  }}
                  className="w-full py-4 rounded-xl items-center"
                >
                  <Text className="text-white font-geistBold text-lg">
                    {availableSeats < searchParams.passengers
                      ? "Not Enough Seats"
                      : bus.status === "UNDER_MAINTENANCE"
                        ? "Bus Unavailable"
                        : "Confirm Booking"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    )
  }

  const renderFilterModal = () => {
    return (
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <SafeAreaView className="flex-1 bg-black/50">
          <View className="flex-1 justify-end">
            <View
              style={{ backgroundColor: colors.card }}
              className="rounded-t-3xl"
            >
              {/* Header */}
              <View
                style={{ borderBottomColor: colors.border }}
                className="p-4 border-b flex-row justify-between items-center"
              >
                <Text
                  style={{ color: colors.text }}
                  className="text-xl font-groteskBold"
                >
                  Sort & Filter
                </Text>
                <TouchableOpacity
                  onPress={() => setShowFilters(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 justify-center items-center"
                >
                  <Ionicons name="close" size={22} color={colors.icon} />
                </TouchableOpacity>
              </View>

              <ScrollView className="p-4">
                {/* Sort Options */}
                <View className="mb-6">
                  <Text
                    style={{ color: colors.text }}
                    className="text-base font-geist mb-3"
                  >
                    Sort by
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {[
                      { value: "departure", label: "Departure Time" },
                      { value: "price", label: "Price (Low to High)" },
                      { value: "duration", label: "Duration" },
                      { value: "seats", label: "Available Seats" },
                      { value: "delay", label: "Least Delay" },
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setSortBy(option.value)}
                        style={{
                          backgroundColor:
                            sortBy === option.value
                              ? colors.primary
                              : colors.background,
                          borderColor: colors.border,
                        }}
                        className="px-4 py-2 rounded-full border"
                      >
                        <Text
                          style={{
                            color:
                              sortBy === option.value ? "#ffffff" : colors.text,
                          }}
                          className="text-sm font-geist"
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Filter Options */}
                <View className="mb-6">
                  <Text
                    style={{ color: colors.text }}
                    className="text-base font-geist mb-3"
                  >
                    Filter by
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {[
                      { value: "all", label: "All Buses" },
                      { value: "available", label: "Has Available Seats" },
                      { value: "active", label: "Active/On Trip" },
                      { value: "no-delay", label: "No Delay" },
                      { value: "premium", label: "Premium Buses" },
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setFilterStatus(option.value)}
                        style={{
                          backgroundColor:
                            filterStatus === option.value
                              ? colors.primary
                              : colors.background,
                          borderColor: colors.border,
                        }}
                        className="px-4 py-2 rounded-full border"
                      >
                        <Text
                          style={{
                            color:
                              filterStatus === option.value
                                ? "#ffffff"
                                : colors.text,
                          }}
                          className="text-sm font-geist"
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Apply Button */}
                <TouchableOpacity
                  onPress={() => setShowFilters(false)}
                  style={{ backgroundColor: colors.primary }}
                  className="w-full py-4 rounded-xl items-center mb-4"
                >
                  <Text className="text-white font-geist text-lg">
                    Apply Filters
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    )
  }

  if (isLoading) {
    return (
      <View className="px-4 mb-10">
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={{ backgroundColor: colors.card }}
            className="p-4 rounded-2xl mb-4"
          >
            <View className="flex-row items-center gap-4 mb-4">
              <View className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700" />
              <View className="flex-1">
                <View className="w-48 h-5 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                <View className="w-32 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
              </View>
            </View>
            <View className="flex-row gap-4">
              {[1, 2, 3, 4].map((j) => (
                <View
                  key={j}
                  className="flex-1 h-4 bg-gray-300 dark:bg-gray-700 rounded"
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    )
  }

  if (buses.length === 0) {
    return (
      <View className="px-4 mb-10">
        <View
          style={{ backgroundColor: colors.card }}
          className="p-8 rounded-2xl items-center"
        >
          <View className="w-20 h-20 bg-orange-50 dark:bg-orange-900/30 rounded-full items-center justify-center mb-4">
            <Ionicons name="bus-outline" size={40} color={colors.primary} />
          </View>
          <Text
            style={{ color: colors.text }}
            className="text-xl font-geistBold mb-2"
          >
            No buses available
          </Text>
          <Text
            style={{ color: colors.mutedText }}
            className="text-center font-geist mb-4"
          >
            We couldn't find any buses matching your search criteria.
          </Text>
          <View
            style={{ backgroundColor: colors.background }}
            className="rounded-xl p-4 w-full"
          >
            <Text
              style={{ color: colors.text }}
              className="text-sm font-geistMedium mb-2"
            >
              Your search:
            </Text>
            <View className="space-y-1">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={colors.mutedText}
                />
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-sm font-geist"
                >
                  {searchParams.from} → {searchParams.to}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={colors.mutedText}
                />
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-sm font-geist"
                >
                  {format(searchParams.date, "PPP")} at {searchParams.time}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="people-outline"
                  size={14}
                  color={colors.mutedText}
                />
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-sm font-geist"
                >
                  {searchParams.passengers} passenger
                  {searchParams.passengers > 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className=" mb-10">
      {/* Results Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <View className="flex-row items-center gap-2 mb-1">
            <Text
              style={{ color: colors.text }}
              className="text-xl font-groteskBold"
            >
              Available Buses ({filteredBuses.length})
            </Text>
            <View className="bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
              <Text
                style={{ color: colors.primary }}
                className="text-xs font-geist"
              >
                {buses.reduce(
                  (acc, item) => acc + item.nearestSchedule.availableSeats,
                  0,
                )}{" "}
                seats
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.primary}
            />
            <Text
              style={{ color: colors.mutedText }}
              className="text-xs font-geist"
            >
              {searchParams.from} → {searchParams.to}
            </Text>
            <View className="w-1 h-1 rounded-full bg-gray-400" />
            <Ionicons name="time-outline" size={14} color={colors.primary} />
            <Text
              style={{ color: colors.mutedText }}
              className="text-xs font-geist"
            >
              {searchParams.time}
            </Text>
            <View className="w-1 h-1 rounded-full bg-gray-400" />
            <Ionicons name="people-outline" size={14} color={colors.primary} />
            <Text
              style={{ color: colors.mutedText }}
              className="text-xs font-geist"
            >
              {searchParams.passengers}
            </Text>
          </View>
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={{ backgroundColor: colors.background }}
          className="w-10 h-10 rounded-full items-center justify-center"
        >
          <Ionicons name="options-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Buses List */}
      <FlatList
        data={filteredBuses}
        keyExtractor={(item) => item.bus.id.toString()}
        renderItem={renderBusCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Filter Modal */}
      {renderFilterModal()}

      {/* Details Modal */}
      {renderDetailsModal()}
    </View>
  )
}
