"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  FileText,
  Settings,
  BarChart,
  ShoppingCart,
  CreditCard,
  HelpCircle,
  Calendar,
  Mail,
  Currency,
  Receipt,
  Wallet,
  LogOut,
  User,
  ArrowUpDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MenuItem } from "@/lib/types"
import { useRouter } from "next/navigation"

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
        { id: "send-money", label: "Send Money" },
        { id: "receive-money", label: "Receive Money" },
        { id: "top-up-mobile-wallet", label: "Top-up Mobile Wallet" },
      ],
      path: "/payments",
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: <ArrowUpDown className="h-5 w-5" />,
      subItems: [
        { id: "transaction-history", label: "Transaction History" },
        { id: "pending-transactions", label: "Pending Transactions" },
        { id: "failed-transactions", label: "Failed Transactions" },
      ],
      path: "/transactions",
    },
  ]

  return (
    <div className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-background border-r">
      {/* Top Section with Logo and Company Name */}
      <div
        className="flex items-center gap-3 p-6 "
        onClick={() => router.push("/user")}
      >
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-r from-primary to-primary/80 shadow-md">
          <Currency className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl text-foreground font-bold">Addis Pulse</span>
        </div>
      </div>

      {/* Scrollable Menu Section */}
      <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <p className="text-[11px] font-semibold py-2 text-muted-foreground ">
          MAIN MENU
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <div key={item.id} className="mb-1">
              {/* Main Menu Item */}
              <button
                onClick={() => {
                  if (item.subItems) {
                    toggleSubmenu(item.id)
                  } else {
                    router.push(`/user${item.path}`)
                  }
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 cursor-pointer",
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

              {/* Submenu Items with Animation */}
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
                        onClick={(e) => {
                          e.preventDefault()
                          // Handle subitem navigation here
                          console.log(`Navigating to ${subItem.id}`)
                        }}
                      >
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <span>{subItem.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <p className="text-[11px] font-semibold py-2 text-muted-foreground mt-6">
          TOOLS
        </p>
        {/* Additional Links Section */}
        <div className="space-y-1">
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
              "hover:bg-accent hover:text-accent-foreground",
              "text-foreground hover:text-accent-foreground text-left"
            )}
            onClick={(e) => {
              e.preventDefault()
              router.push("/user/settings")
            }}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
              "hover:bg-accent hover:text-accent-foreground",
              "text-foreground hover:text-accent-foreground text-left"
            )}
            onClick={(e) => {
              e.preventDefault()
              router.push("/user/support")
            }}
          >
            <HelpCircle className="h-5 w-5" />
            <span>Support</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
