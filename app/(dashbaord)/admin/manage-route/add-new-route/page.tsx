// app/create-route/page.tsx
"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import RouteForm from "@/components/admin-dashboard/route/RouteForm"
import RouteMap from "@/components/admin-dashboard/route/RouteMap"
import MapTools from "@/components/admin-dashboard/route/MapTools"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowLeft, Trash2, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { createRoute } from "@/services/route.api"
import { useQueryClient } from "@tanstack/react-query"

// Define TypeScript interfaces
export interface Midpoint {
  id: string
  name: string
  lat: number
  lng: number
  order: number
}

export interface Route {
  id: string
  name: string
  origin: string
  destination: string
  polyline: [number, number][]
  color?: string
}

// Form validation schema
export const formSchema = z.object({
  routeName: z.string().min(2, "Route name must be at least 2 characters"),
  origin: z.string().min(2, "Origin must be at least 2 characters"),
  destination: z.string().min(2, "Destination must be at least 2 characters"),
  distance: z.number().min(0.1, "Distance must be at least 0.1 km"),
  estimatedTime: z.number().min(1, "Estimated time must be at least 1 minute"),
  price: z.number().min(0, "Price cannot be negative"),
  currency: z.string().default("ETB"),
  active: z.boolean().default(true),
  description: z.string().optional(),
})

export type FormValues = z.infer<typeof formSchema>

// Helper function to calculate distance using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return parseFloat((R * c).toFixed(2))
}

// Addis Ababa bounds
export const ADDIS_BOUNDS = {
  southWest: [8.85, 38.55] as [number, number],
  northEast: [9.15, 39.05] as [number, number],
}

export const ADDIS_CENTER: [number, number] = [9.03, 38.74]

// Main component
export default function CreateRoutePage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [midpoints, setMidpoints] = useState<Midpoint[]>([
    { id: "1", name: "Bole", lat: 9.0, lng: 38.79, order: 0 },
    { id: "2", name: "Megenagna", lat: 9.04, lng: 38.77, order: 1 },
    { id: "3", name: "Mexico", lat: 9.02, lng: 38.7, order: 2 },
  ])
  const [existingRoutes, setExistingRoutes] = useState<Route[]>([
    {
      id: "1",
      name: "Bole - Piazza",
      origin: "Bole",
      destination: "Piazza",
      polyline: [
        [9.0, 38.79],
        [9.04, 38.77],
        [9.02, 38.7],
        [9.01, 38.76],
      ],
      color: "#94a3b8",
    },
  ])
  const [showExistingRoutes, setShowExistingRoutes] = useState(true)
  const [mapStyle, setMapStyle] = useState<"light" | "streets">("light")
  const [isLoading, setIsLoading] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [totalDistance, setTotalDistance] = useState(0)

  // Refs
  const mapRef = useRef<any>(null)
  const undoStackRef = useRef<Midpoint[][]>([[]])

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      routeName: "",
      origin: "",
      destination: "",
      distance: 0,
      estimatedTime: 30,
      price: 0,
      currency: "ETB",
      active: true,
      description: "",
    },
  })

  // Calculate total distance when midpoints change
  useEffect(() => {
    if (midpoints.length < 2) {
      setTotalDistance(0)
      form.setValue("distance", 0)
      return
    }

    let totalDistance = 0
    for (let i = 0; i < midpoints.length - 1; i++) {
      const current = midpoints[i]
      const next = midpoints[i + 1]
      totalDistance += calculateDistance(
        current.lat,
        current.lng,
        next.lat,
        next.lng,
      )
    }

    const roundedDistance = parseFloat(totalDistance.toFixed(2))
    setTotalDistance(roundedDistance)
    form.setValue("distance", roundedDistance)
  }, [midpoints, form])

  // Handle map click to add midpoint
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      // Check if point is within Addis Ababa bounds
      if (
        lat < ADDIS_BOUNDS.southWest[0] ||
        lat > ADDIS_BOUNDS.northEast[0] ||
        lng < ADDIS_BOUNDS.southWest[1] ||
        lng > ADDIS_BOUNDS.northEast[1]
      ) {
        toast.warning("Location Restricted", {
          description: "Please select a location within Addis Ababa bounds.",
          duration: 3000,
        })
        return
      }

      // Save current state to undo stack
      undoStackRef.current.push([...midpoints])

      const newMidpoint: Midpoint = {
        id: Date.now().toString(),
        name: `Point ${midpoints.length + 1}`,
        lat,
        lng,
        order: midpoints.length,
      }

      setMidpoints((prev) => [...prev, newMidpoint])

      toast.success("Marker Added", {
        description: `New midpoint added at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        duration: 2000,
      })
    },
    [midpoints],
  )

  // Function to remove midpoint
  const removeMidpoint = (id: string) => {
    undoStackRef.current.push([...midpoints])
    setMidpoints((prev) => {
      const filtered = prev.filter((mp) => mp.id !== id)
      // Reorder remaining midpoints
      return filtered.map((mp, index) => ({ ...mp, order: index }))
    })

    toast.info("Marker Removed", {
      description: "Midpoint has been removed from the route.",
      duration: 2000,
    })
  }

  // Function to update midpoint name
  const updateMidpointName = (id: string, newName: string) => {
    setMidpoints((prev) =>
      prev.map((mp) => (mp.id === id ? { ...mp, name: newName } : mp)),
    )
  }

  // Function to update midpoint position
  const updateMidpointPosition = (
    id: string,
    newLat: number,
    newLng: number,
  ) => {
    setMidpoints((prev) =>
      prev.map((mp) =>
        mp.id === id ? { ...mp, lat: newLat, lng: newLng } : mp,
      ),
    )
  }

  // Function to clear all midpoints
  const clearAllMidpoints = () => {
    if (midpoints.length === 0) return

    undoStackRef.current.push([...midpoints])
    setMidpoints([])
    setClearDialogOpen(false)

    toast.info("All Markers Cleared", {
      description: "All midpoints have been removed from the route.",
      duration: 3000,
    })
  }

  // Function to undo last action
  const undoLastAction = () => {
    if (undoStackRef.current.length > 1) {
      const previousState = undoStackRef.current.pop()
      if (previousState) {
        setMidpoints(previousState)
        toast.info("Action Undone", {
          description: "Last action has been undone.",
          duration: 2000,
        })
      }
    } else {
      toast.info("Nothing to Undo", {
        description: "No actions to undo.",
        duration: 2000,
      })
    }
  }

  // Function to fit map to route
  const fitMapToRoute = () => {
    if (!mapRef.current || midpoints.length === 0) {
      toast.warning("No Route", {
        description: "Add midpoints to create a route first.",
        duration: 2000,
      })
      return
    }

    const bounds = midpoints.map((mp) => [mp.lat, mp.lng] as [number, number])
    mapRef.current.fitBounds(bounds, { padding: [50, 50] })

    toast.info("Map Fitted", {
      description: "Map view adjusted to show entire route.",
      duration: 2000,
    })
  }

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (midpoints.length < 2) {
      toast.error("Incomplete Route", {
        description: "Please add at least 2 midpoints to create a route.",
        duration: 4000,
      })
      return
    }

    setIsLoading(true)

    try {
      const routeData = {
        name: data.routeName,
        origin: data.origin,
        destination: data.destination,
        distanceKm: data.distance,
        estimatedTimeMin: data.estimatedTime,
        price: data.price,
        currency: data.currency || "ETB",
        isActive: data.active,
        midPoints: midpoints.map((mp, index) => ({
          name: mp.name,
          lat: mp.lat,
          lng: mp.lng,
          order: index, // always enforce order here
        })),
      }

      const res = await createRoute(routeData)

      if (res.success) {
        console.log("Route data to save:", routeData)

        toast.success("Route Created Successfully", {
          description: `Route "${routeData.name}" has been saved to the system.`,
          duration: 5000,
          action: {
            label: "View Routes",
            onClick: () => {
              router.push(`/admin/manage-route/${res.data.id}`)
            },
          },
        })

        // Reset form
        form.reset()
        undoStackRef.current = [[]]
        setMidpoints([])
        queryClient.invalidateQueries({ queryKey: ["routes"] })
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      toast.error("Failed to Save Route", {
        description:
          "An error occurred while saving the route. Please try again.",
        duration: 5000,
      })
      console.error("Error saving route:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Reset form
  const handleReset = () => {
    form.reset()
    undoStackRef.current = [[]]
    setMidpoints([])

    toast.info("Form Reset", {
      description: "All form data has been cleared.",
      duration: 3000,
    })
  }

  // Generate polyline coordinates from midpoints
  const routePolyline = midpoints.map(
    (mp) => [mp.lat, mp.lng] as [number, number],
  )

  const handleReorderMidpoints = (reorderedMidpoints: Midpoint[]) => {
    undoStackRef.current.push([...midpoints])
    setMidpoints(reorderedMidpoints)

    toast.info("Route order updated", {
      description: "Midpoints have been reordered successfully.",
      duration: 2000,
    })
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-screen-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center gap-4"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">
            Create New routes
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-4"
          >
            <RouteForm
              form={form}
              midpoints={midpoints}
              totalDistance={totalDistance}
              isLoading={isLoading}
              onRemoveMidpoint={removeMidpoint}
              onUpdateMidpointName={updateMidpointName}
              onReorderMidpoints={handleReorderMidpoints} // Add this
              onClearAll={() => setClearDialogOpen(true)}
              onSubmit={onSubmit}
              onReset={handleReset}
            />
          </motion.div>

          {/* Right Panel - Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-8"
          >
            <div className="relative h-full">
              {/* Map Tools */}
              <MapTools
                midpointsCount={midpoints.length}
                totalDistance={totalDistance}
                showExistingRoutes={showExistingRoutes}
                mapStyle={mapStyle}
                onToggleExistingRoutes={() =>
                  setShowExistingRoutes(!showExistingRoutes)
                }
                onToggleMapStyle={() =>
                  setMapStyle(mapStyle === "light" ? "streets" : "light")
                }
                onUndo={undoLastAction}
                onFitToRoute={fitMapToRoute}
                onClearAll={() => setClearDialogOpen(true)}
              />

              {/* Route Map */}
              <RouteMap
                midpoints={midpoints}
                existingRoutes={showExistingRoutes ? existingRoutes : []}
                mapStyle={mapStyle}
                routePolyline={routePolyline}
                onMapClick={handleMapClick}
                onUpdateMidpointPosition={updateMidpointPosition}
                onRemoveMidpoint={removeMidpoint}
                onUpdateMidpointName={updateMidpointName}
                mapRef={mapRef}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Clear All Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Clear All Midpoints?
            </DialogTitle>
            <DialogDescription>
              This will remove all {midpoints.length} midpoints from your route.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setClearDialogOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={clearAllMidpoints}
              className="rounded-lg"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
