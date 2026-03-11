"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import { useSocket } from "@/hooks/useSocket"
import { useQueryParams } from "@/hooks/useQueryParams"
import { Bus } from "@/types/map-user"

interface BusLayerProps {
  map: L.Map
}

export default function BusLayer({ map }: BusLayerProps) {
  const { buses, isConnected } = useSocket()
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const { getParam } = useQueryParams()

  useEffect(() => {
    if (!map) return

    const markerType = getParam("type") || "all"
    if (markerType !== "all" && markerType !== "bus") {
      // Hide all bus markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current.clear()
      return
    }

    // Create custom icon for buses
    const busIcon = (bus: Bus) =>
      L.divIcon({
        className: "bus-marker",
        html: `<div class="bg-blue-500 p-1 rounded-full shadow-lg transform rotate-${bus.heading || 0}">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
          <line x1="8" y1="16" x2="16" y2="16"/>
          <line x1="8" y1="8" x2="16" y2="8"/>
        </svg>
      </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

    // Update bus positions
    buses.forEach((bus) => {
      const existingMarker = markersRef.current.get(bus.id)

      if (existingMarker) {
        // Update existing marker position with animation
        existingMarker.setLatLng([bus.location.lat, bus.location.lng])

        // Update popup content
        const popupContent = `
          <div class="p-2">
            <h3 class="font-semibold">Bus ${bus.routeName}</h3>
            <p class="text-sm">Route: ${bus.routeId}</p>
            <p class="text-xs text-gray-500">Last updated: ${new Date(bus.timestamp).toLocaleTimeString()}</p>
          </div>
        `
        existingMarker.setPopupContent(popupContent)
      } else {
        // Create new marker
        const marker = L.marker([bus.location.lat, bus.location.lng], {
          icon: busIcon(bus),
        }).addTo(map)

        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold">Bus ${bus.routeName}</h3>
            <p class="text-sm">Route: ${bus.routeId}</p>
            <p class="text-xs text-gray-500">Last updated: ${new Date(bus.timestamp).toLocaleTimeString()}</p>
          </div>
        `)

        markersRef.current.set(bus.id, marker)
      }
    })

    // Remove buses that are no longer active
    const activeBusIds = new Set(buses.map((b) => b.id))
    markersRef.current.forEach((marker, id) => {
      if (!activeBusIds.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
      }
    })

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current.clear()
    }
  }, [map, buses, getParam])

  return null
}
