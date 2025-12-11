// components/bus/SearchRoute.tsx
// import DateTimePicker from "@react-native-community/datetimepicker"
import { useThemeContext } from "@/context/ThemeContext"
import { LinearGradient } from "expo-linear-gradient"
import {
  ArrowRight,
  CalendarIcon,
  Check,
  MapPin,
  Search,
  Target,
  X,
} from "lucide-react-native"
import React, { useState } from "react"
import {
  Dimensions,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

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
  const [fromValue, setFromValue] = useState("addis-ababa")
  const [toValue, setToValue] = useState("addama")
  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [passengers, setPassengers] = useState(1)
  const [fromModalVisible, setFromModalVisible] = useState(false)
  const [toModalVisible, setToModalVisible] = useState(false)
  const [fromSearch, setFromSearch] = useState("")
  const [toSearch, setToSearch] = useState("")
  const [activeDate, setActiveDate] = useState("today")

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

  return (
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

          {/* Quick Date Selector */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text
                className="text-sm font-medium uppercase tracking-wider"
                style={{ color: colors.mutedText }}
              >
                Travel Date
              </Text>
              <TouchableOpacity className="p-1">
                <CalendarIcon size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-2">
              {dates.map((dateItem) => (
                <TouchableOpacity
                  key={dateItem.id}
                  className={`flex-1 py-3 rounded-xl items-center`}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  onPress={() => {
                    setActiveDate(dateItem.id)
                    setDate(dateItem.date)
                  }}
                >
                  <Text
                    className={`text-sm font-semibold ${activeDate === dateItem.id ? "text-white" : ""}`}
                    style={
                      activeDate !== dateItem.id ? { color: colors.text } : {}
                    }
                  >
                    {dateItem.label}
                  </Text>
                  <Text
                    className={`text-xs mt-1 ${activeDate === dateItem.id ? "text-white/80" : ""}`}
                    style={
                      activeDate !== dateItem.id
                        ? { color: colors.mutedText }
                        : {}
                    }
                  >
                    {dateItem.date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Passengers & Search */}
          <View className="flex-row items-center gap-4">
            {/* Passengers */}
            <View className="flex-1">
              <Text
                className="text-sm font-medium uppercase tracking-wider pb-2"
                style={{ color: colors.mutedText }}
              >
                passengers
              </Text>
              <View
                className="flex-row items-center h-14 px-4 rounded-xl border"
                style={{ borderColor: colors.border }}
              >
                <TouchableOpacity
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.border }}
                  onPress={() => setPassengers(Math.max(1, passengers - 1))}
                >
                  <Text className="text-xl" style={{ color: colors.text }}>
                    -
                  </Text>
                </TouchableOpacity>
                <View className="flex-1 items-center">
                  <Text
                    className="font-semibold text-lg font-groteskBold"
                    style={{ color: colors.text }}
                  >
                    {passengers}
                  </Text>
                  <Text
                    className="text-xs font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    {passengers === 1 ? "Passenger" : "Passengers"}
                  </Text>
                </View>
                <TouchableOpacity
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                  onPress={() => setPassengers(passengers + 1)}
                >
                  <Text className="text-xl text-white">+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Search Button */}
            <View className="flex-1">
              <Text className="text-sm font-medium mb-2 opacity-0">Search</Text>
              <TouchableOpacity
                className="h-14 rounded-xl items-center justify-center flex-row"
                style={{ backgroundColor: colors.primary }}
                onPress={() => {
                  // Handle search
                }}
              >
                <Search size={20} color="#FFFFFF" />
                <Text className="font-geist text-white text-base ml-2 ">
                  Search
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Modals */}
      <Modal
        visible={fromModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFromModalVisible(false)}
      >
        <View className="flex-1 bg-black/50">
          <View
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[85%]"
            style={{ backgroundColor: colors.background }}
          >
            <View className="p-5 pb-8">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-5">
                <View>
                  <Text
                    className="text-xl font-groteskBold"
                    style={{ color: colors.text }}
                  >
                    Select Departure
                  </Text>
                  <Text
                    className="text-sm mt-1 font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    Choose your starting point
                  </Text>
                </View>
                <TouchableOpacity
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.border }}
                  onPress={() => setFromModalVisible(false)}
                >
                  <X size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Search Input */}
              <View
                className="relative mb-4 flex flex-row items-center px-4 rounded-xl gap-4"
                style={{
                  borderColor: colors.border,
                  backgroundColor:
                    actualTheme === "dark" ? colors.card : "#FFFFFF",
                }}
              >
                <Search size={18} color={colors.mutedText} className="" />
                <TextInput
                  className="h-12  text-base font-geist"
                  placeholder="Search departure..."
                  placeholderTextColor={colors.mutedText}
                  value={toSearch}
                  onChangeText={setToSearch}
                  autoFocus
                  style={{
                    color: colors.text,
                  }}
                />
              </View>

              {/* Current Location Option */}
              <TouchableOpacity
                className="flex-row items-center py-4 border-b"
                style={{ borderBottomColor: colors.border }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: colors.primary + "15" }}
                >
                  <MapPin size={18} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text
                    className="font-semibold font-geist"
                    style={{ color: colors.text }}
                  >
                    Use current location
                  </Text>
                  <Text
                    className="text-sm font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    Detect automatically
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Cities List */}
              <FlatList
                data={filteredFromCities}
                keyExtractor={(item) => item.value}
                showsVerticalScrollIndicator={false}
                className="mt-4"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="flex-row items-center py-4 border-b"
                    style={{ borderBottomColor: colors.border }}
                    onPress={() => {
                      setFromValue(item.value)
                      setFromModalVisible(false)
                    }}
                  >
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: colors.border }}
                    >
                      <MapPin size={18} color={colors.mutedText} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="font-medium font-geist"
                        style={{ color: colors.text }}
                      >
                        {item.label}
                      </Text>
                      <Text
                        className="text-sm font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        {item.state} • Ethiopia
                      </Text>
                    </View>
                    {fromValue === item.value && (
                      <View
                        className="w-6 h-6 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Check size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View className="py-10 items-center">
                    <MapPin size={48} color={colors.mutedText} />
                    <Text
                      className="text-lg font-medium mt-4"
                      style={{ color: colors.text }}
                    >
                      No cities found
                    </Text>
                    <Text
                      className="text-sm text-center mt-2"
                      style={{ color: colors.mutedText }}
                    >
                      Try searching with different keywords
                    </Text>
                  </View>
                }
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={toModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setToModalVisible(false)}
      >
        <View className="flex-1 bg-black/50">
          <View
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[85%] "
            style={{ backgroundColor: colors.background }}
          >
            <View className="p-5 pb-8">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-5">
                <View>
                  <Text
                    className="text-xl font-groteskBold"
                    style={{ color: colors.text }}
                  >
                    Select Destination
                  </Text>
                  <Text
                    className="text-sm mt-1 font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    Where would you like to go?
                  </Text>
                </View>
                <TouchableOpacity
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.border }}
                  onPress={() => setToModalVisible(false)}
                >
                  <X size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Search Input */}
              <View
                className="relative mb-4 flex flex-row items-center px-4 rounded-xl gap-4"
                style={{
                  borderColor: colors.border,
                  backgroundColor:
                    actualTheme === "dark" ? colors.card : "#FFFFFF",
                }}
              >
                <Search size={18} color={colors.mutedText} className="" />
                <TextInput
                  className="h-12  text-base font-geist"
                  placeholder="Search destinations..."
                  placeholderTextColor={colors.mutedText}
                  value={toSearch}
                  onChangeText={setToSearch}
                  autoFocus
                  style={{
                    color: colors.text,
                  }}
                />
              </View>

              {/* All Destinations */}
              <FlatList
                data={filteredToCities}
                keyExtractor={(item) => item.value}
                showsVerticalScrollIndicator={false}
                className="mt-4"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="flex-row items-center py-4 border-b"
                    style={{ borderBottomColor: colors.border }}
                    onPress={() => {
                      setToValue(item.value)
                      setToModalVisible(false)
                    }}
                  >
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: colors.border }}
                    >
                      <MapPin size={18} color={colors.mutedText} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="font-medium font-geist"
                        style={{ color: colors.text }}
                      >
                        {item.label}
                      </Text>
                      <Text
                        className="text-sm font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        {item.state} • Ethiopia
                      </Text>
                    </View>
                    {toValue === item.value && (
                      <View
                        className="w-6 h-6 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Check size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* {showDatePicker && (
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
        />
      )} */}
    </View>
  )
}
