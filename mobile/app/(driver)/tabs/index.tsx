import { useThemeContext } from "@/context/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import {
  Bell,
  Calendar,
  Clock,
  MapPin,
  Search,
  Users,
  ChevronRight,
  AlertCircle,
} from "lucide-react-native"
import { useEffect, useState } from "react"
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native"
import { getDriverBusWithSchedules, startTrip } from "@/service/driver"

interface Schedule {
  id: number
  startTime: string
  endTime: string
  direction: string
  isActive: boolean
}

interface BusData {
  driver: {
    id: string
    name: string
    phone: string
    email: string
    status: string
    isOnDuty: boolean
    rating: number
    totalTrips: number
  }
  bus: {
    id: number
    busNumber: string
    capacity: number
    status: string
    isActive: boolean
    departureTime: string | null
    currentStop: string | null
    nextDestination: string | null
    delayMinutes: number
    averageRating: number
    totalRatings: number
  }
  route: {
    id: number
    name: string
    origin: string
    destination: string
    distanceKm: number
    estimatedTimeMin: number
    price: number
    currency: string
    midPoints: Array<{
      id: number
      name: string
      order: number
    }>
  } | null
  schedules: Schedule[]
  todayStats: {
    totalBookings: number
    totalRevenue: number
    totalPassengers: number
    currency: string
  }
  currentTrip: {
    isOnDuty: boolean
    startedAt: string
    currentStop: string
    nextDestination: string
    delayMinutes: number
  } | null
}

export default function DriverHome() {
  const router = useRouter()
  const { colors, actualTheme } = useThemeContext()
  const [busData, setBusData] = useState<BusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  )
  const [startingTrip, setStartingTrip] = useState(false)

  const driverUserId = "cmobrm47f0004py85qscobcww" // Replace with actual driver user ID from auth

  const gradientColors =
    actualTheme === "dark"
      ? ["#4C1D95", "#9333EA", "#C084FC"]
      : ["#F472B6", "#EC4899", "#DB2777"]

  const fetchBusData = async () => {
    try {
      setError(null)
      const result = await getDriverBusWithSchedules(driverUserId)

      if (result.success) {
        setBusData(result.data)
        // console.log(result.data)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || "Failed to load bus data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchBusData()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchBusData()
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const canStartSchedule = (schedule: Schedule) => {
    const now = new Date()
    const [scheduleHours, scheduleMinutes] = schedule.startTime
      .split(":")
      .map(Number)
    const scheduleTime = new Date()
    scheduleTime.setHours(scheduleHours, scheduleMinutes, 0, 0)

    const timeDiff = Math.abs(now.getTime() - scheduleTime.getTime())
    const diffMinutes = timeDiff / (1000 * 60)

    return diffMinutes <= 30
  }

  const handleScheduleSelect = (schedule: Schedule) => {
    console.log("first", schedule)
    setSelectedSchedule(schedule)
    setShowScheduleModal(true)
  }

  const handleStartTrip = async () => {
    if (!selectedSchedule) return

    // if (!canStartSchedule(selectedSchedule)) {
    //   Alert.alert(
    //     "Cannot Start Trip",
    //     `You can only start a trip within 30 minutes of the scheduled time (${selectedSchedule.startTime}).`,
    //     [{ text: "OK" }],
    //   )
    //   setShowScheduleModal(false)
    //   return
    // }

    setStartingTrip(true)
    try {
      const result = await startTrip(driverUserId, {
        busId: busData?.bus.id,
        scheduleId: selectedSchedule.id,
      })

      console.log(busData?.bus.id, selectedSchedule.id, "bus")

      if (result.success) {
        Alert.alert(
          "Trip Started Successfully",
          `You have started the ${selectedSchedule.startTime} - ${selectedSchedule.endTime} trip.`,
          [
            {
              text: "Okay",
              onPress: () => {
                router.push({
                  pathname: "/(driver)/activeTrip",
                  params: {
                    busId: busData?.bus.id,
                    scheduleId: selectedSchedule.id,
                    tripData: JSON.stringify(result.data),
                  },
                })
              },
            },
          ],
        )
        // Refresh data to update isOnDuty status
        fetchBusData()
      } else {
        Alert.alert("Failed to Start Trip", result.message)
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to start trip")
    } finally {
      setStartingTrip(false)
      setShowScheduleModal(false)
      setSelectedSchedule(null)
    }
  }

  const goToWallet = () => {
    router.push("/(driver)/tabs/earning")
  }

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-gray-500">Loading your bus data...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View
        className="flex-1 items-center justify-center p-6"
        style={{ backgroundColor: colors.background }}
      >
        <AlertCircle size={48} color="#EF4444" />
        <Text className="text-red-500 text-center mt-4 mb-6">{error}</Text>
        <TouchableOpacity
          onPress={fetchBusData}
          className="px-6 py-3 rounded-xl"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!busData) return null

  const isOnDuty = busData.currentTrip?.isOnDuty || false

  return (
    <>
      <StatusBar
        translucent
        barStyle={actualTheme === "dark" ? "light-content" : "dark-content"}
      />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-6 pb-10 h-fit pt-10 mb-3"
        >
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center mr-3">
                <Text className="text-white text-2xl font-bold">
                  {busData.driver.name.charAt(0)}
                </Text>
              </View>
              <View>
                <Text className="text-sm font-jakarta text-white">
                  {getGreeting()}
                </Text>
                <Text className="text-xl font-groteskBold text-white">
                  {busData.driver.name}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <TouchableOpacity
                className="bg-white/20 p-3 rounded-full mr-3"
                onPress={() => router.push("/(driver)/driverSearch")}
              >
                <Search size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-white/20 p-3 rounded-full"
                onPress={() => router.push("/(driver)/qrScanner")}
              >
                <Ionicons name="qr-code-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bus Number Badge */}
          <View className="bg-white/20 self-start px-4 py-2 rounded-full">
            <Text className="text-white font-semibold">
              Bus: {busData.bus.busNumber}
            </Text>
          </View>
        </LinearGradient>

        <ScrollView
          className="flex-1 -mt-8"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              paddingTop: 24,
            }}
          >
            {/* Today's Stats */}
            <View className="px-6 mb-6">
              <Text
                className="text-lg font-geist mb-2"
                style={{ color: colors.text }}
              >
                Today's Overview
              </Text>
              <View className="flex-row justify-between mt-2">
                <View className="flex-1">
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    {busData.todayStats.totalBookings}
                  </Text>
                  <Text className="text-xs text-gray-500">Bookings</Text>
                </View>
                <View className="flex-1">
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: "#10B981" }}
                  >
                    {busData.todayStats.totalPassengers}
                  </Text>
                  <Text className="text-xs text-gray-500">Passengers</Text>
                </View>
                <View className="flex-1">
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: "#F59E0B" }}
                  >
                    {busData.todayStats.totalRevenue}
                  </Text>
                  <Text className="text-xs text-gray-500">Revenue (ETB)</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-around px-6 mb-8">
              <TouchableOpacity
                className="flex-1 mx-2 p-4 rounded-xl items-center"
                style={{
                  backgroundColor: isOnDuty ? "#6B7280" : colors.primary,
                }}
                onPress={() => setShowScheduleModal(true)}
                disabled={isOnDuty}
              >
                <Ionicons name="car-sport" size={24} color="#fff" />
                <Text className="text-white font-jakarta mt-1">
                  {isOnDuty ? "Trip Active" : "Start Trip"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 mx-2 p-4 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
                onPress={goToWallet}
              >
                <Ionicons name="wallet" size={24} color="#fff" />
                <Text className="text-white font-jakarta mt-1">Wallet</Text>
              </TouchableOpacity>
            </View>

            {/* Active Trip Indicator */}
            {isOnDuty && busData.currentTrip && (
              <View className="px-6 mb-6">
                <View className="rounded-xl p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-green-700 dark:text-green-300 font-semibold">
                        Trip In Progress
                      </Text>
                      <Text className="text-sm text-green-600 dark:text-green-400 mt-1">
                        {busData.currentTrip.currentStop} →{" "}
                        {busData.currentTrip.nextDestination}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => router.push("/(driver)/activeTrip")}
                      className="bg-green-600 px-4 py-2 rounded-lg"
                    >
                      <Text className="text-white text-sm">View Trip</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Quick Stats */}
            <View className="px-6 mb-8">
              <Text
                className="text-lg font-geist mb-4"
                style={{ color: colors.text }}
              >
                Quick Stats
              </Text>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: colors.primary + "20" }}
                  >
                    <Ionicons name="star" size={24} color={colors.primary} />
                  </View>
                  <Text
                    className="font-semibold font-geist"
                    style={{ color: colors.text }}
                  >
                    {busData.driver.rating}
                  </Text>
                  <Text className="text-xs text-gray-500">Rating</Text>
                </View>

                <View className="items-center">
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: "#10B98120" }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#10B981"
                    />
                  </View>
                  <Text
                    className="font-semibold font-geist"
                    style={{ color: colors.text }}
                  >
                    {busData.driver.totalTrips}
                  </Text>
                  <Text className="text-xs text-gray-500">Total Trips</Text>
                </View>

                <View className="items-center">
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: "#F59E0B20" }}
                  >
                    <Calendar size={24} color="#F59E0B" />
                  </View>
                  <Text
                    className="font-semibold font-geist"
                    style={{ color: colors.text }}
                  >
                    {busData.bus.capacity}
                  </Text>
                  <Text className="text-xs text-gray-500">Seats</Text>
                </View>
              </View>
            </View>

            {/* Schedules Section */}
            <View className="px-6 mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text
                  className="text-lg font-geist"
                  style={{ color: colors.text }}
                >
                  Today's Schedules
                </Text>
                <TouchableOpacity onPress={() => setShowScheduleModal(true)}>
                  <Text className="text-sm" style={{ color: colors.primary }}>
                    View All
                  </Text>
                </TouchableOpacity>
              </View>

              {busData.schedules.slice(0, 2).map((schedule) => {
                const canStart = canStartSchedule(schedule)
                return (
                  <TouchableOpacity
                    key={schedule.id}
                    className="rounded-xl p-4 mb-3"
                    style={{ backgroundColor: colors.background }}
                    onPress={() => handleScheduleSelect(schedule)}
                    disabled={isOnDuty}
                  >
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text
                          className="font-semibold"
                          style={{ color: colors.text }}
                        >
                          {schedule.startTime} - {schedule.endTime}
                        </Text>
                        <Text className="text-sm text-gray-500 mt-1">
                          Direction: {schedule.direction}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        {canStart && !isOnDuty && (
                          <View className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded-full mr-2">
                            <Text className="text-xs text-green-600 dark:text-green-400">
                              Can Start
                            </Text>
                          </View>
                        )}
                        <ChevronRight size={20} color={colors.mutedText} />
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })}

              {busData.schedules.length === 0 && (
                <Text className="text-center text-gray-500">
                  No schedules available today
                </Text>
              )}
            </View>

            {/* Route Info */}
            {busData.route && (
              <View className="px-6 mb-8">
                <Text
                  className="text-lg font-geist mb-4"
                  style={{ color: colors.text }}
                >
                  Route Information
                </Text>
                <View
                  className="rounded-xl p-4"
                  style={{ backgroundColor: colors.background }}
                >
                  <Text
                    className="font-semibold mb-2"
                    style={{ color: colors.text }}
                  >
                    {busData.route.name}
                  </Text>
                  <View className="flex-row items-center mb-3">
                    <MapPin size={16} color={colors.primary} />
                    <Text
                      className="ml-2 text-sm"
                      style={{ color: colors.text }}
                    >
                      {busData.route.origin} → {busData.route.destination}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-500">
                      Distance: {busData.route.distanceKm} km
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Duration:{" "}
                      {Math.floor(busData.route.estimatedTimeMin / 60)}h{" "}
                      {busData.route.estimatedTimeMin % 60}m
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Quick Actions */}
            <View className="px-6 mb-8">
              <Text
                className="text-lg font-geist mb-4"
                style={{ color: colors.text }}
              >
                Quick Actions
              </Text>
              <View className="flex-row flex-wrap justify-between">
                <TouchableOpacity
                  className="w-[48%] rounded-xl p-4 mb-3"
                  style={{ backgroundColor: colors.background }}
                  // onPress={() => router.push("/(driver)/passengerList")}
                >
                  <View className="flex-row items-center mb-2">
                    <View
                      className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                      style={{ backgroundColor: colors.primary + "20" }}
                    >
                      <Users size={20} color={colors.primary} />
                    </View>
                    <Text
                      className="font-medium"
                      style={{ color: colors.text }}
                    >
                      Passengers
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500">
                    Manage onboard passengers
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="w-[48%] rounded-xl p-4 mb-3"
                  style={{ backgroundColor: colors.background }}
                  // onPress={() => router.push("/(driver)/tripHistory")}
                >
                  <View className="flex-row items-center mb-2">
                    <View
                      className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                      style={{ backgroundColor: "#10B98120" }}
                    >
                      <Ionicons name="time" size={20} color="#10B981" />
                    </View>
                    <Text
                      className="font-medium"
                      style={{ color: colors.text }}
                    >
                      Trip History
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500">View past trips</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bus Details */}
            <View className="px-6 pb-8">
              <Text
                className="text-lg font-geist mb-4"
                style={{ color: colors.text }}
              >
                Bus Details
              </Text>
              <View
                className="rounded-xl p-4"
                style={{ backgroundColor: colors.background }}
              >
                <View className="flex-row justify-between items-center mb-3">
                  <View>
                    <Text
                      className="font-semibold"
                      style={{ color: colors.text }}
                    >
                      {busData.bus.busNumber}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Capacity: {busData.bus.capacity} seats
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: "#10B98120" }}
                  >
                    <Text className="text-xs font-medium text-green-600 dark:text-green-400">
                      {busData.bus.status}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-500">
                    Rating: {busData.bus.averageRating} ⭐ (
                    {busData.bus.totalRatings})
                  </Text>
                  <TouchableOpacity
                    className="px-3 py-1 rounded-lg"
                    style={{ backgroundColor: colors.primary + "20" }}
                    // onPress={() => router.push("/(driver)/busDetails")}
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{ color: colors.primary }}
                    >
                      Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Schedule Selection Modal */}
      <Modal
        visible={showScheduleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                Select Schedule
              </Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <Ionicons name="close" size={24} color={colors.mutedText} />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96">
              {busData.schedules.map((schedule) => {
                const canStart = canStartSchedule(schedule)
                const isSelected = selectedSchedule?.id === schedule.id
                return (
                  <TouchableOpacity
                    key={schedule.id}
                    className={`rounded-xl p-4 mb-3 border-2 ${
                      isSelected ? "border-blue-500" : "border-transparent"
                    }`}
                    style={{ backgroundColor: colors.background }}
                    onPress={() => setSelectedSchedule(schedule)}
                  >
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text
                          className="font-semibold text-lg"
                          style={{ color: colors.text }}
                        >
                          {schedule.startTime} - {schedule.endTime}
                        </Text>
                        <Text className="text-sm text-gray-500 mt-1">
                          Direction: {schedule.direction}
                        </Text>
                        {!canStart && (
                          <Text className="text-xs text-red-500 mt-1">
                            Cannot start (must be within 30 minutes)
                          </Text>
                        )}
                      </View>
                      {canStart && !isOnDuty && (
                        <View className="px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                          <Text className="text-xs text-green-600 dark:text-green-400">
                            Available
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            <TouchableOpacity
              className="py-4 rounded-xl items-center mt-6"
              style={{ backgroundColor: colors.primary }}
              onPress={handleStartTrip}
              disabled={!selectedSchedule || startingTrip || isOnDuty}
            >
              {startingTrip ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  {isOnDuty ? "Trip Already Active" : "Start Selected Trip"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  )
}
