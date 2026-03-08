import { Trip } from "@/types/trips"
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Bus,
  User,
  MapPin,
  Clock,
  ArrowRight,
  QrCode,
  Phone,
  Mail,
  Shield,
  Download,
  Printer,
  CreditCard,
  Ticket as TicketIcon,
  Smartphone,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  Info,
  Tag,
  Gift,
  Award,
  Navigation,
} from "lucide-react"
import { format } from "date-fns"

interface TicketSheetProps {
  trip: Trip
}

export default function TicketSheet({ trip }: TicketSheetProps) {
  const departureDate = new Date(trip.date)

  // Estimate arrival time (you might want to calculate this based on route)
  const arrivalDate = new Date(departureDate)
  arrivalDate.setHours(arrivalDate.getHours() + 5) // Assuming 5 hours journey

  const durationMs = arrivalDate.getTime() - departureDate.getTime()
  const durationHours = Math.round(durationMs / (1000 * 60 * 60))

  const qrData = `HABESHAGO:${trip.id}:${trip.bookingCode}:${departureDate.getTime()}`

  // Calculate fare breakdown based on actual data
  const totalAmount = parseFloat(trip.totalAmount)
  const amountPaid = parseFloat(trip.amountPaid)
  const discount = parseFloat(trip.discount)
  const pointsValue = parseFloat(trip.pointsValue)

  const origin = trip.origin || trip.bus?.route?.origin || "Unknown"
  const destination =
    trip.destination || trip.bus?.route?.destination || "Unknown"

  return (
    <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0 bg-gradient-to-b from-orange-50 to-white">
      <div className="h-full">
        {/* Orange Gradient Header */}
        <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white p-6 shadow-lg">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TicketIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    HabeshaGo E-Ticket
                  </SheetTitle>
                  <p className="text-amber-100 mt-1 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Booking Confirmed •{" "}
                    {trip.bookingCode.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
              <Badge className="bg-white text-orange-700 hover:bg-white/90 border-0 font-bold px-4 py-2">
                {trip.status.charAt(0) + trip.status.slice(1).toLowerCase()}
              </Badge>
            </div>
          </SheetHeader>
        </div>

        {/* Ticket Content */}
        <div className="p-3 pt-6 space-y-6">
          {/* Route Summary Card */}
          <div className="bg-white rounded-2xl p-4 border-2 border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <Badge
                variant="outline"
                className="bg-orange-50 text-orange-700 border-orange-200"
              >
                <Navigation className="h-3 w-3 mr-1" />
                Route Information
              </Badge>
              {trip.bus?.route?.distanceKm && (
                <span className="text-sm text-gray-500">
                  {trip.bus.route.distanceKm} km
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-xs text-gray-500">From</p>
                <p className="text-lg font-bold text-gray-900">{origin}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-orange-400 flex-shrink-0" />
              <div className="flex-1 text-right">
                <p className="text-xs text-gray-500">To</p>
                <p className="text-lg font-bold text-gray-900">{destination}</p>
              </div>
            </div>
          </div>

          {/* Journey Card with Orange Accent */}
          <div className="bg-white rounded-2xl p-3 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="text-center flex-1">
                  <div className="text-sm mb-1 text-orange-600 font-semibold">
                    BOARDING
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {trip.boardingStop}
                  </div>
                  <div className="text-2xl font-black text-orange-600">
                    {format(departureDate, "hh:mm a")}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Boarding Point: {trip.boardingStop} Terminal
                  </div>
                </div>

                <div className="flex flex-col items-center mx-8">
                  <div className="text-center">
                    <div className="text-xs font-bold text-orange-700 mb-1">
                      {durationHours}h Journey
                    </div>
                    <div className="relative w-40">
                      <div className="w-full h-1.5 bg-gradient-to-r from-orange-100 via-orange-200 to-amber-300 rounded-full"></div>
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow"></div>
                      <ArrowRight className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-orange-500" />
                      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 font-medium">
                      {format(arrivalDate, "EEEE, dd MMMM yyyy")}
                    </div>
                  </div>
                </div>

                <div className="text-center flex-1">
                  <div className="text-sm mb-1 text-amber-600 font-semibold">
                    ALIGHTING
                  </div>
                  <div className="text-3xl text-gray-900 font-bold">
                    {trip.alightingStop}
                  </div>
                  <div className="text-2xl font-black text-amber-600">
                    {format(arrivalDate, "hh:mm a")}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Drop Point: {trip.alightingStop} Terminal
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code & Payment Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-3">
            {/* QR Code Card */}
            <div className="lg:col-span-1 bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 border-2 border-orange-100">
              <div className="text-center">
                <h4 className="font-bold text-gray-900 text-lg mb-2">
                  Scan at Boarding
                </h4>
                <p className="text-sm text-gray-600 mb-6">
                  Show this code to the conductor
                </p>

                {/* QR Code Image */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <img
                      src={trip.qrCode}
                      alt="Ticket QR Code"
                      className="w-56 h-56 object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-orange-600 mb-1">
                      SCAN CODE OR
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      Booking Code:{" "}
                      {trip.bookingCode.slice(0, 12).toUpperCase()}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-orange-100">
                    <p className="text-xs text-gray-500">
                      Valid Until:{" "}
                      {format(new Date(trip.validUntil), "dd MMM, hh:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Actions Card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Summary */}
              <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-6 border-2 border-amber-100">
                <h4 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-3">
                  Payment Summary
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between items-center py-3 px-4 bg-white/50 rounded-xl">
                    <div>
                      <span className="text-gray-700">Total Fare</span>
                      <p className="text-xs text-gray-500">
                        {trip.currency} {totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <span className="font-bold text-gray-900">
                      {trip.currency} {totalAmount.toLocaleString()}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center py-3 px-4 bg-white/50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">Discount</span>
                        <p className="text-xs text-green-600">
                          {trip.promoCode || "Promo"} ({discount}% off)
                        </p>
                      </div>
                      <span className="font-bold text-green-600">
                        -{trip.currency}{" "}
                        {(totalAmount - amountPaid).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {trip.pointsUsed > 0 && (
                    <div className="flex justify-between items-center py-3 px-4 bg-white/50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-600" />
                        <span className="text-gray-700">Points Used</span>
                        <p className="text-xs text-purple-600">
                          {trip.pointsUsed} points
                        </p>
                      </div>
                      <span className="font-bold text-purple-600">
                        -{trip.currency} {pointsValue.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="border-t-2 border-amber-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          Amount Paid
                        </span>
                        <p className="text-sm text-gray-600">
                          Paid via {trip.payment?.method || "Wallet"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-orange-600">
                          {trip.currency} {amountPaid.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600 font-semibold flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Payment Successful
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bus Details */}
              <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 border-2 border-orange-100">
                <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <Bus className="h-5 w-5 text-orange-600" />
                  Bus Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Bus Number</p>
                    <p className="font-bold text-gray-900">
                      {trip.bus?.busNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Capacity</p>
                    <p className="font-bold text-gray-900">
                      {trip.bus?.capacity} seats
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Route ID</p>
                    <p className="font-bold text-gray-900">
                      {trip.bus?.routeId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Seats</p>
                    <p className="font-bold text-gray-900">
                      {trip.bus?.availableSeats}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information - Orange Alert */}
          <div className="rounded-2xl p-6 border-2 border-orange-100 bg-orange-50/50">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-lg mb-2">
                  Important Travel Information
                </h4>
                <p className="text-gray-600">
                  Please read carefully before your journey
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-600">①</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Boarding Procedure
                    </p>
                    <p className="text-sm text-gray-600">
                      Arrive 45 minutes early with valid ID and this e-ticket
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-600">②</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Check-in Required
                    </p>
                    <p className="text-sm text-gray-600">
                      {trip.checkedIn ? "✓ Checked in" : "✗ Not checked in yet"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-600">③</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      24/7 Support
                    </p>
                    <p className="text-sm text-gray-600">
                      Call +251 900 123 4567 or email support@habeshago.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-600">④</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Cancellation Policy
                    </p>
                    <p className="text-sm text-gray-600">
                      {trip.cancelledAt
                        ? `Cancelled on ${format(new Date(trip.cancelledAt), "dd MMM yyyy")}`
                        : "Free cancellation up to 24 hours before departure"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-orange-200">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-orange-200 hover:bg-orange-50"
              >
                <Phone className="h-4 w-4" />
                Call Support
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-orange-200 hover:bg-orange-50"
              >
                <Mail className="h-4 w-4" />
                Email Support
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-orange-200 hover:bg-orange-50"
              >
                <Info className="h-4 w-4" />
                FAQ & Help
              </Button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-500">
              This is your official e-ticket for {origin} to {destination}.
              Please keep it safe.
              <span className="text-orange-600 font-semibold">
                {" "}
                HabeshaGo - Safe & Comfortable Journeys Across Ethiopia
              </span>
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-xs text-gray-600">
                100% Secure Booking • Verified Operator • Instant Confirmation
              </span>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  )
}
