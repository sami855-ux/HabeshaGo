"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  CalendarDays,
  Users,
  MapPin,
  Clock,
  User,
  Phone,
  Route as RouteIcon,
  Navigation,
  Map,
  Bus as BusIcon,
} from "lucide-react"

// Dynamically import ALL leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
})
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
)

// Types based on the schema
type BusStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE"

type Driver = {
  id: string
  name: string
  phone?: string
}

type Booking = {
  id: number
  seatNumber: number
  status: "CONFIRMED" | "CANCELLED"
}

type BusPosition = {
  latitude: number
  longitude: number
  timestamp: Date
}

type RouteMidPoint = {
  name: string
  lat: number
  lng: number
}

type Route = {
  id: number
  name: string
  origin: string
  destination: string
  distanceKm?: number | null
  estimatedTimeMin?: number | null
  midPoints: RouteMidPoint[]
}

type Bus = {
  id: number
  busNumber: string
  capacity: number
  status: BusStatus
  isActive: boolean
  currentStop?: string | null
  nextDestination?: string | null
  createdAt: Date
  updatedAt: Date
  driver?: Driver | null
  route?: Route | null
  positions: BusPosition[]
  bookings: Booking[]
}

// Mock data
const MOCK_BUS: Bus = {
  id: 123,
  busNumber: "B-7892",
  capacity: 48,
  status: "ACTIVE",
  isActive: true,
  currentStop: "Downtown Plaza",
  nextDestination: "Central Station",
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-03-20T14:30:00"),
  driver: {
    id: "D001",
    name: "Michael Chen",
    phone: "+1 (555) 123-4567",
  },
  route: {
    id: 1,
    name: "Downtown Express",
    origin: "Westgate Terminal",
    destination: "Eastside Mall",
    distanceKm: 12.5,
    estimatedTimeMin: 45,
    midPoints: [
      { name: "City Center", lat: 40.7128, lng: -74.006 },
      { name: "River Park", lat: 40.758, lng: -73.9855 },
      { name: "University Campus", lat: 40.8075, lng: -73.9626 },
    ],
  },
  positions: [
    {
      latitude: 40.758896,
      longitude: -73.98513,
      timestamp: new Date("2024-03-20T14:30:00"),
    },
  ],
  bookings: [
    { id: 1, seatNumber: 1, status: "CONFIRMED" },
    { id: 2, seatNumber: 2, status: "CONFIRMED" },
    { id: 3, seatNumber: 3, status: "CONFIRMED" },
    { id: 4, seatNumber: 4, status: "CANCELLED" },
    { id: 5, seatNumber: 5, status: "CONFIRMED" },
    { id: 6, seatNumber: 15, status: "CONFIRMED" },
    { id: 7, seatNumber: 22, status: "CONFIRMED" },
    { id: 8, seatNumber: 30, status: "CONFIRMED" },
  ],
}

// Sub-component 1: BusHeader
function BusHeader({ bus }: { bus: Bus }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const statusConfig = {
    ACTIVE: {
      label: "Active",
      variant: "default" as const,
      color: "bg-green-100 text-green-800 border-green-200",
    },
    INACTIVE: {
      label: "Inactive",
      variant: "secondary" as const,
      color: "bg-gray-100 text-gray-800 border-gray-200",
    },
    MAINTENANCE: {
      label: "Maintenance",
      variant: "destructive" as const,
      color: "bg-red-100 text-red-800 border-red-200",
    },
  }

  const status = statusConfig[bus.status]

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <BusIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">
                Bus {bus.busNumber}
              </h1>
              <Badge variant={status.variant} className={`${status.color}`}>
                {status.label}
              </Badge>
              {bus.isActive && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-muted-foreground">Live</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Capacity: {bus.capacity} seats</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>Since {new Date(bus.createdAt).getFullYear()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-right">
            {bus.currentStop && bus.nextDestination && (
              <div className="flex items-center justify-end gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {bus.currentStop} → {bus.nextDestination}
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Updated {formatDate(bus.updatedAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Sub-component 3: BusInfo
function BusInfo({
  bus,
  confirmedBookings,
  availableSeats,
}: {
  bus: Bus
  confirmedBookings: number
  availableSeats: number
}) {
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

// Sub-component 2: BusMap (with proper Leaflet handling)
function BusMap({
  positions,
  route,
  currentStop,
}: {
  positions: BusPosition[]
  route?: Route | null
  currentStop?: string | null
}) {
  const [isMounted, setIsMounted] = useState(false)
  const [Leaflet, setLeaflet] = useState<any>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Dynamically import leaflet only on client side
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        // Fix for default icons
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "/leaflet/images/marker-icon-2x.png",
          iconUrl: "/leaflet/images/marker-icon.png",
          shadowUrl: "/leaflet/images/marker-shadow.png",
        })
        setLeaflet(L)
        setLeafletLoaded(true)
      })
    }
  }, [])

  const latestPosition = positions[0]

  if (!isMounted || !leafletLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!latestPosition) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted rounded-lg flex flex-col items-center justify-center gap-2">
            <Navigation className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No GPS data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Create bus icon using Leaflet divIcon
  const busIcon = Leaflet.divIcon({
    html: `
      <div style="
        background: #3b82f6;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"/>
          <path d="M15 6v6"/>
          <path d="M2 12h19.6"/>
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 7.8 19.1 7 18 7H4a2 2 0 0 0-2 2v10h3"/>
          <circle cx="7" cy="18" r="2"/>
          <path d="M9 18h5"/>
          <circle cx="16" cy="18" r="2"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: "custom-bus-icon",
  })

  // Create stop icon
  const stopIcon = Leaflet.divIcon({
    html: `
      <div style="
        background: #ef4444;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -20],
    className: "custom-stop-icon",
  })

  // Generate route points
  const routePoints: [number, number][] = []
  if (route) {
    const originCoords: [number, number] = [40.7128, -74.006]
    routePoints.push(originCoords)

    route.midPoints.forEach((mp) => {
      routePoints.push([mp.lat, mp.lng])
    })

    const destCoords: [number, number] = [40.758, -73.9855]
    routePoints.push(destCoords)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Live Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] rounded-lg overflow-hidden border">
          <MapContainer
            center={[latestPosition.latitude, latestPosition.longitude]}
            zoom={13}
            className="h-full w-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Bus Marker */}
            <Marker
              position={[latestPosition.latitude, latestPosition.longitude]}
              icon={busIcon}
            >
              <Popup>
                <div className="space-y-1">
                  <p className="font-medium">Bus Location</p>
                  <p className="text-sm text-muted-foreground">
                    {currentStop || "In transit"}
                  </p>
                  <p className="text-xs">
                    Updated:{" "}
                    {new Date(latestPosition.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Route Polyline */}
            {routePoints.length > 0 && (
              <Polyline
                pathOptions={{ color: "#3b82f6", weight: 4, opacity: 0.7 }}
                positions={routePoints}
              />
            )}

            {/* Route Stops */}
            {route?.midPoints.map((point, index) => (
              <Marker
                key={index}
                position={[point.lat, point.lng]}
                icon={stopIcon}
              >
                <Popup>
                  <div className="space-y-1">
                    <p className="font-medium">{point.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Stop {index + 1} on route
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span>Current Bus Position</span>
            </div>
            <div className="text-muted-foreground">
              Last GPS:{" "}
              {new Date(latestPosition.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {routePoints.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-0.5 bg-blue-500"></div>
              <span>
                Route: {route?.origin} → {route?.destination}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Main Page Component
export default function BusDetailPage() {
  const [loading, setLoading] = useState(true)
  const [bus, setBus] = useState<Bus | null>(null)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setBus(MOCK_BUS)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (loading || !bus) {
    return (
      <div className="container max-w-6xl py-8 space-y-8">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-[400px] bg-muted rounded-lg animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="h-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const confirmedBookings = bus.bookings.filter(
    (b) => b.status === "CONFIRMED"
  ).length
  const availableSeats = bus.capacity - confirmedBookings

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <BusHeader bus={bus} />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BusMap
            positions={bus.positions}
            route={bus.route}
            currentStop={bus.currentStop}
          />
        </div>
        <div>
          <BusInfo
            bus={bus}
            confirmedBookings={confirmedBookings}
            availableSeats={availableSeats}
          />
        </div>
      </div>
    </div>
  )
}
