"use client"

import { RootState } from "@/store"
import {
  Bus,
  ParkingCircle,
  Wallet,
  Star,
  TrendingUp,
  Heart,
  Home,
  Building,
  School,
  ShoppingBag,
  Settings,
  Clock,
  UserCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { QuickActions } from "@/components/user-dashboard/dashboard/QuickActions"
import { PromoCarousel } from "@/components/user-dashboard/PromoCarousel"
import UpcomingSchedules from "@/components/user-dashboard/upcoming-schedules"
import TransportStatsCards from "@/components/user-dashboard/TransportStatsCards"
import { getTransportStats, TransportStats } from "@/services/user.api"

// Favorite destination interface
interface FavoriteDestination {
  id: string
  name: string
  type: "home" | "work" | "school" | "other"
  address: string
  travelTime: string
  distance: string
  isFavorite: boolean
}

export default function UserDashboard() {
  const { user } = useSelector((state: RootState) => state.user)
  const router = useRouter()

  const [stats, setStats] = useState<TransportStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getTransportStats()

      if (data) {
        setStats(data)
      }

      setLoading(false)
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-background p-2 md:p-6 rounded-2xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div id="welcome">
          <h1 className="text-2xl font-bold text-foreground flex gap-2">
            Welcome back, <p className="capitalize">{user?.name || ""}</p>! 👋
          </h1>
          <p className="text-muted-foreground">
            Here &apos;s what&apos;s happening with your transportation services
            today
          </p>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => router.push("/user/settings")}
                >
                  <Settings className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Avatar
            onClick={() => router.push("/user/Profile")}
            className="cursor-pointer"
          >
            <AvatarImage src={user?.avaterUrl} />
            <AvatarFallback className="bg-linear-to-br from-orange-500 to-amber-500">
              <UserCircle className="size-5 text-white" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6" id="stats-section">
          <TransportStatsCards data={stats || undefined} isLoading={loading} />

          <PromoCarousel />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>
      <UpcomingSchedules />
    </div>
  )
}
