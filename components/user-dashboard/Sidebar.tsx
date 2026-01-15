"use client"

import { useState, useEffect } from "react"
import {
  ChevronDown,
  ChevronRight,
  Home,
  Settings,
  HelpCircle,
  Currency,
  Wallet,
  ArrowUpDown,
  Menu,
  X,
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

  // Load expanded items from localStorage on mount
  useEffect(() => {
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
              JSON.stringify(Array.from(newSet))
            )
          }
        }
      } catch (error) {
        console.error("Failed to load expanded items from localStorage:", error)
        setExpandedItems(new Set())
      }
    }

    loadExpandedItems()
  }, [])

  // Find the parent item that should be auto-expanded based on current path
  const findActiveParent = () => {
    for (const item of menuItems) {
      if (item.subItems) {
        const hasActiveChild = item.subItems.some(
          (subItem) => pathname === `/user${subItem.path}`
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
    if (item.path && pathname === `/user${item.path}`) return true
    if (item.subItems) {
      return item.subItems.some(
        (subItem) => pathname === `/user${subItem.path}`
      )
    }
    return false
  }

  // Check if a subitem is active
  const isSubItemActive = (subItemPath?: string): boolean => {
    return subItemPath ? pathname === `/user${subItemPath}` : false
  }

  // Auto-expand parent items when subitem is active and save to localStorage
  useEffect(() => {
    const activeParent = findActiveParent()
    if (activeParent && !expandedItems.has(activeParent)) {
      const newSet = new Set([...expandedItems, activeParent])
      setExpandedItems(newSet)
      try {
        localStorage.setItem(
          "sidebar-expanded-items",
          JSON.stringify(Array.from(newSet))
        )
      } catch (error) {
        console.error("Failed to save expanded items to localStorage:", error)
      }
    }
  }, [pathname])

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
        JSON.stringify(Array.from(newSet))
      )
    } catch (error) {
      console.error("Failed to save expanded items to localStorage:", error)
    }
  }

  const menuItems: MenuItem[] = [
    {
      id: "home",
      label: "Home",
      icon: <Home className="h-5 w-5" />,
      path: "/",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: <Wallet className="h-5 w-5" />,
      path: "/wallet",
    },
    {
      id: "payments",
      label: "Payments",
      icon: <Currency className="h-5 w-5" />,
      subItems: [
        { id: "send-money", label: "Send Money", path: "/payments/send-money" },
        {
          id: "receive-money",
          label: "Receive Money",
          path: "/payments/receive-money",
        },
        {
          id: "top-up-mobile-wallet",
          label: "Top-up Mobile Wallet",
          path: "/payments/top-up-mobile-wallet",
        },
      ],
      path: "/payments",
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: <ArrowUpDown className="h-5 w-5" />,
      subItems: [
        {
          id: "transaction-history",
          label: "Transaction History",
          path: "/transactions/history",
        },
        {
          id: "pending-transactions",
          label: "Pending Transactions",
          path: "/transactions/pending",
        },
        {
          id: "failed-transactions",
          label: "Failed Transactions",
          path: "/transactions/failed",
        },
      ],
      path: "/transactions",
    },
  ]

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
          "fixed left-0 top-0 z-40 h-screen bg-background border-r border-border transition-all duration-300",
          // Mobile: slide in/out
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible
          "lg:translate-x-0",
          // Width based on collapsed state
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Desktop Collapse Toggle */}
        <button
          className="hidden lg:flex absolute -right-3 top-6 z-50 rounded-full bg-primary p-1.5 text-primary-foreground shadow-lg border border-border hover:bg-primary/90"
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3 rotate-180" />
          )}
        </button>

        {/* Sidebar Content */}
        <div className="h-full flex flex-col">
          {/* Top Section */}
          <div
            className={cn(
              "flex items-center gap-3 p-6 cursor-pointer transition-all duration-300",
              isCollapsed && "lg:justify-center lg:p-4"
            )}
            onClick={() => {
              router.push("/user")
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
                    isSubItemActive(subItem.path)
                  )

                  return (
                    <div key={item.id} className="mb-1">
                      {/* Main Menu Item */}
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                if (item.path && !item.subItems) {
                                  router.push(`/user${item.path}`)
                                  setIsMobileOpen(false)
                                } else if (item.subItems) {
                                  toggleSubmenu(item.id)
                                }
                              }}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground group",
                                isCollapsed && "lg:justify-center lg:px-3",
                                isActive &&
                                  "bg-primary/10 text-primary hover:bg-primary/20",
                                hasActiveSubItem &&
                                  "bg-primary/5 text-primary hover:bg-primary/15"
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
                                    "text-muted-foreground group-hover:text-primary"
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
                            if (item.subItems) {
                              toggleSubmenu(item.id)
                            } else if (item.path) {
                              router.push(`/user${item.path}`)
                              setIsMobileOpen(false)
                            }
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground group",
                            isActive &&
                              "bg-primary/10 text-primary hover:bg-primary/20",
                            hasActiveSubItem &&
                              "bg-primary/5 text-primary hover:bg-primary/15"
                          )}
                        >
                          <div
                            className={cn(
                              "transition-colors duration-200",
                              isActive && "text-primary",
                              hasActiveSubItem && "text-primary",
                              !isActive &&
                                !hasActiveSubItem &&
                                "text-muted-foreground group-hover:text-primary"
                            )}
                          >
                            {item.icon}
                          </div>

                          <span
                            className={cn(
                              "flex-1 text-left transition-colors duration-200",
                              (isActive || hasActiveSubItem) &&
                                "text-primary font-medium"
                            )}
                          >
                            {item.label}
                          </span>
                          {item.subItems && (
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform duration-200 flex-shrink-0",
                                expandedItems.has(item.id) && "rotate-180",
                                (isActive || hasActiveSubItem) && "text-primary"
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
                                      : "text-muted-foreground hover:text-accent-foreground"
                                  )}
                                  onClick={() => {
                                    if (subItem.path) {
                                      router.push(`/user${subItem.path}`)
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
                                        : "text-muted-foreground"
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      "whitespace-nowrap transition-colors duration-200",
                                      isSubActive && "text-primary"
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

            {!isCollapsed && (
              <p className="text-[11px] font-semibold py-2 text-muted-foreground mt-6">
                TOOLS
              </p>
            )}

            {/* Additional Links Section */}
            <div className="space-y-1">
              {isCollapsed ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground group",
                          "lg:justify-center lg:px-3"
                        )}
                        onClick={() => {
                          router.push("/user/settings")
                          setIsMobileOpen(false)
                        }}
                      >
                        <Settings className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground group",
                          "lg:justify-center lg:px-3"
                        )}
                        onClick={() => {
                          router.push("/user/support")
                          setIsMobileOpen(false)
                        }}
                      >
                        <HelpCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Support</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <>
                  <button
                    className={cn(
                      "flex w-full items-center cursor-pointer gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                      "hover:bg-accent hover:text-accent-foreground",
                      "text-foreground hover:text-accent-foreground"
                    )}
                    onClick={() => {
                      router.push("/user/settings")
                      setIsMobileOpen(false)
                    }}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </button>
                  <button
                    className={cn(
                      "flex w-full items-center cursor-pointer gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                      "hover:bg-accent hover:text-accent-foreground",
                      "text-foreground hover:text-accent-foreground"
                    )}
                    onClick={() => {
                      router.push("/user/support")
                      setIsMobileOpen(false)
                    }}
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span>Support</span>
                  </button>
                </>
              )}
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
