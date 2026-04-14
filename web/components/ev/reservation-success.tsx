// components/ev/reservation-success.tsx
"use client"

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
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Plug,
  Zap,
  BatteryCharging,
  Navigation,
  Share2,
  Download,
  Mail,
  Smartphone,
  Shield,
  Wifi,
  Coffee,
  Star,
  CreditCard,
  Wallet,
  Coins,
  ArrowLeft,
  Home,
  ChevronRight,
  QrCode,
  ExternalLink,
  Clock8,
  Sparkles,
  PartyPopper,
  Leaf,
  Car,
  Timer,
  Receipt,
} from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import Link from "next/link"

interface ReservationSuccessProps {
  reservationDetails: {
    stationName: string
    stationAddress: string
    stationCity: string
    pointId: number
    pointPower: number
    connectorType: string
    timeSlot: {
      startTime: Date
      endTime: Date
    }
    energyKwh: number
    totalAmount: number
    currency: string
    paymentMethod: string
    reservationCode: string
    qrCodeUrl?: string
  }
  onNavigateToMyReservations?: () => void
  onBookAnother?: () => void
  onBackToHome?: () => void
}

export function ReservationSuccessComponent({
  reservationDetails,
  onNavigateToMyReservations,
  onBookAnother,
  onBackToHome,
}: ReservationSuccessProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const formatTimeSlot = () => {
    return `${format(reservationDetails.timeSlot.startTime, "MMM dd, yyyy")} • ${format(reservationDetails.timeSlot.startTime, "h:mm a")} - ${format(reservationDetails.timeSlot.endTime, "h:mm a")}`
  }

  const getTimeRemaining = () => {
    const now = new Date()
    const startTime = new Date(reservationDetails.timeSlot.startTime)
    const diffInHours = Math.ceil(
      (startTime.getTime() - now.getTime()) / (1000 * 60 * 60),
    )

    if (diffInHours <= 0) return "Starting soon"
    if (diffInHours < 24) return `In ${diffInHours} hours`
    return `In ${Math.ceil(diffInHours / 24)} days`
  }

  const handleShare = async () => {
    setIsSharing(true)
    const text = `🔋 I just reserved a charging spot at ${reservationDetails.stationName}! ⚡\nReservation code: ${reservationDetails.reservationCode}\nTime: ${formatTimeSlot()}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: "EV Charging Reservation",
          text: text,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(text)
        // You can add a toast notification here
        alert("Reservation details copied to clipboard!")
      }
    } catch (error) {
      console.log("Error sharing:", error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleDownloadReceipt = async () => {
    setIsDownloading(true)
    // Simulate download
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsDownloading(false)
    alert("Receipt downloaded successfully!")
  }

  const handleOpenMaps = () => {
    const address = `${reservationDetails.stationAddress}, ${reservationDetails.stationCity}`
    const encodedAddress = encodeURIComponent(address)
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      "_blank",
    )
  }

  return (
    <div className="min-h-screen ">
      {/* Floating particles effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Back Button - Floating */}
      <div className="">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToHome}
          className="bg-white/80 backdrop-blur-md hover:bg-white shadow-lg rounded-full px-4 gap-2 border border-white/20"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Hero Section with Celebration */}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Success Alert with Animation */}
            <div className="bg-white rounded-2xl shadow-none border border-emerald-100 overflow-hidden animate-slide-in">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 ">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-emerald-900">
                      Reservation #{reservationDetails.reservationCode}
                    </h3>
                    <p className="text-sm text-emerald-700 mt-0.5">
                      A confirmation email and SMS have been sent to your
                      registered contact.
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    Active
                  </Badge>
                </div>
              </div>
            </div>

            {/* Station Info Card - Modern Design */}
            <Card className="shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full blur-3xl opacity-50"></div>
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  Charging Station Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div>
                  <h3 className="font-bold text-xl text-gray-800">
                    {reservationDetails.stationName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {reservationDetails.stationAddress},{" "}
                      {reservationDetails.stationCity}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 group hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plug className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Charging Point
                        </p>
                        <p className="font-bold text-gray-800">
                          Point #{reservationDetails.pointId}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 group hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Max Power
                        </p>
                        <p className="font-bold text-gray-800">
                          {reservationDetails.pointPower} kW
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 group hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BatteryCharging className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Connector
                        </p>
                        <p className="font-bold text-gray-800">
                          {reservationDetails.connectorType}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 group hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BatteryCharging className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Energy Reserved
                        </p>
                        <p className="font-bold text-gray-800">
                          {reservationDetails.energyKwh} kWh
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amenities Chip */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge
                    variant="outline"
                    className="bg-gray-50 text-gray-600 gap-1"
                  >
                    <Wifi className="h-3 w-3" /> Free WiFi
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-gray-50 text-gray-600 gap-1"
                  >
                    <Coffee className="h-3 w-3" /> Coffee Shop
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-gray-50 text-gray-600 gap-1"
                  >
                    <Shield className="h-3 w-3" /> 24/7 Security
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Time Slot Card - Enhanced */}
            <Card className="shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  Your Time Slot
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                        <Calendar className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Scheduled for
                        </p>
                        <p className="font-bold text-gray-800 text-lg">
                          {formatTimeSlot()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1.5 text-sm">
                      <Clock8 className="h-3.5 w-3.5 mr-1" />
                      {Math.ceil(
                        (reservationDetails.timeSlot.endTime.getTime() -
                          reservationDetails.timeSlot.startTime.getTime()) /
                          (1000 * 60),
                      )}{" "}
                      min session
                    </Badge>
                  </div>

                  <Separator className="my-4 bg-blue-100" />

                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Clock className="h-4 w-4" />
                    <span>
                      Please arrive 10 minutes before your scheduled time
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* QR Code Card - Glass morphism */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="text-center border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <CardTitle className="text-base flex items-center justify-center gap-2">
                  <QrCode className="h-4 w-4 text-gray-600" />
                  Check-in QR Code
                </CardTitle>
                <CardDescription>Scan at the charging station</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur-xl opacity-30"></div>
                  <div className="relative bg-white rounded-2xl p-4 border-2 border-gray-100">
                    <div className="w-48 h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex flex-col items-center justify-center">
                      <div className="text-center">
                        <div className="grid grid-cols-3 gap-1 mb-4">
                          {[...Array(9)].map((_, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 bg-gray-800 rounded-sm"
                            ></div>
                          ))}
                        </div>
                        <Smartphone className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 font-mono">
                          {reservationDetails.reservationCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-0">
                <Button
                  variant="outline"
                  className="w-full gap-2 hover:bg-gray-50"
                  onClick={handleShare}
                  disabled={isSharing}
                >
                  <Share2 className="h-4 w-4" />
                  {isSharing ? "Sharing..." : "Share Reservation"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 hover:bg-gray-50"
                  onClick={handleDownloadReceipt}
                  disabled={isDownloading}
                >
                  <Download className="h-4 w-4" />
                  {isDownloading ? "Downloading..." : "Download Receipt"}
                </Button>
              </CardFooter>
            </Card>

            {/* Payment Summary - Modern */}
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Receipt className="h-4 w-4 text-white" />
                  </div>
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Energy Cost ({reservationDetails.energyKwh} kWh)
                    </span>
                    <span className="font-medium">
                      {reservationDetails.currency}{" "}
                      {(reservationDetails.totalAmount / 1.1).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-medium">
                      {reservationDetails.currency}{" "}
                      {(reservationDetails.totalAmount * 0.1).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (GST)</span>
                    <span className="font-medium">
                      {reservationDetails.currency} 0.00
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-gray-800">Total Paid</span>
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {reservationDetails.currency}{" "}
                      {reservationDetails.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-gray-100">
                    {reservationDetails.paymentMethod === "wallet" && (
                      <Wallet className="h-4 w-4 text-emerald-600" />
                    )}
                    {reservationDetails.paymentMethod === "points" && (
                      <Coins className="h-4 w-4 text-amber-600" />
                    )}
                    {reservationDetails.paymentMethod === "card" && (
                      <CreditCard className="h-4 w-4 text-blue-600" />
                    )}
                    <span className="text-xs text-gray-500">
                      Paid via{" "}
                      {reservationDetails.paymentMethod
                        .charAt(0)
                        .toUpperCase() +
                        reservationDetails.paymentMethod.slice(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 gap-2 h-12 text-base"
                onClick={onNavigateToMyReservations}
              >
                <Car className="h-5 w-5" />
                View My Reservations
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2 h-11 border-2 hover:bg-gray-50"
                onClick={onBookAnother}
              >
                <Plug className="h-4 w-4" />
                Book Another Session
              </Button>

              <Button
                variant="ghost"
                className="w-full gap-2 text-gray-600 hover:text-gray-800"
                onClick={handleOpenMaps}
              >
                <Navigation className="h-4 w-4" />
                Get Directions
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </div>

            {/* Eco Impact */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-emerald-700 font-medium">
                    Your Eco Impact
                  </p>
                  <p className="text-sm font-semibold text-emerald-800">
                    Saved ~{(reservationDetails.energyKwh * 0.4).toFixed(1)} kg
                    CO₂ emissions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
