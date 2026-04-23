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
  Smartphone,
  Shield,
  Wifi,
  Coffee,
  CreditCard,
  Wallet,
  Coins,
  Home,
  ChevronRight,
  QrCode,
  ExternalLink,
  Clock8,
  Leaf,
  Car,
  Timer,
  Receipt,
  Sparkles,
  PartyPopper,
  Check,
  Copy,
  CalendarPlus,
  MessageCircle,
  Bell,
} from "lucide-react"
import { format } from "date-fns"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface ReservationSuccessProps {
  reservationDetails: {
    stationName: string
    stationAddress: string
    stationCity: string
    pointId?: number
    pointNumber?: string
    pointPower: number
    connectorType: string
    timeSlot?: {
      startTime: Date | string
      endTime: Date | string
    }
    energyKwh: number
    totalAmount: number
    originalAmount?: number
    pointsUsed?: number
    currency: string
    paymentMethod: string
    reservationCode: string
    reservationId?: string
    qrCode?: string
    vehicleModel?: string
    vehiclePlate?: string
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
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reservationDetails.reservationCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Safe access with fallbacks
  const formatTimeSlot = () => {
    if (!reservationDetails.timeSlot?.startTime) {
      return "Time slot confirmed"
    }
    try {
      const startTime = new Date(reservationDetails.timeSlot.startTime)
      const endTime = new Date(reservationDetails.timeSlot.endTime)
      return `${format(startTime, "MMM dd, yyyy")} • ${format(startTime, "h:mm a")} - ${format(endTime, "h:mm a")}`
    } catch (error) {
      return "Time slot confirmed"
    }
  }

  const getTimeRemaining = () => {
    if (!reservationDetails.timeSlot?.startTime) return "Ready to charge"
    try {
      const now = new Date()
      const startTime = new Date(reservationDetails.timeSlot.startTime)
      const diffInHours = Math.ceil(
        (startTime.getTime() - now.getTime()) / (1000 * 60 * 60),
      )

      if (diffInHours <= 0) return "Starting soon"
      if (diffInHours < 24) return `In ${diffInHours} hours`
      return `In ${Math.ceil(diffInHours / 24)} days`
    } catch (error) {
      return "Ready to charge"
    }
  }

  const getSessionDuration = () => {
    if (
      !reservationDetails.timeSlot?.startTime ||
      !reservationDetails.timeSlot?.endTime
    ) {
      return null
    }
    try {
      const startTime = new Date(reservationDetails.timeSlot.startTime)
      const endTime = new Date(reservationDetails.timeSlot.endTime)
      return Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    } catch (error) {
      return null
    }
  }

  const sessionDuration = getSessionDuration()
  const serviceFee = reservationDetails.totalAmount * 0.1
  const energyCost = reservationDetails.totalAmount - serviceFee
  const co2Saved = (reservationDetails.energyKwh * 0.4).toFixed(1)

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
        console.log("Copied to clipboard")
      }
    } catch (error) {
      console.log("Error sharing:", error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleDownloadReceipt = async () => {
    setIsDownloading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsDownloading(false)
    console.log("Receipt downloaded")
  }

  const handleAddToCalendar = async () => {
    if (!reservationDetails.timeSlot?.startTime) return

    setIsAddingToCalendar(true)

    const startTime = new Date(reservationDetails.timeSlot.startTime)
    const endTime = new Date(reservationDetails.timeSlot.endTime)

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=EV%20Charging%20at%20${encodeURIComponent(reservationDetails.stationName)}&dates=${startTime.toISOString().replace(/-|:|\.\d\d\d/g, "")}/${endTime.toISOString().replace(/-|:|\.\d\d\d/g, "")}&details=${encodeURIComponent(`Reservation Code: ${reservationDetails.reservationCode}\nPoint: ${reservationDetails.pointNumber}\nEnergy: ${reservationDetails.energyKwh} kWh`)}&location=${encodeURIComponent(`${reservationDetails.stationAddress}, ${reservationDetails.stationCity}`)}`

    window.open(calendarUrl, "_blank")
    setIsAddingToCalendar(false)
  }

  const handleSetReminder = () => {
    // This would integrate with your notification system
    console.log("Set reminder for", formatTimeSlot())
    // You can show a toast notification here
  }

  const handleOpenMaps = () => {
    const address = `${reservationDetails.stationAddress}, ${reservationDetails.stationCity}`
    const encodedAddress = encodeURIComponent(address)
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      "_blank",
    )
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl relative z-10">
        {/* Success Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-50 animate-ping"></div>
            <div className="relative h-20 w-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center shadow-2xl">
              <PartyPopper className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
            Reservation Confirmed!
          </h1>
          <p className="text-gray-600 mt-2">
            Your charging spot has been successfully reserved
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Confirmed
            </Badge>
            <Badge
              onClick={handleCopy}
              className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1 flex items-center gap-2 cursor-pointer hover:bg-blue-200 transition"
            >
              <span>Reservation #{reservationDetails.reservationCode}</span>
              {copied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Badge>
          </div>
        </motion.div>

        {/* Primary Action Buttons - Modern Design (Not full green) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6"
        >
          <Button
            onClick={onNavigateToMyReservations}
            className="group relative overflow-hidden bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 h-12 rounded-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Car className="h-4 w-4 mr-2 text-emerald-600" />
            View My Reservations
            <ChevronRight className="h-4 w-4 ml-2 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            onClick={onBookAnother}
            className="group relative overflow-hidden bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 h-12 rounded-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Plug className="h-4 w-4 mr-2 text-blue-600" />
            Book Another Session
            <ChevronRight className="h-4 w-4 ml-2 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Station Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full blur-3xl opacity-50"></div>
                <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
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

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 group hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plug className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Charging Point
                          </p>
                          <p className="font-bold text-gray-800">
                            {reservationDetails.pointNumber ||
                              `Point #${reservationDetails.pointId}`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 group hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Zap className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Power Output
                          </p>
                          <p className="font-bold text-gray-800">
                            {reservationDetails.pointPower} kW
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 group hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <BatteryCharging className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Connector Type
                          </p>
                          <p className="font-bold text-gray-800">
                            {reservationDetails.connectorType}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 group hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
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

                  {reservationDetails.vehicleModel && (
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <Car className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-500">Vehicle</p>
                          <p className="font-medium text-gray-800">
                            {reservationDetails.vehicleModel} •{" "}
                            {reservationDetails.vehiclePlate}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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
            </motion.div>

            {/* Time Slot Card */}
            {reservationDetails.timeSlot?.startTime && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
                  <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50/50 to-cyan-50/50">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
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
                          {getTimeRemaining()}
                        </Badge>
                      </div>

                      {sessionDuration && (
                        <>
                          <Separator className="my-4 bg-blue-100" />
                          <div className="flex items-center gap-2 text-sm text-blue-700">
                            <Timer className="h-4 w-4" />
                            <span>
                              Session duration: {sessionDuration} minutes •
                              Please arrive 10 minutes before
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Actions & Summary */}
          <div className="space-y-6">
            {/* Quick Actions Grid - Modern Icons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 gap-3"
            >
              <Button
                variant="outline"
                onClick={handleAddToCalendar}
                disabled={isAddingToCalendar}
                className="flex flex-col items-center justify-center gap-2 h-auto py-4 border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 rounded-xl transition-all duration-300"
              >
                <CalendarPlus className="h-5 w-5 text-emerald-600" />
                <span className="text-xs font-medium">Add to Calendar</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleSetReminder}
                className="flex flex-col items-center justify-center gap-2 h-auto py-4 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-xl transition-all duration-300"
              >
                <Bell className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-medium">Set Reminder</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleShare}
                disabled={isSharing}
                className="flex flex-col items-center justify-center gap-2 h-auto py-4 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 rounded-xl transition-all duration-300"
              >
                <Share2 className="h-5 w-5 text-purple-600" />
                <span className="text-xs font-medium">Share</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleDownloadReceipt}
                disabled={isDownloading}
                className="flex flex-col items-center justify-center gap-2 h-auto py-4 border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 rounded-xl transition-all duration-300"
              >
                <Download className="h-5 w-5 text-amber-600" />
                <span className="text-xs font-medium">Receipt</span>
              </Button>
            </motion.div>

            {/* QR Code Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardTitle className="text-base flex items-center justify-center gap-2">
                    <QrCode className="h-4 w-4 text-emerald-600" />
                    Check-in QR Code
                  </CardTitle>
                  <CardDescription>
                    Scan at the charging station
                  </CardDescription>
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
              </Card>
            </motion.div>

            {/* Payment Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
                <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <Receipt className="h-4 w-4 text-white" />
                    </div>
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Energy ({reservationDetails.energyKwh} kWh)
                      </span>
                      <span className="font-medium">
                        {reservationDetails.currency} {energyCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="font-medium">
                        {reservationDetails.currency} {serviceFee.toFixed(2)}
                      </span>
                    </div>
                    {reservationDetails.pointsUsed &&
                      reservationDetails.pointsUsed > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600">
                          <span>Points Discount</span>
                          <span className="font-medium">
                            -{reservationDetails.currency}{" "}
                            {reservationDetails.pointsUsed.toFixed(2)}
                          </span>
                        </div>
                      )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-gray-800">Total Paid</span>
                      <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
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
            </motion.div>

            {/* Eco Impact Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-emerald-700 font-medium">
                    Your Eco Impact
                  </p>
                  <p className="text-sm font-semibold text-emerald-800">
                    Saved ~{co2Saved} kg CO₂ emissions
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Equivalent to planting{" "}
                    {Math.ceil(parseFloat(co2Saved) * 0.5)} trees
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
