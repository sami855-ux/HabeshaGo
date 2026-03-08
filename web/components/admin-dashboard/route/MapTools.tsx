import React from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Navigation,
  Layers,
  Eye,
  EyeOff,
  Undo,
  Maximize2,
  TrashIcon,
  MapPin,
} from "lucide-react"

interface MapToolsProps {
  midpointsCount: number
  totalDistance: number
  showExistingRoutes: boolean
  mapStyle: "light" | "streets"
  onToggleExistingRoutes: () => void
  onToggleMapStyle: () => void
  onUndo: () => void
  onFitToRoute: () => void
  onClearAll: () => void
}

const MapTools: React.FC<MapToolsProps> = ({
  midpointsCount,
  totalDistance,
  showExistingRoutes,
  mapStyle,
  onToggleExistingRoutes,
  onToggleMapStyle,
  onUndo,
  onFitToRoute,
  onClearAll,
}) => {
  return (
    <>
      {/* Distance Badge */}
      {totalDistance > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-4 z-[1000]"
        >
          <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 px-4 py-2 text-sm font-semibold rounded-xl shadow-lg">
            <Navigation className="h-4 w-4 mr-2" />
            Total Distance: {totalDistance} km
          </Badge>
        </motion.div>
      )}

      {/* Midpoints Count Badge */}
      <div className="absolute top-4 right-36 z-[1000]">
        <Badge
          variant="secondary"
          className="bg-white/90 backdrop-blur-sm border-gray-200"
        >
          <MapPin className="h-3 w-3 mr-1" />
          {midpointsCount} Points
        </Badge>
      </div>

      {/* Map Style Toggle */}
      <div className="absolute top-4 right-24 z-[1000]">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleMapStyle}
          className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white rounded-lg"
        >
          <Layers className="h-4 w-4 mr-2" />
          {mapStyle === "light" ? "Streets" : "Light"}
        </Button>
      </div>

      {/* Show Routes Toggle */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleExistingRoutes}
          className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white rounded-lg"
        >
          {showExistingRoutes ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Routes
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Show Routes
            </>
          )}
        </Button>
      </div>

      {/* Tools Floating Bar */}
      <div className="absolute top-20 right-4 z-[1000] flex flex-col gap-2 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg border">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onUndo}
          className="h-10 w-10 rounded-lg hover:bg-gray-100"
          title="Undo last action"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onFitToRoute}
          className="h-10 w-10 rounded-lg hover:bg-gray-100"
          title="Fit map to route"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onClearAll}
          disabled={midpointsCount === 0}
          className="h-10 w-10 rounded-lg hover:bg-gray-100"
          title="Clear all points"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </>
  )
}

export default MapTools
