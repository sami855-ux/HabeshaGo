import { useThemeContext } from "@/context/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { format } from "date-fns"
import { LinearGradient } from "expo-linear-gradient"
import * as Print from "expo-print"
import * as Sharing from "expo-sharing"
import React, { useState } from "react"
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

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

interface BookingConfirmationProps {
  booking: Booking
  bus?: BusData
  selectedDate?: Date
  selectedTime?: string
  onClose: () => void
  onBookAnother?: () => void
  onBack: () => void
}

export default function BookingConfirmation({
  booking,
  bus,
  selectedDate = new Date(),
  selectedTime = "08:00 AM",
  onClose,
  onBookAnother,
  onBack,
}: BookingConfirmationProps) {
  const { colors } = useThemeContext()
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(true)

  // Extract data from props
  const busNumber = bus?.busNumber || `Bus #${booking.busId}`
  const currency = bus?.route?.currency || "ETB"
  const routeName = bus?.route?.name || "Addis Ababa - Hawassa"
  const [from, to] = routeName.split(" - ")
  const estimatedTimeMin = bus?.route?.estimatedTimeMin || 300
  const estimatedHours = Math.floor(estimatedTimeMin / 60)
  const estimatedMinutes = estimatedTimeMin % 60
  const durationText =
    estimatedHours > 0
      ? `${estimatedHours}h ${estimatedMinutes > 0 ? `${estimatedMinutes}m` : ""}`
      : `${estimatedMinutes}m`

  // Calculate arrival time
  const calculateArrivalTime = () => {
    if (!selectedTime) return "01:00 PM"
    const [time, modifier] = selectedTime.split(" ")
    let [hours, minutes] = time.split(":").map(Number)
    if (modifier === "PM" && hours !== 12) hours += 12
    if (modifier === "AM" && hours === 12) hours = 0
    const date = new Date()
    date.setHours(hours, minutes)
    date.setMinutes(date.getMinutes() + estimatedTimeMin)
    return format(date, "hh:mm a")
  }

  const arrivalTime = calculateArrivalTime()
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking.bookingCode}`

  const copyToClipboard = async () => {
    try {
      Alert.alert("Booking Code", booking.bookingCode, [
        {
          text: "Copy",
          onPress: () => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          },
        },
        { text: "Cancel", style: "cancel" },
      ])
    } catch (error) {
      Alert.alert("Error", "Failed to copy")
    }
  }

  const shareBooking = async () => {
    try {
      const text = `🎫 Booking Confirmed!\nCode: ${booking.bookingCode}\nRoute: ${routeName}\nDate: ${format(selectedDate, "PPP")}\nTime: ${selectedTime}\nPassengers: ${booking.passengerCount}\nTotal: ${currency} ${booking.totalPrice.toFixed(2)}`

      await Share.share({
        message: text,
        title: "My Bus Ticket",
      })
    } catch (error) {
      Alert.alert("Error", "Failed to share")
    }
  }

  const downloadTicket = async () => {
    try {
      const html = `
        <html>
          <body style="font-family: Arial; padding: 20px;">
            <h1 style="color: #f97316;">HabeshaGo</h1>
            <h2>Booking Confirmation</h2>
            <p><strong>Code:</strong> ${booking.bookingCode}</p>
            <p><strong>Bus:</strong> ${busNumber}</p>
            <p><strong>Route:</strong> ${routeName}</p>
            <p><strong>Date:</strong> ${format(selectedDate, "PPP")}</p>
            <p><strong>Time:</strong> ${selectedTime}</p>
            <p><strong>Passengers:</strong> ${booking.passengerCount}</p>
            <p><strong>Total:</strong> ${currency} ${booking.totalPrice.toFixed(2)}</p>
          </body>
        </html>
      `

      const { uri } = await Print.printToFileAsync({ html })

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri)
      } else {
        Alert.alert("Success", `Ticket saved to ${uri}`)
      }
    } catch (error) {
      Alert.alert("Error", "Failed to download ticket")
    }
  }

  const formatBookingDate = () => {
    try {
      return format(selectedDate, "EEEE, MMMM d, yyyy")
    } catch {
      return "Invalid date"
    }
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <View
        className="px-4 py-3 flex-row items-center justify-between  pt-9"
        style={{ borderColor: colors.border }}
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={onClose}
            className="w-9 h-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: colors.card }}
          >
            <Ionicons name="chevron-back" size={20} color={colors.icon} />
          </TouchableOpacity>
          <Text style={{ color: colors.mutedText }} className="font-geist">
            Back to search
          </Text>
        </View>
        <View className="bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 rounded-full">
          <Text className="text-white text-xs font-geistBold">
            Booking Confirmed
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4">
        {/* Hero Section */}
        <LinearGradient
          colors={[colors.primary, "#f59e0b"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-lg p-6 my-4"
        >
          <Text className="text-white text-2xl font-geist mb-1">
            Your journey begins
          </Text>
          <Text className="text-white/90 text-sm font-geist">
            {formatBookingDate()} · {selectedTime}
          </Text>
        </LinearGradient>

        {/* Booking Code Card */}
        <View
          className="rounded-2xl p-5 mb-4"
          style={{ backgroundColor: colors.card }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <View className="bg-orange-500/20 p-2 rounded-xl">
                <Ionicons name="ticket" size={16} color={colors.primary} />
              </View>
              <Text
                style={{ color: colors.mutedText }}
                className="text-xs font-geist"
              >
                Boarding Pass
              </Text>
            </View>
            <TouchableOpacity onPress={shareBooking}>
              <Ionicons name="share-outline" size={18} color={colors.icon} />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-3">
            <Text
              style={{ color: colors.text }}
              className="text-xl font-geistBold tracking-wider"
            >
              {booking.bookingCode}
            </Text>
            <TouchableOpacity onPress={copyToClipboard}>
              <Ionicons
                name={copied ? "checkmark" : "copy-outline"}
                size={18}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Ticket Card */}
        <View
          className="rounded-2xl shadow-xl mb-4 overflow-hidden"
          style={{ backgroundColor: colors.card }}
        >
          {/* Ticket Header */}
          <LinearGradient
            colors={[colors.primary, "#ea580c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-5 py-4"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="bg-white/20 p-2 rounded-xl">
                  <Ionicons name="bus" size={18} color="#ffffff" />
                </View>
                <View>
                  <Text className="text-white/80 text-xs font-geist">
                    E-Ticket
                  </Text>
                  <Text className="text-white font-geistBold text-lg">
                    {busNumber}
                  </Text>
                </View>
              </View>
              <View className="bg-white/20 px-2 py-1 rounded-full">
                <Text className="text-white text-xs font-geist">
                  {bus?.vehicle?.type || "Premium"}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Ticket Body */}
          <View className="p-5">
            {/* Route */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="items-center">
                <View className="w-2 h-2 rounded-full bg-green-500 mb-1" />
                <Text
                  className="font-geistBold text-base"
                  style={{ color: colors.text }}
                >
                  {from}
                </Text>
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-xs font-geist"
                >
                  {selectedTime}
                </Text>
              </View>
              <View className="flex-1 mx-2">
                <View
                  className="h-px relative"
                  style={{ backgroundColor: colors.border }}
                >
                  <View className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full">
                    <LinearGradient
                      colors={[colors.primary, "#f59e0b"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="px-2 py-1 rounded-full"
                    >
                      <Text className="text-white text-[10px] font-geist">
                        {durationText}
                      </Text>
                    </LinearGradient>
                  </View>
                </View>
              </View>
              <View className="items-center">
                <View className="w-2 h-2 rounded-full bg-blue-500 mb-1" />
                <Text
                  className="font-geistBold text-base"
                  style={{ color: colors.text }}
                >
                  {to}
                </Text>
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-xs font-geist"
                >
                  {arrivalTime}
                </Text>
              </View>
            </View>

            {/* QR Code */}
            <View className="items-center py-4 mb-4 rounded-xl">
              <View className="mb-2 rounded-lg p-2">
                <Image
                  source={{ uri: qrCodeUrl }}
                  className="w-40 h-40 rounded-lg"
                  resizeMode="contain"
                />
              </View>
              <Text
                style={{ color: colors.text }}
                className="text-sm font-geistMedium mb-1"
              >
                Show this QR code at the boarding gate
              </Text>
              <Text
                style={{ color: colors.mutedText }}
                className="text-xs font-geist"
              >
                Scan for quick check-in
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={downloadTicket}
                className="flex-1 items-center py-3 rounded-xl border"
                style={{ borderColor: colors.border }}
              >
                <Ionicons
                  name="download-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text
                  className="text-xs font-geist mt-1"
                  style={{ color: colors.text }}
                >
                  Download
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Print", "Print feature coming soon")
                }
                className="flex-1 items-center py-3 rounded-xl border"
                style={{ borderColor: colors.border }}
              >
                <Ionicons
                  name="print-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text
                  style={{ color: colors.text }}
                  className="text-xs font-geist mt-1"
                >
                  Print
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Email", "Email feature coming soon")
                }
                className="flex-1 items-center py-3 rounded-xl border"
                style={{ borderColor: colors.border }}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text
                  style={{ color: colors.text }}
                  className="text-xs font-geist mt-1"
                >
                  Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={shareBooking}
                className="flex-1 items-center py-3 rounded-xl border"
                style={{ borderColor: colors.border }}
              >
                <Ionicons
                  name="share-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text
                  style={{ color: colors.text }}
                  className="text-xs font-geist mt-1"
                >
                  Share
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ticket Footer */}
          <View
            className="px-5 py-3 border-t"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="phone-portrait-outline"
                  size={14}
                  color={colors.primary}
                />
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-xs font-geist"
                >
                  Mobile ticket - No print required
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="shield-checkmark" size={12} color="#22c55e" />
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-xs font-geist"
                >
                  Verified
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View
          className="rounded-2xl shadow-xl mb-4 overflow-hidden"
          style={{ backgroundColor: colors.card }}
        >
          <LinearGradient
            colors={["#1f2937", "#111827"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-5 py-4"
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="card-outline" size={18} color="#ffffff" />
              <Text className="text-white font-geistBold">Payment Summary</Text>
            </View>
          </LinearGradient>
          <View className="p-5">
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text
                  style={{ color: colors.mutedText }}
                  className="font-geist"
                >
                  Base fare
                </Text>
                <Text
                  style={{ color: colors.text }}
                  className="font-geistMedium"
                >
                  {currency} {(booking.totalPrice * 0.85).toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text
                  style={{ color: colors.mutedText }}
                  className="font-geist"
                >
                  Service fee
                </Text>
                <Text className="text-green-600 font-geistMedium">Free</Text>
              </View>
              <View className="flex-row justify-between">
                <Text
                  style={{ color: colors.mutedText }}
                  className="font-geist"
                >
                  Taxes
                </Text>
                <Text
                  style={{ color: colors.text }}
                  className="font-geistMedium"
                >
                  {currency} {(booking.totalPrice * 0.15).toFixed(2)}
                </Text>
              </View>
              <View
                className="h-px my-2"
                style={{ backgroundColor: colors.border }}
              />
              <View className="flex-row justify-between">
                <Text style={{ color: colors.text }} className="font-geistBold">
                  Total
                </Text>
                <Text
                  style={{ color: colors.primary }}
                  className="font-groteskBold text-lg"
                >
                  {currency} {booking.totalPrice.toFixed(2)}
                </Text>
              </View>
              <View
                className="p-3 rounded-lg mt-2"
                style={{ backgroundColor: colors.success + "20" }}
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.success}
                  />
                  <Text
                    style={{ color: colors.success }}
                    className="text-sm font-geistMedium"
                  >
                    Payment Successful
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Journey Details */}
        <View
          className="rounded-2xl shadow-xl mb-4 p-5"
          style={{ backgroundColor: colors.card }}
        >
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="map-outline" size={18} color={colors.primary} />
            <Text style={{ color: colors.text }} className="font-geistBold">
              Journey Details
            </Text>
          </View>
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="people-outline"
                  size={14}
                  color={colors.mutedText}
                />
                <Text
                  style={{ color: colors.mutedText }}
                  className="font-geist"
                >
                  Passengers
                </Text>
              </View>
              <Text style={{ color: colors.text }} className="font-geistMedium">
                {booking.passengerCount}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={colors.mutedText}
                />
                <Text
                  style={{ color: colors.mutedText }}
                  className="font-geist"
                >
                  Date
                </Text>
              </View>
              <Text style={{ color: colors.text }} className="font-geistMedium">
                {format(selectedDate, "MMM d, yyyy")}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={colors.mutedText}
                />
                <Text
                  style={{ color: colors.mutedText }}
                  className="font-geist"
                >
                  Time
                </Text>
              </View>
              <Text style={{ color: colors.text }} className="font-geistMedium">
                {selectedTime}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="bus-outline"
                  size={14}
                  color={colors.mutedText}
                />
                <Text
                  style={{ color: colors.mutedText }}
                  className="font-geist"
                >
                  Bus
                </Text>
              </View>
              <Text style={{ color: colors.text }} className="font-geistMedium">
                {busNumber}
              </Text>
            </View>
            {bus?.driver?.rating && (
              <View className="flex-row justify-between">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text
                    style={{ color: colors.mutedText }}
                    className="font-geist"
                  >
                    Rating
                  </Text>
                </View>
                <Text
                  style={{ color: colors.text }}
                  className="font-geistMedium"
                >
                  {bus.driver.rating} ★
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Amenities Preview */}
        {bus?.vehicle && (
          <View
            className="rounded-2xl shadow-xl mb-4 p-5"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row items-center gap-2 mb-4">
              <Ionicons name="wifi-outline" size={18} color={colors.primary} />
              <Text style={{ color: colors.text }} className="font-geistBold">
                Amenities
              </Text>
            </View>
            <View className="flex-row justify-between">
              {[
                { icon: "wifi-outline", label: "WiFi" },
                { icon: "wind-outline", label: "AC" },
                { icon: "cafe-outline", label: "Snacks" },
                { icon: "battery-charging-outline", label: "Charging" },
              ].map((item, i) => (
                <View key={i} className="items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mb-1"
                    style={{ backgroundColor: colors.background }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={18}
                      color={colors.mutedText}
                    />
                  </View>
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-xs font-geist"
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Support Card */}
        <LinearGradient
          colors={[colors.primary, "#ea580c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl p-5 mb-4"
        >
          <Text className="text-white font-geistBold text-lg mb-1">
            Need help?
          </Text>
          <Text className="text-white/80 text-sm font-geist mb-4">
            24/7 customer support
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity className="flex-1 bg-white/20 py-3 rounded-xl flex-row items-center justify-center gap-2">
              <Ionicons name="call-outline" size={16} color="#ffffff" />
              <Text className="text-white font-geistMedium text-sm">Call</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-white/20 py-3 rounded-xl flex-row items-center justify-center gap-2">
              <Ionicons name="mail-outline" size={16} color="#ffffff" />
              <Text className="text-white font-geistMedium text-sm">Email</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-white/20 py-3 rounded-xl flex-row items-center justify-center gap-2">
              <Ionicons name="chatbubble-outline" size={16} color="#ffffff" />
              <Text className="text-white font-geistMedium text-sm">Chat</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Book Another Button */}
        <TouchableOpacity
          onPress={onBookAnother || onClose}
          className="py-4 rounded-xl mb-8"
        >
          <LinearGradient
            colors={[colors.primary, "#f59e0b"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 rounded-xl"
          >
            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-white font-geistBold text-base">
                Book Another Ticket
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}
