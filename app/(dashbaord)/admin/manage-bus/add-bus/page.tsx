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
import { Switch } from "@/components/ui/switch"
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
  Clock,
  AlertTriangle,
  Plus,
  X,
  Settings,
  Timer,
  Calendar,
  Wrench,
  Navigation,
  ShieldAlert,
  Car,
  Award,
  LayoutGrid,
  Info,
  Pause,
  Play,
  Trash2,
  ChevronRight,
  MapPinHouse,
  Compass,
  CircleDot,
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
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { axiosInstance } from "@/services/axiosInstance"
import { toast } from "sonner"
import { fetchAllRoutesSimple } from "@/services/route.api"
import { fetchAllDriversSimple } from "@/services/driver.api"
import { getAllSimpleVehicles } from "@/services/vehicle.api"

// Types
interface BusFormData {
  busNumber: string
  capacity: number
  status: "ACTIVE" | "OUT_OF_SERVICE" | "UNDER_MAINTENANCE"
  vehicleId?: number
  driverId?: string
  routeId?: number
  currentStop?: string
  nextDestination?: string
  isActive: boolean
  departureTime?: Date
  estimatedArrival?: Date
  delayMinutes: number
  lastServiceDate?: Date
  nextServiceDate?: Date
  currentLocation?: {
    latitude?: number
    longitude?: number
  }
  schedules: BusSchedule[]
}

interface BusSchedule {
  startTime: string
  isActive: boolean
  intervalAfter?: number // Interval in minutes after this trip
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
  estimatedTimeMin: number
  stops?: string[]
}

interface Vehicle {
  id: number
  plateNumber: string
  type: string
  model: string
  year?: number
  status?: string
  mileage?: number
}

const busStatuses = [
  {
    value: "ACTIVE",
    label: "Active",
    description: "Currently in service",
    color: "from-emerald-500 to-green-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-200 dark:border-emerald-900",
    textColor: "text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle,
    pulseColor: "bg-emerald-500",
  },
  {
    value: "OUT_OF_SERVICE",
    label: "Out of Service",
    description: "Not in service",
    color: "from-slate-500 to-gray-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-200 dark:border-slate-800",
    textColor: "text-slate-600 dark:text-slate-400",
    icon: ShieldAlert,
    pulseColor: "bg-slate-500",
  },
  {
    value: "UNDER_MAINTENANCE",
    label: "Maintenance",
    description: "Under service",
    color: "from-amber-500 to-orange-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-200 dark:border-amber-900",
    textColor: "text-amber-600 dark:text-amber-400",
    icon: Wrench,
    pulseColor: "bg-amber-500",
  },
] as const

export default function ModernBusForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([])
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([])
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([])
  const [driverOpen, setDriverOpen] = useState(false)
  const [routeOpen, setRouteOpen] = useState(false)
  const [vehicleOpen, setVehicleOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [intervalModalOpen, setIntervalModalOpen] = useState(false)
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState<number | null>(null)
  const [customInterval, setCustomInterval] = useState("")
  const [manualTimeInput, setManualTimeInput] = useState("")
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
      isActive: true,
      delayMinutes: 0,
      schedules: [],
    },
    mode: "onChange",
  })

 useEffect(() => {
  let mounted = true

  const fetchData = async () => {
    setIsLoading(true)

    const results = await Promise.allSettled([
      fetchAllDriversSimple(),
      fetchAllRoutesSimple(),
      getAllSimpleVehicles(),
    ])

    if (!mounted) return

    const [driversRes, routesRes, vehiclesRes] = results

    // Drivers
    if (driversRes.status === "fulfilled") {
      setAvailableDrivers(driversRes.value)
    } else {
      console.error("Drivers error:", driversRes.reason)
      toast.error("Failed to load drivers")
      setAvailableDrivers([])
    }

    // Routes
    if (routesRes.status === "fulfilled") {
      setAvailableRoutes(routesRes.value)
    } else {
      console.error("Routes error:", routesRes.reason)
      toast.error("Failed to load routes")
      setAvailableRoutes([])
    }

    // Vehicles
    if (vehiclesRes.status === "fulfilled") {
      setAvailableVehicles(vehiclesRes.value)
    } else {
      console.error("Vehicles error:", vehiclesRes.reason)
      toast.error("Failed to load vehicles")
      setAvailableVehicles([])
    }

    setIsLoading(false)
  }

  fetchData()

  return () => {
    mounted = false
  }
}, [])


  // Get selected route
  const selectedRoute = watch("routeId")
    ? availableRoutes.find((r) => r.id === watch("routeId"))
    : null

  // Add schedule manually
  const addSchedule = () => {
    if (!selectedRoute) {
      toast.error("Please select a route first")
      return
    }

    const schedules = watch("schedules") || []
    
    // Find the latest time to suggest next time
    let suggestedHour = 12 // Default start at 12:00
    let suggestedMinute = 0
    
    if (schedules.length > 0) {
      const lastSchedule = schedules[schedules.length - 1]
      const [lastHour, lastMinute] = lastSchedule.startTime.split(":").map(Number)
      
      // Suggest time after the trip duration + interval (default 30 min interval)
      const intervalMinutes = lastSchedule.intervalAfter || 30
      const totalMinutes = lastHour * 60 + lastMinute + selectedRoute.estimatedTimeMin + intervalMinutes
      
      suggestedHour = Math.floor(totalMinutes / 60) % 24
      suggestedMinute = totalMinutes % 60
    }

    const timeString = `${String(suggestedHour).padStart(2, '0')}:${String(suggestedMinute).padStart(2, '0')}`
    
    setValue("schedules", [...schedules, {
      startTime: timeString,
      isActive: true,
      intervalAfter: 30 // Default 30 minutes interval after trip
    }])
    toast.success(`Added schedule at ${timeString}`)
  }

  // Add schedule at specific time
  const addScheduleAtTime = (time: string) => {
    if (!selectedRoute) {
      toast.error("Please select a route first")
      return
    }

    const currentSchedules = watch("schedules") || []
    
    if (currentSchedules.some(s => s.startTime === time)) {
      toast.error(`${time} is already scheduled`)
      return
    }

    setValue("schedules", [...currentSchedules, {
      startTime: time,
      isActive: true,
      intervalAfter: 30 // Default 30 minutes interval
    }])
    toast.success(`Added schedule at ${time}`)
  }

  // Add manual time
  const addManualTime = () => {
    if (!selectedRoute) {
      toast.error("Please select a route first")
      return
    }

    if (!manualTimeInput.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      toast.error("Please enter time in HH:MM format (e.g., 14:30)")
      return
    }

    const currentSchedules = watch("schedules") || []
    
    if (currentSchedules.some(s => s.startTime === manualTimeInput)) {
      toast.error(`${manualTimeInput} is already scheduled`)
      return
    }

    setValue("schedules", [...currentSchedules, {
      startTime: manualTimeInput,
      isActive: true,
      intervalAfter: 30 // Default 30 minutes interval
    }])
    setManualTimeInput("")
    toast.success(`Added schedule at ${manualTimeInput}`)
  }

  // Toggle schedule active state
  const toggleScheduleActive = (index: number) => {
    const schedules = watch("schedules") || []
    const updated = [...schedules]
    updated[index].isActive = !updated[index].isActive
    setValue("schedules", updated)
  }

  // Remove schedule
  const removeSchedule = (index: number) => {
    const schedules = watch("schedules") || []
    const updated = schedules.filter((_, i) => i !== index)
    setValue("schedules", updated)
  }

  // Clear all schedules
  const clearAllSchedules = () => {
    setValue("schedules", [])
    toast.info("All schedules cleared")
  }

  // Toggle all schedules active/inactive
  const toggleAllSchedules = (active: boolean) => {
    const schedules = watch("schedules") || []
    const updated = schedules.map(s => ({ ...s, isActive: active }))
    setValue("schedules", updated)
  }

  // Open interval modal for a specific schedule
  const openIntervalModal = (index: number) => {
    setSelectedScheduleIndex(index)
    const schedules = watch("schedules") || []
    setCustomInterval(schedules[index]?.intervalAfter?.toString() || "30")
    setIntervalModalOpen(true)
  }

  // Save interval for a schedule
  const saveInterval = () => {
    if (selectedScheduleIndex === null || !customInterval) return
    
    const schedules = watch("schedules") || []
    const updated = [...schedules]
    const intervalValue = parseInt(customInterval)
    
    if (isNaN(intervalValue) || intervalValue < 0) {
      toast.error("Please enter a valid positive number")
      return
    }

    updated[selectedScheduleIndex].intervalAfter = intervalValue
    setValue("schedules", updated)
    setIntervalModalOpen(false)
    toast.success(`Interval set to ${intervalValue} minutes`)
  }

  // Calculate next departure time based on trip duration and interval
  const calculateNextDeparture = (schedule: BusSchedule, route: Route) => {
    const [hour, minute] = schedule.startTime.split(":").map(Number)
    const totalMinutes = hour * 60 + minute + route.estimatedTimeMin + (schedule.intervalAfter || 30)
    const nextHour = Math.floor(totalMinutes / 60) % 24
    const nextMinute = totalMinutes % 60
    return `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`
  }

  const onSubmit = async (data: BusFormData) => {
    setIsSubmitting(true)
    
    try {
      const submitData = {
        ...data,
        availableSeats: data.capacity,
      }
      console.log("Submitting data:", submitData)

      const response = await axiosInstance.post("/buses", submitData)
      
      if (response.data.success) {
        toast.success(`Bus ${data.busNumber} created successfully!`, { description: "You can now manage your bus from the dashboard." })
        // router.push("/")
      } else {
        toast.error(response.data.message || "Failed to create bus")
      }
    } catch (error: any) {
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
      isActive: true,
      delayMinutes: 0,
      schedules: [],
    })
  }

  const selectedDriver = watch("driverId")
    ? availableDrivers.find((d) => d.id === watch("driverId"))
    : null

  const selectedVehicle = watch("vehicleId")
    ? availableVehicles.find((v) => v.id === watch("vehicleId"))
    : null

  const capacity = watch("capacity") || 0
  const schedules = watch("schedules") || []
  const activeSchedules = schedules.filter(s => s.isActive).length
  const totalSchedules = schedules.length

  const isFormValid = watch("busNumber")?.trim() && capacity > 0

  // Sort schedules by time
  const sortedSchedules = [...schedules].sort((a, b) => {
    const [hourA, minuteA] = a.startTime.split(":").map(Number)
    const [hourB, minuteB] = b.startTime.split(":").map(Number)
    return hourA * 60 + minuteA - (hourB * 60 + minuteB)
  })

  // Common time slots for quick add
  const commonTimes = [
    "06:00", "07:00", "08:00", "09:00", "10:00", 
    "11:00", "12:00", "13:00", "14:00", "15:00", 
    "16:00", "17:00", "18:00", "19:00", "20:00"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="group p-2.5 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-300 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md"
              >
                <ChevronDown className="h-5 w-5 rotate-90 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent">
                  Add New Bus
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Add a new vehicle to your fleet management system
                </p>
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="hidden lg:flex items-center gap-3">
              <div className={cn(
                "relative px-4 py-0.5 rounded-lg font-medium border backdrop-blur-sm transition-all duration-300",
                isFormValid 
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 shadow-sm" 
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900"
              )}>
                {isFormValid ? "Ready to Submit" : "Incomplete"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Form Card */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-800 px-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 h-14 gap-1 bg-transparent p-1">
                    <TabsTrigger 
                      value="basic" 
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-cyan-400/10 data-[state=active]:border data-[state=active]:border-blue-200 dark:data-[state=active]:border-blue-800 rounded-xl"
                    >
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger 
                      value="schedule" 
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/10 data-[state=active]:to-green-400/10 data-[state=active]:border data-[state=active]:border-emerald-200 dark:data-[state=active]:border-emerald-800 rounded-xl"
                    >
                      <Timer className="h-4 w-4 mr-2" />
                      Schedule
                      {schedules.length > 0 && (
                        <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                          {schedules.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  {/* Basic Info Tab */}
                  <TabsContent value="basic" className="space-y-6 mt-0 ">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shadow-none">
                      {/* Bus Number */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <Hash className="h-4 w-4 text-blue-500" />
                          Bus Number *
                        </Label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
                          <div className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-colors">
                            <Input
                              placeholder="e.g., BUS-2024-001"
                              className="border-0 bg-transparent pl-4 h-12 text-base placeholder:text-gray-400 focus-visible:ring-0"
                              {...register("busNumber", { 
                                required: true,
                                onChange: (e) => setValue("busNumber", e.target.value.toUpperCase())
                              })}
                            />
                          </div>
                          {errors.busNumber && (
                            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Bus number is required
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Capacity */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <Users className="h-4 w-4 text-purple-500" />
                          Passenger Capacity *
                        </Label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-400 rounded-xl blur opacity-20" />
                          <div className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                            <Input
                              type="number"
                              min="1"
                              max="200"
                              placeholder="40"
                              className="border-0 bg-transparent pl-12 h-12 text-base placeholder:text-gray-400"
                              {...register("capacity", { 
                                required: true, 
                                valueAsNumber: true,
                                min: 1,
                                max: 200
                              })}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <Users className="h-5 w-5 text-purple-500" />
                            </div>
                          </div>
                          {errors.capacity && (
                            <p className="text-sm text-destructive mt-2">
                              Capacity must be between 1 and 200
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Settings className="h-4 w-4 text-amber-500" />
                        Status
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {busStatuses.map((status) => {
                          const Icon = status.icon
                          const isSelected = watch("status") === status.value
                          return (
                            <button
                              key={status.value}
                              type="button"
                              onClick={() => setValue("status", status.value)}
                              className={cn(
                                "relative p-3 rounded-lg border transition-all duration-300 group",
                                "hover:scale-[1.02] hover:shadow-md",
                                isSelected
                                  ? cn(
                                      "bg-white dark:bg-gray-900 shadow-sm",
                                      status.borderColor
                                    )
                                  : "bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800"
                              )}
                            >
                              {isSelected && (
                                <div className={cn(
                                  "absolute inset-0 rounded-lg bg-gradient-to-br opacity-10",
                                  status.color
                                )} />
                              )}
                              <div className="relative flex flex-col items-center gap-2">
                                <div className={cn(
                                  "p-2 rounded-lg transition-colors",
                                  isSelected ? status.bgColor : "bg-gray-100 dark:bg-gray-800"
                                )}>
                                  <Icon className={cn(
                                    "h-4 w-4",
                                    isSelected ? status.textColor : "text-gray-400"
                                  )} />
                                </div>
                                <span className={cn(
                                  "text-xs font-medium",
                                  isSelected ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                                )}>
                                  {status.label}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Active Status */}
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "h-2 w-2 rounded-full animate-pulse",
                              watch("isActive") 
                                ? "bg-emerald-500" 
                                : "bg-gray-400"
                            )} />
                            <Label className="font-medium text-gray-900 dark:text-white">
                              Active Status
                            </Label>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {watch("isActive") 
                              ? "Bus is active and available for service"
                              : "Bus is inactive and not in service"
                            }
                          </p>
                        </div>
                        <Switch
                          checked={watch("isActive")}
                          onCheckedChange={(checked) => setValue("isActive", checked)}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Service Dates & Delay */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          Last Service
                        </Label>
                        <Input
                          type="date"
                          className="h-12 rounded-xl border-gray-200 dark:border-gray-800"
                          {...register("lastServiceDate")}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <Calendar className="h-4 w-4 text-emerald-500" />
                          Next Service
                        </Label>
                        <Input
                          type="date"
                          className="h-12 rounded-xl border-gray-200 dark:border-gray-800"
                          {...register("nextServiceDate")}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <Clock className="h-4 w-4 text-amber-500" />
                          Current Delay
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="h-12 rounded-xl border-gray-200 dark:border-gray-800 pl-12"
                            {...register("delayMinutes", { valueAsNumber: true })}
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <Timer className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Schedule Tab */}
                  <TabsContent value="schedule" className="space-y-6 mt-0">
                    {/* Schedule Header */}
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            Custom Schedule
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Manually add trips and set intervals between them
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {schedules.length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Scheduled Trips
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Route Selection Warning */}
                    {!selectedRoute ? (
                      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              Select a Route First
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Please select a route to enable schedule creation.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RouteIcon className="h-5 w-5 text-emerald-500" />
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {selectedRoute.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Trip Duration: {selectedRoute.estimatedTimeMin} minutes
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-white/50 dark:bg-gray-900/50">
                              {selectedRoute.estimatedTimeMin} min trip
                            </Badge>
                            <Button
                              onClick={addSchedule}
                              size="sm"
                              className="gap-1 bg-gradient-to-r from-emerald-500 to-green-400"
                            >
                              <Plus className="h-3 w-3" />
                              Add Trip
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Manual Time Input */}
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Add Specific Time
                      </h4>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Input
                            placeholder="Enter time (HH:MM) e.g., 14:30"
                            value={manualTimeInput}
                            onChange={(e) => setManualTimeInput(e.target.value)}
                            className="rounded-xl"
                          />
                        </div>
                        <Button
                          onClick={addManualTime}
                          disabled={!selectedRoute || !manualTimeInput}
                          className="bg-gradient-to-r from-purple-500 to-pink-400 rounded-xl"
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Format: 24-hour clock (00:00 to 23:59)
                      </p>
                    </div>

                    {/* Quick Add Time Slots */}
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Quick Add Time Slots
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {commonTimes.map(time => (
                          <Button
                            key={time}
                            onClick={() => addScheduleAtTime(time)}
                            variant="outline"
                            size="sm"
                            disabled={!selectedRoute}
                            className="h-8"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Schedule Actions */}
                    {schedules.length > 0 && (
                      <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
                            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{activeSchedules}</div>
                          </div>
                          <Separator orientation="vertical" className="h-10" />
                          <div className="text-center">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalSchedules}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAllSchedules(true)}
                            className="gap-1"
                          >
                            <Play className="h-3 w-3" />
                            Activate All
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAllSchedules(false)}
                            className="gap-1"
                          >
                            <Pause className="h-3 w-3" />
                            Deactivate All
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllSchedules}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            Clear All
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Schedule List */}
                    {schedules.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Scheduled Trips
                          </h4>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Trip time: {selectedRoute?.estimatedTimeMin || 0} min
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {sortedSchedules.map((schedule, index) => {
                            const [hour, minute] = schedule.startTime.split(":").map(Number)
                            const period = hour === 0 ? "AM" : hour < 12 ? "AM" : "PM"
                            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
                            
                            return (
                              <div
                                key={index}
                                className={cn(
                                  "group relative p-4 rounded-xl border transition-all hover:shadow-sm",
                                  schedule.isActive
                                    ? "border-emerald-200 dark:border-emerald-900 bg-gradient-to-r from-emerald-50/30 to-green-50/30 dark:from-emerald-950/10 dark:to-green-950/10"
                                    : "border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50/30 to-gray-50/30 dark:from-slate-950/10 dark:to-gray-950/10"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "p-2 rounded-lg",
                                      schedule.isActive
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                                    )}>
                                      <Clock className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900 dark:text-white text-lg">
                                        {schedule.startTime}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {displayHour}:{String(minute).padStart(2, '0')} {period}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {/* Interval Button */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openIntervalModal(index)}
                                      className="gap-1"
                                    >
                                      <Timer className="h-3 w-3" />
                                      Interval: {schedule.intervalAfter || 30}min
                                    </Button>
                                    
                                    <Switch
                                      checked={schedule.isActive}
                                      onCheckedChange={() => toggleScheduleActive(index)}
                                      size="sm"
                                      className="data-[state=checked]:bg-emerald-500"
                                    />
                                    <button
                                      onClick={() => removeSchedule(index)}
                                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="h-4 w-4 text-gray-500" />
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Next Departure Info */}
                                {selectedRoute && (
                                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-sm">
                                      <Clock className="h-3 w-3 text-blue-500" />
                                      <span className="text-gray-600 dark:text-gray-400">
                                        Trip duration: {selectedRoute.estimatedTimeMin} min • 
                                        Next departure: {calculateNextDeparture(schedule, selectedRoute)} 
                                        ({schedule.intervalAfter || 30} min interval)
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-400/10 flex items-center justify-center">
                          <Timer className="h-8 w-8 text-blue-500" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          No schedules yet
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                          {selectedRoute 
                            ? `Click "Add Trip" to create your custom schedule`
                            : "Select a route first to enable schedule creation"}
                        </p>
                        {selectedRoute && (
                          <Button
                            onClick={addSchedule}
                            className="gap-2 bg-gradient-to-r from-emerald-500 to-green-400"
                          >
                            <Plus className="h-4 w-4" />
                            Add First Trip
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Sidebar - Assignments */}
          <div className="space-y-6">
            {/* Vehicle Assignment */}
            <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 shadow-md">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      Vehicle Assignment
                    </div>
                    <CardDescription>
                      Assign a vehicle to this bus
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Popover open={vehicleOpen} onOpenChange={setVehicleOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12 rounded-xl border-gray-300 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                    >
                      {selectedVehicle ? (
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">{selectedVehicle.plateNumber}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Car className="h-4 w-4" />
                          <span>Select vehicle</span>
                        </div>
                      )}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search vehicles..." />
                      <CommandList>
                        <CommandEmpty>No vehicle found.</CommandEmpty>
                        <CommandGroup>
                          {availableVehicles.map((vehicle) => (
                            <CommandItem
                              key={vehicle.id}
                              onSelect={() => {
                                setValue("vehicleId", vehicle.id)
                                setVehicleOpen(false)
                              }}
                              className="py-3 cursor-pointer"
                            >
                              <Car className="mr-3 h-5 w-5 text-purple-500" />
                              <div className="flex-1">
                                <div className="font-medium">{vehicle.plateNumber}</div>
                                <div className="text-sm text-gray-500">
                                  {vehicle.model} • {vehicle.type}
                                </div>
                              </div>
                              <Badge variant="outline" className="ml-2">
                                {vehicle.status}
                              </Badge>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedVehicle && (
                  <div className="mt-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Car className="h-6 w-6 text-purple-500" />
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {selectedVehicle.plateNumber}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="space-y-1">
                          <div className="text-gray-500 dark:text-gray-400">Model</div>
                          <div className="font-medium">{selectedVehicle.model}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-gray-500 dark:text-gray-400">Type</div>
                          <div className="font-medium">{selectedVehicle.type}</div>
                        </div>
                        {selectedVehicle.year && (
                          <div className="space-y-1">
                            <div className="text-gray-500 dark:text-gray-400">Year</div>
                            <div className="font-medium">{selectedVehicle.year}</div>
                          </div>
                        )}
                        {selectedVehicle.mileage && (
                          <div className="space-y-1">
                            <div className="text-gray-500 dark:text-gray-400">Mileage</div>
                            <div className="font-medium">{selectedVehicle.mileage.toLocaleString()} km</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Driver Assignment */}
            <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-md">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      Driver Assignment
                    </div>
                    <CardDescription>
                      Assign a driver to this bus
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Popover open={driverOpen} onOpenChange={setDriverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12 rounded-xl border-gray-300 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                    >
                      {selectedDriver ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{selectedDriver.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <User className="h-4 w-4" />
                          <span>Select driver</span>
                        </div>
                      )}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search drivers..." />
                      <CommandList>
                        <CommandEmpty>No driver found.</CommandEmpty>
                        <CommandGroup>
                          {availableDrivers.map((driver) => (
                            <CommandItem
                              key={driver.id}
                              onSelect={() => {
                                setValue("driverId", driver.id)
                                setDriverOpen(false)
                              }}
                              className="py-3 cursor-pointer"
                            >
                              <User className="mr-3 h-5 w-5 text-blue-500" />
                              <div className="flex-1">
                                <div className="font-medium">{driver.name}</div>
                                <div className="text-sm text-gray-500">
                                  {driver.licenseNumber}
                                </div>
                              </div>
                              {driver.experience && (
                                <Badge variant="outline" className="ml-2">
                                  {driver.experience}yrs
                                </Badge>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedDriver && (
                  <div className="mt-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold">
                          { selectedDriver.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {selectedDriver.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            License: {selectedDriver.licenseNumber}
                          </div>
                        </div>
                      </div>
                      {selectedDriver.experience && (
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-amber-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {selectedDriver.experience} years experience
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Route Assignment */}
            <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-400 shadow-md">
                    <RouteIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      Route Assignment
                    </div>
                    <CardDescription>
                      Required for schedule generation
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Popover open={routeOpen} onOpenChange={setRouteOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12 rounded-xl border-gray-300 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700"
                    >
                      {selectedRoute ? (
                        <div className="flex items-center gap-2">
                          <RouteIcon className="h-4 w-4 text-emerald-500" />
                          <span className="font-medium">{selectedRoute.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <RouteIcon className="h-4 w-4" />
                          <span>Select route</span>
                        </div>
                      )}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search routes..." />
                      <CommandList>
                        <CommandEmpty>No route found.</CommandEmpty>
                        <CommandGroup>
                          {availableRoutes.map((route) => (
                            <CommandItem
                              key={route.id}
                              onSelect={() => {
                                setValue("routeId", route.id)
                                setRouteOpen(false)
                              }}
                              className="py-3 cursor-pointer"
                            >
                              <RouteIcon className="mr-3 h-5 w-5 text-emerald-500" />
                              <div className="flex-1">
                                <div className="font-medium">{route.name}</div>
                                <div className="text-sm text-gray-500">
                                  {route.origin} → {route.destination}
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <Badge variant="outline" className="ml-2 mb-1">
                                  {route.estimatedTimeMin}min
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  Trip duration
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedRoute && (
                  <div className="mt-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <RouteIcon className="h-6 w-6 text-emerald-500" />
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {selectedRoute.name}
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPinHouse className="h-4 w-4" />
                          <span>{selectedRoute.origin}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
                          <Compass className="h-4 w-4" />
                          <span>{selectedRoute.destination}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="space-y-1">
                          <div className="text-gray-500 dark:text-gray-400">Trip Time</div>
                          <div className="font-medium">{selectedRoute.estimatedTimeMin} minutes</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-gray-500 dark:text-gray-400">Distance</div>
                          <div className="font-medium">{selectedRoute.distanceKm || 0} km</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="sticky bottom-6 mt-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-3 w-3 rounded-full animate-pulse",
                    isFormValid 
                      ? "bg-gradient-to-r from-emerald-500 to-green-400" 
                      : "bg-gradient-to-r from-amber-500 to-orange-400"
                  )} />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {isFormValid ? "Ready to create bus" : "Complete required fields"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedRoute 
                        ? `${schedules.length} trips on ${selectedRoute.name} (${selectedRoute.estimatedTimeMin} min each)` 
                        : schedules.length > 0 
                          ? `${schedules.length} trips scheduled`
                          : "No schedule configured"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="gap-2 rounded-lg border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 cursor-pointer min-w-[100px]"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleSubmit(onSubmit)}
                    disabled={!isFormValid || isSubmitting}
                    className="gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 shadow-lg cursor-pointer min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Bus
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interval Modal */}
      {intervalModalOpen && selectedScheduleIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-md w-full p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Set Interval Between Trips
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Set the waiting time after this trip before the next departure
                </p>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Interval After Trip (minutes)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={customInterval}
                  onChange={(e) => setCustomInterval(e.target.value)}
                  placeholder="e.g., 30"
                  className="h-12 rounded-xl"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recommended: 15-60 minutes for efficient scheduling
                </p>
              </div>

              {selectedRoute && (
                <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-blue-600 dark:text-blue-400">
                      Trip duration: {selectedRoute.estimatedTimeMin} minutes • 
                      Total cycle time: {selectedRoute.estimatedTimeMin + (parseInt(customInterval) || 30)} minutes
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button
                  variant="outline"
                  onClick={() => setIntervalModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveInterval}
                  className="bg-gradient-to-r from-emerald-500 to-green-400 rounded-xl"
                >
                  Save Interval
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}