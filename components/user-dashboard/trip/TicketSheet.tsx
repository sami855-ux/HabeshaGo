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
} from "lucide-react"
import { format } from "date-fns"

interface TicketSheetProps {
  trip: Trip
}

export default function TicketSheet({ trip }: TicketSheetProps) {
  const departureDate = new Date(trip.departureTime)
  const arrivalDate = new Date(trip.arrivalTime)
  const durationMs = arrivalDate.getTime() - departureDate.getTime()
  const durationHours = Math.round(durationMs / (1000 * 60 * 60))

  const qrData = `HABESHAGO:${trip.id}:${trip.seatNumber}:${departureDate.getTime()}`

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
                    Booking Confirmed • ID: {trip.id.toUpperCase()}
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
          {/* Journey Card with Orange Accent */}
          <div className="bg-white rounded-2xl p-3  relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="text-center flex-1">
                  <div className="text-sm  mb-1">DEPARTURE</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {trip.originCity}
                  </div>
                  <div className="text-2xl font-black text-orange-600">
                    {format(departureDate, "hh:mm a")}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Boarding Point: Main Terminal
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
                  <div className="text-sm  mb-1">ARRIVAL</div>
                  <div className="text-3xl  text-gray-900 font-bold">
                    {trip.destinationCity}
                  </div>
                  <div className="text-2xl font-black text-amber-600">
                    {format(arrivalDate, "hh:mm a")}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Drop Point: City Center
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code & Payment Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-3">
            {/* QR Code Card */}
            <div className="lg:col-span-1 bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 border-2">
              <div className="text-center">
                <h4 className="font-bold text-gray-900 text-lg mb-2">
                  Scan at Boarding
                </h4>
                <p className="text-sm text-gray-600 mb-6">
                  Show this code to the conductor
                </p>

                {/* Orange-themed QR Code */}
                <div className="flex justify-center mb-6 ">
                  <div className="relative">
                    <div className="w-56 h-56 bg-gradient-to-br from-orange-50 to-white  rounded-2xl flex items-center justify-center p-2">
                      <div className="grid grid-cols-7 gap-1.5">
                        {Array.from({ length: 49 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-5 h-5 rounded",
                              i % 4 === 0 ? "bg-orange-700" : "bg-amber-500",
                              i % 9 === 0 && "bg-orange-800",
                              i >= 21 && i <= 27 && "bg-orange-600",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-xl border-4 border-orange-300 shadow-lg"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-orange-600 mb-1">
                      SCAN CODE OR
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      Show Ticket ID: {trip.id.slice(0, 12).toUpperCase()}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-orange-100">
                    <p className="text-xs text-gray-500">
                      Generated: {format(new Date(), "dd MMM, hh:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Actions Card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Summary */}
              <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-6 border-2 ">
                <h4 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-3">
                  Payment Summary
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between items-center py-3 px-4 bg-white/50 rounded-xl">
                    <div>
                      <span className="text-gray-700">Base Fare</span>
                      <p className="text-xs text-gray-500">
                        Adults: 1 × ETB {(trip.price * 0.7).toLocaleString()}
                      </p>
                    </div>
                    <span className="font-bold text-gray-900">
                      ETB {(trip.price * 0.7).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 px-4 bg-white/50 rounded-xl">
                    <div>
                      <span className="text-gray-700">Taxes & Fees</span>
                      <p className="text-xs text-gray-500">
                        Service + GST + Convenience
                      </p>
                    </div>
                    <span className="font-bold text-gray-900">
                      ETB {(trip.price * 0.15).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 px-4 bg-white/50 rounded-xl">
                    <div>
                      <span className="text-gray-700">Insurance</span>
                      <p className="text-xs text-gray-500">
                        Travel Protection Plan
                      </p>
                    </div>
                    <span className="font-bold text-gray-900">
                      ETB {(trip.price * 0.1).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 px-4 bg-white/50 rounded-xl">
                    <div>
                      <span className="text-gray-700">Promo Discount</span>
                      <p className="text-xs text-green-600">
                        HABESHA10 Applied
                      </p>
                    </div>
                    <span className="font-bold text-green-600">
                      - ETB {(trip.price * 0.05).toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t-2 border-amber-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          Total Amount Paid
                        </span>
                        <p className="text-sm text-gray-600">
                          Paid via Credit Card
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-orange-600">
                          ETB {trip.price.toLocaleString()}
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
            </div>
          </div>

          {/* Important Information - Orange Alert */}
          <div className="rounded-2xl p-6 border border-border ">
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
                      Luggage Policy
                    </p>
                    <p className="text-sm text-gray-600">
                      15kg check-in + 7kg hand luggage included
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
                      Free cancellation up to 24 hours before departure
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
                className="gap-2 border-orange-200"
              >
                <Phone className="h-4 w-4" />
                Call Support
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-orange-200"
              >
                <Mail className="h-4 w-4" />
                Email Support
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-orange-200"
              >
                <Info className="h-4 w-4" />
                FAQ & Help
              </Button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-500">
              This is your official e-ticket. Please keep it safe.
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
