"use client"

import { Clock, CheckCircle, AlertCircle, Ban, RefreshCw } from "lucide-react"

const statusConfig = {
  PENDING: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  SUCCESS: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  FAILED: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertCircle,
  },
  CANCELLED: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: Ban },
  REFUNDED: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: RefreshCw,
  },
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </span>
  )
}
