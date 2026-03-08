"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap, Clock, DollarSign, StopCircle } from "lucide-react"
import {
  ChargingStation,
  ChargingPoint,
  Tariff,
  SessionStatus,
} from "@/types/ev"

interface ChargingSessionSimulationProps {
  station: ChargingStation
  chargingPoint: ChargingPoint
}

interface Session {
  id: number
  status: SessionStatus
  startTime: string
  energyConsumedKwh: number
  durationMinutes: number
  totalCost: number
}

export function ChargingSessionSimulation({
  station,
  chargingPoint,
}: ChargingSessionSimulationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [isCharging, setIsCharging] = useState(false)

  const activeTariff =
    station.tariffs.find((t) => {
      const now = new Date()
      const validFrom = new Date(t.validFrom)
      const validTo = t.validTo ? new Date(t.validTo) : null
      return validFrom <= now && (!validTo || validTo >= now)
    }) || station.tariffs[0]

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isCharging && session) {
      interval = setInterval(() => {
        setSession((prev) => {
          if (!prev) return prev

          // Simulate charging at 0.5 kWh every 2 seconds
          const newEnergy = prev.energyConsumedKwh + 0.5
          const newDuration = prev.durationMinutes + 2 / 60 // 2 seconds in minutes

          // Calculate costs
          const energyCost = newEnergy * parseFloat(activeTariff.pricePerKwh)
          const timeCost = activeTariff.pricePerMinute
            ? newDuration * parseFloat(activeTariff.pricePerMinute)
            : 0

          return {
            ...prev,
            energyConsumedKwh: newEnergy,
            durationMinutes: newDuration,
            totalCost: energyCost + timeCost,
          }
        })
      }, 2000)
    }

    return () => clearInterval(interval)
  }, [isCharging, activeTariff])

  const startSession = () => {
    const newSession: Session = {
      id: Date.now(),
      status: "ACTIVE",
      startTime: new Date().toISOString(),
      energyConsumedKwh: 0,
      durationMinutes: 0,
      totalCost: 0,
    }
    setSession(newSession)
    setIsCharging(true)
    setIsOpen(true)
  }

  const stopSession = () => {
    setIsCharging(false)
    setSession((prev) => (prev ? { ...prev, status: "COMPLETED" } : null))
  }

  const closeDialog = () => {
    setIsOpen(false)
    setSession(null)
    setIsCharging(false)
  }

  return (
    <>
      <Button
        onClick={startSession}
        className="w-full rounded-xl bg-green-600 hover:bg-green-700"
      >
        <Zap className="w-4 h-4 mr-2" />
        Start Charging
      </Button>

      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Charging Session
              <Badge variant={isCharging ? "default" : "secondary"}>
                {session?.status}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {station.name} • Slot {chargingPoint.slotNumber}
            </DialogDescription>
          </DialogHeader>

          {session && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Zap className="w-4 h-4" />
                    Energy
                  </div>
                  <div className="text-xl font-semibold">
                    {session.energyConsumedKwh.toFixed(2)} kWh
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    Duration
                  </div>
                  <div className="text-xl font-semibold">
                    {session.durationMinutes.toFixed(1)} min
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-blue-600 mb-1">
                  <DollarSign className="w-4 h-4" />
                  Current Cost
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {session.totalCost.toFixed(2)} {activeTariff?.currency}
                </div>
              </div>

              <Progress
                value={Math.min((session.energyConsumedKwh / 50) * 100, 100)}
                className="h-2"
              />

              {isCharging ? (
                <Button
                  onClick={stopSession}
                  variant="destructive"
                  className="w-full rounded-xl"
                >
                  <StopCircle className="w-4 h-4 mr-2" />
                  Stop Charging
                </Button>
              ) : (
                <div className="text-center text-sm text-gray-500">
                  Session completed • Final cost: {session.totalCost.toFixed(2)}{" "}
                  {activeTariff?.currency}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
