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
  Settings,
  Timer,
  Calendar,
  Wrench,
  ShieldAlert,
  Car,
  Award,
  LayoutGrid,
  Info,
  Lock,
  MapPinHouse,
  Compass,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { axiosInstance } from "@/services/axiosInstance"
import { toast } from "sonner"
import { fetchAllRoutesSimple } from "@/services/route.api"
import { fetchAllDriversSimple } from "@/services/driver.api"
import { getAllSimpleVehicles } from "@/services/vehicle.api"

// Import our separated components and utilities
import {
  EthiopianTimeUtils,
  ethiopianTimeSlots,
} from "@/lib/EthiopianTimeUtils"
// import { ScheduleCard } from "@/components/bus/ScheduleCard"
import {
  BusFormData,
  Driver,
  Route,
  Vehicle,
  BusSchedule,
} from "@/types/bus-create"
import { ScheduleCard } from "@/components/user-dashboard/bus/ScheduleCard"

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
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState<
    number | null
  >(null)
  const [customInterval, setCustomInterval] = useState("")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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

      if (driversRes.status === "fulfilled") {
        setAvailableDrivers(driversRes.value)
      } else {
        console.error("Drivers error:", driversRes.reason)
        toast.error("Failed to load drivers")
        setAvailableDrivers([])
      }

      if (routesRes.status === "fulfilled") {
        setAvailableRoutes(routesRes.value)
      } else {
        console.error("Routes error:", routesRes.reason)
        toast.error("Failed to load routes")
        setAvailableRoutes([])
      }

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

  const isBasicInfoCompleted = () => {
    const busNumber = watch("busNumber")?.trim()
    const capacity = watch("capacity")
    const routeId = watch("routeId")
    const driverId = watch("driverId")
    const vehicleId = watch("vehicleId")

    return (
      busNumber &&
      busNumber.length > 0 &&
      capacity &&
      capacity > 0 &&
      routeId &&
      driverId &&
      vehicleId
    )
  }

  const selectedRoute = watch("routeId")
    ? availableRoutes.find((r) => r.id === watch("routeId"))
    : null

  const calculateEndTime = (
    startTime: string,
    routeDuration: number,
  ): string => {
    const [hour, minute] = startTime.split(":").map(Number)
    const totalMinutes = hour * 60 + minute + routeDuration
    const endHour = Math.floor(totalMinutes / 60) % 24
    const endMinute = totalMinutes % 60
    return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`
  }

  const validateInterval = (
    newTime: string,
    existingSchedules: BusSchedule[],
  ): boolean => {
    if (existingSchedules.length === 0) return true

    const [newHour, newMinute] = newTime.split(":").map(Number)
    const newTotalMinutes = newHour * 60 + newMinute

    for (const schedule of existingSchedules) {
      const [existingHour, existingMinute] = schedule.startTime
        .split(":")
        .map(Number)
      const existingTotalMinutes = existingHour * 60 + existingMinute
      const difference = Math.abs(newTotalMinutes - existingTotalMinutes)

      if (difference < 45) {
        return false
      }
    }

    return true
  }

  const getNextDirection = (
    schedules: BusSchedule[],
  ): "FORWARD" | "REVERSE" => {
    if (schedules.length === 0) return "FORWARD"
    const lastDirection = schedules[schedules.length - 1].direction
    return lastDirection === "FORWARD" ? "REVERSE" : "FORWARD"
  }

  // Add schedule using Ethiopian time
  // Add schedule using Ethiopian time with minutes support
  const addScheduleAtEthiopianTime = (
    ethiopianHour: number,
    ethiopianMinute: number,
    period: "ጠዋት" | "ከሰዓት",
  ) => {
    if (!selectedRoute) {
      toast.error("Please select a route first")
      return
    }

    // Validate operation hours
    if (!EthiopianTimeUtils.isValidOperationTime(ethiopianHour, period)) {
      toast.error(
        `Time ${EthiopianTimeUtils.formatTime(ethiopianHour, ethiopianMinute, period)} is outside operation hours`,
      )
      toast.error(EthiopianTimeUtils.getOperationHoursDisplay())
      return
    }

    const currentSchedules = watch("schedules") || []

    // Convert Ethiopian time to Western time for storage
    const westernTime = EthiopianTimeUtils.toWesternTime(
      ethiopianHour,
      ethiopianMinute,
      period,
    )
    const timeString = `${String(westernTime.hour).padStart(2, "0")}:${String(westernTime.minute).padStart(2, "0")}`

    // Validate minimum interval (45 minutes)
    if (!validateInterval(timeString, currentSchedules)) {
      toast.error(
        "Schedule must be at least 45 minutes apart from existing schedules",
      )
      return
    }

    // Determine direction
    const direction = getNextDirection(currentSchedules)

    // Calculate end time
    const endTime = calculateEndTime(timeString, selectedRoute.estimatedTimeMin)
    const endEthiopian = EthiopianTimeUtils.toEthiopianTime(
      parseInt(endTime.split(":")[0]),
      parseInt(endTime.split(":")[1]),
    )

    setValue("schedules", [
      ...currentSchedules,
      {
        startTime: timeString,
        ethiopianTime: EthiopianTimeUtils.formatTime(
          ethiopianHour,
          ethiopianMinute,
          period,
        ),
        direction: direction,
        endTime: endTime,
        endEthiopianTime: endEthiopian.display,
        isActive: true,
        intervalAfter: 45,
      },
    ])

    toast.success(
      `Added ${direction} trip at ${EthiopianTimeUtils.formatTime(ethiopianHour, ethiopianMinute, period)} - ${endEthiopian.display}`,
    )
  }

  const addSchedule = () => {
    if (!selectedRoute) {
      toast.error("Please select a route first")
      return
    }

    const schedules = watch("schedules") || []

    // Find next available Ethiopian time slot
    let nextHour = 12
    let nextMinute = 0
    let nextPeriod: "ጠዋት" | "ከሰዓት" = "ጠዋት"

    if (schedules.length > 0) {
      // Get the last schedule
      const lastSchedule = schedules[schedules.length - 1]

      // Get the end time of the last schedule (in Western time)
      const [endHour, endMinute] = lastSchedule.endTime
        ?.split(":")
        .map(Number) || [0, 0]

      // Add the interval (minimum 45 minutes) to the end time
      const intervalMinutes = Math.max(lastSchedule.intervalAfter || 45, 45)
      const nextStartTotal = endHour * 60 + endMinute + intervalMinutes
      const nextWesternHour = Math.floor(nextStartTotal / 60) % 24
      const nextWesternMinute = nextStartTotal % 60

      // Convert to Ethiopian time with minutes
      const nextEthiopian = EthiopianTimeUtils.toEthiopianTime(
        nextWesternHour,
        nextWesternMinute,
      )
      nextHour = nextEthiopian.hour
      nextMinute = nextEthiopian.minute
      nextPeriod = nextEthiopian.period

      console.log(
        `Last trip ends at ${lastSchedule.endEthiopianTime}, adding ${intervalMinutes} min interval, next departure at ${nextEthiopian.display}`,
      )
    }

    // Add the schedule at the calculated time with minutes
    addScheduleAtEthiopianTime(nextHour, nextMinute, nextPeriod)
  }

  const toggleScheduleActive = (index: number) => {
    const schedules = watch("schedules") || []
    const updated = [...schedules]
    updated[index].isActive = !updated[index].isActive
    setValue("schedules", updated)
  }

  const removeSchedule = (index: number) => {
    const schedules = watch("schedules") || []
    const updated = schedules.filter((_, i) => i !== index)
    setValue("schedules", updated)
    toast.success("Schedule removed")
  }

  const clearAllSchedules = () => {
    setValue("schedules", [])
    toast.info("All schedules cleared")
  }

  const toggleAllSchedules = (active: boolean) => {
    const schedules = watch("schedules") || []
    const updated = schedules.map((s) => ({ ...s, isActive: active }))
    setValue("schedules", updated)
  }

  const openIntervalModal = (index: number) => {
    setSelectedScheduleIndex(index)
    const schedules = watch("schedules") || []
    setCustomInterval(schedules[index]?.intervalAfter?.toString() || "45")
    setIntervalModalOpen(true)
  }

  const saveInterval = () => {
    if (selectedScheduleIndex === null || !customInterval) return

    const schedules = watch("schedules") || []
    const updated = [...schedules]
    const intervalValue = parseInt(customInterval)

    if (isNaN(intervalValue) || intervalValue < 45) {
      toast.error("Please enter a valid number (minimum 45 minutes)")
      return
    }

    updated[selectedScheduleIndex].intervalAfter = intervalValue
    setValue("schedules", updated)
    setIntervalModalOpen(false)
    toast.success(`Interval set to ${intervalValue} minutes`)
  }

  const calculateNextDeparture = (
    currentSchedule: BusSchedule,
    allSchedules: BusSchedule[],
    route: Route,
  ) => {
    // Find the index of the current schedule
    const currentIndex = allSchedules.findIndex(
      (s) => s.startTime === currentSchedule.startTime,
    )

    // If there's no next schedule
    if (currentIndex === -1 || currentIndex + 1 >= allSchedules.length) {
      return {
        western: null,
        ethiopian: null,
        hasNext: false,
        warning: null,
      }
    }

    const nextSchedule = allSchedules[currentIndex + 1]

    // Calculate the gap between current trip's end and next trip's start
    const [endHour, endMinute] = currentSchedule.endTime
      ?.split(":")
      .map(Number) || [0, 0]
    const [nextStartHour, nextStartMinute] = nextSchedule.startTime
      .split(":")
      .map(Number)

    const currentEndTotal = endHour * 60 + endMinute
    const nextStartTotal = nextStartHour * 60 + nextStartMinute
    const gapMinutes = nextStartTotal - currentEndTotal
    const requiredGap = currentSchedule.intervalAfter || 45

    // Check if the gap is sufficient
    let warning = null
    if (gapMinutes < requiredGap) {
      warning = `⚠️ Only ${gapMinutes} min gap (minimum ${requiredGap} min required)`
    }

    return {
      western: nextSchedule.startTime,
      ethiopian: nextSchedule.ethiopianTime,
      hasNext: true,
      gapMinutes,
      requiredGap,
      warning,
    }
  }

  const onSubmit = async (data: BusFormData) => {
    setIsSubmitting(true)

    try {
      // Get today's date for the schedule dates
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Format schedules with proper ISO dates
      const formattedSchedules = data.schedules.map((schedule) => {
        // Parse the Western time from the schedule (e.g., "06:00")
        const [hours, minutes] = schedule.startTime.split(":").map(Number)

        // Create a date object with today's date and the schedule time
        const scheduleDate = new Date(today)
        scheduleDate.setHours(hours, minutes, 0, 0)

        // Convert to ISO string
        const startTimeISO = scheduleDate.toISOString()

        return {
          startTime: startTimeISO,
          direction: schedule.direction,
        }
      })

      const submitData = {
        busNumber: data.busNumber,
        capacity: data.capacity,
        status: data.status,
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        routeId: data.routeId,
        isActive: data.isActive,
        delayMinutes: data.delayMinutes,
        lastServiceDate: data.lastServiceDate,
        nextServiceDate: data.nextServiceDate,
        estimatedArrival: selectedRoute?.estimatedTimeMin,
        schedules: formattedSchedules,
      }

      console.log("Submitting data:", submitData)

      const response = await axiosInstance.post("/buses", submitData)

      if (response.data.success) {
        toast.success(`Bus ${data.busNumber} created successfully!`)
        // router.push("/")
      } else {
        toast.error(response.data.message || "Failed to create bus")
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create bus. Please try again.",
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

  const schedules = watch("schedules") || []
  const activeSchedules = schedules.filter((s) => s.isActive).length
  const totalSchedules = schedules.length

  const isFormValid = isBasicInfoCompleted()

  const getMissingFields = () => {
    const missing = []
    if (!watch("busNumber")?.trim()) missing.push("Bus Number")
    if (!watch("capacity") || watch("capacity") <= 0) missing.push("Capacity")
    if (!watch("routeId")) missing.push("Route")
    if (!watch("driverId")) missing.push("Driver")
    if (!watch("vehicleId")) missing.push("Vehicle")
    return missing
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

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

            <div className="hidden lg:flex items-center gap-3">
              <div
                className={cn(
                  "relative px-4 py-0.5 rounded-lg font-medium border backdrop-blur-sm transition-all duration-300",
                  isFormValid
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 shadow-sm"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900",
                )}
              >
                {isFormValid
                  ? "Ready to Submit"
                  : `${getMissingFields().length} items remaining`}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-800 px-6">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-2 h-14 gap-1 bg-transparent p-1">
                    <TabsTrigger
                      value="basic"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-cyan-400/10 data-[state=active]:border data-[state=active]:border-blue-200 dark:data-[state=active]:border-blue-800 rounded-xl"
                    >
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      Basic Info
                      {!isBasicInfoCompleted() && (
                        <Badge
                          variant="destructive"
                          className="ml-2 h-5 px-1 text-[10px]"
                        >
                          Required
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="schedule"
                      disabled={!isBasicInfoCompleted()}
                      className={cn(
                        "rounded-xl",
                        !isBasicInfoCompleted() &&
                          "opacity-50 cursor-not-allowed",
                        "data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/10 data-[state=active]:to-green-400/10 data-[state=active]:border data-[state=active]:border-emerald-200 dark:data-[state=active]:border-emerald-800",
                      )}
                    >
                      {!isBasicInfoCompleted() ? (
                        <Lock className="h-4 w-4 mr-2" />
                      ) : (
                        <Timer className="h-4 w-4 mr-2" />
                      )}
                      Schedule
                      {schedules.length > 0 && isBasicInfoCompleted() && (
                        <Badge
                          variant="secondary"
                          className="ml-2 h-5 w-5 p-0 text-xs"
                        >
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
                  <TabsContent value="basic" className="space-y-6 mt-0">
                    {!isBasicInfoCompleted() && (
                      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              Complete Required Fields
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Please fill in: {getMissingFields().join(", ")} to
                              enable schedule creation
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                onChange: (e) =>
                                  setValue(
                                    "busNumber",
                                    e.target.value.toUpperCase(),
                                  ),
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
                                max: 200,
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
                                      status.borderColor,
                                    )
                                  : "bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800",
                              )}
                            >
                              {isSelected && (
                                <div
                                  className={cn(
                                    "absolute inset-0 rounded-lg bg-gradient-to-br opacity-10",
                                    status.color,
                                  )}
                                />
                              )}
                              <div className="relative flex flex-col items-center gap-2">
                                <div
                                  className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    isSelected
                                      ? status.bgColor
                                      : "bg-gray-100 dark:bg-gray-800",
                                  )}
                                >
                                  <Icon
                                    className={cn(
                                      "h-4 w-4",
                                      isSelected
                                        ? status.textColor
                                        : "text-gray-400",
                                    )}
                                  />
                                </div>
                                <span
                                  className={cn(
                                    "text-xs font-medium",
                                    isSelected
                                      ? "text-gray-900 dark:text-white"
                                      : "text-gray-600 dark:text-gray-400",
                                  )}
                                >
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
                            <div
                              className={cn(
                                "h-2 w-2 rounded-full animate-pulse",
                                watch("isActive")
                                  ? "bg-emerald-500"
                                  : "bg-gray-400",
                              )}
                            />
                            <Label className="font-medium text-gray-900 dark:text-white">
                              Active Status
                            </Label>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {watch("isActive")
                              ? "Bus is active and available for service"
                              : "Bus is inactive and not in service"}
                          </p>
                        </div>
                        <Switch
                          checked={watch("isActive")}
                          onCheckedChange={(checked) =>
                            setValue("isActive", checked)
                          }
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
                            {...register("delayMinutes", {
                              valueAsNumber: true,
                            })}
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
                    {!isBasicInfoCompleted() ? (
                      <div className="p-8 rounded-xl border border-amber-200 dark:border-amber-900 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-400/20 flex items-center justify-center">
                          <Lock className="h-10 w-10 text-amber-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Schedule Tab Locked
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                          Please complete all required fields in the Basic Info
                          tab first:
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {getMissingFields().map((field, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-amber-500/10 border-amber-200 dark:border-amber-900"
                            >
                              {field}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          onClick={() => setActiveTab("basic")}
                          className="mt-6 bg-gradient-to-r from-amber-500 to-orange-400"
                        >
                          Go to Basic Info
                        </Button>
                      </div>
                    ) : (
                      <ScheduleCard
                        selectedRoute={selectedRoute}
                        schedules={schedules}
                        activeSchedules={activeSchedules}
                        totalSchedules={totalSchedules}
                        onAddSchedule={addSchedule}
                        onAddScheduleAtTime={addScheduleAtEthiopianTime}
                        onToggleActive={toggleScheduleActive}
                        onRemoveSchedule={removeSchedule}
                        onToggleAll={toggleAllSchedules}
                        onClearAll={clearAllSchedules}
                        onOpenIntervalModal={openIntervalModal}
                        calculateNextDeparture={calculateNextDeparture}
                        calculateEndTime={calculateEndTime}
                      />
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
                      Vehicle Assignment *
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
                      className={cn(
                        "w-full justify-between h-12 rounded-xl border-gray-300 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700",
                        !watch("vehicleId") &&
                          "border-amber-300 dark:border-amber-700",
                      )}
                    >
                      {selectedVehicle ? (
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">
                            {selectedVehicle.plateNumber}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Car className="h-4 w-4" />
                          <span>Select vehicle *</span>
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
                                <div className="font-medium">
                                  {vehicle.plateNumber}
                                </div>
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
                          <div className="text-gray-500 dark:text-gray-400">
                            Model
                          </div>
                          <div className="font-medium">
                            {selectedVehicle.model}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-gray-500 dark:text-gray-400">
                            Type
                          </div>
                          <div className="font-medium">
                            {selectedVehicle.type}
                          </div>
                        </div>
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
                      Driver Assignment *
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
                      className={cn(
                        "w-full justify-between h-12 rounded-xl border-gray-300 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700",
                        !watch("driverId") &&
                          "border-amber-300 dark:border-amber-700",
                      )}
                    >
                      {selectedDriver ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">
                            {selectedDriver.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <User className="h-4 w-4" />
                          <span>Select driver *</span>
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
                          {selectedDriver.name.charAt(0)}
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
                      Route Assignment *
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
                      className={cn(
                        "w-full justify-between h-12 rounded-xl border-gray-300 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700",
                        !watch("routeId") &&
                          "border-amber-300 dark:border-amber-700",
                      )}
                    >
                      {selectedRoute ? (
                        <div className="flex items-center gap-2">
                          <RouteIcon className="h-4 w-4 text-emerald-500" />
                          <span className="font-medium">
                            {selectedRoute.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <RouteIcon className="h-4 w-4" />
                          <span>Select route *</span>
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
                          <div className="text-gray-500 dark:text-gray-400">
                            Trip Time
                          </div>
                          <div className="font-medium">
                            {selectedRoute.estimatedTimeMin} minutes
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-gray-500 dark:text-gray-400">
                            Distance
                          </div>
                          <div className="font-medium">
                            {selectedRoute.distanceKm || 0} km
                          </div>
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
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full animate-pulse",
                      isFormValid
                        ? "bg-gradient-to-r from-emerald-500 to-green-400"
                        : "bg-gradient-to-r from-amber-500 to-orange-400",
                    )}
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {isFormValid
                        ? "Ready to create bus"
                        : "Complete required fields"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {!isFormValid &&
                        `Missing: ${getMissingFields().join(", ")}`}
                      {isFormValid &&
                        selectedRoute &&
                        `${schedules.length} trips on ${selectedRoute.name} (${selectedRoute.estimatedTimeMin} min each)`}
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
                      <>Create Bus</>
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
                  (minimum 45 minutes)
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Interval After Trip (minutes)
                </Label>
                <Input
                  type="number"
                  min="45"
                  value={customInterval}
                  onChange={(e) => setCustomInterval(e.target.value)}
                  placeholder="e.g., 45"
                  className="h-12 rounded-xl"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Minimum: 45 minutes for efficient scheduling
                </p>
              </div>

              {selectedRoute && (
                <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-blue-600 dark:text-blue-400">
                      Trip duration: {selectedRoute.estimatedTimeMin} minutes •
                      Total cycle time:{" "}
                      {selectedRoute.estimatedTimeMin +
                        (parseInt(customInterval) || 45)}{" "}
                      minutes
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
