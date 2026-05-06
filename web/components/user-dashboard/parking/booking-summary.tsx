"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Coins,
  CreditCard,
  Wallet,
  Info,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  Car,
  CircleParking,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatCurrencyIntl } from "@/lib/utils"

interface ParkingSlot {
  id: string
  slotNumber: string
  slotType: "CAR" | "MOTORCYCLE" | "DISABLED" | "EV"
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE"
  isEV: boolean
  hasCharger: boolean
  floor?: number
  section?: string
  priceMultiplier?: number
}

interface ParkingLotData {
  id: string
  name: string
  pricePerMinute: number
}

interface Vehicle {
  id: number
  manufacturer: string
  model: string
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
  selectedSlot: ParkingSlot | null
  durationHours: number
  pricePerMinute: number
  parkingLot: ParkingLotData
  pointsBalance: number
  walletBalance: number
  selectedTimeSlot: TimeSlot | null
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

export function BookingSummary({
  selectedSlot,
  durationHours,
  pricePerMinute,
  parkingLot,
  pointsBalance,
  walletBalance,
  selectedTimeSlot,
  applyPoints,
  setApplyPoints,
  pointsToUseAmount,
  paymentMethod,
  setPaymentMethod,
  totalAmount,
  isBooking,
  bookingSuccess,
  pointsPaymentSuccess,
  walletLoading,
  onOpenPayment,
  onRefreshBalances,
  selectedVehicle,
}: BookingSummaryProps) {
  const subtotal = durationHours * 60 * pricePerMinute
  const priceMultiplier = selectedSlot?.priceMultiplier || 1
  const adjustedSubtotal = subtotal * priceMultiplier
  const pointsValue = pointsBalance * 0.5

  const isWalletInsufficient =
    paymentMethod === "wallet" && walletBalance < totalAmount
  const isTimeSlotSelected = selectedTimeSlot !== null
  const isVehicleSelected = selectedVehicle !== null

  const getButtonText = () => {
    if (isBooking) {
      return (
        <div className="flex items-center gap-2 justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          Processing...
        </div>
      )
    }

    if (!selectedSlot) {
      return "Select a Parking Slot"
    }

    if (!isTimeSlotSelected) {
      return "Select a Time Slot"
    }

    if (!isVehicleSelected) {
      return "Select a Vehicle"
    }

    if (paymentMethod === "points") {
      if (pointsBalance === 0) {
        return "No Points Available"
      }
      if (!applyPoints) {
        return "Apply Points First"
      }
      return `Pay with Points (${pointsBalance.toLocaleString()} pts)`
    }

    if (paymentMethod === "wallet" && walletBalance < totalAmount) {
      return `Insufficient Balance - Need ${formatCurrencyIntl(totalAmount - walletBalance)} More`
    }

    return `Pay ${formatCurrencyIntl(totalAmount)}`
  }

  const isButtonDisabled = () => {
    if (!selectedSlot) return true
    if (!isTimeSlotSelected) return true
    if (!isVehicleSelected) return true
    if (isBooking) return true
    if (bookingSuccess) return true
    if (pointsPaymentSuccess) return true
    if (walletLoading) return true

    if (paymentMethod === "points") {
      if (pointsBalance === 0) return true
      if (!applyPoints) return true
    }

    if (paymentMethod === "wallet" && walletBalance < totalAmount) return true

    return false
  }

  const formatTimeRange = () => {
    if (!selectedTimeSlot) return "Not selected"
    return `${selectedTimeSlot.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${selectedTimeSlot.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95 sticky top-8 py-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl py-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle className="flex items-center gap-2 text-xl">
              Booking Summary
            </CardTitle>
            <CardDescription className="text-blue-100 mt-1">
              Review and confirm your parking reservation
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="pt-6 space-y-5">
          {selectedSlot ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Time Slot Warning */}
              {!isTimeSlotSelected && (
                <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800 rounded-xl">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="font-medium">
                    Please select a time slot for your parking session.
                  </AlertDescription>
                </Alert>
              )}

              {/* Vehicle Warning */}
              {!isVehicleSelected && (
                <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800 rounded-xl">
                  <Car className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="font-medium">
                    Please select a vehicle first.
                  </AlertDescription>
                </Alert>
              )}

              {/* Security Notice for Points Payment */}
              {paymentMethod === "points" && applyPoints && (
                <Alert className="mb-4 bg-blue-50 border-blue-200 text-blue-800 rounded-xl">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="font-medium text-sm">
                    Points payment requires wallet password verification for
                    security.
                  </AlertDescription>
                </Alert>
              )}

              {/* Selected Slot Card */}
              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 rounded-xl p-4 space-y-3 backdrop-blur-sm border border-blue-100">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Slot {selectedSlot.slotNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      Floor {selectedSlot.floor} • Section{" "}
                      {selectedSlot.section}
                    </div>
                  </div>
                  {selectedVehicle && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Vehicle Selected
                    </Badge>
                  )}
                </div>

                {selectedVehicle && (
                  <div className="text-xs text-gray-600 bg-white/50 rounded-lg p-2">
                    <span className="font-medium">Vehicle:</span>{" "}
                    {selectedVehicle.manufacturer} {selectedVehicle.model} •{" "}
                    {selectedVehicle.plateNumber}
                  </div>
                )}

                <div
                  className={`rounded-lg p-2 ${selectedTimeSlot ? "bg-blue-100/50" : "bg-amber-50"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock
                        className={`h-3.5 w-3.5 ${selectedTimeSlot ? "text-blue-600" : "text-amber-600"}`}
                      />
                      <span className="text-xs font-medium">Time Slot:</span>
                    </div>
                    <span
                      className={`text-xs font-semibold ${selectedTimeSlot ? "text-blue-700" : "text-amber-700"}`}
                    >
                      {formatTimeRange()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Duration: {durationHours} hour{durationHours > 1 ? "s" : ""}
                  </div>
                </div>

                <Separator className="bg-blue-100" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Parking ({durationHours}h ×{" "}
                      {formatCurrencyIntl(pricePerMinute * 60)}/h)
                    </span>
                    <span className="font-medium">
                      {formatCurrencyIntl(subtotal)}
                    </span>
                  </div>

                  {priceMultiplier > 1 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Premium Location Fee
                      </span>
                      <span className="font-medium text-purple-600">
                        +{formatCurrencyIntl(subtotal * (priceMultiplier - 1))}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>

                  {/* Points Section */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                      applyPoints
                        ? "bg-blue-100 border-2 border-blue-300"
                        : "bg-blue-50 border border-blue-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Coins
                        className={`h-4 w-4 ${applyPoints ? "text-blue-700" : "text-blue-600"}`}
                      />
                      <div>
                        <span className="text-sm font-medium">
                          HabeshaGo Points
                        </span>
                        <div className="text-xs text-blue-700">
                          {pointsBalance.toLocaleString()} pts available (
                          {formatCurrencyIntl(pointsValue)})
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={applyPoints ? "default" : "outline"}
                      size="sm"
                      className={`h-8 rounded-full transition-all ${
                        applyPoints
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          : "border-blue-300 text-blue-700 hover:bg-blue-50"
                      }`}
                      onClick={() => setApplyPoints(!applyPoints)}
                      disabled={pointsBalance === 0}
                    >
                      {applyPoints
                        ? `-${formatCurrencyIntl(pointsToUseAmount)}`
                        : "Apply Points"}
                    </Button>
                  </motion.div>

                  {applyPoints && pointsToUseAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex justify-between text-sm text-blue-600 bg-blue-50 p-2 rounded-lg"
                    >
                      <span>Points discount applied</span>
                      <span className="font-semibold">
                        -{formatCurrencyIntl(pointsToUseAmount)}
                      </span>
                    </motion.div>
                  )}

                  <Separator className="bg-blue-100" />

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base font-semibold">
                      Total Amount
                    </span>
                    <motion.span
                      key={totalAmount}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                    >
                      {formatCurrencyIntl(totalAmount)}
                    </motion.span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                    <CreditCard className="h-4 w-4 text-blue-500" />
                    Select Payment Method
                  </Label>
                </div>

                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(val) => setPaymentMethod(val as any)}
                  className="space-y-2"
                >
                  {/* Wallet Payment */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`flex items-center justify-between border-2 rounded-xl p-3 cursor-pointer transition-all ${
                      paymentMethod === "wallet"
                        ? "border-blue-500 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 shadow-md"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"
                    }`}
                    onClick={() => setPaymentMethod("wallet")}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label
                        htmlFor="wallet"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Wallet className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">HabeshaGo Wallet</span>
                      </Label>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-blue-600">
                        {formatCurrencyIntl(walletBalance)}
                      </span>
                      <div className="text-xs text-gray-500">available</div>
                    </div>
                  </motion.div>

                  {isWalletInsufficient && (
                    <div className="text-xs text-amber-600 flex items-center justify-between px-3">
                      <span>
                        Insufficient balance. Please load funds or use another
                        method.
                      </span>
                    </div>
                  )}

                  {/* Points Payment */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`flex items-center justify-between border-2 rounded-xl p-3 cursor-pointer transition-all ${
                      paymentMethod === "points"
                        ? "border-blue-500 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 shadow-md"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"
                    } ${pointsBalance === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() =>
                      pointsBalance > 0 && setPaymentMethod("points")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem
                        value="points"
                        id="points"
                        disabled={pointsBalance === 0}
                      />
                      <Label
                        htmlFor="points"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Coins className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">HabeshaGo Points</span>
                      </Label>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-blue-600">
                        {pointsBalance.toLocaleString()} pts
                      </span>
                      <div className="text-xs text-gray-500">
                        Value: {formatCurrencyIntl(pointsBalance * 0.5)}
                      </div>
                    </div>
                  </motion.div>

                  {paymentMethod === "points" &&
                    !applyPoints &&
                    pointsBalance > 0 && (
                      <div className="text-xs text-amber-600 flex items-center justify-between px-3">
                        <span>
                          Click "Apply Points" above to use your points
                        </span>
                      </div>
                    )}

                  {/* Card Payment */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`flex items-center justify-between border-2 rounded-xl p-3 cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "border-blue-500 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 shadow-md"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"
                    }`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="card" id="card" />
                      <Label
                        htmlFor="card"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Credit/Debit Card</span>
                      </Label>
                    </div>
                    <div className="flex gap-1">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Visa • MC • Amex
                      </span>
                    </div>
                  </motion.div>
                </RadioGroup>
              </div>

              {/* Info Alert */}
              <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2 text-xs text-blue-800 border border-blue-200 mt-4">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Free 15-minute grace period. Overstay fee of{" "}
                  {formatCurrencyIntl(pricePerMinute * 2)}/min applies.
                </span>
              </div>

              {/* Success Messages */}
              <AnimatePresence>
                {bookingSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Alert className="bg-green-50 border-green-200 text-green-800 rounded-xl">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="font-medium">
                        Reservation confirmed! Your parking spot has been
                        secured.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {pointsPaymentSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Alert className="bg-gradient-to-r from-amber-50 to-green-50 border-amber-200 text-green-800 rounded-xl">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="font-medium">
                      Payment successful! {Math.ceil(pointsToUseAmount * 2)}{" "}
                      points redeemed.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <CircleParking className="h-10 w-10 text-gray-300" />
              </div>
              <p className="font-medium text-gray-700">Select a parking slot</p>
              <p className="text-sm mt-1">Choose from available spots above</p>
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="pt-2 pb-6">
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 rounded-xl py-6 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
            disabled={isButtonDisabled()}
            onClick={onOpenPayment}
          >
            {getButtonText()}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
