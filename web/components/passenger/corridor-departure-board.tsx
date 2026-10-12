"use client"

import * as React from "react"
import {
  Bus,
  Clock,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export interface CorridorRoute {
  id: string
  lineName: string
  from: string
  to: string
  nextDepartureMinutes: number
  frequencyMinutes: number
  availableSeats: number
  totalSeats: number
  fareETB: number
  status: "On Time" | "Departing Soon" | "Filling Fast"
  color: string
}

const CORRIDOR_ROUTES: CorridorRoute[] = [
  {
    id: "route-1",
    lineName: "Line C1 • Bole Express",
    from: "Bole Medhanealem",
    to: "Megenagna Hub",
    nextDepartureMinutes: 3,
    frequencyMinutes: 5,
    availableSeats: 4,
    totalSeats: 14,
    fareETB: 25,
    status: "Departing Soon",
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "route-2",
    lineName: "Line C2 • Heritage Line",
    from: "Piassa (Churchill)",
    to: "Mexico Square",
    nextDepartureMinutes: 6,
    frequencyMinutes: 7,
    availableSeats: 8,
    totalSeats: 14,
    fareETB: 20,
    status: "On Time",
    color: "from-sky-500 to-blue-600",
  },
  {
    id: "route-3",
    lineName: "Line C3 • East Commuter",
    from: "CMC Michael",
    to: "Stadium Central",
    nextDepartureMinutes: 8,
    frequencyMinutes: 10,
    availableSeats: 11,
    totalSeats: 14,
    fareETB: 35,
    status: "On Time",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "route-4",
    lineName: "Line C4 • Diplomatic Corridor",
    from: "Bole Int'l Airport",
    to: "Sarbet / AU Headquarters",
    nextDepartureMinutes: 11,
    frequencyMinutes: 15,
    availableSeats: 2,
    totalSeats: 14,
    fareETB: 30,
    status: "Filling Fast",
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: "route-5",
    lineName: "Line C5 • Ring Road Shuttle",
    from: "Tor Hailoch",
    to: "Kality Interchange",
    nextDepartureMinutes: 14,
    frequencyMinutes: 12,
    availableSeats: 7,
    totalSeats: 14,
    fareETB: 40,
    status: "On Time",
    color: "from-rose-500 to-pink-600",
  },
]

interface CorridorDepartureBoardProps {
  onSelectRoute: (route: CorridorRoute) => void
}

export function CorridorDepartureBoard({ onSelectRoute }: CorridorDepartureBoardProps) {
  const [query, setQuery] = React.useState("")

  const filteredRoutes = CORRIDOR_ROUTES.filter((r) =>
    r.from.toLowerCase().includes(query.toLowerCase()) ||
    r.to.toLowerCase().includes(query.toLowerCase()) ||
    r.lineName.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div id="corridor-routes" className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xl space-y-5 font-inter">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600">
              <Bus className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Corridor Minibus Live Departure Board
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time frequent shuttle departures across Addis Ababa arterial transit lanes
          </p>
        </div>

        <div className="group flex items-center w-full sm:w-64 h-9 rounded-lg bg-slate-100/75 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/90 text-slate-400 ring-1 ring-slate-900/10 dark:ring-white/10 hover:ring-slate-300 dark:hover:ring-white/20 focus-within:ring-2 focus-within:ring-orange-500 dark:focus-within:ring-orange-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all shadow-xs px-2.5 gap-2">
          <Search className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search route or station..."
            className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Routes List (Citymapper Style) */}
      <div className="space-y-3">
        {filteredRoutes.map((route) => (
          <div
            key={route.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-orange-500/50 hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-950/40 group"
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`size-10 rounded-xl bg-gradient-to-br ${route.color} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}
              >
                {route.lineName.split("•")[0].replace("Line ", "")}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {route.from} → {route.to}
                  </h4>
                  <Badge
                    variant={
                      route.status === "Departing Soon"
                        ? "destructive"
                        : route.status === "Filling Fast"
                        ? "warning"
                        : "success"
                    }
                    className="text-[10px] py-0 px-2 font-semibold"
                  >
                    {route.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="flex items-center gap-1 font-semibold text-orange-600 dark:text-orange-400">
                    <Clock className="w-3.5 h-3.5" />
                    Departs in {route.nextDepartureMinutes} mins
                  </span>
                  <span>•</span>
                  <span>Every {route.frequencyMinutes}m</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5" />
                    {route.availableSeats} of {route.totalSeats} seats open
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
              <div className="text-left sm:text-right">
                <div className="text-xs text-slate-400">Fixed Fare</div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                  {route.fareETB} ETB
                </div>
              </div>

              <Button
                onClick={() => onSelectRoute(route)}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-xl shadow-xs gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Reserve Seat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
