"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MapPin,
  Grid,
  Calendar,
  Activity,
  BarChart,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useSidebar } from "@/context/sidebar-context";
import { cn } from "@/lib/utils";

const adminMenu = [
  {
    label: "Dashboard",
    path: "/admin/manage-parking",
    icon: Home,
  },
  {
    label: "Management",
    children: [
      {
        label: "Parking Lots",
        path: "/admin/manage-parking/parking-lots",
        icon: MapPin,
      },
      {
        label: "Slots",
        path: "/admin/manage-parking/slots",
        icon: Grid,
      },
      {
        label: "Reservations",
        path: "/admin/manage-parking/reservations",
        icon: Calendar,
      },
      {
        label: "Sessions",
        path: "/admin/manage-parking/sessions",
        icon: Activity,
      },
    ],
  },
  {
    label: "Analytics",
    children: [
      {
        label: "Lot Statistics",
        path: "/admin/manage-parking/analytics/lots",
        icon: BarChart,
      },
      {
        label: "Daily Report",
        path: "/admin/manage-parking/analytics/daily",
        icon: TrendingUp,
      },
      {
        label: "Peak Hours",
        path: "/admin/manage-parking/analytics/peak",
        icon: Clock,
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-950 border-r transition-all duration-300 flex flex-col",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "p-6 border-b flex items-center",
          isCollapsed ? "justify-center" : "gap-3",
        )}
      >
        <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-lg font-bold">
          P
        </div>

        {!isCollapsed && (
          <div>
            <h1 className="font-semibold text-lg">Parking Admin</h1>
            <p className="text-xs text-gray-500">Management Portal</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-3">
        {adminMenu.map((section, idx) => (
          <div key={idx} className="mb-6">
            {section.children ? (
              <>
                {!isCollapsed && (
                  <div className="text-xs font-semibold text-gray-400 uppercase mb-2 px-3">
                    {section.label}
                  </div>
                )}

                <div className="space-y-1">
                  {section.children.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                          isCollapsed && "justify-center",
                          isActive
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : (
              <Link
                href={section.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                  isCollapsed && "justify-center",
                  pathname === section.path
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                )}
              >
                <section.icon className="w-5 h-5" />
                {!isCollapsed && <span>{section.label}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t">
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center",
          )}
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
            A
          </div>

          {!isCollapsed && (
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-500">admin@parking.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
