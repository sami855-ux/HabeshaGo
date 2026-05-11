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
import { axiosInstance } from "@/services/axiosInstance"

let L: typeof LeafletType

if (typeof window !== "undefined") {
  L = require("leaflet")
}

export default function MapView() {
  const mapRef = useRef<LeafletType.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  const [vehicleIds, setVehicleIds] = useState<number[]>([])
  const [mapReady, setMapReady] = useState(false)
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)

  const { userLocation, loading, error } = useUserLocation()
  const { getParam } = useQueryParams()

  const [selectedDestination, setSelectedDestination] =
    useState<Coordinates | null>(null)

  // =========================
  // Disable tooltips globally
  // =========================
  useEffect(() => {
    if (typeof document === "undefined") return

    const style = document.createElement("style")

    style.innerHTML = `
      .leaflet-tooltip,
      .leaflet-tooltip-pane,
      .leaflet-tooltip-top,
      .leaflet-tooltip-bottom,
      .leaflet-tooltip-left,
      .leaflet-tooltip-right {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }

      .leaflet-popup-close-button {
        outline: none !important;
      }
    `

    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // =========================
  // Fix leaflet default icons
  // =========================
  useEffect(() => {
    if (!L) return

    delete (L.Icon.Default.prototype as any)._getIconUrl

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/leaflet/marker-icon-2x.png",
      iconUrl: "/leaflet/marker-icon.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    })
  }, [])

  // =========================
  // Initialize map
  // =========================
  useEffect(() => {
    if (!L) return
    if (!mapContainerRef.current) return

    // prevent duplicate initialization
    if (mapRef.current) return

    const latParam = parseFloat(getParam("lat") || "")
    const lngParam = parseFloat(getParam("lng") || "")

    const hasQueryLocation = !Number.isNaN(latParam) && !Number.isNaN(lngParam)

    let initialCenter: Coordinates = {
      lat: 9.03,
      lng: 38.74,
    }

    // Priority:
    // query params -> user location -> fallback
    if (hasQueryLocation) {
      initialCenter = {
        lat: latParam,
        lng: lngParam,
      }
    } else if (userLocation) {
      initialCenter = userLocation
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([initialCenter.lat, initialCenter.lng], 13)

    // Tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 25,
    }).addTo(map)

    // Wait for map to fully initialize
    map.whenReady(() => {
      mapRef.current = map

      setTimeout(() => {
        map.invalidateSize()
        setMapReady(true)
      }, 150)
    })

    return () => {
      setMapReady(false)

      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [userLocation, getParam])

  // =========================
  // Recenter map on user location
  // =========================
  useEffect(() => {
    if (!mapRef.current) return
    if (!userLocation) return

    const latParam = getParam("lat")
    const lngParam = getParam("lng")

    // Only auto-center if no query params
    if (!latParam && !lngParam) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 14, {
        animate: true,
      })
    }
  }, [userLocation, getParam])

  // Fetch vehicle ids
  useEffect(() => {
    const fetchVehicleIds = async () => {
      try {
        setIsLoadingVehicles(true)

        const { data } = await axiosInstance.get("/vehicles/ids")

        setVehicleIds(data?.data || [])
      } catch (err) {
        console.error("Failed to fetch vehicle IDs", err)
      } finally {
        setIsLoadingVehicles(false)
      }
    }

    fetchVehicleIds()
  }, [])

  // Handle location errors
  useEffect(() => {
    if (error) {
      console.warn("Location error:", error)
    }
  }, [error])

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map container */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Loading overlay */}
      {(loading || isLoadingVehicles || !mapReady) && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      )}

      {/* Layers */}
      {mapRef.current && mapReady && (
        <>
          {/* User marker */}
          {userLocation && (
            <UserLocationMarker
              map={mapRef.current}
              userLocation={userLocation}
            />
          )}

          {/* EV stations */}
          <EVStationsLayer
            map={mapRef.current}
            userLocation={
              userLocation || {
                lat: 9.03,
                lng: 38.74,
              }
            }
          />

          {/* Parking */}

          <ParkingStationsLayer
            map={mapRef.current}
            userLocation={
              userLocation || {
                lat: 9.03,
                lng: 38.74,
              }
            }
            onDestinationSelect={(destination) =>
              setSelectedDestination(destination)
            }
          />

          {/* Buses */}
          <BusLayer map={mapRef.current} vehicleIds={vehicleIds} />

          {/* Navigation */}
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
