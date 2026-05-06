"use client"

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useTransition,
  useDeferredValue,
} from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/useDebounce"

import { ParkingLot, ParkingSlot } from "@/types/parking"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Menu, X, Search, SlidersHorizontal } from "lucide-react"
import { mockParkingLots } from "@/data/mockData"
import { ParkingLotList } from "@/components/user-dashboard/parking/ParkingLotList"
// import { MapSection } from "@/components/user-dashboard/parking/ParkingMapSection"
import { ParkingLotDetailsSheet } from "@/components/user-dashboard/parking/ParkingLotDetailsSheet"
import { FilterBar } from "@/components/user-dashboard/parking/FilterBar"

import dynamic from "next/dynamic"

const MapSection = dynamic(
  () => import("@/components/user-dashboard/parking/ParkingMapSection").then(mod => mod.MapSection),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
)

export type TabType = "ALL" | "NEARBY" | "PREMIUM"

export interface FilterState {
  minAvailableSlots?: number
  maxPricePerHour?: number
  hasSecurity?: boolean
  hasCCTV?: boolean
  hasEVCharging?: boolean
  city?: string
  sortBy?: string
  slotType?: string[]
}
export default function ParkingDashboard() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null)
  const [filters, setFilters] = useState<FilterState>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("ALL")
  const [isMobileListOpen, setIsMobileListOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const deferredFilters = useDeferredValue(filters)

  const userLocation = useMemo(() => ({ lat: 9.0192, lng: 38.7468 }), [])

  const calculateDistance = useCallback(
    (lot: ParkingLot) => {
      const dx = lot.latitude - userLocation.lat
      const dy = lot.longitude - userLocation.lng
      return Math.sqrt(dx * dx + dy * dy) * 111
    },
    [userLocation],
  )

  // Use mock data instead of API call
  const parkingLots = useMemo(() => {
    return mockParkingLots
  }, [])

  const filteredLots = useMemo(() => {
    let data = [...parkingLots]

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase()
      data = data.filter(
        (lot) =>
          lot.name.toLowerCase().includes(query) ||
          lot.address?.toLowerCase().includes(query) ||
          lot.city?.toLowerCase().includes(query),
      )
    }

    if (activeTab === "NEARBY") {
      data = data
        .map((lot) => ({
          ...lot,
          distance: calculateDistance(lot),
        }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        .slice(0, 20)
    }

    if (activeTab === "PREMIUM") {
      data = data.filter(
        (lot) => lot.hasSecurity && lot.hasCCTV && (lot.rating || 0) >= 4,
      )
    }

    const {
      minAvailableSlots = 0,
      maxPricePerHour = Infinity,
      hasSecurity = false,
      hasCCTV = false,
      hasEVCharging = false,
      city,
    } = deferredFilters

    if (minAvailableSlots > 0) {
      data = data.filter((lot) => lot.availableSlots >= minAvailableSlots)
    }

    if (maxPricePerHour < Infinity) {
      data = data.filter((lot) => lot.pricePerMinute * 60 <= maxPricePerHour)
    }

    if (hasSecurity) {
      data = data.filter((lot) => lot.hasSecurity)
    }

    if (hasCCTV) {
      data = data.filter((lot) => lot.hasCCTV)
    }

    if (hasEVCharging) {
      data = data.filter((lot) =>
        lot.slots?.some((slot) => slot.isEV && slot.hasCharger),
      )
    }

    if (city) {
      data = data.filter((lot) =>
        lot.city.toLowerCase().includes(city.toLowerCase()),
      )
    }

    if (deferredFilters.sortBy) {
      switch (deferredFilters.sortBy) {
        case "price_asc":
          data.sort((a, b) => a.pricePerMinute - b.pricePerMinute)
          break
        case "price_desc":
          data.sort((a, b) => b.pricePerMinute - a.pricePerMinute)
          break
        case "availability":
          data.sort((a, b) => b.availableSlots - a.availableSlots)
          break
        case "distance":
          if (activeTab !== "NEARBY") {
            data = data
              .map((lot) => ({
                ...lot,
                distance: calculateDistance(lot),
              }))
              .sort((a, b) => (a.distance || 0) - (b.distance || 0))
          }
          break
      }
    }

    return data
  }, [
    debouncedSearchQuery,
    activeTab,
    deferredFilters,
    calculateDistance,
    parkingLots,
  ])

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    startTransition(() => {
      setFilters((prev) => ({ ...prev, ...newFilters }))
    })
  }, [])

  const handleTabChange = useCallback((tab: TabType) => {
    startTransition(() => {
      setActiveTab(tab)
      setIsMobileListOpen(false)
    })
  }, [])

  const handleLotSelect = useCallback((lot: ParkingLot) => {
    setSelectedLot(lot)
    setIsMobileListOpen(false)
  }, [])

  const handleCloseDetails = useCallback(() => {
    setSelectedLot(null)
  }, [])

  const toggleMobileList = useCallback(() => {
    setIsMobileListOpen((prev) => !prev)
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedLot(null)
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

  // Simulate loading for demo
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="h-screen flex flex-col ">
      <header className="sticky top-0 z-25 bg-white/95 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="shrink-0 gap-2 hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5 hidden sm:block" />
            <span>Back</span>
          </Button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search parking lots... (⌘ + /)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => document.getElementById("filter-drawer")?.click()}
            className="md:hidden"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <FilterBar
        onFilterChange={handleFilterChange}
        onTabChange={handleTabChange}
        activeTab={activeTab}
        filters={filters}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[420px] border-r bg-white overflow-y-auto hidden md:block shadow-lg">
          <ParkingLotList
            parkingLots={filteredLots}
            isLoading={isLoading}
            onLotSelect={handleLotSelect}
            selectedLotId={selectedLot?.id}
            userLocation={userLocation}
          />
        </aside>

        <main className="flex-1 relative">
          <MapSection
            parkingLots={filteredLots}
            onMarkerClick={handleLotSelect}
            selectedLotId={selectedLot?.id}
            userLocation={userLocation}
          />
        </main>
      </div>

      <AnimatePresence>
        {selectedLot && (
          <ParkingLotDetailsSheet
            parkingLot={selectedLot}
            onClose={handleCloseDetails}
          />
        )}
      </AnimatePresence>

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
                <div>
                  <h2 className="font-semibold text-lg">Parking Lots</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {filteredLots.length} lots found
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleMobileList}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <ParkingLotList
                parkingLots={filteredLots}
                isLoading={isLoading}
                onLotSelect={handleLotSelect}
                selectedLotId={selectedLot?.id}
                compact
                userLocation={userLocation}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {!isMobileListOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-6 right-6 md:hidden bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-blue-700 transition-all z-30 flex items-center justify-center"
          onClick={toggleMobileList}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="w-6 h-6" />
          {filteredLots.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {filteredLots.length}
            </span>
          )}
        </motion.button>
      )}

      {isPending && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-full text-sm z-50 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Updating...
        </div>
      )}
    </div>
  )
}
