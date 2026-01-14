"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Navigation,
  CheckCircle,
  AlertCircle,
  Hash,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

// Types matching your Prisma schema
interface BusFormData {
  busNumber: string
  capacity: number
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE"
  driverId?: string
  routeId?: number
  currentStop?: string
  nextDestination?: string
}

interface BusFormProps {
  onSuccess: (busNumber: string) => void
  onError: (errorMessage: string) => void
  existingBusNumbers?: string[]
  availableDrivers?: Array<{
    id: string
    name: string
    licenseNumber: string
  }>
  availableRoutes?: Array<{
    id: number
    name: string
    code: string
  }>
}

// Default mock data
const defaultDrivers = [
  { id: "1", name: "John Smith", licenseNumber: "DL12345" },
  { id: "2", name: "Sarah Johnson", licenseNumber: "DL67890" },
  { id: "3", name: "Michael Chen", licenseNumber: "DL54321" },
]

const defaultRoutes = [
  { id: 1, name: "Downtown Express", code: "DX101" },
  { id: 2, name: "University Shuttle", code: "US202" },
  { id: 3, name: "Airport Express", code: "AE303" },
]

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

// Special value for empty selection
const UNSELECTED = "unselected"

export default function BusForm({
  onSuccess,
  onError,
  existingBusNumbers = [],
  availableDrivers = defaultDrivers,
  availableRoutes = defaultRoutes,
}: BusFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      driverId: undefined,
      routeId: undefined,
      currentStop: "",
      nextDestination: "",
    },
    mode: "onChange",
  })

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
      // Prepare data for submission - convert special values back to undefined
      const submitData = {
        ...data,
        driverId: data.driverId === UNSELECTED ? undefined : data.driverId,
        routeId:
          data.routeId?.toString() === UNSELECTED ? undefined : data.routeId,
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Submitting bus data:", submitData)

      // Success callback
      onSuccess(data.busNumber)

      // Reset form
      reset({
        busNumber: "",
        capacity: 40,
        status: "ACTIVE",
        driverId: undefined,
        routeId: undefined,
        currentStop: "",
        nextDestination: "",
      })
    } catch (error) {
      console.error("Error creating bus:", error)
      onError(
        error instanceof Error
          ? error.message
          : "Failed to create bus. Please try again."
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
      driverId: undefined,
      routeId: undefined,
      currentStop: "",
      nextDestination: "",
    })
  }

  const isFormValid =
    !errors.busNumber &&
    !errors.capacity &&
    watch("busNumber")?.trim() !== "" &&
    watch("capacity") > 0

  return (
    <div className="space-y-6 p-2">
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
                    placeholder="e.g., BUS-101"
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
                    Maximum number of passengers
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

        {/* Assignments */}
        <Card className="border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              Assignments
            </CardTitle>
            <CardDescription>
              Optional: Assign a driver and route to this bus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driver Assignment */}
              <div className="space-y-3">
                <Label htmlFor="driverId" className="font-medium">
                  Assign Driver
                </Label>
                <Select
                  value={watch("driverId") || UNSELECTED}
                  onValueChange={(value) =>
                    setValue(
                      "driverId",
                      value === UNSELECTED ? undefined : value
                    )
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a driver (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNSELECTED}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>No driver assigned</span>
                      </div>
                    </SelectItem>
                    {availableDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          <span>{driver.name}</span>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {driver.licenseNumber}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Leave empty to assign later
                </p>
              </div>

              {/* Route Assignment */}
              <div className="space-y-3">
                <Label htmlFor="routeId" className="font-medium">
                  Assign Route
                </Label>
                <Select
                  value={watch("routeId")?.toString() || UNSELECTED}
                  onValueChange={(value) =>
                    setValue(
                      "routeId",
                      value === UNSELECTED ? undefined : parseInt(value)
                    )
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a route (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNSELECTED}>
                      <div className="flex items-center gap-2">
                        <RouteIcon className="h-4 w-4 text-muted-foreground" />
                        <span>No route assigned</span>
                      </div>
                    </SelectItem>
                    {availableRoutes.map((route) => (
                      <SelectItem key={route.id} value={route.id.toString()}>
                        <div className="flex items-center gap-2">
                          <RouteIcon className="h-4 w-4 text-green-500" />
                          <span>{route.name}</span>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {route.code}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Leave empty to assign later
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}

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
                disabled={isSubmitting}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
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
