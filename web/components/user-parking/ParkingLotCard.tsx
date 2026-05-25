"use client"

import { useEffect, useState } from "react"
import {
  MapPin,
  Navigation,
  Search,
  Filter,
  Star,
  Clock,
  Users,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { useDispatch, useSelector } from "react-redux"
import { fetchParkingLots } from "@/store/slices/parkingUserSlice"

interface FindParkingProps {
  onSelectLot?: (lotId: string) => void
}

export default function FindParking({ onSelectLot }: FindParkingProps) {
  const dispatch = useDispatch<any>()

  const { lots = [] } = useSelector((state: any) => state.parkingUser || {})

  const [searchTerm, setSearchTerm] = useState("")

  // FETCH FROM BACKEND
  useEffect(() => {
    dispatch(fetchParkingLots())
  }, [dispatch])

  // SAFE DATA NORMALIZATION (prevents object crash)
  const safeLots = Array.isArray(lots)
    ? lots.map((lot: any) => ({
        id: lot?.id,
        name: lot?.name || lot?.location || "Parking Lot",
        address: lot?.address || lot?.location || "Unknown",
        distance: lot?.distance || "—",
        pricePerMinute: lot?.pricePerMinute || 0,
        availableSlots: lot?.availableSlots ?? 0,
        totalSlots: lot?.totalSlots ?? 0,
        rating: lot?.rating || 4.0,
        operatingHours: lot?.operatingHours || "24/7",
      }))
    : []

  // FILTERING (UNCHANGED LOGIC)
  const filteredLots = safeLots.filter(
    (lot: any) =>
      lot.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.address?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getOccupancyRate = (total: number, available: number) => {
    if (!total) return 0
    return ((total - available) / total) * 100
  }

  // Helper to get badge style without "Full" wording
  const getStatusBadge = (available, total) => {
    if (!total) {
      return {
        text: "Loading...",
        color: "text-gray-400 bg-gray-100 dark:bg-gray-800",
      }
    }

    if (available === 0) {
      return {
        text: "No spots",
        color: "text-red-600 bg-red-100 dark:bg-red-950/30 dark:text-red-400",
      }
    }

    if (available < total * 0.2) {
      return {
        text: "Very limited",
        color:
          "text-orange-600 bg-orange-100 dark:bg-orange-950/30 dark:text-orange-400",
      }
    }

    if (available < total * 0.5) {
      return {
        text: "Limited",
        color:
          "text-amber-600 bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400",
      }
    }

    return {
      text: "Available",
      color:
        "text-green-600 bg-green-100 dark:bg-green-950/30 dark:text-green-400",
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 rounded-3xl blur-3xl" />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Find Parking
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-xl">
            Browse available parking lots near you — real-time availability &
            premium spots
          </p>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <Input
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-6 rounded-xl border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-xl px-5 py-6 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all hover:shadow-sm group"
          >
            <Filter className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            Filters
          </Button>

          <Button
            variant="outline"
            className="rounded-xl px-5 py-6 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all hover:shadow-sm group"
          >
            <Navigation className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            Use My Location
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {filteredLots.length}
          </span>{" "}
          parking lots
        </p>
        {filteredLots.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Sparkles className="h-3 w-3" />
            <span>Best match</span>
          </div>
        )}
      </div>

      {/* Parking Grid - Availability progress bar removed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {filteredLots.map((lot: any, index: number) => {
          const occupancyRate = getOccupancyRate(
            lot.totalSlots,
            lot.availableSlots,
          )
          const badge = getStatusBadge(lot.availableSlots, lot.totalSlots)

          return (
            <div
              key={lot.id}
              className="group relative bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1"
              onClick={() => onSelectLot?.(lot.id)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="p-6">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 shadow-sm">
                      <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                        {lot.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Navigation className="h-3.5 w-3.5" />
                          <span>{lot.address}</span>
                        </div>
                        <span className="text-gray-300 dark:text-gray-700">
                          •
                        </span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {lot.distance}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/20 px-4 py-2 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${formatPrice(lot.pricePerMinute)}
                    </p>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      per hour
                    </p>
                  </div>
                </div>

                {/* Rating & Operating Hours - no availability bar here */}
                <div className="flex items-center gap-6 mb-5 pl-2">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                      {lot.rating}
                    </span>
                    <span className="text-xs text-gray-400">
                      (120+ reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {lot.operatingHours}
                    </span>
                  </div>
                </div>

                {/* Footer Actions - changed "Full" to new badge texts */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    size="default"
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl px-6"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredLots.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/30 dark:to-gray-900 border border-gray-100 dark:border-gray-800">
          <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            No parking lots found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
            We couldn&apos;t find any parking lots matching &quot;{searchTerm}
            &quot;. Try adjusting your search.
          </p>
          {searchTerm && (
            <Button
              variant="ghost"
              onClick={() => setSearchTerm("")}
              className="mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Clear search
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
