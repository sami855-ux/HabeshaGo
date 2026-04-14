"use client"

import React from "react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface Ticket {
  id: number
  seatNumber: number
  boardingStop: string
  alightingStop: string
}

interface JourneyTimelineProps {
  from: string
  to: string
  selectedTime: string
  midPoints?: string[]
  tickets?: Ticket[]
  trackingEnabled: boolean
  onTrackingChange: (enabled: boolean) => void
  onShare: () => void
}

const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  from,
  to,
  selectedTime,
  midPoints = [],
  tickets = [],
  trackingEnabled,
  onTrackingChange,
  onShare,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "current":
        return "bg-orange-500"
      default:
        return "bg-gray-300 dark:bg-gray-600"
    }
  }

  // Generate journey stops
  const generateJourneyStops = () => {
    const stops = [
      {
        location: from,
        time: selectedTime,
        status: "completed",
        address: "Main Terminal",
        platform: "A12",
        weather: "Sunny, 22°C",
        seats: tickets
          .filter(
            (t) => t.boardingStop === "Point 1" || t.boardingStop === from,
          )
          .map((t) => t.seatNumber),
      },
    ]

    // Get unique stops from tickets if available
    if (tickets.length > 0) {
      const boardingStops = [...new Set(tickets.map((t) => t.boardingStop))]
      const alightingStops = [...new Set(tickets.map((t) => t.alightingStop))]
      const uniqueStops = [
        ...new Set([...boardingStops, ...alightingStops]),
      ].filter((stop) => stop !== from && stop !== to)

      uniqueStops.forEach((point, index) => {
        if (point !== from && point !== to) {
          const date = new Date()
          const [hours, minutes] = selectedTime
            .match(/(\d+):(\d+)/)
            ?.slice(1)
            .map(Number) || [8, 0]
          date.setHours(hours, minutes)
          date.setMinutes(date.getMinutes() + (index + 1) * 90)

          stops.push({
            location: point,
            time: format(date, "hh:mm a"),
            status: index === 0 ? "current" : "upcoming",
            address: `${point} Station`,
            platform: `B${index + 2}`,
            weather: "Clear, 23°C",
            seats: tickets
              .filter(
                (t) => t.boardingStop === point || t.alightingStop === point,
              )
              .map((t) => t.seatNumber),
          })
        }
      })
    } else {
      // Add mid points from route if no tickets
      midPoints.forEach((point, index) => {
        const date = new Date()
        const [hours, minutes] = selectedTime
          .match(/(\d+):(\d+)/)
          ?.slice(1)
          .map(Number) || [8, 0]
        date.setHours(hours, minutes)
        date.setMinutes(date.getMinutes() + (index + 1) * 90)

        stops.push({
          location: point,
          time: format(date, "hh:mm a"),
          status: index === 0 ? "current" : "upcoming",
          address: `${point} Station`,
          platform: `B${index + 2}`,
          weather: "Clear, 23°C",
          seats: [],
        })
      })
    }

    // Add destination
    const date = new Date()
    const [hours, minutes] = selectedTime
      .match(/(\d+):(\d+)/)
      ?.slice(1)
      .map(Number) || [8, 0]
    date.setHours(hours, minutes)
    const stopsCount =
      tickets.length > 0
        ? [...new Set(tickets.map((t) => t.boardingStop))].length
        : midPoints.length
    date.setMinutes(date.getMinutes() + (stopsCount + 1) * 90)

    stops.push({
      location: to,
      time: format(date, "hh:mm a"),
      status: "upcoming",
      address: `${to} Bus Station`,
      platform: "D1",
      weather: "Sunny, 24°C",
      seats:
        tickets
          ?.filter(
            (t) => t.alightingStop === "Point 5" || t.alightingStop === to,
          )
          .map((t) => t.seatNumber) || [],
    })

    return stops
  }

  const journeyStops = generateJourneyStops()

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-xl p-8">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-orange-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Journey Timeline
      </h3>

      <div className="space-y-6">
        {journeyStops.map((stop, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative flex gap-6"
          >
            <div className="relative">
              <motion.div
                className={cn(
                  "w-4 h-4 rounded-full border-4 border-white dark:border-gray-900",
                  getStatusColor(stop.status),
                )}
                animate={
                  stop.status === "current" ? { scale: [1, 1.3, 1] } : {}
                }
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              {i < journeyStops.length - 1 && (
                <div className="absolute top-4 left-2 w-0.5 h-16 bg-gray-200 dark:bg-gray-700" />
              )}
            </div>

            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-lg">{stop.location}</h4>
                    {stop.status === "current" && (
                      <Badge className="bg-orange-500 text-white border-0 animate-pulse">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        In Progress
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{stop.time}</p>
                  <p className="text-xs text-gray-400 mt-1">{stop.address}</p>
                  {stop.seats && stop.seats.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {stop.seats.map((seat) => (
                        <Badge
                          key={seat}
                          variant="secondary"
                          className="text-xs"
                        >
                          Seat {seat}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    {stop.platform}
                  </Badge>
                  <p className="text-xs text-gray-400">{stop.weather}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live Tracking */}
      <div className="mt-8 p-6 bg-orange-50 dark:bg-orange-950/30 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-medium">Live Tracking</span>
          </div>
          <Switch
            checked={trackingEnabled}
            onCheckedChange={onTrackingChange}
          />
        </div>

        {trackingEnabled && (
          <div className="space-y-3">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "65%" }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>Bus is moving</span>
              <span className="font-medium">
                Next stop:{" "}
                {journeyStops.find((s) => s.status === "current")?.location ||
                  from}{" "}
                (15 min)
              </span>
            </div>
          </div>
        )}
      </div>

      <Button variant="outline" className="w-full mt-6 gap-2" onClick={onShare}>
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        Share Journey
      </Button>
    </Card>
  )
}

export default JourneyTimeline
