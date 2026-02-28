"use client"

import {
  Bus,
  ParkingCircle,
  Zap,
  Briefcase,
  Wallet,
  History,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const quickActions = [
  {
    id: "bus",
    title: "Book a Bus",
    description: "Instantly book or check schedules",
    icon: Bus,
    color: "bg-gradient-to-br from-orange-500 to-amber-500",
    iconColor: "text-white",
  },
  {
    id: "charging",
    title: "EV Charging",
    description: "Find stations & start charging",
    icon: Zap,
    color: "bg-gradient-to-br from-orange-400 to-amber-400",
    iconColor: "text-white",
  },
  {
    id: "parking",
    title: "Parking",
    description: "Reserve & pay for parking",
    icon: ParkingCircle,
    color: "bg-gradient-to-br from-orange-600 to-amber-600",
    iconColor: "text-white",
  },
  {
    id: "employment",
    title: "Shuttle Jobs",
    description: "View job openings",
    icon: Briefcase,
    color: "bg-gradient-to-br from-orange-700 to-amber-700",
    iconColor: "text-white",
  },
  {
    id: "wallet",
    title: "Digital Wallet",
    description: "Balance & add funds",
    icon: Wallet,
    color: "bg-gradient-to-br from-amber-500 to-yellow-500",
    iconColor: "text-white",
  },
  {
    id: "history",
    title: "Trip History",
    description: "View past trips & receipts",
    icon: History,
    color: "bg-gradient-to-br from-orange-600 to-red-500",
    iconColor: "text-white",
  },
]

export function QuickActions() {
  const router = useRouter()

  const handleAction = (actionId: string) => {
    router.push(`/user/${actionId}`)
  }

  return (
    <Card className="border-none bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-orange-950/30 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-xl font-grotesk font-semibold">
                Quick Actions
              </CardTitle>
              <CardDescription>
                Everything you need, one tap away
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <div
              key={action.id}
              onClick={() => handleAction(action.id)}
              className="group relative cursor-pointer"
            >
              <div className="relative rounded-xl border-none bg-card p-4 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div
                    className={`${action.color} p-2.5 rounded-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <action.icon className="size-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">
                    Tap to access
                  </span>
                  <ChevronRight className="size-3 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}