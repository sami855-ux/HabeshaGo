// components/create-route/MapView.tsx
"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Tooltip,
  useMapEvents,
  useMap,
  Rectangle,
  CircleMarker,
  ScaleControl,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Trash2,
  Navigation,
  MapPin,
  Copy,
  ExternalLink,
  Info,
  Maximize2,
} from "lucide-react"
import { toast } from "sonner"
import {
  Midpoint,
  Route,
  ADDIS_BOUNDS,
  ADDIS_CENTER,
} from "@/app/(dashbaord)/admin/manage-route/add-new-route/page"

interface MapViewProps {
  midpoints: Midpoint[]
  existingRoutes: Route[]
  mapStyle: "light" | "streets"
  routePolyline: [number, number][]
  onMapClick: (lat: number, lng: number) => void
  onUpdateMidpointPosition: (id: string, lat: number, lng: number) => void
  onRemoveMidpoint: (id: string) => void
  onUpdateMidpointName: (id: string, name: string) => void
  mapRef: React.MutableRefObject<any>
  showGridOverlay?: boolean
  onZoomChange?: (zoom: number) => void
}

// Create custom marker icons with SVG
const createCustomIcon = (number: number, isActive: boolean = true) => {
  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: ${isActive ? "36px" : "32px"};
        height: ${isActive ? "36px" : "32px"};
        background: ${
          isActive
            ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
            : "linear-gradient(135deg, #6b7280, #4b5563)"
        };
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${isActive ? "14px" : "12px"};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 1000;
      ">
        ${number}
        <div style="
          position: absolute;
          top: -2px;
          right: -2px;
          width: 10px;
          height: 10px;
          background: ${isActive ? "#10b981" : "#9ca3af"};
          border: 2px solid white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: isActive ? [36, 36] : [32, 32],
    iconAnchor: isActive ? [18, 36] : [16, 32],
    popupAnchor: [0, isActive ? -36 : -32],
    className: "custom-leaflet-marker",
  })
}

// Custom component for grid overlay
const GridOverlay = () => {
  const map = useMap()
  const [gridCells, setGridCells] = useState<
    Array<{
      bounds: [[number, number], [number, number]]
      center: [number, number]
    }>
  >([])

  useEffect(() => {
    if (!map) return

    const bounds = map.getBounds()
    const zoom = map.getZoom()

    // Create grid based on zoom level
    const cells = []
    const latStep = (bounds.getNorth() - bounds.getSouth()) / 8
    const lngStep = (bounds.getEast() - bounds.getWest()) / 8

    for (let lat = bounds.getSouth(); lat < bounds.getNorth(); lat += latStep) {
      for (let lng = bounds.getWest(); lng < bounds.getEast(); lng += lngStep) {
        cells.push({
          bounds: [
            [lat, lng],
            [lat + latStep, lng + lngStep],
          ],
          center: [lat + latStep / 2, lng + lngStep / 2],
        })
      }
    }

    setGridCells(cells)
  }, [map])

  if (!map) return null

  return (
    <>
      {gridCells.map((cell, index) => (
        <Rectangle
          key={index}
          bounds={cell.bounds}
          pathOptions={{
            color: "#3b82f6",
            weight: 0.5,
            opacity: 0.2,
            fillOpacity: 0.03,
            dashArray: "3, 3",
          }}
        />
      ))}
    </>
  )
}

// Map click handler component with coordinates display
const MapClickHandler = ({
  onClick,
  onMove,
  isAddingPoint,
}: {
  onClick: (e: any) => void
  onMove?: () => void
  isAddingPoint?: boolean
}) => {
  const map = useMap()
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)

  useMapEvents({
    click: (e) => {
      // Only trigger map click if we're not clicking on a marker
      if (!isAddingPoint) {
        onClick(e)
      }
      setCoordinates([e.latlng.lat, e.latlng.lng])
    },
    mousemove: (e) => {
      setCoordinates([e.latlng.lat, e.latlng.lng])
    },
    move: () => {
      onMove?.()
    },
    zoom: () => {
      onMove?.()
    },
  })

  // Display coordinates on cursor
  useEffect(() => {
    if (!map || !coordinates) return

    const coordsDisplay = L.control({ position: "bottomleft" })

    coordsDisplay.onAdd = () => {
      const div = L.DomUtil.create("div", "coordinates-display")
      div.innerHTML = `
        <div style="
          background: rgba(255,255,255,0.95);
          color: #1f2937;
          padding: 6px 10px;
          border-radius: 8px;
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 12px;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          font-weight: 500;
        ">
          <div class="flex items-center gap-1">
            <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;"></div>
            <span>Lat: ${coordinates[0].toFixed(6)}</span>
            <span class="mx-1">|</span>
            <span>Lng: ${coordinates[1].toFixed(6)}</span>
          </div>
        </div>
      `
      return div
    }

    coordsDisplay.addTo(map)

    return () => {
      map.removeControl(coordsDisplay)
    }
  }, [map, coordinates])

  return null
}

// Zoom tracker component
const ZoomTracker = ({ onChange }: { onChange: (zoom: number) => void }) => {
  const map = useMap()

  useMapEvents({
    zoom: () => {
      if (map) {
        onChange(map.getZoom())
      }
    },
  })

  return null
}

// Fullscreen control
const FullscreenControl = () => {
  const map = useMap()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    const container = map.getContainer()
    if (!document.fullscreenElement) {
      container.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return (
    <div className="leaflet-control leaflet-bar !border-0">
      <a
        href="#"
        title="Toggle Fullscreen"
        onClick={(e) => {
          e.preventDefault()
          toggleFullscreen()
        }}
        className="!bg-white/90 !backdrop-blur-sm !border !border-white/20 !text-gray-700 hover:!bg-white !rounded-lg !flex !items-center !justify-center !w-8 !h-8"
      >
        <Maximize2 className="h-4 w-4" />
      </a>
    </div>
  )
}

// Custom Popup Component with better control
const CustomPopup = ({
  midpoint,
  index,
  totalPoints,
  onUpdateName,
  onRemove,
  onCopyCoordinates,
  onOpenInMaps,
}: {
  midpoint: Midpoint
  index: number
  totalPoints: number
  onUpdateName: (id: string, name: string) => void
  onRemove: (id: string) => void
  onCopyCoordinates: (lat: number, lng: number) => void
  onOpenInMaps: (lat: number, lng: number) => void
}) => {
  const [name, setName] = useState(midpoint.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    onUpdateName(midpoint.id, e.target.value)
  }

  const handleCopy = () => {
    onCopyCoordinates(midpoint.lat, midpoint.lng)
  }

  const handleOpenInMaps = () => {
    onOpenInMaps(midpoint.lat, midpoint.lng)
  }

  const handleRemove = () => {
    onRemove(midpoint.id)
  }

  return (
    <div className="p-4 min-w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900">Point #{index + 1}</h3>
        <Badge variant="outline" className="font-mono bg-blue-50">
          {midpoint.lat.toFixed(4)}, {midpoint.lng.toFixed(4)}
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Point Name
          </label>
          <Input
            ref={inputRef}
            value={name}
            onChange={handleNameChange}
            className="w-full bg-gray-50 border-gray-200"
            placeholder="Enter point name"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-blue-600" />
            <div className="text-sm font-medium text-blue-700">Coordinates</div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/80 p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Latitude</div>
              <div className="font-mono text-sm font-bold">
                {midpoint.lat.toFixed(6)}
              </div>
            </div>
            <div className="bg-white/80 p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Longitude</div>
              <div className="font-mono text-sm font-bold">
                {midpoint.lng.toFixed(6)}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-white"
              onClick={handleCopy}
            >
              <Copy className="h-3 w-3 mr-2" />
              Copy
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-white"
              onClick={handleOpenInMaps}
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              Maps
            </Button>
          </div>
        </div>

        {index > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="h-4 w-4 text-green-600" />
              <div className="text-sm font-medium text-green-700">
                Connection Info
              </div>
            </div>
            <div className="text-sm">Connected to Point #{index}</div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            Order: <span className="font-bold">{index + 1}</span> of{" "}
            {totalPoints}
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleRemove}
            className="h-9 px-4"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Point
          </Button>
        </div>
      </div>
    </div>
  )
}

const MapView: React.FC<MapViewProps> = ({
  midpoints,
  existingRoutes,
  mapStyle,
  routePolyline,
  onMapClick,
  onUpdateMidpointPosition,
  onRemoveMidpoint,
  onUpdateMidpointName,
  mapRef,
  showGridOverlay = false,
  onZoomChange,
}) => {
  const [isMapReady, setIsMapReady] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)
  const [currentBounds, setCurrentBounds] = useState<string>("")
  const [activePopup, setActivePopup] = useState<string | null>(null)
  const [isAddingPoint, setIsAddingPoint] = useState(false)

  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng
    setIsAddingPoint(true)
    onMapClick(lat, lng)

    // Reset after a short delay
    setTimeout(() => {
      setIsAddingPoint(false)
    }, 100)
  }

  const handleMapMove = () => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds()
      setCurrentBounds(
        `SW: ${bounds.getSouthWest().lat.toFixed(4)}, ${bounds.getSouthWest().lng.toFixed(4)} | ` +
          `NE: ${bounds.getNorthEast().lat.toFixed(4)}, ${bounds.getNorthEast().lng.toFixed(4)}`,
      )
    }
  }

  const copyCoordinates = (lat: number, lng: number) => {
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    toast.success("Coordinates copied to clipboard")
  }

  const openInGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank")
  }

  const handleMarkerClick = (id: string) => {
    setActivePopup(id)
  }

  const handleMarkerDragStart = (id: string) => {
    setHoveredPoint(id)
    setActivePopup(id)
  }

  const handleMarkerDragEnd = (marker: any, id: string) => {
    const position = marker.getLatLng()
    onUpdateMidpointPosition(id, position.lat, position.lng)
    setActivePopup(id)
  }

  const handleMarkerMouseOver = (id: string) => {
    setHoveredPoint(id)
  }

  const handleMarkerMouseOut = () => {
    setHoveredPoint(null)
  }

  const handlePopupClose = () => {
    setActivePopup(null)
  }

  return (
    <>
      <MapContainer
        center={ADDIS_CENTER}
        zoom={13}
        className="h-full w-full"
        ref={mapRef}
        whenReady={() => setIsMapReady(true)}
        maxBounds={[ADDIS_BOUNDS.southWest, ADDIS_BOUNDS.northEast]}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
        style={{
          height: "100%",
          width: "100%",
          zIndex: 0,
        }}
      >
        {/* Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={
            mapStyle === "light"
              ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />

        {/* Scale Control */}
        <ScaleControl imperial={false} position="bottomright" />

        {/* Fullscreen Control */}
        <FullscreenControl />

        {/* Click Handler with coordinates display */}
        <MapClickHandler
          onClick={handleMapClick}
          onMove={handleMapMove}
          isAddingPoint={isAddingPoint}
        />

        {/* Zoom Tracker */}
        {onZoomChange && <ZoomTracker onChange={onZoomChange} />}

        {/* Grid Overlay */}
        {showGridOverlay && <GridOverlay />}

        {/* Boundary Rectangle */}
        <Rectangle
          bounds={[ADDIS_BOUNDS.southWest, ADDIS_BOUNDS.northEast]}
          pathOptions={{
            color: "#3b82f6",
            weight: 3,
            opacity: 0.6,
            fillOpacity: 0.05,
            dashArray: "15, 10",
            lineCap: "round",
          }}
        >
          <Tooltip permanent direction="center">
            <div className="px-3 py-2 bg-gray-900 text-white rounded-lg shadow-xl">
              <div className="font-semibold">Addis Ababa Bounds</div>
              <div className="text-xs text-gray-300 mt-1">
                Restricted area for route planning
              </div>
            </div>
          </Tooltip>
        </Rectangle>

        {/* Current View Bounds Display */}
        <div className="leaflet-control leaflet-bar !border-0 !bg-transparent">
          <div className="!bg-white/90 !backdrop-blur-sm !border !border-white/20 !text-gray-700 !rounded-lg !px-3 !py-2 !text-xs !max-w-xs">
            <div className="font-medium mb-1">Current View</div>
            <div className="font-mono text-[10px] leading-tight">
              {currentBounds}
            </div>
          </div>
        </div>

        {/* Existing Routes */}
        {existingRoutes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.polyline}
            pathOptions={{
              color: route.color || "#94a3b8",
              weight: 4,
              opacity: 0.4,
              dashArray: "8, 8",
              lineCap: "round",
              lineJoin: "round",
            }}
          >
            <Tooltip>
              <div className="px-3 py-2">
                <div className="font-semibold">{route.name}</div>
                <div className="text-sm text-gray-600">
                  {route.origin} → {route.destination}
                </div>
              </div>
            </Tooltip>
          </Polyline>
        ))}

        {/* Current Route Polyline with gradient effect */}
        {midpoints.length >= 2 && (
          <>
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: "#3b82f6",
                weight: 6,
                opacity: 0.9,
                dashArray: "0",
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* Highlighted segments on hover */}
            {hoveredPoint &&
              midpoints.findIndex((mp) => mp.id === hoveredPoint) > 0 && (
                <Polyline
                  positions={[
                    routePolyline[
                      midpoints.findIndex((mp) => mp.id === hoveredPoint) - 1
                    ],
                    routePolyline[
                      midpoints.findIndex((mp) => mp.id === hoveredPoint)
                    ],
                  ]}
                  pathOptions={{
                    color: "#f59e0b",
                    weight: 8,
                    opacity: 1,
                    dashArray: "0",
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
              )}
          </>
        )}

        {/* Midpoint Markers */}
        {midpoints.map((midpoint, index) => {
          const isActive =
            activePopup === midpoint.id || hoveredPoint === midpoint.id

          return (
            <Marker
              key={midpoint.id}
              position={[midpoint.lat, midpoint.lng]}
              icon={createCustomIcon(index + 1, isActive)}
              draggable
              eventHandlers={{
                click: (e) => {
                  // Stop event propagation to prevent map click
                  L.DomEvent.stopPropagation(e)
                  handleMarkerClick(midpoint.id)
                  e.target.openPopup()
                },
                dragstart: (e) => {
                  handleMarkerDragStart(midpoint.id)
                },
                dragend: (e) => {
                  handleMarkerDragEnd(e.target, midpoint.id)
                },
                contextmenu: (e) => {
                  e.originalEvent.preventDefault()
                  onRemoveMidpoint(midpoint.id)
                },
                mouseover: (e) => {
                  handleMarkerMouseOver(midpoint.id)
                },
                mouseout: (e) => {
                  handleMarkerMouseOut()
                },
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -15]}>
                <div className="px-3 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg shadow-xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    {midpoint.name}
                    <Badge className="ml-2 bg-blue-600 text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              </Tooltip>
              <Popup
                onClose={handlePopupClose}
                className="custom-popup"
                closeButton={true}
                autoClose={false}
                closeOnClick={false}
              >
                <CustomPopup
                  midpoint={midpoint}
                  index={index}
                  totalPoints={midpoints.length}
                  onUpdateName={onUpdateMidpointName}
                  onRemove={onRemoveMidpoint}
                  onCopyCoordinates={copyCoordinates}
                  onOpenInMaps={openInGoogleMaps}
                />
              </Popup>
            </Marker>
          )
        })}

        {/* Start and End markers (special styling) */}
        {midpoints.length > 0 && (
          <>
            <CircleMarker
              center={[midpoints[0].lat, midpoints[0].lng]}
              radius={10}
              pathOptions={{
                color: "#10b981",
                fillColor: "#10b981",
                weight: 4,
                opacity: 1,
                fillOpacity: 0.9,
              }}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e)
                },
              }}
            >
              <Tooltip permanent>
                <div className="px-3 py-2 bg-green-600 text-white rounded-lg font-semibold">
                  🚀 Start Point
                </div>
              </Tooltip>
            </CircleMarker>

            {midpoints.length > 1 && (
              <CircleMarker
                center={[
                  midpoints[midpoints.length - 1].lat,
                  midpoints[midpoints.length - 1].lng,
                ]}
                radius={10}
                pathOptions={{
                  color: "#ef4444",
                  fillColor: "#ef4444",
                  weight: 4,
                  opacity: 1,
                  fillOpacity: 0.9,
                }}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e)
                  },
                }}
              >
                <Tooltip permanent>
                  <div className="px-3 py-2 bg-red-600 text-white rounded-lg font-semibold">
                    🏁 End Point
                  </div>
                </Tooltip>
              </CircleMarker>
            )}
          </>
        )}
      </MapContainer>

      {/* Map Loading Overlay */}
      {!isMapReady && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl flex flex-col items-center justify-center rounded-b-2xl">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 animate-ping bg-blue-600/20 rounded-full"></div>
              <div className="relative animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="animate-bounce">
                  <MapPin className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">
                Loading Advanced Map
              </h3>
              <p className="text-gray-300">
                Initializing route planning engine...
              </p>
            </div>

            <div className="w-64 mx-auto">
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 animate-pulse"></div>
              </div>
            </div>

            <div className="text-gray-400 text-sm space-y-1">
              <p>• Click anywhere on the map to add points</p>
              <p>• Drag points to adjust their position</p>
              <p>• Right-click on points to remove them</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MapView
