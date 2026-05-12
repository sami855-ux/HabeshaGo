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
  AlertCircle,
  CheckCircle2,
  Loader2,
  Menu,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { QuickActions } from "@/components/user-dashboard/dashboard/QuickActions"
import { PromoCarousel } from "@/components/user-dashboard/PromoCarousel"
import UpcomingSchedules from "@/components/user-dashboard/upcoming-schedules"
import TransportStatsCards from "@/components/user-dashboard/TransportStatsCards"
import { getTransportStats, TransportStats } from "@/services/user.api"
import { useAppSelector } from "@/store/store"
import { ProfileCompletionDialog } from "@/components/user-dashboard/ProfileComplete"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { getSocket } from "@/services/socket"
import { RatingDialog } from "@/components/user-dashboard/bus/RatingDialog"
import { submitRating } from "@/services/bus.api"
import { toast } from "sonner"

export default function UserDashboard() {
  const {
    user,
    loading: userLoading,
    error: userError,
  } = useAppSelector((state) => state.user)

  const router = useRouter()

  const [showCompletionBadge, setShowCompletionBadge] = useState(true)
  const [badgeDismissed, setBadgeDismissed] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showRating, setShowRating] = useState(false)
  const [tripData, setTripData] = useState(null)

  // React Query for transport stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["transportStats"],
    queryFn: getTransportStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: !!user && !userLoading,
  })

  // Handle initial loading state
  useEffect(() => {
    if (!userLoading) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [userLoading])

  useEffect(() => {
    const socket = getSocket()

    const handleTripCompleted = (data: any) => {
      console.log("Trip completed:", data)

      switch (data.type) {
        case "BUS": {
          setTripData({
            bookingId: data.id,
            busId: data.metadata?.busId,
            busNumber: data.metadata?.busNumber,
            routeName: data.metadata?.routeName,
          })

          queueMicrotask(() => {
            setShowRating(true)
          })
          break
        }

        case "PARKING": {
          console.log("Parking completed:", data)
          break
        }

        case "EV_CHARGING": {
          console.log("EV charging completed:", data)
          break
        }

        default:
          console.warn("Unknown activity type:", data.type)
      }
    }

    socket.on("trip:completed", handleTripCompleted)

    return () => {
      socket.off("trip:completed", handleTripCompleted)
    }
  }, [])

  // Check if profile is complete
  const isProfileComplete = user?.emailVerified && user?.phoneVerified

  // Calculate missing items for the badge
  const missingItems = []
  if (!user?.emailVerified) missingItems.push("Email verification")
  if (!user?.phoneVerified) missingItems.push("Phone verification")
  if (!user?.avaterUrl) missingItems.push("Profile photo")
  if (!user?.bio) missingItems.push("Bio")

  // Handle badge dismissal
  const handleBadgeDismiss = () => {
    setBadgeDismissed(true)
    localStorage.setItem("profileBadgeDismissed", "true")
  }

  // Check if badge was previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem("profileBadgeDismissed")
    if (dismissed === "true") {
      setBadgeDismissed(true)
    }
  }, [])

  // Show badge only after user is loaded and conditions are met
  const shouldShowBadge =
    !userLoading &&
    !isProfileComplete &&
    !badgeDismissed &&
    showCompletionBadge &&
    !!user

  // Show profile completion dialog only after user is loaded and conditions are met
  const shouldShowDialog =
    !userLoading &&
    !isProfileComplete &&
    !badgeDismissed &&
    showCompletionBadge &&
    !!user

  // Loading skeleton for the entire dashboard
  if (userLoading || isInitialLoad) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <Skeleton className="h-8 w-48 sm:w-64 mb-2" />
              <Skeleton className="h-4 w-64 sm:w-96" />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div className="space-y-4 sm:space-y-6">
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state for user loading
  if (userError) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-4 sm:p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-red-700 dark:text-red-300 text-sm sm:text-base">
                  Error loading user data
                </h3>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 break-words">
                  {userError || "Please try refreshing the page"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // No user state
  if (!user) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6 sm:p-8">
            <div className="text-center">
              <UserCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold text-lg sm:text-xl mb-1">
                No user data available
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please log in to view your dashboard
              </p>
              <Button onClick={() => router.push("/login")}>Go to Login</Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section with Badge */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex flex-wrap items-center gap-1 sm:gap-2">
                  Welcome back,{" "}
                  <span className="capitalize ">{user?.name || "User"}</span>!
                </h1>

                {/* Profile Completion Badge - responsive */}
                <AnimatePresence>
                  {shouldShowBadge && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: -10 }}
                      transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 300,
                      }}
                      className="w-full sm:w-auto"
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full sm:w-auto h-8 px-2 sm:px-3 gap-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full"
                          >
                            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs font-medium truncate">
                              {missingItems.length} step
                              {missingItems.length > 1 ? "s" : ""} remaining
                            </span>
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full"
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-[calc(100vw-2rem)] sm:w-80 p-4 bg-white dark:bg-zinc-900 border shadow-lg rounded-xl"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="p-1.5 bg-amber-100 dark:bg-amber-950 rounded-lg flex-shrink-0">
                                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm truncate">
                                    Complete your profile
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Unlock all features by finishing these{" "}
                                    {missingItems.length} step
                                    {missingItems.length > 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex-shrink-0"
                                onClick={handleBadgeDismiss}
                              >
                                <span className="sr-only">Dismiss</span>
                                <span className="text-lg leading-none">×</span>
                              </Button>
                            </div>

                            {/* Progress indicator */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">
                                  Profile completion
                                </span>
                                <span className="font-medium text-amber-600 dark:text-amber-400">
                                  {Math.round(
                                    ((4 - missingItems.length) / 4) * 100,
                                  )}
                                  %
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${((4 - missingItems.length) / 4) * 100}%`,
                                  }}
                                  transition={{ duration: 0.5 }}
                                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                />
                              </div>
                            </div>

                            {/* Missing items list */}
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                              {missingItems.map((item, index) => (
                                <motion.div
                                  key={item}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                                >
                                  <div className="p-1 bg-amber-100 dark:bg-amber-950 rounded-full flex-shrink-0">
                                    <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                  </div>
                                  <span className="flex-1 text-xs text-zinc-700 dark:text-zinc-300 break-words">
                                    {item}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/50 flex-shrink-0"
                                    onClick={() => router.push("/user/Profile")}
                                  >
                                    Add now
                                  </Button>
                                </motion.div>
                              ))}
                            </div>

                            {/* CTA button */}
                            <Button
                              className="w-full mt-2 bg-gradient-to-r from-orange-600 to-orange-600 hover:from-orange-700 hover:to-orange-700 text-white rounded-md cursor-pointer text-sm py-2"
                              size="sm"
                              onClick={() => {
                                router.push("/user/Profile")
                                setShowCompletionBadge(false)
                              }}
                            >
                              Complete profile now
                            </Button>

                            <p className="text-[10px] text-center text-muted-foreground">
                              ✨ A complete profile helps you get better
                              recommendations
                            </p>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                Here&apos;s what&apos;s happening with your transportation
                services today
              </p>
            </div>

            {/* User Actions - Responsive */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-9 w-9 sm:h-10 sm:w-10"
                      onClick={() => router.push("/user/settings")}
                    >
                      <Settings className="h-4 w-4 sm:size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Avatar
                onClick={() => router.push("/user/Profile")}
                className="cursor-pointer ring-2 ring-offset-2 ring-orange-500/20 hover:ring-orange-500/40 transition-all h-9 w-9 sm:h-10 sm:w-10"
              >
                <AvatarImage src={user?.avaterUrl} />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white text-sm sm:text-base">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Main Dashboard Grid - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - 2/3 width on desktop */}
            <div
              className="lg:col-span-2 space-y-4 sm:space-y-6"
              id="stats-section"
            >
              {/* Error state for stats */}
              {statsError && (
                <Card className="p-3 sm:p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-sm text-red-600 dark:text-red-400 text-center sm:text-left">
                      Failed to load transport stats
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchStats()}
                      className="border-red-200 dark:border-red-800 w-full sm:w-auto"
                    >
                      Retry
                    </Button>
                  </div>
                </Card>
              )}

              {/* Stats Cards - Responsive grid */}
              <TransportStatsCards
                data={stats || undefined}
                isLoading={statsLoading}
              />

              {/* Promo Carousel - Responsive */}
              <PromoCarousel />
            </div>

            {/* Right Column - 1/3 width on desktop */}
            <div className="space-y-4 sm:space-y-6">
              <QuickActions />
            </div>
          </div>

          {/* Upcoming Schedules - Full width */}
          <div className="mt-6">
            <UpcomingSchedules />
          </div>
        </div>
      </div>

      {/* Profile Completion Dialog */}
      <AnimatePresence>
        {shouldShowDialog && (
          <ProfileCompletionDialog
            open={shouldShowDialog}
            onOpenChange={(open) => {
              if (!open) {
                setShowCompletionBadge(false)
                handleBadgeDismiss()
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Rating Dialog */}
      <RatingDialog
        open={showRating}
        onOpenChange={setShowRating}
        busDetails={{
          busNumber: tripData?.busNumber,
          routeName: tripData?.routeName,
          date: new Date().toLocaleDateString(),
        }}
        onSubmit={async (data) => {
          console.log("Rating submitted:", data)

          const payload = {
            score: data.score,
            comment: data.comment,
            bookingId: tripData?.bookingId,
            busId: tripData?.busId,
          }

          const result = await submitRating(payload)

          if (result.success) {
            console.log("Rating saved:", result.data)
            setShowRating(false)
            toast.success("Thanks for your feedback!")
          } else {
            console.error(result.message)
            toast.error(result.message)
          }
        }}
      />
    </>
  )
}
