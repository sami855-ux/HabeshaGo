import { useThemeContext } from "@/context/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { format } from "date-fns"
import React, { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native"
// import BookingConfirmation from "./booking-confirmation"
import { createNewBooking } from "@/service/booking.api"
import { validatePromoCode } from "@/service/promoCode.api"
import { verifyPin } from "@/service/wallet.api"
import { useAppSelector } from "@/store"
import PaymentStep from "./payment-step"

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window")

// Types based on your data structure
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

interface Booking {
  id: string
  bookingCode: string
  busId: number
  scheduleId: number
  passengerCount: number
  totalPrice: number
  status: string
  createdAt: Date
}

type PaymentMethod = "CHAPA" | "WALLET" | "CARD" | "BANK"

interface BookingPageProps {
  bus: BusData
  schedule: BusSchedule
  selectedDate: Date
  selectedTime: string
  passengers: number
  onBack: () => void
  onBookingComplete: (booking: Booking) => void
}

// Helper function to parse balance string to number
const parseBalance = (balance: string | undefined | null): number => {
  if (!balance) return 0
  const cleaned = balance.replace(/[^0-9.]/g, "")
  return parseFloat(cleaned) || 0
}

// Format currency helper
const formatCurrency = (amount: number, currency: string = "ETB") => {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function BookingPage({
  bus,
  schedule,
  selectedDate,
  selectedTime,
  passengers,
  onBack,
  onBookingComplete,
}: BookingPageProps) {
  const { colors } = useThemeContext()
  const [step, setStep] = useState<"payment" | "pin" | "processing">("payment")
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CHAPA")
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false)
  const slideAnim = useRef(new Animated.Value(0)).current

  // Promo code state
  const [promoCode, setPromoCode] = useState("")
  const [isValidatingPromo, setIsValidatingPromo] = useState(false)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [promoSuccess, setPromoSuccess] = useState<{
    code: string
    discount: number
    promoId: string
  } | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)

  const [usePoints, setUsePoints] = useState(false)
  const [pin, setPin] = useState(["", "", "", "", "", ""])
  const [showPinError, setShowPinError] = useState(false)
  const [chapaCheckoutUrl, setChapaCheckoutUrl] = useState<string | null>(null)
  const pinInputsRef = useRef<(TextInput | null)[]>([])

  // Refs for scrolling
  const scrollViewRef = useRef<ScrollView>(null)

  // Get wallet from Redux store
  const { wallet, loading: walletLoading } = useAppSelector(
    (store) => store.wallet,
  )

  // Parse wallet balance from string to number
  const walletBalance = parseBalance(wallet?.balance)
  const walletPoints = parseFloat(wallet?.points?.toString() || "0") || 0

  // Calculate pricing
  const basePrice = parseFloat(bus.route.price) || 0
  const totalPrice = basePrice * passengers
  const serviceFee = totalPrice * 0.04 // 4% service fee
  const subtotal = totalPrice + serviceFee
  const vat = subtotal * 0.1 // 10% VAT
  const totalBeforeDiscount = subtotal + vat

  // Calculate points value based on actual wallet points
  const pointsValue =
    usePoints && walletPoints > 0
      ? Math.min(
          Math.floor(walletPoints / 100) * 50,
          totalBeforeDiscount - discountAmount,
        )
      : 0

  const pointsUsed = usePoints ? Math.floor(pointsValue / 0.5) : 0 // 100 points = 50 ETB, so 1 point = 0.5 ETB

  const finalAmount = totalBeforeDiscount - discountAmount - pointsValue
  const hasEnoughBalance = walletBalance >= finalAmount

  // Animate summary slide
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    Animated.timing(slideAnim, {
      toValue: isSummaryExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [isSummaryExpanded])

  // Validate promo code
  const validatePromo = async () => {
    setIsValidatingPromo(true)
    setPromoError(null)

    try {
      const response = await validatePromoCode({
        code: promoCode,
        totalAmount: totalBeforeDiscount,
      })

      if (response.success) {
        setPromoSuccess({
          code: response.code,
          discount: response.discount,
          promoId: response.promoId,
        })
        setDiscountAmount(response.discount)
        setPromoError(null)
        Alert.alert(
          "Success",
          `Promo code applied! You saved ${formatCurrency(response.discount, bus.route.currency)}`,
        )
      } else {
        setPromoError(response.message || "Invalid promo code")
        setDiscountAmount(0)
        setPromoSuccess(null)
        Alert.alert("Error", response.message || "Invalid promo code")
      }
    } catch (error) {
      console.error("Promo validation failed:", error)
      setPromoError(
        error.message || "Failed to validate promo code. Please try again.",
      )
      Alert.alert("Error", error.message || "Promo validation failed")
    } finally {
      setIsValidatingPromo(false)
    }
  }

  const removePromo = () => {
    setPromoCode("")
    setPromoSuccess(null)
    setDiscountAmount(0)
    setPromoError(null)
    Alert.alert("Info", "Promo code removed")
  }

  // Auto-select wallet if user has enough balance
  useEffect(() => {
    if (hasEnoughBalance && walletBalance > 0) {
      setPaymentMethod("WALLET")
    }
  }, [walletBalance, hasEnoughBalance])

  // Scroll to top when step changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: true,
    })
  }, [step])

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1)

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    setShowPinError(false)

    // Auto-focus next input if current is filled
    if (value && index < 5) {
      // Use setTimeout to ensure the state update completes before focusing
      setTimeout(() => {
        pinInputsRef.current[index + 1]?.focus()
      }, 100)
    }
  }

  const verifyWalletPin = async (enteredPin: string): Promise<boolean> => {
    try {
      const response = await verifyPin(enteredPin)
      return response
    } catch (error) {
      console.error("PIN verification failed:", error)
      return false
    }
  }

  const processChapaPayment = async () => {
    setIsLoading(true)
    setStep("processing")

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const checkoutUrl = `https://checkout.chapa.co/checkout/payment/${Math.random().toString(36).substr(2, 9)}`
      setChapaCheckoutUrl(checkoutUrl)

      await new Promise((resolve) => setTimeout(resolve, 2000))
      await completeBooking("CHAPA")
    } catch (error) {
      console.error("Chapa payment failed:", error)
      Alert.alert("Error", "Payment processing failed. Please try again.")
      setStep("payment")
    } finally {
      setIsLoading(false)
    }
  }

  const processWalletPayment = async (enteredPin: string) => {
    if (enteredPin.length !== 6) {
      setShowPinError(true)
      return
    }

    if (!hasEnoughBalance) {
      Alert.alert(
        "Insufficient Balance",
        `Your wallet balance is ${formatCurrency(walletBalance, bus.route.currency)} but payment is ${formatCurrency(finalAmount, bus.route.currency)}`,
      )
      setStep("payment")
      return
    }

    setIsLoading(true)
    setStep("processing")

    try {
      const isValid = await verifyWalletPin(enteredPin)

      if (!isValid) {
        setShowPinError(true)
        setStep("pin")
        setIsLoading(false)
        return
      }

      await completeBooking("WALLET")
    } catch (error) {
      console.error("Wallet payment failed:", error)
      Alert.alert("Error", "Payment processing failed. Please try again.")
      setStep("payment")
      setIsLoading(false)
    }
  }

  const completeBooking = async (method: PaymentMethod) => {
    try {
      const adjustedDate = new Date(selectedDate)
      adjustedDate.setHours(adjustedDate.getHours() + 4)

      const bookingData = {
        busId: bus.id,
        date: adjustedDate.toISOString(),
        totalAmount: finalAmount,
        currency: bus.route.currency,
        isPointUsed: usePoints,
        scheduleStartTime: schedule.startTime,
        seats: passengers,
      }

      if (discountAmount > 0 && promoSuccess) {
        bookingData.discount = discountAmount
        bookingData.promoCode = promoSuccess.code
      }

      if (usePoints && pointsUsed > 0) {
        bookingData.pointsUsed = pointsUsed
        bookingData.pointsConversionRate = 0.5
        bookingData.isPointUsed = true
      }

      const response = await createNewBooking(bookingData)

      if (response && "booking" in response) {
        const bookingResponse = response

        const booking = {
          id:
            bookingResponse.booking.id ||
            Math.random().toString(36).substr(2, 9),
          bookingCode:
            bookingResponse.booking.bookingCode ||
            `BUS${Date.now().toString().slice(-8)}`,
          busId: bus.id,
          scheduleId: schedule.scheduleId,
          passengerCount: passengers,
          totalPrice: finalAmount,
          status: "CONFIRMED",
          createdAt: new Date(),
        }

        if (method === "WALLET" && wallet) {
          Alert.alert(
            "Success",
            `Wallet payment successful! ${formatCurrency(finalAmount, bus.route.currency)} deducted.`,
          )
        }

        setIsLoading(false)
        setShowConfirmation(true)
        onBookingComplete(booking)

        Alert.alert("Success", "Booking confirmed successfully!")
      } else {
        throw new Error("Booking creation failed")
      }
    } catch (error) {
      console.error("Booking creation failed:", error)
      Alert.alert("Error", "Failed to create booking. Please try again.")
      setStep("payment")
      setIsLoading(false)
    }
  }

  const handlePayment = () => {
    if (paymentMethod === "WALLET") {
      if (!hasEnoughBalance) {
        Alert.alert(
          "Insufficient Balance",
          `Your wallet balance is ${formatCurrency(walletBalance, bus.route.currency)} but payment is ${formatCurrency(finalAmount, bus.route.currency)}`,
        )
        return
      }
      setStep("pin")
    } else if (paymentMethod === "CHAPA") {
      processChapaPayment()
    } else {
      setIsLoading(true)
      setStep("processing")
      setTimeout(() => {
        completeBooking(paymentMethod)
      }, 2000)
    }
  }

  const handlePinSubmit = async () => {
    const enteredPin = pin.join("")
    await processWalletPayment(enteredPin)
  }

  const toggleSummary = () => {
    setIsSummaryExpanded(!isSummaryExpanded)
  }

  //   if (showConfirmation) {
  //     return (
  //       <BookingConfirmation
  //         booking={{
  //           bookingCode: `BUS${Date.now().toString().slice(-8)}`,
  //           totalPrice: finalAmount,
  //           currency: bus.route.currency,
  //           passengers,
  //           busNumber: bus.busNumber,
  //           routeName: bus.route.name,
  //           selectedDate,
  //           selectedTime,
  //         }}
  //         onClose={onBack}
  //       />
  //     )
  //   }

  const renderStepIndicator = () => {
    const steps = [
      { key: "payment", icon: "wallet-outline" },
      { key: "pin", icon: "lock-closed-outline" },
      { key: "processing", icon: "checkmark-circle-outline" },
    ]
    const currentIndex = steps.findIndex((s) => s.key === step)

    return (
      <View className="w-full px-6 py-4">
        <View className="flex-row items-center justify-between">
          {steps.map((s, i) => {
            const isCompleted = i < currentIndex
            const isCurrent = i === currentIndex
            const isLast = i === steps.length - 1

            return (
              <React.Fragment key={s.key}>
                {/* Icon Circle */}
                <View className="items-center">
                  <View
                    style={{
                      backgroundColor: isCompleted
                        ? colors.success
                        : isCurrent
                          ? colors.primary
                          : colors.background,
                      borderColor: isCurrent
                        ? colors.primary
                        : isCompleted
                          ? colors.success
                          : colors.border,
                    }}
                    className="w-10 h-10 rounded-full border-2 items-center justify-center"
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={18} color="#ffffff" />
                    ) : (
                      <Ionicons
                        name={s.icon as any}
                        size={18}
                        color={isCurrent ? colors.primary : colors.mutedText}
                      />
                    )}
                  </View>
                </View>

                {/* Connector Line */}
                {!isLast && (
                  <View className="flex-1 mx-2">
                    <View
                      style={{
                        backgroundColor:
                          i < currentIndex ? colors.success : colors.border,
                        height: 2,
                      }}
                      className="rounded-full"
                    />
                  </View>
                )}
              </React.Fragment>
            )
          })}
        </View>
      </View>
    )
  }

  // Collapsible Summary Component
  const renderCollapsibleSummary = () => {
    const summaryHeight = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 380],
    })

    return (
      <Animated.View
        style={[
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 8,
            height: summaryHeight,
            overflow: "hidden",
          },
        ]}
      >
        {/* Pull Indicator & Header */}
        <TouchableOpacity onPress={toggleSummary} activeOpacity={0.7}>
          <View className="items-center pt-2 pb-1">
            <View
              style={{ backgroundColor: colors.border }}
              className="w-12 h-1 rounded-full"
            />
          </View>

          {/* Mini Summary - Always Visible */}
          <View className="px-5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View
                style={{ backgroundColor: colors.primary + "15" }}
                className="w-10 h-10 rounded-xl items-center justify-center"
              >
                <Ionicons name="receipt" size={20} color={colors.primary} />
              </View>
              <View>
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-xs font-geist"
                >
                  Total Amount
                </Text>
                <Text
                  style={{ color: colors.primary }}
                  className="text-xl font-groteskBold"
                >
                  {formatCurrency(finalAmount, bus.route.currency)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2">
              <View className="bg-primary/10 px-3 py-1.5 rounded-full">
                <Text
                  style={{ color: colors.primary }}
                  className="text-xs font-geistMedium"
                >
                  {passengers} {passengers === 1 ? "Pax" : "Pax"}
                </Text>
              </View>
              <Ionicons
                name={isSummaryExpanded ? "chevron-down" : "chevron-up"}
                size={20}
                color={colors.mutedText}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Expanded Summary Content */}
        {isSummaryExpanded && (
          <View className="px-5 pt-4">
            {/* Price Breakdown */}
            <View
              style={{ backgroundColor: colors.background }}
              className="rounded-xl p-4 mb-4"
            >
              <Text
                style={{ color: colors.text }}
                className="text-sm font-geistBold mb-3"
              >
                Price Breakdown
              </Text>

              <View className="gap-3">
                {/* Base Fare */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2">
                    <View className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <Text
                      style={{ color: colors.mutedText }}
                      className="text-sm font-geist"
                    >
                      Base Fare
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text
                      style={{ color: colors.mutedText }}
                      className="text-xs font-grotesk"
                    >
                      {passengers} ×{" "}
                      {formatCurrency(basePrice, bus.route.currency)}
                    </Text>
                    <Text
                      style={{ color: colors.text }}
                      className="font-grotesk"
                    >
                      {formatCurrency(totalPrice, bus.route.currency)}
                    </Text>
                  </View>
                </View>

                {/* Service Fee */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2">
                    <View className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <Text
                      style={{ color: colors.mutedText }}
                      className="text-sm font-geist"
                    >
                      Service Fee
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text
                      style={{ color: colors.mutedText }}
                      className="text-xs font-grotesk"
                    >
                      4%
                    </Text>
                    <Text
                      style={{ color: colors.text }}
                      className="font-grotesk"
                    >
                      {formatCurrency(serviceFee, bus.route.currency)}
                    </Text>
                  </View>
                </View>

                {/* VAT */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2">
                    <View className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <Text
                      style={{ color: colors.mutedText }}
                      className="text-sm font-geist"
                    >
                      VAT
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text
                      style={{ color: colors.mutedText }}
                      className="text-xs font-grotesk"
                    >
                      10%
                    </Text>
                    <Text
                      style={{ color: colors.text }}
                      className="font-grotesk"
                    >
                      {formatCurrency(vat, bus.route.currency)}
                    </Text>
                  </View>
                </View>

                {/* Subtotal */}
                <View
                  className="flex-row justify-between items-center pt-2 border-t border-dashed"
                  style={{ borderColor: colors.border }}
                >
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-sm font-geist"
                  >
                    Subtotal
                  </Text>
                  <Text style={{ color: colors.text }} className="font-grotesk">
                    {formatCurrency(totalBeforeDiscount, bus.route.currency)}
                  </Text>
                </View>

                {/* Discounts */}
                {(discountAmount > 0 || pointsValue > 0) && (
                  <View className="pt-2">
                    {discountAmount > 0 && promoSuccess && (
                      <View className="flex-row justify-between items-center mb-2">
                        <View className="flex-row items-center gap-2">
                          <View className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center">
                            <Ionicons
                              name="pricetag"
                              size={10}
                              color={colors.success}
                            />
                          </View>
                          <Text
                            style={{ color: colors.success }}
                            className="text-sm font-grotesk"
                          >
                            Promo {promoSuccess.code}
                          </Text>
                        </View>
                        <Text
                          style={{ color: colors.success }}
                          className="font-grotesk"
                        >
                          -{formatCurrency(discountAmount, bus.route.currency)}
                        </Text>
                      </View>
                    )}

                    {usePoints && pointsValue > 0 && (
                      <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center gap-2">
                          <View className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center">
                            <Ionicons name="star" size={10} color="#f59e0b" />
                          </View>
                          <Text
                            style={{ color: "#f59e0b" }}
                            className="text-sm font-geist"
                          >
                            Points ({pointsUsed} pts)
                          </Text>
                        </View>
                        <Text
                          style={{ color: "#f59e0b" }}
                          className="font-grotesk"
                        >
                          -{formatCurrency(pointsValue, bus.route.currency)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Final Total */}
              <View
                className="mt-4 pt-4 border-t-2"
                style={{ borderColor: colors.border }}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text
                      style={{ color: colors.text }}
                      className="text-sm font-groteskBold"
                    >
                      Final Total
                    </Text>
                    <Text
                      style={{ color: colors.mutedText }}
                      className="text-[10px] font-geist mt-1"
                    >
                      Inclusive of all taxes
                    </Text>
                  </View>
                  <Text
                    style={{ color: colors.primary }}
                    className="text-2xl font-groteskBold"
                  >
                    {formatCurrency(finalAmount, bus.route.currency)}
                  </Text>
                </View>
              </View>

              {/* Savings Badge */}
              {(discountAmount > 0 || pointsValue > 0) && (
                <View className="mt-3">
                  <View
                    style={{ backgroundColor: colors.success + "15" }}
                    className="flex-row items-center justify-between px-3 py-2 rounded-lg"
                  >
                    <View className="flex-row items-center gap-2">
                      <Ionicons
                        name="sparkles"
                        size={16}
                        color={colors.success}
                      />
                      <Text
                        style={{ color: colors.success }}
                        className="text-sm font-geist"
                      >
                        You saved
                      </Text>
                    </View>
                    <Text
                      style={{ color: colors.success }}
                      className="font-groteskBold"
                    >
                      {formatCurrency(
                        discountAmount + pointsValue,
                        bus.route.currency,
                      )}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Quick Journey Info */}
            <View className="flex-row justify-between px-2 pb-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="bus" size={14} color={colors.mutedText} />
                <Text
                  style={{ color: colors.text }}
                  className="text-xs font-geist"
                >
                  {bus.busNumber}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="calendar" size={14} color={colors.mutedText} />
                <Text
                  style={{ color: colors.text }}
                  className="text-xs font-geist"
                >
                  {format(selectedDate, "MMM d")}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="time" size={14} color={colors.mutedText} />
                <Text
                  style={{ color: colors.text }}
                  className="text-xs font-geist"
                >
                  {selectedTime}
                </Text>
              </View>
            </View>
          </View>
        )}
      </Animated.View>
    )
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          className="flex-1 pt-5"
          contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
        >
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={onBack}
              style={{ backgroundColor: colors.card }}
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
            >
              <Ionicons name="chevron-back" size={22} color={colors.icon} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text
                style={{ color: colors.text }}
                className="text-2xl font-groteskBold"
              >
                Complete Your Booking
              </Text>
              <Text
                style={{ color: colors.mutedText }}
                className="text-sm font-geist"
              >
                Bus {bus.busNumber} • {bus.route.name}
              </Text>
            </View>
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Main Content */}
          <View className="flex-1">
            {step === "payment" && (
              <View>
                {/* Promo Code Section */}
                <View
                  style={{
                    backgroundColor: colors.card,
                  }}
                  className=" rounded-2xl p-4 mb-4 mx-1"
                >
                  <View className="flex-row items-center gap-2 mb-4">
                    <Ionicons name="gift" size={20} color={colors.primary} />
                    <Text
                      style={{ color: colors.text }}
                      className="text-lg font-geist"
                    >
                      Have a promo code?
                    </Text>
                  </View>

                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <TextInput
                        value={promoCode}
                        onChangeText={setPromoCode}
                        placeholder="Enter promo code"
                        placeholderTextColor={colors.mutedText}
                        editable={!promoSuccess}
                        style={{
                          backgroundColor: colors.background,
                          borderColor: promoError
                            ? colors.error
                            : promoSuccess
                              ? colors.success
                              : colors.border,
                          color: colors.text,
                        }}
                        className="border rounded-xl px-4 py-3 font-geist"
                      />
                    </View>

                    {!promoSuccess ? (
                      <TouchableOpacity
                        onPress={validatePromo}
                        disabled={!promoCode.trim() || isValidatingPromo}
                        style={{ backgroundColor: colors.primary }}
                        className="px-4 rounded-xl items-center justify-center"
                      >
                        {isValidatingPromo ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text className="text-white font-geist">Apply</Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={removePromo}
                        style={{ borderColor: colors.success }}
                        className="px-4 rounded-xl border items-center justify-center"
                      >
                        <Text
                          style={{ color: colors.success }}
                          className="font-geist"
                        >
                          Remove
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Promo Error */}
                  {promoError && (
                    <View className="flex-row items-center gap-1 mt-2">
                      <Ionicons
                        name="alert-circle"
                        size={14}
                        color={colors.error}
                      />
                      <Text
                        style={{ color: colors.error }}
                        className="text-xs font-geist"
                      >
                        {promoError}
                      </Text>
                    </View>
                  )}

                  {/* Promo Success */}
                  {promoSuccess && (
                    <View
                      style={{
                        backgroundColor: colors.success + "10",
                        borderColor: colors.success + "30",
                      }}
                      className="border rounded-xl p-3 mt-3"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={colors.success}
                          />
                          <View>
                            <Text
                              style={{ color: colors.success }}
                              className="font-geist"
                            >
                              Promo code "{promoSuccess.code}" applied!
                            </Text>
                            <Text
                              style={{ color: colors.mutedText }}
                              className="text-xs font-geist"
                            >
                              You saved{" "}
                              {formatCurrency(
                                promoSuccess.discount,
                                bus.route.currency,
                              )}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Popular Promos */}
                  <View className="mt-4">
                    <Text
                      style={{ color: colors.mutedText }}
                      className="text-xs font-geist mb-2"
                    >
                      Popular codes:
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {["SAVE10", "WELCOME20", "BUS5", "FIRSTRIDE"].map(
                        (code) => (
                          <TouchableOpacity
                            key={code}
                            onPress={() => !promoSuccess && setPromoCode(code)}
                            style={{ borderColor: colors.border }}
                            className="px-3 py-1 rounded-full border flex-row items-center gap-1"
                          >
                            <Ionicons
                              name="pricetag"
                              size={10}
                              color={colors.mutedText}
                            />
                            <Text
                              style={{ color: colors.mutedText }}
                              className="text-xs font-geist"
                            >
                              {code}
                            </Text>
                          </TouchableOpacity>
                        ),
                      )}
                    </View>
                  </View>
                </View>

                {/* Payment Methods */}
                <PaymentStep
                  bus={bus}
                  schedule={schedule}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  passengers={passengers}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  promoCode={promoCode}
                  setPromoCode={setPromoCode}
                  usePoints={usePoints}
                  setUsePoints={setUsePoints}
                  bookingData={{ boardingStop: "", alightingStop: "" }}
                  setBookingData={() => {}}
                  basePrice={basePrice}
                  totalPrice={totalPrice}
                  discountAmount={discountAmount}
                  pointsValue={pointsValue}
                  finalAmount={finalAmount}
                />
              </View>
            )}

            {step === "pin" && (
              <View className=" rounded-2xl p-6 mb-4">
                <View className="items-center mb-6">
                  <View
                    style={{ backgroundColor: colors.primary }}
                    className="w-16 h-16 rounded-full items-center justify-center mb-4"
                  >
                    <Ionicons name="lock-closed" size={32} color="#ffffff" />
                  </View>
                  <Text
                    style={{ color: colors.text }}
                    className="text-xl font-geistBold mb-2"
                  >
                    Wallet Payment Security
                  </Text>
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-sm font-geist text-center"
                  >
                    Enter your 6-digit PIN to confirm payment
                  </Text>
                  <View className="mt-2">
                    <Text
                      style={{ color: colors.mutedText }}
                      className="text-sm font-geist"
                    >
                      Amount to pay:{" "}
                      <Text
                        style={{ color: colors.success }}
                        className="font-geistBold"
                      >
                        {formatCurrency(finalAmount, bus.route.currency)}
                      </Text>
                    </Text>
                  </View>
                </View>

                {/* PIN Input */}
                <View className="mb-6">
                  <View className="flex-row justify-center gap-2 mb-4">
                    {pin.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => {
                          pinInputsRef.current[index] = ref
                        }}
                        value={digit}
                        onChangeText={(value) => handlePinChange(index, value)}
                        onKeyPress={({ nativeEvent }) => {
                          // Handle backspace to go to previous input
                          if (
                            nativeEvent.key === "Backspace" &&
                            !digit &&
                            index > 0
                          ) {
                            pinInputsRef.current[index - 1]?.focus()
                          }
                        }}
                        maxLength={1}
                        keyboardType="numeric"
                        secureTextEntry
                        autoFocus={index === 0}
                        style={{
                          backgroundColor: colors.background,
                          borderColor: showPinError
                            ? colors.error
                            : colors.border,
                          color: colors.text,
                        }}
                        className="w-12 h-12 text-xl font-geistBold text-center border-2 rounded-xl"
                      />
                    ))}
                  </View>

                  {showPinError && (
                    <View className="flex-row items-center justify-center gap-2">
                      <Ionicons
                        name="alert-circle"
                        size={14}
                        color={colors.error}
                      />
                      <Text
                        style={{ color: colors.error }}
                        className="text-sm font-geist"
                      >
                        Incorrect PIN. Please try again.
                      </Text>
                    </View>
                  )}

                  <View className="items-center mt-4">
                    <Text
                      style={{ color: colors.mutedText }}
                      className="text-xs font-geist"
                    >
                      <Ionicons
                        name="shield-checkmark"
                        size={12}
                        color={colors.mutedText}
                      />{" "}
                      Your PIN is encrypted and never stored
                    </Text>
                  </View>
                </View>

                {/* Wallet Info */}
                <View
                  style={{ backgroundColor: colors.background }}
                  className="rounded-xl p-4 mb-4"
                >
                  <View className="flex-row justify-between">
                    <View>
                      <Text
                        style={{ color: colors.mutedText }}
                        className="text-xs font-geist mb-1"
                      >
                        Current Balance
                      </Text>
                      <Text
                        style={{ color: colors.text }}
                        className="text-xl font-groteskBold"
                      >
                        {formatCurrency(walletBalance, bus.route.currency)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text
                        style={{ color: colors.mutedText }}
                        className="text-xs font-geist mb-1"
                      >
                        After Payment
                      </Text>
                      <Text
                        style={{ color: colors.success }}
                        className="text-lg font-groteskBold"
                      >
                        {formatCurrency(
                          walletBalance - finalAmount,
                          bus.route.currency,
                        )}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Quick PIN Reminder */}
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert("Demo PIN", "For testing purposes only: 123456")
                  }}
                  className="items-center"
                >
                  <Text
                    style={{ color: colors.primary }}
                    className="text-xs font-geist underline"
                  >
                    Forgot PIN?
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {step === "processing" && (
              <View className="items-center py-12">
                <View
                  style={{ backgroundColor: colors.primary }}
                  className="w-20 h-20 rounded-full items-center justify-center mb-4"
                >
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
                <Text
                  style={{ color: colors.text }}
                  className="text-xl font-geistBold mb-2"
                >
                  Processing Payment
                </Text>
                <Text
                  style={{ color: colors.mutedText }}
                  className="text-sm font-geist text-center max-w-xs"
                >
                  {paymentMethod === "CHAPA"
                    ? "Redirecting to Chapa secure payment gateway..."
                    : "Confirming your payment. Please don't close this window."}
                </Text>
                <View className="mt-6 flex-row items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                  <View className="w-2 h-2 bg-green-500 rounded-full" />
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-sm font-geist"
                  >
                    Securely processing{" "}
                    {formatCurrency(finalAmount, bus.route.currency)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          {step !== "processing" && (
            <View
              className="flex-row justify-between mt-6 pt-6 border-t"
              style={{ borderColor: colors.border }}
            >
              <TouchableOpacity
                onPress={step === "payment" ? onBack : () => setStep("payment")}
                style={{ borderColor: colors.border }}
                className="px-6 py-3 rounded-xl border items-center"
              >
                <Text
                  style={{ color: colors.mutedText }}
                  className="font-geistMedium"
                >
                  {step === "payment" ? "Cancel" : "Back"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={step === "payment" ? handlePayment : handlePinSubmit}
                disabled={
                  isLoading ||
                  walletLoading ||
                  (step === "pin" && pin.some((d) => !d)) ||
                  (step === "payment" &&
                    paymentMethod === "WALLET" &&
                    !hasEnoughBalance)
                }
                style={{
                  backgroundColor:
                    step === "payment" &&
                    paymentMethod === "WALLET" &&
                    !hasEnoughBalance
                      ? colors.mutedText + "40"
                      : colors.primary,
                  opacity: isLoading ? 0.7 : 1,
                }}
                className="px-8 py-3 rounded-xl items-center flex-row gap-2"
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text className="text-white font-geist">Processing...</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-white font-geist">
                      {step === "payment"
                        ? paymentMethod === "WALLET"
                          ? hasEnoughBalance
                            ? "Pay with Wallet"
                            : "Insufficient Balance"
                          : paymentMethod === "CHAPA"
                            ? "Pay with Chapa"
                            : "Pay Now"
                        : "Confirm Payment"}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#ffffff"
                    />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Chapa Redirect Info */}
          {chapaCheckoutUrl && step === "processing" && (
            <View
              style={{
                backgroundColor: colors.primary + "10",
                borderColor: colors.primary + "30",
              }}
              className="border rounded-xl p-4 mt-4"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="card" size={20} color={colors.primary} />
                <View>
                  <Text
                    style={{ color: colors.text }}
                    className="font-geistMedium"
                  >
                    Redirecting to Chapa
                  </Text>
                  <Text
                    style={{ color: colors.mutedText }}
                    className="text-xs font-geist"
                  >
                    You'll be redirected to Chapa's secure payment page.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Collapsible Booking Summary */}
        {renderCollapsibleSummary()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
