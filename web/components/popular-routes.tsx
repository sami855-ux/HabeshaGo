"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  Clock,
  Wifi,
  Zap,
  Coffee,
  ShieldCheck,
  ChevronRight,
  Bus,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type RouteItem = {
  id: string
  origin: string
  originStation: string
  destination: string
  destStation: string
  region: "south" | "north" | "east" | "west"
  distance: string
  duration: string
  price: number
  operator: string
  coachType: string
  rating: number
  availableSeats: number
  departureTimes: string[]
  amenities: string[]
}

const POPULAR_ROUTES: RouteItem[] = [
  {
    id: "route-addis-hawassa",
    origin: "Addis Ababa",
    originStation: "Meskel Square / Kality Terminal",
    destination: "Hawassa",
    destStation: "Piassa Central Bus Terminal",
    region: "south",
    distance: "275 km",
    duration: "4h 15m",
    price: 450,
    operator: "Selam Luxury Coach",
    coachType: "Executive VIP (2x2 Recliner)",
    rating: 4.9,
    availableSeats: 8,
    departureTimes: ["06:00 AM", "08:30 AM", "01:30 PM"],
    amenities: ["Free WiFi", "AC", "USB Charger", "Bottled Water"],
  },
  {
    id: "route-addis-bahirdar",
    origin: "Addis Ababa",
    originStation: "Autobus Tera / Lamberet",
    destination: "Bahir Dar",
    destStation: "Lake Tana Main Terminal",
    region: "north",
    distance: "565 km",
    duration: "8h 30m",
    price: 850,
    operator: "Abay Intercity Bus",
    coachType: "Comfort Express",
    rating: 4.8,
    availableSeats: 5,
    departureTimes: ["05:30 AM", "06:30 AM"],
    amenities: ["Free WiFi", "AC", "Power Outlets", "Snacks"],
  },
  {
    id: "route-addis-gondar",
    origin: "Addis Ababa",
    originStation: "Autobus Tera Terminal",
    destination: "Gondar",
    destStation: "Fasiledes Historic Terminal",
    region: "north",
    distance: "735 km",
    duration: "11h 00m",
    price: 980,
    operator: "Golden Habesha Coach",
    coachType: "First Class Sleeper Seat",
    rating: 4.9,
    availableSeats: 12,
    departureTimes: ["05:00 AM", "06:00 AM"],
    amenities: ["AC", "On-board Movie", "USB Port", "Breakfast Box"],
  },
  {
    id: "route-addis-diredawa",
    origin: "Addis Ababa",
    originStation: "Kality / Mojo Expressway",
    destination: "Dire Dawa",
    destStation: "Kezira Transit Terminal",
    region: "east",
    distance: "450 km",
    duration: "7h 30m",
    price: 720,
    operator: "Ethio-Eastern Express",
    coachType: "Premium Highway Cruiser",
    rating: 4.7,
    availableSeats: 7,
    departureTimes: ["06:00 AM", "09:00 AM"],
    amenities: ["Free WiFi", "AC", "Recliner Seats"],
  },
  {
    id: "route-addis-adama",
    origin: "Addis Ababa",
    originStation: "Bole / Saris Terminal",
    destination: "Adama (Nazret)",
    destStation: "Adama Expressway Hub",
    region: "south",
    distance: "98 km",
    duration: "1h 15m",
    price: 160,
    operator: "Express Minibus Shuttle",
    coachType: "Rapid Transit Minibus",
    rating: 4.8,
    availableSeats: 14,
    departureTimes: ["Every 30 Mins (06:00 - 19:00)"],
    amenities: ["AC", "Fast Boarding", "Direct Toll Road"],
  },
  {
    id: "route-addis-jimma",
    origin: "Addis Ababa",
    originStation: "Sebeta / Autobus Tera",
    destination: "Jimma",
    destStation: "Jimma University Terminal",
    region: "west",
    distance: "350 km",
    duration: "6h 00m",
    price: 580,
    operator: "Oda Bus Intercity",
    coachType: "Modern Highway Coach",
    rating: 4.7,
    availableSeats: 9,
    departureTimes: ["06:00 AM", "07:30 AM"],
    amenities: ["AC", "USB Outlets", "Luggage Safety"],
  },
]

export function PopularRoutesSection({ id }: { id?: string }) {
  const [selectedRegion, setSelectedRegion] = useState<"all" | "south" | "north" | "east" | "west">("all")

  const filteredRoutes =
    selectedRegion === "all"
      ? POPULAR_ROUTES
      : POPULAR_ROUTES.filter((r) => r.region === selectedRegion)

  return (
    <section id={id} className="relative py-16 sm:py-24 px-4 bg-background overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Most Booked Corridors</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Popular Intercity Routes &amp; Daily Departures
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl">
              Compare real-time bus schedules, operator ratings, amenities, and guaranteed prices across Ethiopia.
            </p>
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border/50 overflow-x-auto max-w-full">
            {[
              { id: "all", label: "All Corridors" },
              { id: "south", label: "South (Hawassa)" },
              { id: "north", label: "North (Bahir Dar)" },
              { id: "east", label: "East (Dire Dawa)" },
              { id: "west", label: "West (Jimma)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedRegion(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  selectedRegion === tab.id
                    ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-sm shadow-orange-500/20 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredRoutes.map((route, idx) => (
              <motion.div
                key={route.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <div className="h-full rounded-2xl bg-card border border-border/60 hover:border-orange-500/40 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    {/* Top Row: Operator & Available Seats Badge */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div>
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400 block">
                          {route.operator}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {route.coachType}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {route.availableSeats} seats left
                      </span>
                    </div>

                    {/* Route Flow (Origin ➔ Destination) */}
                    <div className="relative pl-6 space-y-4 my-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-orange-500 before:to-yellow-500">
                      {/* Origin */}
                      <div className="relative">
                        <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center ring-4 ring-orange-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                        <div className="text-sm font-bold text-foreground">
                          {route.origin}
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1">
                          {route.originStation}
                        </div>
                      </div>

                      {/* Destination */}
                      <div className="relative">
                        <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center ring-4 ring-yellow-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                        <div className="text-sm font-bold text-foreground">
                          {route.destination}
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1">
                          {route.destStation}
                        </div>
                      </div>
                    </div>

                    {/* Distance & Duration info */}
                    <div className="flex items-center gap-4 py-2.5 px-3 rounded-xl bg-muted/40 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        <span>{route.duration}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-yellow-500" />
                        <span>{route.distance}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <div className="text-amber-500 font-semibold">★ {route.rating}</div>
                    </div>

                    {/* Amenities tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {route.amenities.map((amenity, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom: Price & CTA */}
                  <div className="pt-4 border-t border-border/50 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                        One-way from
                      </span>
                      <div className="text-xl sm:text-2xl font-extrabold text-foreground">
                        {route.price}{" "}
                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                          ETB
                        </span>
                      </div>
                    </div>

                    <Button
                      asChild
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold text-xs sm:text-sm px-4 rounded-xl shadow-md shadow-orange-500/20 group-hover:scale-105 transition-all duration-200"
                    >
                      <Link
                        href={`/user/bus?from=${encodeURIComponent(
                          route.origin
                        )}&to=${encodeURIComponent(route.destination)}`}
                        className="flex items-center gap-1"
                      >
                        <span>Select Seat</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* View All Routes Banner */}
        <div className="mt-12 text-center">
          <Link
            href="/user/bus"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-sm font-bold transition-all hover:gap-3"
          >
            <span>Explore All 50+ Intercity &amp; Regional Schedules in Ethiopia</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
