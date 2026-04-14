"use client"

import { format } from "date-fns"
import {
  X,
  Ticket,
  User,
  Calendar,
  Clock,
  Bus,
  Phone,
  Check,
  Share2,
  AlertCircle,
  MapPin,
  QrCode,
  CalendarDays,
  ArrowRight,
  Mail,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface TicketPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket: {
    shareId: string
    ticketId: number
    seatNumber: number
    boardingStop: string
    alightingStop: string
    qrCode: string
    checkedIn: boolean
    validUntil: string
    status: "PENDING" | "ACCEPTED" | "REJECTED"
    sharedAt: string
    booking: {
      id: number
      bookingCode: string
      createdAt: string
    }
    bus: {
      id: number
      busNumber: string
      origin: string
      destination: string
    }
    receiver?: {
      id: string
      name: string
      phone: string
      email: string
    }
    owner?: {
      id: string
      name: string
      phone: string
      email: string
    }
  }
  type: "sent" | "received"
  onAccept?: () => void
  onReject?: () => void
}

export function TicketPreviewModal({
  open,
  onOpenChange,
  ticket,
  type,
  onAccept,
  onReject,
}: TicketPreviewModalProps) {
  // Status configuration with enhanced visuals
  const statusConfig = {
    PENDING: {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
      icon: Clock3,
      gradient: "from-amber-500 to-orange-500",
    },
    ACCEPTED: {
      label: "Accepted",
      className:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-500",
    },
    REJECTED: {
      label: "Rejected",
      className:
        "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
      icon: XCircle,
      gradient: "from-rose-500 to-pink-500",
    },
    CANCELLED: {
      label: "Rejected",
      className:
        "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
      icon: XCircle,
      gradient: "from-rose-500 to-pink-500",
    },
  }

  const status = statusConfig[ticket.status]
  const StatusIcon = status?.icon

  const person = type === "sent" ? ticket.receiver : ticket.owner
  const personName = person?.name || "Unknown"
  const personPhone = person?.phone || "No phone"
  const personEmail = person?.email
  const personInitials = personName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Format dates
  const sharedDate = format(new Date(ticket.sharedAt), "MMMM d, yyyy")
  const sharedTime = format(new Date(ticket.sharedAt), "h:mm a")
  const validUntilDate = format(
    new Date(ticket.validUntil),
    "MMMM d, yyyy 'at' h:mm a",
  )
  const isExpiringSoon =
    new Date(ticket.validUntil).getTime() - new Date().getTime() <
    24 * 60 * 60 * 1000

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] overflow-hidden rounded-3xl p-0">
        {/* Header with gradient */}
        <div className={cn("bg-gradient-to-r p-6", status.gradient)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className="text-white text-xl">
                Ticket Details
              </DialogTitle>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Status Badge */}
          <div className="flex justify-end mb-4">
            <Badge
              className={cn(
                "px-3 py-1.5 border-0 gap-1.5 rounded-full text-xs font-medium",
                status.className,
              )}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </Badge>
          </div>

          {/* QR Code Section */}
          {ticket.qrCode && (
            <div className="mb-6 flex justify-center">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
                <img
                  src={ticket.qrCode}
                  alt="QR Code"
                  className="w-32 h-32 object-contain"
                />
                <p className="text-xs text-center text-gray-500 mt-2">
                  Scan to validate ticket
                </p>
              </div>
            </div>
          )}

          {/* Bus & Route Information */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
              <Bus className="h-4 w-4" />
              Bus Information
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Bus Number</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {ticket.bus.busNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Seat Number</span>
                <Badge variant="outline" className="font-medium">
                  Seat {ticket.seatNumber}
                </Badge>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Route:
                    </span>
                  </div>
                  <span className="font-medium">
                    {ticket.bus.origin} → {ticket.bus.destination}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Boarding & Alighting Stops */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Stop Details
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                    <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {ticket.boardingStop}
                    </p>
                    <p className="text-xs text-gray-500">Boarding Point</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {ticket.alightingStop}
                    </p>
                    <p className="text-xs text-gray-500">Alighting Point</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Booking Information
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Booking ID</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  #{ticket.booking.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Booking Code</span>
                <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                  {ticket.booking.bookingCode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Booked On</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {format(new Date(ticket.booking.createdAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>

          {/* Person Details */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
              {type === "sent" ? (
                <Share2 className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
              {type === "sent" ? "Recipient Details" : "Sender Details"}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800 shadow-md">
                  <AvatarFallback
                    className={cn(
                      "text-sm font-medium",
                      type === "sent"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
                    )}
                  >
                    {personInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {personName}
                  </p>
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {personPhone}
                    </p>
                    {personEmail && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {personEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Share & Validity Information */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Shared on{" "}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {sharedDate}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400"> at </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {sharedTime}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Valid until{" "}
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      isExpiringSoon && "text-amber-600 dark:text-amber-400",
                    )}
                  >
                    {validUntilDate}
                  </span>
                  {isExpiringSoon && (
                    <span className="ml-1 text-xs text-amber-500">
                      (Expiring soon)
                    </span>
                  )}
                </div>
              </div>
              {ticket.checkedIn && (
                <div className="flex items-center gap-3 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Already checked in</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons for Received Pending */}
          {type === "received" && ticket.status === "PENDING" && (
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                onClick={onAccept}
                className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
              >
                <Check className="h-4 w-4" />
                Accept Ticket
              </Button>
              <Button
                onClick={onReject}
                variant="outline"
                className="flex-1 h-12 border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/50 rounded-xl gap-2"
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            </div>
          )}

          {/* Check-in Status for Accepted Tickets */}
          {ticket.status === "ACCEPTED" && (
            <div
              className={cn(
                "mt-4 p-3 rounded-xl text-center",
                ticket.checkedIn
                  ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400"
                  : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400",
              )}
            >
              <div className="flex items-center justify-center gap-2">
                {ticket.checkedIn ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Ticket already checked in
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Not checked in yet
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
