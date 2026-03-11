import { useState } from "react"
import { Trip } from "@/types/trips"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  QrCode,
  Share2,
  Download,
  Heart,
  MoreHorizontal,
  Bell,
  Award,
  Trash2,
  Edit,
  Copy,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Ticket,
  CreditCard,
  Timer,
  CheckCheck,
  Share,
  AlertCircle,
  Bus,
  Users,
  Wifi,
  Coffee,
  Zap,
  Luggage,
  Clock3,
  History,
  Ban,
  Gift,
  ExternalLink,
} from "lucide-react"
import {
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  differenceInDays,
  differenceInHours,
} from "date-fns"
import OrangeTicketSheet from "./TicketSheet"
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
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

interface TripCardProps {
  trip: Trip
  category: "upcoming" | "past"
  onDelete?: (tripId: number) => void
  onEdit?: (trip: Trip) => void
  onDuplicate?: (trip: Trip) => void
  onShare?: (trip: Trip) => void
  onDownload?: (trip: Trip) => void
}

export default function TripCard({
  trip,
  category,
  onDelete,
  onEdit,
  onDuplicate,
  onShare,
  onDownload,
}: TripCardProps) {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  console.log(trip)
  const departureDate = new Date(trip.date)
  const now = new Date()
  const createdAt = new Date(trip.createdAt)
  const updatedAt = new Date(trip.updatedAt)

  const arrivalDate = new Date(departureDate)
  if (trip.bus?.route?.estimatedTimeMin) {
    arrivalDate.setMinutes(
      arrivalDate.getMinutes() + trip.bus.route.estimatedTimeMin,
    )
  } else {
    arrivalDate.setHours(arrivalDate.getHours() + 5)
  }

  const totalAmount = parseFloat(trip.totalAmount)
  const discount = parseFloat(trip.discount)

  const timeUntilDeparture = formatDistanceToNow(departureDate, {
    addSuffix: true,
  })
  const isUrgent = departureDate.getTime() - Date.now() < 1000 * 60 * 60 * 3

  const validUntilDate = trip.validUntil ? new Date(trip.validUntil) : null
  const isExpired = validUntilDate ? isBefore(validUntilDate, now) : false

  // Check if ticket is shared and used
  const isShared = trip.sharedAt
  const isSharedTicketUsed = trip.sharedTicketUsed || false

  // Card is disabled if shared and used
  const isDisabled = isShared || isSharedTicketUsed

  // Calculate time differences
  const daysSinceCreated = differenceInDays(now, createdAt)
  const hoursUntilExpiry = validUntilDate
    ? differenceInHours(validUntilDate, now)
    : 0
  const isValidUntilSoon = validUntilDate
    ? hoursUntilExpiry > 0 && hoursUntilExpiry < 24
    : false

  // Format shared info
  const sharedWith = trip?.sharedTo?.name
  const sharedAtDate = trip.sharedAt ? new Date(trip.sharedAt) : null

  const statusConfig = {
    CONFIRMED: {
      icon: CheckCircle2,
      label: "Confirmed",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      lightBg: "bg-emerald-500/10",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      gradient: "from-emerald-500 to-teal-500",
    },
    COMPLETED: {
      icon: Award,
      label: "Completed",
      color: "text-blue-600",
      bg: "bg-blue-50",
      lightBg: "bg-blue-500/10",
      border: "border-blue-200",
      dot: "bg-blue-500",
      gradient: "from-blue-500 to-indigo-500",
    },
    CANCELLED: {
      icon: XCircle,
      label: "Cancelled",
      color: "text-red-600",
      bg: "bg-red-50",
      lightBg: "bg-red-500/10",
      border: "border-red-200",
      dot: "bg-red-500",
      gradient: "from-red-500 to-pink-500",
    },
  }

  const status =
    statusConfig[trip.status as keyof typeof statusConfig] ||
    statusConfig.CONFIRMED
  const StatusIcon = status.icon

  const origin = trip.origin || trip.bus?.route?.origin || "Unknown"
  const destination =
    trip.destination || trip.bus?.route?.destination || "Unknown"

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      onDelete?.(trip.id)
    } catch (error) {
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleShareClick = () => {
    onShare?.(trip)
  }

  // Get amenities icons
  const amenities = trip.bus?.amenities || []
  const amenityIcons = {
    wifi: Wifi,
    ac: Zap,
    food: Coffee,
    luggage: Luggage,
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className={cn(
            "relative group",
            "bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900/95",
            "rounded-3xl border border-gray-100 dark:border-gray-800",
            "shadow-lg hover:shadow-xl transition-all duration-300",
            isExpired && "opacity-50 grayscale-[0.3]",
          )}
        >
          {isShared && !isSharedTicketUsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-gray-900/30 backdrop-blur-[1px] z-20 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()} // Prevent clicks from reaching the underlying ticket
            >
              <motion.div
                initial={{ scale: 0.8, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  bounce: 0.4,
                  duration: 0.5,
                  delay: 0.1,
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
                }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 bg-white dark:bg-gray-900 px-5 py-3 rounded-2xl shadow-2xl border-2 border-orange-200 dark:border-orange-800 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle click action - you can replace this with your navigation logic
                  // if (onViewSharedTicket) {
                  //   onViewSharedTicket(ticketId);
                  // } else {
                  //   // Default action: navigate to ticket details
                  //   window.location.href = `/tickets/${ticketId}/shared`;
                  // }
                }}
              >
                {/* Animated icon with glow effect */}
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-orange-400 rounded-full blur-md -z-10"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-900"
                  />
                </div>

                {/* Text content */}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Ticket shared with{" "}
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {sharedWith || "Recipient"}
                    </span>
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Click to view sharing details
                  </span>
                </div>

                {/* Clickable button with arrow */}
                <motion.div className="ml-2">
                  <Button
                    size="sm"
                    className=" text-white rounded-md px-4 h-8 gap-1.5 shadow-md cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push("/user/booking/share/shared-ticket")
                    }}
                  >
                    <span className="text-xs">View Status</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {isSharedTicketUsed && (
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-gray-900/30 backdrop-blur-[1px] z-20 flex items-center justify-center">
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[2px] rounded-3xl" />

              {/* Centered badge */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white dark:bg-gray-900 px-4 py-2.5 rounded-full shadow-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <CheckCircle2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Used by{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {sharedWith || "Recipient"}
                      </span>
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Modern gradient accent */}
          <div
            className={cn(
              "absolute inset-0 rounded-3xl bg-gradient-to-r opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none",
              status.gradient,
            )}
          />

          {/* Status Badge - Modern floating design */}
          <div className="absolute -top-2 left-6 flex items-center gap-2 z-10">
            <div
              className={cn(
                "px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm",
                "bg-white/90 dark:bg-gray-900/90 border",
                status.border,
              )}
            >
              <div className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", status.dot)} />
                <span className={cn("text-xs font-semibold", status.color)}>
                  {status.label}
                </span>
              </div>
            </div>

            {/* Quick action badges */}
            <div className="flex items-center gap-1">
              {isExpired && (
                <Badge
                  variant="outline"
                  className="rounded-full px-2 py-1 border-red-200 bg-red-50/50 text-red-600 text-xs"
                >
                  <Timer className="h-3 w-3 mr-1" />
                  Expired
                </Badge>
              )}
              {trip.checkedIn && (
                <Badge
                  variant="outline"
                  className="rounded-full px-2 py-1 border-emerald-200 bg-emerald-50/50 text-emerald-600 text-xs"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Checked In
                </Badge>
              )}
              {isShared && !isSharedTicketUsed && (
                <Badge
                  variant="outline"
                  className="rounded-full px-2 py-1 border-purple-200 bg-purple-50/50 text-purple-600 text-xs"
                >
                  <Share className="h-3 w-3 mr-1" />
                  Shared
                </Badge>
              )}
            </div>
          </div>

          {/* Content - Fixed padding */}
          <div className="p-6">
            {/* Header with actions */}
            <div className="flex justify-between items-start mb-6">
              {/* Timestamps section */}
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <History className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(createdAt, { addSuffix: true })}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Booked on {format(createdAt, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </TooltipContent>
                </Tooltip>

                {validUntilDate && !isExpired && (
                  <>
                    <span className="text-gray-300">•</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "flex items-center gap-1 text-xs",
                            isValidUntilSoon
                              ? "text-orange-600 animate-pulse"
                              : "text-gray-500",
                          )}
                        >
                          <Clock3 className="h-3 w-3" />
                          <span>
                            Valid{" "}
                            {formatDistanceToNow(validUntilDate, {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Valid until{" "}
                          {format(validUntilDate, "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}

                {sharedAtDate && !isSharedTicketUsed && (
                  <>
                    <span className="text-gray-300">•</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-xs text-purple-600">
                          <Share className="h-3 w-3" />
                          <span>
                            Shared{" "}
                            {formatDistanceToNow(sharedAtDate, {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Shared with {sharedWith || "recipient"} on{" "}
                          {format(sharedAtDate, "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsLiked(!isLiked)}
                      className={cn(
                        "rounded-full h-9 w-9",
                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                        "transition-all duration-300",
                        isLiked && "bg-orange-50 dark:bg-orange-950/30",
                      )}
                      disabled={isDisabled}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4 transition-all",
                          isLiked
                            ? "fill-orange-500 text-orange-500 scale-110"
                            : "text-gray-400",
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{isLiked ? "Saved" : "Save trip"}</p>
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800"
                      disabled={isDisabled}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 rounded-2xl">
                    <DropdownMenuItem
                      onClick={handleShareClick}
                      className="gap-3 cursor-pointer"
                    >
                      <Share2 className="h-4 w-4" /> Share
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDownload?.(trip)}
                      className="gap-3 cursor-pointer"
                    >
                      <Download className="h-4 w-4" /> Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDuplicate?.(trip)}
                      className="gap-3 cursor-pointer"
                    >
                      <Copy className="h-4 w-4" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEdit?.(trip)}
                      className="gap-3 cursor-pointer"
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="gap-3 text-red-600 focus:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Route */}
              <div className="md:col-span-2">
                {/* Route visualization */}
                <div className="relative mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-200" />
                          <div className="absolute inset-0 w-3 h-3 rounded-full bg-orange-400 animate-ping opacity-20" />
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            From
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {origin}
                          </h3>
                        </div>
                      </div>

                      {/* Animated path */}
                      <div className="relative ml-[5px] my-2">
                        <div className="w-0.5 h-8 bg-gradient-to-b from-orange-400 to-gray-300" />
                        <div className="absolute top-2 -left-[3px] w-2 h-2 border-2 border-orange-400 rounded-full animate-pulse" />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            To
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {destination}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Duration badge */}
                    <div className="px-3 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800 text-center">
                      <span className="text-xs text-gray-500">Duration</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {trip.bus.route.estimatedTimeMin} Minutes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stops info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <MapPin className="h-3 w-3" /> Boarding
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {trip.boardingStop}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <MapPin className="h-3 w-3" /> Drop-off
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {trip.alightingStop}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right column - Time & Price */}
              <div className="space-y-4">
                {/* Time cards */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/30">
                      <Calendar className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Departure</span>
                      <p className="font-semibold">
                        {format(departureDate, "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">
                        {format(departureDate, "h:mm a")}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">
                        {format(arrivalDate, "h:mm a")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Urgent warning */}
                {category === "upcoming" &&
                  isUrgent &&
                  trip.status === "CONFIRMED" &&
                  !isExpired &&
                  !isDisabled && (
                    <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-orange-600 animate-bounce" />
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                          Boarding soon! {timeUntilDeparture}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                {amenities.map((amenity) => {
                  const Icon =
                    amenityIcons[amenity as keyof typeof amenityIcons] || Bus
                  return (
                    <Tooltip key={amenity}>
                      <TooltipTrigger asChild>
                        <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                          <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="capitalize">{amenity}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                    {new Intl.NumberFormat("en-ET", {
                      style: "currency",
                      currency: trip.currency,
                    }).format(totalAmount)}
                  </span>
                  {discount > 0 && (
                    <Badge className="bg-orange-500 text-white border-0 rounded-full text-xs px-2 py-0.5">
                      -{discount}% OFF
                    </Badge>
                  )}
                </div>
                {trip.pointsUsed > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Award className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-orange-600">
                      +{trip.pointsUsed} points earned
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShareClick}
                  className="rounded-full h-10 w-10 border-2 hover:bg-gray-50"
                  disabled={isDisabled}
                >
                  <QrCode className="h-4 w-4" />
                </Button>

                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button
                      className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 gap-2 shadow-lg shadow-orange-200 dark:shadow-orange-900/30"
                      disabled={isDisabled}
                    >
                      <Ticket className="h-4 w-4" />
                      View Ticket
                    </Button>
                  </SheetTrigger>
                  <OrangeTicketSheet trip={trip} />
                </Sheet>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-center text-xl">
                Delete Trip
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Are you sure you want to delete this trip from{" "}
                <span className="font-semibold">{origin}</span> to{" "}
                <span className="font-semibold">{destination}</span>? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2 sm:justify-center">
              <AlertDialogCancel
                disabled={isDeleting}
                className="rounded-full px-6"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-full bg-red-500 hover:bg-red-600 text-white px-6"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </TooltipProvider>
  )
}
