import { useThemeContext } from "@/context/ThemeContext"
import { useAppSelector } from "@/store"
import { Ionicons } from "@expo/vector-icons"
import { format } from "date-fns"
import React, { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
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

interface BusSchedule {
  scheduleId: number
  startTime: string
  endTime: string
  availableSeats: number
}

type PaymentMethod = "CHAPA" | "WALLET" | "CARD" | "BANK"

interface PaymentStepProps {
  bus: BusData
  schedule: BusSchedule
  selectedDate: Date
  selectedTime: string
  passengers: number
  paymentMethod: PaymentMethod
  setPaymentMethod: (method: PaymentMethod) => void
  promoCode: string
  setPromoCode: (code: string) => void
  usePoints: boolean
  setUsePoints: (use: boolean) => void
  bookingData: {
    boardingStop: string
    alightingStop: string
  }
  setBookingData: (data: {
    boardingStop: string
    alightingStop: string
  }) => void
  basePrice: number
  totalPrice: number
  discountAmount: number
  pointsValue: number
  finalAmount: number
}

export default function PaymentStep({
  bus,
  schedule,
  selectedDate,
  selectedTime,
  passengers,
  paymentMethod,
  setPaymentMethod,
  promoCode,
  setPromoCode,
  usePoints,
  setUsePoints,
  bookingData,
  setBookingData,
  basePrice,
  totalPrice,
  discountAmount,
  pointsValue,
  finalAmount,
}: PaymentStepProps) {
  const { colors } = useThemeContext()
  const { wallet, loading } = useAppSelector((store) => store.wallet)
  const scrollViewRef = useRef<ScrollView>(null)
  const [showPromoInput, setShowPromoInput] = useState(false)

  // Get wallet balance - adjust based on your actual wallet structure
  const walletBalance = Number(wallet?.balance) || 0
  const walletPoints = Number(wallet?.points) || 0
  const hasEnoughBalance = walletBalance >= finalAmount
  const hasEnoughPoints = walletPoints >= 100

  // Scroll to top when component mounts
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      })
    }, 100)
  }, [])

  const formatCurrency = (amount: number) => {
    return `${bus.route.currency} ${amount.toFixed(2)}`
  }

  const renderPaymentOption = (
    method: PaymentMethod,
    icon: string,
    title: string,
    description: string,
    badge?: string,
    rightText?: string,
    rightSubtext?: string,
  ) => {
    const isSelected = paymentMethod === method
    const isWallet = method === "WALLET"

    return (
      <TouchableOpacity
        onPress={() => setPaymentMethod(method)}
        activeOpacity={0.7}
        style={{
          backgroundColor: isSelected ? colors.primary + "10" : colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
        }}
        className="border-2 rounded-xl mb-3 overflow-hidden"
      >
        <View className="p-4">
          <View className="flex-row items-center gap-3">
            {/* Radio Indicator */}
            <View
              style={{
                borderColor: isSelected ? colors.primary : colors.border,
              }}
              className="w-5 h-5 rounded-full border-2 items-center justify-center"
            >
              {isSelected && (
                <View
                  style={{ backgroundColor: colors.primary }}
                  className="w-3 h-3 rounded-full"
                />
              )}
            </View>

            {/* Icon */}
            <View
              style={{
                backgroundColor: isSelected
                  ? colors.primary + "20"
                  : colors.background,
              }}
              className="w-12 h-12 rounded-xl items-center justify-center"
            >
              <Ionicons
                name={icon as any}
                size={24}
                color={isSelected ? colors.primary : colors.icon}
              />
            </View>

            {/* Content */}
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text
                  style={{ color: colors.text }}
                  className="text-base font-geistBold"
                >
                  {title}
                </Text>
                {badge && (
                  <View
                    style={{ backgroundColor: colors.primary + "20" }}
                    className="px-2 py-0.5 rounded-full"
                  >
                    <Text
                      style={{ color: colors.primary }}
                      className="text-[10px] font-geistMedium"
                    >
                      {badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={{ color: colors.mutedText }}
                className="text-xs font-geist mt-0.5"
              >
                {description}
              </Text>

              {/* Wallet Balance */}
              {isWallet && (
                <View className="flex-row items-center gap-2 mt-2">
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Text
                        style={{
                          color: hasEnoughBalance
                            ? colors.success
                            : colors.error,
                        }}
                        className="text-sm font-geistBold"
                      >
                        {formatCurrency(walletBalance)}
                      </Text>
                      <Text
                        style={{ color: colors.mutedText }}
                        className="text-xs font-geist"
                      >
                        available
                      </Text>
                    </>
                  )}
                </View>
              )}
            </View>

            {/* Right Side */}
            {rightText && (
              <View className="items-end">
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-geistMedium"
                >
                  {rightText}
                </Text>
                {rightSubtext && (
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-[10px] font-geist"
                  >
                    {rightSubtext}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Expanded Content */}
          {isSelected && (
            <View
              style={{ borderTopColor: colors.border }}
              className="mt-3 pt-3 border-t"
            >
              {method === "CHAPA" && (
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name="lock-closed"
                    size={14}
                    color={colors.success}
                  />
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-xs font-geist"
                  >
                    256-bit SSL encrypted payment
                  </Text>
                </View>
              )}

              {method === "WALLET" && hasEnoughBalance && (
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={colors.success}
                  />
                  <Text
                    style={{ color: colors.success }}
                    className="text-xs font-geist"
                  >
                    Balance after payment:{" "}
                    {formatCurrency(walletBalance - finalAmount)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ padding: 10 }}
      >
        {/* Page Title */}
        <View className="mb-6">
          <Text
            style={{ color: colors.text }}
            className="text-2xl font-groteskBold"
          >
            Payment Method
          </Text>
          <Text
            style={{ color: colors.mutedText }}
            className="text-sm font-geist"
          >
            Choose how you'd like to pay for your journey
          </Text>
        </View>

        {/* Bus Summary Card */}
        <View
          style={{
            backgroundColor: colors.card,
          }}
          className=" rounded-2xl p-4 mb-6"
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-3 mb-3">
                <View
                  style={{ backgroundColor: colors.primary }}
                  className="w-10 h-10 rounded-lg items-center justify-center"
                >
                  <Ionicons name="bus" size={20} color="#ffffff" />
                </View>
                <View>
                  <Text
                    style={{ color: colors.text }}
                    className="text-lg font-geistBold"
                  >
                    {bus.busNumber}
                  </Text>
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-xs font-geist"
                  >
                    {bus.route.name}
                  </Text>
                </View>
              </View>

              <View className="flex-row flex-wrap gap-3 mt-2">
                <View className="flex-row items-center gap-1">
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color={colors.primary}
                  />
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-xs font-geist"
                  >
                    {format(selectedDate, "MMM d, yyyy")}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={colors.primary}
                  />
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-xs font-geist"
                  >
                    {selectedTime}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={colors.primary}
                  />
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-xs font-geist"
                  >
                    {schedule.endTime}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3 mt-2">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="people" size={14} color={colors.mutedText} />
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-xs font-geist"
                  >
                    {passengers} pax
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-xs font-geist"
                  >
                    {schedule.availableSeats} seats left
                  </Text>
                </View>
              </View>
            </View>

            <View className="items-end">
              <Text
                style={{ color: colors.mutedText }}
                className="text-xs font-geist mb-1"
              >
                Total Amount
              </Text>
              <Text
                style={{ color: colors.primary }}
                className="text-2xl font-groteskBold"
              >
                {formatCurrency(finalAmount)}
              </Text>
              <Text
                style={{ color: colors.mutedText }}
                className="text-[10px] font-geist mt-1"
              >
                Inclusive of all taxes
              </Text>
            </View>
          </View>

          {/* Midpoints */}
          {bus.route.midPoints.slice(1, -1).length > 0 && (
            <View
              style={{ backgroundColor: colors.background }}
              className="mt-3 p-3 rounded-xl"
            >
              <Text
                style={{ color: colors.mutedText }}
                className="text-xs font-geist mb-2 flex-row items-center gap-1"
              >
                <Ionicons name="location" size={12} color={colors.mutedText} />{" "}
                Intermediate stops:
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {bus.route.midPoints.slice(1, -1).map((stop, index) => (
                  <View
                    key={index}
                    style={{ borderColor: colors.border }}
                    className="px-3 py-1 rounded-full border"
                  >
                    <Text
                      style={{ color: colors.mutedText }}
                      className="text-[10px] font-geist"
                    >
                      {stop}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Payment Method Section */}
        <View
          style={{ backgroundColor: colors.card }}
          className=" rounded-2xl p-4 mb-6"
        >
          <Text
            style={{ color: colors.text }}
            className="text-lg font-groteskBold mb-4 flex-row items-center gap-2"
          >
            Select Payment Method
          </Text>

          {/* Chapa Payment */}
          {renderPaymentOption(
            "CHAPA",
            "card",
            "Chapa",
            "Pay with Card, Mobile Money, or Bank Transfer",
            "Secure",
            "Fast & Secure",
            "SSL Encrypted",
          )}

          {/* Wallet Payment */}
          {renderPaymentOption(
            "WALLET",
            "wallet",
            "HabeshaGo Wallet",
            "Pay instantly with your wallet balance",
            "Recommended",
            "Instant Payment",
            "6-digit PIN",
          )}
        </View>

        {/* Rewards & Discounts */}
        <View
          style={{ backgroundColor: colors.card }}
          className=" rounded-2xl p-4 mb-6"
        >
          <View className="flex-row items-center gap-2 mb-4">
            <Text
              style={{ color: colors.text }}
              className="text-lg font-groteskBold"
            >
              Rewards & Discounts
            </Text>
          </View>

          {/* Points Checkbox */}
          <TouchableOpacity
            onPress={() => hasEnoughPoints && setUsePoints(!usePoints)}
            disabled={!hasEnoughPoints}
            style={{
              borderColor: usePoints ? colors.primary : colors.border,
              backgroundColor: usePoints ? colors.primary + "10" : colors.card,
              opacity: !hasEnoughPoints ? 0.5 : 1,
            }}
            className="border-2 rounded-xl p-4 mb-3"
          >
            <View className="flex-row items-center gap-3">
              {/* Checkbox */}
              <View
                style={{
                  borderColor: usePoints ? colors.primary : colors.border,
                  backgroundColor: usePoints ? colors.primary : "transparent",
                }}
                className="w-5 h-5 rounded border-2 items-center justify-center"
              >
                {usePoints && (
                  <Ionicons name="checkmark" size={14} color="#ffffff" />
                )}
              </View>

              <View className="flex-1 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <Ionicons name="star" size={16} color="#f59e0b" />
                  </View>
                  <View>
                    <Text
                      style={{ color: colors.text }}
                      className="font-geistMedium"
                    >
                      Use Reward Points
                    </Text>
                    <Text
                      style={{ color: colors.mutedText }}
                      className="text-xs font-geist"
                    >
                      You have {walletPoints} points
                      {hasEnoughPoints
                        ? ` (${Math.floor(walletPoints / 100) * 50} ${bus.route.currency} value)`
                        : " - Need at least 100 points"}
                    </Text>
                  </View>
                </View>
                {usePoints && pointsValue > 0 && (
                  <View
                    style={{ backgroundColor: colors.success + "20" }}
                    className="px-2 py-1 rounded-full"
                  >
                    <Text
                      style={{ color: colors.success }}
                      className="text-xs font-geistMedium"
                    >
                      -{formatCurrency(pointsValue)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Points Info */}
          <View
            style={{
              backgroundColor: colors.primary + "10",
              borderColor: colors.primary + "30",
            }}
            className="border rounded-xl p-3"
          >
            <View className="flex-row items-start gap-2">
              <Ionicons
                name="information-circle"
                size={16}
                color={colors.primary}
              />
              <View className="flex-1">
                <Text
                  style={{ color: colors.primary }}
                  className="text-xs font-geistMedium mb-1"
                >
                  How points work
                </Text>
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-[10px] font-geist"
                >
                  • 100 points = 50 ETB discount
                  {"\n"}• Points can be combined with promo codes
                  {"\n"}• Points expire after 12 months
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Insufficient Balance Warning */}
        {paymentMethod === "WALLET" && !hasEnoughBalance && (
          <View
            style={{
              backgroundColor: colors.error + "10",
              borderColor: colors.error,
            }}
            className="border rounded-xl p-4 mb-6"
          >
            <View className="flex-row items-start gap-3">
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <View className="flex-1">
                <Text
                  style={{ color: colors.error }}
                  className="font-geistMedium mb-1"
                >
                  Insufficient Wallet Balance
                </Text>
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-sm font-geist"
                >
                  Your wallet balance ({formatCurrency(walletBalance)}) is less
                  than the payment amount ({formatCurrency(finalAmount)}).
                  Please choose another payment method or{" "}
                  <Text
                    style={{ color: colors.primary }}
                    className="font-geistMedium"
                  >
                    add funds to your wallet
                  </Text>
                  .
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Secure Payment Footer */}
        <View className="flex-row items-center justify-center gap-4 pt-4 pb-8">
          <View className="flex-row items-center gap-1">
            <Ionicons name="lock-closed" size={12} color={colors.mutedText} />
            <Text
              style={{ color: colors.mutedText }}
              className="text-[10px] font-geist"
            >
              256-bit SSL
            </Text>
          </View>
          <View
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: colors.mutedText }}
          />
          <View className="flex-row items-center gap-1">
            <Ionicons
              name="shield-checkmark"
              size={12}
              color={colors.mutedText}
            />
            <Text
              style={{ color: colors.mutedText }}
              className="text-[10px] font-geist"
            >
              PCI Compliant
            </Text>
          </View>
          <View
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: colors.mutedText }}
          />
          <View className="flex-row items-center gap-1">
            <Ionicons name="trending-up" size={12} color={colors.mutedText} />
            <Text
              style={{ color: colors.mutedText }}
              className="text-[10px] font-geist"
            >
              Fraud Protection
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
