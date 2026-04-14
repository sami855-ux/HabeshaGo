"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import {
  MapPin,
  Zap,
  Clock,
  Gauge,
  X,
  Navigation,
  Heart,
  Share2,
  Star,
  TrendingUp,
  Shield,
  Wifi,
  Coffee,
  ShoppingBag,
  Car,
  BatteryCharging,
  Award,
  CheckCircle2,
  Clock8,
  Sparkles,
  Calendar,
  CreditCard,
} from "lucide-react"
import { ImageGallery } from "./ImageGallery"
import { ChargingPointsGrid } from "./ChargingPointsGrid"
import { TariffSection } from "./TariffSection"
import { SmartRecommendationBanner } from "./SmartRecommendationBanner"
import { ChargingStation, ChargingPoint } from "@/types/ev"

interface StationDetailsSheetProps {
  station: ChargingStation | null
  onClose: () => void
}

export function StationDetailsSheet({
  station,
  onClose,
}: StationDetailsSheetProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedChargingPoint, setSelectedChargingPoint] =
    useState<ChargingPoint | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    setSelectedChargingPoint(null)
  }, [station, activeTab])

  if (!station) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-500"
      case "CHARGING":
        return "bg-amber-500"
      case "OCCUPIED":
        return "bg-rose-500"
      case "MAINTENANCE":
        return "bg-slate-500"
      default:
        return "bg-slate-300"
    }
  }

  const availablePoints = station.chargingPoints.filter(
    (point) => point.status === "AVAILABLE",
  ).length

  const totalPoints = station.chargingPoints.length
  const availabilityRate = (availablePoints / totalPoints) * 100
  const avgRating = station.ratings?.length
    ? (
        station.ratings.reduce((acc, r) => acc + r.rating, 0) /
        station.ratings.length
      ).toFixed(1)
    : null

  const handleBooking = () => {
    onClose()
    router.push(`/user/booking/station/${station.id}`)
  }

  return (
    <Sheet open={!!station} onOpenChange={onClose}>
      <SheetContent className="w-[780px] sm:max-w-[780px] p-0 flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        {/* Premium Header with Glassmorphism */}
        <div className="relative overflow-hidden flex-shrink-0">
          {/* Background Gradient - Green theme */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

          {/* Content */}
          <div className="relative">
            <SheetHeader className="p-6 pb-3 pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {station.isVerified && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-2 py-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                        <span className="text-xs font-medium text-white">
                          Verified Partner
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 w-full">
                    {/* Station Name */}
                    <SheetTitle className="text-3xl font-bold text-white tracking-tight">
                      {station.name}
                    </SheetTitle>

                    {/* Rating and Availability - Side by side */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {avgRating && (
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-white text-sm">
                              {avgRating}
                            </span>
                          </div>
                          <span className="text-xs text-white/70">
                            {station.ratings.length}{" "}
                            {station.ratings.length === 1
                              ? "review"
                              : "reviews"}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                        <div className="relative">
                          <div
                            className={`absolute inset-0 rounded-full ${availabilityRate > 50 ? "bg-emerald-400/20" : "bg-amber-400/20"} animate-pulse`}
                          />
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-300 relative" />
                        </div>
                        <span className="text-sm font-medium text-white">
                          {availabilityRate.toFixed(0)}% Available
                        </span>
                      </div>

                      {/* Optional: Show if station is busy */}
                      {availabilityRate < 30 && availablePoints > 0 && (
                        <div className="flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                          <Clock className="h-3.5 w-3.5 text-amber-400" />
                          <span className="text-xs font-medium text-white">
                            Limited Slots
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>{station.address || "Address not available"}</span>
                    </div>
                    {station.city && (
                      <>
                        <span className="text-white/40">•</span>
                        <span>{station.city}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </SheetHeader>
          </div>
        </div>

        {/* Smart Recommendation Banner */}
        <SmartRecommendationBanner station={station} />

        {/* Modern Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="px-6 pt-2 border-b border-emerald-200/60 dark:border-emerald-800/40 bg-gradient-to-r from-white via-emerald-50/30 to-white dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-950 backdrop-blur-md sticky top-0 z-10 flex-shrink-0 shadow-sm">
            <TabsList className="w-full justify-start gap-8 bg-transparent h-auto p-0">
              <TabsTrigger
                value="overview"
                className="relative data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 text-slate-600 dark:text-slate-400 font-semibold px-0 pb-3 transition-all duration-200 hover:text-emerald-600 dark:hover:text-emerald-300 group"
              >
                <span className="relative z-10">Overview</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100" />
              </TabsTrigger>

              <TabsTrigger
                value="charging"
                className="relative data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 text-slate-600 dark:text-slate-400 font-semibold px-0 pb-3 transition-all duration-200 hover:text-emerald-600 dark:hover:text-emerald-300 group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Charging Points
                  {totalPoints > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-900/60 dark:to-emerald-800/60 text-emerald-700 dark:text-emerald-300 border-0 shadow-sm font-semibold px-2.5 py-0.5 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md"
                    >
                      {totalPoints}
                    </Badge>
                  )}
                </span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100" />
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 h-[500px]">
            <div className="p-6 space-y-8">
              {/* Overview Tab */}
              <TabsContent value="overview" className="m-0 space-y-6">
                {/* Image Gallery */}
                {station.images && station.images.length > 0 && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                    <ImageGallery images={station.images} />
                  </div>
                )}

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <BatteryCharging className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-medium text-xs text-slate-600 dark:text-slate-400">
                        Charging Speed
                      </h4>
                    </div>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.max(
                        ...station.chargingPoints.map((p) => p.powerKw),
                      )}
                      <span className="text-sm font-normal text-slate-500">
                        {" "}
                        kW
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      Ultra-fast DC charging
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock8 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="font-medium text-xs text-slate-600 dark:text-slate-400">
                        Operating Hours
                      </h4>
                    </div>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      24/7
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      Always open
                    </p>
                  </div>
                </div>

                {/* Tariff Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      Pricing & Tariffs
                    </h3>
                  </div>
                  <div className="bg-white dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <TariffSection tariffs={station.tariffs} />
                  </div>
                </div>
              </TabsContent>

              {/* Charging Points Tab */}
              <TabsContent value="charging" className="m-0 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Available Charging Points
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Select a port to calculate costs and start charging
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Navigation className="h-4 w-4" />
                    Navigate
                  </Button>
                </div>
                <ChargingPointsGrid
                  points={station.chargingPoints}
                  onSelectPoint={setSelectedChargingPoint}
                  selectedPointId={selectedChargingPoint?.id}
                />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        {/* Book Station Button - Redirects to booking page */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm p-4 flex-shrink-0">
          <Button
            onClick={handleBooking}
            disabled={availablePoints === 0}
            className="w-full bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-800 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg py-6 cursor-pointer"
            size="lg"
          >
            <Calendar className="h-5 w-5 mr-2" />
            {availablePoints === 0 ? "No Slots Available" : "Book This Station"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
