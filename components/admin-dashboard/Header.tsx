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

function Header({ className }: { className?: string }) {
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.user.user)

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

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
                    <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-primary rounded-full" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span className="text-sm">
                      New transaction requires review
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span className="text-sm">Refund request submitted</span>
                  </DropdownMenuItem>
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
                        {user?.name || "Admin"}
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
