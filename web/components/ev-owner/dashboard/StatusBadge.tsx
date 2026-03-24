import React from "react"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  Clock,
  XCircle,
  Zap,
  Battery,
  AlertCircle,
} from "lucide-react"

interface StatusBadgeProps {
  status: "completed" | "in_progress" | "failed"
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    completed: {
      variant: "success" as const,
      label: "Completed",
      icon: CheckCircle2,
      className:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800",
    },
    in_progress: {
      variant: "warning" as const,
      label: "In Progress",
      icon: Clock,
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    },
    failed: {
      variant: "destructive" as const,
      label: "Failed",
      icon: XCircle,
      className:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800",
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 px-2.5 py-1 ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{config.label}</span>
    </Badge>
  )
}
