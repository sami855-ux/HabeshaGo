"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Badge } from "../ui/badge"
import { ChargingStation } from "@/types/ev"

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: any;
  onApplyFilters: (filters: any) => void;
  stations: ChargingStation[];
}

export function FilterSheet({
  open,
  onOpenChange,
  filters,
  onApplyFilters,
  stations,
}: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const uniqueCities = Array.from(new Set(stations.map(s => s.city).filter(Boolean)));

  const handleApply = () => {
    onApplyFilters(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalFilters({
      status: "all",
      city: "all",
      search: "",
      minRevenue: 0,
      maxRevenue: 10000,
      verified: false,
    });
    setDateRange({ from: undefined, to: undefined });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto p-3">
        <SheetHeader>
          <SheetTitle>Filter Stations</SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search</Label>
            <Input
              placeholder="Search by name or address..."
              value={localFilters.search || ""}
              onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={localFilters.status}
              onValueChange={(value) => setLocalFilters({ ...localFilters, status: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City Filter */}
          <div className="space-y-2">
            <Label>City</Label>
            <Select
              value={localFilters.city}
              onValueChange={(value) => setLocalFilters({ ...localFilters, city: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {uniqueCities.map((city) => (
                  <SelectItem key={city} value={city || ""}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Created Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={setDateRange as any}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Revenue Range */}
          <div className="space-y-4">
            <Label>Revenue Range (Today)</Label>
            <div className="pt-2">
              <Slider
                defaultValue={[0, 10000]}
                max={10000}
                step={100}
                onValueChange={(value) => {
                  setLocalFilters({
                    ...localFilters,
                    minRevenue: value[0],
                    maxRevenue: value[1],
                  });
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                ETB {localFilters.minRevenue || 0}
              </span>
              <span className="text-sm text-muted-foreground">
                ETB {localFilters.maxRevenue || 10000}
              </span>
            </div>
          </div>

          {/* Verified Only */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={localFilters.verified}
              onCheckedChange={(checked) =>
                setLocalFilters({ ...localFilters, verified: checked })
              }
            />
            <Label htmlFor="verified">Show verified stations only</Label>
          </div>

          {/* Active Filters Summary */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {localFilters.status !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {localFilters.status}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setLocalFilters({ ...localFilters, status: "all" })}
                  />
                </Badge>
              )}
              {localFilters.city !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  City: {localFilters.city}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setLocalFilters({ ...localFilters, city: "all" })}
                  />
                </Badge>
              )}
              {dateRange.from && (
                <Badge variant="secondary" className="gap-1">
                  Date Range
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setDateRange({ from: undefined, to: undefined })}
                  />
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleReset}>
              Reset All
            </Button>
            <Button className="flex-1" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}