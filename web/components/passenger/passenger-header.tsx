"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Compass, 
  MapPin, 
  Wallet, 
  Ticket, 
  ShieldCheck, 
  Bell, 
  ChevronDown, 
  User as UserIcon,
  Plus,
  ArrowRight,
  LogOut,
  LogIn
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppSelector } from "@/store"
import { logoutUser } from "@/services"

interface PassengerHeaderProps {
  walletBalance: number
  activeTicketCount: number
  onOpenWallet: () => void
  onOpenTickets: () => void
}

export function PassengerHeader({
  walletBalance,
  activeTicketCount,
  onOpenWallet,
  onOpenTickets,
}: PassengerHeaderProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAppSelector((state) => state.user)

  const displayName =
    user?.name || (user?.email ? user.email.split("@")[0] : "Passenger")
  const displayEmail = user?.email || "passenger@habeshago.et"
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "HG"

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push("/login")
    } catch (err) {
      console.error("Logout failed:", err)
      router.push("/login")
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 shadow-xs font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & City Badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-inter">
                Habesha<span className="text-orange-500">Go</span>
              </span>
            </Link>
            <Badge variant="orange" className="hidden sm:inline-flex text-[11px] font-semibold py-0.5 px-2">
              Passenger
            </Badge>
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-900 px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Addis Ababa</span>
            </div>
          </div>

          {/* Quick Nav Anchors */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#book-ride" className="hover:text-orange-600 transition-colors flex items-center gap-1">
              <Compass className="w-4 h-4 text-orange-500" />
              <span>Book Ride</span>
            </a>
            <a href="#corridor-routes" className="hover:text-orange-600 transition-colors">
              Corridor Lines
            </a>
            <button
              onClick={onOpenTickets}
              className="hover:text-orange-600 transition-colors flex items-center gap-1.5"
            >
              <Ticket className="w-4 h-4 text-orange-500" />
              <span>Digital Passes</span>
              {activeTicketCount > 0 && (
                <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {activeTicketCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wallet Button */}
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-orange-800 dark:text-orange-300 text-xs sm:text-sm font-semibold hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-colors group"
            >
              <Wallet className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>{walletBalance.toFixed(2)} ETB</span>
              <span className="bg-orange-500 text-white rounded-full p-0.5 group-hover:scale-110 transition-transform">
                <Plus className="w-2.5 h-2.5" />
              </span>
            </button>

            {/* Admin Switcher Button */}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-orange-300 hover:text-orange-600 gap-1 text-xs font-medium"
            >
              <Link href="/admin">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Admin Portal</span>
              </Link>
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors outline-hidden">
                  <Avatar className="size-8 border-2 border-orange-500/20">
                    <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" />
                    <AvatarFallback className="bg-orange-500 text-white text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-500 leading-none truncate">
                      {displayEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onOpenWallet} className="cursor-pointer">
                  <Wallet className="mr-2 h-4 w-4 text-orange-500" />
                  <span>Telebirr Wallet ({walletBalance} ETB)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onOpenTickets} className="cursor-pointer">
                  <Ticket className="mr-2 h-4 w-4 text-orange-500" />
                  <span>My Digital Passes</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/admin">
                    <ShieldCheck className="mr-2 h-4 w-4 text-emerald-600" />
                    <span>Open Admin Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/">
                    <ArrowRight className="mr-2 h-4 w-4 text-slate-500" />
                    <span>Back to Homepage</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAuthenticated ? (
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/40"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild className="cursor-pointer text-orange-600">
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>Sign In</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
