"use client"

import { useQueryParams } from "@/hooks/useQueryParams"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bus,
  Zap,
  ParkingCircle,
  MapPin,
  GripHorizontal,
  Sparkles,
  Flame,
  Clock,
  Star,
  Navigation,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

export default function MapFilters() {
  const { getParam, setParam } = useQueryParams()
  const currentType = getParam("type") || "all"
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const filters = [
    {
      value: "",
      label: "Explore All",
      icon: MapPin,
      gradient: "from-gray-600 to-gray-800",
      bgGradient: "from-gray-50 to-gray-100",
      color: "text-gray-700",
      count: 42,
      description: "All locations",
      popular: true,
    },
    {
      value: "ev",
      label: "EV Charging",
      icon: Zap,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      color: "text-emerald-600",
      count: 12,
      description: "Fast charging stations",
      popular: true,
      badge: "Trending",
      eta: "2-5 min",
    },
    {
      value: "parking",
      label: "Parking",
      icon: ParkingCircle,
      gradient: "from-blue-500 to-indigo-500",
      bgGradient: "from-blue-50 to-indigo-50",
      color: "text-blue-600",
      count: 18,
      description: "Secure parking spots",
      badge: "Available",
      eta: "1-3 min",
    },
    {
      value: "bus",
      label: "Bus Stops",
      icon: Bus,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
      color: "text-amber-600",
      count: 8,
      description: "Public transport",
      badge: "Live",
      eta: "3-7 min",
    },
  ]

  const handleFilterChange = (value: string) => {
    setParam("type", value)
  }

  const currentFilter = filters.find((f) => f.value === currentType)
  const activeIndex = filters.findIndex((f) => f.value === currentType)

  return (
    <div
      className={cn(
        "sticky top-4 z-40 transition-all duration-500 ",
        scrolled && "top-2",
      )}
    >
      {/* Floating action bar - Modern Apple-style */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={cn("mx-4 transition-all duration-300")}
      >
        {/* Main Filter Carousel - Uber Eats / DoorDash Style */}
        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide pb-2 mt-2">
            <div className="flex gap-1 min-w-max ">
              {filters.map((filter, index) => {
                const Icon = filter.icon
                const isActive = currentType === filter.value
                const isHovered = hoveredFilter === filter.value

                return (
                  <motion.button
                    key={filter.value}
                    onClick={() => handleFilterChange(filter.value)}
                    onMouseEnter={() => setHoveredFilter(filter.value)}
                    onMouseLeave={() => setHoveredFilter(null)}
                    className="relative group"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div
                      className={cn(
                        "relative px-4 py-1 rounded-2xl transition-all duration-300",
                        "backdrop-blur-sm border",
                        isActive
                          ? "bg-gradient-to-r shadow-lg border-transparent"
                          : "bg-white/80 border-gray-200 hover:border-gray-300 hover:shadow-md",
                        isActive &&
                          filter.gradient &&
                          `bg-gradient-to-r ${filter.gradient}`,
                      )}
                    >
                      {/* Animated background glow */}
                      {isActive && (
                        <motion.div
                          layoutId="activeBackground"
                          className="absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0"
                          style={{
                            background: `linear-gradient(135deg, ${filter.gradient})`,
                          }}
                          initial={false}
                          transition={{ type: "spring", duration: 0.6 }}
                        />
                      )}

                      <div className="relative flex items-center gap-2.5">
                        {/* Icon with pulse animation when active */}
                        <div
                          className={cn(
                            "relative",
                            isActive && "animate-pulse",
                          )}
                        >
                          <div
                            className={cn(
                              "p-1.5 rounded-xl transition-all duration-300",
                              isActive
                                ? "bg-white/20"
                                : filter.bgGradient &&
                                    `bg-gradient-to-br ${filter.bgGradient}`,
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-3 w-3 transition-transform duration-300",
                                isActive ? "text-white" : filter.color,
                                isHovered && "scale-110",
                              )}
                            />
                          </div>
                        </div>

                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "font-semibold text-xs transition-colors",
                                isActive ? "text-white" : "text-gray-700",
                              )}
                            >
                              {filter.label}
                            </span>
                            {filter.badge && (
                              <span
                                className={cn(
                                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                  isActive
                                    ? "bg-white/20 text-white"
                                    : "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700",
                                )}
                              >
                                {filter.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions Row - Stripe/Linear Style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mt-3 px-2"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-500 w-20">
              <Navigation className="h-3 w-3" />
              <span>Near you</span>
            </div>

            <div className="h-3 w-px bg-gray-200" />

            <div className="flex items-center gap-1 text-xs text-gray-500 w-20">
              <Star className="h-3 w-3" />
              <span>Top rated</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors w-44"
          >
            <Sparkles className="h-3 w-3" />
            <span>AI Recommendations</span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Active Filter Banner - Apple Maps Style */}
      <AnimatePresence>
        {currentType !== "all" && currentFilter && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mx-4 mt-2"
          >
            <div
              className={cn(
                "bg-gradient-to-r p-3 rounded-xl shadow-lg backdrop-blur-md",
                currentFilter.gradient &&
                  `from-${currentFilter.gradient.split(" ")[0]} to-${currentFilter.gradient.split(" ")[2]}`,
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                    <currentFilter.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">
                      Showing {currentFilter.label}
                    </h3>
                    <p className="text-white/70 text-xs">
                      {currentFilter.count} locations available •{" "}
                      {currentFilter.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange("all")}
                  className="text-white hover:bg-white/20 h-8 px-3"
                >
                  Clear
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag indicator for mobile */}
      <div className="flex justify-center mt-2 sm:hidden">
        <GripHorizontal className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  )
}
