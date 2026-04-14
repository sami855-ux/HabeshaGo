"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  ArrowLeft,
  MoreHorizontal,
  Settings,
  HelpCircle,
  Sparkles,
  CheckCircle,
  Clock,
  MapPin,
  Award,
  Bus,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Link2,
  Copy,
  Send,
  Download,
  Printer,
  Share2,
  Bookmark,
  Heart,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useAppSelector } from "@/store/store"
import { useRouter } from "next/navigation"

// Import child components
import TicketList from "../trip/TicketList"
import JourneyTimeline from "../trip/JourneyTimeline"
import { FaInstagram } from "react-icons/fa"

// Types
interface Ticket {
  id: number
  bookingId: number
  userId: string
  seatNumber: number
  boardingStop: string
  alightingStop: string
  qrCode: string
  checkedIn: boolean
  checkedInAt: string | null
  cancelledAt: string | null
  sharedAt: string | null
  sharedToId: string | null
  sharedTicketUsed: boolean
  validUntil: string
  createdAt: string
  updatedAt: string
}

interface Payment {
  id: number
  userId: string
  amount: string
  status?: string
  paymentMethod?: string
  transactionId?: string
}

interface Booking {
  id: number
  bookingCode: string
  busId: number
  scheduleId: number
  passengerCount: number
  totalPrice: number
  status: string
  createdAt: Date
  availableSeats: number
  amountPaid: number
  currency: string
  pointsUsed?: number
  pointsValue?: number
  pointsConversionRate?: number
  tickets?: Ticket[]
  payment?: Payment
}

interface BusRoute {
  id: number
  name: string
  price: string
  currency: string
  estimatedTimeMin: number
  midPoints: string[]
}

interface BusVehicle {
  id: number
  plateNumber: string
  vin: string
  type: string
  model: string
  manufacturer: string
  year: number
  capacity: number
  vehicleImageUrl: string
  status: string
  mileage: number
  ownerName: string | null
  ownerPhone: string | null
  gpsDeviceId: string
  createdAt: string
  updatedAt: string
}

interface BusDriver {
  id: string
  userId: string
  licenseNo: string
  experience: number
  status: string
  driverLicenseUrl: string
  licenseStatus: string
  idType: string
  idFrontUrl: string
  idBackUrl: string
  idStatus: string
  verifiedById: string | null
  verifiedAt: string | null
  rejectionReason: string | null
  isOnDuty: boolean
  lastActiveAt: string | null
  rating: number
  totalTrips: number
  complaintsCount: number
  createdAt: string
}

interface BusData {
  id: number
  busNumber: string
  capacity: number
  reservedSeats: number
  currentStop: string | null
  nextDestination: string | null
  status: "ACTIVE" | "UNDER_MAINTENANCE" | "ON_TRIP" | "OFF_DUTY"
  departureTime: string | null
  estimatedArrival: string | null
  delayMinutes: number
  lastServiceDate: string
  nextServiceDate: string
  driver: BusDriver
  vehicle: BusVehicle
  route: BusRoute
}

interface BookingConfirmationProps {
  booking: Booking
  bus?: BusData
  selectedDate?: string | Date
  selectedTime?: string
  from: string
  to: string
  onClose: () => void
  onBookAnother?: () => void
  onBack: () => void
}

// Animation variants
const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
}

export default function BookingConfirmation({
  booking,
  bus,
  selectedDate,
  selectedTime: propSelectedTime,
  from,
  to,
  onClose,
  onBookAnother,
  onBack,
}: BookingConfirmationProps) {
  const { user } = useAppSelector((store) => store.user)
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [selectedTab, setSelectedTab] = useState<
    "ticket" | "journey" | "amenities" | "reviews"
  >("ticket")
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [emailAddress, setEmailAddress] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [trackingEnabled, setTrackingEnabled] = useState(true)

  // Extract data from the booking object
  const {
    bookingCode,
    passengerCount,
    totalPrice,
    status,
    createdAt,
    availableSeats,
    amountPaid,
    currency,
    pointsUsed,
    tickets = [],
    payment,
  } = booking

  const busNumber = bus?.busNumber || `Bus #${booking.busId}`
  const routeName = bus?.route?.name || `${from} - ${to}`
  const estimatedTimeMin = bus?.route?.estimatedTimeMin || 300
  const estimatedHours = Math.floor(estimatedTimeMin / 60)
  const estimatedMinutes = estimatedTimeMin % 60
  const durationText =
    estimatedHours > 0
      ? `${estimatedHours}h ${estimatedMinutes > 0 ? `${estimatedMinutes}m` : ""}`
      : `${estimatedMinutes}m`

  // Format booking date
  const bookingDate = new Date(createdAt)
  const formattedDate = format(bookingDate, "PPP")
  const selectedTime = propSelectedTime || format(bookingDate, "hh:mm a")

  // Calculate arrival time
  const calculateArrivalTime = () => {
    const date = new Date(createdAt)
    date.setMinutes(date.getMinutes() + estimatedTimeMin)
    return format(date, "hh:mm a")
  }

  const arrivalTime = calculateArrivalTime()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Booking code copied!", {
        description: "You can now share it with others",
        duration: 3000,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const shareBooking = async () => {
    const text = `🎫 Booking Confirmed!\n\nCode: ${bookingCode}\nRoute: ${routeName}\nDate: ${formattedDate}\nTime: ${selectedTime}\nSeats: ${passengerCount}\nTotal: ${currency} ${totalPrice.toFixed(2)}\n\nThank you for choosing HabeshaGo!`

    if (navigator.share) {
      await navigator.share({
        title: "My Bus Ticket - HabeshaGo",
        text,
        url: window.location.href,
      })
      toast.success("Shared successfully!")
    } else {
      setShareDialogOpen(true)
    }
  }

  const shareViaTwitter = () => {
    const text = `Just booked my bus ticket with @HabeshaGo! 🚌\nCode: ${bookingCode}\nRoute: ${routeName}\nDate: ${formattedDate}`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
    )
    toast.success("Opened Twitter")
  }

  const shareViaFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      "_blank",
    )
    toast.success("Opened Facebook")
  }

  const shareViaLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      "_blank",
    )
    toast.success("Opened LinkedIn")
  }

  const shareViaWhatsApp = () => {
    const text = `🎫 Bus Ticket Confirmed!\nCode: ${bookingCode}\nRoute: ${routeName}\nDate: ${formattedDate}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
    toast.success("Opened WhatsApp")
  }

  const shareViaTelegram = () => {
    const text = `🎫 Bus Ticket Confirmed!\nCode: ${bookingCode}\nRoute: ${routeName}`
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`,
      "_blank",
    )
    toast.success("Opened Telegram")
  }

  const shareViaEmail = () => {
    const subject = `Bus Ticket Confirmation - ${bookingCode}`
    const seatNumbers = tickets.map((t) => t.seatNumber).join(", ")
    const body = `Your bus ticket has been confirmed!\n\nBooking Code: ${bookingCode}\nBus: ${busNumber}\nRoute: ${routeName}\nDate: ${formattedDate}\nTime: ${selectedTime}\nPassengers: ${passengerCount}\nSeat Numbers: ${seatNumbers}\nTotal: ${currency} ${totalPrice.toFixed(2)}\n\nThank you for choosing HabeshaGo!`

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    toast.success("Email client opened")
  }

  const sendEmailTicket = () => {
    if (!emailAddress) {
      toast.error("Please enter an email address")
      return
    }

    if (!emailAddress.includes("@") || !emailAddress.includes(".")) {
      toast.error("Please enter a valid email address")
      return
    }

    toast.success(`Ticket sent to ${emailAddress}`)
    setEmailDialogOpen(false)
    setEmailAddress("")
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    toast.success(isLiked ? "Removed from favorites" : "Added to favorites", {
      description: isLiked
        ? "You can add it back anytime"
        : "You'll get updates for this route",
    })
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast.success(
      isBookmarked ? "Removed from bookmarks" : "Bookmarked for later",
      {
        description: isBookmarked
          ? "Bookmark removed"
          : "Saved to your bookmarks",
      },
    )
  }

  const copyTicketLink = () => {
    copyToClipboard(window.location.href)
    toast.success("Ticket link copied to clipboard")
  }

  const formatBookingDate = () => {
    try {
      return format(new Date(createdAt), "EEEE, MMMM d, yyyy")
    } catch {
      return "Invalid date"
    }
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300",
          darkMode && "dark",
        )}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50"
        >
          <div className="px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </motion.button>
                <p className="text-sm">Back to search</p>
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {}}>
                      <Download className="w-4 h-4 mr-2" />
                      Download ticket
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>
                      <Printer className="w-4 h-4 mr-2" />
                      Print ticket
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEmailDialogOpen(true)}>
                      <Send className="w-4 h-4 mr-2" />
                      Email ticket
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBookmark}>
                      <Bookmark
                        className={cn(
                          "w-4 h-4 mr-2",
                          isBookmarked && "fill-current",
                        )}
                      />
                      {isBookmarked ? "Bookmarked" : "Bookmark"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Preferences
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help & Support
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Email Dialog */}
        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Email Ticket
              </DialogTitle>
              <DialogDescription>
                Send your ticket to any email address
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">
                  Message (optional)
                </Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal message"
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                <Mail className="w-4 h-4 text-orange-500" />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Your ticket will be sent as a PDF attachment
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setEmailDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={sendEmailTicket} className="gap-2">
                <Send className="w-4 h-4" />
                Send Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        <div className="px-6 lg:px-8 py-2 max-w-[1600px] mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-10 overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 shadow-2xl"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069')] bg-cover bg-center opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            <div className="relative px-8 py-10 md:px-8 md:py-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-3xl"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full mb-6"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-sm text-white font-medium">
                    Booking Confirmed
                  </span>
                </motion.div>

                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                  Your journey begins
                </h1>

                <p className="text-lg text-white/90 mb-8 max-w-xl">
                  {formatBookingDate()} · {selectedTime}
                </p>

                <div className="flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.1, zIndex: 10 }}
                        className="border-2 border-white rounded-full"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={`https://i.pravatar.cc/100?u=${i}`}
                          />
                          <AvatarFallback>U{i}</AvatarFallback>
                        </Avatar>
                      </motion.div>
                    ))}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">2.5k+</p>
                    <p className="text-sm text-white/80">
                      happy travelers today
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="absolute bottom-0 right-0 p-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 bg-white/10 rounded-full blur-2xl"
              />
            </div>
          </motion.div>

          {/* Status Cards */}
          <motion.div
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
          >
            {[
              {
                icon: CheckCircle,
                label: "Status",
                value: status || "Confirmed",
                color: "green",
                trend: `${passengerCount} ${passengerCount === 1 ? "passenger" : "passengers"}`,
              },
              {
                icon: Clock,
                label: "Departure",
                value: selectedTime,
                color: "blue",
                sub: format(new Date(createdAt), "MMMM d, yyyy"),
              },
              {
                icon: MapPin,
                label: "Duration",
                value: durationText,
                color: "orange",
                sub: bus?.route?.midPoints?.length
                  ? `${bus.route.midPoints.length} stops`
                  : "Non-stop",
              },
              {
                icon: Award,
                label: "Booking ID",
                value: `#${booking.id}`,
                color: "purple",
                sub: `${availableSeats} seats available`,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      item.color === "green" &&
                        "bg-green-100 dark:bg-green-900/30 text-green-600",
                      item.color === "blue" &&
                        "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
                      item.color === "orange" &&
                        "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
                      item.color === "purple" &&
                        "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
                    )}
                  >
                    <item.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.trend || item.sub}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Booking Code Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 bg-gradient-to-br rounded-lg from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <svg
                      width="60"
                      height="60"
                      viewBox="0 0 60 60"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full"
                    >
                      <g fill="none" fillRule="evenodd">
                        <g fill="#ffffff" fillOpacity="0.05">
                          <path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z" />
                        </g>
                      </g>
                    </svg>
                  </div>

                  <div className="relative p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ rotate: 10 }}
                          className="bg-white/10 p-3 rounded-xl"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                            />
                          </svg>
                        </motion.div>
                        <div>
                          <p className="text-sm text-white/60">Boarding Pass</p>
                          <p className="text-xs text-white/40">
                            Digital ticket · No print needed
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                router.push(`/user/booking/share/${booking.id}`)
                              }
                              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                            </motion.button>
                          </TooltipTrigger>
                          <TooltipContent>Share ticket</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-mono font-bold tracking-wider">
                        {bookingCode}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyToClipboard(bookingCode)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs transition-colors flex items-center gap-1"
                      >
                        {copied ? (
                          <>
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Copied
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                              />
                            </svg>
                            Copy
                          </>
                        )}
                      </motion.button>
                    </div>

                    {/* Seat Information */}
                    {tickets.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {tickets.map((ticket, index) => (
                          <Badge
                            key={ticket.id}
                            className="bg-white/20 hover:bg-white/30 text-white border-0"
                          >
                            Seat {ticket.seatNumber}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-800">
                <div className="flex gap-8 overflow-x-auto pb-1">
                  {[
                    {
                      id: "ticket" as const,
                      label: "Tickets",
                      icon: (props: any) => (
                        <svg
                          {...props}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                          />
                        </svg>
                      ),
                      count: tickets.length,
                    },
                    {
                      id: "journey" as const,
                      label: "Journey",
                      icon: (props: any) => (
                        <svg
                          {...props}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      ),
                      count: 4,
                    },
                    {
                      id: "amenities" as const,
                      label: "Amenities",
                      icon: (props: any) => (
                        <svg
                          {...props}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                      ),
                      count: 8,
                    },
                    {
                      id: "reviews" as const,
                      label: "Reviews",
                      icon: (props: any) => (
                        <svg
                          {...props}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      ),
                      count: "12",
                    },
                  ].map((tab) => (
                    <motion.button
                      key={tab.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                      onClick={() => setSelectedTab(tab.id)}
                      className={cn(
                        "relative pb-4 px-1 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap",
                        selectedTab === tab.id
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300",
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {tab.count ? (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {tab.count}
                        </Badge>
                      ) : tab.count === 0 ? (
                        <Badge variant="outline" className="ml-1 text-xs">
                          0
                        </Badge>
                      ) : null}
                      {selectedTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 dark:bg-orange-400"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {selectedTab === "ticket" && (
                <TicketList
                  tickets={tickets}
                  busNumber={busNumber}
                  busType={bus?.vehicle?.type}
                  selectedTime={selectedTime}
                  arrivalTime={arrivalTime}
                />
              )}

              {selectedTab === "journey" && (
                <JourneyTimeline
                  from={from}
                  to={to}
                  selectedTime={selectedTime}
                  midPoints={bus?.route?.midPoints}
                  tickets={tickets}
                  trackingEnabled={trackingEnabled}
                  onTrackingChange={setTrackingEnabled}
                  onShare={shareBooking}
                />
              )}

              {/* {selectedTab === "amenities" && (
                <AmenitiesList vehicle={bus?.vehicle} />
              )} */}

              {selectedTab === "reviews" && (
                <Card className="border border-gray-200 dark:border-gray-800 shadow-xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-yellow-500 fill-current"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      Reviews
                    </h3>
                    <Badge className="text-lg">
                      {bus?.driver?.rating || 4.8} ★
                    </Badge>
                  </div>

                  <div className="space-y-6">
                    {[
                      {
                        id: 1,
                        user: "Sarah K.",
                        rating: 5,
                        comment:
                          "Amazing service! Very comfortable and on time.",
                        date: "2 days ago",
                        avatar: "https://i.pravatar.cc/150?u=sarah",
                      },
                      {
                        id: 2,
                        user: "Mike T.",
                        rating: 5,
                        comment: "Clean bus, friendly driver. Will book again.",
                        date: "1 week ago",
                        avatar: "https://i.pravatar.cc/150?u=mike",
                      },
                      {
                        id: 3,
                        user: "Anna L.",
                        rating: 4,
                        comment:
                          "Good experience overall. WiFi could be faster.",
                        date: "2 weeks ago",
                        avatar: "https://i.pravatar.cc/150?u=anna",
                      },
                    ].map((review) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-4 pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0"
                      >
                        <Avatar>
                          <AvatarImage src={review.avatar} />
                          <AvatarFallback>{review.user[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{review.user}</span>
                            <span className="text-xs text-gray-400">
                              {review.date}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                className={cn(
                                  "w-3 h-3",
                                  i < review.rating
                                    ? "text-yellow-500 fill-current"
                                    : "text-gray-300",
                                )}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {review.comment}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full mt-6">
                    View All Reviews
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </Card>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Payment Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border py-0 rounded-lg border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      Payment Summary
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Base fare</span>
                        <span className="font-medium">
                          {currency} {(totalPrice * 0.85).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Passengers</span>
                        <span className="font-medium">{passengerCount}</span>
                      </div>

                      {pointsUsed && pointsUsed > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Points used</span>
                          <span className="font-medium">{pointsUsed} pts</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-gray-500">Service fee</span>
                        <span className="text-green-600 font-medium">Free</span>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-orange-600">
                          {currency} {totalPrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm font-medium text-green-700 dark:text-green-400">
                            Payment Successful
                          </span>
                        </div>
                        {payment && (
                          <>
                            <p className="text-xs text-gray-500 mt-2">
                              Transaction ID: {payment.id}
                            </p>
                            <p className="text-xs text-gray-500">
                              Amount paid: {currency} {amountPaid.toFixed(2)}
                            </p>
                          </>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => {}}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Download Receipt
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Support Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border rounded-lg py-0 border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-white/20 p-3 rounded-xl">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Need help?
                        </h3>
                        <p className="text-white/80 text-sm">24/7 support</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-0 flex-col h-auto py-3"
                      >
                        <svg
                          className="w-4 h-4 mb-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="text-xs">Call</span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-0 flex-col h-auto py-3"
                      >
                        <svg
                          className="w-4 h-4 mb-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-xs">Email</span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-0 flex-col h-auto py-3"
                      >
                        <svg
                          className="w-4 h-4 mb-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <span className="text-xs">Chat</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
                className="grid grid-cols-2 gap-4"
              >
                <Card className="border border-gray-200 dark:border-gray-800 shadow-xl p-5">
                  <svg
                    className="w-5 h-5 text-orange-500 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <p className="text-2xl font-bold">92%</p>
                  <p className="text-xs text-gray-500">On-time performance</p>
                  <Progress value={92} className="mt-3 h-1" />
                </Card>
                <Card className="border border-gray-200 dark:border-gray-800 shadow-xl p-5">
                  <svg
                    className="w-5 h-5 text-orange-500 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <p className="text-2xl font-bold">#1</p>
                  <p className="text-xs text-gray-500">Top route</p>
                  <p className="text-xs text-gray-400 mt-2">This week</p>
                </Card>
              </motion.div>

              {/* Book Another */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <Button
                  onClick={onBookAnother || onClose}
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white h-14 text-base gap-2 shadow-lg shadow-orange-500/25"
                >
                  Book Another Ticket
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Bus className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold">HabeshaGo</span>
                </div>
                <p className="text-sm text-gray-500">
                  Premium bus travel experience across Ethiopia.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="hover:text-orange-500 cursor-pointer transition-colors">
                    About Us
                  </li>
                  <li className="hover:text-orange-500 cursor-pointer transition-colors">
                    Careers
                  </li>
                  <li className="hover:text-orange-500 cursor-pointer transition-colors">
                    Press
                  </li>
                  <li className="hover:text-orange-500 cursor-pointer transition-colors">
                    Blog
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="hover:text-orange-500 cursor-pointer transition-colors">
                    Help Center
                  </li>
                  <li className="hover:text-orange-500 cursor-pointer transition-colors">
                    Safety
                  </li>
                  <li className="hover:text-orange-500 cursor-pointer transition-colors">
                    Terms
                  </li>
                  <li className="hover:text-orange-500 cursor-pointer transition-colors">
                    Privacy
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-4">Follow Us</h4>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-orange-50 dark:hover:bg-orange-950/30"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-orange-50 dark:hover:bg-orange-950/30"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-orange-50 dark:hover:bg-orange-950/30"
                  >
                    <FaInstagram className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-orange-50 dark:hover:bg-orange-950/30"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 py-8">
              © 2024 HabeshaGo. All rights reserved.
            </div>
          </motion.footer>
        </div>
      </div>
    </TooltipProvider>
  )
}
