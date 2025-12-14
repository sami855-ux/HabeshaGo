// app/screens/ActivityTab.tsx
import { useThemeContext } from "@/context/ThemeContext"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  Award,
  Bell,
  BellRing,
  Calendar,
  Car,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Filter,
  Gift,
  History,
  MapPin,
  MoreVertical,
  Receipt,
  Repeat,
  Search,
  Shield,
  Sparkles,
  Star,
  Tag,
  Target,
  Wallet,
  Wifi,
  WifiOff,
} from "lucide-react-native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

// Types
type TripStatus = "completed" | "upcoming" | "cancelled"
type NotificationType = "alert" | "promotion" | "payment" | "system"
type PaymentType = "credit_card" | "wallet" | "cashback"
type RewardType = "points" | "badge" | "challenge" | "referral"

interface Trip {
  id: string
  route: string
  date: string
  time: string
  fare: number
  status: TripStatus
  stops: string[]
  favorite: boolean
  liveLocation?: {
    lat: number
    lng: number
    eta: string
  }
}

interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  timestamp: string
  read: boolean
  critical: boolean
  actions?: string[]
}

interface Payment {
  id: string
  amount: number
  type: PaymentType
  description: string
  date: string
  receiptUrl: string
  status: "completed" | "pending" | "failed"
}

interface Reward {
  id: string
  type: RewardType
  title: string
  description: string
  points?: number
  achieved: boolean
  expiryDate?: string
}

// Mock Data
const MOCK_TRIPS: Trip[] = [
  {
    id: "1",
    route: "Downtown Express → Airport",
    date: "2024-01-15",
    time: "08:30 AM",
    fare: 24.5,
    status: "completed",
    stops: ["Main St", "Central Park", "Airport Terminal"],
    favorite: true,
  },
  {
    id: "2",
    route: "University Shuttle → Tech Park",
    date: "2024-01-16",
    time: "02:15 PM",
    fare: 12.75,
    status: "upcoming",
    stops: ["University", "Library", "Tech Park"],
    favorite: false,
    liveLocation: {
      lat: 40.7128,
      lng: -74.006,
      eta: "10 min",
    },
  },
  {
    id: "3",
    route: "Night Rider → West End",
    date: "2024-01-14",
    time: "09:45 PM",
    fare: 18.25,
    status: "completed",
    stops: ["Central", "West End", "Uptown"],
    favorite: false,
  },
]

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Route Delay Alert",
    message: "Downtown Express is delayed by 15 minutes",
    type: "alert",
    timestamp: "10 min ago",
    read: false,
    critical: true,
    actions: ["Reschedule", "Cancel"],
  },
  {
    id: "2",
    title: "50% Cashback Offer",
    message: "Use code RIDE50 on your next trip",
    type: "promotion",
    timestamp: "1 hour ago",
    read: true,
    critical: false,
  },
  {
    id: "3",
    title: "Payment Successful",
    message: "Your wallet top-up of $50 was successful",
    type: "payment",
    timestamp: "2 hours ago",
    read: true,
    critical: false,
  },
]

const MOCK_PAYMENTS: Payment[] = [
  {
    id: "1",
    amount: 24.5,
    type: "wallet",
    description: "Downtown Express Trip",
    date: "2024-01-15",
    receiptUrl: "https://example.com/receipt1",
    status: "completed",
  },
  {
    id: "2",
    amount: 50.0,
    type: "credit_card",
    description: "Wallet Top-up",
    date: "2024-01-14",
    receiptUrl: "https://example.com/receipt2",
    status: "pending",
  },
  {
    id: "3",
    amount: 12.75,
    type: "wallet",
    description: "University Shuttle Trip",
    date: "2024-01-16",
    receiptUrl: "https://example.com/receipt3",
    status: "completed",
  },
]

const MOCK_REWARDS: Reward[] = [
  {
    id: "1",
    type: "points",
    title: "Weekly Rider",
    description: "Complete 5 rides this week",
    points: 500,
    achieved: false,
    expiryDate: "2024-01-20",
  },
  {
    id: "2",
    type: "badge",
    title: "Early Bird",
    description: "Take 10 morning rides",
    achieved: true,
  },
  {
    id: "3",
    type: "challenge",
    title: "Weekend Explorer",
    description: "Complete 3 weekend trips",
    points: 300,
    achieved: true,
  },
]

// Tab Configuration
const TABS = [
  { id: "all", label: "All", icon: History },
  { id: "trips", label: "Trips", icon: Car },
  { id: "notifications", label: "Alerts", icon: Bell },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "rewards", label: "Rewards", icon: Award },
] as const

type TabType = (typeof TABS)[number]["id"]

export default function ActivityTab() {
  const { colors } = useThemeContext()
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest")
  const [showFilters, setShowFilters] = useState(false)

  const queryClient = useQueryClient()

  // Check network status
  useEffect(() => {
    // Simulate network status check
    const checkNetwork = async () => {
      try {
        const lastSync = await AsyncStorage.getItem("lastSyncTime")
        setIsOffline(!lastSync)
      } catch (error) {
        setIsOffline(true)
      }
    }
    checkNetwork()
  }, [])

  // Fetch data with React Query
  const { data: trips, isLoading: isLoadingTrips } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem("tripsData")
      if (stored) {
        return JSON.parse(stored)
      }
      await AsyncStorage.setItem("tripsData", JSON.stringify(MOCK_TRIPS))
      return MOCK_TRIPS
    },
  })

  const { data: notifications, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem("notificationsData")
      if (stored) {
        return JSON.parse(stored)
      }
      await AsyncStorage.setItem(
        "notificationsData",
        JSON.stringify(MOCK_NOTIFICATIONS)
      )
      return MOCK_NOTIFICATIONS
    },
  })

  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem("paymentsData")
      if (stored) {
        return JSON.parse(stored)
      }
      await AsyncStorage.setItem("paymentsData", JSON.stringify(MOCK_PAYMENTS))
      return MOCK_PAYMENTS
    },
  })

  const { data: rewards, isLoading: isLoadingRewards } = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem("rewardsData")
      if (stored) {
        return JSON.parse(stored)
      }
      await AsyncStorage.setItem("rewardsData", JSON.stringify(MOCK_REWARDS))
      return MOCK_REWARDS
    },
  })

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await queryClient.invalidateQueries()
    await AsyncStorage.setItem("lastSyncTime", new Date().toISOString())
    setIsRefreshing(false)
  }, [queryClient])

  // Smart suggestions
  const smartSuggestions = [
    {
      id: "1",
      title: "Repeat Last Trip",
      icon: Repeat,
      action: () =>
        Alert.alert("Repeat Trip", "Would you like to repeat your last trip?", [
          { text: "Cancel", style: "cancel" },
          { text: "Repeat", onPress: () => console.log("Repeating trip") },
        ]),
    },
    {
      id: "2",
      title: "Top-up Wallet",
      icon: Wallet,
      action: () =>
        Alert.alert("Top-up Wallet", "Add funds to your wallet", [
          { text: "Later", style: "cancel" },
          { text: "Add $20", onPress: () => console.log("Adding $20") },
          { text: "Add $50", onPress: () => console.log("Adding $50") },
        ]),
    },
    {
      id: "3",
      title: "View Rewards",
      icon: Gift,
      action: () => setActiveTab("rewards"),
    },
    {
      id: "4",
      title: "Book Ride",
      icon: Car,
      action: () => Alert.alert("Book Ride", "Start a new trip"),
    },
  ]

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (activeTab === "all") {
      return []
    }

    let data: any[] = []

    switch (activeTab) {
      case "trips":
        data = trips || []
        break
      case "notifications":
        data = notifications || []
        break
      case "payments":
        data = payments || []
        break
      case "rewards":
        data = rewards || []
        break
    }

    // Apply search filter
    if (searchQuery) {
      data = data.filter((item) => {
        if ("route" in item) {
          return item.route.toLowerCase().includes(searchQuery.toLowerCase())
        }
        if ("title" in item) {
          return item.title.toLowerCase().includes(searchQuery.toLowerCase())
        }
        if ("description" in item) {
          return item.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        }
        return false
      })
    }

    // Apply sorting
    if ("date" in data[0]) {
      data.sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return sortBy === "newest" ? dateB - dateA : dateA - dateB
      })
    }

    return data
  }, [activeTab, trips, notifications, payments, rewards, searchQuery, sortBy])

  const handleTripAction = (
    tripId: string,
    action: "repeat" | "favorite" | "details"
  ) => {
    switch (action) {
      case "repeat":
        Alert.alert("Repeat Trip", "Book this trip again?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Repeat",
            onPress: () => console.log("Repeating trip", tripId),
          },
        ])
        break
      case "favorite":
        console.log("Toggling favorite for trip", tripId)
        break
      case "details":
        Alert.alert("Trip Details", "View fare breakdown and stops", [
          { text: "Close", style: "cancel" },
          {
            text: "View Details",
            onPress: () => console.log("Viewing details for trip", tripId),
          },
        ])
        break
    }
  }

  const handleNotificationAction = (notificationId: string, action: string) => {
    Alert.alert(action, `Perform ${action}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: action,
        onPress: () => console.log(`${action} notification`, notificationId),
      },
    ])
  }

  const handleDownloadReceipt = (paymentId: string) => {
    Alert.alert("Download Receipt", "Receipt will be saved to your device", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Download",
        onPress: () => console.log("Downloading receipt", paymentId),
      },
    ])
  }

  const renderTripCard = (trip: Trip) => (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Car size={20} color={colors.primary} />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
              }}
              className="font-geist"
            >
              {trip.route}
            </Text>
            {trip.favorite && (
              <Star
                size={16}
                color="#F59E0B"
                style={{ marginLeft: 8 }}
                fill="#F59E0B"
              />
            )}
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Calendar size={16} color={colors.mutedText} />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 14,
                color: colors.mutedText,
              }}
              className="font-geist"
            >
              {trip.date} • {trip.time}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <DollarSign size={16} color={colors.mutedText} />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 14,
                color: colors.mutedText,
              }}
              className="font-groteskBold"
            >
              ${trip.fare.toFixed(2)}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MapPin size={16} color={colors.mutedText} />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 14,
                color: colors.mutedText,
              }}
              className="font-geist"
            >
              {trip.stops.length} stops
            </Text>
          </View>

          {trip.status === "upcoming" && trip.liveLocation && (
            <View
              style={{
                marginTop: 12,
                backgroundColor: `${colors.primary}15`,
                borderRadius: 8,
                padding: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Clock size={16} color={colors.primary} />
                <Text
                  style={{
                    marginLeft: 8,
                    color: colors.primary,
                    fontWeight: "500",
                  }}
                  className="font-geist"
                >
                  Bus arriving in {trip.liveLocation.eta}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 20,
              backgroundColor:
                trip.status === "completed"
                  ? "#10B98120"
                  : trip.status === "upcoming"
                    ? `${colors.primary}20`
                    : "#EF444420",
            }}
          >
            <Text
              style={{
                fontWeight: "500",
                fontSize: 12,
                color:
                  trip.status === "completed"
                    ? "#10B981"
                    : trip.status === "upcoming"
                      ? colors.primary
                      : "#EF4444",
              }}
              className="font-geist"
            >
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
            </Text>
          </View>

          <TouchableOpacity
            style={{
              marginTop: 12,
              padding: 8,
              borderRadius: 20,
              backgroundColor: `${colors.border}50`,
            }}
            onPress={() => handleTripAction(trip.id, "details")}
          >
            <ChevronRight size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 16,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: `${colors.border}50`,
          }}
          onPress={() => handleTripAction(trip.id, "repeat")}
        >
          <Repeat size={16} color={colors.text} />
          <Text
            style={{ marginLeft: 8, color: colors.text, fontSize: 14 }}
            className="font-geist"
          >
            Repeat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: `${colors.border}50`,
          }}
          onPress={() => handleTripAction(trip.id, "favorite")}
        >
          <Star size={16} color="#F59E0B" />
          <Text
            style={{ marginLeft: 8, color: colors.text, fontSize: 14 }}
            className="font-geist"
          >
            Favorite
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: `${colors.border}50`,
          }}
          onPress={() => handleTripAction(trip.id, "details")}
        >
          <Receipt size={16} color={colors.text} />
          <Text
            style={{ marginLeft: 8, color: colors.text, fontSize: 14 }}
            className="font-geist"
          >
            Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderNotificationCard = (notification: Notification) => (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: notification.critical ? "#EF444450" : colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            {notification.type === "alert" ? (
              <AlertCircle size={20} color="#EF4444" />
            ) : notification.type === "promotion" ? (
              <Tag size={20} color="#10B981" />
            ) : (
              <Bell size={20} color={colors.primary} />
            )}
            <Text
              style={{
                marginLeft: 8,
                fontSize: 16,
                fontWeight: "600",
                color: notification.critical ? "#EF4444" : colors.text,
              }}
              className="font-geist"
            >
              {notification.title}
            </Text>
            {!notification.read && (
              <View
                style={{
                  marginLeft: 8,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.primary,
                }}
              />
            )}
          </View>

          <Text
            style={{
              fontSize: 14,
              color: colors.mutedText,
              marginBottom: 12,
            }}
            className="font-geist"
          >
            {notification.message}
          </Text>

          <Text
            style={{
              fontSize: 12,
              color: `${colors.mutedText}80`,
            }}
            className="font-geist"
          >
            {notification.timestamp}
          </Text>
        </View>

        {notification.critical && (
          <View
            style={{
              padding: 8,
              borderRadius: 20,
              backgroundColor: "#EF444420",
            }}
            className="font-geist"
          >
            <AlertCircle size={20} color="#EF4444" />
          </View>
        )}
      </View>

      {notification.actions && notification.actions.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          {notification.actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor:
                  action === "Cancel" ? "#EF444420" : `${colors.border}50`,
              }}
              className="font-geist"
              onPress={() => handleNotificationAction(notification.id, action)}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: action === "Cancel" ? "#EF4444" : colors.text,
                }}
                className="font-geist"
              >
                {action}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )

  const renderPaymentCard = (payment: Payment) => (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <CreditCard size={20} color="#8B5CF6" />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              {payment.type === "wallet" ? "Wallet" : "Credit Card"} Payment
            </Text>
          </View>

          <Text
            style={{
              fontSize: 14,
              color: colors.mutedText,
              marginBottom: 8,
            }}
          >
            {payment.description}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Calendar size={16} color={colors.mutedText} />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 14,
                color: colors.mutedText,
              }}
            >
              {payment.date}
            </Text>
          </View>

          <View
            style={{
              marginTop: 8,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 20,
              backgroundColor:
                payment.status === "completed"
                  ? "#10B98120"
                  : payment.status === "pending"
                    ? "#F59E0B20"
                    : "#EF444420",
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color:
                  payment.status === "completed"
                    ? "#10B981"
                    : payment.status === "pending"
                      ? "#F59E0B"
                      : "#EF4444",
              }}
            >
              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            ${payment.amount.toFixed(2)}
          </Text>

          <TouchableOpacity
            style={{
              marginTop: 12,
              padding: 8,
              borderRadius: 20,
              backgroundColor: `${colors.border}50`,
            }}
            onPress={() => handleDownloadReceipt(payment.id)}
          >
            <Download size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  const renderRewardCard = (reward: Reward) => (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Award
              size={20}
              color={reward.achieved ? "#10B981" : colors.primary}
            />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              {reward.title}
            </Text>
            {reward.achieved && (
              <CheckCircle
                size={20}
                color="#10B981"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>

          <Text
            style={{
              fontSize: 14,
              color: colors.mutedText,
              marginBottom: 8,
            }}
          >
            {reward.description}
          </Text>

          {reward.points && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Sparkles size={16} color={colors.primary} />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 14,
                  color: colors.primary,
                  fontWeight: "500",
                }}
              >
                {reward.points} points
              </Text>
            </View>
          )}

          {reward.expiryDate && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Clock size={16} color={colors.mutedText} />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 14,
                  color: colors.mutedText,
                }}
              >
                Expires: {reward.expiryDate}
              </Text>
            </View>
          )}
        </View>

        <View
          style={{
            padding: 12,
            borderRadius: 20,
            backgroundColor: reward.achieved
              ? "#10B98120"
              : `${colors.primary}20`,
          }}
        >
          <Target
            size={24}
            color={reward.achieved ? "#10B981" : colors.primary}
          />
        </View>
      </View>
    </View>
  )

  const renderContent = () => {
    if (
      isLoadingTrips ||
      isLoadingNotifications ||
      isLoadingPayments ||
      isLoadingRewards
    ) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 40,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.mutedText }}>
            Loading activities...
          </Text>
        </View>
      )
    }

    if (filteredData.length === 0 && searchQuery) {
      return (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 40,
          }}
        >
          <Search size={48} color={colors.mutedText} />
          <Text
            style={{
              marginTop: 16,
              fontSize: 16,
              color: colors.text,
              fontWeight: "500",
            }}
          >
            No results found
          </Text>
          <Text
            style={{
              marginTop: 8,
              color: colors.mutedText,
              textAlign: "center",
            }}
          >
            Try a different search term
          </Text>
        </View>
      )
    }

    if (filteredData.length === 0) {
      return (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 40,
          }}
        >
          {activeTab === "trips" && <Car size={48} color={colors.mutedText} />}
          {activeTab === "notifications" && (
            <Bell size={48} color={colors.mutedText} />
          )}
          {activeTab === "payments" && (
            <CreditCard size={48} color={colors.mutedText} />
          )}
          {activeTab === "rewards" && (
            <Award size={48} color={colors.mutedText} />
          )}
          <Text
            style={{
              marginTop: 16,
              fontSize: 16,
              color: colors.text,
              fontWeight: "500",
            }}
          >
            No {activeTab} yet
          </Text>
          <Text
            style={{
              marginTop: 8,
              color: colors.mutedText,
              textAlign: "center",
            }}
          >
            {activeTab === "trips" && "Book your first ride to see it here"}
            {activeTab === "notifications" && "Notifications will appear here"}
            {activeTab === "payments" && "Payment history will appear here"}
            {activeTab === "rewards" && "Start riding to earn rewards"}
          </Text>
        </View>
      )
    }

    return filteredData.map((item: any) => {
      switch (activeTab) {
        case "trips":
          return renderTripCard(item)
        case "notifications":
          return renderNotificationCard(item)
        case "payments":
          return renderPaymentCard(item)
        case "rewards":
          return renderRewardCard(item)
        default:
          return null
      }
    })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View>
            <Text
              style={{ fontSize: 28, color: colors.text }}
              className="font-groteskBold"
            >
              Activity
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              {isOffline ? (
                <>
                  <WifiOff size={14} color={colors.mutedText} />
                  <Text
                    style={{
                      marginLeft: 4,
                      fontSize: 12,
                      color: colors.mutedText,
                    }}
                    className="font-geist"
                  >
                    Offline • Last synced 5 min ago
                  </Text>
                </>
              ) : (
                <>
                  <Wifi size={14} color="#10B981" />
                  <Text
                    style={{
                      marginLeft: 4,
                      fontSize: 12,
                      color: colors.mutedText,
                    }}
                    className="font-geist"
                  >
                    Online • Live updates
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: colors.card,
              }}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: colors.card,
                position: "relative",
              }}
            >
              <BellRing size={20} color={colors.text} />
              <View
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "#EF4444",
                  borderWidth: 2,
                  borderColor: colors.background,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontSize: 10, color: "#FFFFFF", fontWeight: "bold" }}
                >
                  3
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Smart Suggestions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >
          <View style={{ flexDirection: "row", gap: 12 }}>
            {smartSuggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: colors.primary,
                }}
                onPress={suggestion.action}
              >
                <suggestion.icon size={18} color="#FFFFFF" />
                <Text
                  style={{
                    marginLeft: 8,
                    color: "#FFFFFF",
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                  className="font-geist"
                >
                  {suggestion.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Search Bar */}
        <View style={{ position: "relative", marginBottom: 12 }}>
          <Search
            size={20}
            color={colors.mutedText}
            style={{ position: "absolute", left: 12, top: 14, zIndex: 1 }}
          />
          <TextInput
            style={{
              width: "100%",
              paddingLeft: 40,
              paddingRight: 16,
              paddingVertical: 12,
              backgroundColor: colors.card,
              borderRadius: 12,
              fontSize: 16,
              color: colors.text,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            className="font-geist"
            placeholder="Search trips, receipts, rewards..."
            placeholderTextColor={colors.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {activeTab === "all" && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 20,
                color: colors.text,
                marginBottom: 16,
              }}
              className="font-geist"
            >
              Recent Activity
            </Text>

            {/* Recent Trips */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 12,
              }}
              className="font-geist"
            >
              Recent Trips
            </Text>
            {trips?.slice(0, 2).map((trip) => renderTripCard(trip))}

            {/* Recent Notifications */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 12,
                marginTop: 16,
              }}
              className="font-geist"
            >
              Recent Notifications
            </Text>
            {notifications
              ?.slice(0, 2)
              .map((notification) => renderNotificationCard(notification))}
          </View>
        )}

        {activeTab !== "all" && renderContent()}

        {/* Wallet Summary for Payments Tab */}
        {activeTab === "payments" && (
          <View
            style={{
              backgroundColor: colors.primary,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Wallet Balance
            </Text>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 36,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              $124.50
            </Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF20",
                  borderRadius: 8,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  Auto Top-up
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 8,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.primary, fontWeight: "600" }}>
                  Add Funds
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Rewards Summary */}
        {activeTab === "rewards" && (
          <View
            style={{
              backgroundColor: colors.primary,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text
                  style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "600" }}
                >
                  Loyalty Points
                </Text>
                <Text
                  style={{ color: "#FFFFFF", fontSize: 36, fontWeight: "bold" }}
                >
                  2,450
                </Text>
                <Text style={{ color: "#FFFFFF90", fontSize: 14 }}>
                  Gold Level • 550 to Platinum
                </Text>
              </View>
              <Award size={48} color="#FFFFFF" />
            </View>

            <View
              style={{
                marginTop: 16,
                backgroundColor: "#FFFFFF20",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <Text
                style={{ color: "#FFFFFF", fontWeight: "600", marginBottom: 4 }}
              >
                Current Challenge
              </Text>
              <Text
                style={{ color: "#FFFFFF90", fontSize: 14, marginBottom: 8 }}
              >
                Take 5 rides this week for 500 bonus points!
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#FFFFFF30",
                    borderRadius: 4,
                    height: 8,
                  }}
                >
                  <View
                    style={{
                      width: "60%",
                      backgroundColor: "#FFFFFF",
                      height: 8,
                      borderRadius: 4,
                    }}
                  />
                </View>
                <Text
                  style={{
                    marginLeft: 8,
                    color: "#FFFFFF",
                    fontWeight: "bold",
                  }}
                >
                  3/5
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Load More Indicator */}
        {filteredData.length > 0 && (
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            <Text style={{ color: colors.mutedText }}>
              Showing {filteredData.length} items
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: `${colors.border}50`,
            }}
            onPress={() =>
              Alert.alert("Help", "Contact support", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Contact",
                  onPress: () => console.log("Contacting support"),
                },
              ])
            }
          >
            <Shield size={16} color={colors.text} />
            <Text style={{ marginLeft: 8, color: colors.text, fontSize: 14 }}>
              Help
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: `${colors.border}50`,
            }}
            onPress={() =>
              Alert.alert("Settings", "Open preferences", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Open",
                  onPress: () => console.log("Opening settings"),
                },
              ])
            }
          >
            <MoreVertical size={16} color={colors.text} />
            <Text style={{ marginLeft: 8, color: colors.text, fontSize: 14 }}>
              More
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: colors.primary,
            }}
            onPress={() =>
              Alert.alert("New Trip", "Book a new ride", [
                { text: "Later", style: "cancel" },
                {
                  text: "Book Now",
                  onPress: () => console.log("Booking ride"),
                },
              ])
            }
          >
            <Car size={16} color="#FFFFFF" />
            <Text
              style={{
                marginLeft: 8,
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Book Ride
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}
