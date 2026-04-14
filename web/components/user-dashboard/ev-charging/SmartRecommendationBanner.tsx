"use client"

import { useQuery } from "@tanstack/react-query"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Zap,
  TrendingDown,
  TrendingUp,
  Clock,
  Battery,
  Star,
  Sparkles,
  ThumbsUp,
  Info,
  AlertCircle,
  Gauge,
  Timer,
  DollarSign,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChargingStation } from "@/types/ev"
import { mockStations } from "@/lib/mock-data(1)"

interface SmartRecommendationBannerProps {
  station: ChargingStation
}

interface Recommendation {
  type: "price" | "availability" | "speed" | "peak" | "eco"
  title: string
  message: string
  impact: "positive" | "negative" | "neutral"
  metric?: string
  value?: string | number
  action?: string
}

export function SmartRecommendationBanner({
  station,
}: SmartRecommendationBannerProps) {
  const { data: allStations, isLoading } = useQuery({
    queryKey: ["charging-stations"],
    queryFn: async () => mockStations,
  })

  if (isLoading || !allStations) return null

  // Calculate metrics
  const stationPrice = station.tariffs[0]
    ? parseFloat(station.tariffs[0].pricePerKwh)
    : 0

  const avgPrice =
    allStations.reduce((acc, s) => {
      const tariff = s.tariffs[0]
      return acc + (tariff ? parseFloat(tariff.pricePerKwh) : 0)
    }, 0) / allStations.length

  const priceDiff = ((avgPrice - stationPrice) / avgPrice) * 100
  const isCheaper = priceDiff > 0
  const pricePercentage = Math.abs(priceDiff).toFixed(0)

  // Availability metrics
  const availablePoints = station.chargingPoints.filter(
    (cp) => cp.status === "AVAILABLE",
  ).length
  const totalPoints = station.chargingPoints.length
  const availabilityRatio = (availablePoints / totalPoints) * 100

  // Speed metrics
  const maxPower = Math.max(
    ...station.chargingPoints.map((cp) => cp.powerKw),
    0,
  )
  const avgPower =
    allStations.reduce((acc, s) => {
      const stationMaxPower = Math.max(
        ...s.chargingPoints.map((cp) => cp.powerKw),
        0,
      )
      return acc + stationMaxPower
    }, 0) / allStations.length
  const isFastCharger = maxPower > avgPower * 1.2
  const speedDiff = ((maxPower - avgPower) / avgPower) * 100

  // Peak hour suggestion (mock - would need actual time data)
  const currentHour = new Date().getHours()
  const isPeakHour = currentHour >= 17 && currentHour <= 20

  // Generate recommendations
  const recommendations: Recommendation[] = []

  // Price recommendation
  if (priceDiff > 15) {
    recommendations.push({
      type: "price",
      title: "Best Price in Area",
      message: `${pricePercentage}% cheaper than average • Save ~$${(stationPrice * 0.5).toFixed(2)} on a full charge`,
      impact: "positive",
      metric: `${pricePercentage}% less`,
      value: `$${stationPrice.toFixed(2)}/kWh`,
      action: "Great value station",
    })
  } else if (priceDiff < -15) {
    recommendations.push({
      type: "price",
      title: "Premium Pricing",
      message: `${pricePercentage}% more expensive than average • Consider nearby alternatives`,
      impact: "negative",
      metric: `${pricePercentage}% more`,
      value: `$${stationPrice.toFixed(2)}/kWh`,
      action: "Compare prices",
    })
  }

  // Availability recommendation
  if (availabilityRatio > 70) {
    recommendations.push({
      type: "availability",
      title: "High Availability",
      message: `${availablePoints} of ${totalPoints} ports available • No wait time expected`,
      impact: "positive",
      metric: `${availabilityRatio.toFixed(0)}% free`,
      value: `${availablePoints}/${totalPoints}`,
      action: "Ready to charge",
    })
  } else if (availabilityRatio < 30 && availabilityRatio > 0) {
    recommendations.push({
      type: "availability",
      title: "Limited Capacity",
      message: `Only ${availablePoints} port${availablePoints !== 1 ? "s" : ""} available • May have wait time`,
      impact: "negative",
      metric: `${availabilityRatio.toFixed(0)}% free`,
      value: `${availablePoints}/${totalPoints}`,
      action: "Check live status",
    })
  } else if (availabilityRatio === 0) {
    recommendations.push({
      type: "availability",
      title: "Fully Occupied",
      message: "All ports are currently occupied • Consider nearby stations",
      impact: "negative",
      metric: "0% available",
      value: "0/" + totalPoints,
      action: "View alternatives",
    })
  }

  // Speed recommendation
  if (isFastCharger && speedDiff > 30) {
    recommendations.push({
      type: "speed",
      title: "Ultra-Fast Charging",
      message: `${maxPower}kW max output • ${speedDiff.toFixed(0)}% faster than average • 10-80% in ~20 min`,
      impact: "positive",
      metric: `${maxPower}kW`,
      value: `${speedDiff.toFixed(0)}% faster`,
      action: "Fast charge ready",
    })
  } else if (maxPower < 50) {
    recommendations.push({
      type: "speed",
      title: "Standard Charging Speed",
      message: `${maxPower}kW output • Best for overnight or extended parking`,
      impact: "neutral",
      metric: `${maxPower}kW`,
      value: "Standard speed",
      action: "Plan for longer stops",
    })
  }

  // Peak hour recommendation
  if (isPeakHour && availabilityRatio < 50) {
    recommendations.push({
      type: "peak",
      title: "Peak Hours Alert",
      message:
        "High demand period • Consider charging after 8 PM for better availability",
      impact: "neutral",
      metric: "5-8 PM peak",
      action: "Off-peak suggestion",
    })
  }

  // Eco recommendation (if station uses green energy - mock)
  const isGreenEnergy = station.id % 3 === 0 // Mock green energy flag
  if (isGreenEnergy) {
    recommendations.push({
      type: "eco",
      title: "Eco-Friendly Station",
      message:
        "Powered by renewable energy • Lower carbon footprint per charge",
      impact: "positive",
      metric: "100% renewable",
      action: "Green choice",
    })
  }

  // If no recommendations, show a general tip
  if (recommendations.length === 0) {
    recommendations.push({
      type: "neutral",
      title: "Ready to Charge",
      message: `${availablePoints} ports available at $${stationPrice.toFixed(2)}/kWh • Average ${maxPower}kW speed`,
      impact: "neutral",
      metric: "Good choice",
      action: "Start charging",
    })
  }

  // Get the best recommendation (prioritize positive impacts)
  const bestRecommendation = recommendations.sort((a, b) => {
    const impactScore = { positive: 3, neutral: 2, negative: 1 }
    return impactScore[b.impact] - impactScore[a.impact]
  })[0]

  const getImpactStyles = (impact: string) => {
    switch (impact) {
      case "positive":
        return {
          bg: "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
          border: "border-emerald-200 dark:border-emerald-800",
          icon: "text-emerald-600",
          badge:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
          progress: "bg-emerald-500",
        }
      case "negative":
        return {
          bg: "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
          border: "border-amber-200 dark:border-amber-800",
          icon: "text-amber-600",
          badge:
            "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
          progress: "bg-amber-500",
        }
      default:
        return {
          bg: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
          border: "border-blue-200 dark:border-blue-800",
          icon: "text-blue-600",
          badge:
            "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
          progress: "bg-blue-500",
        }
    }
  }

  const styles = getImpactStyles(bestRecommendation.impact)

  const getIcon = (type: string) => {
    switch (type) {
      case "price":
        return bestRecommendation.impact === "positive"
          ? TrendingDown
          : TrendingUp
      case "availability":
        return Clock
      case "speed":
        return Gauge
      case "peak":
        return Timer
      case "eco":
        return Battery
      default:
        return Clock
    }
  }

  const Icon = getIcon(bestRecommendation.type)

  return (
    <div className="px-6 pb-0">
      <div
        className={`relative overflow-hidden rounded-xl border ${styles.border} ${styles.bg} transition-all duration-300 hover:shadow-lg`}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />

        <div className="relative p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`p-1 rounded-lg bg-white/50 dark:bg-white/10 backdrop-blur-sm`}
                >
                  <Icon className={`h-4 w-4 ${styles.icon}`} />
                </div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {bestRecommendation.title}
                </h4>
                <Badge variant="secondary" className={styles.badge}>
                  Smart Suggestion
                </Badge>
              </div>

              {/* Message */}
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                {bestRecommendation.message}
              </p>

              {/* Metrics Row */}
              <div className="flex items-center gap-4 text-xs">
                {bestRecommendation.metric && (
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${styles.progress}`}
                    />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {bestRecommendation.metric}
                    </span>
                  </div>
                )}
                {bestRecommendation.value && (
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3 w-3 text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-400">
                      {bestRecommendation.value}
                    </span>
                  </div>
                )}
                {bestRecommendation.action && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <ThumbsUp className="h-3 w-3 text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-400">
                      {bestRecommendation.action}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress bar for availability */}
              {bestRecommendation.type === "availability" &&
                availabilityRatio > 0 &&
                availabilityRatio < 100 && (
                  <div className="mt-3">
                    <Progress value={availabilityRatio} className="h-1.5" />
                  </div>
                )}
            </div>

            {/* Quick action badge */}
            <div className="hidden sm:flex flex-col items-end gap-1">
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {bestRecommendation.type === "price" &&
                    `$${stationPrice.toFixed(2)}`}
                  {bestRecommendation.type === "availability" &&
                    `${availabilityRatio.toFixed(0)}%`}
                  {bestRecommendation.type === "speed" && `${maxPower}kW`}
                  {bestRecommendation.type === "peak" && "Peak"}
                  {bestRecommendation.type === "eco" && "Green"}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {bestRecommendation.type === "price" && "per kWh"}
                  {bestRecommendation.type === "availability" && "available"}
                  {bestRecommendation.type === "speed" && "max power"}
                  {bestRecommendation.type === "eco" && "energy"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle corner accent */}
        <div
          className={`absolute bottom-0 right-0 w-16 h-16 opacity-10 ${styles.progress.replace("bg-", "bg-")}`}
          style={{
            clipPath: "polygon(100% 0, 0% 100%, 100% 100%)",
            backgroundColor: "currentColor",
          }}
        />
      </div>
    </div>
  )
}
