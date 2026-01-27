"use client"

import React, { useState } from "react"
import { Bus } from "@/types/bus"
import BusCard from "./bus-card"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Bus as BusIcon, Filter, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BusListProps {
  buses: Bus[]
  isLoading: boolean
  onViewDetails: (busId: number) => void
  onBook: (busId: number) => void
  searchParams: {
    from: string
    to: string
    date: Date
    passengers: number
  }
}

export default function BusList({
  buses,
  isLoading,
  onViewDetails,
  onBook,
  searchParams,
}: BusListProps) {
  const [sortBy, setSortBy] = useState("departure")
  const [filterStatus, setFilterStatus] = useState("all")

  // Sorting logic
  const sortedBuses = [...buses].sort((a, b) => {
    switch (sortBy) {
      case "departure":
        return (
          new Date(a.departureTime).getTime() -
          new Date(b.departureTime).getTime()
        )
      case "price":
        return a.route.distanceKm * 0.15 - b.route.distanceKm * 0.15
      case "duration":
        return a.route.estimatedTimeMin - b.route.estimatedTimeMin
      case "seats":
        return b.availableSeats - a.availableSeats
      default:
        return 0
    }
  })

  // Filter logic
  const filteredBuses = sortedBuses.filter((bus) => {
    if (filterStatus === "all") return true
    if (filterStatus === "available") return bus.availableSeats > 0
    if (filterStatus === "no-delay") return bus.delayMinutes === 0
    return true
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
              <div className="md:w-48 space-y-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (buses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <Card className="p-8 max-w-lg mx-auto border-none shadow-none">
          <BusIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No buses found</h3>
          <p className="text-gray-500 mb-4">
            We couldn't find any buses matching your search criteria.
          </p>
          <p className="text-sm text-gray-400">
            Try adjusting your departure, destination, or travel date.
          </p>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6 px-10 mb-10">
      {/* Results Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold">
            Available Buses ({filteredBuses.length})
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {searchParams.from} → {searchParams.to} • {searchParams.passengers}{" "}
            passenger{searchParams.passengers > 1 ? "s" : ""}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="departure">Departure Time</SelectItem>
                <SelectItem value="price">Price (Low to High)</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="seats">Available Seats</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buses</SelectItem>
              <SelectItem value="available">Available Seats</SelectItem>
              <SelectItem value="no-delay">No Delay</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Buses List */}
      <AnimatePresence>
        <div className="space-y-4">
          {filteredBuses.map((bus, index) => (
            <motion.div
              key={bus.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <BusCard
                bus={bus}
                onViewDetails={onViewDetails}
                onBook={onBook}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
}
