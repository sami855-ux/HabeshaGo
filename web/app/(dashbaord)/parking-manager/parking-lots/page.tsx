"use client"

import { useEffect, useState } from "react"
import { MapPin, Navigation, Search, Filter, Star } from "lucide-react"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { cn } from "../../../../lib/utils"

import { useDispatch, useSelector } from "react-redux"
import { fetchParkingLots } from "@/store/slices/parkingAdminSlice"
// import { fetchParkingLots } from "@/store/slices/parkingSlice";

interface FindParkingProps {
  onSelectLot?: (lotId: string) => void
}

export default function FindParking({ onSelectLot }: FindParkingProps) {
  const dispatch = useDispatch<any>()

  const { lots = [] } = useSelector((state: any) => state.parking || {})

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
        totalSlots:
          lot?.totalSlots || (Array.isArray(lot?.slots) ? lot.slots.length : 0),
        availableSlots:
          lot?.availableSlots ||
          (Array.isArray(lot?.slots)
            ? lot.slots.filter((s: any) => s?.status === "AVAILABLE").length
            : 0),
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

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80)
      return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
    if (rate >= 50)
      return "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400"
    return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Find Parking</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Browse available parking lots near you
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>

        <Button variant="outline">
          <Navigation className="h-4 w-4 mr-2" />
          Use My Location
        </Button>
      </div>

      {/* GRID (UNCHANGED UI) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLots.map((lot: any) => {
          const occupancyRate = getOccupancyRate(
            lot.totalSlots,
            lot.availableSlots,
          )

          return (
            <div
              key={lot.id}
              className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectLot?.(lot.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">{lot.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {lot.address} • {lot.distance}
                    </p>

                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{lot.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    ${lot.pricePerMinute}
                  </p>
                  <p className="text-xs text-gray-500">/hour</p>
                </div>
              </div>

              {/* Availability */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Availability
                  </span>
                  <span className="font-medium">
                    {lot.availableSlots} / {lot.totalSlots} spots
                  </span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      occupancyRate >= 80 && "bg-red-500",
                      occupancyRate >= 50 &&
                        occupancyRate < 80 &&
                        "bg-orange-500",
                      occupancyRate < 50 && "bg-green-500",
                    )}
                    style={{ width: `${100 - occupancyRate}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Operating Hours
                  </p>
                  <p className="text-sm font-medium">{lot.operatingHours}</p>
                </div>

                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Book Now
                </Button>
              </div>

              {/* Status */}
              <div className="mt-3">
                <span
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                    getOccupancyColor(occupancyRate),
                  )}
                >
                  {lot.availableSlots > 20
                    ? "Available"
                    : lot.availableSlots > 0
                      ? "Limited Spots"
                      : "Full"}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* EMPTY STATE */}
      {filteredLots.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No parking lots found matching your search.
        </div>
      )}
    </div>
  )
}
