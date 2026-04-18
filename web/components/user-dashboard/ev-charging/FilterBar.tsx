"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
import { SlidersHorizontal, Star, X } from "lucide-react"

import { ConnectorType, ChargingSpeed } from "@/types/ev"
import { TabType } from "./EVChargingDashboard"

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void
  onTabChange: (tab: TabType) => void
  activeTab: TabType
}

interface FilterState {
  connectorTypes: ConnectorType[]
  chargingSpeeds: ChargingSpeed[]
  minPower: number
  maxPower: number
  verifiedOnly: boolean
  availableOnly: boolean
  distance: number
  rating: number
  sortBy: "distance" | "rating" | "price" | "availability"
}

const DEFAULT_FILTERS: FilterState = {
  connectorTypes: [],
  chargingSpeeds: [],
  minPower: 0,
  maxPower: 350,
  verifiedOnly: false,
  availableOnly: false,
  distance: 50,
  rating: 0,
  sortBy: "distance",
}

const TABS = [
  { key: "NEARBY" as const, label: "Nearby" },
  { key: "ALL" as const, label: "All Stations" },
  { key: "EXPLORE" as const, label: "Explore" },
] as const satisfies readonly {
  key: "ALL" | "NEARBY" | "EXPLORE"
  label: string
}[]

const CONNECTOR_TYPES: ConnectorType[] = ["CCS", "TYPE2", "CHADEMO"]
const CHARGING_SPEEDS: ChargingSpeed[] = ["SLOW", "FAST", "SUPER_FAST"]
const SORT_OPTIONS = ["distance", "rating", "price", "availability"] as const

export function FilterBar({
  onFilterChange,
  onTabChange,
  activeTab,
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [tempFilters, setTempFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.connectorTypes.length) count++
    if (filters.chargingSpeeds.length) count++
    if (filters.minPower > 0) count++
    if (filters.verifiedOnly) count++
    if (filters.availableOnly) count++
    if (filters.rating > 0) count++
    if (activeTab === "NEARBY" && filters.distance < 50) count++
    return count
  }, [filters, activeTab])

  const hasChanges = useMemo(
    () => JSON.stringify(filters) !== JSON.stringify(tempFilters),
    [filters, tempFilters],
  )

  const applyFilters = useCallback(() => {
    setFilters(tempFilters)
    onFilterChange(tempFilters)
    setIsOpen(false)
  }, [tempFilters, onFilterChange])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setTempFilters(DEFAULT_FILTERS)
    onFilterChange(DEFAULT_FILTERS)
    setIsOpen(false)
  }, [onFilterChange])

  const handleTabChange = useCallback(
    (tab: TabType) => {
      onTabChange(tab)
    },
    [onTabChange],
  )

  const toggleConnectorType = useCallback((type: ConnectorType) => {
    setTempFilters((prev) => ({
      ...prev,
      connectorTypes: prev.connectorTypes.includes(type)
        ? prev.connectorTypes.filter((t) => t !== type)
        : [...prev.connectorTypes, type],
    }))
  }, [])

  const toggleChargingSpeed = useCallback((speed: ChargingSpeed) => {
    setTempFilters((prev) => ({
      ...prev,
      chargingSpeeds: prev.chargingSpeeds.includes(speed)
        ? prev.chargingSpeeds.filter((s) => s !== speed)
        : [...prev.chargingSpeeds, speed],
    }))
  }, [])

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* TABS AND FILTERS IN ONE ROW */}
        <div className="flex items-center justify-between gap-4 py-3">
          {/* TABS - Left side */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
            {TABS.map((tab) => (
              <motion.button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>

          {/* FILTERS - Right side */}
          <div className="flex items-center gap-3 shrink-0">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">
                    Filters
                  </span>
                  <AnimatePresence>
                    {activeFilterCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                      >
                        {activeFilterCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </SheetTrigger>

              <SheetContent className="w-full sm:max-w-md p-0">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-5 border-b">
                    <SheetTitle>Filters</SheetTitle>
                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={applyFilters}
                        disabled={!hasChanges}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Apply Filters
                      </Button>
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Reset All
                      </Button>
                    </div>
                  </SheetHeader>

                  <div className="p-5 space-y-8 overflow-y-auto flex-1">
                    {/* SORT BY */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Sort By
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option}
                            onClick={() =>
                              setTempFilters((prev) => ({
                                ...prev,
                                sortBy: option,
                              }))
                            }
                            className={`px-3 py-2 rounded-lg capitalize transition-all ${
                              tempFilters.sortBy === option
                                ? "bg-emerald-500 text-white shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* QUICK FILTERS */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Quick Filters
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            setTempFilters((prev) => ({
                              ...prev,
                              verifiedOnly: !prev.verifiedOnly,
                            }))
                          }
                          className={`px-4 py-2 rounded-lg transition-all ${
                            tempFilters.verifiedOnly
                              ? "bg-emerald-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          ✓ Verified
                        </button>
                        <button
                          onClick={() =>
                            setTempFilters((prev) => ({
                              ...prev,
                              availableOnly: !prev.availableOnly,
                            }))
                          }
                          className={`px-4 py-2 rounded-lg transition-all ${
                            tempFilters.availableOnly
                              ? "bg-emerald-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          ⚡ Available Now
                        </button>
                      </div>
                    </div>

                    {/* CONNECTOR TYPE */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Connector Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {CONNECTOR_TYPES.map((type) => (
                          <button
                            key={type}
                            onClick={() => toggleConnectorType(type)}
                            className={`px-3 py-2 rounded-lg font-medium transition-all ${
                              tempFilters.connectorTypes.includes(type)
                                ? "bg-emerald-500 text-white shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CHARGING SPEED */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Charging Speed
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {CHARGING_SPEEDS.map((speed) => (
                          <button
                            key={speed}
                            onClick={() => toggleChargingSpeed(speed)}
                            className={`px-3 py-2 rounded-lg font-medium transition-all ${
                              tempFilters.chargingSpeeds.includes(speed)
                                ? "bg-emerald-500 text-white shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {speed.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* POWER RANGE */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Power Range (kW)
                      </label>
                      <div className="space-y-4">
                        <Slider
                          value={[tempFilters.minPower, tempFilters.maxPower]}
                          onValueChange={([min, max]) =>
                            setTempFilters((prev) => ({
                              ...prev,
                              minPower: min,
                              maxPower: max,
                            }))
                          }
                          min={0}
                          max={350}
                          step={5}
                          className="cursor-pointer"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{tempFilters.minPower} kW</span>
                          <span>{tempFilters.maxPower} kW</span>
                        </div>
                      </div>
                    </div>

                    {/* RATING */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Minimum Rating
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            onClick={() =>
                              setTempFilters((prev) => ({
                                ...prev,
                                rating: star,
                              }))
                            }
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.1 }}
                          >
                            <Star
                              className={`w-7 h-7 transition-all ${
                                tempFilters.rating >= star
                                  ? "fill-emerald-500 text-emerald-500"
                                  : "text-gray-300 hover:text-gray-400"
                              }`}
                            />
                          </motion.button>
                        ))}
                      </div>
                      {tempFilters.rating > 0 && (
                        <p className="text-sm text-emerald-600 mt-2">
                          {tempFilters.rating}+ stars
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* ACTIVE FILTERS DISPLAY */}
            <AnimatePresence>
              {activeFilterCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Badge
                    onClick={clearFilters}
                    className="cursor-pointer gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Clear All ({activeFilterCount})
                    <X className="w-3 h-3" />
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
