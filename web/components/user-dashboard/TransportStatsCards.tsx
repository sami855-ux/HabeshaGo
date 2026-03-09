import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Bus, TrendingUp, ParkingCircle, Star, Wallet } from "lucide-react"
import { formatCurrencyIntl } from "@/lib/utils"

const formatCurrencyAbbr = (amount) => {
  if (!amount && amount !== 0) return "0 ETB"
  if (amount >= 1e6) return (amount / 1e6).toFixed(1) + "M ETB"
  if (amount >= 1e3) return (amount / 1e3).toFixed(1) + "K ETB"
  return amount.toLocaleString() + " ETB"
}

interface TransportStats {
  totalBusTrips: number
  busTrend: string
  activeReservations: number
  reservationMessage: string
  walletBalance: number
  currency?: string
}
interface TransportStatsCardsProps {
  data?: TransportStats
  isLoading?: boolean
  onAddFunds?: () => void
}

const TransportStatsCards: React.FC<TransportStatsCardsProps> = ({
  data,
  isLoading = false,
  onAddFunds,
}) => {
  const currency = data?.currency || "ETB"

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Bus Transport Skeleton */}
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
                <Skeleton className="h-9 w-20 bg-white/20 my-1" />
                <div className="flex items-center gap-2 mt-2">
                  <Skeleton className="h-5 w-24 bg-white/20" />
                  <Skeleton className="h-3 w-3 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parking Card Skeleton */}
        <Card className="border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-md bg-orange-50 dark:bg-orange-900/20">
                    <ParkingCircle className="size-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h1 className="font-geist text-sm text-muted-foreground tracking-wide">
                    ACTIVE RESERVATIONS
                  </h1>
                </div>
                <Skeleton className="h-9 w-24 my-1" />
                <div className="flex items-center gap-2 mt-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Balance Skeleton */}
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
                <Skeleton className="h-9 w-28 my-1" />
                <Skeleton className="h-4 w-20 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
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
              <p className="text-3xl font-bold py-1 font-grotesk">
                {data.totalBusTrips}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-xs font-medium"
                >
                  {data.busTrend}
                </Badge>
                <TrendingUp className="size-3" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Reservations Card */}
      <Card className="border shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20">
                  <ParkingCircle className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="font-geist text-sm text-muted-foreground tracking-wide">
                  ACTIVE RESERVATIONS
                </h1>
              </div>

              <p className="text-3xl font-bold text-foreground py-1 font-grotesk">
                {data.activeReservations}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <Star className="size-3 text-blue-500" />
                <span className="text-xs text-muted-foreground">
                  {data.reservationMessage}
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
                {formatCurrencyAbbr(data.walletBalance)}
              </p>
              <Button
                variant="link"
                className="text-xs text-green-600 hover:text-green-700 font-medium p-0 h-auto mt-2"
                onClick={onAddFunds}
              >
                + Add Funds
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TransportStatsCards
