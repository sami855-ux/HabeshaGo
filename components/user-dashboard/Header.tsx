// components/Header.tsx
"use client"

import { useState } from "react"
import {
  Bell,
  ChevronDown,
  Menu,
  User,
  Wallet,
  Sun,
  LogOut,
  Search,
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
import NotificationSheet from "./NotificationSheet"
import { Skeleton } from "@/components/ui/skeleton"
import SearchDialog from "./SearchDialog"

function Header({ className }: { className?: string }) {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user, loading } = useSelector((state: RootState) => state.user)

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isNotificationSheetOpen, setIsNotificationSheetOpen] = useState(false)
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false)

  // Mock unread count - you can update this based on your notification state
  const [unreadNotificationCount] = useState(3)

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

  const handleSearch = (query: string) => {
    console.log("Searching for:", query)
    // Handle search logic here
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-10 bg-background border-b w-full h-16",
          className,
        )}
      >
        <div className="container mx-auto w-full h-full">
          <div className="flex items-center justify-end h-full">
            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Deposit Button - Desktop */}
              <Button
                className="hidden md:flex gap-2 bg-gradient-to-r cursor-pointer from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md"
                onClick={() => router.push("/user/wallet")}
              >
                <Wallet className="w-4 h-4" />
                <span>Deposit</span>
              </Button>

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
                          onClick={() => setIsSearchDialogOpen(true)}
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

              {/* Deposit Button - Mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
                onClick={() => router.push("/user/wallet")}
              >
                <Wallet className="w-5 h-5" />
              </Button>

              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchDialogOpen(true)}
                className="md:hidden"
              >
                <Search className="w-5 h-5" />
              </Button>

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
              <DropdownMenu>
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
                          <p className="text-sm font-medium capitalize">
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
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      router.push("/user/Profile")
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center justify-between w-full cursor-default">
                    <div className="flex items-center">
                      <Sun className="w-4 h-4 mr-2" />
                      <span>Theme</span>
                    </div>
                    <ThemeToggle />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setIsLogoutModalOpen(true)}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

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
