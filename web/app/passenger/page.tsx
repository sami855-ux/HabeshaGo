"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Compass,
  MapPin,
  Clock,
  Sparkles,
  Shield,
  PhoneCall,
  Car,
  Bus,
  Zap,
  CheckCircle2,
  Bookmark,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PassengerHeader } from "@/components/passenger/passenger-header"
import {
  BookingEngine,
  BookingState,
  RideOption,
} from "@/components/passenger/booking-engine"
import { RouteMapPreview } from "@/components/passenger/route-map-preview"
import { LiveTripTracker } from "@/components/passenger/live-trip-tracker"
import { DigitalTicketModal } from "@/components/passenger/digital-ticket-modal"
import {
  CorridorDepartureBoard,
  CorridorRoute,
} from "@/components/passenger/corridor-departure-board"
import { PassengerWalletModal } from "@/components/passenger/passenger-wallet"
import { toast } from "sonner"

export default function PassengerPage() {
  const [walletBalance, setWalletBalance] = React.useState<number>(1450.0)
  const [activeTrip, setActiveTrip] = React.useState<{
    origin: string
    destination: string
    vehicleName: string
    fareETB: number
    plate: string
  } | null>(null)

  const [origin, setOrigin] = React.useState("Bole Medhanealem, Addis Ababa")
  const [destination, setDestination] = React.useState("Meskel Square, Central Addis")
  const [ticketModalOpen, setTicketModalOpen] = React.useState(false)
  const [walletModalOpen, setWalletModalOpen] = React.useState(false)

  const [activeTicket, setActiveTicket] = React.useState({
    id: "HG-ET-90428",
    passengerName: "Selamawit Tadesse",
    routeFrom: "Bole Medhanealem",
    routeTo: "Meskel Square Central",
    seatNumber: "04",
    departureTime: "Today, 11:45 AM",
    vehicle: "Toyota HiAce Express Shuttle",
    plate: "AA-3-94281",
    fareETB: 28,
    paymentChannel: "Telebirr SuperApp",
  })

  const handleConfirmBooking = (booking: BookingState, selectedRide: RideOption) => {
    const fare = Math.max(0, selectedRide.priceETB * booking.passengers - booking.appliedDiscount)

    // Deduct from wallet if using wallet/telebirr
    setWalletBalance((prev) => Math.max(0, prev - fare))

    setActiveTrip({
      origin: booking.origin,
      destination: booking.destination,
      vehicleName: selectedRide.name,
      fareETB: fare,
      plate: "AA-3-94281",
    })

    setActiveTicket({
      id: `HG-ET-${Math.floor(10000 + Math.random() * 90000)}`,
      passengerName: "Selamawit Tadesse",
      routeFrom: booking.origin.split(",")[0],
      routeTo: booking.destination.split(",")[0],
      seatNumber: "04",
      departureTime: "Departing in 3 mins",
      vehicle: selectedRide.name,
      plate: "AA-3-94281",
      fareETB: fare,
      paymentChannel: booking.paymentMethod.toUpperCase(),
    })
  }

  const handleSelectCorridorRoute = (route: CorridorRoute) => {
    setOrigin(route.from)
    setDestination(route.to)
    setActiveTicket({
      id: `HG-CR-${Math.floor(10000 + Math.random() * 90000)}`,
      passengerName: "Selamawit Tadesse",
      routeFrom: route.from,
      routeTo: route.to,
      seatNumber: "07",
      departureTime: `In ${route.nextDepartureMinutes} mins`,
      vehicle: route.lineName,
      plate: "AA-3-81092",
      fareETB: route.fareETB,
      paymentChannel: "Telebirr Express",
    })
    setTicketModalOpen(true)
    toast.success(`Seat reserved on ${route.lineName}!`)
  }

  const savedPlaces = [
    { label: "Home", address: "CMC Michael, Addis Ababa", icon: "🏠" },
    { label: "Work", address: "Kazanchis UNECA, Addis Ababa", icon: "🏢" },
    { label: "Airport", address: "Bole Int'l Terminal 2", icon: "✈️" },
    { label: "Campus", address: "Addis Ababa University 6 Kilo", icon: "🎓" },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-inter">
      {/* Top Passenger Header */}
      <PassengerHeader
        walletBalance={walletBalance}
        activeTicketCount={activeTrip ? 1 : 0}
        onOpenWallet={() => setWalletModalOpen(true)}
        onOpenTickets={() => setTicketModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 font-inter">
        {/* Welcome Greeting Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl font-inter">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Commute Across Addis Ababa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-inter">
              Good morning, Selamawit 👋
            </h1>
            <p className="text-white/90 text-sm mt-1 max-w-xl">
              Book fast corridor minibuses, private city comfort taxis, or intercity coach rides with Telebirr instant boarding.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <Button
              onClick={() => setTicketModalOpen(true)}
              className="bg-white text-orange-600 hover:bg-white/90 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md"
            >
              My QR Boarding Pass
            </Button>
          </div>
        </div>

        {/* Quick Saved Destinations Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Quick Rides:
          </span>
          {savedPlaces.map((place) => (
            <button
              key={place.label}
              onClick={() => {
                setDestination(place.address)
                toast.info(`Destination set to ${place.label}`)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:border-orange-500 hover:text-orange-600 transition-all shadow-xs shrink-0"
            >
              <span>{place.icon}</span>
              <span>{place.label}</span>
            </button>
          ))}
        </div>

        {/* Main Two-Column Booking Engine & Map Preview */}
        <div id="book-ride" className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Multimodal Booking Engine */}
          <div className="lg:col-span-7 space-y-6">
            <BookingEngine
              onConfirmBooking={handleConfirmBooking}
              onOriginChange={setOrigin}
              onDestinationChange={setDestination}
            />
          </div>

          {/* Right Column: Live Trip Tracker or Map Route Preview */}
          <div className="lg:col-span-5 space-y-6">
            {activeTrip ? (
              <LiveTripTracker
                origin={activeTrip.origin}
                destination={activeTrip.destination}
                vehicleName={activeTrip.vehicleName}
                plateNumber={activeTrip.plate}
                fareETB={activeTrip.fareETB}
                onCancelTrip={() => setActiveTrip(null)}
                onOpenPass={() => setTicketModalOpen(true)}
              />
            ) : null}

            <RouteMapPreview
              origin={origin}
              destination={destination}
            />

            {/* Safety & Telebirr Guarantee Banner */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900 dark:text-white">
                  HabeshaGo Safety & Verified Drivers
                </div>
                <p className="text-slate-500 mt-0.5">
                  Every driver is authenticated with Kebele ID and vehicle inspection. Instant refunds supported via Telebirr & Chapa.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Corridor Departure Board */}
        <CorridorDepartureBoard onSelectRoute={handleSelectCorridorRoute} />
      </main>

      {/* Digital Ticket Modal */}
      <DigitalTicketModal
        open={ticketModalOpen}
        onOpenChange={setTicketModalOpen}
        ticketData={activeTicket}
      />

      {/* Passenger Wallet Modal */}
      <PassengerWalletModal
        open={walletModalOpen}
        onOpenChange={setWalletModalOpen}
        balance={walletBalance}
        onTopUpSuccess={(amount) => setWalletBalance((prev) => prev + amount)}
      />

      {/* Footer Note */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} HabeshaGo Inc. Official Passenger Commute Portal</div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-600 font-medium">● 4G / Telebirr Live Connection</span>
            <span>24/7 Ethiopian Support: 8844</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
