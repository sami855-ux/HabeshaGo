import TicketDetailModal from "@/components/passenger/TicketDetailModal"
import { useThemeContext } from "@/context/ThemeContext"
import { getUserBookings } from "@/service/booking.api"
import { Trip, TripCategory } from "@/types/trips"
import { useQuery } from "@tanstack/react-query"
import { format, isWithinInterval, subDays } from "date-fns"
import { useRouter } from "expo-router"
import {
  ArrowLeft,
  BatteryCharging,
  Bus,
  ChevronLeft,
  Clock,
  Filter,
  ParkingCircle,
  RefreshCw,
  Search,
  SortDesc,
  Ticket,
  X,
} from "lucide-react-native"
import React, { useMemo, useRef, useState } from "react"
import {
  Animated,
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type SortOption = "date-asc" | "date-desc" | "price-asc" | "price-desc"
type DateFilter = "all" | "today" | "week" | "month"
type BookingTypeFilter = "all" | "bus" | "ev" | "parking"

const normalizeTripData = (booking: any): Trip => {
  if (booking.type === "BUS") {
    return {
      id: booking.id,
      type: "BUS",
      bookingCode: booking.bookingCode,
      date: booking.date,
      status: booking.status,
      totalAmount: booking.totalAmount,
      amountPaid: booking.amountPaid,
      currency: booking.currency,
      origin: booking.origin,
      destination: booking.destination,
      bookedAt: booking.bookedAt,
      bus: booking.bus,
      payment: booking.payment,
      tickets: booking.tickets,
    }
  }
  if (booking.type === "EV") {
    return {
      id: booking.id,
      type: "EV",
      bookingCode: booking.reservationCode,
      date: booking.startTime,
      status: booking.status,
      totalAmount: booking.totalAmount,
      amountPaid: booking.totalAmount,
      currency: "ETB",
      origin: booking.chargingPoint?.name || "Charging Station",
      destination: "N/A",
      bookedAt: booking.createdAt,
      startTime: booking.startTime,
      endTime: booking.endTime,
      vehicle: booking.vehicle,
      chargingPoint: booking.chargingPoint,
    }
  }
  if (booking.type === "PARKING") {
    return {
      id: booking.id,
      type: "PARKING",
      bookingCode: booking.bookingCode || booking.reservationCode,
      date: booking.startTime || booking.date,
      status: booking.status,
      totalAmount: booking.totalAmount,
      amountPaid: booking.amountPaid || booking.totalAmount,
      currency: booking.currency || "ETB",
      origin: booking.parkingLot?.name || "Parking Lot",
      destination: "N/A",
      bookedAt: booking.bookedAt || booking.createdAt,
      startTime: booking.startTime,
      endTime: booking.endTime,
      parkingLot: booking.parkingLot,
      vehicle: booking.vehicle,
    }
  }
  return {
    id: booking.id,
    type: booking.type || "UNKNOWN",
    bookingCode: booking.bookingCode || booking.reservationCode,
    date: booking.date || booking.startTime,
    status: booking.status,
    totalAmount: booking.totalAmount,
    amountPaid: booking.amountPaid || booking.totalAmount,
    currency: booking.currency || "ETB",
    origin: booking.origin || "N/A",
    destination: booking.destination || "N/A",
    bookedAt: booking.bookedAt || booking.createdAt,
  }
}

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<
  string,
  { pill: string; dot: string; label: string }
> = {
  CONFIRMED: {
    pill: "bg-emerald-100",
    dot: "bg-emerald-500",
    label: "Confirmed",
  },
  PENDING: { pill: "bg-amber-100", dot: "bg-amber-500", label: "Pending" },
  CANCELLED: { pill: "bg-red-100", dot: "bg-red-500", label: "Cancelled" },
  COMPLETED: { pill: "bg-sky-100", dot: "bg-sky-500", label: "Completed" },
}

const TYPE_CONF: Record<
  string,
  {
    chipBg: string
    chipText: string
    accent: string
    icon: any
    label: string
    statBg: string
    statText: string
  }
> = {
  BUS: {
    chipBg: "bg-blue-100",
    chipText: "text-blue-600",
    accent: "#2563eb",
    icon: Bus,
    label: "Bus",
    statBg: "bg-blue-100",
    statText: "text-blue-600",
  },
  EV: {
    chipBg: "bg-violet-100",
    chipText: "text-violet-600",
    accent: "#7c3aed",
    icon: BatteryCharging,
    label: "EV",
    statBg: "bg-violet-100",
    statText: "text-violet-600",
  },
  PARKING: {
    chipBg: "bg-cyan-100",
    chipText: "text-cyan-600",
    accent: "#0891b2",
    icon: ParkingCircle,
    label: "Parking",
    statBg: "bg-cyan-100",
    statText: "text-cyan-600",
  },
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc", label: "Oldest first" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "price-asc", label: "Price: Low → High" },
]

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "all", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "Last 30 days" },
]

const TripCard = ({
  trip,
  colors,
  isDark,
  setSelectedTrip,
}: {
  trip: Trip
  colors: any
  isDark: boolean
  setSelectedTrip: () => void
}) => {
  const tc = TYPE_CONF[trip.type] ?? TYPE_CONF.BUS
  const sc = STATUS_STYLE[trip.status] ?? {
    pill: "bg-gray-100",
    dot: "bg-gray-400",
    label: trip.status,
  }
  const TypeIcon = tc.icon

  const dateStr = (() => {
    try {
      return format(new Date(trip.date), "dd MMM yyyy · HH:mm")
    } catch {
      return trip.date
    }
  })()

  return (
    <View
      className="rounded-xl mb-3 overflow-hidden flex-row"
      style={{
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.35 : 0.08,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      <View className="flex-1 p-4">
        {/* Row 1 — type chip + status */}
        <View className="flex-row items-center justify-between mb-3">
          <View
            className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full ${tc.chipBg}`}
          >
            <TypeIcon size={11} color={tc.accent} strokeWidth={2.5} />
            <Text className={`text-xs font-geist ${tc.chipText}`}>
              {tc.label}
            </Text>
          </View>

          <View
            className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full ${sc.pill}`}
          >
            <View className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            <Text
              className={`text-xs font-semibold font-geist ${sc.dot.replace("bg-", "text-")}`}
            >
              {sc.label}
            </Text>
          </View>
        </View>

        {/* Row 2 — route or location */}
        {trip.type === "BUS" ? (
          <View className="flex-row items-center gap-2 mb-2">
            <Text
              className="text-sm font-semibold flex-1 text-right font-geist"
              style={{ color: colors.text }}
              numberOfLines={1}
            >
              {trip.origin}
            </Text>
            <View className="flex-row items-center gap-1 flex-shrink-0">
              <View
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: tc.accent }}
              />
              <View
                className="w-5 h-px"
                style={{ backgroundColor: colors.border }}
              />
              <View
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: tc.accent }}
              />
            </View>
            <Text
              className="text-sm font-semibold font-geist flex-1"
              style={{ color: colors.text }}
              numberOfLines={1}
            >
              {trip.destination}
            </Text>
          </View>
        ) : (
          <Text
            className="text-sm font-semibold font-geist mb-2"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {trip.origin}
          </Text>
        )}

        {/* Row 3 — date + booking code */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-1">
            <Clock size={11} color={colors.mutedText} strokeWidth={2} />
            <Text className="text-xs" style={{ color: colors.mutedText }}>
              {dateStr}
            </Text>
          </View>
          <Text
            className="text-xs font-mono"
            style={{ color: colors.mutedText }}
          >
            #{trip.bookingCode?.slice(-8) ?? "—"}
          </Text>
        </View>

        {/* Divider */}
        <View
          className="h-px mb-3"
          style={{ backgroundColor: colors.border }}
        />

        {/* Row 4 — amount + CTA */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text
              className="text-xs mb-0.5 font-geist"
              style={{ color: colors.mutedText }}
            >
              Total paid
            </Text>
            <Text
              className="text-lg font-groteskBold"
              style={{ color: colors.text }}
            >
              {parseFloat(trip.totalAmount).toLocaleString()}{" "}
              <Text
                className="text-xs font-normal"
                style={{ color: colors.mutedText }}
              >
                {trip.currency}
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.75}
            className={`px-4 py-2.5 rounded-xl ${tc.chipBg}`}
            style={{ borderWidth: 1, borderColor: tc.accent + "33" }}
            onPress={() => setSelectedTrip(trip)}
          >
            <Text className={`text-xs font-semibold font-geist ${tc.chipText}`}>
              View Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const TripSkeleton = ({ colors }: { colors: any }) => {
  const anim = useRef(new Animated.Value(1)).current
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.35,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [])

  return (
    <Animated.View
      className="rounded-2xl mb-3 overflow-hidden flex-row"
      style={{
        backgroundColor: colors.card,
        opacity: anim,
      }}
    >
      <View className="flex-1 p-4 gap-3">
        <View className="flex-row justify-between">
          <View
            className="h-6 w-16 rounded-full"
            style={{ backgroundColor: colors.border }}
          />
          <View
            className="h-6 w-20 rounded-full"
            style={{ backgroundColor: colors.border }}
          />
        </View>
        <View
          className="h-4 w-3/4 rounded-lg"
          style={{ backgroundColor: colors.border }}
        />
        <View
          className="h-3 w-2/5 rounded-lg"
          style={{ backgroundColor: colors.border }}
        />
        <View className="h-px" style={{ backgroundColor: colors.border }} />
        <View className="flex-row justify-between items-center">
          <View
            className="h-6 w-24 rounded-lg"
            style={{ backgroundColor: colors.border }}
          />
          <View
            className="h-9 w-24 rounded-xl"
            style={{ backgroundColor: colors.border }}
          />
        </View>
      </View>
    </Animated.View>
  )
}

const EmptyState = ({
  category,
  hasFilters,
  onClear,
  colors,
}: {
  category: TripCategory
  hasFilters: boolean
  onClear: () => void
  colors: any
}) => (
  <View className="items-center py-16 px-8">
    <View
      className="w-20 h-20 rounded-full items-center justify-center mb-5"
      style={{ backgroundColor: colors.border }}
    >
      <Ticket size={32} color={colors.mutedText} strokeWidth={1.5} />
    </View>
    <Text
      className="text-xl font-bold mb-2 text-center"
      style={{ color: colors.text }}
    >
      {hasFilters
        ? "No results found"
        : category === "upcoming"
          ? "No upcoming bookings"
          : "No past bookings"}
    </Text>
    <Text
      className="text-sm text-center mb-6 leading-5"
      style={{ color: colors.mutedText }}
    >
      {hasFilters
        ? "Try adjusting your search or filters"
        : category === "upcoming"
          ? "Your upcoming bus, EV, and parking reservations will appear here"
          : "Your completed and past bookings will appear here"}
    </Text>
    {hasFilters && (
      <TouchableOpacity
        onPress={onClear}
        className="flex-row items-center gap-2 px-5 py-2.5 rounded-full border"
        style={{ borderColor: colors.border }}
      >
        <X size={13} color={colors.mutedText} />
        <Text
          className="text-sm font-semibold"
          style={{ color: colors.mutedText }}
        >
          Clear filters
        </Text>
      </TouchableOpacity>
    )}
  </View>
)

const Chip = ({
  label,
  active,
  onPress,
  colors,
}: {
  label: string
  active: boolean
  onPress: () => void
  colors: any
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    className={`px-6 py-1.5 rounded-full border ${active ? "bg-orange-500 border-orange-500" : ""}`}
    style={
      !active
        ? { borderColor: colors.border, backgroundColor: colors.card }
        : {}
    }
  >
    <Text
      className={`text-[12px] font-groteskBold ${active ? "text-white" : ""}`}
      style={!active ? { color: colors.text } : {}}
    >
      {label}
    </Text>
  </TouchableOpacity>
)

// ─── Dropdown Sheet ───────────────────────────────────────────────────────────
const DropSheet = <T extends string>({
  options,
  value,
  onSelect,
  colors,
}: {
  options: { value: T; label: string }[]
  value: T
  onSelect: (v: T) => void
  colors: any
}) => (
  <View
    className="mx-5 mt-1.5 rounded-2xl overflow-hidden"
    style={{
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    }}
  >
    {options.map((opt, i) => (
      <TouchableOpacity
        key={opt.value}
        onPress={() => onSelect(opt.value)}
        className="flex-row items-center justify-between px-4 py-3"
        style={
          i < options.length - 1
            ? { borderBottomWidth: 1, borderBottomColor: colors.border }
            : {}
        }
      >
        <Text className="text-sm font-medium" style={{ color: colors.text }}>
          {opt.label}
        </Text>
        {value === opt.value && (
          <View className="w-2 h-2 rounded-full bg-orange-500" />
        )}
      </TouchableOpacity>
    ))}
  </View>
)

export default function MyBooking() {
  const { colors, actualTheme } = useThemeContext()
  const isDark = actualTheme === "dark"

  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TripCategory>("upcoming")
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [bookingType, setBookingType] = useState<BookingTypeFilter>("all")
  const [sortBy, setSortBy] = useState<SortOption>("date-desc")
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [showSort, setShowSort] = useState(false)
  const [showDate, setShowDate] = useState(false)

  const {
    data: raw,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["user_bookings"],
    queryFn: getUserBookings,
  })

  const trips = useMemo(() => (raw ?? []).map(normalizeTripData), [raw])

  const filterAndSort = (category: TripCategory): Trip[] => {
    const now = new Date()

    let list = trips.filter((t) => {
      const d = new Date(t.date)
      const cancelled = t.status === "CANCELLED"
      return category === "upcoming"
        ? d > now && !cancelled
        : d <= now || cancelled
    })

    if (bookingType !== "all")
      list = list.filter((t) => t.type === bookingType.toUpperCase())

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (t) =>
          t.origin?.toLowerCase().includes(q) ||
          t.destination?.toLowerCase().includes(q) ||
          t.bookingCode?.toLowerCase().includes(q) ||
          (t as any).bus?.busNumber?.toLowerCase().includes(q) ||
          (t as any).parkingLot?.name?.toLowerCase().includes(q) ||
          (t as any).vehicle?.plateNumber?.toLowerCase().includes(q),
      )
    }

    if (dateFilter === "today")
      list = list.filter(
        (t) =>
          format(new Date(t.date), "yyyy-MM-dd") === format(now, "yyyy-MM-dd"),
      )
    else if (dateFilter === "week") {
      const ago = subDays(now, 7)
      list = list.filter((t) =>
        isWithinInterval(new Date(t.date), { start: ago, end: now }),
      )
    } else if (dateFilter === "month") {
      const ago = subDays(now, 30)
      list = list.filter((t) =>
        isWithinInterval(new Date(t.date), { start: ago, end: now }),
      )
    }

    return list.sort((a, b) => {
      if (sortBy === "date-asc")
        return new Date(a.bookedAt).getTime() - new Date(b.bookedAt).getTime()
      if (sortBy === "date-desc")
        return new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
      if (sortBy === "price-asc")
        return parseFloat(a.totalAmount) - parseFloat(b.totalAmount)
      if (sortBy === "price-desc")
        return parseFloat(b.totalAmount) - parseFloat(a.totalAmount)
      return 0
    })
  }

  const upcoming = filterAndSort("upcoming")
  const past = filterAndSort("past")
  const displayed = activeTab === "upcoming" ? upcoming : past

  const clearFilters = () => {
    setSearchQuery("")
    setBookingType("all")
    setSortBy("date-desc")
    setDateFilter("all")
  }

  const activeFiltersCount = [
    searchQuery,
    bookingType !== "all",
    dateFilter !== "all",
    sortBy !== "date-desc",
  ].filter(Boolean).length

  const countType = (list: Trip[], type: string) =>
    list.filter((t) => t.type === type).length

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View className="px-5 pt-1 pb-4">
        <View className="flex-row items-center justify-end mb-0.5">
          <TouchableOpacity
            onPress={() => refetch()}
            className="p-2 rounded-full"
            style={{ backgroundColor: colors.card }}
          >
            <RefreshCw size={16} color={colors.mutedText} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ChevronLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text
            className="text-2xl font-black font-geist"
            style={{ color: colors.text }}
          >
            My Bookings
          </Text>
        </View>
        *{/* Stat cards */}
        <View className="flex-row gap-3">
          {/* Upcoming */}
          <View
            className="flex-1 rounded-2xl px-4 py-3"
            style={{
              backgroundColor: isDark ? "#1a0c00" : "#fff7ed",
              borderWidth: 1,
              borderColor: isDark ? "#431407" : "#fed7aa",
            }}
          >
            <Text className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-0.5">
              Upcoming
            </Text>
            <Text className="text-3xl font-black text-orange-600 mb-1">
              {upcoming.length}
            </Text>
            <View className="flex-row flex-wrap gap-1">
              {countType(upcoming, "BUS") > 0 && (
                <View className="bg-blue-100 px-1.5 py-0.5 rounded-full">
                  <Text className="text-blue-600 text-[10px] font-bold">
                    {countType(upcoming, "BUS")} Bus
                  </Text>
                </View>
              )}
              {countType(upcoming, "EV") > 0 && (
                <View className="bg-violet-100 px-1.5 py-0.5 rounded-full">
                  <Text className="text-violet-600 text-[10px] font-bold">
                    {countType(upcoming, "EV")} EV
                  </Text>
                </View>
              )}
              {countType(upcoming, "PARKING") > 0 && (
                <View className="bg-cyan-100 px-1.5 py-0.5 rounded-full">
                  <Text className="text-cyan-600 text-[10px] font-bold">
                    {countType(upcoming, "PARKING")} Park
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Past */}
          <View
            className="flex-1 rounded-2xl px-4 py-3"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              className="text-xs font-bold uppercase tracking-wider mb-0.5"
              style={{ color: colors.mutedText }}
            >
              Past
            </Text>
            <Text
              className="text-3xl font-black mb-1"
              style={{ color: colors.text }}
            >
              {past.length}
            </Text>
            <View className="flex-row flex-wrap gap-1">
              {countType(past, "BUS") > 0 && (
                <View className="bg-blue-100 px-1.5 py-0.5 rounded-full">
                  <Text className="text-blue-600 text-[10px] font-bold">
                    {countType(past, "BUS")} Bus
                  </Text>
                </View>
              )}
              {countType(past, "EV") > 0 && (
                <View className="bg-violet-100 px-1.5 py-0.5 rounded-full">
                  <Text className="text-violet-600 text-[10px] font-bold">
                    {countType(past, "EV")} EV
                  </Text>
                </View>
              )}
              {countType(past, "PARKING") > 0 && (
                <View className="bg-cyan-100 px-1.5 py-0.5 rounded-full">
                  <Text className="text-cyan-600 text-[10px] font-bold">
                    {countType(past, "PARKING")} Park
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
      <View className="px-5 pt-4 pb-3">
        <View
          className="flex-row items-center rounded-xl px-3 h-11"
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Search size={16} color={colors.mutedText} strokeWidth={2} />
          <TextInput
            className="flex-1 ml-2 text-sm"
            placeholder="Search route, code, plate…"
            placeholderTextColor={colors.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ color: colors.text }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              className="p-1"
            >
              <X size={14} color={colors.mutedText} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View className="py-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            gap: 8,
            alignItems: "center",
          }}
        >
          <Chip
            label="All"
            active={bookingType === "all"}
            onPress={() => setBookingType("all")}
            colors={colors}
          />
          <Chip
            label="Bus"
            active={bookingType === "bus"}
            onPress={() => setBookingType("bus")}
            colors={colors}
          />
          <Chip
            label="EV"
            active={bookingType === "ev"}
            onPress={() => setBookingType("ev")}
            colors={colors}
          />

          {/* Separator */}
          <View
            className="w-2px h-4 mx-0.5"
            style={{ backgroundColor: colors.border }}
          />

          {/* Sort */}
          <TouchableOpacity
            onPress={() => {
              setShowSort((v) => !v)
              setShowDate(false)
            }}
            className="flex-row items-center gap-1 px-4 py-1.5 rounded-full border"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.card,
            }}
          >
            <SortDesc size={12} color={colors.mutedText} />
            <Text
              className="text-[13px] font-semibold font-geist"
              style={{ color: colors.text }}
            >
              Sort
            </Text>
          </TouchableOpacity>

          {/* Clear */}
          {activeFiltersCount > 0 && (
            <TouchableOpacity
              onPress={clearFilters}
              className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200"
            >
              <X size={11} color="#ef4444" />
              <Text className="text-xs font-bold text-red-500">
                Clear ({activeFiltersCount})
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Date dropdown */}
        {showDate && (
          <DropSheet
            options={DATE_OPTIONS}
            value={dateFilter}
            onSelect={(v) => {
              setDateFilter(v)
              setShowDate(false)
            }}
            colors={colors}
          />
        )}

        {/* Sort dropdown */}
        {showSort && (
          <DropSheet
            options={SORT_OPTIONS}
            value={sortBy}
            onSelect={(v) => {
              setSortBy(v)
              setShowSort(false)
            }}
            colors={colors}
          />
        )}
      </View>
      <View
        className="flex-row mx-5 mb-4 rounded-xl p-1"
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {(["upcoming", "past"] as TripCategory[]).map((tab) => {
          const count = tab === "upcoming" ? upcoming.length : past.length
          const active = activeTab === tab
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-lg"
              style={
                active
                  ? {
                      backgroundColor: colors.background,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 6,
                      elevation: 3,
                    }
                  : {}
              }
            >
              <Text
                className="text-sm font-geist capitalize"
                style={{ color: active ? colors.text : colors.mutedText }}
              >
                {tab}
              </Text>
              {count > 0 && (
                <View
                  className="min-w-5 h-5 px-1.5 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: active ? "#ea580c" : colors.border,
                  }}
                >
                  <Text
                    className="text-[10px] font-bold"
                    style={{ color: active ? "#fff" : colors.mutedText }}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </View>
      {isLoading || isRefetching ? (
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
        >
          {[1, 2, 3].map((i) => (
            <TripSkeleton key={i} colors={colors} />
          ))}
        </ScrollView>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8 gap-4">
          <View className="w-16 h-16 rounded-full items-center justify-center bg-red-100">
            <X size={28} color="#ef4444" />
          </View>
          <Text
            className="text-lg font-bold text-center"
            style={{ color: colors.text }}
          >
            Failed to load bookings
          </Text>
          <Text
            className="text-sm text-center"
            style={{ color: colors.mutedText }}
          >
            Please check your connection and try again
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="flex-row items-center gap-2 px-6 py-3 rounded-full bg-orange-500"
          >
            <RefreshCw size={15} color="#fff" strokeWidth={2.5} />
            <Text className="text-white font-bold text-sm">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              category={activeTab}
              hasFilters={activeFiltersCount > 0}
              onClear={clearFilters}
              colors={colors}
            />
          }
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              colors={colors}
              isDark={isDark}
              setSelectedTrip={setSelectedTrip}
            />
          )}
        />
      )}
      / At the end of your component, add the modal:
      {selectedTrip && (
        <TicketDetailModal
          visible={!!selectedTrip}
          onClose={() => setSelectedTrip(null)}
          trip={selectedTrip}
        />
      )}
    </SafeAreaView>
  )
}
