"use client"

import { useEffect, useRef, useState } from "react"
import type * as LeafletType from "leaflet"
import "leaflet/dist/leaflet.css"

import { useUserLocation } from "@/hooks/useUserLocation"
import { useQueryParams } from "@/hooks/useQueryParams"
import UserLocationMarker from "./UserLocationMarker"
import EVStationsLayer from "./EVStationsLayer"
import ParkingStationsLayer from "./ParkingStationsLayer"
import BusLayer from "./BusLayer"
import NavigationRoute from "./NavigationRoute"

import { Coordinates } from "@/types/map-user"

let L: typeof LeafletType

if (typeof window !== "undefined") {
  L = require("leaflet")
}

export default function MapView() {
  const mapRef = useRef<LeafletType.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const { userLocation, loading, error } = useUserLocation()
  const { getParam } = useQueryParams()

  const [selectedDestination, setSelectedDestination] =
    useState<Coordinates | null>(null)

  const [mapReady, setMapReady] = useState(false)

  // Inject CSS to disable all tooltips globally
  useEffect(() => {
    if (typeof document !== "undefined") {
      const style = document.createElement("style")
      style.textContent = `
        /* Completely disable all Leaflet tooltips */
        .leaflet-tooltip,
        .leaflet-tooltip-pane,
        .leaflet-popup,
        .leaflet-popup-pane,
        .leaflet-tooltip-top,
        .leaflet-tooltip-bottom,
        .leaflet-tooltip-left,
        .leaflet-tooltip-right {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          animation: none !important;
          transition: none !important;
        }
        
        /* Disable any hover tooltips */
        .leaflet-marker-icon:hover::before,
        .leaflet-marker-icon:hover::after,
        [data-tooltip],
        [title] {
          pointer-events: none !important;
        }
        
        /* Ensure no pseudo-element tooltips appear */
        .bus-marker:hover::after,
        .bus-marker div:hover::after,
        .custom-marker:hover::after {
          display: none !important;
        }
      `
      document.head.appendChild(style)

      return () => {
        document.head.removeChild(style)
      }
    }
  }, [])

  // Fix leaflet marker icons
  useEffect(() => {
    if (!L) return

    delete (L.Icon.Default.prototype as any)._getIconUrl

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/leaflet/marker-icon-2x.png",
      iconUrl: "/leaflet/marker-icon.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    })
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !L) return

    const latParam = parseFloat(getParam("lat") || "")
    const lngParam = parseFloat(getParam("lng") || "")

    const hasQueryLocation = !isNaN(latParam) && !isNaN(lngParam)

    let initialCenter: Coordinates = {
      lat: 9.03, // Addis Ababa fallback
      lng: 38.74,
    }

    if (hasQueryLocation) {
      initialCenter = { lat: latParam, lng: lngParam }
    } else if (userLocation) {
      initialCenter = userLocation
    }

    const map = L.map(mapContainerRef.current).setView(
      [initialCenter.lat, initialCenter.lng],
      13,
    )

    // Disable all tooltips on the map instance
    map.tooltip = undefined as any
    map.closeTooltip = () => {}
    map.openTooltip = () => map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 25,
    }).addTo(map)

    mapRef.current = map
    setMapReady(true)

    return () => {
      map.remove()
      mapRef.current = null
      setMapReady(false)
    }
  }, [userLocation, getParam])

  // Center map on user location
  useEffect(() => {
    if (!mapRef.current || !userLocation) return

    const latParam = getParam("lat")
    const lngParam = getParam("lng")

    if (!latParam && !lngParam) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 14)
    }
  }, [userLocation, getParam])

  const handleDestinationSelect = (destination: Coordinates) => {
    setSelectedDestination(destination)
  }

  // Loading UI
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p>Getting your location...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.warn("Location error:", error)
  }

  return (
    <div className="relative h-screen w-full">
      {/* Map container */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Map layers */}
      {mapRef.current && mapReady && (
        <>
          {userLocation && (
            <UserLocationMarker
              map={mapRef.current}
              userLocation={userLocation}
            />
          )}

          <EVStationsLayer
            map={mapRef.current}
            userLocation={userLocation || { lat: 9.03, lng: 38.74 }}
          />

          {/* <ParkingStationsLayer
            map={mapRef.current}
            userLocation={userLocation || { lat: 9.03, lng: 38.74 }}
            onDestinationSelect={handleDestinationSelect}
          /> */}

          <BusLayer map={mapRef.current} />

          {selectedDestination && userLocation && (
            <NavigationRoute
              map={mapRef.current}
              origin={userLocation}
              destination={selectedDestination}
              onClose={() => setSelectedDestination(null)}
            />
          )}
        </>
      )}
    </div>
  )
}
