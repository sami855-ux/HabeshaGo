"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Clock, Timer } from "lucide-react"
import { Tariff } from "@/types/ev"

interface TariffSectionProps {
  tariffs: Tariff[]
}

export function TariffSection({ tariffs }: TariffSectionProps) {
  // Find current active tariff
  const activeTariff =
    tariffs.find((t) => {
      const now = new Date()
      const validFrom = new Date(t.validFrom)
      const validTo = t.validTo ? new Date(t.validTo) : null
      return validFrom <= now && (!validTo || validTo >= now)
    }) || tariffs[0]

  if (!activeTariff) {
    return (
      <Card className="p-5 rounded-2xl">
        <p className="text-sm text-gray-500 text-center">
          No tariff information available
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-5 rounded-2xl">
      <h3 className="font-semibold mb-4">Current Tariff</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-blue-600 mb-1">
              <DollarSign className="w-4 h-4" />
              Energy
            </div>
            <div className="text-lg font-semibold text-blue-700">
              {activeTariff.pricePerKwh} {activeTariff.currency}/kWh
            </div>
          </div>

          {activeTariff.pricePerMinute && (
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                Time
              </div>
              <div className="text-lg font-semibold">
                {activeTariff.pricePerMinute} {activeTariff.currency}/min
              </div>
            </div>
          )}
        </div>

        {activeTariff.idleFeePerMinute && (
          <div className="bg-orange-50 p-3 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-orange-600 mb-1">
              <Timer className="w-4 h-4" />
              Idle Fee
            </div>
            <div className="text-lg font-semibold text-orange-700">
              {activeTariff.idleFeePerMinute} {activeTariff.currency}/min
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Applies after charging completes
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Valid from {new Date(activeTariff.validFrom).toLocaleDateString()}
          {activeTariff.validTo &&
            ` to ${new Date(activeTariff.validTo).toLocaleDateString()}`}
        </div>

        {tariffs.length > 1 && (
          <Badge variant="outline" className="w-full justify-center py-1">
            {tariffs.length - 1} other tariff{tariffs.length > 2 ? "s" : ""}{" "}
            available
          </Badge>
        )}
      </div>
    </Card>
  )
}
