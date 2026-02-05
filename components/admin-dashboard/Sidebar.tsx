"use client"

import { useState, ReactNode, useEffect } from "react"
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
  Menu,
  X,
  ChevronFirst,
  ChevronLast,
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

export type MenuItem = {
  id: string
  label: string
  icon?: ReactNode
  path?: string
  subItems?: MenuItem[]
}

function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const { isCollapsed, toggleSidebar } = useSidebar()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Mark component as mounted (client-side)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load expanded items from localStorage only after component mounts
  useEffect(() => {
    if (!isMounted) return

    const loadExpandedItems = () => {
      try {
        const stored = localStorage.getItem("sidebar-expanded-items")
        if (stored) {
          const items = JSON.parse(stored)
          setExpandedItems(new Set(items))
        } else {
          // Auto-expand the current active parent on first load
          const activeParent = findActiveParent()
          if (activeParent) {
            const newSet = new Set([activeParent])
            setExpandedItems(newSet)
            localStorage.setItem(
              "sidebar-expanded-items",
              JSON.stringify(Array.from(newSet)),
            )
          }
        }
      } catch (error) {
        console.error("Failed to load expanded items from localStorage:", error)
        // Start with empty set on error
        setExpandedItems(new Set())
      }
    }

    loadExpandedItems()
  }, [isMounted, pathname]) // Re-run when component mounts and pathname changes

  // Find the parent item that should be auto-expanded based on current path
  const findActiveParent = () => {
    for (const item of menuItems) {
      if (item.subItems) {
        const hasActiveChild = item.subItems.some(
          (subItem) => subItem.path === pathname,
        )
        if (hasActiveChild) {
          return item.id
        }
      }
    }
    return null
  }

  // Check if a menu item or its subitems are active
  const isItemActive = (item: MenuItem): boolean => {
    if (item.path && pathname === item.path) return true
    if (item.subItems) {
      return item.subItems.some((subItem) => subItem.path === pathname)
    }
    return false
  }

  // Check if a subitem is active
  const isSubItemActive = (subItemPath?: string): boolean => {
    return subItemPath === pathname
  }

  // Auto-expand parent items when subitem is active
  useEffect(() => {
    if (!isMounted) return

    const activeParent = findActiveParent()
    if (activeParent && !expandedItems.has(activeParent)) {
      const newSet = new Set([...expandedItems, activeParent])
      setExpandedItems(newSet)
      try {
        localStorage.setItem(
          "sidebar-expanded-items",
          JSON.stringify(Array.from(newSet)),
        )
      } catch (error) {
        console.error("Failed to save expanded items to localStorage:", error)
      }
    }
  }, [pathname, isMounted])

  const toggleSubmenu = (itemId: string) => {
    const newSet = new Set(expandedItems)
    if (newSet.has(itemId)) {
      newSet.delete(itemId)
    } else {
      newSet.add(itemId)
    }
    setExpandedItems(newSet)

    // Save to localStorage
    try {
      localStorage.setItem(
        "sidebar-expanded-items",
        JSON.stringify(Array.from(newSet)),
      )
    } catch (error) {
      console.error("Failed to save expanded items to localStorage:", error)
    }
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
          id: "Vehicle",
          label: "Vehicle",
          path: "/admin/infrastructure/vehicle",
        },
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
        { id: "drivers", label: "Drivers", path: "/admin/fleet/drivers" },
        {
          id: "parking",
          label: "Parking Operators",
          path: "/admin/fleet/parking",
        },
        {
          id: "ev-charging",
          label: "EV Charging Operators",
          path: "/admin/fleet/ev-charging",
        },
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

  // Don't render anything during SSR to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="fixed left-0 top-0 z-40 h-screen w-20 bg-background border-r border-border lg:block hidden" />
    )
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="fixed left-4 top-4 z-50 lg:hidden rounded-md bg-primary p-2 text-primary-foreground shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-background border-r border-border transition-all duration-300 flex flex-col",
          // Mobile: slide in/out
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible
          "lg:translate-x-0",
          // Width based on collapsed state
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        {/* Sidebar Content */}
        <div className="h-full flex flex-col overflow-hidden">
          {/* Top Section */}
          <div
            className={cn(
              "flex items-center gap-3 p-6 cursor-pointer transition-all duration-300 flex-shrink-0",
              isCollapsed && "lg:justify-center lg:p-4",
            )}
            onClick={() => {
              router.push("/dashboard")
              setIsMobileOpen(false)
            }}
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-r from-primary to-primary/80 shadow-md flex-shrink-0">
              <Currency className="h-6 w-6 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-xl text-foreground font-bold">
                  HabeshaGo
                </span>
              </div>
            )}
          </div>

          {/* Scrollable Menu */}
          <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {!isCollapsed && (
              <p className="text-[11px] font-semibold py-2 text-muted-foreground">
                MAIN MENU
              </p>
            )}

            <TooltipProvider>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = isItemActive(item)
                  const hasActiveSubItem = item.subItems?.some((subItem) =>
                    isSubItemActive(subItem.path),
                  )

                  return (
                    <div key={item.id} className="mb-1">
                      {/* Main Menu Item */}
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                if (item.subItems && !isCollapsed) {
                                  toggleSubmenu(item.id)
                                } else if (item.path) {
                                  router.push(item.path)
                                  setIsMobileOpen(false)
                                }
                              }}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground group",
                                isCollapsed && "lg:justify-center lg:px-3",
                                // Active state styles
                                isActive &&
                                  "bg-primary/10 text-primary hover:bg-primary/20",
                                hasActiveSubItem &&
                                  "bg-primary/5 text-primary hover:bg-primary/15",
                              )}
                            >
                              <div
                                className={cn(
                                  "transition-colors duration-200",
                                  isCollapsed && "lg:mx-auto",
                                  isActive && "text-primary",
                                  hasActiveSubItem && "text-primary",
                                  !isActive &&
                                    !hasActiveSubItem &&
                                    "text-muted-foreground group-hover:text-primary",
                                )}
                              >
                                {item.icon}
                              </div>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.label}</p>
                            {item.subItems && (
                              <p className="text-xs text-muted-foreground">
                                Click to expand
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <button
                          onClick={() => {
                            if (item.subItems && !isCollapsed) {
                              toggleSubmenu(item.id)
                            } else if (item.path) {
                              router.push(item.path)
                              setIsMobileOpen(false)
                            }
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground group",
                            isCollapsed && "lg:justify-center lg:px-3",
                            // Active state styles
                            isActive &&
                              "bg-primary/10 text-primary hover:bg-primary/20",
                            hasActiveSubItem &&
                              "bg-primary/5 text-primary hover:bg-primary/15",
                          )}
                        >
                          <div
                            className={cn(
                              "transition-colors duration-200",
                              isCollapsed && "lg:mx-auto",
                              isActive && "text-primary",
                              hasActiveSubItem && "text-primary",
                              !isActive &&
                                !hasActiveSubItem &&
                                "text-muted-foreground group-hover:text-primary",
                            )}
                          >
                            {item.icon}
                          </div>

                          <span
                            className={cn(
                              "flex-1 text-left transition-colors duration-200",
                              (isActive || hasActiveSubItem) &&
                                "text-primary font-medium",
                            )}
                          >
                            {item.label}
                          </span>
                          {item.subItems && (
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform duration-200 flex-shrink-0",
                                expandedItems.has(item.id) && "rotate-180",
                                (isActive || hasActiveSubItem) &&
                                  "text-primary",
                              )}
                            />
                          )}
                        </button>
                      )}

                      {/* Submenu Items - Only show when not collapsed and expanded */}
                      {item.subItems &&
                        !isCollapsed &&
                        expandedItems.has(item.id) && (
                          <div className="ml-5 mt-1 space-y-1 border-l border-border pl-3 py-1">
                            {item.subItems.map((subItem) => {
                              const isSubActive = isSubItemActive(subItem.path)

                              return (
                                <button
                                  key={subItem.id}
                                  className={cn(
                                    "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 relative",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    isSubActive
                                      ? "bg-primary/10 text-primary hover:bg-primary/20 font-medium"
                                      : "text-muted-foreground hover:text-accent-foreground",
                                  )}
                                  onClick={() => {
                                    if (subItem.path) {
                                      router.push(subItem.path)
                                      setIsMobileOpen(false)
                                    }
                                  }}
                                >
                                  {/* Active indicator line */}
                                  {isSubActive && (
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-primary rounded-full" />
                                  )}

                                  <ChevronRight
                                    className={cn(
                                      "h-3 w-3 flex-shrink-0 transition-colors duration-200",
                                      isSubActive
                                        ? "text-primary"
                                        : "text-muted-foreground",
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      "whitespace-nowrap transition-colors duration-200",
                                      isSubActive && "text-primary",
                                    )}
                                  >
                                    {subItem.label}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                    </div>
                  )
                })}
              </nav>
            </TooltipProvider>
          </div>

          {/* Bottom Section - Collapse Button */}
          <div className="p-4 border-t border-border mt-auto">
            <div
              className={cn(
                "transition-all duration-300",
                isCollapsed ? "flex justify-center" : "space-y-4",
              )}
            >
              {/* Collapse Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size={isCollapsed ? "icon" : "default"}
                      className={cn(
                        "w-full transition-all duration-200 bg-transparent border-none",
                        "hover:bg-accent hover:text-accent-foreground",
                        isCollapsed && "justify-center",
                      )}
                      onClick={toggleSidebar}
                    >
                      {isCollapsed ? (
                        <ChevronLast className="h-4 w-4" />
                      ) : (
                        <>
                          <ChevronFirst className="h-4 w-4 mr-2" />
                          <span>Collapse sidebar</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar
