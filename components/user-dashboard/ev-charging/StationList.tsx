"use client"

import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Zap,
  MapPin,
  CheckCircle,
  Wifi,
  Coffee,
  Battery,
  Gauge,
  Clock,
  Star,
  Navigation,
  Shield,
  TrendingUp,
  PlusCircle,
  Sparkles,
  BadgeCheck,
} from "lucide-react"
import { ChargingStation } from "@/types/ev"
import { mockStations } from "@/lib/mock-data(1)"

interface StationListProps {
  filters: any
  onStationSelect: (station: ChargingStation) => void
  selectedStationId?: number
}

// Modern color palette
const statusColors = {
  AVAILABLE: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
    gradient: "from-emerald-500 to-green-500",
  },
  OCCUPIED: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    border: "border-amber-200",
  },
  FAULTED: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-200",
  },
}

const connectorColors = {
  CCS: "bg-purple-100 text-purple-700 border-purple-200",
  TYPE2: "bg-blue-100 text-blue-700 border-blue-200",
  CHADEMO: "bg-orange-100 text-orange-700 border-orange-200",
}

export function StationList({
  filters,
  onStationSelect,
  selectedStationId,
}: StationListProps) {
  const { data: stations, isLoading } = useQuery({
    queryKey: ["charging-stations-list", filters],
    queryFn: async () => {
      let filtered = [...mockStations]

      if (filters.status?.length) {
        filtered = filtered.filter((s) => filters.status.includes(s.status))
      }
      if (filters.connectorTypes?.length) {
        filtered = filtered.filter((s) =>
          s.chargingPoints.some((cp) =>
            filters.connectorTypes.includes(cp.connectorType),
          ),
        )
      }
      if (filters.minPower) {
        filtered = filtered.filter((s) =>
          s.chargingPoints.some((cp) => cp.powerKw >= filters.minPower),
        )
      }
      if (filters.verifiedOnly) {
        filtered = filtered.filter((s) => s.isVerified)
      }
      if (filters.availableOnly) {
        filtered = filtered.filter((s) =>
          s.chargingPoints.some((cp) => cp.status === "AVAILABLE"),
        )
      }

      return filtered
    },
  })

  // Loading Skeleton with animation
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden"
          >
            <div className="h-36 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer" />
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <ScrollArea className="h-full bg-gradient-to-b from-white to-gray-50/50">
      <div className="p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {stations?.map((station, index) => {
            const availablePoints = station.chargingPoints.filter(
              (cp) => cp.status === "AVAILABLE",
            ).length
            const totalPoints = station.chargingPoints.length
            const hasAvailable = availablePoints > 0
            const maxPower = Math.max(
              ...station.chargingPoints.map((cp) => cp.powerKw),
            )
            const avgRating = station.ratings?.length
              ? (
                  station.ratings.reduce((acc, r) => acc + r.score, 0) /
                  station.ratings.length
                ).toFixed(1)
              : null

            return (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`relative overflow-hidden shadow-none cursor-pointer transition-all duration-300 rounded-xl border-2 py-0 pt-6 ${
                    selectedStationId === station.id
                      ? "border-orange-300 "
                      : "border-transparent hover:border-orange-100 hover:shadow-md"
                  }`}
                  onClick={() => onStationSelect(station)}
                >
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br opacity-5 ${
                      hasAvailable
                        ? "from-emerald-500 to-green-500"
                        : "from-gray-500 to-gray-600"
                    }`}
                  />

                  {/* Status Badge */}
                  <Badge
                    className={`absolute top-4 right-4 rounded-full px-2 py-1 gap-1.5 border-0 ${
                      hasAvailable
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <span className="relative flex h-2 w-2">
                      <span
                        className={`absolute inline-flex h-full w-full rounded-full animate-ping ${
                          hasAvailable ? "bg-emerald-400" : "bg-gray-400"
                        } opacity-75`}
                      />
                      <span
                        className={`relative inline-flex h-2 w-2 rounded-full ${
                          hasAvailable ? "bg-emerald-500" : "bg-gray-500"
                        }`}
                      />
                    </span>
                    <span className="text-xs font-medium">
                      {hasAvailable ? "Live" : "Busy"}
                    </span>
                  </Badge>

                  <div className="p-5 space-y-4">
                    {/* Header Section */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {station.name}
                          </h3>
                          {station.isVerified && (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                              }}
                              className="shrink-0"
                            >
                              <BadgeCheck size={20} color="green" />
                            </motion.div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{station.address}</span>
                        </div>

                        {/* Rating */}
                        {avgRating && (
                          <div className="flex items-center gap-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= Number(avgRating)
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              ({station.ratings.length})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Availability Badge */}
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Badge
                        className={`rounded-full px-3 py-1 ${
                          hasAvailable
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        <Zap
                          className={`w-3.5 h-3.5 mr-1.5 ${
                            hasAvailable ? "text-emerald-500" : "text-gray-400"
                          }`}
                        />
                        <span className="text-xs font-medium">
                          {availablePoints}/{totalPoints} Available
                        </span>
                      </Badge>

                      <Badge
                        variant="outline"
                        className="rounded-full px-3 py-1 bg-purple-50 text-purple-700 border-purple-100"
                      >
                        <Gauge className="w-3.5 h-3.5 mr-1.5" />
                        <span className="text-xs font-medium ">
                          {maxPower}kW Max
                        </span>
                      </Badge>
                    </motion.div>

                    {/* Connector Types */}
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(
                        new Set(
                          station.chargingPoints.map((cp) => cp.connectorType),
                        ),
                      ).map((type) => (
                        <Badge
                          key={type}
                          variant="outline"
                          className={`rounded-full font-grotesk text-xs px-2 py-0.5 ${"bg-gray-100 text-gray-800"}`}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-xl">
                        <Clock className="w-3.5 h-3.5 mb-1" color="green" />
                        <span className="text-xs font-medium text-gray-700">
                          ~30 min
                        </span>
                        <span className="text-[10px] text-gray-500">
                          avg charge
                        </span>
                      </div>

                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-xl">
                        <Battery className="w-3.5 h-3.5 mb-1" color="green" />
                        <span className="text-xs font-medium text-gray-700">
                          {station.chargingPoints.length} ports
                        </span>
                        <span className="text-[10px] text-gray-500">total</span>
                      </div>

                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-xl">
                        <TrendingUp
                          className="w-3.5 h-3.5  mb-1"
                          color="green"
                        />
                        <span className="text-xs font-medium text-gray-700">
                          {station.tariffs[0]?.pricePerKwh}
                        </span>
                        <span className="text-[10px] text-gray-500">/kWh</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Empty State */}
        {stations?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center"
          >
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No stations found
            </h3>
            <p className="text-sm text-gray-500 max-w-[200px]">
              Try adjusting your filters to see more charging stations
            </p>
          </motion.div>
        )}
      </div>
    </ScrollArea>
  )
}
