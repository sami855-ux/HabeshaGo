"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Car,
  Edit,
  Trash2,
  ArrowLeft,
  Shield,
  Wrench,
  MapPin,
  User,
  Phone,
  Calendar,
  Gauge,
  Users,
  BadgeCheck,
  AlertCircle,
  Clock,
  MoreVertical,
  Tag,
  Factory,
  Navigation,
  FileText,
  BarChart3,
  Fuel,
  Settings,
  ChevronRight,
  Activity,
  Battery,
  Thermometer,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Vehicle, VehicleStatus, VehicleType } from "@/types/vehicle"
import VehicleFormDialog from "@/components/admin-dashboard/vehicle/vehicle-form-dialog"
import VehicleDeleteDialog from "@/components/admin-dashboard/vehicle/vehicle-delete-dialog"
import UpdateStatusSheet from "@/components/admin-dashboard/vehicle/update-status-sheet"
import UpdateMileageSheet from "@/components/admin-dashboard/vehicle/update-mileage-sheet"
import AssignDriverSheet from "@/components/admin-dashboard/vehicle/assign-driver-sheet"
import UnassignDriverSheet from "@/components/admin-dashboard/vehicle/unassign-driver-sheet"
import DriverHistoryCard from "@/components/admin-dashboard/vehicle/driver-history-card"
import VehicleStatsCard from "@/components/admin-dashboard/vehicle/vehicle-stats-card"
import { getVehicleById } from "@/services/vehicle.api"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()

  const vehicleId = params.vehicleId
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statusSheetOpen, setStatusSheetOpen] = useState(false)
  const [mileageSheetOpen, setMileageSheetOpen] = useState(false)
  const [assignDriverSheetOpen, setAssignDriverSheetOpen] = useState(false)
  const [unassignDriverSheetOpen, setUnassignDriverSheetOpen] = useState(false)

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const res = await getVehicleById(vehicleId)

        if (res) {
          setVehicle(res)
        } else {
          toast.error("Vehicle not found")
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error)
        toast.error("Failed to load vehicle details")
      } finally {
        setLoading(false)
      }
    }

    fetchVehicle()
  }, [vehicleId])

  const getStatusConfig = (status: VehicleStatus, isActive: boolean) => {
    if (!isActive) {
      return {
        label: "Inactive",
        icon: AlertCircle,
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        variant: "secondary" as const,
        bgGradient:
          "from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900",
      }
    }

    switch (status) {
      case "ACTIVE":
        return {
          label: "Active",
          icon: BadgeCheck,
          color:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          variant: "default" as const,
          bgGradient:
            "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
        }
      case "UNDER_MAINTENANCE":
        return {
          label: "Maintenance",
          icon: Wrench,
          color:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
          variant: "secondary" as const,
          bgGradient:
            "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
        }
      case "OUT_OF_SERVICE":
        return {
          label: "Out of Service",
          icon: Clock,
          color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
          variant: "destructive" as const,
          bgGradient:
            "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
        }
      case "INACTIVE":
        return {
          label: "Inactive",
          icon: AlertCircle,
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          variant: "secondary" as const,
          bgGradient:
            "from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20",
        }
      default:
        return {
          label: status,
          icon: Shield,
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
          variant: "outline" as const,
          bgGradient:
            "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
        }
    }
  }

  const getTypeIcon = (type: VehicleType) => {
    switch (type) {
      case "BUS":
        return <Users className="h-5 w-5" />
      case "MINIBUS":
        return <Car className="h-5 w-5" />
      case "VAN":
        return <Car className="h-5 w-5" />
      case "TRUCK":
        return <Car className="h-5 w-5" />
      default:
        return <Car className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: VehicleType) => {
    switch (type) {
      case "BUS":
        return "bg-purple-500"
      case "MINIBUS":
        return "bg-blue-500"
      case "VAN":
        return "bg-green-500"
      case "TRUCK":
        return "bg-amber-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid date"
      return date.toLocaleDateString()
    } catch (error) {
      return "Invalid date"
    }
  }

  const handleVehicleUpdate = (updatedVehicle: Vehicle) => {
    setVehicle(updatedVehicle)
    toast.success("Vehicle updated successfully")
  }

  const handleVehicleDelete = () => {
    toast.success("Vehicle deleted successfully")
    router.push("/vehicles")
  }

  const handleStatusUpdate = (newStatus: VehicleStatus) => {
    if (vehicle) {
      setVehicle({ ...vehicle, status: newStatus })
      const statusLabel = newStatus
        .replace("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase())
      toast.success(`Vehicle status updated to ${statusLabel}`)
    }
  }

  const handleMileageUpdate = (newMileage: number) => {
    if (vehicle) {
      setVehicle({ ...vehicle, mileage: newMileage })
      toast.success(`Mileage updated to ${newMileage.toLocaleString()} km`)
    }
  }

  const handleDriverAssign = (driverId: string) => {
    toast.success("Driver assigned successfully")
  }

  const handleDriverUnassign = () => {
    toast.success("Driver unassigned successfully")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full ml-auto" />
          </div>
          <div className="grid gap-6">
            <Skeleton className="h-72 w-full rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl opacity-20 blur-xl"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
              <Car className="h-12 w-12 mx-auto text-muted-foreground" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Vehicle Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            The vehicle you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => router.push("/vehicles")}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vehicles
          </Button>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(vehicle.status, true)
  const typeColor = getTypeColor(vehicle.type)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10 rounded-xl border-2 hover:border-primary/50 transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${typeColor}`}></div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {vehicle.plateNumber}
                </h1>
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                {vehicle.model} • {vehicle.manufacturer}
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary ml-2">
                  {vehicle.type}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              className={`${statusConfig.color} px-3 py-1.5 rounded-full font-medium border-0 shadow-sm`}
            >
              <statusConfig.icon className="h-3.5 w-3.5 mr-1.5" />
              {statusConfig.label}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl border-2 hover:border-primary/50 transition-all duration-200"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-xl shadow-xl border"
              >
                <DropdownMenuItem
                  onClick={() => setStatusSheetOpen(true)}
                  className="cursor-pointer py-3 rounded-lg"
                >
                  <Wrench className="mr-3 h-4 w-4" />
                  Update Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setMileageSheetOpen(true)}
                  className="cursor-pointer py-3 rounded-lg"
                >
                  <Gauge className="mr-3 h-4 w-4" />
                  Update Mileage
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setAssignDriverSheetOpen(true)}
                  className="cursor-pointer py-3 rounded-lg"
                >
                  <User className="mr-3 h-4 w-4" />
                  Assign Driver
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="cursor-pointer py-3 rounded-lg text-red-600 dark:text-red-400"
                >
                  <Trash2 className="mr-3 h-4 w-4" />
                  Delete Vehicle
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => setEditDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full sm:w-auto bg-muted/50 p-1 rounded-xl border">
            <TabsTrigger
              value="overview"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
            >
              <Car className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger
              value="drivers"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
            >
              <User className="h-4 w-4 mr-2" />
              Drivers
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Vehicle Information Card */}
              <Card className="lg:col-span-2 rounded-2xl border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
                        <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Vehicle Information
                    </CardTitle>
                    <Badge variant="outline" className="font-normal">
                      <Activity className="h-3 w-3 mr-1.5" />
                      Last updated: {formatDate(vehicle.updatedAt)}
                    </Badge>
                  </div>
                  <CardDescription>
                    Complete details and specifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Identification
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 mr-3">
                              <Tag className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Plate Number
                              </p>
                              <p className="font-semibold text-lg">
                                {vehicle.plateNumber}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 mr-3">
                              <Shield className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                VIN
                              </p>
                              <p className="font-mono text-sm font-semibold">
                                {vehicle.vin || "Not provided"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Specifications
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                            <div className="flex items-center mb-2">
                              <div className="p-1.5 rounded-md bg-white dark:bg-gray-800 mr-2">
                                {getTypeIcon(vehicle.type)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Type
                              </p>
                            </div>
                            <p className="font-semibold">{vehicle.type}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                            <div className="flex items-center mb-2">
                              <div className="p-1.5 rounded-md bg-white dark:bg-gray-800 mr-2">
                                <Factory className="h-4 w-4" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Manufacturer
                              </p>
                            </div>
                            <p className="font-semibold">
                              {vehicle.manufacturer || "N/A"}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                            <div className="flex items-center mb-2">
                              <div className="p-1.5 rounded-md bg-white dark:bg-gray-800 mr-2">
                                <Calendar className="h-4 w-4" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Year
                              </p>
                            </div>
                            <p className="font-semibold">
                              {vehicle.year || "N/A"}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                            <div className="flex items-center mb-2">
                              <div className="p-1.5 rounded-md bg-white dark:bg-gray-800 mr-2">
                                <Users className="h-4 w-4" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Capacity
                              </p>
                            </div>
                            <p className="font-semibold">
                              {vehicle.capacity} seats
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Status & Tracking
                        </h4>
                        <div className="space-y-4">
                          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-100 dark:border-blue-800/30">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-800/50 mr-2">
                                  <Gauge className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Current Mileage
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMileageSheetOpen(true)}
                                className="h-7 px-2 text-xs"
                              >
                                Update
                              </Button>
                            </div>
                            <p className="font-semibold text-2xl text-blue-600 dark:text-blue-400">
                              {(vehicle.mileage || 0).toLocaleString()} km
                            </p>
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>0 km</span>
                                <span>200,000 km</span>
                              </div>
                              <Progress
                                value={Math.min(
                                  ((vehicle.mileage || 0) / 200000) * 100,
                                  100,
                                )}
                                className="h-1.5"
                              />
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                            <div className="flex items-center mb-2">
                              <div className="p-1.5 rounded-md bg-white dark:bg-gray-800 mr-2">
                                <MapPin className="h-4 w-4" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                GPS Device
                              </p>
                            </div>
                            <p className="font-semibold">
                              {vehicle.gpsDeviceId || "Not assigned"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {(vehicle.ownerName || vehicle.ownerPhone) && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Owner Information
                          </h4>
                          <div className="space-y-3">
                            {vehicle.ownerName && (
                              <div className="flex items-center p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                                <Avatar className="h-8 w-8 mr-3">
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                    {vehicle.ownerName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Owner Name
                                  </p>
                                  <p className="font-semibold">
                                    {vehicle.ownerName}
                                  </p>
                                </div>
                              </div>
                            )}
                            {vehicle.ownerPhone && (
                              <div className="flex items-center p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 mr-3">
                                  <Phone className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Owner Phone
                                  </p>
                                  <p className="font-semibold">
                                    {vehicle.ownerPhone}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t bg-muted/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    View all details
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardFooter>
              </Card>

              {/* Quick Actions & Stats */}
              <div className="space-y-6">
                <VehicleStatsCard vehicle={vehicle} />

                <Card className="rounded-2xl border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
                        <Wrench className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start h-11 rounded-xl border-2 hover:border-primary/50 transition-all duration-200 group"
                            onClick={() => setStatusSheetOpen(true)}
                          >
                            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3 group-hover:scale-110 transition-transform">
                              <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            Update Status
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Change vehicle status</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start h-11 rounded-xl border-2 hover:border-primary/50 transition-all duration-200 group"
                            onClick={() => setMileageSheetOpen(true)}
                          >
                            <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 mr-3 group-hover:scale-110 transition-transform">
                              <Gauge className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            Update Mileage
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Update current mileage reading</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start h-11 rounded-xl border-2 hover:border-primary/50 transition-all duration-200 group"
                            onClick={() => setAssignDriverSheetOpen(true)}
                          >
                            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 mr-3 group-hover:scale-110 transition-transform">
                              <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            Assign Driver
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Assign a driver to this vehicle</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {vehicle.gpsDeviceId && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start h-11 rounded-xl border-2 hover:border-primary/50 transition-all duration-200 group"
                            >
                              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 mr-3 group-hover:scale-110 transition-transform">
                                <Navigation className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              Track Location
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Live GPS tracking</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <DriverHistoryCard vehicleId={vehicle.id} />
          </TabsContent>

          <TabsContent value="drivers">
            <Card className="rounded-2xl border-2 overflow-hidden shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/30 dark:from-blue-900/20 dark:to-blue-800/20">
                <CardTitle className="text-xl flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Driver Management
                </CardTitle>
                <CardDescription>
                  Assign and manage drivers for this vehicle
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-100 dark:border-green-800/30">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800">
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                            {vehicle.driver?.name
                              ? vehicle.driver.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()
                              : "?"}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <h4 className="font-semibold">Current Driver</h4>

                          {vehicle.driver ? (
                            <p className="text-sm text-muted-foreground">
                              {vehicle.driver.name} ·{" "}
                              {vehicle.driver.experience ?? 0} yrs experience
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No driver currently assigned
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setAssignDriverSheetOpen(true)}
                          className="rounded-xl border-2"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Assign Driver
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setUnassignDriverSheetOpen(true)}
                          disabled={!vehicle?.driver}
                          className="rounded-xl"
                        >
                          Unassign Driver
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium mb-2">
                      Driver Assignment History
                    </h4>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      View historical driver assignments, schedules, and
                      performance metrics for this vehicle.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="rounded-2xl border-2 overflow-hidden shadow-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/30 dark:from-purple-900/20 dark:to-purple-800/20">
                <CardTitle className="text-xl flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900">
                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Vehicle Analytics
                </CardTitle>
                <CardDescription>
                  Usage statistics and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Monthly Distance
                      </p>
                      <Activity className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold">2,847 km</p>
                    <p className="text-xs text-muted-foreground">
                      +12% from last month
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Fuel Efficiency
                      </p>
                      <Fuel className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold">8.2 km/L</p>
                    <p className="text-xs text-muted-foreground">
                      Optimal range
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Maintenance Score
                      </p>
                      <Battery className="h-4 w-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold">92%</p>
                    <p className="text-xs text-muted-foreground">
                      Excellent condition
                    </p>
                  </div>
                </div>
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800/30 dark:to-purple-900/30 flex items-center justify-center">
                    <BarChart3 className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">
                    Advanced Analytics Dashboard
                  </h4>
                  <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6">
                    Detailed analytics dashboard is coming soon. Track fuel
                    consumption, maintenance costs, and driver performance.
                  </p>
                  <Button variant="outline" className="rounded-xl">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Detailed Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals and Sheets */}
      {vehicle && vehicleId && (
        <>
          <VehicleFormDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            vehicle={vehicle}
            onSuccess={handleVehicleUpdate}
          />

          <VehicleDeleteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            vehicle={vehicle}
            onSuccess={handleVehicleDelete}
            vehicleId={vehicleId}
          />

          <UpdateStatusSheet
            open={statusSheetOpen}
            onOpenChange={setStatusSheetOpen}
            vehicle={vehicle}
            onSuccess={handleStatusUpdate}
            vehicleId={vehicleId}
          />

          <UpdateMileageSheet
            open={mileageSheetOpen}
            onOpenChange={setMileageSheetOpen}
            vehicle={vehicle}
            onSuccess={handleMileageUpdate}
            vehicleId={vehicleId}
          />

          <AssignDriverSheet
            open={assignDriverSheetOpen}
            onOpenChange={setAssignDriverSheetOpen}
            vehicle={vehicle}
            onSuccess={handleDriverAssign}
            vehicleId={vehicleId}
          />

          <UnassignDriverSheet
            open={unassignDriverSheetOpen}
            onOpenChange={setUnassignDriverSheetOpen}
            vehicle={vehicle}
            onSuccess={handleDriverUnassign}
            vehicleId={vehicleId}
          />
        </>
      )}
    </div>
  )
}
