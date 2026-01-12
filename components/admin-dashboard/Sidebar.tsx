"use client"

import { useState, ReactNode } from "react"
import {
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  FileText,
  Settings,
  BarChart,
  ShoppingCart,
  HelpCircle,
  Currency,
  Receipt,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

// Updated MenuItem type
export type MenuItem = {
  id: string
  label: string
  icon?: ReactNode
  path?: string
  subItems?: MenuItem[]
}

function Sidebar() {
  const router = useRouter()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["dashboard"])
  )

  const toggleSubmenu = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      path: "/admin",
    },
    {
      id: "users",
      label: "Users",
      icon: <Users className="h-5 w-5" />,
      path: "/admin/users/all",
    },
    {
      id: "payments",
      label: "Payments",
      icon: <Currency className="h-5 w-5" />,
      subItems: [
        {
          id: "all-payments",
          label: "All Payments",
          path: "/admin/payments/all",
        },
        {
          id: "pending-payments",
          label: "Pending Payments",
          path: "/admin/payments/pending",
        },
        {
          id: "failed-payments",
          label: "Failed Payments",
          path: "/admin/payments/failed",
        },
      ],
    },
    {
      id: "infrastructure",
      label: "Infrastructure",
      icon: <MapPin className="h-5 w-5" />,
      subItems: [
        {
          id: "ev-stations",
          label: "EV Charging Stations",
          path: "/admin/infrastructure/ev-stations",
        },
        {
          id: "parking-stations",
          label: "Parking Stations",
          path: "/admin/infrastructure/parking-stations",
        },
      ],
    },
    {
      id: "fleet",
      label: "Fleet / Operations",
      icon: <ShoppingCart className="h-5 w-5" />,
      subItems: [
        { id: "buses", label: "Buses", path: "/admin/fleet/buses" },
        { id: "drivers", label: "Drivers", path: "/admin/fleet/drivers" },
      ],
    },
    {
      id: "roles-permissions",
      label: "Roles & Permissions",
      icon: <Settings className="h-5 w-5" />,
      path: "/admin/roles-permissions",
    },

    {
      id: "disputes",
      label: "Disputes & Refunds",
      icon: <Receipt className="h-5 w-5" />,
      path: "/admin/disputes",
    },
    {
      id: "services",
      label: "Services",
      icon: <ShoppingCart className="h-5 w-5" />,
      path: "/admin/services",
    },
    {
      id: "reports",
      label: "Reports",
      icon: <BarChart className="h-5 w-5" />,
      path: "/admin/reports",
    },
    {
      id: "support",
      label: "Support",
      icon: <HelpCircle className="h-5 w-5" />,
      path: "/admin/support",
    },
    {
      id: "system-logs",
      label: "System Logs",
      icon: <FileText className="h-5 w-5" />,
      path: "/admin/system-logs",
    },
  ]

  return (
    <div className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-background ">
      {/* Top Section */}
      <div
        className="flex items-center gap-3 p-6 cursor-pointer"
        onClick={() => router.push("/dashboard")}
      >
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-r from-primary to-primary/80 shadow-md">
          <Currency className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl text-foreground font-bold">Addis Pulse</span>
        </div>
      </div>

      {/* Scrollable Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <p className="text-[11px] font-semibold py-2 text-muted-foreground">
          MAIN MENU
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <div key={item.id} className="mb-1">
              {/* Main Menu Item */}
              <button
                onClick={() => {
                  if (item.subItems) toggleSubmenu(item.id)
                  else if (item.path) router.push(item.path)
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                  "hover:bg-accent hover:text-accent-foreground",
                  expandedItems.has(item.id) && item.subItems
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:text-accent-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "text-muted-foreground",
                      expandedItems.has(item.id) &&
                        item.subItems &&
                        "text-primary"
                    )}
                  >
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.subItems && (
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      expandedItems.has(item.id)
                        ? "rotate-180 text-primary"
                        : ""
                    )}
                  />
                )}
              </button>

              {/* Submenu Items */}
              {item.subItems && (
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    expandedItems.has(item.id)
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  )}
                >
                  <div className="ml-5 mt-1 space-y-1 border-l border-border pl-3 py-1">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                          "hover:bg-accent hover:text-accent-foreground",
                          "text-muted-foreground hover:text-accent-foreground text-left"
                        )}
                        onClick={() => {
                          if (subItem.path) router.push(subItem.path)
                        }}
                      >
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          {subItem.icon}
                          <span>{subItem.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
