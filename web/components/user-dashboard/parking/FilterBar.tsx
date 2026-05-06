"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  SlidersHorizontal,
  X,
  Filter,
  ChevronDown,
  Sparkles,
  MapPin,
  DollarSign,
  Shield,
  Camera,
  Zap,
  Car,
  TrendingUp,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilterState, TabType } from "@/app/(dashbaord)/user/parking/page"
import { cn } from "@/lib/utils"

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void
  onTabChange: (tab: TabType) => void
  activeTab: TabType
  filters: FilterState
}

const tabIcons = {
  ALL: <Car className="w-4 h-4" />,
  NEARBY: <MapPin className="w-4 h-4" />,
  PREMIUM: <Sparkles className="w-4 h-4" />,
}

const tabLabels = {
  ALL: "All Lots",
  NEARBY: "Nearby",
  PREMIUM: "Premium",
}

const quickFilters = [
  { id: "hasSecurity", label: "Security", icon: Shield, color: "emerald" },
  { id: "hasCCTV", label: "CCTV", icon: Camera, color: "blue" },
  { id: "hasEVCharging", label: "EV Charging", icon: Zap, color: "purple" },
]

export function FilterBar({
  onFilterChange,
  onTabChange,
  activeTab,
  filters,
}: FilterBarProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Detect scroll for glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleFilterApply = () => {
    onFilterChange(localFilters)
    setIsFilterOpen(false)
  }

  const handleFilterReset = () => {
    const emptyFilters = {}
    setLocalFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const handleQuickFilter = (key: keyof FilterState, value: boolean) => {
    const newFilters = { ...filters, [key]: value }
    onFilterChange(newFilters)
  }

  const activeFiltersCount = Object.keys(filters).filter(
    (key) =>
      filters[key as keyof FilterState] !== undefined &&
      filters[key as keyof FilterState] !== false,
  ).length

  const getActiveTabStyle = (tab: TabType) => {
    if (activeTab === tab) {
      switch (tab) {
        case "ALL":
          return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
        case "NEARBY":
          return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
        case "PREMIUM":
          return "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
        default:
          return ""
      }
    }
    return ""
  }

  return (
    <>
      {/* Sticky Filter Bar with Glassmorphism */}
      <motion.div
        initial={false}
        animate={{
          backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
          backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.8)" : "white",
          borderBottomColor: isScrolled
            ? "rgba(0, 0, 0, 0.05)"
            : "rgba(0, 0, 0, 0.1)",
        }}
        className={cn(
          "sticky top-0 z-20 border-b transition-all duration-300",
          !isScrolled && "bg-white",
        )}
      >
        <div className="px-4 py-4 sm:px-6">
          {/* Tabs with Icons */}
          <div className="flex items-center justify-between gap-4">
            <Tabs
              value={activeTab}
              onValueChange={(v) => onTabChange(v as TabType)}
              className="flex-1"
            >
              <TabsList className="inline-flex h-auto p-1 bg-gray-100/80 backdrop-blur-sm rounded-2xl gap-1">
                {(Object.keys(tabIcons) as TabType[]).map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className={cn(
                      "flex items-center gap-2 px-6 py-1 rounded-xl transition-all duration-200",
                      "data-[state=active]:shadow-lg",
                      getActiveTabStyle(tab),
                      "data-[state=inactive]:hover:bg-gray-200/50",
                    )}
                  >
                    <span className="hidden sm:inline font-medium">
                      {tabLabels[tab]}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Filter Button with Animation */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(true)}
                className={cn(
                  "relative gap-2 rounded-xl border-2 transition-all duration-200",
                  "hover:border-blue-500 hover:bg-blue-50",
                  activeFiltersCount > 0 && "border-blue-500 bg-blue-50",
                )}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs">
                      {activeFiltersCount}
                    </Badge>
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {quickFilters.map(({ id, label, icon: Icon, color }) => {
              const isActive = filters[id as keyof FilterState] === true
              return (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    handleQuickFilter(id as keyof FilterState, !isActive)
                  }
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                    isActive
                      ? {
                          "bg-emerald-100 text-emerald-700 border-emerald-200":
                            color === "emerald",
                          "bg-blue-100 text-blue-700 border-blue-200":
                            color === "blue",
                          "bg-purple-100 text-purple-700 border-purple-200":
                            color === "purple",
                        }[color]
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </motion.button>
              )
            })}

            {/* Sort Indicator */}
            {filters.sortBy && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  {filters.sortBy === "price_asc" && "Price: Low → High"}
                  {filters.sortBy === "price_desc" && "Price: High → Low"}
                  {filters.sortBy === "availability" && "Most Available"}
                  {filters.sortBy === "distance" && "Closest First"}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modern Filter Sheet */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[480px] p-0 overflow-hidden flex flex-col"
        >
          <SheetHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Filter Parking Lots
                </SheetTitle>
                <SheetDescription className="text-sm text-gray-500 mt-1">
                  Narrow down your search with advanced filters
                </SheetDescription>
              </div>
              <motion.div
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFilterOpen(false)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            {/* Availability Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Availability
                </Label>
              </div>
              <div className="space-y-3 pl-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Minimum available spots</span>
                  <span className="font-semibold text-emerald-600">
                    {localFilters.minAvailableSlots || 0} spots
                  </span>
                </div>
                <Slider
                  value={[localFilters.minAvailableSlots || 0]}
                  onValueChange={([val]) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      minAvailableSlots: val,
                    }))
                  }
                  max={50}
                  step={1}
                  className="[&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-emerald-500 [&>span:first-child]:to-emerald-600"
                />
              </div>
            </motion.div>

            {/* Price Range Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Price Range
                </Label>
              </div>
              <div className="space-y-3 pl-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Maximum per hour</span>
                  <span className="font-semibold text-blue-600">
                    ETB {(localFilters.maxPricePerHour || 10).toFixed(2)}/hr
                  </span>
                </div>
                <Slider
                  value={[localFilters.maxPricePerHour || 10]}
                  onValueChange={([val]) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      maxPricePerHour: val,
                    }))
                  }
                  max={20}
                  step={0.5}
                  className="[&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-blue-500 [&>span:first-child]:to-blue-600"
                />
              </div>
            </motion.div>

            {/* Location Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Location
                </Label>
              </div>
              <div className="space-y-3 pl-3">
                <select
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                  value={localFilters.city || ""}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                >
                  <option value="">All Cities</option>
                  <option value="addis ababa">Addis Ababa</option>
                  <option value="nairobi">Nairobi</option>
                  <option value="cairo">Cairo</option>
                </select>
              </div>
            </motion.div>

            {/* Sort Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-gray-900">
                  Sort By
                </Label>
              </div>
              <div className="space-y-2 pl-3">
                {[
                  {
                    value: "price_asc",
                    label: "Price: Low to High",
                    icon: DollarSign,
                  },
                  {
                    value: "price_desc",
                    label: "Price: High to Low",
                    icon: DollarSign,
                  },
                  {
                    value: "availability",
                    label: "Most Available Spots",
                    icon: Car,
                  },
                  {
                    value: "distance",
                    label: "Closest Distance",
                    icon: MapPin,
                  },
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ x: 5 }}
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        sortBy: option.value,
                      }))
                    }
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                      localFilters.sortBy === option.value
                        ? "bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700"
                        : "hover:bg-gray-50 text-gray-600",
                    )}
                  >
                    <option.icon className="w-4 h-4" />
                    <span className="font-medium">{option.label}</span>
                    {localFilters.sortBy === option.value && (
                      <motion.div
                        layoutId="activeSort"
                        className="ml-auto w-2 h-2 rounded-full bg-indigo-500"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t bg-gray-50/50 backdrop-blur-sm">
            <div className="flex gap-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={handleFilterApply}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 rounded-xl py-6 text-base font-semibold"
                >
                  Apply Filters
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleFilterReset}
                  variant="outline"
                  className="rounded-xl px-6 py-6 border-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all"
                >
                  Reset All
                </Button>
              </motion.div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
