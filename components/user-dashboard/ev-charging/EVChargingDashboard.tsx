"use client"

import { useState, useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { MapSection } from "./MapSection"
import { StationList } from "./StationList"
import { FilterBar } from "./FilterBar"
import { StationDetailsSheet } from "./StationDetailsSheet"
import { ChargingStation } from "@/types/ev"
import {
  Zap,
  Battery,
  Menu,
  X,
  Bell,
  User,
  Search,
  ChevronDown,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export function EVChargingDashboard() {
  const [selectedStation, setSelectedStation] =
    useState<ChargingStation | null>(null)
  const [filters, setFilters] = useState<any>({})
  const [isMobileListOpen, setIsMobileListOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Modern Header with Glassmorphism */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`sticky top-0 z-50 px-6 py-3 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between max-w-[1920px] mx-auto">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -inset-1 bg-orange-400 rounded-2xl blur-lg opacity-25"
              />
            </motion.div>

            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
              >
                HabeshaGo
              </motion.h1>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="rounded-full bg-blue-50 text-blue-700 border-0 text-xs"
                >
                  EV Network
                </Badge>
              </div>
            </div>
          </div>

          {/* Search Bar - Modern */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden md:flex items-center flex-1 max-w-md mx-8"
          >
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Search stations, locations..."
                className="w-full pl-10 pr-4 py-6 rounded-xl border-gray-200 bg-white/50 transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-xs text-gray-400">
                <span className="border rounded px-1.5 py-0.5 bg-gray-50">
                  ⌘
                </span>
                <span className="border rounded px-1.5 py-0.5 bg-gray-50">
                  K
                </span>
              </kbd>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Filter Bar with Animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FilterBar onFilterChange={setFilters} />
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Station List - Desktop & Mobile */}
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className={`${
              isMobileListOpen
                ? "absolute inset-y-0 left-0 z-40 w-full sm:w-96"
                : "hidden md:block"
            } md:relative md:w-[450px] bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl overflow-y-auto`}
          >
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl p-4  z-10">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-xl">
                  Available Stations
                </h2>
                <Badge
                  variant="outline"
                  className="rounded-full bg-blue-50 text-blue-700 border-0"
                >
                  12 near you
                </Badge>
              </div>
            </div>
            <StationList
              filters={filters}
              onStationSelect={(station) => {
                setSelectedStation(station)
                setIsMobileListOpen(false)
              }}
              selectedStationId={selectedStation?.id}
            />
          </motion.div>
        </AnimatePresence>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 relative"
        >
          <div className="absolute inset-0">
            <MapSection
              filters={filters}
              onMarkerClick={(station) => {
                setSelectedStation(station)
                setIsMobileListOpen(false)
              }}
              selectedStationId={selectedStation?.id}
            />
          </div>

          {/* Quick Stats Overlay */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Quick Stats</h3>
              <Badge className="rounded-full bg-green-100 text-green-700 border-0">
                Live
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Available", value: "8", color: "text-green-500" },
                { label: "In Use", value: "4", color: "text-blue-500" },
                { label: "Total", value: "12", color: "text-gray-900" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="text-center"
                >
                  <div className={`text-xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Station Details Sheet */}
      <AnimatePresence>
        {selectedStation && (
          <StationDetailsSheet
            station={selectedStation}
            onClose={() => setSelectedStation(null)}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Button for Mobile */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full shadow-xl flex items-center justify-center text-white z-50"
        onClick={() => setIsMobileListOpen(!isMobileListOpen)}
      >
        {isMobileListOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </motion.button>
    </div>
  )
}
