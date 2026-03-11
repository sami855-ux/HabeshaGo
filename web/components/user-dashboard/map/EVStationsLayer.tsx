"use client"

import { useEffect, useState, useRef } from "react"
import L from "leaflet"
import { EVStation, Coordinates } from "@/types/map-user"
import { calculateDistance, formatDistance } from "@/lib/utils"
import { useQueryParams } from "@/hooks/useQueryParams"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createRoot } from "react-dom/client"
import { fetchEVStations } from "@/data/api"

interface EVStationsLayerProps {
  map: L.Map
  userLocation: Coordinates
}

export default function EVStationsLayer({
  map,
  userLocation,
}: EVStationsLayerProps) {
  const [stations, setStations] = useState<EVStation[]>([])
  const markersRef = useRef<L.Marker[]>([])
  const { getParam } = useQueryParams()

  /*
  ----------------------------------
  LOAD EV STATIONS
  ----------------------------------
  */
  useEffect(() => {
    const loadStations = async () => {
      try {
        const data = await fetchEVStations(userLocation.lat, userLocation.lng)

        const stationsWithDistance = data.map((station) => ({
          ...station,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            station.location.lat,
            station.location.lng,
          ),
        }))

        setStations(stationsWithDistance)
      } catch (error) {
        console.error("Error loading EV stations:", error)
      }
    }

    loadStations()
  }, [userLocation])

  /*
  ----------------------------------
  CREATE MARKERS
  ----------------------------------
  */
  useEffect(() => {
    if (!map || !map.getPane || stations.length === 0) return

    /* Remove existing markers */
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    const markerType = getParam("type") || "all"
    const searchQuery = getParam("search")?.toLowerCase()

    /* Filter stations */
    const filteredStations = stations.filter((station) => {
      if (markerType !== "all" && markerType !== "ev") return false

      if (searchQuery) {
        return (
          station.name.toLowerCase().includes(searchQuery) ||
          station.address.toLowerCase().includes(searchQuery)
        )
      }

      return true
    })

    /*
    ----------------------------------
    EV ICON
    ----------------------------------
    */
    const evIcon = L.divIcon({
      className: "ev-station-marker",
      html: `
      <div class="bg-green-500 p-2 rounded-full shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg"
        width="16" height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        stroke-width="2">
          <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v2"/>
          <path d="M14 9h4c.6 0 1 .4 1 1v8c0 .6-.4 1-1 1h-2"/>
          <circle cx="7" cy="18" r="2"/>
          <circle cx="17" cy="18" r="2"/>
          <path d="M9 18h5"/>
          <path d="M16 8l2 3-2 3"/>
        </svg>
      </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })

    const newMarkers: L.Marker[] = []

    /*
    ----------------------------------
    CREATE MARKERS
    ----------------------------------
    */
    filteredStations.forEach((station) => {
      const marker = L.marker([station.location.lat, station.location.lng], {
        icon: evIcon,
      }).addTo(map)

      const popupContent = document.createElement("div")
      const root = createRoot(popupContent)

      root.render(
        <div className="p-2 min-w-[200px]">
          <h3 className="font-semibold text-lg">{station.name}</h3>

          <p className="text-sm text-gray-600">{station.address}</p>

          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">Distance:</span>
              <span className="font-medium">
                {formatDistance(station.distance!)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Type:</span>
              <Badge
                variant={
                  station.chargingType === "fast" ? "default" : "secondary"
                }
              >
                {station.chargingType}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Available:</span>
              <span className="font-medium">
                {station.availableChargers}/{station.totalChargers}
              </span>
            </div>
          </div>

          <Button
            className="w-full mt-3"
            size="sm"
            onClick={() => {
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${station.location.lat},${station.location.lng}`,
                "_blank",
              )
            }}
          >
            Navigate
          </Button>
        </div>,
      )

      marker.bindPopup(popupContent)

      newMarkers.push(marker)
    })

    markersRef.current = newMarkers

    /*
    ----------------------------------
    CLEANUP
    ----------------------------------
    */
    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [map, stations, getParam])

  return null
}
