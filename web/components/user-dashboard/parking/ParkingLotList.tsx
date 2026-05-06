import { ParkingLot } from "@/types/parking"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  MapPin,
  Clock,
  DollarSign,
  Shield,
  Camera,
  Zap,
  Car,
  ParkingCircle,
  TrendingUp,
  Star,
  Navigation,
} from "lucide-react"

interface ParkingLotListProps {
  parkingLots: ParkingLot[]
  isLoading: boolean
  onLotSelect: (lot: ParkingLot) => void
  selectedLotId?: string
  compact?: boolean
  userLocation?: { lat: number; lng: number }
}

export function ParkingLotList({
  parkingLots,
  isLoading,
  onLotSelect,
  selectedLotId,
  compact = false,
  userLocation,
}: ParkingLotListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(compact ? 3 : 5)].map((_, i) => (
          <Card key={i} className="overflow-hidden border-0 shadow-sm">
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-32" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (parkingLots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="bg-gray-50 rounded-full p-4 mb-4">
          <ParkingCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No parking lots found
        </h3>
        <p className="text-sm text-gray-500">
          Try adjusting your search filters or location
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", compact ? "p-2" : "p-4")}>
      {parkingLots.map((lot, index) => {
        const availability = (lot.availableSlots / lot.totalSlots) * 100
        const isAvailable = availability > 20
        const isLowAvailability = availability <= 20 && availability > 0
        const isFull = availability === 0

        return (
          <Card
            key={lot.id}
            className={cn(
              "group relative overflow-hidden transition-all duration-200 cursor-pointer",
              "hover:shadow-md hover:border-gray-300",
              "border border-gray-100",
              selectedLotId === lot.id
                ? "ring-2 ring-blue-500 ring-offset-0 border-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent"
                : "bg-white",
              compact ? "p-3" : "p-4",
            )}
            onClick={() => onLotSelect(lot)}
          >
            {/* Availability indicator bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-100">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  isFull
                    ? "bg-red-500"
                    : isLowAvailability
                      ? "bg-yellow-500"
                      : "bg-green-500",
                )}
                style={{ width: `${availability}%` }}
              />
            </div>

            <div className="space-y-3">
              {/* Header Section */}
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {lot.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {lot.address}, {lot.city}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {lot.distance && (
                    <Badge
                      variant="secondary"
                      className="gap-1 text-xs font-medium"
                    >
                      <Navigation className="w-3 h-3" />
                      {lot.distance.toFixed(1)} km
                    </Badge>
                  )}
                  <div className="text-right">
                    <span className="text-xl font-bold text-gray-900">
                      ETB {(lot.pricePerMinute * 60).toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500">/hr</span>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md">
                  <Car className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-sm font-medium">
                    {lot.availableSlots}/{lot.totalSlots}
                  </span>
                  <span className="text-xs text-gray-500">spots</span>
                </div>

                {lot.rating && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">
                      {lot.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({lot.reviewCount || 0})
                    </span>
                  </div>
                )}

                {lot.openingTime && lot.closingTime && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-xs text-gray-700">
                      {new Date(lot.openingTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" - "}
                      {new Date(lot.closingTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Availability Message */}
              {!compact && (
                <div className="text-xs">
                  {isFull ? (
                    <span className="text-red-600 font-medium">
                      Full • No spots available
                    </span>
                  ) : isLowAvailability ? (
                    <span className="text-yellow-600 font-medium">
                      Limited availability • Hurry up!
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">
                      {lot.availableSlots} spots available
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
