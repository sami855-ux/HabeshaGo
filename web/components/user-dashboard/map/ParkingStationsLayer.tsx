"use client"

import { useEffect, useState, useRef } from "react"
import L from "leaflet"
import { ParkingStation, Coordinates } from "@/types/map-user"
import { calculateDistance, cn, formatDistance } from "@/lib/utils"
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

// Example station object with images array
const stationData = {
  name: "Downtown Parking Plaza",
  address: "123 Main Street, Downtown",
  distance: 0.5,
  availableSpaces: 15,
  totalSpaces: 50,
  pricing: "$2.50",
  location: { lat: 40.7128, lng: -74.006 },
  images: [
    "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=300&h=150&fit=crop",
    "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=300&h=150&fit=crop",
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=150&fit=crop",
  ],
}

export default function ParkingStationsLayer({
  map,
  userLocation,
  onDestinationSelect,
}: ParkingStationsLayerProps) {
  const [stations, setStations] = useState<ParkingStation[]>([])
  const markersRef = useRef<L.Marker[]>([])
  const { getParam } = useQueryParams()

  const [currentImage, setCurrentImage] = useState(0)

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
      <div class="bg-purple-500 p-1 rounded-full shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg"
          width="22" height="22"
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
        <div className=" min-w-[200px]">
          {/* Image Slider */}
          <div className="mb-3 rounded-lg overflow-hidden relative">
            <div className="relative">
              <img
                src={
                  stationData.images?.[currentImage] ||
                  "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=300&h=150&fit=crop"
                }
                alt={stationData.name}
                className="w-full h-32 object-cover transition-opacity duration-300"
              />

              {/* Navigation Arrows */}
              {stationData.images && stationData.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImage((prev) =>
                        prev === 0 ? stationData.images.length - 1 : prev - 1,
                      )
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImage((prev) =>
                        prev === stationData.images.length - 1 ? 0 : prev + 1,
                      )
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Dots Indicator */}
            {stationData.images && stationData.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {stationData.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImage(idx)
                    }}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      currentImage === idx
                        ? "bg-white w-3"
                        : "bg-white/50 hover:bg-white/70",
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          <h3 className="font-semibold text-lg">{stationData.name}</h3>

          {/* Static Rating Stars */}
          <div className="flex items-center gap-1 mt-1 mb-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < 4
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300 fill-current",
                  )}
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500">(24 reviews)</span>
          </div>

          <p className="text-sm text-gray-600">{stationData.address}</p>

          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">Distance:</span>
              <span className="font-medium">
                {formatDistance(stationData.distance!)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Available:</span>
              <Badge
                variant={
                  stationData.availableSpaces > 20 ? "default" : "destructive"
                }
              >
                {stationData.availableSpaces}/{stationData.totalSpaces}
              </Badge>
            </div>

            {stationData.pricing && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Pricing:</span>
                <span className="font-medium">{stationData.pricing}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              className="flex-1 "
              size="sm"
              onClick={() => onDestinationSelect(stationData.location)}
            >
              Route
            </Button>

            <Button
              className="flex-1"
              size="sm"
              variant="outline"
              onClick={() => {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${stationData.location.lat},${stationData.location.lng}`,
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
