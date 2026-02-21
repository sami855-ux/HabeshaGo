// components/passenger/map/MyTripsSheet.tsx
import { Trip } from "@/types/map"
import { Feather, Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import React from "react"
import {
  Animated,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

interface MyTripsSheetProps {
  trips: Trip[]
  activeTracking: Trip | null
  onStartTracking: (trip: Trip) => void
  onStopTracking: () => void
  onClose: () => void // Add close handler
  animValue: Animated.Value
  colors: any
}

const { height } = Dimensions.get("window")

export const MyTripsSheet = ({
  trips,
  activeTracking,
  onStartTracking,
  onStopTracking,
  onClose,
  animValue,
  colors,
}: MyTripsSheetProps) => {
  const activeTrips = trips.filter((trip) => trip.status === "active")
  const completedTrips = trips.filter((trip) => trip.status === "completed")
  const upcomingTrips = trips.filter((trip) => trip.status === "upcoming")

  const getStatusColor = (status: Trip["status"]) => {
    switch (status) {
      case "active":
        return "#10B981"
      case "upcoming":
        return "#F59E0B"
      case "completed":
        return "#6B7280"
      default:
        return "#6B7280"
    }
  }

  const getStatusBgColor = (status: Trip["status"]) => {
    switch (status) {
      case "active":
        return "#10B98120"
      case "upcoming":
        return "#F59E0B20"
      case "completed":
        return "#6B728020"
      default:
        return "#6B728020"
    }
  }

  const renderTripCard = (trip: Trip, isCompleted = false) => (
    <TouchableOpacity
      key={trip.id}
      className="flex-row items-center p-4 mb-3 rounded-2xl"
      style={{ backgroundColor: colors.background }}
      onPress={() => !isCompleted && onStartTracking(trip)}
      disabled={isCompleted}
      activeOpacity={isCompleted ? 1 : 0.7}
    >
      <View
        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: colors.primary + "20" }}
      >
        <Ionicons name="bus" size={24} color={colors.primary} />
      </View>

      <View className="flex-1">
        <Text
          className="text-base font-semibold font-geist"
          style={{ color: colors.text }}
        >
          {trip.route}
        </Text>
        <Text className="text-xs mt-1" style={{ color: colors.mutedText }}>
          {trip.from} → {trip.to}
        </Text>
        <View className="flex-row items-center mt-2">
          <Feather name="clock" size={12} color={colors.mutedText} />
          <Text
            className="text-xs ml-1 mr-3 font-groteskBold"
            style={{ color: colors.mutedText }}
          >
            {trip.time}
          </Text>
          <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: getStatusBgColor(trip.status) }}
          >
            <Text
              className="text-xs font-semibold font-geist"
              style={{ color: getStatusColor(trip.status) }}
            >
              {trip.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {!isCompleted && (
        <View
          className="px-4 py-2 rounded-lg ml-3"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-semibold text-sm font-geist">
            Track
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )

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
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          height: "100%",
          paddingTop: 16,
          paddingHorizontal: 20,
        }}
      >
        {/* Drag Handle */}
        <View className="items-center mb-2">
          <View
            className="w-12 h-1.5 rounded-full"
            style={{ backgroundColor: colors.border }}
          />
        </View>

        {/* Header with Close Button */}
        <View className="flex-row justify-between items-center mb-5">
          <Text
            className="text-2xl font-groteskBold"
            style={{ color: colors.text }}
          >
            My Trips
          </Text>

          <View className="flex-row items-center gap-3">
            {/* Active trips indicator */}
            <View className="flex-row items-center mr-2">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <Text
                className="text-sm font-geist"
                style={{ color: colors.mutedText }}
              >
                {activeTrips.length} Active
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.background }}
              activeOpacity={0.7}
            >
              <Feather name="x" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Currently tracking */}
        {activeTracking && (
          <View
            className="mb-5 p-4 rounded-xl"
            style={{ backgroundColor: colors.primary + "20" }}
          >
            <Text
              className="text-xs mb-2 font-geist"
              style={{ color: colors.mutedText }}
            >
              Currently Tracking
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text
                  className="text-base font-semibold font-groteskBold"
                  style={{ color: colors.text }}
                >
                  {activeTracking.route}
                </Text>
                <Text
                  className="text-xs mt-1 font-geist"
                  style={{ color: colors.mutedText }}
                >
                  {activeTracking.from} → {activeTracking.to}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onStopTracking}
                className="px-4 py-2 rounded-lg ml-2"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-semibold text-sm font-geist">
                  Stop
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 70 }}
        >
          {/* Active Trips */}
          {activeTrips.length > 0 && (
            <View className="mb-6">
              <Text
                className="text-xs font-semibold mb-3 px-2 font-groteskBold"
                style={{ color: colors.mutedText }}
              >
                ACTIVE TRIPS
              </Text>
              {activeTrips.map((trip) => renderTripCard(trip))}
            </View>
          )}

          {/* Upcoming Trips */}
          {upcomingTrips.length > 0 && (
            <View className="mb-6">
              <Text
                className="text-xs font-semibold mb-3 px-2 font-groteskBold"
                style={{ color: colors.mutedText }}
              >
                UPCOMING TRIPS
              </Text>
              {upcomingTrips.map((trip) => renderTripCard(trip))}
            </View>
          )}

          {/* Completed Trips */}
          {completedTrips.length > 0 && (
            <View className="mb-6">
              <Text
                className="text-xs font-semibold mb-3 px-2 font-groteskBold"
                style={{ color: colors.mutedText }}
              >
                COMPLETED TRIPS
              </Text>
              {completedTrips.map((trip) => renderTripCard(trip, true))}
            </View>
          )}

          {/* Empty State */}
          {trips.length === 0 && (
            <View className="py-12 items-center">
              <Feather name="calendar" size={48} color={colors.mutedText} />
              <Text
                className="mt-4 text-base font-groteskBold"
                style={{ color: colors.mutedText }}
              >
                No trips booked yet
              </Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </Animated.View>
  )
}
