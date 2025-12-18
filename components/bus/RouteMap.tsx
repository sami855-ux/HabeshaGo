"use client"

import { useState, useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import {
  Navigation,
  Clock,
  DollarSign,
  Route as RouteIcon,
  TrendingUp,
  Zap,
  MapPin,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Set your Mapbox access token here - Use a default token or get one from Mapbox
mapboxgl.accessToken =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  "pk.eyJ1IjoidXNlciIsImEiOiJjbHZ4M3Y4bjUwM2t4Mmtyc2NhNzNwbDY4In0.GZEGdk40DvWJkLGtpyLnmQ"

export function RouteMap() {
  const [selectedRoute, setSelectedRoute] = useState("fastest")
  const [mapError, setMapError] = useState(false)
  const [mapLoading, setMapLoading] = useState(true)
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  const routes = [
    {
      id: "fastest",
      label: "Fastest",
      time: "5h 15m",
      price: "₹1,299",
      distance: "320 km",
      traffic: "Moderate",
      coordinates: [
        [-74.006, 40.7128], // New York
        [-71.0589, 42.3601], // Boston
      ],
    },
    {
      id: "cheapest",
      label: "Cheapest",
      time: "5h 45m",
      price: "₹799",
      distance: "350 km",
      traffic: "Heavy",
      coordinates: [
        [-74.006, 40.7128], // New York
        [-71.4236, 41.8236], // Providence (alternative route)
        [-71.0589, 42.3601], // Boston
      ],
    },
    {
      id: "shortest",
      label: "Shortest",
      time: "5h 30m",
      price: "₹1,099",
      distance: "310 km",
      traffic: "Light",
      coordinates: [
        [-74.006, 40.7128], // New York
        [-71.0589, 42.3601], // Boston
      ],
    },
  ]

  const initMap = () => {
    if (!mapContainer.current || map.current) return

    try {
      setMapLoading(true)
      setMapError(false)

      // Check if WebGL is available
      const canvas = document.createElement("canvas")
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl")

      if (!gl) {
        setMapError(true)
        setMapLoading(false)
        return
      }

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-72.5, 41.5], // Center between NY and Boston
        zoom: 6,
        attributionControl: false,
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: true, // Helps with some WebGL contexts
      })

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

      // Add geolocate control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserLocation: true,
        })
      )

      // Handle map load
      map.current.on("load", () => {
        setMapLoading(false)
        drawRoute(routes[0].coordinates)
        addMarkers(routes[0].coordinates)
      })

      // Handle map errors
      map.current.on("error", (e) => {
        console.error("Map error:", e)
        setMapError(true)
        setMapLoading(false)
      })
    } catch (error) {
      console.error("Failed to initialize map:", error)
      setMapError(true)
      setMapLoading(false)
    }
  }

  useEffect(() => {
    initMap()

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  const drawRoute = (coordinates: [number, number][]) => {
    if (!map.current || !map.current.loaded()) return

    try {
      // Remove existing layers and sources
      if (map.current.getSource("route")) {
        map.current.removeLayer("route")
        map.current.removeSource("route")
      }

      // Add route source and layer
      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coordinates,
          },
        },
      })

      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#f97316", // Orange color
          "line-width": 4,
          "line-opacity": 0.8,
        },
      })

      // Fit map to route bounds
      const bounds = coordinates.reduce(
        (bounds, coord) => {
          return bounds.extend(coord as [number, number])
        },
        new mapboxgl.LngLatBounds(
          coordinates[0] as [number, number],
          coordinates[0] as [number, number]
        )
      )

      map.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000,
      })
    } catch (error) {
      console.error("Error drawing route:", error)
    }
  }

  const addMarkers = (coordinates: [number, number][]) => {
    if (!map.current || !map.current.loaded()) return

    try {
      // Remove existing markers
      const markers = document.getElementsByClassName("mapboxgl-marker")
      while (markers.length > 0) {
        markers[0].remove()
      }

      // Add start marker
      new mapboxgl.Marker({
        color: "#22c55e", // Green
        scale: 1.2,
      })
        .setLngLat(coordinates[0])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            "<h3>New York, NY</h3><p>Starting Point</p>"
          )
        )
        .addTo(map.current)

      // Add end marker
      new mapboxgl.Marker({
        color: "#ef4444", // Red
        scale: 1.2,
      })
        .setLngLat(coordinates[coordinates.length - 1])
        .setPopup(
          new mapboxgl.Popup().setHTML("<h3>Boston, MA</h3><p>Destination</p>")
        )
        .addTo(map.current)

      // Add waypoint markers for alternative routes
      if (coordinates.length > 2) {
        coordinates.slice(1, -1).forEach((coord, index) => {
          new mapboxgl.Marker({
            color: "#6366f1", // Indigo
            scale: 0.8,
          })
            .setLngLat(coord)
            .setPopup(
              new mapboxgl.Popup().setHTML(`<h3>Waypoint ${index + 1}</h3>`)
            )
            .addTo(map.current)
        })
      }
    } catch (error) {
      console.error("Error adding markers:", error)
    }
  }

  const handleRouteChange = (routeId: string) => {
    setSelectedRoute(routeId)
    const route = routes.find((r) => r.id === routeId)
    if (route && map.current && map.current.loaded()) {
      drawRoute(route.coordinates)
      addMarkers(route.coordinates)
    }
  }

  const handleStartNavigation = () => {
    alert("Starting navigation... This would open full navigation mode.")
  }

  const handleSaveRoute = () => {
    alert("Route saved to favorites!")
  }

  const handleRetryMap = () => {
    setMapError(false)
    setMapLoading(true)
    setTimeout(() => {
      initMap()
    }, 100)
  }

  const renderMapFallback = () => (
    <div className="h-96 relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center p-8">
        <AlertTriangle className="size-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">Map Unavailable</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Unable to load map. This might be due to browser compatibility or
          WebGL support.
        </p>
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            onClick={handleRetryMap}
            className="flex items-center gap-2"
          >
            <RefreshCw className="size-4" />
            Retry
          </Button>
          <Button
            variant="default"
            onClick={() => window.open("https://get.webgl.org/", "_blank")}
          >
            Check WebGL Support
          </Button>
        </div>
      </div>
    </div>
  )

  const renderStaticMapPreview = () => (
    <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0">
        {/* Route Line */}
        <div className="absolute top-1/2 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

        {/* Start Pin */}
        <div className="absolute left-1/4 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="size-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <MapPin className="size-4 text-white" />
          </div>
        </div>

        {/* Destination Pin */}
        <div className="absolute right-1/4 top-1/2 transform translate-x-1/2 -translate-y-1/2">
          <div className="size-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <MapPin className="size-4 text-white" />
          </div>
        </div>

        {/* Waypoints */}
        {[30, 40, 50, 60, 70].map((percent) => (
          <div
            key={percent}
            className="absolute top-1/2"
            style={{ left: `${percent}%` }}
          >
            <div className="size-3 bg-gray-400 rounded-full border-2 border-white"></div>
          </div>
        ))}

        {/* Overlay message */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
          <p className="text-sm font-medium">
            Using static preview - Enable WebGL for interactive map
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Map Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Route Visualization</h3>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="size-3 bg-green-500 rounded-full"></div>
                  <span>New York, NY</span>
                </div>
                <RouteIcon className="size-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <div className="size-3 bg-red-500 rounded-full"></div>
                  <span>Boston, MA</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartNavigation}
              >
                <Navigation className="size-4 mr-2" />
                Start Navigation
              </Button>
              <Button variant="outline" size="sm" onClick={handleSaveRoute}>
                <Zap className="size-4 mr-2" />
                Save Route
              </Button>
            </div>
          </div>
        </div>

        {/* Map Container */}
        {mapLoading ? (
          <div className="h-96 relative">
            <Skeleton className="absolute inset-0 w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="size-8 animate-spin text-orange-500 mx-auto mb-2" />
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          </div>
        ) : mapError ? (
          renderMapFallback()
        ) : (
          <div className="h-96 relative">
            <div
              ref={mapContainer}
              className="absolute inset-0 w-full h-full"
            />
            {/* Map Loading Overlay */}
            {mapLoading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="size-8 animate-spin text-orange-500 mx-auto mb-2" />
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
            {/* Map Status Overlay */}
            <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-1 text-sm flex items-center gap-2">
              <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Tracking Active</span>
            </div>
            {/* Distance Scale */}
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                <span className="text-sm font-medium">320 km</span>
              </div>
            </div>
          </div>
        )}

        {/* Route Options */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <Tabs defaultValue="fastest" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              {routes.map((route) => (
                <TabsTrigger
                  key={route.id}
                  value={route.id}
                  onClick={() => handleRouteChange(route.id)}
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  {route.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {routes.map((route) => (
              <TabsContent key={route.id} value={route.id} className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="size-4" />
                      <span className="text-sm">Time</span>
                    </div>
                    <div className="text-xl font-bold">{route.time}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-500">
                      <DollarSign className="size-4" />
                      <span className="text-sm">Price</span>
                    </div>
                    <div className="text-xl font-bold">{route.price}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-500">
                      <RouteIcon className="size-4" />
                      <span className="text-sm">Distance</span>
                    </div>
                    <div className="text-xl font-bold">{route.distance}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-500">
                      <TrendingUp className="size-4" />
                      <span className="text-sm">Traffic</span>
                    </div>
                    <div className="text-xl font-bold">{route.traffic}</div>
                  </div>
                </div>

                {/* AI Suggestion */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="size-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Zap className="size-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">AI Travel Insight</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Travel time is usually 1hr 40min shorter during
                        weekdays. Recommended departure:{" "}
                        {route.id === "fastest" ? "8:30 AM" : "9:15 AM"}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
