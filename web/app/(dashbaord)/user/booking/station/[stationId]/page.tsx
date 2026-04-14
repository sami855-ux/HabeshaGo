"use client"

import { useParams, useRouter } from "next/navigation"
import { useMemo, useRef, useEffect } from "react"
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
  Wifi,
  Coffee,
  Star,
  CreditCard,
  Wallet,
  Coins,
  CheckCircle,
  Leaf,
  Plug,
  Calendar,
  Info,
  ChevronLeft,
  BatteryCharging,
  TrendingUp,
  Award,
  Gauge,
  Navigation,
} from "lucide-react"
import { useState } from "react"

import { getMockStationData, formatCurrency } from "@/lib/station-utils"
import { ChargingPointsGrid } from "@/components/ev/charging-points-grid"
import { EnergySelector } from "@/components/ev/energy-selector"
import { PaymentDialog } from "@/components/ev/payment-dialog"
import { BookingSummary } from "@/components/ev/ev-booking-summary"
import {
  mockReservations,
  TimeSlotPicker,
} from "@/components/ev/TimeslotPicker"
import { ReservationSuccessComponent } from "@/components/ev/reservation-success"

interface TimeSlot {
  id: string
  startTime: Date
  endTime: Date
  isAvailable: boolean
  reservedBy?: string
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const stationId = params?.id as string
  const stationData = useMemo(() => getMockStationData(stationId), [stationId])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null,
  )
  const [estimatedTimeMin, setEstimatedTimeMin] = useState<number | undefined>()
  const [reservationDetails, setReservationDetails] = useState<any>(null)

  // Add working hours for the station
  const workingHours = {
    start: "09:00",
    end: "22:00",
  }

  // State lifted from original component
  const [selectedPointId, setSelectedPointId] = useState<number | null>(null)
  const [energyKwh, setEnergyKwh] = useState<number>(35)
  const [paymentMethod, setPaymentMethod] = useState<
    "wallet" | "points" | "card"
  >("wallet")
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentStep, setPaymentStep] = useState<
    "confirm" | "processing" | "success"
  >("confirm")
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  })
  const rightRef = useRef<HTMLDivElement | null>(null)
  const [isCompact, setIsCompact] = useState(false)
  const [applyPoints, setApplyPoints] = useState(false)
  const [savedCards] = useState([
    { id: 1, last4: "4242", brand: "Visa", expiry: "12/25" },
    { id: 2, last4: "5555", brand: "Mastercard", expiry: "08/26" },
  ])
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null)
  const [useNewCard, setUseNewCard] = useState(false)

  const [loading, setLoading] = useState(false)

  // Example dynamic data from your stationData
  const avgWaitTime = stationData?.avgWaitTime || "~8 min"
  const co2Saved = stationData?.co2Saved || "12.4 tons"
  const topRating = stationData?.topRating || "#1 in City"

  const selectedPoint = stationData.chargingPoints.find(
    (p) => p.id === selectedPointId,
  )
  const pricePerKwh = parseFloat(stationData.tariffs[0].pricePerKwh)
  const currency = stationData.tariffs[0].currency
  const subtotal = energyKwh * pricePerKwh

  const walletBalance = 68.5
  const pointsBalance = 3850
  const pointsValue = pointsBalance * 0.01
  const pointsToUseAmount = applyPoints ? Math.min(pointsValue, subtotal) : 0
  const totalAmount = subtotal - pointsToUseAmount

  const availablePoints = stationData.chargingPoints.filter(
    (p) => p.status === "AVAILABLE",
  )

  const handleSelectPoint = (pointId: number) => {
    const point = stationData.chargingPoints.find((p) => p.id === pointId)
    if (point?.status === "OCCUPIED") return
    setSelectedPointId(pointId)
    setBookingSuccess(false)
    setShowPaymentDialog(false)
  }

  const handleBackToHome = () => {
    // Option 1: Navigate to home page
    router.push("/user/ev-charging")

    // Option 2: Reset and show booking page again
    // setBookingSuccess(false)
    // setReservationDetails(null)
    // setSelectedPointId(null)
    // setSelectedTimeSlot(null)
    // setEnergyKwh(35)
  }

  const handleOpenPayment = () => {
    if (!selectedPoint) return
    if (energyKwh <= 0 || energyKwh > 200) return
    if (paymentMethod === "wallet" && walletBalance < totalAmount) return
    setPaymentStep("confirm")
    setShowPaymentDialog(true)
  }

  const handleProcessPayment = async () => {
    setPaymentStep("processing")
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (paymentMethod === "card" && useNewCard) {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
        setPaymentStep("confirm")
        return
      }
    }

    setPaymentStep("success")
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setShowPaymentDialog(false)
    setIsBooking(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsBooking(false)

    // Set reservation details before showing success
    setReservationDetails({
      stationName: stationData.name,
      stationAddress: stationData.address,
      stationCity: stationData.city,
      pointId: selectedPointId || 0,
      pointPower: selectedPoint?.powerKw || 0,
      connectorType: selectedPoint?.connectorType || "CCS2",
      timeSlot: selectedTimeSlot || {
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
      },
      energyKwh: energyKwh,
      totalAmount: totalAmount,
      currency: currency,
      paymentMethod: paymentMethod,
      reservationCode: `EV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    })

    setBookingSuccess(true)

    // Don't auto-hide the success screen - let user navigate away
    // setTimeout(() => setBookingSuccess(false), 5000) // Remove this line
  }
  // Add handler functions
  const handleNavigateToMyReservations = () => {
    // router.push("/dashboard/reservations") // Adjust path as needed
  }

  const handleBookAnother = () => {
    setBookingSuccess(false)
    setReservationDetails(null)
    setSelectedPointId(null)
    setSelectedTimeSlot(null)
    setEnergyKwh(35)
    // Reset other states as needed
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!rightRef.current) return

      const top = rightRef.current.getBoundingClientRect().top

      // when it reaches sticky top (top-24 ≈ 96px)
      setIsCompact(top <= 96)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (bookingSuccess && reservationDetails) {
    return (
      <ReservationSuccessComponent
        reservationDetails={reservationDetails}
        onNavigateToMyReservations={handleNavigateToMyReservations}
        onBookAnother={handleBookAnother}
        onBackToHome={handleBackToHome}
      />
    )
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Clean Header */}
      <div className="border-b border-emerald-200/50 backdrop-blur-sm bg-white/80 top-0 z-10 sticky">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Left Section - Back Button & Station Info */}
            <div className="flex items-start gap-3">
              {/* Modern Back Button */}
              <button
                onClick={() => window.history.back()}
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

              {/* Station Icon */}
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md shrink-0">
                <Plug className="h-6 w-6 text-white" />
              </div>

              {/* Station Details */}
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
              {/* Rating */}
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="flex items-center gap-0.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-gray-800">
                    {stationData.rating}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  ({stationData.totalReviews})
                </span>
              </div>

              <Separator
                orientation="vertical"
                className="h-5 bg-emerald-200"
              />

              {/* Available Spots */}
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

              {/* Max Power */}
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

              {/* Operating Hours */}
              <Badge
                variant="outline"
                className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-300 cursor-pointer"
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
            {/* Quick Stats */}
            <QuickStats
              avgWaitTime={avgWaitTime}
              co2Saved={co2Saved}
              topRating={topRating}
              loading={loading}
            />

            <ChargingPointsGrid
              chargingPoints={stationData.chargingPoints}
              selectedPointId={selectedPointId}
              onSelectPoint={handleSelectPoint}
            />

            <EnergySelector
              selectedPoint={selectedPoint}
              energyKwh={energyKwh}
              setEnergyKwh={setEnergyKwh}
              pricePerKwh={pricePerKwh}
              estimatedTimeMin={estimatedTimeMin}
              setEstimatedTimeMin={setEstimatedTimeMin}
            />

            <TimeSlotPicker
              selectedPointId={selectedPointId}
              workingHours={workingHours}
              reservations={mockReservations}
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
                  {stationData.ratings.slice(0, 2).map((review, idx) => (
                    <div
                      key={idx}
                      className="min-w-[250px] bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-3 border border-emerald-100"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < Math.floor(review.score) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
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
                onBookingComplete={() => console.log("done")}
                onConfirmPayment={handleProcessPayment}
              />
            </div>
          </div>
        </div>
      </div>

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        paymentStep={paymentStep}
        stationName={stationData.name}
        selectedPoint={selectedPoint}
        energyKwh={energyKwh}
        totalAmount={totalAmount}
        applyPoints={applyPoints}
        pointsToUseAmount={pointsToUseAmount}
        paymentMethod={paymentMethod}
        walletBalance={walletBalance}
        pointsBalance={pointsBalance}
        savedCards={savedCards}
        selectedCardId={selectedCardId}
        setSelectedCardId={setSelectedCardId}
        useNewCard={useNewCard}
        setUseNewCard={setUseNewCard}
        cardDetails={cardDetails}
        setCardDetails={setCardDetails}
        onConfirmPayment={handleProcessPayment}
      />
    </div>
  )
}

const QuickStats = ({
  avgWaitTime = "~8 min",
  co2Saved = "12.4 tons",
  topRating = "#1 in City",
  loading = false,
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
      {/* Avg Wait Time */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all duration-300 group">
        <div className="flex items-center gap-2 text-emerald-600 mb-1">
          <Clock className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-xs font-medium">Avg Wait</span>
        </div>
        <div className="text-lg font-bold text-gray-800">{avgWaitTime}</div>
      </div>

      {/* CO₂ Saved */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all duration-300 group">
        <div className="flex items-center gap-2 text-emerald-600 mb-1">
          <Leaf className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-xs font-medium">CO₂ Saved</span>
        </div>
        <div className="text-lg font-bold text-gray-800">{co2Saved}</div>
      </div>

      {/* Top Rated */}
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
