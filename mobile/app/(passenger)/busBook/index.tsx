import BookingConfirmation from "@/components/bus/booking-confirmation"
import BookingPage from "@/components/bus/booking-page"
import BusList from "@/components/bus/bus-list"
import BusSearchForm from "@/components/bus/bus-search-form"
import { useThemeContext } from "@/context/ThemeContext"
import { showToast } from "@/lib/showToast"
import { searchBusesAPI } from "@/service/bus.api"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

// Define the correct types based on the data structure
interface BusSchedule {
  scheduleId: number
  startTime: string
  endTime: string
  availableSeats: number
}

interface BusRoute {
  id: number
  name: string
  price: string
  currency: string
  estimatedTimeMin: number
  midPoints: string[]
}

interface BusVehicle {
  id: number
  plateNumber: string
  vin: string
  type: string
  model: string
  manufacturer: string
  year: number
  capacity: number
  vehicleImageUrl: string
  status: string
  mileage: number
  ownerName: string | null
  ownerPhone: string | null
  gpsDeviceId: string
  createdAt: string
  updatedAt: string
}

interface BusDriver {
  id: string
  userId: string
  licenseNo: string
  experience: number
  status: string
  driverLicenseUrl: string
  licenseStatus: string
  idType: string
  idFrontUrl: string
  idBackUrl: string
  idStatus: string
  verifiedById: string | null
  verifiedAt: string | null
  rejectionReason: string | null
  isOnDuty: boolean
  lastActiveAt: string | null
  rating: number
  totalTrips: number
  complaintsCount: number
  createdAt: string
}

interface BusData {
  id: number
  busNumber: string
  capacity: number
  reservedSeats: number
  currentStop: string | null
  nextDestination: string | null
  status: "ACTIVE" | "UNDER_MAINTENANCE" | "ON_TRIP" | "OFF_DUTY"
  departureTime: string | null
  estimatedArrival: string | null
  delayMinutes: number
  lastServiceDate: string
  nextServiceDate: string
  driver: BusDriver
  vehicle: BusVehicle
  route: BusRoute
}

interface BusListItem {
  bus: BusData
  nearestSchedule: BusSchedule
}

interface Booking {
  id: string
  bookingCode: string
  busId: number
  scheduleId: number
  passengerCount: number
  totalPrice: number
  status: string
  createdAt: string
}

export default function HomePage() {
  const { colors, actualTheme } = useThemeContext()
  const router = useRouter()

  const [searchParams, setSearchParams] = useState<{
    from: string
    to: string
    date: Date
    time: string
    passengers: number
  } | null>(null)

  const [buses, setBuses] = useState<BusListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<BusSchedule | null>(
    null,
  )
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Refs for scrolling
  const scrollViewRef = useRef<ScrollView>(null)
  const searchTriggeredRef = useRef(false)
  const initialLoadRef = useRef(true)

  // Animated value for highlight effect
  const highlightAnim = useRef(new Animated.Value(0)).current

  // Scroll to results when buses are loaded
  useEffect(() => {
    if (
      buses.length > 0 &&
      !isLoading &&
      searchTriggeredRef.current &&
      scrollViewRef.current
    ) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: 300,
          animated: true,
        })

        // Add highlight animation
        Animated.sequence([
          Animated.timing(highlightAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(highlightAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ]).start()

        searchTriggeredRef.current = false
      }, 500)
    }
  }, [buses, isLoading])

  const handleSearch = async (data: {
    from: string
    to: string
    date: Date
    time: string
    passengers: number
  }) => {
    const [hour, minute] = data.time.split(":").map(Number)
    const fullDateTime = new Date(data.date)
    fullDateTime.setHours(hour, minute, 0, 0)

    const dataNew = {
      from: data.from,
      to: data.to,
      passengers: data.passengers,
      date: fullDateTime,
      time: data.time,
    }

    setIsLoading(true)
    setSearchParams(data)
    searchTriggeredRef.current = true

    try {
      const res = await searchBusesAPI(dataNew)

      if (!res?.success) {
        console.log(res)
        showToast(res?.message || "Unable to fetch buses. Please try again.")
        setBuses([])
        return
      }

      const buses = Array.isArray(res.data) ? res.data : []
      console.log(buses)
      setBuses(buses)

      if (buses.length === 0) {
        showToast("No buses found. Try adjusting your route or date.")
      } else {
        showToast(
          `${buses.length} bus${buses.length > 1 ? "es" : ""} available.`,
        )
      }
    } catch (error) {
      console.error("Search failed:", error)
      showToast(
        "Something went wrong. Please check your connection and try again.",
      )
      setBuses([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (busId: number) => {
    const busItem = buses.find((item) => item.bus.id === busId)

    if (busItem) {
      setSelectedBus(busItem.bus)
      setSelectedSchedule(busItem.nearestSchedule)
      setIsSheetOpen(true)
    }
  }

  const handleBook = (busId: number, scheduleId: number) => {
    const busItem = buses.find((item) => item.bus.id === busId)

    if (busItem && searchParams) {
      setSelectedBus(busItem.bus)
      setSelectedSchedule(busItem.nearestSchedule)
      setIsBooking(true)
      setIsSheetOpen(false)
    }
  }

  const handleBookingComplete = (booking: Booking) => {
    setCompletedBooking(booking)
    setIsBooking(false)
    setShowConfirmation(true)
  }

  const handleCloseConfirmation = () => {
    setShowConfirmation(false)
    setCompletedBooking(null)
    setSearchParams(null)
    setBuses([])
    setSelectedBus(null)
    setSelectedSchedule(null)
  }

  const handleBackFromBooking = () => {
    setIsBooking(false)
    setSelectedBus(null)
    setSelectedSchedule(null)
  }

  const handleBookAnother = () => {
    setShowConfirmation(false)
    setCompletedBooking(null)
  }

  if (showConfirmation && completedBooking && selectedBus && searchParams) {
    return (
      <BookingConfirmation
        booking={completedBooking}
        bus={selectedBus}
        selectedDate={searchParams.date}
        selectedTime={searchParams.time}
        onClose={handleCloseConfirmation}
        onBookAnother={handleBookAnother}
        onBack={handleBackFromBooking}
      />
    )
  }

  if (isBooking && selectedBus && selectedSchedule && searchParams) {
    return (
      <BookingPage
        bus={selectedBus}
        schedule={selectedSchedule}
        selectedDate={searchParams.date}
        selectedTime={searchParams.time}
        passengers={searchParams.passengers}
        onBack={handleBackFromBooking}
        onBookingComplete={handleBookingComplete}
      />
    )
  }

  const highlightStyle = {
    backgroundColor: highlightAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", "rgba(249, 115, 22, 0.2)"],
    }),
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={actualTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6 pt-6">
          <View className="flex-row items-center flex-1">
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ backgroundColor: colors.card }}
              className="w-10 h-10 rounded-full justify-center items-center mr-3"
            >
              <Ionicons name="chevron-back" size={22} color={colors.icon} />
            </TouchableOpacity>

            <View className="flex-1">
              <Text
                style={{ color: colors.text }}
                className="text-2xl font-groteskBold"
              >
                Bus Search
              </Text>
              <Text
                style={{ color: colors.mutedText }}
                className="text-xs font-geist"
              >
                Find and book your bus tickets
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={{ backgroundColor: colors.card }}
            className="w-10 h-10 rounded-full justify-center items-center"
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={colors.icon}
            />
          </TouchableOpacity>
        </View>

        {/* Success Banner */}
        {completedBooking && !showConfirmation && (
          <Animated.View
            style={[
              highlightStyle,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            className="mb-6 p-4 rounded-2xl border shadow-lg"
          >
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 rounded-full bg-green-500 justify-center items-center mr-3">
                <Text className="text-white text-2xl font-bold">✓</Text>
              </View>
              <View className="flex-1">
                <Text
                  style={{ color: colors.text }}
                  className="text-lg font-bold"
                >
                  Booking Successful!
                </Text>
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-sm font-mono"
                >
                  Booking code: {completedBooking.bookingCode}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowConfirmation(true)}
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                }}
                className="flex-1 py-2.5 px-4 rounded-lg border items-center"
              >
                <Text
                  style={{ color: colors.primary }}
                  className="font-semibold text-sm"
                >
                  View Details
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleBookAnother}
                style={{ backgroundColor: colors.primary }}
                className="flex-1 py-2.5 px-4 rounded-lg items-center"
              >
                <Text className="text-white font-semibold text-sm">
                  Book Another
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Search Form */}
        <View className="mb-8">
          <BusSearchForm onSearch={handleSearch} isLoading={isLoading} />
        </View>

        {/* Results Section */}
        {searchParams && (
          <Animated.View style={[highlightStyle]} className="mb-8">
            {/* No Results State */}
            {!isLoading && buses.length === 0 && (
              <View
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
                className="items-center py-16 px-6 rounded-2xl border shadow-xl"
              >
                <View
                  style={{ backgroundColor: colors.background }}
                  className="w-24 h-24 rounded-full justify-center items-center mb-6"
                >
                  <Text className="text-4xl">🚌</Text>
                </View>
                <Text
                  style={{ color: colors.text }}
                  className="text-2xl font-bold mb-2"
                >
                  No buses available
                </Text>
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-base text-center mb-8 max-w-md"
                >
                  We couldn't find any buses for your selected route and date.
                  Try adjusting your search criteria.
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
                  }
                  style={{ backgroundColor: colors.primary }}
                  className="py-3.5 px-8 rounded-xl shadow-lg"
                >
                  <Text className="text-white font-semibold text-base">
                    Modify Search
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Bus List */}
            {!isLoading && buses.length > 0 && (
              <BusList
                buses={buses}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
                onBook={handleBook}
                searchParams={searchParams}
              />
            )}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
