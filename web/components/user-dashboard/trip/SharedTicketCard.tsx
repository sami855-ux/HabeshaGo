// components/user-dashboard/shared-tickets/SharedTicketCard.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  Loader2,
  RefreshCw,
  Sparkles,
  CalendarDays,
  ArrowRight,
  QrCode,
  AlertTriangle,
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { TicketPreviewModal } from "./TicketPreviewModal"
import { cancelSharedTicketRequest } from "@/services/booking.api"
import { useQueryClient } from "@tanstack/react-query"

// Full-screen Loading Overlay using Dialog
const LoadingOverlay = ({
  message,
  subMessage,
}: {
  message?: string
  subMessage?: string
}) => (
  <Dialog open={true}>
    <DialogContent className="sm:max-w-md border-none shadow-2xl bg-white dark:bg-gray-900 p-0 overflow-hidden">
      <div className="flex flex-col items-center justify-center p-8 text-center">
        {/* Animated loader */}
        <div className="relative mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-orange-200 dark:border-orange-900"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent"
          />
          <div className="relative bg-gradient-to-br from-orange-500 to-amber-600 rounded-full p-4 shadow-lg">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {message || "Processing..."}
          </DialogTitle>
          {subMessage && (
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {subMessage}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Animated dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
              className="w-2 h-2 rounded-full bg-orange-500"
            />
          ))}
        </div>
      </div>
    </DialogContent>
  </Dialog>
)

// Confirmation Dialog Component
// Confirmation Dialog Component with Enhanced Design
const ConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  icon,
  showCancel = true,
  isLoading = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive" | "warning"
  icon?: React.ReactNode
  showCancel?: boolean
  isLoading?: boolean
}) => {
  // Configuration based on variant
  const getConfig = () => {
    switch (variant) {
      case "destructive":
        return {
          bgColor: "bg-rose-100 dark:bg-rose-950/30",
          iconColor: "text-rose-600 dark:text-rose-400",
          confirmBg: "bg-rose-500 hover:bg-rose-600 focus:ring-rose-500",
          confirmLabel: confirmText || "Delete",
          defaultIcon: <AlertTriangle className="h-7 w-7" />,
        }
      case "warning":
        return {
          bgColor: "bg-amber-100 dark:bg-amber-950/30",
          iconColor: "text-amber-600 dark:text-amber-400",
          confirmBg: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500",
          confirmLabel: confirmText || "Proceed",
          defaultIcon: <AlertCircle className="h-7 w-7" />,
        }
      default:
        return {
          bgColor: "bg-blue-100 dark:bg-blue-950/30",
          iconColor: "text-blue-600 dark:text-blue-400",
          confirmBg: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500",
          confirmLabel: confirmText || "Confirm",
          defaultIcon: <CheckCircle2 className="h-7 w-7" />,
        }
    }
  }

  const config = getConfig()
  const IconComponent = config.defaultIcon
  const confirmLabel = config.confirmLabel

  const handleCancel = () => {
    onOpenChange(false)
  }

  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl sm:max-w-md">
        <AlertDialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={cn(
              "mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4",
              config.bgColor,
            )}
          >
            <AlertCircle size={30} color="red" />
          </motion.div>

          <AlertDialogTitle className="text-center text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-base text-gray-600 dark:text-gray-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter
          className={cn(
            "flex gap-3 sm:justify-center",
            !showCancel && "sm:justify-center",
          )}
        >
          {showCancel && (
            <AlertDialogCancel
              onClick={handleCancel}
              disabled={isLoading}
              className="rounded-full px-6 min-w-[100px] border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {cancelText}
            </AlertDialogCancel>
          )}

          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "rounded-full px-6 min-w-[100px] text-white transition-all",
              config.confirmBg,
              isLoading && "opacity-90 cursor-not-allowed",
            )}
          >
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
                <span>{confirmLabel}...</span>
              </motion.div>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Loading Skeleton Component
const SharedTicketCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-6"
  >
    {/* Header Skeleton */}
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div>
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-7 w-20 rounded-full" />
    </div>

    {/* Bus Info Skeleton */}
    <div className="mb-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>

    {/* Person Details Skeleton */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-4 w-28 mb-1" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
      <div className="text-right">
        <Skeleton className="h-3 w-20 mb-1" />
        <Skeleton className="h-2 w-16" />
      </div>
    </div>

    {/* Actions Skeleton */}
    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
      <Skeleton className="flex-1 h-10 rounded-xl" />
      <Skeleton className="h-10 w-10 rounded-xl" />
    </div>
  </motion.div>
)

// Action Button with Loading State
const ActionButton = ({
  onClick,
  loading,
  disabled,
  children,
  className,
  ...props
}: {
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <Button
    onClick={onClick}
    disabled={disabled || loading}
    className={cn(
      "relative overflow-hidden transition-all duration-200",
      loading && "cursor-wait",
      className,
    )}
    {...props}
  >
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex items-center gap-2"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing...</span>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex items-center gap-2"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </Button>
)

// Updated interface to match actual data structure
interface SharedTicketCardProps {
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
  onStatusChange?: () => void
}

export function SharedTicketCard({
  ticket,
  type,
  onStatusChange,
}: SharedTicketCardProps) {
  const queryClient = useQueryClient()
  console.log(ticket)

  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [actionType, setActionType] = useState<
    "accept" | "reject" | "cancel" | "preview" | null
  >(null)

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
    CANCELLED: {
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
  const StatusIcon = status?.icon

  // Handle actions with loading states
  const handleAccept = async () => {
    try {
      setActionType("accept")
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      // Add your accept logic here
      onStatusChange?.()
    } catch (error) {
      console.error("Error accepting ticket:", error)
    } finally {
      setLoading(false)
      setActionType(null)
    }
  }

  const handleReject = async () => {
    try {
      setActionType("reject")
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      // Add your reject logic here
      onStatusChange?.()
    } catch (error) {
      console.error("Error rejecting ticket:", error)
    } finally {
      setLoading(false)
      setActionType(null)
    }
  }

  const handleCancelShare = async () => {
    try {
      setActionType("cancel")
      setLoading(true)

      const res = await cancelSharedTicketRequest(
        ticket.shareId,
        ticket.ticketId,
      )

      if (res.success) {
        console.log("Ticket cancelled successfully:", res.message)
        onStatusChange?.()
      } else {
        console.error("Failed to cancel ticket:", res.message)
      }
    } catch (error) {
      console.error("Unexpected error:", error)
    } finally {
      setLoading(false)
      setActionType(null)
      setShowCancelConfirm(false)
    }
  }

  const handleViewTicket = () => {
    console.log("View ticket:", ticket.ticketId)
    // Add your view ticket logic here
  }

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

  // Format relative time
  const sharedTimeAgo = format(new Date(ticket.sharedAt), "MMM d, yyyy")
  const sharedTimeDisplay = format(new Date(ticket.sharedAt), "h:mm a")

  // Format valid until time
  const validUntilDate = format(
    new Date(ticket.validUntil),
    "MMM d, yyyy h:mm a",
  )
  const isExpiringSoon =
    new Date(ticket.validUntil).getTime() - new Date().getTime() <
    24 * 60 * 60 * 1000

  return (
    <>
      <motion.div
        transition={{ type: "spring", bounce: 0.3 }}
        className={cn(
          "relative bg-white dark:bg-gray-900 rounded-2xl",
          "border border-gray-200 dark:border-gray-800",
          "shadow-lg hover:shadow-2xl transition-all duration-300",
          ticket.status === "REJECTED" && "opacity-75 grayscale-[0.2]",
          loading && "cursor-wait",
        )}
      >
        {/* Loading Overlay - Full screen dialog */}
        <AnimatePresence>
          {loading && (
            <LoadingOverlay
              message={
                actionType === "accept"
                  ? "Accepting ticket..."
                  : actionType === "reject"
                    ? "Rejecting ticket..."
                    : actionType === "cancel"
                      ? "Cancelling share..."
                      : "Processing..."
              }
              subMessage={
                actionType === "accept"
                  ? "Please wait while we confirm your acceptance"
                  : actionType === "reject"
                    ? "Rejecting the shared ticket"
                    : actionType === "cancel"
                      ? "Removing the shared ticket"
                      : "This may take a few moments"
              }
            />
          )}
        </AnimatePresence>

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

            {/* Enhanced status badge with shimmer effect for pending */}
            <Badge
              variant="outline"
              className={cn(
                "border-0 px-3 py-1.5 gap-1.5 rounded-full text-xs font-medium relative overflow-hidden",
                status.className,
                ticket.status === "PENDING" && "animate-pulse",
              )}
            >
              {ticket.status === "PENDING" && (
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              )}
              <StatusIcon className="h-3.5 w-3.5 relative z-10" />
              <span className="relative z-10">{status.label}</span>
            </Badge>
          </div>

          {/* Bus & Route Card */}
          <div
            className={cn(
              "mb-4 p-4 rounded-xl border",
              status.bgLight,
              "border-gray-200 dark:border-gray-700",
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bus className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {ticket.bus.busNumber}
                </span>
              </div>
              <Badge
                variant="outline"
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                Seat {ticket.seatNumber}
              </Badge>
            </div>

            {/* Route with stops */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600" />
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {ticket.boardingStop}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Boarding point
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {ticket.alightingStop}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Alighting point
                  </p>
                </div>
              </div>
            </div>

            {/* Origin to Destination */}
            <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {ticket.bus.origin}
                  </span>
                </div>
                <ArrowRight className="h-3 w-3 text-gray-400" />
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {ticket.bus.destination}
                  </span>
                </div>
              </div>
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

            {/* Share time with tooltip */}
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

          {/* Valid Until Info */}
          <div className="mb-4 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/30">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Valid until:
                </span>
              </div>
              <div
                className={cn(
                  "font-medium",
                  isExpiringSoon && "text-amber-600 dark:text-amber-400",
                )}
              >
                {validUntilDate}
                {isExpiringSoon && (
                  <span className="ml-1 text-amber-500">(Expiring soon)</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            {/* Preview Button - Primary Action */}
            <ActionButton
              onClick={() => {
                setActionType("preview")
                setShowPreview(true)
              }}
              loading={loading && actionType === "preview"}
              disabled={loading}
              className="flex-1 h-10 gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/30"
            >
              <Eye className="h-4 w-4" />
              Preview Ticket
            </ActionButton>

            {/* Conditional Actions */}
            {type === "sent" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={loading}
                    className="h-10 w-10 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {loading && actionType === "menu" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem
                    onClick={() => setShowPreview(true)}
                    disabled={loading}
                    className="gap-3 py-2.5 cursor-pointer"
                  >
                    <Ticket className="h-4 w-4" />
                    <span>View Full Ticket</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={loading}
                    className="gap-3 py-2.5 text-rose-600 focus:text-rose-600 dark:text-rose-400 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel Share</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : ticket.status === "PENDING" ? (
              <div className="flex gap-1.5">
                <ActionButton
                  onClick={handleAccept}
                  loading={loading && actionType === "accept"}
                  disabled={loading}
                  className="h-10 w-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
                >
                  <Check className="h-4 w-4" />
                </ActionButton>
                <ActionButton
                  onClick={handleReject}
                  loading={loading && actionType === "reject"}
                  disabled={loading}
                  variant="outline"
                  className="h-10 w-10 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/50"
                >
                  <X className="h-4 w-4" />
                </ActionButton>
              </div>
            ) : (
              <ActionButton
                onClick={handleViewTicket}
                loading={loading && actionType === "view"}
                disabled={loading}
                variant="outline"
                className="flex-1 h-10 gap-2 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Ticket className="h-4 w-4" />
                View Ticket
                <ChevronRight className="h-4 w-4 ml-auto" />
              </ActionButton>
            )}
          </div>
        </div>

        {/* Decorative QR Code pattern */}
        <div className="absolute bottom-2 right-2 opacity-5 pointer-events-none">
          <QrCode className="h-16 w-16" />
        </div>
      </motion.div>

      {/* Preview Modal */}
      <TicketPreviewModal
        open={showPreview}
        onOpenChange={(open) => {
          setShowPreview(open)
          if (!open) setActionType(null)
        }}
        ticket={ticket}
        type={type}
        onAccept={handleAccept}
        onReject={handleReject}
      />

      {/* Cancel Share Confirmation Dialog */}
      {/* Cancel Share Confirmation Dialog */}
      <ConfirmationDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        onConfirm={handleCancelShare}
        title="Cancel Share"
        description={`Are you sure you want to cancel sharing this ticket with ${personName}? This action cannot be undone.`}
        confirmText="Cancel Share"
        cancelText="Keep It"
        variant="destructive"
        isLoading={loading && actionType === "cancel"}
      />
    </>
  )
}

// Loading Grid Component for multiple cards
export const SharedTicketGridSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SharedTicketCardSkeleton key={i} />
    ))}
  </div>
)

// Empty State Component
export const SharedTicketEmptyState = ({
  type,
  hasFilters,
  onClearFilters,
}: {
  type: "sent" | "received"
  hasFilters?: boolean
  onClearFilters?: () => void
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-12"
  >
    <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
      {type === "sent" ? (
        <Share2 className="h-10 w-10 text-gray-400" />
      ) : (
        <Ticket className="h-10 w-10 text-gray-400" />
      )}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {hasFilters
        ? "No matching tickets found"
        : `No ${type === "sent" ? "shared" : "received"} tickets`}
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
      {hasFilters
        ? "Try adjusting your filters to see more results"
        : type === "sent"
          ? "You haven't shared any tickets yet"
          : "No tickets have been shared with you"}
    </p>
    {hasFilters && onClearFilters && (
      <Button variant="outline" onClick={onClearFilters} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Clear all filters
      </Button>
    )}
  </motion.div>
)
