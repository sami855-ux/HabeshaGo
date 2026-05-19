import ServiceDashboard from "@/components/passenger/ServiceDashbaord"
import SmartSuggestions from "@/components/passenger/SmartSuggestion"
import SystemInfoCarousel from "@/components/passenger/SystemInfo"
import ProfileCompletionModal from "@/components/profile-completion-modal"
import AccountCard from "@/components/utils/AccountCard"
import { useThemeContext } from "@/context/ThemeContext"
import { fetchAllNotification } from "@/service/notification.api"
import { useAppDispatch, useAppSelector } from "@/store"
import { fetchUserWallet } from "@/store/slices/walletSlice"
import { Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Search } from "lucide-react-native"
import { useEffect, useMemo } from "react"
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const defaultAvatar = require("@/assets/images/defaultAvater.jpg")

const PassengerHome = () => {
  const router = useRouter()
  const { user } = useAppSelector((state) => state.user)

  const { colors, actualTheme } = useThemeContext()

  const { data: notifications = [] } = useQuery({
    queryKey: ["notification"],
    queryFn: fetchAllNotification,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,

    // Refetch every 2 seconds
    refetchInterval: 2000,

    // Optional: also refetch in background
    refetchIntervalInBackground: true,
  })

  // Define gradient colors based on theme
  const gradientColors =
    actualTheme === "dark"
      ? ["#FFB300", "#FF9500", "#FF6F00"] // slightly warmer/darker for dark mode
      : ["#ea580c", "#f97316", "#fb923c"]

  const dispatch = useAppDispatch()

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  useEffect(() => {
    // Fetch wallet once when user area loads
    dispatch(fetchUserWallet())
  }, [dispatch])

  return (
    <>
      <StatusBar
        translucent
        // backgroundColor="transparent"
        barStyle={actualTheme === "dark" ? "light-content" : "dark-content"}
      />

      <ProfileCompletionModal />

      <View style={{ backgroundColor: colors.background, flex: 1 }}>
        {/* Gradient Header Section */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-6 pb-5 mb-3 h-72 pt-10 pl-8"
        >
          {/* Top Row: Profile + Search */}
          <View className="flex-row justify-between items-center mb-4">
            {/* Left: Profile + Greeting */}
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => router.push("/evService")}>
                <Image
                  source={
                    user?.avaterUrl ? { uri: user.avaterUrl } : defaultAvatar
                  }
                  className="w-14 h-14 rounded-full  mr-3"
                />
              </TouchableOpacity>
              <View>
                <Text className="text-sm font-jakarta text-white">
                  {getGreeting()}
                </Text>
                <Text className="text-xl font-groteskBold text-white capitalize">
                  {user?.name ? user.name : "No username"}
                </Text>
              </View>
            </View>

            {/* Right: Search and QR Code Buttons */}
            <View className="flex-row items-center">
              <TouchableOpacity
                className="bg-white/20 p-3 rounded-full mr-3"
                onPress={() => router.push("/(passenger)/search")}
              >
                <Search size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-white/20 p-3 rounded-full relative"
                onPress={() => router.push("/(passenger)/notifications")}
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={colors.text}
                />

                {unreadNotificationCount > 0 && (
                  <View className="absolute -top-1.5 -right-1 bg-red-500 w-6 h-6 rounded-full items-center justify-center">
                    <Text className="text-white text-[10px] font-bold">
                      {unreadNotificationCount > 10
                        ? "10+"
                        : unreadNotificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Summary Card */}
          <AccountCard />
        </LinearGradient>

        {/* Scrollable Content Area */}
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
            {/* Service Dashboard */}
            <View className="px-4">
              <ServiceDashboard />
            </View>

            {/* Smart Suggestions */}
            <View className="mt-4">
              <SmartSuggestions />
            </View>

            <View className="mt-4">
              <SystemInfoCarousel />
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  )
}

const getGreeting = () => {
  const currentHour = new Date().getHours()
  if (currentHour < 12) return "Good morning"
  if (currentHour < 18) return "Good afternoon"
  return "Good evening"
}

export default PassengerHome
