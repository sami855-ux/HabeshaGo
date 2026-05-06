"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle, Car, Zap, Users } from "lucide-react"

interface ParkingSlot {
  id: string
  slotNumber: string
  slotType: "CAR" | "MOTORCYCLE" | "DISABLED" | "EV"
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE"
  isEV: boolean
  hasCharger: boolean
  floor?: number
  section?: string
  priceMultiplier?: number
}

interface ParkingSlotsGridProps {
  slots: ParkingSlot[]
  selectedSlotId: string | null
  onSelectSlot: (slot: ParkingSlot) => void
}

export function ParkingSlotsGrid({
  slots,
  selectedSlotId,
  onSelectSlot,
}: ParkingSlotsGridProps) {
  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "border-green-200 bg-green-50 hover:border-green-400 hover:shadow-md"
      case "OCCUPIED":
        return "border-red-200 bg-red-50 opacity-60 cursor-not-allowed"
      case "RESERVED":
        return "border-yellow-200 bg-yellow-50 opacity-60 cursor-not-allowed"
      case "MAINTENANCE":
        return "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
      default:
        return "border-gray-200 bg-white"
    }
  }

  const getSlotStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Available"
      case "OCCUPIED":
        return "Occupied"
      case "RESERVED":
        return "Reserved"
      case "MAINTENANCE":
        return "Maintenance"
      default:
        return status
    }
  }

  const getSlotTypeIcon = (slot: ParkingSlot) => {
    if (slot.isEV) return <Zap className="w-3.5 h-3.5 text-purple-600" />
    if (slot.slotType === "DISABLED")
      return <Users className="w-3.5 h-3.5 text-blue-600" />
    return <Car className="w-3.5 h-3.5 text-gray-600" />
  }

  const floors = [...new Set(slots.map((s) => s.floor).filter(Boolean))].sort()

  return (
    <div className="space-y-6">
      {floors.map((floor) => (
        <div key={floor} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <span className="text-white text-sm font-bold">{floor}</span>
            </div>
            <h3 className="font-semibold text-gray-700">Floor {floor}</h3>
            <Badge variant="outline" className="text-xs">
              {
                slots.filter(
                  (s) => s.floor === floor && s.status === "AVAILABLE",
                ).length
              }{" "}
              available
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {slots
              .filter((slot) => slot.floor === floor)
              .map((slot, idx) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  whileHover={{ scale: slot.status === "AVAILABLE" ? 1.02 : 1 }}
                  className={cn(
                    "relative border-2 rounded-xl p-3 transition-all cursor-pointer",
                    getSlotStatusColor(slot.status),
                    selectedSlotId === slot.id &&
                      "ring-2 ring-blue-500  border-blue-500",
                  )}
                  onClick={() =>
                    slot.status === "AVAILABLE" && onSelectSlot(slot)
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-800 text-sm">
                      {slot.slotNumber}
                    </span>
                    {slot.priceMultiplier && slot.priceMultiplier > 1 && (
                      <Badge className="text-[10px] bg-purple-100 text-purple-700">
                        Premium
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {getSlotTypeIcon(slot)}
                    <span className="text-xs text-gray-500">
                      {slot.slotType === "DISABLED"
                        ? "Disabled"
                        : slot.slotType}
                    </span>
                  </div>

                  <div className="mt-2">
                    <Badge
                      className={cn(
                        "text-[12px] w-full justify-center",
                        slot.status === "AVAILABLE" &&
                          "bg-green-100 text-green-700",
                        slot.status === "OCCUPIED" && "bg-red-100 text-red-700",
                        slot.status === "RESERVED" &&
                          "bg-yellow-100 text-yellow-700",
                        slot.status === "MAINTENANCE" &&
                          "bg-gray-100 text-gray-700",
                      )}
                    >
                      {getSlotStatusText(slot.status)}
                    </Badge>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
