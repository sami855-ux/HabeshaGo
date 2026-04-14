"use client"

import { useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { ChargingStation, StationStatus } from "@/types/ev"
import { mockStations } from "@/lib/mock-data(1)"

interface MapSectionProps {
  filters: any
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
  filters,
  onMarkerClick,
  selectedStationId,
}: MapSectionProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  const { data: stations } = useQuery({
    queryKey: ["charging-stations", filters],
    queryFn: async () => {
      // Simulate API filtering
      let filtered = [...mockStations]

      if (filters.status?.length) {
        filtered = filtered.filter((s) => filters.status.includes(s.status))
      }
      if (filters.connectorTypes?.length) {
        filtered = filtered.filter((s) =>
          s.chargingPoints.some((cp) =>
            filters.connectorTypes.includes(cp.connectorType),
          ),
        )
      }
      if (filters.minPower) {
        filtered = filtered.filter((s) =>
          s.chargingPoints.some((cp) => cp.powerKw >= filters.minPower),
        )
      }
      if (filters.verifiedOnly) {
        filtered = filtered.filter((s) => s.isVerified)
      }

      return filtered
    },
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([9.0192, 38.7468], 16)

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        },
      ).addTo(mapRef.current)
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !stations) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Add new markers
    stations.forEach((station) => {
      const hasAvailable = station.chargingPoints.some(
        (cp) => cp.status === "AVAILABLE",
      )
      const color = getMarkerColor(station.status, hasAvailable)

      const marker = L.marker([station.lat, station.lng], {
        icon: L.divIcon({
          className: "custom-marker",
          html: `<div class="w-6 h-6 rounded-full border-2 border-white shadow-lg" style="background-color: ${color}"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      })
        .addTo(mapRef.current!)
        .on("click", () => onMarkerClick(station))

      if (station.id === selectedStationId) {
        marker.openPopup()
      }

      markersRef.current.push(marker)
    })
  }, [stations, selectedStationId, onMarkerClick])

  return <div id="map" className="w-full h-full" />
}
