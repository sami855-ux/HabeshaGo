"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Download,
  Share2,
  Printer,
  Mail,
  QrCode,
  Calendar,
  Clock,
  MapPin,
  Bus,
  User,
  Copy,
} from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { Booking } from "@/types/booking"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface BookingConfirmationProps {
  booking: Booking
  onClose: () => void
}

export default function BookingConfirmation({
  booking,
  onClose,
}: BookingConfirmationProps) {
  const [showQR, setShowQR] = useState(true)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const downloadTicket = () => {
    // In a real app, this would generate and download a PDF
    toast.success("Ticket download started!")
  }

  const shareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: `Bus Ticket: ${booking.bus.busNumber}`,
        text: `Booking confirmed! Code: ${booking.bookingCode}`,
        url: window.location.href,
      })
    } else {
      copyToClipboard(booking.bookingCode)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-green-50/30 to-white dark:from-gray-900 dark:to-gray-950 py-8"
    >
      <div className="px-6">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your ticket has been booked successfully
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Ticket */}
          <div className="lg:col-span-2 space-y-6">
            {/* Digital Ticket */}
            <Card className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-green-200 dark:border-green-900/50">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* QR Code */}
                <div className="flex-shrink-0">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                    {showQR && booking.qrCode ? (
                      <img
                        src={booking.qrCode}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <QrCode className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQR(!showQR)}
                      className="w-full mt-3"
                    >
                      {showQR ? "Hide QR" : "Show QR"}
                    </Button>
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white mb-2">
                        E-TICKET
                      </Badge>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {booking.bus.busNumber}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {booking.bus.route.origin} →{" "}
                        {booking.bus.route.destination}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Booking Code</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                        {booking.bookingCode}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-500">Passenger</div>
                        <div className="font-medium">{booking.user.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Travel Date</div>
                        <div className="font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(booking.date, "EEE, MMM d, yyyy")}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Departure</div>
                        <div className="font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {format(
                            new Date(booking.bus.departureTime),
                            "hh:mm a",
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-500">Vehicle</div>
                        <div className="font-medium flex items-center gap-2">
                          <Bus className="w-4 h-4" />
                          {booking.bus.vehicle.model}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">
                          Boarding Point
                        </div>
                        <div className="font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {booking.boardingStop || booking.bus.route.origin}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Status</div>
                        <Badge
                          className={cn(
                            "mt-1",
                            booking.status === "CONFIRMED"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
                          )}
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(booking.bookingCode)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadTicket}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={shareBooking}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Next Steps */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">What's Next?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      1
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Check Your Email</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      We've sent your e-ticket to {booking.user.email}. Please
                      check your inbox.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      2
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Arrive Early</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Please arrive at the boarding point 30 minutes before
                      departure.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      3
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Show Your Ticket</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Present this QR code or booking code to the bus conductor.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Actions Card */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  onClick={() => window.print()}
                >
                  <Printer className="w-5 h-5 mr-3" />
                  Print Ticket
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() =>
                    window.open(
                      `mailto:${booking.user.email}?subject=Bus Ticket: ${booking.bookingCode}`,
                    )
                  }
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Email Ticket
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-green-50 dark:hover:bg-green-900/20"
                  onClick={shareBooking}
                >
                  <Share2 className="w-5 h-5 mr-3" />
                  Share Booking
                </Button>
              </div>
            </Card>

            {/* Payment Summary */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Amount
                  </span>
                  <span className="font-semibold">
                    ETB {booking.totalAmount?.toFixed(2)}
                  </span>
                </div>
                {booking.discount && booking.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Discount
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      -ETB {booking.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                {booking.pointsValue && booking.pointsValue > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Points Used
                    </span>
                    <span className="text-amber-600 dark:text-amber-400">
                      -ETB {booking.pointsValue.toFixed(2)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Amount Paid</span>
                  <span className="text-green-600 dark:text-green-400">
                    ETB {booking.amountPaid?.toFixed(2)}
                  </span>
                </div>
                <Badge className="w-full justify-center bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Payment Successful
                </Badge>
              </div>
            </Card>

            {/* Main Action */}
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 h-12 text-lg"
            >
              Book Another Ticket
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
