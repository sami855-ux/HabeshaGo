"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import { useSocket } from "@/hooks/useSocket"
import { useQueryParams } from "@/hooks/useQueryParams"
import { Bus } from "@/types/map-user"
import BusDetailsSheet from "./BusDetailsSheet"

interface BusLayerProps {
  map: L.Map
}

export default function BusLayer({ map }: BusLayerProps) {
  const { buses, isConnected } = useSocket()
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const { getParam } = useQueryParams()
  const [selectedBus, setSelectedBus] = useState<{
    id: string
    name: string
  } | null>(null)

  useEffect(() => {
    if (!map) return

    const markerType = getParam("type") || "all"
    if (markerType !== "all" && markerType !== "bus") {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current.clear()
      return
    }

    // Create custom icon for buses - with NO tooltip attributes
    const busIcon = (bus: Bus) =>
      L.divIcon({
        className: "bus-marker",
        html: `
      <div class="bus-marker-inner">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
          <line x1="8" y1="16" x2="16" y2="16"/>
          <line x1="8" y1="8" x2="16" y2="8"/>
        </svg>
      </div>
    `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

    const onBusClick = (bus: Bus) => {
      console.log("first")
      setSelectedBus({
        id: bus.id,
        name: `Bus ${bus.routeName}`,
      })
    }

    buses.forEach((bus) => {
      const existingMarker = markersRef.current.get(bus.id)

      if (existingMarker) {
        existingMarker.setLatLng([bus.location.lat, bus.location.lng])

        // Completely remove any binding
        if (existingMarker.getPopup()) existingMarker.unbindPopup()
        if (existingMarker.getTooltip()) existingMarker.unbindTooltip()

        // Remove title attribute if any
        const element = existingMarker.getElement()
        if (element) element.removeAttribute("title")

        existingMarker.off()
        existingMarker.on("click", () => onBusClick(bus))
      } else {
        const marker = L.marker([bus.location.lat, bus.location.lng], {
          icon: busIcon(bus),
          interactive: true,
        }).addTo(map)

        // Remove any potential tooltip elements
        const element = marker.getElement()
        if (element) {
          element.removeAttribute("title")
          element.setAttribute("data-no-tooltip", "true")
        }

        // Override tooltip methods
        marker.bindTooltip = () => marker
        marker.openTooltip = () => marker
        marker.closeTooltip = () => marker

        marker.off("click")

        map.on("click", () => {
          console.log("MAP CLICK WORKS")
        })
        marker.on("click", () => {
          console.log("CLICK WORKS") // test this
          onBusClick(bus)
        })
        markersRef.current.set(bus.id, marker)
      }
    })

    const activeBusIds = new Set(buses.map((b) => b.id))
    markersRef.current.forEach((marker, id) => {
      if (!activeBusIds.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
      }
    })

    return () => {
      markersRef.current.forEach((marker) => {
        marker.off()
        marker.remove()
      })
      markersRef.current.clear()
    }
  }, [map, buses, getParam])

  return (
    <BusDetailsSheet
      isOpen={!!selectedBus}
      onClose={() => setSelectedBus(null)}
      busId={selectedBus?.id || null}
      busName={selectedBus?.name}
    />
  )
}
