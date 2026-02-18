import { CheckCircle, Wrench, AlertCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  size?: "sm" | "md" | "lg"
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const statusConfig = {
    ACTIVE: { 
      label: "Active", 
      color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", 
      icon: CheckCircle 
    },
    UNDER_MAINTENANCE: { 
      label: "Maintenance", 
      color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", 
      icon: Wrench 
    },
    OUT_OF_SERVICE: { 
      label: "Out of Service", 
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", 
      icon: AlertCircle 
    },
    DELAYED: { 
      label: "Delayed", 
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300", 
      icon: Clock 
    }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || { 
    label: status, 
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300", 
    icon: AlertCircle 
  }
  
  const Icon = config.icon
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }

  return (
    <Badge 
      variant="secondary" 
      className={cn("gap-2 font-medium px-3 py-1.5", config.color)}
    >
      <Icon className={sizeClasses[size]} />
      {config.label}
    </Badge>
  )
}