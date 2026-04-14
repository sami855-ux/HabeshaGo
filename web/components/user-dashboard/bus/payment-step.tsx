"use client"

import React, { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  MapPin,
  Calendar,
  Clock,
  Bus,
  CreditCard,
  Wallet,
  Smartphone,
  CheckCircle,
  Shield,
  AlertCircle,
  Loader2,
  ArrowRight,
  Gift,
  Star,
  Info,
  TrendingUp,
  Zap,
  Lock,
} from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAppSelector } from "@/store/store"

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
  const { wallet, loading } = useAppSelector((store) => store.wallet)
  const scrollRef = useRef<HTMLDivElement>(null)

  console.log(wallet)
  // Get wallet balance - adjust based on your actual wallet structure
  const walletBalance = Number(wallet?.balance) || 0
  const walletPoints = Number(wallet?.points) || 0
  const hasEnoughBalance = walletBalance >= finalAmount
  const hasEnoughPoints = walletPoints >= 100

  // Scroll to top when component mounts
  useEffect(() => {
    // Method 1: Scroll the window
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })

    // Method 2: Scroll the specific container if needed
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }

    // Method 3: Force scroll after a tiny delay (ensures DOM is ready)
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      ref={scrollRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6 scroll-mt-24" // scroll-mt-24 accounts for fixed header
    >
      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          Payment Method
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose how you'd like to pay for your journey
        </p>
      </div>

      {/* Bus Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50/50 dark:from-gray-800 dark:to-gray-800/50 border border-orange-100 dark:border-orange-900/30">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500">
                  <Bus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {bus.busNumber}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {bus.route.name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {format(selectedDate, "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {schedule.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Passengers:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {passengers}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Seats left:</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                    {schedule.availableSeats}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="md:text-right">
              <div className="text-sm text-gray-500 mb-1">Total Amount</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {bus.route.currency} {finalAmount.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Inclusive of all taxes & fees
              </div>
            </div>
          </div>

          {/* Midpoints (excluding first and last) */}
          {bus.route.midPoints.slice(1, -1).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
            >
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Intermediate stops:
              </p>
              <div className="flex flex-wrap gap-2">
                {bus.route.midPoints.slice(1, -1).map((stop, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-white dark:bg-gray-800"
                  >
                    {stop}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* Payment Method */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 shadow-none border-2">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-orange-500" />
            Select Payment Method
          </h3>

          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            className="space-y-4"
          >
            {/* Chapa Payment */}
            <motion.div
              whileTap={{ scale: 0.99 }}
              className={cn(
                "relative rounded-lg border-2 transition-all duration-300",
                paymentMethod === "CHAPA"
                  ? "border-orange-400 bg-orange-50/50 dark:bg-orange-900/10"
                  : "border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700",
              )}
            >
              <div className="flex items-center p-4">
                <RadioGroupItem value="CHAPA" id="chapa" className="mr-4" />
                <Label htmlFor="chapa" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                        <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 dark:text-white">
                            Chapa
                          </p>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                            Secure
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Pay with Card, Mobile Money, or Bank Transfer
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Fast & Secure
                      </div>
                      <div className="text-xs text-gray-500">SSL Encrypted</div>
                    </div>
                  </div>
                </Label>
              </div>

              {paymentMethod === "CHAPA" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4 pt-2 border-t border-orange-200 dark:border-orange-800"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Lock className="w-4 h-4 text-green-500" />
                    <span>256-bit SSL encrypted payment</span>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Wallet Payment */}
            <motion.div
              whileTap={{ scale: 0.99 }}
              className={cn(
                "relative rounded-lg border-2 transition-all duration-300",
                paymentMethod === "WALLET"
                  ? "border-orange-500 bg-orange-50/50 dark:bg-orange-900/10"
                  : "border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700",
              )}
            >
              <div className="flex items-center p-4">
                <RadioGroupItem value="WALLET" id="wallet" className="mr-4" />
                <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                        <Wallet className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-gray-900 dark:text-white">
                            HabeshaGo Wallet
                          </p>
                          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs">
                            Recommended
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : (
                            <>
                              <div
                                className={cn(
                                  "text-sm font-semibold",
                                  hasEnoughBalance
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400",
                                )}
                              >
                                {bus.route.currency} {walletBalance.toFixed(2)}
                              </div>
                              <span className="text-xs text-gray-500">
                                available
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Instant Payment
                      </div>
                      <div className="text-xs text-gray-500">6-digit PIN</div>
                    </div>
                  </div>
                </Label>
              </div>

              {paymentMethod === "WALLET" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4 pt-2 border-t border-orange-200 dark:border-orange-800"
                >
                  <div className="flex items-center justify-between text-sm">
                    {hasEnoughBalance ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          Balance after payment: {bus.route.currency}{" "}
                          {(walletBalance - finalAmount).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        <span>Insufficient balance</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </RadioGroup>
        </Card>
      </motion.div>

      {/* Rewards Points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 shadow-none border-2">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Rewards & Discounts</h3>
          </div>

          <div className="space-y-4">
            {/* Points Checkbox */}
            <div
              className={cn(
                "flex items-center space-x-3 p-4 border-2 rounded-xl transition-all duration-300",
                usePoints
                  ? "border-amber-500 bg-amber-50/50 dark:bg-amber-900/10"
                  : "border-gray-200 dark:border-gray-800",
                !hasEnoughPoints && "opacity-50",
              )}
            >
              <Checkbox
                id="points"
                checked={usePoints}
                onCheckedChange={(checked) => setUsePoints(checked as boolean)}
                disabled={!hasEnoughPoints}
                className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              />
              <Label
                htmlFor="points"
                className={cn(
                  "flex-1 cursor-pointer",
                  !hasEnoughPoints && "cursor-not-allowed",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Use Reward Points
                      </p>
                      <p className="text-xs text-gray-500">
                        You have{" "}
                        <span className="font-semibold text-amber-600">
                          {walletPoints}
                        </span>{" "}
                        points
                        {hasEnoughPoints
                          ? ` (${Math.floor(walletPoints / 100) * 50} ${bus.route.currency} value)`
                          : " - Need at least 100 points"}
                      </p>
                    </div>
                  </div>
                  {usePoints && pointsValue > 0 && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      -{bus.route.currency} {pointsValue.toFixed(2)}
                    </Badge>
                  )}
                </div>
              </Label>
            </div>

            {/* Points Info */}
            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                    How points work
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    • 100 points = 50 ETB discount
                    <br />
                    • Points can be combined with promo codes
                    <br />• Points expire after 12 months
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Insufficient Balance Warning */}
      {paymentMethod === "WALLET" && !hasEnoughBalance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">
                  Insufficient Wallet Balance
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Your wallet balance ({bus.route.currency}{" "}
                  {walletBalance.toFixed(2)}) is less than the payment amount (
                  {bus.route.currency} {finalAmount.toFixed(2)}). Please choose
                  another payment method or{" "}
                  <button className="underline font-medium hover:text-red-700">
                    add funds to your wallet
                  </button>
                  .
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Secure Payment Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-4 pt-4 text-xs text-gray-500"
      >
        <div className="flex items-center gap-1">
          <Lock className="w-3 h-3" />
          <span>256-bit SSL</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-gray-300" />
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          <span>PCI Compliant</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-gray-300" />
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>Fraud Protection</span>
        </div>
      </motion.div>
    </motion.div>
  )
}
