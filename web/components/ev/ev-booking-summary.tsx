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
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatCurrencyIntl } from "@/lib/utils"

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
  const subtotal = energyKwh * pricePerKwh
  const POINTS_CONVERSION_RATE = 0.5
  const pointsValue = pointsBalance * POINTS_CONVERSION_RATE
  const pointsNeededForDiscount = Math.ceil(
    pointsToUseAmount / POINTS_CONVERSION_RATE,
  )

  const isWalletInsufficient =
    paymentMethod === "wallet" && walletBalance < totalAmount
  const isPointsInsufficient = paymentMethod === "points" && pointsBalance === 0
  const isVehicleCompatible =
    selectedVehicle && selectedPoint
      ? selectedVehicle.connectorType === selectedPoint.connectorType
      : true
  const isTimeSlotSelected = selectedTimeSlot !== null

  // Get button text based on payment method and status
  const getButtonText = () => {
    if (isBooking) {
      return (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          Processing...
        </div>
      )
    }

    if (!selectedPoint) {
      return "Select a Charging Point"
    }

    if (!isTimeSlotSelected) {
      return "Select a Time Slot"
    }

    if (!isVehicleCompatible) {
      return "Vehicle Incompatible"
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

  // Determine if button should be disabled
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

  // Handle payment method change
  const handlePaymentMethodChange = (method: "wallet" | "points" | "card") => {
    setPaymentMethod(method)
    // Don't auto disable applyPoints when switching to points
    // Allow points to be applied for both wallet and card payments
  }

  // Format time range
  const formatTimeRange = () => {
    if (!selectedTimeSlot) return "Not selected"
    return `${selectedTimeSlot.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${selectedTimeSlot.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-t-2xl py-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle className="flex items-center gap-2 text-xl">
              Booking Summary
            </CardTitle>
            <CardDescription className="text-emerald-100 mt-1">
              Review and confirm your charging session
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="pt-6 space-y-5">
          {selectedPoint ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Compatibility Warning */}
              {!isVehicleCompatible && selectedVehicle && (
                <Alert className="mb-4 bg-red-50 border-red-200 text-red-800 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="font-medium">
                    Your {selectedVehicle.manufacturer} {selectedVehicle.model}{" "}
                    requires {selectedVehicle.connectorType} connector, but this
                    point has {selectedPoint.connectorType}. Please select a
                    compatible charging point.
                  </AlertDescription>
                </Alert>
              )}

              {/* Time Slot Warning */}
              {!isTimeSlotSelected && (
                <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800 rounded-xl">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="font-medium">
                    Please select a time slot for your charging session.
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

              {/* Selected Point Card */}
              <div className="bg-gradient-to-br from-emerald-50/80 to-green-50/60 rounded-xl p-4 pt-0 space-y-3 backdrop-blur-sm border border-emerald-100">
                <div className="flex justify-between items-center pt-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-bold text-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Point {selectedPoint.slotNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedPoint.connectorType} • {selectedPoint.powerKw}{" "}
                        kW
                      </div>
                    </div>
                  </div>
                  {selectedVehicle && (
                    <Badge
                      className={`${isVehicleCompatible ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200"}`}
                    >
                      {isVehicleCompatible ? "Compatible" : "Incompatible"}
                    </Badge>
                  )}
                </div>

                {/* Vehicle Info */}
                {selectedVehicle && (
                  <div className="text-xs text-gray-600 bg-white/50 rounded-lg p-2">
                    <span className="font-medium">Vehicle:</span>{" "}
                    {selectedVehicle.manufacturer} {selectedVehicle.model} •{" "}
                    {selectedVehicle.plateNumber}
                    <span className="ml-2 text-emerald-600">
                      ({selectedVehicle.connectorType})
                    </span>
                  </div>
                )}

                {/* Time slot info - REQUIRED */}
                <div
                  className={`rounded-lg p-2 ${selectedTimeSlot ? "bg-emerald-100/50" : "bg-amber-50"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock
                        className={`h-3.5 w-3.5 ${selectedTimeSlot ? "text-emerald-600" : "text-amber-600"}`}
                      />
                      <span className="text-xs font-medium">Time Slot:</span>
                    </div>
                    <span
                      className={`text-xs font-semibold ${selectedTimeSlot ? "text-emerald-700" : "text-amber-700"}`}
                    >
                      {formatTimeRange()}
                    </span>
                  </div>
                  {estimatedTimeMin && selectedTimeSlot && (
                    <div className="text-xs text-gray-500 mt-1">
                      Estimated charging duration: {estimatedTimeMin} minutes
                    </div>
                  )}
                </div>

                <Separator className="bg-emerald-100" />

                {/* Cost Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Energy ({energyKwh} kWh) ×{" "}
                      {formatCurrencyIntl(pricePerKwh)}/kWh
                    </span>
                    <span className="font-medium">
                      {formatCurrencyIntl(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="text-emerald-600 font-medium">FREE</span>
                  </div>

                  {/* HabeshaGo Points Section */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                      applyPoints
                        ? "bg-emerald-100 border-2 border-emerald-300"
                        : "bg-emerald-50 border border-emerald-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Coins
                        className={`h-4 w-4 ${applyPoints ? "text-emerald-700" : "text-emerald-600"}`}
                      />
                      <div>
                        <span className="text-sm font-medium">
                          HabeshaGo Points
                        </span>
                        <div className="text-xs text-emerald-700">
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
                          ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                          : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
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
                      className="flex justify-between text-sm text-emerald-600 bg-emerald-50 p-2 rounded-lg"
                    >
                      <span>
                        Points discount applied (
                        {pointsNeededForDiscount.toLocaleString()} pts)
                      </span>
                      <span className="font-semibold">
                        -{formatCurrencyIntl(pointsToUseAmount)}
                      </span>
                    </motion.div>
                  )}

                  <Separator className="bg-emerald-100" />

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base font-semibold">
                      Total Amount
                    </span>
                    <motion.span
                      key={totalAmount}
                      initial={{ scale: 1.1, color: "#059669" }}
                      animate={{ scale: 1, color: "#059669" }}
                      className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent"
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
                    <CreditCard className="h-4 w-4 text-emerald-500" />
                    Select Payment Method
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefreshBalances}
                    disabled={walletLoading}
                    className="h-8 px-2"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${walletLoading ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>

                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(val) => handlePaymentMethodChange(val as any)}
                  className="space-y-2"
                >
                  {/* Wallet Payment */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`flex items-center justify-between border-2 rounded-xl p-3 cursor-pointer transition-all ${
                      paymentMethod === "wallet"
                        ? "border-emerald-500 bg-gradient-to-r from-emerald-50/80 to-green-50/80 shadow-md"
                        : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                    }`}
                    onClick={() => handlePaymentMethodChange("wallet")}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label
                        htmlFor="wallet"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Wallet className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">HabeshaGo Wallet</span>
                      </Label>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-emerald-600">
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

                  {/* Points Payment - Updated to show password requirement */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`flex items-center justify-between border-2 rounded-xl p-3 cursor-pointer transition-all ${
                      paymentMethod === "points"
                        ? "border-emerald-500 bg-gradient-to-r from-emerald-50/80 to-green-50/80 shadow-md"
                        : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                    } ${pointsBalance === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => {
                      if (pointsBalance > 0) {
                        handlePaymentMethodChange("points")
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem
                        value="points"
                        id="points"
                        disabled={pointsBalance === 0}
                      />
                      <Label
                        htmlFor="points"
                        className={`flex items-center gap-2 ${pointsBalance === 0 ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <Coins className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">HabeshaGo Points</span>
                      </Label>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-emerald-600">
                        {pointsBalance.toLocaleString()} pts
                      </span>
                      <div className="text-xs text-gray-500">
                        Value: {formatCurrencyIntl(pointsBalance * 0.01)}
                      </div>
                    </div>
                  </motion.div>

                  {paymentMethod === "points" && (
                    <div className="text-xs text-blue-600 flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                      <Shield className="h-3 w-3" />
                      <span>
                        Wallet password required for security verification
                      </span>
                    </div>
                  )}

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
                        ? "border-emerald-500 bg-gradient-to-r from-emerald-50/80 to-green-50/80 shadow-md"
                        : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                    }`}
                    onClick={() => handlePaymentMethodChange("card")}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="card" id="card" />
                      <Label
                        htmlFor="card"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <CreditCard className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">Chapa Payment</span>
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

              {/* Info Alerts */}
              <div className="bg-emerald-50 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-800 border border-emerald-200 mt-4">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Idle fee of{" "}
                  {formatCurrencyIntl(
                    parseFloat(
                      stationData?.tariffs?.[0]?.idleFeePerMinute || "0.5",
                    ),
                  )}
                  /min applies after 10 minutes grace period.
                </span>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3 flex items-center justify-between border border-emerald-200">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">
                    Green Energy Session
                  </span>
                </div>
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0">
                  100% Renewable
                </Badge>
              </div>

              {/* Regular Payment Success Message */}
              <AnimatePresence>
                {bookingSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800 rounded-xl">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="font-medium">
                        Session started successfully! Your charging is now
                        active.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Points Payment Success Message */}
              <AnimatePresence>
                {pointsPaymentSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Alert className="bg-gradient-to-r from-amber-50 to-emerald-50 border-amber-200 text-emerald-800 rounded-xl">
                      <Coins className="h-4 w-4 text-amber-500" />
                      <AlertDescription className="font-medium">
                        Payment successful!{" "}
                        {formatCurrencyIntl(pointsToUseAmount)} points redeemed.
                        Your charging session has started!
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Plug className="h-10 w-10 text-gray-300" />
              </div>
              <p className="font-medium text-gray-700">
                Select a charging point
              </p>
              <p className="text-sm mt-1">Choose from available spots above</p>
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="pt-2 pb-6">
          <Button
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-500/30 rounded-xl py-6 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
