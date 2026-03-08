"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, MapPin } from "lucide-react"
import { Route, MidPoint } from "@/types/route"
import { createRoute, updateRoute } from "@/services/route.api"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface RouteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route?: Route
  isEdit: boolean
}

interface RouteFormData {
  name: string
  origin: string
  destination: string
  distanceKm: number | null
  estimatedTimeMin: number | null
  isActive: boolean
  midPoints: Omit<MidPoint, "id" | "routeId">[]
}

export default function RouteDialog({
  open,
  onOpenChange,
  route,
  isEdit,
}: RouteDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<RouteFormData>({
    name: route?.name || "",
    origin: route?.origin || "",
    destination: route?.destination || "",
    distanceKm: route?.distanceKm || null,
    estimatedTimeMin: route?.estimatedTimeMin || null,
    isActive: route?.isActive ?? true,
    midPoints: route?.midPoints?.map((mp) => ({
      name: mp.name,
      lat: mp.lat,
      lng: mp.lng,
    })) || [{ name: "", lat: 0, lng: 0 }],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Filter out empty mid-points
      const validMidPoints = formData.midPoints.filter(
        (mp) => mp.name.trim() !== "" && mp.lat !== 0 && mp.lng !== 0
      )

      // Prepare data for API
      const apiData = {
        name: formData.name.trim(),
        origin: formData.origin.trim(),
        destination: formData.destination.trim(),
        distanceKm: formData.distanceKm || undefined,
        estimatedTimeMin: formData.estimatedTimeMin || undefined,
        midPoints: validMidPoints.length > 0 ? validMidPoints : undefined,
        isActive: formData.isActive,
      }

      console.log("Submitting data:", apiData)

      if (isEdit && route?.id) {
        // Update existing route
        await updateRoute(route.id, apiData)
        toast.success("Route updated successfully")
      } else {
        // Create new route
        await createRoute(apiData)
        toast.success("Route created successfully")
      }

      // Refresh routes data
      queryClient.invalidateQueries({ queryKey: ["routes"] })

      // Close dialog
      onOpenChange(false)

      // Reset form for next creation
      if (!isEdit) {
        setFormData({
          name: "",
          origin: "",
          destination: "",
          distanceKm: null,
          estimatedTimeMin: null,
          isActive: true,
          midPoints: [{ name: "", lat: 0, lng: 0 }],
        })
      }
    } catch (error: any) {
      console.error("Error submitting route:", error)

      toast.error("Failed to save route. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addMidPoint = () => {
    setFormData({
      ...formData,
      midPoints: [...formData.midPoints, { name: "", lat: 0, lng: 0 }],
    })
  }

  const removeMidPoint = (index: number) => {
    const updatedMidPoints = formData.midPoints.filter((_, i) => i !== index)
    // Ensure there's at least one mid-point field
    if (updatedMidPoints.length === 0) {
      updatedMidPoints.push({ name: "", lat: 0, lng: 0 })
    }
    setFormData({
      ...formData,
      midPoints: updatedMidPoints,
    })
  }

  const updateMidPoint = (
    index: number,
    field: keyof MidPoint,
    value: string | number
  ) => {
    const updatedMidPoints = [...formData.midPoints]
    updatedMidPoints[index] = { ...updatedMidPoints[index], [field]: value }
    setFormData({
      ...formData,
      midPoints: updatedMidPoints,
    })
  }

  const updateFormData = (field: keyof RouteFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Calculate if form is valid
  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.origin.trim() !== "" &&
      formData.destination.trim() !== "" &&
      formData.midPoints.every(
        (mp) => mp.name.trim() !== "" && (mp.lat !== 0 || mp.lng !== 0) // Allow lat/lng to be 0 but warn user
      )
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Route" : "Create New Route"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the route information and mid-points."
                : "Add a new route to the transportation system."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Route Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., East Side to Market Square"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  A descriptive name for the route
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      updateFormData("isActive", checked)
                    }
                    disabled={isSubmitting}
                  />
                  <span className="text-sm">
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin *</Label>
                <Input
                  id="origin"
                  placeholder="e.g., East Side"
                  value={formData.origin}
                  onChange={(e) => updateFormData("origin", e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  placeholder="e.g., Market Square"
                  value={formData.destination}
                  onChange={(e) =>
                    updateFormData("destination", e.target.value)
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distanceKm">Distance (km)</Label>
                <Input
                  id="distanceKm"
                  type="number"
                  placeholder="e.g., 12"
                  min="0"
                  step="0.1"
                  value={formData.distanceKm || ""}
                  onChange={(e) =>
                    updateFormData(
                      "distanceKm",
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Total route distance in kilometers
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedTimeMin">
                  Estimated Time (minutes)
                </Label>
                <Input
                  id="estimatedTimeMin"
                  type="number"
                  placeholder="e.g., 25"
                  min="0"
                  value={formData.estimatedTimeMin || ""}
                  onChange={(e) =>
                    updateFormData(
                      "estimatedTimeMin",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Estimated travel time in minutes
                </p>
              </div>
            </div>

            {/* Mid-points Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Mid-points</h3>
                  <p className="text-sm text-muted-foreground">
                    Add intermediate stops along the route (optional)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMidPoint}
                  className="gap-2"
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4" />
                  Add Mid-point
                </Button>
              </div>

              <div className="space-y-3">
                {formData.midPoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`midpoint-name-${index}`}>Name *</Label>
                        <Input
                          id={`midpoint-name-${index}`}
                          placeholder="e.g., Community Center"
                          value={point.name}
                          onChange={(e) =>
                            updateMidPoint(index, "name", e.target.value)
                          }
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`midpoint-lat-${index}`}>
                          Latitude *
                        </Label>
                        <Input
                          id={`midpoint-lat-${index}`}
                          type="number"
                          step="0.000001"
                          placeholder="e.g., 9.050"
                          value={point.lat || ""}
                          onChange={(e) =>
                            updateMidPoint(
                              index,
                              "lat",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`midpoint-lng-${index}`}>
                          Longitude *
                        </Label>
                        <Input
                          id={`midpoint-lng-${index}`}
                          type="number"
                          step="0.000001"
                          placeholder="e.g., 38.760"
                          value={point.lng || ""}
                          onChange={(e) =>
                            updateMidPoint(
                              index,
                              "lng",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    {formData.midPoints.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMidPoint(index)}
                        className="mt-7"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Mid-points validation warnings */}
              {formData.midPoints.some(
                (mp) => mp.lat === 0 || mp.lng === 0
              ) && (
                <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    ⚠️ Some mid-points have coordinates set to 0. Please enter
                    valid latitude and longitude values.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="mr-2">Loading...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </>
              ) : isEdit ? (
                "Update Route"
              ) : (
                "Create Route"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
