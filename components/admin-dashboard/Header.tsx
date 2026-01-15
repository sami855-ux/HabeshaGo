"use client"

import { useState } from "react"
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Sun,
  Settings,
  CreditCard,
  LogOut,
  X,
  CheckCheck,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"
import { ThemeToggle } from "../themeToggle"
import { RootState } from "@/store"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { LogoutModal } from "../logout-modal"
import { logoutUser } from "@/services/auth.user.api"
import { clearUser } from "@/store/slices/userSlice"
import {
  useNotificationQuery,
  useDeleteNotification,
} from "@/hooks/usegetAllNotification"
import { Notification } from "@/types/notification"
// useMarkNotificationAsRead, useDeleteNotification

function Header({ className }: { className?: string }) {
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.user.user)
  const {
    data: notificationsData,
    isLoading: isNotificationLoading,
    refetch,
  } = useNotificationQuery(user?.id)
  // const markAsReadMutation = useMarkNotificationAsRead()
  const deleteNotificationMutation = useDeleteNotification()

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const notifications: Notification[] = notificationsData || []
  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSearchModal(false)
    setSearchQuery("")
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logoutUser()
      dispatch(clearUser())
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      // await markAsReadMutation.mutateAsync(notificationId)
      refetch()
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead)
      // await Promise.all(unreadNotifications.map(n =>
      //   markAsReadMutation.mutateAsync(n.id)
      // ))
      refetch()
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId)
      refetch()
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const handleClearAll = async () => {
    try {
      // Delete all notifications
      await Promise.all(
        notifications.map((n) => deleteNotificationMutation.mutateAsync(n.id))
      )
      refetch()
    } catch (error) {
      console.error("Failed to clear all notifications:", error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "BOOKING":
        return "🎫"
      case "PAYMENT":
        return "💳"
      case "SYSTEM":
        return "⚙️"
      case "ALERT":
        return "⚠️"
      case "INFO":
        return "ℹ️"
      default:
        return "📢"
    }
  }

  return (
    <>
      {/* HEADER */}
      <header
        className={cn(
          "sticky top-0 z-30 h-16 bg-background border-b",
          className
        )}
      >
        <div className="container mx-auto h-full px-4">
          <div className="flex items-center justify-between h-full">
            {/* LEFT - Removed sidebar toggle since Sidebar handles it */}
            <div className="flex items-center gap-4">
              {/* Optional: Add back button or other left-side elements if needed */}
            </div>

            {/* CENTER (Search – Desktop) */}
            <div className="hidden md:flex items-center max-w-lg w-full">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative w-full cursor-pointer">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search users, transactions, reports..."
                        className="w-full pl-10 cursor-pointer"
                        onClick={() => setShowSearchModal(true)}
                        readOnly
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to search</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2">
              {/* Mobile Search */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearchModal(true)}
                className="md:hidden"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center bg-primary rounded-full">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[440px] max-h-[600px] overflow-y-auto"
                >
                  <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Notifications</span>
                    {notifications.length > 0 && (
                      <div className="flex gap-1">
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAllAsRead()
                            }}
                            // disabled={markAsReadMutation.isPending}
                            className="h-6 px-2 text-xs"
                          >
                            <CheckCheck className="w-3 h-3 mr-1" />
                            Mark all read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleClearAll()
                          }}
                          disabled={deleteNotificationMutation.isPending}
                          className="h-6 px-2 text-xs text-destructive"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Clear all
                        </Button>
                      </div>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {isNotificationLoading ? (
                    <div className="py-4 text-center text-muted-foreground">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-4 text-center text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    <>
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "px-2 py-2 hover:bg-accent rounded-sm",
                            !notification.isRead && "bg-accent/50"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="text-lg mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <p
                                    className={cn(
                                      "text-sm font-medium truncate",
                                      !notification.isRead && "font-semibold"
                                    )}
                                  >
                                    {notification.title}
                                  </p>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                    {formatTimeAgo(notification.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                {notification.actionUrl && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-xs mt-1"
                                    onClick={() =>
                                      router.push(notification.actionUrl)
                                    }
                                  >
                                    View details →
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 ml-2">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    handleMarkAsRead(notification.id)
                                  }
                                  // disabled={markAsReadMutation.isPending}
                                >
                                  <CheckCheck className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() =>
                                  handleDeleteNotification(notification.id)
                                }
                                disabled={deleteNotificationMutation.isPending}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="justify-center text-sm text-muted-foreground cursor-pointer"
                        // onClick={() => router.push("/notifications")}
                      >
                        View all notifications
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" />
                      <AvatarFallback className="bg-primary">AD</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">
                        {user?.name || "MR. Admin"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                    <ChevronDown className="hidden md:block w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center justify-between cursor-default">
                    <div className="flex items-center">
                      <Sun className="w-4 h-4 mr-2" />
                      Theme
                    </div>
                    <ThemeToggle />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setIsLogoutModalOpen(true)}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH MODAL */}
      <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
        <DialogContent className="sm:max-w-[700px] p-0 gap-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>
              Search users, transactions, reports, and system logs
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full pl-10 pr-10 text-lg py-6"
                  autoFocus
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>
          </div>

          <div className="px-6 py-4 border-t bg-secondary rounded-b-lg">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Press ESC to close</span>
              <span>↑↓ navigate · Enter select</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onOpenChange={setIsLogoutModalOpen}
        onConfirm={handleLogout}
        isLoading={isLoading}
      />
    </>
  )
}

export default Header
