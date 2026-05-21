import React, { useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Image,
} from "react-native"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { StatusBar } from "expo-status-bar"
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, router } from "expo-router"
import { getTripDetails } from "@/service/driver"
import { axiosInstance } from "@/service/axiosInstance"

const { width, height } = Dimensions.get("window")

const ActiveTripScreen = () => {
  const {
    busId,
    scheduleId,
    tripData: initialTripData,
  } = useLocalSearchParams()
  const queryClient = useQueryClient()

  console.log(busId, scheduleId, "bus")

  const [selectedTab, setSelectedTab] = useState("overview")
  const [showEndTripModal, setShowEndTripModal] = useState(false)

  // React Query for trip details
  const {
    data: tripResponse,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["tripDetails", busId, scheduleId],
    queryFn: () => getTripDetails(parseInt(busId), parseInt(scheduleId)),
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 2,
  })

  // End trip mutation
  const endTripMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.put("/drivers/trips/active/end")
      return response.data
    },
    onSuccess: (response) => {
      if (response.success) {
        Alert.alert(
          "Trip Ended",
          "Your trip has been completed successfully!",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(driver)/tabs"),
            },
          ],
        )
      }
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to end trip. Please try again.")
    },
  })

  const tripData = tripResponse?.data
  const isSuccess = tripResponse?.success

  // Loading State
  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <StatusBar style="dark" />
        <View className="flex-1 justify-center items-center">
          <View className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 justify-center items-center mb-4">
            <ActivityIndicator size="large" color="#ea580c" />
          </View>
          <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Loading Trip...
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            Fetching trip details
          </Text>
        </View>
      </View>
    )
  }

  // Error State
  if (error || !isSuccess) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <StatusBar style="dark" />
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 justify-center items-center mb-4">
            <Ionicons name="alert-circle" size={40} color="#ef4444" />
          </View>
          <Text className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Failed to Load Trip
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            {error?.response?.data?.message ||
              error?.message ||
              "Unable to fetch trip details"}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-orange-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-3 px-6 py-3 rounded-xl"
          >
            <Text className="text-gray-500 font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Stats Cards
  const statCards = [
    {
      icon: <Ionicons name="people" size={20} color="#ea580c" />,
      value: tripData?.passengers?.total || 0,
      label: "Passengers",
      subLabel: `Checked: ${tripData?.passengers?.checkedIn || 0}`,
    },
    {
      icon: <MaterialIcons name="event-seat" size={20} color="#ea580c" />,
      value: tripData?.seats?.occupied || 0,
      label: "Seats Taken",
      subLabel: `/${tripData?.seats?.total || 0}`,
    },
    {
      icon: <FontAwesome5 name="money-bill" size={18} color="#ea580c" />,
      value: `${tripData?.revenue?.total || 0}`,
      label: "Revenue",
      subLabel: tripData?.revenue?.currency || "ETB",
    },
    {
      icon: <Ionicons name="speedometer" size={20} color="#ea580c" />,
      value: `${tripData?.bus?.currentLocation?.speed || 0}`,
      label: "Speed",
      subLabel: "km/h",
    },
  ]

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style="light" />

      {/* Header with Gradient */}
      <LinearGradient
        colors={["#ea580c", "#c2410c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="pt-12 pb-4 px-4"
      >
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/20 justify-center items-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Active Trip</Text>
          <TouchableOpacity
            onPress={() => setShowEndTripModal(true)}
            className="px-3 py-1.5 rounded-full bg-red-500"
          >
            <Text className="text-white text-xs font-semibold">End Trip</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={["#ea580c"]}
          />
        }
      >
        {/* Bus Info Card */}
        <View className="bg-white dark:bg-gray-800 mx-4 -mt-4 rounded-2xl p-4 shadow-lg">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-gray-500 dark:text-gray-400 text-xs">
                Bus Number
              </Text>
              <Text className="text-2xl font-bold text-gray-800 dark:text-white">
                {tripData?.bus?.busNumber}
              </Text>
              <Text className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                {tripData?.bus?.route?.origin} →{" "}
                {tripData?.bus?.route?.destination}
              </Text>
            </View>
            <View className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-full">
              <Text className="text-orange-600 dark:text-orange-400 text-xs font-semibold">
                {tripData?.schedule?.startTime} - {tripData?.schedule?.endTime}
              </Text>
            </View>
          </View>

          {/* Driver Info */}
          <View className="flex-row items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 justify-center items-center">
              {tripData?.driver?.avatar ? (
                <Image
                  source={{ uri: tripData.driver.avatar }}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <Ionicons name="person" size={20} color="#666" />
              )}
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-gray-800 dark:text-white font-semibold">
                {tripData?.driver?.name}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs">
                {tripData?.driver?.experience} years experience
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text className="text-gray-800 dark:text-white ml-1 font-semibold">
                {tripData?.bus?.averageRating || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards ScrollView */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {statCards.map((card, index) => (
            <View
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-3 mr-3"
              style={{ width: 110 }}
            >
              <View className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 justify-center items-center mb-2">
                {card.icon}
              </View>
              <Text className="text-xl font-bold text-gray-800 dark:text-white">
                {card.value}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {card.label}
              </Text>
              <Text className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                {card.subLabel}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Tabs */}
        <View className="flex-row mx-4 mt-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {["overview", "seats", "passengers"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              className={`flex-1 py-2.5 rounded-lg ${selectedTab === tab ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`}
            >
              <Text
                className={`text-center font-semibold capitalize ${
                  selectedTab === tab
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View className="px-4 pt-4 pb-8">
          {selectedTab === "overview" && (
            <View>
              {/* Location Info */}
              <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
                <Text className="text-gray-800 dark:text-white font-semibold mb-3">
                  Current Location
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="location" size={24} color="#ea580c" />
                  <View className="ml-2 flex-1">
                    <Text className="text-gray-600 dark:text-gray-300">
                      Lat:{" "}
                      {tripData?.bus?.currentLocation?.latitude?.toFixed(6)}
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-300">
                      Lng:{" "}
                      {tripData?.bus?.currentLocation?.longitude?.toFixed(6)}
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-xs">
                    {tripData?.bus?.currentLocation?.timestamp
                      ? new Date(
                          tripData.bus.currentLocation.timestamp,
                        ).toLocaleTimeString()
                      : "N/A"}
                  </Text>
                </View>
              </View>

              {/* Route Info */}
              <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
                <Text className="text-gray-800 dark:text-white font-semibold mb-3">
                  Route Information
                </Text>
                <View className="flex-row justify-between">
                  <View className="items-center flex-1">
                    <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 justify-center items-center">
                      <Ionicons
                        name="location-start"
                        size={16}
                        color="#10b981"
                      />
                    </View>
                    <Text className="text-xs text-gray-500 mt-1">Origin</Text>
                    <Text className="text-sm font-semibold text-gray-800 dark:text-white text-center">
                      {tripData?.bus?.route?.origin}
                    </Text>
                  </View>
                  <View className="flex-1 items-center">
                    <View className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 justify-center items-center">
                      <Ionicons
                        name="swap-horizontal"
                        size={16}
                        color="#ea580c"
                      />
                    </View>
                    <Text className="text-xs text-gray-500 mt-1">Distance</Text>
                    <Text className="text-sm font-semibold text-gray-800 dark:text-white">
                      {tripData?.bus?.route?.distanceKm} km
                    </Text>
                  </View>
                  <View className="items-center flex-1">
                    <View className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 justify-center items-center">
                      <Ionicons name="location-end" size={16} color="#ef4444" />
                    </View>
                    <Text className="text-xs text-gray-500 mt-1">
                      Destination
                    </Text>
                    <Text className="text-sm font-semibold text-gray-800 dark:text-white text-center">
                      {tripData?.bus?.route?.destination}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Occupancy Card */}
              <View className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <Text className="text-gray-800 dark:text-white font-semibold mb-2">
                  Occupancy Rate
                </Text>
                <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-orange-500 rounded-full"
                    style={{
                      width: `${tripData?.passengers?.occupancyRate || 0}%`,
                    }}
                  />
                </View>
                <View className="flex-row justify-between mt-2">
                  <Text className="text-xs text-gray-500">
                    {tripData?.seats?.occupied} / {tripData?.seats?.total} seats
                  </Text>
                  <Text className="text-xs font-semibold text-orange-600">
                    {tripData?.passengers?.occupancyRate || 0}% full
                  </Text>
                </View>
              </View>
            </View>
          )}

          {selectedTab === "seats" && (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <Text className="text-gray-800 dark:text-white font-semibold mb-4">
                Seat Map
              </Text>
              <View className="flex-row flex-wrap justify-center">
                {tripData?.seats?.seatMap?.map((seat) => (
                  <View
                    key={seat.seatNumber}
                    className={`w-12 h-12 m-1 rounded-lg justify-center items-center ${
                      seat.isOccupied
                        ? seat.status === "CHECKED_IN"
                          ? "bg-green-500"
                          : "bg-orange-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        seat.isOccupied
                          ? "text-white"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {seat.seatNumber}
                    </Text>
                    {seat.isOccupied && seat.status === "CHECKED_IN" && (
                      <Ionicons name="checkmark" size={10} color="white" />
                    )}
                  </View>
                ))}
              </View>
              <View className="flex-row justify-center mt-4 gap-4">
                <View className="flex-row items-center">
                  <View className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mr-2" />
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    Available
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-4 h-4 bg-orange-500 rounded mr-2" />
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    Booked
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-4 h-4 bg-green-500 rounded mr-2" />
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    Checked In
                  </Text>
                </View>
              </View>
            </View>
          )}

          {selectedTab === "passengers" && (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-800 dark:text-white font-semibold">
                  Passenger List
                </Text>
                <Text className="text-orange-600 text-sm font-semibold">
                  {tripData?.passengers?.checkedIn}/
                  {tripData?.passengers?.total} Checked In
                </Text>
              </View>

              {tripData?.passengers?.list?.length > 0 ? (
                tripData.passengers.list.map((passenger, index) => (
                  <View
                    key={index}
                    className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-700"
                  >
                    <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 justify-center items-center">
                      {passenger.avatar ? (
                        <Image
                          source={{ uri: passenger.avatar }}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <Ionicons name="person" size={20} color="#666" />
                      )}
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className="text-gray-800 dark:text-white font-semibold">
                        {passenger.name}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        Seat {passenger.seatNumber}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      {passenger.checkedIn ? (
                        <View className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          <Text className="text-green-600 dark:text-green-400 text-xs font-semibold">
                            Checked In
                          </Text>
                        </View>
                      ) : (
                        <View className="bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                          <Text className="text-orange-600 dark:text-orange-400 text-xs font-semibold">
                            Pending
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View className="py-12 items-center">
                  <Ionicons name="people-outline" size={48} color="#9ca3af" />
                  <Text className="text-gray-400 text-center mt-2">
                    No passengers yet
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* End Trip Modal */}
      <Modal
        visible={showEndTripModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEndTripModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full">
            <View className="items-center mb-4">
              <View className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 justify-center items-center">
                <Ionicons name="warning" size={28} color="#ef4444" />
              </View>
            </View>
            <Text className="text-xl font-bold text-gray-800 dark:text-white text-center mb-2">
              End Trip?
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
              Are you sure you want to end this trip? This action cannot be
              undone.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowEndTripModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-200 dark:bg-gray-700"
              >
                <Text className="text-gray-800 dark:text-white text-center font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowEndTripModal(false)
                  endTripMutation.mutate()
                }}
                className="flex-1 py-3 rounded-xl bg-red-500"
                disabled={endTripMutation.isPending}
              >
                {endTripMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold">
                    End Trip
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default ActiveTripScreen
