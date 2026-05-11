"use client";

import { useState } from "react";
import {
  Home,
  MapPin,
  Calendar,
  Activity,
  Clock,
  Menu,
  X,
  ChevronFirst,
  ChevronLast,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { useRouter, usePathname } from "next/navigation";

export default function UserSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      id: "home",
      label: "Home",
      icon: <Home className="h-5 w-5" />,
      path: "/parking-manager",
    },
    {
      id: "find-parking",
      label: "Find Parking",
      icon: <MapPin className="h-5 w-5" />,
      path: "/parking-manager/parking-lots",
    },
    {
      id: "my-reservations",
      label: "My Reservations",
      icon: <Calendar className="h-5 w-5" />,
      path: "/parking-manager/My-Reservations",
    },
    {
      id: "map-view",
      label: "Map View",
      icon: <MapPin className="h-5 w-5" />,
      path: "/parking-manager/map-view",
    },
    {
      id: "active-sessions",
      label: "Active Session",
      icon: <Activity className="h-5 w-5" />,
      path: "/parking-manager/active-sessions",
    },
    {
      id: "session-history",
      label: "Session History",
      icon: <Clock className="h-5 w-5" />,
      path: "/parking-manager/history",
    },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="fixed left-4 top-4 z-50 lg:hidden rounded-md bg-blue-600 p-2 text-white shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-white dark:bg-gray-950 transition-all duration-300 flex flex-col",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center border-b h-16 px-4 cursor-pointer",
            isCollapsed ? "justify-center" : "gap-3",
          )}
          onClick={() => router.push("/parking-manager")}
        >
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <MapPin />
          </div>

          {!isCollapsed && (
            <div>
              <p className="font-bold">HabeshaGo</p>
              <p className="text-xs text-gray-500">Find Your Parking</p>
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  router.push(item.path);
                  setIsMobileOpen(false);
                }}
                className={cn(
                  "flex items-center w-full gap-3 px-3 py-3 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800",
                  pathname === item.path &&
                    "bg-blue-50 text-blue-600 dark:bg-blue-950/50",
                  isCollapsed && "justify-center",
                )}
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Collapse */}
        <div className="p-4 border-t hidden lg:block">
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="outline"
            size={isCollapsed ? "icon" : "default"}
          >
            {isCollapsed ? <ChevronLast /> : <ChevronFirst />}
          </Button>
        </div>
      </div>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
