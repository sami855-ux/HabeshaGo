import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  Shield,
  CreditCard,
  Route as RouteIcon,
  Bus,
  Wallet,
  BellRing,
  CheckCheck,
  ExternalLink,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { Notification, NotificationType } from "@/types/notification"
import { fetchAllNotification } from "@/services/notification.api"
import { useAppSelector } from "@/store/store"

// API service functions (replace with actual API calls)
const notificationApi = {
  // Fetch all notifications
  fetchNotifications: async (): Promise<Notification[]> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const now = new Date()
    const notifications: Notification[] = [
      {
        id: 1,
        userId: "user-123",
        title: "Booking Confirmed",
        message:
          "Your booking for Route A has been confirmed. Seat numbers: 12A, 12B",
        type: NotificationType.BOOKING,
        isRead: false,
        metadata: {
          bookingId: "BK-2023-001",
          routeId: "RT-001",
          busId: "BUS-001",
          amount: 1250,
          status: "confirmed",
        },
        createdAt: new Date(now.getTime() - 30 * 60000),
      },
      {
        id: 2,
        userId: "user-123",
        title: "Payment Successful",
        message:
          "Payment of $1,250.00 for booking BK-2023-001 has been processed",
        type: NotificationType.PAYMENT,
        isRead: false,
        metadata: {
          paymentId: "PAY-2023-001",
          amount: 1250,
          status: "completed",
        },
        actionUrl: "/dashboard/payments/PAY-2023-001",
        createdAt: new Date(now.getTime() - 2 * 3600000),
      },
      {
        id: 3,
        userId: "user-123",
        title: "Route Update",
        message:
          "Route B schedule has been updated. Please check the new timings",
        type: NotificationType.ROUTE,
        isRead: true,
        readAt: new Date(now.getTime() - 12 * 3600000),
        metadata: {
          routeId: "RT-002",
          changes: "schedule_updated",
        },
        actionUrl: "/routes/RT-002",
        createdAt: new Date(now.getTime() - 24 * 3600000),
      },
      {
        id: 4,
        userId: "user-123",
        title: "Bus Maintenance",
        message:
          "BUS-003 is undergoing maintenance. Alternate arrangements have been made",
        type: NotificationType.BUS,
        isRead: true,
        readAt: new Date(now.getTime() - 24 * 3600000),
        metadata: {
          busId: "BUS-003",
          status: "maintenance",
          alternateBus: "BUS-004",
        },
        createdAt: new Date(now.getTime() - 2 * 24 * 3600000),
      },
      {
        id: 5,
        userId: "user-123",
        title: "Wallet Credit",
        message:
          "$500.00 has been credited to your wallet. New balance: $1,750.00",
        type: NotificationType.WALLET,
        isRead: false,
        metadata: {
          walletId: "WLT-001",
          amount: 500,
          transactionType: "credit",
          newBalance: 1750,
        },
        actionUrl: "/wallet",
        createdAt: new Date(now.getTime() - 3 * 24 * 3600000),
      },
      {
        id: 6,
        userId: "user-123",
        title: "System Update",
        message: "System maintenance scheduled for tonight 2:00 AM - 4:00 AM",
        type: NotificationType.SYSTEM,
        isRead: true,
        readAt: new Date(now.getTime() - 24 * 3600000),
        metadata: {
          maintenanceStart: "2023-12-15T02:00:00Z",
          maintenanceEnd: "2023-12-15T04:00:00Z",
        },
        createdAt: new Date(now.getTime() - 4 * 24 * 3600000),
      },
      {
        id: 7,
        userId: "user-123",
        title: "Weather Alert",
        message:
          "Heavy rain alert for your route tomorrow. Please plan accordingly",
        type: NotificationType.ALERT,
        isRead: false,
        metadata: {
          alertType: "weather",
          severity: "high",
          routeId: "RT-001",
        },
        createdAt: new Date(now.getTime() - 5 * 24 * 3600000),
      },
      {
        id: 8,
        userId: "user-123",
        title: "Booking Reminder",
        message:
          "Your bus departs in 2 hours. Please arrive at the station 30 minutes early",
        type: NotificationType.BOOKING,
        isRead: true,
        readAt: new Date(now.getTime() - 24 * 3600000),
        metadata: {
          bookingId: "BK-2023-002",
          departureTime: "2023-12-15T14:30:00Z",
          station: "Central Bus Terminal",
        },
        actionUrl: "/bookings/BK-2023-002",
        createdAt: new Date(now.getTime() - 6 * 24 * 3600000),
      },
    ]

    return notifications
  },

  // Mark notification as read
  markAsRead: async (notificationId: number): Promise<Notification> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    // In real app, this would be an API call
    const now = new Date()
    return {
      id: notificationId,
      userId: "user-123",
      title: "Updated",
      message: "Notification marked as read",
      type: NotificationType.SYSTEM,
      isRead: true,
      readAt: now,
      createdAt: now,
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    // In real app, this would be an API call
  },

  // Delete notification
  deleteNotification: async (notificationId: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    // In real app, this would be an API call
  },

  // Delete all notifications
  deleteAllNotifications: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    // In real app, this would be an API call
  },
}

// React Query keys
const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filters: { unreadOnly?: boolean }) =>
    [...notificationKeys.lists(), filters] as const,
}

interface NotificationSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const NotificationSheet: React.FC<NotificationSheetProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const queryClient = useQueryClient()
  const user = useAppSelector((state) => state.user.user)
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all")

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: notificationKeys.list({}),
    queryFn: fetchAllNotification,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!user, // Only fetch if user is logged in
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onMutate: async (notificationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() })

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueryData<Notification[]>(
        notificationKeys.lists(),
      )

      // Optimistically update
      queryClient.setQueryData<Notification[]>(
        notificationKeys.lists(),
        (old) =>
          old?.map((notif) =>
            notif.id === notificationId
              ? { ...notif, isRead: true, readAt: new Date() }
              : notif,
          ) || [],
      )

      return { previousNotifications }
    },
    onError: (err, notificationId, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          notificationKeys.lists(),
          context.previousNotifications,
        )
      }
      toast.error("Failed to mark notification as read")
    },
    onSettled: () => {
      // Refetch to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onMutate: async () => {
      const previousNotifications = queryClient.getQueryData<Notification[]>(
        notificationKeys.lists(),
      )

      queryClient.setQueryData<Notification[]>(
        notificationKeys.lists(),
        (old) =>
          old?.map((notif) => ({
            ...notif,
            isRead: true,
            readAt: new Date(),
          })) || [],
      )

      return { previousNotifications }
    },
    onSuccess: () => {
      toast.success("All notifications marked as read")
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          notificationKeys.lists(),
          context.previousNotifications,
        )
      }
      toast.error("Failed to mark all notifications as read")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: notificationApi.deleteNotification,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() })

      const previousNotifications = queryClient.getQueryData<Notification[]>(
        notificationKeys.lists(),
      )

      queryClient.setQueryData<Notification[]>(
        notificationKeys.lists(),
        (old) => old?.filter((notif) => notif.id !== notificationId) || [],
      )

      return { previousNotifications }
    },
    onSuccess: () => {
      toast.success("Notification deleted")
    },
    onError: (err, notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          notificationKeys.lists(),
          context.previousNotifications,
        )
      }
      toast.error("Failed to delete notification")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })

  const handleActionClick = (notification: Notification) => {
    if (notification.actionUrl) {
      console.log(`Navigating to: ${notification.actionUrl}`)
      // In a real app: router.push(notification.actionUrl)
    }

    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id)
    }
  }

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId)
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const handleDelete = (notificationId: number) => {
    deleteNotificationMutation.mutate(notificationId)
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SYSTEM:
        return <Shield className="h-4 w-4 text-muted-foreground" />
      case NotificationType.BOOKING:
        return <Calendar className="h-4 w-4 text-blue-500" />
      case NotificationType.PAYMENT:
        return <CreditCard className="h-4 w-4 text-green-500" />
      case NotificationType.ROUTE:
        return <RouteIcon className="h-4 w-4 text-purple-500" />
      case NotificationType.BUS:
        return <Bus className="h-4 w-4 text-amber-500" />
      case NotificationType.WALLET:
        return <Wallet className="h-4 w-4 text-emerald-500" />
      case NotificationType.ALERT:
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "completed":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case "pending":
        return <AlertTriangle className="h-3 w-3 text-amber-500" />
      case "cancelled":
        return <XCircle className="h-3 w-3 text-red-500" />
      default:
        return null
    }
  }

  const getTypeBadgeColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SYSTEM:
        return "bg-secondary text-secondary-foreground"
      case NotificationType.BOOKING:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
      case NotificationType.PAYMENT:
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
      case NotificationType.ROUTE:
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
      case NotificationType.BUS:
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
      case NotificationType.WALLET:
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
      case NotificationType.ALERT:
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications?.filter((notification) => !notification.isRead)

  const unreadCount = notifications?.filter((n) => !n.isRead).length

  if (error) {
    console.error("Error loading notifications:", error)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg w-full p-0">
        <SheetHeader className="p-6 pb-4 border-b pt-9">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BellRing className="h-5 w-5" />
              <SheetTitle>Notifications</SheetTitle>
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <SheetDescription className="text-muted-foreground">
            Your recent notifications and alerts
          </SheetDescription>
        </SheetHeader>

        {/* Simple Tabs - Only All and Unread */}
        <div className="p-4 py-2">
          <div className="flex items-center justify-between mb-3">
            <Tabs
              defaultValue="all"
              className="w-full"
              onValueChange={(v) => setActiveTab(v as "all" | "unread")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all" className="border-none">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="border-none">
                  Unread
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="ml-2 h-8"
                disabled={markAllAsReadMutation.isPending}
              >
                {markAllAsReadMutation.isPending ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <CheckCheck className="h-3 w-3 mr-1" />
                )}
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-270px)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                Loading notifications...
              </p>
            </div>
          ) : filteredNotifications?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-4">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                No notifications
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === "unread"
                  ? "You've read all notifications"
                  : "You don't have any notifications yet"}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {filteredNotifications?.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    p-4 border rounded-lg transition-all duration-200 cursor-pointer
                    hover:bg-accent hover:text-accent-foreground
                    ${
                      !notification.isRead
                        ? "bg-primary/5 dark:bg-primary/10"
                        : "border-border"
                    }
                  `}
                  onClick={() => handleActionClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-sm text-foreground">
                              {notification.title}
                            </h4>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getTypeBadgeColor(notification.type)}`}
                            >
                              {notification.type}
                            </Badge>
                            {!notification.isRead && (
                              <span className="h-2 w-2 bg-primary rounded-full"></span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(notification.id)
                            }}
                            disabled={deleteNotificationMutation.isPending}
                          >
                            {deleteNotificationMutation.isPending &&
                            deleteNotificationMutation.variables ===
                              notification.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            )}
                          </Button>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {notification.message}
                        </p>

                        {/* Metadata Display */}
                        {notification.metadata && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {notification.metadata.bookingId && (
                              <div className="flex items-center space-x-1 text-xs">
                                <span className="font-medium text-foreground">
                                  Booking:
                                </span>
                                <span className="text-muted-foreground">
                                  {notification.metadata.bookingId}
                                </span>
                              </div>
                            )}
                            {notification.metadata.paymentId && (
                              <div className="flex items-center space-x-1 text-xs">
                                <span className="font-medium text-foreground">
                                  Payment:
                                </span>
                                <span className="text-muted-foreground">
                                  {notification.metadata.paymentId}
                                </span>
                              </div>
                            )}
                            {notification.metadata.amount && (
                              <div className="flex items-center space-x-1 text-xs">
                                <span className="font-medium text-foreground">
                                  Amount:
                                </span>
                                <span className="font-semibold text-green-600 dark:text-green-400">
                                  $
                                  {notification.metadata.amount.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {notification.metadata.status && (
                              <div className="flex items-center space-x-1 text-xs">
                                {getStatusIcon(notification.metadata.status)}
                                <span
                                  className={`font-medium ${
                                    notification.metadata.status ===
                                      "confirmed" ||
                                    notification.metadata.status === "completed"
                                      ? "text-green-600 dark:text-green-400"
                                      : notification.metadata.status ===
                                          "pending"
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {notification.metadata.status}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimeAgo(notification.createdAt)}
                          </div>

                          <div className="flex items-center space-x-2">
                            {notification.actionUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs hover:text-primary"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleActionClick(notification)
                                }}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                            )}

                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs hover:text-primary"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkAsRead(notification.id)
                                }}
                                disabled={markAsReadMutation.isPending}
                              >
                                {markAsReadMutation.isPending &&
                                markAsReadMutation.variables ===
                                  notification.id ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : null}
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {filteredNotifications?.length > 0 && (
          <div className="p-4 ">
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                Showing {filteredNotifications?.length} of{" "}
                {notifications?.length} notifications
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : null}
                Refresh
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default NotificationSheet
