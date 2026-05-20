import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from "react-native"
import { useState, useEffect, useCallback } from "react"
import { useThemeContext } from "@/context/ThemeContext"
import {
  MapPin,
  Flag,
  Calendar,
  Users,
  Wallet,
  Clock,
  ChevronRight,
  TrendingUp,
  Navigation,
} from "lucide-react-native"
import { getDriverTripHistory } from "@/service/driver"

type TripStatus = "ongoing" | "completed" | "cancelled"

interface Trip {
  bookingId: number
  bookingCode: string
  date: string
  completedAt: string
  bus: { id: number; busNumber: string }
  route: {
    name: string
    origin: string
    destination: string
    distanceKm: number
    estimatedTimeMin: number
    estimatedTimeHours: number
  } | null
  schedule: { startTime: string; endTime: string; direction: string } | null
  passengers: { total: number; checkedIn: number; noShow: number }
  revenue: {
    amount: number
    currency: string
    paymentMethod: string
    discount: number
    totalBeforeDiscount: number
  }
}

interface TripHistoryData {
  driver: { id: string; name: string; phone: string; rating: number }
  summary: {
    totalTrips: number
    totalPassengers: number
    totalCheckedIn: number
    totalRevenue: number
    totalDistanceKm: number
    totalHours: number
    totalMinutes: number
    currency: string
    paymentBreakdown: { [key: string]: { trips: number; amount: number } }
  }
  trips: Trip[]
}

const { width } = Dimensions.get("window")

export default function DriverTrips() {
  const { colors, actualTheme } = useThemeContext()
  const isDark = actualTheme === "dark"
  const [activeTab, setActiveTab] = useState<TripStatus>("completed")
  const [tripData, setTripData] = useState<TripHistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTripHistory = useCallback(async () => {
    try {
      setError(null)
      const response = await getDriverTripHistory()
      if (response.success === true && response.data) {
        setTripData(response.data)
      } else {
        setError(response.message || "Failed to load trip history")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchTripHistory()
  }, [fetchTripHistory])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchTripHistory()
  }, [fetchTripHistory])

  const getFilteredTrips = () => {
    if (!tripData?.trips) return []
    if (activeTab === "completed") return tripData.trips
    return []
  }

  const filteredTrips = getFilteredTrips()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number, currency: string = "ETB") =>
    `${currency} ${amount.toLocaleString()}`

  // Theme-aware colors
  const bg = colors.background
  const card = colors.card
  const primary = colors.primary
  const text = colors.text
  const muted = colors.mutedText
  const border = colors.border
  const success = colors.success

  const statCardBg = isDark ? "#232323" : "#F4F4F6"
  const tabInactiveBg = isDark ? "#2A2A2A" : "#F0F0F2"
  const tabInactiveText = isDark ? "#9A9A9E" : "#6B6B70"
  const routeLineBg = isDark ? "#3A3A3C" : "#D1D5DB"
  const badgeBg = isDark ? "rgba(48,209,88,0.15)" : "rgba(52,199,89,0.12)"
  const badgeText = isDark ? "#30D158" : "#1A8F3C"
  const noShowBg = isDark ? "rgba(255,69,58,0.15)" : "rgba(255,59,48,0.12)"
  const noShowText = isDark ? "#FF453A" : "#D00"
  const divider = isDark ? "#2C2C2E" : "#EBEBED"

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bg,
        }}
      >
        <ActivityIndicator size="large" color={primary} />
        <Text style={{ color: muted, marginTop: 12, fontSize: 14 }}>
          Loading trips...
        </Text>
      </View>
    )
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          backgroundColor: bg,
        }}
      >
        <Text
          style={{
            color: colors.error,
            textAlign: "center",
            marginBottom: 16,
            fontSize: 15,
          }}
        >
          {error}
        </Text>
        <TouchableOpacity
          onPress={fetchTripHistory}
          style={{
            backgroundColor: primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const tabs: { key: TripStatus; label: string }[] = [
    { key: "ongoing", label: "Ongoing" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ]

  const statCards = tripData
    ? [
        {
          icon: <Wallet size={18} color={primary} />,
          value: formatCurrency(
            tripData.summary.totalRevenue,
            tripData.summary.currency,
          ),
          label: "Revenue",
          valueSize: 13,
        },
        {
          icon: <Users size={18} color={primary} />,
          value: `${tripData.summary.totalPassengers}`,
          label: "Passengers",
          valueSize: 20,
        },
        {
          icon: <Clock size={18} color={primary} />,
          value: `${Math.round(tripData.summary.totalHours)}h`,
          label: "Hours",
          valueSize: 20,
        },
        {
          icon: <Calendar size={18} color={primary} />,
          value: `${tripData.summary.totalTrips}`,
          label: "Trips",
          valueSize: 20,
        },
      ]
    : []

  return (
    <>
      <StatusBar barStyle={"dark-content"} />

      <View style={{ flex: 1, backgroundColor: bg }}>
        {/* Header */}
        <View
          style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "700",
                  color: text,
                  letterSpacing: -0.5,
                }}
              >
                My Trips
              </Text>
              {tripData?.driver && (
                <Text style={{ fontSize: 13, color: muted, marginTop: 2 }}>
                  {tripData.driver.name}
                </Text>
              )}
            </View>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: isDark ? "#2A2A2A" : "#F0F0F2",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp size={20} color={primary} />
            </View>
          </View>

          {/* Stat Cards Row */}
          {tripData && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mx-[-4px]"
            >
              <View className="flex-row gap-3 px-1">
                {statCards.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.7}
                    className="w-[120px] p-4 rounded-2xl"
                    style={{
                      backgroundColor: statCardBg,
                      borderWidth: 0.5,
                      borderColor: border,
                    }}
                  >
                    {/* Icon with gradient effect */}
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center mb-3"
                      style={{
                        backgroundColor: isDark
                          ? "rgba(234,88,12,0.15)"
                          : "rgba(234,88,12,0.1)",
                      }}
                    >
                      {s.icon}
                    </View>

                    {/* Value with dynamic sizing */}
                    <Text
                      className="font-groteskBold mb-1"
                      style={{
                        fontSize: s.valueSize || 22,
                        color: text,
                      }}
                    >
                      {s.value}
                    </Text>

                    {/* Label with better spacing */}
                    <Text
                      className="text-xs tracking-wide"
                      style={{ color: muted }}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Tabs */}
        <View className="flex-row mx-5 mb-6 gap-2 flex-wrap">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key

            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
                style={{ flex: tabs.length <= 3 ? 1 : "auto" }}
              >
                <View
                  className="px-4 py-2.5 rounded-xl items-center justify-center"
                  style={{
                    backgroundColor: isActive ? primary : "transparent",
                    borderWidth: 0.5,
                    borderColor: isActive ? primary : border,
                  }}
                >
                  <Text
                    className="text-sm font-medium font-geist"
                    style={{
                      color: isActive ? "#fff" : tabInactiveText,
                    }}
                  >
                    {tab.label}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Trip List */}
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={primary}
              colors={[primary]}
            />
          }
        >
          {filteredTrips.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 80,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: tabInactiveBg,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <Navigation size={24} color={muted} />
              </View>
              <Text style={{ color: muted, fontSize: 15, fontWeight: "500" }}>
                No {activeTab} trips
              </Text>
              <Text
                style={{
                  color: isDark ? "#555" : "#BBBBC0",
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                Your {activeTab} trips will appear here
              </Text>
            </View>
          ) : (
            filteredTrips.map((trip) => (
              <TouchableOpacity
                key={trip.bookingId}
                activeOpacity={0.75}
                style={{
                  backgroundColor: card,
                  borderRadius: 18,
                  marginBottom: 12,
                  overflow: "hidden",
                }}
              >
                <View style={{ padding: 16 }}>
                  {/* Header row */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 14,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ fontSize: 13, color: muted, marginBottom: 2 }}
                      >
                        {formatDate(trip.date)} · {formatTime(trip.completedAt)}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: isDark ? "#555" : "#C0C0C5",
                        }}
                      >
                        Bus {trip.bus.busNumber} · {trip.bookingCode}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 99,
                        backgroundColor: badgeBg,
                      }}
                    >
                      <Text
                        className="font-geist"
                        style={{
                          color: badgeText,
                          fontSize: 11,
                          letterSpacing: 0.4,
                        }}
                      >
                        DONE
                      </Text>
                    </View>
                  </View>

                  {/* Route */}
                  {trip.route && (
                    <View
                      style={{
                        backgroundColor: isDark ? "#222" : "#F7F7F9",
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 14,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: text,
                          marginBottom: 10,
                        }}
                      >
                        {trip.route.name}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                        }}
                      >
                        {/* Timeline dots */}
                        <View
                          style={{
                            alignItems: "center",
                            marginRight: 10,
                            paddingTop: 2,
                          }}
                        >
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: primary,
                            }}
                          />
                          <View
                            style={{
                              width: 1.5,
                              height: 22,
                              backgroundColor: routeLineBg,
                              marginVertical: 3,
                            }}
                          />
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              borderWidth: 2,
                              borderColor: primary,
                            }}
                          />
                        </View>
                        <View style={{ flex: 1, gap: 8 }}>
                          <Text
                            style={{
                              fontSize: 13,
                              color: text,
                              lineHeight: 18,
                            }}
                          >
                            {trip.route.origin}
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              color: text,
                              lineHeight: 18,
                            }}
                          >
                            {trip.route.destination}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Stats row */}
                  <View
                    style={{
                      flexDirection: "row",
                      paddingTop: 12,
                      borderTopWidth: 0.5,
                      borderTopColor: divider,
                      alignItems: "center",
                    }}
                  >
                    {/* Passengers */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ fontSize: 11, color: muted, marginBottom: 3 }}
                      >
                        Passengers
                      </Text>
                      <Text
                        style={{ fontSize: 15, fontWeight: "700", color: text }}
                      >
                        {trip.passengers.checkedIn}
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "400",
                            color: muted,
                          }}
                        >
                          /{trip.passengers.total}
                        </Text>
                      </Text>
                      {trip.passengers.noShow > 0 && (
                        <View
                          style={{
                            marginTop: 3,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 6,
                            backgroundColor: noShowBg,
                            alignSelf: "flex-start",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              color: noShowText,
                              fontWeight: "600",
                            }}
                          >
                            {trip.passengers.noShow} no-show
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Divider */}
                    <View
                      style={{
                        width: 0.5,
                        height: 36,
                        backgroundColor: divider,
                        marginHorizontal: 12,
                      }}
                    />

                    {/* Distance */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ fontSize: 11, color: muted, marginBottom: 3 }}
                      >
                        Distance
                      </Text>
                      <Text
                        style={{ fontSize: 15, fontWeight: "700", color: text }}
                      >
                        {trip.route?.distanceKm.toFixed(1)}
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "400",
                            color: muted,
                          }}
                        >
                          {" "}
                          km
                        </Text>
                      </Text>
                    </View>

                    {/* Divider */}
                    <View
                      style={{
                        width: 0.5,
                        height: 36,
                        backgroundColor: divider,
                        marginHorizontal: 12,
                      }}
                    />

                    {/* Revenue */}
                    <View style={{ flex: 1.2 }}>
                      <Text
                        style={{ fontSize: 11, color: muted, marginBottom: 3 }}
                      >
                        Revenue
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: success,
                        }}
                      >
                        {formatCurrency(
                          trip.revenue.amount,
                          trip.revenue.currency,
                        )}
                      </Text>
                      {trip.revenue.discount > 0 && (
                        <Text
                          style={{ fontSize: 10, color: muted, marginTop: 1 }}
                        >
                          -{trip.revenue.discount} disc.
                        </Text>
                      )}
                    </View>

                    <ChevronRight size={16} color={isDark ? "#444" : "#CCC"} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </>
  )
}
