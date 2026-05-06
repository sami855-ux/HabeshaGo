"use client"

import { useState } from "react"
import { Trip, isBusTrip, isEvTrip } from "@/types/trips"
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
  Tag,
  Gift,
  Award,
  Navigation,
  Share2,
  Copy,
  CheckCheck,
  ExternalLink,
  MessageCircle,
  Send,
  Twitter,
  Facebook,
  Link2,
  X,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Bell,
  BellRing,
  FileText,
  Wallet,
  Star,
  StarHalf,
  ThumbsUp,
  HelpCircle,
  LifeBuoy,
  Wifi,
  Coffee,
  Zap,
  Luggage,
  Users,
  Wind,
  Thermometer,
  Tv,
  Battery,
  Map,
  Compass,
  UsersRound,
  Sparkles,
  Heart,
  TrendingUp,
  Clock3,
  Camera,
  Mic,
  Volume2,
  ThumbsDown,
  MessageSquare,
  Share as ShareIcon,
  Globe,
  MailPlus,
  QrCode as QrCodeIcon,
  Ban,
  RefreshCw,
  Timer,
  XCircle,
  Plug,
  BatteryCharging,
  Gauge,
  Timer as TimerIcon,
  Car,
} from "lucide-react"
import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAppSelector } from "@/store/store"

interface TicketSheetProps {
  trip: Trip
}

export default function TicketSheet({ trip }: TicketSheetProps) {
  const router = useRouter()
  const { user } = useAppSelector((store) => store.user)

  const [copied, setCopied] = useState(false)
  const [showQRDetails, setShowQRDetails] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [activeTab, setActiveTab] = useState("ticket")
  const [isSharing, setIsSharing] = useState(false)
  const [shareVia, setShareVia] = useState<
    "copy" | "whatsapp" | "email" | null
  >(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareMethod, setShareMethod] = useState<
    "link" | "qr" | "email" | "social"
  >("link")
  const [shareEmail, setShareEmail] = useState("")
  const [shareMessage, setShareMessage] = useState("")
  const [selectedSocial, setSelectedSocial] = useState<string | null>(null)

  // Rating states
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [ratingCategory, setRatingCategory] = useState<string>("")
  const [ratingComment, setRatingComment] = useState("")
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)

  // Check if it's an EV trip
  const isEv = isEvTrip(trip)
  const isBus = isBusTrip(trip)

  // Parse dates based on trip type
  const departureDate =
    isEv && trip.startTime
      ? new Date(trip.startTime)
      : new Date(trip.date || new Date())
  const now = new Date()
  const createdAt = new Date(trip.bookedAt || trip.createdAt || new Date())

  // Get ticket-specific data from first ticket (BUS only)
  const firstTicket = !isEv ? trip.tickets?.[0] : null

  // Check ticket status (BUS only)
  const isCheckedIn = firstTicket?.checkedIn || false
  const checkedInAt = firstTicket?.checkedInAt
    ? new Date(firstTicket.checkedInAt)
    : null
  const isCancelled = trip.status === "CANCELLED"
  const cancelledAt = trip.cancelledAt ? new Date(trip.cancelledAt) : null
  const isSharedTicketUsed = firstTicket?.sharedTicketUsed || false
  const sharedTo = firstTicket?.sharedTo || null

  // For EV trips, check if session is completed
  const isEvCompleted = isEv && trip.status === "COMPLETED"
  const isEvInProgress = isEv && trip.status === "IN_PROGRESS"

  // Get validUntil from first ticket if available (BUS only)
  const validUntil =
    !isEv && firstTicket?.validUntil
      ? new Date(firstTicket.validUntil)
      : isEv && trip.endTime
        ? new Date(trip.endTime)
        : new Date(departureDate.getTime() + 4 * 60 * 60 * 1000)

  // Check if ticket is expired
  const isExpired = isAfter(now, validUntil) && !isEv

  // Determine if ticket is usable
  const isTicketUsable = isEv
    ? !isEvCompleted && !isCancelled
    : !isExpired && !isCheckedIn && !isCancelled && !isSharedTicketUsed

  // Estimate arrival time (default 5 hours if not specified)
  const arrivalDate =
    isEv && trip.endTime
      ? new Date(trip.endTime)
      : (() => {
          const date = new Date(departureDate)
          const estimatedDuration = 300 // default 5 hours in minutes
          date.setMinutes(date.getMinutes() + estimatedDuration)
          return date
        })()

  const durationMs = arrivalDate.getTime() - departureDate.getTime()
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
  const durationMinutes = Math.floor(
    (durationMs % (1000 * 60 * 60)) / (1000 * 60),
  )

  // Get QR code (BUS only)
  const qrCode =
    !isEv && firstTicket?.qrCode
      ? firstTicket.qrCode
      : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${trip.bookingCode}`
  const qrData = `HABESHAGO:${trip.id}:${trip.bookingCode}:${departureDate.getTime()}`

  // Calculate fare breakdown
  const totalAmount = parseFloat(trip.totalAmount || "0")
  const amountPaid = parseFloat(trip.amountPaid || trip.payment?.amount || "0")
  const discount = parseFloat(trip.discount || "0")
  const pointsUsed = trip.pointsUsed || trip.payment?.pointsUsed || 0
  const pointsValue = parseFloat(
    trip.pointsValue || trip.payment?.pointsValue || "0",
  )
  const remainingBalance = totalAmount - amountPaid - pointsValue

  // Get locations
  const origin = isEv
    ? trip.origin || "Charging Station"
    : trip.origin || "Unknown"
  const destination = isEv ? "EV Charging" : trip.destination || "Unknown"
  const boardingStop = isEv
    ? "Plug-in at station"
    : firstTicket?.boardingStop || "Boarding point"
  const alightingStop = isEv
    ? "Disconnect after charging"
    : firstTicket?.alightingStop || "Drop-off point"

  // Get seat numbers (BUS only)
  const seatNumbers = !isEv
    ? trip.tickets?.map((t) => t.seatNumber).join(", ") || "N/A"
    : "N/A"
  const seatsBooked = !isEv ? trip.tickets?.length || 1 : 0

  // Check if any ticket is shared (BUS only)
  const isShared = (!isEv && trip.tickets?.some((t) => t.sharedAt)) || false
  const sharedTicket = !isEv ? trip.tickets?.find((t) => t.sharedAt) : null
  const sharedWith = sharedTicket?.sharedTo?.name
  const sharedAtDate = sharedTicket?.sharedAt
    ? new Date(sharedTicket.sharedAt)
    : null

  // Get EV specific details
  const evDetails = isEv
    ? {
        batteryPercentage: trip.targetBatteryPercentage,
        energyKwh: trip.targetKwh,
        connectorType: trip.chargingPoint?.connectorType || "CCS2",
        powerKw: trip.chargingPoint?.powerKw || 50,
        chargingPointName: trip.chargingPoint?.name || trip.origin,
        vehicleModel: trip.vehicle?.manufacturer + " " + trip.vehicle?.model,
        vehiclePlate: trip.vehicle?.plateNumber,
      }
    : null

  // Get bus amenities (if available)
  const amenities: string[] = [] // Add amenities to your Trip type if needed
  const amenityConfig: Record<string, { icon: any; label: string }> = {
    wifi: { icon: Wifi, label: "Free WiFi" },
    ac: { icon: Wind, label: "Air Conditioning" },
    food: { icon: Coffee, label: "Refreshments" },
    luggage: { icon: Luggage, label: "Luggage Space" },
    tv: { icon: Tv, label: "Entertainment" },
    charger: { icon: Battery, label: "USB Charging" },
    toilet: { icon: Users, label: "Restroom" },
    reclining: { icon: Thermometer, label: "Reclining Seats" },
  }

  // Mock ratings data
  const averageRating = 4.5
  const totalRatings = 128
  const ratingDistribution = {
    5: 78,
    4: 32,
    3: 12,
    2: 4,
    1: 2,
  }

  const ratingCategories = [
    { id: "punctuality", label: "Punctuality", icon: Clock3 },
    { id: "comfort", label: "Comfort", icon: Coffee },
    { id: "cleanliness", label: "Cleanliness", icon: Sparkles },
    { id: "driver", label: "Driver Behavior", icon: User },
    { id: "value", label: "Value for Money", icon: TrendingUp },
    { id: "amenities", label: "Amenities", icon: Wifi },
  ]

  // Get ticket status badge
  const getTicketStatusBadge = () => {
    if (isEv) {
      if (isCancelled) {
        return {
          label: "Cancelled",
          icon: XCircle,
          color: "bg-red-500 text-white",
          description: "This charging session has been cancelled",
        }
      }
      if (isEvCompleted) {
        return {
          label: "Completed",
          icon: CheckCheck,
          color: "bg-green-500 text-white",
          description: "Charging session completed",
        }
      }
      if (isEvInProgress) {
        return {
          label: "In Progress",
          icon: Zap,
          color: "bg-blue-500 text-white",
          description: "Charging session in progress",
        }
      }
      return {
        label: "Upcoming",
        icon: Clock,
        color: "bg-purple-500 text-white",
        description: "Charging session scheduled",
      }
    }

    // BUS statuses
    if (isCancelled) {
      return {
        label: "Cancelled",
        icon: XCircle,
        color: "bg-red-500 text-white",
        description: cancelledAt
          ? `Cancelled on ${format(cancelledAt, "MMM d, yyyy")}`
          : "This ticket has been cancelled",
      }
    }
    if (isExpired) {
      return {
        label: "Expired",
        icon: Timer,
        color: "bg-gray-500 text-white",
        description: `Expired on ${format(validUntil, "MMM d, yyyy")}`,
      }
    }
    if (isCheckedIn) {
      return {
        label: "Used",
        icon: CheckCheck,
        color: "bg-blue-500 text-white",
        description: checkedInAt
          ? `Checked in on ${format(checkedInAt, "MMM d, yyyy 'at' h:mm a")}`
          : "This ticket has been used",
      }
    }
    if (isSharedTicketUsed) {
      return {
        label: "Shared & Used",
        icon: UsersRound,
        color: "bg-purple-500 text-white",
        description: sharedTo
          ? `Used by ${sharedTo.name}`
          : "This shared ticket has been used",
      }
    }
    if (isShared) {
      return {
        label: "Shared",
        icon: Share2,
        color: "bg-orange-500 text-white",
        description: sharedWith
          ? `Shared with ${sharedWith}`
          : "This ticket has been shared",
      }
    }
    return null
  }

  const ticketStatus = getTicketStatusBadge()

  // Handle copy booking code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(trip.bookingCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle share via various methods
  const handleShare = async (
    method: "copy" | "whatsapp" | "email" | "sms" | "more",
  ) => {
    setIsSharing(true)
    setShareVia(method)

    const shareText = isEv
      ? `🔋 HabeshaGo EV Charging Reservation\n\nStation: ${origin}\nVehicle: ${evDetails?.vehicleModel || "EV"}\nDate: ${format(departureDate, "MMM d, yyyy")}\nTime: ${format(departureDate, "h:mm a")}\nReservation Code: ${trip.bookingCode}\nEnergy: ${evDetails?.energyKwh || "N/A"} kWh\n\nView details: https://habeshago.com/ev/${trip.bookingCode}`
      : `🚌 HabeshaGo Bus Ticket\n\nFrom: ${origin}\nTo: ${destination}\nDate: ${format(departureDate, "MMM d, yyyy")}\nTime: ${format(departureDate, "h:mm a")}\nSeats: ${seatNumbers}\nBooking Code: ${trip.bookingCode}\n\nView ticket: https://habeshago.com/ticket/${trip.bookingCode}`

    try {
      switch (method) {
        case "copy":
          await navigator.clipboard.writeText(shareText)
          break
        case "whatsapp":
          window.open(
            `https://wa.me/?text=${encodeURIComponent(shareText)}`,
            "_blank",
          )
          break
        case "email":
          window.open(
            `mailto:?subject=My HabeshaGo ${isEv ? "EV Reservation" : "Ticket"}&body=${encodeURIComponent(shareText)}`,
            "_blank",
          )
          break
        case "sms":
          window.open(`sms:?body=${encodeURIComponent(shareText)}`, "_blank")
          break
        case "more":
          if (navigator.share) {
            await navigator.share({
              title: isEv ? "HabeshaGo EV Reservation" : "HabeshaGo Ticket",
              text: shareText,
              url: `https://habeshago.com/${isEv ? "ev" : "ticket"}/${trip.bookingCode}`,
            })
          } else {
            handleCopyCode()
          }
          break
      }
    } catch (error) {
      console.error("Share failed:", error)
    } finally {
      setIsSharing(false)
      setShareVia(null)
    }
  }

  // Handle dedicated share with friends
  const handleShareWithFriends = () => {
    if (!isTicketUsable) {
      alert(
        "This reservation cannot be shared as it is expired, used, or cancelled",
      )
      return
    }
    setShareDialogOpen(true)
  }

  // Handle send share
  const handleSendShare = () => {
    setIsSharing(true)

    setTimeout(() => {
      setIsSharing(false)
      setShareDialogOpen(false)
      setShareEmail("")
      setShareMessage("")
      setSelectedSocial(null)
      alert(
        isEv
          ? "Reservation shared successfully!"
          : "Ticket shared successfully!",
      )
    }, 1500)
  }

  // Handle rating submission
  const handleSubmitRating = () => {
    if (userRating === 0) {
      alert("Please select a rating")
      return
    }

    setIsSubmittingRating(true)

    setTimeout(() => {
      setIsSubmittingRating(false)
      setRatingDialogOpen(false)
      setUserRating(0)
      setRatingCategory("")
      setRatingComment("")
      alert("Thank you for your rating!")
    }, 1500)
  }

  // Handle download ticket
  const handleDownload = () => {
    // Implement actual download logic here
  }

  // Check if ticket is expiring soon (BUS only)
  const hoursUntilExpiry = !isEv
    ? Math.floor((validUntil.getTime() - Date.now()) / (1000 * 60 * 60))
    : 0
  const isExpiringSoon =
    !isEv &&
    hoursUntilExpiry > 0 &&
    hoursUntilExpiry < 24 &&
    !isExpired &&
    !isCheckedIn &&
    !isCancelled

  // Calculate seat occupancy (if bus data available)
  const totalSeats = trip.bus?.capacity || 50
  const occupancyPercentage = (seatsBooked / totalSeats) * 100

  // Get status color
  const getStatusColor = () => {
    if (!isTicketUsable) return "text-gray-600 bg-gray-100"
    if (isEv && isEvInProgress) return "text-blue-600 bg-blue-100"
    if (isCheckedIn) return "text-green-600 bg-green-100"
    if (isExpiringSoon) return "text-orange-600 bg-orange-100"
    return isEv ? "text-purple-600 bg-purple-100" : "text-blue-600 bg-blue-100"
  }

  // Get passenger name
  const passengerName = user?.name || "John Doe"

  // Get gradient based on trip type
  const gradientClass = isEv
    ? "bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600"
    : "bg-gradient-to-r from-orange-600 via-orange-600 to-amber-600"

  const iconGradientClass = isEv
    ? "from-purple-500 to-indigo-500"
    : "from-orange-500 to-amber-500"

  // Render star rating
  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setUserRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={cn(
              "transition-all duration-150",
              interactive && "cursor-pointer hover:scale-110",
            )}
            disabled={!interactive}
          >
            <Star
              className={cn(
                "h-5 w-5",
                (
                  interactive
                    ? (hoverRating || userRating) >= star
                    : rating >= star
                )
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 dark:text-gray-600",
                interactive && "hover:fill-yellow-400 hover:text-yellow-400",
              )}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="h-full">
          {/* Sticky Header with Actions */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn(
              "sticky top-0 z-50 p-4 shadow-lg",
              !isTicketUsable
                ? "bg-gradient-to-r from-gray-600 to-gray-500"
                : gradientClass,
            )}
          >
            <SheetHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"
                  >
                    {isEv ? (
                      <Smartphone className="h-6 w-6 text-white" />
                    ) : (
                      <TicketIcon className="h-6 w-6 text-white" />
                    )}
                  </motion.div>
                  <div>
                    <SheetTitle className="text-xl font-bold text-white flex items-center gap-2">
                      {isEv ? "HabeshaGo EV Reservation" : "HabeshaGo E-Ticket"}
                      {ticketStatus && (
                        <Badge className={cn("border-0", ticketStatus.color)}>
                          <ticketStatus.icon className="h-3 w-3 mr-1" />
                          {ticketStatus.label}
                        </Badge>
                      )}
                    </SheetTitle>
                    <div className="flex items-center gap-2 text-amber-100 text-sm">
                      <ShieldCheck className="h-3 w-3" />
                      <span>
                        {isEv ? "Reservation" : "Booking"} #
                        {trip.bookingCode.slice(0, 8).toUpperCase()}
                      </span>

                      {/* Status Badge */}
                      <Badge
                        className={cn(
                          "ml-2 border-0 px-3 py-1",
                          trip.status === "CONFIRMED"
                            ? "bg-emerald-500 text-white"
                            : trip.status === "COMPLETED"
                              ? "bg-blue-500 text-white"
                              : "bg-red-500 text-white",
                        )}
                      >
                        {trip.status.charAt(0)}
                        {trip.status.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Share Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-white/10 hover:bg-white/20 text-white h-9 w-9"
                        disabled={isSharing || !isTicketUsable}
                      >
                        {isSharing ? (
                          <Share2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Share2 className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-64 rounded-xl"
                    >
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleShare("copy")}
                        className="gap-3 cursor-pointer"
                        disabled={!isTicketUsable}
                      >
                        <Copy className="h-4 w-4" /> Copy to Clipboard
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleShare("whatsapp")}
                        className="gap-3 cursor-pointer"
                        disabled={!isTicketUsable}
                      >
                        <MessageCircle className="h-4 w-4 text-green-600" />{" "}
                        WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleShare("email")}
                        className="gap-3 cursor-pointer"
                        disabled={!isTicketUsable}
                      >
                        <Mail className="h-4 w-4 text-blue-600" /> Email
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleShare("sms")}
                        className="gap-3 cursor-pointer"
                        disabled={!isTicketUsable}
                      >
                        <Send className="h-4 w-4 text-purple-600" /> SMS
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Download Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDownload}
                        className="rounded-full bg-white/10 hover:bg-white/20 text-white h-9 w-9"
                        disabled={!isTicketUsable}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Download {isEv ? "Reservation" : "Ticket"}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Share with Friends Button */}
                  {isEv ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          onClick={() =>
                            router.push(`/user/ev-charging/start-charging/${trip.id}`)
                          }
                          className="rounded-xl"
                          disabled={!isTicketUsable}
                        >
                          I am here, Start Charging
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Start Charging</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          onClick={() =>
                            router.push(`/user/booking/share/${trip.id}`)
                          }
                          className="rounded-xl"
                          disabled={!isTicketUsable}
                        >
                          <UsersRound className="h-4 w-4 text-white cursor-pointer" />{" "}
                          Share with Friends
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Share with Friends</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </SheetHeader>

            {/* Status Message for Unusable Tickets */}
            {!isTicketUsable && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-white/20 rounded-xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 text-white">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">
                    {isCancelled &&
                      `This ${isEv ? "reservation" : "ticket"} has been cancelled.`}
                    {isExpired &&
                      "This ticket has expired and is no longer valid."}
                    {isCheckedIn && "This ticket has already been used."}
                    {isSharedTicketUsed &&
                      "This shared ticket has already been used."}
                    {isEvCompleted &&
                      "This charging session has been completed."}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Main Content with Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
            <TabsList className="grid grid-cols-5 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <TabsTrigger value="ticket" className="rounded-lg">
                {isEv ? (
                  <Smartphone className="h-4 w-4 mr-2" />
                ) : (
                  <TicketIcon className="h-4 w-4 mr-2" />
                )}
                {isEv ? "Reservation" : "Ticket"}
              </TabsTrigger>
              <TabsTrigger value="journey" className="rounded-lg">
                <Map className="h-4 w-4 mr-2" />
                {isEv ? "Session" : "Journey"}
              </TabsTrigger>
              <TabsTrigger value="payment" className="rounded-lg">
                <Wallet className="h-4 w-4 mr-2" />
                Payment
              </TabsTrigger>
              <TabsTrigger value="rating" className="rounded-lg">
                <Star className="h-4 w-4 mr-2" />
                Ratings
              </TabsTrigger>
              <TabsTrigger value="support" className="rounded-lg">
                <LifeBuoy className="h-4 w-4 mr-2" />
                Support
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ticket" className="space-y-4 mt-0">
              {/* QR Code / EV Details Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border",
                  !isTicketUsable
                    ? "border-gray-300 dark:border-gray-700 opacity-75"
                    : "border-gray-200 dark:border-gray-800 hover:shadow-md",
                )}
              >
                {isEv ? (
                  // EV Reservation Details
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950/50 dark:to-indigo-950/50 flex items-center justify-center"
                        >
                          <BatteryCharging className="h-16 w-16 text-purple-500" />
                        </motion.div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                          {origin}
                        </h3>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Zap className="h-4 w-4 text-purple-500" />
                            <span>
                              {evDetails?.energyKwh} kWh •{" "}
                              {evDetails?.batteryPercentage}% target
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Plug className="h-4 w-4 text-purple-500" />
                            <span>
                              {evDetails?.connectorType} • {evDetails?.powerKw}{" "}
                              kW
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Car className="h-4 w-4 text-purple-500" />
                            <span>
                              {evDetails?.vehicleModel} •{" "}
                              {evDetails?.vehiclePlate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // BUS QR Code Section
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <motion.div
                        whileHover={isTicketUsable ? { scale: 1.02 } : {}}
                        className="relative"
                      >
                        <img
                          src={qrCode}
                          alt="Ticket QR Code"
                          className={cn(
                            "w-48 h-48 object-contain border-2 rounded-xl p-2 bg-white",
                            !isTicketUsable
                              ? "border-gray-300 dark:border-gray-700 grayscale"
                              : "border-gray-200 dark:border-gray-700",
                          )}
                        />
                        {isTicketUsable && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowQRDetails(!showQRDetails)}
                            className="absolute -top-2 -right-2 p-1.5 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-colors"
                          >
                            {showQRDetails ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </motion.button>
                        )}
                      </motion.div>

                      <AnimatePresence>
                        {showQRDetails && isTicketUsable && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs overflow-hidden"
                          >
                            <p className="font-mono text-gray-600 dark:text-gray-400 break-all">
                              {qrData}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyCode}
                          className="flex-1 gap-1 text-xs hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all"
                          disabled={!isTicketUsable}
                        >
                          {copied ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          {copied ? "Copied!" : "Copy Code"}
                        </Button>
                      </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          {origin} → {destination}
                        </h3>
                        <Badge className={cn("border-0", getStatusColor())}>
                          {!isTicketUsable && "Inactive"}
                          {isTicketUsable && isCheckedIn && "Checked In"}
                          {isTicketUsable &&
                            !isCheckedIn &&
                            isExpiringSoon &&
                            "Expiring Soon"}
                          {isTicketUsable &&
                            !isCheckedIn &&
                            !isExpiringSoon &&
                            "Active"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">
                            Passenger
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1 capitalize">
                            <User className="h-3 w-3 text-gray-400" />
                            {passengerName}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">Seats</p>
                          <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            <Users className="h-3 w-3 text-gray-400" />
                            {seatNumbers}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">
                            Booking Date
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {format(createdAt, "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">
                            Valid Until
                          </p>
                          <p
                            className={cn(
                              "font-semibold flex items-center gap-1",
                              isExpiringSoon && isTicketUsable
                                ? "text-orange-600"
                                : "text-gray-900 dark:text-white",
                            )}
                          >
                            <Clock className="h-3 w-3 text-gray-400" />
                            {format(validUntil, "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Timeline / Session Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className={cn(
                  "bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border",
                  !isTicketUsable
                    ? "border-gray-300 dark:border-gray-700 opacity-75"
                    : "border-gray-200 dark:border-gray-800 hover:shadow-md",
                )}
              >
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  {isEv ? (
                    <BatteryCharging className="h-4 w-4 text-purple-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-orange-500" />
                  )}
                  {isEv ? "Charging Session Timeline" : "Journey Timeline"}
                </h3>
                <div className="relative">
                  <div
                    className={cn(
                      "absolute left-4 top-0 bottom-0 w-0.5",
                      isEv
                        ? "bg-gradient-to-b from-purple-400 to-indigo-400"
                        : "bg-gradient-to-b from-orange-400 to-amber-400",
                    )}
                  />

                  <div className="space-y-6">
                    {/* Start / Boarding */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="relative pl-10"
                    >
                      <div
                        className={cn(
                          "absolute left-2.5 top-1 w-3 h-3 rounded-full ring-4",
                          isEv
                            ? "bg-purple-500 ring-purple-100 dark:ring-purple-900/30"
                            : "bg-orange-500 ring-orange-100 dark:ring-orange-900/30",
                        )}
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {isEv
                            ? "Charging Starts"
                            : `Boarding at ${boardingStop}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(departureDate, "EEEE, MMMM d, yyyy")}
                        </p>
                        <p className="text-sm font-medium text-gray-600 mt-1">
                          {format(departureDate, "h:mm a")}
                        </p>
                      </div>
                    </motion.div>

                    {/* In Progress / Journey */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="relative pl-10"
                    >
                      <div
                        className={cn(
                          "absolute left-2.5 top-1 w-3 h-3 rounded-full",
                          isCheckedIn || (isEv && isEvCompleted)
                            ? "bg-green-500"
                            : isCancelled
                              ? "bg-red-500"
                              : isExpired
                                ? "bg-gray-500"
                                : isEv
                                  ? "bg-purple-400"
                                  : "bg-amber-400",
                        )}
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {isCheckedIn
                            ? isEv
                              ? "Charging Completed"
                              : "Journey Completed"
                            : isCancelled
                              ? isEv
                                ? "Charging Cancelled"
                                : "Journey Cancelled"
                              : isExpired
                                ? "Ticket Expired"
                                : isEv
                                  ? "Charging in Progress"
                                  : "En Route"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isEv
                            ? `Estimated charging time: ${durationHours}h ${durationMinutes}m`
                            : `Estimated travel time: ${durationHours}h ${durationMinutes}m`}
                        </p>
                        {isTicketUsable &&
                          !isCheckedIn &&
                          !isCancelled &&
                          !isExpired && (
                            <div className="flex items-center gap-2 mt-2">
                              <Progress
                                value={45}
                                className={cn(
                                  "h-1.5 w-32",
                                  isEv ? "bg-purple-100" : "bg-orange-100",
                                )}
                              />
                              <span className="text-xs text-gray-500">
                                In progress
                              </span>
                            </div>
                          )}
                      </div>
                    </motion.div>

                    {/* End / Alighting */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="relative pl-10"
                    >
                      <div
                        className={cn(
                          "absolute left-2.5 top-1 w-3 h-3 rounded-full",
                          isCheckedIn || (isEv && isEvCompleted)
                            ? "bg-green-500"
                            : "bg-gray-300",
                        )}
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {isEv
                            ? "Disconnect Vehicle"
                            : `Alight at ${alightingStop}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(arrivalDate, "EEEE, MMMM d, yyyy")}
                        </p>
                        <p
                          className={cn(
                            "text-sm font-medium mt-1",
                            isCheckedIn || (isEv && isEvCompleted)
                              ? "text-green-600"
                              : "text-amber-600",
                          )}
                        >
                          {format(arrivalDate, "h:mm a")}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Vehicle/Bus Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className={cn(
                  "bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border",
                  !isTicketUsable
                    ? "border-gray-300 dark:border-gray-700 opacity-75"
                    : "border-gray-200 dark:border-gray-800 hover:shadow-md",
                )}
              >
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  {isEv ? (
                    <Car className="h-4 w-4 text-purple-500" />
                  ) : (
                    <Bus className="h-4 w-4 text-orange-500" />
                  )}
                  {isEv ? "Vehicle Information" : "Bus Information"}
                </h3>

                {isEv ? (
                  // EV Vehicle Details
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-xs text-gray-500">Vehicle</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {evDetails?.vehicleModel || "Electric Vehicle"}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-xs text-gray-500">Plate Number</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {evDetails?.vehiclePlate || "N/A"}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-xs text-gray-500">Battery Capacity</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {trip.vehicle?.capacity || "N/A"} kWh
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-xs text-gray-500">Connector Type</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {evDetails?.connectorType}
                      </p>
                    </div>
                  </div>
                ) : (
                  // BUS Details
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <p className="text-xs text-gray-500">Bus Number</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {trip.bus?.busNumber || "N/A"}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <p className="text-xs text-gray-500">Capacity</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {trip.bus?.capacity || "N/A"} seats
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <p className="text-xs text-gray-500">Available Seats</p>
                        <p className="font-semibold text-green-600">
                          {trip.bus?.capacity
                            ? trip.bus.capacity - seatsBooked
                            : "N/A"}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <p className="text-xs text-gray-500">Occupancy</p>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={occupancyPercentage}
                            className="h-2 w-16"
                          />
                          <span className="text-xs font-semibold">
                            {Math.round(occupancyPercentage)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Driver Info if available */}
                    {trip.bus?.driver && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 ring-2 ring-orange-200 dark:ring-orange-900">
                            <AvatarFallback className="bg-orange-100 text-orange-600">
                              {trip.bus.driver.name?.charAt(0) || "D"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold flex items-center gap-2">
                              {trip.bus.driver.name}
                              <Badge
                                variant="outline"
                                className="text-xs border-green-200 text-green-600"
                              >
                                {trip.bus.driver.experience} years exp
                              </Badge>
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {trip.bus.driver.phone}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="journey" className="space-y-4 mt-0">
              {/* Route / Session Visualization */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border",
                  !isTicketUsable
                    ? "border-gray-300 dark:border-gray-700 opacity-75"
                    : "border-gray-200 dark:border-gray-800 hover:shadow-md",
                )}
              >
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Map className="h-4 w-4 text-orange-500" />
                  {isEv ? "Charging Session Map" : "Route Map"}
                </h3>

                <div className="relative h-48 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 rounded-xl mb-6 overflow-hidden group">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={
                        isTicketUsable
                          ? { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }
                          : {}
                      }
                      transition={{ duration: 5, repeat: Infinity }}
                      className="text-center"
                    >
                      <Compass
                        className={cn(
                          "h-12 w-12 mx-auto mb-2",
                          isTicketUsable
                            ? isEv
                              ? "text-purple-300"
                              : "text-orange-300"
                            : "text-gray-400",
                        )}
                      />
                      <p className="text-sm text-gray-500">
                        Interactive map coming soon
                      </p>
                    </motion.div>
                  </div>

                  <svg
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="none"
                  >
                    <motion.line
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 2, delay: 0.5 }}
                      x1="20%"
                      y1="30%"
                      x2="80%"
                      y2="70%"
                      stroke={
                        isTicketUsable
                          ? isEv
                            ? "#9333ea"
                            : "#f97316"
                          : "#9ca3af"
                      }
                      strokeWidth="3"
                      strokeDasharray="5,5"
                    />
                    <motion.circle
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.5 }}
                      cx="20%"
                      cy="30%"
                      r="6"
                      fill={
                        isTicketUsable
                          ? isEv
                            ? "#9333ea"
                            : "#f97316"
                          : "#9ca3af"
                      }
                    />
                    <motion.circle
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 2 }}
                      cx="80%"
                      cy="70%"
                      r="6"
                      fill={
                        isTicketUsable
                          ? isEv
                            ? "#a855f7"
                            : "#fbbf24"
                          : "#d1d5db"
                      }
                    />
                  </svg>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={isTicketUsable ? { scale: 1.02 } : {}}
                    className={cn(
                      "p-4 rounded-xl border",
                      isTicketUsable
                        ? isEv
                          ? "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800"
                          : "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs mb-1",
                        isTicketUsable
                          ? isEv
                            ? "text-purple-600"
                            : "text-orange-600"
                          : "text-gray-500",
                      )}
                    >
                      {isEv ? "Charging Station" : "Departure"}
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {origin}
                    </p>
                    <p className="text-sm text-gray-600">{boardingStop}</p>
                  </motion.div>
                  <motion.div
                    whileHover={isTicketUsable ? { scale: 1.02 } : {}}
                    className={cn(
                      "p-4 rounded-xl border",
                      isTicketUsable
                        ? isEv
                          ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800"
                          : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs mb-1",
                        isTicketUsable
                          ? isEv
                            ? "text-indigo-600"
                            : "text-amber-600"
                          : "text-gray-500",
                      )}
                    >
                      {isEv ? "Vehicle Destination" : "Arrival"}
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {destination}
                    </p>
                    <p className="text-sm text-gray-600">{alightingStop}</p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Session Stats for EV */}
              {isEv && evDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800"
                >
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-purple-500" />
                    Charging Session Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                      <p className="text-xs text-gray-500">Energy Delivered</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {evDetails.energyKwh} kWh
                      </p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                      <p className="text-xs text-gray-500">Target Battery</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {evDetails.batteryPercentage}%
                      </p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                      <p className="text-xs text-gray-500">Charging Speed</p>
                      <p className="text-lg font-bold text-purple-600">
                        {evDetails.powerKw} kW
                      </p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                      <p className="text-xs text-gray-500">Connector Type</p>
                      <p className="text-lg font-bold text-purple-600">
                        {evDetails.connectorType}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Weather & Conditions (BUS only) */}
              {!isEv && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={cn(
                    "bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border",
                    !isTicketUsable
                      ? "border-gray-300 dark:border-gray-700 opacity-75"
                      : "border-gray-200 dark:border-gray-800 hover:shadow-md",
                  )}
                >
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    Travel Conditions
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={cn(
                        "text-center p-4 rounded-xl border",
                        isTicketUsable
                          ? "bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 border-blue-200 dark:border-blue-800"
                          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                      )}
                    >
                      <p className="text-xs text-gray-500 mb-2">Weather</p>
                      <motion.div
                        animate={isTicketUsable ? { y: [0, -5, 0] } : {}}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <p className="text-3xl mb-1">☀️</p>
                      </motion.div>
                      <p className="font-semibold">Sunny</p>
                      <p className="text-xs text-gray-500">25°C / 77°F</p>
                    </div>
                    <div
                      className={cn(
                        "text-center p-4 rounded-xl border",
                        isTicketUsable
                          ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800"
                          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                      )}
                    >
                      <p className="text-xs text-gray-500 mb-2">
                        Road Conditions
                      </p>
                      <motion.div
                        animate={
                          isTicketUsable ? { rotate: [0, 5, -5, 0] } : {}
                        }
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <p className="text-3xl mb-1">🛣️</p>
                      </motion.div>
                      <p className="font-semibold">Good</p>
                      <p className="text-xs text-gray-500">
                        No delays reported
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="payment" className="space-y-4 mt-0">
              {/* Payment Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border",
                  !isTicketUsable
                    ? "border-gray-300 dark:border-gray-700 opacity-75"
                    : "border-gray-200 dark:border-gray-800 hover:shadow-md",
                )}
              >
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-orange-500" />
                  Payment Details
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">
                      {isEv ? "Charging Fee" : "Base Fare"}
                    </span>
                    <span className="font-medium">
                      {trip.currency} {totalAmount.toLocaleString()}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between py-2 px-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <span className="flex items-center gap-1 text-green-600">
                        <Tag className="h-4 w-4" />
                        Discount ({discount}%)
                      </span>
                      <span className="text-green-600">
                        -{trip.currency}{" "}
                        {(totalAmount - amountPaid).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {pointsUsed > 0 && (
                    <div className="flex justify-between py-2 px-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                      <span className="flex items-center gap-1 text-purple-600">
                        <Award className="h-4 w-4" />
                        Points Used ({pointsUsed})
                      </span>
                      <span className="text-purple-600">
                        -{trip.currency} {pointsValue.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <Separator className="my-2" />

                  <div className="flex justify-between py-2 px-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg font-bold">
                    <span>Total Paid</span>
                    <span className="text-orange-600">
                      {trip.currency} {amountPaid.toLocaleString()}
                    </span>
                  </div>

                  {remainingBalance > 0 && (
                    <div className="flex justify-between py-2 px-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                      <span>Remaining Balance</span>
                      <span className="text-amber-600">
                        {trip.currency} {remainingBalance.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        Payment confirmed via{" "}
                        {trip.payment?.method ||
                          trip.payments?.[0]?.method ||
                          "Wallet"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 font-mono">
                      Transaction ID:{" "}
                      {trip.payment?.reference ||
                        trip.paymentId ||
                        trip.payments?.[0]?.reference}
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Invoice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={cn(
                  "bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border",
                  !isTicketUsable
                    ? "border-gray-300 dark:border-gray-700 opacity-75"
                    : "border-gray-200 dark:border-gray-800 hover:shadow-md",
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-500" />
                    Invoice
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all"
                    disabled={!isTicketUsable}
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500">Invoice Number</p>
                      <p className="font-mono font-medium">
                        INV-{trip.id}-{trip.bookingCode.slice(0, 6)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium">
                        {format(createdAt, "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="rating" className="space-y-4 mt-0">
              {/* Rating Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    Ratings & Reviews
                  </h3>
                  <Button
                    onClick={() => setRatingDialogOpen(true)}
                    className={cn(
                      "text-white rounded-xl gap-2",
                      isEv
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                        : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
                    )}
                    disabled={!isTicketUsable}
                  >
                    <Star className="h-4 w-4" />
                    Rate this {isEv ? "Session" : "Trip"}
                  </Button>
                </div>

                <div className="flex items-start gap-8">
                  {/* Average Rating */}
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 dark:text-white">
                      {averageRating}
                    </div>
                    <div className="flex items-center justify-center mt-2">
                      {renderStars(averageRating)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {totalRatings} {totalRatings === 1 ? "review" : "reviews"}
                    </p>
                  </div>

                  {/* Rating Distribution */}
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-8">
                          {stars} ★
                        </span>
                        <Progress
                          value={
                            (ratingDistribution[
                              stars as keyof typeof ratingDistribution
                            ] /
                              totalRatings) *
                            100
                          }
                          className="h-2 flex-1"
                        />
                        <span className="text-sm text-gray-600 w-12">
                          {
                            ratingDistribution[
                              stars as keyof typeof ratingDistribution
                            ]
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Recent Reviews
                  </h4>
                  {[1, 2, 3].map((review) => (
                    <motion.div
                      key={review}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: review * 0.1 }}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback
                              className={
                                isEv
                                  ? "bg-purple-100 text-purple-600"
                                  : "bg-orange-100 text-orange-600"
                              }
                            >
                              U{review}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">
                              User {review}
                            </p>
                            <div className="flex items-center gap-1">
                              {renderStars(5)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          2 days ago
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isEv
                          ? "Great charging experience! Fast and convenient location. Will definitely use again."
                          : "Great experience! The bus was comfortable and on time. Will definitely use again."}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="support" className="space-y-4 mt-0">
              {/* Support Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <LifeBuoy className="h-4 w-4 text-orange-500" />
                  24/7 Customer Support
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      icon: Phone,
                      label: "Call Us",
                      value: "+251 900 123 456",
                      color: "orange",
                      bg: "orange",
                    },
                    {
                      icon: Mail,
                      label: "Email",
                      value: "support@habeshago.com",
                      color: "blue",
                      bg: "blue",
                    },
                    {
                      icon: MessageCircle,
                      label: "WhatsApp",
                      value: "+251 900 123 456",
                      color: "green",
                      bg: "green",
                    },
                    {
                      icon: MessageSquare,
                      label: "Live Chat",
                      value: "Average response: 2min",
                      color: "purple",
                      bg: "purple",
                    },
                  ].map((item, index) => {
                    const Icon = item.icon
                    return (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                          "p-4 rounded-xl cursor-pointer transition-all",
                          `bg-${item.bg}-50 hover:bg-${item.bg}-100 dark:bg-${item.bg}-950/30 dark:hover:bg-${item.bg}-950/50`,
                          `border border-${item.color}-200 dark:border-${item.color}-800`,
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              `p-2 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-lg`,
                            )}
                          >
                            <Icon
                              className={cn(`h-5 w-5 text-${item.color}-600`)}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {item.label}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.value}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* FAQ Section */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-orange-500" />
                    Frequently Asked Questions
                  </h4>
                  <div className="space-y-2">
                    {[
                      isEv
                        ? "How do I start my charging session?"
                        : "How do I change my boarding point?",
                      isEv
                        ? "What happens if the charger is occupied?"
                        : "What items are allowed on board?",
                      isEv
                        ? "Can I cancel my charging reservation?"
                        : "Can I cancel my ticket?",
                      isEv
                        ? "How do I contact station support?"
                        : "How do I contact the driver?",
                      isEv
                        ? "What if my charging session is interrupted?"
                        : "What happens if the bus is delayed?",
                    ].map((question, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ x: 5 }}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {question}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Notification Preferences */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          isEv
                            ? "bg-purple-100 dark:bg-purple-900/30"
                            : "bg-orange-100 dark:bg-orange-900/30",
                        )}
                      >
                        <Bell
                          className={cn(
                            "h-5 w-5",
                            isEv ? "text-purple-600" : "text-orange-600",
                          )}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {isEv
                            ? "Session Notifications"
                            : "Journey Notifications"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Get real-time updates about your{" "}
                          {isEv ? "charging session" : "trip"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                      className={
                        isEv
                          ? "data-[state=checked]:bg-purple-500"
                          : "data-[state=checked]:bg-orange-500"
                      }
                      disabled={!isTicketUsable}
                    />
                  </div>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Secure
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Encrypted
                </span>
              </div>
              <p>HabeshaGo © 2024</p>
            </div>
          </div>
        </div>
      </SheetContent>

      {/* Share with Friends Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <UsersRound className="h-5 w-5 text-orange-500" />
              Share with Friends
            </DialogTitle>
            <DialogDescription>
              Share your {isEv ? "reservation" : "ticket"} details with friends
              and family
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <RadioGroup
              value={shareMethod}
              onValueChange={(value) => setShareMethod(value as any)}
              className="grid grid-cols-4 gap-2"
            >
              {[
                { value: "link", icon: Link2, label: "Link" },
                { value: "qr", icon: QrCodeIcon, label: "QR Code" },
                { value: "email", icon: MailPlus, label: "Email" },
                { value: "social", icon: Globe, label: "Social" },
              ].map((method) => (
                <div key={method.value}>
                  <RadioGroupItem
                    value={method.value}
                    id={method.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={method.value}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50 dark:peer-data-[state=checked]:bg-orange-950/30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    <method.icon className="h-5 w-5" />
                    <span className="text-xs">{method.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <AnimatePresence mode="wait">
              {shareMethod === "link" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <code className="flex-1 text-sm font-mono">
                      https://habeshago.com/{isEv ? "ev" : "ticket"}/
                      {trip.bookingCode}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `https://habeshago.com/${isEv ? "ev" : "ticket"}/${trip.bookingCode}`,
                        )
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      className="shrink-0"
                    >
                      {copied ? (
                        <CheckCheck className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {shareMethod === "qr" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-3"
                >
                  <img
                    src={qrCode}
                    alt="Share QR Code"
                    className="w-48 h-48 object-contain border-2 border-gray-200 dark:border-gray-700 rounded-xl p-2"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(qrCode, "_blank")}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download QR Code
                  </Button>
                </motion.div>
              )}

              {shareMethod === "email" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div>
                    <Label htmlFor="email">Recipient Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="friend@example.com"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Add a personal message..."
                      value={shareMessage}
                      onChange={(e) => setShareMessage(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </motion.div>
              )}

              {shareMethod === "social" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-gray-500">Share via:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "whatsapp", icon: MessageCircle, color: "green" },
                      { id: "facebook", icon: Facebook, color: "blue" },
                      { id: "twitter", icon: Twitter, color: "sky" },
                      { id: "telegram", icon: Send, color: "blue" },
                    ].map((social) => (
                      <motion.button
                        key={social.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedSocial(social.id)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all",
                          selectedSocial === social.id
                            ? `border-${social.color}-500 bg-${social.color}-50 dark:bg-${social.color}-950/30`
                            : "border-gray-200 hover:border-gray-300",
                        )}
                      >
                        <social.icon
                          className={cn(
                            "h-5 w-5 mx-auto",
                            `text-${social.color}-600`,
                          )}
                        />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendShare}
              disabled={isSharing || (shareMethod === "email" && !shareEmail)}
              className={cn(
                "gap-2",
                isEv
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                  : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
              )}
            >
              {isSharing ? (
                <>
                  <Share2 className="h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <ShareIcon className="h-4 w-4" />
                  Share
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              Rate Your {isEv ? "Charging Session" : "Trip"}
            </DialogTitle>
            <DialogDescription>
              How was your experience with HabeshaGo?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Star Rating */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                {renderStars(userRating, true)}
              </div>
              <p className="text-sm text-gray-500">
                {userRating === 0 && "Tap to rate"}
                {userRating === 1 && "Poor"}
                {userRating === 2 && "Fair"}
                {userRating === 3 && "Good"}
                {userRating === 4 && "Very Good"}
                {userRating === 5 && "Excellent!"}
              </p>
            </div>

            {/* Category Ratings */}
            {userRating > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <Label>Rate specific aspects (optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ratingCategories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => setRatingCategory(category.id)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border transition-all",
                          ratingCategory === category.id
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                            : "border-gray-200 hover:border-gray-300",
                        )}
                      >
                        <Icon className="h-4 w-4 text-gray-500" />
                        <span className="text-xs">{category.label}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Comment */}
            {userRating > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Label htmlFor="comment">Write a review (optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience..."
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </motion.div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRatingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRating}
              disabled={userRating === 0 || isSubmittingRating}
              className={cn(
                "gap-2",
                isEv
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                  : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
              )}
            >
              {isSubmittingRating ? (
                <>
                  <Star className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4" />
                  Submit Rating
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
