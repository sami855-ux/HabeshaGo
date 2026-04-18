"use client"

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useTransition,
  useDeferredValue,
} from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/useDebounce"

import { MapSection } from "./MapSection"
import { StationList } from "./StationList"
import { FilterBar } from "./FilterBar"
import { StationDetailsSheet } from "./StationDetailsSheet"

import { ChargingStation, ChargingPoint } from "@/types/ev"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Menu, X, Search, MapPin, Navigation } from "lucide-react"
import { mockStations } from "@/lib/mock-data(1)"
import { axiosInstance } from "@/services/axiosInstance"

export type TabType = "ALL" | "NEARBY" | "EXPLORE"

const fetchStations = async ({ queryKey }) => {
  const [_key, filters] = queryKey

  const params = new URLSearchParams()

  // 🔍 map filters → query params
  if (filters?.search) params.append("search", filters.search)
  if (filters?.city) params.append("city", filters.city)
  if (filters?.status) params.append("status", filters.status)

  if (filters?.verifiedOnly) params.append("verifiedOnly", "true")

  if (filters?.availableOnly) params.append("availableOnly", "true")

  if (filters?.minPower) params.append("minPower", filters.minPower)

  if (filters?.connectorTypes?.length)
    params.append("connectorTypes", filters.connectorTypes.join(","))

  if (filters?.lat && filters?.lng) {
    params.append("lat", filters.lat)
    params.append("lng", filters.lng)
    params.append("radius", filters.radius || 50)
  }

  const { data } = await axiosInstance.get(`/ev/station?${params.toString()}`)

  return data.data
}

interface FilterState {
  connectorTypes?: string[]
  chargingSpeeds?: string[]
  minPower?: number
  maxPower?: number
  verifiedOnly?: boolean
  availableOnly?: boolean
  distance?: number
  rating?: number
  sortBy?: string
}

export function EVChargingDashboard() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // State management
  const [selectedStation, setSelectedStation] =
    useState<ChargingStation | null>(null)
  const [filters, setFilters] = useState<FilterState>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("ALL")
  const [isMobileListOpen, setIsMobileListOpen] = useState(false)

  // Optimized search with debounce
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const deferredFilters = useDeferredValue(filters)

  // User location (replace with actual GPS)
  const userLocation = useMemo(() => ({ lat: 9.0192, lng: 38.7468 }), [])

  // Distance calculation helper
  const calculateDistance = useCallback(
    (station: ChargingStation) => {
      const dx = station.lat - userLocation.lat
      const dy = station.lng - userLocation.lng
      return Math.sqrt(dx * dx + dy * dy)
    },
    [userLocation],
  )

  // 🔥 Optimized filtering pipeline
  const filteredStations = useMemo(() => {
    let data = [...mockStations]

    // Search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase()
      data = data.filter(
        (station) =>
          station.name.toLowerCase().includes(query) ||
          station.address?.toLowerCase().includes(query) ||
          station.city?.toLowerCase().includes(query),
      )
    }

    // Tab-specific filtering
    if (activeTab === "NEARBY") {
      data = data
        .map((station) => ({
          ...station,
          distance: calculateDistance(station),
        }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    // Apply filters
    const {
      connectorTypes = [],
      minPower = 0,
      verifiedOnly = false,
      availableOnly = false,
    } = deferredFilters

    if (connectorTypes.length) {
      data = data.filter((station) =>
        station.chargingPoints.some((point) =>
          connectorTypes.includes(point.connectorType),
        ),
      )
    }

    if (minPower > 0) {
      data = data.filter((station) =>
        station.chargingPoints.some((point) => point.powerKw >= minPower),
      )
    }

    if (verifiedOnly) {
      data = data.filter((station) => station.isVerified)
    }

    if (availableOnly) {
      data = data.filter((station) =>
        station.chargingPoints.some((point) => point.status === "AVAILABLE"),
      )
    }

    return data
  }, [debouncedSearchQuery, activeTab, deferredFilters, calculateDistance])

  // React Query setup (ready for real API)
  const {
    data: stations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["stations", filters],
    queryFn: fetchStations,

    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  // Handlers
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    startTransition(() => {
      setFilters(newFilters)
    })
  }, [])

  const handleTabChange = useCallback((tab: TabType) => {
    startTransition(() => {
      setActiveTab(tab)
      setIsMobileListOpen(false)
    })
  }, [])

  const handleStationSelect = useCallback((station: ChargingStation) => {
    setSelectedStation(station)
    setIsMobileListOpen(false)
  }, [])

  const handleCloseDetails = useCallback(() => {
    setSelectedStation(null)
  }, [])

  const toggleMobileList = useCallback(() => {
    setIsMobileListOpen((prev) => !prev)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedStation(null)
        setIsMobileListOpen(false)
      }
      if (e.key === "/" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        document
          .querySelector<HTMLInputElement>('input[type="search"]')
          ?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  // Body scroll lock for mobile list
  useEffect(() => {
    if (isMobileListOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileListOpen])

  return (
    <div className="h-screen flex flex-col ">
      {/* HEADER */}
      <header className="sticky top-0 z-25 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="shrink-0 gap-2 hover:bg-gray-100"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 hidden sm:block" />
            <span>Back</span>
          </Button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search stations... (⌘ + /)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              aria-label="Search charging stations"
            />
          </div>
        </div>
      </header>

      {/* FILTER BAR + TABS */}
      <FilterBar
        onFilterChange={handleFilterChange}
        onTabChange={handleTabChange}
        activeTab={activeTab}
      />

      {/* CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        {/* DESKTOP LIST */}
        <aside className="w-[420px] border-r bg-white overflow-y-auto hidden md:block shadow-lg">
          <StationList
            stations={stations}
            isLoading={isLoading}
            onStationSelect={handleStationSelect}
            selectedStationId={selectedStation?.id}
          />
        </aside>

        {/* MAP */}
        <main className="flex-1 relative">
          <MapSection
            stations={stations}
            onMarkerClick={handleStationSelect}
            selectedStationId={selectedStation?.id}
            // userLocation={userLocation}
          />
        </main>
      </div>

      {/* STATION DETAILS SHEET */}
      <AnimatePresence>
        {selectedStation && (
          <StationDetailsSheet
            station={selectedStation}
            onClose={handleCloseDetails}
          />
        )}
      </AnimatePresence>

      {/* MOBILE LIST OVERLAY */}
      <AnimatePresence>
        {isMobileListOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={toggleMobileList}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-50 shadow-2xl md:hidden overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="font-semibold">Charging Stations</h2>
                <Button variant="ghost" size="icon" onClick={toggleMobileList}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <StationList
                stations={stations}
                isLoading={isLoading}
                onStationSelect={handleStationSelect}
                selectedStationId={selectedStation?.id}
                // compact
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION BUTTON */}
      {!isMobileListOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-6 right-6 md:hidden bg-emerald-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-emerald-700 transition-all z-30 flex items-center justify-center"
          onClick={toggleMobileList}
          whileTap={{ scale: 0.95 }}
          aria-label="Show stations list"
        >
          <Menu className="w-6 h-6" />
          {stations.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {stations.length}
            </span>
          )}
        </motion.button>
      )}

      {/* LOADING INDICATOR */}
      {isPending && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-full text-sm z-50">
          Updating...
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-sm z-50">
          Failed to load stations. Retrying...
        </div>
      )}
    </div>
  )
}
