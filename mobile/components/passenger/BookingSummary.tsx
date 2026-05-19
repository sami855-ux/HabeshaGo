// BookingSummary.tsx
import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native"
import {
  Plug,
  Coins,
  CreditCard,
  Wallet,
  Info,
  Leaf,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Clock,
  Shield,
  Zap,
} from "lucide-react-native"

const { height: SCREEN_HEIGHT } = Dimensions.get("window")

interface ChargingPoint {
  id: number
  slotNumber: string
  connectorType: string
  powerKw: number
  status: string
  chargingSpeed: string
}

interface Vehicle {
  id: number
  manufacturer: string
  model: string
  connectorType: string
  capacity: number
  plateNumber: string
  year: number
}

interface TimeSlot {
  id: string
  startTime: Date
  endTime: Date
  isAvailable: boolean
}

interface BookingSummaryProps {
  selectedPoint: ChargingPoint | null
  energyKwh: number
  pricePerKwh: number
  stationData: any
  pointsBalance: number
  walletBalance: number
  selectedTimeSlot: TimeSlot | null
  estimatedTimeMin?: number
  applyPoints: boolean
  setApplyPoints: (value: boolean) => void
  paymentMethod: "wallet" | "points" | "card"
  setPaymentMethod: (method: "wallet" | "points" | "card") => void
  totalAmount: number
  pointsToUseAmount: number
  isBooking: boolean
  bookingSuccess: boolean
  pointsPaymentSuccess: boolean
  walletLoading: boolean
  onOpenPayment: () => void
  onRefreshBalances: () => void
  selectedVehicle?: Vehicle | null
}

export function formatCurrencyIntl(amount: number, currency: string = "ETB") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const formatTimeRange = (slot: TimeSlot | null): string => {
  if (!slot) return "Not selected"
  return `${slot.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${slot.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
}

export function BookingSummary({
  selectedPoint,
  energyKwh,
  pricePerKwh,
  stationData,
  pointsBalance,
  walletBalance,
  selectedTimeSlot,
  estimatedTimeMin,
  applyPoints,
  setApplyPoints,
  paymentMethod,
  setPaymentMethod,
  totalAmount,
  pointsToUseAmount,
  isBooking,
  bookingSuccess,
  pointsPaymentSuccess,
  walletLoading,
  onOpenPayment,
  onRefreshBalances,
  selectedVehicle,
}: BookingSummaryProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current
  const [showPointsInfo, setShowPointsInfo] = useState(false)

  const subtotal = energyKwh * pricePerKwh
  const pointsValue = pointsBalance * 0.5
  const pointsNeededForDiscount = Math.ceil(pointsToUseAmount / 0.5)

  const isWalletInsufficient =
    paymentMethod === "wallet" && walletBalance < totalAmount
  const isPointsInsufficient = paymentMethod === "points" && pointsBalance === 0
  const isVehicleCompatible =
    selectedVehicle && selectedPoint
      ? selectedVehicle.connectorType === selectedPoint.connectorType
      : true
  const isTimeSlotSelected = selectedTimeSlot !== null

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const getButtonText = () => {
    if (isBooking) return "Processing..."
    if (!selectedPoint) return "Select a Charging Point"
    if (!isTimeSlotSelected) return "Select a Time Slot"
    if (!isVehicleCompatible) return "Vehicle Incompatible"
    if (paymentMethod === "points") {
      if (pointsBalance === 0) return "No Points Available"
      if (!applyPoints) return "Apply Points First"
      return `Pay with Points (${pointsBalance.toLocaleString()} pts)`
    }
    if (paymentMethod === "wallet" && walletBalance < totalAmount) {
      return `Insufficient Balance - Need ${formatCurrencyIntl(totalAmount - walletBalance)} More`
    }
    return `Pay ${formatCurrencyIntl(totalAmount)}`
  }

  const isButtonDisabled = () => {
    if (!selectedPoint) return true
    if (!isTimeSlotSelected) return true
    if (isBooking) return true
    if (bookingSuccess) return true
    if (pointsPaymentSuccess) return true
    if (walletLoading) return true
    if (!isVehicleCompatible) return true
    if (paymentMethod === "points") {
      if (pointsBalance === 0) return true
      if (!applyPoints) return true
    }
    if (paymentMethod === "wallet" && walletBalance < totalAmount) return true
    return false
  }

  const handlePaymentMethodChange = (method: "wallet" | "points" | "card") => {
    setPaymentMethod(method)
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Booking Summary</Text>
          <Text style={styles.cardSubtitle}>
            Review and confirm your charging session
          </Text>
        </View>

        <ScrollView
          style={styles.cardContent}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.contentContainer}
        >
          {selectedPoint ? (
            <View style={styles.contentWrapper}>
              {/* Compatibility Warning */}
              {!isVehicleCompatible && selectedVehicle && (
                <View style={styles.warningAlert}>
                  <AlertCircle size={16} color="#dc2626" />
                  <Text style={styles.warningText}>
                    Your {selectedVehicle.manufacturer} {selectedVehicle.model}{" "}
                    requires {selectedVehicle.connectorType} connector, but this
                    point has {selectedPoint.connectorType}
                  </Text>
                </View>
              )}

              {/* Time Slot Warning */}
              {!isTimeSlotSelected && (
                <View style={styles.warningAlertSoft}>
                  <Clock size={16} color="#d97706" />
                  <Text style={styles.warningTextSoft}>
                    Please select a time slot for your charging session
                  </Text>
                </View>
              )}

              {/* Security Notice */}
              {paymentMethod === "points" && applyPoints && (
                <View style={styles.securityAlert}>
                  <Shield size={16} color="#2563eb" />
                  <Text style={styles.securityText}>
                    Points payment requires wallet password verification for
                    security
                  </Text>
                </View>
              )}

              {/* Selected Point Card */}
              <View style={styles.selectedPointCard}>
                <View style={styles.selectedPointHeader}>
                  <View>
                    <Text style={styles.selectedPointNumber}>
                      Point {selectedPoint.slotNumber}
                    </Text>
                    <Text style={styles.selectedPointDetails}>
                      {selectedPoint.connectorType} • {selectedPoint.powerKw} kW
                    </Text>
                  </View>
                  {selectedVehicle && (
                    <View
                      style={[
                        styles.compatibilityBadge,
                        isVehicleCompatible
                          ? styles.compatibilityBadgeSuccess
                          : styles.compatibilityBadgeError,
                      ]}
                    >
                      <Text
                        style={[
                          styles.compatibilityBadgeText,
                          isVehicleCompatible
                            ? styles.compatibilityTextSuccess
                            : styles.compatibilityTextError,
                        ]}
                      >
                        {isVehicleCompatible ? "Compatible" : "Incompatible"}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Vehicle Info */}
                {selectedVehicle && (
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleInfoText}>
                      Vehicle: {selectedVehicle.manufacturer}{" "}
                      {selectedVehicle.model} • {selectedVehicle.plateNumber}
                      <Text style={styles.vehicleConnector}>
                        {" "}
                        ({selectedVehicle.connectorType})
                      </Text>
                    </Text>
                  </View>
                )}

                {/* Time Slot Info */}
                <View style={styles.timeSlotInfo}>
                  <Clock
                    size={14}
                    color={selectedTimeSlot ? "#10b981" : "#d97706"}
                  />
                  <Text style={styles.timeSlotLabel}>Time Slot:</Text>
                  <Text
                    style={[
                      styles.timeSlotValue,
                      selectedTimeSlot
                        ? styles.timeSlotValueSuccess
                        : styles.timeSlotValueWarning,
                    ]}
                  >
                    {formatTimeRange(selectedTimeSlot)}
                  </Text>
                </View>

                {estimatedTimeMin && selectedTimeSlot && (
                  <Text style={styles.estimatedDuration}>
                    Estimated charging duration: {estimatedTimeMin} minutes
                  </Text>
                )}

                {/* Cost Breakdown */}
                <View style={styles.costBreakdown}>
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>
                      Energy ({energyKwh} kWh) ×{" "}
                      {formatCurrencyIntl(pricePerKwh)}/kWh
                    </Text>
                    <Text style={styles.costValue}>
                      {formatCurrencyIntl(subtotal)}
                    </Text>
                  </View>

                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Service Fee</Text>
                    <Text style={styles.costValueFree}>FREE</Text>
                  </View>

                  {/* Points Section */}
                  <TouchableOpacity
                    style={[
                      styles.pointsCard,
                      applyPoints && styles.pointsCardActive,
                    ]}
                    onPress={() =>
                      pointsBalance > 0 && setApplyPoints(!applyPoints)
                    }
                  >
                    <View style={styles.pointsLeft}>
                      <Coins
                        size={18}
                        color={applyPoints ? "#065f46" : "#10b981"}
                      />
                      <View>
                        <Text style={styles.pointsTitle}>HabeshaGo Points</Text>
                        <Text style={styles.pointsBalance}>
                          {pointsBalance.toLocaleString()} pts available (
                          {formatCurrencyIntl(pointsValue)})
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.pointsButton,
                        applyPoints && styles.pointsButtonActive,
                        pointsBalance === 0 && styles.pointsButtonDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pointsButtonText,
                          applyPoints && styles.pointsButtonTextActive,
                        ]}
                      >
                        {applyPoints
                          ? `-${formatCurrencyIntl(pointsToUseAmount)}`
                          : "Apply Points"}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {applyPoints && pointsToUseAmount > 0 && (
                    <Animated.View style={styles.pointsDiscount}>
                      <Text style={styles.pointsDiscountText}>
                        Points discount applied (
                        {pointsNeededForDiscount.toLocaleString()} pts)
                      </Text>
                      <Text style={styles.pointsDiscountValue}>
                        -{formatCurrencyIntl(pointsToUseAmount)}
                      </Text>
                    </Animated.View>
                  )}

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>
                      {formatCurrencyIntl(totalAmount)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Payment Methods */}
              <View style={styles.paymentSection}>
                <View style={styles.paymentHeader}>
                  <CreditCard size={16} color="#10b981" />
                  <Text style={styles.paymentTitle}>Select Payment Method</Text>
                  <TouchableOpacity
                    onPress={onRefreshBalances}
                    disabled={walletLoading}
                  >
                    <RefreshCw size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* Wallet Payment */}
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === "wallet" && styles.paymentOptionSelected,
                  ]}
                  onPress={() => handlePaymentMethodChange("wallet")}
                >
                  <View style={styles.paymentOptionLeft}>
                    <View style={styles.radioOuter}>
                      {paymentMethod === "wallet" && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <Wallet size={18} color="#10b981" />
                    <Text style={styles.paymentOptionTitle}>
                      HabeshaGo Wallet
                    </Text>
                  </View>
                  <View style={styles.paymentOptionRight}>
                    <Text style={styles.paymentOptionBalance}>
                      {formatCurrencyIntl(walletBalance)}
                    </Text>
                    <Text style={styles.paymentOptionAvailable}>available</Text>
                  </View>
                </TouchableOpacity>

                {isWalletInsufficient && (
                  <Text style={styles.insufficientText}>
                    Insufficient balance. Please load funds or use another
                    method.
                  </Text>
                )}

                {/* Points Payment */}
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === "points" && styles.paymentOptionSelected,
                    pointsBalance === 0 && styles.paymentOptionDisabled,
                  ]}
                  onPress={() =>
                    pointsBalance > 0 && handlePaymentMethodChange("points")
                  }
                  disabled={pointsBalance === 0}
                >
                  <View style={styles.paymentOptionLeft}>
                    <View style={styles.radioOuter}>
                      {paymentMethod === "points" && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <Coins size={18} color="#10b981" />
                    <Text style={styles.paymentOptionTitle}>
                      HabeshaGo Points
                    </Text>
                  </View>
                  <View style={styles.paymentOptionRight}>
                    <Text style={styles.paymentOptionBalance}>
                      {pointsBalance.toLocaleString()} pts
                    </Text>
                    <Text style={styles.paymentOptionAvailable}>
                      Value: {formatCurrencyIntl(pointsValue)}
                    </Text>
                  </View>
                </TouchableOpacity>

                {paymentMethod === "points" && (
                  <View style={styles.pointsSecurityNote}>
                    <Shield size={12} color="#2563eb" />
                    <Text style={styles.pointsSecurityText}>
                      Wallet password required for security verification
                    </Text>
                  </View>
                )}

                {paymentMethod === "points" &&
                  !applyPoints &&
                  pointsBalance > 0 && (
                    <Text style={styles.applyPointsHint}>
                      Click &quot;Apply Points&quot; above to use your points
                    </Text>
                  )}

                {/* Card Payment */}
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === "card" && styles.paymentOptionSelected,
                  ]}
                  onPress={() => handlePaymentMethodChange("card")}
                >
                  <View style={styles.paymentOptionLeft}>
                    <View style={styles.radioOuter}>
                      {paymentMethod === "card" && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <CreditCard size={18} color="#10b981" />
                    <Text style={styles.paymentOptionTitle}>Chapa Payment</Text>
                  </View>
                  <View style={styles.paymentOptionRight}>
                    <Text style={styles.paymentOptionCardText}>
                      Visa • MC • Amex
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Info Alerts */}
              <View style={styles.infoAlert}>
                <Info size={14} color="#065f46" />
                <Text style={styles.infoAlertText}>
                  Idle fee of{" "}
                  {formatCurrencyIntl(
                    parseFloat(
                      stationData?.tariffs?.[0]?.idleFeePerMinute || "0.5",
                    ),
                  )}
                  /min applies after 10 minutes grace period.
                </Text>
              </View>

              <View style={styles.greenAlert}>
                <Leaf size={14} color="#10b981" />
                <Text style={styles.greenAlertText}>Green Energy Session</Text>
                <View style={styles.renewableBadge}>
                  <Text style={styles.renewableBadgeText}>100% Renewable</Text>
                </View>
              </View>

              {/* Success Messages */}
              {bookingSuccess && (
                <Animated.View style={styles.successAlert}>
                  <CheckCircle size={16} color="#10b981" />
                  <Text style={styles.successText}>
                    Session started successfully! Your charging is now active.
                  </Text>
                </Animated.View>
              )}

              {pointsPaymentSuccess && (
                <Animated.View style={styles.pointsSuccessAlert}>
                  <Coins size={16} color="#d97706" />
                  <Text style={styles.pointsSuccessText}>
                    Payment successful! {formatCurrencyIntl(pointsToUseAmount)}{" "}
                    points redeemed.
                  </Text>
                </Animated.View>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Plug size={40} color="#9ca3af" />
              </View>
              <Text style={styles.emptyStateTitle}>
                Select a charging point
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                Choose from available spots above
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.payButton,
              isButtonDisabled() && styles.payButtonDisabled,
            ]}
            onPress={onOpenPayment}
            disabled={isButtonDisabled()}
          >
            <Text style={styles.payButtonText}>{getButtonText()}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    flex: 1,
  },
  cardHeader: {
    padding: 16,
    backgroundColor: "#10b981",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  cardContent: {
    flex: 1,
    maxHeight: SCREEN_HEIGHT * 0.55,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  contentWrapper: {
    paddingBottom: 8,
  },
  warningAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#dc2626",
  },
  warningAlertSoft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  warningTextSoft: {
    flex: 1,
    fontSize: 12,
    color: "#d97706",
  },
  securityAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: "#2563eb",
  },
  selectedPointCard: {
    backgroundColor: "#ecfdf5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  selectedPointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  selectedPointNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  selectedPointDetails: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  compatibilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compatibilityBadgeSuccess: {
    backgroundColor: "#d1fae5",
  },
  compatibilityBadgeError: {
    backgroundColor: "#fee2e2",
  },
  compatibilityBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  compatibilityTextSuccess: {
    color: "#10b981",
  },
  compatibilityTextError: {
    color: "#dc2626",
  },
  vehicleInfo: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  vehicleInfoText: {
    fontSize: 12,
    color: "#6b7280",
  },
  vehicleConnector: {
    color: "#10b981",
  },
  timeSlotInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  timeSlotLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  timeSlotValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  timeSlotValueSuccess: {
    color: "#10b981",
  },
  timeSlotValueWarning: {
    color: "#d97706",
  },
  estimatedDuration: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 16,
    paddingLeft: 8,
  },
  costBreakdown: {
    gap: 12,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  costLabel: {
    fontSize: 13,
    color: "#6b7280",
    flex: 1,
    flexWrap: "wrap",
  },
  costValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  costValueFree: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10b981",
  },
  pointsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  pointsCardActive: {
    backgroundColor: "#d1fae5",
    borderWidth: 1,
    borderColor: "#10b981",
  },
  pointsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  pointsTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#065f46",
  },
  pointsBalance: {
    fontSize: 11,
    color: "#047857",
  },
  pointsButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  pointsButtonActive: {
    backgroundColor: "#10b981",
  },
  pointsButtonDisabled: {
    opacity: 0.5,
  },
  pointsButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#10b981",
  },
  pointsButtonTextActive: {
    color: "#fff",
  },
  pointsDiscount: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    padding: 8,
    borderRadius: 8,
  },
  pointsDiscountText: {
    fontSize: 12,
    color: "#10b981",
  },
  pointsDiscountValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#d1fae5",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10b981",
  },
  paymentSection: {
    marginTop: 20,
    gap: 12,
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
  },
  paymentOptionSelected: {
    borderColor: "#10b981",
    backgroundColor: "#ecfdf5",
  },
  paymentOptionDisabled: {
    opacity: 0.5,
  },
  paymentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10b981",
  },
  paymentOptionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  paymentOptionRight: {
    alignItems: "flex-end",
  },
  paymentOptionBalance: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  paymentOptionAvailable: {
    fontSize: 10,
    color: "#6b7280",
  },
  paymentOptionCardText: {
    fontSize: 11,
    color: "#6b7280",
  },
  insufficientText: {
    fontSize: 11,
    color: "#d97706",
    paddingHorizontal: 12,
  },
  pointsSecurityNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pointsSecurityText: {
    fontSize: 11,
    color: "#2563eb",
  },
  applyPointsHint: {
    fontSize: 11,
    color: "#d97706",
    paddingHorizontal: 12,
  },
  infoAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ecfdf5",
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  infoAlertText: {
    flex: 1,
    fontSize: 11,
    color: "#065f46",
  },
  greenAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ecfdf5",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  greenAlertText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#065f46",
    flex: 1,
  },
  renewableBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  renewableBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  successAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#d1fae5",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  successText: {
    flex: 1,
    fontSize: 12,
    color: "#065f46",
  },
  pointsSuccessAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  pointsSuccessText: {
    flex: 1,
    fontSize: 12,
    color: "#92400e",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  payButton: {
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  payButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
})
