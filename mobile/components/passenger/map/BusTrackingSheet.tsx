import { Bus, Trip } from "@/types/map"
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import React, { useEffect, useState } from "react"
import {
  Animated,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

interface BusTrackingSheetProps {
  selectedBus: Bus | null
  activeTracking: Trip | null
  onClose: () => void
  onStopTracking: () => void
  animValue: Animated.Value
  colors: any
}

const { height } = Dimensions.get("window")

export const BusTrackingSheet = ({
  selectedBus,
  activeTracking,
  onClose,
  onStopTracking,
  animValue,
  colors,
}: BusTrackingSheetProps) => {
  const [eta, setEta] = useState<string>("5 min")
  const [distance, setDistance] = useState<string>("1.2 km")
  const [progress, setProgress] = useState(60)

  useEffect(() => {
    const interval = setInterval(() => {
      setEta(`${Math.floor(Math.random() * 10) + 2} min`)
      setDistance(`${(Math.random() * 2 + 0.5).toFixed(1)} km`)
      setProgress(Math.floor(Math.random() * 40) + 40)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (!selectedBus && !activeTracking) return null

  const bus =
    selectedBus ||
    (activeTracking?.busId
      ? {
          id: activeTracking.busId,
          route: activeTracking.route,
          plateNumber: "AA 12345",
          capacity: 60,
          occupancy: 42,
          status: "active",
          location: { latitude: 0, longitude: 0 },
        }
      : null)

  if (!bus) return null

  const occupancyPercentage = (bus.occupancy / bus.capacity) * 100
  const isOccupancyHigh = occupancyPercentage > 80
  const isOccupancyMedium =
    occupancyPercentage > 50 && occupancyPercentage <= 80

  return (
    <Animated.View
      style={{
        transform: [{ translateY: animValue }],
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.7,
        zIndex: 1000,
      }}
    >
      <LinearGradient
        colors={[colors.card, colors.background]}
        style={{
          borderTopLeftRadius: 38,
          borderTopRightRadius: 38,
          height: "100%",
          paddingTop: 16,
          paddingHorizontal: 20,
        }}
      >
        {/* Drag Handle */}
        <View className="items-center mb-4">
          <View
            className="w-12 h-1.5 rounded-full"
            style={{ backgroundColor: colors.border }}
          />
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <View
              className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
              style={{ backgroundColor: colors.primary + "20" }}
            >
              <Ionicons name="bus" size={32} color={colors.primary} />
            </View>
            <View>
              <Text
                className="text-xl font-groteskBold"
                style={{ color: colors.text }}
              >
                {bus.route}
              </Text>
              <View className="flex-row items-center mt-1">
                <MaterialCommunityIcons
                  name="license"
                  size={14}
                  color={colors.mutedText}
                />
                <Text
                  className="text-sm font-geist ml-1"
                  style={{ color: colors.mutedText }}
                >
                  {bus.plateNumber}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.background }}
            activeOpacity={0.7}
          >
            <Feather name="x" size={20} color={colors.mutedText} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {/* Live Status Card */}
          <View
            className="p-5 rounded-2xl mb-5"
            style={{ backgroundColor: colors.background }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2" />
                <Text
                  className="text-sm font-geist"
                  style={{ color: colors.text }}
                >
                  Live Tracking
                </Text>
              </View>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: colors.primary + "20" }}
              >
                <Text
                  className="text-xs font-geist"
                  style={{ color: colors.primary }}
                >
                  Real-time
                </Text>
              </View>
            </View>

            {/* ETA & Distance Grid */}
            <View className="flex-row mb-5">
              <View className="flex-1">
                <Text
                  className="text-xs font-geist mb-1"
                  style={{ color: colors.mutedText }}
                >
                  Estimated Arrival
                </Text>
                <Text
                  className="text-3xl font-groteskBold"
                  style={{ color: colors.text }}
                >
                  {eta}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  className="text-xs font-geist mb-1"
                  style={{ color: colors.mutedText }}
                >
                  Distance
                </Text>
                <Text
                  className="text-3xl font-groteskBold"
                  style={{ color: colors.text }}
                >
                  {distance}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="mb-4">
              <View className="flex-row justify-between mb-2">
                <View className="flex-row items-center">
                  <Feather name="map-pin" size={12} color={colors.primary} />
                  <Text
                    className="text-xs font-geist ml-1"
                    style={{ color: colors.mutedText }}
                  >
                    {activeTracking?.from || "Bole"}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Feather name="flag" size={12} color={colors.primary} />
                  <Text
                    className="text-xs font-geist ml-1"
                    style={{ color: colors.mutedText }}
                  >
                    {activeTracking?.to || "Merkato"}
                  </Text>
                </View>
              </View>
              <View
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.border }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: colors.primary,
                    width: `${progress}%`,
                  }}
                />
              </View>
            </View>

            {/* Next Stop */}
            <View className="flex-row items-center">
              <Feather name="navigation" size={14} color={colors.primary} />
              <Text
                className="text-sm font-geist ml-2"
                style={{ color: colors.text }}
              >
                Next stop:{" "}
                <Text className="font-groteskBold">Mexico Square</Text>
              </Text>
            </View>
          </View>

          {/* Occupancy Card */}
          <View
            className="p-5 rounded-2xl mb-5"
            style={{ backgroundColor: colors.background }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className="text-base font-groteskBold"
                style={{ color: colors.text }}
              >
                Bus Occupancy
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor: isOccupancyHigh
                    ? "#EF444420"
                    : isOccupancyMedium
                      ? "#F59E0B20"
                      : "#10B98120",
                }}
              >
                <Text
                  className="text-xs font-geist"
                  style={{
                    color: isOccupancyHigh
                      ? "#EF4444"
                      : isOccupancyMedium
                        ? "#F59E0B"
                        : "#10B981",
                  }}
                >
                  {isOccupancyHigh
                    ? "Full"
                    : isOccupancyMedium
                      ? "Moderate"
                      : "Available"}
                </Text>
              </View>
            </View>

            <View className="mb-3">
              <View className="flex-row justify-between mb-2">
                <Text
                  className="text-sm font-geist"
                  style={{ color: colors.text }}
                >
                  {bus.occupancy} / {bus.capacity} seats
                </Text>
                <Text
                  className="text-sm font-groteskBold"
                  style={{ color: colors.text }}
                >
                  {Math.round(occupancyPercentage)}%
                </Text>
              </View>
              <View
                className="h-2.5 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.border }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: isOccupancyHigh
                      ? "#EF4444"
                      : isOccupancyMedium
                        ? "#F59E0B"
                        : "#10B981",
                    width: `${occupancyPercentage}%`,
                  }}
                />
              </View>
            </View>

            <View className="flex-row justify-between mt-2">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                <Text
                  className="text-xs font-geist"
                  style={{ color: colors.mutedText }}
                >
                  Available
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                <Text
                  className="text-xs font-geist"
                  style={{ color: colors.mutedText }}
                >
                  Reserved
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                <Text
                  className="text-xs font-geist"
                  style={{ color: colors.mutedText }}
                >
                  Occupied
                </Text>
              </View>
            </View>
          </View>

          {/* Driver Info */}
          <View
            className="p-5 rounded-2xl mb-5 flex-row items-center"
            style={{ backgroundColor: colors.background }}
          >
            <View
              className="w-14 h-14 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: colors.primary + "20" }}
            >
              <Feather name="user" size={24} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text
                className="text-base font-groteskBold"
                style={{ color: colors.text }}
              >
                Abebe Kebede
              </Text>
              <Text
                className="text-xs font-geist mt-1"
                style={{ color: colors.mutedText }}
              >
                Driver • 5 years experience
              </Text>
              <View className="flex-row items-center mt-2">
                <View className="flex-row mr-2">
                  <Feather name="star" size={12} color="#FBBF24" />
                  <Feather name="star" size={12} color="#FBBF24" />
                  <Feather name="star" size={12} color="#FBBF24" />
                  <Feather name="star" size={12} color="#FBBF24" />
                  <Feather name="star" size={12} color="#D1D5DB" />
                </View>
                <Text
                  className="text-xs font-geist"
                  style={{ color: colors.mutedText }}
                >
                  4.8
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-4 mb-6">
            <TouchableOpacity
              className="flex-1 py-4 rounded-xl items-center justify-center flex-row"
              style={{ backgroundColor: colors.primary }}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <Feather name="share-2" size={20} color="#FFFFFF" />
              <Text className="text-white font-geist font-semibold ml-2">
                Share
              </Text>
            </TouchableOpacity>

            {activeTracking ? (
              <TouchableOpacity
                className="flex-1 py-4 rounded-xl items-center justify-center flex-row"
                style={{ backgroundColor: "#EF4444" }}
                onPress={onStopTracking}
                activeOpacity={0.7}
              >
                <Feather name="stop-circle" size={20} color="#FFFFFF" />
                <Text className="text-white font-geist font-semibold ml-2">
                  Stop
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="flex-1 py-4 rounded-xl items-center justify-center flex-row"
                style={{ backgroundColor: colors.primary + "20" }}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <Feather name="bell" size={20} color={colors.primary} />
                <Text
                  className="font-geist font-semibold ml-2"
                  style={{ color: colors.primary }}
                >
                  Notify
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </Animated.View>
  )
}
