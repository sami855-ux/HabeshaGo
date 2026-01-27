"use client"

import React, { useState, useRef } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Search,
  Users,
  Calendar as CalendarIcon,
  MapPin,
  ChevronDown,
  X,
  ArrowRightLeft,
  Clock,
  Tag,
  Sparkles,
  Bus,
  UserRound,
  Navigation,
  ArrowLeft,
  ChevronLeft,
} from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { CITIES } from "@/types/bus"
import { Badge } from "@/components/ui/badge"

interface BusSearchFormProps {
  onSearch: (data: {
    from: string
    to: string
    date: Date
    passengers: number
  }) => void
  isLoading: boolean
}

export default function BusSearchForm({
  onSearch,
  isLoading,
}: BusSearchFormProps) {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [passengers, setPassengers] = useState(1)
  const [isSwapping, setIsSwapping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)
  const fromInputRef = useRef<HTMLInputElement>(null)
  const toInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (from && to && date && passengers > 0) {
      onSearch({ from, to, date, passengers })
    }
  }

  const swapLocations = () => {
    setIsSwapping(true)
    const temp = from
    setFrom(to)
    setTo(temp)
    setTimeout(() => setIsSwapping(false), 300)
  }

  const clearField = (field: "from" | "to") => {
    if (field === "from") {
      setFrom("")
      fromInputRef.current?.focus()
      setFromOpen(true)
    } else {
      setTo("")
      toInputRef.current?.focus()
      setToOpen(true)
    }
  }

  const incrementPassengers = () => {
    if (passengers < 5) setPassengers((p) => p + 1)
  }

  const decrementPassengers = () => {
    if (passengers > 1) setPassengers((p) => p - 1)
  }

  const isFormValid = from && to && date && passengers > 0

  const popularRoutes = [
    { from: "Addis Ababa", to: "Bahir Dar", time: "8h", price: "From ETB 450" },
    { from: "Addis Ababa", to: "Hawassa", time: "4h", price: "From ETB 320" },
    { from: "Addis Ababa", to: "Mekelle", time: "12h", price: "From ETB 680" },
    { from: "Addis Ababa", to: "Dire Dawa", time: "9h", price: "From ETB 520" },
    { from: "Addis Ababa", to: "Gondar", time: "10h", price: "From ETB 580" },
    { from: "Addis Ababa", to: "Jimma", time: "6h", price: "From ETB 380" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative"
    >
      {/* Main Card */}
      <Card className="relative overflow-hidden border-0 shadow-none bg-gradient-to-br from-white via-orange-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="px-8 relative z-0">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl cursor-pointer">
                  <ChevronLeft className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Search a Bus
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Find and book buses across Ethiopia
                  </p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md">
                <Sparkles className="w-3 h-3 mr-1" />
                2,500+ Routes
              </Badge>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-8 px-10">
            {/* Route Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-800/50 dark:to-gray-800/30 rounded-2xl p-6 px-8 "
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* From Location - ComboBox */}
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      DEPARTURE
                    </label>
                  </div>
                  <Popover open={fromOpen} onOpenChange={setFromOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={fromOpen}
                        className={cn(
                          "w-full h-14 justify-between text-left font-normal border-2 rounded-xl group hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
                          from
                            ? "border-orange-200 dark:border-orange-800"
                            : "border-gray-200 dark:border-gray-700",
                        )}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <MapPin className="h-5 w-5 text-orange-500 shrink-0" />
                          <span
                            className={cn(
                              "truncate",
                              from
                                ? "text-gray-900 dark:text-gray-100 font-medium"
                                : "text-gray-500 dark:text-gray-400",
                            )}
                          >
                            {from || "Select departure city"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {from && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                clearField("from")
                              }}
                              className="p-1 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/30"
                            >
                              <X className="h-4 w-4 text-gray-500 hover:text-orange-600" />
                            </button>
                          )}
                          <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors shrink-0" />
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0 border-0 shadow-2xl"
                      align="start"
                    >
                      <Command className="border border-orange-100 dark:border-orange-900 rounded-xl overflow-hidden">
                        <CommandInput
                          placeholder="Search cities..."
                          className=" border-0 h-24 focus:ring-0"
                        />
                        <CommandList className="w-80">
                          <CommandEmpty className="py-6 text-center text-gray-500">
                            No city found.
                          </CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {CITIES.map((city) => (
                              <CommandItem
                                key={city}
                                value={city}
                                onSelect={(currentValue) => {
                                  setFrom(
                                    currentValue === from ? "" : currentValue,
                                  )
                                  setFromOpen(false)
                                }}
                                className="flex items-center gap-3 py-3 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/30"
                              >
                                <div
                                  className={cn(
                                    "flex items-center justify-center w-6 h-6 rounded-full",
                                    from === city
                                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                                      : "bg-gray-100 dark:bg-gray-800",
                                  )}
                                >
                                  <MapPin className="w-3 h-3" />
                                </div>
                                <span
                                  className={cn(
                                    from === city
                                      ? "font-semibold text-orange-600 dark:text-orange-400"
                                      : "",
                                  )}
                                >
                                  {city}
                                </span>
                                {from === city && (
                                  <div className="ml-auto">
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500" />
                                  </div>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Swap Button */}
                <div className="lg:col-span-2 flex items-center justify-center">
                  <motion.button
                    type="button"
                    onClick={swapLocations}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "p-3.5 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300",
                      from || to
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                        : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed",
                    )}
                    disabled={!from && !to}
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* To Location - ComboBox */}
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-rose-500" />
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      DESTINATION
                    </label>
                  </div>
                  <Popover open={toOpen} onOpenChange={setToOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={toOpen}
                        className={cn(
                          "w-full h-14 justify-between text-left font-normal border-2 rounded-xl group hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
                          to
                            ? "border-orange-200 dark:border-orange-800"
                            : "border-gray-200 dark:border-gray-700",
                        )}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <MapPin className="h-5 w-5 text-orange-500 shrink-0" />
                          <span
                            className={cn(
                              "truncate",
                              to
                                ? "text-gray-900 dark:text-gray-100 font-medium"
                                : "text-gray-500 dark:text-gray-400",
                            )}
                          >
                            {to || "Select destination city"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {to && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                clearField("to")
                              }}
                              className="p-1 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/30"
                            >
                              <X className="h-4 w-4 text-gray-500 hover:text-orange-600" />
                            </button>
                          )}
                          <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors shrink-0" />
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0 border-0 shadow-2xl"
                      align="start"
                    >
                      <Command className="border border-orange-100 dark:border-orange-900 rounded-xl overflow-hidden">
                        <CommandInput
                          placeholder="Search cities..."
                          className="h-12 border-0 focus:ring-0"
                        />
                        <CommandList className="w-80">
                          <CommandEmpty className="py-6 text-center text-gray-500">
                            No city found.
                          </CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {CITIES.map((city) => (
                              <CommandItem
                                key={city}
                                value={city}
                                onSelect={(currentValue) => {
                                  setTo(currentValue === to ? "" : currentValue)
                                  setToOpen(false)
                                }}
                                className="flex items-center gap-3 py-3 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/30"
                              >
                                <div
                                  className={cn(
                                    "flex items-center justify-center w-6 h-6 rounded-full",
                                    to === city
                                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                                      : "bg-gray-100 dark:bg-gray-800",
                                  )}
                                >
                                  <MapPin className="w-3 h-3" />
                                </div>
                                <span
                                  className={cn(
                                    to === city
                                      ? "font-semibold text-orange-600 dark:text-orange-400"
                                      : "",
                                  )}
                                >
                                  {city}
                                </span>
                                {to === city && (
                                  <div className="ml-auto">
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500" />
                                  </div>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </motion.div>

            {/* Date & Passengers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Departure Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-orange-500" />
                  TRAVEL DATE
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-14 justify-between text-left font-normal border-2 rounded-xl group hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-5 w-5 text-orange-500" />
                        <div>
                          <div className="font-medium">
                            {format(date, "EEE, MMM d")}
                          </div>
                          <div className="text-xs text-gray-500">
                            Select departure date
                          </div>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 border-0 shadow-2xl"
                    align="start"
                  >
                    <div className="rounded-xl overflow-hidden border border-orange-100 dark:border-orange-900">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => date && setDate(date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="rounded-xl"
                        classNames={{
                          day_selected:
                            "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600",
                          day_today:
                            "border border-orange-300 dark:border-orange-700",
                          day_range_middle:
                            "bg-orange-100 dark:bg-orange-900/30",
                          nav_button:
                            "hover:bg-orange-50 dark:hover:bg-orange-900/20",
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Passengers */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-orange-500" />
                  PASSENGERS
                </label>
                <div className="relative">
                  <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 rounded-xl p-2 transition-all duration-300">
                    <motion.button
                      type="button"
                      onClick={decrementPassengers}
                      disabled={passengers <= 1}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "p-3 rounded-lg transition-all duration-300",
                        passengers <= 1
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                          : "bg-orange-50 dark:bg-orange-900/30 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/50",
                      )}
                    >
                      <span className="text-xl font-bold">-</span>
                    </motion.button>

                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                          {passengers}
                        </span>
                        <Users className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {passengers === 1 ? "Passenger" : "Passengers"} (Max 5)
                      </div>
                    </div>

                    <motion.button
                      type="button"
                      onClick={incrementPassengers}
                      disabled={passengers >= 5}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "p-3 rounded-lg transition-all duration-300",
                        passengers >= 5
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                          : "bg-orange-50 dark:bg-orange-900/30 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/50",
                      )}
                    >
                      <span className="text-xl font-bold">+</span>
                    </motion.button>
                  </div>
                  <div className="flex justify-center mt-2">
                    <span className="text-xs text-gray-500 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
                      Maximum 5 passengers per booking
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Suggestions */}
            <AnimatePresence>
              {(!from || !to) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <div className="border-t border-orange-100 dark:border-orange-900/30 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-orange-500" />
                        Popular Routes
                      </h3>
                      <span className="text-sm text-gray-500">
                        Fastest options
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {popularRoutes.map((route, index) => (
                        <motion.button
                          key={index}
                          type="button"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setFrom(route.from)
                            setTo(route.to)
                            setShowSuggestions(false)
                          }}
                          className="group relative p-4 cursor-pointer rounded-xl border border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-all duration-300 text-left"
                        >
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Bus className="w-4 h-4 text-orange-500" />
                          </div>
                          <div className="flex items-start gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/30">
                              <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                {route.from} → {route.to}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Direct route available
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="w-3 h-3" />
                              {route.time}
                            </div>
                            <div className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                              {route.price}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileTap={{ scale: 0.99 }}
              className="pt-6 border-t border-gray-100 dark:border-gray-800"
            >
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={cn(
                  "w-full h-16 text-lg font-semibold rounded-lg cursor-pointer transition-all duration-300 relative overflow-hidden group",
                  isFormValid
                    ? "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 shadow-orange-500/25 hover:shadow-orange-500/40"
                    : "bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 cursor-not-allowed",
                )}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30"></div>
                      <div className="absolute inset-0 animate-spin rounded-full h-6 w-6 border-t-2 border-white border-solid"></div>
                    </div>
                    <span className="font-medium">Searching buses...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Search className="w-6 h-6" />
                    <span className="font-bold">SEARCH BUSES</span>
                    {isFormValid && (
                      <span className="text-sm font-normal opacity-80">
                        • {passengers}{" "}
                        {passengers === 1 ? "passenger" : "passengers"}
                      </span>
                    )}
                  </div>
                )}
              </Button>

              {!isFormValid && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-3"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Please select departure, destination, date, and passengers
                  </p>
                </motion.div>
              )}
            </motion.div>
          </form>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  icon: Tag,
                  text: "Best Price",
                  desc: "Lowest fares guaranteed",
                  color: "text-green-500",
                  bg: "bg-green-50 dark:bg-green-900/20",
                },
                {
                  icon: Clock,
                  text: "Live Tracking",
                  desc: "Real-time bus location",
                  color: "text-blue-500",
                  bg: "bg-blue-50 dark:bg-blue-900/20",
                },
                {
                  icon: UserRound,
                  text: "Easy Booking",
                  desc: "Cancel anytime",
                  color: "text-purple-500",
                  bg: "bg-purple-50 dark:bg-purple-900/20",
                },
                {
                  icon: Sparkles,
                  text: "Premium",
                  desc: "Luxury buses",
                  color: "text-amber-500",
                  bg: "bg-amber-50 dark:bg-amber-900/20",
                },
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${feature.bg}`}>
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {feature.text}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {feature.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
