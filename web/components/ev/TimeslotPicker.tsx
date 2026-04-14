"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Zap,
  Lock,
  User,
} from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { motion, AnimatePresence } from "framer-motion"
import {
  format,
  addDays,
  isSameDay,
  parseISO,
  setHours,
  setMinutes,
  addMinutes,
  startOfDay,
  isBefore,
  isToday,
  differenceInMinutes,
} from "date-fns"

interface TimeSlot {
  id: string
  startTime: Date
  endTime: Date
  isAvailable: boolean
  reservedBy?: string
}

interface Reservation {
  id: string
  pointId: number
  userId: string
  userName: string
  startTime: string
  endTime: string
  date: string
}

interface TimeSlotPickerProps {
  selectedPointId: number | null
  workingHours: {
    start: string
    end: string
  }
  reservations?: Reservation[]
  onTimeSlotSelect: (slot: TimeSlot | null) => void
  selectedTimeSlot: TimeSlot | null
  estimatedTimeMin?: number
  bufferTimeMin?: number
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if a time range overlaps with any reservation
 */
const isTimeRangeAvailable = (
  startTime: Date,
  endTime: Date,
  reservations: Reservation[],
  selectedPointId: number,
  currentDate: Date,
): { isAvailable: boolean; reservedBy?: string } => {
  // Find any reservation that overlaps with the requested time range
  const conflictingReservation = reservations.find((reservation) => {
    // Check if reservation belongs to the selected charging point
    if (reservation.pointId !== selectedPointId) return false

    // Check if reservation is on the same date
    const reservationDate = parseISO(reservation.date)
    if (!isSameDay(reservationDate, currentDate)) return false

    // Parse reservation times
    const reservationStart = parseISO(
      `${reservation.date}T${reservation.startTime}`,
    )
    const reservationEnd = parseISO(
      `${reservation.date}T${reservation.endTime}`,
    )

    // OVERLAP LOGIC: Overlap exists if:
    // startTime < reservationEnd AND endTime > reservationStart
    return startTime < reservationEnd && endTime > reservationStart
  })

  if (conflictingReservation) {
    return {
      isAvailable: false,
      reservedBy: conflictingReservation.userName,
    }
  }

  return { isAvailable: true }
}

/**
 * Generate dynamic time slots based on estimated time + buffer time
 * Each slot starts after the previous slot's end time + buffer time
 */
const generateDynamicTimeSlots = (
  date: Date,
  workingHours: { start: string; end: string },
  estimatedTimeMin: number,
  bufferTimeMin: number,
  reservations: Reservation[],
  selectedPointId: number,
): TimeSlot[] => {
  const slots: TimeSlot[] = []

  // Parse working hours
  const startHour = parseInt(workingHours.start.split(":")[0])
  const startMinute = parseInt(workingHours.start.split(":")[1])
  const endHour = parseInt(workingHours.end.split(":")[0])
  const endMinute = parseInt(workingHours.end.split(":")[1])

  // Set working hours boundaries
  const workStart = setHours(setMinutes(date, startMinute), startHour)
  const workEnd = setHours(setMinutes(date, endMinute), endHour)

  // Get all reservations for this point and date to use as blockers
  const dayReservations = reservations.filter(
    (r) => r.pointId === selectedPointId && isSameDay(parseISO(r.date), date),
  )

  // Sort reservations by start time
  const sortedReservations = [...dayReservations].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  )

  let currentStart = new Date(workStart)
  let slotId = 0

  while (currentStart < workEnd) {
    // Calculate end time based on estimated duration
    let currentEnd = addMinutes(currentStart, estimatedTimeMin)

    // Check if this slot would exceed working hours
    if (currentEnd > workEnd) {
      break
    }

    // Check if this slot overlaps with any reservation
    const { isAvailable, reservedBy } = isTimeRangeAvailable(
      currentStart,
      currentEnd,
      reservations,
      selectedPointId,
      date,
    )

    // Only add the slot if it's available OR if we want to show reserved slots
    // We'll show both available and reserved slots for transparency
    slots.push({
      id: `slot-${slotId++}-${format(currentStart, "HH:mm")}`,
      startTime: new Date(currentStart),
      endTime: currentEnd,
      isAvailable,
      reservedBy,
    })

    // Calculate next start time: current start + estimated time + buffer time
    // This ensures proper gaps between slots
    currentStart = addMinutes(currentStart, estimatedTimeMin + bufferTimeMin)
  }

  return slots
}

/**
 * Get peak hour status (6 PM - 9 PM)
 */
const getPeakHourStatus = (time: Date): boolean => {
  const hour = time.getHours()
  return hour >= 18 && hour <= 21
}

/**
 * Format duration for display
 */
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} min`
  if (mins === 0) return `${hours} hour${hours > 1 ? "s" : ""}`
  return `${hours}h ${mins}m`
}

// ==================== MAIN COMPONENT ====================

export function TimeSlotPicker({
  selectedPointId,
  workingHours,
  reservations = [],
  onTimeSlotSelect,
  selectedTimeSlot,
  estimatedTimeMin = 60,
  bufferTimeMin = 15,
}: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily")
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)
  const [showCalendar, setShowCalendar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Generate date range for horizontal picker (next 10 days)
  const dateRange = useMemo(() => {
    const dates = []
    for (let i = 0; i < 10; i++) {
      const date = addDays(new Date(), i)
      dates.push(date)
    }
    return dates
  }, [])

  // Generate dynamic time slots
  useEffect(() => {
    if (!selectedPointId) {
      setTimeSlots([])
      return
    }

    setIsLoading(true)

    const timer = setTimeout(() => {
      // Generate slots with dynamic intervals
      const slots = generateDynamicTimeSlots(
        selectedDate,
        workingHours,
        estimatedTimeMin,
        bufferTimeMin,
        reservations,
        selectedPointId,
      )

      setTimeSlots(slots)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [
    selectedPointId,
    selectedDate,
    workingHours,
    reservations,
    estimatedTimeMin,
    bufferTimeMin,
  ])

  // Clear selected slot when parameters change
  useEffect(() => {
    if (selectedTimeSlot) {
      onTimeSlotSelect(null)
    }
  }, [estimatedTimeMin, bufferTimeMin, selectedDate])

  const isSlotSelected = useCallback(
    (slot: TimeSlot): boolean => {
      if (!selectedTimeSlot) return false
      return selectedTimeSlot.startTime.getTime() === slot.startTime.getTime()
    },
    [selectedTimeSlot],
  )

  const handleSlotClick = useCallback(
    (slot: TimeSlot) => {
      if (!slot.isAvailable) return

      if (isSlotSelected(slot)) {
        onTimeSlotSelect(null)
      } else {
        onTimeSlotSelect(slot)
      }
    },
    [isSlotSelected, onTimeSlotSelect],
  )

  const nextAvailableSlot = useMemo(() => {
    const now = new Date()
    return (
      timeSlots.find((slot) => slot.startTime > now && slot.isAvailable) || null
    )
  }, [timeSlots])

  const isFullyBooked = useMemo(() => {
    return timeSlots.length > 0 && !timeSlots.some((slot) => slot.isAvailable)
  }, [timeSlots])

  const handleConfirmBooking = useCallback(() => {
    if (!selectedTimeSlot) return
    console.log("Booking confirmed:", {
      pointId: selectedPointId,
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: format(selectedTimeSlot.startTime, "HH:mm"),
      endTime: format(selectedTimeSlot.endTime, "HH:mm"),
      durationMinutes: estimatedTimeMin,
    })
    alert(
      `✅ Booking confirmed!\n\nPoint: #${selectedPointId}\nDate: ${format(selectedDate, "MMMM d, yyyy")}\nTime: ${format(selectedTimeSlot.startTime, "h:mm a")} - ${format(selectedTimeSlot.endTime, "h:mm a")}\nDuration: ${formatDuration(estimatedTimeMin)}\nBuffer: ${bufferTimeMin} min before/after`,
    )
  }, [
    selectedTimeSlot,
    selectedPointId,
    selectedDate,
    estimatedTimeMin,
    bufferTimeMin,
  ])

  // Loading Skeleton Component
  const SlotSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-24 bg-gray-200 rounded-xl"></div>
        </div>
      ))}
    </div>
  )

  if (!selectedPointId) {
    return (
      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">
            Select a charging point first
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Choose a point to see available time slots
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                Select Time Slot
              </CardTitle>
              <CardDescription className="mt-1 text-gray-600">
                Choose an available time slot for charging point{" "}
                {selectedPointId}
              </CardDescription>
            </div>

            {/* View Toggle */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === "daily" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("daily")}
                className={`rounded-md ${viewMode === "daily" ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white" : ""}`}
              >
                Daily View
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Horizontal Date Picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-gray-700">
                  Select Date
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCalendar(!showCalendar)}
                className="text-xs text-emerald-600 hover:text-emerald-700"
              >
                {showCalendar ? "Hide Calendar" : "Show Calendar"}
              </Button>
            </div>

            {/* Horizontal Scrollable Date Picker */}
            <div className="relative">
              <div className="overflow-x-auto hide-scrollbar pb-2">
                <div className="flex gap-2 min-w-max">
                  {dateRange.map((date) => {
                    const isSelectedDate = isSameDay(date, selectedDate)
                    const isPastDate = isBefore(date, startOfDay(new Date()))

                    return (
                      <motion.button
                        key={date.toISOString()}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => !isPastDate && setSelectedDate(date)}
                        disabled={isPastDate}
                        className={`
                          px-4 py-2 rounded-xl border-2 transition-all min-w-[80px]
                          ${isPastDate ? "opacity-40 cursor-not-allowed bg-gray-100" : "cursor-pointer"}
                          ${
                            isSelectedDate
                              ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-md"
                              : "border-gray-200 hover:border-emerald-300 bg-white"
                          }
                        `}
                      >
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-500">
                            {format(date, "EEE")}
                          </div>
                          <div
                            className={`text-lg font-bold ${isSelectedDate ? "text-emerald-600" : "text-gray-700"}`}
                          >
                            {format(date, "d")}
                          </div>
                          <div className="text-xs text-gray-400">
                            {format(date, "MMM")}
                          </div>
                          {isToday(date) && (
                            <Badge className="mt-1 bg-emerald-500 text-white text-[10px] px-1 py-0">
                              Today
                            </Badge>
                          )}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Optional Calendar */}
            <AnimatePresence>
              {showCalendar && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex justify-center pt-4">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-xl border shadow-sm"
                      disabled={(date) => date < new Date()}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Session Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-900">
                  Session Duration:
                </span>
                <span className="text-sm text-emerald-700 font-semibold">
                  {formatDuration(estimatedTimeMin)}
                </span>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Buffer Time:
                </span>
                <span className="text-sm text-green-700 font-semibold">
                  {formatDuration(bufferTimeMin)} between sessions
                </span>
              </div>
            </div>
          </div>

          {/* Time Slots */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-gray-700">
                  Available time slots for{" "}
                  {format(selectedDate, "MMMM d, yyyy")}
                </span>
              </div>
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200"
              >
                {timeSlots.filter((s) => s.isAvailable).length} slots available
              </Badge>
            </div>

            {isLoading ? (
              <SlotSkeleton />
            ) : timeSlots.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-amber-50 rounded-xl border border-amber-200"
              >
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-amber-500" />
                <p className="text-amber-700 font-medium">
                  No time slots available
                </p>
                <p className="text-sm text-amber-600 mt-1">
                  Try adjusting duration or buffer time, or select another date
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <AnimatePresence>
                  {timeSlots.map((slot, index) => {
                    const isSelected = isSlotSelected(slot)
                    const isPeakHour = getPeakHourStatus(slot.startTime)

                    let slotColor = ""
                    if (isSelected) {
                      slotColor =
                        "border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-md ring-2 ring-emerald-500/20"
                    } else if (!slot.isAvailable) {
                      slotColor =
                        "border-red-300 bg-gradient-to-br from-red-50 to-red-100 cursor-not-allowed opacity-90"
                    } else {
                      slotColor =
                        "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-400 hover:shadow-md cursor-pointer"
                    }

                    return (
                      <motion.button
                        key={slot.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={
                          slot.isAvailable ? { scale: 1.02, y: -2 } : {}
                        }
                        whileTap={slot.isAvailable ? { scale: 0.98 } : {}}
                        onClick={() => handleSlotClick(slot)}
                        onMouseEnter={() => setHoveredSlot(slot.id)}
                        onMouseLeave={() => setHoveredSlot(null)}
                        disabled={!slot.isAvailable}
                        className={`relative p-2 rounded-xl border-2 transition-all duration-200 ${slotColor}`}
                      >
                        <div className="text-center">
                          {/* Start Time */}
                          <div className="font-bold text-gray-800">
                            {format(slot.startTime, "h:mm a")}
                          </div>

                          {/* Duration Arrow */}
                          <div className="flex items-center justify-center gap-1 my-2">
                            <div className="h-px flex-1 bg-gray-300"></div>
                            <span className="text-xs text-gray-500">for</span>
                            <div className="h-px flex-1 bg-gray-300"></div>
                          </div>

                          {/* End Time */}
                          <div className="text-sm text-gray-600">
                            → {format(slot.endTime, "h:mm a")}
                          </div>

                          {/* Duration Badge */}
                          <div className="text-xs text-gray-400 mt-1">
                            {formatDuration(estimatedTimeMin)}
                          </div>

                          {/* Status Badges */}
                          {!slot.isAvailable && (
                            <Badge
                              variant="destructive"
                              className="mt-2 text-xs bg-red-500"
                            >
                              Reserved
                            </Badge>
                          )}

                          {isPeakHour && slot.isAvailable && (
                            <Badge className="mt-2 bg-amber-500 text-white text-xs">
                              Peak Hour
                            </Badge>
                          )}

                          {isSelected && (
                            <Badge className="mt-2 bg-emerald-500 text-white text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>

                        {/* Tooltip for reserved slots */}
                        {!slot.isAvailable &&
                          hoveredSlot === slot.id &&
                          slot.reservedBy && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap z-10 shadow-lg"
                            >
                              <User className="h-3 w-3 inline mr-1" />
                              Reserved by {slot.reservedBy}
                            </motion.div>
                          )}

                        {isSelected && (
                          <motion.div
                            layoutId="selectedSlotIndicator"
                            className="absolute -top-2 -right-2"
                          >
                            <div className="h-5 w-5 rounded-full bg-emerald-500/90 backdrop-blur-md border-2 border-white shadow-lg" />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Next Available Slot Suggestion */}
            {nextAvailableSlot && !isLoading && timeSlots.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <div>
                      <span className="text-sm font-medium text-emerald-900">
                        Next Available Slot:
                      </span>
                      <span className="text-sm text-emerald-700 ml-2 font-semibold">
                        {format(nextAvailableSlot.startTime, "h:mm a")} →{" "}
                        {format(nextAvailableSlot.endTime, "h:mm a")}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSlotClick(nextAvailableSlot)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Select This Slot
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 pt-4 border-t flex-wrap justify-center">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-gray-600">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-3 w-3 text-red-500" />
              <span className="text-xs text-gray-600">Locked by others</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-amber-500" />
              <span className="text-xs text-gray-600">Peak Hours (6-9 PM)</span>
            </div>
          </div>

          {/* Buffer Explanation */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            ⏱️{" "}
            <span className="font-semibold text-emerald-600">
              {bufferTimeMin}-minute buffer
            </span>{" "}
            is added between sessions to ensure smooth transitions
            <br />
            📍 Slots start at: first available time, then every{" "}
            {formatDuration(estimatedTimeMin + bufferTimeMin)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// COMPLETELY REWORKED MOCK DATA WITH VISIBLE RESERVATIONS
const today = new Date()
const tomorrow = addDays(today, 1)

export const mockReservations: Reservation[] = [
  // Point #1 - Today's reservations (clearly visible)
  {
    id: "1",
    pointId: 1,
    userId: "user1",
    userName: "John D.",
    startTime: "09:00",
    endTime: "10:30",
    date: format(today, "yyyy-MM-dd"),
  },
  {
    id: "2",
    pointId: 1,
    userId: "user2",
    userName: "Sarah M.",
    startTime: "11:00",
    endTime: "12:30",
    date: format(today, "yyyy-MM-dd"),
  },
  {
    id: "3",
    pointId: 1,
    userId: "user3",
    userName: "Mike R.",
    startTime: "14:00",
    endTime: "16:00",
    date: format(today, "yyyy-MM-dd"),
  },
  {
    id: "4",
    pointId: 1,
    userId: "user4",
    userName: "Emma W.",
    startTime: "17:00",
    endTime: "18:30",
    date: format(today, "yyyy-MM-dd"),
  },
  {
    id: "7",
    pointId: 1,
    userId: "user7",
    userName: "David C.",
    startTime: "19:00",
    endTime: "20:30",
    date: format(today, "yyyy-MM-dd"),
  },

  // Point #1 - Tomorrow's reservations
  {
    id: "5",
    pointId: 1,
    userId: "user5",
    userName: "Alex K.",
    startTime: "10:00",
    endTime: "11:30",
    date: format(tomorrow, "yyyy-MM-dd"),
  },
  {
    id: "8",
    pointId: 1,
    userId: "user8",
    userName: "Sophia L.",
    startTime: "15:00",
    endTime: "16:30",
    date: format(tomorrow, "yyyy-MM-dd"),
  },

  // Point #2 - Today's reservations
  {
    id: "6",
    pointId: 2,
    userId: "user6",
    userName: "Lisa M.",
    startTime: "13:00",
    endTime: "14:30",
    date: format(today, "yyyy-MM-dd"),
  },
  {
    id: "9",
    pointId: 2,
    userId: "user9",
    userName: "Robert K.",
    startTime: "16:00",
    endTime: "17:30",
    date: format(today, "yyyy-MM-dd"),
  },
]
