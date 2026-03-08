import { useThemeContext } from "@/context/ThemeContext"
import { useRouter } from "expo-router"
import {
  ArrowUpDown,
  Bus,
  CheckCircle,
  ChevronRight,
  Clock,
  Filter,
  MapPin,
  Star,
  Users,
  X,
} from "lucide-react-native"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

interface BusType {
  id: string
  operator: string
  busNumber: string
  type: string
  departure: string
  arrival: string
  duration: string
  totalSeats: number
  availableSeats: number
  rating: number
  reviews: number
  features: string[]
  routePoints: string[]
  busCondition: "excellent" | "good" | "average"
  routeName: string
}

export function BusList({ fromValue, toValue, data, isFetching }) {
  const router = useRouter()
  const { colors } = useThemeContext()
  const [buses, setBuses] = useState<BusType[]>([])
  const [sortBy, setSortBy] = useState("departure")
  const [expandedBus, setExpandedBus] = useState<string | null>(null)
  const [filterModalVisible, setFilterModalVisible] = useState(false)

  // Generate dummy data based on fromValue and toValue
  const generateDummyData = (from: string, to: string): BusType[] => {
    if (!from || !to) return []

    const operators = [
      "Express Travels",
      "City Connect",
      "Premium Coach",
      "Metro Express",
      "Royal Transit",
      "Blue Star",
      "Swift Move",
      "Comfort Rides",
    ]

    const busTypes = [
      "AC Sleeper (2+1)",
      "Non-AC Seater (2+2)",
      "AC Seater (2+2)",
      "AC Deluxe (2+2)",
      "Semi-Sleeper (2+1)",
      "Volvo AC (2+2)",
    ]

    const featuresList = [
      "Live Tracking",
      "On-time",
      "Clean",
      "WiFi",
      "Charging Ports",
      "Blanket",
      "Water Bottle",
      "Snacks",
      "TV",
      "Toilet",
    ]

    const conditions: ("excellent" | "good" | "average")[] = [
      "excellent",
      "good",
      "average",
    ]

    const routeNames = [
      `${from} - ${to} Express`,
      `${from} to ${to} Direct`,
      `${from}-${to} Premium`,
      `${from} ${to} Superfast`,
    ]

    // Generate Ethiopian city names for route points
    const ethiopianCities = [
      "Addis Ababa",
      "Dire Dawa",
      "Bahir Dar",
      "Gondar",
      "Mekele",
      "Hawassa",
      "Jimma",
      "Bishoftu",
      "Adama",
      "Debre Zeit",
      "Arba Minch",
      "Harar",
      "Jijiga",
      "Asella",
      "Dessie",
    ]

    // Generate route points based on fromValue and toValue
    const generateRoutePoints = (from: string, to: string): string[] => {
      // Remove from and to from available cities
      const availableCities = ethiopianCities.filter(
        (city) =>
          city.toLowerCase() !== from.toLowerCase() &&
          city.toLowerCase() !== to.toLowerCase()
      )

      // Randomly select 2-3 intermediate cities
      const intermediateCount = Math.floor(Math.random() * 2) + 2
      const intermediateCities = [...availableCities]
        .sort(() => Math.random() - 0.5)
        .slice(0, intermediateCount)

      // Sort intermediate cities to make route logical
      intermediateCities.sort()

      return [from, ...intermediateCities, to]
    }

    const dummyBuses: BusType[] = []

    for (let i = 1; i <= 3; i++) {
      const departureHour = 6 + i * 2 // Starting from 6 AM
      const durationHours = Math.floor(Math.random() * 4) + 3 // 3-6 hours
      const arrivalHour = departureHour + durationHours

      const routePoints = generateRoutePoints(from, to)
      const availableSeats = Math.floor(Math.random() * 40) + 1
      const totalSeats = Math.max(
        availableSeats + Math.floor(Math.random() * 20),
        40
      )
      const rating = 3.5 + Math.random() * 1.5 // 3.5 to 5.0
      const reviews = Math.floor(Math.random() * 400) + 100
      const features = featuresList
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 6) + 1)

      dummyBuses.push({
        id: i.toString(),
        operator: operators[Math.floor(Math.random() * operators.length)],
        busNumber: `ET-${Math.floor(Math.random() * 9000) + 1000}`,
        type: busTypes[Math.floor(Math.random() * busTypes.length)],
        departure: `${departureHour}:${Math.random() > 0.5 ? "30" : "00"}`,
        arrival: `${arrivalHour}:${Math.random() > 0.5 ? "45" : "15"}`,
        duration: `${durationHours}h ${Math.random() > 0.5 ? "30" : "00"}m`,
        totalSeats,
        availableSeats,
        rating: parseFloat(rating.toFixed(1)),
        reviews,
        features,
        routePoints,
        busCondition: conditions[Math.floor(Math.random() * conditions.length)],
        routeName: routeNames[Math.floor(Math.random() * routeNames.length)],
      })
    }

    return dummyBuses
  }

  // Update buses when data changes (from API) or when from/to values change
  useEffect(() => {
    if (data && data.length > 0) {
      // If data comes from API, use it
      setBuses(data)
    } else if (fromValue && toValue && !isFetching) {
      // If no API data but we have from/to values, generate dummy data
      const dummyData = generateDummyData(fromValue, toValue)
      setBuses(dummyData)
    } else if (!fromValue || !toValue) {
      // Clear buses if no from/to values
      setBuses([])
    }
  }, [data, fromValue, toValue, isFetching])

  const sortedBuses = [...buses].sort((a, b) => {
    switch (sortBy) {
      case "departure":
        return a.departure.localeCompare(b.departure)
      case "duration":
        // Extract hours and minutes from duration string
        const parseDuration = (duration: string) => {
          const [hours, minutes] = duration
            .split("h")
            .map((part) => parseInt(part.replace("m", "").trim()))
          return (hours || 0) * 60 + (minutes || 0)
        }
        return parseDuration(a.duration) - parseDuration(b.duration)
      case "rating":
        return b.rating - a.rating
      case "seats":
        return b.availableSeats - a.availableSeats
      default:
        return 0
    }
  })

  const getBusConditionColor = (condition: BusType["busCondition"]) => {
    switch (condition) {
      case "excellent":
        return "bg-green-100 border-green-200"
      case "good":
        return "bg-blue-100 border-blue-200"
      case "average":
        return "bg-yellow-100 border-yellow-200"
    }
  }

  const getBusConditionTextColor = (condition: BusType["busCondition"]) => {
    switch (condition) {
      case "excellent":
        return "text-green-600"
      case "good":
        return "text-blue-600"
      case "average":
        return "text-yellow-600"
    }
  }

  const getBusConditionText = (condition: BusType["busCondition"]) => {
    switch (condition) {
      case "excellent":
        return "Excellent Condition"
      case "good":
        return "Good Condition"
      case "average":
        return "Average Condition"
    }
  }

  const totalAvailableSeats = buses.reduce(
    (acc, bus) => acc + bus.availableSeats,
    0
  )

  // Show loading state when isFetching is true
  if (isFetching) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          className="mt-4 text-lg font-geist"
          style={{ color: colors.text }}
        >
          Searching buses from {fromValue} to {toValue}...
        </Text>
      </View>
    )
  }

  // Show initial state if no from/to values
  if (!fromValue || !toValue) {
    return (
      <View className="items-center justify-center py-12 px-6">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: `${colors.mutedText}15` }}
        >
          <MapPin size={32} style={{ color: colors.mutedText }} />
        </View>
        <Text
          className="text-xl font-semibold text-center mb-2 font-geist"
          style={{ color: colors.text }}
        >
          Search for Buses
        </Text>
        <Text className="text-center" style={{ color: colors.mutedText }}>
          Enter departure and destination to find available buses
        </Text>
      </View>
    )
  }

  // Show results or empty state
  return (
    <View
      className="space-y-6 mt-2 rounded-2xl"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header with Stats - Only show if we have buses */}
      {sortedBuses.length > 0 && (
        <View
          className="rounded-3xl p-6 px-3"
          style={{ backgroundColor: colors.background }}
        >
          <View className="flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <View>
              <Text
                className="text-xl font-geist"
                style={{ color: colors.text }}
              >
                {fromValue} → {toValue}
              </Text>
              <Text
                className="mt-1 font-geist"
                style={{ color: colors.mutedText }}
              >
                {sortedBuses.length} buses found • {totalAvailableSeats} seats
                available
              </Text>
            </View>

            <View className="flex-row items-center gap-4">
              {/* Sorting */}
              <View className="flex-row items-center gap-2">
                <ArrowUpDown size={16} style={{ color: colors.mutedText }} />
                <Text
                  className="text-sm font-medium font-geist"
                  style={{ color: colors.text }}
                >
                  Sort by:
                </Text>
                <TouchableOpacity
                  className="px-3 py-2 rounded-lg border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  }}
                  onPress={() => {
                    const sortOptions = [
                      "departure",
                      "duration",
                      "rating",
                      "seats",
                    ]
                    const currentIndex = sortOptions.indexOf(sortBy)
                    const nextIndex = (currentIndex + 1) % sortOptions.length
                    setSortBy(sortOptions[nextIndex])
                  }}
                >
                  <Text style={{ color: colors.text }} className="font-geist">
                    {sortBy === "departure"
                      ? "Departure Time"
                      : sortBy === "duration"
                        ? "Travel Duration"
                        : sortBy === "rating"
                          ? "Customer Rating"
                          : "Available Seats"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Filter Button */}
              <TouchableOpacity
                className="flex-row items-center gap-2 px-4 py-2 rounded-lg border"
                style={{ borderColor: colors.border }}
                onPress={() => setFilterModalVisible(true)}
              >
                <Filter size={16} style={{ color: colors.text }} />
                <Text
                  className="font-medium font-geist"
                  style={{ color: colors.text }}
                >
                  Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Bus Cards */}
      <View className="gap-4">
        {sortedBuses.map((bus) => {
          const conditionColor = getBusConditionColor(bus.busCondition)
          const conditionTextColor = getBusConditionTextColor(bus.busCondition)

          return (
            <View
              key={bus.id}
              className={`rounded-2xl overflow-hidden ${expandedBus === bus.id ? "ring-2 ring-primary/20" : ""}`}
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.background,
              }}
            >
              <View className="p-6 px-3">
                <View className="space-y-6">
                  {/* Main Bus Info */}
                  <View className="flex-col lg:flex-row gap-6">
                    {/* Left Column - Bus Details */}
                    <View className="flex-1">
                      <View className="flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <View className="space-y-2">
                          <View className="flex-row items-center gap-3">
                            <View
                              className="w-12 h-12 rounded-xl items-center justify-center"
                              style={{ backgroundColor: `${colors.primary}15` }}
                            >
                              <Bus size={24} color={colors.primary} />
                            </View>
                            <View className="flex-row gap-4">
                              <Text
                                className="text-xl font-geist"
                                style={{ color: colors.text }}
                              >
                                {bus.operator}
                              </Text>
                              <View className="flex-row items-center gap-2 ">
                                <View
                                  className="px-2 py-1 rounded-full"
                                  style={{
                                    backgroundColor: `${colors.mutedText}15`,
                                  }}
                                >
                                  <Text
                                    className="font-normal text-sm font-geist"
                                    style={{ color: colors.text }}
                                  >
                                    {bus.busNumber}
                                  </Text>
                                </View>
                                <View
                                  className={`px-2 py-1 rounded-full border ${conditionColor}`}
                                >
                                  <Text
                                    className={`text-xs font-medium font-geist ${conditionTextColor}`}
                                  >
                                    {getBusConditionText(bus.busCondition)}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>

                          {/* Bus Type and Route Name */}
                          <View className="flex-row items-center gap-4">
                            <Text
                              className="font-medium font-geist"
                              style={{ color: colors.primary }}
                            >
                              {bus.type}
                            </Text>
                            <Text
                              className="text-sm font-geist"
                              style={{ color: colors.mutedText }}
                            >
                              {bus.routeName}
                            </Text>
                          </View>

                          {/* Rating */}
                          <View className="flex-row items-center gap-2 mt-2">
                            <View className="flex-row">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  fill={
                                    i < Math.floor(bus.rating)
                                      ? "#FBBF24"
                                      : colors.border
                                  }
                                  color={
                                    i < Math.floor(bus.rating)
                                      ? "#FBBF24"
                                      : colors.border
                                  }
                                />
                              ))}
                            </View>
                            <Text
                              className="font-semibold font-groteskBold"
                              style={{ color: colors.text }}
                            >
                              {bus.rating}
                            </Text>
                            <Text
                              className="text-sm font-groteskBold"
                              style={{ color: colors.mutedText }}
                            >
                              ({bus.reviews} reviews)
                            </Text>
                          </View>
                        </View>

                        {/* Quick Features */}
                        <View className="flex-row flex-wrap gap-2">
                          {bus.features.slice(0, 3).map((feature, index) => (
                            <View
                              key={index}
                              className="flex-row items-center gap-1 px-2 py-1 rounded-full border"
                              style={{
                                borderColor: colors.border,
                                backgroundColor: `${colors.mutedText}15`,
                              }}
                            >
                              <CheckCircle
                                size={12}
                                style={{ color: colors.text }}
                              />
                              <Text
                                className="text-xs font-geist"
                                style={{ color: colors.text }}
                              >
                                {feature}
                              </Text>
                            </View>
                          ))}
                          {bus.features.length > 3 && (
                            <View
                              className="px-2 py-1 rounded-full border"
                              style={{
                                borderColor: colors.border,
                                backgroundColor: `${colors.mutedText}15`,
                              }}
                            >
                              <Text
                                className="text-xs"
                                style={{ color: colors.text }}
                              >
                                +{bus.features.length - 3} more
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Schedule Bar */}
                      <View
                        className="mt-6 rounded-xl p-4"
                        style={{ backgroundColor: `${colors.mutedText}15` }}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="items-center">
                            <Text
                              className="text-2xl font-groteskBold"
                              style={{ color: colors.text }}
                            >
                              {bus.departure}
                            </Text>
                            <Text
                              className="text-sm mt-1 font-geist"
                              style={{ color: colors.mutedText }}
                            >
                              {bus.routePoints[0]} {/* fromValue */}
                            </Text>
                          </View>

                          <View className="flex-1 px-6">
                            <View className="relative">
                              <View
                                className="h-1 rounded-full"
                                style={{ backgroundColor: colors.border }}
                              ></View>
                              <View className="absolute inset-0 flex-row items-center justify-between px-2">
                                {bus.routePoints.map((point, index) => (
                                  <View key={index} className="items-center">
                                    <View
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: colors.border }}
                                    ></View>
                                    <Text
                                      className="text-xs mt-2 max-w-[80px] text-center truncate"
                                      style={{ color: colors.mutedText }}
                                    >
                                      {point}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                            <View className="flex-row items-center justify-center gap-2 mt-4">
                              <Clock
                                size={16}
                                style={{ color: colors.mutedText }}
                              />
                              <Text
                                className="text-sm font-medium font-groteskBold"
                                style={{ color: colors.text }}
                              >
                                {bus.duration}
                              </Text>
                            </View>
                          </View>

                          <View className="items-center">
                            <Text
                              className="text-2xl font-groteskBold"
                              style={{ color: colors.text }}
                            >
                              {bus.arrival}
                            </Text>
                            <Text
                              className="text-sm mt-1 font-geist"
                              style={{ color: colors.mutedText }}
                            >
                              {bus.routePoints[bus.routePoints.length - 1]}{" "}
                              {/* toValue */}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Right Column - Actions */}
                    <View className="lg:w-80 lg:border-l lg:pl-6">
                      <View className="space-y-4">
                        {/* Seat Availability */}
                        <View
                          className="rounded-xl p-4 mb-2"
                          style={{ backgroundColor: `${colors.mutedText}15` }}
                        >
                          <View className="flex-row items-center justify-between mb-2">
                            <Text
                              className="font-medium font-geist"
                              style={{ color: colors.text }}
                            >
                              Seat Availability
                            </Text>
                            <View
                              className={`px-2 py-1 rounded-full ${bus.availableSeats < 10 ? "bg-red-500/20" : "bg-green-500/20"}`}
                            >
                              <Text
                                className={`text-xs font-geist font-medium ${bus.availableSeats < 10 ? "text-red-600" : "text-green-600"}`}
                              >
                                {bus.availableSeats < 10
                                  ? "Filling Fast"
                                  : "Available"}
                              </Text>
                            </View>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <Users
                              size={16}
                              style={{ color: colors.mutedText }}
                            />
                            <Text
                              className="font-semibold font-grotesk"
                              style={{ color: colors.text }}
                            >
                              {bus.availableSeats} seats available
                            </Text>
                            <Text
                              className="text-sm font-grotesk"
                              style={{ color: colors.mutedText }}
                            >
                              out of {bus.totalSeats}
                            </Text>
                          </View>
                          <View className="mt-2">
                            <View
                              className="h-2 rounded-full overflow-hidden"
                              style={{ backgroundColor: colors.border }}
                            >
                              <View
                                className={`h-full rounded-full ${bus.availableSeats > bus.totalSeats * 0.5 ? "bg-green-500" : bus.availableSeats > bus.totalSeats * 0.2 ? "bg-yellow-500" : "bg-red-500"}`}
                                style={{
                                  width: `${(bus.availableSeats / bus.totalSeats) * 100}%`,
                                }}
                              />
                            </View>
                          </View>
                        </View>

                        {/* Action Buttons */}
                        <View className="gap-2">
                          <TouchableOpacity
                            className="w-full py-3 rounded-lg items-center justify-center flex-row"
                            style={{ backgroundColor: colors.primary }}
                            onPress={() =>
                              setExpandedBus(
                                expandedBus === bus.id ? null : bus.id
                              )
                            }
                          >
                            <Text className="text-white font-semibold font-geist">
                              {expandedBus === bus.id
                                ? "Hide Details"
                                : "View Details"}
                            </Text>
                            <ChevronRight
                              size={16}
                              color="#FFFFFF"
                              style={{
                                marginLeft: 8,
                                transform: [
                                  {
                                    rotate:
                                      expandedBus === bus.id ? "90deg" : "0deg",
                                  },
                                ],
                              }}
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            className="w-full py-3 rounded-lg border items-center justify-center"
                            style={{ borderColor: colors.border }}
                            onPress={() =>
                              router.push("/(passenger)/busPayment")
                            }
                          >
                            <Text
                              className="font-medium font-geist"
                              style={{ color: colors.text }}
                            >
                              Book Bus
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Expanded Details */}
                  {expandedBus === bus.id && (
                    <View
                      className="pt-6 border-t"
                      style={{ borderTopColor: colors.border }}
                    >
                      <View className="flex-col md:flex-row gap-6">
                        {/* Route Details */}
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2 mb-3">
                            <MapPin size={16} style={{ color: colors.text }} />
                            <Text
                              className="font-semibold"
                              style={{ color: colors.text }}
                            >
                              Route Details
                            </Text>
                          </View>
                          <View className="space-y-2">
                            {bus.routePoints.map((point, index) => (
                              <View
                                key={index}
                                className="flex-row items-center gap-3"
                              >
                                <View
                                  className={`w-6 h-6 rounded-full items-center justify-center ${index === 0 ? "bg-primary/10" : index === bus.routePoints.length - 1 ? "bg-green-500/10" : "bg-muted"}`}
                                >
                                  <Text
                                    className={`text-xs font-medium ${index === 0 ? "text-primary" : index === bus.routePoints.length - 1 ? "text-green-600" : "text-text"}`}
                                    style={
                                      index === 0
                                        ? { color: colors.primary }
                                        : index === bus.routePoints.length - 1
                                          ? { color: "#10B981" }
                                          : { color: colors.text }
                                    }
                                  >
                                    {index === 0
                                      ? "S"
                                      : index === bus.routePoints.length - 1
                                        ? "E"
                                        : index + 1}
                                  </Text>
                                </View>
                                <Text
                                  className="font-medium flex-1"
                                  style={{ color: colors.text }}
                                >
                                  {point}
                                </Text>
                                {index < bus.routePoints.length - 1 && (
                                  <ChevronRight
                                    size={16}
                                    style={{ color: colors.mutedText }}
                                  />
                                )}
                              </View>
                            ))}
                          </View>
                        </View>

                        {/* All Features */}
                        <View className="flex-1">
                          <Text
                            className="font-semibold mb-3"
                            style={{ color: colors.text }}
                          >
                            Bus Features
                          </Text>
                          <View className="flex-row flex-wrap gap-2">
                            {bus.features.map((feature, index) => (
                              <View
                                key={index}
                                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                                style={{
                                  backgroundColor: `${colors.mutedText}15`,
                                }}
                              >
                                <CheckCircle
                                  size={12}
                                  style={{ color: colors.text }}
                                />
                                <Text
                                  className="text-xs"
                                  style={{ color: colors.text }}
                                >
                                  {feature}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )
        })}
      </View>

      {/* Empty State - Only show if we have from/to values but no buses */}
      {sortedBuses.length === 0 && fromValue && toValue && !isFetching && (
        <View className="items-center py-12">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: `${colors.mutedText}15` }}
          >
            <Bus size={32} style={{ color: colors.mutedText }} />
          </View>
          <Text
            className="text-xl font-semibold"
            style={{ color: colors.text }}
          >
            No buses found for {fromValue} to {toValue}
          </Text>
          <Text
            className="mt-2 text-center"
            style={{ color: colors.mutedText }}
          >
            Try adjusting your search or check back later
          </Text>
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                Filters
              </Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.text }} className="mb-4">
              Filter buses from {fromValue} to {toValue}
            </Text>
            {/* Add filter options here */}
            <TouchableOpacity
              className="py-3 rounded-xl items-center mt-6"
              style={{ backgroundColor: colors.primary }}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text className="text-white font-semibold">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
