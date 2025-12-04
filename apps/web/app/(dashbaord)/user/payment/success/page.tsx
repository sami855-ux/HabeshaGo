"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle2,
  QrCode,
  Download,
  Ticket,
  Clock,
  Smartphone,
  Wallet,
  Share2,
  Copy,
  Mail,
  MapPin,
  Users,
  Calendar,
  Navigation,
  Shield,
  Bell,
  X,
  Sparkles,
  Home,
  ShoppingBag,
  Smartphone as SmartphoneIcon,
  WifiOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Confetti from "react-confetti"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [showTicketDetails, setShowTicketDetails] = useState(false)
  const [showAddToWallet, setShowAddToWallet] = useState(false)
  const [showOfflineSave, setShowOfflineSave] = useState(false)
  const [showNextActions, setShowNextActions] = useState(false)
  const [copied, setCopied] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(45)
  const [showExpiryWarning, setShowExpiryWarning] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  })

  const bookingDetails = {
    bookingId: "ET7890-XYZ123",
    transactionId: "TXN78901234",
    from: "New York",
    fromStation: "Port Authority Bus Terminal",
    to: "Boston",
    toStation: "South Station Bus Terminal",
    date: "Dec 15, 2024",
    time: "08:30 AM",
    arrivalTime: "01:45 PM",
    duration: "5h 15m",
    bus: "Express Travels ET-7890",
    busType: "AC Sleeper (2+1)",
    seats: ["A1", "A2", "A3"],
    seatType: "Window Seats",
    total: 1407,
    expiryTime: "08:30 AM",
    paymentMethod: "Wallet",
  }

  // Set window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Show warning when less than 5 minutes
  useEffect(() => {
    if (timeRemaining <= 5 && timeRemaining > 0) {
      setShowExpiryWarning(true)
    }
  }, [timeRemaining])

  // Auto-show next actions after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNextActions(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Auto-prompt for wallet addition after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showAddToWallet && !showOfflineSave) {
        setShowAddToWallet(true)
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [showAddToWallet, showOfflineSave])

  // Stop confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleCopyBookingId = () => {
    navigator.clipboard.writeText(bookingDetails.bookingId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenQR = () => {
    setShowQRDialog(true)
  }

  const handleDownloadReceipt = () => {
    setShowReceiptDialog(true)
    // Simulate download
    setTimeout(() => {
      setShowReceiptDialog(false)
      alert("Receipt downloaded successfully!")
    }, 1000)
  }

  const handleSaveOffline = () => {
    setShowOfflineSave(true)
  }

  const handleAddToWallet = () => {
    setShowAddToWallet(true)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Bus Ticket",
          text: `Check out my bus ticket from ${bookingDetails.from} to ${bookingDetails.to}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Sharing cancelled")
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const handleTrackBus = () => {
    router.push("/track")
  }

  const handleBuyAnother = () => {
    router.push("/")
  }

  const handleGoHome = () => {
    router.push("/")
  }

  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}h ${mins}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 overflow-hidden rounded-2xl">
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={1000}
          gravity={0.1}
          colors={["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"]}
        />
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl relative">
        {/* Success Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          {/* Animated Checkmark */}
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="size-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto"
            >
              <CheckCircle2 className="size-12 text-green-600" />
            </motion.div>
          </div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Enjoy your ride! Receipt sent to your email.
            </p>
          </motion.div>

          {/* Booking ID */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="text-sm text-muted-foreground">Booking ID</div>
            <div className="flex items-center gap-3">
              <div className="font-mono text-2xl font-bold bg-muted px-4 py-2 rounded-lg">
                {bookingDetails.bookingId}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyBookingId}
                className="gap-2"
              >
                <Copy className="size-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </motion.div>

          {/* Main Success Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 border-green-500/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Booking Confirmed</span>
                  <Badge className="bg-green-500 hover:bg-green-600 gap-2">
                    <CheckCircle2 className="size-3" />
                    Ready to Board
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Your e-ticket has been generated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* QR Code Ticket */}
                  <Card
                    className="hover:border-primary cursor-pointer group"
                    onClick={handleOpenQR}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <QrCode className="size-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">Show QR</div>
                          <div className="text-xs text-muted-foreground">
                            Present to conductor
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Download Receipt */}
                  <Card
                    className="hover:border-primary cursor-pointer group"
                    onClick={handleDownloadReceipt}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                          <Download className="size-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">Download Receipt</div>
                          <div className="text-xs text-muted-foreground">
                            PDF with transaction details
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ticket Details */}
                  <Card
                    className="hover:border-primary cursor-pointer group"
                    onClick={() => setShowTicketDetails(true)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                          <Ticket className="size-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">View Details</div>
                          <div className="text-xs text-muted-foreground">
                            Route, seat & validity
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Countdown Timer */}
                {timeRemaining > 0 && (
                  <Card
                    className={cn(
                      "border-2",
                      timeRemaining <= 5
                        ? "border-amber-500/20 bg-amber-500/5"
                        : "border-green-500/20"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "size-10 rounded-lg flex items-center justify-center",
                              timeRemaining <= 5
                                ? "bg-amber-500/10"
                                : "bg-green-500/10"
                            )}
                          >
                            <Clock
                              className={cn(
                                "size-5",
                                timeRemaining <= 5
                                  ? "text-amber-600"
                                  : "text-green-600"
                              )}
                            />
                          </div>
                          <div>
                            <div className="font-semibold">
                              Board within {formatTime(timeRemaining)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Ticket expires at {bookingDetails.expiryTime}
                            </div>
                          </div>
                        </div>
                        {timeRemaining <= 5 && (
                          <Button size="sm" onClick={handleOpenQR}>
                            Open QR
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Additional Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Save Offline */}
                  <Card
                    className="hover:border-primary cursor-pointer group"
                    onClick={handleSaveOffline}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-gray-500/10 flex items-center justify-center group-hover:bg-gray-500/20 transition-colors">
                          <WifiOff className="size-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">Save Offline</div>
                          <div className="text-sm text-muted-foreground">
                            Access without internet
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Add to Wallet */}
                  <Card
                    className="hover:border-primary cursor-pointer group"
                    onClick={handleAddToWallet}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                          <Wallet className="size-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">Add to Wallet</div>
                          <div className="text-sm text-muted-foreground">
                            Quick access from phone
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Trip Summary */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          From
                        </div>
                        <div className="font-semibold">
                          {bookingDetails.from}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {bookingDetails.fromStation}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">To</div>
                        <div className="font-semibold">{bookingDetails.to}</div>
                        <div className="text-xs text-muted-foreground">
                          {bookingDetails.toStation}
                        </div>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Date & Time
                        </div>
                        <div className="font-semibold">
                          {bookingDetails.date} • {bookingDetails.time}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Seats
                        </div>
                        <div className="font-semibold">
                          {bookingDetails.seats.join(", ")}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="w-full" size="lg" onClick={handleGoHome}>
                  <Home className="mr-2 size-5" />
                  Back to Home
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Next Actions Smart Prompt */}
          <AnimatePresence>
            {showNextActions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-4"
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className="font-semibold">
                        What would you like to do next?
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Tap any action to continue
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={handleOpenQR}
                      >
                        <QrCode className="size-4" />
                        Show QR
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={handleTrackBus}
                      >
                        <Navigation className="size-4" />
                        Track Bus
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={handleBuyAnother}
                      >
                        <ShoppingBag className="size-4" />
                        Buy Another
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={handleShare}
                      >
                        <Share2 className="size-4" />
                        Share Ticket
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <Badge variant="outline" className="gap-2">
              <Bell className="size-3" />
              Live tracking enabled
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Mail className="size-3" />
              E-ticket sent to email
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Shield className="size-3" />
              100% Secure
            </Badge>
          </motion.div>
        </motion.div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="size-5" />
              QR Code Ticket
            </DialogTitle>
            <DialogDescription>
              Present this QR to the conductor for boarding
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 flex flex-col items-center justify-center">
            <div className="p-4 bg-white rounded-xl border shadow-inner mb-4">
              <div className="grid grid-cols-8 gap-1 size-48">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "aspect-square rounded-sm",
                      Math.random() > 0.5
                        ? "bg-foreground"
                        : "bg-transparent border border-border"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="font-mono font-bold">
                {bookingDetails.bookingId}
              </div>
              <p className="text-sm text-muted-foreground">
                Scans contain ticket ID, route and expiry
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowQRDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowQRDialog(false)
                // Open full screen QR
              }}
            >
              Open Full Screen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Download Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="size-5" />
              Download Receipt
            </DialogTitle>
            <DialogDescription>
              Download PDF receipt for transaction #
              {bookingDetails.transactionId}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Includes transaction ID, payment method and breakdown
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Download className="size-4 text-blue-600" />
                </div>
                <span className="font-medium">Receipt Details</span>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Transaction:</span>
                  <span className="font-mono">
                    {bookingDetails.transactionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-bold">ETB {bookingDetails.total}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Saved to your device for later reference
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReceiptDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleDownloadReceipt}>Download PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Dropdown */}
      <DropdownMenu
        open={showTicketDetails}
        onOpenChange={setShowTicketDetails}
      >
        <DropdownMenuTrigger asChild>
          <div className="hidden" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-64">
          <div className="p-4">
            <div className="font-semibold mb-2">Ticket Details</div>
            <div className="text-xs text-muted-foreground mb-4">
              Route, scheduled time, seat and validity
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="size-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {bookingDetails.from} → {bookingDetails.to}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {bookingDetails.fromStation} to {bookingDetails.toStation}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {bookingDetails.date} • {bookingDetails.time}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Arrives {bookingDetails.arrivalTime} (
                    {bookingDetails.duration})
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="size-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    Seats: {bookingDetails.seats.join(", ")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {bookingDetails.seatType} • {bookingDetails.busType}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <DropdownMenuItem
            onClick={handleCopyBookingId}
            className="gap-2 cursor-pointer py-3"
          >
            <Copy className="size-4" />
            {copied ? "Copied!" : "Copy Ticket ID"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleShare}
            className="gap-2 cursor-pointer py-3"
          >
            <Share2 className="size-4" />
            Share Ticket
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowTicketDetails(false)}
            className="gap-2 cursor-pointer py-3"
          >
            <X className="size-4" />
            Close
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add to Wallet Dialog */}

      {/* Save Offline Dialog */}
      <Dialog open={showOfflineSave} onOpenChange={setShowOfflineSave}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WifiOff className="size-5" />
              Save Ticket Offline
            </DialogTitle>
            <DialogDescription>
              Access your QR without an internet connection
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="size-4 text-green-600" />
                <span className="font-medium">Secure & Encrypted</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Will store a secure, encrypted copy on device
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Available offline only on this device
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowOfflineSave(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowOfflineSave(false)
                alert("Ticket saved offline!")
              }}
            >
              Save Offline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expiry Warning Dialog */}
      <Dialog open={showExpiryWarning} onOpenChange={setShowExpiryWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Clock className="size-5" />
              Ticket Expiring Soon!
            </DialogTitle>
            <DialogDescription>
              Board within {formatTime(timeRemaining)}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="text-center">
              <div className="text-lg font-bold mb-2">
                Ticket expires in {formatTime(timeRemaining)}
              </div>
              <div className="text-sm text-muted-foreground">
                Please proceed to boarding point
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowExpiryWarning(false)}
            >
              Dismiss
            </Button>
            <Button
              onClick={() => {
                setShowExpiryWarning(false)
                setShowQRDialog(true)
              }}
            >
              Open QR for Boarding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Apple Icon component
const AppleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.31-2.33 1.05-3.11z" />
  </svg>
)
