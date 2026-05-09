"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import { useSocket } from "@/hooks/useSocket"
import { useQueryParams } from "@/hooks/useQueryParams"
import { Bus } from "@/types/map-user"
import BusDetailsSheet from "./BusDetailsSheet"

interface BusLayerProps {
  map: L.Map
  vehicleIds: number[]
}

export default function BusLayer({ map, vehicleIds }: BusLayerProps) {
  const { buses, isConnected } = useSocket({ vehicleIds })
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const { getParam } = useQueryParams()
  const [selectedBus, setSelectedBus] = useState<{
    id: string
    name: string
  } | null>(null)

  useEffect(() => {
    console.log("=".repeat(50))
    console.log("🚌 BusLayer — buses updated, total:", buses.length)
    if (buses.length === 0) {
      console.log("⚠️ No buses yet")
      return
    }
    buses.forEach((bus) => {
      console.log(`\n--- Bus ID: ${bus.id} ---`)
      console.table({
        id: bus.id,
        lat: bus.location?.lat,
        lng: bus.location?.lng,
        speed: bus.speed,
        heading: bus.heading,
        busNumber: bus.busNumber,
        status: bus.status,
        currentStop: bus.currentStop,
        nextDestination: bus.nextDestination,
        driverName: bus.driverName,
        routeName: bus.routeName,
      })
    })
    console.log("=".repeat(50))
  }, [buses])

  useEffect(() => {
    if (!map) return

    const markerType = getParam("type") || "all"
    if (markerType !== "all" && markerType !== "bus") {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current.clear()
      return
    }

    console.log("🗺️ Rendering markers for", buses.length, "buses")

    const busIcon = (bus: Bus) =>
      L.divIcon({
        className: "",
        html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
      ">
        <div style="
          width: 36px;
          height: 36px;
          background: #185FA5;
          border-radius: 50% 50% 50% 4px;
          border: 2.5px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(${bus.heading ?? 0}deg);
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="5" width="18" height="13" rx="2"/>
            <path d="M3 10h18"/>
            <path d="M8 19v2M16 19v2"/>
            <circle cx="7.5" cy="15.5" r="1" fill="white" stroke="none"/>
            <circle cx="16.5" cy="15.5" r="1" fill="white" stroke="none"/>
          </svg>
        </div>
        <div style="
          position: absolute;
          bottom: -18px;
          left: 50%;
          transform: translateX(-50%);
          background: #185FA5;
          color: white;
          font-size: 10px;
          font-weight: 600;
          font-family: sans-serif;
          padding: 1px 5px;
          border-radius: 4px;
          white-space: nowrap;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
        ">${bus.busNumber ?? bus.id}</div>
      </div>
    `,
        iconSize: [36, 54],
        iconAnchor: [18, 18],
      })

    const onBusClick = (bus: Bus) => {
      console.log("🖱️ Bus clicked:", bus.id, bus.busNumber)
      setSelectedBus(bus)
    }

    buses.forEach((bus) => {
      const existingMarker = markersRef.current.get(bus.id)

      if (existingMarker) {
        console.log(
          `📍 Updating marker for bus ${bus.id} → ${bus.location.lat}, ${bus.location.lng}`,
        )
        existingMarker.setLatLng([bus.location.lat, bus.location.lng])
        existingMarker.setIcon(busIcon(bus))
        existingMarker.off("click")
        existingMarker.on("click", () => onBusClick(bus))
      } else {
        console.log(
          `➕ Adding new marker for bus ${bus.id} at ${bus.location.lat}, ${bus.location.lng}`,
        )
        const marker = L.marker([bus.location.lat, bus.location.lng], {
          icon: busIcon(bus),
          interactive: true,
        }).addTo(map)

        const element = marker.getElement()
        if (element) {
          element.removeAttribute("title")
          element.setAttribute("data-no-tooltip", "true")
        }

        marker.bindTooltip = () => marker
        marker.openTooltip = () => marker
        marker.closeTooltip = () => marker
        marker.on("click", () => onBusClick(bus))
        markersRef.current.set(bus.id, marker)
      }
    })

    const activeBusIds = new Set(buses.map((b) => b.id))
    markersRef.current.forEach((marker, id) => {
      if (!activeBusIds.has(id)) {
        console.log(`🗑️ Removing marker for bus ${id}`)
        marker.remove()
        markersRef.current.delete(id)
      }
    })
  }, [map, buses, getParam])

  // useEffect(() => {
  //   return () => {
  //     markersRef.current.forEach((marker) => {
  //       marker.off()
  //       marker.remove()
  //     })
  //     markersRef.current.clear()
  //   }
  // }, [])

  return (
    <BusDetailsSheet
      isOpen={!!selectedBus}
      onClose={() => setSelectedBus(null)}
      bus={selectedBus}
    />
  )
}
