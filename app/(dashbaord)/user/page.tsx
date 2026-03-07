"use client";

import { RootState } from "@/store";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuickActions } from "@/components/user-dashboard/dashboard/QuickActions";
import { PromoCarousel } from "@/components/user-dashboard/PromoCarousel";
import UpcomingSchedules from "@/components/user-dashboard/upcoming-schedules";

// Favorite destination interface
interface FavoriteDestination {
  id: string;
  name: string;
  type: "home" | "work" | "school" | "other";
  address: string;
  travelTime: string;
  distance: string;
  isFavorite: boolean;
}

export default function UserDashboard() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

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
  ]);

  const toggleFavorite = (id: string) => {
    setFavorites(
      favorites.map((fav) =>
        fav.id === id ? { ...fav, isFavorite: !fav.isFavorite } : fav,
      ),
    );
  };

  const getFavoriteIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="size-5" />;
      case "work":
        return <Building className="size-5" />;
      case "school":
        return <School className="size-5" />;
      default:
        return <ShoppingBag className="size-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-2 md:p-6 rounded-2xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div id="welcome">
          <h1 className="text-2xl font-bold text-foreground flex gap-2">
            Welcome back, <p className="capitalize">{user?.name || "User"}</p>!
            👋
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Bus Transport */}
            <Card className="border-none bg-linear-to-br from-orange-500 to-amber-500 text-white shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Bus className="size-4" />
                      <h1 className="font-geist text-sm tracking-wide">
                        TOTAL BUS TRIPS
                      </h1>
                    </div>
                    <p className="text-3xl font-bold py-1 font-grotesk">248</p>
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
            <Card className="border shadow-none">
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
                    <p className="text-3xl font-bold text-foreground py-1 font-grotesk">
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
            <Card className="border shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="size-4 text-green-600" />
                      <h1 className="font-geist text-sm text-muted-foreground tracking-wide">
                        WALLET BALANCE
                      </h1>
                    </div>
                    <p className="text-3xl font-bold text-foreground py-1 font-grotesk">
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

          <PromoCarousel />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>
      <UpcomingSchedules />
    </div>
  );
}
