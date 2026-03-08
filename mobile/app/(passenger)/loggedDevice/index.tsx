import AlertModal from "@/components/utils/AlertModal"
import { useThemeContext } from "@/context/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

interface Device {
  id: string
  name: string
  type: string
  ipAddress: string
  location: string
  firstLogin: string
  lastActive: string
  os: string
  browser?: string
  isCurrent: boolean
  isTrusted: boolean
}

export default function LoggedDevice() {
  const { colors, setTheme, theme: themeMode, actualTheme } = useThemeContext()
  const isDark = actualTheme === "dark"

  const router = useRouter()

  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [autoLoginEnabled, setAutoLoginEnabled] = useState(false)

  const [alertVisible, setAlertVisible] = useState(false)
  const [alertConfig, setAlertConfig] = useState({})

  const showAlert = (config) => {
    setAlertConfig(config)
    setAlertVisible(true)
  }

  // Initial devices data with IP addresses and login timestamps
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "1",
      name: "iPhone 15 Pro",
      type: "Mobile",
      ipAddress: "192.168.1.105",
      location: "San Francisco, CA",
      firstLogin: "2024-01-15 14:30",
      lastActive: "Just now",
      os: "iOS 17.2",
      browser: "Safari",
      isCurrent: true,
      isTrusted: true,
    },
    {
      id: "2",
      name: "Samsung Galaxy S23",
      type: "Mobile",
      ipAddress: "203.0.113.45",
      location: "New York, NY",
      firstLogin: "2024-01-10 09:15",
      lastActive: "2 hours ago",
      os: "Android 14",
      browser: "Chrome",
      isCurrent: false,
      isTrusted: true,
    },
    {
      id: "3",
      name: "MacBook Pro",
      type: "Computer",
      ipAddress: "172.16.254.1",
      location: "Home Network",
      firstLogin: "2024-01-05 11:20",
      lastActive: "Yesterday",
      os: "macOS Sonoma",
      browser: "Chrome",
      isCurrent: false,
      isTrusted: false,
    },
    {
      id: "4",
      name: "Windows Desktop",
      type: "Computer",
      ipAddress: "10.0.0.25",
      location: "Office Network",
      firstLogin: "2024-01-02 08:45",
      lastActive: "1 week ago",
      os: "Windows 11",
      browser: "Firefox",
      isCurrent: false,
      isTrusted: false,
    },
    {
      id: "5",
      name: "iPad Air",
      type: "Tablet",
      ipAddress: "198.51.100.22",
      location: "Los Angeles, CA",
      firstLogin: "2023-12-28 16:10",
      lastActive: "3 weeks ago",
      os: "iPadOS 17",
      browser: "Safari",
      isCurrent: false,
      isTrusted: true,
    },
  ])

  const themeOptions = [
    { value: "light" as const, label: "Light", icon: "sunny-outline" },
    { value: "dark" as const, label: "Dark", icon: "moon-outline" },
    {
      value: "system" as const,
      label: "System",
      icon: "phone-portrait-outline",
    },
  ]

  const getCurrentDeviceIP = async () => {
    // In a real app, you would fetch the actual IP address
    return "192.168.1.105"
  }

  const fetchDevices = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      const currentIP = await getCurrentDeviceIP()
      setDevices((prev) =>
        prev.map((device) =>
          device.isCurrent ? { ...device, ipAddress: currentIP } : device
        )
      )
    } catch (error) {
      console.error("Failed to fetch devices:", error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchDevices()
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  const handleLogoutDevice = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId)
    showAlert({
      type: "warning",
      title: "Logged Out",
      message: `Are you sure you want to logout from ${device.name}?`,
      primaryButtonText: "Logout",
      secondaryButtonText: "Cancel",
      onPrimaryPress: () => {
        setDevices((prev) => prev.filter((d) => d.id !== deviceId))
        setAlertVisible(false)
        Alert.alert("Success", `Logged out from ${device.name}`)
      },
    })
  }

  const handleTrustDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === deviceId
          ? { ...device, isTrusted: !device.isTrusted }
          : device
      )
    )
  }

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "mobile":
        return "phone-portrait-outline"
      case "tablet":
        return "tablet-portrait-outline"
      case "computer":
        return "laptop-outline"
      default:
        return "phone-portrait-outline"
    }
  }

  const getLocationIcon = (location: string) => {
    if (location.toLowerCase().includes("home")) return "home-outline"
    if (location.toLowerCase().includes("office")) return "business-outline"
    return "location-outline"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <StatusBar
          barStyle={actualTheme === "dark" ? "light-content" : "dark-content"}
        />

        {/* Header */}
        <View
          className="flex-row items-center justify-between px-4 py-4"
          style={{ borderBottomColor: colors.border }}
        >
          <View className="flex-row items-center">
            <ChevronLeft
              size={24}
              color={colors.primary}
              onPress={() => router.back()}
            />
            <Text
              className="text-xl font-groteskBold ml-3"
              style={{ color: colors.text }}
            >
              Devices
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* Current Device Section */}
          <View className="px-4 mt-4">
            <Text
              className="text-lg font-geist mb-3"
              style={{ color: colors.text }}
            >
              Current Device
            </Text>
            {devices
              .filter((device) => device.isCurrent)
              .map((device) => (
                <View
                  key={device.id}
                  className="p-4 rounded-xl mb-4"
                  style={{ backgroundColor: colors.card }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View
                        className="w-12 h-12 rounded-lg items-center justify-center mr-3"
                        style={{ backgroundColor: colors.primary + "20" }}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={colors.primary}
                        />
                      </View>
                      <View>
                        <Text
                          className="text-base font-grotesk"
                          style={{ color: colors.text }}
                        >
                          {device.name}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Ionicons
                            name="wifi-outline"
                            size={12}
                            color={colors.mutedText}
                          />
                          <Text
                            className="text-xs ml-1"
                            style={{ color: colors.mutedText }}
                          >
                            {device.ipAddress}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text
                        className="text-sm font-geist"
                        style={{ color: colors.success }}
                      >
                        Active Now
                      </Text>
                      <Text
                        className="text-xs mt-1 font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        {device.lastActive}
                      </Text>
                    </View>
                  </View>

                  {/* Device Details */}
                  <View className="mt-4 gap-1">
                    <View className="flex-row items-center">
                      <Ionicons
                        name={getLocationIcon(device.location)}
                        size={14}
                        color={colors.mutedText}
                      />
                      <Text
                        className="text-sm ml-2"
                        style={{ color: colors.mutedText }}
                      >
                        {device.location}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={colors.mutedText}
                      />
                      <Text
                        className="text-sm ml-2"
                        style={{ color: colors.mutedText }}
                      >
                        First login: {formatDate(device.firstLogin)}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Ionicons
                        name={getDeviceIcon(device.type)}
                        size={14}
                        color={colors.mutedText}
                      />
                      <Text
                        className="text-sm ml-2"
                        style={{ color: colors.mutedText }}
                      >
                        {device.os} • {device.browser}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
          </View>

          {/* Other Devices Section */}
          {devices.filter((device) => !device.isCurrent).length > 0 && (
            <View className="px-4 mt-2">
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  className="text-lg font-groteskBold"
                  style={{ color: colors.text }}
                >
                  Other Devices ({devices.filter((d) => !d.isCurrent).length})
                </Text>
                <Text
                  className="text-sm font-geist"
                  style={{ color: colors.mutedText }}
                >
                  Tap to manage
                </Text>
              </View>

              {devices
                .filter((device) => !device.isCurrent)
                .map((device) => (
                  <TouchableOpacity
                    key={device.id}
                    activeOpacity={0.7}
                    className="p-4 rounded-xl mb-3"
                    style={{ backgroundColor: colors.card }}
                    onPress={() => handleLogoutDevice(device.id)}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View
                          className="w-12 h-12 rounded-lg items-center justify-center mr-3"
                          style={{ backgroundColor: colors.border }}
                        >
                          <Ionicons
                            name={getDeviceIcon(device.type)}
                            size={24}
                            color={colors.icon}
                          />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center justify-between">
                            <Text
                              className="text-base font-grotesk"
                              style={{ color: colors.text }}
                            >
                              {device.name}
                            </Text>
                          </View>

                          <View className="flex-row items-center mt-1">
                            <Ionicons
                              name="wifi-outline"
                              size={10}
                              color={colors.mutedText}
                            />
                            <Text
                              className="text-xs ml-1 mr-3"
                              style={{ color: colors.mutedText }}
                            >
                              {device.ipAddress}
                            </Text>
                            <Text
                              className="text-xs px-2 py-0.5 rounded font-geist"
                              style={{
                                backgroundColor: colors.border,
                                color: colors.mutedText,
                              }}
                            >
                              {device.os}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleLogoutDevice(device.id)}
                        className="ml-2"
                      >
                        <Ionicons
                          name="log-out-outline"
                          size={20}
                          color={colors.error}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Device Metadata */}
                    <View
                      className="mt-3 pt-3 border-t"
                      style={{ borderTopColor: colors.border }}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Ionicons
                            name="location-outline"
                            size={12}
                            color={colors.mutedText}
                          />
                          <Text
                            className="text-xs ml-1 font-geist"
                            style={{ color: colors.mutedText }}
                          >
                            {device.location}
                          </Text>
                        </View>
                        <Text
                          className="text-xs font-geist"
                          style={{ color: colors.mutedText }}
                        >
                          First: {formatDate(device.firstLogin)}
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between mt-2">
                        <View className="flex-row items-center">
                          <Ionicons
                            name="time-outline"
                            size={12}
                            color={colors.mutedText}
                          />
                          <Text
                            className="text-xs ml-1 font-geist"
                            style={{ color: colors.mutedText }}
                          >
                            Last active: {device.lastActive}
                          </Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => handleTrustDevice(device.id)}
                          className="flex-row items-center"
                        >
                          <Ionicons
                            name={
                              device.isTrusted
                                ? "shield-checkmark"
                                : "shield-outline"
                            }
                            size={14}
                            color={
                              device.isTrusted
                                ? colors.success
                                : colors.mutedText
                            }
                          />
                          <Text
                            className="text-xs ml-1 font-geist"
                            style={{
                              color: device.isTrusted
                                ? colors.success
                                : colors.mutedText,
                            }}
                          >
                            {device.isTrusted ? "Trusted" : "Mark as Trusted"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          )}

          {/* Security Settings */}
          <View className="px-4 mt-6 mb-8">
            <Text
              className="text-lg font-groteskBold mb-4"
              style={{ color: colors.text }}
            >
              Security Settings
            </Text>
            <View
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: colors.card }}
            >
              <View
                className="flex-row items-center justify-between px-4 py-4 border-b"
                style={{ borderBottomColor: colors.border }}
              >
                <View className="flex-1">
                  <Text
                    className="text-base font-medium font-geist"
                    style={{ color: colors.text }}
                  >
                    New Device Alerts
                  </Text>
                  <Text
                    className="text-sm mt-0.5 font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    Get notified when a new IP address logs in
                  </Text>
                </View>
                <IOSToggle
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  // trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View className="flex-row items-center justify-between px-4 py-4">
                <View className="flex-1">
                  <Text
                    className="text-base font-medium font-geist"
                    style={{ color: colors.text }}
                  >
                    Auto-Login on Trusted Devices
                  </Text>
                  <Text
                    className="text-sm mt-0.5 font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    Stay logged in on trusted IP addresses
                  </Text>
                </View>
                <IOSToggle
                  value={autoLoginEnabled}
                  onValueChange={setAutoLoginEnabled}
                  // trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Loading Overlay */}
        {isLoading && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center">
            <View
              className="p-6 rounded-2xl items-center"
              style={{ backgroundColor: colors.card }}
            >
              <ActivityIndicator size="large" color={colors.primary} />
              <Text
                className="mt-3 text-base font-medium"
                style={{ color: colors.text }}
              >
                Loading devices...
              </Text>
            </View>
          </View>
        )}
      </SafeAreaView>
      {/* Alert Modal */}
      <AlertModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        {...alertConfig}
      />
    </>
  )
}

const IOSToggle = ({
  value,
  onValueChange,
  trackColor = {
    false: "#D1D1D6", // inactive/off state
    true: "#FF7A00", // active/on state (orange)
  },
}: {
  value: boolean
  onValueChange: (value: boolean) => void
  trackColor?: {
    false: string
    true: string
  }
}) => {
  const [animation] = useState(new Animated.Value(value ? 1 : 0))
  const [isAnimating, setIsAnimating] = useState(false)

  const handlePress = () => {
    if (isAnimating) return

    setIsAnimating(true)
    const newValue = !value

    Animated.timing(animation, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setIsAnimating(false)
      onValueChange(newValue)
    })
  }

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22], // Thumb movement
  })

  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [trackColor.false, trackColor.true],
  })

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={{ width: 51, height: 31 }}
    >
      <Animated.View
        style={{
          width: 47,
          height: 27,
          borderRadius: 16,
          backgroundColor,
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            width: 24,
            height: 24,
            borderRadius: 13.5,
            backgroundColor: "#FFFFFF",
            transform: [{ translateX }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.5,
            elevation: 2,
          }}
        />
      </Animated.View>
    </TouchableOpacity>
  )
}
