"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Bell,
  ChevronDown,
  X,
  User,
  LogOut,
  Settings2,
  LifeBuoy,
  MessageSquare,
  Shield,
  Menu,
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
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { LogoutModal } from "../logout-modal"
import { logoutUser } from "@/services/auth.user.api"
import NotificationSheet from "@/components/user-dashboard/NotificationSheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { fetchAllNotification } from "@/services/notification.api"
import { motion } from "framer-motion"
import { useSidebar } from "@/context/sidebar-context"

const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
}

function Header({ className }: { className?: string }) {
  const router = useRouter()
  const { toggleMobileSidebar } = useSidebar()
  const { user, loading } = useSelector((state: RootState) => state.user)

  const { data: notifications = [] } = useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: fetchAllNotification,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isNotificationSheetOpen, setIsNotificationSheetOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const unreadNotificationCount = useMemo(() => {
    if (!Array.isArray(notifications)) return 0
    return notifications.filter((n: { isRead?: boolean }) => !n.isRead).length
  }, [notifications])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSearchModal(false)
    setSearchQuery("")
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logoutUser()
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoading(false)
      router.replace("/staff-login")
    }
  }

  return (
    <>
      <header
        style={{ fontFamily: 'var(--font-inter), "Inter", sans-serif' }}
        className={cn(
          "sticky top-0 z-30 h-14 bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-slate-200/80 dark:border-border font-inter px-3 sm:px-5 flex items-center justify-between transition-colors",
          className,
        )}
      >
        {/* Left Section: Mobile Toggle & Context Breadcrumb */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={toggleMobileSidebar}
          >
            <Menu className="h-4.5 w-4.5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-900 dark:text-foreground">
              Admin
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Overview
            </span>

            <span className="hidden md:inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </span>
          </div>
        </div>

        {/* Right Section: Search, Notifications, Theme, Profile */}
        <div className="flex items-center gap-2">
          {/* Quick Search Trigger */}
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="flex items-center justify-between gap-2 h-8.5 w-36 sm:w-56 md:w-64 lg:w-72 px-3 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100/90 dark:bg-muted/40 dark:hover:bg-muted/60 border border-slate-200/80 dark:border-border rounded-lg transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
              <span className="truncate">Search system...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications Trigger */}
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8.5 w-8.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                  onClick={() => setIsNotificationSheetOpen(true)}
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotificationCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 px-1 min-w-0 h-4.5 min-w-[18px] flex items-center justify-center text-[10px] p-0 font-bold"
                      >
                        {unreadNotificationCount > 9
                          ? "9+"
                          : unreadNotificationCount}
                      </Badge>
                    </motion.div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-inter text-xs">
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User Profile Dropdown */}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8.5 px-2 gap-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Avatar className="h-6.5 w-6.5 border border-slate-200 dark:border-slate-700">
                  {loading ? (
                    <Skeleton className="w-full h-full rounded-full" />
                  ) : (
                    <>
                      <AvatarImage src={user?.avaterUrl} />
                      <AvatarFallback className="bg-slate-900 text-white text-[11px] font-semibold">
                        {user?.name?.charAt(0) || "A"}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>

                <div className="hidden md:flex flex-col text-left">
                  {loading ? (
                    <Skeleton className="h-3 w-16" />
                  ) : (
                    <span className="text-xs font-semibold text-slate-800 dark:text-foreground leading-none">
                      {user?.name || "Admin"}
                    </span>
                  )}
                </div>

                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-64 font-inter p-1"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              {/* User Details */}
              <div className="px-3 py-2.5 bg-slate-50/80 dark:bg-muted/40 rounded-md mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-foreground truncate">
                  {user?.name || "Administrator"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground truncate">
                  {user?.email || "admin@habeshago.com"}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 bg-white dark:bg-slate-900 border-slate-200 text-slate-600 dark:text-slate-300 font-medium"
                  >
                    {user?.role || "ADMIN"}
                  </Badge>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Navigation Links */}
              <DropdownMenuLabel className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                Account
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setIsDropdownOpen(false)
                  router.push("/user/profile")
                }}
                className="cursor-pointer gap-2.5 py-2 text-xs rounded-md"
              >
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span>My Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setIsDropdownOpen(false)
                  router.push("/user/settings")
                }}
                className="cursor-pointer gap-2.5 py-2 text-xs rounded-md"
              >
                <Settings2 className="h-3.5 w-3.5 text-slate-500" />
                <span>Preferences</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setIsDropdownOpen(false)
                  router.push("/user/security")
                }}
                className="cursor-pointer gap-2.5 py-2 text-xs rounded-md"
              >
                <Shield className="h-3.5 w-3.5 text-slate-500" />
                <span>Security</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                Support
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setIsDropdownOpen(false)
                  router.push("/user/help")
                }}
                className="cursor-pointer gap-2.5 py-2 text-xs rounded-md"
              >
                <LifeBuoy className="h-3.5 w-3.5 text-slate-500" />
                <span>Help Center</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setIsDropdownOpen(false)
                  router.push("/user/feedback")
                }}
                className="cursor-pointer gap-2.5 py-2 text-xs rounded-md"
              >
                <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                <span>Feedback</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem
                onClick={() => {
                  setIsDropdownOpen(false)
                  setIsLogoutModalOpen(true)
                }}
                className="cursor-pointer gap-2.5 py-2 text-xs rounded-md text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/30"
              >
                <LogOut className="h-3.5 w-3.5 text-red-500" />
                <span className="font-medium">Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Notification Sheet */}
      <NotificationSheet
        isOpen={isNotificationSheetOpen}
        onOpenChange={setIsNotificationSheetOpen}
      />

      {/* Search Modal */}
      <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
        <DialogContent
          className="sm:max-w-[560px] p-0 font-inter rounded-xl overflow-hidden"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="text-sm font-semibold">Quick Search</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Search routes, vehicles, staff, payments, or tickets
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 pt-2">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a command or search term..."
                  className="h-10 pl-9 pr-9 text-xs bg-slate-50 border-slate-200"
                  autoFocus
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-400 hover:text-slate-600"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Press Enter to execute search</span>
              <span>ESC to exit</span>
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
