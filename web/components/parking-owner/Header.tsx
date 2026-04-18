"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Bell,
  ChevronDown,
  Menu,
  User,
  Wallet,
  Sun,
  LogOut,
  Search,
  Zap,
  Car,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { clearUser } from "@/store/slices/userSlice"
import { logoutUser } from "@/services/auth.user.api"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { PiGearSix } from "react-icons/pi"
import { MdSupportAgent } from "react-icons/md"
import { useQuery } from "@tanstack/react-query"
import { fetchAllNotification } from "@/services/notification.api"
import NotificationSheet from "../user-dashboard/NotificationSheet"
import SearchDialog from "../user-dashboard/SearchDialog"

const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
}

function Header({ className }: { className?: string }) {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user, loading } = useSelector((state: RootState) => state.user)

  const { data: notifications = [] } = useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: fetchAllNotification,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isNotificationSheetOpen, setIsNotificationSheetOpen] = useState(false)
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Mock unread count - you can update this based on your notification state
  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  // Handle scroll effect for morphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      router.push("/")
      await logoutUser()

      setTimeout(() => {
        dispatch(clearUser())
      }, 2000)

      localStorage.removeItem("habeshagoUser")
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    console.log("Searching for:", query)
    // Handle search logic here
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "sticky top-0 z-50 w-full h-16 transition-all duration-300 bg-background",
          // Morphism effect classes
          scrolled
            ? "bg-background/50 backdrop-blur-lg backdrop-saturate-150 shadow-md"
            : "bg-background backdrop-blur-md backdrop-saturate-100",
          className,
        )}
        style={{
          // For WebKit browsers - adds a subtle glass effect
          WebkitBackdropFilter: scrolled
            ? "blur(12px) saturate(180%)"
            : "blur(8px) saturate(100%)",
        }}
      >
        {/* Animated gradient background that morphs on scroll - Blue accent */}
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{
            background: scrolled
              ? "radial-gradient(circle at 30% 50%, rgba(37, 99, 235, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(37, 99, 235, 0.08) 0%, transparent 50%)"
              : "radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(37, 99, 235, 0.03) 0%, transparent 50%)",
          }}
          transition={{ duration: 0.5 }}
        />

        <div className="w-full h-full">
          <div className="flex items-center justify-end h-full px-4">
            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Add Vehicle Button - Desktop with morphism hover effect */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="hidden md:flex gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md relative overflow-hidden"
                  onClick={() => router.push("/parking-manager/vehicles/add")}
                >
                  {/* Animated overlay for morphism effect */}
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                  <Plus className="w-4 h-4" />
                  <span>Add Vehicle</span>
                </Button>
              </motion.div>

              {/* Search Input (Desktop) with morphism */}
              <div className="hidden md:flex items-center max-w-lg">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        className="relative w-full cursor-pointer"
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                        <Input
                          type="text"
                          placeholder="Search vehicles, parking lots, sessions..."
                          className="w-full pl-10 cursor-pointer bg-background/60 backdrop-blur-sm border-white/20 dark:border-white/10 focus:bg-background/80 transition-all duration-300"
                          onClick={() => setIsSearchDialogOpen(true)}
                          readOnly
                        />
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to open search</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Add Vehicle Button - Mobile with morphism */}
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden bg-blue-600 text-white hover:bg-blue-700 relative overflow-hidden"
                  onClick={() => router.push("/parking-manager/vehicles/add")}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    transition={{ duration: 0.5 }}
                  />
                  <Plus className="w-5 h-5" />
                </Button>
              </motion.div>

              {/* Mobile Search Button with morphism */}
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchDialogOpen(true)}
                  className="md:hidden hover:bg-white/10 dark:hover:bg-white/5"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </motion.div>

              <ThemeToggle />

              {/* Notifications Bell Button with morphism */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative hover:bg-white/10 dark:hover:bg-white/5"
                        onClick={() => setIsNotificationSheetOpen(true)}
                      >
                        <Bell className="w-5 h-5" />
                        {unreadNotificationCount > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          >
                            <Badge
                              variant="destructive"
                              className="absolute -top-1.5 -right-1 px-1 min-w-0 w-6 h-6 flex items-center justify-center text-xs p-0"
                            >
                              {unreadNotificationCount > 10
                                ? "10+"
                                : unreadNotificationCount}
                            </Badge>
                          </motion.div>
                        )}
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Profile Dropdown with morphism */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "gap-2 transition-all duration-300",
                        "hover:bg-white/10 dark:hover:bg-white/5",
                      )}
                    >
                      <Avatar className="w-8 h-8 ring-2 ring-white/20 dark:ring-white/10">
                        {loading ? (
                          <Skeleton className="w-full h-full rounded-full" />
                        ) : (
                          <>
                            <AvatarImage src={user?.avaterUrl} />
                            <AvatarFallback className="bg-blue-600 text-white">
                              {user?.name?.charAt(0) || "PM"}
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div className="hidden md:block text-left">
                        {loading ? (
                          <>
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-32" />
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium capitalize">
                              {user?.name || "Parking Manager"}
                            </p>
                            <p className="text-xs text-muted-foreground/80">
                              {user?.email}
                            </p>
                          </>
                        )}
                      </div>
                      <ChevronDown className="hidden md:block w-4 h-4" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  {/* User Info - Enhanced layout */}
                  <div className="flex items-start gap-3 p-3">
                    <Avatar className="h-10 w-10 border-2 border-muted">
                      <AvatarImage src={user?.avaterUrl} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user?.name?.charAt(0) || "PM"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold leading-none truncate capitalize">
                          {user?.name || "Parking Manager"}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-100"
                        >
                          Parking Manager
                        </Badge>
                      </div>
                      {user?.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Account Section Header */}
                  <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-3 pt-2">
                    Account
                  </DropdownMenuLabel>

                  {/* Menu Items - Grouped with consistent styling */}
                  <div className="px-1 py-1">
                    <DropdownMenuItem
                      onClick={() => router.push("/parking-manager/profile")}
                      className="cursor-pointer gap-3 py-2"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Profile</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => router.push("/parking-manager/lots")}
                      className="cursor-pointer gap-3 py-2"
                    >
                      <Car className="w-4 h-4 text-muted-foreground" />
                      <span>Parking Lots</span>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Settings & Support Section */}
                  <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-3 pt-2">
                    Settings & Support
                  </DropdownMenuLabel>

                  <div className="px-1 py-1">
                    <DropdownMenuItem
                      onClick={() => router.push("/parking-manager/settings")}
                      className="cursor-pointer gap-3 py-2"
                    >
                      <PiGearSix className="w-4 h-4 text-muted-foreground" />
                      <span>Account Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => router.push("/parking-manager/support")}
                      className="cursor-pointer gap-3 py-2"
                    >
                      <MdSupportAgent className="w-4 h-4 text-muted-foreground" />
                      <span>Support Center</span>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Logout - With warning style */}
                  <div className="px-1 py-1">
                    <DropdownMenuItem
                      className="cursor-pointer gap-3 py-2 text-destructive focus:text-destructive"
                      onClick={() => setIsLogoutModalOpen(true)}
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Log out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Notification Sheet */}
      <NotificationSheet
        isOpen={isNotificationSheetOpen}
        onOpenChange={setIsNotificationSheetOpen}
      />

      {/* Search Dialog */}
      <SearchDialog
        open={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
        onSearch={handleSearch}
      />

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
