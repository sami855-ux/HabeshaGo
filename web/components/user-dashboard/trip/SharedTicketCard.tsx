// components/user-dashboard/shared-tickets/SharedTicketCard.tsx
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import {
  Ticket,
  MapPin,
  Calendar,
  Clock,
  Bus,
  User,
  Share2,
  Eye,
  Check,
  X,
  MoreHorizontal,
  Phone,
  Mail,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { TicketPreviewModal } from "./TicketPreviewModal"

interface SharedTicketCardProps {
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
}

export function SharedTicketCard({ ticket, type }: SharedTicketCardProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Status badge configuration with enhanced visuals
  const statusConfig = {
    PENDING: {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
      dot: "bg-amber-500",
      icon: Clock3,
      gradient: "from-amber-500 to-orange-500",
      bgLight: "bg-amber-50 dark:bg-amber-950/20",
    },
    ACCEPTED: {
      label: "Accepted",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
      dot: "bg-emerald-500",
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-500",
      bgLight: "bg-emerald-50 dark:bg-emerald-950/20",
    },
    REJECTED: {
      label: "Rejected",
      className:
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
      dot: "bg-rose-500",
      icon: XCircle,
      gradient: "from-rose-500 to-pink-500",
      bgLight: "bg-rose-50 dark:bg-rose-950/20",
    },
  }

  const status = statusConfig[ticket.status]
  const StatusIcon = status.icon

  // Handle actions
  const handleAccept = () => {
    console.log("Accept ticket:", ticket.id)
    // Add your accept logic here
  }

  const handleReject = () => {
    console.log("Reject ticket:", ticket.id)
    // Add your reject logic here
  }

  const handleCancelShare = () => {
    console.log("Cancel share:", ticket.id)
    // Add your cancel share logic here
  }

  const handleViewTicket = () => {
    console.log("View ticket:", ticket.id)
    // Add your view ticket logic here
  }

  const person = type === "sent" ? ticket.targetUser : ticket.owner
  const personName = person?.name || "Unknown"
  const personPhone = person?.phone || "No phone"
  const personInitials = personName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Format relative time
  const sharedTimeAgo = format(new Date(ticket.sharedAt), "MMM d, yyyy")
  const sharedTimeDisplay = format(new Date(ticket.sharedAt), "h:mm a")

  return (
    <>
      <motion.div
        transition={{ type: "spring", bounce: 0.3 }}
        className={cn(
          "relative bg-white dark:bg-gray-900 rounded-2xl",
          "border border-gray-200 dark:border-gray-800",
          "shadow-lg hover:shadow-2xl transition-all duration-300",
          ticket.status === "REJECTED" && "opacity-75 grayscale-[0.2]",
        )}
      >
        <div className="p-6">
          {/* Header with better visual hierarchy */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2.5 rounded-xl",
                  type === "sent"
                    ? "bg-purple-100 dark:bg-purple-900/30"
                    : "bg-blue-100 dark:bg-blue-900/30",
                )}
              >
                {type === "sent" ? (
                  <Share2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                ) : (
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {type === "sent" ? "Shared to" : "Shared by"}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {personName}
                </p>
              </div>
            </div>

            {/* Enhanced status badge */}
            <Badge
              variant="outline"
              className={cn(
                "border-0 px-3 py-1.5 gap-1.5 rounded-full text-xs font-medium",
                status.className,
              )}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </Badge>
          </div>

          {/* Booking Card - Visual highlight */}
          <div
            className={cn(
              "mb-4 p-4 rounded-xl border",
              status.bgLight,
              "border-gray-200 dark:border-gray-700",
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Booking #{ticket.booking.id}
                </span>
              </div>
              {ticket.booking.seatNumber && (
                <Badge
                  variant="outline"
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  Seat {ticket.booking.seatNumber}
                </Badge>
              )}
            </div>

            {/* Mock route (since we don't have route data) */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="h-3 w-3" />
              <span>Route information not available</span>
            </div>
          </div>

          {/* Person Details with Avatar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-md">
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
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {personName}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Phone className="h-3 w-3" />
                  <span>{personPhone}</span>
                </div>
              </div>
            </div>

            {/* Share time with icon */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {sharedTimeAgo}
                    </p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {sharedTimeDisplay}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Shared on{" "}
                    {format(
                      new Date(ticket.sharedAt),
                      "MMMM d, yyyy 'at' h:mm a",
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Action Buttons - Redesigned */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            {/* Preview Button - Primary Action */}
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowPreview(true)}
              className="flex-1 h-10 text-sm gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/30"
            >
              <Eye className="h-4 w-4" />
              Preview Ticket
            </Button>

            {/* Conditional Actions */}
            {type === "sent" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem
                    onClick={handleViewTicket}
                    className="gap-3 py-2.5 cursor-pointer"
                  >
                    <Ticket className="h-4 w-4" />
                    <span>View Full Ticket</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleCancelShare}
                    className="gap-3 py-2.5 text-rose-600 focus:text-rose-600 dark:text-rose-400 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel Share</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : // Received tickets actions
            ticket.status === "PENDING" ? (
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  onClick={handleAccept}
                  className="h-10 w-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleReject}
                  variant="outline"
                  className="h-10 w-10 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleViewTicket}
                className="flex-1 h-10 text-sm gap-2 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Ticket className="h-4 w-4" />
                View Ticket
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5 pointer-events-none">
          <Ticket className="w-full h-full" />
        </div>
      </motion.div>

      {/* Preview Modal */}
      <TicketPreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        ticket={ticket}
        type={type}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </>
  )
}
