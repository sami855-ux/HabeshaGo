"use client"

import { useParams, useRouter } from "next/navigation"
import { useMemo, useRef, useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MapPin,
  Zap,
  Clock,
  Shield,
  Leaf,
  Star,
  CreditCard,
  Wallet,
  Coins,
  CheckCircle,
  Plug,
  Calendar,
  Info,
  ChevronLeft,
  Gauge,
  Award,
  Loader2,
  DollarSign,
  Timer,
  Key,
  X,
  Car,
  Battery,
  AlertCircle,
} from "lucide-react"

import { ChargingPointsGrid } from "@/components/ev/charging-points-grid"
import { EnergySelector } from "@/components/ev/energy-selector"
import { BookingSummary } from "@/components/ev/ev-booking-summary"
import { TimeSlotPicker } from "@/components/ev/TimeslotPicker"
import { ReservationSuccessComponent } from "@/components/ev/reservation-success"
import { axiosInstance } from "@/services/axiosInstance"
import { useAppSelector, useAppDispatch } from "@/store/store"
import { fetchUserWallet } from "@/store/slices/walletSlice"
import { InputOTP } from "@/components/ui/input-otp"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { formatCurrencyIntl } from "@/lib/utils"
import Image from "next/image"
import { toast } from "sonner"

// Types based on API response
interface ChargingPoint {
  id: number
  stationId: number
  connectorType: string
  powerKw: number
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE"
  averageSessionDuration: number
  slotNumber: string
  chargingSpeed: "SLOW" | "FAST" | "SUPER_FAST"
  maxVoltage: number
  maxCurrent: number
}

interface Tariff {
  id: number
  stationId: number
  pricePerKwh: string
  pricePerMinute: string | null
  idleFeePerMinute: string | null
  currency: string
  validFrom: string
  validTo: string | null
}

interface Rating {
  id: number
  stationId: number
  userId: string
  score: number
  comment: string
  createdAt: string
}

interface StationData {
  id: number
  name: string
  address: string
  city: string
  lat: number
  lng: number
  status: string
  isVerified: boolean
  chargingPoints: ChargingPoint[]
  tariffs: Tariff[]
  ratings: Rating[]
}

interface Vehicle {
  id: number
  type: string
  vin: string
  model: string
  plateNumber: string
  capacity: number
  manufacturer: string
  year: number
  connectorType: string
  vehicleImageUrl?: string
}

interface TimeSlot {
  id: string
  startTime: Date
  endTime: Date
  isAvailable: boolean
  reservedBy?: string
}

async function fetchStationData(stationId: string): Promise<StationData> {
  try {
    const { data } = await axiosInstance.get(`/ev/station/${stationId}`)

    if (!data?.success) {
      throw new Error(data?.message || "Failed to fetch station data")
    }
    return data.data
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to fetch station data",
    )
  }
}

async function fetchUserVehicles(): Promise<Vehicle[]> {
  try {
    const { data } = await axiosInstance.get("/vehicles/user-vehicles")
    if (!data?.success) {
      throw new Error(data?.message || "Failed to fetch vehicles")
    }
    return data.data
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to fetch vehicles",
    )
  }
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const stationId = params?.stationId as string

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null,
  )
  // Add new state for tracking pending payment type
  const [pendingPaymentType, setPendingPaymentType] = useState<
    "wallet" | "points" | null
  >(null)
  const [estimatedTimeMin, setEstimatedTimeMin] = useState<number | undefined>()
  const [reservationDetails, setReservationDetails] = useState<any>(null)
  const [selectedPointId, setSelectedPointId] = useState<number | null>(null)
  const [energyKwh, setEnergyKwh] = useState<number>(35)
  const [paymentMethod, setPaymentMethod] = useState<
    "wallet" | "points" | "card"
  >("wallet")
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [applyPoints, setApplyPoints] = useState(false)
  const [pointsPaymentSuccess, setPointsPaymentSuccess] = useState(false)
  const [selectedTariffId, setSelectedTariffId] = useState<number | null>(null)

  // Vehicle selection state
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null,
  )
  const [showVehicleSelector, setShowVehicleSelector] = useState(true)

  // Payment dialog states
  const [showWalletPassword, setShowWalletPassword] = useState(false)
  const [walletPassword, setWalletPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [showCreatingReservation, setShowCreatingReservation] = useState(false)
  const [reservationError, setReservationError] = useState<string | null>(null)

  // Get wallet data from Redux
  const {
    wallet,
    loading: walletLoading,
    hasWallet,
    error: walletError,
  } = useAppSelector((state) => state.wallet)
  const { user } = useAppSelector((state) => state.user)

  // Fetch station data with React Query
  const {
    data: stationData,
    isLoading: stationLoading,
    error: stationError,
  } = useQuery({
    queryKey: ["station", stationId],
    queryFn: () => fetchStationData(stationId),
    enabled: !!stationId,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch user vehicles
  const {
    data: vehicles,
    isLoading: vehiclesLoading,
    error: vehiclesError,
  } = useQuery({
    queryKey: ["user-vehicles"],
    queryFn: fetchUserVehicles,
    enabled: !!user?.id,
  })

  // Fetch wallet data on mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserWallet())
    }
  }, [dispatch, user])

  // Calculate derived values
  const selectedPoint = stationData?.chargingPoints.find(
    (p) => p.id === selectedPointId,
  )

  const selectedVehicle = vehicles?.find((v) => v.id === selectedVehicleId)

  const selectedTariff =
    stationData?.tariffs.find((t) => t.id === selectedTariffId) ||
    stationData?.tariffs[0]

  const pricePerKwh = selectedTariff
    ? parseFloat(selectedTariff.pricePerKwh)
    : 0
  const currency = selectedTariff?.currency || "ETB"
  const subtotal = energyKwh * pricePerKwh

  const walletBalance = wallet?.balance || 0
  const pointsBalance = wallet?.points || 0
  const POINTS_CONVERSION_RATE = 0.5
  const pointsValue = pointsBalance * POINTS_CONVERSION_RATE
  const pointsToUseAmount = applyPoints ? Math.min(pointsValue, subtotal) : 0
  const totalAmount = subtotal - pointsToUseAmount

  const availablePoints =
    stationData?.chargingPoints.filter((p) => p.status === "AVAILABLE") || []

  const avgWaitTime = "~8 min"
  const co2Saved = "12.4 tons"
  const topRating = "#1 in City"

  const workingHours = {
    start: "00:00",
    end: "23:59",
  }

  const handleSelectPoint = (pointId: number) => {
    const point = stationData?.chargingPoints.find((p) => p.id === pointId)
    if (point?.status === "OCCUPIED") return
    setSelectedPointId(pointId)
    setBookingSuccess(false)
    setReservationError(null)
  }

  const handleBackToHome = () => {
    router.push("/user/ev-charging")
  }

  const handleSelectVehicle = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId)
    setShowVehicleSelector(false)
    setReservationError(null)
  }

  const handleChangeVehicle = () => {
    setShowVehicleSelector(true)
    setSelectedVehicleId(null)
    setSelectedPointId(null)
    setSelectedTimeSlot(null)
    setReservationError(null)
  }

  // Helper function to calculate target battery percentage
  const calculateTargetBatteryPercentage = (
    energyKwh: number,
    batteryCapacity: number,
  ): number => {
    if (!batteryCapacity || batteryCapacity === 0) return 80
    const percentage = (energyKwh / batteryCapacity) * 100
    return Math.min(Math.round(percentage), 100)
  }

  // Single function to create reservation (handles all payment types internally)
  const createReservation = async () => {
    if (!selectedPoint || !selectedVehicle) {
      setReservationError(
        "Missing required data. Please select a charging point and vehicle.",
      )
      setShowCreatingReservation(false)
      return
    }

    if (!selectedTimeSlot) {
      setReservationError(
        "Please select a time slot for your charging session.",
      )
      setShowCreatingReservation(false)
      return
    }

    const startTime = selectedTimeSlot.startTime
    const endTime = selectedTimeSlot.endTime

    // Determine payment flow based on selected payment method and points usage
    let paymentFlow = "EXTERNAL_ONLY"
    let paymentMethodAPI = "MOBILE_MONEY"

    if (paymentMethod === "points" && applyPoints) {
      paymentFlow = "POINTS_EXTERNAL"
      paymentMethodAPI = "MOBILE_MONEY"
    } else if (paymentMethod === "wallet") {
      if (applyPoints && pointsToUseAmount > 0) {
        paymentFlow = "POINTS_WALLET"
      } else {
        paymentFlow = "WALLET_ONLY"
      }
      paymentMethodAPI = "MOBILE_MONEY"
    } else if (paymentMethod === "card") {
      if (applyPoints && pointsToUseAmount > 0) {
        paymentFlow = "POINTS_EXTERNAL"
      } else {
        paymentFlow = "EXTERNAL_ONLY"
      }
      paymentMethodAPI = "MOBILE_MONEY"
    }

    const reservationData = {
      vehicleId: selectedVehicle.id,
      chargingPointId: selectedPoint.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      userId: user?.id,
      targetBatteryPercentage: calculateTargetBatteryPercentage(
        energyKwh,
        selectedVehicle.capacity,
      ),
      targetKwh: energyKwh,
      calculatedAmount: subtotal,
      paymentFlow: paymentFlow,
      paymentMethod: paymentMethodAPI,
    }

    try {
      const { data } = await axiosInstance.post(
        "/ev/reservation",
        reservationData,
      )
      console.log(data)

      if (data.data.needsExternalPayment) {
        if (data.data.paymentUrl) {
          window.location.href = data.data.paymentUrl
        }
      }
      if (data?.success) {
        setReservationDetails({
          ...reservationData,
          reservationCode: data.data.reservation.reservationCode,
          reservationId: data.data.reservation.id,
          payment: data.data.payment,
          needsExternalPayment: data.data.needsExternalPayment,
          externalAmount: data.data.externalAmount,
          stationName: stationData?.name,
          stationAddress: stationData?.address,
          pointNumber: selectedPoint.slotNumber,
          pointId: selectedPointId,
          pointPower: selectedPoint.powerKw,
          connectorType: selectedPoint.connectorType,
          vehicleModel: selectedVehicle.model,
          vehiclePlate: selectedVehicle.plateNumber,
          energyKwh: energyKwh,
          totalAmount: totalAmount,
          originalAmount: subtotal,
          pointsUsed: applyPoints ? pointsToUseAmount : 0,
          currency: currency,
          paymentMethod: paymentMethod,
        })
        setBookingSuccess(true)
        setShowCreatingReservation(false)

        // Show success message for points/wallet payments
        if (
          (paymentMethod === "points" && applyPoints) ||
          paymentMethod === "wallet"
        ) {
          setPointsPaymentSuccess(true)
          setTimeout(() => setPointsPaymentSuccess(false), 3000)
        }
      } else {
        throw new Error(data?.message || "Failed to create reservation")
      }
    } catch (error: any) {
      console.error("Reservation creation error:", error)
      toast.error(
        error?.response?.data?.message || "Failed to create reservation",
      )
      setShowCreatingReservation(false)
      setReservationError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to create reservation",
      )
    }
  }

  // Updated wallet password verification handler - handles BOTH wallet AND points
  const handleWalletPasswordVerification = async () => {
    setIsVerifying(true)
    setPasswordError("")
    setReservationError(null)

    // For wallet payment: check balance
    if (pendingPaymentType === "wallet" && walletBalance < totalAmount) {
      setPasswordError(
        "Insufficient wallet balance. Please load funds or use another payment method.",
      )
      setIsVerifying(false)
      return
    }

    try {
      // API call to verify wallet password
      const { data } = await axiosInstance.post("/wallet/verify-pin", {
        pin: walletPassword,
      })

      if (data?.success) {
        setPasswordError("")
        setShowWalletPassword(false)
        setWalletPassword("")

        // Close password dialog and show creating reservation dialog
        setShowCreatingReservation(true)

        // Create reservation (which will handle the payment internally)
        await createReservation()
      } else {
        setPasswordError(
          data?.message || "Invalid wallet password. Please try again.",
        )
        setWalletPassword("")
      }
    } catch (error: any) {
      console.error("Wallet password verification failed:", error)

      if (error?.response?.status === 429) {
        setPasswordError("Too many failed attempts. Please try again later.")
      } else if (error?.response?.status === 403) {
        setPasswordError("Wallet is locked. Please contact support.")
      } else {
        setPasswordError(
          error?.response?.data?.message ||
            "Failed to verify wallet password. Please try again.",
        )
      }

      setWalletPassword("")
    } finally {
      setIsVerifying(false)
    }
  }

  // Card payment and reservation
  const handleCardPaymentAndReservation = async () => {
    setReservationError(null)
    setShowCreatingReservation(true)
    await createReservation()
  }

  // Updated Open payment dialog with validation - NOW POINTS REQUIRES PASSWORD TOO
  const handleOpenPayment = () => {
    if (!selectedPoint) {
      setReservationError("Please select a charging point")
      return
    }

    if (energyKwh <= 0 || energyKwh > 200) {
      setReservationError("Please enter a valid energy amount (1-200 kWh)")
      return
    }

    if (!selectedVehicleId) {
      setReservationError("Please select a vehicle first")
      return
    }

    if (!selectedTimeSlot) {
      setReservationError("Please select a time slot for your charging session")
      return
    }

    setReservationError(null)

    // WALLET PAYMENT - Requires password
    if (paymentMethod === "wallet") {
      if (walletBalance >= totalAmount) {
        setPendingPaymentType("wallet")
        setShowWalletPassword(true)
      } else {
        setReservationError(
          `Insufficient wallet balance. Need ${formatCurrencyIntl(totalAmount - walletBalance)} more.`,
        )
      }
    }
    // POINTS PAYMENT - NOW ALSO REQUIRES PASSWORD
    else if (paymentMethod === "points") {
      if (!applyPoints) {
        setReservationError("Please apply your points before proceeding")
        return
      }
      if (pointsBalance === 0) {
        setReservationError("No points available to use")
        return
      }
      // Show wallet password dialog for points payment too
      setPendingPaymentType("points")
      setShowWalletPassword(true)
    }
    // CARD PAYMENT - No password required (goes to external gateway)
    else if (paymentMethod === "card") {
      handleCardPaymentAndReservation()
    }
  }

  // Reset pending payment type when dialog closes
  const handleWalletDialogCancel = () => {
    setShowWalletPassword(false)
    setWalletPassword("")
    setPasswordError("")
    setPendingPaymentType(null)
  }

  useEffect(() => {
    const handleScroll = () => {
      // Scroll handling logic
    }
    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Set default tariff when data loads
  useEffect(() => {
    if (stationData?.tariffs.length && !selectedTariffId) {
      setSelectedTariffId(stationData.tariffs[0].id)
    }
  }, [stationData, selectedTariffId])

  // Show vehicle selector if no vehicle selected
  if (
    showVehicleSelector &&
    vehicles &&
    vehicles.length > 0 &&
    !selectedVehicleId
  ) {
    return (
      <VehicleSelector
        vehicles={vehicles}
        onSelectVehicle={handleSelectVehicle}
        isLoading={vehiclesLoading}
        onBack={() => router.back()}
      />
    )
  }

  if (stationLoading || vehiclesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading station details...</p>
        </div>
      </div>
    )
  }

  if (stationError || !stationData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Failed to Load Station
          </h2>
          <p className="text-gray-600 mb-4">
            {stationError instanceof Error
              ? stationError.message
              : "Unable to fetch station details"}
          </p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (bookingSuccess && reservationDetails) {
    return (
      <ReservationSuccessComponent
        reservationDetails={reservationDetails}
        onNavigateToMyReservations={() => router.push("/user/reservations")}
        onBookAnother={() => {
          setBookingSuccess(false)
          setReservationDetails(null)
          setSelectedPointId(null)
          setSelectedTimeSlot(null)
          setEnergyKwh(35)
          setApplyPoints(false)
          setPointsPaymentSuccess(false)
          setShowVehicleSelector(true)
          setSelectedVehicleId(null)
          setReservationError(null)
        }}
        onBackToHome={handleBackToHome}
      />
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Selected Vehicle Banner */}
      {selectedVehicle && (
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-emerald-100">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">
                  Charging for: {selectedVehicle.manufacturer}{" "}
                  {selectedVehicle.model} ({selectedVehicle.plateNumber})
                </span>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  {selectedVehicle.connectorType}
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Selected
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleChangeVehicle}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              >
                Change Vehicle
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {reservationError && (
        <div className="container mx-auto px-4 pt-4">
          <Alert className="bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>{reservationError}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Clean Header */}
      <div className="border-b border-emerald-200/50 backdrop-blur-sm bg-white/80 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Left Section - Back Button & Station Info */}
            <div className="flex items-start gap-3">
              <button
                onClick={() => router.back()}
                className="group h-12 w-12 rounded-xl bg-white border border-emerald-200 
                   flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 
                   hover:scale-105 active:scale-95 hover:border-emerald-400 cursor-pointer"
                aria-label="Go back"
              >
                <ChevronLeft
                  size={24}
                  className="text-emerald-600 group-hover:text-emerald-700"
                />
              </button>

              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md shrink-0">
                <Plug className="h-6 w-6 text-white" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                    {stationData.name}
                  </h1>
                  {stationData.isVerified && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      <Shield className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm mt-0.5 text-gray-600">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  <span>
                    {stationData.address}, {stationData.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section - Stats */}
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="flex items-center gap-0.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-gray-800">
                    {stationData.ratings.length > 0
                      ? (
                          stationData.ratings.reduce(
                            (acc, r) => acc + r.score,
                            0,
                          ) / stationData.ratings.length
                        ).toFixed(1)
                      : "0.0"}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  ({stationData.ratings.length})
                </span>
              </div>

              <Separator
                orientation="vertical"
                className="h-5 bg-emerald-200"
              />

              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <Zap className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {availablePoints.length} spots
                  </div>
                  <div className="text-xs text-gray-500">available</div>
                </div>
              </div>

              <Separator
                orientation="vertical"
                className="h-5 bg-emerald-200"
              />

              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <Gauge className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {Math.max(
                      ...stationData.chargingPoints.map((p) => p.powerKw),
                    )}{" "}
                    kW
                  </div>
                  <div className="text-xs text-gray-500">max power</div>
                </div>
              </div>

              <Separator
                orientation="vertical"
                className="h-5 bg-emerald-200"
              />

              <Badge
                variant="outline"
                className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all duration-300 cursor-pointer"
              >
                <Clock className="h-3 w-3 mr-1" /> 24/7
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <QuickStats
              avgWaitTime={avgWaitTime}
              co2Saved={co2Saved}
              topRating={topRating}
              loading={false}
            />

            <ChargingPointsGrid
              chargingPoints={stationData.chargingPoints}
              selectedPointId={selectedPointId}
              onSelectPoint={handleSelectPoint}
              selectedVehicle={selectedVehicle}
              handleChangeVehicle={handleChangeVehicle}
            />

            {/* Tariff Selector */}
            {stationData.tariffs.length > 1 && (
              <TariffSelector
                tariffs={stationData.tariffs}
                selectedTariffId={selectedTariffId}
                onTariffSelect={setSelectedTariffId}
              />
            )}

            <EnergySelector
              selectedPoint={selectedPoint}
              energyKwh={energyKwh}
              setEnergyKwh={setEnergyKwh}
              pricePerKwh={pricePerKwh}
              estimatedTimeMin={estimatedTimeMin}
              setEstimatedTimeMin={setEstimatedTimeMin}
              vehicleCapacity={selectedVehicle?.capacity}
            />

            <TimeSlotPicker
              selectedPointId={selectedPointId}
              workingHours={workingHours}
              reservations={[]}
              onTimeSlotSelect={setSelectedTimeSlot}
              selectedTimeSlot={selectedTimeSlot}
              estimatedTimeMin={estimatedTimeMin}
            />

            {/* Reviews Preview */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  What Riders Say
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {stationData.ratings.slice(0, 2).map((review) => (
                    <div
                      key={review.id}
                      className="min-w-[250px] bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-3 border border-emerald-100"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < review.score ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">
                        &quot;{review.comment}&quot;
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3 text-emerald-500" />
                        <span>Verified Charger</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - STICKY BOOKING SUMMARY */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingSummary
                selectedPoint={selectedPoint}
                energyKwh={energyKwh}
                pricePerKwh={pricePerKwh}
                stationData={stationData}
                pointsBalance={pointsBalance}
                walletBalance={walletBalance}
                selectedTimeSlot={selectedTimeSlot}
                estimatedTimeMin={estimatedTimeMin}
                applyPoints={applyPoints}
                setApplyPoints={setApplyPoints}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                totalAmount={totalAmount}
                pointsToUseAmount={pointsToUseAmount}
                isBooking={isBooking}
                bookingSuccess={bookingSuccess}
                pointsPaymentSuccess={pointsPaymentSuccess}
                walletLoading={walletLoading}
                onOpenPayment={handleOpenPayment}
                onRefreshBalances={() => dispatch(fetchUserWallet())}
                selectedVehicle={selectedVehicle}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Password Dialog */}
      <WalletPasswordDialog
        open={showWalletPassword}
        onOpenChange={setShowWalletPassword}
        walletPassword={walletPassword}
        setWalletPassword={setWalletPassword}
        passwordError={passwordError}
        setPasswordError={setPasswordError}
        pointsToUseAmount={pointsToUseAmount}
        isVerifying={isVerifying}
        totalAmount={totalAmount}
        paymentType={pendingPaymentType}
        onConfirm={handleWalletPasswordVerification}
        onCancel={handleWalletDialogCancel}
      />

      {/* Creating Reservation Loading Dialog */}
      <Dialog open={showCreatingReservation} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md rounded-2xl overflow-hidden p-0 border-0 shadow-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="p-8 text-center space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto"
            >
              <div className="w-20 h-20 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
            </motion.div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-800">
                Creating Your Reservation
              </h3>
              <p className="text-gray-600">
                Please wait while we process your payment and reserve the
                charging point...
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Station:</span>
                <span className="font-medium text-gray-700">
                  {stationData?.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Charging Point:</span>
                <span className="font-medium text-gray-700">
                  Slot {selectedPoint?.slotNumber}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Energy:</span>
                <span className="font-medium text-gray-700">
                  {energyKwh} kWh
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Time Slot:</span>
                <span className="font-medium text-gray-700">
                  {selectedTimeSlot
                    ? `${selectedTimeSlot.startTime.toLocaleTimeString()} - ${selectedTimeSlot.endTime.toLocaleTimeString()}`
                    : "Not selected"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payment Method:</span>
                <Badge className="bg-emerald-100 text-emerald-700">
                  {paymentMethod === "wallet"
                    ? "Wallet"
                    : paymentMethod === "points"
                      ? "Points"
                      : "Card"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-gray-100">
                <span className="text-gray-800">Total Amount:</span>
                <span className="text-emerald-600">
                  {formatCurrencyIntl(totalAmount)}
                </span>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-lg p-3">
              <div className="flex items-center gap-2 justify-center text-sm text-emerald-700">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Processing payment and securing your slot...</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Vehicle Selector Component
const VehicleSelector = ({
  vehicles,
  onSelectVehicle,
  isLoading,
  onBack,
}: {
  vehicles: Vehicle[]
  onSelectVehicle: (id: number) => void
  isLoading: boolean
  onBack: () => void
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={onBack}
              className="group flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-emerald-600 transition-all duration-300 rounded-xl hover:bg-white/50 backdrop-blur-sm"
            >
              <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Select Your Vehicle
                </h1>
                <p className="text-xs text-gray-500">
                  Choose which vehicle you want to charge at this station
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-emerald-300 group overflow-hidden"
                  onClick={() => onSelectVehicle(vehicle.id)}
                >
                  <div className="flex p-4 gap-4">
                    <div className="relative h-24 w-24 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                      {vehicle.vehicleImageUrl ? (
                        <Image
                          src={vehicle.vehicleImageUrl}
                          alt={vehicle.model}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Car className="h-10 w-10 text-emerald-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            {vehicle.manufacturer} {vehicle.model}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {vehicle.year} • {vehicle.plateNumber}
                          </p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          {vehicle.connectorType}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Battery className="h-3 w-3" />
                          <span>{vehicle.capacity} kWh</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Zap className="h-3 w-3" />
                          <span>EV Ready</span>
                        </div>
                      </div>

                      <Button
                        className="w-full mt-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                        onClick={() => onSelectVehicle(vehicle.id)}
                      >
                        Select This Vehicle
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && vehicles.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No Vehicles Found
              </h3>
              <p className="text-gray-600 mb-4">
                You don&apos;t have any vehicles added to your account yet.
              </p>
              <Button
                onClick={() => (window.location.href = "/user/vehicles")}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Add a Vehicle First
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Quick Stats Component
const QuickStats = ({
  avgWaitTime,
  co2Saved,
  topRating,
  loading,
}: {
  avgWaitTime: string
  co2Saved: string
  topRating: string
  loading: boolean
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-3 shadow-sm border border-emerald-100 animate-pulse"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white rounded-xl p-3 shadow-sm border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all duration-300 group">
        <div className="flex items-center gap-2 text-emerald-600 mb-1">
          <Clock className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-xs font-medium">Avg Wait</span>
        </div>
        <div className="text-lg font-bold text-gray-800">{avgWaitTime}</div>
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all duration-300 group">
        <div className="flex items-center gap-2 text-emerald-600 mb-1">
          <Leaf className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-xs font-medium">CO₂ Saved</span>
        </div>
        <div className="text-lg font-bold text-gray-800">{co2Saved}</div>
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all duration-300 group">
        <div className="flex items-center gap-2 text-emerald-600 mb-1">
          <Award className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-xs font-medium">Top Rated</span>
        </div>
        <div className="text-lg font-bold text-gray-800">{topRating}</div>
      </div>
    </div>
  )
}

// Tariff Selector Component
const TariffSelector = ({
  tariffs,
  selectedTariffId,
  onTariffSelect,
}: {
  tariffs: Tariff[]
  selectedTariffId: number | null
  onTariffSelect: (id: number) => void
}) => {
  return (
    <Card className="border-0 shadow-none bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-gray-800">
          <DollarSign className="h-4 w-4 text-emerald-600" />
          Select Tariff Plan
        </CardTitle>
        <CardDescription>
          Choose the best pricing option for your charging session
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tariffs.map((tariff) => {
            const isSelected = selectedTariffId === tariff.id
            const pricePerKwh = parseFloat(tariff.pricePerKwh)

            return (
              <motion.button
                key={tariff.id}
                onClick={() => onTariffSelect(tariff.id)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-sm"
                }`}
                whileTap={{ scale: 0.98 }}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                )}

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold text-gray-800">
                    {pricePerKwh.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {tariff.currency}/kWh
                  </span>
                </div>

                {tariff.pricePerMinute && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Timer className="h-3 w-3" />
                    <span>
                      + {parseFloat(tariff.pricePerMinute).toFixed(2)}{" "}
                      {tariff.currency}/min
                    </span>
                  </div>
                )}

                {tariff.idleFeePerMinute && (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <Clock className="h-3 w-3" />
                    <span>
                      Idle fee: {parseFloat(tariff.idleFeePerMinute).toFixed(2)}{" "}
                      {tariff.currency}/min
                    </span>
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-400">
                  Valid from {new Date(tariff.validFrom).toLocaleDateString()}
                  {tariff.validTo &&
                    ` to ${new Date(tariff.validTo).toLocaleDateString()}`}
                </div>
              </motion.button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Wallet Password Dialog Component
// Wallet Password Dialog Component - Updated to show context for both wallet and points
const WalletPasswordDialog = ({
  open,
  onOpenChange,
  walletPassword,
  setWalletPassword,
  passwordError,
  setPasswordError,
  isVerifying,
  totalAmount,
  paymentType,
  onConfirm,
  pointsToUseAmount,
  onCancel,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  walletPassword: string
  setWalletPassword: (value: string) => void
  setPasswordError: (value: string) => void
  pointsToUseAmount: number
  passwordError: string
  isVerifying: boolean
  totalAmount: number
  paymentType: "wallet" | "points" | null
  onConfirm: () => void
  onCancel: () => void
}) => {
  // Calculate points equivalent if payment type is points
  const pointsEquivalent =
    paymentType === "points" ? Math.ceil(totalAmount / 0.5) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl rounded-2xl overflow-hidden p-0 border-0 shadow-2xl">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <DialogHeader className="px-8 pt-8 pb-2">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {paymentType === "points"
                  ? "Points Redemption Authentication"
                  : "Wallet Authentication"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600 text-base">
              {paymentType === "points"
                ? "Enter your 6-digit wallet password to authorize points redemption"
                : "Enter your 6-digit wallet password to complete the payment securely"}
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <div className="px-8 py-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className={`rounded-xl p-4 border backdrop-blur-sm ${
              paymentType === "points"
                ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-200/50"
                : "bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-200/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-md ${
                    paymentType === "points"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500"
                      : "bg-gradient-to-r from-emerald-500 to-green-600"
                  }`}
                >
                  {paymentType === "points" ? (
                    <Coins className="h-5 w-5 text-white" />
                  ) : (
                    <Wallet className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    {paymentType === "points" ? "Paying with" : "Paying with"}
                  </p>
                  <p className="font-bold text-gray-800 text-lg">
                    {paymentType === "points"
                      ? "HabeshaGo Points"
                      : "HabeshaGo Wallet"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-medium">
                  {paymentType === "points"
                    ? "Points to Redeem"
                    : "Amount to Pay"}
                </p>
                <motion.p
                  key={totalAmount}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className={`font-bold text-2xl ${
                    paymentType === "points"
                      ? "text-amber-600"
                      : "bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent"
                  }`}
                >
                  {paymentType === "points"
                    ? `${pointsToUseAmount * 2} pts`
                    : formatCurrencyIntl(totalAmount)}
                </motion.p>
                {paymentType === "points" && (
                  <p className="text-xs text-gray-400 mt-1">
                    ≈ {formatCurrencyIntl(pointsToUseAmount)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Info message for points payment */}
          {paymentType === "points" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 rounded-lg p-3 border border-blue-200"
            >
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Points Redemption Details:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>1 point = {formatCurrencyIntl(0.5)}</li>
                    <li>Points cannot be refunded once redeemed</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
              <Key className="h-4 w-4 text-emerald-500" />
              Wallet Password (6-digit code)
            </Label>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={walletPassword}
                onChange={(value) => {
                  setWalletPassword(value)
                  // Clear error when user starts typing
                  if (passwordError) setPasswordError("")
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
                <AlertCircle className="h-3 w-3" />
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
        </div>

        <div className="flex gap-3 px-8 pb-8">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 rounded-xl h-12 border-2 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={walletPassword.length !== 6 || isVerifying}
            className={`flex-1 rounded-xl h-12 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              paymentType === "points"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            } text-white`}
          >
            {isVerifying ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Verifying...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {paymentType === "points"
                  ? "Confirm Points Redemption"
                  : "Confirm Payment"}
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
