"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MapPin,
  ClipboardList,
  Car,
  Users,
  Zap,
  DollarSign,
  CreditCard,
  Activity,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface AdminSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  pendingDriverCount: number
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  pendingDriverCount,
}: AdminSidebarProps) {
  const operationsNav = [
    { id: "overview", label: "Overview & Analytics", icon: LayoutDashboard },
    { id: "fleet", label: "Live Fleet Tracking", icon: MapPin },
    { id: "bookings", label: "Dispatches & Trips", icon: ClipboardList },
  ]

  const assetsNav = [
    {
      id: "drivers",
      label: "Driver Approvals",
      icon: Users,
      badge: pendingDriverCount > 0 ? `${pendingDriverCount} New` : undefined,
    },
    { id: "vehicles", label: "Vehicles & Assets", icon: Car },
    { id: "ev-charging", label: "EV Hubs & Parking", icon: Zap },
  ]

  const financeNav = [
    { id: "finance", label: "Revenue & Settlements", icon: DollarSign },
    { id: "payouts", label: "Gateway Payouts", icon: CreditCard },
  ]

  const systemNav = [
    { id: "system-health", label: "Microservice Status", icon: Activity },
    { id: "settings", label: "System Config", icon: Settings },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 dark:border-slate-800 font-inter">
      {/* Sidebar Header with Brand */}
      <SidebarHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-base shadow-md shadow-orange-500/20 shrink-0">
            HG
          </div>
          <div className="flex flex-col truncate">
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white font-inter">
              Habesha<span className="text-orange-500">Go</span> Admin
            </span>
            <span className="text-[11px] text-slate-500 truncate">
              Operations Control Center
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 space-y-4">
        {/* Core Operations Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsNav.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setActiveTab(item.id)}
                      className="cursor-pointer"
                    >
                      <Icon className={isActive ? "text-orange-500" : "text-slate-500"} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Fleet & Management Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            Fleet & People
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {assetsNav.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setActiveTab(item.id)}
                      className="cursor-pointer"
                    >
                      <Icon className={isActive ? "text-orange-500" : "text-slate-500"} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge className="bg-amber-500 text-white text-[10px] font-bold">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Finance Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            Telebirr & Finance
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {financeNav.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setActiveTab(item.id)}
                      className="cursor-pointer"
                    >
                      <Icon className={isActive ? "text-orange-500" : "text-slate-500"} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            Architecture
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNav.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setActiveTab(item.id)}
                      className="cursor-pointer"
                    >
                      <Icon className={isActive ? "text-orange-500" : "text-slate-500"} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer with Admin User Profile */}
      <SidebarFooter className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2.5 truncate">
            <Avatar className="size-8 border border-orange-500/40">
              <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces" />
              <AvatarFallback className="bg-slate-900 text-white text-xs font-bold">SA</AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                Sam Admin
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold truncate">
                Super Administrator
              </span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
