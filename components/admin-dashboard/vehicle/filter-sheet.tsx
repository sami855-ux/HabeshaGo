"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Filter, RefreshCw } from "lucide-react"
import { VehicleFilters, VehicleType, VehicleStatus } from "@/types/vehicle"

interface FilterSheetProps {
  filters: VehicleFilters
  onFiltersChange: (filters: Partial<VehicleFilters>) => void
  onReset: () => void
}

export default function FilterSheet({
  filters,
  onFiltersChange,
  onReset,
}: FilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleApplyFilters = () => {
    setIsOpen(false)
  }

  const handleReset = () => {
    onReset()
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Vehicles
          </SheetTitle>
          <SheetDescription>
            Filter vehicles by type, status, and activity
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-4">
          {/* Vehicle Type Filter */}
          <div className="space-y-3">
            <Label>Vehicle Type</Label>
            <Select
              value={filters.type || ""}
              onValueChange={(value) =>
                onFiltersChange({ type: (value as VehicleType) || undefined })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="BUS">Bus</SelectItem>
                <SelectItem value="MINIBUS">Minibus</SelectItem>
                <SelectItem value="VAN">Van</SelectItem>
                <SelectItem value="CAR">Car</SelectItem>
                <SelectItem value="TRUCK">Truck</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <Label>Status</Label>
            <Select
              value={filters.status || ""}
              onValueChange={(value) =>
                onFiltersChange({
                  status: (value as VehicleStatus) || undefined,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Active Status Filter */}
          <div className="space-y-3">
            <Label>Activity Status</Label>
            <Select
              value={
                filters.isActive === undefined
                  ? ""
                  : filters.isActive
                  ? "true"
                  : "false"
              }
              onValueChange={(value) => {
                if (value === "") {
                  onFiltersChange({ isActive: undefined })
                } else {
                  onFiltersChange({ isActive: value === "true" })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="true">Active Only</SelectItem>
                <SelectItem value="false">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Sort Options */}
          <div className="space-y-4">
            <Label>Sort By</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort-by" className="text-xs">
                  Field
                </Label>
                <Select
                  value={filters.sortBy || "plateNumber"}
                  onValueChange={(value) => onFiltersChange({ sortBy: value })}
                >
                  <SelectTrigger id="sort-by">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plateNumber">Plate Number</SelectItem>
                    <SelectItem value="capacity">Capacity</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="createdAt">Date Added</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort-order" className="text-xs">
                  Order
                </Label>
                <Select
                  value={filters.sortOrder || "asc"}
                  onValueChange={(value: "asc" | "desc") =>
                    onFiltersChange({ sortOrder: value })
                  }
                >
                  <SelectTrigger id="sort-order">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="flex flex-row sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2 flex-1"
          >
            <RefreshCw className="h-4 w-4" />
            Reset All
          </Button>
          <Button onClick={handleApplyFilters} className="flex-1">
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
