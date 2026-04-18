"use client"

import { useState, useEffect, useRef } from "react"
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Plug,
  Coins,
  CreditCard,
  Wallet,
  Info,
  Leaf,
  CheckCircle,
  Shield,
  Key,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatCurrencyIntl } from "@/lib/utils"
import { InputOTP, InputOTPSlot } from "../ui/input-otp"
import { useAppSelector, useAppDispatch } from "@/store/store"
import { fetchUserWallet } from "@/store/slices/walletSlice"

interface BookingSummaryProps {
  selectedPoint: any
  energyKwh: number
  pricePerKwh: number
  stationData: any
  onBookingComplete: () => void
  onConfirmPayment: () => void
}

export function BookingSummary({
  selectedPoint,
  energyKwh,
  pricePerKwh,
  stationData,
  onBookingComplete,
  onConfirmPayment,
}: BookingSummaryProps) {
  const dispatch = useAppDispatch()
  const {
    wallet,
    loading: walletLoading,
    hasWallet,
    error: walletError,
  } = useAppSelector((state) => state.wallet)
  const { user } = useAppSelector((state) => state.user)

  const [applyPoints, setApplyPoints] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<
    "wallet" | "points" | "card"
  >("wallet")
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [showWalletPassword, setShowWalletPassword] = useState(false)
  const [walletPassword, setWalletPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const [isLoadingWallet, setIsLoadingWallet] = useState(false)
  const [showLoadWalletDialog, setShowLoadWalletDialog] = useState(false)
  const [loadAmount, setLoadAmount] = useState("")
  const [loadPaymentMethod, setLoadPaymentMethod] = useState<"card" | "bank">(
    "card",
  )
  const [isProcessingLoad, setIsProcessingLoad] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const otpInputRef = useRef<HTMLDivElement>(null)

  // Fetch wallet and points balance on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserWallet())
    }
  }, [dispatch, user])

  // Auto-refresh balances every 30 seconds
  useEffect(() => {
    if (!user?.id) return

    const interval = setInterval(() => {
      dispatch(fetchUserWallet())
    }, 30000)

    return () => clearInterval(interval)
  }, [dispatch, user])

  // Handle sticky positioning
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting)
      },
      {
        threshold: 0,
        rootMargin: "-20px 0px 0px 0px",
      },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [])

  const calculateTotal = () => {
    const energyCost = energyKwh * pricePerKwh
    let total = energyCost
    if (applyPoints && wallet?.points) {
      const pointsDiscount = Math.min(wallet?.points * 0.01, energyCost)
      total = energyCost - pointsDiscount
    }
    return Math.max(total, 0)
  }

  const pointsToUseAmount = wallet?.points
    ? Math.min(wallet?.points * 0.01, energyKwh * pricePerKwh)
    : 0
  const totalAmount = calculateTotal()

  const handleWalletPayment = async () => {
    setIsVerifying(true)
    setPasswordError("")

    // Verify wallet balance
    if (wallet && wallet.balance < totalAmount) {
      setPasswordError(
        `Insufficient wallet balance. Please load funds or use another payment method.`,
      )
      setIsVerifying(false)
      return
    }

    // Simulate API call to verify wallet password
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Demo password check - in production, this should be done server-side
    if (walletPassword === "123456") {
      setPasswordError("")
      setShowWalletPassword(false)
      setWalletPassword("")

      // Deduct from wallet
      await processWalletDeduction()
      await processPayment()
      onConfirmPayment()
    } else {
      setPasswordError("Invalid wallet password. Please try again.")
    }
    setIsVerifying(false)
  }

  const processWalletDeduction = async () => {
    try {
      // API call to deduct amount from wallet
      const response = await fetch("/api/wallet/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          amount: totalAmount,
          description: `Charging session payment - ${energyKwh} kWh`,
        }),
      })

      if (response.ok) {
        // Refresh wallet balance
        await dispatch(fetchUserWallet())
      }
    } catch (error) {
      console.error("Failed to deduct from wallet:", error)
    }
  }

  const processPointsDeduction = async () => {
    if (!applyPoints || !wallet?.points) return

    try {
      const pointsToDeduct = Math.ceil(pointsToUseAmount * 100) // Convert to points
      const response = await fetch("/api/points/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          points: pointsToDeduct,
          description: `Charging session points redemption`,
        }),
      })

      if (response.ok) {
        // Refresh points balance
        await dispatch(fetchUserWallet())
      }
    } catch (error) {
      console.error("Failed to deduct points:", error)
    }
  }

  const processPayment = async () => {
    setIsBooking(true)

    // Process payment based on method
    if (paymentMethod === "points" && applyPoints) {
      await processPointsDeduction()
    } else if (paymentMethod === "card") {
      // Process card payment
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsBooking(false)
    setBookingSuccess(true)
    onBookingComplete()

    // Auto hide success message after 3 seconds
    setTimeout(() => {
      setBookingSuccess(false)
    }, 3000)
  }

  const handleOpenPayment = () => {
    if (paymentMethod === "wallet") {
      if (wallet && wallet.balance >= totalAmount) {
        setShowWalletPassword(true)
      } else {
        setPasswordError("Insufficient wallet balance. Please load funds.")
        setShowLoadWalletDialog(true)
      }
    } else {
      processPayment()
    }
  }

  // const handleLoadWallet = async () => {
  //   if (!loadAmount || parseFloat(loadAmount) <= 0) {
  //     setPasswordError("Please enter a valid amount")
  //     return
  //   }

  //   setIsProcessingLoad(true)
  //   setPasswordError("")

  //   try {
  //     const amount = parseFloat(loadAmount)
  //     const response = await dispatch(
  //       loadWallet({
  //         userId: user?.id,
  //         amount,
  //         paymentMethod: loadPaymentMethod,
  //       }),
  //     )

  //     if (response.payload?.success) {
  //       setShowLoadWalletDialog(false)
  //       setLoadAmount("")
  //       // Refresh wallet balance
  //       await dispatch(fetchWalletBalance(user?.id))
  //       // Show success message
  //       alert(
  //         `Successfully loaded ${formatCurrencyIntl(amount)} to your wallet`,
  //       )
  //     } else {
  //       setPasswordError(response.payload?.error || "Failed to load wallet")
  //     }
  //   } catch (error) {
  //     setPasswordError("An error occurred while loading wallet")
  //   } finally {
  //     setIsProcessingLoad(false)
  //   }
  // }

  const handleRefreshBalances = () => {
    if (user?.id) {
      dispatch(fetchUserWallet())
    }
  }

  useEffect(() => {
    if (showWalletPassword && otpInputRef.current) {
      setTimeout(() => {
        const firstInput = otpInputRef.current?.querySelector("input")
        if (firstInput) {
          firstInput.focus()
        }
      }, 100)
    }
  }, [showWalletPassword])

  const walletBalance = wallet?.balance || 0
  const pointsBalance = wallet?.points || 0
  const isWalletInsufficient =
    paymentMethod === "wallet" && walletBalance < totalAmount

  return (
    <>
      {/* Sentinel element to detect when to apply sticky */}
      <div ref={sentinelRef} className="h-px" aria-hidden="true" />

      <div
        ref={cardRef}
        className={`
          transition-all duration-300 ease-in-out
          ${isSticky ? "sticky top-6" : "relative"}
        `}
        style={{
          top: "1.5rem",
        }}
      >
        <div className="space-y-6">
          <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-t-2xl py-5 relative">
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

            <CardContent className="pt-6 space-y-5 relative">
              {selectedPoint ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Selected Point Card */}
                  <div className="bg-gradient-to-br from-emerald-50/80 to-green-50/60 rounded-xl p-4 pt-0 space-y-3 backdrop-blur-sm border border-emerald-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-bold text-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Point {selectedPoint.slotNumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            {selectedPoint.connectorType} •{" "}
                            {selectedPoint.powerKw} kW
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        Available
                      </Badge>
                    </div>

                    <Separator className="bg-emerald-100" />

                    {/* Cost Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Energy ({energyKwh} kWh)
                        </span>
                        <span className="font-medium">
                          {formatCurrencyIntl(energyKwh * pricePerKwh)}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service Fee</span>
                        <span className="text-emerald-600 font-medium">
                          FREE
                        </span>
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
                              {pointsBalance.toLocaleString()} pts available
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
                          <span>Points discount applied</span>
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
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                        <CreditCard className="h-4 w-4 text-emerald-500" />
                        Select Payment Method
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefreshBalances}
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
                      onValueChange={(val) => {
                        setPaymentMethod(val as any)
                        setApplyPoints(false)
                      }}
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
                        onClick={() => setPaymentMethod("wallet")}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="wallet" id="wallet" />
                          <Label
                            htmlFor="wallet"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            {walletLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                            ) : (
                              <Wallet className="h-4 w-4 text-emerald-600" />
                            )}
                            <span className="font-medium">
                              HabeshaGo Wallet
                            </span>
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
                          <span>Insufficient balance</span>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => setShowLoadWalletDialog(true)}
                            className="text-emerald-600 h-auto p-0"
                          >
                            Load Wallet
                          </Button>
                        </div>
                      )}

                      {/* Points Payment */}
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className={`flex items-center justify-between border-2 rounded-xl p-3 cursor-pointer transition-all ${
                          paymentMethod === "points"
                            ? "border-emerald-500 bg-gradient-to-r from-emerald-50/80 to-green-50/80 shadow-md"
                            : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                        }`}
                        onClick={() => setPaymentMethod("points")}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="points" id="points" />
                          <Label
                            htmlFor="points"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Coins className="h-4 w-4 text-emerald-600" />
                            <span className="font-medium">
                              HabeshaGo Points
                            </span>
                          </Label>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-emerald-600">
                            {pointsBalance.toLocaleString()} pts
                          </span>
                          <div className="text-xs text-gray-500">available</div>
                        </div>
                      </motion.div>

                      {/* Card Payment */}
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className={`flex items-center justify-between border-2 rounded-xl p-3 cursor-pointer transition-all ${
                          paymentMethod === "card"
                            ? "border-emerald-500 bg-gradient-to-r from-emerald-50/80 to-green-50/80 shadow-md"
                            : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                        }`}
                        onClick={() => setPaymentMethod("card")}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="card" id="card" />
                          <Label
                            htmlFor="card"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <CreditCard className="h-4 w-4 text-emerald-600" />
                            <span className="font-medium">
                              Credit/Debit Card
                            </span>
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
                  <div className="bg-emerald-50 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-800 border border-emerald-200">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      Idle fee of{" "}
                      {formatCurrencyIntl(
                        parseFloat(
                          stationData.tariffs?.[0]?.idleFeePerMinute || "0.5",
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
                  <p className="text-sm mt-1">
                    Choose from available spots above
                  </p>
                </motion.div>
              )}

              {bookingSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800 rounded-xl">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium">
                      Session started successfully! Your charging is now active.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </CardContent>

            <CardFooter className="pt-2 pb-6 relative">
              <Button
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-500/30 rounded-xl py-6 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
                disabled={
                  !selectedPoint || isBooking || bookingSuccess || walletLoading
                }
                onClick={handleOpenPayment}
              >
                {isBooking ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay ${formatCurrencyIntl(totalAmount)}`
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Wallet Password Dialog */}
      <Dialog open={showWalletPassword} onOpenChange={setShowWalletPassword}>
        <DialogContent className="sm:max-w-lg md:max-w-xl rounded-2xl overflow-hidden p-0 border-0 shadow-2xl">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <DialogHeader className="px-8 pt-8 pb-2 relative">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Wallet Authentication
                </DialogTitle>
              </div>
              <DialogDescription className="text-gray-600 text-base">
                Enter your 6-digit wallet password to complete the payment
                securely
              </DialogDescription>
            </motion.div>
          </DialogHeader>

          <div className="px-8 py-4 space-y-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Paying with
                    </p>
                    <p className="font-bold text-gray-800 text-lg">
                      HabeshaGo Wallet
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-medium">
                    Amount to Pay
                  </p>
                  <motion.p
                    key={totalAmount}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="font-bold text-2xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent"
                  >
                    {formatCurrencyIntl(totalAmount)}
                  </motion.p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-4">
              <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <Key className="h-4 w-4 text-emerald-500" />
                Wallet Password (6-digit code)
              </Label>

              <div className="flex justify-center" ref={otpInputRef}>
                <InputOTP
                  maxLength={6}
                  value={walletPassword}
                  onChange={(value) => {
                    setWalletPassword(value)
                    setPasswordError("")
                  }}
                  autoFocus={true}
                  render={({ slots }) => (
                    <div className="flex gap-3 justify-center">
                      {slots.map((slot, idx) => (
                        <div key={idx} className="relative">
                          <div
                            className={`w-14 h-14 flex items-center justify-center text-2xl font-mono font-bold text-center rounded-xl border-2 transition-all duration-200 ${
                              walletPassword.length === idx + 1
                                ? "border-emerald-500 ring-4 ring-emerald-500/20 bg-emerald-50/50"
                                : slot.isActive
                                  ? "border-emerald-400 ring-2 ring-emerald-500/20"
                                  : "border-gray-200 hover:border-emerald-300"
                            }`}
                          >
                            {slot.char ?? slot.placeholderChar ?? ""}
                            {slot.hasFakeCaret && (
                              <div className="w-px h-5 bg-black animate-pulse" />
                            )}
                          </div>

                          {idx < slots.length - 1 && (
                            <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-1 h-1 rounded-full bg-gray-300"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>

              {walletPassword.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex justify-center gap-1 mt-2"
                >
                  <div className="flex gap-1 w-full max-w-[300px]">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i < walletPassword.length
                            ? "bg-gradient-to-r from-emerald-500 to-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {passwordError && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-red-500 flex items-center justify-center gap-1.5 bg-red-50 p-2 rounded-lg"
                >
                  <Info className="h-3 w-3" />
                  {passwordError}
                </motion.p>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex gap-2 justify-center"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWalletPassword("")}
                className="text-xs text-gray-500 hover:text-emerald-600"
              >
                Clear
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-emerald-900">
                    Secure Transaction
                  </p>
                  <p className="text-xs text-emerald-800">
                    Your wallet password is encrypted end-to-end using AES-256
                    encryption. This is a PCI-DSS compliant secure transaction.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex gap-3 px-8 pb-8 relative">
            <Button
              variant="outline"
              onClick={() => {
                setShowWalletPassword(false)
                setWalletPassword("")
                setPasswordError("")
              }}
              className="flex-1 rounded-xl h-12 border-2 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleWalletPayment}
              disabled={walletPassword.length !== 6 || isVerifying}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl h-12 shadow-lg shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center gap-2">Confirm Payment</div>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Wallet Dialog */}
      <Dialog
        open={showLoadWalletDialog}
        onOpenChange={setShowLoadWalletDialog}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Load Wallet
            </DialogTitle>
            <DialogDescription>
              Add funds to your HabeshaGo wallet to continue with your payment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Amount to Load</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={loadAmount}
                  onChange={(e) => setLoadAmount(e.target.value)}
                  className="pl-8 text-lg font-semibold"
                  min="1"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup
                value={loadPaymentMethod}
                onValueChange={(val) =>
                  setLoadPaymentMethod(val as "card" | "bank")
                }
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="card" id="card-load" />
                  <Label
                    htmlFor="card-load"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4" />
                    Credit/Debit Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="bank" id="bank-load" />
                  <Label
                    htmlFor="bank-load"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Wallet className="h-4 w-4" />
                    Bank Transfer
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {passwordError && (
              <Alert variant="destructive">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                Note: Minimum load amount is $1.00. Funds will be available
                instantly in your wallet.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowLoadWalletDialog(false)
                setLoadAmount("")
                setPasswordError("")
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              // onClick={handleLoadWallet}
              disabled={
                !loadAmount || parseFloat(loadAmount) <= 0 || isProcessingLoad
              }
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            >
              {isProcessingLoad ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Load ${loadAmount ? formatCurrencyIntl(parseFloat(loadAmount)) : "$0"}`
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
