import { Filter, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface FiltersSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  routeFilter: string
  setRouteFilter: (value: string) => void
  driverFilter: string
  setDriverFilter: (value: string) => void
  uniqueRoutes: string[]
  uniqueDrivers: string[]
  onClearAll: () => void
}

export default function FiltersSheet({
  open,
  onOpenChange,
  statusFilter,
  setStatusFilter,
  routeFilter,
  setRouteFilter,
  driverFilter,
  setDriverFilter,
  uniqueRoutes,
  uniqueDrivers,
  onClearAll,
}: FiltersSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[640px] px-4">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </SheetTitle>
          <SheetDescription>
            Apply filters to narrow down your bus list
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Status Filter */}
          <div className="space-y-3">
            <h3 className="font-medium">Status</h3>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="UNDER_MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Route Filter */}
          <div className="space-y-3">
            <h3 className="font-medium">Route</h3>
            <Select value={routeFilter} onValueChange={setRouteFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select route" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Routes</SelectItem>
                {uniqueRoutes.map((route) => (
                  <SelectItem key={route} value={route}>
                    Route {route}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Driver Filter */}
          <div className="space-y-3">
            <h3 className="font-medium">Driver</h3>
            <Select value={driverFilter} onValueChange={setDriverFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Drivers</SelectItem>
                {uniqueDrivers.map((driver) => (
                  <SelectItem key={driver} value={driver}>
                    {driver}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Active Filters Display */}
          <div className="space-y-3">
            <h3 className="font-medium">Active Filters</h3>
            <div className="flex flex-wrap gap-2">
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {routeFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Route: {routeFilter}
                  <button
                    onClick={() => setRouteFilter("all")}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {driverFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Driver: {driverFilter}
                  <button
                    onClick={() => setDriverFilter("all")}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {statusFilter === "all" &&
                routeFilter === "all" &&
                driverFilter === "all" && (
                  <p className="text-sm text-muted-foreground">
                    No active filters
                  </p>
                )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClearAll}
            className="flex-1"
            disabled={
              statusFilter === "all" &&
              routeFilter === "all" &&
              driverFilter === "all"
            }
          >
            Clear All
          </Button>
          <Button onClick={() => onOpenChange(false)} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
