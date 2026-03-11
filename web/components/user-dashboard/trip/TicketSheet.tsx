"use client"

import { useState } from "react"
import { Trip } from "@/types/trips"
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
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
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
import { useRouter } from "next/navigation"

interface TicketSheetProps {
  trip: Trip
}

export default function TicketSheet({ trip }: TicketSheetProps) {
  const router = useRouter()

  const [copied, setCopied] = useState(false)
  const [showQRDetails, setShowQRDetails] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [activeTab, setActiveTab] = useState("ticket")
  const [isSharing, setIsSharing] = useState(false)
  const [shareVia, setShareVia] = useState<
    "copy" | "whatsapp" | "email" | null
  >(null)

  const departureDate = new Date(trip.date)
  const createdAt = new Date(trip.createdAt)
  const validUntil = new Date(trip.validUntil)

  // Estimate arrival time (you might want to calculate this based on route)
  const arrivalDate = new Date(departureDate)
  const estimatedDuration = trip.bus?.route?.estimatedTimeMin || 300 // default 5 hours in minutes
  arrivalDate.setMinutes(arrivalDate.getMinutes() + estimatedDuration)

  const durationMs = arrivalDate.getTime() - departureDate.getTime()
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
  const durationMinutes = Math.floor(
    (durationMs % (1000 * 60 * 60)) / (1000 * 60),
  )

  const qrData = `HABESHAGO:${trip.id}:${trip.bookingCode}:${departureDate.getTime()}`

  // Calculate fare breakdown based on actual data
  const totalAmount = parseFloat(trip.totalAmount)
  const amountPaid = parseFloat(trip.amountPaid)
  const discount = parseFloat(trip.discount)
  const pointsValue = parseFloat(trip.pointsValue)
  const remainingBalance = totalAmount - amountPaid - pointsValue

  const origin = trip.origin || trip.bus?.route?.origin || "Unknown"
  const destination =
    trip.destination || trip.bus?.route?.destination || "Unknown"

  // Get amenities icons and labels
  const amenities = trip.bus?.amenities || []
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

  // Handle copy booking code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(trip.bookingCode)
    setCopied(true)
    // toast({
    //   title: "Copied!",
    //   description: "Booking code copied to clipboard",
    // })
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle share via various methods
  const handleShare = async (
    method: "copy" | "whatsapp" | "email" | "sms" | "more",
  ) => {
    setIsSharing(true)
    setShareVia(method)

    const shareText = `🚌 HabeshaGo Ticket\n\nFrom: ${origin}\nTo: ${destination}\nDate: ${format(departureDate, "MMM d, yyyy")}\nTime: ${format(departureDate, "h:mm a")}\nBooking Code: ${trip.bookingCode}\n\nView ticket: https://habeshago.com/ticket/${trip.bookingCode}`

    try {
      switch (method) {
        case "copy":
          await navigator.clipboard.writeText(shareText)
          // toast({
          //   title: "Copied to clipboard!",
          //   description: "Ticket details copied successfully",
          // })
          break
        case "whatsapp":
          window.open(
            `https://wa.me/?text=${encodeURIComponent(shareText)}`,
            "_blank",
          )
          break
        case "email":
          window.open(
            `mailto:?subject=My HabeshaGo Ticket&body=${encodeURIComponent(shareText)}`,
            "_blank",
          )
          break
        case "sms":
          window.open(`sms:?body=${encodeURIComponent(shareText)}`, "_blank")
          break
        case "more":
          if (navigator.share) {
            await navigator.share({
              title: "HabeshaGo Ticket",
              text: shareText,
              url: `https://habeshago.com/ticket/${trip.bookingCode}`,
            })
          } else {
            handleCopyCode()
          }
          break
      }
    } catch (error) {
      console.error("Share failed:", error)
      // toast({
      //   title: "Share failed",
      //   description: "Please try again or copy manually",
      //   variant: "destructive",
      // })
    } finally {
      setIsSharing(false)
      setShareVia(null)
    }
  }

  // Handle download ticket
  const handleDownload = () => {
    // toast({
    //   title: "Downloading ticket...",
    //   description: "Your ticket will be downloaded shortly",
    // })
    // Implement actual download logic here
  }

  // Handle print ticket
  const handlePrint = () => {
    window.print()
  }

  // Check if ticket is expiring soon
  const hoursUntilExpiry = Math.floor(
    (validUntil.getTime() - Date.now()) / (1000 * 60 * 60),
  )
  const isExpiringSoon = hoursUntilExpiry > 0 && hoursUntilExpiry < 24

  // Calculate seat occupancy
  const totalSeats = trip.bus?.capacity || 50
  const bookedSeats = trip.seatsBooked || 0
  const occupancyPercentage = (bookedSeats / totalSeats) * 100

  // Get bus status color
  const getBusStatusColor = () => {
    if (trip.checkedIn) return "text-green-600 bg-green-100"
    if (isExpiringSoon) return "text-orange-600 bg-orange-100"
    return "text-blue-600 bg-blue-100"
  }

  return (
    <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <TooltipProvider>
        <div className="h-full">
          {/* Sticky Header with Actions */}
          <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-600 via-orange-600 to-amber-600 text-white p-4 shadow-lg">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm animate-pulse">
                    <TicketIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl font-bold text-white flex items-center gap-2">
                      HabeshaGo E-Ticket
                      {trip.sharedAt && (
                        <Badge className="bg-purple-500 text-white border-0 text-xs">
                          <Share2 className="h-3 w-3 mr-1" />
                          Shared
                        </Badge>
                      )}
                    </SheetTitle>
                    <div className="flex items-center gap-2 text-amber-100 text-sm">
                      <ShieldCheck className="h-3 w-3" />
                      <span>
                        Booking #{trip.bookingCode.slice(0, 8).toUpperCase()}
                      </span>
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
                        disabled={isSharing}
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
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/user/booking/share/${trip.id}`)
                        }
                        className="gap-3 cursor-pointer"
                      >
                        <Button className="w-full mx-0 cursor-pointer">
                          <UsersRound className="h-4 w-4" /> Share with Friends
                        </Button>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleShare("copy")}
                        className="gap-3 cursor-pointer"
                      >
                        <Copy className="h-4 w-4" /> Copy to Clipboard
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleShare("whatsapp")}
                        className="gap-3 cursor-pointer"
                      >
                        <MessageCircle className="h-4 w-4 text-green-600" />{" "}
                        WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleShare("email")}
                        className="gap-3 cursor-pointer"
                      >
                        <Mail className="h-4 w-4 text-blue-600" /> Email
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleShare("sms")}
                        className="gap-3 cursor-pointer"
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
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Download Ticket</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Print Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrint}
                        className="rounded-full bg-white/10 hover:bg-white/20 text-white h-9 w-9"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Print Ticket</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Status Badge */}
                  <Badge
                    className={cn(
                      "ml-2 border-0 font-bold px-3 py-1.5",
                      trip.status === "CONFIRMED"
                        ? "bg-emerald-500 text-white"
                        : trip.status === "COMPLETED"
                          ? "bg-blue-500 text-white"
                          : "bg-red-500 text-white",
                    )}
                  >
                    {trip.status}
                  </Badge>
                </div>
              </div>
            </SheetHeader>

            {/* Progress Bar for Expiry */}
            {!trip.checkedIn && !isExpiringSoon && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-amber-100 mb-1">
                  <span>Valid until {format(validUntil, "MMM d, h:mm a")}</span>
                  <span>
                    {formatDistanceToNow(validUntil, { addSuffix: true })}
                  </span>
                </div>
                <Progress
                  value={(hoursUntilExpiry / 24) * 100}
                  className="h-1 bg-white/20"
                />
              </div>
            )}
          </div>

          {/* Main Content with Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
            <TabsList className="grid grid-cols-4 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <TabsTrigger
                value="ticket"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
              >
                <TicketIcon className="h-4 w-4 mr-2" />
                Ticket
              </TabsTrigger>
              <TabsTrigger
                value="journey"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
              >
                <Map className="h-4 w-4 mr-2" />
                Journey
              </TabsTrigger>
              <TabsTrigger
                value="payment"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Payment
              </TabsTrigger>
              <TabsTrigger
                value="support"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
              >
                <LifeBuoy className="h-4 w-4 mr-2" />
                Support
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ticket" className="space-y-4 mt-0">
              {/* QR Code Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex items-start gap-6">
                  {/* QR Code Section */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src={trip.qrCode}
                        alt="Ticket QR Code"
                        className="w-48 h-48 object-contain border-2 border-gray-200 dark:border-gray-700 rounded-xl p-2"
                      />
                      <button
                        onClick={() => setShowQRDetails(!showQRDetails)}
                        className="absolute -top-2 -right-2 p-1.5 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-colors"
                      >
                        {showQRDetails ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    {/* QR Details */}
                    {showQRDetails && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs">
                        <p className="font-mono text-gray-600 dark:text-gray-400 break-all">
                          {qrData}
                        </p>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyCode}
                        className="flex-1 gap-1 text-xs"
                      >
                        {copied ? (
                          <>
                            <CheckCheck className="h-3 w-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy Code
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(trip.qrCode, "_blank")}
                        className="flex-1 gap-1 text-xs"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Full
                      </Button>
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {origin} → {destination}
                      </h3>
                      <Badge className={cn("border-0", getBusStatusColor())}>
                        {trip.checkedIn
                          ? "Checked In"
                          : isExpiringSoon
                            ? "Expiring Soon"
                            : "Active"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Passenger</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {trip.userId ? "John Doe" : "Guest"}{" "}
                          {/* You might want to get actual user name */}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Seats</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {trip.seatsBooked}{" "}
                          {trip.seatsBooked === 1 ? "Seat" : "Seats"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Booking Date
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {format(createdAt, "MMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Valid Until
                        </p>
                        <p
                          className={cn(
                            "font-semibold",
                            isExpiringSoon
                              ? "text-orange-600"
                              : "text-gray-900 dark:text-white",
                          )}
                        >
                          {format(validUntil, "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>

                    {/* Amenities */}
                    {amenities.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-2">
                          {amenities.map((amenity) => {
                            const config = amenityConfig[amenity] || {
                              icon: Bus,
                              label: amenity,
                            }
                            const Icon = config.icon
                            return (
                              <Tooltip key={amenity}>
                                <TooltipTrigger asChild>
                                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{config.label}</p>
                                </TooltipContent>
                              </Tooltip>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Journey Timeline
                </h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-400 to-amber-400" />

                  <div className="space-y-6">
                    {/* Boarding */}
                    <div className="relative pl-10">
                      <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-100 dark:ring-orange-900/30" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Boarding at {trip.boardingStop}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(departureDate, "EEEE, MMMM d, yyyy")}
                        </p>
                        <p className="text-sm font-medium text-orange-600 mt-1">
                          {format(departureDate, "h:mm a")}
                        </p>
                      </div>
                    </div>

                    {/* Journey */}
                    <div className="relative pl-10">
                      <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-amber-400" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          En Route
                        </p>
                        <p className="text-xs text-gray-500">
                          Estimated travel time: {durationHours}h{" "}
                          {durationMinutes}m
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={45} className="h-1.5 w-32" />
                          <span className="text-xs text-gray-500">
                            In progress
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Alighting */}
                    <div className="relative pl-10">
                      <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-gray-300" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Alight at {trip.alightingStop}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(arrivalDate, "EEEE, MMMM d, yyyy")}
                        </p>
                        <p className="text-sm font-medium text-amber-600 mt-1">
                          {format(arrivalDate, "h:mm a")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bus Information */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Bus className="h-4 w-4 text-orange-500" />
                  Bus Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Bus Number</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {trip.bus?.busNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Capacity</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {trip.bus?.capacity || "N/A"} seats
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Available Seats</p>
                    <p className="font-semibold text-green-600">
                      {trip.bus?.availableSeats || "N/A"}
                    </p>
                  </div>
                  <div>
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
              </div>
            </TabsContent>

            <TabsContent value="journey" className="space-y-4 mt-0">
              {/* Route Map Visualization */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Map className="h-4 w-4 text-orange-500" />
                  Route Map
                </h3>

                <div className="relative h-48 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 rounded-xl mb-6 overflow-hidden">
                  {/* Placeholder for actual map */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Compass className="h-12 w-12 text-orange-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Interactive map coming soon
                      </p>
                    </div>
                  </div>

                  {/* Route line */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="none"
                  >
                    <line
                      x1="20%"
                      y1="30%"
                      x2="80%"
                      y2="70%"
                      stroke="#f97316"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                    />
                    <circle cx="20%" cy="30%" r="6" fill="#f97316" />
                    <circle cx="80%" cy="70%" r="6" fill="#fbbf24" />
                  </svg>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-xl">
                    <p className="text-xs text-orange-600 mb-1">Departure</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {origin}
                    </p>
                    <p className="text-sm text-gray-600">{trip.boardingStop}</p>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                    <p className="text-xs text-amber-600 mb-1">Arrival</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {destination}
                    </p>
                    <p className="text-sm text-gray-600">
                      {trip.alightingStop}
                    </p>
                  </div>
                </div>

                {trip.bus?.route?.distanceKm && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Distance:{" "}
                      <span className="font-bold">
                        {trip.bus.route.distanceKm} km
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Weather & Conditions */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  Travel Conditions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Weather</p>
                    <p className="font-semibold">☀️ Sunny</p>
                    <p className="text-xs text-gray-500">25°C / 77°F</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">
                      Road Conditions
                    </p>
                    <p className="font-semibold">🛣️ Good</p>
                    <p className="text-xs text-gray-500">No delays reported</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4 mt-0">
              {/* Payment Summary */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-orange-500" />
                  Payment Details
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Base Fare
                    </span>
                    <span className="font-medium">
                      {trip.currency} {totalAmount.toLocaleString()}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between py-2 text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        Discount ({discount}%)
                      </span>
                      <span>
                        -{trip.currency}{" "}
                        {(totalAmount - amountPaid).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {trip.pointsUsed > 0 && (
                    <div className="flex justify-between py-2 text-purple-600">
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        Points Used ({trip.pointsUsed})
                      </span>
                      <span>
                        -{trip.currency} {pointsValue.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <Separator className="my-2" />

                  <div className="flex justify-between py-2 font-bold">
                    <span>Total Paid</span>
                    <span className="text-orange-600">
                      {trip.currency} {amountPaid.toLocaleString()}
                    </span>
                  </div>

                  {remainingBalance > 0 && (
                    <div className="flex justify-between py-2 text-amber-600">
                      <span>Remaining Balance</span>
                      <span>
                        {trip.currency} {remainingBalance.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700 dark:text-green-400">
                        Payment confirmed via {trip.payment?.method || "Wallet"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Transaction ID: {trip.paymentId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-500" />
                    Invoice
                  </h3>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Invoice Number</p>
                      <p className="font-mono">
                        INV-{trip.id}-{trip.bookingCode.slice(0, 6)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p>{format(createdAt, "MMM d, yyyy")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="support" className="space-y-4 mt-0">
              {/* Support Options */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <LifeBuoy className="h-4 w-4 text-orange-500" />
                  24/7 Customer Support
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="h-auto p-4 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 border-0 justify-start">
                    <Phone className="h-5 w-5 text-orange-600 mr-3" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Call Us
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        +251 900 123 456
                      </p>
                    </div>
                  </Button>

                  <Button className="h-auto p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 border-0 justify-start">
                    <Mail className="h-5 w-5 text-blue-600 mr-3" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Email
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        support@habeshago.com
                      </p>
                    </div>
                  </Button>

                  <Button className="h-auto p-4 bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50 border-0 justify-start">
                    <MessageCircle className="h-5 w-5 text-green-600 mr-3" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        WhatsApp
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        +251 900 123 456
                      </p>
                    </div>
                  </Button>

                  <Button className="h-auto p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-950/50 border-0 justify-start">
                    <MessageCircle className="h-5 w-5 text-purple-600 mr-3" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Live Chat
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Average response: 2min
                      </p>
                    </div>
                  </Button>
                </div>

                {/* FAQ Section */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Frequently Asked Questions
                  </h4>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left"
                    >
                      <HelpCircle className="h-4 w-4 mr-2 text-gray-500" />
                      How do I change my boarding point?
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left"
                    >
                      <HelpCircle className="h-4 w-4 mr-2 text-gray-500" />
                      What items are allowed on board?
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left"
                    >
                      <HelpCircle className="h-4 w-4 mr-2 text-gray-500" />
                      Can I cancel my ticket?
                    </Button>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Journey Notifications
                        </p>
                        <p className="text-xs text-gray-500">
                          Get updates about your trip
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Secure Ticket
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
      </TooltipProvider>
    </SheetContent>
  )
}
