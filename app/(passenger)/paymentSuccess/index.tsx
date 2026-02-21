import { useThemeContext } from "@/context/ThemeContext"
import * as FileSystem from "expo-file-system"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter } from "expo-router"
import {
  AlertCircle,
  ArrowLeft,
  Bus,
  Calendar,
  Clock,
  Copy,
  Download,
  MapPin,
  QrCode,
  Share,
  Shield,
  Ticket,
  User,
  Users,
} from "lucide-react-native"
import React, { useRef, useState } from "react"
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import QRCode from "react-native-qrcode-svg"
import { captureRef } from "react-native-view-shot"
// import Clipboard from '@react-native-clipboard/clipboard'

interface BookingDetail {
  id: string
  bookingNumber: string
  date: string
  time: string
  from: string
  to: string
  busOperator: string
  busNumber: string
  busType: string
  seats: string[]
  passengerName: string
  passengerPhone: string
  totalAmount: number
  paymentMethod: string
  bookingStatus: "confirmed" | "pending" | "cancelled"
  departureTime: string
  arrivalTime: string
  travelDuration: string
  boardingPoint: string
  droppingPoint: string
  ticketValidUntil: string
}

export default function BookingSuccessPage() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { colors, actualTheme } = useThemeContext()
  const [showQRModal, setShowQRModal] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const ticketRef = useRef<View>(null)
  const qrCodeRef = useRef(null)

  // Generate sample booking data
  const bookingData: BookingDetail = {
    id: "BK" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    bookingNumber: "ETB" + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    from: "Addis Ababa",
    to: "Adama",
    busOperator: "Express Travels",
    busNumber: "ET-7890",
    busType: "AC Sleeper (2+1)",
    seats: ["A1", "A2"],
    passengerName: "Samuel tale dejene",
    passengerPhone: "-",
    totalAmount: 40,
    paymentMethod: "Wallet",
    bookingStatus: "confirmed",
    departureTime: "08:30 AM",
    arrivalTime: "01:45 PM",
    travelDuration: "1h 30m",
    boardingPoint: "Megenagna Bus Station, Gate 3",
    droppingPoint: "Adama Central Bus Station",
    ticketValidUntil: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toLocaleDateString(),
  }

  // Generate QR code data with encryption hint for production
  const generateQRData = () => {
    const ticketData = {
      ticketId: bookingData.id,
      bookingNumber: bookingData.bookingNumber,
      passengerName: bookingData.passengerName,
      seats: bookingData.seats.join(","),
      busNumber: bookingData.busNumber,
      departure: bookingData.departureTime,
      date: bookingData.date.split(",")[0], // Get only the date part
      route: `${bookingData.from} → ${bookingData.to}`,
      timestamp: Date.now(),
      // In production, add a digital signature here
      // signature: generateSignature(bookingData.id)
    }
    return JSON.stringify(ticketData)
  }

  const qrData = generateQRData()

  const copyToClipboard = async (text: string) => {
    try {
      //   Clipboard.setString(text)
      Alert.alert("Copied!", "Booking number copied to clipboard", [
        { text: "OK" },
      ])
    } catch (error) {
      Alert.alert("Error", "Failed to copy to clipboard")
    }
  }

  const shareTicket = async () => {
    try {
      setIsSharing(true)
      if (!ticketRef.current) {
        Alert.alert("Error", "Ticket reference not found")
        return
      }

      const uri = await captureRef(ticketRef.current, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      })

      // Simple share implementation without expo-sharing
      if (Platform.OS === "web") {
        // For web, create download link
        const link = document.createElement("a")
        link.href = uri
        link.download = `ETBus_Ticket_${bookingData.bookingNumber}.png`
        link.click()
        Alert.alert(
          "Download Started",
          "Ticket is being downloaded to your device."
        )
      } else {
        // For mobile, show alert with option to save
        Alert.alert(
          "Ticket Saved",
          "Ticket image has been saved. You can now share it from your gallery.",
          [
            { text: "OK", style: "default" },
            {
              text: "Save to Gallery",
              onPress: () => downloadTicket(),
            },
          ]
        )
      }
    } catch (error) {
      console.error("Error sharing ticket:", error)
      Alert.alert("Error", "Failed to share ticket. Please try again.")
    } finally {
      setIsSharing(false)
    }
  }

  const downloadTicket = async () => {
    try {
      setIsDownloading(true)
      if (!ticketRef.current) {
        Alert.alert("Error", "Ticket reference not found")
        return
      }

      const uri = await captureRef(ticketRef.current, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      })

      const fileName = `ETBus_Ticket_${bookingData.bookingNumber}.png`
      const downloadsDir = FileSystem.documentDirectory + "Downloads/"

      // Create Downloads directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(downloadsDir)
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadsDir, {
          intermediates: true,
        })
      }

      const fileUri = downloadsDir + fileName

      await FileSystem.copyAsync({
        from: uri,
        to: fileUri,
      })

      Alert.alert("✅ Ticket Downloaded!", `Ticket saved to:\n${fileName}`, [
        { text: "OK", style: "default" },
        {
          text: "View Ticket",
          onPress: () => {
            // In production, you might want to open the file or show it in gallery
            console.log("Ticket saved at:", fileUri)
          },
        },
      ])
    } catch (error) {
      console.error("Error downloading ticket:", error)
      Alert.alert(
        "Download Failed",
        "Unable to save ticket. Please check storage permissions."
      )
    } finally {
      setIsDownloading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#10B981"
      case "pending":
        return "#F59E0B"
      case "cancelled":
        return "#EF4444"
      default:
        return colors.primary
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed ✓"
      case "pending":
        return "Pending"
      case "cancelled":
        return "Cancelled"
      default:
        return "Unknown"
    }
  }

  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toLocaleString("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const statusBarStyle =
    actualTheme === "dark" ? "light-content" : "dark-content"

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={statusBarStyle}
      />

      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* Header */}
        <LinearGradient
          colors={["#EA580C", "#F97316"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="pt-16 px-6 pb-8"
        >
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-white font-groteskBold">
                Booking Confirmed!
              </Text>
              <Text className="text-white/90 text-sm mt-1 font-geist">
                Your journey is all set 🚌
              </Text>
            </View>

            <View className="w-12">
              <Shield size={24} color="#FFFFFF" />
            </View>
          </View>
        </LinearGradient>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Ticket Preview */}
          <View className=" ">
            <View
              ref={ticketRef}
              className="overflow-hidden  shadow-2xl"
              style={{
                backgroundColor: colors.card,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              {/* Ticket Pattern Background */}
              <LinearGradient
                colors={["#EA580C", "#F97316", "#FB923C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="p-8 relative"
              >
                {/* Pattern overlay */}
                <View className="absolute inset-0 opacity-10">
                  <View className="flex-row justify-between px-4">
                    {[...Array(6)].map((_, i) => (
                      <Bus key={i} size={20} color="#FFFFFF" />
                    ))}
                  </View>
                </View>

                <View className="relative z-10">
                  {/* Ticket Header */}
                  <View className="flex-row justify-between items-start mb-6">
                    <View>
                      <Text className="text-white text-2xl font-bold font-groteskBold">
                        {bookingData.busOperator}
                      </Text>
                      <Text className="text-white/90 text-sm mt-1 font-geist">
                        Premium Service • {bookingData.busType}
                      </Text>
                    </View>
                    <View className="items-end">
                      <View className="px-3 py-1 rounded-full bg-white/20">
                        <Text className="text-white font-semibold text-xs font-geist">
                          {getStatusText(bookingData.bookingStatus)}
                        </Text>
                      </View>
                      <Text className="text-white/80 text-sm mt-3 font-geist">
                        Booking Ref
                      </Text>
                      <Text className="text-white text-xl font-bold tracking-wide font-geist">
                        {bookingData.bookingNumber}
                      </Text>
                    </View>
                  </View>

                  {/* Route Timeline */}
                  <View className="flex-row justify-between items-center mb-8">
                    <View className="items-center flex-1">
                      <Text className="text-white text-3xl font-bold font-groteskBold">
                        {bookingData.departureTime}
                      </Text>
                      <Text className="text-white/90 text-sm mt-1 font-geist">
                        {bookingData.from}
                      </Text>
                    </View>

                    <View className="items-center px-4">
                      <View className="relative">
                        <View className="h-2 bg-white/30 rounded-full w-32"></View>
                        <View className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Bus size={28} color="#FFFFFF" />
                        </View>
                      </View>
                      <View className="flex-row items-center mt-4">
                        <Clock size={18} color="#FFFFFF" />
                        <Text className="text-white font-semibold ml-2 font-geist">
                          {bookingData.travelDuration}
                        </Text>
                      </View>
                    </View>

                    <View className="items-center flex-1">
                      <Text className="text-white text-3xl font-bold font-groteskBold">
                        {bookingData.arrivalTime}
                      </Text>
                      <Text className="text-white/90 text-sm mt-1 font-geist">
                        {bookingData.to}
                      </Text>
                    </View>
                  </View>

                  {/* Quick Info Row */}
                  <View className="flex-row justify-between items-center bg-white/10 rounded-xl p-4">
                    <View className="flex-row items-center">
                      <Calendar size={18} color="#FFFFFF" />
                      <Text className="text-white ml-2 font-medium font-geist">
                        {bookingData.date.split(",")[0]}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Users size={18} color="#FFFFFF" />
                      <Text className="text-white ml-2 font-medium font-geist">
                        Seats: {bookingData.seats.join(", ")}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-white/70 text-sm font-geist">
                        Bus:
                      </Text>
                      <Text className="text-white ml-1 font-medium font-geist">
                        {bookingData.busNumber}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>

              {/* Ticket Details */}
              <View className="p-8">
                {/* Passenger & Payment Info Grid */}
                <View className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Passenger Details */}
                  <View>
                    <View className="flex-row items-center mb-4">
                      <User size={20} color={colors.primary} />
                      <Text
                        className="text-lg font-semibold ml-2 font-geist"
                        style={{ color: colors.text }}
                      >
                        Passenger Information
                      </Text>
                    </View>
                    <View className="space-y-3">
                      <View>
                        <Text
                          className="text-sm font-geist"
                          style={{ color: colors.mutedText }}
                        >
                          Full Name
                        </Text>
                        <Text
                          className="text-base font-semibold mt-1 font-geist"
                          style={{ color: colors.text }}
                        >
                          {bookingData.passengerName}
                        </Text>
                      </View>
                      <View>
                        <Text
                          className="text-sm font-geist"
                          style={{ color: colors.mutedText }}
                        >
                          Contact Number
                        </Text>
                        <Text
                          className="text-base font-semibold mt-1 font-geist"
                          style={{ color: colors.text }}
                        >
                          {bookingData.passengerPhone}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Payment Details */}
                  <View>
                    <View className="flex-row items-center mb-4">
                      <Ticket size={20} color={colors.primary} />
                      <Text
                        className="text-lg font-semibold ml-2 font-geist"
                        style={{ color: colors.text }}
                      >
                        Payment Summary
                      </Text>
                    </View>
                    <View className="space-y-2">
                      <View className="flex-row justify-between">
                        <Text
                          className="font-geist"
                          style={{ color: colors.mutedText }}
                        >
                          Fare per seat
                        </Text>
                        <Text
                          className="font-medium font-geist"
                          style={{ color: colors.text }}
                        >
                          {formatCurrency(
                            bookingData.totalAmount / bookingData.seats.length
                          )}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text
                          className="font-geist"
                          style={{ color: colors.mutedText }}
                        >
                          Seats booked
                        </Text>
                        <Text
                          className="font-medium font-geist"
                          style={{ color: colors.text }}
                        >
                          {bookingData.seats.length} ×{" "}
                          {bookingData.seats.join(", ")}
                        </Text>
                      </View>
                      <View
                        className="pt-3 border-t"
                        style={{ borderTopColor: colors.border }}
                      >
                        <View className="flex-row justify-between items-center">
                          <Text
                            className="font-semibold font-geist"
                            style={{ color: colors.text }}
                          >
                            Total Amount
                          </Text>
                          <Text className="text-2xl font-bold text-green-600 font-groteskBold">
                            {formatCurrency(bookingData.totalAmount)}
                          </Text>
                        </View>
                        <Text
                          className="text-sm mt-1 font-geist"
                          style={{ color: colors.mutedText }}
                        >
                          Paid via {bookingData.paymentMethod} •{" "}
                          {bookingData.time}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Boarding Points */}
                <View className="mb-8">
                  <View className="flex-row items-center mb-4">
                    <MapPin size={20} color={colors.primary} />
                    <Text
                      className="text-lg font-semibold ml-2 font-geist"
                      style={{ color: colors.text }}
                    >
                      Boarding & Dropping Details
                    </Text>
                  </View>
                  <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <View className="bg-transparent rounded-xl p-4">
                      <Text
                        className="text-sm font-semibold mb-2 font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        🚏 Boarding Point
                      </Text>
                      <Text
                        className="font-medium font-geist"
                        style={{ color: colors.text }}
                      >
                        {bookingData.boardingPoint}
                      </Text>
                      <Text
                        className="text-xs mt-2 font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        Report 30 minutes before departure
                      </Text>
                    </View>
                    <View className="bg-transparent rounded-xl p-4">
                      <Text
                        className="text-sm font-semibold mb-2 font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        🏁 Dropping Point
                      </Text>
                      <Text
                        className="font-medium font-geist"
                        style={{ color: colors.text }}
                      >
                        {bookingData.droppingPoint}
                      </Text>
                      <Text
                        className="text-xs mt-2 font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        Estimated arrival: {bookingData.arrivalTime}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* QR Code Section */}
                <View className="bg-transparent rounded-2xl p-6">
                  <View className="flex-row items-center justify-between mb-6">
                    <View>
                      <Text
                        className="text-lg font-semibold font-geist"
                        style={{ color: colors.text }}
                      >
                        Digital Ticket QR Code
                      </Text>
                      <Text
                        className="text-sm mt-1 font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        Valid until: {bookingData.ticketValidUntil}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowQRModal(true)}
                      className="flex-row items-center px-4 py-2 rounded-full"
                      style={{ backgroundColor: colors.primary + "15" }}
                    >
                      <QrCode size={18} color={colors.primary} />
                      <Text
                        className="font-medium ml-2 font-geist"
                        style={{ color: colors.primary }}
                      >
                        Enlarge
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center justify-center">
                    <View className="items-center">
                      <View
                        className="w-56 h-56 rounded-2xl items-center justify-center mb-4 p-6"
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderWidth: 2,
                          borderColor: colors.border,
                        }}
                      >
                        <QRCode
                          value={qrData}
                          size={180}
                          color={"#000"}
                          backgroundColor="#FFFFFF"
                          logoSize={40}
                          logoBackgroundColor="transparent"
                          getRef={(ref) => (qrCodeRef.current = ref)}
                        />
                      </View>
                      <Text
                        className="text-center text-sm font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        Scan QR at boarding • Valid for single use
                      </Text>
                      <Text
                        className="text-center text-xs mt-1 font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        Booking ID: {bookingData.bookingNumber}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="px-6 py-8">
            <View className="flex-row gap-3 mb-6">
              <TouchableOpacity
                className="flex-1 py-4 rounded-2xl items-center border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                }}
                // onPress={() => copyToClipboard(bookingData.bookingNumber)}
              >
                <Copy size={22} color={colors.primary} />
                <Text
                  className="mt-2 font-semibold font-geist"
                  style={{ color: colors.text }}
                >
                  Copy ID
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-4 rounded-2xl items-center border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                }}
                onPress={shareTicket}
                disabled={isSharing}
              >
                <Share
                  size={22}
                  color={isSharing ? colors.mutedText : colors.primary}
                />
                <Text
                  className="mt-2 font-semibold font-geist"
                  style={{
                    color: isSharing ? colors.mutedText : colors.text,
                  }}
                >
                  {isSharing ? "Saving..." : "Save & Share"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-4 rounded-2xl items-center border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                }}
                onPress={downloadTicket}
                disabled={isDownloading}
              >
                <Download
                  size={22}
                  color={isDownloading ? colors.mutedText : colors.primary}
                />
                <Text
                  className="mt-2 font-semibold font-geist"
                  style={{
                    color: isDownloading ? colors.mutedText : colors.text,
                  }}
                >
                  {isDownloading ? "Saving..." : "Download"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="py-4 rounded-2xl items-center"
              style={{ backgroundColor: colors.primary }}
              //   onPress={() => router.push("/(passenger)/bookings")}
            >
              <Text className="text-white font-semibold text-lg font-geist">
                View All Bookings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-4 rounded-2xl items-center mt-4 border"
              style={{ borderColor: colors.border }}
              onPress={() => router.push("/(passenger)/(tabs)")}
            >
              <Text
                className="font-medium font-geist"
                style={{ color: colors.text }}
              >
                Back to Home
              </Text>
            </TouchableOpacity>
          </View>

          {/* Important Notes */}
          <View className="px-6 pb-24">
            <View
              className="rounded-2xl p-6"
              style={{ backgroundColor: colors.card }}
            >
              <View className="flex-row items-center mb-4">
                <AlertCircle size={20} color={colors.primary} />
                <Text
                  className="text-lg font-semibold ml-2 font-geist"
                  style={{ color: colors.text }}
                >
                  Important Travel Information
                </Text>
              </View>

              <View className="space-y-3">
                <View className="flex-row items-start">
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center mt-0.5 mr-3"
                    style={{ backgroundColor: colors.primary + "15" }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 12 }}>
                      ①
                    </Text>
                  </View>
                  <Text
                    className="flex-1 text-sm font-geist"
                    style={{ color: colors.text }}
                  >
                    <Text className="font-semibold">Arrival Time:</Text> Please
                    arrive at least 30 minutes before departure for boarding
                    procedures.
                  </Text>
                </View>

                <View className="flex-row items-start">
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center mt-0.5 mr-3"
                    style={{ backgroundColor: colors.primary + "15" }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 12 }}>
                      ②
                    </Text>
                  </View>
                  <Text
                    className="flex-1 text-sm font-geist"
                    style={{ color: colors.text }}
                  >
                    <Text className="font-semibold">ID Required:</Text> Carry a
                    valid government-issued photo ID for verification.
                  </Text>
                </View>

                <View className="flex-row items-start">
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center mt-0.5 mr-3"
                    style={{ backgroundColor: colors.primary + "15" }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 12 }}>
                      ③
                    </Text>
                  </View>
                  <Text
                    className="flex-1 text-sm font-geist"
                    style={{ color: colors.text }}
                  >
                    <Text className="font-semibold">Cancellation:</Text>{" "}
                    Cancellations allowed up to 2 hours before departure with
                    20% fee.
                  </Text>
                </View>

                <View className="flex-row items-start">
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center mt-0.5 mr-3"
                    style={{ backgroundColor: colors.primary + "15" }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 12 }}>
                      ④
                    </Text>
                  </View>
                  <Text
                    className="flex-1 text-sm font-geist"
                    style={{ color: colors.text }}
                  >
                    <Text className="font-semibold">Support:</Text> For
                    assistance, call +251 900 123 456 or email support@etbus.com
                  </Text>
                </View>
              </View>

              <View
                className="mt-6 pt-4 border-t"
                style={{ borderTopColor: colors.border }}
              >
                <Text
                  className="text-xs text-center font-geist"
                  style={{ color: colors.mutedText }}
                >
                  This ticket is electronically generated and does not require a
                  physical printout. Keep this ticket accessible on your device
                  during travel.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Full Screen QR Code Modal */}
        <Modal
          visible={showQRModal}
          transparent={true}
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setShowQRModal(false)}
        >
          <View className="flex-1 items-center justify-center bg-black/90">
            <View className="w-[95%] max-w-md rounded-3xl overflow-hidden">
              <LinearGradient
                colors={["#EA580C", "#F97316"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="p-6"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-white text-xl font-bold font-groteskBold">
                    Scan QR Code
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowQRModal(false)}
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    <Text className="text-white text-2xl">×</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              <View
                className="p-8 items-center"
                style={{ backgroundColor: colors.card }}
              >
                <View className="items-center mb-8">
                  <Text
                    className="text-lg font-semibold mb-2 font-geist"
                    style={{ color: colors.text }}
                  >
                    Digital Boarding Pass
                  </Text>
                  <Text
                    className="text-sm text-center font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    Present this QR code to the bus operator for boarding
                  </Text>
                </View>

                <View
                  className="w-72 h-72 rounded-2xl items-center justify-center p-8 mb-6"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderWidth: 3,
                    borderColor: colors.border,
                    borderStyle: "dashed",
                  }}
                >
                  <QRCode
                    value={qrData}
                    size={220}
                    color="#1F2937"
                    backgroundColor="#FFFFFF"
                    logoSize={50}
                    logoBackgroundColor="#FFFFFF"
                    quietZone={10}
                  />
                </View>

                <View className="items-center mb-8">
                  <Text
                    className="text-2xl font-bold mb-2 font-geist"
                    style={{ color: colors.text }}
                  >
                    {bookingData.bookingNumber}
                  </Text>
                  <Text
                    className="text-sm font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    {bookingData.passengerName}
                  </Text>
                  <Text
                    className="text-sm font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    {bookingData.busOperator} • {bookingData.busNumber}
                  </Text>
                  <Text
                    className="text-sm font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    Seats: {bookingData.seats.join(", ")} •{" "}
                    {bookingData.departureTime}
                  </Text>
                </View>

                <TouchableOpacity
                  className="w-full py-4 rounded-xl items-center"
                  style={{ backgroundColor: colors.primary }}
                  onPress={() => setShowQRModal(false)}
                >
                  <Text className="text-white font-semibold text-base font-geist">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  )
}
