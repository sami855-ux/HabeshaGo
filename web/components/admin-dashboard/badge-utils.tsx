import { Badge } from "@/components/ui/badge"
import { Check, Wrench, X, User, Route } from "lucide-react"
import type { Bus } from "@/types/bus"

export const ColorfulStatusBadge = ({ status }: { status: Bus["status"] }) => {
  const getStatusConfig = (status: Bus["status"]) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Active",
          className:
            "bg-gradient-to-r from-emerald-400 to-green-500 text-white",
          icon: <Check className="h-3 w-3" />,
        }
      case "UNDER_MAINTENANCE":
        return {
          label: "Maintenance",
          className: "bg-gradient-to-r from-amber-400 to-orange-500 text-white",
          icon: <Wrench className="h-3 w-3" />,
        }
      case "OUT_OF_SERVICE":
        return {
          label: "Out of Service",
          className: "bg-gradient-to-r from-rose-400 to-red-500 text-white",
          icon: <X className="h-3 w-3" />,
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge
      className={`flex items-center gap-1.5 ${config.className} border-0 shadow-sm`}
    >
      {config.icon}
      {config.label}
    </Badge>
  )
}

export const ColorfulUnassignedBadge = () => (
  <Badge
    variant="outline"
    className="bg-gradient-to-r from-slate-100 to-gray-100 text-gray-700 border-gray-200"
  >
    <User className="h-3 w-3 mr-1" />
    Unassigned
  </Badge>
)

export const ColorfulNoRouteBadge = () => (
  <Badge
    variant="outline"
    className="bg-gradient-to-r from-slate-100 to-gray-100 text-gray-700 border-gray-200"
  >
    <Route className="h-3 w-3 mr-1" />
    No Route
  </Badge>
)
