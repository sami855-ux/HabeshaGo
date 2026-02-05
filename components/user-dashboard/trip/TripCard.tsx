import { useState } from "react"
import { Trip } from "@/types/trips"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Bus,
  User,
  CreditCard,
  Ticket,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react"
import { format } from "date-fns"
import { isTooCloseToDeparture } from "@/types/mockTrips"
import OrangeTicketSheet from "./TicketSheet"

interface TripCardProps {
  trip: Trip
  category: "upcoming" | "past"
}

export default function TripCard({ trip, category }: TripCardProps) {
  const [open, setOpen] = useState(false)
  const departureDate = new Date(trip.departureTime)
  const arrivalDate = new Date(trip.arrivalTime)

  const durationMs = arrivalDate.getTime() - departureDate.getTime()
  const durationHours = Math.round(durationMs / (1000 * 60 * 60))

  // Clean orange-themed status styling
  const statusConfig = {
    UPCOMING: {
      bg: "bg-orange-50",
      border: "border-l-4 border-l-orange-500",
      badge: "bg-orange-100 text-orange-800 border-orange-200",
      text: "text-orange-700",
    },
    COMPLETED: {
      bg: "bg-emerald-50",
      border: "border-l-4 border-l-emerald-500",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      text: "text-emerald-700",
    },
    CANCELLED: {
      bg: "bg-rose-50",
      border: "border-l-4 border-l-rose-500",
      badge: "bg-rose-100 text-rose-800 border-rose-200",
      text: "text-rose-700",
    },
  }

  const status = statusConfig[trip.status]

  const isCancellationDisabled =
    category === "upcoming" &&
    trip.status === "UPCOMING" &&
    isTooCloseToDeparture(trip.departureTime)

  return (
    <>
      <Card
        className={cn(
          "w-full transition-all duration-200 hover:shadow-md",
          "border border-gray-200 hover:border-orange-200",
          "bg-white",
        )}
      >
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            {/* Route Information */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {trip.originCity}
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    {trip.destinationCity}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">
                        {format(departureDate, "EEE, dd MMM")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        {format(departureDate, "hh:mm a")}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium">
                        {format(arrivalDate, "hh:mm a")}
                      </span>
                      <span className="text-gray-500 text-xs">
                        ({durationHours}h)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex sm:flex-col items-start sm:items-end gap-2">
              <Badge
                variant="outline"
                className={cn("font-semibold px-3 py-1", status.badge)}
              >
                {trip.status.charAt(0) + trip.status.slice(1).toLowerCase()}
              </Badge>

              {/* Price - Mobile visible */}
              <div className="sm:hidden flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span className="font-bold text-gray-900">
                  ETB {trip.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Trip Details */}
        <CardContent className="pb-4">
          <div className={cn("rounded-lg p-4", status.bg)}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Bus Operator */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-gray-100">
                  <Bus className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Bus</p>
                  <p className="font-semibold text-gray-900">{trip.busName}</p>
                </div>
              </div>

              {/* Seat Number */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-gray-100">
                  <User className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Seat</p>
                  <p className="font-semibold text-gray-900">
                    {trip.seatNumber}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-gray-100">
                  <Clock className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p className="font-semibold text-gray-900">
                    {durationHours}h
                  </p>
                </div>
              </div>

              {/* Price - Desktop */}
              <div className="hidden md:flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-gray-100">
                  <CreditCard className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fare</p>
                  <p className="font-semibold text-gray-900">
                    ETB {trip.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Actions */}
        <CardFooter className="pt-0 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="default"
                  size="lg"
                  className={cn(
                    "flex-1 h-12 gap-2 transition-all",
                    "bg-orange-600 hover:bg-orange-700",
                    "text-white hover:shadow-md",
                    "border-0",
                    "cursor-pointer",
                  )}
                >
                  <Ticket className="h-5 w-5" />
                  View E-Ticket
                </Button>
              </SheetTrigger>
              <OrangeTicketSheet trip={trip} />
            </Sheet>

            {category === "upcoming" && trip.status === "UPCOMING" ? (
              <Button
                variant="outline"
                size="lg"
                disabled={isCancellationDisabled}
                className={cn(
                  "flex-1 h-12 gap-2",
                  "cursor-pointer",
                  "border-gray-300 hover:border-rose-300",
                  isCancellationDisabled
                    ? "text-gray-500 hover:text-gray-500 hover:bg-gray-50"
                    : "text-rose-600 hover:text-rose-700 hover:bg-rose-50",
                )}
              >
                {isCancellationDisabled ? "Cancel Unavailable" : "Cancel Trip"}
              </Button>
            ) : category === "past" ? (
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "flex-1 h-12 gap-2",
                  "border-gray-300 text-gray-700 hover:text-gray-900",
                  "hover:border-gray-400 hover:bg-gray-50",
                  "cursor-pointer",
                )}
              >
                <Bus className="h-5 w-5" />
                Book Again
              </Button>
            ) : null}
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
