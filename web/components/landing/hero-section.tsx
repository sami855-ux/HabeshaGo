"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  MapPin,
  Calendar,
  Users,
  Repeat,
  Navigation as NavigationIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useAppSelector } from "@/store"

const POPULAR_CITIES = [
  "Addis Ababa",
  "Hawassa",
  "Bahir Dar",
  "Gondar",
  "Dire Dawa",
  "Adama",
  "Jimma",
  "Mekelle",
  "Bishoftu",
  "Arba Minch",
  "Dessie",
  "Shashamane",
]

export function HeroSection() {
  const router = useRouter()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 80])
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated, user } = useAppSelector((state) => state.user)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [fromCity, setFromCity] = useState("Addis Ababa")
  const [toCity, setToCity] = useState("Hawassa")
  const [travelDate, setTravelDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  const [passengers, setPassengers] = useState("1")

  const [tickerIndex, setTickerIndex] = useState(0)
  const tickerTexts = [
    "Instant Seat Selection on Ethiopia's Leading Bus Fleet",
    "Paperless Travel with Secure Digital QR Boarding Passes",
    "Direct Telebirr, CBE Birr & Chapa Payment Integration",
    "Live GPS Tracking & Accurate Arrival Forecasts",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerTexts.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [tickerTexts.length])

  const handleSwapCities = () => {
    const temp = fromCity
    setFromCity(toCity)
    setToCity(temp)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = new URLSearchParams({
      from: fromCity,
      to: toCity,
      date: travelDate,
      passengers,
    })
    const isAuth = mounted && isAuthenticated && !!user
    if (isAuth) {
      const element = document.getElementById("features")
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    } else {
      router.push("/login")
    }
  }

  return (
    <section className="relative w-full min-h-[84vh] sm:min-h-[88vh] overflow-hidden pt-24 sm:pt-28 pb-16 flex flex-col justify-center">
      {/* Background Image (User's bg.png) - Clearly Visible */}
      <motion.div
        style={{ y, backgroundImage: "url('/bg.png')" }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform scale-105"
      />

      {/* Gentle Gradient: Keeps the background image clearly visible while smoothly blending to white at the bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-white/20 to-white/95" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Main Headline & Clean Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-orange-600 mb-2.5 drop-shadow-xs">
            Ethiopia Transit &amp; Ticket Booking
          </p>

          <h1
            className="font-jakarta text-4xl sm:text-6xl md:text-7xl font-extrabold text-gray-950 tracking-[-0.03em] leading-[1.12] mb-4 drop-shadow-xs"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Travel Across Ethiopia with{" "}
            <span className="text-orange-500">
              Smarter, Seamless
            </span>{" "}
            Bus Booking.
          </h1>

          <div className="h-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={tickerIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="text-sm sm:text-base text-gray-800 font-semibold drop-shadow-xs"
              >
                {tickerTexts[tickerIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Clean Light-Theme Search Box with rounded-md */}
        <form
          onSubmit={handleSearch}
          className="rounded-md bg-white shadow-xl shadow-gray-900/10 p-5 sm:p-6 space-y-3 border border-gray-200"
        >
          {/* Row 1: Departure & Destination with Swap */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-2.5 sm:gap-3 items-center">
            {/* Departure Box */}
            <div className="md:col-span-5 px-3.5 py-3 rounded-md bg-gray-50 hover:bg-gray-100/80 border border-gray-200 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Departure (From)
              </label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                <select
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  className="w-full bg-transparent text-gray-900 font-bold text-sm sm:text-base focus:outline-none cursor-pointer appearance-none"
                >
                  {POPULAR_CITIES.map((city) => (
                    <option key={`from-${city}`} value={city} className="bg-white text-gray-900 font-medium">
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex items-center justify-center -my-1 md:my-0">
              <button
                type="button"
                onClick={handleSwapCities}
                title="Swap cities"
                className="w-10 h-10 rounded-md bg-gray-100 hover:bg-orange-500 text-gray-700 hover:text-white flex items-center justify-center transition-all shadow-xs active:scale-95 border border-gray-200"
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Destination Box */}
            <div className="md:col-span-5 px-3.5 py-3 rounded-md bg-gray-50 hover:bg-gray-100/80 border border-gray-200 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Destination (To)
              </label>
              <div className="flex items-center gap-2 mt-1">
                <NavigationIcon className="w-4 h-4 text-amber-500 shrink-0" />
                <select
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  className="w-full bg-transparent text-gray-900 font-bold text-sm sm:text-base focus:outline-none cursor-pointer appearance-none"
                >
                  {POPULAR_CITIES.map((city) => (
                    <option key={`to-${city}`} value={city} className="bg-white text-gray-900 font-medium">
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Travel Date, Seats, and Find Buses CTA */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-center">
            {/* Travel Date */}
            <div className="md:col-span-5 px-3.5 py-3 rounded-md bg-gray-50 hover:bg-gray-100/80 border border-gray-200 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Travel Date
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
                <input
                  type="date"
                  value={travelDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-transparent text-gray-900 font-bold text-xs sm:text-sm focus:outline-none cursor-pointer [color-scheme:light]"
                />
              </div>
            </div>

            {/* Seats / Passengers */}
            <div className="md:col-span-3 px-3.5 py-3 rounded-md bg-gray-50 hover:bg-gray-100/80 border border-gray-200 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Seats
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Users className="w-4 h-4 text-gray-500 shrink-0" />
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="w-full bg-transparent text-gray-900 font-bold text-xs sm:text-sm focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="1">1 Passenger</option>
                  <option value="2">2 Passengers</option>
                  <option value="3">3 Passengers</option>
                  <option value="4">4+ Passengers</option>
                </select>
              </div>
            </div>

            {/* Find Buses CTA Button with rounded-md */}
            <div className="md:col-span-4">
              <Button
                type="submit"
                className="w-full h-[52px] bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-sm sm:text-base rounded-md shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98]"
              >
                <span>Find Buses</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
