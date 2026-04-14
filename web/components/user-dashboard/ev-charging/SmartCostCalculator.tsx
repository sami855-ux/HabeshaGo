"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ChargingStation, ChargingPoint, Tariff } from "@/types/ev"
import { Badge } from "@/components/ui/badge"
import {
  Battery,
  Target,
  Gauge,
  Clock,
  DollarSign,
  Zap,
  TrendingUp,
  Timer,
  AlertCircle,
  Leaf,
} from "lucide-react"

interface SmartCostCalculatorProps {
  station: ChargingStation
  selectedPoint: ChargingPoint | null
}

export function SmartCostCalculator({
  station,
  selectedPoint,
}: SmartCostCalculatorProps) {
  const [batteryPercent, setBatteryPercent] = useState(20)
  const [targetPercent, setTargetPercent] = useState(80)
  const [batteryCapacity, setBatteryCapacity] = useState(75)

  const [calculation, setCalculation] = useState({
    energyRequired: 0,
    duration: 0,
    energyCost: 0,
    timeCost: 0,
    idleFee: 0,
    totalCost: 0,
    co2Saved: 0,
  })

  const activeTariff =
    station.tariffs.find((t) => {
      const now = new Date()
      const validFrom = new Date(t.validFrom)
      const validTo = t.validTo ? new Date(t.validTo) : null
      return validFrom <= now && (!validTo || validTo >= now)
    }) || station.tariffs[0]

  useEffect(() => {
    if (!selectedPoint || !activeTariff) return

    const energyRequired =
      ((targetPercent - batteryPercent) / 100) * batteryCapacity
    const duration = (energyRequired / selectedPoint.powerKw) * 60

    const energyCost = energyRequired * parseFloat(activeTariff.pricePerKwh)
    const timeCost = activeTariff.pricePerMinute
      ? duration * parseFloat(activeTariff.pricePerMinute)
      : 0
    const idleFee = activeTariff.idleFeePerMinute
      ? 30 * parseFloat(activeTariff.idleFeePerMinute)
      : 0

    setCalculation({
      energyRequired,
      duration,
      energyCost,
      timeCost,
      idleFee,
      totalCost: energyCost + timeCost + idleFee,
      co2Saved: energyRequired * 0.4,
    })
  }, [
    batteryPercent,
    targetPercent,
    batteryCapacity,
    selectedPoint,
    activeTariff,
  ])

  if (!selectedPoint) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Zap className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
          No Charging Port Selected
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select a charging port to see cost estimates
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 rounded-xl">
          <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Cost Estimator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time charging cost calculation
          </p>
        </div>
      </div>

      {/* Input Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Battery Level */}
        <Card className="p-4 rounded-xl border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
              <Battery className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Current Battery
            </Label>
          </div>
          <div className="mb-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {batteryPercent}%
            </span>
          </div>
          <Slider
            value={[batteryPercent]}
            onValueChange={([v]) => setBatteryPercent(v)}
            min={0}
            max={100}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between mt-1 text-[10px] text-slate-400">
            <span>Empty</span>
            <span>Full</span>
          </div>
        </Card>

        {/* Target Level */}
        <Card className="p-4 rounded-xl border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
              <Target className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Target Battery
            </Label>
          </div>
          <div className="mb-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {targetPercent}%
            </span>
          </div>
          <Slider
            value={[targetPercent]}
            onValueChange={([v]) => setTargetPercent(v)}
            min={batteryPercent + 1}
            max={100}
            step={1}
            disabled={targetPercent <= batteryPercent}
          />
          <div className="flex justify-between mt-1 text-[10px] text-slate-400">
            <span>Min</span>
            <span>Max</span>
          </div>
        </Card>

        {/* Battery Capacity */}
        <Card className="p-4 rounded-xl border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
              <Gauge className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Battery Size
            </Label>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <input
              type="number"
              value={batteryCapacity}
              onChange={(e) => setBatteryCapacity(Number(e.target.value))}
              className="text-2xl font-bold text-slate-900 dark:text-white bg-transparent border-0 p-0 w-20 focus:outline-none focus:ring-0"
            />
            <span className="text-sm text-slate-500">kWh</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-2">
            Common: 40-100 kWh
          </div>
        </Card>
      </div>

      {/* Results Card */}
      <Card className="relative overflow-hidden rounded-xl border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl" />

        <div className="relative p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <DollarSign className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-white/80">
                Estimated Total
              </span>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-0">
              <Zap className="w-3 h-3 mr-1" />
              {selectedPoint.powerKw} kW Charging
            </Badge>
          </div>

          <div className="mb-6">
            <span className="text-4xl font-bold">
              {calculation.totalCost.toFixed(2)}
            </span>
            <span className="text-sm text-white/60 ml-1">
              {activeTariff?.currency}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Battery className="w-3 h-3 text-white/60" />
                <span className="text-[10px] text-white/60 uppercase">
                  Energy
                </span>
              </div>
              <div className="text-lg font-semibold">
                {calculation.energyRequired.toFixed(1)}
                <span className="text-xs font-normal text-white/60 ml-1">
                  kWh
                </span>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3 h-3 text-white/60" />
                <span className="text-[10px] text-white/60 uppercase">
                  Duration
                </span>
              </div>
              <div className="text-lg font-semibold">
                {calculation.duration.toFixed(0)}
                <span className="text-xs font-normal text-white/60 ml-1">
                  min
                </span>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3 h-3 text-white/60" />
                <span className="text-[10px] text-white/60 uppercase">
                  Energy Cost
                </span>
              </div>
              <div className="text-base font-semibold">
                {calculation.energyCost.toFixed(2)}
                <span className="text-xs font-normal text-white/60 ml-1">
                  {activeTariff?.currency}
                </span>
              </div>
            </div>

            {calculation.timeCost > 0 && (
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Timer className="w-3 h-3 text-white/60" />
                  <span className="text-[10px] text-white/60 uppercase">
                    Time Cost
                  </span>
                </div>
                <div className="text-base font-semibold">
                  {calculation.timeCost.toFixed(2)}
                  <span className="text-xs font-normal text-white/60 ml-1">
                    {activeTariff?.currency}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Idle Fee Warning */}
          {calculation.idleFee > 0 && (
            <div className="bg-amber-500/20 rounded-xl p-3 mb-4 border border-amber-500/30">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber-300">
                    Idle Fee Warning
                  </p>
                  <p className="text-[10px] text-amber-300/80">
                    {calculation.idleFee.toFixed(2)} {activeTariff?.currency}{" "}
                    idle fee after 30 min
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Eco Impact */}
          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-white/60">
              ~{calculation.co2Saved.toFixed(1)} kg CO₂ saved vs. gasoline
            </span>
          </div>
        </div>
      </Card>

      {/* Charging Tip */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-2">
          <div className="p-1 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg">
            <Zap className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Charging at {selectedPoint.powerKw} kW
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedPoint.powerKw >= 150
                ? "Ultra-fast charging - Perfect for quick top-ups!"
                : selectedPoint.powerKw >= 50
                  ? "Fast charging - Great balance of speed and cost"
                  : "Standard charging - Ideal for longer stops"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
