"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  MapPin,
  Clock,
  Calendar,
  Car,
  CreditCard,
  Wallet,
  Coins,
  DollarSign,
  Share2,
  Download,
  Home,
  Navigation,
  AlertCircle,
  QrCode,
  Mail,
  Phone,
  Printer,
  ChevronRight,
} from "lucide-react"
import { formatCurrencyIntl, cn } from "@/lib/utils"

interface ReservationDetails {
  reservationCode: string
  parkingLotName: string
  parkingLotAddress: string
  slotNumber: string
  floor?: number
  section?: string
  startTime: Date
  endTime: Date
  durationHours: number
  vehicleModel: string
  vehiclePlate: string
  totalAmount: number
  originalAmount?: number
  pointsUsed?: number
  paymentMethod: "wallet" | "points" | "card"
  status: "confirmed" | "pending" | "completed" | "cancelled"
  qrCode?: string
}

interface ReservationSuccessProps {
  reservationDetails: ReservationDetails
  onNavigateToMyReservations: () => void
  onBookAnother: () => void
  onBackToHome: () => void
  onViewDirections?: () => void
  onDownloadReceipt?: () => void
  onShare?: () => void
}

export function ReservationSuccess({
  reservationDetails,
  onNavigateToMyReservations,
  onBookAnother,
  onBackToHome,
  onViewDirections,
  onDownloadReceipt,
  onShare,
}: ReservationSuccessProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getPaymentMethodIcon = () => {
    switch (reservationDetails.paymentMethod) {
      case "wallet":
        return <Wallet className="h-4 w-4 text-blue-600" />
      case "points":
        return <Coins className="h-4 w-4 text-amber-600" />
      case "card":
        return <CreditCard className="h-4 w-4 text-purple-600" />
      default:
        return <DollarSign className="h-4 w-4 text-green-600" />
    }
  }

  const getPaymentMethodText = () => {
    switch (reservationDetails.paymentMethod) {
      case "wallet":
        return "HabeshaGo Wallet"
      case "points":
        return "HabeshaGo Points"
      case "card":
        return "Credit/Debit Card"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 200,
            delay: 0.2,
          }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg mb-4">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Reservation Confirmed!
          </h1>
          <p className="text-gray-600 mt-2">
            Your parking spot has been successfully reserved
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Reservation Details */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 space-y-4"
          >
            {/* Reservation Code Card */}
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg py-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Reservation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Reservation Code</p>
                  <p className="text-2xl font-mono font-bold text-blue-600 tracking-wider">
                    {reservationDetails.reservationCode}
                  </p>
                  <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
                    Confirmed
                  </Badge>
                </div>

                <Separator />

                {/* Parking Info */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Parking Location
                      </p>
                      <p className="text-sm text-gray-600">
                        {reservationDetails.parkingLotName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {reservationDetails.parkingLotAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                      <Car className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Parking Slot
                      </p>
                      <p className="text-sm text-gray-600">
                        Slot {reservationDetails.slotNumber}
                        {reservationDetails.floor &&
                          ` • Floor ${reservationDetails.floor}`}
                        {reservationDetails.section &&
                          ` • Section ${reservationDetails.section}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Date & Time
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(reservationDetails.startTime)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(reservationDetails.startTime)} -{" "}
                        {formatTime(reservationDetails.endTime)} •{" "}
                        {reservationDetails.durationHours} hour
                        {reservationDetails.durationHours > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                      <Car className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Vehicle
                      </p>
                      <p className="text-sm text-gray-600">
                        {reservationDetails.vehicleModel}
                      </p>
                      <p className="text-xs text-gray-500">
                        Plate: {reservationDetails.vehiclePlate}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Information */}
            <Card className="border-0 shadow-lg rounded-2xl bg-amber-50 ">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">
                      Important Information
                    </p>
                    <ul className="text-xs text-amber-700 mt-1 space-y-1">
                      <li>
                        • Please arrive within 15 minutes of your reserved time
                      </li>
                      <li>• Late arrival may result in cancellation</li>
                      <li>• Keep your reservation code ready for entry</li>
                      <li>
                        • Free cancellation up to 1 hour before start time
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Payment Summary & Actions */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {/* Payment Summary */}
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-1 rounded-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrencyIntl(
                      reservationDetails.originalAmount ||
                        reservationDetails.totalAmount,
                    )}
                  </span>
                </div>

                {reservationDetails.pointsUsed &&
                  reservationDetails.pointsUsed > 0 && (
                    <div className="flex items-center justify-between text-sm text-green-600">
                      <span className="flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        Points Discount
                      </span>
                      <span>
                        -{formatCurrencyIntl(reservationDetails.pointsUsed)}
                      </span>
                    </div>
                  )}

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">
                    Total Paid
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrencyIntl(reservationDetails.totalAmount)}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mt-2">
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon()}
                    <span className="text-sm text-gray-600">Paid via</span>
                    <span className="text-sm font-medium">
                      {getPaymentMethodText()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onViewDirections || (() => {})}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg rounded-xl py-5"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Get Directions
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={onDownloadReceipt || (() => {})}
                  className="rounded-xl"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Receipt
                </Button>
                <Button
                  variant="outline"
                  onClick={onShare || (() => {})}
                  className="rounded-xl"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              <Separator />

              <Button
                variant="ghost"
                onClick={onNavigateToMyReservations}
                className="w-full justify-between rounded-xl hover:bg-blue-50"
              >
                <span>View My Reservations</span>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                onClick={onBookAnother}
                className="w-full justify-between rounded-xl hover:bg-green-50"
              >
                <span>Book Another Parking</span>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                onClick={onBackToHome}
                className="w-full justify-between rounded-xl hover:bg-gray-50"
              >
                <span>Back to Home</span>
                <Home className="h-4 w-4" />
              </Button>
            </div>

            {/* Contact Support */}
            <div className="bg-white/50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-2">Need help?</p>
              <div className="flex items-center justify-center gap-4">
                <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                  <Phone className="h-3 w-3" />
                  Call Support
                </button>
                <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                  <Mail className="h-3 w-3" />
                  Email Us
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Print Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="rounded-xl"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Confirmation
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
