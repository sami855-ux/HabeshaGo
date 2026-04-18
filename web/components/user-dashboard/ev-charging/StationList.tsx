"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Zap,
  MapPin,
  Battery,
  Gauge,
  Clock,
  Star,
  TrendingUp,
  BadgeCheck,
} from "lucide-react"

import { ChargingStation } from "@/types/ev"

interface StationListProps {
  stations: ChargingStation[]
  isLoading: boolean
  onStationSelect: (station: ChargingStation) => void
  selectedStationId?: number
}

export function StationList({
  stations,
  isLoading,
  onStationSelect,
  selectedStationId,
}: StationListProps) {
  // ✅ LOADING SKELETON (UNCHANGED UI)
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="h-36 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl animate-pulse" />
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
                  className={`relative overflow-hidden shadow-md cursor-pointer transition-all duration-300 rounded-xl border-2 py-0 pt-6 ${
                    selectedStationId === station.id
                      ? "border-orange-300"
                      : "border-border hover:border-orange-100 hover:shadow-md"
                  }`}
                  onClick={() => onStationSelect(station)}
                >
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 opacity-5 ${
                      hasAvailable
                        ? "bg-gradient-to-br from-emerald-500 to-green-500"
                        : "bg-gradient-to-br from-gray-500 to-gray-600"
                    }`}
                  />

                  {/* STATUS */}
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
                    {/* HEADER */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {station.name}
                        </h3>
                        {station.isVerified && (
                          <BadgeCheck size={18} color="green" />
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{station.address}</span>
                      </div>

                      {/* RATING */}
                      {avgRating && (
                        <div className="flex items-center gap-1">
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
                          <span className="text-xs text-gray-500">
                            ({station.ratings.length})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* AVAILABILITY */}
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`rounded-full px-3 py-1 ${
                          hasAvailable
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 mr-1" />
                        {availablePoints}/{totalPoints} Available
                      </Badge>

                      <Badge className="rounded-full px-3 py-1 bg-purple-50 text-purple-700">
                        <Gauge className="w-3.5 h-3.5 mr-1" />
                        {maxPower}kW
                      </Badge>
                    </div>

                    {/* CONNECTORS */}
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(
                        new Set(
                          station.chargingPoints.map((cp) => cp.connectorType),
                        ),
                      ).map((type) => (
                        <Badge
                          key={type}
                          className="bg-gray-100 text-gray-800 text-xs"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-xl">
                        <Clock className="w-3.5 h-3.5 mb-1" />
                        <span className="text-xs font-medium">~30 min</span>
                      </div>

                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-xl">
                        <Battery className="w-3.5 h-3.5 mb-1" />
                        <span className="text-xs font-medium">
                          {station.chargingPoints.length}
                        </span>
                      </div>

                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-xl">
                        <TrendingUp className="w-3.5 h-3.5 mb-1" />
                        <span className="text-xs font-medium">
                          {station.tariffs?.[0]?.pricePerKwh ?? "--"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* EMPTY STATE */}
        {stations?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-12"
          >
            <Zap className="w-8 h-8 text-orange-500 mb-2" />
            <p className="text-gray-500">No stations found</p>
          </motion.div>
        )}
      </div>
    </ScrollArea>
  )
}
