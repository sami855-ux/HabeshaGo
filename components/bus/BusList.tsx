"use client"

import { useState } from "react"
import {
  Bus,
  Clock,
  Users,
  Star,
  Filter,
  TrendingUp,
  Zap,
  Shield,
  CheckCircle,
  MapPin,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface BusType {
  id: string
  operator: string
  busNumber: string
  type: string
  departure: string
  arrival: string
  duration: string
  totalSeats: number
  availableSeats: number
  rating: number
  reviews: number
  features: string[]
  routePoints: string[]
  busCondition: "excellent" | "good" | "average"
}

export function BusList() {
  const router = useRouter()
  const [buses, setBuses] = useState<BusType[]>([
    {
      id: "1",
      operator: "Express Travels",
      busNumber: "ET-7890",
      type: "AC Sleeper (2+1)",
      departure: "08:30",
      arrival: "13:45",
      duration: "5h 15m",
      totalSeats: 40,
      availableSeats: 12,
      rating: 4.5,
      reviews: 245,
      features: ["Live Tracking", "On-time", "Clean"],
      routePoints: ["NY Port Authority", "Newark", "Hartford", "Boston"],
      busCondition: "excellent",
    },
    {
      id: "2",
      operator: "City Connect",
      busNumber: "CC-4567",
      type: "Non-AC Seater (2+2)",
      departure: "09:15",
      arrival: "14:30",
      duration: "5h 15m",
      totalSeats: 45,
      availableSeats: 25,
      rating: 3.8,
      reviews: 189,
      features: [],
      routePoints: ["NY Downtown", "Stamford", "Boston South"],
      busCondition: "good",
    },
    {
      id: "3",
      operator: "Premium Coach",
      busNumber: "PC-1234",
      type: "AC Seater (2+2)",
      departure: "10:00",
      arrival: "15:15",
      duration: "5h 15m",
      totalSeats: 40,
      availableSeats: 8,
      rating: 4.2,
      reviews: 312,
      features: ["Live Tracking", "Clean"],
      routePoints: ["NY Port Authority", "New Haven", "Boston"],
      busCondition: "excellent",
    },
    {
      id: "4",
      operator: "Metro Express",
      busNumber: "ME-5678",
      type: "AC Sleeper (2+1)",
      departure: "11:30",
      arrival: "16:45",
      duration: "5h 15m",
      totalSeats: 36,
      availableSeats: 3,
      rating: 4.7,
      reviews: 156,
      features: ["Live Tracking", "Clean"],
      routePoints: ["NY Midtown", "Bridgeport", "Providence", "Boston"],
      busCondition: "excellent",
    },
  ])

  const [sortBy, setSortBy] = useState("departure")
  const [expandedBus, setExpandedBus] = useState<string | null>(null)

  const sortedBuses = [...buses].sort((a, b) => {
    switch (sortBy) {
      case "departure":
        return a.departure.localeCompare(b.departure)
      case "duration":
        return a.duration.localeCompare(b.duration)
      case "rating":
        return b.rating - a.rating
      case "seats":
        return b.availableSeats - a.availableSeats
      default:
        return 0
    }
  })

  const getBusConditionColor = (condition: BusType["busCondition"]) => {
    switch (condition) {
      case "excellent":
        return "text-green-600 bg-green-50 border-green-200"
      case "good":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "average":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
    }
  }

  const getBusConditionText = (condition: BusType["busCondition"]) => {
    switch (condition) {
      case "excellent":
        return "Excellent Condition"
      case "good":
        return "Good Condition"
      case "average":
        return "Average Condition"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-card border-none rounded-xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Available Buses</h2>
            <p className="text-muted-foreground mt-1">
              {buses.length} buses found •{" "}
              {buses.reduce((acc, bus) => acc + bus.availableSeats, 0)} seats
              available
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Sorting */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="departure">Departure Time</SelectItem>
                  <SelectItem value="duration">Travel Duration</SelectItem>
                  <SelectItem value="rating">Customer Rating</SelectItem>
                  <SelectItem value="seats">Available Seats</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Button Section */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="size-4" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>AC Buses Only</DropdownMenuItem>
                <DropdownMenuItem>Sleeper Buses Only</DropdownMenuItem>
                <DropdownMenuItem>Live Tracking</DropdownMenuItem>
                <DropdownMenuItem>High Rated (4.0+)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-green-600" />
              <span className="font-semibold">On-time Performance</span>
            </div>
            <p className="text-2xl font-bold mt-2">94%</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-blue-600" />
              <span className="font-semibold">Verified Operators</span>
            </div>
            <p className="text-2xl font-bold mt-2">100%</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Star className="size-4 text-yellow-600" />
              <span className="font-semibold">Avg. Rating</span>
            </div>
            <p className="text-2xl font-bold mt-2">4.3</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-purple-600" />
              <span className="font-semibold">Seat Availability</span>
            </div>
            <p className="text-2xl font-bold mt-2">High</p>
          </div>
        </div>
      </div>

      {/* Bus Cards */}
      <div className="space-y-4">
        {sortedBuses.map((bus) => (
          <Card
            key={bus.id}
            className={cn(
              "overflow-hidden border-none transition-all hover:shadow-md",
              expandedBus === bus.id && "ring-2 ring-primary/20"
            )}
          >
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Main Bus Info */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column - Bus Details */}
                  <div className="lg:col-span-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Bus className="size-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">
                              {bus.operator}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="secondary"
                                className="font-normal"
                              >
                                {bus.busNumber}
                              </Badge>
                              <Badge variant="outline">{bus.type}</Badge>
                              <Badge
                                variant="outline"
                                className={getBusConditionColor(
                                  bus.busCondition
                                )}
                              >
                                {getBusConditionText(bus.busCondition)}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "size-4",
                                  i < Math.floor(bus.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-muted text-muted"
                                )}
                              />
                            ))}
                          </div>
                          <span className="font-semibold">{bus.rating}</span>
                          <span className="text-muted-foreground text-sm">
                            ({bus.reviews} reviews)
                          </span>
                        </div>
                      </div>

                      {/* Quick Features */}
                      <div className="flex flex-wrap gap-2">
                        {bus.features.slice(0, 3).map((feature, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="gap-1 bg-muted/50"
                          >
                            <CheckCircle className="size-3" />
                            {feature}
                          </Badge>
                        ))}
                        {bus.features.length > 3 && (
                          <Badge variant="outline" className="bg-muted/50">
                            +{bus.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Schedule Bar */}
                    <div className="mt-6 bg-muted/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">
                            {bus.departure}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Departure
                          </div>
                        </div>

                        <div className="flex-1 px-6">
                          <div className="relative">
                            <div className="h-1 bg-border rounded-full"></div>
                            <div className="absolute inset-0 flex items-center justify-between px-2">
                              {bus.routePoints.map((point, index) => (
                                <div
                                  key={index}
                                  className="flex flex-col items-center"
                                >
                                  <div className="size-2 rounded-full bg-border"></div>
                                  <div className="text-xs text-muted-foreground mt-2 max-w-[80px] text-center truncate">
                                    {point}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-2 mt-4">
                            <Clock className="size-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {bus.duration}
                            </span>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">
                            {bus.arrival}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Arrival
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Actions */}
                  <div className="lg:col-span-4 border-l lg:pl-6">
                    <div className="space-y-4">
                      {/* Seat Availability */}
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Seat Availability</span>
                          <Badge
                            variant={
                              bus.availableSeats < 10
                                ? "destructive"
                                : "default"
                            }
                            className={
                              bus.availableSeats < 5 ? "animate-pulse" : ""
                            }
                          >
                            {bus.availableSeats < 10
                              ? "Filling Fast"
                              : "Available"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="size-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {bus.availableSeats} seats available
                          </span>
                          <span className="text-muted-foreground text-sm">
                            out of {bus.totalSeats}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="h-2 bg-border rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                bus.availableSeats > bus.totalSeats * 0.5
                                  ? "bg-green-500"
                                  : bus.availableSeats > bus.totalSeats * 0.2
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              )}
                              style={{
                                width: `${(bus.availableSeats / bus.totalSeats) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button
                          className="w-full cursor-pointer"
                          size="lg"
                          onClick={() =>
                            setExpandedBus(
                              expandedBus === bus.id ? null : bus.id
                            )
                          }
                        >
                          View Details
                          <ChevronRight
                            className={cn(
                              "ml-2 size-4 transition-transform",
                              expandedBus === bus.id && "rotate-90"
                            )}
                          />
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full cursor-pointer"
                          onClick={() => router.push("/user/payment")}
                        >
                          Book Bus
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedBus === bus.id && (
                  <div className="pt-6 border-t animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Route Details */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <MapPin className="size-4" />
                          Route Details
                        </h4>
                        <div className="space-y-2">
                          {bus.routePoints.map((point, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3"
                            >
                              <div
                                className={cn(
                                  "size-6 rounded-full flex items-center justify-center",
                                  index === 0
                                    ? "bg-primary/10 text-primary"
                                    : index === bus.routePoints.length - 1
                                      ? "bg-green-500/10 text-green-600"
                                      : "bg-muted"
                                )}
                              >
                                {index === 0
                                  ? "S"
                                  : index === bus.routePoints.length - 1
                                    ? "E"
                                    : index + 1}
                              </div>
                              <span className="font-medium">{point}</span>
                              {index < bus.routePoints.length - 1 && (
                                <ChevronRight className="size-4 text-muted-foreground ml-auto" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* All Features */}
                      <div>
                        <h4 className="font-semibold mb-3">Bus Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {bus.features.map((feature, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="gap-1.5 px-3 py-1.5"
                            >
                              <CheckCircle className="size-3" />
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sortedBuses.length === 0 && (
        <div className="text-center py-12">
          <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Bus className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No buses found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search criteria
          </p>
          <Button variant="outline" className="mt-4">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
