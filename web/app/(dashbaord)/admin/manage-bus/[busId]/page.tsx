"use client"

import { useState, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import { useParams, useRouter } from "next/navigation"
import {
  Bus as BusIcon,
  Users,
  MapPin,
  Clock,
  Calendar,
  Wrench,
  CheckCircle,
  AlertCircle,
  Gauge,
  Fuel,
  Settings,
  Edit,
  User,
  Route,
  Car,
  CalendarClock,
  Map,
  Navigation,
  Shield,
  Activity,
  MoreVertical,
  Phone,
  Mail,
  Star,
  ChevronRight,
  RefreshCw,
  Download,
  Printer,
  Share2,
  Bell,
  ShieldAlert,
  Layers,
  Loader2,
  ArrowLeft,
  Trash2,
  Plus,
  X,
  ChevronLeft,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Import components
import { StatusBadge } from "@/components/admin-dashboard/bus-detail/StatusBadge"
import { UpdateBusDialog } from "@/components/admin-dashboard/bus-detail/UpdateBusDialog"
import { UpdateDriverDialog } from "@/components/admin-dashboard/bus-detail/UpdateDriverDialog"
import { UpdateRouteDialog } from "@/components/admin-dashboard/bus-detail/UpdateRouteDialog"

// UI Components
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { fetchAllDriversSimple } from "@/services/driver.api"
import { fetchAllRoutesSimple } from "@/services/route.api"
import { getAllSimpleVehicles } from "@/services/vehicle.api"
import { getBusById, updateBus } from "@/services/bus.api"
import BusMap from "@/components/admin-dashboard/bus-detail/SingleBusMap"

// Types
interface SimpleDriver {
  id: string
  name: string
  licenseNo: string
  status: string
  phone?: string
  email?: string
  rating?: number
}

interface SimpleRoute {
  id: number
  name: string
  origin: string
  destination: string
  distanceKm?: number
  estimatedTimeMin?: number
  price?: number
  currency?: string
}

interface SimpleVehicle {
  id: number
  plateNumber: string
  model: string
  manufacturer?: string
  year?: number
  capacity: number
  status: string
  mileage?: number
  // 🚨 ERROR PRONE: we might need locations array from vehicle object
  locations?: Array<{
    id: number
    vehicleId: number
    lat: number
    lng: number
    accuracy?: number
    heading?: number
    speed?: number
    recordedAt: string
  }>
}

interface Bus {
  id: number
  busNumber: string
  capacity: number
  status: string
  driverId?: string
  routeId?: number
  vehicleId?: number
  currentStop?: string
  nextDestination?: string
  isActive: boolean
  departureTime?: string
  estimatedArrival?: string
  delayMinutes: number
  lastServiceDate?: string
  nextServiceDate?: string
  reservedSeats: number
  availableSeats?: number
  createdAt: string
  updatedAt: string
  driver?: SimpleDriver
  route?: SimpleRoute
  vehicle?: SimpleVehicle & { locations?: any[] } // 💣 allow locations
  schedules?: any[]
  seats?: any[]
}

// Occupancy indicator component
const OccupancyIndicator = ({ bus }: { bus: Bus }) => {
  const occupied = bus.reservedSeats || 0
  const total = bus.capacity || 78
  const percentage = total > 0 ? (occupied / total) * 100 : 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Occupancy</span>
        </div>
        <span className="font-bold text-lg">
          {occupied}/{total}
        </span>
      </div>
      <Progress value={percentage} className="h-3" />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Available: {total - occupied}</span>
        <span>{Math.round(percentage)}% occupied</span>
      </div>
    </div>
  )
}

// Service status component
const ServiceStatus = ({ bus }: { bus: Bus }) => {
  const today = new Date()
  const lastService = bus.lastServiceDate
    ? new Date(bus.lastServiceDate)
    : new Date()
  const nextService = bus.nextServiceDate
    ? new Date(bus.nextServiceDate)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const daysUntilService = Math.ceil(
    (nextService.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Service Status</h4>
        {daysUntilService <= 0 ? (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
            Service Due
          </Badge>
        ) : daysUntilService <= 7 ? (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Soon: {daysUntilService}d
          </Badge>
        ) : (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            OK: {daysUntilService}d
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Last Service</div>
              <div className="font-medium">
                {format(lastService, "MMM d, yyyy")}
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.ceil(
                  (today.getTime() - lastService.getTime()) /
                    (1000 * 60 * 60 * 24),
                )}{" "}
                days ago
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Next Service</div>
              <div className="font-medium">
                {format(nextService, "MMM d, yyyy")}
              </div>
              <div className="text-xs text-muted-foreground">
                in {daysUntilService} days
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Driver card component
const DriverCard = ({ driver }: { driver: SimpleDriver }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border-2 border-primary/10">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`}
          />
          <AvatarFallback>
            {driver.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-lg">{driver.name}</h4>
              <p className="text-sm text-muted-foreground">
                License: {driver.licenseNo}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{driver.rating || 4.5}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <StatusBadge status={driver.status} />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="font-medium">{driver.phone || "N/A"}</div>
            </div>
          </div>

          {driver.phone && (
            <div className="flex items-center gap-4 pt-2">
              <a
                href={`tel:${driver.phone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
              {driver.email && (
                <a
                  href={`mailto:${driver.email}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function BusDetailsPage() {
  const params = useParams()
  const router = useRouter()

  const busId = params.busId
  const [bus, setBus] = useState<Bus | null>(null)
  const [drivers, setDrivers] = useState<SimpleDriver[]>([])
  const [routes, setRoutes] = useState<SimpleRoute[]>([])
  const [vehicles, setVehicles] = useState<SimpleVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  // 💣 location state: can be from socket OR from bus.vehicle.locations fallback
  const [location, setLocation] = useState<any>(null)
  const socketRef = useRef<any>(null)

  // 🚨 ERROR PRONE: fetch bus data and THEN derive initial location from vehicle.locations
  useEffect(() => {
    fetchBusData()
  }, [busId])

  // 🔥 NEW EFFECT: after bus loads, set initial location from vehicle.locations (if socket null/empty)
  useEffect(() => {
    if (bus?.vehicle?.locations && bus.vehicle.locations.length > 0) {
      // 💣 assume last index is latest (may not be sorted)
      const latest = bus.vehicle.locations[bus.vehicle.locations.length - 1]
      if (latest?.lat && latest?.lng) {
        console.log("📍 Using fallback location from vehicle.locations", latest)
        setLocation(latest)
        toast.info("Using last known location from vehicle history")
      }
    }
  }, [bus?.vehicle?.locations])

  // 🚨 SOCKET effect: overwrites location when realtime data arrives
  useEffect(() => {
    if (!bus?.vehicleId) return

    const s = io("http://localhost:5000")
    socketRef.current = s

    const vehicleId = bus.vehicleId

    console.log("Joining vehicle room:", vehicleId)

    s.emit("joinVehicle", vehicleId)

    s.on("vehicle:location", (loc) => {
      console.log("📡 vehicle Info from socket", loc)
      setLocation(loc) // 💣 overwrites fallback, good
    })

    return () => {
      console.log("Leaving vehicle room:", vehicleId)

      s.emit("leaveVehicle", vehicleId)
      s.disconnect()
      socketRef.current = null
    }
  }, [bus?.vehicleId])

  const fetchBusData = async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel
      const [driversData, routesData, vehiclesData, busData] =
        await Promise.all([
          fetchAllDriversSimple(),
          fetchAllRoutesSimple(),
          getAllSimpleVehicles(),
          getBusById(busId),
        ])

      console.log("🚌 Bus data received:", busData)

      setDrivers(driversData)
      setRoutes(routesData)
      setVehicles(vehiclesData)
      setBus(busData)

      // 💣 also try to set location from busData if it has vehicle.locations
      if (busData?.vehicle?.locations?.length > 0) {
        const latest = busData.vehicle.locations[busData.vehicle.locations.length - 1]
        if (latest?.lat && latest?.lng) {
          setLocation(latest)
        }
      }
    } catch (error) {
      toast.error("Failed to load bus data")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBus = async (data: any) => {
    console.log(data)
    try {
      // API call to update bus
      const res = await updateBus(busId, data)
      if (res.success) {
        toast.success("Bus updated successfully")
      } else {
        toast.error(res.message)
      }
      setBus((prev) => (prev ? { ...prev, ...data } : null))
    } catch (error) {
      toast.error("Failed to update bus")
    }
  }

  const handleUpdateDriver = async (driverId: string | null) => {
    try {
      const res = await updateBus(busId, {
        driverId,
      })
      if (res.success) {
        const selectedDriver = drivers.find((d) => d.id === driverId)
        setBus((prev) =>
          prev
            ? {
                ...prev,
                driverId,
                driver: selectedDriver,
              }
            : null,
        )
        toast.success("Driver updated successfully")
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      toast.error("Failed to update driver")
    }
  }

  const handleUpdateRoute = async (routeId: number | null) => {
    try {
      const res = await updateBus(busId, {
        routeId,
      })
      if (res.success) {
        const selectedRoute = routes.find((r) => r.id === routeId)
        setBus((prev) =>
          prev
            ? {
                ...prev,
                routeId,
                route: selectedRoute,
              }
            : null,
        )
        toast.success("Route updated successfully")
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      toast.error("Failed to update route")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading bus details...</p>
        </div>
      </div>
    )
  }

  if (!bus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BusIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h2 className="text-2xl font-bold mb-2">Bus not found</h2>
          <p className="text-muted-foreground mb-4">
            The requested bus could not be found.
          </p>
          <Button>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-xl  flex items-center justify-center"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {bus.busNumber}
              </h1>
              <p className="text-muted-foreground">
                Vehicle #{bus.vehicleId} • Added{" "}
                {format(new Date(bus.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <UpdateBusDialog bus={bus} onUpdate={handleUpdateBus} />
          <UpdateDriverDialog
            bus={bus}
            drivers={drivers}
            onUpdate={handleUpdateDriver}
          />
          <UpdateRouteDialog
            bus={bus}
            routes={routes}
            onUpdate={handleUpdateRoute}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setActiveTab("schedules")}>
                <CalendarClock className="h-4 w-4 mr-2" />
                View Schedule
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="h-4 w-4 mr-2" />
                Print Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Bus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={cn(
          "rounded-lg border p-4",
          bus.status === "ACTIVE"
            ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/10"
            : bus.status === "UNDER_MAINTENANCE"
              ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/10"
              : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/10",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {bus.status === "ACTIVE" ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : bus.status === "UNDER_MAINTENANCE" ? (
              <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <div>
              <h3 className="font-semibold">
                {bus.status === "ACTIVE"
                  ? "Bus is Active"
                  : bus.status === "UNDER_MAINTENANCE"
                    ? "Under Maintenance"
                    : "Bus is out of service"}
              </h3>
              <p className="text-sm opacity-80">
                {bus.status === "ACTIVE"
                  ? "Operating normally"
                  : bus.status === "UNDER_MAINTENANCE"
                    ? "Scheduled for service"
                    : "Not in service"}
              </p>
            </div>
          </div>
          <StatusBadge status={bus.status} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="driver">Driver</TabsTrigger>
          <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Route Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    Route Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bus.route ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold">
                            {bus.route.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {bus.route.distanceKm} km
                            </Badge>
                            <Badge variant="outline">
                              {bus.route.estimatedTimeMin} min
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 dark:bg-green-900/20"
                            >
                              {bus.route.currency} {bus.route.price}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("actions")}
                        >
                          Change Route
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Origin</div>
                            <div className="text-muted-foreground">
                              {bus.route.origin}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Destination</div>
                            <div className="text-muted-foreground">
                              {bus.route.destination}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Route className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No route assigned</p>
                      <Button
                        variant="outline"
                        className="mt-3"
                        onClick={() => setActiveTab("actions")}
                      >
                        Assign Route
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Real-time Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Real-time Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Current Status
                      </div>
                      <div className="font-medium text-lg">
                        {bus.currentStop || "Not in service"}
                      </div>
                      {bus.departureTime && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Departed:{" "}
                          {format(new Date(bus.departureTime), "HH:mm")}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Next Destination
                      </div>
                      <div className="font-medium text-lg">
                        {bus.nextDestination || "Not set"}
                      </div>
                      {bus.estimatedArrival && (
                        <div className="text-sm text-muted-foreground mt-1">
                          ETA: {format(new Date(bus.estimatedArrival), "HH:mm")}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Delay Status
                      </div>
                      <div className="flex items-center gap-2">
                        {bus.delayMinutes > 0 ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <span className="font-medium text-amber-600">
                              {bus.delayMinutes} min delay
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-green-600">
                              On time
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        GPS Tracking
                      </div>
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          {bus.vehicle?.status === "ACTIVE"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Occupancy Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Seat Occupancy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OccupancyIndicator bus={bus} />
                </CardContent>
              </Card>

              {/* Service Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ServiceStatus bus={bus} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Driver Tab */}
        <TabsContent value="driver" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Driver Information</h2>
            <UpdateDriverDialog
              bus={bus}
              drivers={drivers}
              onUpdate={handleUpdateDriver}
            />
          </div>

          {bus.driver ? (
            <DriverCard driver={bus.driver} />
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Driver Assigned
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    This bus doesn't have a driver assigned yet.
                  </p>
                  <UpdateDriverDialog
                    bus={bus}
                    drivers={drivers}
                    onUpdate={handleUpdateDriver}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Vehicle Tab */}
        <TabsContent value="vehicle" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Vehicle Information</h2>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Vehicle
            </Button>
          </div>

          {bus.vehicle ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-lg">
                        {bus.vehicle.manufacturer} {bus.vehicle.model}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        {bus.vehicle.year && (
                          <Badge variant="outline">{bus.vehicle.year}</Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="bg-blue-50 dark:bg-blue-900/20"
                        >
                          {bus.vehicle.plateNumber}
                        </Badge>
                      </div>
                    </div>
                    <StatusBadge status={bus.vehicle.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Capacity
                      </div>
                      <div className="font-medium">
                        {bus.vehicle.capacity} seats
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Mileage
                      </div>
                      <div className="font-medium">
                        {bus.vehicle.mileage?.toLocaleString() || "N/A"} km
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Car className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Vehicle Assigned
                  </h3>
                  <p className="text-muted-foreground">
                    This bus doesn't have a vehicle assigned yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

       {/* 🗺️ MAP TAB - with fallback to vehicle.locations */}
<TabsContent value="map" className="space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-2xl font-bold">Live Tracking</h2>
    <div className="flex items-center gap-2">
      <Badge variant={socketRef.current ? "default" : "outline"} 
             className={cn(socketRef.current ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800")}>
        {socketRef.current ? "🟢 Live" : "🟡 Historical"}
      </Badge>
      {!socketRef.current && bus?.vehicle?.locations && (
        <Badge variant="outline">
          📍 {bus.vehicle.locations.length} points
        </Badge>
      )}
    </div>
  </div>
  
  {/* 💣 ERROR PRONE: location can be null, BusMap must handle undefined */}
  <BusMap 
    location={location} 
    busVehicleLocations={bus?.vehicle?.locations || []} 
    busNumber={bus?.busNumber}
  />
  
  <div className="text-xs text-muted-foreground flex justify-between">
    <span>
      {location || (bus?.vehicle?.locations?.length > 0) ? (
        <>
          📍 Bus {bus?.busNumber} - {
            (location || bus?.vehicle?.locations?.[bus.vehicle.locations.length - 1])?.lat?.toFixed(6)
          }, {
            (location || bus?.vehicle?.locations?.[bus.vehicle.locations.length - 1])?.lng?.toFixed(6)
          }
          {(location || bus?.vehicle?.locations?.[bus.vehicle.locations.length - 1])?.speed && 
            ` • ${(location || bus?.vehicle?.locations?.[bus.vehicle.locations.length - 1]).speed} km/h`
          }
        </>
      ) : (
        "📍 No location data available"
      )}
    </span>
    <span>
      {socketRef.current ? "🔌 Socket connected" : "🔌 Socket idle"}
    </span>
  </div>
</TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <h2 className="text-2xl font-bold">Management Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Update Bus
                </CardTitle>
                <CardDescription>Modify bus details and status</CardDescription>
              </CardHeader>
              <CardContent>
                <UpdateBusDialog bus={bus} onUpdate={handleUpdateBus} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Driver Management
                </CardTitle>
                <CardDescription>Assign or change drivers</CardDescription>
              </CardHeader>
              <CardContent>
                <UpdateDriverDialog
                  bus={bus}
                  drivers={drivers}
                  onUpdate={handleUpdateDriver}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Route Management
                </CardTitle>
                <CardDescription>Change bus route assignment</CardDescription>
              </CardHeader>
              <CardContent>
                <UpdateRouteDialog
                  bus={bus}
                  routes={routes}
                  onUpdate={handleUpdateRoute}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}