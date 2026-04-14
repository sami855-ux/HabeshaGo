import React, { useState, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { axiosInstance } from "@/services/axiosInstance"
import { getSocket } from "@/services/socket"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Bell,
  Shield,
  CreditCard,
  Route,
  Bus,
  Wallet,
  BellRing,
  CheckCheck,
  ExternalLink,
  Clock,
  Trash2,
  Loader2,
  Settings,
  Calendar,
  DollarSign,
  MapPin,
  AlertOctagon,
  Sparkles,
  Zap,
  Star,
  Gift,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Trash,
  Square,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Notification, NotificationType } from "@/types/notification"
import { fetchAllNotification } from "@/services/notification.api"
import { useAppSelector } from "@/store/store"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"
import { ModernAlert } from "@/components/ui/modern-alert"

const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
}

interface NotificationSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

// Colorful type styles inspired by modern apps
const typeStyles = {
  DEFAULT: {
    icon: Info,
    gradient: "from-gray-500/20 via-gray-400/10 to-transparent",
    border: "border-gray-200 dark:border-gray-800",
    badge: "bg-gray-500 hover:bg-gray-600 text-white",
    lightBadge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    iconColor: "text-gray-600 dark:text-gray-400",
  },
  SYSTEM: {
    icon: Settings,
    gradient: "from-blue-500/20 via-blue-400/10 to-transparent",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-500 hover:bg-blue-600 text-white",
    lightBadge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  BOOKING: {
    icon: Calendar,
    gradient: "from-purple-500/20 via-purple-400/10 to-transparent",
    border: "border-purple-200 dark:border-purple-800",
    badge: "bg-purple-500 hover:bg-purple-600 text-white",
    lightBadge:
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  PAYMENT: {
    icon: DollarSign,
    gradient: "from-emerald-500/20 via-emerald-400/10 to-transparent",
    border: "border-emerald-200 dark:border-emerald-800",
    badge: "bg-emerald-500 hover:bg-emerald-600 text-white",
    lightBadge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  ROUTE: {
    icon: MapPin,
    gradient: "from-amber-500/20 via-amber-400/10 to-transparent",
    border: "border-amber-200 dark:border-amber-800",
    badge: "bg-amber-500 hover:bg-amber-600 text-white",
    lightBadge:
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  BUS: {
    icon: Bus,
    gradient: "from-indigo-500/20 via-indigo-400/10 to-transparent",
    border: "border-indigo-200 dark:border-indigo-800",
    badge: "bg-indigo-500 hover:bg-indigo-600 text-white",
    lightBadge:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  WALLET: {
    icon: Wallet,
    gradient: "from-rose-500/20 via-rose-400/10 to-transparent",
    border: "border-rose-200 dark:border-rose-800",
    badge: "bg-rose-500 hover:bg-rose-600 text-white",
    lightBadge: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  ALERT: {
    icon: AlertOctagon,
    gradient: "from-red-500/20 via-red-400/10 to-transparent",
    border: "border-red-200 dark:border-red-800",
    badge: "bg-red-500 hover:bg-red-600 text-white",
    lightBadge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    iconColor: "text-red-600 dark:text-red-400",
  },
}

const NotificationSheet: React.FC<NotificationSheetProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const user = useAppSelector((state) => state.user.user)
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all")
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  // Bulk deletion states
  const [selectedNotifications, setSelectedNotifications] = useState<
    Set<number>
  >(new Set())
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false)

  // Confirmation dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteType, setDeleteType] = useState<"single" | "bulk">("single")
  const [notificationToDelete, setNotificationToDelete] = useState<
    number | null
  >(null)

  // FETCH NOTIFICATIONS
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: fetchAllNotification,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  // SOCKET INTEGRATION
  useEffect(() => {
    if (!user?.id) return

    const socket = getSocket()

    console.log("Initializing socket for user:", user.id)

    const handleConnect = () => {
      console.log("Connected socket:", socket.id)
      socket.emit("joinUserNotification", user.id)
    }

    const handleNotification = (data: any) => {
      const { notification } = data
      const newNotification = notification.notification

      console.log("New notification:", newNotification)

      queryClient.setQueryData(
        notificationKeys.lists(),
        (old: Notification[] = []) => {
          const exists = old.some((n) => n.id === newNotification.id)
          if (exists) return old
          return [newNotification, ...old]
        },
      )

      toast.custom((t) => <ModernToast t={t} notification={newNotification} />)
    }

    socket.off("connect", handleConnect)
    socket.off("notification:new", handleNotification)

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

  // MARK AS READ
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.patch(`/notifications/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })

  // MARK ALL AS READ
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.patch(`/notification/read-all`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      toast.success("All notifications marked as read", {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      })
    },
  })

  // DELETE SINGLE NOTIFICATION
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      setDeletingIds((prev) => new Set(prev).add(id))
      await axiosInstance.delete(`/notifications/${id}`)
    },
    onSuccess: (_, id) => {
      setDeletingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      // Remove from selected if present
      setSelectedNotifications((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      toast.success("Notification removed", {
        icon: <Trash2 className="h-4 w-4 text-rose-500" />,
      })
    },
    onError: (_, id) => {
      setDeletingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      toast.error("Failed to delete notification")
    },
  })

  // BULK DELETE NOTIFICATIONS
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await axiosInstance.post(`/notifications/bulk-delete`, { ids })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      setSelectedNotifications(new Set())
      setIsBulkDeleteMode(false)
      toast.success(`${selectedNotifications.size} notifications removed`, {
        icon: <Trash className="h-4 w-4 text-rose-500" />,
      })
    },
    onError: () => {
      toast.error("Failed to delete notifications")
    },
  })

  const handleActionClick = (notification: Notification) => {
    if (notification.actionUrl) {
      window.open(notification.actionUrl, "_blank")
    }
  }

  const handleMarkAsRead = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    markAsReadMutation.mutate(id)
  }

  // Handle single delete with confirmation
  const handleSingleDeleteClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteType("single")
    setNotificationToDelete(id)
    setShowDeleteDialog(true)
  }

  // Handle bulk delete confirmation
  const handleBulkDeleteClick = () => {
    if (selectedNotifications.size === 0) {
      toast.error("No notifications selected")
      return
    }
    setDeleteType("bulk")
    setShowDeleteDialog(true)
  }

  // Confirm delete action
  const confirmDelete = async () => {
    setIsDeleting(true)

    if (deleteType === "single" && notificationToDelete) {
      await deleteNotificationMutation.mutateAsync(notificationToDelete)
    } else if (deleteType === "bulk") {
      await bulkDeleteMutation.mutateAsync(Array.from(selectedNotifications))
    }

    setIsDeleting(false)
    setShowDeleteDialog(false)
    setNotificationToDelete(null)
  }

  // Toggle selection for bulk delete
  const toggleSelection = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedNotifications((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Select all visible notifications
  const selectAll = () => {
    const visibleIds = filteredNotifications.map((n) => n.id)
    setSelectedNotifications(new Set(visibleIds))
  }

  // Clear all selections
  const clearSelections = () => {
    setSelectedNotifications(new Set())
    setIsBulkDeleteMode(false)
  }

  const filteredNotifications =
    activeTab === "all" ? notifications : notifications.filter((n) => !n.isRead)

  const unreadCount = notifications.filter((n) => !n.isRead).length

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

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md md:max-w-lg w-full p-0 flex flex-col gap-0">
          {/* Header with gradient */}
          <SheetHeader className="p-6 pb-4 border-b bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <BellRing className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-2 h-2"
                    >
                      <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                      <span className="relative rounded-full w-2 h-2 bg-primary block" />
                    </motion.div>
                  )}
                </div>
                <div>
                  <SheetTitle className="text-xl">Notifications</SheetTitle>
                  <SheetDescription className="text-xs">
                    Your activity center
                  </SheetDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isBulkDeleteMode ? (
                  <>
                    {unreadCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1"
                      >
                        <Badge
                          variant="destructive"
                          className="rounded-full px-2.5 gap-1"
                        >
                          {unreadCount} new
                        </Badge>
                      </motion.div>
                    )}

                    {/* Bulk delete button */}
                    {filteredNotifications.length > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setIsBulkDeleteMode(true)}
                              className="h-8 w-8"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Bulk delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelections}
                      className="h-8 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={selectAll}
                      className="h-8 px-2 text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDeleteClick}
                      disabled={selectedNotifications.size === 0}
                      className="h-8 px-2 text-xs gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete ({selectedNotifications.size})
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SheetHeader>

          {/* Tabs and Actions */}
          <div className="px-6 py-3 border-b bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <Tabs
                defaultValue="all"
                onValueChange={(v) => setActiveTab(v as "all" | "unread")}
                className="flex-1"
              >
                <TabsList className="grid w-full grid-cols-2 h-9 bg-gray-100 dark:bg-gray-800">
                  <TabsTrigger
                    value="all"
                    className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950"
                  >
                    All notifications
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 relative"
                  >
                    Unread
                    {unreadCount > 0 && activeTab === "unread" && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-white dark:ring-gray-950" />
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {unreadCount > 0 && !isBulkDeleteMode && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                    className="h-8 px-3 text-xs gap-1.5 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {markAllAsReadMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCheck className="h-3 w-3" />
                    )}
                    Mark all read
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 h-[500px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">
                  Loading updates...
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-48 text-center p-6"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <Bell className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeTab === "all"
                    ? "No notifications to show"
                    : "No unread notifications"}
                </p>
              </motion.div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                <AnimatePresence initial={false} mode="poplayout">
                  {filteredNotifications.map((notification, index) => {
                    const style =
                      typeStyles[notification.type as NotificationType] ||
                      typeStyles.DEFAULT
                    const TypeIcon = style?.icon || Info
                    const isDeleting = deletingIds.has(notification.id)
                    const isHovered = hoveredId === notification.id
                    const isSelected = selectedNotifications.has(
                      notification.id,
                    )

                    return (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{
                          duration: 0.2,
                          layout: {
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.3,
                          },
                        }}
                        className={cn(
                          "relative px-6 py-4 transition-all duration-200 my-1",
                          !isDeleting &&
                            "cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-900/50",
                          isSelected && "bg-blue-50/50 dark:bg-blue-950/20",
                        )}
                        onClick={() =>
                          !isDeleting &&
                          !isBulkDeleteMode &&
                          handleActionClick(notification)
                        }
                        onMouseEnter={() => setHoveredId(notification.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        {isDeleting && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm z-10">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </div>
                        )}

                        <div className="flex gap-3">
                          {/* Checkbox for bulk delete mode */}
                          {isBulkDeleteMode && (
                            <div
                              className="flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() =>
                                  toggleSelection(notification.id, {} as any)
                                }
                                className="mt-1"
                              />
                            </div>
                          )}

                          {/* Colored Icon */}
                          <motion.div
                            animate={{ scale: isHovered ? 1.1 : 1 }}
                            className={cn(
                              "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                              !notification.isRead
                                ? cn(style.lightBadge, "shadow-sm")
                                : "bg-gray-100 dark:bg-gray-800",
                            )}
                          >
                            <TypeIcon
                              className={cn(
                                "h-4 w-4",
                                !notification.isRead
                                  ? style.iconColor
                                  : "text-gray-500",
                              )}
                            />
                          </motion.div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            {/* Title and Actions */}
                            <div className="flex items-start justify-between gap-2">
                              <h4
                                className={cn(
                                  "text-sm font-medium leading-none pr-2",
                                  !notification.isRead
                                    ? "text-foreground"
                                    : "text-muted-foreground",
                                )}
                              >
                                {notification.title}
                              </h4>

                              {/* Action Buttons - Visible on hover (only when not in bulk mode) */}
                              {!isBulkDeleteMode && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  {notification.actionUrl && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              window.open(
                                                notification.actionUrl,
                                                "_blank",
                                              )
                                            }}
                                          >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Open link</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/50 transition-colors duration-200"
                                          onClick={(e) =>
                                            handleSingleDeleteClick(
                                              notification.id,
                                              e,
                                            )
                                          }
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Delete notification</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              )}
                            </div>

                            {/* Message */}
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>

                            {/* Footer with colorful elements */}
                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                              {/* Type Badge - Colorful */}
                              <Badge
                                className={cn(
                                  "px-2 py-0 h-5 text-[10px] font-medium border-0",
                                  !notification.isRead
                                    ? style.badge
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                                )}
                              >
                                {`${notification.type}`.charAt(0) +
                                  `${notification.type}`.slice(1).toLowerCase()}
                              </Badge>

                              {/* Timestamp with icon */}
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatTimestamp(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Animated unread indicator */}
                        {!notification.isRead && (
                          <motion.div
                            layoutId={`unread-${notification.id}`}
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                            style={{
                              backgroundColor:
                                style.badge.match(/bg-(\w+)-500/)?.[1] ||
                                "primary",
                            }}
                            initial={{ height: 0 }}
                            animate={{ height: 32 }}
                            exit={{ height: 0 }}
                          />
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>

          {/* Footer Stats with color */}
          {filteredNotifications.length > 0 && !isBulkDeleteMode && (
            <div className="px-6 py-3 border-t bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {filteredNotifications.length}
                  </span>{" "}
                  notifications
                  {unreadCount > 0 && (
                    <>
                      {" · "}
                      <span className="text-primary font-medium">
                        {unreadCount} unread
                      </span>
                    </>
                  )}
                </p>
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-5 gap-1 border-primary/20"
                >
                  <Zap className="h-2.5 w-2.5 text-primary" />
                  Live updates
                </Badge>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Modern Alert Dialog for Delete Confirmation */}
      <ModernAlert
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={
          deleteType === "bulk"
            ? "Delete Multiple Notifications"
            : "Delete Notification"
        }
        description={
          deleteType === "bulk"
            ? `Are you sure you want to delete ${selectedNotifications.size} notification${selectedNotifications.size > 1 ? "s" : ""}? This action cannot be undone.`
            : "Are you sure you want to delete this notification? This action cannot be undone."
        }
        type="danger"
        confirmLabel={
          deleteType === "bulk"
            ? `Delete ${selectedNotifications.size}`
            : "Delete"
        }
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        isConfirming={isDeleting}
        confirmText={
          deleteType === "bulk" ? "Deleting notifications" : "Deleting"
        }
        icon={<Trash2 className="h-7 w-7 text-red-600" />}
      />
    </>
  )
}

// Create a separate component for the toast content
const ModernToast = ({
  t,
  notification,
}: {
  t: any
  notification: Notification
}) => {
  const [progress, setProgress] = useState(100)
  const [hovered, setHovered] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()
  const duration = 8000

  useEffect(() => {
    const step = 100 / (duration / 16)
    intervalRef.current = setInterval(() => {
      if (!hovered) {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(intervalRef.current!)
            toast.dismiss(t.id)
            return 0
          }
          return Math.max(0, prev - step)
        })
      }
    }, 16)

    return () => clearInterval(intervalRef.current!)
  }, [hovered, t.id])

  return (
    <div
      className="relative overflow-hidden w-full transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                  {notification.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                  {notification.message}
                </p>
              </div>
              {notification.actionUrl && (
                <button
                  onClick={() => {
                    toast.dismiss(t.id)
                    // window.open(notification.actionUrl, "_blank")
                  }}
                  className="flex-shrink-0 cursor-pointer px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                >
                  View
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationSheet
