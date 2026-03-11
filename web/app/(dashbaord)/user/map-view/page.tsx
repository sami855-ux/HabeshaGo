"use client"

import { Suspense } from "react"
import MapFilters from "@/components/user-dashboard/map/MapFilters"
import MapSearch from "@/components/user-dashboard/map/MapSearch"
import ShareLocationButton from "@/components/user-dashboard/map/ShareLocationButton"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import dynamic from "next/dynamic"

// Import map dynamically with no SSR to avoid hydration issues
const MapView = dynamic(
  () => import("@/components/user-dashboard/map/MapView"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p>Loading map...</p>
        </div>
      </div>
    ),
  },
)
export default function MapPage() {
  return (
    <div className="relative h-screen w-full">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <MapView />
      </Suspense>

      {/* UI Overlay */}
      <div className="absolute left-4 right-4 top-4 z-[1000] space-y-2 md:left-8 md:right-auto md:w-96">
        <Card className="p-4 shadow-lg">
          <div className="space-y-4">
            <MapFilters />
            <MapSearch />
          </div>
        </Card>
      </div>

      {/* Share Button */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <ShareLocationButton />
      </div>
    </div>
  )
}
