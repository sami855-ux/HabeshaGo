"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Bell,
  ChevronDown,
  X,
  User,
  Sun,
  LogOut,
  Settings2,
  LifeBuoy,
  MessageSquare,
  Shield,
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
import { clearUser } from "@/store/slices/userSlice"
import { logoutUser } from "@/services/auth.user.api"
import NotificationSheet from "@/components/user-dashboard/NotificationSheet"
import { Skeleton } from "@/components/ui/skeleton"

function Header({ className }: { className?: string }) {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user, loading } = useSelector((state: RootState) => state.user)

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isNotificationSheetOpen, setIsNotificationSheetOpen] = useState(false)

  // State to force close dropdown when theme changes
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Mock unread count - you can update this based on your notification state
  const [unreadNotificationCount] = useState(3)

  // Close all modals and dropdowns on theme change
  useEffect(() => {
    // This effect can be used to handle any cleanup when theme changes
    // The ThemeToggle component should handle closing dropdowns when clicked
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
    setShowSearchModal(false)
    setSearchQuery("")
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      router.push("/")
      await logoutUser()
      dispatch(clearUser())
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-10 bg-background border-b w-full ",
          isExpanded ? "h-32" : "h-16",
          className,
        )}
      >
        <div className="mx-auto w-full h-full">
          <div className="flex items-center justify-end h-full">
            {/* Center & Right Section */}
            <div className="flex gap-2">
              {/* Search Input (Desktop) */}
              <div className="hidden md:flex items-center max-w-lg">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative w-full cursor-pointer">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search transactions, payments, or reports..."
                          className="w-full pl-10 cursor-pointer"
                          onClick={() => setShowSearchModal(true)}
                          readOnly
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to open search</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2">
                {/* Mobile Search Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearchModal(true)}
                  className="md:hidden"
                >
                  <Search className="w-5 h-5" />
                </Button>

                <ThemeToggle />

                {/* Notifications Bell Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                        onClick={() => setIsNotificationSheetOpen(true)}
                      >
                        <Bell className="w-5 h-5" />
                        {unreadNotificationCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 px-1 min-w-0 w-5 h-5 flex items-center justify-center text-xs p-0"
                          >
                            {unreadNotificationCount > 9
                              ? "9+"
                              : unreadNotificationCount}
                          </Badge>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notifications</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Profile Dropdown */}
                <DropdownMenu
                  open={isDropdownOpen}
                  onOpenChange={setIsDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <Avatar className="w-8 h-8">
                        {loading ? (
                          <Skeleton className="w-full h-full rounded-full" />
                        ) : (
                          <>
                            <AvatarImage src={user?.avaterUrl} />
                            <AvatarFallback className="bg-primary">
                              {user?.name?.charAt(0) || "G"}
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
                            <p className="text-sm font-medium">
                              {user?.name || "Guest"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user?.email}
                            </p>
                          </>
                        )}
                      </div>
                      <ChevronDown className="hidden md:block w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-80"
                    onCloseAutoFocus={(e) => {
                      e.preventDefault()
                    }}
                  >
                    {/* Enhanced User Info Section */}
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-t-lg">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                        <AvatarImage src={user?.avaterUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-lg">
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold leading-none truncate capitalize">
                            {user?.name || "User"}
                          </p>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-100"
                          >
                            {user?.role || "User"}
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

                    {/* Account Section */}
                    <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-4 pt-3 pb-1">
                      ACCOUNT
                    </DropdownMenuLabel>
                    <div className="px-2 py-1">
                      <DropdownMenuItem
                        onClick={() => {
                          setIsDropdownOpen(false)
                          router.push("/user/profile")
                        }}
                        className="cursor-pointer gap-3 py-2.5 rounded-lg"
                      >
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Profile</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          setIsDropdownOpen(false)
                          router.push("/user/settings")
                        }}
                        className="cursor-pointer gap-3 py-2.5 rounded-lg"
                      >
                        <Settings2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Settings</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          setIsDropdownOpen(false)
                          router.push("/user/security")
                        }}
                        className="cursor-pointer gap-3 py-2.5 rounded-lg"
                      >
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Security</span>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Support Section */}
                    <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-4 pt-3 pb-1">
                      SUPPORT
                    </DropdownMenuLabel>
                    <div className="px-2 py-1">
                      <DropdownMenuItem
                        className="cursor-pointer gap-3 py-2.5 rounded-lg"
                        onClick={() => {
                          setIsDropdownOpen(false)
                          router.push("/user/help")
                        }}
                      >
                        <LifeBuoy className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Help Center</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="cursor-pointer gap-3 py-2.5 rounded-lg"
                        onClick={() => {
                          setIsDropdownOpen(false)
                          router.push("/user/feedback")
                        }}
                      >
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Send Feedback</span>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Logout Section */}
                    <div className="px-2 py-2">
                      <DropdownMenuItem
                        className="cursor-pointer gap-3 py-2.5 rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={() => {
                          setIsDropdownOpen(false)
                          setIsLogoutModalOpen(true)
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Log out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
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
          className="sm:max-w-[700px] p-0 gap-0"
          onCloseAutoFocus={(e) => {
            // Prevent focus trapping issues
            e.preventDefault()
          }}
        >
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>
              Search across payments, transactions, and users
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-4">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for payments, transactions, users..."
                  className="w-full pl-10 pr-10 text-lg py-6"
                  autoFocus
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>
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
