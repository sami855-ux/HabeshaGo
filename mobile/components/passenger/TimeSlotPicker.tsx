// TimeSlotPicker.tsx
import React, { useState, useEffect, useMemo, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Modal,
  FlatList,
} from "react-native"
import {
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  TrendingUp,
  Zap,
  Lock,
  User,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native"
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
  isAfter,
} from "date-fns"

interface TimeSlot {
  id: string
  startTime: Date
  endTime: Date
  isAvailable: boolean
  reservedBy?: string
  isPast?: boolean
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

const isTimeRangeAvailable = (
  startTime: Date,
  endTime: Date,
  reservations: Reservation[],
  selectedPointId: number,
  currentDate: Date,
): { isAvailable: boolean; reservedBy?: string } => {
  const conflictingReservation = reservations.find((reservation) => {
    if (reservation.pointId !== selectedPointId) return false
    const reservationDate = parseISO(reservation.date)
    if (!isSameDay(reservationDate, currentDate)) return false
    const reservationStart = parseISO(
      `${reservation.date}T${reservation.startTime}`,
    )
    const reservationEnd = parseISO(
      `${reservation.date}T${reservation.endTime}`,
    )
    return startTime < reservationEnd && endTime > reservationStart
  })

  if (conflictingReservation) {
    return { isAvailable: false, reservedBy: conflictingReservation.userName }
  }
  return { isAvailable: true }
}

const isPastTimeSlot = (startTime: Date, endTime: Date): boolean => {
  const now = new Date()
  return endTime < now
}

const generateDynamicTimeSlots = (
  date: Date,
  workingHours: { start: string; end: string },
  estimatedTimeMin: number,
  bufferTimeMin: number,
  reservations: Reservation[],
  selectedPointId: number,
): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const startHour = parseInt(workingHours.start.split(":")[0])
  const startMinute = parseInt(workingHours.start.split(":")[1])
  const endHour = parseInt(workingHours.end.split(":")[0])
  const endMinute = parseInt(workingHours.end.split(":")[1])

  const workStart = setHours(setMinutes(date, startMinute), startHour)
  const workEnd = setHours(setMinutes(date, endMinute), endHour)

  const sortedReservations = [...reservations]
    .filter(
      (r) => r.pointId === selectedPointId && isSameDay(parseISO(r.date), date),
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  let currentStart = new Date(workStart)
  let slotId = 0

  while (currentStart < workEnd) {
    let currentEnd = addMinutes(currentStart, estimatedTimeMin)
    if (currentEnd > workEnd) break

    const { isAvailable, reservedBy } = isTimeRangeAvailable(
      currentStart,
      currentEnd,
      reservations,
      selectedPointId,
      date,
    )

    const isPast = isPastTimeSlot(currentStart, currentEnd)

    slots.push({
      id: `slot-${slotId++}-${format(currentStart, "HH:mm")}`,
      startTime: new Date(currentStart),
      endTime: currentEnd,
      isAvailable: isAvailable && !isPast,
      reservedBy,
      isPast,
    })

    currentStart = addMinutes(currentStart, estimatedTimeMin + bufferTimeMin)
  }

  return slots
}

const getPeakHourStatus = (time: Date): boolean => {
  const hour = time.getHours()
  return hour >= 18 && hour <= 21
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} min`
  if (mins === 0) return `${hours} hour${hours > 1 ? "s" : ""}`
  return `${hours}h ${mins}m`
}

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
  const [showCalendar, setShowCalendar] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current

  const dateRange = useMemo(() => {
    const dates = []
    for (let i = 0; i < 10; i++) {
      dates.push(addDays(new Date(), i))
    }
    return dates
  }, [])

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [])

  useEffect(() => {
    if (!selectedPointId) {
      setTimeSlots([])
      return
    }

    setIsLoading(true)
    const timer = setTimeout(() => {
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

  useEffect(() => {
    if (selectedTimeSlot) {
      onTimeSlotSelect(null)
    }
  }, [estimatedTimeMin, bufferTimeMin, selectedDate])

  const isSlotSelected = (slot: TimeSlot): boolean => {
    if (!selectedTimeSlot) return false
    return selectedTimeSlot.startTime.getTime() === slot.startTime.getTime()
  }

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.isAvailable || slot.isPast) return
    if (isSlotSelected(slot)) {
      onTimeSlotSelect(null)
    } else {
      onTimeSlotSelect(slot)
    }
  }

  const nextAvailableSlot = useMemo(() => {
    const now = new Date()
    return (
      timeSlots.find((slot) => slot.startTime > now && slot.isAvailable) || null
    )
  }, [timeSlots])

  if (!selectedPointId) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <CalendarIcon size={32} color="#9ca3af" />
          </View>
          <Text style={styles.emptyTitle}>Select a charging point first</Text>
          <Text style={styles.emptySubtitle}>
            Choose a point to see available time slots
          </Text>
        </View>
      </Animated.View>
    )
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconContainer}>
            <Clock size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Select Time Slot</Text>
            <Text style={styles.cardSubtitle}>
              Choose an available time slot for charging point {selectedPointId}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          {/* Horizontal Date Picker */}
          <View style={styles.datePickerSection}>
            <View style={styles.datePickerHeader}>
              <View style={styles.datePickerTitle}>
                <CalendarIcon size={16} color="#10b981" />
                <Text style={styles.datePickerLabel}>Select Date</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCalendar(!showCalendar)}>
                <Text style={styles.calendarToggle}>
                  {showCalendar ? "Hide Calendar" : "Show Calendar"}
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={dateRange}
              keyExtractor={(item) => item.toISOString()}
              contentContainerStyle={styles.dateList}
              renderItem={({ item: date }) => {
                const isSelectedDate = isSameDay(date, selectedDate)
                const isPastDate = isBefore(date, startOfDay(new Date()))
                return (
                  <TouchableOpacity
                    style={[
                      styles.dateItem,
                      isSelectedDate && styles.dateItemSelected,
                      isPastDate && styles.dateItemDisabled,
                    ]}
                    onPress={() => !isPastDate && setSelectedDate(date)}
                    disabled={isPastDate}
                  >
                    <Text
                      style={[
                        styles.dateDay,
                        isSelectedDate && styles.dateTextSelected,
                      ]}
                    >
                      {format(date, "EEE")}
                    </Text>
                    <Text
                      style={[
                        styles.dateNumber,
                        isSelectedDate && styles.dateTextSelected,
                      ]}
                    >
                      {format(date, "d")}
                    </Text>
                    <Text
                      style={[
                        styles.dateMonth,
                        isSelectedDate && styles.dateTextSelected,
                      ]}
                    >
                      {format(date, "MMM")}
                    </Text>
                    {isToday(date) && (
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayBadgeText}>Today</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )
              }}
            />
          </View>

          {/* Session Configuration */}
          <View style={styles.configSection}>
            <View style={styles.configCard}>
              <Clock size={16} color="#10b981" />
              <Text style={styles.configLabel}>Session Duration:</Text>
              <Text style={styles.configValue}>
                {formatDuration(estimatedTimeMin)}
              </Text>
            </View>
            <View style={styles.configCard}>
              <CalendarIcon size={16} color="#10b981" />
              <Text style={styles.configLabel}>Buffer Time:</Text>
              <Text style={styles.configValue}>
                {formatDuration(bufferTimeMin)} between sessions
              </Text>
            </View>
          </View>

          {/* Time Slots */}
          <View style={styles.timeSlotsSection}>
            <View style={styles.timeSlotsHeader}>
              <Clock size={16} color="#10b981" />
              <Text style={styles.timeSlotsTitle}>
                Available slots for {format(selectedDate, "MMMM d, yyyy")}
              </Text>
              <View style={styles.slotsCountBadge}>
                <Text style={styles.slotsCountText}>
                  {timeSlots.filter((s) => s.isAvailable && !s.isPast).length}{" "}
                  slots
                </Text>
              </View>
            </View>

            {isLoading ? (
              <View style={styles.skeletonContainer}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.skeletonSlot} />
                ))}
              </View>
            ) : timeSlots.length === 0 ? (
              <View style={styles.emptySlots}>
                <AlertCircle size={48} color="#f59e0b" />
                <Text style={styles.emptySlotsTitle}>
                  No time slots available
                </Text>
                <Text style={styles.emptySlotsSubtitle}>
                  Try adjusting duration or buffer time, or select another date
                </Text>
              </View>
            ) : (
              <View style={styles.slotsGrid}>
                {timeSlots.map((slot, index) => {
                  const isSelected = isSlotSelected(slot)
                  const isPeakHour = getPeakHourStatus(slot.startTime)
                  const isPast = slot.isPast

                  let slotStyle = {}
                  if (isPast) {
                    slotStyle = styles.slotPast
                  } else if (isSelected) {
                    slotStyle = styles.slotSelected
                  } else if (!slot.isAvailable) {
                    slotStyle = styles.slotUnavailable
                  } else {
                    slotStyle = styles.slotAvailable
                  }

                  return (
                    <Animated.View
                      key={slot.id}
                      style={[styles.slotCard, slotStyle]}
                    >
                      <TouchableOpacity
                        onPress={() => handleSlotClick(slot)}
                        disabled={!slot.isAvailable || isPast}
                        onMouseEnter={() => setHoveredSlotId(slot.id)}
                        onMouseLeave={() => setHoveredSlotId(null)}
                      >
                        <View style={styles.slotContent}>
                          <Text
                            style={[
                              styles.slotStartTime,
                              isPast && styles.slotTextPast,
                            ]}
                          >
                            {format(slot.startTime, "h:mm a")}
                          </Text>
                          <View style={styles.slotArrow}>
                            <View style={styles.slotArrowLine} />
                            <Text style={styles.slotArrowText}>for</Text>
                            <View style={styles.slotArrowLine} />
                          </View>
                          <Text
                            style={[
                              styles.slotEndTime,
                              isPast && styles.slotTextPast,
                            ]}
                          >
                            → {format(slot.endTime, "h:mm a")}
                          </Text>
                          <Text style={styles.slotDuration}>
                            {formatDuration(estimatedTimeMin)}
                          </Text>

                          {isPast && (
                            <View style={styles.slotBadgePast}>
                              <History size={10} color="#fff" />
                              <Text style={styles.slotBadgeText}>Passed</Text>
                            </View>
                          )}

                          {!isPast && !slot.isAvailable && (
                            <View style={styles.slotBadgeReserved}>
                              <Lock size={10} color="#fff" />
                              <Text style={styles.slotBadgeText}>Reserved</Text>
                            </View>
                          )}

                          {!isPast && isPeakHour && slot.isAvailable && (
                            <View style={styles.slotBadgePeak}>
                              <Zap size={10} color="#fff" />
                              <Text style={styles.slotBadgeText}>
                                Peak Hour
                              </Text>
                            </View>
                          )}

                          {isSelected && !isPast && (
                            <View style={styles.slotBadgeSelected}>
                              <Text style={styles.slotBadgeText}>Selected</Text>
                            </View>
                          )}
                        </View>

                        {hoveredSlotId === slot.id &&
                          !slot.isAvailable &&
                          slot.reservedBy && (
                            <View style={styles.tooltip}>
                              <User size={12} color="#fff" />
                              <Text style={styles.tooltipText}>
                                Reserved by {slot.reservedBy}
                              </Text>
                            </View>
                          )}
                      </TouchableOpacity>
                    </Animated.View>
                  )
                })}
              </View>
            )}

            {/* Next Available Slot */}
            {nextAvailableSlot && !isLoading && timeSlots.length > 0 && (
              <View style={styles.nextSlotContainer}>
                <TrendingUp size={20} color="#10b981" />
                <View style={styles.nextSlotInfo}>
                  <Text style={styles.nextSlotLabel}>Next Available Slot:</Text>
                  <Text style={styles.nextSlotTime}>
                    {format(nextAvailableSlot.startTime, "h:mm a")} →{" "}
                    {format(nextAvailableSlot.endTime, "h:mm a")}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.nextSlotButton}
                  onPress={() => handleSlotClick(nextAvailableSlot)}
                >
                  <Text style={styles.nextSlotButtonText}>Select</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#10b981" }]}
              />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#ef4444" }]}
              />
              <Text style={styles.legendText}>Reserved</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#10b981" }]}
              />
              <Text style={styles.legendText}>Selected</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#9ca3af" }]}
              />
              <Text style={styles.legendText}>Passed</Text>
            </View>
          </View>

          {/* Buffer Explanation */}
          <View style={styles.infoText}>
            <Text style={styles.infoTextContent}>
              ⏱️ {bufferTimeMin}-minute buffer is added between sessions to
              ensure smooth transitions
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#10b981",
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  cardContent: {
    padding: 16,
  },
  datePickerSection: {
    marginBottom: 20,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  datePickerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  calendarToggle: {
    fontSize: 12,
    color: "#10b981",
  },
  dateList: {
    gap: 8,
    paddingVertical: 4,
  },
  dateItem: {
    width: 70,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    marginRight: 8,
  },
  dateItemSelected: {
    borderColor: "#10b981",
    backgroundColor: "#ecfdf5",
  },
  dateItemDisabled: {
    opacity: 0.4,
  },
  dateDay: {
    fontSize: 12,
    color: "#6b7280",
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginVertical: 2,
  },
  dateMonth: {
    fontSize: 11,
    color: "#9ca3af",
  },
  dateTextSelected: {
    color: "#10b981",
  },
  todayBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  todayBadgeText: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "600",
  },
  configSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  configCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ecfdf5",
    padding: 10,
    borderRadius: 10,
    flexWrap: "wrap",
  },
  configLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#065f46",
  },
  configValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
  },
  timeSlotsSection: {
    marginBottom: 20,
  },
  timeSlotsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  timeSlotsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    flex: 1,
  },
  slotsCountBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  slotsCountText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#10b981",
  },
  skeletonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  skeletonSlot: {
    width: "48%",
    height: 100,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
  },
  emptySlots: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fffbeb",
    borderRadius: 12,
  },
  emptySlotsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400e",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySlotsSubtitle: {
    fontSize: 13,
    color: "#b45309",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  slotCard: {
    width: "47%",
    borderRadius: 12,
    borderWidth: 2,
    overflow: "hidden",
  },
  slotAvailable: {
    borderColor: "#d1fae5",
    backgroundColor: "#ecfdf5",
  },
  slotSelected: {
    borderColor: "#10b981",
    backgroundColor: "#d1fae5",
  },
  slotUnavailable: {
    borderColor: "#fee2e2",
    backgroundColor: "#fef2f2",
  },
  slotPast: {
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  slotContent: {
    padding: 12,
    alignItems: "center",
  },
  slotStartTime: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  slotTextPast: {
    color: "#9ca3af",
  },
  slotArrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginVertical: 8,
  },
  slotArrowLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#d1d5db",
  },
  slotArrowText: {
    fontSize: 10,
    color: "#9ca3af",
  },
  slotEndTime: {
    fontSize: 13,
    color: "#6b7280",
  },
  slotDuration: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 8,
  },
  slotBadgePast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#9ca3af",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 8,
  },
  slotBadgeReserved: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 8,
  },
  slotBadgePeak: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 8,
  },
  slotBadgeSelected: {
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 8,
  },
  slotBadgeText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#fff",
  },
  tooltip: {
    position: "absolute",
    top: -40,
    left: "50%",
    transform: [{ translateX: -50 }],
    backgroundColor: "#1f2937",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tooltipText: {
    fontSize: 11,
    color: "#fff",
  },
  nextSlotContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ecfdf5",
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  nextSlotInfo: {
    flex: 1,
  },
  nextSlotLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#065f46",
  },
  nextSlotTime: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10b981",
  },
  nextSlotButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  nextSlotButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: "#6b7280",
  },
  infoText: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  infoTextContent: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
  },
})
