"use client"

import { useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Gauge, BatteryCharging, Timer, Leaf, Minus, Plus } from "lucide-react"

interface ChargingPoint {
  id: number
  powerKw: number
}

interface EnergySelectorProps {
  selectedPoint: ChargingPoint | null | undefined
  energyKwh: number
  setEnergyKwh: (value: number) => void
  pricePerKwh: number
  estimatedTimeMin: number | undefined
  setEstimatedTimeMin: (value: number) => void
}

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

const getProgressColor = (kwh: number) => {
  if (kwh <= 20) return "bg-gradient-to-r from-emerald-400 to-green-500"
  if (kwh <= 50) return "bg-gradient-to-r from-green-400 to-emerald-500"
  if (kwh <= 80) return "bg-gradient-to-r from-teal-400 to-emerald-500"
  if (kwh <= 120) return "bg-gradient-to-r from-emerald-500 to-green-600"
  return "bg-gradient-to-r from-amber-500 to-orange-500"
}

export function EnergySelector({
  selectedPoint,
  energyKwh,
  setEnergyKwh,
  pricePerKwh,
  estimatedTimeMin,
  setEstimatedTimeMin,
}: EnergySelectorProps) {
  useEffect(() => {
    if (!selectedPoint) return

    const time = Math.ceil((energyKwh / selectedPoint.powerKw) * 60)
    setEstimatedTimeMin(time)
  }, [energyKwh, selectedPoint, setEstimatedTimeMin])

  if (!selectedPoint) return null

  const co2Saved = (energyKwh * 0.4).toFixed(1)
  const totalPrice = (energyKwh * pricePerKwh).toFixed(2)

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-100/30 to-green-50/20 rounded-full blur-2xl -ml-32 -mb-32"></div>

      <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-green-50/30 pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Gauge className="h-5 w-5 text-emerald-600" />
          Set Your Energy Requirement
        </CardTitle>
        <CardDescription className="text-gray-600">
          Adjust the slider to match your EV's battery needs
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* ENERGY CONTROL */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <BatteryCharging className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Energy Amount</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-emerald-600">
                    {energyKwh}
                  </span>
                  <span className="text-gray-500">kWh</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                onClick={() => setEnergyKwh(Math.max(5, energyKwh - 5))}
              >
                <Minus className="h-3 w-3 text-emerald-600" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                onClick={() => setEnergyKwh(Math.min(150, energyKwh + 5))}
              >
                <Plus className="h-3 w-3 text-emerald-600" />
              </Button>
            </div>
          </div>

          <Slider
            value={[energyKwh]}
            onValueChange={(val) => setEnergyKwh(val[0])}
            min={5}
            max={150}
            step={1}
            className="py-4"
          />

          {/* RANGE */}
          <div className="mt-2 bg-gradient-to-r from-gray-50 to-emerald-50/30 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Range Indicator
              </span>
              <span className="text-sm font-bold text-emerald-600">
                {Math.round(energyKwh * 5)}–{Math.round(energyKwh * 7)} km
              </span>
            </div>

            <Progress
              value={(energyKwh / 150) * 100}
              className={`h-2 ${getProgressColor(energyKwh)}`}
            />
          </div>
        </div>

        <Separator className="bg-emerald-100" />

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
            <Timer className="text-emerald-600" />
            <div>
              <div className="text-xs text-gray-500">Time</div>
              <div className="font-bold text-gray-800">
                {formatTime(estimatedTimeMin)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
            <Leaf className="text-green-600" />
            <div>
              <div className="text-xs text-gray-500">CO₂ Saved</div>
              <div className="font-bold text-gray-800">{co2Saved} kg</div>
            </div>
          </div>
        </div>

        {/* PRICE */}
        <div className="bg-gradient-to-r from-emerald-100 to-green-100 p-4 rounded-xl flex justify-between items-center">
          <span className="text-sm text-gray-700">Estimated Cost</span>
          <span className="text-xl font-bold text-emerald-700">
            {totalPrice} ETB
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
