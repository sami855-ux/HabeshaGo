import { useThemeContext } from "@/context/ThemeContext"
import {
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  Edit2,
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
import React, { useState } from "react"
import {
  Alert,
  Animated,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

// Mock user data
const userData = {
  name: "Samuel Tale",
  type: "Passenger",
  id: "ADD-P-234567",
  status: "Active",
  walletBalance: "ETB 1,250.00",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
}

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
  const [showThemeModal, setShowThemeModal] = useState(false)

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

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: SettingsIcon },
  ]

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
    }[]
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
            onPress={
              item.onPress ||
              (item.toggleKey
                ? () => toggleSetting(item.toggleKey!)
                : undefined)
            }
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
              // borderWidth: 1,
              // borderColor: isDark
              //   ? "rgba(255, 255, 255, 0.1)"
              //   : "rgba(0, 0, 0, 0.05)",
              // backdropFilter: "blur(10px)",
              // shadowColor: "#000",
              // shadowOffset: { width: 0, height: 4 },
              // shadowOpacity: 0.1,
              // shadowRadius: 12,
              // elevation: 5,
            }}
          >
            <View className="flex-row items-center">
              <View className="relative">
                <Image
                  source={{ uri: userData.avatar }}
                  className="w-24 h-24 rounded-2xl"
                />
                <View
                  className="absolute -top-1 -right-1 w-8 h-8 rounded-full justify-center items-center border-2"
                  style={{
                    backgroundColor: colors.primary,
                    borderColor: colors.card,
                  }}
                >
                  <Edit2 size={12} color="#FFFFFF" />
                </View>
              </View>
              <View className="ml-5 flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text
                    className="text-2xl font-geist"
                    style={{ color: colors.text }}
                  >
                    {userData.name}
                  </Text>
                  <TouchableOpacity className="p-2">
                    <ChevronRight size={20} color={colors.mutedText} />
                  </TouchableOpacity>
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
                        {userData.walletBalance}
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
            onPress: () => Alert.alert("Edit Profile", "Coming soon"),
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
            icon: Fingerprint,
            label: "Biometric Authentication",
            description: "Face ID & Touch ID",
            isToggle: true,
            toggleValue: settings.biometricAuth,
            toggleKey: "biometricAuth",
          },
          {
            icon: Lock,
            label: "App Lock",
            description: "PIN or biometric lock",
            isToggle: true,
            toggleValue: settings.appLock,
            toggleKey: "appLock",
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

        {/* Payments */}
        {renderSection("PAYMENTS", [
          {
            icon: Fingerprint,
            label: "Biometric Payments",
            description: "Fast checkout",
            isToggle: true,
            toggleValue: settings.biometricPayments,
            toggleKey: "biometricPayments",
          },
          {
            icon: Wallet,
            label: "Auto Top-Up",
            description: "Automatic recharge",
            isToggle: true,
            toggleValue: settings.autoTopUp,
            toggleKey: "autoTopUp",
            toggleColor: {
              false: isDark ? "#3A3A3C" : "#E5E5EA",
              true: "#FF9500", // Orange for payment-related toggle
            },
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
            onPress={() =>
              Alert.alert("Logout", "Are you sure you want to logout?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Logout",
                  style: "destructive",
                  onPress: () => console.log("Logout"),
                },
              ])
            }
            activeOpacity={0.7}
          >
            <LogOut size={20} color="#FF3B30" />
            <Text className="ml-2 font-semibold" style={{ color: "#FF3B30" }}>
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
  )
}
