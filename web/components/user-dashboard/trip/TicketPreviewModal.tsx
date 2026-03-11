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
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TicketPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket: {
    id: string
    status: "PENDING" | "ACCEPTED" | "REJECTED"
    sharedAt: string
    booking: {
      id: number
      seatNumber?: string
    }
    targetUser?: {
      id: string
      name: string
      phone: string
    }
    owner?: {
      id: string
      name: string
      phone: string
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
  const statusConfig = {
    PENDING:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    ACCEPTED:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  }

  const person = type === "sent" ? ticket.targetUser : ticket.owner
  const personName = person?.name || "Unknown"
  const personPhone = person?.phone || "No phone"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] overflow-hidden rounded-3xl p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-6">
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
        <div className="p-6">
          {/* Status Badge */}
          <div className="flex justify-end mb-4">
            <Badge
              className={cn(
                "px-3 py-1 border-0 gap-1",
                statusConfig[ticket.status],
              )}
            >
              {ticket.status === "PENDING" && (
                <AlertCircle className="h-3 w-3" />
              )}
              {ticket.status === "ACCEPTED" && <Check className="h-3 w-3" />}
              {ticket.status === "REJECTED" && <X className="h-3 w-3" />}
              {ticket.status}
            </Badge>
          </div>

          {/* Booking Info */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Booking Information
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Booking ID</span>
                <span className="font-medium">#{ticket.booking.id}</span>
              </div>
              {ticket.booking.seatNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Seat Number</span>
                  <span className="font-medium">
                    {ticket.booking.seatNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Person Info */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              {type === "sent" ? "Recipient" : "Sender"} Details
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-full",
                    type === "sent"
                      ? "bg-purple-100 dark:bg-purple-900/30"
                      : "bg-blue-100 dark:bg-blue-900/30",
                  )}
                >
                  {type === "sent" ? (
                    <Share2 className="h-4 w-4 text-purple-600" />
                  ) : (
                    <User className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {personName}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {personPhone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Share Info */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Share Details
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>
                  Shared on {format(new Date(ticket.sharedAt), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>at {format(new Date(ticket.sharedAt), "h:mm a")}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons for Received Pending */}
          {type === "received" && ticket.status === "PENDING" && (
            <div className="flex gap-3">
              <Button
                onClick={onAccept}
                className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl gap-2"
              >
                <Check className="h-4 w-4" />
                Accept
              </Button>
              <Button
                onClick={onReject}
                variant="outline"
                className="flex-1 h-12 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50 rounded-xl gap-2"
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
