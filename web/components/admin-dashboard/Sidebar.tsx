"use client"

import { useState, ReactNode, useEffect, useCallback } from "react"
import {
  ChevronDown,
  Home,
  Users,
  FileText,
  Settings,
  ShoppingCart,
  Currency,
  Receipt,
  MapPin,
  ChevronFirst,
  ChevronLast,
  Bus,
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
import { FaMoneyBillWave } from "react-icons/fa"

export type MenuItem = {
  id: string
  label: string
  icon?: ReactNode
  path?: string
  subItems?: MenuItem[]
}

type MenuSection = {
  title?: string
  items: MenuItem[]
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Overview",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <Home className="h-4 w-4" />,
        path: "/admin",
      },
    ],
  },
  {
    title: "Operations & Fleet",
    items: [
      {
        id: "infrastructure",
        label: "Infrastructure",
        icon: <MapPin className="h-4 w-4" />,
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
        icon: <ShoppingCart className="h-4 w-4" />,
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
    ],
  },
  {
    title: "Finance & Billing",
    items: [
      {
        id: "finance",
        label: "Finance",
        icon: <FaMoneyBillWave className="h-4 w-4" />,
        subItems: [
          {
            id: "revenue-overview",
            label: "Revenue Overview",
            path: "/admin/finance/revenue",
          },
          {
            id: "commission-report",
            label: "Commission Report",
            path: "/admin/finance/commissions",
          },
          {
            id: "admin-wallet",
            label: "Admin Wallet",
            path: "/admin/finance/admin-wallet",
          },
        ],
      },
      {
        id: "payments",
        label: "Payments",
        icon: <Currency className="h-4 w-4" />,
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
        id: "disputes",
        label: "Disputes & Refunds",
        icon: <Receipt className="h-4 w-4" />,
        path: "/admin/disputes",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        id: "users",
        label: "Users",
        icon: <Users className="h-4 w-4" />,
        path: "/admin/users/all",
      },
      {
        id: "roles-permissions",
        label: "Roles & Permissions",
        icon: <Settings className="h-4 w-4" />,
        path: "/admin/roles-permissions",
      },
      {
        id: "system-logs",
        label: "System Logs",
        icon: <FileText className="h-4 w-4" />,
        path: "/admin/system-logs",
      },
    ],
  },
]

const ALL_MENU_ITEMS = MENU_SECTIONS.flatMap((s) => s.items)

function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } =
    useSidebar()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const findActiveParent = useCallback(() => {
    for (const item of ALL_MENU_ITEMS) {
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
  }, [pathname])

  useEffect(() => {
    if (!isMounted) return

    try {
      const stored = localStorage.getItem("sidebar-expanded-items")
      if (stored) {
        const items = JSON.parse(stored)
        setExpandedItems(new Set(items))
      } else {
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
    } catch {
      setExpandedItems(new Set())
    }
  }, [isMounted, findActiveParent])

  const isItemActive = (item: MenuItem): boolean => {
    if (item.path && pathname === item.path) return true
    return false
  }

  const isParentActive = (item: MenuItem): boolean => {
    if (item.subItems) {
      return item.subItems.some((subItem) => subItem.path === pathname)
    }
    return false
  }

  const isSubItemActive = (subItemPath?: string): boolean => {
    return subItemPath === pathname
  }

  useEffect(() => {
    if (!isMounted) return

    const activeParent = findActiveParent()
    if (activeParent) {
      setExpandedItems((prev) => {
        if (prev.has(activeParent)) return prev
        const newSet = new Set([...prev, activeParent])
        try {
          localStorage.setItem(
            "sidebar-expanded-items",
            JSON.stringify(Array.from(newSet)),
          )
        } catch {
          // ignore error
        }
        return newSet
      })
    }
  }, [pathname, isMounted, findActiveParent])

  const toggleSubmenu = (itemId: string) => {
    const newSet = new Set(expandedItems)
    if (newSet.has(itemId)) {
      newSet.delete(itemId)
    } else {
      newSet.add(itemId)
    }
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

  if (!isMounted) {
    return (
      <div className="fixed left-0 top-0 z-40 h-screen w-20 bg-white border-r border-slate-200/60 lg:block hidden" />
    )
  }

  return (
    <>
      {/* Sidebar Container */}
      <aside
        style={{ fontFamily: 'var(--font-inter), "Inter", sans-serif' }}
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-card border-r border-slate-200/70 dark:border-border transition-all duration-200 flex flex-col font-inter select-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          isCollapsed ? "w-[68px]" : "w-60",
        )}
      >
        {/* Top Brand Header */}
        <div
          className={cn(
            "flex items-center gap-2.5 h-14 px-4 border-b border-slate-100 dark:border-border/60 cursor-pointer flex-shrink-0 transition-colors hover:bg-slate-50/50 dark:hover:bg-muted/30",
            isCollapsed && "justify-center px-2",
          )}
          onClick={() => {
            router.push("/admin")
            closeMobileSidebar()
          }}
        >
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-600 text-white shadow-2xs flex-shrink-0">
            <Bus className="h-4.5 w-4.5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-slate-900 dark:text-foreground tracking-tight leading-none">
                HabeshaGo
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-none">
                Admin Panel
              </span>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <TooltipProvider delayDuration={100}>
            <nav className="space-y-4">
              {MENU_SECTIONS.map((section, sIdx) => (
                <div key={sIdx}>
                  {/* Section Label (when not collapsed) */}
                  {!isCollapsed && section.title && (
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1 mb-0.5">
                      {section.title}
                    </p>
                  )}

                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const isActive = isItemActive(item)
                      const hasActiveChild = isParentActive(item)
                      const isExpanded = expandedItems.has(item.id)

                      return (
                        <div key={item.id}>
                          {isCollapsed ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => {
                                    if (item.path) {
                                      router.push(item.path)
                                      closeMobileSidebar()
                                    }
                                  }}
                                  className={cn(
                                    "flex items-center justify-center h-9 w-9 mx-auto rounded-md transition-all text-slate-600 dark:text-slate-400",
                                    isActive &&
                                      "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium",
                                    !isActive &&
                                      hasActiveChild &&
                                      "bg-slate-50 dark:bg-slate-800/50 text-emerald-700 dark:text-emerald-400",
                                    !isActive &&
                                      !hasActiveChild &&
                                      "hover:bg-slate-100/70 hover:text-slate-900 dark:hover:bg-slate-800/40 dark:hover:text-white",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      isActive || hasActiveChild
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-slate-500",
                                    )}
                                  >
                                    {item.icon}
                                  </span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="font-inter text-xs">
                                <p className="font-medium">{item.label}</p>
                                {item.subItems && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {item.subItems.length} sub-items
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <button
                              onClick={() => {
                                if (item.subItems) {
                                  toggleSubmenu(item.id)
                                } else if (item.path) {
                                  router.push(item.path)
                                  closeMobileSidebar()
                                }
                              }}
                              className={cn(
                                "relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-all text-left group",
                                // Minimal active style: clean light slate tint with subtle text weight
                                isActive
                                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                                  : hasActiveChild
                                    ? "bg-slate-50/80 dark:bg-slate-800/40 text-slate-900 dark:text-white font-medium"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white font-normal",
                              )}
                            >
                              {/* Minimal active left indicator bar */}
                              {isActive && (
                                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-emerald-600" />
                              )}

                              <span
                                className={cn(
                                  "flex-shrink-0 transition-colors",
                                  isActive
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : hasActiveChild
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300",
                                )}
                              >
                                {item.icon}
                              </span>

                              <span className="flex-1 truncate">
                                {item.label}
                              </span>

                              {item.subItems && (
                                <ChevronDown
                                  className={cn(
                                    "h-3.5 w-3.5 flex-shrink-0 transition-transform duration-150 text-slate-400",
                                    isExpanded && "rotate-180",
                                  )}
                                />
                              )}
                            </button>
                          )}

                          {/* Minimal Submenu */}
                          {item.subItems && !isCollapsed && isExpanded && (
                            <div className="ml-5 pl-2 my-1 border-l border-slate-200/70 dark:border-slate-800 space-y-0.5">
                              {item.subItems.map((subItem) => {
                                const isSubActive = isSubItemActive(subItem.path)

                                return (
                                  <button
                                    key={subItem.id}
                                    onClick={() => {
                                      if (subItem.path) {
                                        router.push(subItem.path)
                                        closeMobileSidebar()
                                      }
                                    }}
                                    className={cn(
                                      "flex w-full items-center gap-2 rounded-md px-2 py-1 text-[12px] transition-colors text-left",
                                      isSubActive
                                        ? "text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50/70 dark:bg-emerald-950/30"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:text-white",
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "h-1.5 w-1.5 rounded-full flex-shrink-0 transition-colors",
                                        isSubActive
                                          ? "bg-emerald-600"
                                          : "bg-slate-300 dark:bg-slate-600",
                                      )}
                                    />
                                    <span className="truncate">{subItem.label}</span>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </TooltipProvider>
        </div>

        {/* Bottom Section - Collapse Toggle */}
        <div className="p-2 border-t border-slate-100 dark:border-border mt-auto">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full h-8 text-xs font-normal text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors",
                    isCollapsed ? "justify-center px-0" : "justify-start px-2",
                  )}
                  onClick={toggleSidebar}
                >
                  {isCollapsed ? (
                    <ChevronLast className="h-4 w-4" />
                  ) : (
                    <>
                      <ChevronFirst className="h-4 w-4 mr-2 text-slate-400" />
                      <span>Collapse</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-inter text-xs">
                {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-2xs lg:hidden transition-opacity"
          onClick={closeMobileSidebar}
        />
      )}
    </>
  )
}

export default Sidebar
