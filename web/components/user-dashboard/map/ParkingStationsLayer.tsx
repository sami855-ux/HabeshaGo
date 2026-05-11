"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import L from "leaflet"
import { ParkingStation, Coordinates } from "@/types/map-user"
import { calculateDistance, cn, formatDistance } from "@/lib/utils"
import { useQueryParams } from "@/hooks/useQueryParams"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createRoot } from "react-dom/client"
import { axiosInstance } from "@/services/axiosInstance"

interface ParkingStationsLayerProps {
  map: L.Map
  userLocation: Coordinates
  onDestinationSelect: (destination: Coordinates) => void
}

// ─── Popup card for a single station ────────────────────────────────────────
function StationPopup({
  station,
  onDestinationSelect,
}: {
  station: ParkingStation
  onDestinationSelect: (destination: Coordinates) => void
}) {
  const occupancyPct = Math.round(
    ((station.totalSlots - station.availableSlots) / station.totalSlots) * 100,
  )

  const occupancyColor =
    station.availableSlots === 0
      ? "destructive"
      : station.availableSlots <= station.totalSlots * 0.2
        ? "destructive"
        : station.availableSlots <= station.totalSlots * 0.5
          ? "secondary"
          : "default"

  return (
    <div className="min-w-[230px] max-w-[260px] font-sans">
      {/* Header strip */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-500 rounded-t-lg px-3 py-2 -mx-[1px] -mt-[1px]">
        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-1">
          {station.name}
        </h3>
        <p className="text-purple-200 text-xs mt-0.5 line-clamp-1">
          {station.address}, {station.city}
        </p>
      </div>

      <div className="p-3 space-y-2">
        {/* Occupancy bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Occupancy</span>
            <span className="text-xs font-medium text-gray-700">
              {occupancyPct}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                occupancyPct >= 80
                  ? "bg-red-500"
                  : occupancyPct >= 50
                    ? "bg-amber-400"
                    : "bg-emerald-500",
              )}
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-md px-2 py-1.5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              Available
            </p>
            <Badge variant={occupancyColor} className="mt-0.5 text-xs h-5">
              {station.availableSlots}/{station.totalSlots}
            </Badge>
          </div>

          <div className="bg-gray-50 rounded-md px-2 py-1.5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              Price
            </p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">
              {station.pricePerMinute != null
                ? `$${station.pricePerMinute}/min`
                : "—"}
            </p>
          </div>

          {station.distance != null && (
            <div className="bg-gray-50 rounded-md px-2 py-1.5">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                Distance
              </p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {formatDistance(station.distance)}
              </p>
            </div>
          )}

          {/* Features */}
          <div className="bg-gray-50 rounded-md px-2 py-1.5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              Features
            </p>
            <div className="flex gap-1 mt-0.5 flex-wrap">
              {station.features?.hasCCTV && (
                <span
                  title="CCTV"
                  className="text-[10px] bg-blue-100 text-blue-700 rounded px-1 py-0.5 font-medium"
                >
                  📹 CCTV
                </span>
              )}
              {station.features?.hasSecurity && (
                <span
                  title="Security"
                  className="text-[10px] bg-green-100 text-green-700 rounded px-1 py-0.5 font-medium"
                >
                  🛡 Guard
                </span>
              )}
              {!station.features?.hasCCTV && !station.features?.hasSecurity && (
                <span className="text-[10px] text-gray-400">None listed</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white h-8 text-xs"
            size="sm"
            onClick={() => onDestinationSelect(station.location)}
          >
            Route
          </Button>
          <Button
            className="flex-1 h-8 text-xs"
            size="sm"
            variant="outline"
            onClick={() =>
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${station.location.lat},${station.location.lng}`,
                "_blank",
              )
            }
          >
            Navigate
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Parking icon factory ────────────────────────────────────────────────────
function createParkingIcon(availableSlots: number, totalSlots: number) {
  const pct = totalSlots > 0 ? availableSlots / totalSlots : 0
  const ringColor =
    pct === 0
      ? "#ef4444"
      : pct <= 0.2
        ? "#f97316"
        : pct <= 0.5
          ? "#eab308"
          : "#22c55e"
  const bgColor =
    pct === 0
      ? "#dc2626"
      : pct <= 0.2
        ? "#ea580c"
        : pct <= 0.5
          ? "#ca8a04"
          : "#7c3aed"

  return L.divIcon({
    className: "",
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));
      ">
        <!-- Outer pulse ring -->
        <div style="
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid ${ringColor};
          opacity: 0.5;
          animation: parking-pulse 2s ease-in-out infinite;
        "></div>

        <!-- Main circle -->
        <div style="
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: ${bgColor};
          border: 2.5px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">
          <!-- P letter -->
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5h4.5a3.5 3.5 0 0 1 0 7H9"/>
          </svg>
        </div>

        <!-- Availability dot -->
        <div style="
          position: absolute;
          bottom: -1px;
          right: -1px;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: ${ringColor};
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 7px;
          font-weight: 700;
          color: white;
          line-height: 1;
        ">${availableSlots > 99 ? "99+" : availableSlots}</div>
      </div>

      <style>
        @keyframes parking-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 0.15; }
        }
      </style>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -42],
  })
}

export default function ParkingStationsLayer({
  map,
  userLocation,
  onDestinationSelect,
}: ParkingStationsLayerProps) {
  const [stations, setStations] = useState<ParkingStation[]>([])
  const markersRef = useRef<L.Marker[]>([])
  const { getParam } = useQueryParams()

  // Load stations from API
  useEffect(() => {
    const loadStations = async () => {
      try {
        const response = await axiosInstance.get("/audit/map-view", {
          params: { lat: userLocation.lat, lng: userLocation.lng },
        })

        const stationsWithDistance = response.data.data.map((station) => ({
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

  // Build markers whenever stations or filters change
  useEffect(() => {
    if (!map || !map.getPane || stations.length === 0) return

    // Clean up previous markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const markerType = getParam("type") || "all"
    const searchQuery = getParam("search")?.toLowerCase()

    const filteredStations = stations.filter((station) => {
      if (markerType !== "all" && markerType !== "parking") return false
      if (searchQuery) {
        return (
          station.name.toLowerCase().includes(searchQuery) ||
          station.address.toLowerCase().includes(searchQuery) ||
          station.city?.toLowerCase().includes(searchQuery)
        )
      }
      return true
    })

    const newMarkers: L.Marker[] = []

    filteredStations.forEach((station) => {
      const icon = createParkingIcon(station.availableSlots, station.totalSlots)

      const marker = L.marker([station.location.lat, station.location.lng], {
        icon,
      }).addTo(map)

      // Render React popup
      const container = document.createElement("div")
      const root = createRoot(container)
      root.render(
        <StationPopup
          station={station}
          onDestinationSelect={onDestinationSelect}
        />,
      )

      marker.bindPopup(container, {
        maxWidth: 280,
        className: "parking-popup",
      })

      newMarkers.push(marker)
    })

    markersRef.current = newMarkers

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
    }
  }, [map, stations, getParam, onDestinationSelect])

  return null
}
