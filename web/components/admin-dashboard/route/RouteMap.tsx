// components/create-route/RouteMap.tsx
"use client"

import React, { useRef, useEffect, useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Globe,
  Map,
  Trash2,
  Loader2,
  Search,
  Navigation,
  ZoomIn,
  ZoomOut,
  Layers,
  Ruler,
  Eye,
  EyeOff,
  Maximize2,
  Download,
  Filter,
  Target,
  MapPin,
  RotateCw,
  ChevronRight,
  ChevronLeft,
  X,
  Settings,
  Compass,
} from "lucide-react"
import {
  Midpoint,
  Route,
  ADDIS_BOUNDS,
  ADDIS_CENTER,
} from "@/app/(dashbaord)/admin/manage-route/add-new-route/page"
import { toast } from "sonner"

// Dynamically import ALL Leaflet components with NO SSR
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <Compass className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-gray-600 mt-3 font-medium">Loading Map Engine...</p>
      </div>
    </div>
  ),
})

interface RouteMapProps {
  midpoints: Midpoint[]
  existingRoutes: Route[]
  mapStyle: "light" | "streets"
  routePolyline: [number, number][]
  onMapClick: (lat: number, lng: number) => void
  onUpdateMidpointPosition: (id: string, lat: number, lng: number) => void
  onRemoveMidpoint: (id: string) => void
  onUpdateMidpointName: (id: string, name: string) => void
  mapRef: React.MutableRefObject<any>
}

const RouteMap: React.FC<RouteMapProps> = ({
  midpoints,
  existingRoutes,
  mapStyle,
  routePolyline,
  onMapClick,
  onUpdateMidpointPosition,
  onRemoveMidpoint,
  onUpdateMidpointName,
  mapRef,
}) => {
  const [isClient, setIsClient] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchLatLng, setSearchLatLng] = useState({ lat: "", lng: "" })
  const [isSearching, setIsSearching] = useState(false)
  const [showRouteStats, setShowRouteStats] = useState(true)
  const [showGridOverlay, setShowGridOverlay] = useState(false)
  const [selectedRouteFilter, setSelectedRouteFilter] = useState("all")
  const [zoomLevel, setZoomLevel] = useState(13)
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false)
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(true)
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(true)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Search by coordinates
  const searchByCoordinates = () => {
    if (!searchLatLng.lat || !searchLatLng.lng) {
      toast.error("Please enter both latitude and longitude")
      return
    }

    const lat = parseFloat(searchLatLng.lat)
    const lng = parseFloat(searchLatLng.lng)

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Invalid coordinates format")
      return
    }

    if (
      lat < ADDIS_BOUNDS.southWest[0] ||
      lat > ADDIS_BOUNDS.northEast[0] ||
      lng < ADDIS_BOUNDS.southWest[1] ||
      lng > ADDIS_BOUNDS.northEast[1]
    ) {
      toast.error("Coordinates must be within Addis Ababa bounds")
      return
    }

    setIsSearching(true)

    // Fly to the searched location
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 16, {
        duration: 1.5,
      })

      toast.success(
        `Navigated to coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      )
    }

    setIsSearching(false)
  }

  // Search by place name (simulated - in real app would use geocoding API)
  const searchByPlaceName = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a place name")
      return
    }

    setIsSearching(true)

    // Simulate API call
    setTimeout(() => {
      // Common Addis Ababa locations mapping
      const locations: Record<string, [number, number]> = {
        bole: [9.0, 38.79],
        megenagna: [9.04, 38.77],
        mexico: [9.02, 38.7],
        piazza: [9.03, 38.76],
        merkato: [9.03, 38.74],
        "addis ababa": [9.03, 38.74],
        airport: [8.98, 38.8],
        university: [9.04, 38.76],
        sheromeda: [9.01, 38.74],
      }

      const query = searchQuery.toLowerCase()
      const foundLocation = Object.entries(locations).find(
        ([key]) => key.includes(query) || query.includes(key),
      )

      if (foundLocation && mapRef.current) {
        const [name, coords] = foundLocation
        mapRef.current.flyTo(coords, 15, {
          duration: 1.5,
        })
        toast.success(`Found: ${name.charAt(0).toUpperCase() + name.slice(1)}`)
      } else {
        toast.error("Location not found. Try 'Bole', 'Megenagna', etc.")
      }

      setIsSearching(false)
    }, 1000)
  }

  // Zoom controls
  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn()
      setZoomLevel(mapRef.current.getZoom())
    }
  }

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut()
      setZoomLevel(mapRef.current.getZoom())
    }
  }

  // Fit to route bounds
  const fitToRoute = () => {
    if (mapRef.current && midpoints.length > 0) {
      const bounds = midpoints.map((mp) => [mp.lat, mp.lng] as [number, number])
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      toast.info("Map fitted to route bounds")
    } else {
      toast.warning("No route points to fit")
    }
  }

  // Reset view
  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(ADDIS_CENTER, 13, {
        duration: 1,
      })
      setZoomLevel(13)
      toast.info("View reset to default")
    }
  }

  // Download route as GPX (simulated)
  const downloadRoute = () => {
    if (midpoints.length < 2) {
      toast.error("Need at least 2 points to export route")
      return
    }

    // Simulate download
    const routeData = {
      name: "Exported Route",
      points: midpoints,
      polyline: routePolyline,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(routeData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `route-${new Date().getTime()}.json`
    a.click()

    toast.success("Route exported successfully")
  }

  // Calculate route statistics
  const routeStats = useMemo(() => {
    if (midpoints.length < 2) return null

    const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number,
    ) => {
      const R = 6371
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLon = ((lon2 - lon1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    }

    let totalDistance = 0
    for (let i = 0; i < midpoints.length - 1; i++) {
      totalDistance += calculateDistance(
        midpoints[i].lat,
        midpoints[i].lng,
        midpoints[i + 1].lat,
        midpoints[i + 1].lng,
      )
    }

    return {
      distance: totalDistance.toFixed(2),
      points: midpoints.length,
      segments: midpoints.length - 1,
      avgSegmentDistance: (totalDistance / (midpoints.length - 1)).toFixed(2),
    }
  }, [midpoints])

  if (!isClient) {
    return (
      <Card className="h-full shadow-2xl border-0 rounded-2xl overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Map className="h-5 w-5" />
                Route Map Editor
              </CardTitle>
              <CardDescription className="text-gray-300">
                Click to add points, drag to adjust
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100vh-200px)]">
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Initializing...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden relative">
      {/* Main Map Container - Takes full height */}
      <div className="absolute inset-0 z-0">
        <MapView
          midpoints={midpoints}
          existingRoutes={selectedRouteFilter === "all" ? existingRoutes : []}
          mapStyle={mapStyle}
          routePolyline={routePolyline}
          onMapClick={onMapClick}
          onUpdateMidpointPosition={onUpdateMidpointPosition}
          onRemoveMidpoint={onRemoveMidpoint}
          onUpdateMidpointName={onUpdateMidpointName}
          mapRef={mapRef}
          showGridOverlay={showGridOverlay}
          onZoomChange={setZoomLevel}
        />
      </div>

      {/* Left Side: Search Panel (Collapsible) */}
      <AnimatePresence>
        {isSearchPanelOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-20 left-4 z-[1000] w-80"
          >
            <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="h-5 w-5 text-blue-600" />
                    Search & Navigation
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchPanelOpen(false)}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Place Name Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Search by Place Name
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Bole, Megenagna..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-white/80"
                      onKeyPress={(e) =>
                        e.key === "Enter" && searchByPlaceName()
                      }
                    />
                    <Button
                      onClick={searchByPlaceName}
                      disabled={isSearching}
                      size="sm"
                    >
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Coordinate Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Search by Coordinates
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        placeholder="Latitude"
                        value={searchLatLng.lat}
                        onChange={(e) =>
                          setSearchLatLng((prev) => ({
                            ...prev,
                            lat: e.target.value,
                          }))
                        }
                        className="bg-white/80"
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Longitude"
                        value={searchLatLng.lng}
                        onChange={(e) =>
                          setSearchLatLng((prev) => ({
                            ...prev,
                            lng: e.target.value,
                          }))
                        }
                        className="bg-white/80"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={searchByCoordinates}
                    disabled={isSearching}
                    className="w-full"
                    variant="default"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Navigation className="h-4 w-4 mr-2" />
                    )}
                    Navigate to Coordinates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Side: Tools Panel (Collapsible) */}
      <AnimatePresence>
        {isToolsPanelOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-20 right-4 z-[1000] w-72"
          >
            <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Map Tools
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsToolsPanelOpen(false)}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Zoom Controls */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Zoom Control
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Button
                      onClick={zoomIn}
                      variant="outline"
                      className="w-full"
                    >
                      <ZoomIn className="h-4 w-4 mr-2" />
                      Zoom In
                    </Button>
                    <Button
                      onClick={zoomOut}
                      variant="outline"
                      className="w-full"
                    >
                      <ZoomOut className="h-4 w-4 mr-2" />
                      Zoom Out
                    </Button>
                  </div>
                </div>

                {/* View Controls */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    View Controls
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={fitToRoute}
                      variant="outline"
                      disabled={midpoints.length === 0}
                    >
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Fit Route
                    </Button>
                    <Button onClick={resetView} variant="outline">
                      <RotateCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Route Filters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Route Filters
                  </label>
                  <select
                    className="w-full p-2 border rounded text-sm bg-white/80"
                    value={selectedRouteFilter}
                    onChange={(e) => setSelectedRouteFilter(e.target.value)}
                  >
                    <option value="all">Show All Routes</option>
                    <option value="none">Hide Existing Routes</option>
                    <option value="active">Active Routes Only</option>
                  </select>
                </div>

                {/* Grid Overlay Toggle */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Grid Overlay</span>
                  </div>
                  <Button
                    size="sm"
                    variant={showGridOverlay ? "default" : "outline"}
                    onClick={() => setShowGridOverlay(!showGridOverlay)}
                  >
                    {showGridOverlay ? "On" : "Off"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Left: Route Statistics (Compact) */}
      {showRouteStats && routeStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 z-[1000] w-64"
        >
          <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-blue-600" />
                  Route Statistics
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRouteStats(false)}
                  className="h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50/80 p-2 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">Distance</p>
                  <p className="text-lg font-bold text-gray-900">
                    {routeStats.distance} km
                  </p>
                </div>
                <div className="bg-green-50/80 p-2 rounded-lg">
                  <p className="text-xs text-green-600 font-medium">Points</p>
                  <p className="text-lg font-bold text-gray-900">
                    {routeStats.points}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Bottom Right: Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 right-4 z-[1000] w-56"
      >
        <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={downloadRoute}
              variant="outline"
              className="w-full justify-start"
              disabled={midpoints.length < 2}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Route
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(
                  midpoints
                    .map((mp) => `${mp.lat.toFixed(6)},${mp.lng.toFixed(6)}`)
                    .join("|"),
                )
                toast.success("Coordinates copied to clipboard")
              }}
              variant="outline"
              className="w-full justify-start"
              disabled={midpoints.length === 0}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Copy All Coords
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Floating Control Buttons */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        {!isSearchPanelOpen && (
          <Button
            onClick={() => setIsSearchPanelOpen(true)}
            variant="default"
            size="sm"
            className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 hover:bg-white text-gray-900"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        )}

        {!isToolsPanelOpen && (
          <Button
            onClick={() => setIsToolsPanelOpen(true)}
            variant="default"
            size="sm"
            className="bg-white/95 backdrop-blur-xl shadow-lg border border-white/20 hover:bg-white text-gray-900"
          >
            <Settings className="h-4 w-4 mr-2" />
            Tools
          </Button>
        )}
      </div>

      {/* Map Info Badge (Top Right) */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Badge className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-lg text-gray-700">
          <Globe className="h-3 w-3 mr-1 text-blue-600" />
          <span className="font-medium">Addis Ababa</span>
        </Badge>
      </div>

      {/* Center Coordinates Display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-[999] pointer-events-none"
      >
        <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-mono backdrop-blur-sm shadow-lg">
          <span className="text-blue-300">Center:</span>{" "}
          {ADDIS_CENTER[0].toFixed(4)}, {ADDIS_CENTER[1].toFixed(4)}
        </div>
      </motion.div>
    </div>
  )
}

export default RouteMap
