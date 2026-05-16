// components/TicketDetailModal.tsx
import { Trip, isBusTrip, isEvTrip } from "@/types/trips"
import { useThemeContext } from "@/context/ThemeContext"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  Share,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import {
  X,
  Share2,
  Download,
  Clock,
  MapPin,
  Calendar,
  User,
  CreditCard,
  Ticket,
  Bus,
  BatteryCharging,
  ParkingCircle,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Phone,
  Mail,
  MessageCircle,
  Copy,
  CheckCheck,
  Users,
} from "lucide-react-native"
import { format } from "date-fns"

const { height: SCREEN_HEIGHT } = Dimensions.get("window")

interface TicketDetailModalProps {
  visible: boolean
  onClose: () => void
  trip: Trip
}

const STATUS_STYLE: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  CONFIRMED: { bg: "#10b981", text: "#ffffff", label: "Confirmed" },
  PENDING: { bg: "#f59e0b", text: "#ffffff", label: "Pending" },
  CANCELLED: { bg: "#ef4444", text: "#ffffff", label: "Cancelled" },
  COMPLETED: { bg: "#3b82f6", text: "#ffffff", label: "Completed" },
}

const TYPE_CONFIG: Record<string, { color: string; icon: any; label: string }> =
  {
    BUS: { color: "#2563eb", icon: Bus, label: "Bus" },
    EV: { color: "#7c3aed", icon: BatteryCharging, label: "EV Charging" },
    PARKING: { color: "#0891b2", icon: ParkingCircle, label: "Parking" },
  }

export default function TicketDetailModal({
  visible,
  onClose,
  trip,
}: TicketDetailModalProps) {
  const { colors, actualTheme } = useThemeContext()
  const isDark = actualTheme === "dark"
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"details" | "payment" | "support">(
    "details",
  )
  const [isSharing, setIsSharing] = useState(false)

  const isEv = isEvTrip(trip)

  const config = TYPE_CONFIG[trip.type] || TYPE_CONFIG.BUS
  const TypeIcon = config.icon
  const statusStyle = STATUS_STYLE[trip.status] || STATUS_STYLE.PENDING

  // Parse dates
  const departureDate = new Date(trip.date || trip.startTime || new Date())
  const bookedAt = new Date(trip.bookedAt || new Date())
  const isCancelled = trip.status === "CANCELLED"
  const isCompleted = trip.status === "COMPLETED"
  const isUsable = !isCancelled && !isCompleted

  // Format price
  const formatPrice = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount
    return `ETB ${num.toLocaleString()}`
  }

  // Get seat numbers
  const seatNumbers =
    !isEv && trip.tickets
      ? trip.tickets.map((t: any) => t.seatNumber).join(", ")
      : null

  // Handle copy booking code
  const handleCopyCode = () => {
    // Simple alert with the code to copy
    const code = trip.bookingCode || ""
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    // You can show an alert or use a toast notification
    console.log("Booking code:", code)
  }

  // Handle share
  const handleShare = async () => {
    setIsSharing(true)
    try {
      const shareText = `HabeshaGo ${config.label} Booking\n\nBooking Code: ${trip.bookingCode}\nFrom: ${trip.origin}\nTo: ${trip.destination}\nDate: ${format(departureDate, "MMM d, yyyy")}\nTime: ${format(departureDate, "h:mm a")}\nStatus: ${statusStyle.label}\nTotal: ${formatPrice(trip.totalAmount)}`

      await Share.share({
        message: shareText,
        title: `HabeshaGo ${config.label} Booking`,
      })
    } catch (error) {
      console.error("Share failed:", error)
    } finally {
      setIsSharing(false)
    }
  }

  // Handle download - simple alert
  const handleDownload = () => {
    const content = `HabeshaGo Booking Details
======================

Booking Code: ${trip.bookingCode}
Type: ${config.label}
Status: ${statusStyle.label}

Route: ${trip.origin} → ${trip.destination}
Date: ${format(departureDate, "MMMM d, yyyy")}
Time: ${format(departureDate, "h:mm a")}

${seatNumbers ? `Seats: ${seatNumbers}` : ""}
Total Amount: ${formatPrice(trip.totalAmount)}
Amount Paid: ${formatPrice(trip.amountPaid)}

Thank you for choosing HabeshaGo!`

    // Show alert with the content
    alert("Booking details:\n\n" + content)
  }

  // Render tab button
  const TabButton = ({
    tab,
    label,
    icon: Icon,
  }: {
    tab: string
    label: string
    icon: any
  }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab as any)}
      className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl"
      style={{
        backgroundColor: activeTab === tab ? colors.card : "transparent",
        shadowColor: activeTab === tab ? "#000" : "transparent",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: activeTab === tab ? 2 : 0,
      }}
    >
      <Icon
        size={16}
        color={activeTab === tab ? config.color : colors.mutedText}
      />
      <Text
        className="text-sm font-medium"
        style={{ color: activeTab === tab ? config.color : colors.mutedText }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )

  // Status badge component
  const StatusBadge = () => (
    <LinearGradient
      colors={[statusStyle.bg, statusStyle.bg + "cc"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="px-3 py-1.5 rounded-2xl"
    >
      <Text className="text-xs font-bold text-white">{statusStyle.label}</Text>
    </LinearGradient>
  )

  // Info row component
  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any
    label: string
    value: string
  }) => (
    <View
      className="flex-row items-center justify-between py-3 border-b"
      style={{ borderBottomColor: colors.border }}
    >
      <View className="flex-row items-center gap-3">
        <Icon size={16} color={colors.mutedText} />
        <Text
          className="text-sm font-geist"
          style={{ color: colors.mutedText }}
        >
          {label}
        </Text>
      </View>
      <Text
        className="text-sm font-medium font-geist"
        style={{ color: colors.text }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  )

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View
        className="flex-1 font-geist"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <BlurView
          intensity={Platform.OS === "ios" ? 20 : 40}
          tint={isDark ? "dark" : "light"}
          className="flex-1 justify-end"
        >
          <View
            className="rounded-t-3xl overflow-hidden"
            style={{
              backgroundColor: colors.background,
              maxHeight: SCREEN_HEIGHT * 0.9,
            }}
          >
            {/* Header */}
            <LinearGradient
              colors={[config.color + "dd", config.color + "aa"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-5 pt-4 pb-5"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                    <TypeIcon size={20} color="#fff" />
                  </View>
                  <View>
                    <Text className="text-white text-sm font-medium opacity-90 font-geist">
                      {config.label} Booking
                    </Text>
                    <Text className="text-white text-lg font-bold">
                      #{trip.bookingCode?.slice(0, 8) || "N/A"}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={handleShare}
                    className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
                    disabled={isSharing}
                  >
                    {isSharing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Share2 size={16} color="#fff" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleDownload}
                    className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
                  >
                    <Download size={16} color="#fff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onClose}
                    className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
                  >
                    <X size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>

            {/* Tabs */}
            <View
              className="flex-row px-4 pt-4 gap-2 border-b font-geist pb-2"
              style={{ borderBottomColor: colors.border }}
            >
              <TabButton tab="details" label="Details" icon={Ticket} />
              <TabButton tab="payment" label="Payment" icon={CreditCard} />
              <TabButton tab="support" label="Support" icon={Phone} />
            </View>

            {/* Content */}
            <ScrollView
              className="px-5"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {activeTab === "details" && (
                <View className="pt-4">
                  {/* Status */}
                  <View className="flex-row justify-between items-center mb-5">
                    <Text
                      className="text-xs font-semibold uppercase tracking-wider font-geist"
                      style={{ color: colors.mutedText }}
                    >
                      Booking Status
                    </Text>
                    <StatusBadge />
                  </View>

                  {/* Route */}
                  <View className="mb-6">
                    <View className="flex-row items-start gap-3">
                      <View className="items-center">
                        <View
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <View
                          className="w-px h-12"
                          style={{ backgroundColor: colors.border }}
                        />
                        <View
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-base font-semibold font-geist"
                          style={{ color: colors.text }}
                          numberOfLines={1}
                        >
                          {trip.origin}
                        </Text>
                        <View className="h-6" />
                        <Text
                          className="text-base font-semibold font-geist"
                          style={{ color: colors.text }}
                          numberOfLines={1}
                        >
                          {trip.destination === "N/A"
                            ? "Charging Station"
                            : trip.destination}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Details */}
                  <View
                    className="rounded-xl overflow-hidden border p-2"
                    style={{ borderColor: colors.border }}
                  >
                    <InfoRow
                      icon={Calendar}
                      label="Date"
                      value={format(departureDate, "MMMM d, yyyy")}
                    />
                    <InfoRow
                      icon={Clock}
                      label="Time"
                      value={format(departureDate, "h:mm a")}
                    />
                    {seatNumbers && (
                      <InfoRow icon={Users} label="Seats" value={seatNumbers} />
                    )}
                    <InfoRow
                      icon={MapPin}
                      label="Booking Date"
                      value={format(bookedAt, "MMM d, yyyy")}
                    />
                  </View>

                  {/* Inactive notice */}
                  {!isUsable && (
                    <View
                      className="mt-5 p-4 rounded-2xl flex-row items-center gap-3"
                      style={{ backgroundColor: statusStyle.bg + "20" }}
                    >
                      <AlertCircle size={20} color={statusStyle.bg} />
                      <Text
                        className="flex-1 text-sm"
                        style={{ color: statusStyle.bg }}
                      >
                        This booking has been {statusStyle.label.toLowerCase()}.
                        {isCompleted && " Thank you for traveling with us!"}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {activeTab === "payment" && (
                <View className="pt-4">
                  <View
                    className="rounded-xl overflow-hidden border p-2"
                    style={{ borderColor: colors.border }}
                  >
                    <InfoRow
                      icon={Ticket}
                      label="Total Amount"
                      value={formatPrice(trip.totalAmount)}
                    />
                    <InfoRow
                      icon={CheckCircle}
                      label="Amount Paid"
                      value={formatPrice(trip.amountPaid)}
                    />
                    <InfoRow
                      icon={CreditCard}
                      label="Payment Method"
                      value={trip.payment?.method || "Wallet"}
                    />
                    <InfoRow
                      icon={Calendar}
                      label="Payment Date"
                      value={format(bookedAt, "MMM d, yyyy")}
                    />
                  </View>

                  {!isCancelled && (
                    <View
                      className="mt-5 p-4 rounded-2xl flex-row items-center gap-3"
                      style={{ backgroundColor: "#10b98120" }}
                    >
                      <CheckCircle size={20} color="#10b981" />
                      <Text
                        className="flex-1 text-sm font-geist"
                        style={{ color: "#10b981" }}
                      >
                        Payment confirmed. Your booking is secure.
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {activeTab === "support" && (
                <View className="pt-4">
                  <View className="mb-5">
                    <Text
                      className="text-base font-bold mb-3"
                      style={{ color: colors.text }}
                    >
                      Need Help?
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: colors.mutedText }}
                    >
                      Our support team is available 24/7 to assist you with your
                      booking.
                    </Text>
                  </View>

                  <View className="gap-3">
                    {[
                      {
                        icon: Phone,
                        label: "Call Support",
                        value: "+251 900 123 456",
                        color: "#10b981",
                      },
                      {
                        icon: Mail,
                        label: "Email Us",
                        value: "support@habeshago.com",
                        color: "#3b82f6",
                      },
                      {
                        icon: MessageCircle,
                        label: "WhatsApp",
                        value: "+251 900 123 456",
                        color: "#25D366",
                      },
                    ].map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        className="flex-row items-center gap-4 p-4 rounded-xl border"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                        }}
                      >
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center"
                          style={{ backgroundColor: item.color + "20" }}
                        >
                          <item.icon size={18} color={item.color} />
                        </View>
                        <View className="flex-1">
                          <Text
                            className="text-sm font-medium"
                            style={{ color: colors.text }}
                          >
                            {item.label}
                          </Text>
                          <Text
                            className="text-xs"
                            style={{ color: colors.mutedText }}
                          >
                            {item.value}
                          </Text>
                        </View>
                        <ChevronRight size={16} color={colors.mutedText} />
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View className="mt-5">
                    <TouchableOpacity
                      onPress={handleCopyCode}
                      className="flex-row items-center justify-center gap-2 py-3 rounded-xl border"
                      style={{ borderColor: colors.border }}
                    >
                      {copied ? (
                        <CheckCheck size={16} color={config.color} />
                      ) : (
                        <Copy size={16} color={colors.mutedText} />
                      )}
                      <Text
                        className="text-sm font-medium"
                        style={{
                          color: copied ? config.color : colors.mutedText,
                        }}
                      >
                        {copied ? "Booking Code Copied!" : "Copy Booking Code"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Bottom Action Button */}
            {isUsable && !isCompleted && (
              <View
                className="p-4 border-t"
                style={{
                  borderTopColor: colors.border,
                  backgroundColor: colors.background,
                }}
              >
                <LinearGradient
                  colors={[config.color, config.color + "dd"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="rounded-xl overflow-hidden"
                >
                  <TouchableOpacity
                    onPress={() => {
                      onClose()
                    }}
                    className="py-3 items-center"
                  >
                    <Text className="text-white font-bold text-base">
                      Close
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}
          </View>
        </BlurView>
      </View>
    </Modal>
  )
}
