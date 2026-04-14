"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  X,
  Zap,
  Gauge,
  SlidersHorizontal,
  Battery,
  Plug,
  Star,
  Clock,
  Flame,
  Shield,
  Navigation,
  FilterX,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react"

import { ConnectorType, ChargingSpeed } from "@/types/ev"

interface FilterBarProps {
  onFilterChange: (filters: any) => void
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    connectorTypes: [] as ConnectorType[],
    chargingSpeeds: [] as ChargingSpeed[],
    minPower: 0,
    maxPower: 350,
    verifiedOnly: false,
    availableOnly: false,
    amenities: [] as string[],
    distance: 50,
    rating: 0,
  })

  const [tempFilters, setTempFilters] = useState(filters)
  const [activeFilterCount, setActiveFilterCount] = useState(0)

  useEffect(() => {
    let count = 0
    if (filters.connectorTypes.length) count++
    if (filters.chargingSpeeds.length) count++
    if (filters.minPower > 0) count++
    if (filters.verifiedOnly) count++
    if (filters.availableOnly) count++
    if (filters.distance < 50) count++
    if (filters.rating > 0) count++
    setActiveFilterCount(count)
  }, [filters])

  const updateFilters = (updates: any) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters = {
      connectorTypes: [],
      chargingSpeeds: [],
      minPower: 0,
      maxPower: 350,
      verifiedOnly: false,
      availableOnly: false,
      amenities: [],
      distance: 50,
      rating: 0,
    }
    setFilters(emptyFilters)
    setTempFilters(emptyFilters)
    onFilterChange({})
    setIsOpen(false)
  }

  const applyFilters = () => {
    setFilters(tempFilters)
    onFilterChange(tempFilters)
    setIsOpen(false)
  }

  const hasTempChanges = JSON.stringify(filters) !== JSON.stringify(tempFilters)

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl px-4 sm:px-6">
        <div className="flex items-center gap-3 py-3">
          {/* Modern Filter Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="relative inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all"
              >
                <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Filters
                </span>
                {activeFilterCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs rounded-full flex items-center justify-center shadow-md"
                  >
                    {activeFilterCount}
                  </motion.span>
                )}
              </motion.button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-full sm:max-w-md p-0 bg-gray-50/95 backdrop-blur-sm"
            >
              <div className="flex flex-col h-full">
                {/* Header with Action Buttons */}
                <SheetHeader className="px-5 pt-6 pb-4 bg-white border-b border-gray-100">
                  <SheetTitle className="text-xl font-bold text-gray-900 mb-4">
                    Refine Your Search
                  </SheetTitle>

                  {/* Action Buttons at the Top */}
                  <div className="flex gap-3">
                    <Button
                      onClick={applyFilters}
                      disabled={!hasTempChanges}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl py-5 text-sm font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply Filters
                      {activeFilterCount > 0 && (
                        <Badge className="ml-2 bg-white/20 text-white border-0">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="px-4 rounded-xl border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                    >
                      Clear
                    </Button>
                  </div>

                  {/* Active Filters Summary */}
                  {activeFilterCount > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">
                        {activeFilterCount} active filter
                        {activeFilterCount > 1 ? "s" : ""}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {filters.connectorTypes.slice(0, 2).map((type) => (
                          <span
                            key={type}
                            className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full"
                          >
                            {type}
                          </span>
                        ))}
                        {filters.chargingSpeeds.slice(0, 2).map((speed) => (
                          <span
                            key={speed}
                            className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full"
                          >
                            {speed.replace("_", " ")}
                          </span>
                        ))}
                        {filters.verifiedOnly && (
                          <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                            Verified
                          </span>
                        )}
                        {activeFilterCount > 4 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            +{activeFilterCount - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </SheetHeader>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-5 space-y-8">
                    {/* Quick Actions */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Quick Filters
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            setTempFilters({
                              ...tempFilters,
                              verifiedOnly: !tempFilters.verifiedOnly,
                            })
                          }
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            tempFilters.verifiedOnly
                              ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md"
                              : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-300 hover:shadow-sm"
                          }`}
                        >
                          <Shield className="w-4 h-4" />
                          Verified Only
                          {tempFilters.verifiedOnly && (
                            <Check className="w-3 h-3 ml-1" />
                          )}
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            setTempFilters({
                              ...tempFilters,
                              availableOnly: !tempFilters.availableOnly,
                            })
                          }
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            tempFilters.availableOnly
                              ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md"
                              : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-300 hover:shadow-sm"
                          }`}
                        >
                          <Zap className="w-4 h-4" />
                          Available Now
                          {tempFilters.availableOnly && (
                            <Check className="w-3 h-3 ml-1" />
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Connector Type */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Plug className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Connector Type
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(["CCS", "TYPE2", "CHADEMO"] as ConnectorType[]).map(
                          (type) => {
                            const Icon = {
                              CCS: Zap,
                              TYPE2: Plug,
                              CHADEMO: Battery,
                            }[type]
                            const isActive =
                              tempFilters.connectorTypes.includes(type)
                            return (
                              <motion.button
                                key={type}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                  const newTypes = isActive
                                    ? tempFilters.connectorTypes.filter(
                                        (t) => t !== type,
                                      )
                                    : [...tempFilters.connectorTypes, type]
                                  setTempFilters({
                                    ...tempFilters,
                                    connectorTypes: newTypes,
                                  })
                                }}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                                  isActive
                                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md"
                                    : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:shadow-sm"
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                                <span className="text-xs font-medium">
                                  {type}
                                </span>
                                {isActive && <Check className="w-3 h-3" />}
                              </motion.button>
                            )
                          },
                        )}
                      </div>
                    </div>

                    {/* Charging Speed */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Gauge className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Charging Speed
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            value: "SLOW",
                            label: "Slow",
                            icon: Clock,
                            color: "blue",
                          },
                          {
                            value: "FAST",
                            label: "Fast",
                            icon: Gauge,
                            color: "green",
                          },
                          {
                            value: "SUPER_FAST",
                            label: "Super Fast",
                            icon: Flame,
                            color: "red",
                          },
                        ].map(({ value, label, icon: Icon }) => {
                          const isActive = tempFilters.chargingSpeeds.includes(
                            value as ChargingSpeed,
                          )
                          return (
                            <motion.button
                              key={value}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => {
                                const newSpeeds = isActive
                                  ? tempFilters.chargingSpeeds.filter(
                                      (s) => s !== value,
                                    )
                                  : [
                                      ...tempFilters.chargingSpeeds,
                                      value as ChargingSpeed,
                                    ]
                                setTempFilters({
                                  ...tempFilters,
                                  chargingSpeeds: newSpeeds,
                                })
                              }}
                              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                                isActive
                                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md"
                                  : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:shadow-sm"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="text-xs font-medium">
                                {label}
                              </span>
                              {isActive && <Check className="w-3 h-3" />}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Power Range */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Battery className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Power Output
                          </span>
                        </div>
                        <div className="px-2 py-1 bg-gray-100 rounded-lg">
                          <span className="text-sm font-semibold text-gray-900">
                            {tempFilters.minPower} - {tempFilters.maxPower} kW
                          </span>
                        </div>
                      </div>
                      <Slider
                        value={[tempFilters.minPower, tempFilters.maxPower]}
                        onValueChange={([min, max]) =>
                          setTempFilters({
                            ...tempFilters,
                            minPower: min,
                            maxPower: max,
                          })
                        }
                        min={0}
                        max={350}
                        step={10}
                        className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-emerald-500 [&_[role=slider]]:to-green-600 [&_[role=slider]]:border-emerald-500"
                      />
                    </div>

                    {/* Distance */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Max Distance
                          </span>
                        </div>
                        <div className="px-2 py-1 bg-gray-100 rounded-lg">
                          <span className="text-sm font-semibold text-gray-900">
                            {tempFilters.distance} km
                          </span>
                        </div>
                      </div>
                      <Slider
                        value={[tempFilters.distance]}
                        onValueChange={([d]) =>
                          setTempFilters({ ...tempFilters, distance: d })
                        }
                        min={0}
                        max={100}
                        step={5}
                        className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-emerald-500 [&_[role=slider]]:to-green-600 [&_[role=slider]]:border-emerald-500"
                      />
                    </div>

                    {/* Rating */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Minimum Rating
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              setTempFilters({ ...tempFilters, rating: star })
                            }
                            className="p-2 transition-transform"
                          >
                            <Star
                              className={`w-7 h-7 ${
                                tempFilters.rating >= star
                                  ? "fill-emerald-400 text-emerald-400"
                                  : "fill-gray-200 text-gray-200 hover:fill-gray-300"
                              }`}
                            />
                          </motion.button>
                        ))}
                      </div>
                      {tempFilters.rating > 0 && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-emerald-600 mt-2 font-medium"
                        >
                          {tempFilters.rating}+ stars and above
                        </motion.p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sticky Bottom Indicator */}
                {hasTempChanges && (
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-t border-emerald-100">
                    <p className="text-xs text-emerald-600 text-center">
                      You have unsaved changes
                    </p>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              <AnimatePresence>
                {filters.connectorTypes.map((type) => (
                  <motion.div
                    key={type}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <Badge className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm">
                      {type}
                      <X
                        className="w-3 h-3 ml-2 cursor-pointer hover:text-emerald-900 transition-colors"
                        onClick={() => {
                          const newTypes = filters.connectorTypes.filter(
                            (t) => t !== type,
                          )
                          updateFilters({ connectorTypes: newTypes })
                        }}
                      />
                    </Badge>
                  </motion.div>
                ))}
                {filters.chargingSpeeds.map((speed) => (
                  <motion.div
                    key={speed}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <Badge className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm">
                      {speed.replace("_", " ")}
                      <X
                        className="w-3 h-3 ml-2 cursor-pointer hover:text-emerald-900 transition-colors"
                        onClick={() => {
                          const newSpeeds = filters.chargingSpeeds.filter(
                            (s) => s !== speed,
                          )
                          updateFilters({ chargingSpeeds: newSpeeds })
                        }}
                      />
                    </Badge>
                  </motion.div>
                ))}
                {filters.verifiedOnly && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <Badge className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm">
                      Verified
                      <X
                        className="w-3 h-3 ml-2 cursor-pointer hover:text-emerald-900 transition-colors"
                        onClick={() => updateFilters({ verifiedOnly: false })}
                      />
                    </Badge>
                  </motion.div>
                )}
                {filters.availableOnly && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <Badge className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm">
                      Available
                      <X
                        className="w-3 h-3 ml-2 cursor-pointer hover:text-emerald-900 transition-colors"
                        onClick={() => updateFilters({ availableOnly: false })}
                      />
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
