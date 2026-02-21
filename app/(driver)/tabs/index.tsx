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
} from "react-native"

interface DriverInfo {
  name: string
  profileImage: string
  wallet: number
  rating: number
  totalTrips: number
  assignedBus?: {
    busNumber: string
    status: string
    capacity: number
    currentStop?: string
    nextDestination?: string
  }
  todayTrips: number
  nextTrip?: {
    time: string
    route: string
    passengers: number
  }
  weeklyEarnings: number
}

export default function DriverHome() {
  const router = useRouter()
  const { colors, actualTheme } = useThemeContext()
  const [driver, setDriver] = useState<DriverInfo | null>(null)

  const gradientColors =
    actualTheme === "dark"
      ? ["#4C1D95", "#9333EA", "#C084FC"]
      : ["#F472B6", "#EC4899", "#DB2777"]

  useEffect(() => {
    const fetchDriver = async () => {
      // TODO: Replace with real API call
      setDriver({
        name: "Samuel Tale",
        profileImage:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        wallet: 1850.5,
        rating: 4.8,
        totalTrips: 342,
        todayTrips: 4,
        weeklyEarnings: 2450,
        assignedBus: {
          busNumber: "ETH-1223",
          status: "ACTIVE",
          capacity: 45,
          currentStop: "Bole Station",
          nextDestination: "Piassa Terminal",
        },
        nextTrip: {
          time: "08:30 AM",
          route: "Bole to Piassa Express",
          passengers: 32,
        },
      })
    }
    fetchDriver()
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const startTrip = () => {
    Alert.alert("Trip Started", "Live tracking is now active!")
  }

  const goToWallet = () => {
    router.push("/(driver)/tabs/earning")
  }

  if (!driver) return null

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
              <Image
                source={{ uri: driver.profileImage }}
                className="w-14 h-14 rounded-full border-2 border-white mr-3"
              />
              <View>
                <Text className="text-sm font-jakarta text-white">
                  {getGreeting()}
                </Text>
                <Text className="text-xl font-groteskBold text-white">
                  {driver.name}
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
        </LinearGradient>

        <ScrollView
          className="flex-1 -mt-8"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              paddingTop: 24,
            }}
          >
            <View className="px-6 mb-6">
              <Text
                className="text-lg font-geist mb-2"
                style={{ color: colors.text }}
              >
                Today's Trips
              </Text>
              {driver.todayTrips > 0 ? (
                <Text
                  className="text-sm font-jakarta"
                  style={{ color: colors.mutedText }}
                >
                  You have {driver.todayTrips} trips scheduled today.
                </Text>
              ) : (
                <Text
                  className="text-sm font-jakarta"
                  style={{ color: colors.mutedText }}
                >
                  No trips scheduled today.
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-around px-6 mb-8">
              <TouchableOpacity
                className="flex-1 mx-2 p-4 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
                onPress={startTrip}
              >
                <Ionicons name="car-sport" size={24} color="#fff" />
                <Text className="text-white font-jakarta mt-1">Start Trip</Text>
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
                    {driver.rating}
                  </Text>
                  <Text
                    className="text-xs font-jakarta"
                    style={{ color: colors.mutedText }}
                  >
                    Rating
                  </Text>
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
                    {driver.totalTrips}
                  </Text>
                  <Text
                    className="text-xs font-jakarta"
                    style={{ color: colors.mutedText }}
                  >
                    Total Trips
                  </Text>
                </View>

                <View className="items-center">
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: "#F59E0B20" }}
                  >
                    <Calendar size={20} color="#F59E0B" />
                  </View>
                  <Text
                    className="font-semibold font-geist"
                    style={{ color: colors.text }}
                  >
                    ${driver.weeklyEarnings}
                  </Text>
                  <Text
                    className="text-xs font-jakarta"
                    style={{ color: colors.mutedText }}
                  >
                    Weekly
                  </Text>
                </View>
              </View>
            </View>

            {/* Next Trip Card */}
            {driver.nextTrip && (
              <View className="px-6 mb-8">
                <Text
                  className="text-lg font-geist mb-4"
                  style={{ color: colors.text }}
                >
                  Next Trip
                </Text>
                <View
                  className="rounded-xl p-4"
                  style={{ backgroundColor: colors.background }}
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View>
                      <Text
                        className="font-semibold font-geist"
                        style={{ color: colors.text }}
                      >
                        {driver.nextTrip.route}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Clock size={14} color={colors.mutedText} />
                        <Text
                          className="text-sm ml-2 font-jakarta"
                          style={{ color: colors.mutedText }}
                        >
                          {driver.nextTrip.time}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <Users size={14} color={colors.mutedText} />
                      <Text
                        className="text-sm ml-1 font-jakarta"
                        style={{ color: colors.mutedText }}
                      >
                        {driver.nextTrip.passengers}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <MapPin size={14} color={colors.mutedText} />
                    <Text
                      className="text-sm ml-2 font-jakarta"
                      style={{ color: colors.mutedText }}
                    >
                      Starting from {driver.assignedBus?.currentStop}
                    </Text>
                  </View>

                  <TouchableOpacity
                    className="mt-4 py-2 rounded-lg items-center"
                    style={{ backgroundColor: colors.primary }}
                    onPress={startTrip}
                  >
                    <Text className="text-white font-medium font-jakarta">
                      Start This Trip
                    </Text>
                  </TouchableOpacity>
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
                  onPress={() => router.push("/(driver)/passengerList")}
                >
                  <View className="flex-row items-center mb-2">
                    <View
                      className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                      style={{ backgroundColor: colors.primary + "20" }}
                    >
                      <Users size={20} color={colors.primary} />
                    </View>
                    <Text
                      className="font-medium font-geist"
                      style={{ color: colors.text }}
                    >
                      Passengers
                    </Text>
                  </View>
                  <Text
                    className="text-xs font-jakarta"
                    style={{ color: colors.mutedText }}
                  >
                    Manage onboard passengers
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="w-[48%] rounded-xl p-4 mb-3"
                  style={{ backgroundColor: colors.background }}
                  onPress={() => router.push("/(driver)/tripHistory")}
                >
                  <View className="flex-row items-center mb-2">
                    <View
                      className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                      style={{ backgroundColor: "#10B98120" }}
                    >
                      <Ionicons name="time" size={20} color="#10B981" />
                    </View>
                    <Text
                      className="font-medium font-geist"
                      style={{ color: colors.text }}
                    >
                      Trip History
                    </Text>
                  </View>
                  <Text
                    className="text-xs font-jakarta"
                    style={{ color: colors.mutedText }}
                  >
                    View past trips
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="w-[48%] rounded-xl p-4"
                  style={{ backgroundColor: colors.background }}
                  onPress={() => router.push("/(driver)/settings")}
                >
                  <View className="flex-row items-center mb-2">
                    <View
                      className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                      style={{ backgroundColor: "#8B5CF620" }}
                    >
                      <Ionicons name="settings" size={20} color="#8B5CF6" />
                    </View>
                    <Text
                      className="font-medium font-geist"
                      style={{ color: colors.text }}
                    >
                      Settings
                    </Text>
                  </View>
                  <Text
                    className="text-xs font-jakarta"
                    style={{ color: colors.mutedText }}
                  >
                    Account & preferences
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="w-[48%] rounded-xl p-4"
                  style={{ backgroundColor: colors.background }}
                  onPress={() => router.push("/(driver)/notifications")}
                >
                  <View className="flex-row items-center mb-2">
                    <View
                      className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                      style={{ backgroundColor: "#F59E0B20" }}
                    >
                      <Bell size={20} color="#F59E0B" />
                    </View>
                    <Text
                      className="font-medium font-geist"
                      style={{ color: colors.text }}
                    >
                      Notifications
                    </Text>
                  </View>
                  <Text
                    className="text-xs font-jakarta"
                    style={{ color: colors.mutedText }}
                  >
                    Alerts & updates
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bus Details */}
            {driver.assignedBus && (
              <View className="px-6 mb-8">
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
                        className="font-semibold font-geist"
                        style={{ color: colors.text }}
                      >
                        {driver.assignedBus.busNumber}
                      </Text>
                      <Text
                        className="text-sm font-jakarta"
                        style={{ color: colors.mutedText }}
                      >
                        Capacity: {driver.assignedBus.capacity} seats
                      </Text>
                    </View>
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: "#10B98120" }}
                    >
                      <Text
                        className="text-xs font-medium font-geist"
                        style={{ color: "#10B981" }}
                      >
                        {driver.assignedBus.status}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <View className="flex-1">
                      <Text
                        className="text-sm font-jakarta mb-1"
                        style={{ color: colors.mutedText }}
                      >
                        Current Route
                      </Text>
                      <Text
                        className="font-medium font-geist"
                        style={{ color: colors.text }}
                      >
                        {driver.assignedBus.currentStop} →{" "}
                        {driver.assignedBus.nextDestination}
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="px-3 py-1 rounded-lg"
                      style={{ backgroundColor: colors.primary + "20" }}
                      onPress={() => router.push("/(driver)/busDetails")}
                    >
                      <Text
                        className="text-xs font-medium font-geist"
                        style={{ color: colors.primary }}
                      >
                        Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Performance Summary */}
            <View className="px-6 pb-8">
              <Text
                className="text-lg font-geist mb-4"
                style={{ color: colors.text }}
              >
                Today's Performance
              </Text>
              <View
                className="rounded-xl p-4"
                style={{ backgroundColor: colors.background }}
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text
                    className="font-jakarta"
                    style={{ color: colors.mutedText }}
                  >
                    Progress
                  </Text>
                  <Text
                    className="font-semibold font-geist"
                    style={{ color: colors.text }}
                  >
                    {driver.todayTrips}/6 trips
                  </Text>
                </View>
                <View
                  className="h-2 rounded-full mb-4"
                  style={{ backgroundColor: colors.border }}
                >
                  <View
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: colors.primary,
                      width: `${(driver.todayTrips / 6) * 100}%`,
                    }}
                  />
                </View>

                <View className="flex-row justify-between">
                  <View>
                    <Text
                      className="text-sm font-jakarta"
                      style={{ color: colors.mutedText }}
                    >
                      Estimated Earnings
                    </Text>
                    <Text
                      className="text-lg font-bold font-groteskBold"
                      style={{ color: colors.primary }}
                    >
                      ${(driver.todayTrips * 45.75).toFixed(2)}
                    </Text>
                  </View>
                  <View>
                    <Text
                      className="text-sm font-jakarta"
                      style={{ color: colors.mutedText }}
                    >
                      Average Rating
                    </Text>
                    <Text
                      className="text-lg font-bold font-groteskBold"
                      style={{ color: "#F59E0B" }}
                    >
                      ⭐ {driver.rating}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  )
}
