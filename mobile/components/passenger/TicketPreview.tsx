// TicketPreview.tsx
import React, { useEffect, useRef } from "react"
import { View, Text, Image, Animated } from "react-native"
import {
  Bus,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
  Share2,
} from "lucide-react-native"
import { format } from "date-fns"

interface TicketPreviewProps {
  ticket: {
    id: number
    userId: string
    busId: number
    date: string
    status: string
    bookingCode: string
    discount: string
    promoCode: string | null
    amountPaid: string
    totalAmount: string
    currency: string
    createdAt: string
    bus: {
      id: number
      busNumber: string
      capacity: number
      status: string
    }
    payment: {
      id: number
      status: string
      method: string
      transactionId: string
    }
    tickets: Array<{
      id: number
      seatNumber: number
      boardingStop: string
      alightingStop: string
      checkedIn: boolean
      sharedToId: string | null
    }>
  }
}

export function TicketPreview({ ticket }: TicketPreviewProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const departureDate = new Date(ticket.date)
  const bookingDate = new Date(ticket.createdAt)
  const allTickets = ticket.tickets || []
  const seatNumbers = allTickets.map((t) => t.seatNumber).join(", ")
  const seatsBooked = allTickets.length
  const isAnyShared = allTickets.some((t) => t.sharedToId)
  const boardingStop = allTickets[0]?.boardingStop || "Unknown"
  const alightingStop = allTickets[0]?.alightingStop || "Unknown"
  const origin = boardingStop
  const destination = alightingStop

  const arrivalDate = new Date(departureDate)
  arrivalDate.setHours(arrivalDate.getHours() + 5)

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: ticket.currency || "ETB",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount))
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return { color: "bg-green-500", icon: CheckCircle2, label: "Confirmed" }
      case "PENDING":
        return { color: "bg-yellow-500", icon: AlertCircle, label: "Pending" }
      case "CANCELLED":
        return { color: "bg-red-500", icon: XCircle, label: "Cancelled" }
      case "COMPLETED":
        return { color: "bg-blue-500", icon: CheckCircle2, label: "Completed" }
      default:
        return { color: "bg-gray-500", icon: AlertCircle, label: status }
    }
  }

  const statusConfig = getStatusConfig(ticket.status)
  const StatusIcon = statusConfig.icon
  const qrCodeValue = `HABESHAGO:${ticket.id}:${ticket.bookingCode}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrCodeValue)}`

  return (
    <Animated.View
      className="rounded-3xl shadow-2xl"
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <View className="rounded-3xl p-6 bg-white relative overflow-hidden">
        <View className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full -mr-16 -mt-16 opacity-50" />
        <View className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100 rounded-full -ml-12 -mb-12 opacity-50" />

        <View className="flex-row justify-between items-start mb-6">
          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-2xl font-bold text-gray-900">
                Bus Ticket
              </Text>
              {isAnyShared && (
                <View className="bg-purple-100 px-2 py-1 rounded-full">
                  <Text className="text-xs text-purple-700">Shared</Text>
                </View>
              )}
            </View>
            <Text className="text-sm text-gray-500">
              Booking: {ticket.bookingCode}
            </Text>
          </View>
          <View className="p-3 bg-orange-100 rounded-2xl">
            <Ticket size={24} color="#ea580c" />
          </View>
        </View>

        <View className="mb-8">
          <View className="flex-row items-center gap-4">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-2 h-2 rounded-full bg-green-500" />
                <Text className="text-sm text-gray-600">From</Text>
              </View>
              <Text className="text-lg font-semibold text-gray-900">
                {origin}
              </Text>
              <Text className="text-xs text-gray-500 mt-1 flex-row items-center">
                <MapPin size={12} color="#6b7280" /> {boardingStop}
              </Text>
            </View>

            <View className="items-center">
              <Bus size={20} color="#f97316" />
              <View className="w-16 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 my-1" />
            </View>

            <View className="flex-1 items-end">
              <View className="flex-row items-center justify-end gap-2 mb-2">
                <Text className="text-sm text-gray-600">To</Text>
                <View className="w-2 h-2 rounded-full bg-red-500" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 text-right">
                {destination}
              </Text>
              <Text className="text-xs text-gray-500 mt-1 flex-row items-center justify-end gap-1">
                <MapPin size={12} color="#6b7280" /> {alightingStop}
              </Text>
            </View>
          </View>
        </View>

        <View className="grid grid-cols-2 gap-4 mb-6">
          <View className="p-3 bg-gray-50 rounded-xl">
            <View className="flex-row items-center gap-2 mb-1">
              <Calendar size={16} color="#f97316" />
              <Text className="text-xs text-gray-500">Date</Text>
            </View>
            <Text className="font-medium">
              {format(departureDate, "MMM dd, yyyy")}
            </Text>
          </View>

          <View className="p-3 bg-gray-50 rounded-xl">
            <View className="flex-row items-center gap-2 mb-1">
              <Clock size={16} color="#f97316" />
              <Text className="text-xs text-gray-500">Departure</Text>
            </View>
            <Text className="font-medium">
              {format(departureDate, "h:mm a")}
            </Text>
          </View>

          <View className="p-3 bg-gray-50 rounded-xl">
            <View className="flex-row items-center gap-2 mb-1">
              <Timer size={16} color="#f97316" />
              <Text className="text-xs text-gray-500">Arrival</Text>
            </View>
            <Text className="font-medium">{format(arrivalDate, "h:mm a")}</Text>
          </View>

          <View className="p-3 bg-gray-50 rounded-xl">
            <View className="flex-row items-center gap-2 mb-1">
              <Bus size={16} color="#f97316" />
              <Text className="text-xs text-gray-500">Bus</Text>
            </View>
            <Text className="font-medium">{ticket.bus.busNumber}</Text>
            <Text className="text-xs text-gray-500">
              Capacity: {ticket.bus.capacity}
            </Text>
          </View>
        </View>

        {allTickets.length > 0 && (
          <View className="mb-6 space-y-2">
            <Text className="text-xs font-medium text-gray-500 mb-2">
              Ticket Status
            </Text>
            {allTickets.map((t, index) => (
              <View
                key={t.id}
                className="flex-row items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-medium">
                    Ticket {index + 1}
                  </Text>
                  {t.sharedToId && (
                    <View className="bg-purple-100 px-2 py-0.5 rounded-full">
                      <Text className="text-xs text-purple-700">Shared</Text>
                    </View>
                  )}
                </View>
                {t.checkedIn ? (
                  <View className="bg-green-100 px-2 py-1 rounded-full">
                    <Text className="text-xs text-green-700">Checked In</Text>
                  </View>
                ) : (
                  <View className="border border-gray-300 px-2 py-1 rounded-full">
                    <Text className="text-xs text-gray-500">
                      Not Checked In
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View className="flex-row justify-between items-center pt-4 border-t border-gray-100">
          <View>
            <Text className="text-sm text-gray-500">Total Amount</Text>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-2xl font-bold text-gray-900">
                {formatCurrency(ticket.totalAmount)}
              </Text>
              {parseFloat(ticket.discount) > 0 && (
                <View className="bg-green-500 px-2 py-0.5 rounded-full">
                  <Text className="text-xs text-white">
                    {ticket.discount}% OFF
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-xs text-gray-500 mt-1">
              Paid via {ticket.payment.method}
            </Text>
          </View>

          <View className="p-2 bg-white rounded-xl shadow-sm">
            <Image source={{ uri: qrCodeUrl }} className="w-16 h-16" />
          </View>
        </View>

        <View className="absolute top-4 right-4">
          <View
            className={`px-3 py-1 rounded-full flex-row items-center gap-1 ${statusConfig.color}`}
          >
            <StatusIcon size={12} color="#fff" />
            <Text className="text-xs text-white">{statusConfig.label}</Text>
          </View>
        </View>

        <Text className="absolute bottom-1 left-4 text-xs text-gray-400">
          Booked on {format(bookingDate, "MMM d, yyyy")}
        </Text>
      </View>
    </Animated.View>
  )
}
