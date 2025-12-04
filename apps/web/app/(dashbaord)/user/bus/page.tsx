"use client"

import { SearchRoute } from "@/components/bus/SearchRoute"
import { RouteMap } from "@/components/bus/RouteMap"
import { BusList } from "@/components/bus/BusList"
import { SeatSelection } from "@/components/bus/SeatSelection"
import { BookingSummary } from "@/components/bus/BookingSummary"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bus, Zap, Shield } from "lucide-react"

export default function HomePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background rounded-2xl">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Bus Booking
            </h1>
            <p className="text-muted-foreground mt-2">
              Find, book, and manage your bus journeys effortlessly
            </p>
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SearchRoute />
        </motion.div>

        {/* Bus List Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Available Buses</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="size-4 text-green-500" />
                <span>Live Tracking</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="size-4 text-blue-500" />
                <span>Verified Operators</span>
              </div>
            </div>
          </div>
          <BusList />
        </motion.div>

        {/* Empty State (Example) */}
        {/* Uncomment to see empty state
        <div className="text-center py-12">
          <Bus className="size-16 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold mt-4">No buses found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search filters</p>
        </div>
        */}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-border"
        >
          <div className="text-center p-4">
            <div className="size-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="size-6 text-primary-foreground" />
            </div>
            <h4 className="font-bold">Instant Booking</h4>
            <p className="text-sm text-muted-foreground">
              Book tickets in under 60 seconds
            </p>
          </div>
          <div className="text-center p-4">
            <div className="size-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Bus className="size-6 text-secondary-foreground" />
            </div>
            <h4 className="font-bold">Live Tracking</h4>
            <p className="text-sm text-muted-foreground">
              Real-time bus location updates
            </p>
          </div>
          <div className="text-center p-4">
            <div className="size-12 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="size-6 text-accent-foreground" />
            </div>
            <h4 className="font-bold">Safe Travel</h4>
            <p className="text-sm text-muted-foreground">
              Verified drivers & safety features
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
