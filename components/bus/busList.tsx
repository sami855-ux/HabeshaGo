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
import React, { useState } from "react"
import { Modal, Text, TouchableOpacity, View } from "react-native"

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
}

export function BusList() {
  const router = useRouter()
  const { colors } = useThemeContext()
  const [buses, setBuses] = useState<BusType[]>([
    {
      id: "1",
      operator: "Express Travels",
      busNumber: "ET-7890",
      type: "AC Sleeper (2+1)",
      departure: "08:30",
      arrival: "13:45",
      duration: "5h 15m",
      totalSeats: 40,
      availableSeats: 12,
      rating: 4.5,
      reviews: 245,
      features: ["Live Tracking", "On-time", "Clean"],
      routePoints: ["Addis Ababa", "Debre Zeit", "Ziway", "Addama"],
      busCondition: "excellent",
    },
    {
      id: "2",
      operator: "City Connect",
      busNumber: "CC-4567",
      type: "Non-AC Seater (2+2)",
      departure: "09:15",
      arrival: "14:30",
      duration: "5h 15m",
      totalSeats: 45,
      availableSeats: 25,
      rating: 3.8,
      reviews: 189,
      features: [],
      routePoints: ["Addis Ababa", "Mojo", "Addama"],
      busCondition: "good",
    },
    {
      id: "3",
      operator: "Premium Coach",
      busNumber: "PC-1234",
      type: "AC Seater (2+2)",
      departure: "10:00",
      arrival: "15:15",
      duration: "5h 15m",
      totalSeats: 40,
      availableSeats: 8,
      rating: 4.2,
      reviews: 312,
      features: ["Live Tracking", "Clean"],
      routePoints: ["Addis Ababa", "Debre Zeit", "Addama"],
      busCondition: "excellent",
    },
    {
      id: "4",
      operator: "Metro Express",
      busNumber: "ME-5678",
      type: "AC Sleeper (2+1)",
      departure: "11:30",
      arrival: "16:45",
      duration: "5h 15m",
      totalSeats: 36,
      availableSeats: 3,
      rating: 4.7,
      reviews: 156,
      features: ["Live Tracking", "Clean"],
      routePoints: ["Addis Ababa", "Dukem", "Debre Zeit", "Addama"],
      busCondition: "excellent",
    },
  ])

  const [sortBy, setSortBy] = useState("departure")
  const [expandedBus, setExpandedBus] = useState<string | null>(null)
  const [filterModalVisible, setFilterModalVisible] = useState(false)

  const sortedBuses = [...buses].sort((a, b) => {
    switch (sortBy) {
      case "departure":
        return a.departure.localeCompare(b.departure)
      case "duration":
        return a.duration.localeCompare(b.duration)
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

  return (
    <View
      className="space-y-6 mt-2 rounded-2xl"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header with Stats */}
      <View
        className="rounded-3xl p-6 px-3"
        style={{ backgroundColor: colors.background }}
      >
        <View className="flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <View>
            <Text className="text-xl font-geist" style={{ color: colors.text }}>
              Available Buses
            </Text>
            <Text
              className="mt-1 font-geist"
              style={{ color: colors.mutedText }}
            >
              {buses.length} buses found • {totalAvailableSeats} seats available
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
                  // Implement your modal/dropdown logic here
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
                              </View>
                            </View>
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
                              Departure
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
                              Arrival
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

      {/* Empty State */}
      {sortedBuses.length === 0 && (
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
            No buses found
          </Text>
          <Text className="mt-2" style={{ color: colors.mutedText }}>
            Try adjusting your search criteria
          </Text>
          <TouchableOpacity
            className="mt-4 px-4 py-2 rounded-lg border"
            style={{ borderColor: colors.border }}
            onPress={() => {
              // Clear filters logic
            }}
          >
            <Text style={{ color: colors.text }}>Clear Filters</Text>
          </TouchableOpacity>
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
                <X size={24} className="text-white" />
              </TouchableOpacity>
            </View>
            {/* Filter options here */}
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
