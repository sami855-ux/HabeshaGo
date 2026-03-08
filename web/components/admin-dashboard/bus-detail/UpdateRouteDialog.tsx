"use client"

import { useState } from "react"
import { Route as RouteIcon, RouteOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface SimpleRoute {
  id: number
  name: string
  origin: string
  destination: string
  distanceKm?: number
  estimatedTimeMin?: number
  price?: number
  currency?: string
}

interface Bus {
  id: number
  routeId?: number
  route?: SimpleRoute
}

interface UpdateRouteDialogProps {
  bus: Bus
  routes: SimpleRoute[]
  onUpdate: (routeId: number | null) => Promise<void>
}

export function UpdateRouteDialog({ bus, routes, onUpdate }: UpdateRouteDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState(bus.routeId?.toString() || "remove")

  const handleSubmit = async () => {
    try {
      setLoading(true)
      // Convert "remove" to null, otherwise use the route ID
      await onUpdate(selectedRoute === "remove" ? null : parseInt(selectedRoute))
      setOpen(false)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RouteIcon className="h-4 w-4 mr-2" />
          Change Route
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Bus Route</DialogTitle>
          <DialogDescription>
            Assign this bus to a different route or remove it from its current route.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {bus.route ? (
            <div className="space-y-2">
              <Label>Current Route</Label>
              <div className="p-3 border rounded-lg">
                <div className="font-medium">{bus.route.name}</div>
                <div className="text-sm text-muted-foreground">
                  {bus.route.origin} → {bus.route.destination}
                </div>
                <div className="flex gap-2 mt-2">
                  {bus.route.distanceKm && (
                    <Badge variant="outline">{bus.route.distanceKm} km</Badge>
                  )}
                  {bus.route.estimatedTimeMin && (
                    <Badge variant="outline">{bus.route.estimatedTimeMin} min</Badge>
                  )}
                  {bus.route.price && (
                    <Badge variant="outline">
                      {bus.route.currency} {bus.route.price}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 border rounded-lg">
              <p className="text-muted-foreground">No route currently assigned</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="route">Select New Route</Label>
            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a route">
                  {selectedRoute === "remove" ? "Remove Route" : 
                   routes.find(r => r.id.toString() === selectedRoute)?.name || "Select a route"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remove">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RouteOff className="h-4 w-4" />
                    Remove Route
                  </div>
                </SelectItem>
                {routes.map((route) => (
                  <SelectItem key={route.id} value={route.id.toString()}>
                    <div className="flex flex-col">
                      <span>{route.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {route.origin} → {route.destination}
                      </span>
                      <div className="flex gap-1 mt-1">
                        {route.distanceKm && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                            {route.distanceKm} km
                          </span>
                        )}
                        {route.price && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                            {route.currency} {route.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Note: Changing routes may affect scheduled trips. Review any upcoming schedules before making changes.
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : "Update Route"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}