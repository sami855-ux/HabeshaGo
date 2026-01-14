"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../themeToggle";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { LogoutModal } from "../logout-modal";
import { clearUser } from "@/store/slices/userSlice";
import { logoutUser } from "@/services/auth.user.api";

function Header({
  onMenuClick,
  isSidebarOpen,
  className,
}: {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
  className?: string;
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    setShowSearchModal(false);
    setSearchQuery("");
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      dispatch(clearUser());
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 bg-background border-b",
          isExpanded ? "h-32" : "h-16",
          className
        )}
      >
        <div className="container mx-auto w-full h-full">
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

            {/* Center & Right Section */}
            <div className="flex gap-2">
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
                  onClick={() => setShowSearchModal(true)}
                  className="md:hidden"
                >
                  <Search className="w-5 h-5" />
                </Button>

                {/* Notifications Dropdown */}
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
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile Dropdown */}
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
                        <p className="text-sm font-medium">
                          {user?.name
                            ? user.name
                            : user?.email?.slice(0, 9) || "Guest"}
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
                    <DropdownMenuItem
                      onClick={() => {
                        router.push("/user/Profile");
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
        </DialogContent>
      </Dialog>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onOpenChange={setIsLogoutModalOpen}
        onConfirm={handleLogout}
        isLoading={isLoading}
      />
    </>
  );
}

export default Header;
