"use client"

import { useQuery } from "@tanstack/react-query"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Zap, TrendingDown, TrendingUp } from "lucide-react"
import { ChargingStation } from "@/types/ev"
import { mockStations } from "@/lib/mock-data(1)"

interface SmartRecommendationBannerProps {
  station: ChargingStation
}

export function SmartRecommendationBanner({
  station,
}: SmartRecommendationBannerProps) {
  const { data: allStations } = useQuery({
    queryKey: ["charging-stations"],
    queryFn: async () => mockStations,
  })

  if (!allStations) return null

  // Calculate average price
  const avgPrice =
    allStations.reduce((acc, s) => {
      const tariff = s.tariffs[0]
      return acc + (tariff ? parseFloat(tariff.pricePerKwh) : 0)
    }, 0) / allStations.length

  const stationPrice = station.tariffs[0]
    ? parseFloat(station.tariffs[0].pricePerKwh)
    : 0

  const priceDiff = ((avgPrice - stationPrice) / avgPrice) * 100

  // Calculate availability
  const availablePoints = station.chargingPoints.filter(
    (cp) => cp.status === "AVAILABLE",
  ).length
  const availabilityRatio =
    (availablePoints / station.chargingPoints.length) * 100

  let message = ""
  let icon = null
  let variant: "default" | "destructive" = "default"

  if (priceDiff > 10) {
    message = `Smart Suggestion: This station is ${priceDiff.toFixed(0)}% cheaper than the city average.`
    icon = <TrendingDown className="w-4 h-4 text-green-500" />
  } else if (availabilityRatio > 70) {
    message = `Smart Suggestion: High availability (${availabilityRatio.toFixed(0)}% of ports free).`
    icon = <Zap className="w-4 h-4 text-blue-500" />
  } else if (priceDiff < -10) {
    message = `Note: This station is ${Math.abs(priceDiff).toFixed(0)}% more expensive than average.`
    icon = <TrendingUp className="w-4 h-4 text-orange-500" />
    variant = "destructive"
  } else {
    return null
  }

  return (
    <Alert
      variant={variant}
      className="m-6 mt-0 rounded-xl border-0 bg-blue-50"
    >
      <div className="flex items-center gap-2">
        {icon}
        <AlertDescription className="text-sm font-medium">
          {message}
        </AlertDescription>
      </div>
    </Alert>
  )
}
