"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ChevronFirst,
  ChevronLast,
  Settings,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useRouter, usePathname } from "next/navigation"
import { useSidebar } from "@/context/sidebar-context"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Button } from "@/components/ui/button"

import {
  HiOutlineSquares2X2,
  HiOutlineMapPin,
  HiOutlineBolt,
  HiOutlineChartBar,
  HiOutlineCreditCard,
  HiOutlineUsers,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2"

import { RiChargingPileLine } from "react-icons/ri"
import {
  MdOutlineElectricBolt,
  MdSettings,
  MdSupportAgent,
} from "react-icons/md"
import { Badge } from "../ui/badge"

export type MenuItem = {
  id: string
  label: string
  icon?: React.ReactNode
  path?: string
  subItems?: MenuItem[]
}

function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const { isCollapsed, toggleSidebar } = useSidebar()

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const menuItems: MenuItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <HiOutlineSquares2X2 className="h-5 w-5" />,
      path: "",
    },
    {
      id: "stations",
      label: "Stations",
      icon: <HiOutlineMapPin className="h-5 w-5" />,
      path: "/stations",
    },
    {
      id: "chargers",
      label: "Chargers",
      icon: <RiChargingPileLine className="h-5 w-5" />,
      path: "/chargers",
    },
    {
      id: "sessions",
      label: "Charging Sessions",
      icon: <HiOutlineBolt className="h-5 w-5" />,
      path: "/sessions",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <HiOutlineChartBar className="h-5 w-5" />,
      path: "/analytics",
    },
    {
      id: "payments",
      label: "Payments",
      icon: <HiOutlineCreditCard className="h-5 w-5" />,
      path: "/payments",
    },
    {
      id: "customers",
      label: "Customers",
      icon: <HiOutlineUsers className="h-5 w-5" />,
      path: "/customers",
    },
  ]


  const isItemActive = (item: MenuItem): boolean => {
    if (item.path && pathname === `/ev-charge-manager${item.path}`) return true

    if (item.subItems) {
      return item.subItems.some(
        (sub) => pathname === `/ev-charge-manager${sub.path}`,
      )
    }

    return false
  }

  const isSubItemActive = (path?: string) =>
    path ? pathname === `/ev-charge-manager${path}` : false

  const toggleSubmenu = (id: string) => {
    const newSet = new Set(expandedItems)

    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }

    setExpandedItems(newSet)
  }

  const handleNavigation = (path?: string) => {
    if (path) {
      router.push(`/ev-charge-manager${path}`)
      setIsMobileOpen(false)
    }
  }

  // Render menu item with tooltip for collapsed state
  const renderMenuItem = (item: MenuItem) => {
    const isActive = isItemActive(item)
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isExpanded = expandedItems.has(item.id)

    const itemContent = (
      <button
        onClick={() => {
          if (hasSubItems) {
            toggleSubmenu(item.id)
          } else if (item.path) {
            handleNavigation(item.path)
          }
        }}
        className={cn(
          "flex items-center w-full gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200",
          "hover:bg-accent hover:text-accent-foreground",
          "group relative",
          isActive &&
            "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400",
          isCollapsed && "justify-center px-2",
        )}
      >
        {/* Icon with active state */}
        <span
          className={cn(
            "transition-colors duration-200",
            isActive
              ? "text-green-600 dark:text-green-400"
              : "text-muted-foreground group-hover:text-foreground",
          )}
        >
          {item.icon}
        </span>

        {/* Label and chevron for expanded state */}
        {!isCollapsed && (
          <>
            <span
              className={cn(
                "flex-1 text-left font-medium",
                isActive && "text-green-600 dark:text-green-400",
              )}
            >
              {item.label}
            </span>

            {hasSubItems && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isExpanded && "rotate-180",
                  isActive
                    ? "text-green-600 dark:text-green-400"
                    : "text-muted-foreground",
                )}
              />
            )}
          </>
        )}

        {/* Active indicator dot for collapsed state */}
        {isCollapsed && isActive && (
          <span className="absolute right-1 top-1/2 -translate-y-1/2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </span>
        )}
      </button>
    )

    // Wrap with tooltip if collapsed
    if (isCollapsed) {
      return (
        <Tooltip key={item.id} delayDuration={0}>
          <TooltipTrigger asChild>{itemContent}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            <span
              className={cn(
                "font-medium",
                isActive && "text-green-600 dark:text-green-400",
              )}
            >
              {item.label}
            </span>
            {hasSubItems && (
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                {item.subItems?.length}
              </Badge>
            )}
            {isActive && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      )
    }

    return <div key={item.id}>{itemContent}</div>
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="fixed left-4 top-4 z-50 lg:hidden rounded-md bg-gradient-to-r from-green-600 to-emerald-600 p-2 text-white shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-background/80 backdrop-blur-xl transition-all duration-300 flex flex-col",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Logo Section */}
          <div
            className={cn(
              "flex items-center cursor-pointer ",
              isCollapsed ? "justify-center p-4" : "gap-3 p-5",
            )}
            onClick={() => router.push("/habesha-go")}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-md">
              <MdOutlineElectricBolt className="h-6 w-6" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight">
                  HabeshaGo
                </span>
                <span className="text-xs text-muted-foreground">
                  EV Owner Portal
                </span>
              </div>
            )}
          </div>

          {/* Main Menu */}
          <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/20">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-muted-foreground mb-2 px-3">
                MAIN MENU
              </p>
            )}

            <TooltipProvider>
              <nav className="space-y-1">
                {menuItems.map((item) => renderMenuItem(item))}
              </nav>
            </TooltipProvider>
          </div>

          {/* Collapse Button */}
          <div className="p-4 border-t border-border/50">
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size={isCollapsed ? "icon" : "default"}
                    onClick={toggleSidebar}
                    className={cn(
                      "w-full border-green-200 dark:border-green-800",
                      "hover:bg-green-50 dark:hover:bg-green-950/50",
                      "hover:border-green-300 dark:hover:border-green-700",
                      "transition-all duration-200",
                      isCollapsed ? "h-10 w-10 mx-auto" : "",
                    )}
                  >
                    {isCollapsed ? (
                      <ChevronLast className="h-4 w-4 text-green-600" />
                    ) : (
                      <>
                        <ChevronFirst className="h-4 w-4 mr-2 text-green-600" />
                        <span>Collapse Menu</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>Expand Sidebar</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar
