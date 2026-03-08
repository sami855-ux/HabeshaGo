"use client"

import { Badge } from "@/components/ui/badge"
import type { UserStatus, UserRole, BadgeTheme } from "@/types/user"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  User,
  UserCog,
} from "lucide-react"

// Helper function to safely access theme properties
const getThemeClass = (
  theme: BadgeTheme,
  type: "status" | "role" | "verification",
  key: string
): string => {
  const themes = {
    default: {
      status: {
        active: "bg-green-100 text-green-800 border-green-200",
        suspended: "bg-red-100 text-red-800 border-red-200",
        inactive: "bg-gray-100 text-gray-800 border-gray-200",
      },
      role: {
        ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
        DRIVER: "bg-blue-100 text-blue-800 border-blue-200",
        PASSENGER: "bg-green-100 text-green-800 border-green-200",
      },
      verification: {
        true: "bg-green-100 text-green-800 border-green-200",
        false: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
    },
    light: {
      status: {
        active: "bg-green-50 text-green-700 border-green-100",
        suspended: "bg-red-50 text-red-700 border-red-100",
        inactive: "bg-gray-50 text-gray-700 border-gray-100",
      },
      role: {
        ADMIN: "bg-purple-50 text-purple-700 border-purple-100",
        DRIVER: "bg-blue-50 text-blue-700 border-blue-100",
        PASSENGER: "bg-green-50 text-green-700 border-green-100",
      },
      verification: {
        true: "bg-green-50 text-green-700 border-green-100",
        false: "bg-yellow-50 text-yellow-700 border-yellow-100",
      },
    },
    dark: {
      status: {
        active: "bg-green-900 text-green-100 border-green-800",
        suspended: "bg-red-900 text-red-100 border-red-800",
        inactive: "bg-gray-900 text-gray-100 border-gray-800",
      },
      role: {
        ADMIN: "bg-purple-900 text-purple-100 border-purple-800",
        DRIVER: "bg-blue-900 text-blue-100 border-blue-800",
        PASSENGER: "bg-green-900 text-green-100 border-green-800",
      },
      verification: {
        true: "bg-green-900 text-green-100 border-green-800",
        false: "bg-yellow-900 text-yellow-100 border-yellow-800",
      },
    },
    colorful: {
      status: {
        active:
          "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0",
        suspended:
          "bg-gradient-to-r from-red-400 to-pink-500 text-white border-0",
        inactive:
          "bg-gradient-to-r from-gray-400 to-slate-500 text-white border-0",
      },
      role: {
        ADMIN:
          "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0",
        DRIVER:
          "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0",
        PASSENGER:
          "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0",
      },
      verification: {
        true: "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0",
        false:
          "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0",
      },
    },
  }

  // Safely access the theme property
  const themeObj = themes[theme]?.[type]
  if (!themeObj) return ""

  return themeObj[key] || ""
}

export const getStatusBadge = (
  status: UserStatus,
  theme: BadgeTheme = "colorful"
) => {
  const baseClasses = "flex items-center gap-1 px-2 py-1 text-xs font-medium"

  const icons = {
    active: <CheckCircle className="h-3 w-3" />,
    suspended: <AlertTriangle className="h-3 w-3" />,
    inactive: <XCircle className="h-3 w-3" />,
  }

  const labels = {
    active: "Active",
    suspended: "Suspended",
    inactive: "Inactive",
  }

  const themeClass = getThemeClass(theme, "status", status)

  return (
    <Badge
      variant={theme === "colorful" ? "default" : "outline"}
      className={`${baseClasses} ${themeClass}`}
    >
      {icons[status]}
      {labels[status]}
    </Badge>
  )
}

export const getRoleBadge = (role: UserRole, theme: BadgeTheme = "default") => {
  const baseClasses = "flex items-center gap-1 px-2 py-1 text-xs font-medium"

  const icons = {
    ADMIN: <Shield className="h-3 w-3" />,
    DRIVER: <UserCog className="h-3 w-3" />,
    PASSENGER: <User className="h-3 w-3" />,
  }

  const labels = {
    ADMIN: "Admin",
    DRIVER: "Driver",
    PASSENGER: "Passenger",
  }

  const themeClass = getThemeClass(theme, "role", role)

  return (
    <Badge
      variant={theme === "colorful" ? "default" : "outline"}
      className={`${baseClasses} ${themeClass}`}
    >
      {icons[role]}
      {labels[role]}
    </Badge>
  )
}

export const getVerificationBadge = (
  verified: boolean,
  theme: BadgeTheme = "default"
) => {
  const baseClasses = "flex items-center gap-1 px-2 py-1 text-xs font-medium"
  const verifiedKey = verified ? "true" : "false"
  const themeClass = getThemeClass(theme, "verification", verifiedKey)

  return (
    <Badge
      variant={theme === "colorful" ? "default" : "outline"}
      className={`${baseClasses} ${themeClass}`}
    >
      {verified ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <AlertTriangle className="h-3 w-3" />
      )}
      {verified ? "Verified" : "Not Verified"}
    </Badge>
  )
}

// Additional badge utilities for specific use cases
export const getBookingStatusBadge = (
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
) => {
  const variants = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
  }

  return (
    <Badge variant="outline" className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </Badge>
  )
}

export const getReservationStatusBadge = (
  status: "PENDING" | "CONFIRMED" | "CANCELLED"
) => {
  const variants = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
  }

  return (
    <Badge variant="outline" className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </Badge>
  )
}
