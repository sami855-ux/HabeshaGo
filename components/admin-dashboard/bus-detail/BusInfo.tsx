"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Phone,
  Route as RouteIcon,
  Clock,
  Map,
  Users,
} from "lucide-react"
import type { Bus } from "@/types/bus"

interface BusInfoProps {
  bus: Bus
  confirmedBookings: number
  availableSeats: number
}

export function BusInfo({
  bus,
  confirmedBookings,
  availableSeats,
}: BusInfoProps) {
  const occupancyRate = (confirmedBookings / bus.capacity) * 100

  return (
    <div className="space-y-6">
      {/* Driver Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Driver Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bus.driver ? (
            <>
              <div>
                <p className="text-2xl font-semibold">{bus.driver.name}</p>
                <p className="text-sm text-muted-foreground">
                  Driver ID: {bus.driver.id}
                </p>
              </div>
              {bus.driver.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>{bus.driver.phone}</span>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No driver assigned</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Information */}
      {bus.route && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RouteIcon className="h-5 w-5" />
              Route Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-lg font-semibold">{bus.route.name}</p>
              <p className="text-sm text-muted-foreground">
                {bus.route.origin} → {bus.route.destination}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              {bus.route.distanceKm && (
                <div>
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="text-lg font-semibold">
                    {bus.route.distanceKm} km
                  </p>
                </div>
              )}

              {bus.route.estimatedTimeMin && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Estimated Time
                  </p>
                  <p className="text-lg font-semibold">
                    {bus.route.estimatedTimeMin} min
                  </p>
                </div>
              )}
            </div>

            {bus.route.midPoints.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Stops ({bus.route.midPoints.length})
                </p>
                <div className="space-y-1">
                  {bus.route.midPoints.slice(0, 3).map((point, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                      <span className="text-sm">{point.name}</span>
                    </div>
                  ))}
                  {bus.route.midPoints.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{bus.route.midPoints.length - 3} more stops
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Seat Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Seat Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Occupancy</span>
              <span>{occupancyRate.toFixed(0)}%</span>
            </div>
            <Progress value={occupancyRate} className="h-2" />
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{bus.capacity}</p>
              <p className="text-xs text-muted-foreground">Total Seats</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {confirmedBookings}
              </p>
              <p className="text-xs text-muted-foreground">Booked</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-muted-foreground">
                {availableSeats}
              </p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>

          <div className="pt-2">
            <Badge variant="outline" className="w-full justify-center">
              {availableSeats > 0
                ? `${availableSeats} seats available`
                : "Fully Booked"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
