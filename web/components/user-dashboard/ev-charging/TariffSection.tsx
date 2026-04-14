"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DollarSign,
  Clock,
  Timer,
  Zap,
  TrendingUp,
  Flame,
  Shield,
  ChevronRight,
  Info,
  Sparkles,
  Leaf,
  Battery,
  Gauge,
  Crown,
  AlertCircle,
} from "lucide-react"
import { Tariff } from "@/types/ev"
import { useState } from "react"

interface TariffSectionProps {
  tariffs: Tariff[]
}

export function TariffSection({ tariffs }: TariffSectionProps) {
  const [selectedTariffId, setSelectedTariffId] = useState<string | null>(null)

  // Find current active tariff
  const activeTariff =
    tariffs.find((t) => {
      const now = new Date()
      const validFrom = new Date(t.validFrom)
      const validTo = t.validTo ? new Date(t.validTo) : null
      return validFrom <= now && (!validTo || validTo >= now)
    }) || tariffs[0]

  // Find best value tariff (lowest price per kWh)
  const bestValueTariff = tariffs.reduce(
    (best, current) =>
      parseFloat(current.pricePerKwh) < parseFloat(best.pricePerKwh)
        ? current
        : best,
    tariffs[0],
  )

  const isBestValue = activeTariff?.id === bestValueTariff?.id

  if (!activeTariff) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          No tariff information available
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Check back later for pricing updates
        </p>
      </div>
    )
  }

  const formatPrice = (price: string) => {
    return parseFloat(price).toFixed(2)
  }

  const calculateSavings = () => {
    if (!bestValueTariff || bestValueTariff.id === activeTariff.id) return null
    const savings =
      parseFloat(activeTariff.pricePerKwh) -
      parseFloat(bestValueTariff.pricePerKwh)
    return savings > 0 ? savings.toFixed(2) : null
  }

  return (
    <div className="space-y-4">
      {/* Main Tariff Card - Modern Clean Design */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Current Rate Plan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Active pricing for this station
                </p>
              </div>
            </div>
            {isBestValue && (
              <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-0 gap-1">
                <Crown className="w-3 h-3" />
                Best Price
              </Badge>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Energy Price */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Battery className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Energy
                </span>
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatPrice(activeTariff.pricePerKwh)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                  ETB/kWh
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <TrendingUp className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ~ETB {(parseFloat(activeTariff.pricePerKwh) * 50).toFixed(2)}{" "}
                  full charge
                </span>
              </div>
            </div>

            {/* Time-based Price */}
            {activeTariff.pricePerMinute && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Time
                  </span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(activeTariff.pricePerMinute)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                    {activeTariff.currency}/min
                  </span>
                </div>
                <div className="mt-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ~$
                    {(parseFloat(activeTariff.pricePerMinute) * 45).toFixed(
                      2,
                    )}{" "}
                    for 45 min
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Idle Fee */}
          {activeTariff.idleFeePerMinute && (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 mb-4 border border-amber-100 dark:border-amber-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                    <Timer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                      Idle Fee
                    </p>
                    <p className="text-lg font-bold text-amber-800 dark:text-amber-300">
                      {formatPrice(activeTariff.idleFeePerMinute)}
                      <span className="text-xs font-normal ml-1">ETB/min</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-amber-600 dark:text-amber-500">
                    After grace period
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-500 font-medium">
                    Unplug to avoid
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Validity */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Info className="w-3 h-3" />
            <span>
              Valid from {new Date(activeTariff.validFrom).toLocaleDateString()}
              {activeTariff.validTo &&
                ` to ${new Date(activeTariff.validTo).toLocaleDateString()}`}
            </span>
          </div>
        </div>
      </div>

      {/* Other Tariffs - Modern Toggle Cards */}
      {tariffs.length > 1 && (
        <div>
          <Button
            variant="ghost"
            className="w-full justify-between text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl py-5"
            onClick={() =>
              setSelectedTariffId(selectedTariffId === "all" ? null : "all")
            }
          >
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-medium">
                {tariffs.length - 1} alternative plan
                {tariffs.length > 2 ? "s" : ""}
              </span>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-200 ${selectedTariffId === "all" ? "rotate-90" : ""}`}
            />
          </Button>

          {selectedTariffId === "all" && (
            <div className="mt-3 space-y-2">
              {tariffs
                .filter((t) => t.id !== activeTariff.id)
                .map((tariff, index) => {
                  const savings =
                    parseFloat(activeTariff.pricePerKwh) -
                    parseFloat(tariff.pricePerKwh)
                  const isCheaper = savings > 0

                  return (
                    <div
                      key={index}
                      className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                              <Leaf className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Alternative Plan
                            </span>
                          </div>
                          {isCheaper && (
                            <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-0 text-xs">
                              Save {savings.toFixed(2)} {tariff.currency}/kWh
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
                              Energy Rate
                            </p>
                            <p className="text-base font-semibold text-slate-900 dark:text-white">
                              {formatPrice(tariff.pricePerKwh)}
                              <span className="text-xs font-normal text-slate-500 ml-1">
                                {tariff.currency}/kWh
                              </span>
                            </p>
                          </div>
                          {tariff.pricePerMinute && (
                            <div>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
                                Time Rate
                              </p>
                              <p className="text-base font-semibold text-slate-900 dark:text-white">
                                {formatPrice(tariff.pricePerMinute)}
                                <span className="text-xs font-normal text-slate-500 ml-1">
                                  {tariff.currency}/min
                                </span>
                              </p>
                            </div>
                          )}
                        </div>

                        {tariff.idleFeePerMinute && (
                          <div className="flex items-center gap-1.5 mb-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <AlertCircle className="w-3 h-3 text-amber-500" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              Idle fee: {formatPrice(tariff.idleFeePerMinute)}{" "}
                              {tariff.currency}/min
                            </span>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                          Valid from{" "}
                          {new Date(tariff.validFrom).toLocaleDateString()}
                          {tariff.validTo &&
                            ` to ${new Date(tariff.validTo).toLocaleDateString()}`}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      )}

      {/* Smart Tip Card */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-2">
          <div className="p-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
            <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Smart Charging Tip
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Charge between 20-80% for optimal battery health. Set a reminder
              to avoid idle fees!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
