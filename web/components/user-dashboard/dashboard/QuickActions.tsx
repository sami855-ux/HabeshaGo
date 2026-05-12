"use client"

import {
  Bus,
  ParkingCircle,
  Zap,
  Briefcase,
  Wallet,
  History,
  ChevronRight,
  Car,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const quickActions = [
  {
    id: "bus",
    title: "Book a Bus",
    description: "Instantly book or check schedules",
    icon: Bus,
    gradient: "from-orange-500 to-amber-500",
    lightColor: "bg-orange-100 dark:bg-orange-500/20",
    shadow: "shadow-orange-500/20",
  },
  {
    id: "ev-charging",
    title: "EV Charging",
    description: "Find stations & start charging",
    icon: Zap,
    gradient: "from-orange-400 to-amber-400",
    lightColor: "bg-orange-100 dark:bg-orange-500/20",
    shadow: "shadow-orange-400/20",
  },
  {
    id: "parking",
    title: "Parking",
    description: "Reserve & pay for parking",
    icon: ParkingCircle,
    gradient: "from-orange-600 to-amber-600",
    lightColor: "bg-orange-100 dark:bg-orange-500/20",
    shadow: "shadow-orange-600/20",
  },
  {
    id: "vehicles",
    title: "My Vehicles",
    description: "Add and manage your EV vehicles",
    icon: Car,
    gradient: "from-orange-600 to-amber-600",
    lightColor: "bg-orange-100 dark:bg-orange-500/20",
    shadow: "shadow-orange-600/20",
  },
  {
    id: "wallet",
    title: "Digital Wallet",
    description: "Balance & add funds",
    icon: Wallet,
    gradient: "from-amber-500 to-yellow-500",
    lightColor: "bg-amber-100 dark:bg-amber-500/20",
    shadow: "shadow-amber-500/20",
  },
]

export function QuickActions() {
  const router = useRouter()

  const handleAction = (actionId: string) => {
    router.push(`/user/${actionId}`)
  }

  return (
    <Card className="border-0 bg-transparent shadow-none py-0">
      <CardHeader className="px-0 pt-0 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight">
              Quick Actions
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Everything you need, one tap away
            </CardDescription>
          </div>
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-medium">6</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className="group relative overflow-hidden cursor-pointer rounded-2xl bg-card border border-border/50 hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 dark:hover:shadow-orange-500/5 p-4 text-left"
            >
              {/* Background Gradient on Hover */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-500",
                  action.gradient,
                )}
              />

              {/* Icon Container */}
              <div className="relative mb-3">
                <div
                  className={cn(
                    "relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-md",
                    action.gradient,
                    "group-hover:scale-110 group-hover:shadow-lg transition-all duration-300",
                    action.shadow,
                  )}
                >
                  <action.icon className="w-5 h-5" />
                </div>
                {/* Glow Effect */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500",
                    action.gradient,
                  )}
                />
              </div>

              {/* Content */}
              <div className="relative space-y-1.5">
                <h3 className="font-semibold text-base tracking-tight">
                  {action.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {action.description}
                </p>
              </div>

              {/* Footer */}
              <div className="relative mt-3 flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground/70 group-hover:text-orange-500 transition-colors">
                  Tap to access
                </span>
                <div className="w-5 h-5 rounded-full bg-muted/50 group-hover:bg-orange-500/10 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              {/* Border Gradient on Hover */}
              <div
                className={cn(
                  "absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-orange-500/20 dark:group-hover:border-orange-500/10 transition-colors duration-300 pointer-events-none",
                )}
              />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
