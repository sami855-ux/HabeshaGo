import { useThemeContext } from "@/context/ThemeContext"
import {
  Bike,
  Bus,
  Car,
  ChevronRight,
  Clock,
  History,
  MapPin,
  Navigation,
  QrCode,
  Route,
  Search,
  Train,
  TrendingUp as TrendingIcon,
  X,
  Zap,
} from "lucide-react-native"
import React, { useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

const { width } = Dimensions.get("window")

const SearchPage = () => {
  const { colors, actualTheme } = useThemeContext()
  const isDark = actualTheme === "dark"

  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const scrollY = useRef(new Animated.Value(0)).current

  const categories = [
    { id: "all", label: "All", icon: Search },
    { id: "bus", label: "Bus", icon: Bus },
    { id: "train", label: "Train", icon: Train },
    { id: "taxi", label: "Taxi", icon: Car },
    { id: "bike", label: "Bike", icon: Bike },
    { id: "parking", label: "Parking", icon: MapPin },
  ]

  const recentSearches = [
    { id: "1", icon: MapPin, text: "Nearby bus stations", time: "10 min ago" },
    { id: "2", icon: Bus, text: "Light rail schedule", time: "1 hour ago" },
    { id: "3", icon: TrendingIcon, text: "Traffic updates", time: "Yesterday" },
    {
      id: "4",
      icon: Navigation,
      text: "Route to Bole Airport",
      time: "2 days ago",
    },
  ]

  const trendingSearches = [
    {
      id: "1",
      name: "Electric taxi services",
      trend: "trending",
      description: "New eco-friendly options",
      icon: Zap,
      color: "#FF6B35",
    },
    {
      id: "2",
      name: "Smart parking zones",
      trend: "popular",
      description: "Real-time availability",
      icon: MapPin,
      color: "#4ECDC4",
    },
    {
      id: "3",
      name: "Bus route 12",
      trend: "rising",
      description: "Megenagna–CMC route",
      icon: Route,
      color: "#45B7D1",
    },
    {
      id: "4",
      name: "E-bike rentals",
      trend: "new",
      description: "Station locations",
      icon: Bike,
      color: "#96CEB4",
    },
  ]

  const quickActions = [
    { icon: Navigation, label: "Live Location", color: "#FF6B35" },
    { icon: QrCode, label: "Scan QR", color: "#45B7D1" },
    { icon: Route, label: "Plan Route", color: "#4ECDC4" },
    { icon: Clock, label: "Schedule", color: "#FFD166" },
  ]

  const clearSearch = () => setSearchQuery("")

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  })

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: "clamp",
  })

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <View className="px-6  pb-4 pt-12">
          <Animated.View
            style={{
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            }}
          >
            <View className="mb-6">
              <Text
                className="text-4xl font-black mb-2 font-groteskBold"
                style={{ color: colors.text }}
              >
                Where to?
              </Text>
              <Text
                className="text-base font-geist"
                style={{ color: colors.mutedText }}
              >
                Find transport, routes, and smart city updates
              </Text>
            </View>
          </Animated.View>

          {/* Search Bar */}
          <View className="mb-6">
            <View
              className="rounded-2xl px-4 py-2 flex-row items-center"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.04)",
                borderWidth: 1,
                borderColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
              }}
            >
              <Search size={22} color={colors.mutedText} />
              <TextInput
                className="flex-1 ml-3 text-base"
                style={{ color: colors.text }}
                placeholder="Search for transport, routes, or stations..."
                placeholderTextColor={colors.mutedText}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} className="p-1">
                  <X size={20} color={colors.mutedText} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View className="mb-8">
            <Text
              className="text-lg font-groteskBold mb-4"
              style={{ color: colors.text }}
            >
              Quick Actions
            </Text>
            <View className="flex-row justify-between">
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  className="items-center w-20"
                  activeOpacity={0.7}
                >
                  <View
                    className="w-16 h-16 rounded-2xl justify-center items-center mb-2"
                    style={{ backgroundColor: action.color + "20" }}
                  >
                    <action.icon size={24} color={action.color} />
                  </View>
                  <Text
                    className="text-xs font-medium text-center font-geist"
                    style={{ color: colors.text }}
                    numberOfLines={2}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Recent Searches */}
        <View className="px-6 mb-10">
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-xl justify-center items-center mr-3"
                style={{ backgroundColor: colors.primary + "15" }}
              >
                <History size={20} color={colors.primary} />
              </View>
              <View>
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  Recent Searches
                </Text>
                <Text className="text-sm" style={{ color: colors.mutedText }}>
                  Your recent activities
                </Text>
              </View>
            </View>
            <TouchableOpacity>
              <Text className="font-medium" style={{ color: colors.primary }}>
                Clear all
              </Text>
            </TouchableOpacity>
          </View>

          <View
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF",
              borderWidth: 1,
              borderColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)",
            }}
          >
            {recentSearches.map((item, index) => {
              const Icon = item.icon

              return (
                <TouchableOpacity
                  key={item.id}
                  className={`flex-row items-center justify-between p-4 ${
                    index !== recentSearches.length - 1 ? "border-b" : ""
                  }`}
                  style={{
                    borderBottomColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                    borderBottomWidth:
                      index !== recentSearches.length - 1 ? 1 : 0,
                  }}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-10 h-10 rounded-lg justify-center items-center mr-3"
                      style={{ backgroundColor: colors.primary + "10" }}
                    >
                      <Icon size={18} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="font-medium font-geist"
                        style={{ color: colors.text }}
                      >
                        {item.text}
                      </Text>
                      <Text
                        className="text-xs mt-1"
                        style={{ color: colors.mutedText }}
                      >
                        {item.time}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity className="p-2">
                    <ChevronRight size={18} color={colors.mutedText} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Bottom Padding */}
        <View className="h-20" />
      </Animated.ScrollView>

      {/* Floating Search Bar (Appears on scroll) */}
      <Animated.View
        className="absolute top-0 left-0 right-0 px-6 pt-6"
        style={{
          opacity: scrollY.interpolate({
            inputRange: [50, 100],
            outputRange: [0, 1],
            extrapolate: "clamp",
          }),
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [0, 100],
                outputRange: [-60, 0],
                extrapolate: "clamp",
              }),
            },
          ],
        }}
      >
        <View
          className="rounded-2xl p-3 flex-row items-center mt-4"
          style={{
            backgroundColor: isDark
              ? "rgba(28,28,30,0.95)"
              : "rgba(255,255,255,0.95)",
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Search size={20} color={colors.mutedText} />
          <TextInput
            className="flex-1 ml-3 text-base"
            style={{ color: colors.text }}
            placeholder="Search..."
            placeholderTextColor={colors.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} className="p-1">
              <X size={18} color={colors.mutedText} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  )
}

export default SearchPage
