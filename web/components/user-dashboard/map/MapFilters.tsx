"use client"

import { useQueryParams } from "@/hooks/useQueryParams"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Filter,
  Bus,
  Zap,
  ParkingCircle,
  MapPin,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function MapFilters() {
  const { getParam, setParam } = useQueryParams()
  const currentType = getParam("type") || "all"

  const filters = [
    {
      value: "all",
      label: "All Locations",
      icon: MapPin,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      count: 42, // You can make this dynamic
    },
    {
      value: "ev",
      label: "EV Charging",
      icon: Zap,
      color: "text-green-600",
      bgColor: "bg-green-100",
      count: 12,
    },
    {
      value: "parking",
      label: "Parking",
      icon: ParkingCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      count: 18,
    },
    {
      value: "bus",
      label: "Bus Stops",
      icon: Bus,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      count: 8,
    },
  ]

  const handleFilterChange = (value: string) => {
    setParam("type", value)
  }

  const currentFilter = filters.find((f) => f.value === currentType)
  const CurrentIcon = currentFilter?.icon

  return (
    <div className="flex items-center gap-2 w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex items-center gap-2 px-4 py-2 h-10 w-full",
              "border-2 hover:border-primary/50 transition-all",
              "shadow-sm hover:shadow-md",
              "bg-white/90 backdrop-blur-sm",
            )}
          >
            <div className={cn("p-1.5 rounded-full", currentFilter?.bgColor)}>
              {CurrentIcon && (
                <CurrentIcon
                  className={cn("h-3.5 w-3.5", currentFilter?.color)}
                />
              )}
            </div>
            <span className="font-medium">{currentFilter?.label}</span>
            <Badge
              variant="secondary"
              className="ml-1 bg-primary/10 text-primary text-xs font-semibold"
            >
              {currentFilter?.count}
            </Badge>
            <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-64 p-2 bg-white/95 backdrop-blur-sm border-2"
        >
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Filter locations by type
          </div>

          {filters.map((filter) => {
            const Icon = filter.icon
            const isActive = currentType === filter.value

            return (
              <DropdownMenuItem
                key={filter.value}
                onClick={() => handleFilterChange(filter.value)}
                className={cn(
                  "flex items-center justify-between px-2 py-2.5 rounded-lg mb-1",
                  "cursor-pointer transition-all duration-200",
                  "hover:bg-gray-100",
                  isActive && "bg-gray-100 border-l-4 border-primary",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-full",
                      filter.bgColor,
                      isActive && "ring-2 ring-offset-2 ring-primary/20",
                    )}
                  >
                    <Icon className={cn("h-4 w-4", filter.color)} />
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "font-medium",
                        isActive ? "text-primary" : "text-gray-700",
                      )}
                    >
                      {filter.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {filter.count} locations
                    </span>
                  </div>
                </div>

                {isActive && (
                  <Badge
                    variant="secondary"
                    className="bg-primary text-white text-xs font-semibold border-0"
                  >
                    Active
                  </Badge>
                )}
              </DropdownMenuItem>
            )
          })}

          <div className="mt-2 pt-2 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-primary"
              onClick={() => handleFilterChange("all")}
            >
              Clear all filters
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
