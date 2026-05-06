"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

import { ChargingStation, StationStatus } from "@/types/ev"

interface MapSectionProps {
  stations: ChargingStation[]
  onMarkerClick: (station: ChargingStation) => void
  selectedStationId?: number
}

const getMarkerColor = (status: StationStatus, hasAvailablePoints: boolean) => {
  if (status === "ACTIVE") {
    return hasAvailablePoints ? "#10b981" : "#f59e0b"
  }
  if (status === "MAINTENANCE") return "#eab308"
  return "#ef4444"
}

export function MapSection({
  stations,
  onMarkerClick,
  selectedStationId,
}: MapSectionProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  // ✅ INIT MAP (UNCHANGED)
  useEffect(() => {
    if (typeof window === "undefined") return

    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([9.0192, 38.7468], 13)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 25,
      }).addTo(mapRef.current)
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [])

  // ✅ UPDATE MARKERS WHEN DATA CHANGES
  useEffect(() => {
    if (!mapRef.current || !stations) return

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    const bounds: L.LatLngExpression[] = []

    stations.forEach((station) => {
      const hasAvailable = station.chargingPoints.some(
        (cp) => cp.status === "AVAILABLE",
      )

      const color = getMarkerColor(station.status, hasAvailable)

      const marker = L.marker([station.lat, station.lng], {
        icon: L.divIcon({
          className: "custom-marker",
          html: `
            <div 
              class="w-6 h-6 rounded-full border-2 border-white shadow-lg ${
                selectedStationId === station.id ? "scale-125" : ""
              }"
              style="background-color: ${color}"
            ></div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      })
        .addTo(mapRef.current!)
        .on("click", () => onMarkerClick(station))

      // Highlight selected
      if (station.id === selectedStationId) {
        marker.bindPopup(`<b>${station.name}</b>`).openPopup()
      }

      markersRef.current.push(marker)
      bounds.push([station.lat, station.lng])
    })

    // ✅ AUTO FIT MAP (better UX)
    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
      })
    }
  }, [stations, selectedStationId, onMarkerClick])

  return <div id="map" className="w-full h-full" />
}
