"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  RefreshCw,
  Bus,
  Users,
  User,
  Route as RouteIcon,
  MapPin,
  CheckCircle,
  AlertCircle,
  Hash,
  ChevronDown,
  Search,
  Clock,
  Award,
  Car,
  Fuel,
  Gauge,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { axiosInstance } from "@/services/axiosInstance"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

// Types matching your Prisma schema
interface BusFormData {
  busNumber: string
  capacity: number
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE"
  vehicleId?: number
  driverId?: string
  routeId?: number
  currentStop?: string
  nextDestination?: string
}

interface Driver {
  id: string
  name: string
  licenseNumber: string
  experience?: number
  status?: string
}

interface Route {
  id: number
  name: string
  origin: string
  destination: string
  distanceKm?: number
  estimatedTimeMin?: number
}

interface Vehicle {
  id: number
  plateNumber: string
  type: string
  model: string
  year?: number
  status?: string
}

interface BusFormProps {
  onSuccess: (busNumber: string) => void
  onError: (errorMessage: string) => void
  existingBusNumbers?: string[]
}

const busStatuses = [
  {
    value: "ACTIVE",
    label: "Active",
    description: "Available for service",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  {
    value: "INACTIVE",
    label: "Inactive",
    description: "Not in service",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: AlertCircle,
    iconColor: "text-gray-500",
  },
  {
    value: "MAINTENANCE",
    label: "Maintenance",
    description: "Under repair/service",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: AlertCircle,
    iconColor: "text-amber-500",
  },
] as const

// API Functions
export const getAllSimpleVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await axiosInstance.get("/vehicles")
    console.log("Vehicles response:", response.data)
    const data = response.data.map((vehicle: any) => ({
      id: vehicle.id,
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
      model: vehicle.model,
      year: vehicle.year ?? null,
      status: vehicle.status ?? "AVAILABLE",
    }))

    return data
  } catch (error: any) {
    console.error(
      "Error fetching vehicles:",
      error.response?.data || error.message
    )
    return []
  }
}

export const fetchAllDriversSimple = async (): Promise<Driver[]> => {
  try {
    const response = await axiosInstance.get("/drivers")
    return response.data.data.map((driver: any) => ({
      id: driver.id,
      name: driver.user?.name ?? "",
      licenseNumber: driver.licenseNo,
      experience: driver.experience ?? 0,
      status: driver.status,
    }))
  } catch (error: any) {
    console.error("Error fetching drivers:", error)
    return []
  }
}

export const fetchAllRoutesSimple = async (): Promise<Route[]> => {
  try {
    const response = await axiosInstance.get("/route")
    return response.data.data.map((route: any) => ({
      id: route.id,
      name: route.name,
      origin: route.origin,
      destination: route.destination,
      distanceKm: route.distanceKm ?? 0,
      estimatedTimeMin: route.estimatedTimeMin ?? 0,
    }))
  } catch (error: any) {
    console.error("Error fetching routes:", error)
    return []
  }
}

const FormSkeleton = () => {
  return (
    <div className={cn("space-y-6 p-4 bg-background rounded-xl")}>
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Bus Information Card Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Vehicle Assignment Card Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>

      {/* Additional Assignments Card Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-11 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>

        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    </div>
  )
}

const ComboboxSkeleton = () => (
  <div className="w-full h-11 bg-gray-200 rounded-md animate-pulse"></div>
)

export default function BusForm({
  onSuccess,
  onError,
  existingBusNumbers = [],
}: BusFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([])
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([])
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([])
  const [driverOpen, setDriverOpen] = useState(false)
  const [routeOpen, setRouteOpen] = useState(false)
  const [vehicleOpen, setVehicleOpen] = useState(false)
  const [driverSearch, setDriverSearch] = useState("")
  const [routeSearch, setRouteSearch] = useState("")
  const [vehicleSearch, setVehicleSearch] = useState("")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<BusFormData>({
    defaultValues: {
      busNumber: "",
      capacity: 40,
      status: "ACTIVE",
      vehicleId: undefined,
      driverId: undefined,
      routeId: undefined,
      currentStop: "",
      nextDestination: "",
    },
    mode: "onChange",
  })

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [drivers, routes, vehicles] = await Promise.all([
          fetchAllDriversSimple(),
          fetchAllRoutesSimple(),
          getAllSimpleVehicles(),
        ])

        setAvailableDrivers(drivers)
        setAvailableRoutes(routes)
        setAvailableVehicles(vehicles)
      } catch (error) {
        console.error("Error fetching form data:", error)
        onError("Failed to load form data. Please refresh the page.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [onError])

  const validateBusNumber = (value: string) => {
    if (!value.trim()) return "Bus number is required"
    if (value.length < 2) return "Bus number must be at least 2 characters"
    if (value.length > 20) return "Bus number must be less than 20 characters"
    if (existingBusNumbers.includes(value.toUpperCase())) {
      return "This bus number is already registered"
    }
    return true
  }

  const validateCapacity = (value: number) => {
    if (!value && value !== 0) return "Capacity is required"
    if (value < 1) return "Capacity must be at least 1"
    if (value > 200) return "Capacity cannot exceed 200"
    return true
  }

  const onSubmit = async (data: BusFormData) => {
    setIsSubmitting(true)

    try {
      // Prepare data for submission
      const submitData = {
        busNumber: data.busNumber,
        capacity: data.capacity,
        driverId: data.driverId,
        routeId: data.routeId,
        vehicleId: data.vehicleId,
        status: data.status,
      }

      // Make API call to create bus
      const response = await axiosInstance.post("/bus", submitData)

      if (response.data.success) {
        // Success callback
        onSuccess(data.busNumber)

        // Reset form
        reset({
          busNumber: "",
          capacity: 40,
          status: "ACTIVE",
          vehicleId: undefined,
          driverId: undefined,
          routeId: undefined,
          currentStop: "",
          nextDestination: "",
        })
        setDriverSearch("")
        setRouteSearch("")
        setVehicleSearch("")
      } else {
        toast.error(response.data.message || "Failed to create bus")
        // throw new Error(response.data.message || "Failed to create bus")
      }
    } catch (error: any) {
      console.error("Error creating bus:", error)
      // onError(
      //   error.response?.data?.message ||
      //     error.message ||
      //     "Failed to create bus. Please try again."
      // )
      toast.error(
        error.response?.data?.message ||
          "Failed to create bus. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    reset({
      busNumber: "",
      capacity: 40,
      status: "ACTIVE",
      vehicleId: undefined,
      driverId: undefined,
      routeId: undefined,
      currentStop: "",
      nextDestination: "",
    })
    setDriverSearch("")
    setRouteSearch("")
    setVehicleSearch("")
  }

  const selectedDriver = watch("driverId")
    ? availableDrivers.find((d) => d.id === watch("driverId"))
    : null

  const selectedRoute = watch("routeId")
    ? availableRoutes.find((r) => r.id === watch("routeId"))
    : null

  const selectedVehicle = watch("vehicleId")
    ? availableVehicles.find((v) => v.id === watch("vehicleId"))
    : null

  // Filter drivers based on search
  const filteredDrivers = availableDrivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(driverSearch.toLowerCase()) ||
      driver.experience?.toString().includes(driverSearch) ||
      driver.status?.toLowerCase().includes(driverSearch.toLowerCase())
  )

  // Filter routes based on search
  const filteredRoutes = availableRoutes.filter(
    (route) =>
      route.name.toLowerCase().includes(routeSearch.toLowerCase()) ||
      route.origin.toLowerCase().includes(routeSearch.toLowerCase()) ||
      route.destination.toLowerCase().includes(routeSearch.toLowerCase()) ||
      route.distanceKm?.toString().includes(routeSearch) ||
      route.estimatedTimeMin?.toString().includes(routeSearch)
  )

  // Filter vehicles based on search
  const filteredVehicles = availableVehicles.filter(
    (vehicle) =>
      vehicle.plateNumber.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      vehicle.year?.toString().includes(vehicleSearch)
  )

  const isFormValid =
    !errors.busNumber &&
    !errors.capacity &&
    watch("busNumber")?.trim() !== "" &&
    watch("capacity") > 0

  if (isLoading) {
    return <FormSkeleton />
  }

  return (
    <div className="space-y-6 p-2 bg-background rounded-xl">
      {/* Form Header */}
      <div className="relative">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full hover:bg-accent"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="sr-only">Back</span>
          </Button>

          {/* Header Content */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Bus className="h-8 w-8 text-primary" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold tracking-tight">Add New Bus</h2>
              <p className="text-muted-foreground">
                Register a new bus to your fleet management system
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Hash className="h-5 w-5 text-primary" />
              </div>
              Bus Information
            </CardTitle>
            <CardDescription>
              Enter the basic details of the bus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bus Number */}
              <div className="space-y-3">
                <Label htmlFor="busNumber" className="font-medium">
                  Bus Number *
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Bus className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="busNumber"
                    placeholder="e.g., BUS-1234"
                    className={cn(
                      "pl-10 h-11",
                      errors.busNumber && "border-destructive"
                    )}
                    {...register("busNumber", {
                      required: "Bus number is required",
                      validate: validateBusNumber,
                    })}
                    onChange={(e) => {
                      register("busNumber").onChange(e)
                      trigger("busNumber")
                    }}
                  />
                </div>
                {errors.busNumber ? (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.busNumber.message}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Unique identifier for this bus
                  </p>
                )}
              </div>

              {/* Capacity */}
              <div className="space-y-3">
                <Label htmlFor="capacity" className="font-medium">
                  Passenger Capacity *
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="e.g., 40"
                    min="1"
                    max="200"
                    className={cn(
                      "pl-10 h-11",
                      errors.capacity && "border-destructive"
                    )}
                    {...register("capacity", {
                      required: "Capacity is required",
                      min: { value: 1, message: "Minimum capacity is 1" },
                      max: { value: 200, message: "Maximum capacity is 200" },
                      valueAsNumber: true,
                      validate: validateCapacity,
                    })}
                  />
                </div>
                {errors.capacity ? (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.capacity.message}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Maximum number of passengers (1-200)
                  </p>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <Label htmlFor="status" className="font-medium">
                Status *
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {busStatuses.map((status) => {
                  const Icon = status.icon
                  const isSelected = watch("status") === status.value
                  return (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => setValue("status", status.value)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        isSelected
                          ? cn(
                              "border-primary bg-primary/10",
                              "dark:bg-primary/20 dark:border-primary/50",
                              "shadow-sm"
                            )
                          : cn(
                              "border-input bg-card hover:bg-accent",
                              "hover:border-accent-foreground/50",
                              "dark:hover:bg-accent/50 dark:border-border"
                            )
                      )}
                    >
                      <div
                        className={cn(
                          "p-2 rounded-full transition-colors",
                          isSelected
                            ? cn(
                                "bg-primary/20 dark:bg-primary/30",
                                "border border-primary/20 dark:border-primary/40"
                              )
                            : cn(
                                "bg-muted/50 dark:bg-muted",
                                "border border-muted-foreground/10 dark:border-border"
                              )
                        )}
                      >
                        <Icon className={cn("h-4 w-4", status.iconColor)} />
                      </div>
                      <div className="text-left">
                        <div
                          className={cn(
                            "font-medium",
                            isSelected
                              ? "text-foreground"
                              : "text-foreground/90"
                          )}
                        >
                          {status.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {status.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
              <input
                type="hidden"
                {...register("status", { required: "Status is required" })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Assignment */}
        <Card className="border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Car className="h-5 w-5 text-purple-500" />
              </div>
              Vehicle Assignment
            </CardTitle>
            <CardDescription>
              Select a vehicle to assign to this bus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="vehicleId" className="font-medium">
                Assign Vehicle (Optional)
              </Label>
              {isLoading ? (
                <ComboboxSkeleton />
              ) : (
                <Popover open={vehicleOpen} onOpenChange={setVehicleOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={vehicleOpen}
                      className="w-full justify-between h-11"
                    >
                      {selectedVehicle ? (
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-purple-500" />
                          <div className="text-left">
                            <div className="font-medium">
                              {selectedVehicle.plateNumber}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {selectedVehicle.model} • {selectedVehicle.type}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Car className="h-4 w-4" />
                          <span>Select a vehicle...</span>
                        </div>
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search vehicles by plate, model, type..."
                        value={vehicleSearch}
                        onValueChange={setVehicleSearch}
                        className="h-12 border-0 focus:ring-0"
                      />
                      <CommandList>
                        <CommandEmpty className="py-6 text-center text-sm">
                          No vehicle found for "{vehicleSearch}"
                        </CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value=""
                            onSelect={() => {
                              setValue("vehicleId", undefined)
                              setVehicleOpen(false)
                              setVehicleSearch("")
                            }}
                            className="cursor-pointer py-3"
                          >
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <span>No vehicle assigned</span>
                            </div>
                          </CommandItem>
                          {filteredVehicles.map((vehicle) => (
                            <CommandItem
                              key={vehicle.id}
                              value={vehicle.id.toString()}
                              onSelect={(currentValue) => {
                                setValue(
                                  "vehicleId",
                                  currentValue === vehicle.id.toString()
                                    ? vehicle.id
                                    : undefined
                                )
                                setVehicleOpen(false)
                                setVehicleSearch("")
                              }}
                              className="cursor-pointer py-3"
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                    <Car className="h-4 w-4 text-purple-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {vehicle.plateNumber}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {vehicle.model}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {vehicle.type}
                                      </Badge>
                                      {vehicle.year && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {vehicle.year}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  {vehicle.status &&
                                    vehicle.status !== "AVAILABLE" && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {vehicle.status}
                                      </Badge>
                                    )}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
              <p className="text-sm text-muted-foreground">
                Search by plate number, model, vehicle type, or fuel type
              </p>
              <input type="hidden" {...register("vehicleId")} />
            </div>

            {/* Selected Vehicle Preview */}
            {selectedVehicle && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-3">Selected Vehicle</h4>
                <div className="p-3 bg-card rounded-lg border">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Car className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-lg">
                            {selectedVehicle.plateNumber}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {selectedVehicle.model}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {selectedVehicle.type}
                          </Badge>
                          {selectedVehicle.status === "AVAILABLE" ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              {selectedVehicle.status}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {selectedVehicle.year && (
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">
                              Year
                            </div>
                            <div className="font-medium">
                              {selectedVehicle.year}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Other Assignments */}
        <Card className="border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              Additional Assignments
            </CardTitle>
            <CardDescription>
              Optional: Assign a driver and route to this bus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driver Assignment - ComboBox */}
              <div className="space-y-3">
                <Label htmlFor="driverId" className="font-medium">
                  Assign Driver (Optional)
                </Label>
                {isLoading ? (
                  <ComboboxSkeleton />
                ) : (
                  <Popover open={driverOpen} onOpenChange={setDriverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={driverOpen}
                        className="w-full justify-between h-11"
                      >
                        {selectedDriver ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <div className="text-left">
                              <div className="font-medium">
                                {selectedDriver.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {selectedDriver.licenseNumber} •{" "}
                                {selectedDriver.experience} yrs
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>Select a driver...</span>
                          </div>
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search drivers by name, license, or experience..."
                          value={driverSearch}
                          onValueChange={setDriverSearch}
                          className="h-12 border-0 focus:ring-0"
                        />
                        <CommandList>
                          <CommandEmpty className="py-6 text-center text-sm">
                            No driver found for "{driverSearch}"
                          </CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value=""
                              onSelect={() => {
                                setValue("driverId", undefined)
                                setDriverOpen(false)
                                setDriverSearch("")
                              }}
                              className="cursor-pointer py-3"
                            >
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>No driver assigned</span>
                              </div>
                            </CommandItem>
                            {filteredDrivers.map((driver) => (
                              <CommandItem
                                key={driver.id}
                                value={driver.id}
                                onSelect={(currentValue) => {
                                  setValue(
                                    "driverId",
                                    currentValue === driver.id
                                      ? driver.id
                                      : undefined
                                  )
                                  setDriverOpen(false)
                                  setDriverSearch("")
                                }}
                                className="cursor-pointer py-3"
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                      <User className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium">
                                        {driver.name}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {driver.licenseNumber}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {driver.experience && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        <Clock className="mr-1 h-3 w-3" />
                                        {driver.experience} yrs
                                      </Badge>
                                    )}
                                    {driver.status === "ACTIVE" ? (
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        Active
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        Inactive
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
                <p className="text-sm text-muted-foreground">
                  Search by name, license number, or experience
                </p>
                <input type="hidden" {...register("driverId")} />
              </div>

              {/* Route Assignment - ComboBox */}
              <div className="space-y-3">
                <Label htmlFor="routeId" className="font-medium">
                  Assign Route (Optional)
                </Label>
                {isLoading ? (
                  <ComboboxSkeleton />
                ) : (
                  <Popover open={routeOpen} onOpenChange={setRouteOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={routeOpen}
                        className="w-full justify-between h-11"
                      >
                        {selectedRoute ? (
                          <div className="flex items-center gap-2">
                            <RouteIcon className="h-4 w-4 text-green-500" />
                            <div className="text-left">
                              <div className="font-medium">
                                {selectedRoute.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {selectedRoute.origin} →{" "}
                                {selectedRoute.destination}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <RouteIcon className="h-4 w-4" />
                            <span>Select a route...</span>
                          </div>
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search routes by name, origin, destination, or distance..."
                          value={routeSearch}
                          onValueChange={setRouteSearch}
                          className="h-12 border-0 focus:ring-0"
                        />
                        <CommandList>
                          <CommandEmpty className="py-6 text-center text-sm">
                            No route found for "{routeSearch}"
                          </CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value=""
                              onSelect={() => {
                                setValue("routeId", undefined)
                                setRouteOpen(false)
                                setRouteSearch("")
                              }}
                              className="cursor-pointer py-3"
                            >
                              <div className="flex items-center gap-2">
                                <RouteIcon className="h-4 w-4 text-muted-foreground" />
                                <span>No route assigned</span>
                              </div>
                            </CommandItem>
                            {filteredRoutes.map((route) => (
                              <CommandItem
                                key={route.id}
                                value={route.id.toString()}
                                onSelect={(currentValue) => {
                                  setValue(
                                    "routeId",
                                    currentValue === route.id.toString()
                                      ? route.id
                                      : undefined
                                  )
                                  setRouteOpen(false)
                                  setRouteSearch("")
                                }}
                                className="cursor-pointer py-3"
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                                      <RouteIcon className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium">
                                        {route.name}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {route.origin} → {route.destination}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    {route.distanceKm && (
                                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {route.distanceKm} km
                                      </div>
                                    )}
                                    {route.estimatedTimeMin && (
                                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {route.estimatedTimeMin} min
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
                <p className="text-sm text-muted-foreground">
                  Search by route name, origin, destination, or distance
                </p>
                <input type="hidden" {...register("routeId")} />
              </div>
            </div>

            {/* Selected Assignments Preview */}
            {(selectedDriver || selectedRoute) && (
              <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-3">Selected Assignments</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDriver && (
                    <div className="p-3 bg-card rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {selectedDriver.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            License: {selectedDriver.licenseNumber}
                          </div>
                          {selectedDriver.experience && (
                            <div className="flex items-center gap-1 mt-1">
                              <Award className="h-3 w-3 text-amber-500" />
                              <span className="text-xs">
                                {selectedDriver.experience} years experience
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedRoute && (
                    <div className="p-3 bg-card rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <RouteIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {selectedRoute.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {selectedRoute.origin} → {selectedRoute.destination}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            {selectedRoute.distanceKm && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {selectedRoute.distanceKm} km
                              </span>
                            )}
                            {selectedRoute.estimatedTimeMin && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {selectedRoute.estimatedTimeMin} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="sticky bottom-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-none rounded-xl p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full animate-pulse",
                    isFormValid ? "bg-green-500" : "bg-amber-500"
                  )}
                />
                <span className="font-medium">
                  {isFormValid ? "Ready to submit" : "Required fields missing"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isFormValid
                  ? "All required fields are complete"
                  : "Please fill in bus number and capacity"}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting || isLoading}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting || isLoading}
                className="gap-2 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Create Bus
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
