"use client"

import { useEffect, useState } from "react"
import L from "leaflet"
import "leaflet-routing-machine"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"
import { Coordinates, RouteInfo } from "@/types/map-user"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface NavigationRouteProps {
  map: L.Map
  origin: Coordinates
  destination: Coordinates
  onClose: () => void
}

export default function NavigationRoute({
  map,
  origin,
  destination,
  onClose,
}: NavigationRouteProps) {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [routingControl, setRoutingControl] = useState<any>(null)

  useEffect(() => {
    if (!map || !origin || !destination) return

    // Remove existing routing control
    if (routingControl) {
      map.removeControl(routingControl)
    }

    // Create new routing control
    const control = (L as any).Routing.control({
      waypoints: [
        L.latLng(origin.lat, origin.lng),
        L.latLng(destination.lat, destination.lng),
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: "#3b82f6", weight: 4 }],
      },
    }).addTo(map)

    // Listen for route calculation
    control.on("routesfound", (e: any) => {
      const routes = e.routes
      const route = routes[0]

      setRouteInfo({
        distance: (route.summary.totalDistance / 1000).toFixed(1) + " km",
        duration: Math.round(route.summary.totalTime / 60) + " min",
        coordinates: route.coordinates.map((coord: any) => ({
          lat: coord.lat,
          lng: coord.lng,
        })),
      })
    })

    setRoutingControl(control)

    return () => {
      if (control) {
        map.removeControl(control)
      }
    }
  }, [map, origin, destination])

  if (!routeInfo) return null

  return (
    <div className="absolute bottom-4 left-4 z-[1000]">
      <Card className="p-4 w-64 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Route Information</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Distance:</span>
            <span className="font-medium">{routeInfo.distance}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Est. Time:</span>
            <span className="font-medium">{routeInfo.duration}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
