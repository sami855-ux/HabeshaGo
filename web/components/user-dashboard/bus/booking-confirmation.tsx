"use client"

import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  CheckCircle,
  Download,
  Share2,
  Printer,
  Mail,
  QrCode,
  Calendar,
  Clock,
  User,
  Copy,
  Wallet,
  ArrowRight,
  Check,
  Ticket,
  Bus,
  ArrowLeft,
  CreditCard,
  Shield,
  Receipt,
  Smartphone,
  Phone,
  Mail as MailIcon,
  MessageCircle,
  MapPin,
  Users,
  Heart,
  ScanQrCode,
  Sparkles,
  Bell,
  MoreHorizontal,
  Globe,
  ChevronRight,
  Clock3,
  Award,
  TrendingUp,
  Zap,
  Target,
  Eye,
  FileText,
  Send,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  ExternalLink,
  Bookmark,
  Instagram,
  Youtube,
  Github,
  Coffee,
  Sun,
  Moon,
  Star,
  Navigation,
  Compass,
  Flag,
  Gift,
  Settings,
  HelpCircle,
  Search,
  Menu,
  X,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Bluetooth,
  Wifi,
  Wind,
  Battery,
  Coffee as CoffeeIcon,
  Luggage,
  Wifi as WifiIcon,
  Thermometer,
  Headphones,
  Camera,
  Film,
  Music,
  Gamepad,
  Gift as GiftIcon,
  Award as AwardIcon,
  Trophy,
  Medal,
  Crown,
  Diamond,
  Gem,
  Rocket,
  Plane,
  Car,
  Bike,
  Train,
  Ship,
  Info,
} from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { useAppSelector } from "@/store/store"
import { useRouter } from "next/navigation"

// Define the Bus types based on your data structure
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

interface Booking {
  id: string
  bookingCode: string
  busId: number
  scheduleId: number
  passengerCount: number
  totalPrice: number
  status: string
  createdAt: string
}

interface BookingConfirmationProps {
  booking: Booking
  bus?: BusData
  selectedDate?: Date
  selectedTime?: string
  onClose: () => void
  onBookAnother?: () => void
  onBack: () => void
}

// Generate journey stops based on route midPoints
const generateJourneyStops = (
  midPoints: string[] = [],
  from: string,
  to: string,
  startTime: string,
) => {
  const stops = [
    {
      location: from,
      time: startTime,
      status: "completed",
      address: "Main Terminal",
      platform: "A12",
      weather: "Sunny, 22°C",
    },
  ]

  // Add mid points
  midPoints.forEach((point, index) => {
    // Calculate estimated time (add 1.5 hours per stop)
    const date = new Date()
    const [hours, minutes] = startTime
      .match(/(\d+):(\d+)/)
      ?.slice(1)
      .map(Number) || [8, 0]
    date.setHours(hours, minutes)
    date.setMinutes(date.getMinutes() + (index + 1) * 90) // Add 1.5 hours per stop

    stops.push({
      location: point,
      time: format(date, "hh:mm a"),
      status: index === 0 ? "current" : "upcoming",
      address: `${point} Station`,
      platform: `B${index + 2}`,
      weather: "Clear, 23°C",
    })
  })

  // Add destination
  const date = new Date()
  const [hours, minutes] = startTime
    .match(/(\d+):(\d+)/)
    ?.slice(1)
    .map(Number) || [8, 0]
  date.setHours(hours, minutes)
  date.setMinutes(date.getMinutes() + (midPoints.length + 1) * 90)

  stops.push({
    location: to,
    time: format(date, "hh:mm a"),
    status: "upcoming",
    address: `${to} Bus Station`,
    platform: "D1",
    weather: "Sunny, 24°C",
  })

  return stops
}

// Generate amenities based on vehicle type
const generateAmenities = (vehicle?: BusVehicle) => {
  const baseAmenities = [
    {
      icon: WifiIcon,
      label: "Free WiFi",
      available: true,
      premium: vehicle?.type === "LUXURY" || vehicle?.type === "PREMIUM",
      description: "High-speed internet",
    },
    {
      icon: Wind,
      label: "AC",
      available: true,
      premium: false,
      description: "Climate controlled",
    },
    {
      icon: CoffeeIcon,
      label: "Refreshments",
      available: true,
      premium: vehicle?.type === "LUXURY",
      description: "Complimentary snacks",
    },
    {
      icon: Luggage,
      label: "Extra Luggage",
      available: true,
      premium: false,
      description: "30kg allowed",
    },
    {
      icon: Battery,
      label: "Charging",
      available: true,
      premium: vehicle?.type === "LUXURY" || vehicle?.type === "PREMIUM",
      description: "USB & power outlets",
    },
    {
      icon: Bluetooth,
      label: "Bluetooth",
      available: vehicle?.type === "LUXURY",
      premium: true,
      description: "Audio streaming",
    },
    {
      icon: Camera,
      label: "Security",
      available: true,
      premium: false,
      description: "24/7 surveillance",
    },
    {
      icon: Thermometer,
      label: "Temperature",
      available: vehicle?.type === "LUXURY",
      premium: true,
      description: "Individual control",
    },
  ]

  return baseAmenities.filter((a) => a.available)
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
}

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
}

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function BookingConfirmation({
  booking,
  bus,
  selectedDate = new Date(),
  selectedTime = "08:00 AM",
  onClose,
  onBookAnother,
  onBack,
}: BookingConfirmationProps) {
  const { user } = useAppSelector((store) => store.user)
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [selectedTab, setSelectedTab] = useState<
    "ticket" | "journey" | "amenities" | "reviews"
  >("ticket")
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [emailAddress, setEmailAddress] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [trackingEnabled, setTrackingEnabled] = useState(true)
  const [qrSize, setQrSize] = useState<"small" | "medium" | "large">("medium")
  const [selectedSeat] = useState("12A") // This would come from seat selection in booking page

  // Extract data from props
  const busNumber = bus?.busNumber || `Bus #${booking.busId}`
  const currency = bus?.route?.currency || "ETB"
  const routeName = bus?.route?.name || "Addis Ababa - Hawassa"
  const [from, to] = routeName.split(" - ")
  const estimatedTimeMin = bus?.route?.estimatedTimeMin || 300
  const estimatedHours = Math.floor(estimatedTimeMin / 60)
  const estimatedMinutes = estimatedTimeMin % 60
  const durationText =
    estimatedHours > 0
      ? `${estimatedHours}h ${estimatedMinutes > 0 ? `${estimatedMinutes}m` : ""}`
      : `${estimatedMinutes}m`

  // Calculate arrival time
  const calculateArrivalTime = () => {
    if (!selectedTime) return "01:00 PM"

    const [time, modifier] = selectedTime.split(" ")
    let [hours, minutes] = time.split(":").map(Number)

    if (modifier === "PM" && hours !== 12) hours += 12
    if (modifier === "AM" && hours === 12) hours = 0

    const date = new Date()
    date.setHours(hours, minutes)
    date.setMinutes(date.getMinutes() + estimatedTimeMin)

    return format(date, "hh:mm a")
  }

  const arrivalTime = calculateArrivalTime()

  // Generate dynamic data based on bus info
  const journeyStops = generateJourneyStops(
    bus?.route?.midPoints || [],
    from,
    to,
    selectedTime,
  )
  const amenities = generateAmenities(bus?.vehicle)

  // Mock reviews (these would come from an API)
  const mockReviews = [
    {
      id: 1,
      user: "Sarah K.",
      rating: 5,
      comment: "Amazing service! Very comfortable and on time.",
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
      comment: "Good experience overall. WiFi could be faster.",
      date: "2 weeks ago",
      avatar: "https://i.pravatar.cc/150?u=anna",
    },
  ]

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking.bookingCode}`

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
    const text = `🎫 Booking Confirmed!\n\nCode: ${booking.bookingCode}\nRoute: ${routeName}\nDate: ${format(selectedDate, "PPP")}\nTime: ${selectedTime}\nSeats: ${booking.passengerCount}\nTotal: ${currency} ${booking.totalPrice.toFixed(2)}\n\nThank you for choosing HabeshaGo!`

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
    const text = `Just booked my bus ticket with @HabeshaGo! 🚌\nCode: ${booking.bookingCode}\nRoute: ${routeName}\nDate: ${format(selectedDate, "PPP")}`
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
    const text = `🎫 Bus Ticket Confirmed!\nCode: ${booking.bookingCode}\nRoute: ${routeName}\nDate: ${format(selectedDate, "PPP")}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
    toast.success("Opened WhatsApp")
  }

  const shareViaTelegram = () => {
    const text = `🎫 Bus Ticket Confirmed!\nCode: ${booking.bookingCode}\nRoute: ${routeName}`
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`,
      "_blank",
    )
    toast.success("Opened Telegram")
  }

  const shareViaEmail = () => {
    const subject = `Bus Ticket Confirmation - ${booking.bookingCode}`
    const body = `Your bus ticket has been confirmed!\n\nBooking Code: ${booking.bookingCode}\nBus: ${busNumber}\nRoute: ${routeName}\nDate: ${format(selectedDate, "PPP")}\nTime: ${selectedTime}\nPassengers: ${booking.passengerCount}\nTotal: ${currency} ${booking.totalPrice.toFixed(2)}\n\nThank you for choosing HabeshaGo!`

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    toast.success("Email client opened")
  }

  const downloadTicket = async () => {
    toast.loading("Preparing your ticket...", { id: "download" })

    try {
      // Create a temporary div with ticket content
      const ticketElement = document.createElement("div")
      ticketElement.style.width = "600px"
      ticketElement.style.padding = "20px"
      ticketElement.style.fontFamily = "Arial, sans-serif"
      ticketElement.style.background = "white"
      ticketElement.innerHTML = `
      <div style="border: 2px solid #f97316; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(to right, #f97316, #f59e0b); color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px;">HabeshaGo</h2>
          <p style="margin: 5px 0 0; opacity: 0.9;">Premium Bus Travel</p>
        </div>
        
        <div style="padding: 30px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #ddd;">
            <span style="color: #666;">Booking Code:</span>
            <span style="font-weight: bold;">${booking.bookingCode}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #ddd;">
            <span style="color: #666;">Bus Number:</span>
            <span style="font-weight: bold;">${busNumber}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #ddd;">
            <span style="color: #666;">Route:</span>
            <span style="font-weight: bold;">${routeName}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #ddd;">
            <span style="color: #666;">Date:</span>
            <span style="font-weight: bold;">${format(selectedDate, "PPP")}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #ddd;">
            <span style="color: #666;">Time:</span>
            <span style="font-weight: bold;">${selectedTime}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #ddd;">
            <span style="color: #666;">Passengers:</span>
            <span style="font-weight: bold;">${booking.passengerCount}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #ddd;">
            <span style="color: #666;">Total Price:</span>
            <span style="font-weight: bold; color: #f97316;">${currency} ${booking.totalPrice.toFixed(2)}</span>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.bookingCode}" style="width: 150px; height: 150px;" />
            <p style="color: #666; font-size: 12px;">Scan this QR code at the boarding gate</p>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0; color: #666; font-size: 12px;">Thank you for choosing HabeshaGo!</p>
          <p style="margin: 5px 0 0; color: #999; font-size: 10px;">This is a computer generated ticket.</p>
        </div>
      </div>
    `

      // Append to body temporarily
      document.body.appendChild(ticketElement)

      // Convert to canvas
      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        backgroundColor: "#ffffff",
      })

      // Remove temporary element
      document.body.removeChild(ticketElement)

      // Create PDF
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      })

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2)
      pdf.save(`HabeshaGo_Ticket_${booking.bookingCode}.pdf`)

      toast.success("Ticket downloaded successfully!", { id: "download" })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to generate ticket", { id: "download" })
    }
  }

  const printTicket = () => {
    window.print()
    toast.success("Print dialog opened")
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "current":
        return "bg-orange-500"
      default:
        return "bg-gray-300 dark:bg-gray-600"
    }
  }

  const getQrSize = () => {
    switch (qrSize) {
      case "small":
        return "w-24 h-24"
      case "large":
        return "w-60 h-60"
      default:
        return "w-56 h-56"
    }
  }

  // Format the booking date properly
  const formatBookingDate = () => {
    try {
      return format(selectedDate, "EEEE, MMMM d, yyyy")
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
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-none"
        >
          <div className="px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(0,0,0,0.05)",
                  }}
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
                    <DropdownMenuItem onClick={downloadTicket}>
                      <Download className="w-4 h-4 mr-2" />
                      Download ticket
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={printTicket}>
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

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Share Ticket
              </DialogTitle>
              <DialogDescription>
                Choose how you want to share your ticket
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 py-6">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-col h-auto py-4 hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]"
                    onClick={shareViaTwitter}
                  >
                    <Twitter className="w-6 h-6 mb-2 text-[#1DA1F2]" />
                    <span className="text-xs">Twitter</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share on Twitter</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-col h-auto py-4 hover:bg-[#4267B2]/10 hover:border-[#4267B2]"
                    onClick={shareViaFacebook}
                  >
                    <Facebook className="w-6 h-6 mb-2 text-[#4267B2]" />
                    <span className="text-xs">Facebook</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share on Facebook</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-col h-auto py-4 hover:bg-[#0077B5]/10 hover:border-[#0077B5]"
                    onClick={shareViaLinkedIn}
                  >
                    <Linkedin className="w-6 h-6 mb-2 text-[#0077B5]" />
                    <span className="text-xs">LinkedIn</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share on LinkedIn</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-col h-auto py-4 hover:bg-[#25D366]/10 hover:border-[#25D366]"
                    onClick={shareViaWhatsApp}
                  >
                    <svg
                      className="w-6 h-6 mb-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2 6.798 2 2.528 6.242 2.517 11.435c-.004 1.662.433 3.287 1.262 4.725L2.25 21.75l5.693-1.494c1.384.752 2.943 1.148 4.541 1.15h.004c5.187 0 9.458-4.244 9.469-9.438.005-2.522-.976-4.896-2.88-6.79z"
                        fill="#25D366"
                      />
                    </svg>
                    <span className="text-xs">WhatsApp</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share on WhatsApp</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-col h-auto py-4 hover:bg-[#0088cc]/10 hover:border-[#0088cc]"
                    onClick={shareViaTelegram}
                  >
                    <svg
                      className="w-6 h-6 mb-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.74-.42 1.03-.7 1.06-.59.05-1.04-.39-1.61-.77-1.07-.73-1.67-1.19-2.71-1.92-1.2-.85-.42-1.32.26-2.09.18-.2 3.29-3.01 3.35-3.27.01-.03.01-.11-.04-.15-.05-.04-.13-.02-.19-.01-.08.01-1.44.92-4.05 2.68-.38.26-.73.39-1.04.38-.34-.01-1-.19-1.49-.35-.6-.19-1.07-.3-1.03-.64.02-.18.27-.36.74-.55 2.84-1.23 4.73-2.04 5.68-2.43 2.71-1.09 3.27-1.28 3.64-1.28.08 0 .26.02.38.12.1.08.14.19.15.29.01.1.02.21-.01.31z"
                        fill="#0088cc"
                      />
                    </svg>
                    <span className="text-xs">Telegram</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share on Telegram</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-col h-auto py-4 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={shareViaEmail}
                  >
                    <Mail className="w-6 h-6 mb-2" />
                    <span className="text-xs">Email</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share via Email</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-col h-auto py-4 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={copyTicketLink}
                  >
                    <Link2 className="w-6 h-6 mb-2" />
                    <span className="text-xs">Copy link</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy ticket link</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Input
                value={window.location.href}
                readOnly
                className="text-xs"
              />
              <Button variant="outline" size="sm" onClick={copyTicketLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        <div className="px-6 lg:px-8 py-2 max-w-[1600px] mx-auto">
          {/* Enhanced Hero Section */}
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

            {/* Decorative Elements */}
            <div className="absolute bottom-0 right-0 p-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 bg-white/10 rounded-full blur-2xl"
              />
            </div>
          </motion.div>

          {/* Enhanced Status Cards */}
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
                value: booking.status || "Confirmed",
                color: "green",
                trend: "+12% this week",
              },
              {
                icon: Clock,
                label: "Departure",
                value: selectedTime,
                color: "blue",
                sub: "In 2 hours",
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
                label: "Trip ID",
                value: `#${booking.id}`.slice(0, 8),
                color: "purple",
                sub: bus?.vehicle?.type || "Standard",
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
              {/* Enhanced Booking Code Card */}
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
                          <ScanQrCode className="w-5 h-5" />
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

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={handleLike}
                              className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                isLiked
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-white/10 hover:bg-white/20",
                              )}
                            >
                              <Heart
                                className={cn(
                                  "w-4 h-4",
                                  isLiked && "fill-current",
                                )}
                              />
                            </motion.button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isLiked ? "Unlike" : "Like"}
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={handleBookmark}
                              className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                isBookmarked
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-white/10 hover:bg-white/20",
                              )}
                            >
                              <Bookmark
                                className={cn(
                                  "w-4 h-4",
                                  isBookmarked && "fill-current",
                                )}
                              />
                            </motion.button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isBookmarked ? "Remove bookmark" : "Bookmark"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-mono font-bold tracking-wider">
                        {booking.bookingCode}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyToClipboard(booking.bookingCode)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs transition-colors flex items-center gap-1"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Enhanced Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-800">
                <div className="flex gap-8 overflow-x-auto pb-1">
                  {[
                    {
                      id: "ticket",
                      label: "Ticket",
                      icon: Ticket,
                      count: null,
                    },
                    {
                      id: "journey",
                      label: "Journey",
                      icon: MapPin,
                      count: bus?.route?.midPoints?.length
                        ? `${bus.route.midPoints.length + 2} stops`
                        : "4 stops",
                    },
                    {
                      id: "amenities",
                      label: "Amenities",
                      icon: WifiIcon,
                      count: amenities.length,
                    },
                    {
                      id: "reviews",
                      label: "Reviews",
                      icon: Star,
                      count: "12",
                    },
                  ].map((tab) => (
                    <motion.button
                      key={tab.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                      onClick={() => setSelectedTab(tab.id as any)}
                      className={cn(
                        "relative pb-4 px-1 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap",
                        selectedTab === tab.id
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300",
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {tab.count && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {tab.count}
                        </Badge>
                      )}
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
              <AnimatePresence mode="wait">
                {selectedTab === "ticket" && (
                  <motion.div
                    key="ticket"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-0 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden relative">
                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl" />
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />

                      {/* Ticket Header with Perforated Effect */}
                      <div className="relative">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                <Ticket className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="text-white/80 text-sm">
                                  E-Ticket
                                </p>
                                <h3 className="text-white font-bold text-xl">
                                  {busNumber}
                                </h3>
                              </div>
                            </div>
                            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-4 py-2">
                              <Sparkles className="w-4 h-4 mr-2" />
                              {bus?.vehicle?.type || "Premium"} Class
                            </Badge>
                          </div>
                        </div>

                        {/* Perforated Border */}
                        <div className="relative h-4">
                          <div className="absolute inset-0 flex justify-between">
                            {[...Array(20)].map((_, i) => (
                              <div
                                key={i}
                                className="w-3 h-3 bg-white dark:bg-gray-900 rounded-full -mt-1.5"
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Ticket Body */}
                      <div className="p-8">
                        {/* Enhanced Route Visualization */}
                        <div className="relative mb-12">
                          <div className="flex items-center justify-between">
                            {/* Departure */}
                            <div className="text-center flex-1">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                                className="relative"
                              >
                                <div className="w-5 h-5 bg-green-500 rounded-full mx-auto mb-3 shadow-lg shadow-green-500/50" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-300 rounded-full animate-ping" />
                              </motion.div>
                              <p className="font-bold text-lg">{from}</p>
                              <p className="text-sm text-gray-500">
                                {selectedTime}
                              </p>
                              <div className="flex items-center justify-center gap-1 mt-2">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <p className="text-xs text-gray-400">
                                  Terminal A, Gate 12
                                </p>
                              </div>
                            </div>

                            {/* Journey Line */}
                            <div className="flex-1 mx-8">
                              <div className="relative">
                                {/* Background Line */}
                                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />

                                {/* Progress Line */}
                                <motion.div
                                  initial={{ width: "0%" }}
                                  animate={{ width: "60%" }}
                                  transition={{ delay: 0.5, duration: 0.8 }}
                                  className="absolute top-0 left-0 h-1 bg-gradient-to-r from-green-500 via-orange-500 to-blue-500 rounded-full"
                                />

                                {/* Stop Markers */}
                                <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-2">
                                  {bus?.route?.midPoints?.map((_, i) => (
                                    <motion.div
                                      key={i}
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: 0.7 + i * 0.1 }}
                                      className="relative"
                                    >
                                      <div className="w-3 h-3 bg-white dark:bg-gray-900 border-2 border-orange-500 rounded-full shadow-lg" />
                                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                        <p className="text-[10px] font-medium text-gray-500">
                                          Stop {i + 1}
                                        </p>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>

                                {/* Duration Badge */}
                                <motion.div
                                  initial={{ y: 10, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.9 }}
                                  className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full shadow-lg shadow-orange-500/30"
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-xs font-medium">
                                      {durationText}
                                    </span>
                                  </div>
                                </motion.div>
                              </div>
                            </div>

                            {/* Arrival */}
                            <div className="text-center flex-1">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                                className="relative"
                              >
                                <div className="w-5 h-5 bg-blue-500 rounded-full mx-auto mb-3 shadow-lg shadow-blue-500/50" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-300 rounded-full animate-ping" />
                              </motion.div>
                              <p className="font-bold text-lg">{to}</p>
                              <p className="text-sm text-gray-500">
                                {arrivalTime}
                              </p>
                              <div className="flex items-center justify-center gap-1 mt-2">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <p className="text-xs text-gray-400">
                                  Terminal D, Gate 5
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced QR Code Section */}
                        <div className="relative flex flex-col items-center py-10 px-6 mb-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                          {/* QR Size Controls */}
                          <div className="absolute top-4 right-4 flex gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className={cn(
                                    "h-8 w-8 rounded-full",
                                    qrSize === "small" &&
                                      "bg-orange-500 text-white border-orange-500",
                                  )}
                                  onClick={() => setQrSize("small")}
                                >
                                  <Minimize2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Small QR</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className={cn(
                                    "h-8 w-8 rounded-full",
                                    qrSize === "medium" &&
                                      "bg-orange-500 text-white border-orange-500",
                                  )}
                                  onClick={() => setQrSize("medium")}
                                >
                                  <Maximize2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Medium QR</TooltipContent>
                            </Tooltip>
                          </div>

                          {/* QR Code with Glow Effect */}
                          <motion.div
                            className="relative cursor-pointer group mb-4"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowQR(!showQR)}
                          >
                            {/* Glow Effect */}
                            <motion.div
                              className="absolute inset-0 bg-orange-500/20 rounded-3xl blur-3xl"
                              animate={{
                                scale: showQR ? 1.2 : 1,
                                opacity: showQR ? 0.8 : 0.4,
                              }}
                              transition={{ duration: 0.3 }}
                            />

                            {/* QR Container */}
                            <div className="relative bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-orange-200 dark:border-orange-800 shadow-xl">
                              <AnimatePresence mode="wait">
                                {showQR ? (
                                  <motion.img
                                    key="qr"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    src={qrCodeUrl}
                                    alt="QR Code"
                                    className={cn(
                                      "rounded-lg transition-all duration-300",
                                      getQrSize(),
                                    )}
                                  />
                                ) : (
                                  <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={cn(
                                      getQrSize(),
                                      "flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg",
                                    )}
                                  >
                                    <ScanQrCode className="w-16 h-16 text-gray-400" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Hover Indicator */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {showQR ? "Click to hide" : "Click to show QR"}
                            </div>
                          </motion.div>

                          {/* QR Instructions */}
                          <div className="text-center space-y-1">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {showQR
                                ? "Show this QR code at the boarding gate"
                                : "Tap the QR code to display"}
                            </p>
                            <p className="text-xs text-gray-400">
                              Scan for quick check-in • No printing needed
                            </p>
                          </div>

                          {/* Scan Animation */}
                          {showQR && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute bottom-4 left-4 flex items-center gap-2"
                            >
                              <div className="relative">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                              </div>
                              <span className="text-xs text-green-600 dark:text-green-400">
                                Ready to scan
                              </span>
                            </motion.div>
                          )}
                        </div>

                        {/* Enhanced Actions Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                className="flex-col h-auto py-5 gap-2 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 group"
                                onClick={downloadTicket}
                              >
                                <Download className="w-5 h-5 group-hover:text-orange-500 transition-colors" />
                                <span className="text-xs font-medium group-hover:text-orange-500 transition-colors">
                                  Download
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Save ticket to device
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                className="flex-col h-auto py-5 gap-2 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 group"
                                onClick={printTicket}
                              >
                                <Printer className="w-5 h-5 group-hover:text-orange-500 transition-colors" />
                                <span className="text-xs font-medium group-hover:text-orange-500 transition-colors">
                                  Print
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Print physical copy</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                className="flex-col h-auto py-5 gap-2 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 group"
                                onClick={() => setEmailDialogOpen(true)}
                              >
                                <Mail className="w-5 h-5 group-hover:text-orange-500 transition-colors" />
                                <span className="text-xs font-medium group-hover:text-orange-500 transition-colors">
                                  Email
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Send to email</TooltipContent>
                          </Tooltip>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="flex-col h-auto py-5 gap-2 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 group"
                              >
                                <Share2 className="w-5 h-5 group-hover:text-orange-500 transition-colors" />
                                <span className="text-xs font-medium group-hover:text-orange-500 transition-colors">
                                  Share
                                </span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Share via</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={shareViaTwitter}
                                className="gap-2"
                              >
                                <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                                Twitter
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={shareViaFacebook}
                                className="gap-2"
                              >
                                <Facebook className="w-4 h-4 text-[#4267B2]" />
                                Facebook
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={shareViaLinkedIn}
                                className="gap-2"
                              >
                                <Linkedin className="w-4 h-4 text-[#0077B5]" />
                                LinkedIn
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={shareViaWhatsApp}
                                className="gap-2"
                              >
                                <svg
                                  className="w-4 h-4 text-[#25D366]"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2 6.798 2 2.528 6.242 2.517 11.435c-.004 1.662.433 3.287 1.262 4.725L2.25 21.75l5.693-1.494c1.384.752 2.943 1.148 4.541 1.15h.004c5.187 0 9.458-4.244 9.469-9.438.005-2.522-.976-4.896-2.88-6.79z" />
                                </svg>
                                WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={copyTicketLink}
                                className="gap-2"
                              >
                                <Link2 className="w-4 h-4" />
                                Copy link
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-6 grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <Info className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-blue-700 dark:text-blue-400">
                              Arrive 30min before departure
                            </span>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                            <Shield className="w-4 h-4 text-purple-500" />
                            <span className="text-xs text-purple-700 dark:text-purple-400">
                              ID required for boarding
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Footer with Perforated Border */}
                      <div className="relative">
                        <div className="relative h-4">
                          <div className="absolute inset-0 flex justify-between">
                            {[...Array(20)].map((_, i) => (
                              <div
                                key={i}
                                className="w-3 h-3 bg-white dark:bg-gray-900 rounded-full -mt-1.5"
                              />
                            ))}
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 px-8 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-orange-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Mobile ticket - No print required
                                </span>
                              </div>
                              <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
                              <div className="flex items-center gap-2">
                                <QrCode className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Scan at gate
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className="bg-white dark:bg-gray-800 gap-1 px-3 py-1"
                              >
                                <Shield className="w-3 h-3 text-green-500" />
                                Verified
                              </Badge>
                              <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 px-3 py-1">
                                <Crown className="w-3 h-3 mr-1" />
                                {bus?.vehicle?.type || "Premium"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {selectedTab === "journey" && (
                  <motion.div
                    key="journey"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border border-gray-200 dark:border-gray-800 shadow-xl p-8">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-orange-500" />
                        Journey Timeline
                      </h3>

                      <div className="space-y-6">
                        {journeyStops.map((stop, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative flex gap-6"
                          >
                            <div className="relative">
                              <motion.div
                                className={cn(
                                  "w-4 h-4 rounded-full border-4 border-white dark:border-gray-900",
                                  getStatusColor(stop.status),
                                )}
                                animate={
                                  stop.status === "current"
                                    ? { scale: [1, 1.3, 1] }
                                    : {}
                                }
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                              {i < journeyStops.length - 1 && (
                                <div className="absolute top-4 left-2 w-0.5 h-16 bg-gray-200 dark:bg-gray-700" />
                              )}
                            </div>

                            <div className="flex-1 pb-6">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-lg">
                                      {stop.location}
                                    </h4>
                                    {stop.status === "current" && (
                                      <Badge className="bg-orange-500 text-white border-0 animate-pulse">
                                        <Zap className="w-3 h-3 mr-1" />
                                        In Progress
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    {stop.time}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {stop.address}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <Badge variant="outline" className="mb-1">
                                    {stop.platform}
                                  </Badge>
                                  <p className="text-xs text-gray-400">
                                    {stop.weather}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Live Tracking */}
                      <div className="mt-8 p-6 bg-orange-50 dark:bg-orange-950/30 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="font-medium">Live Tracking</span>
                          </div>
                          <Switch
                            checked={trackingEnabled}
                            onCheckedChange={setTrackingEnabled}
                          />
                        </div>

                        {trackingEnabled && (
                          <div className="space-y-3">
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "65%" }}
                                transition={{ duration: 1 }}
                                className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                              />
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Bus is moving</span>
                              <span className="font-medium">
                                Next stop:{" "}
                                {journeyStops.find(
                                  (s) => s.status === "current",
                                )?.location || "Debre Zeit"}{" "}
                                (15 min)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        className="w-full mt-6 gap-2"
                        onClick={shareBooking}
                      >
                        <Share2 className="w-4 h-4" />
                        Share Journey
                      </Button>
                    </Card>
                  </motion.div>
                )}

                {selectedTab === "amenities" && (
                  <motion.div
                    key="amenities"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border border-gray-200 dark:border-gray-800 shadow-xl p-8">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <WifiIcon className="w-5 h-5 text-orange-500" />
                        Onboard Amenities
                      </h3>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {amenities.map((amenity, i) => (
                          <HoverCard key={i}>
                            <HoverCardTrigger asChild>
                              <motion.div
                                whileHover={{ y: -4 }}
                                className={cn(
                                  "p-4 rounded-xl border-2 cursor-pointer transition-all",
                                  amenity.premium
                                    ? "border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30"
                                    : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50",
                                )}
                              >
                                <div className="flex flex-col items-center text-center">
                                  <amenity.icon
                                    className={cn(
                                      "w-8 h-8 mb-2",
                                      amenity.premium
                                        ? "text-orange-500"
                                        : "text-gray-500",
                                    )}
                                  />
                                  <p className="text-sm font-medium">
                                    {amenity.label}
                                  </p>
                                  {amenity.premium && (
                                    <Badge
                                      variant="outline"
                                      className="mt-2 text-[10px] px-1 py-0"
                                    >
                                      Premium
                                    </Badge>
                                  )}
                                </div>
                              </motion.div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-64">
                              <div className="space-y-2">
                                <h4 className="font-semibold">
                                  {amenity.label}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {amenity.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge
                                    variant={
                                      amenity.available
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {amenity.available
                                      ? "Available"
                                      : "Unavailable"}
                                  </Badge>
                                  {amenity.premium && (
                                    <Badge variant="outline">Premium</Badge>
                                  )}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        ))}
                      </div>

                      {amenities.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                          No amenity information available for this bus.
                        </p>
                      )}
                    </Card>
                  </motion.div>
                )}

                {selectedTab === "reviews" && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border border-gray-200 dark:border-gray-800 shadow-xl p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          Reviews
                        </h3>
                        <Badge className="text-lg">
                          {bus?.driver?.rating || 4.8} ★
                        </Badge>
                      </div>

                      <div className="space-y-6">
                        {mockReviews.map((review) => (
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
                                <span className="font-medium">
                                  {review.user}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {review.date}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mb-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "w-3 h-3",
                                      i < review.rating
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300",
                                    )}
                                  />
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
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column - Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Enhanced Payment Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border py-0 rounded-lg border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Summary
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Base fare</span>
                        <span className="font-medium">
                          {currency} {(booking.totalPrice * 0.85).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Service fee</span>
                        <span className="text-green-600 font-medium">Free</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Taxes</span>
                        <span className="font-medium">
                          {currency} {(booking.totalPrice * 0.15).toFixed(2)}
                        </span>
                      </div>

                      <Separator />

                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-orange-600">
                          {currency} {booking.totalPrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-400">
                            Payment Successful
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Transaction ID:{" "}
                          {`TXN${Math.random().toString(36).substring(2, 10).toUpperCase()}`}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={downloadTicket}
                      >
                        <FileText className="w-4 h-4" />
                        Download Receipt
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Enhanced Support Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border rounded-lg py-0 border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-white/20 p-3 rounded-xl">
                        <Headphones className="w-6 h-6 text-white" />
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
                        <Phone className="w-4 h-4 mb-1" />
                        <span className="text-xs">Call</span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-0 flex-col h-auto py-3"
                      >
                        <MailIcon className="w-4 h-4 mb-1" />
                        <span className="text-xs">Email</span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-0 flex-col h-auto py-3"
                      >
                        <MessageCircle className="w-4 h-4 mb-1" />
                        <span className="text-xs">Chat</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Enhanced Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
                className="grid grid-cols-2 gap-4"
              >
                <Card className="border border-gray-200 dark:border-gray-800 shadow-xl p-5">
                  <TrendingUp className="w-5 h-5 text-orange-500 mb-3" />
                  <p className="text-2xl font-bold">92%</p>
                  <p className="text-xs text-gray-500">On-time performance</p>
                  <Progress value={92} className="mt-3 h-1" />
                </Card>
                <Card className="border border-gray-200 dark:border-gray-800 shadow-xl p-5">
                  <Target className="w-5 h-5 text-orange-500 mb-3" />
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
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Enhanced Footer */}
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
                    <Instagram className="w-4 h-4" />
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
