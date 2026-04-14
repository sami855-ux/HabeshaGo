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
  Share2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
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
    bookingCode: string
    discount: string
    promoCode: string | null
    amountPaid: string
    totalAmount: string
    currency: string
    createdAt: string
    bus: {
      id: number
      busNumber: string
      capacity: number
      status: string
    }
    payment: {
      id: number
      status: string
      method: string
      transactionId: string
    }
    tickets: Array<{
      id: number
      seatNumber: number
      boardingStop: string
      alightingStop: string
      checkedIn: boolean
      sharedToId: string | null
    }>
  }
}

export function TicketPreview({ ticket }: TicketPreviewProps) {
  // Extract data from the ticket object
  const departureDate = new Date(ticket.date)
  const bookingDate = new Date(ticket.createdAt)

  // Get all tickets info
  const allTickets = ticket.tickets || []
  const seatNumbers = allTickets.map((t) => t.seatNumber).join(", ")
  const seatsBooked = allTickets.length

  // Check if any ticket is checked in
  const isAnyCheckedIn = allTickets.some((t) => t.checkedIn)

  // Check if any ticket is shared
  const isAnyShared = allTickets.some((t) => t.sharedToId)

  // Get boarding and alighting stops (use first ticket as reference)
  const boardingStop = allTickets[0]?.boardingStop || "Unknown"
  const alightingStop = allTickets[0]?.alightingStop || "Unknown"

  // Extract origin and destination from stops
  const origin = boardingStop
  const destination = alightingStop

  // Calculate arrival time (default to 5 hours if no estimated time)
  const arrivalDate = new Date(departureDate)
  arrivalDate.setHours(arrivalDate.getHours() + 5)

  // Format currency
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: ticket.currency || "ETB",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount))
  }

  // Get status color and icon
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return {
          color: "bg-green-500",
          icon: CheckCircle2,
          label: "Confirmed",
        }
      case "PENDING":
        return {
          color: "bg-yellow-500",
          icon: AlertCircle,
          label: "Pending",
        }
      case "CANCELLED":
        return {
          color: "bg-red-500",
          icon: XCircle,
          label: "Cancelled",
        }
      case "COMPLETED":
        return {
          color: "bg-blue-500",
          icon: CheckCircle2,
          label: "Completed",
        }
      default:
        return {
          color: "bg-gray-500",
          icon: AlertCircle,
          label: status,
        }
    }
  }

  const statusConfig = getStatusConfig(ticket.status)
  const StatusIcon = statusConfig.icon

  // Generate a simple QR code representation (since actual QR might not be in data)
  const qrCodeValue = `HABESHAGO:${ticket.id}:${ticket.bookingCode}`

  // For demo purposes, using a placeholder QR code service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrCodeValue)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl p-1 shadow-2xl"
    >
      <div className="rounded-3xl p-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 dark:bg-orange-900/20 rounded-full -mr-16 -mt-16 opacity-50" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full -ml-12 -mb-12 opacity-50" />

        {/* Header */}
        <div className="flex justify-between items-start mb-6 relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bus Ticket
              </h2>
              {isAnyShared && (
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">
                  <Share2 className="h-3 w-3 mr-1" />
                  Shared
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Booking: {ticket.bookingCode}
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl"
          >
            <Ticket className="h-6 w-6 text-orange-600" />
          </motion.div>
        </div>

        {/* Route with animation */}
        <div className="mb-8 relative">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex-1"
            >
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-green-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  From
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {origin}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {boardingStop}
              </p>
            </motion.div>

            <motion.div
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center"
            >
              <Bus className="h-5 w-5 text-orange-500" />
              <div className="w-16 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 my-1" />
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 text-right"
            >
              <div className="flex items-center justify-end gap-2 mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  To
                </span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="w-2 h-2 rounded-full bg-red-500"
                />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {destination}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-end gap-1">
                <MapPin className="h-3 w-3" />
                {alightingStop}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-gray-500">Date</span>
            </div>
            <p className="font-medium">
              {format(departureDate, "MMM dd, yyyy")}
            </p>
          </motion.div>

          <motion.div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-gray-500">Departure</span>
            </div>
            <p className="font-medium">{format(departureDate, "h:mm a")}</p>
          </motion.div>

          <motion.div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-gray-500">Arrival</span>
            </div>
            <p className="font-medium">{format(arrivalDate, "h:mm a")}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-1">
              <Bus className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-gray-500">Bus</span>
            </div>
            <p className="font-medium">{ticket.bus.busNumber}</p>
            <p className="text-xs text-gray-500">
              Capacity: {ticket.bus.capacity}
            </p>
          </motion.div>
        </div>

        {/* Check-in Status for each ticket */}
        {allTickets.length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="text-xs font-medium text-gray-500 mb-2">
              Ticket Status
            </p>
            {allTickets.map((t, index) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Ticket {index + 1}
                  </span>
                  {t.sharedToId && (
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0 text-xs">
                      Shared
                    </Badge>
                  )}
                </div>
                {t.checkedIn ? (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Checked In
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">
                    Not Checked In
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Price and QR Code */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-sm text-gray-500">Total Amount</span>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(ticket.totalAmount)}
              </p>
              {parseFloat(ticket.discount) > 0 && (
                <Badge className="bg-green-500 text-white border-0">
                  {ticket.discount}% OFF
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Paid via {ticket.payment.method}
            </p>
          </div>

          {/* QR Code */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-2 bg-white rounded-xl shadow-sm relative group"
          >
            <img src={qrCodeUrl} alt="Ticket QR Code" className="h-16 w-16" />
            <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs">Scan</span>
            </div>
          </motion.div>
        </div>

        {/* Status Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          className="absolute top-4 right-4"
        >
          <Badge
            className={cn(
              "px-3 py-1 text-white border-0 flex items-center gap-1",
              statusConfig.color,
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </motion.div>

        {/* Booking Date */}
        <div className="absolute bottom-1 left-4 text-xs text-gray-400 ">
          Booked on {format(bookingDate, "MMM d, yyyy")}
        </div>
      </div>
    </motion.div>
  )
}
