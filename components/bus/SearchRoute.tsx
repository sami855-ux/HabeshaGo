// import DateTimePicker from "@react-native-community/datetimepicker"
import { useThemeContext } from "@/context/ThemeContext"
import { useSearchBuses } from "@/hooks/useSearchBuses"
import DateTimePicker from "@react-native-community/datetimepicker"
import { LinearGradient } from "expo-linear-gradient"
import {
  ArrowRight,
  CalendarIcon,
  Check,
  ChevronRight,
  MapPin,
  Search,
  Target,
  X,
} from "lucide-react-native"
import React, { useState } from "react"
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import AlertModal from "../utils/AlertModal"

const { width } = Dimensions.get("window")

interface City {
  value: string
  label: string
  state: string
}

const cities: City[] = [
  { value: "addis-ababa", label: "Addis Ababa", state: "AA" },
  { value: "addama", label: "Addama", state: "OR" },
  { value: "bahir-dar", label: "Bahir Dar", state: "AM" },
  { value: "hawassa", label: "Hawassa", state: "SN" },
  { value: "mekelle", label: "Mekelle", state: "TI" },
  { value: "dire-dawa", label: "Dire Dawa", state: "DD" },
]

const popularStations = [
  { city: "Addis Ababa", station: "Autobus Tera", code: "ABT" },
  { city: "Addis Ababa", station: "Megenagna Bus Station", code: "MGBS" },
  { city: "Addis Ababa", station: "Kality Bus Station", code: "KBS" },
]

const trendingRoutes = [
  {
    from: "AA",
    to: "Addama",
    price: "ETB 250",
    rating: 4.5,
    duration: "2h",
    passengers: "4.5K",
  },
  {
    from: "AA",
    to: "Bahir Dar",
    price: "ETB 450",
    rating: 4.2,
    duration: "5h",
    passengers: "3.2K",
  },
  {
    from: "AA",
    to: "Hawassa",
    price: "ETB 350",
    rating: 4.7,
    duration: "4h",
    passengers: "2.8K",
  },
  {
    from: "Addama",
    to: "AA",
    price: "ETB 250",
    rating: 4.4,
    duration: "2h",
    passengers: "2.1K",
  },
]

export function SearchRoute() {
  const { colors, actualTheme } = useThemeContext()

  const [fromValue, setFromValue] = useState("")
  const [toValue, setToValue] = useState("")
  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [passengers, setPassengers] = useState(1)
  const [fromModalVisible, setFromModalVisible] = useState(false)
  const [toModalVisible, setToModalVisible] = useState(false)
  const [dateModalVisible, setDateModalVisible] = useState(false)
  const [fromSearch, setFromSearch] = useState("")
  const [toSearch, setToSearch] = useState("")
  const [activeDate, setActiveDate] = useState("today")

  const [alertVisible, setAlertVisible] = useState(false)
  const [alertConfig, setAlertConfig] = useState({})

  const showAlert = (config) => {
    setAlertConfig(config)
    setAlertVisible(true)
  }

  const { data, isFetching, error, refetch } = useSearchBuses(
    fromValue,
    toValue
  )

  const dates = [
    { id: "today", label: "Today", date: new Date() },
    {
      id: "tomorrow",
      label: "Tomorrow",
      date: new Date(Date.now() + 86400000),
    },
    {
      id: "day3",
      label: new Date(Date.now() + 172800000).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      date: new Date(Date.now() + 172800000),
    },
    {
      id: "day4",
      label: new Date(Date.now() + 259200000).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      date: new Date(Date.now() + 259200000),
    },
  ]

  const selectedFrom = cities.find((city) => city.value === fromValue)
  const selectedTo = cities.find((city) => city.value === toValue)

  const handleSwapLocations = () => {
    const temp = fromValue
    setFromValue(toValue)
    setToValue(temp)
  }

  const filteredFromCities = cities.filter(
    (city) =>
      city.label.toLowerCase().includes(fromSearch.toLowerCase()) ||
      city.state.toLowerCase().includes(fromSearch.toLowerCase())
  )

  const filteredToCities = cities
    .filter((city) => city.value !== fromValue)
    .filter(
      (city) =>
        city.label.toLowerCase().includes(toSearch.toLowerCase()) ||
        city.state.toLowerCase().includes(toSearch.toLowerCase())
    )

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false)
    }

    if (selectedDate) {
      setDate(selectedDate)
      setActiveDate("custom")
      setDateModalVisible(false)
    }
  }

  const handleCustomDatePress = () => {
    if (Platform.OS === "ios") {
      setDateModalVisible(true)
    } else {
      setShowDatePicker(true)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const handleSearchBuses = async () => {
    console.log(fromValue, toValue)
    // Implement search logic here
    if (!fromValue || !toValue) {
      showAlert({
        title: "Invalid Input",
        message: "Please select both departure and destination locations.",
        type: "error",
      })

      return
    }
    refetch()
  }
  return (
    <>
      <View className="w-full">
        {/* Modern Search Card */}
        <View
          className="rounded-3xl overflow-hidden"
          style={{
            backgroundColor: colors.card,
          }}
        >
          <LinearGradient
            colors={
              actualTheme === "dark"
                ? [colors.card, colors.card]
                : ["#FFFFFF", "#FFFFFF"]
            }
            className="p-5 px-3"
          >
            {/* Route Inputs */}
            <View className="mb-4">
              {/* From Input */}
              <TouchableOpacity
                className="flex-row items-center py-4 px-3 border-b"
                style={{ borderBottomColor: colors.border }}
                onPress={() => setFromModalVisible(true)}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: colors.primary + "15" }}
                >
                  <MapPin size={18} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-xs font-medium mb-1 font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    FROM
                  </Text>
                  <Text
                    className="font-semibold text-base font-geist"
                    style={{ color: colors.text }}
                  >
                    {selectedFrom ? selectedFrom.label : "Current location"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* To Input */}
              <TouchableOpacity
                className="flex-row items-center py-4 px-3"
                onPress={() => setToModalVisible(true)}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: colors.error + "15" }}
                >
                  <Target size={18} color={colors.error} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-xs font-medium mb-1 font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    TO
                  </Text>
                  <Text
                    className="font-semibold text-base font-geist"
                    style={{ color: colors.text }}
                  >
                    {selectedTo ? selectedTo.label : "Where to?"}
                  </Text>
                  {selectedTo && (
                    <Text
                      className="text-sm mt-1"
                      style={{ color: colors.mutedText }}
                    >
                      {selectedTo.state}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.border }}
                  onPress={handleSwapLocations}
                >
                  <ArrowRight size={18} color={colors.text} />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  className="text-sm font-medium uppercase tracking-wider"
                  style={{ color: colors.mutedText }}
                >
                  Travel Date
                </Text>
                <TouchableOpacity
                  className="p-1"
                  onPress={() => setDateModalVisible(true)}
                >
                  <CalendarIcon size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-2">
                {dates.map((dateItem) => {
                  const isActive = activeDate === dateItem.id

                  return (
                    <TouchableOpacity
                      key={dateItem.id}
                      className="flex-1 py-3 rounded-xl items-center"
                      style={{
                        borderWidth: 1,
                        borderColor: isActive ? colors.primary : colors.border,
                        backgroundColor: isActive
                          ? colors.primary
                          : colors.background,
                      }}
                      onPress={() => {
                        setActiveDate(dateItem.id)
                        setDate(dateItem.date)
                      }}
                    >
                      <Text
                        className="font-semibold font-geist"
                        style={{ color: isActive ? "#fff" : colors.text }}
                      >
                        {dateItem.label}
                      </Text>
                      <Text
                        className="text-xs mt-1"
                        style={{
                          color: isActive
                            ? "rgba(255,255,255,0.8)"
                            : colors.mutedText,
                        }}
                      >
                        {dateItem.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </TouchableOpacity>
                  )
                })}

                {/* Custom Date Button */}
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl items-center justify-center"
                  style={{
                    borderWidth: 1,
                    borderColor:
                      activeDate === "custom"
                        ? colors.primary
                        : colors.primary + "15",
                    backgroundColor:
                      activeDate === "custom"
                        ? colors.primary
                        : colors.background,
                  }}
                  onPress={handleCustomDatePress}
                >
                  <Text
                    className="text-lg font-geist"
                    style={{
                      color: activeDate === "custom" ? "#fff" : colors.primary,
                    }}
                  >
                    Custom
                  </Text>
                  {activeDate === "custom" && (
                    <Text
                      className="text-xs mt-1"
                      style={{
                        color: "rgba(255,255,255,0.8)",
                      }}
                    >
                      {formatDate(date)}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Android Date Picker */}
              {showDatePicker && Platform.OS === "android" && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  textColor={actualTheme === "dark" ? "#FFFFFF" : "#000000"}
                  accentColor={colors.primary}
                />
              )}
            </View>
            {/* Passengers & Search */}
            <View className="flex-row items-center gap-4">
              {/* Passengers */}
              <View className="flex-1">
                <Text
                  className="text-sm font-medium uppercase tracking-wider pb-2"
                  style={{ color: colors.mutedText }}
                >
                  Passengers
                </Text>
                <View
                  className="flex-row items-center h-14 px-4 rounded-xl border"
                  style={{ borderColor: colors.border }}
                >
                  {/* Minus Button */}
                  <TouchableOpacity
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.border }}
                    onPress={() => setPassengers(Math.max(1, passengers - 1))}
                  >
                    <Text className="text-xl" style={{ color: colors.text }}>
                      -
                    </Text>
                  </TouchableOpacity>

                  {/* Input Field */}
                  <TextInput
                    className="flex-1 text-center text-lg font-groteskBold mx-2"
                    style={{ color: colors.text }}
                    keyboardType="number-pad"
                    value={passengers.toString()}
                    onChangeText={(text) => {
                      // Allow empty string so user can delete
                      if (text === "") {
                        setPassengers(0)
                        return
                      }

                      // Only numbers
                      const num = parseInt(text, 10)
                      if (!isNaN(num) && num >= 0) setPassengers(num)
                    }}
                    placeholder="1"
                    placeholderTextColor={colors.mutedText}
                  />

                  {/* Plus Button */}
                  <TouchableOpacity
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.primary }}
                    onPress={() => setPassengers(passengers + 1)}
                  >
                    <Text className="text-xl text-white">+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search Button */}
              <View className="flex-1">
                <Text className="text-sm font-medium mb-2 opacity-0">
                  Search
                </Text>

                <TouchableOpacity
                  className="h-14 rounded-xl items-center justify-center flex-row"
                  style={{ backgroundColor: colors.primary }}
                  onPress={handleSearchBuses}
                  disabled={isFetching}
                  activeOpacity={0.8}
                >
                  {isFetching ? (
                    <>
                      <ActivityIndicator color="#FFFFFF" />
                      <Text className="font-geist text-white text-base ml-2">
                        Searching...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Search size={20} color="#FFFFFF" />
                      <Text className="font-geist text-white text-base ml-2">
                        Search
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* iOS Date Picker Modal */}
        <Modal
          visible={dateModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setDateModalVisible(false)}
        >
          <View className="flex-1 bg-black/50">
            {/* Backdrop Touch */}
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={() => setDateModalVisible(false)}
            />

            <View
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl"
              style={{
                backgroundColor: colors.background,
                shadowColor: colors.text,
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 20,
                maxHeight: "50%",
              }}
            >
              {/* Drag Handle */}
              <View className="items-center pt-3">
                <View
                  className="w-12 h-1.5 rounded-full mb-1"
                  style={{ backgroundColor: colors.border }}
                />
              </View>

              {/* Header */}
              <View className="px-5 pt-2 pb-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text
                      className="text-xl font-groteskBold tracking-tight"
                      style={{ color: colors.text }}
                    >
                      Select Date
                    </Text>
                    <Text
                      className="text-sm font-geist mt-1"
                      style={{ color: colors.mutedText }}
                    >
                      Choose your travel date
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="w-10 h-10 rounded-xl items-center justify-center"
                    style={{
                      backgroundColor:
                        actualTheme === "dark" ? "#2A2A2A" : "#F5F5F5",
                    }}
                    onPress={() => setDateModalVisible(false)}
                  >
                    <X size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Date Picker */}
              <View className="px-5 pb-6">
                {Platform.OS === "ios" ? (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    textColor={colors.text}
                    accentColor={colors.primary}
                    themeVariant={actualTheme === "dark" ? "dark" : "light"}
                    style={{
                      backgroundColor:
                        actualTheme === "dark" ? "#1A1A1A" : "#FFFFFF",
                      borderRadius: 12,
                      padding: 10,
                    }}
                  />
                ) : (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    textColor={actualTheme === "dark" ? "#FFFFFF" : "#000000"}
                    accentColor={colors.primary}
                  />
                )}
              </View>

              {/* Confirm Button */}
              <View className="px-5 pb-8">
                <TouchableOpacity
                  className="h-14 rounded-xl items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                  onPress={() => {
                    setActiveDate("custom")
                    setDateModalVisible(false)
                  }}
                >
                  <Text className="font-geist text-white text-base font-semibold">
                    Confirm Date
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modern From City Modal */}
        <Modal
          visible={fromModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setFromModalVisible(false)}
        >
          <View className="flex-1 bg-black/70 ">
            {/* Backdrop Touch */}
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={() => setFromModalVisible(false)}
            />

            <View
              className=" rounded-t-4xl bg-card w-full h-[70vh]"
              style={{
                backgroundColor: colors.background,
                shadowColor: colors.text,
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 20,
                maxHeight: "75%",
              }}
            >
              {/* Scrollable Content */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                className="flex-1"
              >
                {/* Drag Handle */}
                <View className="items-center pt-3">
                  <View
                    className="w-12 h-1.5 rounded-full mb-1"
                    style={{ backgroundColor: colors.border }}
                  />
                </View>

                <View className="p-5 pb-6">
                  {/* Header */}
                  <View className="flex-row items-start justify-between mb-5">
                    <View className="flex-1 pr-3">
                      <View className="flex-row items-center gap-2 mb-1">
                        <MapPin size={18} color={colors.primary} />
                        <Text
                          className="text-xl font-groteskBold tracking-tight"
                          style={{ color: colors.text }}
                        >
                          Select Departure
                        </Text>
                      </View>
                      <Text
                        className="text-sm font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        Choose your starting point
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="w-10 h-10 rounded-xl items-center justify-center active:scale-95"
                      style={{
                        backgroundColor:
                          actualTheme === "dark" ? "#2A2A2A" : "#F5F5F5",
                      }}
                      onPress={() => setFromModalVisible(false)}
                      activeOpacity={0.7}
                    >
                      <X size={20} color={colors.text} />
                    </TouchableOpacity>
                  </View>

                  {/* Search Input */}
                  <View
                    className="relative mb-4 flex flex-row items-center px-4 h-12 rounded-xl"
                    style={{
                      borderWidth: 1.5,
                      borderColor: colors.border + "10",
                      backgroundColor:
                        actualTheme === "dark" ? "#1A1A1A" : "#FFFFFF",
                    }}
                  >
                    <Search size={18} color={colors.mutedText} />
                    <TextInput
                      className="flex-1 h-full px-3 text-base font-geist"
                      placeholder="Search city or airport..."
                      placeholderTextColor={colors.mutedText + "80"}
                      value={fromSearch}
                      onChangeText={setFromSearch}
                      autoFocus
                      style={{
                        color: colors.text,
                      }}
                    />
                    {fromSearch.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setFromSearch("")}
                        className="p-1"
                        activeOpacity={0.6}
                      >
                        <X size={14} color={colors.mutedText} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Current Location Card */}
                  <TouchableOpacity
                    className="flex-row items-center p-3 rounded-xl mb-4 active:scale-[0.98]"
                    style={{
                      backgroundColor:
                        actualTheme === "dark" ? "#1A1A1A" : "#F8F8F8",
                      borderWidth: 1.5,
                      borderColor: colors.primary + "10",
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                      style={{
                        backgroundColor: colors.primary + "15",
                        borderWidth: 1.5,
                        borderColor: colors.primary + "30",
                      }}
                    >
                      <MapPin size={18} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="font-semibold font-geist mb-0.5"
                        style={{ color: colors.text }}
                      >
                        Use current location
                      </Text>
                      <Text
                        className="text-xs font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        GPS detection • Fastest option
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.mutedText} />
                  </TouchableOpacity>

                  {/* Cities List Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <Text
                      className="text-xs font-groteskBold uppercase tracking-wider"
                      style={{ color: colors.mutedText }}
                    >
                      Popular Cities
                    </Text>
                    <Text
                      className="text-xs font-geist"
                      style={{ color: colors.mutedText }}
                    >
                      {filteredFromCities.length} options
                    </Text>
                  </View>

                  {/* Cities List */}
                  <View className="mb-2">
                    {filteredFromCities.map((item) => (
                      <TouchableOpacity
                        key={item.value}
                        className="flex-row items-center p-3 rounded-xl mb-2 active:scale-[0.98]"
                        style={{
                          backgroundColor:
                            fromValue === item.value
                              ? colors.primary + "10"
                              : "transparent",
                          borderWidth: 1.5,
                          borderColor:
                            fromValue === item.value
                              ? colors.primary + "30"
                              : "transparent",
                        }}
                        onPress={() => {
                          setFromValue(item.value)
                          setFromModalVisible(false)
                        }}
                        activeOpacity={0.7}
                      >
                        <View
                          className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                          style={{
                            backgroundColor:
                              fromValue === item.value
                                ? colors.primary
                                : colors.border,
                          }}
                        >
                          <MapPin
                            size={18}
                            color={
                              fromValue === item.value
                                ? "#FFFFFF"
                                : colors.mutedText
                            }
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            className="font-medium font-geist mb-0.5"
                            style={{ color: colors.text }}
                          >
                            {item.label}
                          </Text>
                          <View className="flex-row items-center gap-1.5">
                            <Text
                              className="text-xs font-geist"
                              style={{ color: colors.mutedText }}
                            >
                              {item.state}
                            </Text>
                            <View
                              className="w-1 h-1 rounded-full"
                              style={{ backgroundColor: colors.mutedText }}
                            />
                            <Text
                              className="text-xs font-geist"
                              style={{ color: colors.mutedText }}
                            >
                              Ethiopia
                            </Text>
                          </View>
                        </View>
                        {fromValue === item.value ? (
                          <View
                            className="w-6 h-6 rounded-full items-center justify-center"
                            style={{
                              backgroundColor: colors.primary,
                              shadowColor: colors.primary,
                              shadowOffset: { width: 0, height: 1 },
                              shadowOpacity: 0.3,
                              shadowRadius: 2,
                              elevation: 2,
                            }}
                          >
                            <Check size={12} color="#FFFFFF" />
                          </View>
                        ) : (
                          <ChevronRight size={18} color={colors.mutedText} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Empty State */}
                  {filteredFromCities.length === 0 && (
                    <View className="py-8 items-center">
                      <View
                        className="w-16 h-16 rounded-xl items-center justify-center mb-3"
                        style={{
                          backgroundColor:
                            actualTheme === "dark" ? "#2A2A2A" : "#F5F5F5",
                        }}
                      >
                        <MapPin size={28} color={colors.mutedText} />
                      </View>
                      <Text
                        className="text-lg font-groteskBold mb-1.5"
                        style={{ color: colors.text }}
                      >
                        No results found
                      </Text>
                      <Text
                        className="text-sm text-center font-geist px-6"
                        style={{ color: colors.mutedText }}
                      >
                        Try searching with a different name or browse popular
                        cities
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* Safe Area Bottom */}
              <View
                className="h-4"
                style={{ backgroundColor: colors.background }}
              />
            </View>
          </View>
        </Modal>

        {/* Modern To City Modal */}
        <Modal
          visible={toModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setToModalVisible(false)}
        >
          <View className="flex-1 bg-black/70">
            {/* Backdrop Touch */}
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={() => setToModalVisible(false)}
            />

            <View
              className="rounded-t-4xl bg-card w-full h-[70vh]"
              style={{
                backgroundColor: colors.background,
                shadowColor: colors.text,
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 20,
                maxHeight: "75%",
              }}
            >
              {/* Scrollable Content */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                className="flex-1"
              >
                {/* Drag Handle */}
                <View className="items-center pt-3">
                  <View
                    className="w-12 h-1.5 rounded-full mb-1"
                    style={{ backgroundColor: colors.border }}
                  />
                </View>

                <View className="p-5 pb-6">
                  {/* Header */}
                  <View className="flex-row items-start justify-between mb-5">
                    <View className="flex-1 pr-3">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Target size={18} color={colors.error} />
                        <Text
                          className="text-xl font-groteskBold tracking-tight"
                          style={{ color: colors.text }}
                        >
                          Select Destination
                        </Text>
                      </View>
                      <Text
                        className="text-sm font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        Choose where you want to go
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="w-10 h-10 rounded-xl items-center justify-center active:scale-95"
                      style={{
                        backgroundColor:
                          actualTheme === "dark" ? "#2A2A2A" : "#F5F5F5",
                      }}
                      onPress={() => setToModalVisible(false)}
                      activeOpacity={0.7}
                    >
                      <X size={20} color={colors.text} />
                    </TouchableOpacity>
                  </View>

                  {/* Search Input */}
                  <View
                    className="relative mb-4 flex flex-row items-center px-4 h-12 rounded-xl"
                    style={{
                      borderWidth: 1.5,
                      borderColor: colors.border + "10",
                      backgroundColor:
                        actualTheme === "dark" ? "#1A1A1A" : "#FFFFFF",
                    }}
                  >
                    <Search size={18} color={colors.mutedText} />
                    <TextInput
                      className="flex-1 h-full px-3 text-base font-geist"
                      placeholder="Search destinations..."
                      placeholderTextColor={colors.mutedText + "80"}
                      value={toSearch}
                      onChangeText={setToSearch}
                      autoFocus
                      style={{
                        color: colors.text,
                      }}
                    />
                    {toSearch.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setToSearch("")}
                        className="p-1"
                        activeOpacity={0.6}
                      >
                        <X size={14} color={colors.mutedText} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* All Destinations Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <Text
                      className="text-xs font-groteskBold uppercase tracking-wider"
                      style={{ color: colors.mutedText }}
                    >
                      All Destinations
                    </Text>
                    <Text
                      className="text-xs font-geist"
                      style={{ color: colors.mutedText }}
                    >
                      {filteredToCities.length} options
                    </Text>
                  </View>

                  {/* Cities List */}
                  <View className="mb-2">
                    {filteredToCities.map((item) => (
                      <TouchableOpacity
                        key={item.value}
                        className="flex-row items-center p-3 rounded-xl mb-2 active:scale-[0.98]"
                        style={{
                          backgroundColor:
                            toValue === item.value
                              ? colors.error + "10"
                              : "transparent",
                          borderWidth: 1.5,
                          borderColor:
                            toValue === item.value
                              ? colors.error + "30"
                              : "transparent",
                        }}
                        onPress={() => {
                          setToValue(item.value)
                          setToModalVisible(false)
                        }}
                        activeOpacity={0.7}
                      >
                        <View
                          className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                          style={{
                            backgroundColor:
                              toValue === item.value
                                ? colors.error
                                : colors.border,
                          }}
                        >
                          <MapPin
                            size={18}
                            color={
                              toValue === item.value
                                ? "#FFFFFF"
                                : colors.mutedText
                            }
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            className="font-medium font-geist mb-0.5"
                            style={{ color: colors.text }}
                          >
                            {item.label}
                          </Text>
                          <View className="flex-row items-center gap-1.5">
                            <Text
                              className="text-xs font-geist"
                              style={{ color: colors.mutedText }}
                            >
                              {item.state}
                            </Text>
                            <View
                              className="w-1 h-1 rounded-full"
                              style={{ backgroundColor: colors.mutedText }}
                            />
                            <Text
                              className="text-xs font-geist"
                              style={{ color: colors.mutedText }}
                            >
                              Ethiopia
                            </Text>
                          </View>
                        </View>
                        {toValue === item.value ? (
                          <View
                            className="w-6 h-6 rounded-full items-center justify-center"
                            style={{
                              backgroundColor: colors.error,
                              shadowColor: colors.error,
                              shadowOffset: { width: 0, height: 1 },
                              shadowOpacity: 0.3,
                              shadowRadius: 2,
                              elevation: 2,
                            }}
                          >
                            <Check size={12} color="#FFFFFF" />
                          </View>
                        ) : (
                          <ChevronRight size={18} color={colors.mutedText} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Empty State */}
                  {filteredToCities.length === 0 && (
                    <View className="py-8 items-center">
                      <View
                        className="w-16 h-16 rounded-xl items-center justify-center mb-3"
                        style={{
                          backgroundColor:
                            actualTheme === "dark" ? "#2A2A2A" : "#F5F5F5",
                        }}
                      >
                        <Target size={28} color={colors.mutedText} />
                      </View>
                      <Text
                        className="text-lg font-groteskBold mb-1.5"
                        style={{ color: colors.text }}
                      >
                        No destinations found
                      </Text>
                      <Text
                        className="text-sm text-center font-geist px-6"
                        style={{ color: colors.mutedText }}
                      >
                        Try searching with a different name or check your
                        departure city
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* Safe Area Bottom */}
              <View
                className="h-4"
                style={{ backgroundColor: colors.background }}
              />
            </View>
          </View>
        </Modal>

        {/* Android Date Picker */}
        {showDatePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
            textColor={actualTheme === "dark" ? "#FFFFFF" : "#000000"}
            accentColor={colors.primary}
          />
        )}
      </View>

      {/* Alert Modal */}
      <AlertModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        {...alertConfig}
      />
    </>
  )
}
