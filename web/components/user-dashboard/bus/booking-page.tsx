"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Calendar,
  Clock,
  Bus,
  CreditCard,
  Wallet,
  Smartphone,
  CheckCircle,
  Ticket,
  Shield,
  ChevronRight,
  AlertCircle,
  Lock,
  Loader2,
  User,
  ArrowLeft,
  FileText,
  Info,
  Star,
  Tag,
  Percent,
  Gift,
  Sparkles,
  X,
} from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import BookingConfirmation from "./booking-confirmation"
import PaymentStep from "./payment-step"
import { useAppSelector } from "@/store/store"
import { verifyPin } from "@/services/wallet.api"
import { validatePromoCode, PromoCodeResponse } from "@/services/promoCode"
import {
  createNewBooking,
  BookingRequest,
  BookingResponse,
} from "@/services/booking.api"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

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

interface Ticket {
  id: number
  bookingId: number
  userId: string

  seatNumber?: number
  boardingStop?: string
  alightingStop?: string

  qrCode?: string
  checkedIn: boolean
  checkedInAt?: Date | null
  validUntil?: Date

  sharedToId?: string | null
  sharedAt?: Date | null
  sharedTicketUsed: boolean

  cancelledAt?: Date | null

  createdAt: Date
  updatedAt: Date
}

interface Payment {
  id: number
  userId: string
  amount: number
  status?: string
  createdAt?: Date
}

interface Booking {
  id: number // backend uses Int → not string
  bookingCode: string
  busId: number
  scheduleId: number
  passengerCount: number

  totalPrice: number
  amountPaid: number
  currency: string

  status: string
  createdAt: Date

  availableSeats: number

  // relations
  tickets: Ticket[]
  payment?: Payment

  // optional (only when points used)
  pointsUsed?: number
  pointsValue?: number
  pointsConversionRate?: number
}

type PaymentMethod = "CHAPA" | "WALLET" | "CARD" | "BANK"

interface BookingPageProps {
  bus: BusData
  schedule: BusSchedule
  selectedDate: Date
  selectedTime: string
  from: string
  to: string
  passengers: number
  onBack: () => void
  onBookingComplete: (booking: Booking) => void
}

// Helper function to parse balance string to number
const parseBalance = (balance: string | undefined | null): number => {
  if (!balance) return 0
  // Remove any non-numeric characters except decimal point
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
  from,
  to,
}: BookingPageProps) {
  const queryClient = useQueryClient()

  const [step, setStep] = useState<"payment" | "pin" | "processing">("payment")
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CHAPA")

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
  const pinInputsRef = useRef<Array<HTMLInputElement | null>>([])

  // Refs for scrolling
  const topRef = useRef<HTMLDivElement>(null)
  const paymentRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const processingRef = useRef<HTMLDivElement>(null)

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

  // Validate promo code
  const validatePromo = async () => {
    setIsValidatingPromo(true)
    setPromoError(null)

    try {
      const response = await validatePromoCode({
        code: promoCode,
        totalAmount: totalBeforeDiscount,
      })

      // Check if response has the expected fields
      if (response.success) {
        setPromoSuccess({
          code: response.code,
          discount: response.discount,
          promoId: response.promoId,
        })
        setDiscountAmount(response.discount)
        setPromoError(null)
        toast.success("Promo code applied!", {
          description: `You saved ${formatCurrency(response.discount, bus.route.currency)}`,
        })
      } else {
        setPromoError(response.message || "Invalid promo code")
        setDiscountAmount(0)
        setPromoSuccess(null)
        toast.error(response.message || "Invalid promo code")
      }
    } catch (error) {
      console.error("Promo validation failed:", error)
      setPromoError(
        error.message || "Failed to validate promo code. Please try again.",
      )
      toast.error(error.message || "Promo validation failed")
    } finally {
      setIsValidatingPromo(false)
    }
  }

  const removePromo = () => {
    setPromoCode("")
    setPromoSuccess(null)
    setDiscountAmount(0)
    setPromoError(null)
    toast.info("Promo code removed")
  }

  // Auto-select wallet if user has enough balance
  useEffect(() => {
    if (hasEnoughBalance && walletBalance > 0) {
      setPaymentMethod("WALLET")
    }
  }, [walletBalance, hasEnoughBalance])

  // Scroll to top when step changes
  useEffect(() => {
    // Always scroll to top of the page
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })

    // Also scroll the specific section into view
    if (step === "payment" && paymentRef.current) {
      paymentRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    } else if (step === "pin" && pinRef.current) {
      pinRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    } else if (step === "processing" && processingRef.current) {
      processingRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }, [step])

  // Initial scroll on mount
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }, [])

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1)

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    setShowPinError(false)

    if (value && index < 5) {
      pinInputsRef.current[index + 1]?.focus()
    }
  }

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinInputsRef.current[index - 1]?.focus()
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
      // Here you would integrate with Chapa API
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const checkoutUrl = `https://checkout.chapa.co/checkout/payment/${Math.random().toString(36).substr(2, 9)}`
      setChapaCheckoutUrl(checkoutUrl)

      // In a real app, you would redirect to Chapa checkout
      // window.location.href = checkoutUrl

      // For demo, we'll complete the booking after redirect simulation
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await completeBooking("CHAPA")
    } catch (error) {
      console.error("Chapa payment failed:", error)
      toast.error("Payment processing failed. Please try again.")
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
      toast.error(
        `Insufficient wallet balance. Your balance is ${formatCurrency(walletBalance, bus.route.currency)} but payment is ${formatCurrency(finalAmount, bus.route.currency)}`,
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

      // Proceed with booking after PIN verification
      await completeBooking("WALLET")
    } catch (error) {
      console.error("Wallet payment failed:", error)
      toast.error("Payment processing failed. Please try again.")
      setStep("payment")
      setIsLoading(false)
    }
  }

  const completeBooking = async (method: PaymentMethod) => {
    try {
      const adjustedDate = new Date(selectedDate)
      adjustedDate.setHours(adjustedDate.getHours() + 4)

      // Prepare booking request data
      const bookingData: BookingRequest = {
        busId: bus.id,
        date: adjustedDate.toISOString(),
        totalAmount: totalBeforeDiscount,
        currency: bus.route.currency,
        isPointUsed: usePoints,
        scheduleStartTime: schedule.startTime,
        seats: passengers,
        boardingStop: from,
        alightingStop: to,
      }

      // Add discount if applicable
      if (discountAmount > 0 && promoSuccess) {
        bookingData.discount = discountAmount
        bookingData.promoCode = promoSuccess.code
      }

      // Add points if used
      if (usePoints && pointsUsed > 0) {
        bookingData.pointsUsed = pointsUsed
        bookingData.pointsConversionRate = 0.5 // 1 point = 0.5 ETB
        bookingData.isPointUsed = true
      }

      // Create booking via API
      const response = await createNewBooking(bookingData)

      const data = response?.data

      // Check if booking was successful
      if (data) {
        const bookingResponse = data

        // Create booking object for the UI
        const booking: Booking = {
          id: bookingResponse.booking.id,
          bookingCode: bookingResponse.booking.bookingCode,
          busId: bookingResponse.booking.busId,
          scheduleId: bookingResponse.booking.scheduleId,
          passengerCount: bookingResponse.tickets?.length || passengers,

          totalPrice: Number(bookingResponse.booking.totalAmount),
          status: bookingResponse.booking.status,
          createdAt: new Date(bookingResponse.booking.createdAt),

          availableSeats: bookingResponse.availableSeats,
          amountPaid: Number(bookingResponse.booking.amountPaid),
          currency: bookingResponse.booking.currency,

          // ✅ add points ONLY if used
          ...(bookingResponse.booking.pointsUsed &&
            bookingResponse.booking.pointsUsed > 0 && {
              pointsUsed: bookingResponse.booking.pointsUsed,
              pointsValue: Number(bookingResponse.booking.pointsValue),
              pointsConversionRate: Number(
                bookingResponse.booking.pointsConversionRate,
              ),
            }),

          // tickets can be useful for seat display
          tickets: bookingResponse.tickets,

          // payment info (optional)
          payment: bookingResponse.payment,
        }

        // If using wallet, update wallet balance (handled by API)
        if (method === "WALLET" && wallet) {
          toast.success(
            `Wallet payment successful! ${formatCurrency(finalAmount, bus.route.currency)} deducted.`,
          )
        }

        queryClient.invalidateQueries({
          queryKey: ["user_bookings"],
        })

        setIsLoading(false)
        setShowConfirmation(true)
        onBookingComplete(booking)

        toast.success("Booking confirmed successfully!")
      } else {
        toast.error(
          response.message || "Failed to create booking. Please try again.",
        )

        setIsLoading(false)
        setStep("payment")
      }
    } catch (error) {
      console.error("Booking creation failed:", error)
      toast.error(
        error.message || "Failed to create booking. Please try again.",
      )
      setStep("payment")
      setIsLoading(false)
    }
  }

  const handlePayment = () => {
    if (paymentMethod === "WALLET") {
      if (!hasEnoughBalance) {
        toast.error(
          `Insufficient wallet balance. Your balance is ${formatCurrency(walletBalance, bus.route.currency)} but payment is ${formatCurrency(finalAmount, bus.route.currency)}`,
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

  if (showConfirmation) {
    return (
      <BookingConfirmation
        booking={{
          bookingCode: `BUS${Date.now().toString().slice(-8)}`,
          totalPrice: finalAmount,
          currency: bus.route.currency,
          passengers,
          busNumber: bus.busNumber,
          routeName: bus.route.name,
          selectedDate,
          selectedTime,
        }}
        onClose={onBack}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="min-h-screen bg-gradient-to-b from-orange-50/30 to-white dark:from-gray-900 dark:to-gray-950 py-8"
    >
      {/* Invisible anchor at the top */}
      <div ref={topRef} className="absolute top-0 left-0 w-0 h-0" />

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 hover:bg-orange-50 dark:hover:bg-orange-900/20 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Search
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Complete Your Booking
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Bus {bus.busNumber} • {bus.route.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {["payment", "pin", "processing"].map((s, i) => (
                  <React.Fragment key={s}>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                        step === s
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white scale-110 shadow-lg"
                          : i < ["payment", "pin", "processing"].indexOf(step)
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500",
                      )}
                    >
                      {i === 0 && <Wallet className="w-4 h-4" />}
                      {i === 1 && <Lock className="w-4 h-4" />}
                      {i === 2 && <Loader2 className="w-4 h-4 animate-spin" />}
                    </motion.div>
                    {i < 2 && (
                      <div
                        className={cn(
                          "w-12 h-1 transition-all duration-300",
                          i < ["payment", "pin", "processing"].indexOf(step)
                            ? "bg-gradient-to-r from-green-500 to-emerald-500"
                            : "bg-gray-200 dark:bg-gray-800",
                        )}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <Badge
                className={cn(
                  "ml-2 transition-all duration-300 px-3 py-1",
                  step === "payment"
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                    : step === "pin"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
                )}
              >
                {step === "payment"
                  ? "Payment Method"
                  : step === "pin"
                    ? "Wallet PIN"
                    : "Processing"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {step === "payment" && (
                <motion.div
                  key="payment"
                  ref={paymentRef}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 scroll-mt-24"
                >
                  {/* Promo Code Section */}
                  <Card className="p-6 border-2 border-orange-100 dark:border-orange-900/30">
                    <div className="flex items-center gap-2 mb-4">
                      <Gift className="w-5 h-5 text-orange-500" />
                      <h3 className="text-lg font-semibold">
                        Have a promo code?
                      </h3>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Enter promo code"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase())
                            setPromoError(null)
                          }}
                          disabled={promoSuccess !== null}
                          className={cn(
                            "pr-8",
                            promoError && "border-red-300 focus:ring-red-200",
                            promoSuccess &&
                              "border-green-300 bg-green-50 dark:bg-green-900/20",
                          )}
                        />
                        {promoCode && !promoSuccess && (
                          <button
                            onClick={() => setPromoCode("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                          >
                            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                          </button>
                        )}
                      </div>

                      {!promoSuccess ? (
                        <Button
                          onClick={validatePromo}
                          disabled={!promoCode.trim() || isValidatingPromo}
                          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 min-w-[100px]"
                        >
                          {isValidatingPromo ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={removePromo}
                          className="border-green-500 text-green-600 hover:bg-green-50"
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    {/* Promo Error */}
                    <AnimatePresence>
                      {promoError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 flex items-center gap-1 text-sm text-red-600"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {promoError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Promo Success */}
                    <AnimatePresence>
                      {promoSuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="font-medium text-green-700 dark:text-green-300">
                                  Promo code "{promoSuccess.code}" applied!
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                  You saved{" "}
                                  {formatCurrency(
                                    promoSuccess.discount,
                                    bus.route.currency,
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Popular Promos */}
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">
                        Popular codes:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["SAVE10", "WELCOME20", "BUS5", "FIRSTRIDE"].map(
                          (code) => (
                            <Badge
                              key={code}
                              variant="outline"
                              className="cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                              onClick={() =>
                                !promoSuccess && setPromoCode(code)
                              }
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {code}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  </Card>

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
                    basePrice={basePrice}
                    totalPrice={totalPrice}
                    discountAmount={discountAmount}
                    pointsValue={pointsValue}
                    finalAmount={finalAmount}
                  />
                </motion.div>
              )}

              {step === "pin" && (
                <motion.div
                  key="pin"
                  ref={pinRef}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 scroll-mt-24"
                >
                  {/* PIN Entry Card */}
                  <Card className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border border-blue-200 dark:border-blue-800/50">
                    <div className="text-center mb-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center"
                      >
                        <Lock className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Wallet Payment Security
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Enter your 6-digit PIN to confirm payment
                      </p>
                      <div className="mt-2 text-sm text-gray-500">
                        Amount to pay:{" "}
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(finalAmount, bus.route.currency)}
                        </span>
                      </div>
                    </div>

                    {/* PIN Input */}
                    <div className="mb-8">
                      <div className="flex justify-center gap-3 mb-6">
                        {pin.map((digit, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Input
                              ref={(el) => (pinInputsRef.current[index] = el)}
                              type="password"
                              maxLength={1}
                              value={digit}
                              onChange={(e) =>
                                handlePinChange(index, e.target.value)
                              }
                              onKeyDown={(e) => handlePinKeyDown(index, e)}
                              className={cn(
                                "w-14 h-14 text-2xl font-bold text-center border-2 rounded-xl transition-all",
                                showPinError
                                  ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                                  : "border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500",
                              )}
                            />
                          </motion.div>
                        ))}
                      </div>

                      {showPinError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center"
                        >
                          <p className="text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Incorrect PIN. Please try again.
                          </p>
                        </motion.div>
                      )}

                      <div className="text-center mt-4">
                        <p className="text-sm text-gray-500">
                          <Shield className="w-4 h-4 inline mr-2" />
                          Your PIN is encrypted and never stored
                        </p>
                      </div>
                    </div>

                    {/* Wallet Info */}
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500">
                            Current Balance
                          </div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(walletBalance, bus.route.currency)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            After Payment
                          </div>
                          <div className="text-xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(
                              walletBalance - finalAmount,
                              bus.route.currency,
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick PIN Reminder */}
                    <div className="text-center">
                      <button
                        onClick={() => {
                          toast.info("Demo PIN: 123456", {
                            description: "For testing purposes only",
                          })
                        }}
                        className="text-xs text-blue-500 hover:text-blue-600 underline"
                      >
                        Forgot PIN?
                      </button>
                    </div>
                  </Card>

                  {/* Security Note */}
                  <Card className="p-6">
                    <div className="flex items-start gap-3">
                      <Shield className="w-6 h-6 text-green-500 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          Payment Security
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            All transactions are encrypted with bank-level
                            security
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            Your PIN is never stored on our servers
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            Instant payment processing with real-time
                            confirmation
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {step === "processing" && (
                <motion.div
                  key="processing"
                  ref={processingRef}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-12 scroll-mt-24"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 360, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
                  >
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Processing Payment
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    {paymentMethod === "CHAPA"
                      ? "Redirecting to Chapa secure payment gateway..."
                      : "Confirming your payment. Please don't close this window."}
                  </p>
                  <div className="mt-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Securely processing{" "}
                        {formatCurrency(finalAmount, bus.route.currency)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            {step !== "processing" && (
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={
                    step === "payment" ? onBack : () => setStep("payment")
                  }
                  className="hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  {step === "payment" ? "Cancel Booking" : "Back"}
                </Button>

                <Button
                  onClick={step === "payment" ? handlePayment : handlePinSubmit}
                  disabled={
                    isLoading ||
                    walletLoading ||
                    (step === "pin" && pin.some((d) => !d)) ||
                    (step === "payment" &&
                      paymentMethod === "WALLET" &&
                      !hasEnoughBalance)
                  }
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-8 h-12 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : step === "payment" ? (
                      <>
                        {paymentMethod === "WALLET"
                          ? hasEnoughBalance
                            ? "Pay with Wallet"
                            : "Insufficient Balance"
                          : paymentMethod === "CHAPA"
                            ? "Pay with Chapa"
                            : "Pay Now"}
                        <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    ) : (
                      "Confirm Payment"
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            )}

            {/* Chapa Redirect Info */}
            {chapaCheckoutUrl && step === "processing" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Redirecting to Chapa
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You'll be redirected to Chapa's secure payment page.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Price Summary */}
            <Card className="p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Ticket className="w-6 h-6 text-orange-500" />
                Booking Summary
              </h3>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Base Fare ({passengers} ×{" "}
                      {formatCurrency(basePrice, bus.route.currency)})
                    </span>
                    <span className="font-medium">
                      {formatCurrency(totalPrice, bus.route.currency)}
                    </span>
                  </div>

                  {/* Service Fee */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <span>Service Fee</span>
                      <span className="text-xs text-gray-400">(4%)</span>
                    </span>
                    <span className="font-medium">
                      {formatCurrency(serviceFee, bus.route.currency)}
                    </span>
                  </div>

                  {/* VAT */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <span>VAT</span>
                      <span className="text-xs text-gray-400">(10%)</span>
                    </span>
                    <span className="font-medium">
                      {formatCurrency(vat, bus.route.currency)}
                    </span>
                  </div>

                  {/* Subtotal before discounts */}
                  <div className="flex justify-between text-sm pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      Subtotal
                    </span>
                    <span className="font-medium">
                      {formatCurrency(totalBeforeDiscount, bus.route.currency)}
                    </span>
                  </div>

                  {/* Promo Discount */}
                  {discountAmount > 0 && promoSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600 dark:text-gray-400">
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          Promo {promoSuccess.code}
                        </span>
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        -{formatCurrency(discountAmount, bus.route.currency)}
                      </span>
                    </motion.div>
                  )}

                  {/* Points Discount */}
                  {usePoints && pointsValue > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600 dark:text-gray-400">
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Points Discount ({pointsUsed} pts)
                        </span>
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        -{formatCurrency(pointsValue, bus.route.currency)}
                      </span>
                    </motion.div>
                  )}

                  <Separator className="my-2" />

                  {/* Final Total */}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <div className="text-right">
                      <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent text-2xl">
                        {formatCurrency(finalAmount, bus.route.currency)}
                      </span>
                      <div className="text-xs text-gray-500 font-normal mt-1">
                        Inclusive of all taxes
                      </div>
                    </div>
                  </div>

                  {/* Savings Summary */}
                  {(discountAmount > 0 || pointsValue > 0) && (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        You saved{" "}
                        {formatCurrency(
                          discountAmount + pointsValue,
                          bus.route.currency,
                        )}{" "}
                        today!
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Method Preview */}
                {step === "payment" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border"
                  >
                    <div className="text-sm text-gray-500 mb-2 flex items-center justify-between">
                      <span>Selected Payment</span>
                      <Badge variant="outline" className="text-xs">
                        {paymentMethod === "WALLET" ? "Instant" : "Secure"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      {paymentMethod === "WALLET" ? (
                        <Wallet className="w-5 h-5 text-amber-500" />
                      ) : paymentMethod === "CHAPA" ? (
                        <CreditCard className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Smartphone className="w-5 h-5 text-green-500" />
                      )}
                      <div>
                        <div className="font-medium">
                          {paymentMethod === "WALLET"
                            ? "HabeshaGo Wallet"
                            : paymentMethod === "CHAPA"
                              ? "Chapa Payment Gateway"
                              : "Mobile Banking"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {paymentMethod === "WALLET"
                            ? "6-digit PIN required"
                            : "Secure online payment"}
                        </div>
                      </div>
                    </div>
                    {paymentMethod === "WALLET" && !hasEnoughBalance && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
                      >
                        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Insufficient balance. You need{" "}
                          {formatCurrency(finalAmount, bus.route.currency)}
                        </p>
                      </motion.div>
                    )}
                    {paymentMethod === "WALLET" && hasEnoughBalance && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"
                      >
                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Balance after payment:{" "}
                          {formatCurrency(
                            walletBalance - finalAmount,
                            bus.route.currency,
                          )}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Secure Booking & Tax Info */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-lg mt-4 border border-orange-100 dark:border-orange-800">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Secure Booking
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {paymentMethod === "WALLET"
                          ? "Your payment is secured with end-to-end encryption."
                          : "All payments are processed through secure gateways."}
                      </p>

                      {/* Tax Info */}
                      <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-orange-500 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              Tax Information
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Includes 4% service fee and 10% VAT as per
                              Ethiopian tax regulations. A receipt will be sent
                              to your email after booking.
                            </p>
                            <div className="flex gap-4 mt-2">
                              <span className="text-xs text-gray-500">
                                Service Fee: 4%
                              </span>
                              <span className="text-xs text-gray-500">
                                VAT: 10%
                              </span>
                              <span className="text-xs text-gray-500">
                                Total Tax: 14.4%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  <span>Free cancellation up to 2 hours before departure</span>
                </div>
              </div>
            </Card>

            {/* Journey Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Journey Details</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bus className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Bus</span>
                  </div>
                  <span className="font-semibold">{bus.busNumber}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Travel Date</span>
                  </div>
                  <span className="font-semibold">
                    {format(selectedDate, "MMM d, yyyy")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Departure</span>
                  </div>
                  <span className="font-semibold">{selectedTime}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Arrival</span>
                  </div>
                  <span className="font-semibold">{schedule.endTime}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <span className="font-semibold">
                    {bus.route.estimatedTimeMin} min
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Driver</span>
                  </div>
                  <span className="font-semibold">
                    {bus.driver.experience}+ yrs exp.
                    {bus.driver.rating > 0 && ` • ${bus.driver.rating}⭐`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Passengers</span>
                  </div>
                  <span className="font-semibold">{passengers}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Included:</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Free cancellation (24h before)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    QR Code e-ticket
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Live bus tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    24/7 customer support
                  </li>
                </ul>
              </div>
            </Card>

            {/* Points Balance */}
            {walletPoints > 0 && (
              <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <div>
                      <p className="text-sm font-medium">Reward Points</p>
                      <p className="text-xs text-gray-500">
                        {walletPoints} points available
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-amber-300">
                    {Math.floor(walletPoints / 100) * 50} ETB value
                  </Badge>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
