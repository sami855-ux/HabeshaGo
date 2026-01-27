"use client"

import { RootState } from "@/store"
import {
  Bus,
  ParkingCircle,
  Zap,
  Briefcase,
  Wallet,
  History,
  TrendingUp,
  Star,
  Heart,
  Home,
  Building,
  School,
  ShoppingBag,
  Bell,
  Settings,
  ChevronRight,
  Clock,
  CheckCircle,
  MoreVertical,
  UserCircle,
  MapPin,
  Plus,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"

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

function Page() {
  const { user } = useSelector((state: RootState) => state.user)
  const router = useRouter()

  const [favorites, setFavorites] = useState<FavoriteDestination[]>([
    {
      id: "1",
      name: "Home",
      type: "home",
      address: "123 Main St",
      travelTime: "15 min",
      distance: "3.2 mi",
      isFavorite: true,
    },
    {
      id: "2",
      name: "Office",
      type: "work",
      address: "456 Business Ave",
      travelTime: "25 min",
      distance: "5.8 mi",
      isFavorite: true,
    },
    {
      id: "3",
      name: "University",
      type: "school",
      address: "789 Campus Dr",
      travelTime: "20 min",
      distance: "4.5 mi",
      isFavorite: true,
    },
    {
      id: "4",
      name: "Shopping Mall",
      type: "other",
      address: "101 Retail Blvd",
      travelTime: "18 min",
      distance: "4.1 mi",
      isFavorite: false,
    },
    {
      id: "5",
      name: "Gym",
      type: "other",
      address: "202 Fitness Rd",
      travelTime: "12 min",
      distance: "2.7 mi",
      isFavorite: false,
    },
  ])

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

  const handleAction = (actionId: string) => {
    router.push(`/user/${actionId}`)
  }

  const toggleFavorite = (id: string) => {
    setFavorites(
      favorites.map((fav) =>
        fav.id === id ? { ...fav, isFavorite: !fav.isFavorite } : fav,
      ),
    )
  }

  const getFavoriteIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="size-5" />
      case "work":
        return <Building className="size-5" />
      case "school":
        return <School className="size-5" />
      default:
        return <ShoppingBag className="size-5" />
    }
  }

  return (
    <div className="min-h-screen bg-background p-2 md:p-6 rounded-2xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name || "User"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your transportation services today
          </p>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Settings className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Avatar>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500">
              <UserCircle className="size-5 text-white" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Bus Transport */}
            <Card className="border-none bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Bus className="size-4" />
                      <h1 className="font-geist text-sm tracking-wide">
                        TOTAL BUS TRIPS
                      </h1>
                    </div>
                    <p className="text-3xl font-bold py-1">248</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-xs font-medium"
                      >
                        +12% this month
                      </Badge>
                      <TrendingUp className="size-3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parking Card */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-md bg-orange-50 dark:bg-orange-900/20">
                        <ParkingCircle className="size-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h1 className="font-geist text-sm text-muted-foreground tracking-wide">
                        MONTHLY SAVINGS
                      </h1>
                    </div>
                    <p className="text-3xl font-bold text-foreground py-1">
                      ETB 124
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Star className="size-3 text-amber-500" />
                      <span className="text-xs text-muted-foreground">
                        Using smart parking
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Balance */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="size-4 text-green-600" />
                      <h1 className="font-geist text-sm text-muted-foreground tracking-wide">
                        WALLET BALANCE
                      </h1>
                    </div>
                    <p className="text-3xl font-bold text-foreground py-1">
                      ETB 85.50
                    </p>
                    <Button
                      variant="link"
                      className="text-xs text-green-600 hover:text-green-700 font-medium p-0 h-auto mt-2"
                    >
                      + Add Funds
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions with Tabs */}
          <Card className="border-none bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-orange-950/30 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                    <Zap className="size-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Quick Actions</CardTitle>
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
                    <div className="relative rounded-xl border-none bg-card p-4  transition-all duration-300 ">
                      <div className="flex items-start gap-3">
                        <div
                          className={`${action.color} p-2.5 rounded-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <action.icon className="size-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold  text-foreground mb-1">
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
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Favorite Destinations */}
          <Card className="border-none bg-gradient-to-br from-background to-accent/50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Favorite Destinations</CardTitle>
                  <CardDescription>
                    Quick access to frequent locations
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {favorites.map((destination) => (
                  <div
                    key={destination.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(destination.id)
                              }}
                            >
                              <Heart
                                className={`size-4 ${
                                  destination.isFavorite
                                    ? "fill-red-500 text-red-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {destination.isFavorite
                                ? "Remove from favorites"
                                : "Add to favorites"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                        {getFavoriteIcon(destination.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{destination.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {destination.address}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{destination.travelTime}</p>
                      <p className="text-xs text-muted-foreground">
                        {destination.distance}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Settings */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Quick Settings</CardTitle>
              <CardDescription>Manage your preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-renew passes</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Parking reminders</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Bus arrival alerts</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Low balance alerts</span>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Page
