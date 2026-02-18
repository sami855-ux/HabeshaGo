import React, { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "@/services/axiosInstance"
import { socket } from "@/services/socket"
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

const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
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

  // FETCH NOTIFICATIONS
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: fetchAllNotification,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  // SOCKET INTEGRATION
  useEffect(() => {
    if (!user?.id) return

    socket.emit("joinUserNotification", user.id)

    socket.on("notification:new", (data) => {
      const { notification } = data

      queryClient.setQueryData<Notification[]>(
        notificationKeys.lists(),
        (old = []) => {
          const exists = old.some((n) => n.id === notification.id)
          if (exists) return old
          return [notification, ...old]
        },
      )
    })

    return () => {
      socket.off("notification:new")
    }
  }, [user?.id, queryClient])

  // MARK AS READ
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.patch(`/notifications/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
    onError: () => toast.error("Failed to mark as read"),
  })

  // MARK ALL AS READ
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.patch(`/notifications/read-all`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      toast.success("All notifications marked as read")
    },
    onError: () => toast.error("Failed to mark all as read"),
  })

  // DELETE NOTIFICATION
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/notifications/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      toast.success("Notification deleted")
    },
    onError: () => toast.error("Failed to delete notification"),
  })

  const handleActionClick = (notification: Notification) => {
    if (notification.actionUrl) {
      console.log(`Navigate to: ${notification.actionUrl}`)
    }

    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id)
    }
  }

  const handleMarkAsRead = (id: number) => markAsReadMutation.mutate(id)

  const handleMarkAllAsRead = () => markAllAsReadMutation.mutate()

  const handleDelete = (id: number) => deleteNotificationMutation.mutate(id)

  const filteredNotifications =
    activeTab === "all" ? notifications : notifications.filter((n) => !n.isRead)

  const unreadCount = notifications.filter((n) => !n.isRead).length

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
              <Badge variant="destructive">{unreadCount} unread</Badge>
            )}
          </div>
          <SheetDescription>
            Your recent notifications and alerts
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 py-2">
          <div className="flex items-center justify-between mb-3">
            <Tabs
              defaultValue="all"
              onValueChange={(v) => setActiveTab(v as "all" | "unread")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
              </TabsList>
            </Tabs>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-270px)]">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              No notifications
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    !notification.isRead ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleActionClick(notification)}
                >
                  <div className="flex justify-between">
                    <h4 className="font-semibold text-sm">
                      {notification.title}
                    </h4>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(notification.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>

                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>

                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export default NotificationSheet
