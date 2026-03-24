import React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Plus,
  Zap,
  List,
  FileText,
  BarChart,
  Settings,
  Download,
  Mail,
  Printer,
  Clock,
} from "lucide-react"

interface ActionItem {
  label: string
  icon: React.ReactNode
  description: string
  shortcut?: string
  primary?: boolean
}

export const QuickActions: React.FC = () => {
  const actions: ActionItem[] = [
    {
      label: "Add New Station",
      icon: <Plus className="h-5 w-5" />,
      description: "Register a new charging station",
      shortcut: "⌘N",
      primary: true,
    },
    {
      label: "Add New Charger",
      icon: <Zap className="h-5 w-5" />,
      description: "Install a new charger unit",
      shortcut: "⌘C",
      primary: true,
    },
    {
      label: "View All Sessions",
      icon: <List className="h-5 w-5" />,
      description: "Browse all charging sessions",
      shortcut: "⌘S",
    },
    {
      label: "Generate Reports",
      icon: <FileText className="h-5 w-5" />,
      description: "Create custom reports",
      shortcut: "⌘R",
    },
    {
      label: "Analytics",
      icon: <BarChart className="h-5 w-5" />,
      description: "View detailed analytics",
    },
    {
      label: "Export Data",
      icon: <Download className="h-5 w-5" />,
      description: "Export data to CSV/PDF",
    },
    {
      label: "Send Reports",
      icon: <Mail className="h-5 w-5" />,
      description: "Email scheduled reports",
    },
    {
      label: "Print Summary",
      icon: <Printer className="h-5 w-5" />,
      description: "Print dashboard summary",
    },
  ]

  const primaryActions = actions.filter((a) => a.primary)
  const secondaryActions = actions.filter((a) => !a.primary)

  return (
    <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-950/70 border-green-100 dark:border-green-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg">
            <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          Quick Actions
        </CardTitle>
        <CardDescription>Frequently used operations and tools</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Primary Actions - Large Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {primaryActions.map((action, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="h-24 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <div className="flex flex-col items-center gap-2 relative z-10">
                      <div className="p-2 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
                        {action.icon}
                      </div>
                      <span className="font-medium">{action.label}</span>
                      {action.shortcut && (
                        <span className="text-xs text-white/80 absolute top-2 right-2">
                          {action.shortcut}
                        </span>
                      )}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Secondary Actions - Smaller Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {secondaryActions.map((action, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-20 border-2 border-green-200 hover:border-green-300 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/50 transition-all duration-300 group relative"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-green-600 group-hover:scale-110 transition-transform">
                        {action.icon}
                      </div>
                      <span className="text-xs font-medium">
                        {action.label}
                      </span>
                    </div>
                    {action.shortcut && (
                      <span className="text-[10px] text-muted-foreground absolute top-1 right-1">
                        {action.shortcut}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Recent Actions Footer */}
        <div className="mt-6 pt-4 border-t border-green-100 dark:border-green-900">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Recent: Station #12 added • 2min ago</span>
            </div>
            <Button variant="link" size="sm" className="text-green-600">
              View All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
