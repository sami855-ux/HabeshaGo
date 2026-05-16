import AlertModal from "@/components/utils/AlertModal"
import { useThemeContext } from "@/context/ThemeContext"
import { removeRefreshToken } from "@/lib/refreshToken"
import { showToast } from "@/lib/showToast"
import { AppDispatch, useAppSelector } from "@/store"
import { logout } from "@/store/slices/userSlice"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  Fingerprint,
  Globe,
  HelpCircle,
  History,
  Lock,
  LogOut,
  MapPin,
  Moon,
  Settings as SettingsIcon,
  Shield,
  ShieldCheck,
  Smartphone,
  Sun,
  Type,
  User,
  Wallet,
  WifiOff,
  Zap,
} from "lucide-react-native"
import React, { useEffect, useState } from "react"
import {
  Alert,
  Animated,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native"
import { useDispatch } from "react-redux"

// Mock user data
const userData = {
  name: "Samuel Tale",
  type: "Passenger",
  id: "ADD-P-234567",
  status: "Active",
  walletBalance: "ETB 1,250.00",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
}

const defaultAvatar = require("@/assets/images/defaultAvater.jpg")

// Custom iOS-style Toggle Component
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

export default function SettingsScreen() {
  const { colors, setTheme, theme: themeMode, actualTheme } = useThemeContext()
  const isDark = actualTheme === "dark"
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useAppSelector((state) => state.user)
  const { wallet } = useAppSelector((state) => state.wallet)

  const router = useRouter()
  const [showThemeModal, setShowThemeModal] = useState(false)

  const [alertVisible, setAlertVisible] = useState(false)
  const [alertConfig, setAlertConfig] = useState({})

  const showAlert = (config) => {
    setAlertConfig(config)
    setAlertVisible(true)
  }

  const [settings, setSettings] = useState({
    // Security
    biometricAuth: true,
    appLock: true,

    // Privacy
    locationSharing: true,
    dataSharing: false,

    // Notifications
    pushNotifications: true,
    sound: true,
    vibration: true,

    // Payments
    biometricPayments: true,
    autoTopUp: false,

    // Accessibility
    hapticFeedback: true,
    voiceCommands: false,

    // Advanced
    smartRoutes: true,
    offlineMode: false,
    gestureControls: true,
  })

  const toggleSetting = async (key: keyof typeof settings) => {
    const newValue = !settings[key]

    if (key === "pushNotifications" && !newValue) {
      const updated = {
        ...settings,
        pushNotifications: false,
        sound: false,
        vibration: false,
      }
      setSettings(updated)
      await AsyncStorage.setItem("notifSettings", JSON.stringify(updated))
      showToast("Push notifications disabled", ToastAndroid.SHORT)
      return
    }

    const updated = { ...settings, [key]: newValue }
    setSettings(updated)
    await AsyncStorage.setItem("notifSettings", JSON.stringify(updated))

    // Toast per setting
    const messages: Record<keyof typeof settings, [string, string]> = {
      pushNotifications: [
        "Push notifications enabled",
        "Push notifications disabled",
      ],
      sound: ["Sound enabled", "Sound disabled"],
      vibration: ["Vibration enabled", "Vibration disabled"],
      biometricAuth: ["Biometric auth enabled", "Biometric auth disabled"],
      appLock: ["App lock enabled", "App lock disabled"],
      locationSharing: [
        "Location sharing enabled",
        "Location sharing disabled",
      ],
      dataSharing: ["Data sharing enabled", "Data sharing disabled"],
      biometricPayments: [
        "Biometric payments enabled",
        "Biometric payments disabled",
      ],
      autoTopUp: ["Auto top-up enabled", "Auto top-up disabled"],
      hapticFeedback: ["Haptic feedback enabled", "Haptic feedback disabled"],
      voiceCommands: ["Voice commands enabled", "Voice commands disabled"],
      smartRoutes: ["Smart routes enabled", "Smart routes disabled"],
      offlineMode: ["Offline mode enabled", "Offline mode disabled"],
      gestureControls: [
        "Gesture controls enabled",
        "Gesture controls disabled",
      ],
    }

    const [onMsg, offMsg] = messages[key] ?? ["Enabled", "Disabled"]
    showToast(newValue ? onMsg : offMsg, ToastAndroid.SHORT)
  }

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: SettingsIcon },
  ]
  const handleLogout = () => {
    showAlert({
      type: "warning",
      title: "Log Out",
      message: "Are you sure you want to log out?",
      primaryButtonText: "Log Out",
      secondaryButtonText: "Cancel",
      onPrimaryPress: async () => {
        // Perform logout logic here
        dispatch(logout())
        router.replace("/(auth)/email")

        showToast("Logged out successfully", ToastAndroid.SHORT)
        await removeRefreshToken()
      },
    })
  }

  useEffect(() => {
    const loadSettings = async () => {
      const saved = await AsyncStorage.getItem("notifSettings")
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings((prev) => ({ ...prev, ...parsed }))
      }
    }
    loadSettings()
  }, [])
  const renderSection = (
    title: string,
    items: {
      icon?: React.ElementType
      label: string
      description?: string
      rightComponent?: React.ReactNode
      onPress?: () => void
      isToggle?: boolean
      toggleValue?: boolean
      toggleKey?: keyof typeof settings
      showArrow?: boolean
      toggleColor?: {
        false: string
        true: string
      }
    }[],
  ) => (
    <View className="mb-2">
      {title && (
        <Text
          className="text-xs font-medium uppercase tracking-wider px-4 py-3 font-groteskBold"
          style={{ color: colors.mutedText }}
        >
          {title}
        </Text>
      )}
      <View
        className="mx-4 rounded-xl overflow-hidden"
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row items-center justify-between px-4 py-3 ${
              index !== items.length - 1 ? "border-b" : ""
            }`}
            style={{
              borderBottomColor:
                index !== items.length - 1 ? colors.border : "transparent",
              borderBottomWidth: index !== items.length - 1 ? 1 : 0,
            }}
            onPress={() => {
              if (item.onPress) {
                item.onPress()
              } else if (item.toggleKey) {
                toggleSetting(item.toggleKey)
              }
            }}
            activeOpacity={item.onPress || item.toggleKey ? 0.7 : 1}
          >
            <View className="flex-row items-center flex-1">
              {item.icon && (
                <View
                  className="w-10 h-10 rounded-lg justify-center items-center mr-3"
                  style={{ backgroundColor: colors.primary + "15" }}
                >
                  <item.icon size={20} color={colors.primary} />
                </View>
              )}
              <View className="flex-1">
                <Text
                  className="font-medium text-[16px] font-geist"
                  style={{ color: colors.text }}
                >
                  {item.label}
                </Text>
                {item.description && (
                  <Text
                    className="text-sm mt-0.5"
                    style={{ color: colors.mutedText }}
                  >
                    {item.description}
                  </Text>
                )}
              </View>
            </View>

            {item.rightComponent ? (
              item.rightComponent
            ) : item.isToggle ? (
              <IOSToggle
                value={item.toggleValue || false}
                onValueChange={() =>
                  item.toggleKey && toggleSetting(item.toggleKey)
                }
                trackColor={
                  item.toggleColor || {
                    false: isDark ? "#3A3A3C" : "#E5E5EA", // inactive/off state
                    true: isDark ? "#FF9F0A" : "#FF7A00", // active/on state (orange)
                  }
                }
              />
            ) : item.showArrow ? (
              <View className="flex-row items-center">
                {item.description && (
                  <Text
                    className="text-sm mr-2"
                    style={{ color: colors.mutedText }}
                  >
                    {item.description}
                  </Text>
                )}
                <ChevronRight size={20} color="#8E8E93" />
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const renderThemeModal = () => (
    <Modal
      visible={showThemeModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowThemeModal(false)}
    >
      <View className="flex-1 justify-end bg-black/50 font-geist">
        <View
          className="rounded-t-3xl"
          style={{ backgroundColor: colors.card }}
        >
          <View
            className="p-5 border-b mb-2"
            style={{ borderBottomColor: colors.border }}
          >
            <Text
              className="text-lg font-semibold text-center font-geist"
              style={{ color: colors.text }}
            >
              Appearance
            </Text>
            <Text
              className="text-sm text-center mt-1 font-geist"
              style={{ color: colors.mutedText }}
            >
              Choose your preferred theme
            </Text>
          </View>

          {themeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = themeMode === option.value

            return (
              <TouchableOpacity
                key={option.value}
                className="flex-row items-center justify-between py-3 px-6"
                onPress={() => {
                  setTheme(option.value as any)
                  setShowThemeModal(false)
                }}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full justify-center items-center mr-4"
                    style={{
                      backgroundColor: isSelected
                        ? colors.primary + "15"
                        : colors.background + "50",
                    }}
                  >
                    <Icon
                      size={20}
                      color={isSelected ? colors.primary : colors.mutedText}
                    />
                  </View>
                  <Text
                    className="font-medium text-[17px] font-geist"
                    style={{
                      color: isSelected ? colors.primary : colors.text,
                    }}
                  >
                    {option.label}
                  </Text>
                </View>
                {isSelected && (
                  <View
                    className="w-6 h-6 rounded-full justify-center items-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Check size={14} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            )
          })}

          <TouchableOpacity
            className="py-4 mx-6 my-4 rounded-xl items-center border font-geist"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            onPress={() => setShowThemeModal(false)}
          >
            <Text
              className="font-semibold text-[17px] font-geist"
              style={{ color: colors.primary }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  return (
    <>
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          {/* Profile Header */}
          <View className="pt-6 pb-6 ">
            <View
              className=" p-6"
              style={{
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.8)",
              }}
            >
              <View className="flex-row items-center">
                <View className="relative">
                  <Image
                    source={
                      user?.avaterUrl ? { uri: user.avaterUrl } : defaultAvatar
                    }
                    className="w-24 h-24 rounded-[34px]"
                  />
                </View>
                <View className="ml-5 flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text
                      className="text-2xl font-geist capitalize
                      "
                      style={{ color: colors.text }}
                    >
                      {user?.name ? user.name : "No username"}
                    </Text>
                  </View>
                  <Text
                    className="text-sm font-medium mb-3 font-jakarta"
                    style={{ color: colors.primary }}
                  >
                    {userData.type}
                  </Text>
                  <View className="flex-row items-center space-x-3">
                    <View className="flex-1">
                      <Text
                        className="text-xs font-medium mb-1"
                        style={{ color: colors.mutedText }}
                      >
                        Account ID
                      </Text>
                      <Text
                        className="text-sm font-semibold font-geist italic"
                        style={{ color: colors.text }}
                      >
                        {userData.id}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-xs font-medium mb-1"
                        style={{ color: colors.mutedText }}
                      >
                        Wallet Balance
                      </Text>
                      <View className="flex-row items-center">
                        <Wallet
                          size={12}
                          color={colors.primary}
                          className="mr-1"
                        />
                        <Text
                          className="text-sm font-groteskBold pl-2"
                          style={{ color: colors.primary }}
                        >
                          {wallet?.balance}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Account */}
          {renderSection("ACCOUNT", [
            {
              icon: User,
              label: "Edit Profile",
              description: "Personal information",
              showArrow: true,
              onPress: () => router.push("/edit-profile"),
            },
            {
              icon: CreditCard,
              label: "Payment Methods",
              description: "Cards & accounts",
              showArrow: true,
              onPress: () => Alert.alert("Payments", "Manage payment methods"),
            },
          ])}

          {/* Security */}
          {renderSection("SECURITY", [
            {
              icon: Shield,
              label: "Privacy & Security",
              description: "Account protection",
              showArrow: true,
              onPress: () => Alert.alert("Security", "Security settings"),
            },
            {
              icon: Lock,
              label: "Logged In Devices",
              description: "Manage devices",
              showArrow: true,
              onPress: () => router.push("/loggedDevice"),
            },
            {
              icon: Fingerprint,
              label: "Biometric Authentication",
              description: "Face ID & Touch ID",
              showArrow: true,
              onPress: () => router.push("/biometric"),
            },
          ])}

          {/* Notifications */}
          {renderSection("NOTIFICATIONS", [
            {
              icon: Bell,
              label: "Push Notifications",
              description: "Enable notifications",
              isToggle: true,
              toggleValue: settings.pushNotifications,
              toggleKey: "pushNotifications",
            },
            {
              icon: Bell,
              label: "Sounds",
              description: "Notification sounds",
              isToggle: true,
              toggleValue: settings.sound,
              toggleKey: "sound",
              toggleColor: {
                false: isDark ? "#3A3A3C" : "#E5E5EA", // inactive/off state
                true: isDark ? "#FF9F0A" : "#FF7A00",
              },
            },
            {
              icon: Bell,
              label: "Vibration",
              description: "Haptic feedback",
              isToggle: true,
              toggleValue: settings.vibration,
              toggleKey: "vibration",
            },
          ])}

          {/* Privacy */}
          {renderSection("PRIVACY", [
            {
              icon: MapPin,
              label: "Location Services",
              description: "Share trip location",
              isToggle: true,
              toggleValue: settings.locationSharing,
              toggleKey: "locationSharing",
            },
            {
              icon: History,
              label: "Clear Trip History",
              description: "Delete travel data",
              showArrow: true,
              onPress: () => Alert.alert("History", "Clear trip history"),
            },
          ])}

          {/* App Settings */}
          {renderSection("APP SETTINGS", [
            {
              icon: isDark ? Moon : Sun,
              label: "Appearance",
              description:
                themeMode === "system"
                  ? "System"
                  : actualTheme.charAt(0).toUpperCase() + actualTheme.slice(1),
              showArrow: true,
              onPress: () => setShowThemeModal(true),
            },
            {
              icon: Type,
              label: "Text Size",
              description: "Medium",
              showArrow: true,
              onPress: () => Alert.alert("Text Size", "Adjust text scaling"),
            },
            {
              icon: Smartphone,
              label: "Haptic Feedback",
              description: "Touch vibrations",
              isToggle: true,
              toggleValue: settings.hapticFeedback,
              toggleKey: "hapticFeedback",
            },
          ])}

          {/* Advanced */}
          {renderSection("ADVANCED", [
            {
              icon: Zap,
              label: "Smart Routes",
              description: "AI suggestions",
              isToggle: true,
              toggleValue: settings.smartRoutes,
              toggleKey: "smartRoutes",
            },
            {
              icon: WifiOff,
              label: "Offline Mode",
              description: "Work without internet",
              isToggle: true,
              toggleValue: settings.offlineMode,
              toggleKey: "offlineMode",
            },
            {
              icon: Smartphone,
              label: "Gesture Controls",
              description: "Swipe gestures",
              isToggle: true,
              toggleValue: settings.gestureControls,
              toggleKey: "gestureControls",
            },
          ])}

          {/* Support */}
          {renderSection("SUPPORT", [
            {
              icon: HelpCircle,
              label: "Help Center",
              description: "Get help",
              showArrow: true,
              onPress: () => Alert.alert("Help", "Help center"),
            },
            {
              icon: ShieldCheck,
              label: "Privacy Policy",
              description: "Read policy",
              showArrow: true,
              onPress: () => Alert.alert("Privacy", "Privacy policy"),
            },
            {
              icon: Globe,
              label: "Terms of Service",
              description: "View terms",
              showArrow: true,
              onPress: () => Alert.alert("Terms", "Terms of service"),
            },
          ])}

          {/* Logout Button */}
          <View className="mx-4 mt-8 mb-8">
            <TouchableOpacity
              className="py-4 rounded-xl flex-row justify-center items-center"
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <LogOut size={20} color="#FF3B30" />
              <Text className="ml-2 font-geist" style={{ color: "#FF3B30" }}>
                Log Out
              </Text>
            </TouchableOpacity>
          </View>

          {/* Version Info */}
          <View className="items-center mb-6">
            <Text className="text-sm mb-1" style={{ color: colors.mutedText }}>
              Addis Pulse
            </Text>
            <Text className="text-xs" style={{ color: colors.mutedText }}>
              Version 1.4.2
            </Text>
          </View>
        </ScrollView>

        {/* Theme Selection Modal */}
        {renderThemeModal()}
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
