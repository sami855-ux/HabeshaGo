"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
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
  //   ChapaLogo,
} from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Booking, Bus as BusType, PaymentMethod } from "@/types/booking"
import BookingConfirmation from "./booking-confirmation"

interface BookingPageProps {
  bus: BusType
  selectedDate: Date
  passengers: number
  onBack: () => void
  onBookingComplete: (booking: Booking) => void
}

export default function BookingPage({
  bus,
  selectedDate,
  passengers,
  onBack,
  onBookingComplete,
}: BookingPageProps) {
  const [step, setStep] = useState<"payment" | "pin" | "processing">("payment")
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [bookingData, setBookingData] = useState<Partial<Booking>>({
    boardingStop: bus.route.origin,
    alightingStop: bus.route.destination,
    payNow: true,
    currency: "ETB",
  })

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CHAPA")
  const [promoCode, setPromoCode] = useState("")
  const [usePoints, setUsePoints] = useState(false)
  const [pin, setPin] = useState(["", "", "", "", "", ""])
  const [showPinError, setShowPinError] = useState(false)
  const [chapaCheckoutUrl, setChapaCheckoutUrl] = useState<string | null>(null)
  const pinInputsRef = useRef<Array<HTMLInputElement | null>>([])

  // Calculate pricing
  const basePrice = bus.route.distanceKm * (bus.pricePerKm || 0.15)
  const totalPrice = basePrice * passengers
  const discountAmount = promoCode === "SAVE10" ? totalPrice * 0.1 : 0
  const pointsValue = usePoints ? 50 : 0 // Example: 50 ETB worth of points
  const finalAmount = totalPrice - discountAmount - pointsValue

  // Wallet balance simulation
  const walletBalance = 1000 // ETB

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1)

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    setShowPinError(false)

    // Auto-focus next input
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
    // Simulate API call to verify PIN
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In real app, this would call your backend
    // For demo, valid PIN is "123456"
    return enteredPin === "123456"
  }

  const processChapaPayment = async () => {
    // Simulate Chapa payment initialization
    setIsLoading(true)

    try {
      // In real app, this would call your backend to create Chapa checkout
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // For demo, simulate Chapa checkout URL
      const checkoutUrl = `https://checkout.chapa.co/checkout/payment/${Math.random().toString(36).substr(2, 9)}`
      setChapaCheckoutUrl(checkoutUrl)

      // Simulate redirect to Chapa
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // After successful payment on Chapa, complete booking
      await completeBooking("CHAPA")
    } catch (error) {
      console.error("Chapa payment failed:", error)
      alert("Payment processing failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const processWalletPayment = async (enteredPin: string) => {
    if (enteredPin.length !== 6) {
      setShowPinError(true)
      return
    }

    setIsLoading(true)
    setStep("processing")

    try {
      // Verify PIN
      const isValid = await verifyWalletPin(enteredPin)

      if (!isValid) {
        setShowPinError(true)
        setStep("pin")
        setIsLoading(false)
        return
      }

      // Check wallet balance
      if (walletBalance < finalAmount) {
        alert("Insufficient wallet balance")
        setStep("payment")
        setIsLoading(false)
        return
      }

      // Process wallet payment
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Complete booking
      await completeBooking("WALLET")
    } catch (error) {
      console.error("Wallet payment failed:", error)
      alert("Payment processing failed. Please try again.")
      setStep("payment")
      setIsLoading(false)
    }
  }

  const completeBooking = async (method: PaymentMethod) => {
    // Generate booking data
    const bookingCode = `BUS${Date.now().toString().slice(-8)}`
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bookingCode}`

    const booking: Booking = {
      id: Math.floor(Math.random() * 1000),
      userId: "user123", // In real app, get from auth
      busId: bus.id,
      date: selectedDate,
      status: "CONFIRMED",
      bookingCode,
      boardingStop: bookingData.boardingStop || bus.route.origin,
      alightingStop: bookingData.alightingStop || bus.route.destination,
      payNow: true,
      sharedTicketUsed: false,
      checkedIn: false,
      currency: "ETB",
      discount: discountAmount,
      promoCode: promoCode || undefined,
      amountPaid: finalAmount,
      totalAmount: totalPrice,
      pointsUsed: usePoints ? 100 : undefined,
      pointsValue: usePoints ? pointsValue : undefined,
      pointsConversionRate: usePoints ? 0.5 : undefined,
      qrCode,
      bus: bus,
      user: {
        id: "user123",
        name: "Current User", // In real app, get from auth
        email: "user@example.com",
        phone: "+251911223344",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      payment: {
        id: Math.floor(Math.random() * 1000),
        bookingId: Math.floor(Math.random() * 1000),
        amount: finalAmount,
        currency: "ETB",
        method: method,
        status: "COMPLETED",
        transactionId: `TX${Date.now().toString().slice(-8)}`,
        processedAt: new Date(),
      },
    }

    setIsLoading(false)
    setShowConfirmation(true)
    onBookingComplete(booking)
  }

  const handlePayment = () => {
    if (paymentMethod === "WALLET") {
      setStep("pin")
    } else if (paymentMethod === "CHAPA") {
      processChapaPayment()
    } else {
      // For demo, process other payments
      setIsLoading(true)
      setTimeout(() => {
        completeBooking(paymentMethod)
        setIsLoading(false)
      }, 2000)
    }
  }

  const handlePinSubmit = async () => {
    const enteredPin = pin.join("")
    await processWalletPayment(enteredPin)
  }

  if (showConfirmation) {
    return (
      <BookingConfirmation booking={bookingData as Booking} onClose={onBack} />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="min-h-screen bg-gradient-to-b from-orange-50/30 to-white dark:from-gray-900 dark:to-gray-950 py-8"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 hover:bg-orange-50 dark:hover:bg-orange-900/20"
          >
            ← Back to Search
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Complete Your Booking
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Bus {bus.busNumber} • {bus.route.origin} →{" "}
                {bus.route.destination}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {["payment", "pin", "processing"].map((s, i) => (
                  <React.Fragment key={s}>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                        step === s
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white scale-110"
                          : i < ["payment", "pin", "processing"].indexOf(step)
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500",
                      )}
                    >
                      {i === 0 && <Wallet className="w-4 h-4" />}
                      {i === 1 && <Lock className="w-4 h-4" />}
                      {i === 2 && <Loader2 className="w-4 h-4 animate-spin" />}
                    </div>
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
                  "ml-2 transition-all duration-300",
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
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Bus Summary Card */}
                  <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50/50 dark:from-gray-800 dark:to-gray-800/50 border border-orange-100 dark:border-orange-900/30">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {bus.busNumber} • {bus.route.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {format(selectedDate, "EEE, MMM d, yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {format(new Date(bus.departureTime), "hh:mm a")} -{" "}
                              {format(
                                new Date(bus.estimatedArrival),
                                "hh:mm a",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        {bus.availableSeats} seats left
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">Boarding</span>
                        </div>
                        <Input
                          value={bookingData.boardingStop}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              boardingStop: e.target.value,
                            })
                          }
                          className="bg-white/50 dark:bg-gray-800/50"
                          placeholder={bus.route.origin}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium">Alighting</span>
                        </div>
                        <Input
                          value={bookingData.alightingStop}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              alightingStop: e.target.value,
                            })
                          }
                          className="bg-white/50 dark:bg-gray-800/50"
                          placeholder={bus.route.destination}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Payment Method */}
                  <Card className="p-6 shadow-none">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-orange-500" />
                      Select Payment Method
                    </h3>

                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) =>
                        setPaymentMethod(value as PaymentMethod)
                      }
                      className="space-y-4"
                    >
                      {/* Chapa Payment */}
                      <div className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-orange-500 dark:hover:border-orange-700 transition-all duration-300 group">
                        <RadioGroupItem value="CHAPA" id="chapa" />
                        <Label
                          htmlFor="chapa"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-4 w-full py-2">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 group-hover:scale-105 transition-transform">
                                {/* <ChapaLogo className="w-6 h-6 text-blue-600 dark:text-blue-400" /> */}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-gray-900 dark:text-white">
                                    Chapa
                                  </p>
                                </div>
                                <p className="text-sm text-gray-500">
                                  Secure online payment gateway
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">
                                Supports
                              </div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                Card, Mobile, Bank
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>

                      {/* Wallet Payment */}
                      <div className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 group">
                        <RadioGroupItem value="WALLET" id="wallet" />
                        <Label
                          htmlFor="wallet"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 group-hover:scale-105 transition-transform">
                                <Wallet className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                              </div>
                              <div>
                                <div className="flex items-center gps-3 ">
                                  <p className="font-bold text-gray-900 dark:text-white">
                                    HabeshaGo Wallet
                                  </p>
                                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                                    Recommended
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    ETB {walletBalance.toFixed(2)}
                                  </div>

                                  <span className="text-xs text-gray-500">
                                    available
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">
                                Secure & Fast
                              </div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                6-digit PIN required
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </Card>

                  {/* Promo Code */}
                  <Card className="p-6 shadow-none">
                    <h3 className="text-xl font-bold mb-6">Promo Code</h3>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Input
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Enter promo code"
                          className="h-12 text-base"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (promoCode === "SAVE10") {
                            alert("🎉 10% discount applied!")
                          } else if (promoCode) {
                            alert("Invalid promo code")
                          }
                        }}
                        className="h-12 px-6"
                      >
                        Apply Code
                      </Button>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      Try code:{" "}
                      <span className="font-mono text-orange-600">SAVE10</span>{" "}
                      for 10% off
                    </div>
                  </Card>
                </motion.div>
              )}

              {step === "pin" && (
                <motion.div
                  key="pin"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* PIN Entry Card */}
                  <Card className="p-8 bg-gradient-to-br shadow-none from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border border-blue-200 dark:border-blue-800/50">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Wallet Payment Security
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Enter your 6-digit PIN to confirm payment
                      </p>
                      <div className="mt-2 text-sm text-gray-500">
                        Amount to pay:{" "}
                        <span className="font-bold text-green-600 dark:text-green-400">
                          ETB {finalAmount.toFixed(2)}
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
                                "w-14 h-14 text-2xl font-bold text-center border-2 rounded-xl",
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
                            ETB {walletBalance.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            After Payment
                          </div>
                          <div className="text-xl font-bold text-green-600 dark:text-green-400">
                            ETB {(walletBalance - finalAmount).toFixed(2)}
                          </div>
                        </div>
                      </div>
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                  </div>
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
                        Securely processing ETB {finalAmount.toFixed(2)}
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
                    isLoading || (step === "pin" && pin.some((d) => !d))
                  }
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-8 h-12"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : step === "payment" ? (
                    <>
                      {paymentMethod === "WALLET"
                        ? "Pay with Wallet"
                        : paymentMethod === "CHAPA"
                          ? "Pay with Chapa"
                          : "Pay Now"}
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </>
                  ) : (
                    "Confirm Payment"
                  )}
                </Button>
              </div>
            )}

            {/* Chapa Redirect Info */}
            {chapaCheckoutUrl && step === "processing" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center gap-3">
                  {/* <ChapaLogo className="w-6 h-6 text-blue-600 dark:text-blue-400" /> */}
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
                      Base Fare ({passengers} × ETB {basePrice.toFixed(0)})
                    </span>
                    <span className="font-medium">
                      ETB {totalPrice.toFixed(2)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        <span className="text-green-600 dark:text-green-400">
                          Promo Code
                        </span>
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        -ETB {discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {usePoints && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        <span className="text-amber-600 dark:text-amber-400">
                          Reward Points
                        </span>
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        -ETB {pointsValue.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      ETB {finalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Method Preview */}
                {step === "payment" && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border">
                    <div className="text-sm text-gray-500 mb-2">
                      Selected Payment
                    </div>
                    <div className="flex items-center gap-3">
                      {paymentMethod === "WALLET" ? (
                        <Wallet className="w-5 h-5 text-amber-500" />
                      ) : paymentMethod === "CHAPA" ? (
                        // <ChapaLogo className="w-5 h-5 text-blue-500" />
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
                  </div>
                )}

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-lg mt-4 border border-orange-100 dark:border-orange-800">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Secure Booking
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {paymentMethod === "WALLET"
                          ? "Your payment is secured with end-to-end encryption."
                          : "All payments are processed through secure gateways."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Journey Details */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6">Journey Details</h3>

              <div className="space-y-4">
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
                  <span className="font-semibold">
                    {format(new Date(bus.departureTime), "hh:mm a")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Route</span>
                  </div>
                  <span className="font-semibold text-right">
                    {bus.route.origin} → {bus.route.destination}
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
                <h4 className="font-semibold">Included:</h4>
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
          </div>
        </div>
      </div>
    </motion.div>
  )
}
