"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  Car,
  Bus,
  Zap,
  ParkingCircle,
  Users,
  Clock,
  Shield,
  CreditCard,
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle2,
  Calendar,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export interface RideOption {
  id: string
  name: string
  model: string
  type: "minibus" | "comfort" | "ev" | "intercity"
  seats: number
  etaMinutes: number
  priceETB: number
  originalPriceETB?: number
  tag?: string
  features: string[]
  icon: string
}

export interface BookingState {
  origin: string
  destination: string
  selectedRideId: string
  serviceType: "city" | "corridor" | "intercity" | "ev-parking"
  paymentMethod: "telebirr" | "chapa" | "cbe" | "cash"
  passengers: number
  promoCode: string
  appliedDiscount: number
}

interface BookingEngineProps {
  onConfirmBooking: (booking: BookingState, selectedRide: RideOption) => void
  onOriginChange?: (origin: string) => void
  onDestinationChange?: (destination: string) => void
}

const POPULAR_LOCATIONS = [
  "Bole Medhanealem, Addis Ababa",
  "Meskel Square, Central Addis",
  "Piassa (Churchill Ave)",
  "Kazanchis (UNECA Hub)",
  "CMC Michael Roundabout",
  "Megenagna Transit Terminal",
  "Addis Ababa Bole Int'l Airport",
  "Mexico Square Station",
  "Bole Bulbula Street",
]

const RIDE_OPTIONS: RideOption[] = [
  {
    id: "ride-minibus",
    name: "Economy Minibus Shuttle",
    model: "Toyota HiAce (Dolphin)",
    type: "minibus",
    seats: 14,
    etaMinutes: 3,
    priceETB: 28,
    originalPriceETB: 35,
    tag: "High Frequency",
    features: ["Corridor fast lanes", "Pay via Telebirr", "Fixed fare"],
    icon: "🚐",
  },
  {
    id: "ride-comfort",
    name: "City Comfort Taxi",
    model: "Toyota Belta / Corolla",
    type: "comfort",
    seats: 4,
    etaMinutes: 4,
    priceETB: 185,
    tag: "Private Ride",
    features: ["Air conditioned", "Door-to-door", "Top rated driver"],
    icon: "🚖",
  },
  {
    id: "ride-ev",
    name: "Habesha Green EV",
    model: "BYD Atto 3 Electric",
    type: "ev",
    seats: 4,
    etaMinutes: 6,
    priceETB: 155,
    tag: "Eco Friendly",
    features: ["Zero emissions", "Silent quiet cabin", "Special EV rebate"],
    icon: "⚡",
  },
  {
    id: "ride-intercity",
    name: "Intercity Express Coach",
    model: "Golden Dragon Luxury",
    type: "intercity",
    seats: 45,
    etaMinutes: 25,
    priceETB: 380,
    tag: "Highway Line",
    features: ["High-speed WiFi", "Reserved seat", "Luggage 30kg incl."],
    icon: "🚌",
  },
]

export function BookingEngine({
  onConfirmBooking,
  onOriginChange,
  onDestinationChange,
}: BookingEngineProps) {
  const [serviceType, setServiceType] = React.useState<"city" | "corridor" | "intercity" | "ev-parking">("city")
  const [origin, setOrigin] = React.useState("Bole Medhanealem, Addis Ababa")
  const [destination, setDestination] = React.useState("Meskel Square, Central Addis")
  const [selectedRideId, setSelectedRideId] = React.useState<string>("ride-minibus")
  const [passengers, setPassengers] = React.useState(1)
  const [paymentMethod, setPaymentMethod] = React.useState<"telebirr" | "chapa" | "cbe" | "cash">("telebirr")
  const [promoCode, setPromoCode] = React.useState("")
  const [promoApplied, setPromoApplied] = React.useState(false)
  const [discountAmount, setDiscountAmount] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [originSuggestionsOpen, setOriginSuggestionsOpen] = React.useState(false)
  const [destSuggestionsOpen, setDestSuggestionsOpen] = React.useState(false)

  const handleSwapLocations = () => {
    const temp = origin
    setOrigin(destination)
    setDestination(temp)
    onOriginChange?.(destination)
    onDestinationChange?.(temp)
    toast.info("Pickup and destination swapped")
  }

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "HABESHA" || promoCode.trim().toUpperCase() === "TELEBIRR") {
      setPromoApplied(true)
      setDiscountAmount(20)
      toast.success("Promo code applied! 20 ETB discount granted.")
    } else {
      toast.error("Invalid promo code. Try 'HABESHA' for 20 ETB off.")
    }
  }

  const selectedRide = RIDE_OPTIONS.find((r) => r.id === selectedRideId) || RIDE_OPTIONS[0]
  const baseTotal = selectedRide.priceETB * passengers
  const finalTotal = Math.max(0, baseTotal - discountAmount)

  const handleBook = () => {
    if (!origin.trim() || !destination.trim()) {
      toast.error("Please enter both pickup and destination locations")
      return
    }
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      onConfirmBooking(
        {
          origin,
          destination,
          selectedRideId,
          serviceType,
          paymentMethod,
          passengers,
          promoCode: promoApplied ? promoCode : "",
          appliedDiscount: discountAmount,
        },
        selectedRide
      )
      toast.success(`Trip requested! Driver dispatched for ${selectedRide.name}.`)
    }, 700)
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden transition-all font-inter">
      {/* Service Tabs (Uber / Citymapper inspired) */}
      <div className="grid grid-cols-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-1.5 gap-1">
        <button
          type="button"
          onClick={() => setServiceType("city")}
          className={cn(
            "flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            serviceType === "city"
              ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Car className="w-4 h-4" />
          <span>City Ride</span>
        </button>

        <button
          type="button"
          onClick={() => setServiceType("corridor")}
          className={cn(
            "flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            serviceType === "corridor"
              ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Bus className="w-4 h-4" />
          <span>Corridor Bus</span>
        </button>

        <button
          type="button"
          onClick={() => setServiceType("intercity")}
          className={cn(
            "flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            serviceType === "intercity"
              ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Navigation className="w-4 h-4" />
          <span>Intercity</span>
        </button>

        <button
          type="button"
          onClick={() => setServiceType("ev-parking")}
          className={cn(
            "flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            serviceType === "ev-parking"
              ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Zap className="w-4 h-4" />
          <span>EV & Parking</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Origin & Destination Inputs with Swap */}
        <div className="relative space-y-3 bg-slate-50/80 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          {/* Pickup Input */}
          <div className="relative">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
              Pickup Point
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center justify-center pointer-events-none">
                <span className="size-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              </div>
              <Input
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value)
                  onOriginChange?.(e.target.value)
                }}
                onFocus={() => setOriginSuggestionsOpen(true)}
                placeholder="Enter pickup location (e.g. Bole Medhanealem)"
                className="pl-9 pr-4 h-11 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white text-sm"
              />
            </div>
            {originSuggestionsOpen && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-2 max-h-48 overflow-y-auto">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1">Popular Pickup Spots</div>
                {POPULAR_LOCATIONS.slice(0, 4).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setOrigin(loc)
                      onOriginChange?.(loc)
                      setOriginSuggestionsOpen(false)
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                  >
                    <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span className="truncate">{loc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button Absolute */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
            <button
              type="button"
              onClick={handleSwapLocations}
              className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-300 hover:text-orange-600 hover:scale-105 active:scale-95 transition-all"
              title="Swap pickup and destination"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Input */}
          <div className="relative">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
              Where to?
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center justify-center pointer-events-none">
                <span className="size-2.5 rounded-full bg-orange-500 ring-4 ring-orange-500/20" />
              </div>
              <Input
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value)
                  onDestinationChange?.(e.target.value)
                }}
                onFocus={() => setDestSuggestionsOpen(true)}
                placeholder="Enter destination (e.g. Meskel Square)"
                className="pl-9 pr-4 h-11 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white text-sm"
              />
            </div>
            {destSuggestionsOpen && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-2 max-h-48 overflow-y-auto">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1">Popular Destinations</div>
                {POPULAR_LOCATIONS.slice(4).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setDestination(loc)
                      onDestinationChange?.(loc)
                      setDestSuggestionsOpen(false)
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                  >
                    <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span className="truncate">{loc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ride Options Grid (Uber / Grab Inspired) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Choose Vehicle Class
            </label>
            <span className="text-xs text-slate-500">Addis Live Rates</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RIDE_OPTIONS.map((ride) => {
              const isSelected = selectedRideId === ride.id
              return (
                <div
                  key={ride.id}
                  onClick={() => setSelectedRideId(ride.id)}
                  className={cn(
                    "relative p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 text-left group",
                    isSelected
                      ? "border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 shadow-sm"
                      : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:scale-110 transition-transform">
                        {ride.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {ride.name}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {ride.model}
                        </p>
                      </div>
                    </div>
                    {ride.tag && (
                      <span className="text-[10px] font-semibold bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {ride.tag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {ride.seats} seats
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        {ride.etaMinutes} min away
                      </span>
                    </div>

                    <div className="text-right">
                      {ride.originalPriceETB && (
                        <span className="text-[11px] text-slate-400 line-through mr-1">
                          {ride.originalPriceETB} ETB
                        </span>
                      )}
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {ride.priceETB} ETB
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Passenger Count & Payment Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Passenger counter */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Passengers
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPassengers(num)}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all",
                    passengers === num
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {num} {num === 1 ? "seat" : "seats"}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMethod("telebirr")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all",
                  paymentMethod === "telebirr"
                    ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                )}
              >
                <span className="size-2 rounded-full bg-sky-500" />
                <span className="truncate">Telebirr SuperApp</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("chapa")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all",
                  paymentMethod === "chapa"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                )}
              >
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="truncate">Chapa Card</span>
              </button>
            </div>
          </div>
        </div>

        {/* Promo code bar */}
        <div className="flex items-center gap-2 pt-1">
          <Input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Promo code (e.g. HABESHA)"
            className="text-xs h-9"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleApplyPromo}
            disabled={promoApplied}
            className="text-xs whitespace-nowrap"
          >
            {promoApplied ? "Applied ✓" : "Apply"}
          </Button>
        </div>

        {/* Total & Confirm Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">
              Total ({passengers} {passengers > 1 ? "passengers" : "passenger"})
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {finalTotal} ETB
              </span>
              {discountAmount > 0 && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Saved {discountAmount} ETB
                </span>
              )}
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            onClick={handleBook}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold px-8 h-12 rounded-xl text-base shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Confirming Dispatch...</span>
            ) : (
              <>
                <span>Confirm & Request Ride</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
