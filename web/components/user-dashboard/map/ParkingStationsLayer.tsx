"use client"

import { useEffect, useState, useRef } from "react"
import L from "leaflet"
import { ParkingStation, Coordinates } from "@/types/map-user"
import { calculateDistance, formatDistance } from "@/lib/utils"
import { useQueryParams } from "@/hooks/useQueryParams"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createRoot } from "react-dom/client"
import { fetchParkingStations } from "@/data/api"

interface ParkingStationsLayerProps {
  map: L.Map
  userLocation: Coordinates
  onDestinationSelect: (destination: Coordinates) => void
}

export default function ParkingStationsLayer({
  map,
  userLocation,
  onDestinationSelect,
}: ParkingStationsLayerProps) {
  const [stations, setStations] = useState<ParkingStation[]>([])
  const markersRef = useRef<L.Marker[]>([])
  const { getParam } = useQueryParams()

  /*
  ----------------------------------
  LOAD PARKING STATIONS
  ----------------------------------
  */
  useEffect(() => {
    const loadStations = async () => {
      try {
        const data = await fetchParkingStations(
          userLocation.lat,
          userLocation.lng,
        )

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
        console.error("Error loading parking stations:", error)
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
      if (markerType !== "all" && markerType !== "parking") return false

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
    PARKING ICON
    ----------------------------------
    */
    const parkingIcon = L.divIcon({
      className: "parking-station-marker",
      html: `
      <div class="bg-purple-500 p-2 rounded-full shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg"
          width="16" height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2">
          <rect x="4" y="4" width="16" height="16" rx="2"/>
          <path d="M9 16V8h4a2 2 0 0 1 0 4H9"/>
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
        icon: parkingIcon,
      }).addTo(map)

      /*
      ----------------------------------
      POPUP CONTENT (REACT)
      ----------------------------------
      */
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
              <span className="text-sm">Available:</span>
              <Badge
                variant={
                  station.availableSpaces > 20 ? "default" : "destructive"
                }
              >
                {station.availableSpaces}/{station.totalSpaces}
              </Badge>
            </div>

            {station.pricing && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Pricing:</span>
                <span className="font-medium">{station.pricing}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              className="flex-1"
              size="sm"
              onClick={() => onDestinationSelect(station.location)}
            >
              Route
            </Button>

            <Button
              className="flex-1"
              size="sm"
              variant="outline"
              onClick={() => {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${station.location.lat},${station.location.lng}`,
                  "_blank",
                )
              }}
            >
              Navigate
            </Button>
          </div>
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
  }, [map, stations, getParam, onDestinationSelect])

  return null
}
