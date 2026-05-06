"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

interface TimeSlot {
  id: string
  startTime: Date
  endTime: Date
  isAvailable: boolean
}

interface TimeSlotPickerProps {
  onTimeSlotSelect: (slot: TimeSlot) => void
  selectedTimeSlot: TimeSlot | null
  durationHours: number
  setDurationHours: (hours: number) => void
}

export function TimeSlotPicker({
  onTimeSlotSelect,
  selectedTimeSlot,
  durationHours,
  setDurationHours,
}: TimeSlotPickerProps) {
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const now = new Date()
    now.setMinutes(0, 0, 0)

    for (let i = 0; i < 24; i++) {
      const startTime = new Date(now.getTime() + i * 60 * 60000)
      const endTime = new Date(startTime.getTime() + durationHours * 60 * 60000)
      const isAvailable = Math.random() > 0.3

      slots.push({
        id: `slot_${i}`,
        startTime,
        endTime,
        isAvailable,
      })
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-gray-800">
          <Clock className="h-4 w-4 text-blue-600" />
          Select Parking Duration & Time
        </CardTitle>
        <CardDescription>
          Choose how long you want to park and when
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 6, 8, 12, 24].map((hours) => (
            <Button
              key={hours}
              variant={durationHours === hours ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-full",
                durationHours === hours &&
                  "bg-gradient-to-r from-blue-600 to-indigo-600",
              )}
              onClick={() => setDurationHours(hours)}
            >
              {hours}h
            </Button>
          ))}
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Available Time Slots
            </span>
            <span className="text-xs text-gray-500">Today</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
            {timeSlots.map((slot) => (
              <motion.button
                key={slot.id}
                whileHover={{ scale: slot.isAvailable ? 1.02 : 1 }}
                whileTap={{ scale: slot.isAvailable ? 0.98 : 1 }}
                className={cn(
                  "p-2 rounded-lg border text-sm transition-all",
                  selectedTimeSlot?.id === slot.id
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                    : slot.isAvailable
                      ? "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer"
                      : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed",
                )}
                onClick={() => slot.isAvailable && onTimeSlotSelect(slot)}
                disabled={!slot.isAvailable}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs font-mono">
                    {formatTime(slot.startTime)}
                  </span>
                  <span className="text-[10px] text-gray-400">→</span>
                  <span className="text-xs font-mono">
                    {formatTime(slot.endTime)}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
