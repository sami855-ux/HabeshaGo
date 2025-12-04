"use client"

import {
  Bus,
  ParkingCircle,
  Zap,
  Navigation,
  MapPin,
  Battery,
  Briefcase,
  ArrowRight,
} from "lucide-react"
import { useRouter } from "next/navigation"

function Page() {
  const router = useRouter()
  const quickActions = [
    {
      id: "bus",
      title: "Ticket a Bus",
      description: "Instantly book or check bus schedules",
      icon: Bus,
      color: "bg-gradient-to-br from-orange-500 to-amber-500",
      textColor: "text-white",
      borderColor: "border-orange-500/20",
    },
    {
      id: "charging",
      title: "EV Charging",
      description: "Find stations + start charging",
      icon: Zap,
      color: "bg-gradient-to-br from-orange-400 to-amber-400",
      textColor: "text-white",
      borderColor: "border-orange-400/20",
    },
    {
      id: "parking",
      title: "Parking",
      description: "Locate, reserve, or pay for parking",
      icon: ParkingCircle,
      color: "bg-gradient-to-br from-orange-600 to-amber-600",
      textColor: "text-white",
      borderColor: "border-orange-600/20",
    },
    {
      id: "employment",
      title: "Shuttle Employment",
      description: "Apply or check shuttle job openings",
      icon: Briefcase,
      color: "bg-gradient-to-br from-orange-700 to-amber-700",
      textColor: "text-white",
      borderColor: "border-orange-700/20",
    },
  ]

  const handleAction = (actionId: string) => {
    router.push(`/user/${actionId}`)
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Left Column - 2/3 width */}

      <div className="lg:col-span-2 bg-card  rounded-lg">
        {/* 3 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
          {/* Bus Transport */}
          <div className="p-4 border rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-sm hover:shadow-md transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Bus className="size-4 text-white/90" />
                  <h1 className="font-geist text-sm text-white/90 tracking-wide">
                    TOTAL BUS TRIPS
                  </h1>
                </div>
                <p className="text-3xl font-bold text-white py-1">248</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium text-white">
                    +12% this month
                  </div>
                  <div className="text-xs text-white/70">↑ from last month</div>
                </div>
              </div>
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Navigation className="size-7 text-white" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <p className="text-xs text-white/70">Daily Avg</p>
                <p className="text-lg font-semibold text-white">8.3</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-white/70">Peak Hours</p>
                <p className="text-lg font-semibold text-white">12</p>
              </div>
            </div>
          </div>

          {/* Parking Card */}
          <div className="p-4 border rounded-lg bg-background hover:shadow-md transition-all ">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-md bg-orange-50 dark:bg-orange-900/20">
                    <ParkingCircle className="size-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h1 className="font-geist text-sm text-muted-foreground tracking-wide">
                    PARKING SPOTS
                  </h1>
                </div>
                <p className="text-3xl font-bold text-foreground py-1">45</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="px-2 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-xs font-medium text-orange-700 dark:text-orange-300">
                    +8 today
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ↑ from yesterday
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                  <MapPin className="size-7 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Near You</p>
                <p className="text-lg font-semibold text-foreground">3</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Occupied</p>
                <p className="text-lg font-semibold text-foreground">68%</p>
              </div>
            </div>
          </div>

          {/* EV Charging Card */}
          <div className="p-4 border rounded-lg bg-background hover:shadow-md transition-all ">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-md bg-orange-50 dark:bg-orange-900/20">
                    <Zap className="size-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h1 className="font-geist text-sm text-muted-foreground tracking-wide">
                    EV CHARGING
                  </h1>
                </div>
                <p className="text-3xl font-bold text-foreground py-1">8</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="px-2 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-xs font-medium text-orange-700 dark:text-orange-300">
                    65% capacity
                  </div>
                  <div className="text-xs text-muted-foreground">
                    average usage
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                  <Battery className="size-7 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">In Use</p>
                <p className="text-lg font-semibold text-foreground">12</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Fast Charge</p>
                <p className="text-lg font-semibold text-foreground">6</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - 1/3 width */}
      <div className="lg:col-span-1 bg-card p-6 rounded-lg border">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            One-tap access to essential services
          </p>
        </div>

        {/* Action Buttons Grid */}
        <div className="space-y-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className="w-full group relative overflow-hidden rounded-xl border border-gray-200 dark:border-[#121418] bg-gray-100 dark:bg-[#17171a] p-4 text-left transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.99] hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
            >
              {/* Content */}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Icon Container */}
                  <div className={`${action.color} p-2.5 rounded-lg shadow-sm`}>
                    <action.icon className="size-5 text-white" />
                  </div>

                  {/* Text Content */}
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-orange-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {action.description}
                    </p>
                  </div>
                </div>

                {/* Arrow Icon */}
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))}
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm mt-2">
            <div className="text-muted-foreground">Service status</div>
            <div className="flex items-center gap-1">
              <div className="size-2 rounded-full bg-green-500" />
              <span className=" text-foreground font-jakarta">
                All operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
