import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native"
import { useState, useEffect, useCallback } from "react"
import { useThemeContext } from "@/context/ThemeContext"
import {
  MapPin,
  Flag,
  Calendar,
  Users,
  Wallet,
  Clock,
  ChevronRight,
} from "lucide-react-native"
import { getDriverTripHistory } from "@/service/driver"

type TripStatus = "ongoing" | "completed" | "cancelled"

interface Trip {
  bookingId: number
  bookingCode: string
  date: string
  completedAt: string
  bus: {
    id: number
    busNumber: string
  }
  route: {
    name: string
    origin: string
    destination: string
    distanceKm: number
    estimatedTimeMin: number
    estimatedTimeHours: number
  } | null
  schedule: {
    startTime: string
    endTime: string
    direction: string
  } | null
  passengers: {
    total: number
    checkedIn: number
    noShow: number
  }
  revenue: {
    amount: number
    currency: string
    paymentMethod: string
    discount: number
    totalBeforeDiscount: number
  }
}

interface TripHistoryData {
  driver: {
    id: string
    name: string
    phone: string
    rating: number
  }
  summary: {
    totalTrips: number
    totalPassengers: number
    totalCheckedIn: number
    totalRevenue: number
    totalDistanceKm: number
    totalHours: number
    totalMinutes: number
    currency: string
    paymentBreakdown: {
      [key: string]: { trips: number; amount: number }
    }
  }
  trips: Trip[]
}

export default function DriverTrips() {
  const { colors, actualTheme } = useThemeContext()
  const [activeTab, setActiveTab] = useState<TripStatus>("completed")
  const [tripData, setTripData] = useState<TripHistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDarkMode = actualTheme === "dark" ? true : false

  // Get driver user ID from your auth context/storage
  // const driverUserId = "driver_user_id_here" // Replace with actual driver ID

  const fetchTripHistory = useCallback(async () => {
    try {
      setError(null)
      const response = await getDriverTripHistory()
      if (response.status === "success" && response.data) {
        setTripData(response.data)
      } else {
        setError(response.message || "Failed to load trip history")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [driverUserId])

  useEffect(() => {
    fetchTripHistory()
  }, [fetchTripHistory])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchTripHistory()
  }, [fetchTripHistory])

  const getFilteredTrips = () => {
    if (!tripData?.trips) return []

    // For now, we'll determine status based on completion vs cancellation
    // You can add actual status field to your schema if needed
    if (activeTab === "completed") {
      return tripData.trips // All returned trips are completed from API
    } else if (activeTab === "cancelled") {
      return [] // You can add cancelled trips to your API response
    } else if (activeTab === "ongoing") {
      return [] // Add ongoing trips to your API response
    }
    return []
  }

  const filteredTrips = getFilteredTrips()

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Format time
  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string = "ETB") => {
    return `${currency} ${amount.toLocaleString()}`
  }

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-gray-500 dark:text-gray-400">
          Loading trips...
        </Text>
      </View>
    )
  }

  if (error) {
    return (
      <View
        className="flex-1 items-center justify-center p-6"
        style={{ backgroundColor: colors.background }}
      >
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <TouchableOpacity
          onPress={fetchTripHistory}
          className="px-6 py-3 rounded-xl"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header with Summary */}
      <View
        className="pt-12 pb-4 px-5 border-b"
        style={{ borderColor: colors.border }}
      >
        <Text
          className="text-2xl font-bold mb-2"
          style={{ color: colors.text }}
        >
          My Trips
        </Text>

        {/* Summary Cards */}
        {tripData && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-2 -mx-1"
          >
            <View className="flex-row space-x-3 px-1">
              <View
                className="rounded-xl p-3 w-32"
                style={{ backgroundColor: colors.card }}
              >
                <Wallet size={20} color={colors.primary} />
                <Text
                  className="text-lg font-bold mt-1"
                  style={{ color: colors.text }}
                >
                  {formatCurrency(
                    tripData.summary.totalRevenue,
                    tripData.summary.currency,
                  )}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Total Revenue
                </Text>
              </View>

              <View
                className="rounded-xl p-3 w-32"
                style={{ backgroundColor: colors.card }}
              >
                <Users size={20} color={colors.primary} />
                <Text
                  className="text-lg font-bold mt-1"
                  style={{ color: colors.text }}
                >
                  {tripData.summary.totalPassengers}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Passengers
                </Text>
              </View>

              <View
                className="rounded-xl p-3 w-32"
                style={{ backgroundColor: colors.card }}
              >
                <Clock size={20} color={colors.primary} />
                <Text
                  className="text-lg font-bold mt-1"
                  style={{ color: colors.text }}
                >
                  {tripData.summary.totalHours.toFixed(0)}h
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Total Hours
                </Text>
              </View>

              <View
                className="rounded-xl p-3 w-32"
                style={{ backgroundColor: colors.card }}
              >
                <Calendar size={20} color={colors.primary} />
                <Text
                  className="text-lg font-bold mt-1"
                  style={{ color: colors.text }}
                >
                  {tripData.summary.totalTrips}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Total Trips
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Tabs */}
      <View className="flex-row mx-5 mt-4 gap-2">
        <TouchableOpacity
          onPress={() => setActiveTab("ongoing")}
          className={`flex-1 py-3 rounded-xl ${activeTab === "ongoing" ? "bg-blue-500" : "bg-gray-100 dark:bg-gray-800"}`}
        >
          <Text
            className={`text-center font-semibold ${activeTab === "ongoing" ? "text-white" : "text-gray-700 dark:text-gray-300"}`}
          >
            Ongoing
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("completed")}
          className={`flex-1 py-3 rounded-xl ${activeTab === "completed" ? "bg-blue-500" : "bg-gray-100 dark:bg-gray-800"}`}
        >
          <Text
            className={`text-center font-semibold ${activeTab === "completed" ? "text-white" : "text-gray-700 dark:text-gray-300"}`}
          >
            Completed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("cancelled")}
          className={`flex-1 py-3 rounded-xl ${activeTab === "cancelled" ? "bg-blue-500" : "bg-gray-100 dark:bg-gray-800"}`}
        >
          <Text
            className={`text-center font-semibold ${activeTab === "cancelled" ? "text-white" : "text-gray-700 dark:text-gray-300"}`}
          >
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {/* Trip List */}
      <ScrollView
        className="flex-1 px-5 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {filteredTrips.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-400 text-center">
              No {activeTab} trips found
            </Text>
          </View>
        ) : (
          filteredTrips.map((trip) => (
            <TouchableOpacity
              key={trip.bookingId}
              className="rounded-xl p-4 mb-3"
              style={{ backgroundColor: colors.card }}
              activeOpacity={0.7}
            >
              {/* Trip Header */}
              <View className="flex-row justify-between items-start mb-3">
                <View>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(trip.date)} • {formatTime(trip.completedAt)}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Bus: {trip.bus.busNumber} • Code: {trip.bookingCode}
                  </Text>
                </View>
                <View className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
                  <Text className="text-green-600 dark:text-green-400 text-xs font-semibold">
                    COMPLETED
                  </Text>
                </View>
              </View>

              {/* Route Info */}
              {trip.route && (
                <View className="mb-3">
                  <Text
                    className="text-sm font-semibold mb-2"
                    style={{ color: colors.text }}
                  >
                    {trip.route.name}
                  </Text>

                  <View className="flex-row items-center mb-1">
                    <View className="w-6">
                      <MapPin size={14} color={colors.primary} />
                    </View>
                    <Text
                      className="text-sm flex-1"
                      style={{ color: colors.text }}
                    >
                      {trip.route.origin}
                    </Text>
                  </View>

                  <View className="flex-row items-center ml-3 mb-1">
                    <View className="w-0.5 h-4 bg-gray-300 dark:bg-gray-600" />
                  </View>

                  <View className="flex-row items-center">
                    <View className="w-6">
                      <Flag size={14} color={colors.primary} />
                    </View>
                    <Text
                      className="text-sm flex-1"
                      style={{ color: colors.text }}
                    >
                      {trip.route.destination}
                    </Text>
                  </View>
                </View>
              )}

              {/* Trip Stats */}
              <View
                className="flex-row justify-between pt-3 border-t"
                style={{ borderColor: colors.border }}
              >
                <View>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Passengers
                  </Text>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.text }}
                  >
                    {trip.passengers.checkedIn}/{trip.passengers.total}
                  </Text>
                  {trip.passengers.noShow > 0 && (
                    <Text className="text-xs text-red-500">
                      +{trip.passengers.noShow} no-show
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Distance
                  </Text>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.text }}
                  >
                    {trip.route?.distanceKm.toFixed(1)} km
                  </Text>
                </View>

                <View>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Revenue
                  </Text>
                  <Text className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(trip.revenue.amount, trip.revenue.currency)}
                  </Text>
                  {trip.revenue.discount > 0 && (
                    <Text className="text-xs text-gray-500">
                      -{trip.revenue.discount}
                    </Text>
                  )}
                </View>

                <ChevronRight size={20} color={colors.mutedText} />
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Space for bottom tabs */}
        <View className="h-24" />
      </ScrollView>
    </View>
  )
}
