import { useEffect, useRef, useState } from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  CircleMarker,
} from "react-leaflet"
import { Button } from "@/components/ui/button"
import { Navigation } from "lucide-react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// Custom marker icons based on availability
const getMarkerIcon = (availability: number) => {
  let color = "#10B981" // green - high availability
  if (availability <= 0.2)
    color = "#EF4444" // red - low availability
  else if (availability <= 0.5) color = "#F59E0B" // yellow - medium availability

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6],
  })
}

// Component to handle map view updates
function MapUpdater({
  center,
  zoom,
}: {
  center: [number, number]
  zoom: number
}) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

// Component to handle selected lot highlighting
function SelectedLotMarker({ lot, map }: { lot: ParkingLot; map: any }) {
  useEffect(() => {
    if (lot && map) {
      map.setView([lot.latitude, lot.longitude], 15)
      // Add a pulsing circle to highlight the selected lot
      const circle = L.circle([lot.latitude, lot.longitude], {
        radius: 50,
        color: "#3B82F6",
        fillColor: "#3B82F6",
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(map)

      setTimeout(() => circle.remove(), 3000)
      return () => circle.remove()
    }
  }, [lot, map])
  return null
}

interface ParkingLot {
  id: string
  name: string
  address: string
  city: string
  latitude: number
  longitude: number
  totalSlots: number
  availableSlots: number
  pricePerMinute: number
  hasSecurity: boolean
  hasCCTV: boolean
  rating?: number
}

interface MapSectionProps {
  parkingLots: ParkingLot[]
  onMarkerClick: (lot: ParkingLot) => void
  selectedLotId?: string
  userLocation?: { lat: number; lng: number }
}

export function MapSection({
  parkingLots,
  onMarkerClick,
  selectedLotId,
  userLocation,
}: MapSectionProps) {
  const [map, setMap] = useState<any>(null)
  const defaultCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [9.0192, 38.7468]
  const defaultZoom = 13

  const handleGetDirections = () => {
    if (userLocation && selectedLotId) {
      const selectedLot = parkingLots.find((lot) => lot.id === selectedLotId)
      if (selectedLot) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedLot.latitude},${selectedLot.longitude}`
        window.open(url, "_blank")
      }
    }
  }

  const selectedLot = parkingLots.find((lot) => lot.id === selectedLotId)

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        whenReady={(e) => setMap(e.target)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        {userLocation && (
          <>
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={8}
              fillColor="#3B82F6"
              color="#FFFFFF"
              weight={2}
              fillOpacity={1}
            >
              <Popup>Your Location</Popup>
            </CircleMarker>
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={20}
              fillColor="#3B82F6"
              color="#3B82F6"
              weight={1}
              fillOpacity={0.1}
            />
          </>
        )}

        {/* Parking lot markers */}
        {parkingLots.map((lot) => {
          const availability = lot.availableSlots / lot.totalSlots
          return (
            <Marker
              key={lot.id}
              position={[lot.latitude, lot.longitude]}
              icon={getMarkerIcon(availability)}
              eventHandlers={{
                click: () => onMarkerClick(lot),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-base mb-1">{lot.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{lot.address}</p>
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {lot.availableSlots}/{lot.totalSlots} spots
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      ${(lot.pricePerMinute * 60).toFixed(2)}/hr
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {lot.hasSecurity && (
                      <span className="text-xs text-green-600">
                        🔒 Security
                      </span>
                    )}
                    {lot.hasCCTV && (
                      <span className="text-xs text-blue-600">📹 CCTV</span>
                    )}
                  </div>
                  {lot.rating && (
                    <div className="mt-2 text-xs text-yellow-600">
                      ★ {lot.rating.toFixed(1)} rating
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Update map when selected lot changes */}
        {selectedLot && map && (
          <SelectedLotMarker lot={selectedLot} map={map} />
        )}
      </MapContainer>

      {selectedLotId && (
        <Button
          onClick={handleGetDirections}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 shadow-lg gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          <Navigation className="w-4 h-4" />
          Get Directions
        </Button>
      )}
    </div>
  )
}
