"use client"

import * as React from "react"
import Link from "next/link"
import {
  Bell,
  Search,
  X,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store"
import { logoutAuthSession } from "@/services"
import { StaffInviteDialog } from "./staff-invite-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

interface AdminHeaderProps {
  currentTabName: string
}

export function AdminHeader({ currentTabName }: AdminHeaderProps) {
  const router = useRouter()
  const currentUser = useAppSelector((state) => state.user.user)
  const [searchVal, setSearchVal] = React.useState("")

  const handleSignOut = async () => {
    try {
      await logoutAuthSession()
      toast.success("Signed out of staff console")
      router.push("/staff/login")
    } catch {
      router.push("/staff/login")
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-4 transition-all font-inter">
      {/* Sidebar Trigger and Breadcrumb */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="hover:text-orange-600">
                  HabeshaGo
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin" className="hover:text-orange-600">
                  Admin
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-slate-900 dark:text-white capitalize">
                {currentTabName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Center Search Input (Tailwind CSS Search UI Design) */}
      <div className="flex-1 flex justify-center max-w-md mx-auto px-2">
        <div className="group flex items-center w-full h-9 rounded-lg bg-slate-100/75 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/90 text-slate-400 ring-1 ring-slate-900/10 dark:ring-white/10 hover:ring-slate-300 dark:hover:ring-white/20 focus-within:ring-2 focus-within:ring-orange-500 dark:focus-within:ring-orange-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all shadow-xs px-3 gap-2.5">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors shrink-0" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Quick search..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          {searchVal ? (
            <button
              type="button"
              onClick={() => setSearchVal("")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded px-1.5 py-0.5 shadow-2xs shrink-0 select-none">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 ml-auto">
        {/* Staff Invitation Action Modal */}
        <StaffInviteDialog />

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative size-8 text-slate-600 dark:text-slate-300"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 size-2 rounded-full bg-orange-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2">
            <DropdownMenuLabel className="text-xs font-bold uppercase text-slate-400">
              Operations Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-1 py-1">
              <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-xs">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>3 New Driver Licenses</span>
                  <span className="text-[10px] text-slate-400">5m ago</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Verification pending for Bole Minibus corridor operators.
                </p>
              </div>

              <div className="p-2 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-900">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Telebirr Payout Settled</span>
                  <span className="text-[10px] text-slate-400">22m ago</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Batch #9410 released: 148,200 ETB distributed to 84 drivers.
                </p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Admin Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 outline-hidden">
              <Avatar className="size-8 border-2 border-orange-500/30">
                <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces" />
                <AvatarFallback className="bg-slate-900 text-white text-xs font-bold">SA</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-0.5">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentUser?.name || "Sam Admin"}
                </span>
                <span className="text-xs text-slate-500">
                  {currentUser?.email || "admin@habeshago.et"}
                </span>
                {currentUser?.role && (
                  <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    {currentUser.role}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => toast.info("Opening admin profile settings...")}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4 text-slate-500" />
              <span>Admin Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/">
                <span className="mr-2 text-xs">🌐</span>
                <span>HabeshaGo Home</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-600 dark:text-red-400 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
