"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ChargingStation, ChargingPoint, Tariff } from "@/types/ev"

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
  const [batteryCapacity, setBatteryCapacity] = useState(75) // kWh

  const [calculation, setCalculation] = useState({
    energyRequired: 0,
    duration: 0,
    energyCost: 0,
    timeCost: 0,
    idleFee: 0,
    totalCost: 0,
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
    const duration = (energyRequired / selectedPoint.powerKw) * 60 // minutes

    const energyCost = energyRequired * parseFloat(activeTariff.pricePerKwh)
    const timeCost = activeTariff.pricePerMinute
      ? duration * parseFloat(activeTariff.pricePerMinute)
      : 0
    const idleFee = activeTariff.idleFeePerMinute
      ? 30 * parseFloat(activeTariff.idleFeePerMinute) // Assume 30 min idle
      : 0

    setCalculation({
      energyRequired,
      duration,
      energyCost,
      timeCost,
      idleFee,
      totalCost: energyCost + timeCost + idleFee,
    })
  }, [
    batteryPercent,
    targetPercent,
    batteryCapacity,
    selectedPoint,
    activeTariff,
  ])

  return (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl">
        <h3 className="font-semibold mb-4">Smart Cost Calculator</h3>

        <div className="space-y-4">
          <div>
            <Label>Current Battery: {batteryPercent}%</Label>
            <Slider
              value={[batteryPercent]}
              onValueChange={([v]) => setBatteryPercent(v)}
              min={0}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Target Battery: {targetPercent}%</Label>
            <Slider
              value={[targetPercent]}
              onValueChange={([v]) => setTargetPercent(v)}
              min={0}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="capacity">Battery Capacity (kWh)</Label>
            <Input
              id="capacity"
              type="number"
              value={batteryCapacity}
              onChange={(e) => setBatteryCapacity(Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 rounded-2xl bg-gray-50">
        <h3 className="font-semibold mb-4">Cost Breakdown</h3>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Energy Required:</span>
            <span className="font-medium">
              {calculation.energyRequired.toFixed(2)} kWh
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estimated Duration:</span>
            <span className="font-medium">
              {calculation.duration.toFixed(0)} min
            </span>
          </div>

          <div className="h-px bg-gray-200 my-2" />

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Energy Cost:</span>
            <span className="font-medium">
              {calculation.energyCost.toFixed(2)} {activeTariff?.currency}
            </span>
          </div>

          {calculation.timeCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time Cost:</span>
              <span className="font-medium">
                {calculation.timeCost.toFixed(2)} {activeTariff?.currency}
              </span>
            </div>
          )}

          {calculation.idleFee > 0 && (
            <div className="flex justify-between text-sm text-orange-600">
              <span>Idle Fee (30 min):</span>
              <span className="font-medium">
                {calculation.idleFee.toFixed(2)} {activeTariff?.currency}
              </span>
            </div>
          )}

          <div className="h-px bg-gray-200 my-2" />

          <div className="flex justify-between font-semibold">
            <span>Total Estimated Cost:</span>
            <span className="text-lg">
              {calculation.totalCost.toFixed(2)} {activeTariff?.currency}
            </span>
          </div>
        </div>
      </Card>

      {!selectedPoint && (
        <div className="text-sm text-gray-500 text-center p-4">
          Select a charging point to calculate costs
        </div>
      )}
    </div>
  )
}
