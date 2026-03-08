"use client"

import React, { useState, useRef, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Search,
  Users,
  Calendar as CalendarIcon,
  MapPin,
  ChevronDown,
  X,
  ArrowRightLeft,
  Clock,
  Tag,
  Sparkles,
  Bus,
  UserRound,
  AlertCircle,
  Loader2,
  Timer,
  ChevronLeft,
} from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useGetAllMidpoints } from "@/hooks/useGetAllMidpoints"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface BusSearchFormProps {
  onSearch: (data: {
    from: string
    to: string
    date: Date
    time: string
    passengers: number
  }) => void
  isLoading: boolean
}

// Generate time slots in 30-minute intervals
const generateTimeSlots = () => {
  const slots = []

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const period = hour >= 12 ? "PM" : "AM"

      const hour12 = hour % 12 || 12
      const formattedMinute = minute.toString().padStart(2, "0")

      slots.push(`${hour12}:${formattedMinute} ${period}`)
    }
  }

  return slots
}

const to24Hour = (time12h) => {
  const [time, modifier] = time12h.split(" ")
  let [hours, minutes] = time.split(":").map(Number)

  if (modifier === "PM" && hours !== 12) hours += 12
  if (modifier === "AM" && hours === 12) hours = 0

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

const TIME_SLOTS = generateTimeSlots()

export default function BusSearchForm({
  onSearch,
  isLoading,
}: BusSearchFormProps) {
  const router = useRouter()
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState<string>("")
  const [passengers, setPassengers] = useState(1)
  const [isSwapping, setIsSwapping] = useState(false)
  const [swapDirection, setSwapDirection] = useState<"left" | "right" | null>(
    null,
  )
  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)
  const [fieldError, setFieldError] = useState<{
    from?: string
    to?: string
    date?: string
    time?: string
  }>({})

  const fromInputRef = useRef<HTMLInputElement>(null)
  const toInputRef = useRef<HTMLInputElement>(null)

  // Fetch midpoints using React Query
  const {
    data: cities = [],
    isLoading: isLoadingCities,
    error: citiesError,
    refetch: refetchCities,
  } = useGetAllMidpoints()

  // Filter out selected destination from from list and vice versa
  const availableFromCities = cities.filter((city) => city !== to)
  const availableToCities = cities.filter((city) => city !== from)

  // Validate date and time
  const validateDateTime = (
    selectedDate: Date,
    selectedTime: string,
  ): boolean => {
    if (!selectedDate || !selectedTime) return false

    const now = new Date()
    const selectedDateTime = new Date(selectedDate)

    // Parse time
    const [hours, minutes] = selectedTime.split(":").map(Number)
    selectedDateTime.setHours(hours, minutes, 0, 0)

    // Clear time from now for comparison
    const nowWithoutTime = new Date(now)
    nowWithoutTime.setHours(0, 0, 0, 0)

    const selectedWithoutTime = new Date(selectedDateTime)
    selectedWithoutTime.setHours(0, 0, 0, 0)

    // If date is today, check if time is in the past
    if (selectedWithoutTime.getTime() === nowWithoutTime.getTime()) {
      return selectedDateTime > now
    }

    // If date is in the future, always valid
    return selectedDateTime > now
  }

  // Validate all fields
  useEffect(() => {
    const errors: { from?: string; to?: string; date?: string; time?: string } =
      {}

    if (from && to && from === to) {
      errors.from = "Departure and destination cannot be the same"
      errors.to = "Departure and destination cannot be the same"
    }

    if (date && time) {
      if (!validateDateTime(date, time)) {
        errors.time = "Selected time must be in the future"
        errors.date = "Please select a valid future date and time"
      }
    }

    setFieldError(errors)
  }, [from, to, date, time])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields before submission
    if (!from || !to || !date || !time || passengers < 1) {
      toast.error("Incomplete Form", {
        description: "Please fill in all required fields",
        icon: <AlertCircle className="h-4 w-4" />,
      })
      return
    }

    if (from === to) {
      toast.error("Invalid Route", {
        description: "Departure and destination cannot be the same",
        icon: <AlertCircle className="h-4 w-4" />,
      })
      setFieldError({
        from: "Departure and destination cannot be the same",
        to: "Departure and destination cannot be the same",
      })
      return
    }

    if (!validateDateTime(date, time)) {
      toast.error("Invalid Date & Time", {
        description: "Please select a future date and time for your journey",
        action: {
          label: "Fix Now",
          onClick: () => {
            // Set to next available time slot
            const now = new Date()
            const tomorrow = new Date(now)
            tomorrow.setDate(tomorrow.getDate() + 1)
            tomorrow.setHours(8, 0, 0, 0) // Set to 8:00 AM tomorrow

            setDate(tomorrow)
            setTime("08:00")

            toast.success("Time Updated", {
              description: "Journey time set to tomorrow 8:00 AM",
            })
          },
        },
      })
      return
    }

    // Show loading toast
    const loadingToast = toast.loading("Searching for buses...", {
      description: `From ${from} to ${to} on ${format(date, "PPP")} at ${time}`,
    })

    console.log("Search data", { from, to, date, time, passengers })
    // Call the search function
    onSearch({ from, to, date, time, passengers })

    // Dismiss loading toast after 1 second (or handle in parent)
    setTimeout(() => {
      toast.dismiss(loadingToast)
    }, 1000)
  }

  const swapLocations = () => {
    if (from && to) {
      setIsSwapping(true)
      setSwapDirection("right")

      // Animate the swap
      setTimeout(() => {
        const temp = from
        setFrom(to)
        setTo(temp)
        setSwapDirection("left")

        setTimeout(() => {
          setIsSwapping(false)
          setSwapDirection(null)
        }, 300)
      }, 150)

      toast.info("Locations Swapped", {
        description: `Now traveling from ${to} to ${from}`,
        duration: 3000,
      })
    }
  }

  const clearField = (field: "from" | "to") => {
    if (field === "from") {
      setFrom("")
      fromInputRef.current?.focus()
      setFromOpen(true)
      setFieldError((prev) => ({ ...prev, from: undefined }))
    } else {
      setTo("")
      toInputRef.current?.focus()
      setToOpen(true)
      setFieldError((prev) => ({ ...prev, to: undefined }))
    }
  }

  const incrementPassengers = () => {
    if (passengers < 5) {
      setPassengers((p) => p + 1)
      toast.success("Passenger added", {
        description: `Total passengers: ${passengers + 1}`,
        duration: 2000,
      })
    } else {
      toast.warning("Maximum reached", {
        description: "You can only book up to 5 passengers at once",
        duration: 3000,
      })
    }
  }

  const decrementPassengers = () => {
    if (passengers > 1) {
      setPassengers((p) => p - 1)
      toast.success("Passenger removed", {
        description: `Total passengers: ${passengers - 1}`,
        duration: 2000,
      })
    }
  }

  const isFormValid =
    from &&
    to &&
    date &&
    time &&
    passengers > 0 &&
    from !== to &&
    validateDateTime(date, time)

  // Render city selection command component
  const renderCityCommand = (
    open: boolean,
    setOpen: (open: boolean) => void,
    value: string,
    setValue: (value: string) => void,
    availableCities: string[],
    placeholder: string,
    type: "from" | "to",
  ) => (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.div
          animate={
            isSwapping &&
            ((type === "from" && swapDirection === "right") ||
              (type === "to" && swapDirection === "left"))
              ? { x: type === "from" ? 20 : -20, opacity: 0.5 }
              : isSwapping &&
                  ((type === "from" && swapDirection === "left") ||
                    (type === "to" && swapDirection === "right"))
                ? { x: type === "from" ? -20 : 20, opacity: 0.5 }
                : { x: 0, opacity: 1 }
          }
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full h-14 justify-between text-left font-normal border-2 rounded-xl group hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm relative overflow-hidden",
              value
                ? "border-orange-200 dark:border-orange-800"
                : "border-gray-200 dark:border-gray-700",
              fieldError.from &&
                fieldError.to &&
                "border-red-300 dark:border-red-800",
            )}
          >
            {/* Swap animation overlay */}
            <AnimatePresence>
              {isSwapping && (
                <motion.div
                  initial={{ x: type === "from" ? -100 : 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 0.2 }}
                  exit={{ x: type === "from" ? 100 : -100, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500"
                />
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3 overflow-hidden relative z-10">
              <motion.div
                animate={isSwapping ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.5 }}
              >
                <MapPin
                  className={cn(
                    "h-5 w-5 shrink-0",
                    type === "from" ? "text-green-500" : "text-red-500",
                  )}
                />
              </motion.div>
              <motion.span
                key={value}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "truncate",
                  value
                    ? "text-gray-900 dark:text-gray-100 font-medium"
                    : "text-gray-500 dark:text-gray-400",
                )}
              >
                {value || placeholder}
              </motion.span>
            </div>
            <div className="flex items-center gap-1 relative z-10">
              {value && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearField(type)
                  }}
                  className="p-1 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/30"
                >
                  <X className="h-4 w-4 text-gray-500 hover:text-orange-600" />
                </button>
              )}
              <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors shrink-0" />
            </div>
          </Button>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 border-0 shadow-2xl"
        align="start"
      >
        <Command className="border border-orange-100 dark:border-orange-900 rounded-xl overflow-hidden">
          <CommandInput
            placeholder={`Search ${availableCities.length} cities...`}
            className="h-12 border-0 focus:ring-0"
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            {isLoadingCities ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                <span className="ml-2 text-gray-500">Loading cities...</span>
              </div>
            ) : citiesError ? (
              <div className="py-8 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-gray-500 mb-2">Failed to load cities</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    refetchCities()
                    toast.promise(refetchCities, {
                      loading: "Loading cities...",
                      success: "Cities loaded successfully",
                      error: "Failed to load cities",
                    })
                  }}
                  className="text-orange-500 border-orange-200 hover:bg-orange-50"
                >
                  Try again
                </Button>
              </div>
            ) : (
              <>
                <CommandEmpty className="py-6 text-center text-gray-500">
                  No city found.
                </CommandEmpty>
                <CommandGroup className="max-h-none">
                  {availableCities.map((city) => (
                    <CommandItem
                      key={city}
                      value={city}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue)
                        setOpen(false)
                        setFieldError((prev) => ({
                          ...prev,
                          from: undefined,
                          to: undefined,
                        }))

                        toast.success(
                          `${type === "from" ? "Departure" : "Destination"} selected`,
                          {
                            description: `${currentValue} set as ${type === "from" ? "departure" : "destination"} city`,
                            duration: 2000,
                          },
                        )
                      }}
                      className="flex items-center gap-3 py-3 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/30"
                      disabled={value === city}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-full",
                          value === city
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800",
                        )}
                      >
                        <MapPin className="w-3 h-3" />
                      </motion.div>
                      <span
                        className={cn(
                          value === city
                            ? "font-semibold text-orange-600 dark:text-orange-400"
                            : "",
                        )}
                      >
                        {city}
                      </span>
                      {value === city && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto"
                        >
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500" />
                        </motion.div>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
          <div className="p-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 text-center">
              {availableCities.length} cities available
            </p>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative"
    >
      {/* Main Card */}
      <Card className="relative overflow-hidden border-0 shadow-none bg-gradient-to-br from-white via-orange-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className=" relative z-0">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2.5 rounded-xl cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                  onClick={() => router.back()}
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Search a Bus
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Find and book buses across Ethiopia
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {isLoadingCities ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    `${cities.length}+ Routes`
                  )}
                </Badge>
              </motion.div>
            </div>
          </motion.div>

          {/* Error Alert */}
          {citiesError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load cities. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {/* Same location error */}
          {fieldError.from && fieldError.to && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {fieldError.from}
              </p>
            </motion.div>
          )}

          {/* Date/Time Error Alert */}
          {fieldError.time && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
            >
              <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Timer className="h-4 w-4" />
                {fieldError.time}
              </p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 px-10">
            {/* Route Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-800/50 dark:to-gray-800/30 rounded-2xl p-6 px-8 relative overflow-hidden"
            >
              {/* Background animation during swap */}
              <AnimatePresence>
                {isSwapping && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.1, scale: 1.5 }}
                    exit={{ opacity: 0, scale: 2 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-3xl"
                  />
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
                {/* From Location - ComboBox */}
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      animate={
                        isSwapping && swapDirection === "right"
                          ? { x: [0, -5, 0] }
                          : {}
                      }
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
                    </motion.div>
                    <motion.label
                      animate={isSwapping ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      DEPARTURE
                    </motion.label>
                  </div>
                  {renderCityCommand(
                    fromOpen,
                    setFromOpen,
                    from,
                    setFrom,
                    availableFromCities,
                    "Select departure city",
                    "from",
                  )}
                </div>

                {/* Swap Button */}
                <div className="lg:col-span-2 flex items-center justify-center">
                  <motion.button
                    type="button"
                    onClick={swapLocations}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={
                      isSwapping
                        ? {
                            rotate: [0, 180, 360],
                            scale: [1, 1.2, 1],
                          }
                        : {}
                    }
                    transition={{ duration: 0.6 }}
                    className={cn(
                      "p-3.5 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden",
                      from && to && from !== to
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                        : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed",
                    )}
                    disabled={!from || !to || from === to}
                  >
                    {/* Swap animation rings */}
                    <AnimatePresence>
                      {isSwapping && (
                        <>
                          <motion.div
                            initial={{ scale: 0, opacity: 0.5 }}
                            animate={{ scale: 2, opacity: 0 }}
                            exit={{ scale: 2.5, opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0 rounded-full bg-white"
                          />
                          <motion.div
                            initial={{ scale: 0, opacity: 0.5 }}
                            animate={{ scale: 1.8, opacity: 0 }}
                            exit={{ scale: 2.3, opacity: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="absolute inset-0 rounded-full bg-orange-300"
                          />
                        </>
                      )}
                    </AnimatePresence>
                    <ArrowRightLeft className="w-5 h-5 relative z-10" />
                  </motion.button>
                </div>

                {/* To Location - ComboBox */}
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      animate={
                        isSwapping && swapDirection === "left"
                          ? { x: [0, 5, 0] }
                          : {}
                      }
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-rose-500" />
                    </motion.div>
                    <motion.label
                      animate={isSwapping ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      DESTINATION
                    </motion.label>
                  </div>
                  {renderCityCommand(
                    toOpen,
                    setToOpen,
                    to,
                    setTo,
                    availableToCities,
                    "Select destination city",
                    "to",
                  )}
                </div>
              </div>
            </motion.div>

            {/* Date, Time & Passengers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Departure Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-orange-500" />
                  TRAVEL DATE
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-14 justify-between text-left font-normal border-2 rounded-xl group hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
                          fieldError.date
                            ? "border-amber-300 dark:border-amber-800"
                            : "",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="h-5 w-5 text-orange-500" />
                          <div>
                            <div className="font-medium">
                              {format(date, "EEE, MMM d")}
                            </div>
                            <div className="text-xs text-gray-500">
                              Select departure date
                            </div>
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                      </Button>
                    </motion.div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 border-0 shadow-2xl"
                    align="start"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-xl overflow-hidden border border-orange-100 dark:border-orange-900"
                    >
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          if (selectedDate) {
                            setDate(selectedDate)
                            // Clear time if selected date is in the past
                            if (selectedDate < new Date()) {
                              setTime("")
                              toast.warning("Invalid Date", {
                                description:
                                  "Please select a future date for your journey",
                              })
                            } else {
                              toast.success("Date selected", {
                                description: `Travel date set to ${format(selectedDate, "PPP")}`,
                                duration: 2000,
                              })
                            }
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="rounded-xl"
                        classNames={{
                          day_selected:
                            "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600",
                          day_today:
                            "border border-orange-300 dark:border-orange-700",
                          day_range_middle:
                            "bg-orange-100 dark:bg-orange-900/30",
                          nav_button:
                            "hover:bg-orange-50 dark:hover:bg-orange-900/20",
                        }}
                      />
                    </motion.div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Departure Time */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Timer className="w-5 h-5 text-orange-500" />
                  DEPARTURE TIME
                </label>
                <Select
                  value={time}
                  onValueChange={(selectedTime) => {
                    setTime(selectedTime)

                    if (!validateDateTime(date, selectedTime)) {
                      toast.error("Invalid Time", {
                        description: "Selected time must be in the future",
                        action: {
                          label: "Set to next hour",
                          onClick: () => {
                            const nextHour = new Date()
                            nextHour.setHours(nextHour.getHours() + 1)
                            nextHour.setMinutes(0, 0, 0)
                            const hours = nextHour
                              .getHours()
                              .toString()
                              .padStart(2, "0")
                            const minutes = nextHour
                              .getMinutes()
                              .toString()
                              .padStart(2, "0")
                            setTime(`${hours}:${minutes}`)
                          },
                        },
                      })
                    } else {
                      toast.success("Time selected", {
                        description: `Departure time set to ${selectedTime}`,
                        duration: 2000,
                      })
                    }
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full h-14 border-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
                      fieldError.time
                        ? "border-amber-300 dark:border-amber-800"
                        : "border-gray-200 dark:border-gray-700",
                    )}
                  >
                    <SelectValue
                      placeholder="Select time"
                      className="text-lg"
                    />
                  </SelectTrigger>

                  <SelectContent className="max-h-[300px]">
                    {TIME_SLOTS.map((slot) => {
                      const slot24 = to24Hour(slot)
                      const isPastTime = date && !validateDateTime(date, slot24)

                      return (
                        <SelectItem
                          key={slot}
                          value={slot24}
                          disabled={isPastTime}
                          className={cn(
                            "h-9 flex items-center px-3",
                            isPastTime && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            {slot}
                            {isPastTime && (
                              <span className="text-xs text-gray-400 ml-2">
                                (Past)
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>

                {date && time && !validateDateTime(date, time) && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-amber-600 mt-1"
                  >
                    ⚠️ Selected time is in the past
                  </motion.p>
                )}
              </div>

              {/* Passengers */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-orange-500" />
                  PASSENGERS
                </label>
                <div className="relative">
                  <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 rounded-xl p-2 transition-all duration-300">
                    <motion.button
                      type="button"
                      onClick={decrementPassengers}
                      disabled={passengers <= 1}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      animate={
                        passengers <= 1
                          ? {}
                          : {
                              boxShadow: [
                                "0 0 0 0 rgba(249,115,22,0)",
                                "0 0 0 4px rgba(249,115,22,0.1)",
                                "0 0 0 0 rgba(249,115,22,0)",
                              ],
                            }
                      }
                      transition={{ duration: 1, repeat: Infinity }}
                      className={cn(
                        "p-3 rounded-lg transition-all duration-300",
                        passengers <= 1
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                          : "bg-orange-50 dark:bg-orange-900/30 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/50",
                      )}
                    >
                      <span className="text-xl font-bold">-</span>
                    </motion.button>

                    <div className="flex-1 text-center">
                      <motion.div
                        key={passengers}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                          {passengers}
                        </span>
                        <Users className="w-5 h-5 text-orange-500" />
                      </motion.div>
                      <div className="text-xs text-gray-500 mt-1">
                        {passengers === 1 ? "Passenger" : "Passengers"} (Max 5)
                      </div>
                    </div>

                    <motion.button
                      type="button"
                      onClick={incrementPassengers}
                      disabled={passengers >= 5}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      animate={
                        passengers >= 5
                          ? {}
                          : {
                              boxShadow: [
                                "0 0 0 0 rgba(249,115,22,0)",
                                "0 0 0 4px rgba(249,115,22,0.1)",
                                "0 0 0 0 rgba(249,115,22,0)",
                              ],
                            }
                      }
                      transition={{ duration: 1, repeat: Infinity }}
                      className={cn(
                        "p-3 rounded-lg transition-all duration-300",
                        passengers >= 5
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                          : "bg-orange-50 dark:bg-orange-900/30 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/50",
                      )}
                    >
                      <span className="text-xl font-bold">+</span>
                    </motion.button>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center mt-2"
                  >
                    <span className="text-xs text-gray-500 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
                      Maximum 5 passengers per booking
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Search Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileTap={{ scale: 0.99 }}
              className="pt-6 border-t border-gray-100 dark:border-gray-800"
            >
              <Button
                type="submit"
                disabled={!isFormValid || isLoading || isLoadingCities}
                className={cn(
                  "w-full h-16 text-lg font-semibold rounded-lg cursor-pointer transition-all duration-300 relative overflow-hidden group",
                  isFormValid && !isLoadingCities
                    ? "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 shadow-orange-500/25 hover:shadow-orange-500/40"
                    : "bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 cursor-not-allowed",
                )}
              >
                {/* Shimmer effect */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />

                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30"></div>
                      <div className="absolute inset-0 animate-spin rounded-full h-6 w-6 border-t-2 border-white border-solid"></div>
                    </div>
                    <span className="font-medium">Searching buses...</span>
                  </div>
                ) : isLoadingCities ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="font-medium">Loading cities...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Search className="w-6 h-6" />
                    <span className="font-bold">SEARCH BUSES</span>
                  </div>
                )}
              </Button>

              {!isFormValid && !isLoadingCities && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-3"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {!from && "Please select departure city • "}
                    {!to && "Please select destination city • "}
                    {from &&
                      to &&
                      from === to &&
                      "Departure and destination cannot be the same • "}
                    {!date && "Please select travel date • "}
                    {!time && "Please select departure time • "}
                    {date &&
                      time &&
                      !validateDateTime(date, time) &&
                      "Please select a future time • "}
                    {passengers < 1 && "Please select number of passengers"}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </form>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  icon: Tag,
                  text: "Best Price",
                  desc: "Lowest fares guaranteed",
                  color: "text-green-500",
                  bg: "bg-green-50 dark:bg-green-900/20",
                },
                {
                  icon: Clock,
                  text: "Live Tracking",
                  desc: "Real-time bus location",
                  color: "text-blue-500",
                  bg: "bg-blue-50 dark:bg-blue-900/20",
                },
                {
                  icon: Timer,
                  text: "Flexible Timing",
                  desc: "Multiple departure times",
                  color: "text-purple-500",
                  bg: "bg-purple-50 dark:bg-purple-900/20",
                },
                {
                  icon: Sparkles,
                  text: "Premium",
                  desc: "Luxury buses",
                  color: "text-amber-500",
                  bg: "bg-amber-50 dark:bg-amber-900/20",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex items-start gap-3 cursor-default"
                >
                  <div className={`p-2.5 rounded-xl ${feature.bg}`}>
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {feature.text}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {feature.desc}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
