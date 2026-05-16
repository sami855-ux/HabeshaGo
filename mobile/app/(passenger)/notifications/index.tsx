import { useThemeContext } from "@/context/ThemeContext"
import { fetchAllNotification } from "@/service/notification.api"
import { Notification, NotificationType } from "@/types/notification"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "@/service/axiosInstance"
import { useRouter } from "expo-router"
import { getSocket } from "@/service/socket"
import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Swipeable } from "react-native-gesture-handler"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import {
  Bell,
  BellRing,
  CheckCheck,
  Trash2,
  Clock,
  Calendar,
  DollarSign,
  MapPin,
  Bus,
  Wallet,
  AlertOctagon,
  Settings,
  Info,
  CreditCard,
  Route,
  Shield,
  Zap,
  X,
  Square,
  CheckSquare,
  ChevronLeft,
} from "lucide-react-native"
import { useAppSelector } from "@/store"
import { sendNotification } from "@/lib/sendNotification"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

// Colorful type styles
const typeStyles: Record<
  string,
  {
    icon: any
    bgColor: string
    iconColor: string
    badgeBg: string
    badgeText: string
  }
> = {
  DEFAULT: {
    icon: Info,
    bgColor: "#6b728020",
    iconColor: "#6b7280",
    badgeBg: "#6b7280",
    badgeText: "#ffffff",
  },
  SYSTEM: {
    icon: Settings,
    bgColor: "#3b82f620",
    iconColor: "#3b82f6",
    badgeBg: "#3b82f6",
    badgeText: "#ffffff",
  },
  BOOKING: {
    icon: Calendar,
    bgColor: "#8b5cf620",
    iconColor: "#8b5cf6",
    badgeBg: "#8b5cf6",
    badgeText: "#ffffff",
  },
  PAYMENT: {
    icon: CreditCard,
    bgColor: "#10b98120",
    iconColor: "#10b981",
    badgeBg: "#10b981",
    badgeText: "#ffffff",
  },
  ROUTE: {
    icon: MapPin,
    bgColor: "#f59e0b20",
    iconColor: "#f59e0b",
    badgeBg: "#f59e0b",
    badgeText: "#ffffff",
  },
  BUS: {
    icon: Bus,
    bgColor: "#6366f120",
    iconColor: "#6366f1",
    badgeBg: "#6366f1",
    badgeText: "#ffffff",
  },
  WALLET: {
    icon: Wallet,
    bgColor: "#ec489920",
    iconColor: "#ec4899",
    badgeBg: "#ec4899",
    badgeText: "#ffffff",
  },
  ALERT: {
    icon: AlertOctagon,
    bgColor: "#ef444420",
    iconColor: "#ef4444",
    badgeBg: "#ef4444",
    badgeText: "#ffffff",
  },
}

export default function NotificationsScreen() {
  const { colors, actualTheme } = useThemeContext()
  const isDark = actualTheme === "dark"
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAppSelector((state) => state.user.user)

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all")
  const [refreshing, setRefreshing] = useState(false)
  const [selectedMode, setSelectedMode] = useState<"normal" | "select">(
    "normal",
  )
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map())

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchAllNotification,
    enabled: !!user,
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.patch(`/notifications/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.patch(`/notification/read-all`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/notifications/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      setSelectedIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(Array.from(prev)[0])
        return newSet
      })
    },
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await axiosInstance.post(`/notifications/bulk-delete`, { ids })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      setSelectedIds(new Set())
      setSelectedMode("normal")
    },
  })

  // Socket integration
  useEffect(() => {
    if (!user?.id) return

    const socket = getSocket()

    const handleConnect = () => {
      socket.emit("joinUserNotification", user.id)
    }

    const handleNotification = async (data: any) => {
      const newNotification = data.notification?.notification
      if (newNotification) {
        queryClient.setQueryData(
          ["notifications"],
          (old: Notification[] = []) => {
            const exists = old.some((n) => n.id === newNotification.id)
            if (exists) return old
            return [newNotification, ...old]
          },
        )

        // Trigger local sound/vibration
        await sendNotification(
          newNotification.title ?? "New Notification",
          newNotification.message ?? "",
        )
      }
    }

    socket.on("connect", handleConnect)
    socket.on("notification:new", handleNotification)

    if (!socket.connected) {
      socket.connect()
    } else {
      handleConnect()
    }

    return () => {
      socket.off("connect", handleConnect)
      socket.off("notification:new", handleNotification)
    }
  }, [user?.id, queryClient])

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n: Notification) => !n.isRead)

  const unreadCount = notifications.filter(
    (n: Notification) => !n.isRead,
  ).length

  const formatTimestamp = (date: string) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diffInMinutes = Math.floor(
      (now.getTime() - notifDate.getTime()) / 60000,
    )

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 2880) return "Yesterday"
    return notifDate.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  const handleNotificationPress = (notification: Notification) => {
    if (selectedMode === "select") {
      toggleSelection(notification.id)
      return
    }

    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id)
    }

    if (notification.actionUrl) {
      // Handle navigation based on URL
      // router.push(notification.actionUrl)
    }
  }

  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteNotificationMutation.mutate(id),
        },
      ],
    )
  }

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const selectAll = () => {
    const allIds = filteredNotifications.map((n: Notification) => n.id)
    setSelectedIds(new Set(allIds))
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
    setSelectedMode("normal")
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return

    Alert.alert(
      "Delete Notifications",
      `Are you sure you want to delete ${selectedIds.size} notification${selectedIds.size > 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => bulkDeleteMutation.mutate(Array.from(selectedIds)),
        },
      ],
    )
  }

  const handleMarkAllRead = () => {
    if (unreadCount === 0) return
    Alert.alert(
      "Mark All as Read",
      `Mark all ${unreadCount} unread notifications as read?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Mark All", onPress: () => markAllAsReadMutation.mutate() },
      ],
    )
  }

  const renderRightActions = (id: number) => {
    return (
      <TouchableOpacity
        onPress={() => handleDelete(id)}
        className="w-20 h-full bg-red-500 items-center justify-center rounded-l-xl"
        style={{ marginLeft: 8 }}
      >
        <Trash2 size={22} color="#ffffff" />
        <Text className="text-white text-xs mt-1 font-medium">Delete</Text>
      </TouchableOpacity>
    )
  }

  const renderNotificationItem = (
    notification: Notification,
    index: number,
  ) => {
    const style = typeStyles[notification.type] || typeStyles.DEFAULT
    const TypeIcon = style.icon
    const isSelected = selectedIds.has(notification.id)

    return (
      <Swipeable
        key={notification.id}
        ref={(ref) => {
          if (ref) swipeableRefs.current.set(notification.id, ref)
        }}
        renderRightActions={() =>
          selectedMode === "normal" && renderRightActions(notification.id)
        }
        overshootRight={false}
        enabled={selectedMode === "normal"}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleNotificationPress(notification)}
          onLongPress={() => setSelectedMode("select")}
          delayLongPress={500}
          className={`px-5 py-4  mb-2 ${!notification.isRead ? "bg-opacity-5" : ""}`}
          style={{
            backgroundColor: !notification.isRead
              ? `${style.iconColor}08`
              : colors.background,
            borderBottomColor: colors.border,
          }}
        >
          <View className="flex-row gap-3">
            {/* Select Checkbox */}
            {selectedMode === "select" && (
              <TouchableOpacity
                onPress={() => toggleSelection(notification.id)}
                className="mr-2 justify-center"
              >
                {isSelected ? (
                  <CheckSquare size={22} color={style.iconColor} />
                ) : (
                  <Square size={22} color={colors.mutedText} />
                )}
              </TouchableOpacity>
            )}

            {/* Icon */}
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: style.bgColor }}
            >
              <TypeIcon size={18} color={style.iconColor} />
            </View>

            {/* Content */}
            <View className="flex-1">
              <View className="flex-row items-start justify-between mb-1">
                <View className="flex-1 mr-2">
                  <Text
                    className="text-[14px] font-semibold font-geist"
                    style={{ color: colors.text }}
                    numberOfLines={1}
                  >
                    {notification.title}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Clock size={10} color={colors.mutedText} />
                  <Text
                    className="text-[10px]"
                    style={{ color: colors.mutedText }}
                  >
                    {formatTimestamp(notification.createdAt)}
                  </Text>
                </View>
              </View>

              <Text
                className="text-xs mb-2 leading-5 font-geist"
                style={{ color: colors.mutedText }}
                numberOfLines={2}
              >
                {notification.message}
              </Text>

              <View className="flex-row items-center gap-2">
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: style.bgColor }}
                >
                  <Text
                    className="text-[9px] font-medium"
                    style={{ color: style.iconColor }}
                  >
                    {notification.type}
                  </Text>
                </View>
                {!notification.isRead && (
                  <View
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: style.iconColor }}
                  />
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    )
  }

  const EmptyState = () => (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: `${colors.mutedText}15` }}
      >
        <Bell size={36} color={colors.mutedText} />
      </View>
      <Text
        className="text-lg font-bold mb-2 text-center"
        style={{ color: colors.text }}
      >
        All caught up!
      </Text>
      <Text className="text-sm text-center" style={{ color: colors.mutedText }}>
        {activeTab === "all"
          ? "You have no notifications at the moment"
          : "No unread notifications"}
      </Text>
    </View>
  )

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View
          className="px-5 pt-4 pb-3 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={() => router.back()} className="p-1">
                <ChevronLeft size={24} color={colors.text} />
              </TouchableOpacity>
              <View>
                <Text
                  className="text-2xl font-geist"
                  style={{ color: colors.text }}
                >
                  Notifications
                </Text>
                {unreadCount > 0 && (
                  <View className="flex-row items-center mt-0.5">
                    <View className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5" />
                    <Text
                      className="text-xs font-geist"
                      style={{ color: colors.mutedText }}
                    >
                      {unreadCount} unread
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            {selectedMode === "normal" ? (
              <View className="flex-row gap-2">
                {unreadCount > 0 && (
                  <TouchableOpacity
                    onPress={handleMarkAllRead}
                    className="px-3 py-2 rounded-xl flex-row items-center gap-1.5"
                    style={{ backgroundColor: `${colors.primary}15` }}
                  >
                    <CheckCheck size={16} color={colors.primary} />
                    <Text
                      className="text-xs font-medium font-geist"
                      style={{ color: colors.primary }}
                    >
                      Read all
                    </Text>
                  </TouchableOpacity>
                )}
                {notifications.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSelectedMode("select")}
                    className="p-2 rounded-xl"
                    style={{ backgroundColor: `${colors.mutedText}10` }}
                  >
                    <Square size={18} color={colors.mutedText} />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={clearSelection}
                  className="px-3 py-2 rounded-xl"
                  style={{ backgroundColor: `${colors.mutedText}10` }}
                >
                  <Text
                    className="text-sm font-medium font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={selectAll}
                  className="px-3 py-2 rounded-xl"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <Text
                    className="text-sm font-medium font-geist"
                    style={{ color: colors.primary }}
                  >
                    Select All
                  </Text>
                </TouchableOpacity>
                {selectedIds.size > 0 && (
                  <TouchableOpacity
                    onPress={handleBulkDelete}
                    className="px-3 py-2 rounded-xl flex-row items-center gap-1.5"
                    style={{ backgroundColor: "#ef444415" }}
                  >
                    <Trash2 size={16} color="#ef4444" />
                    <Text
                      className="text-sm font-medium font-geist"
                      style={{ color: "#ef4444" }}
                    >
                      {selectedIds.size}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View
          className="flex-row px-5 pt-3 gap-3 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <TouchableOpacity
            onPress={() => setActiveTab("all")}
            className={`pb-3 ${activeTab === "all" ? "border-b-2" : ""}`}
            style={{
              borderBottomColor:
                activeTab === "all" ? colors.primary : "transparent",
            }}
          >
            <Text
              className="text-base font-semibold font-geist"
              style={{
                color: activeTab === "all" ? colors.primary : colors.mutedText,
              }}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("unread")}
            className={`pb-3 flex-row items-center gap-1.5 ${activeTab === "unread" ? "border-b-2" : ""}`}
            style={{
              borderBottomColor:
                activeTab === "unread" ? colors.primary : "transparent",
            }}
          >
            <Text
              className="text-base font-semibold font-geist"
              style={{
                color:
                  activeTab === "unread" ? colors.primary : colors.mutedText,
              }}
            >
              Unread
            </Text>
            {unreadCount > 0 && (
              <View
                className="px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <Text
                  className="text-[10px] font-bold"
                  style={{ color: colors.primary }}
                >
                  {unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              className="mt-3 text-sm font-geist"
              style={{ color: colors.mutedText }}
            >
              Loading notifications...
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {filteredNotifications.length === 0 ? (
              <EmptyState />
            ) : (
              <View>
                {filteredNotifications.map(
                  (notification: Notification, index: number) =>
                    renderNotificationItem(notification, index),
                )}

                {/* Footer */}
                <View className="py-6 items-center">
                  <View className="flex-row items-center gap-1">
                    <Zap size={10} color={colors.mutedText} />
                    <Text
                      className="text-[10px] font-geist"
                      style={{ color: colors.mutedText }}
                    >
                      Live updates
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}
