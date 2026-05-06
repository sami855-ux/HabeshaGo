"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
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
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MapPin,
  Clock,
  Shield,
  Star,
  CreditCard,
  Wallet,
  Coins,
  CheckCircle,
  Calendar,
  Info,
  ChevronLeft,
  Award,
  Loader2,
  DollarSign,
  Key,
  X,
  Car,
  AlertCircle,
  CircleParking,
  Wifi,
  Camera,
  Zap,
  Coffee,
  Navigation,
  Sparkles,
  Users,
  Gauge,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { cn, formatCurrencyIntl } from "@/lib/utils"
import { toast } from "sonner"
import { VehicleSelector } from "@/components/user-dashboard/parking/vehicle-selector"
import { ParkingSlotsGrid } from "@/components/user-dashboard/parking/parking-slots-grid"
import { TimeSlotPicker } from "@/components/user-dashboard/parking/time-slot-picker"
import { BookingSummary } from "@/components/user-dashboard/parking/booking-summary"
import { WalletPasswordDialog } from "@/components/user-dashboard/parking/wallet-password-dialog"
import { ReservationSuccess } from "@/components/user-dashboard/parking/reservation-success"

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
  description: string
  address: string
  city: string
  latitude: number
  longitude: number
  totalSlots: number
  availableSlots: number
  pricePerMinute: number
  openingTime: string
  closingTime: string
  hasSecurity: boolean
  hasCCTV: boolean
  rating: number
  totalReviews: number
  amenities: string[]
  slots: ParkingSlot[]
}

interface Vehicle {
  id: number
  type: string
  vin: string
  model: string
  plateNumber: string
  manufacturer: string
  year: number
  color?: string
}

interface TimeSlot {
  id: string
  startTime: Date
  endTime: Date
  isAvailable: boolean
}

// Mock Parking Lot Data
const MOCK_PARKING_LOTS: Record<string, ParkingLotData> = {
  lot_001: {
    id: "lot_001",
    name: "Downtown Central Parking",
    description:
      "Premier parking facility in the heart of downtown. Safe, secure, and conveniently located near major shopping centers and business districts.",
    address: "123 Main Street, Downtown",
    city: "Addis Ababa",
    latitude: 9.0227,
    longitude: 38.7468,
    totalSlots: 250,
    availableSlots: 87,
    pricePerMinute: 0.25,
    openingTime: "2024-01-01T00:00:00Z",
    closingTime: "2024-01-01T23:59:59Z",
    hasSecurity: true,
    hasCCTV: true,
    rating: 4.7,
    totalReviews: 342,
    amenities: [
      "24/7 Security",
      "CCTV Monitoring",
      "EV Charging",
      "Free WiFi",
      "Waiting Lounge",
      "Car Wash",
    ],
    slots: [
      {
        id: "slot_001",
        slotNumber: "A01",
        slotType: "CAR",
        status: "AVAILABLE",
        isEV: false,
        hasCharger: false,
        floor: 1,
        section: "A",
      },
      {
        id: "slot_002",
        slotNumber: "A02",
        slotType: "CAR",
        status: "AVAILABLE",
        isEV: false,
        hasCharger: false,
        floor: 1,
        section: "A",
      },
      {
        id: "slot_003",
        slotNumber: "A03",
        slotType: "EV",
        status: "AVAILABLE",
        isEV: true,
        hasCharger: true,
        floor: 1,
        section: "A",
        priceMultiplier: 1.2,
      },
      {
        id: "slot_004",
        slotNumber: "A04",
        slotType: "EV",
        status: "OCCUPIED",
        isEV: true,
        hasCharger: true,
        floor: 1,
        section: "A",
      },
      {
        id: "slot_005",
        slotNumber: "B01",
        slotType: "CAR",
        status: "AVAILABLE",
        isEV: false,
        hasCharger: false,
        floor: 2,
        section: "B",
      },
      {
        id: "slot_006",
        slotNumber: "B02",
        slotType: "CAR",
        status: "AVAILABLE",
        isEV: false,
        hasCharger: false,
        floor: 2,
        section: "B",
      },
      {
        id: "slot_007",
        slotNumber: "B03",
        slotType: "DISABLED",
        status: "AVAILABLE",
        isEV: false,
        hasCharger: false,
        floor: 2,
        section: "B",
      },
      {
        id: "slot_008",
        slotNumber: "B04",
        slotType: "CAR",
        status: "RESERVED",
        isEV: false,
        hasCharger: false,
        floor: 2,
        section: "B",
      },
      {
        id: "slot_009",
        slotNumber: "C01",
        slotType: "EV",
        status: "AVAILABLE",
        isEV: true,
        hasCharger: true,
        floor: 3,
        section: "C",
        priceMultiplier: 1.2,
      },
      {
        id: "slot_010",
        slotNumber: "C02",
        slotType: "CAR",
        status: "AVAILABLE",
        isEV: false,
        hasCharger: false,
        floor: 3,
        section: "C",
      },
      {
        id: "slot_011",
        slotNumber: "C03",
        slotType: "CAR",
        status: "MAINTENANCE",
        isEV: false,
        hasCharger: false,
        floor: 3,
        section: "C",
      },
      {
        id: "slot_012",
        slotNumber: "C04",
        slotType: "EV",
        status: "AVAILABLE",
        isEV: true,
        hasCharger: true,
        floor: 3,
        section: "C",
        priceMultiplier: 1.2,
      },
    ],
  },
  lot_002: {
    id: "lot_002",
    name: "Bole Medhanialem Parking",
    description:
      "Secure parking at Bole Medhanialem area. Close to shopping malls, restaurants, and entertainment centers.",
    address: "Bole Road, Bole",
    city: "Addis Ababa",
    latitude: 9.0051,
    longitude: 38.7635,
    totalSlots: 180,
    availableSlots: 45,
    pricePerMinute: 0.3,
    openingTime: "2024-01-01T00:00:00Z",
    closingTime: "2024-01-01T23:59:59Z",
    hasSecurity: true,
    hasCCTV: true,
    rating: 4.5,
    totalReviews: 278,
    amenities: ["24/7 Security", "CCTV Monitoring", "EV Charging", "Free WiFi"],
    slots: [
      {
        id: "slot_101",
        slotNumber: "P01",
        slotType: "CAR",
        status: "AVAILABLE",
        isEV: false,
        hasCharger: false,
        floor: 1,
        section: "A",
      },
      {
        id: "slot_102",
        slotNumber: "P02",
        slotType: "CAR",
        status: "AVAILABLE",
        isEV: false,
        hasCharger: false,
        floor: 1,
        section: "A",
      },
      {
        id: "slot_103",
        slotNumber: "P03",
        slotType: "EV",
        status: "AVAILABLE",
        isEV: true,
        hasCharger: true,
        floor: 1,
        section: "A",
        priceMultiplier: 1.15,
      },
      {
        id: "slot_104",
        slotNumber: "P04",
        slotType: "CAR",
        status: "OCCUPIED",
        isEV: false,
        hasCharger: false,
        floor: 1,
        section: "A",
      },
    ],
  },
}

// Mock Vehicles
const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 1,
    type: "SUV",
    vin: "1HGCM82633A123456",
    model: "CR-V",
    plateNumber: "AA-1234",
    manufacturer: "Honda",
    year: 2022,
    color: "White",
  },
  {
    id: 2,
    type: "SEDAN",
    vin: "2FMDK3GC5DBA78901",
    model: "Camry",
    plateNumber: "BB-5678",
    manufacturer: "Toyota",
    year: 2023,
    color: "Black",
  },
  {
    id: 3,
    type: "ELECTRIC",
    vin: "5YJSA1E46GF123456",
    model: "Model 3",
    plateNumber: "CC-9012",
    manufacturer: "Tesla",
    year: 2024,
    color: "Red",
  },
]

// Mock Wallet Data
const MOCK_WALLET = {
  balance: 1250.75,
  points: 3450,
}

// Quick Stats Component
const QuickStats = ({ parkingLot }: { parkingLot: ParkingLotData }) => {
  const stats = [
    { icon: Clock, label: "Avg Wait", value: "~5 min", color: "text-blue-600" },
    { icon: Shield, label: "Security", value: "24/7", color: "text-green-600" },
    {
      icon: Award,
      label: "Top Rated",
      value: `#${Math.floor(Math.random() * 10) + 1} in City`,
      color: "text-amber-600",
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl p-3 shadow-sm border border-blue-100 hover:shadow-md hover:border-blue-300 transition-all duration-300 group"
        >
          <div className="flex items-center gap-2 mb-1">
            <stat.icon
              className={`h-4 w-4 ${stat.color} group-hover:scale-110 transition-transform duration-300`}
            />
            <span className="text-xs font-medium text-gray-500">
              {stat.label}
            </span>
          </div>
          <div className="text-lg font-bold text-gray-800">{stat.value}</div>
        </div>
      ))}
    </div>
  )
}

export default function ParkingBookingPage() {
  const params = useParams()
  const router = useRouter()
  const parkingLotId = "lot_001"

  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null,
  )
  const [showVehicleSelector, setShowVehicleSelector] = useState(true)
  const [durationHours, setDurationHours] = useState(2)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null,
  )
  const [paymentMethod, setPaymentMethod] = useState<
    "wallet" | "points" | "card"
  >("wallet")
  const [applyPoints, setApplyPoints] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [pointsPaymentSuccess, setPointsPaymentSuccess] = useState(false)
  const [reservationError, setReservationError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [walletBalance] = useState(MOCK_WALLET.balance)
  const [pointsBalance] = useState(MOCK_WALLET.points)
  const [parkingLot, setParkingLot] = useState<ParkingLotData | null>(null)
  const [vehicles] = useState<Vehicle[]>(MOCK_VEHICLES)

  // Payment dialog states
  const [showWalletPassword, setShowWalletPassword] = useState(false)
  const [walletPassword, setWalletPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [showCreatingReservation, setShowCreatingReservation] = useState(false)
  const [pendingPaymentType, setPendingPaymentType] = useState<
    "wallet" | "points" | null
  >(null)

  const [reservationDetails, setReservationDetails] = useState<any>(null)
  // Load parking lot data
  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      const lot = MOCK_PARKING_LOTS[parkingLotId]
      if (lot) {
        setParkingLot(lot)
      }
      setIsLoading(false)
    }, 500)
  }, [parkingLotId])

  // Calculations
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId)
  const pricePerMinute = parkingLot?.pricePerMinute || 0
  const subtotal = durationHours * 60 * pricePerMinute
  const priceMultiplier = selectedSlot?.priceMultiplier || 1
  const adjustedSubtotal = subtotal * priceMultiplier
  const POINTS_CONVERSION_RATE = 0.5
  const pointsToUseAmount = applyPoints
    ? Math.min(pointsBalance * POINTS_CONVERSION_RATE, adjustedSubtotal)
    : 0
  const totalAmount = adjustedSubtotal - pointsToUseAmount

  // Handlers
  const handleSelectVehicle = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId)
    setShowVehicleSelector(false)
    setReservationError(null)
  }

  const handleChangeVehicle = () => {
    setShowVehicleSelector(true)
    setSelectedVehicleId(null)
    setSelectedSlot(null)
    setSelectedTimeSlot(null)
    setReservationError(null)
  }

  const handleSelectSlot = (slot: ParkingSlot) => {
    setSelectedSlot(slot)
    setReservationError(null)
  }

  const handleOpenPayment = () => {
    if (!selectedSlot) {
      setReservationError("Please select a parking slot")
      return
    }

    if (!selectedTimeSlot) {
      setReservationError("Please select a time slot")
      return
    }

    if (!selectedVehicleId) {
      setReservationError("Please select a vehicle first")
      return
    }

    setReservationError(null)

    if (paymentMethod === "wallet") {
      if (walletBalance >= totalAmount) {
        setPendingPaymentType("wallet")
        setShowWalletPassword(true)
      } else {
        setReservationError(
          `Insufficient wallet balance. Need ${formatCurrencyIntl(totalAmount - walletBalance)} more.`,
        )
      }
    } else if (paymentMethod === "points") {
      if (!applyPoints) {
        setReservationError("Please apply your points before proceeding")
        return
      }
      if (pointsBalance === 0) {
        setReservationError("No points available to use")
        return
      }
      setPendingPaymentType("points")
      setShowWalletPassword(true)
    } else if (paymentMethod === "card") {
      handleCardPayment()
    }
  }

  const handleWalletPasswordVerification = async () => {
    setIsVerifying(true)
    setPasswordError("")

    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (walletPassword === "123456") {
      setPasswordError("")
      setShowWalletPassword(false)
      setWalletPassword("")
      setShowCreatingReservation(true)
      await createReservation()
    } else {
      setPasswordError("Invalid wallet password. Please try again.")
      setWalletPassword("")
    }

    setIsVerifying(false)
  }

  const handleCardPayment = async () => {
    setReservationError(null)
    setShowCreatingReservation(true)
    await createReservation()
  }

  const handleWalletDialogCancel = () => {
    setShowWalletPassword(false)
    setWalletPassword("")
    setPasswordError("")
    setPendingPaymentType(null)
  }

  const createReservation = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create reservation details object
    const details = {
      reservationCode: `PRK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      parkingLotName: parkingLot?.name || "",
      parkingLotAddress: parkingLot?.address || "",
      slotNumber: selectedSlot?.slotNumber || "",
      floor: selectedSlot?.floor,
      section: selectedSlot?.section,
      startTime: selectedTimeSlot?.startTime || new Date(),
      endTime: selectedTimeSlot?.endTime || new Date(),
      durationHours: durationHours,
      vehicleModel:
        `${selectedVehicle?.manufacturer} ${selectedVehicle?.model}` || "",
      vehiclePlate: selectedVehicle?.plateNumber || "",
      totalAmount: totalAmount,
      originalAmount: adjustedSubtotal,
      pointsUsed: pointsToUseAmount,
      paymentMethod: paymentMethod,
      status: "confirmed" as const,
    }

    setReservationDetails(details)

    if (paymentMethod === "points" || paymentMethod === "wallet") {
      setPointsPaymentSuccess(true)
      setTimeout(() => setPointsPaymentSuccess(false), 3000)
    }

    setBookingSuccess(true)
    setShowCreatingReservation(false)

    toast.success("Parking spot reserved successfully!")
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading parking lot details...</p>
        </div>
      </div>
    )
  }

  // Parking lot not found
  if (!parkingLot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <CircleParking className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Parking Lot Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The parking lot you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // Show vehicle selector first
  if (showVehicleSelector && vehicles.length > 0 && !selectedVehicleId) {
    return (
      <VehicleSelector
        vehicles={vehicles}
        onSelectVehicle={handleSelectVehicle}
        isLoading={false}
        onBack={() => router.back()}
      />
    )
  }

  // Show success page if booking is successful
  if (bookingSuccess && reservationDetails) {
    return (
      <ReservationSuccess
        reservationDetails={reservationDetails}
        onNavigateToMyReservations={() => router.push("/user/trips")}
        onBookAnother={() => {
          setBookingSuccess(false)
          setReservationDetails(null)
          setSelectedSlot(null)
          setSelectedTimeSlot(null)
          setApplyPoints(false)
          setPointsPaymentSuccess(false)
          setShowVehicleSelector(true)
          setSelectedVehicleId(null)
          setReservationError(null)
        }}
        onBackToHome={() => router.push("/user/dashboard")}
        onViewDirections={() => {
          // Open Google Maps with directions
          if (parkingLot) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${parkingLot.latitude},${parkingLot.longitude}`
            window.open(url, "_blank")
          }
        }}
        onDownloadReceipt={() => {
          // Implement receipt download logic
          toast.success("Receipt downloaded")
        }}
        onShare={() => {
          // Implement share logic
          navigator
            .share?.({
              title: "Parking Reservation",
              text: `Your parking spot ${reservationDetails.slotNumber} at ${reservationDetails.parkingLotName} is confirmed!`,
              url: window.location.href,
            })
            .catch(() => {
              toast.success("Reservation details copied to clipboard")
            })
        }}
      />
    )
  }

  return (
    <div className="min-h-screen ">
      {/* Selected Vehicle Banner */}
      {selectedVehicle && (
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-blue-100">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Parking for: {selectedVehicle.manufacturer}{" "}
                  {selectedVehicle.model} ({selectedVehicle.plateNumber})
                </span>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Selected
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleChangeVehicle}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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

      {/* Header */}
      <div className="border-b border-blue-200/50 backdrop-blur-sm bg-white/80 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3">
              <button
                onClick={() => router.back()}
                className="group h-12 w-12 rounded-xl bg-white border border-blue-200 
                   flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 
                   hover:scale-105 active:scale-95 hover:border-blue-400 cursor-pointer"
              >
                <ChevronLeft
                  size={24}
                  className="text-blue-600 group-hover:text-blue-700"
                />
              </button>

              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <CircleParking className="h-6 w-6 text-white" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                    {parkingLot.name}
                  </h1>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <Shield className="h-3 w-3 mr-1" /> Premium
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm mt-0.5 text-gray-600">
                  <MapPin className="h-3.5 w-3.5 text-blue-500" />
                  <span>
                    {parkingLot.address}, {parkingLot.city}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-gray-800">
                    {parkingLot.rating}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  ({parkingLot.totalReviews})
                </span>
              </div>

              <Separator orientation="vertical" className="h-5 bg-blue-200" />

              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CircleParking className="h-3.5 w-3.5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {parkingLot.availableSlots} spots
                  </div>
                  <div className="text-xs text-gray-500">available</div>
                </div>
              </div>

              <Separator orientation="vertical" className="h-5 bg-blue-200" />

              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <DollarSign className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {formatCurrencyIntl(parkingLot.pricePerMinute * 60)}/h
                  </div>
                  <div className="text-xs text-gray-500">starting from</div>
                </div>
              </div>

              <Separator orientation="vertical" className="h-5 bg-blue-200" />

              <Badge
                variant="outline"
                className="bg-blue-50 border-blue-200 text-blue-700"
              >
                <Clock className="h-3 w-3 mr-1" /> 24/7
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Parking Slots Grid */}
            <ParkingSlotsGrid
              slots={parkingLot.slots}
              selectedSlotId={selectedSlot?.id || null}
              onSelectSlot={handleSelectSlot}
            />

            {/* Time Slot Picker */}
            <TimeSlotPicker
              onTimeSlotSelect={setSelectedTimeSlot}
              selectedTimeSlot={selectedTimeSlot}
              durationHours={durationHours}
              setDurationHours={setDurationHours}
            />

            {/* Description */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                  <Info className="h-4 w-4 text-blue-600" />
                  About this Parking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {parkingLot.description}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>✓ Free cancellation up to 1 hour before</span>
                  <span>✓ Secure payment</span>
                  <span>✓ 24/7 customer support</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Booking Summary */}
          <div className="lg:col-span-1">
            <BookingSummary
              selectedSlot={selectedSlot}
              durationHours={durationHours}
              pricePerMinute={pricePerMinute}
              parkingLot={parkingLot}
              pointsBalance={pointsBalance}
              walletBalance={walletBalance}
              selectedTimeSlot={selectedTimeSlot}
              applyPoints={applyPoints}
              setApplyPoints={setApplyPoints}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              totalAmount={totalAmount}
              pointsToUseAmount={pointsToUseAmount}
              isBooking={isBooking}
              bookingSuccess={bookingSuccess}
              pointsPaymentSuccess={pointsPaymentSuccess}
              walletLoading={false}
              onOpenPayment={handleOpenPayment}
              onRefreshBalances={() => {}}
              selectedVehicle={selectedVehicle}
            />
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
              <div className="w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
            </motion.div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-800">
                Creating Your Reservation
              </h3>
              <p className="text-gray-600">
                Please wait while we process your payment and reserve your
                parking spot...
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Parking Lot:</span>
                <span className="font-medium text-gray-700">
                  {parkingLot.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Parking Slot:</span>
                <span className="font-medium text-gray-700">
                  Slot {selectedSlot?.slotNumber}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium text-gray-700">
                  {durationHours} hour{durationHours > 1 ? "s" : ""}
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
                <Badge className="bg-blue-100 text-blue-700">
                  {paymentMethod === "wallet"
                    ? "Wallet"
                    : paymentMethod === "points"
                      ? "Points"
                      : "Card"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-gray-100">
                <span className="text-gray-800">Total Amount:</span>
                <span className="text-blue-600">
                  {formatCurrencyIntl(totalAmount)}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 justify-center text-sm text-blue-700">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Processing payment and securing your spot...</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
