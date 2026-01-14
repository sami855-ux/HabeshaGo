// app/operators-management/components/filter-sheet.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Filter, X, Calendar, RefreshCw } from "lucide-react"
import { Table } from "@tanstack/react-table"
import { Operator } from "@/types/operator"

interface FilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<Operator>
}

export default function FilterSheet({
  open,
  onOpenChange,
  table,
}: FilterSheetProps) {
  const handleResetFilters = () => {
    table.resetColumnFilters()
    table.resetGlobalFilter()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md px-4">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </SheetTitle>
          <SheetDescription>
            Filter operators by multiple criteria
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-4">
          {/* Status Filter */}
          <div className="space-y-3">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-2">
              {["ACTIVE", "OFFLINE", "SUSPENDED"].map((status) => {
                const isSelected = table
                  .getColumn("status")
                  ?.getFilterValue()
                  ?.includes(status)
                return (
                  <Button
                    key={status}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const filterValue =
                        (table
                          .getColumn("status")
                          ?.getFilterValue() as string[]) || []
                      const newFilter = isSelected
                        ? filterValue.filter((v) => v !== status)
                        : [...filterValue, status]
                      table
                        .getColumn("status")
                        ?.setFilterValue(
                          newFilter.length ? newFilter : undefined
                        )
                    }}
                  >
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Role Filter */}
          <div className="space-y-3">
            <Label>Role</Label>
            <div className="space-y-2">
              {[
                { value: "DRIVER", label: "Driver" },
                { value: "PARKING_OPERATOR", label: "Parking Operator" },
                { value: "EV_OPERATOR", label: "EV Operator" },
                { value: "STAFF", label: "Staff" },
              ].map((role) => (
                <div key={role.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role.value}`}
                    checked={table
                      .getColumn("role")
                      ?.getFilterValue()
                      ?.includes(role.value)}
                    onCheckedChange={(checked) => {
                      const filterValue =
                        (table
                          .getColumn("role")
                          ?.getFilterValue() as string[]) || []
                      const newFilter = checked
                        ? [...filterValue, role.value]
                        : filterValue.filter((v) => v !== role.value)
                      table
                        .getColumn("role")
                        ?.setFilterValue(
                          newFilter.length ? newFilter : undefined
                        )
                    }}
                  />
                  <Label
                    htmlFor={`role-${role.value}`}
                    className="text-sm font-normal"
                  >
                    {role.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Date Range */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Created Date Range
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="from-date" className="text-xs">
                  From
                </Label>
                <Input id="from-date" type="date" className="h-9" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-date" className="text-xs">
                  To
                </Label>
                <Input id="to-date" type="date" className="h-9" />
              </div>
            </div>
          </div>

          {/* Assignment Filter */}
          <div className="space-y-3">
            <Label>Assignment Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select assignment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                <SelectItem value="bus">Bus Routes</SelectItem>
                <SelectItem value="parking">Parking Areas</SelectItem>
                <SelectItem value="charging">Charging Stations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-3">
            <Label>Sort By</Label>
            <Select
              value={table.getState().sorting[0]?.id || "createdAt"}
              onValueChange={(value) => {
                table.setSorting([{ id: value, desc: true }])
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="role">Role</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="flex flex-row sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="gap-2 flex-1"
          >
            <RefreshCw className="h-4 w-4" />
            Reset All
          </Button>
          <SheetClose asChild>
            <Button className="flex-1">Apply Filters</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
