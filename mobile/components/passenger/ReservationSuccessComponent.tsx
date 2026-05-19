// ReservationSuccessComponent.tsx
import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Share,
  Clipboard,
  Alert,
  Linking,
} from "react-native"
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Plug,
  Zap,
  BatteryCharging,
  Navigation,
  Share2,
  Download,
  Smartphone,
  Shield,
  Wifi,
  Coffee,
  CreditCard,
  Wallet,
  Coins,
  Home,
  ChevronRight,
  QrCode,
  ExternalLink,
  Clock8,
  Leaf,
  Car,
  Timer,
  Receipt,
  Sparkles,
  PartyPopper,
  Check,
  Copy,
  CalendarPlus,
  MessageCircle,
  Bell,
} from "lucide-react-native"

interface ReservationSuccessProps {
  reservationDetails: {
    stationName: string
    stationAddress: string
    stationCity: string
    pointId?: number
    pointNumber?: string
    pointPower: number
    connectorType: string
    timeSlot?: {
      startTime: Date | string
      endTime: Date | string
    }
    energyKwh: number
    totalAmount: number
    originalAmount?: number
    pointsUsed?: number
    currency: string
    paymentMethod: string
    reservationCode: string
    reservationId?: string
    qrCode?: string
    vehicleModel?: string
    vehiclePlate?: string
  }
  onNavigateToMyReservations?: () => void
  onBookAnother?: () => void
  onBackToHome?: () => void
}

const formatCurrency = (amount: number, currency: string = "ETB"): string => {
  return `${amount.toFixed(2)} ${currency}`
}

export function ReservationSuccessComponent({
  reservationDetails,
  onNavigateToMyReservations,
  onBookAnother,
  onBackToHome,
}: ReservationSuccessProps) {
  const [copied, setCopied] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const formatTimeSlot = () => {
    if (!reservationDetails.timeSlot?.startTime) {
      return "Time slot confirmed"
    }
    try {
      const startTime = new Date(reservationDetails.timeSlot.startTime)
      const endTime = new Date(reservationDetails.timeSlot.endTime)
      return `${startTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • ${startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } catch (error) {
      return "Time slot confirmed"
    }
  }

  const getTimeRemaining = () => {
    if (!reservationDetails.timeSlot?.startTime) return "Ready to charge"
    try {
      const now = new Date()
      const startTime = new Date(reservationDetails.timeSlot.startTime)
      const diffInHours = Math.ceil(
        (startTime.getTime() - now.getTime()) / (1000 * 60 * 60),
      )

      if (diffInHours <= 0) return "Starting soon"
      if (diffInHours < 24) return `In ${diffInHours} hours`
      return `In ${Math.ceil(diffInHours / 24)} days`
    } catch (error) {
      return "Ready to charge"
    }
  }

  const getSessionDuration = () => {
    if (
      !reservationDetails.timeSlot?.startTime ||
      !reservationDetails.timeSlot?.endTime
    ) {
      return null
    }
    try {
      const startTime = new Date(reservationDetails.timeSlot.startTime)
      const endTime = new Date(reservationDetails.timeSlot.endTime)
      return Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    } catch (error) {
      return null
    }
  }

  const sessionDuration = getSessionDuration()
  const serviceFee = reservationDetails.totalAmount * 0.1
  const energyCost = reservationDetails.totalAmount - serviceFee
  const co2Saved = (reservationDetails.energyKwh * 0.4).toFixed(1)

  const handleCopyCode = async () => {
    await Clipboard.setString(reservationDetails.reservationCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    const message = `🔋 I just reserved a charging spot at ${reservationDetails.stationName}! ⚡\nReservation code: ${reservationDetails.reservationCode}\nTime: ${formatTimeSlot()}`
    try {
      await Share.share({
        message,
        title: "EV Charging Reservation",
      })
    } catch (error) {
      console.log("Error sharing:", error)
    }
  }

  const handleOpenMaps = () => {
    const address = `${reservationDetails.stationAddress}, ${reservationDetails.stationCity}`
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    Linking.openURL(url)
  }

  const handleAddToCalendar = () => {
    if (!reservationDetails.timeSlot?.startTime) return

    const startTime = new Date(reservationDetails.timeSlot.startTime)
    const endTime = new Date(reservationDetails.timeSlot.endTime)

    const title = `EV Charging at ${reservationDetails.stationName}`
    const details = `Reservation Code: ${reservationDetails.reservationCode}\nPoint: ${reservationDetails.pointNumber}\nEnergy: ${reservationDetails.energyKwh} kWh`
    const location = `${reservationDetails.stationAddress}, ${reservationDetails.stationCity}`

    // Note: For iOS, you might want to use react-native-calendars or a similar library
    Alert.alert(
      "Add to Calendar",
      "This would add the event to your device calendar",
      [{ text: "OK" }],
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Success Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <View style={styles.heroIcon}>
              <PartyPopper size={40} color="#fff" />
            </View>
          </View>
          <Text style={styles.heroTitle}>Reservation Confirmed!</Text>
          <Text style={styles.heroSubtitle}>
            Your charging spot has been successfully reserved
          </Text>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Confirmed</Text>
            </View>
            <TouchableOpacity style={styles.badgeCode} onPress={handleCopyCode}>
              <Text style={styles.badgeCodeText}>
                Reservation #{reservationDetails.reservationCode}
              </Text>
              {copied ? (
                <Check size={12} color="#10b981" />
              ) : (
                <Copy size={12} color="#6b7280" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onNavigateToMyReservations}
          >
            <Car size={18} color="#10b981" />
            <Text style={styles.actionButtonText}>My Reservations</Text>
            <ChevronRight size={16} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onBookAnother}>
            <Plug size={18} color="#10b981" />
            <Text style={styles.actionButtonText}>Book Another</Text>
            <ChevronRight size={16} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Station Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <MapPin size={18} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Charging Station Details</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.stationName}>
              {reservationDetails.stationName}
            </Text>
            <View style={styles.addressRow}>
              <MapPin size={14} color="#6b7280" />
              <Text style={styles.addressText}>
                {reservationDetails.stationAddress},{" "}
                {reservationDetails.stationCity}
              </Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Plug size={20} color="#3b82f6" />
                <View>
                  <Text style={styles.statLabel}>Charging Point</Text>
                  <Text style={styles.statValue}>
                    {reservationDetails.pointNumber ||
                      `Point #${reservationDetails.pointId}`}
                  </Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <Zap size={20} color="#8b5cf6" />
                <View>
                  <Text style={styles.statLabel}>Power Output</Text>
                  <Text style={styles.statValue}>
                    {reservationDetails.pointPower} kW
                  </Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <BatteryCharging size={20} color="#10b981" />
                <View>
                  <Text style={styles.statLabel}>Connector Type</Text>
                  <Text style={styles.statValue}>
                    {reservationDetails.connectorType}
                  </Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <BatteryCharging size={20} color="#f59e0b" />
                <View>
                  <Text style={styles.statLabel}>Energy Reserved</Text>
                  <Text style={styles.statValue}>
                    {reservationDetails.energyKwh} kWh
                  </Text>
                </View>
              </View>
            </View>

            {reservationDetails.vehicleModel && (
              <View style={styles.vehicleBox}>
                <Car size={18} color="#6b7280" />
                <Text style={styles.vehicleText}>
                  {reservationDetails.vehicleModel} •{" "}
                  {reservationDetails.vehiclePlate}
                </Text>
              </View>
            )}

            <View style={styles.amenities}>
              <View style={styles.amenity}>
                <Wifi size={14} color="#6b7280" />
                <Text style={styles.amenityText}>Free WiFi</Text>
              </View>
              <View style={styles.amenity}>
                <Coffee size={14} color="#6b7280" />
                <Text style={styles.amenityText}>Coffee Shop</Text>
              </View>
              <View style={styles.amenity}>
                <Shield size={14} color="#6b7280" />
                <Text style={styles.amenityText}>24/7 Security</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Time Slot Card */}
        {reservationDetails.timeSlot?.startTime && (
          <View style={styles.card}>
            <View style={[styles.cardHeader, styles.cardHeaderBlue]}>
              <View style={styles.cardHeaderIcon}>
                <Clock size={18} color="#fff" />
              </View>
              <Text style={styles.cardTitle}>Your Time Slot</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.timeSlotContainer}>
                <View style={styles.timeSlotLeft}>
                  <View style={styles.calendarIcon}>
                    <Calendar size={28} color="#3b82f6" />
                  </View>
                  <View>
                    <Text style={styles.timeSlotLabel}>Scheduled for</Text>
                    <Text style={styles.timeSlotValue}>{formatTimeSlot()}</Text>
                  </View>
                </View>
                <View style={styles.timeRemainingBadge}>
                  <Clock8 size={12} color="#3b82f6" />
                  <Text style={styles.timeRemainingText}>
                    {getTimeRemaining()}
                  </Text>
                </View>
              </View>
              {sessionDuration && (
                <View style={styles.durationInfo}>
                  <Timer size={14} color="#3b82f6" />
                  <Text style={styles.durationText}>
                    Session duration: {sessionDuration} minutes • Please arrive
                    10 minutes before
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleAddToCalendar}
          >
            <CalendarPlus size={22} color="#10b981" />
            <Text style={styles.quickActionText}>Add to Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Bell size={22} color="#3b82f6" />
            <Text style={styles.quickActionText}>Set Reminder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleShare}>
            <Share2 size={22} color="#8b5cf6" />
            <Text style={styles.quickActionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Download size={22} color="#f59e0b" />
            <Text style={styles.quickActionText}>Receipt</Text>
          </TouchableOpacity>
        </View>

        {/* QR Code Card */}
        <View style={styles.qrCard}>
          <View style={styles.qrHeader}>
            <QrCode size={16} color="#10b981" />
            <Text style={styles.qrTitle}>Check-in QR Code</Text>
            <Text style={styles.qrSubtitle}>Scan at the charging station</Text>
          </View>
          <View style={styles.qrCode}>
            <View style={styles.qrPlaceholder}>
              <View style={styles.qrGrid}>
                {[...Array(9)].map((_, i) => (
                  <View key={i} style={styles.qrDot} />
                ))}
              </View>
              <Smartphone size={40} color="#9ca3af" />
              <Text style={styles.qrCodeText}>
                {reservationDetails.reservationCode}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.card}>
          <View style={[styles.cardHeader, styles.cardHeaderGreen]}>
            <View style={styles.cardHeaderIcon}>
              <Receipt size={18} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Payment Summary</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>
                Energy ({reservationDetails.energyKwh} kWh)
              </Text>
              <Text style={styles.paymentValue}>
                {formatCurrency(energyCost, reservationDetails.currency)}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Service Fee</Text>
              <Text style={styles.paymentValue}>
                {formatCurrency(serviceFee, reservationDetails.currency)}
              </Text>
            </View>
            {reservationDetails.pointsUsed &&
              reservationDetails.pointsUsed > 0 && (
                <View style={styles.paymentRowDiscount}>
                  <Text style={styles.paymentLabelDiscount}>
                    Points Discount
                  </Text>
                  <Text style={styles.paymentValueDiscount}>
                    -
                    {formatCurrency(
                      reservationDetails.pointsUsed,
                      reservationDetails.currency,
                    )}
                  </Text>
                </View>
              )}
            <View style={styles.paymentTotal}>
              <Text style={styles.paymentTotalLabel}>Total Paid</Text>
              <Text style={styles.paymentTotalValue}>
                {formatCurrency(
                  reservationDetails.totalAmount,
                  reservationDetails.currency,
                )}
              </Text>
            </View>
            <View style={styles.paymentMethod}>
              {reservationDetails.paymentMethod === "wallet" && (
                <Wallet size={14} color="#10b981" />
              )}
              {reservationDetails.paymentMethod === "points" && (
                <Coins size={14} color="#f59e0b" />
              )}
              {reservationDetails.paymentMethod === "card" && (
                <CreditCard size={14} color="#3b82f6" />
              )}
              <Text style={styles.paymentMethodText}>
                Paid via{" "}
                {reservationDetails.paymentMethod.charAt(0).toUpperCase() +
                  reservationDetails.paymentMethod.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Eco Impact Card */}
        <View style={styles.ecoCard}>
          <Leaf size={22} color="#10b981" />
          <View style={styles.ecoContent}>
            <Text style={styles.ecoTitle}>Your Eco Impact</Text>
            <Text style={styles.ecoValue}>
              Saved ~{co2Saved} kg CO₂ emissions
            </Text>
            <Text style={styles.ecoSubtext}>
              Equivalent to planting {Math.ceil(parseFloat(co2Saved) * 0.5)}{" "}
              trees
            </Text>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingTop: 20,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  heroIconContainer: {
    marginBottom: 16,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  badges: {
    flexDirection: "row",
    gap: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#10b981",
  },
  badgeCode: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeCodeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#3b82f6",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#10b981",
  },
  cardHeaderBlue: {
    backgroundColor: "#3b82f6",
  },
  cardHeaderGreen: {
    backgroundColor: "#10b981",
  },
  cardHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  cardContent: {
    padding: 16,
  },
  stationName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: "#6b7280",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
    width: "48%",
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  vehicleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  vehicleText: {
    fontSize: 13,
    color: "#374151",
  },
  amenities: {
    flexDirection: "row",
    gap: 16,
  },
  amenity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  amenityText: {
    fontSize: 12,
    color: "#6b7280",
  },
  timeSlotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  timeSlotLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  calendarIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  timeSlotLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  timeSlotValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  timeRemainingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timeRemainingText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#3b82f6",
  },
  durationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  durationText: {
    flex: 1,
    fontSize: 12,
    color: "#3b82f6",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  quickAction: {
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minWidth: "23%",
  },
  quickActionText: {
    fontSize: 11,
    color: "#374151",
  },
  qrCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  qrHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  qrTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginTop: 8,
  },
  qrSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  qrCode: {
    alignItems: "center",
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  qrGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 16,
  },
  qrDot: {
    width: 6,
    height: 6,
    backgroundColor: "#1f2937",
    borderRadius: 2,
  },
  qrCodeText: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#6b7280",
    marginTop: 12,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  paymentValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  paymentRowDiscount: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  paymentLabelDiscount: {
    fontSize: 13,
    color: "#10b981",
  },
  paymentValueDiscount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10b981",
  },
  paymentTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginBottom: 12,
  },
  paymentTotalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  paymentTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10b981",
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 12,
  },
  paymentMethodText: {
    fontSize: 12,
    color: "#6b7280",
  },
  ecoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#ecfdf5",
    padding: 16,
    borderRadius: 16,
  },
  ecoContent: {
    flex: 1,
  },
  ecoTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#065f46",
    marginBottom: 4,
  },
  ecoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
    marginBottom: 2,
  },
  ecoSubtext: {
    fontSize: 11,
    color: "#047857",
  },
})
