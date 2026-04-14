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
  Sparkles,
  TrendingUp,
  User,
  Shield,
  Smartphone,
  QrCode as QrCodeIcon,
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
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { SharedTicketsIndicator } from "./SharedTicketsIndicator"
import { AllSharedOverlay } from "./AllSharedOverlay"

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
  const [showQrPreview, setShowQrPreview] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Parse dates
  const departureDate = new Date(trip.date)
  const now = new Date()
  const createdAt = new Date(trip.payment?.createdAt || trip.bookedAt || now)
  const updatedAt = new Date(trip.payment?.updatedAt || trip.updatedAt || now)

  // Calculate arrival date (default to 5 hours if no route info)
  const arrivalDate = new Date(departureDate)
  arrivalDate.setHours(arrivalDate.getHours() + 5)

  // Parse amounts
  const totalAmount = parseFloat(trip.totalAmount || trip.amountPaid || "0")
  const discount = parseFloat(trip.discount || "0")

  const timeUntilDeparture = formatDistanceToNow(departureDate, {
    addSuffix: true,
  })
  const isUrgent = departureDate.getTime() - Date.now() < 1000 * 60 * 60 * 3

  // Get ticket-specific data
  const firstTicket = trip.tickets?.[0]

  // Check ticket status
  const validUntilDate = firstTicket?.validUntil
    ? new Date(firstTicket.validUntil)
    : null
  const isExpired = validUntilDate ? isBefore(validUntilDate, now) : false
  const isCheckedIn = firstTicket?.checkedIn || false
  const isCancelled = !!firstTicket?.cancelledAt
  const isShared = trip.tickets?.some((t) => t.sharedAt) || false
  const isSharedTicketUsed = firstTicket?.sharedTicketUsed || false

  // Card is disabled based on various conditions
  const isDisabled =
    isExpired || isCheckedIn || isCancelled || isSharedTicketUsed

  // Calculate time differences
  const daysSinceCreated = differenceInDays(now, createdAt)
  const hoursUntilExpiry = validUntilDate
    ? differenceInHours(validUntilDate, now)
    : 0
  const isValidUntilSoon = validUntilDate
    ? hoursUntilExpiry > 0 && hoursUntilExpiry < 24
    : false

  // Get shared info
  const sharedTicket = trip.tickets?.find((t) => t.sharedAt)
  const sharedWith = sharedTicket?.sharedTo?.name
  const sharedAtDate = sharedTicket?.sharedAt
    ? new Date(sharedTicket.sharedAt)
    : null

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

  const origin = trip.origin || "Unknown"
  const destination = trip.destination || "Unknown"

  // / Calculate shared tickets count
  const sharedTicketsCount = trip.tickets?.filter((t) => t.sharedTo).length || 0
  const allTicketsShared =
    sharedTicketsCount === trip.tickets?.length && trip.tickets?.length > 0

  // Update the isDisabled condition to include allTicketsShared
  const isDisabledShared =
    isExpired ||
    isCheckedIn ||
    isCancelled ||
    isSharedTicketUsed ||
    allTicketsShared

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(trip.bookingCode)

    // Optional: Show a toast notification here
    toast.success("Copied!", {
      description: "Booking code copied to clipboard",
    })
  }

  // Get ticket count
  const ticketCount = trip.tickets?.length || 1
  const seatNumbers = trip.tickets?.map((t) => t.seatNumber).join(", ") || "N/A"

  // Get payment info
  const paymentMethod = trip.payment?.method || "Unknown"
  const paymentStatus = trip.payment?.status || "SUCCESS"
  const pointsUsed = trip.payment?.pointsUsed || 0

  // Get QR code from first ticket
  const qrCode = firstTicket?.qrCode

  // Get ticket status badge
  const getTicketStatusBadge = () => {
    if (isCancelled) {
      return {
        label: "Cancelled",
        icon: XCircle,
        color: "bg-red-500 text-white",
        border: "border-red-200",
      }
    }
    if (isExpired) {
      return {
        label: "Expired",
        icon: Timer,
        color: "bg-gray-500 text-white",
        border: "border-gray-200",
      }
    }
    if (isCheckedIn) {
      return {
        label: "Checked In",
        icon: CheckCheck,
        color: "bg-blue-500 text-white",
        border: "border-blue-200",
      }
    }
    if (isSharedTicketUsed) {
      return {
        label: "Shared & Used",
        icon: Users,
        color: "bg-purple-500 text-white",
        border: "border-purple-200",
      }
    }
    if (isShared) {
      return {
        label: "Shared",
        icon: Share2,
        color: "bg-orange-500 text-white",
        border: "border-orange-200",
      }
    }
    return null
  }

  const ticketStatus = getTicketStatusBadge()

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: {
      y: -4,
      transition: { duration: 0.2 },
    },
  }

  const badgeVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  }

  const qrPreviewVariants = {
    initial: { opacity: 0, scale: 0.8, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: 10 },
  }

  return (
    <TooltipProvider>
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        className="relative"
      >
        {/* Add the overlay when all tickets are shared */}
        <AnimatePresence>
          {allTicketsShared && (
            <AllSharedOverlay totalTickets={trip.tickets?.length || 0} />
          )}
        </AnimatePresence>

        <Card
          className={cn(
            "relative group",
            "rounded-3xl border",
            "shadow-lg transition-all duration-300",
            isDisabled
              ? "border-gray-200 dark:border-gray-800 opacity-70 grayscale-[0.2]"
              : "border-gray-100 dark:border-gray-800 hover:shadow-xl",
            allTicketsShared && "pointer-events-none", // Disable all interactions
          )}
        >
          {/* Animated gradient overlay */}
          <motion.div
            className={cn(
              "absolute inset-0 rounded-3xl bg-gradient-to-r opacity-0 pointer-events-none",
              status.gradient,
            )}
            animate={{ opacity: isHovered && !isDisabled ? 0.05 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Status Badges Row */}
          <div className="absolute top-0 left-6 flex items-center gap-2 z-10">
            {/* Main Status Badge */}
            <motion.div
              variants={badgeVariants}
              initial="initial"
              animate="animate"
              className={cn(
                "px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm",
                "bg-white/90 dark:bg-gray-900 border",
                // status.border,
              )}
            >
              <div className="flex items-center gap-1.5">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={cn("w-2 h-2 rounded-full", status.dot)}
                />
                <span className={cn("text-xs font-semibold", status.color)}>
                  {status.label}
                </span>
              </div>
            </motion.div>

            {/* Ticket Status Badge */}
            {ticketStatus && (
              <motion.div
                variants={badgeVariants}
                initial="initial"
                animate="animate"
                className={cn(
                  "px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm",
                  "bg-white/90 dark:bg-gray-900/90 border",
                  ticketStatus.color,
                )}
              >
                <div className="flex items-center gap-1.5">
                  <ticketStatus.icon className="h-3 w-3" />
                  <span className="text-xs font-semibold text-white">
                    {ticketStatus.label}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Quick action badges */}
            <AnimatePresence>
              {isUrgent && !isDisabled && category === "upcoming" && (
                <motion.div
                  variants={badgeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Badge
                    variant="outline"
                    className="rounded-full px-2 py-1 border-orange-200 bg-orange-50/50 text-orange-600 text-xs"
                  >
                    <Bell className="h-3 w-3 mr-1 animate-pulse" />
                    Boarding Soon
                  </Badge>
                </motion.div>
              )}

              {ticketCount > 1 && (
                <motion.div
                  variants={badgeVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Badge
                    variant="outline"
                    className="rounded-full px-2 py-1 border-blue-200 bg-blue-50/50 text-blue-600 text-xs"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    {ticketCount} Tickets
                  </Badge>
                </motion.div>
              )}

              {sharedTicketsCount && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        className="py-1.5 px-3 cursor-pointer hover:bg-gray-700 dark:hover:bg-orange-900/30 transition-all group flex items-center gap-1"
                        onClick={() =>
                          router.push("/user/booking/share/shared-ticket")
                        }
                      >
                        <span>
                          {sharedTicketsCount} ticket
                          {sharedTicketsCount !== 1 ? "s" : ""} ha
                          {sharedTicketsCount !== 1 ? "ve" : "s"} been shared
                          out of {trip.tickets.length}
                        </span>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                    >
                      <p>Click to view all shared tickets</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="p-6 py-2">
            {/* Header with actions */}
            <div className="flex justify-between items-start ">
              {/* Timestamps section */}
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-1 text-xs text-gray-500 cursor-help"
                    >
                      <History className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(createdAt, { addSuffix: true })}
                      </span>
                    </motion.div>
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
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={cn(
                            "flex items-center gap-1 text-xs cursor-help",
                            isValidUntilSoon
                              ? "text-orange-600"
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
                        </motion.div>
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

                <span className="text-gray-300">•</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-1 text-xs text-gray-500 cursor-help"
                    >
                      <CreditCard className="h-3 w-3" />
                      <span className="capitalize">
                        {paymentMethod.toLowerCase()}
                      </span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Paid via {paymentMethod}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-1">
                {/* Like Button with Animation */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
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
                        <motion.div
                          animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Heart
                            className={cn(
                              "h-4 w-4 transition-all",
                              isLiked
                                ? "fill-orange-500 text-orange-500"
                                : "text-gray-400",
                            )}
                          />
                        </motion.div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{isLiked ? "Saved" : "Save trip"}</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>

                {/* Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800"
                        disabled={isDisabled}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 rounded-2xl">
                    <DropdownMenuItem
                      onClick={handleShareClick}
                      className="gap-3 cursor-pointer"
                    >
                      <Share2 className="h-4 w-4" /> Share
                    </DropdownMenuItem>
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
                <div className="relative mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="relative"
                        >
                          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-200" />
                        </motion.div>
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
                      <motion.div
                        className="relative ml-[5px] my-2"
                        initial={{ height: 0 }}
                        animate={{ height: 32 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="w-0.5 h-8 bg-gradient-to-b from-orange-400 to-gray-300" />
                        <motion.div
                          animate={{ y: [0, 8, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute top-2 -left-[3px] w-2 h-2 border-2 border-orange-400 rounded-full"
                        />
                      </motion.div>

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
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800 text-center"
                    >
                      <span className="text-xs text-gray-500">Duration</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ~5 hours
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* Stops info */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50"
                  >
                    <span className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <MapPin className="h-3 w-3" /> Booking Code
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        {trip.bookingCode?.substring(0, 8)}...
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCopyCode}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                      >
                        <Copy className="h-3 w-3 text-gray-500" />
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Right column - Time & Price */}
              <div className="space-y-2">
                {/* Time cards */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/30"
                    >
                      <Calendar className="h-4 w-4 text-orange-600" />
                    </motion.div>
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
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </motion.div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">
                        {format(arrivalDate, "h:mm a")}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Urgent warning with animation */}
                <AnimatePresence>
                  {category === "upcoming" &&
                    isUrgent &&
                    trip.status === "CONFIRMED" &&
                    !isExpired &&
                    !isDisabled && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900"
                      >
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Bell className="h-4 w-4 text-orange-600" />
                          </motion.div>
                          <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                            Boarding soon! {timeUntilDeparture}
                          </span>
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
            </div>

            {/* QR Code Preview */}
            {qrCode && (
              <div className="relative mt-4">
                <motion.div
                  variants={qrPreviewVariants}
                  initial="initial"
                  animate={showQrPreview ? "animate" : "initial"}
                  className="absolute -top-16 right-0 z-20"
                >
                  {showQrPreview && (
                    <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
                      <img
                        src={qrCode}
                        alt="QR Code"
                        className="w-24 h-24 object-contain"
                      />
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              {/* Price with animation */}
              <motion.div className="cursor-default">
                <div className="flex items-baseline gap-2">
                  <motion.span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                    {new Intl.NumberFormat("en-ET", {
                      style: "currency",
                      currency: trip.currency || "ETB",
                    }).format(totalAmount)}
                  </motion.span>
                  {discount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <Badge className="bg-orange-500 text-white border-0 rounded-full text-xs px-2 py-0.5">
                        -{discount}% OFF
                      </Badge>
                    </motion.div>
                  )}
                </div>
                {pointsUsed > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1 mt-1"
                  >
                    <Award className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-orange-600">
                      {pointsUsed} points used
                    </span>
                  </motion.div>
                )}
              </motion.div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* QR Code Button with Preview */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onHoverStart={() => setShowQrPreview(true)}
                      onHoverEnd={() => setShowQrPreview(false)}
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleShareClick}
                        className="rounded-full h-10 w-10 border-2 hover:bg-gray-50 relative"
                        disabled={isDisabled}
                      >
                        <QrCodeIcon className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Show QR Code</p>
                  </TooltipContent>
                </Tooltip>

                {/* View Ticket Button */}
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 gap-2 shadow-lg shadow-orange-200 dark:shadow-orange-900/30"
                        disabled={isDisabled}
                      >
                        <Ticket className="h-4 w-4" />
                        View Ticket
                      </Button>
                    </motion.div>
                  </SheetTrigger>
                  <OrangeTicketSheet trip={trip} />
                </Sheet>
              </div>
            </div>
          </div>
        </Card>

        {/* Modern Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4"
              >
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </motion.div>
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
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Deleting...
                  </motion.div>
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
