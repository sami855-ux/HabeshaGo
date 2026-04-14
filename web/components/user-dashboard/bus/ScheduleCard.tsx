"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  Plus,
  X,
  Timer,
  Play,
  Pause,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sun,
  AlertTriangle,
  Route as RouteIcon,
  AlertCircle,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  EthiopianTimeUtils,
  ethiopianTimeSlots,
} from "@/lib/EthiopianTimeUtils"
import { BusSchedule, Route } from "@/types/bus-create"

interface NextDepartureInfo {
  western: string | null
  ethiopian: string | null
  hasNext: boolean
  warning?: string | null
  gapMinutes?: number
  requiredGap?: number
}

interface ScheduleCardProps {
  selectedRoute: Route | null
  schedules: BusSchedule[]
  activeSchedules: number
  totalSchedules: number
  onAddSchedule: () => void
  onAddScheduleAtTime: (hour: number, period: "ጠዋት" | "ከሰዓት") => void
  onToggleActive: (index: number) => void
  onRemoveSchedule: (index: number) => void
  onToggleAll: (active: boolean) => void
  onClearAll: () => void
  onOpenIntervalModal: (index: number) => void
  calculateNextDeparture: (
    currentSchedule: BusSchedule,
    allSchedules: BusSchedule[],
    route: Route,
  ) => NextDepartureInfo
  calculateEndTime: (startTime: string, duration: number) => string
}

export function ScheduleCard({
  selectedRoute,
  schedules,
  activeSchedules,
  totalSchedules,
  onAddSchedule,
  onAddScheduleAtTime,
  onToggleActive,
  onRemoveSchedule,
  onToggleAll,
  onClearAll,
  onOpenIntervalModal,
  calculateNextDeparture,
  calculateEndTime,
}: ScheduleCardProps) {
  const sortedSchedules = [...schedules].sort((a, b) => {
    const [hourA, minuteA] = a.startTime.split(":").map(Number)
    const [hourB, minuteB] = b.startTime.split(":").map(Number)
    return hourA * 60 + minuteA - (hourB * 60 + minuteB)
  })

  // Calculate the gap between current schedule's end and next schedule's start
  const getGapInfo = (
    currentSchedule: BusSchedule,
    nextSchedule: BusSchedule,
  ) => {
    const [currentEndHour, currentEndMinute] = currentSchedule.endTime
      ?.split(":")
      .map(Number) || [0, 0]
    const [nextStartHour, nextStartMinute] = nextSchedule.startTime
      .split(":")
      .map(Number)

    const currentEndTotal = currentEndHour * 60 + currentEndMinute
    const nextStartTotal = nextStartHour * 60 + nextStartMinute
    const gapMinutes = nextStartTotal - currentEndTotal

    const requiredGap = currentSchedule.intervalAfter || 45

    if (gapMinutes < requiredGap) {
      return {
        isInsufficient: true,
        gapMinutes,
        requiredGap,
        shortfall: requiredGap - gapMinutes,
        message: `⚠️ Only ${gapMinutes} min gap (needs ${requiredGap} min) • Short by ${requiredGap - gapMinutes} min`,
      }
    }

    return {
      isInsufficient: false,
      gapMinutes,
      requiredGap,
      message: `✓ ${gapMinutes} min gap (meets ${requiredGap} min requirement)`,
    }
  }

  return (
    <>
      {/* Schedule Header */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              Ethiopian Time Schedule
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Operation hours: 12:00 - 4:00 ጠዋት | Minimum 45 min gap between
              trips
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {schedules.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Scheduled Trips
            </div>
          </div>
        </div>
      </div>

      {/* Route Selection Warning */}
      {!selectedRoute ? (
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Select a Route First
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please select a route from the sidebar to enable schedule
                creation.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RouteIcon className="h-5 w-5 text-emerald-500" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {selectedRoute.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Trip Duration: {selectedRoute.estimatedTimeMin} minutes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-white/50 dark:bg-gray-900/50"
              >
                {selectedRoute.estimatedTimeMin} min trip
              </Badge>
              <Button
                onClick={onAddSchedule}
                size="sm"
                className="gap-1 bg-gradient-to-r from-emerald-500 to-green-400"
              >
                <Plus className="h-3 w-3" />
                Add Trip
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ethiopian Time Slots */}
      {selectedRoute && (
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="h-4 w-4 text-amber-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Ethiopian Time Slots (12:00 - 4:00 ጠዋት)
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {ethiopianTimeSlots.map((slot) => (
              <Button
                key={`${slot.hour}-${slot.period}`}
                onClick={() => onAddScheduleAtTime(slot.hour, slot.period)}
                variant="outline"
                size="sm"
                className="h-12 flex flex-col items-center justify-center"
              >
                <span className="font-medium text-base">{slot.label}</span>
                <span className="text-xs text-gray-500">
                  {slot.westernTime}
                </span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            * Ethiopian time: 12:00 ጠዋት = 6:00 AM Western time
          </p>
        </div>
      )}

      {/* Schedule Actions */}
      {schedules.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active
              </div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {activeSchedules}
              </div>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {totalSchedules}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleAll(true)}
              className="gap-1"
            >
              <Play className="h-3 w-3" />
              Activate All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleAll(false)}
              className="gap-1"
            >
              <Pause className="h-3 w-3" />
              Deactivate All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="gap-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Schedule List */}
      {schedules.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Scheduled Trips (Ethiopian Time)
            </h4>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Min interval: 45 minutes between trips
            </div>
          </div>

          <div className="space-y-3">
            {sortedSchedules.map((schedule, index) => {
              const [hour, minute] = schedule.startTime.split(":").map(Number)
              const period = hour >= 12 ? "PM" : "AM"
              const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
              const nextDeparture = selectedRoute
                ? calculateNextDeparture(schedule, schedules, selectedRoute)
                : {
                    western: null,
                    ethiopian: null,
                    hasNext: false,
                    warning: null,
                  }

              // Check gap with next schedule
              let gapInfo = null
              if (index + 1 < sortedSchedules.length) {
                gapInfo = getGapInfo(schedule, sortedSchedules[index + 1])
              }

              return (
                <div
                  key={index}
                  className={cn(
                    "group relative p-4 rounded-xl border transition-all hover:shadow-sm",
                    schedule.isActive
                      ? "border-emerald-200 dark:border-emerald-900 bg-gradient-to-r from-emerald-50/30 to-green-50/30 dark:from-emerald-950/10 dark:to-green-950/10"
                      : "border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50/30 to-gray-50/30 dark:from-slate-950/10 dark:to-gray-950/10",
                    gapInfo?.isInsufficient &&
                      "border-red-300 dark:border-red-800",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          schedule.direction === "FORWARD"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-orange-500/10 text-orange-600 dark:text-orange-400",
                        )}
                      >
                        {schedule.direction === "FORWARD" ? (
                          <ArrowRight className="h-4 w-4" />
                        ) : (
                          <ArrowLeft className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          <span className="text-lg">
                            {schedule.ethiopianTime}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({displayHour}:{String(minute).padStart(2, "0")}{" "}
                            {period} - {schedule.endTime})
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Ends at: {schedule.endEthiopianTime} • Direction:{" "}
                          {schedule.direction} • Interval:{" "}
                          {schedule.intervalAfter || 45} min
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenIntervalModal(index)}
                        className="gap-1"
                      >
                        <Timer className="h-3 w-3" />
                        Interval: {schedule.intervalAfter || 45}min
                      </Button>

                      <Switch
                        checked={schedule.isActive}
                        onCheckedChange={() => onToggleActive(index)}
                        size="sm"
                        className="data-[state=checked]:bg-emerald-500"
                      />
                      <button
                        onClick={() => onRemoveSchedule(index)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Gap Warning */}
                  {gapInfo && gapInfo.isInsufficient && (
                    <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600 dark:text-red-400">
                          {gapInfo.message}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Gap Info for valid gaps */}
                  {gapInfo && !gapInfo.isInsufficient && (
                    <div className="mt-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 text-sm">
                        <Info className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400">
                          {gapInfo.message}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3 text-blue-500 flex-shrink-0" />
                      <div className="flex-1">
                        {nextDeparture.hasNext ? (
                          <>
                            <span
                              className={cn(
                                "text-gray-600 dark:text-gray-400",
                                nextDeparture.warning &&
                                  "text-amber-600 dark:text-amber-400",
                              )}
                            >
                              Next departure: {nextDeparture.ethiopian} (
                              {nextDeparture.western} Western)
                            </span>
                            {nextDeparture.warning && (
                              <span className="text-xs text-red-500 block mt-1">
                                {nextDeparture.warning}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 italic">
                            No next schedule scheduled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-400/10 flex items-center justify-center">
            <Sun className="h-8 w-8 text-amber-500" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            No schedules yet
          </h4>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            {selectedRoute
              ? `Click "Add Trip" or select an Ethiopian time slot to create your first schedule`
              : "Select a route from the sidebar to enable schedule creation"}
          </p>
          {selectedRoute && (
            <Button
              onClick={onAddSchedule}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-green-400"
            >
              <Plus className="h-4 w-4" />
              Add First Trip at 12:00 ጠዋት
            </Button>
          )}
        </div>
      )}
    </>
  )
}
