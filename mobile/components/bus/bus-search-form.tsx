import { useThemeContext } from "@/context/ThemeContext"
import { useGetAllMidpoints } from "@/hooks/useGetAllMidpoints"
import { cn } from "@/lib/utils"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { format } from "date-fns"
import React, { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native"

// Toast utility
const showToast = (message: string, duration: number = ToastAndroid.SHORT) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, duration)
  } else {
    Alert.alert("Info", message)
  }
}

// Generate time slots in 30-minute intervals
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const period = hour >= 12 ? "PM" : "AM"
      const hour12 = hour % 12 || 12
      const formattedMinute = minute.toString().padStart(2, "0")
      slots.push({
        label: `${hour12}:${formattedMinute} ${period}`,
        value: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      })
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

interface BusSearchFormProps {
  onSearch: (data: {
    from: string
    to: string
    date: Date
    time: string
    passengers: number
  }) => void
  isLoading: boolean
}

export default function BusSearchForm({
  onSearch,
  isLoading,
}: BusSearchFormProps) {
  const { colors } = useThemeContext()

  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState<string>("")
  const [passengers, setPassengers] = useState(1)
  const [isSwapping, setIsSwapping] = useState(false)
  const [showFromModal, setShowFromModal] = useState(false)
  const [showToModal, setShowToModal] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [fieldError, setFieldError] = useState<{
    from?: string
    to?: string
    date?: string
    time?: string
  }>({})

  // Modal states
  const [searchQuery, setSearchQuery] = useState("")
  const [lastTap, setLastTap] = useState<number | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const flatListRef = useRef<FlatList>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  // Fetch midpoints using React Query
  const {
    data: cities = [],
    isLoading: isLoadingCities,
    error: citiesError,
    refetch: refetchCities,
  } = useGetAllMidpoints()

  // Filter out selected destination from from list and vice versa
  const availableFromCities = cities.filter((city: string) => city !== to)
  const availableToCities = cities.filter((city: string) => city !== from)

  // Validate date and time
  const validateDateTime = (
    selectedDate: Date,
    selectedTime: string,
  ): boolean => {
    if (!selectedDate || !selectedTime) return false

    const now = new Date()
    const selectedDateTime = new Date(selectedDate)

    const [hours, minutes] = selectedTime.split(":").map(Number)
    selectedDateTime.setHours(hours, minutes, 0, 0)

    const nowWithoutTime = new Date(now)
    nowWithoutTime.setHours(0, 0, 0, 0)

    const selectedWithoutTime = new Date(selectedDateTime)
    selectedWithoutTime.setHours(0, 0, 0, 0)

    if (selectedWithoutTime.getTime() === nowWithoutTime.getTime()) {
      return selectedDateTime > now
    }

    return selectedDateTime > now
  }

  // Validate all fields
  useEffect(() => {
    const errors: { from?: string; to?: string; date?: string; time?: string } =
      {}

    if (from && to && from === to) {
      errors.from = "Departure and destination cannot be the same"
      errors.to = "Departure and destination cannot be the same"
    }

    if (date && time) {
      if (!validateDateTime(date, time)) {
        errors.time = "Selected time must be in the future"
        errors.date = "Please select a valid future date and time"
      }
    }

    setFieldError(errors)
  }, [from, to, date, time])

  const handleSubmit = () => {
    // Validate all fields before submission
    if (!from || !to || !date || !time || passengers < 1) {
      showToast("Please fill in all required fields")
      return
    }

    if (from === to) {
      showToast("Departure and destination cannot be the same")
      setFieldError({
        from: "Departure and destination cannot be the same",
        to: "Departure and destination cannot be the same",
      })
      return
    }

    if (!validateDateTime(date, time)) {
      showToast("Please select a future date and time for your journey")
      return
    }

    onSearch({ from, to, date, time, passengers })
  }

  const swapLocations = () => {
    if (from && to) {
      setIsSwapping(true)

      setTimeout(() => {
        const temp = from
        setFrom(to)
        setTo(temp)
        setIsSwapping(false)
        showToast(`Now traveling from ${to} to ${from}`)
      }, 300)
    }
  }

  const incrementPassengers = () => {
    if (passengers < 5) {
      setPassengers((p) => p + 1)
    }
  }

  const decrementPassengers = () => {
    if (passengers > 1) {
      setPassengers((p) => p - 1)
    }
  }

  const isFormValid =
    from &&
    to &&
    date &&
    time &&
    passengers > 0 &&
    from !== to &&
    validateDateTime(date, time)

  // Handle city selection with double tap
  const handleCitySelect = (
    city: string,
    onSelect: (city: string) => void,
    title: string,
    onClose: () => void,
  ) => {
    const now = Date.now()

    // Check for double tap (within 300ms)
    if (lastTap && now - lastTap < 300) {
      // Double tap detected - unselect if it's the selected city
      if (city === (title === "Departure City" ? from : to)) {
        onSelect("")
        showToast(`${city} unselected`)
      }
      setLastTap(null)
    } else {
      // Single tap
      setLastTap(now)

      // If it's a different city, select it
      if (city !== (title === "Departure City" ? from : to)) {
        onSelect(city)

        // Add to recent searches
        setRecentSearches((prev) => {
          const updated = [city, ...prev.filter((c) => c !== city)].slice(0, 5)
          return updated
        })

        showToast(`${city} selected as ${title.toLowerCase()}`)
        setTimeout(() => onClose(), 300)
      }
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
  }

  // Render city selection modal
  const renderCityModal = (
    visible: boolean,
    onClose: () => void,
    onSelect: (city: string) => void,
    availableCities: string[],
    selectedCity: string,
    title: string,
  ) => {
    // Filter cities based on search
    const filteredCities = availableCities.filter((city) =>
      city.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Group cities by first letter for sections
    const groupedCities = filteredCities.reduce(
      (acc: { [key: string]: string[] }, city) => {
        const firstLetter = city.charAt(0).toUpperCase()
        if (!acc[firstLetter]) {
          acc[firstLetter] = []
        }
        acc[firstLetter].push(city)
        return acc
      },
      {},
    )

    const sortedSections = Object.keys(groupedCities).sort()

    // Scroll to selected item
    useEffect(() => {
      if (visible && selectedCity && flatListRef.current) {
        const timeoutId = setTimeout(() => {
          if (!visible) return

          const index = filteredCities.findIndex(
            (city) => city === selectedCity,
          )

          if (index !== -1 && index < filteredCities.length) {
            try {
              flatListRef.current?.scrollToIndex({
                index,
                animated: true,
                viewPosition: 0.5,
              })
            } catch (error) {
              setTimeout(() => {
                flatListRef.current?.scrollToOffset({
                  offset: index * 60,
                  animated: true,
                })
              }, 100)
            }
          }
        }, 400)

        return () => clearTimeout(timeoutId)
      }
    }, [visible, selectedCity, filteredCities.length])

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/50">
          <View
            style={{ backgroundColor: colors.background }}
            className="flex-1 mt-20 rounded-t-3xl overflow-hidden"
          >
            {/* Header */}
            <View
              className="px-6 pt-6 pb-4 border-b"
              style={{ borderColor: colors.border }}
            >
              <View className="flex-row justify-between items-center mb-4">
                <Text
                  style={{ color: colors.text }}
                  className="text-2xl font-groteskBold"
                >
                  {title}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={{ backgroundColor: colors.card }}
                  className="w-10 h-10 rounded-full justify-center items-center"
                >
                  <Ionicons name="close" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Search Bar - iOS Style */}
              <View className="relative">
                <View
                  style={{
                    backgroundColor: colors.card,
                  }}
                  className="flex-row items-center rounded-xl px-4 py-3.5"
                >
                  <Ionicons name="search" size={18} color={colors.mutedText} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search cities"
                    placeholderTextColor={colors.mutedText}
                    style={{ color: colors.text }}
                    className="flex-1 ml-3 text-base font-geist"
                    autoFocus={false}
                    returnKeyType="search"
                    clearButtonMode="never"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={clearSearch}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={colors.mutedText}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Search Results Count */}
                {searchQuery.length > 0 && (
                  <View className="absolute -bottom-6 right-1">
                    <Text
                      style={{ color: colors.mutedText }}
                      className="text-xs font-geist"
                    >
                      {filteredCities.length} results
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Content */}
            {isLoadingCities ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                  style={{ color: colors.mutedText }}
                  className="mt-4 font-geist"
                >
                  Loading cities...
                </Text>
              </View>
            ) : citiesError ? (
              <View className="flex-1 justify-center items-center px-6">
                <View
                  style={{ backgroundColor: colors.error + "20" }}
                  className="w-20 h-20 rounded-full justify-center items-center mb-4"
                >
                  <Ionicons
                    name="alert-circle"
                    size={40}
                    color={colors.error}
                  />
                </View>
                <Text
                  style={{ color: colors.text }}
                  className="text-xl font-groteskBold text-center mb-2"
                >
                  Oops! Something went wrong
                </Text>
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-center mb-8 font-geist"
                >
                  We couldn't load the cities list. Please try again.
                </Text>
                <TouchableOpacity
                  onPress={() => refetchCities()}
                  style={{ backgroundColor: colors.primary }}
                  className="px-8 py-4 rounded-xl"
                >
                  <Text className="text-white font-semibold font-geist">
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={sortedSections}
                keyExtractor={(letter) => letter}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                // stickySectionHeadersEnabled={true}
                ListHeaderComponent={
                  <>
                    {/* Recent Searches */}
                    {searchQuery === "" && recentSearches.length > 0 && (
                      <View className="px-6 py-4">
                        <Text
                          style={{ color: colors.mutedText }}
                          className="text-xs font-medium uppercase tracking-wider mb-3"
                        >
                          Recent
                        </Text>
                        <View className="flex-row flex-wrap">
                          {recentSearches.map((city) => (
                            <TouchableOpacity
                              key={city}
                              onPress={() => {
                                handleCitySelect(city, onSelect, title, onClose)
                              }}
                              style={{
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                              }}
                              className="flex-row items-center mr-2 mb-2 px-4 py-2.5 rounded-full border"
                            >
                              <Ionicons
                                name="time-outline"
                                size={14}
                                color={colors.mutedText}
                              />
                              <Text
                                style={{ color: colors.text }}
                                className="text-sm font-geist ml-1.5"
                              >
                                {city}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Divider */}
                    {searchQuery === "" && recentSearches.length > 0 && (
                      <View
                        className="h-[1px] mx-6 my-2"
                        style={{ backgroundColor: colors.border }}
                      />
                    )}
                  </>
                }
                ListEmptyComponent={
                  <View className="justify-center items-center py-16 px-6">
                    <View
                      style={{ backgroundColor: colors.card }}
                      className="w-20 h-20 rounded-2xl justify-center items-center mb-4"
                    >
                      <Ionicons
                        name="search-outline"
                        size={32}
                        color={colors.mutedText}
                      />
                    </View>
                    <Text
                      style={{ color: colors.text }}
                      className="text-lg font-groteskBold text-center mb-1"
                    >
                      No cities found
                    </Text>
                    <Text
                      style={{ color: colors.mutedText }}
                      className="text-center font-geist"
                    >
                      Try searching with a different name
                    </Text>
                  </View>
                }
                renderItem={({ item: letter }) => (
                  <View className="px-6">
                    {/* Section Header - Sticky */}
                    <View
                      style={{
                        backgroundColor: colors.background,
                        borderBottomColor: colors.border,
                      }}
                      className="py-2 border-b"
                    >
                      <Text
                        style={{ color: colors.primary }}
                        className="text-sm font-groteskBold"
                      >
                        {letter}
                      </Text>
                    </View>

                    {/* Cities in Section */}
                    {groupedCities[letter].map((city) => {
                      const isSelected = city === selectedCity

                      return (
                        <TouchableOpacity
                          key={city}
                          onPress={() =>
                            handleCitySelect(city, onSelect, title, onClose)
                          }
                          activeOpacity={0.6}
                          style={{
                            backgroundColor: isSelected
                              ? colors.primary + "08"
                              : "transparent",
                          }}
                          className="flex-row items-center py-4"
                        >
                          {/* City Icon */}
                          <View
                            style={{
                              backgroundColor: isSelected
                                ? colors.primary + "15"
                                : colors.card,
                            }}
                            className="w-10 h-10 rounded-xl justify-center items-center mr-3"
                          >
                            <Ionicons
                              name={
                                isSelected ? "location" : "location-outline"
                              }
                              size={20}
                              color={
                                isSelected ? colors.primary : colors.mutedText
                              }
                            />
                          </View>

                          {/* City Name */}
                          <View className="flex-1">
                            <Text
                              style={{
                                color: isSelected
                                  ? colors.primary
                                  : colors.text,
                              }}
                              className="text-base font-geist"
                            >
                              {city}
                            </Text>
                            {isSelected && (
                              <Text
                                style={{ color: colors.mutedText }}
                                className="text-xs font-geist mt-0.5"
                              >
                                Currently selected
                              </Text>
                            )}
                          </View>

                          {/* Selection Indicator */}
                          {isSelected ? (
                            <View className="flex-row items-center">
                              <Ionicons
                                name="checkmark-circle"
                                size={24}
                                color={colors.primary}
                              />
                            </View>
                          ) : (
                            <Ionicons
                              name="chevron-forward"
                              size={20}
                              color={colors.mutedText}
                            />
                          )}
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                )}
                onScrollToIndexFailed={(info) => {
                  const wait = new Promise((resolve) =>
                    setTimeout(resolve, 500),
                  )
                  wait.then(() => {
                    flatListRef.current?.scrollToIndex({
                      index: info.index,
                      animated: true,
                      viewPosition: 0.5,
                    })
                  })
                }}
              />
            )}

            {/* Footer */}
            {!isLoadingCities && !citiesError && filteredCities.length > 0 && (
              <View
                style={{
                  borderTopColor: colors.border,
                  backgroundColor: colors.background,
                }}
                className="px-6 py-4 border-t flex-row justify-between items-center"
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color={colors.mutedText}
                  />
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-xs ml-1.5"
                  >
                    Double tap to unselect
                  </Text>
                </View>

                {selectedCity && (
                  <TouchableOpacity
                    onPress={() => {
                      onSelect("")
                      showToast(`${selectedCity} unselected`)
                    }}
                    className="flex-row items-center"
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={16}
                      color={colors.error}
                    />
                    <Text
                      style={{ color: colors.error }}
                      className="text-xs font-medium ml-1"
                    >
                      Clear
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <View className="px-2 py-3">
      {/* Error Alerts - Clean and minimal */}
      {citiesError && (
        <View className="mb-4 bg-red-50 dark:bg-red-900/20 rounded-xl p-3 flex-row items-center gap-2">
          <Ionicons name="alert-circle" size={18} color="#ef4444" />
          <Text className="text-xs text-red-600 dark:text-red-400 font-geist flex-1">
            Unable to load cities. Pull to refresh.
          </Text>
        </View>
      )}

      {fieldError.from && fieldError.to && (
        <View className="mb-4 bg-red-50 dark:bg-red-900/20 rounded-xl p-3 flex-row items-center gap-2">
          <Ionicons name="alert-circle" size={18} color="#ef4444" />
          <Text className="text-xs text-red-600 dark:text-red-400 font-geist">
            {fieldError.from}
          </Text>
        </View>
      )}

      {fieldError.time && (
        <View className="mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 flex-row items-center gap-2">
          <Ionicons name="time" size={18} color="#f59e0b" />
          <Text className="text-xs text-amber-600 dark:text-amber-400 font-geist flex-1">
            {fieldError.time}
          </Text>
        </View>
      )}

      {/* Main Search Form - Clean like Uber/redBus */}
      <View className="space-y-4">
        {/* Location Inputs - Like Uber style with integrated swap button */}
        <View
          style={{ backgroundColor: colors.card }}
          className="rounded-2xl overflow-hidden"
        >
          {/* From */}
          <TouchableOpacity
            onPress={() => setShowFromModal(true)}
            className="flex-row items-center px-4 py-4 border-b"
            style={{ borderColor: colors.border }}
          >
            <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 justify-center items-center mr-3">
              <View className="w-3 h-3 rounded-full bg-green-500" />
            </View>
            <View className="flex-1">
              <Text
                style={{ color: colors.mutedText }}
                className="text-xs font-geist mb-0.5"
              >
                FROM
              </Text>
              <Text
                style={{ color: from ? colors.text : colors.mutedText }}
                className="text-base font-geist"
              >
                {from || "Select pickup location"}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.mutedText}
            />
          </TouchableOpacity>

          {/* Swap Button - Integrated between fields like redBus */}
          {from && to && (
            <View className="absolute right-12 top-[52px] z-10">
              <TouchableOpacity
                onPress={swapLocations}
                activeOpacity={0.8}
                style={{
                  backgroundColor: colors.primary,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  borderColor: colors.background,
                }}
                className="w-8 h-8 rounded-full justify-center items-center border-2"
              >
                <Ionicons
                  name="swap-vertical"
                  size={16}
                  color="#ffffff"
                  style={{ transform: [{ rotate: "90deg" }] }}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* To */}
          <TouchableOpacity
            onPress={() => setShowToModal(true)}
            className="flex-row items-center px-4 py-4"
          >
            <View className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 justify-center items-center mr-3">
              <View className="w-3 h-3 rounded-full bg-red-500" />
            </View>
            <View className="flex-1">
              <Text
                style={{ color: colors.mutedText }}
                className="text-xs font-geist mb-0.5"
              >
                TO
              </Text>
              <Text
                style={{ color: to ? colors.text : colors.mutedText }}
                className="text-base font-geist"
              >
                {to || "Select destination"}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.mutedText}
            />
          </TouchableOpacity>
        </View>

        {/* Quick Swap Hint - When only one field is filled */}
        {((from && !to) || (!from && to)) && (
          <TouchableOpacity
            onPress={() => {
              if (from) {
                setTo(from)
                setFrom("")
              } else if (to) {
                setFrom(to)
                setTo("")
              }
            }}
            className="flex-row items-center justify-end gap-1"
          >
            <Ionicons name="swap-vertical" size={14} color={colors.primary} />
            <Text
              style={{ color: colors.primary }}
              className="text-xs font-geist"
            >
              Swap locations
            </Text>
          </TouchableOpacity>
        )}

        {/* Date, Time & Passengers - Horizontal like travel apps */}
        <View className="flex-row gap-3 my-3">
          {/* Date */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{ backgroundColor: colors.card }}
            className="flex-1 rounded-2xl p-3 flex-row items-center gap-3"
          >
            <View className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 justify-center items-center">
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <View>
              <Text
                style={{ color: colors.mutedText }}
                className="text-xs font-geist mb-0.5"
              >
                DATE
              </Text>
              <Text
                style={{ color: colors.text }}
                className="text-sm font-geist"
              >
                {format(date, "dd MMM")}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Time */}
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            style={{ backgroundColor: colors.card }}
            className="flex-1 rounded-2xl p-3 flex-row items-center gap-3"
          >
            <View className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 justify-center items-center">
              <Ionicons name="time-outline" size={20} color={colors.primary} />
            </View>
            <View>
              <Text
                style={{ color: colors.mutedText }}
                className="text-xs font-geist mb-0.5"
              >
                TIME
              </Text>
              <Text
                style={{ color: colors.text }}
                className="text-sm font-geist"
              >
                {time
                  ? TIME_SLOTS.find((slot) => slot.value === time)?.label.split(
                      " ",
                    )[0]
                  : "Select"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Passengers - Clean counter */}
        <View
          style={{ backgroundColor: colors.card }}
          className="rounded-2xl p-3"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 justify-center items-center">
                <Ionicons
                  name="people-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View>
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-xs font-geist mb-0.5"
                >
                  PASSENGERS
                </Text>
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-geist"
                >
                  {passengers} {passengers === 1 ? "passenger" : "passengers"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                onPress={decrementPassengers}
                disabled={passengers <= 1}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 justify-center items-center"
                style={{ opacity: passengers <= 1 ? 0.5 : 1 }}
              >
                <Ionicons name="remove" size={18} color={colors.primary} />
              </TouchableOpacity>

              <Text
                style={{ color: colors.text }}
                className="text-base font-groteskBold w-6 text-center"
              >
                {passengers}
              </Text>

              <TouchableOpacity
                onPress={incrementPassengers}
                disabled={passengers >= 5}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 justify-center items-center"
                style={{ opacity: passengers >= 5 ? 0.5 : 1 }}
              >
                <Ionicons name="add" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Search Button - Clean CTA */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isFormValid || isLoading || isLoadingCities}
          style={{
            backgroundColor:
              isFormValid && !isLoadingCities
                ? colors.primary
                : colors.mutedText + "30",
          }}
          className="w-full h-14 rounded-2xl items-center justify-center mt-4"
        >
          {isLoading || isLoadingCities ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="text-white font-semibold text-base font-geist">
                {isLoading ? "Searching..." : "Loading..."}
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Ionicons name="search" size={20} color="#ffffff" />
              <Text className="text-white font-groteskBold text-base">
                SEARCH BUSES
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Validation Hint - Subtle */}
        {!isFormValid && !isLoadingCities && (
          <Text
            style={{ color: colors.mutedText }}
            className="text-center text-xs mt-2"
          >
            {!from && "Select pickup location • "}
            {!to && "Select destination • "}
            {from && to && from === to && "Different locations required • "}
            {!time && "Select time • "}
            {date &&
              time &&
              !validateDateTime(date, time) &&
              "Future time required"}
          </Text>
        )}
      </View>

      {/* Modals */}
      {renderCityModal(
        showFromModal,
        () => {
          setShowFromModal(false)
          setSearchQuery("")
        },
        (city) => setFrom(city),
        availableFromCities,
        from,
        "Departure City",
      )}

      {renderCityModal(
        showToModal,
        () => {
          setShowToModal(false)
          setSearchQuery("")
        },
        (city) => setTo(city),
        availableToCities,
        to,
        "Destination City",
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View
              style={{ backgroundColor: colors.background }}
              className="rounded-t-3xl p-5"
            >
              <View className="flex-row justify-between items-center mb-5">
                <Text
                  style={{ color: colors.text }}
                  className="text-xl font-groteskBold"
                >
                  Select travel date
                </Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Ionicons name="close" size={24} color={colors.icon} />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false)
                  if (selectedDate) {
                    setDate(selectedDate)
                  }
                }}
                minimumDate={new Date()}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
          statusBarTranslucent
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View
              style={{ backgroundColor: colors.background }}
              className="rounded-t-3xl overflow-hidden max-h-[70%]"
            >
              {/* Header */}
              <View
                className="px-6 pt-6 pb-4 border-b"
                style={{ borderColor: colors.border }}
              >
                <View className="flex-row justify-between items-center">
                  <Text
                    style={{ color: colors.text }}
                    className="text-2xl font-groteskBold"
                  >
                    Select time
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(false)}
                    style={{ backgroundColor: colors.card }}
                    className="w-10 h-10 rounded-full justify-center items-center"
                  >
                    <Ionicons name="close" size={22} color={colors.text} />
                  </TouchableOpacity>
                </View>

                {/* Date Context */}
                <View className="flex-row items-center mt-2">
                  <View className="w-1 h-4 rounded-full bg-orange-500 mr-2" />
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-sm font-geist"
                  >
                    {format(date, "EEEE, MMMM d, yyyy")}
                  </Text>
                </View>
              </View>

              {/* Time Slots */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="px-6"
                ref={scrollViewRef}
                onContentSizeChange={() => {
                  // Scroll to first active time when modal opens
                  if (showTimePicker) {
                    const now = new Date()
                    const currentTimeString = format(now, "HH:mm")

                    // Find the index of the first active (future) time slot
                    const firstActiveIndex = TIME_SLOTS.findIndex((slot) => {
                      return validateDateTime(date, slot.value)
                    })

                    // Find the index of the time closest to current time that's still active
                    let targetIndex = firstActiveIndex

                    if (firstActiveIndex !== -1) {
                      // Try to find a time close to current time
                      const currentHour = parseInt(
                        currentTimeString.split(":")[0],
                      )
                      const currentMinute = parseInt(
                        currentTimeString.split(":")[1],
                      )

                      // Round up to next 30-min interval
                      const nextSlotHour =
                        currentMinute > 30 ? currentHour + 1 : currentHour
                      const nextSlotMinute = currentMinute > 30 ? 0 : 30
                      const nextSlotString = `${nextSlotHour.toString().padStart(2, "0")}:${nextSlotMinute.toString().padStart(2, "0")}`

                      const nearCurrentIndex = TIME_SLOTS.findIndex((slot) => {
                        return (
                          slot.value >= nextSlotString &&
                          validateDateTime(date, slot.value)
                        )
                      })

                      targetIndex =
                        nearCurrentIndex !== -1
                          ? nearCurrentIndex
                          : firstActiveIndex

                      // Scroll to that index with some offset to center it
                      setTimeout(() => {
                        scrollViewRef.current?.scrollTo({
                          y: targetIndex * 72 - 150, // Approximate height per item (64px + padding) minus offset to center
                          animated: true,
                        })
                      }, 100)
                    }
                  }
                }}
              >
                {/* Current Time Indicator */}
                {date &&
                  format(date, "yyyy-MM-dd") ===
                    format(new Date(), "yyyy-MM-dd") && (
                    <View
                      className="py-3 border-b"
                      style={{ borderColor: colors.border + "40" }}
                    >
                      <View className="flex-row items-center">
                        <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                        <Text
                          style={{ color: colors.mutedText }}
                          className="text-xs font-geist"
                        >
                          Current time: {format(new Date(), "h:mm a")}
                        </Text>
                      </View>
                    </View>
                  )}

                {/* Time Slots List */}
                <View className="py-2">
                  {TIME_SLOTS.map((slot, index) => {
                    const isPastTime =
                      date && !validateDateTime(date, slot.value)
                    const isSelected = time === slot.value
                    const isCurrentTime =
                      date &&
                      format(date, "yyyy-MM-dd") ===
                        format(new Date(), "yyyy-MM-dd") &&
                      slot.value === format(new Date(), "HH:mm")

                    // Check if this is the first active time slot
                    const isFirstActive =
                      !isPastTime &&
                      TIME_SLOTS.findIndex(
                        (s) => !validateDateTime(date, s.value),
                      ) === index

                    return (
                      <TouchableOpacity
                        key={slot.value}
                        onPress={() => {
                          if (!isPastTime) {
                            setTime(slot.value)
                            setShowTimePicker(false)
                          }
                        }}
                        disabled={isPastTime}
                        activeOpacity={isPastTime ? 1 : 0.6}
                        className={cn(
                          "py-4 flex-row items-center justify-between",
                          index !== TIME_SLOTS.length - 1 && "border-b",
                          isFirstActive && "bg-blue-50 dark:bg-blue-900/10", // Subtle highlight for first active time
                        )}
                        style={{
                          borderColor: colors.border + "40",
                          opacity: isPastTime ? 0.5 : 1,
                        }}
                      >
                        <View className="flex-row items-center flex-1">
                          {/* Time Icon with Status */}
                          <View
                            className={cn(
                              "w-10 h-10 rounded-xl justify-center items-center mr-3",
                              isPastTime && "bg-gray-100 dark:bg-gray-800",
                              !isPastTime &&
                                isSelected &&
                                "bg-orange-100 dark:bg-orange-900/30",
                              !isPastTime &&
                                !isSelected &&
                                "bg-gray-50 dark:bg-gray-800/50",
                              isFirstActive &&
                                !isSelected &&
                                "bg-blue-100 dark:bg-blue-900/30", // Highlight for first active
                            )}
                          >
                            <Ionicons
                              name={isPastTime ? "time-outline" : "time"}
                              size={20}
                              color={
                                isPastTime
                                  ? colors.mutedText
                                  : isSelected
                                    ? colors.primary
                                    : isFirstActive
                                      ? "#3b82f6" // Blue for first active
                                      : colors.text
                              }
                            />
                          </View>

                          {/* Time Label */}
                          <View className="flex-1">
                            <Text
                              style={{
                                color: isPastTime
                                  ? colors.mutedText
                                  : isSelected
                                    ? colors.primary
                                    : isFirstActive
                                      ? "#3b82f6"
                                      : colors.text,
                              }}
                              className={cn(
                                "text-base font-geist",
                                isSelected && "font-groteskBold",
                                isFirstActive && !isSelected && "font-medium",
                              )}
                            >
                              {slot.label}
                              {isFirstActive && !isSelected && (
                                <Text
                                  style={{ color: "#3b82f6" }}
                                  className="text-xs ml-2"
                                >
                                  ● Earliest available
                                </Text>
                              )}
                            </Text>

                            {/* Time Status */}
                            <View className="flex-row items-center mt-0.5">
                              {isPastTime && (
                                <>
                                  <Ionicons
                                    name="alert-circle"
                                    size={12}
                                    color={colors.mutedText}
                                  />
                                  <Text
                                    style={{ color: colors.mutedText }}
                                    className="text-xs ml-1"
                                  >
                                    Past time - not available
                                  </Text>
                                </>
                              )}
                              {isCurrentTime && !isPastTime && (
                                <>
                                  <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                                  <Text
                                    style={{ color: colors.mutedText }}
                                    className="text-xs"
                                  >
                                    Current time
                                  </Text>
                                </>
                              )}
                              {isSelected && !isPastTime && (
                                <>
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={12}
                                    color={colors.primary}
                                  />
                                  <Text
                                    style={{ color: colors.primary }}
                                    className="text-xs ml-1"
                                  >
                                    Selected departure time
                                  </Text>
                                </>
                              )}
                              {isFirstActive &&
                                !isSelected &&
                                !isPastTime &&
                                !isCurrentTime && (
                                  <>
                                    <View className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
                                    <Text
                                      style={{ color: "#3b82f6" }}
                                      className="text-xs"
                                    >
                                      First available
                                    </Text>
                                  </>
                                )}
                            </View>
                          </View>
                        </View>

                        {/* Right Side Indicator */}
                        <View className="flex-row items-center">
                          {isSelected && !isPastTime && (
                            <View className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 justify-center items-center">
                              <Ionicons
                                name="checkmark"
                                size={18}
                                color={colors.primary}
                              />
                            </View>
                          )}
                          {!isSelected && !isPastTime && (
                            <Ionicons
                              name="chevron-forward"
                              size={18}
                              color={
                                isFirstActive ? "#3b82f6" : colors.mutedText
                              }
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                </View>

                {/* Quick Actions */}
                <View className="py-6 flex-row justify-between items-center">
                  <TouchableOpacity
                    onPress={() => {
                      // Set to next available time
                      const now = new Date()
                      const nextHour = new Date(now)
                      nextHour.setHours(now.getHours() + 1)
                      nextHour.setMinutes(0, 0, 0)
                      const hours = nextHour
                        .getHours()
                        .toString()
                        .padStart(2, "0")
                      const minutes = nextHour
                        .getMinutes()
                        .toString()
                        .padStart(2, "0")
                      const nextTimeSlot = TIME_SLOTS.find(
                        (slot) => slot.value === `${hours}:${minutes}`,
                      )
                      if (
                        nextTimeSlot &&
                        validateDateTime(date, nextTimeSlot.value)
                      ) {
                        setTime(nextTimeSlot.value)
                        setShowTimePicker(false)
                      } else {
                        // If next hour is not available, find first available
                        const firstActive = TIME_SLOTS.find((slot) =>
                          validateDateTime(date, slot.value),
                        )
                        if (firstActive) {
                          setTime(firstActive.value)
                          setShowTimePicker(false)
                        }
                      }
                    }}
                    style={{ backgroundColor: colors.card }}
                    className="flex-1 mr-2 py-3 rounded-xl flex-row items-center justify-center gap-2"
                  >
                    <Ionicons name="time" size={16} color={colors.primary} />
                    <Text
                      style={{ color: colors.primary }}
                      className="text-sm font-geist"
                    >
                      Next available
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      // Set to evening time (7 PM)
                      const eveningSlot = TIME_SLOTS.find(
                        (slot) => slot.value === "19:00",
                      )
                      if (
                        eveningSlot &&
                        validateDateTime(date, eveningSlot.value)
                      ) {
                        setTime(eveningSlot.value)
                        setShowTimePicker(false)
                      } else {
                        // If 7 PM is not available, find first evening slot after 6 PM
                        const firstEvening = TIME_SLOTS.find((slot) => {
                          const hour = parseInt(slot.value.split(":")[0])
                          return (
                            hour >= 18 && validateDateTime(date, slot.value)
                          )
                        })
                        if (firstEvening) {
                          setTime(firstEvening.value)
                          setShowTimePicker(false)
                        }
                      }
                    }}
                    style={{ backgroundColor: colors.card }}
                    className="flex-1 ml-2 py-3 rounded-xl flex-row items-center justify-center gap-2"
                  >
                    <Ionicons name="moon" size={16} color={colors.primary} />
                    <Text
                      style={{ color: colors.primary }}
                      className="text-sm font-geist"
                    >
                      Evening
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  )
}
