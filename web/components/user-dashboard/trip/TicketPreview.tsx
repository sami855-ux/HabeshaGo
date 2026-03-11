// components/user-dashboard/trip/TicketPreview.tsx
import { motion } from "framer-motion"
import {
  Bus,
  Calendar,
  Clock,
  MapPin,
  User,
  Ticket,
  QrCode,
  Award,
  Users,
  CreditCard,
} from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TicketPreviewProps {
  ticket: {
    id: number
    userId: string
    busId: number
    date: string
    status: string
    boardingStop: string
    alightingStop: string
    bookingCode: string
    seatsBooked: number
    cancelledAt: string | null
    amountPaid: string
    bus?: {
      id: number
      busNumber: string
      capacity: number
      route?: {
        id: number
        origin: string
        destination: string
        estimatedTimeMin?: number
      }
    }
    checkedIn: boolean
    checkedInAt: string | null
    createdAt: string
    currency: string
    discount: string
    payNow: boolean
    payment?: {
      id: number
      amount: string
    }
    pointsUsed: number
    qrCode: string
    totalAmount: string
    updatedAt: string
    validUntil: string
  }
}

export function TicketPreview({ ticket }: TicketPreviewProps) {
  // Extract data from the ticket object
  const departureDate = new Date(ticket.date)
  const validUntilDate = new Date(ticket.validUntil)
  const bus = ticket.bus
  const route = bus?.route

  const origin = route?.origin || ticket.boardingStop.split(" ")[0] || "Origin"
  const destination =
    route?.destination || ticket.alightingStop.split(" ")[0] || "Destination"

  // Calculate arrival time if estimated time exists
  const arrivalDate = new Date(departureDate)
  if (route?.estimatedTimeMin) {
    arrivalDate.setMinutes(arrivalDate.getMinutes() + route.estimatedTimeMin)
  } else {
    // Default to 5 hours if no estimated time
    arrivalDate.setHours(arrivalDate.getHours() + 5)
  }

  // Format currency
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: ticket.currency || "ETB",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount))
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRED":
      case "CONFIRMED":
        return "bg-green-500"
      case "PENDING":
        return "bg-yellow-500"
      case "CANCELLED":
        return "bg-red-500"
      case "COMPLETED":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <motion.div className=" rounded-3xl p-1 shadow-2xl">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bus Ticket
            </h2>
            <p className="text-sm text-gray-500">
              Booking: {ticket.bookingCode.slice(0, 8)}...
            </p>
          </div>
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
            <Ticket className="h-6 w-6 text-orange-600" />
          </div>
        </div>

        {/* Route */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  From
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {origin}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {ticket.boardingStop}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <Bus className="h-5 w-5 text-gray-400" />
              <div className="w-16 h-0.5 bg-gray-200 dark:bg-gray-700 my-1" />
              <span className="text-xs text-gray-500">
                {route?.estimatedTimeMin || 300} min
              </span>
            </div>

            <div className="flex-1 text-right">
              <div className="flex items-center justify-end gap-2 mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  To
                </span>
                <div className="w-2 h-2 rounded-full bg-red-500" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {destination}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {ticket.alightingStop}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-gray-500">Date</span>
            </div>
            <p className="font-medium">
              {format(departureDate, "MMM dd, yyyy")}
            </p>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-gray-500">Departure</span>
            </div>
            <p className="font-medium">{format(departureDate, "h:mm a")}</p>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-gray-500">Seats</span>
            </div>
            <p className="font-medium">
              {ticket.seatsBooked} {ticket.seatsBooked > 1 ? "Seats" : "Seat"}
            </p>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-gray-500">Valid Until</span>
            </div>
            <p className="font-medium">{format(validUntilDate, "h:mm a")}</p>
          </div>
        </div>

        {/* Bus Info & Check-in Status */}
        {bus && (
          <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bus className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Bus: {bus.busNumber}
                </span>
              </div>
              {ticket.checkedIn && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                  Checked In
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Price and QR Code */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-sm text-gray-500">Total Amount</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(ticket.totalAmount)}
            </p>
            {ticket.discount && parseFloat(ticket.discount) > 0 && (
              <p className="text-xs text-green-600">
                Discount: {ticket.discount}%
              </p>
            )}
          </div>

          {/* QR Code */}
          {ticket.qrCode && (
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <img
                src={ticket.qrCode}
                alt="Ticket QR Code"
                className="h-16 w-16"
              />
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <Badge
            className={cn(
              "px-3 py-1 text-white border-0",
              getStatusColor(ticket.status),
            )}
          >
            {ticket.status}
          </Badge>
        </div>

        {/* Points Used (if any) */}
        {ticket.pointsUsed > 0 && (
          <div className="absolute bottom-4 left-4">
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800"
            >
              <Award className="h-3 w-3 mr-1" />
              {ticket.pointsUsed} points used
            </Badge>
          </div>
        )}
      </div>
    </motion.div>
  )
}
