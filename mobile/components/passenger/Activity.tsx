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
  Clock,
  CreditCard,
  DollarSign,
  Filter,
  Gift,
  History,
  MapPin,
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
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AlertModal from "../utils/AlertModal"

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
    date: "Today",
    time: "08:30 AM",
    fare: 24.5,
    status: "completed",
    stops: ["Main St", "Central Park", "Airport Terminal"],
    favorite: true,
  },
  {
    id: "2",
    route: "University Shuttle → Tech Park",
    date: "Tomorrow",
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
    date: "Yesterday",
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
    date: "Today",
    receiptUrl: "https://example.com/receipt1",
    status: "completed",
  },
  {
    id: "2",
    amount: 50.0,
    type: "credit_card",
    description: "Wallet Top-up",
    date: "Yesterday",
    receiptUrl: "https://example.com/receipt2",
    status: "pending",
  },
  {
    id: "3",
    amount: 12.75,
    type: "wallet",
    description: "University Shuttle Trip",
    date: "Tomorrow",
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

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const SWIPE_THRESHOLD = 100

export default function ActivityTab() {
  const { colors, actualTheme } = useThemeContext()
  const isDark = actualTheme === "dark"
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{
    id: string
    type: string
    title: string
  } | null>(null)
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null)

  const queryClient = useQueryClient()

  // Check network status
  useEffect(() => {
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
      if (stored) return JSON.parse(stored)
      await AsyncStorage.setItem("tripsData", JSON.stringify(MOCK_TRIPS))
      return MOCK_TRIPS
    },
  })

  const { data: notifications, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem("notificationsData")
      if (stored) return JSON.parse(stored)
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
      if (stored) return JSON.parse(stored)
      await AsyncStorage.setItem("paymentsData", JSON.stringify(MOCK_PAYMENTS))
      return MOCK_PAYMENTS
    },
  })

  const { data: rewards, isLoading: isLoadingRewards } = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem("rewardsData")
      if (stored) return JSON.parse(stored)
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
    setIsOffline(false)
  }, [queryClient])

  // Delete single item
  const deleteSingleItem = async (id: string, type: string, title: string) => {
    setItemToDelete({ id, type, title })
    setShowDeleteModal(true)
  }

  // Confirm delete single item
  const confirmDeleteSingleItem = async () => {
    if (!itemToDelete) return

    let updatedData: any[] = []
    let storageKey = ""

    switch (activeTab) {
      case "trips":
        updatedData =
          trips?.filter((trip: Trip) => trip.id !== itemToDelete.id) || []
        storageKey = "tripsData"
        break
      case "notifications":
        updatedData =
          notifications?.filter(
            (notif: Notification) => notif.id !== itemToDelete.id
          ) || []
        storageKey = "notificationsData"
        break
      case "payments":
        updatedData =
          payments?.filter(
            (payment: Payment) => payment.id !== itemToDelete.id
          ) || []
        storageKey = "paymentsData"
        break
      case "rewards":
        updatedData =
          rewards?.filter((reward: Reward) => reward.id !== itemToDelete.id) ||
          []
        storageKey = "rewardsData"
        break
    }

    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedData))
    queryClient.invalidateQueries({ queryKey: [activeTab] })
    setShowDeleteModal(false)
    setItemToDelete(null)
    setSwipedItemId(null)
  }

  // Mark notification as read
  const markAsRead = async (id: string) => {
    const updatedNotifications =
      notifications?.map((notif: Notification) =>
        notif.id === id ? { ...notif, read: true } : notif
      ) || []

    await AsyncStorage.setItem(
      "notificationsData",
      JSON.stringify(updatedNotifications)
    )
    queryClient.invalidateQueries({ queryKey: ["notifications"] })
  }

  // Filter data
  const filteredData = useMemo(() => {
    let data: any[] = []

    switch (activeTab) {
      case "all":
        // Combine recent items from all categories
        const recentTrips = trips?.slice(0, 2) || []
        const recentNotifications = notifications?.slice(0, 2) || []
        const recentPayments = payments?.slice(0, 2) || []
        const recentRewards = rewards?.slice(0, 2) || []
        data = [
          ...recentTrips,
          ...recentNotifications,
          ...recentPayments,
          ...recentRewards,
        ]
        break
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

    return data
  }, [activeTab, trips, notifications, payments, rewards, searchQuery])

  // Swipeable Item Component - Gmail style
  const SwipeableItem = ({
    children,
    id,
    itemTitle,
    itemType,
    isNotification = false,
  }: {
    children: React.ReactNode
    id: string
    itemTitle: string
    itemType: string
    isNotification?: boolean
  }) => {
    const translateX = useRef(new Animated.Value(0)).current
    const opacity = useRef(new Animated.Value(1)).current
    const [isSwiping, setIsSwiping] = useState(false)

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5
      },
      onPanResponderGrant: () => {
        setIsSwiping(true)
        // Reset other swiped items
        if (swipedItemId && swipedItemId !== id) {
          setSwipedItemId(null)
        }
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          // Only left swipe for delete
          translateX.setValue(gestureState.dx)
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsSwiping(false)
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe successful - show delete modal
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -SCREEN_WIDTH,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // After animation completes, show delete modal
            deleteSingleItem(id, itemType, itemTitle)
            // Reset animation values
            translateX.setValue(0)
            opacity.setValue(1)
          })
        } else {
          // Swipe not far enough - snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start()
        }
      },
      onPanResponderTerminate: () => {
        setIsSwiping(false)
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start()
      },
    })

    return (
      <Animated.View
        style={{
          transform: [{ translateX }],
          opacity,
          marginBottom: 12,
        }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    )
  }

  // Render trip card
  const renderTripCard = (trip: Trip) => (
    <SwipeableItem
      key={trip.id}
      id={trip.id}
      itemTitle={trip.route}
      itemType="trip"
    >
      <TouchableOpacity
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        }}
        onPress={() => {
          // Handle trip tap
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
                style={{ marginLeft: 8, fontSize: 14, color: colors.mutedText }}
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
                style={{ marginLeft: 8, fontSize: 14, color: colors.mutedText }}
                className="font-groteskBold"
              >
                ${trip.fare.toFixed(2)}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MapPin size={16} color={colors.mutedText} />
              <Text
                style={{ marginLeft: 8, fontSize: 14, color: colors.mutedText }}
                className="font-geist"
              >
                {trip.stops.length} stops
              </Text>
            </View>

            {trip.status === "upcoming" && trip.liveLocation && (
              <View
                style={{
                  marginTop: 12,
                  backgroundColor: isDark ? "#1E3A8A20" : "#DBEAFE",
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
                    Arriving in {trip.liveLocation.eta}
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
                    ? isDark
                      ? "#065F4620"
                      : "#D1FAE5"
                    : trip.status === "upcoming"
                      ? isDark
                        ? "#1E3A8A20"
                        : "#DBEAFE"
                      : isDark
                        ? "#7F1D1D20"
                        : "#FEE2E2",
              }}
            >
              <Text
                style={{
                  fontWeight: "500",
                  fontSize: 12,
                  color:
                    trip.status === "completed"
                      ? isDark
                        ? "#34D399"
                        : "#10B981"
                      : trip.status === "upcoming"
                        ? colors.primary
                        : isDark
                          ? "#F87171"
                          : "#EF4444",
                }}
                className="font-geist"
              >
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
              </Text>
            </View>
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
              backgroundColor: isDark ? "#374151" : "#F3F4F6",
            }}
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
              backgroundColor: isDark ? "#374151" : "#F3F4F6",
            }}
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
      </TouchableOpacity>
    </SwipeableItem>
  )

  // Render notification card
  const renderNotificationCard = (notification: Notification) => (
    <SwipeableItem
      key={notification.id}
      id={notification.id}
      itemTitle={notification.title}
      itemType="notification"
      isNotification={true}
    >
      <TouchableOpacity
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: notification.critical
            ? isDark
              ? "#7F1D1D"
              : "#FEE2E2"
            : colors.border,
          borderLeftWidth: notification.critical ? 4 : 0,
          borderLeftColor: notification.critical
            ? isDark
              ? "#EF4444"
              : "#DC2626"
            : "transparent",
        }}
        onPress={() => markAsRead(notification.id)}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View
            style={{
              padding: 8,
              borderRadius: 12,
              backgroundColor:
                notification.type === "alert"
                  ? isDark
                    ? "#7F1D1D20"
                    : "#FEE2E2"
                  : notification.type === "promotion"
                    ? isDark
                      ? "#065F4620"
                      : "#D1FAE5"
                    : isDark
                      ? "#1E3A8A20"
                      : "#DBEAFE",
            }}
          >
            {notification.type === "alert" ? (
              <AlertCircle size={18} color={isDark ? "#F87171" : "#DC2626"} />
            ) : notification.type === "promotion" ? (
              <Tag size={18} color={isDark ? "#34D399" : "#10B981"} />
            ) : (
              <Bell size={18} color={colors.primary} />
            )}
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: notification.critical
                    ? isDark
                      ? "#F87171"
                      : "#DC2626"
                    : colors.text,
                  flex: 1,
                }}
                className="font-geist"
                numberOfLines={1}
              >
                {notification.title}
              </Text>
              {!notification.read && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.primary,
                    marginLeft: 8,
                  }}
                />
              )}
            </View>

            <Text
              style={{
                fontSize: 14,
                color: colors.mutedText,
                marginTop: 4,
                marginBottom: 8,
              }}
              className="font-geist"
              numberOfLines={2}
            >
              {notification.message}
            </Text>

            <Text
              style={{
                fontSize: 12,
                color: isDark ? "#9CA3AF" : "#6B7280",
              }}
              className="font-geist"
            >
              {notification.timestamp}
            </Text>

            {notification.actions && notification.actions.length > 0 && (
              <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                {notification.actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor:
                        action === "Cancel"
                          ? isDark
                            ? "#7F1D1D20"
                            : "#FEE2E2"
                          : isDark
                            ? "#374151"
                            : "#F3F4F6",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color:
                          action === "Cancel"
                            ? isDark
                              ? "#F87171"
                              : "#DC2626"
                            : colors.text,
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
        </View>
      </TouchableOpacity>
    </SwipeableItem>
  )

  // Render payment card
  const renderPaymentCard = (payment: Payment) => (
    <SwipeableItem
      key={payment.id}
      id={payment.id}
      itemTitle={payment.description}
      itemType="payment"
    >
      <TouchableOpacity
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
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
              <CreditCard size={20} color={isDark ? "#8B5CF6" : "#7C3AED"} />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.text,
                }}
                className="font-geist"
              >
                {payment.type === "wallet" ? "Wallet" : "Credit Card"} Payment
              </Text>
            </View>

            <Text
              style={{ fontSize: 14, color: colors.mutedText, marginBottom: 8 }}
              className="font-geist"
            >
              {payment.description}
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Calendar size={16} color={colors.mutedText} />
              <Text
                style={{ marginLeft: 8, fontSize: 14, color: colors.mutedText }}
                className="font-geist"
              >
                {payment.date}
              </Text>
            </View>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{ fontSize: 20, fontWeight: "700", color: colors.text }}
              className="font-groteskBold"
            >
              ${payment.amount.toFixed(2)}
            </Text>
            <View
              style={{
                marginTop: 8,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
                backgroundColor:
                  payment.status === "completed"
                    ? isDark
                      ? "#065F4620"
                      : "#D1FAE5"
                    : payment.status === "pending"
                      ? isDark
                        ? "#92400E20"
                        : "#FEF3C7"
                      : isDark
                        ? "#7F1D1D20"
                        : "#FEE2E2",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color:
                    payment.status === "completed"
                      ? isDark
                        ? "#34D399"
                        : "#10B981"
                      : payment.status === "pending"
                        ? isDark
                          ? "#FBBF24"
                          : "#D97706"
                        : isDark
                          ? "#F87171"
                          : "#DC2626",
                }}
                className="font-geist"
              >
                {payment.status.charAt(0).toUpperCase() +
                  payment.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </SwipeableItem>
  )

  // Render reward card
  const renderRewardCard = (reward: Reward) => (
    <View
      key={reward.id}
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
              color={
                reward.achieved
                  ? isDark
                    ? "#34D399"
                    : "#10B981"
                  : colors.primary
              }
            />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
              }}
              className="font-geist"
            >
              {reward.title}
            </Text>
            {reward.achieved && (
              <CheckCircle
                size={20}
                color={isDark ? "#34D399" : "#10B981"}
                style={{ marginLeft: 8 }}
              />
            )}
          </View>

          <Text
            style={{ fontSize: 14, color: colors.mutedText, marginBottom: 8 }}
            className="font-geist"
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
                className="font-geist"
              >
                {reward.points} points
              </Text>
            </View>
          )}

          {reward.expiryDate && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Clock size={16} color={colors.mutedText} />
              <Text
                style={{ marginLeft: 8, fontSize: 14, color: colors.mutedText }}
                className="font-geist"
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
              ? isDark
                ? "#065F4620"
                : "#D1FAE5"
              : isDark
                ? "#1E3A8A20"
                : "#DBEAFE",
          }}
        >
          <Target
            size={24}
            color={
              reward.achieved
                ? isDark
                  ? "#34D399"
                  : "#10B981"
                : colors.primary
            }
          />
        </View>
      </View>
    </View>
  )

  // Render empty state
  const renderEmptyState = () => (
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
      {activeTab === "rewards" && <Award size={48} color={colors.mutedText} />}
      <Text
        style={{
          marginTop: 16,
          fontSize: 16,
          color: colors.text,
          fontWeight: "500",
        }}
        className="font-geist"
      >
        No {activeTab} found
      </Text>
      <Text
        style={{ marginTop: 8, color: colors.mutedText, textAlign: "center" }}
        className="font-geist"
      >
        {searchQuery
          ? "Try a different search"
          : activeTab === "trips"
            ? "Book your first ride to see it here"
            : activeTab === "notifications"
              ? "All caught up! No new notifications"
              : activeTab === "payments"
                ? "No payment history yet"
                : "Start riding to earn rewards"}
      </Text>
    </View>
  )

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
            placeholder="Search activities..."
            placeholderTextColor={colors.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick Actions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 12 }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: colors.primary,
              }}
            >
              <Repeat size={16} color="#FFFFFF" />
              <Text
                style={{
                  marginLeft: 8,
                  color: "#FFFFFF",
                  fontWeight: "600",
                  fontSize: 14,
                }}
                className="font-geist"
              >
                Repeat Trip
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: isDark ? "#374151" : "#F3F4F6",
              }}
            >
              <Wallet size={16} color={colors.text} />
              <Text
                style={{
                  marginLeft: 8,
                  color: colors.text,
                  fontWeight: "600",
                  fontSize: 14,
                }}
                className="font-geist"
              >
                Add Funds
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: isDark ? "#374151" : "#F3F4F6",
              }}
              onPress={() => setActiveTab("rewards")}
            >
              <Gift size={16} color={colors.text} />
              <Text
                style={{
                  marginLeft: 8,
                  color: colors.text,
                  fontWeight: "600",
                  fontSize: 14,
                }}
                className="font-geist"
              >
                Rewards
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Tabs - Clean Design */}
        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={{ flex: 1, alignItems: "center", paddingVertical: 12 }}
              >
                <Icon
                  size={18}
                  color={isActive ? colors.primary : colors.mutedText}
                />
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: isActive ? colors.primary : colors.mutedText,
                    fontWeight: isActive ? "600" : "400",
                  }}
                  className="font-geist"
                >
                  {tab.label}
                </Text>
                {isActive && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      height: 2,
                      width: "50%",
                      backgroundColor: colors.primary,
                      borderTopLeftRadius: 1,
                      borderTopRightRadius: 1,
                    }}
                  />
                )}
              </TouchableOpacity>
            )
          })}
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
        {isLoadingTrips ||
        isLoadingNotifications ||
        isLoadingPayments ||
        isLoadingRewards ? (
          <View style={{ paddingVertical: 40 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={{
                textAlign: "center",
                marginTop: 16,
                color: colors.mutedText,
              }}
              className="font-geist"
            >
              Loading activities...
            </Text>
          </View>
        ) : filteredData.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={{ paddingBottom: 20 }}>
            {activeTab === "all" ? (
              <>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 12,
                  }}
                  className="font-geist"
                >
                  Recent Activity
                </Text>
                {trips?.slice(0, 2).map((trip) => renderTripCard(trip))}
                {notifications
                  ?.slice(0, 2)
                  .map((notification) => renderNotificationCard(notification))}
                {payments
                  ?.slice(0, 2)
                  .map((payment) => renderPaymentCard(payment))}
                {rewards?.slice(0, 2).map((reward) => renderRewardCard(reward))}
              </>
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 12,
                  }}
                  className="font-geist"
                >
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </Text>
                {filteredData.map((item: any) => {
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
                })}
              </>
            )}
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
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: isDark ? "#374151" : "#F3F4F6",
            }}
          >
            <Shield size={16} color={colors.text} />
            <Text
              style={{ marginLeft: 8, color: colors.text, fontSize: 14 }}
              className="font-geist"
            >
              Help
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: isDark ? "#374151" : "#F3F4F6",
            }}
          >
            <Filter size={16} color={colors.text} />
            <Text
              style={{ marginLeft: 8, color: colors.text, fontSize: 14 }}
              className="font-geist"
            >
              Filter
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: colors.primary,
            }}
          >
            <Car size={16} color="#FFFFFF" />
            <Text
              style={{
                marginLeft: 8,
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: "600",
              }}
              className="font-geist"
            >
              Book Ride
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Delete Modal */}
      <AlertModal
        visible={showDeleteModal}
        type="warning"
        title={
          itemToDelete ? `Delete "${itemToDelete.title}"?` : "Delete Item?"
        }
        message="This action cannot be undone. The item will be permanently removed."
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onPrimaryPress={confirmDeleteSingleItem}
        onSecondaryPress={() => {
          setShowDeleteModal(false)
          setItemToDelete(null)
        }}
        onClose={() => {
          setShowDeleteModal(false)
          setItemToDelete(null)
        }}
        showCloseButton={false}
        overlayClose={false}
      />
    </SafeAreaView>
  )
}
