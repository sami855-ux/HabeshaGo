"use client"

import { useState } from "react"
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  User,
  Currency,
  Receipt,
  Moon,
  Sun,
  Wallet,
  Settings,
  CreditCard,
  LogOut,
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
import { Card, CardContent } from "@/components/ui/card"
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
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { ThemeToggle } from "../themeToggle"

function Header({
  onMenuClick,
  isSidebarOpen,
  className,
}: {
  onMenuClick: () => void
  isSidebarOpen: boolean
  className?: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { theme, setTheme } = useTheme()

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
    setShowSearchModal(false)
    setSearchQuery("")
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 bg-background border-b",
          isExpanded ? "h-32" : "h-16",
          className
        )}
      >
        <div className="container mx-auto w-full  h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="lg:hidden"
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>

            <div className="flex gap-2">
              {/* Deposit Button - Orange Accent with Wallet Icon */}
              <Button
                className="hidden md:flex gap-2 bg-gradient-to-r cursor-pointer from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md"
                onClick={() => console.log("Deposit clicked")}
              >
                <Wallet className="w-4 h-4" />
                <span>Deposit</span>
              </Button>

              {/* Center Section */}
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
                {/* Mobile Deposit Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
                  onClick={() => console.log("Mobile deposit clicked")}
                >
                  <Wallet className="w-5 h-5" />
                </Button>

                {/* Mobile Search Button */}
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
                      <Badge className="absolute -top-1 -right-1 px-1 min-w-0 w-2 h-2 bg-primary rounded-full" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div>
                          <p className="text-sm font-medium">
                            Payment Received
                          </p>
                          <p className="text-xs text-muted-foreground">
                            From John Doe
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div>
                          <p className="text-sm font-medium">
                            Transfer Successful
                          </p>
                          <p className="text-xs text-muted-foreground">
                            To Jane Smith
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                        <AvatarFallback className="bg-primary">
                          ST
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium">Samuel Tale</p>
                        <p className="text-xs text-muted-foreground">Premium</p>
                      </div>
                      <ChevronDown className="hidden md:block w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard className="w-4 h-4 mr-2" />
                      <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center justify-between w-full cursor-default">
                      <div className="flex items-center">
                        <Sun className="w-4 h-4 mr-2" />
                        <span>Theme</span>
                      </div>
                      <ThemeToggle />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
        <DialogContent className="sm:max-w-[700px] p-0 gap-0">
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

          <div className="px-6 pb-6 max-h-[400px] overflow-y-auto">
            <div className="space-y-6">
              {/* Recent Searches */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Recent Searches
                </h3>
                <div className="space-y-2">
                  {["Transaction #1234", "John Smith", "Payment received"].map(
                    (item) => (
                      <Button
                        key={item}
                        variant="ghost"
                        className="w-full justify-start h-auto py-3 px-4 hover:bg-secondary"
                        onClick={() => {
                          setSearchQuery(item)
                          setShowSearchModal(false)
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <Search className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{item}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Just now
                          </span>
                        </div>
                      </Button>
                    )
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-3 justify-start"
                    onClick={() => setShowSearchModal(false)}
                  >
                    <Currency className="w-4 h-4 mr-2 text-primary" />
                    <span>Send Money</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 justify-start"
                    onClick={() => setShowSearchModal(false)}
                  >
                    <Receipt className="w-4 h-4 mr-2 text-primary" />
                    <span>View Reports</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t bg-secondary rounded-b-lg">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Press ESC to close</span>
              <span>↑↓ to navigate, Enter to select</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Header
