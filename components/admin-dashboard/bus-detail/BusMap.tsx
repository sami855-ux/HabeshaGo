"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "lucide-react"
import { useEffect, useState } from "react"
import type { BusPosition, Route } from "@/types/bus"

interface BusMapProps {
  positions: BusPosition[]
  route?: Route | null
  currentStop?: string | null
}

export function BusMap({ positions, route, currentStop }: BusMapProps) {
  const [MapComponents, setMapComponents] = useState<any>(null)

  useEffect(() => {
    async function loadMap() {
      const leaflet = await import("leaflet")
      await import("leaflet/dist/leaflet.css")

      // Fix marker icons
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const reactLeaflet = await import("react-leaflet")

      setMapComponents({
        MapContainer: reactLeaflet.MapContainer,
        TileLayer: reactLeaflet.TileLayer,
        Marker: reactLeaflet.Marker,
        Popup: reactLeaflet.Popup,
        Polyline: reactLeaflet.Polyline,
        Icon: leaflet.Icon,
      })
    }

    loadMap()
  }, [])

  if (!MapComponents) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] rounded-lg bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">Loading map…</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup, Polyline, Icon } =
    MapComponents

  const latestPosition = positions[0]

  if (!latestPosition) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Navigation className="h-10 w-10" />
            <p>No GPS data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const busIcon = new Icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
        <rect x="3" y="4" width="18" height="14" rx="2"/>
        <circle cx="7" cy="18" r="2"/>
        <circle cx="17" cy="18" r="2"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })

  const routePoints: [number, number][] = route
    ? route.midPoints.map((p) => [p.lat, p.lng])
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Live Location
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[400px] rounded-lg overflow-hidden border">
          <MapContainer
            center={[latestPosition.latitude, latestPosition.longitude]}
            zoom={13}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            <Marker
              position={[latestPosition.latitude, latestPosition.longitude]}
              icon={busIcon}
            >
              <Popup>
                <p className="font-medium">{currentStop || "In transit"}</p>
              </Popup>
            </Marker>

            {routePoints.length > 1 && (
              <Polyline
                positions={routePoints}
                pathOptions={{ color: "#3b82f6", weight: 4 }}
              />
            )}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  )
}
