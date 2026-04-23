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
  BatteryCharging,
  Plug,
  Navigation,
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

  // Check if it's an EV trip
  const isEvTrip = trip.type === "EV"

  // Parse dates based on trip type
  const departureDate =
    isEvTrip && trip.startTime ? new Date(trip.startTime) : new Date(trip.date)
  const now = new Date()
  const createdAt = new Date(trip.payment?.createdAt || trip.bookedAt || now)
  const updatedAt = new Date(trip.payment?.updatedAt || trip.updatedAt || now)

  // For EV trips, calculate arrival date from endTime
  const arrivalDate =
    isEvTrip && trip.endTime
      ? new Date(trip.endTime)
      : (() => {
          const date = new Date(departureDate)
          date.setHours(date.getHours() + 5)
          return date
        })()

  // Parse amounts
  const totalAmount = parseFloat(trip.totalAmount || trip.amountPaid || "0")
  const discount = parseFloat(trip.discount || "0")

  const timeUntilDeparture = formatDistanceToNow(departureDate, {
    addSuffix: true,
  })
  const isUrgent = departureDate.getTime() - Date.now() < 1000 * 60 * 60 * 3

  // Get ticket-specific data (only for BUS trips)
  const firstTicket = !isEvTrip ? trip.tickets?.[0] : null

  // Check ticket status (only for BUS trips)
  const validUntilDate =
    firstTicket?.validUntil && !isEvTrip
      ? new Date(firstTicket.validUntil)
      : null
  const isExpired = validUntilDate ? isBefore(validUntilDate, now) : false
  const isCheckedIn = firstTicket?.checkedIn || false
  const isCancelled = trip.status === "CANCELLED"
  const isShared = !isEvTrip && (trip.tickets?.some((t) => t.sharedAt) || false)
  const isSharedTicketUsed = firstTicket?.sharedTicketUsed || false

  // For EV trips, check if session is completed
  const isEvCompleted = isEvTrip && trip.status === "COMPLETED"
  const isEvUpcoming = isEvTrip && category === "upcoming"

  // Card is disabled based on various conditions
  const isDisabled = isEvTrip
    ? isEvCompleted
    : isExpired || isCheckedIn || isCancelled || isSharedTicketUsed

  // Calculate time differences (only for BUS)
  const daysSinceCreated = differenceInDays(now, createdAt)
  const hoursUntilExpiry = validUntilDate
    ? differenceInHours(validUntilDate, now)
    : 0
  const isValidUntilSoon = validUntilDate
    ? hoursUntilExpiry > 0 && hoursUntilExpiry < 24
    : false

  // Get shared info (only for BUS)
  const sharedTicket = !isEvTrip ? trip.tickets?.find((t) => t.sharedAt) : null
  const sharedWith = sharedTicket?.sharedTo?.name
  const sharedAtDate = sharedTicket?.sharedAt
    ? new Date(sharedTicket.sharedAt)
    : null

  const statusConfig = {
    CONFIRMED: {
      icon: CheckCircle2,
      label: isEvTrip ? "Reserved" : "Confirmed",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      lightBg: "bg-emerald-500/10",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      gradient: "from-emerald-500 to-teal-500",
    },
    COMPLETED: {
      icon: Award,
      label: isEvTrip ? "Charged" : "Completed",
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
    IN_PROGRESS: {
      icon: Zap,
      label: "Charging",
      color: "text-orange-600",
      bg: "bg-orange-50",
      lightBg: "bg-orange-500/10",
      border: "border-orange-200",
      dot: "bg-orange-500",
      gradient: "from-orange-500 to-amber-500",
    },
  }

  const status =
    statusConfig[trip.status as keyof typeof statusConfig] ||
    statusConfig.CONFIRMED
  const StatusIcon = status.icon

  const origin = isEvTrip
    ? trip.origin || "Charging Station"
    : trip.origin || "Unknown"
  const destination = isEvTrip ? "EV Charging" : trip.destination || "Unknown"

  // Calculate shared tickets count (only for BUS)
  const sharedTicketsCount = !isEvTrip
    ? trip.tickets?.filter((t) => t.sharedTo).length || 0
    : 0
  const allTicketsShared =
    !isEvTrip &&
    sharedTicketsCount === trip.tickets?.length &&
    trip.tickets?.length > 0

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
    const code = isEvTrip ? trip.bookingCode : trip.bookingCode
    navigator.clipboard.writeText(code)
    toast.success("Copied!", {
      description: `${isEvTrip ? "Reservation" : "Booking"} code copied to clipboard`,
    })
  }

  // Get ticket count (only for BUS)
  const ticketCount = !isEvTrip ? trip.tickets?.length || 1 : 0
  const seatNumbers = !isEvTrip
    ? trip.tickets?.map((t) => t.seatNumber).join(", ") || "N/A"
    : "N/A"

  // Get payment info
  const paymentMethod =
    trip.payment?.method || trip.payments?.[0]?.method || "Unknown"
  const paymentStatus =
    trip.payment?.status || trip.payments?.[0]?.status || "SUCCESS"
  const pointsUsed = trip.pointsUsed || 0

  // Get QR code (only for BUS)
  const qrCode = !isEvTrip ? firstTicket?.qrCode : null

  // Get ticket status badge (only for BUS)
  const getTicketStatusBadge = () => {
    if (isEvTrip) return null
    if (isCancelled) {
      return {
        label: "Cancelled",
        icon: XCircle,
        color: "bg-red-500 text-white",
      }
    }
    if (isExpired) {
      return {
        label: "Expired",
        icon: Timer,
        color: "bg-gray-500 text-white",
      }
    }
    if (isCheckedIn) {
      return {
        label: "Checked In",
        icon: CheckCheck,
        color: "bg-blue-500 text-white",
      }
    }
    if (isSharedTicketUsed) {
      return {
        label: "Shared & Used",
        icon: Users,
        color: "bg-purple-500 text-white",
      }
    }
    if (isShared) {
      return {
        label: "Shared",
        icon: Share2,
        color: "bg-orange-500 text-white",
      }
    }
    return null
  }

  const ticketStatus = getTicketStatusBadge()

  // Get EV specific details
  const evDetails = isEvTrip
    ? {
        batteryPercentage: trip.targetBatteryPercentage,
        energyKwh: trip.targetKwh,
        connectorType: trip.chargingPoint?.connectorType || "CCS2",
        powerKw: trip.chargingPoint?.powerKw || 50,
        chargingPointName: trip.chargingPoint?.name || trip.origin,
      }
    : null

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

  // Calculate session duration for EV
  const getSessionDuration = () => {
    if (!isEvTrip || !trip.startTime || !trip.endTime) return null
    const start = new Date(trip.startTime)
    const end = new Date(trip.endTime)
    const minutes = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins} min`
    if (mins === 0) return `${hours} hour${hours > 1 ? "s" : ""}`
    return `${hours}h ${mins}m`
  }

  return (
    <TooltipProvider>
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        className="relative"
      >
        {/* Add the overlay when all tickets are shared (BUS only) */}
        <AnimatePresence>
          {allTicketsShared && !isEvTrip && (
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
            allTicketsShared && !isEvTrip && "pointer-events-none",
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
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

            {/* Ticket Status Badge (BUS only) */}
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

            {/* Trip Type Badge */}
            <motion.div
              variants={badgeVariants}
              initial="initial"
              animate="animate"
              className={cn(
                "px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm",
                "bg-white/90 dark:bg-gray-900 border",
                isEvTrip ? "border-purple-200" : "border-orange-200",
              )}
            >
              <div className="flex items-center gap-1.5">
                {isEvTrip ? (
                  <Smartphone className="h-3 w-3 text-purple-600" />
                ) : (
                  <Bus className="h-3 w-3 text-orange-600" />
                )}
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isEvTrip ? "text-purple-600" : "text-orange-600",
                  )}
                >
                  {isEvTrip ? "EV Charging" : "Bus Trip"}
                </span>
              </div>
            </motion.div>

            {/* Quick action badges */}
            <AnimatePresence>
              {isUrgent &&
                !isDisabled &&
                category === "upcoming" &&
                !isEvTrip && (
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

              {ticketCount > 1 && !isEvTrip && (
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

              {sharedTicketsCount > 0 && !isEvTrip && (
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
            <div className="flex justify-between items-start mt-8">
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
                      {isEvTrip ? "Reserved" : "Booked"} on{" "}
                      {format(createdAt, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </TooltipContent>
                </Tooltip>

                {validUntilDate && !isExpired && !isEvTrip && (
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {/* Left column - Route / EV Details */}
              <div className="md:col-span-2">
                {isEvTrip ? (
                  // EV Trip Details
                  <div className="space-y-4">
                    <div className="relative mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-gray-300" />
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vehicle
                              </span>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {trip.vehicle?.manufacturer}{" "}
                                {trip.vehicle?.model}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {trip.vehicle?.plateNumber}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Charging Stats Badge */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-2 rounded-2xl bg-purple-50 dark:bg-purple-950/30 text-center"
                        >
                          <span className="text-xs text-purple-600">
                            Session Duration
                          </span>
                          <p className="font-semibold text-purple-700">
                            {getSessionDuration() || "~2 hours"}
                          </p>
                        </motion.div>
                      </div>
                    </div>

                    {/* EV Specs Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div className="flex items-center gap-2">
                          <BatteryCharging className="h-4 w-4 text-purple-500" />
                          <span className="text-xs text-gray-500">Energy</span>
                        </div>
                        <p className="font-semibold text-gray-900 mt-1">
                          {evDetails?.energyKwh} kWh
                        </p>
                        <p className="text-xs text-gray-500">
                          Target: {evDetails?.batteryPercentage}%
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div className="flex items-center gap-2">
                          <Plug className="h-4 w-4 text-purple-500" />
                          <span className="text-xs text-gray-500">
                            Connector
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 mt-1">
                          {evDetails?.connectorType}
                        </p>
                        <p className="text-xs text-gray-500">
                          {evDetails?.powerKw} kW Max
                        </p>
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  // BUS Trip Details (Original)
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
                )}

                {/* Booking Code Section */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50"
                  >
                    <span className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      {isEvTrip ? (
                        <Smartphone className="h-3 w-3" />
                      ) : (
                        <Ticket className="h-3 w-3" />
                      )}
                      {isEvTrip ? "Reservation Code" : "Booking Code"}
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

                  {!isEvTrip && seatNumbers !== "N/A" && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50"
                    >
                      <span className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <Users className="h-3 w-3" /> Seat Number
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">
                          {seatNumbers}
                        </span>
                      </div>
                    </motion.div>
                  )}
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
                      className={`p-2 rounded-xl ${isEvTrip ? "bg-purple-100 dark:bg-purple-950/30" : "bg-orange-100 dark:bg-orange-950/30"}`}
                    >
                      {isEvTrip ? (
                        <Zap className={`h-4 w-4 text-purple-600`} />
                      ) : (
                        <Calendar className={`h-4 w-4 text-orange-600`} />
                      )}
                    </motion.div>
                    <div>
                      <span className="text-xs text-gray-500">
                        {isEvTrip ? "Session Start" : "Departure"}
                      </span>
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

                  {isEvTrip && evDetails?.batteryPercentage && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Target Battery</span>
                        <span className="font-semibold text-purple-600">
                          {evDetails.batteryPercentage}%
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Urgent warning with animation (BUS only) */}
                <AnimatePresence>
                  {category === "upcoming" &&
                    isUrgent &&
                    trip.status === "CONFIRMED" &&
                    !isExpired &&
                    !isDisabled &&
                    !isEvTrip && (
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

                {/* EV Session Status */}
                {isEvTrip && category === "upcoming" && isUrgent && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">
                        Charging session starts {timeUntilDeparture}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* QR Code Preview (BUS only) */}
            {qrCode && !isEvTrip && (
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
                  <motion.span
                    className={cn(
                      "text-2xl font-bold bg-clip-text text-transparent",
                      isEvTrip
                        ? "bg-gradient-to-r from-purple-600 to-purple-500"
                        : "bg-gradient-to-r from-orange-600 to-orange-500",
                    )}
                  >
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
                {/* QR Code Button with Preview (BUS only) */}
                {qrCode && !isEvTrip && (
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
                )}

                {/* View Ticket / View Details Button */}
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button
                        className={cn(
                          "rounded-full text-white px-6 gap-2 shadow-lg",
                          isEvTrip
                            ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-purple-200 dark:shadow-purple-900/30"
                            : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-200 dark:shadow-orange-900/30",
                        )}
                        disabled={isDisabled}
                      >
                        {isEvTrip ? <>View Details</> : <>View Ticket</>}
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
                Delete {isEvTrip ? "Reservation" : "Trip"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Are you sure you want to delete this{" "}
                {isEvTrip ? "EV charging reservation" : "trip"} from{" "}
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
