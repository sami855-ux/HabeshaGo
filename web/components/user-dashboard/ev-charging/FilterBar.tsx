"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
  Award,
  Shield,
  Navigation,
} from "lucide-react"

import { ConnectorType, ChargingSpeed } from "@/types/ev"

interface FilterBarProps {
  onFilterChange: (filters: any) => void
}

// Modern orange-based color palette
const orangePalette = {
  primary: {
    from: "from-orange-500",
    to: "to-amber-500",
    light: "bg-orange-50",
    text: "text-gray-600",
    border: "border-orange-200",
    shadow: "shadow-orange-500/25",
    dot: "bg-orange-500",
  },
  secondary: {
    from: "from-amber-500",
    to: "to-yellow-500",
    light: "bg-amber-50",
    text: "text-amber-600",
  },
}

const connectorIcons = {
  CCS: Zap,
  TYPE2: Plug,
  CHADEMO: Battery,
}

const speedIcons = {
  SLOW: Clock,
  FAST: Gauge,
  SUPER_FAST: Flame,
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [filters, setFilters] = useState({
    connectorTypes: [] as ConnectorType[],
    chargingSpeeds: [] as ChargingSpeed[],
    minPower: 0,
    maxPower: 350,
    verifiedOnly: false,
    availableOnly: false,
    amenities: [] as string[],
    priceRange: [0, 100] as [number, number],
    distance: 50,
    rating: 0,
  })

  const [activeFilterCount, setActiveFilterCount] = useState(0)

  // Update active filter count
  useEffect(() => {
    let count = 0
    if (filters.connectorTypes.length) count++
    if (filters.chargingSpeeds.length) count++
    if (filters.minPower > 0) count++
    if (filters.verifiedOnly) count++
    if (filters.availableOnly) count++
    if (filters.amenities.length) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100) count++
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
    setFilters({
      connectorTypes: [],
      chargingSpeeds: [],
      minPower: 0,
      maxPower: 350,
      verifiedOnly: false,
      availableOnly: false,
      amenities: [],
      priceRange: [0, 100],
      distance: 50,
      rating: 0,
    })
    onFilterChange({})
  }

  const FilterChip = ({
    icon: Icon,
    label,
    active,
    onClick,
    gradient = false,
  }: {
    icon?: any
    label: string
    active: boolean
    onClick: () => void
    gradient?: boolean
  }) => (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
        active
          ? gradient
            ? `bg-linear-to-r ${orangePalette.primary.from} ${orangePalette.primary.to} text-white shadow-lg ${orangePalette.primary.shadow}`
            : `${orangePalette.primary.light} ${orangePalette.primary.text} border ${orangePalette.primary.border}`
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </motion.button>
  )

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="max-w-7xl  px-4 sm:px-6 lg:px-8">
        {/* Main Filter Bar */}
        <div className="flex items-center gap-3 py-3">
          {/* Filter Button with Animation */}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className={`relative rounded-2xl border-2 transition-all ${
                    isOpen || activeFilterCount > 0
                      ? `border-gray-200 bg-gray-50 ${orangePalette.primary.text}`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" color="black" />
                  Filters
                  {activeFilterCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`ml-2 px-1.5 py-0.5 bg-linear-to-r ${orangePalette.primary.from} ${orangePalette.primary.to} text-white text-xs rounded-full shadow-sm`}
                    >
                      {activeFilterCount}
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </PopoverTrigger>

            <PopoverContent
              className="w-[400px] p-0 rounded-2xl shadow-2xl border-0 overflow-hidden"
              align="start"
            >
              {/* Filter Content */}
              <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Quick Filters */}
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                    Quick Filters
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <FilterChip
                      icon={Shield}
                      label="Verified Only"
                      active={filters.verifiedOnly}
                      onClick={() =>
                        updateFilters({ verifiedOnly: !filters.verifiedOnly })
                      }
                      gradient
                    />
                    <FilterChip
                      icon={Zap}
                      label="Available Now"
                      active={filters.availableOnly}
                      onClick={() =>
                        updateFilters({ availableOnly: !filters.availableOnly })
                      }
                      gradient
                    />
                  </div>
                </div>

                {/* Connector Types */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Plug className={`w-4 h-4 ${orangePalette.primary.text}`} />
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Connector Type
                    </Label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["CCS", "TYPE2", "CHADEMO"] as ConnectorType[]).map(
                      (type) => {
                        const Icon = connectorIcons[type]
                        return (
                          <motion.button
                            key={type}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              const newTypes = filters.connectorTypes.includes(
                                type,
                              )
                                ? filters.connectorTypes.filter(
                                    (t) => t !== type,
                                  )
                                : [...filters.connectorTypes, type]
                              updateFilters({ connectorTypes: newTypes })
                            }}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              filters.connectorTypes.includes(type)
                                ? `border-orange-300 ${orangePalette.primary.light}`
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <Icon
                                className={`w-5 h-5 mb-1 ${
                                  filters.connectorTypes.includes(type)
                                    ? orangePalette.primary.text
                                    : "text-gray-400"
                                }`}
                              />
                              <span
                                className={`text-xs font-medium ${
                                  filters.connectorTypes.includes(type)
                                    ? orangePalette.primary.text
                                    : "text-gray-600"
                                }`}
                              >
                                {type}
                              </span>
                            </div>
                          </motion.button>
                        )
                      },
                    )}
                  </div>
                </div>

                {/* Charging Speed */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Gauge
                      className={`w-4 h-4 ${orangePalette.primary.text}`}
                    />
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Charging Speed
                    </Label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["SLOW", "FAST", "SUPER_FAST"] as ChargingSpeed[]).map(
                      (speed) => {
                        const Icon = speedIcons[speed]
                        return (
                          <motion.button
                            key={speed}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              const newSpeeds = filters.chargingSpeeds.includes(
                                speed,
                              )
                                ? filters.chargingSpeeds.filter(
                                    (s) => s !== speed,
                                  )
                                : [...filters.chargingSpeeds, speed]
                              updateFilters({ chargingSpeeds: newSpeeds })
                            }}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              filters.chargingSpeeds.includes(speed)
                                ? `border-orange-300 ${orangePalette.primary.light}`
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <Icon
                                className={`w-5 h-5 mb-1 ${
                                  filters.chargingSpeeds.includes(speed)
                                    ? orangePalette.primary.text
                                    : "text-gray-400"
                                }`}
                              />
                              <span
                                className={`text-xs font-medium ${
                                  filters.chargingSpeeds.includes(speed)
                                    ? orangePalette.primary.text
                                    : "text-gray-600"
                                }`}
                              >
                                {speed}
                              </span>
                            </div>
                          </motion.button>
                        )
                      },
                    )}
                  </div>
                </div>

                {/* Power Range with Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Battery
                        className={`w-4 h-4 ${orangePalette.primary.text}`}
                      />
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Power Output
                      </Label>
                    </div>
                    <Badge
                      variant="outline"
                      className={`rounded-full ${orangePalette.primary.light} ${orangePalette.primary.text} border-0`}
                    >
                      {filters.minPower} - {filters.maxPower} kW
                    </Badge>
                  </div>
                  <Slider
                    value={[filters.minPower, filters.maxPower]}
                    onValueChange={([min, max]) =>
                      updateFilters({ minPower: min, maxPower: max })
                    }
                    min={0}
                    max={350}
                    step={10}
                    className="[&_[role=slider]]:bg-orange-500 [&_[role=slider]]:border-orange-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0 kW</span>
                    <span>350 kW</span>
                  </div>
                </div>

                {/* Distance Range */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation
                        className={`w-4 h-4 ${orangePalette.primary.text}`}
                      />
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Distance
                      </Label>
                    </div>
                    <Badge
                      variant="outline"
                      className={`rounded-full ${orangePalette.primary.light} ${orangePalette.primary.text} border-0`}
                    >
                      {filters.distance} km
                    </Badge>
                  </div>
                  <Slider
                    value={[filters.distance]}
                    onValueChange={([d]) => updateFilters({ distance: d })}
                    min={0}
                    max={100}
                    step={5}
                    className="[&_[role=slider]]:bg-orange-500 [&_[role=slider]]:border-orange-500"
                  />
                </div>

                {/* Minimum Rating */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award
                      className={`w-4 h-4 ${orangePalette.primary.text}`}
                    />
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Minimum Rating
                    </Label>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateFilters({ rating: star })}
                        className={`p-2 rounded-lg transition-all ${
                          filters.rating >= star
                            ? "text-orange-400"
                            : "text-gray-300"
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer with Apply Button */}
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <Button
                  onClick={() => setIsOpen(false)}
                  className={`w-full rounded-lg bg-linear-to-r ${orangePalette.primary.from} ${orangePalette.primary.to} hover:from-orange-600 hover:to-amber-600 text-white shadow-lg ${orangePalette.primary.shadow}`}
                >
                  Apply Filters
                </Button>

                {activeFilterCount > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full  rounded-lg mt-2"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Active Filter Chips */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto hide-scrollbar">
            <AnimatePresence>
              {filters.connectorTypes.map((type) => {
                const Icon = connectorIcons[type]
                return (
                  <motion.div
                    key={type}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <Badge
                      variant="secondary"
                      className={`rounded-full pl-2 pr-1 py-1 ${orangePalette.primary.light} ${orangePalette.primary.text} font-normal border-0`}
                    >
                      <span className="flex items-center gap-1">
                        <Icon className="w-3 h-3" />
                        {type}
                      </span>
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer hover:text-orange-800"
                        onClick={() => {
                          const newTypes = filters.connectorTypes.filter(
                            (t) => t !== type,
                          )
                          updateFilters({ connectorTypes: newTypes })
                        }}
                      />
                    </Badge>
                  </motion.div>
                )
              })}

              {filters.chargingSpeeds.map((speed) => {
                const Icon = speedIcons[speed]
                return (
                  <motion.div
                    key={speed}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <Badge
                      variant="secondary"
                      className={`rounded-full pl-2 pr-1 py-1 ${orangePalette.primary.light} ${orangePalette.primary.text} font-normal border-0`}
                    >
                      <span className="flex items-center gap-1">
                        <Icon className="w-3 h-3" />
                        {speed}
                      </span>
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer hover:text-orange-800"
                        onClick={() => {
                          const newSpeeds = filters.chargingSpeeds.filter(
                            (s) => s !== speed,
                          )
                          updateFilters({ chargingSpeeds: newSpeeds })
                        }}
                      />
                    </Badge>
                  </motion.div>
                )
              })}

              {filters.verifiedOnly && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Badge
                    variant="secondary"
                    className={`rounded-full pl-2 pr-1 py-1 ${orangePalette.primary.light} ${orangePalette.primary.text} font-normal border-0`}
                  >
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Verified
                    </span>
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer hover:text-orange-800"
                      onClick={() => updateFilters({ verifiedOnly: false })}
                    />
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
