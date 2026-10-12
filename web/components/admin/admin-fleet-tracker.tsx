"use client"

import * as React from "react"
import {
  Car,
  Bus,
  Zap,
  Radio,
  BatteryCharging,
  Gauge,
  Users,
  Search,
  Phone,
  CheckCircle2,
  AlertTriangle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export interface FleetVehicle {
  id: string
  driver: string
  plate: string
  category: "Minibus" | "EV Taxi" | "Intercity Bus"
  location: string
  speedKmH: number
  fuelOrBattery: number
  passengerLoad: string
  status: "En Route" | "Charging" | "Idle" | "Surge Standby"
}

const FLEET_DATA: FleetVehicle[] = [
  {
    id: "VH-101",
    driver: "Abebe Kebede",
    plate: "AA-3-94281",
    category: "Minibus",
    location: "Bole Road (Olympia)",
    speedKmH: 38,
    fuelOrBattery: 85,
    passengerLoad: "12 / 14 seats",
    status: "En Route",
  },
  {
    id: "VH-102",
    driver: "Tewodros G.",
    plate: "AA-EV-092",
    category: "EV Taxi",
    location: "Meskel Square Station",
    speedKmH: 44,
    fuelOrBattery: 92,
    passengerLoad: "3 / 4 seats",
    status: "En Route",
  },
  {
    id: "VH-103",
    driver: "Ermias Haile",
    plate: "AA-2-41902",
    category: "EV Taxi",
    location: "CMC Hub Fast Charger #2",
    speedKmH: 0,
    fuelOrBattery: 34,
    passengerLoad: "0 / 4 seats",
    status: "Charging",
  },
  {
    id: "VH-104",
    driver: "Mulugeta T.",
    plate: "AA-3-71829",
    category: "Minibus",
    location: "Megenagna Roundabout",
    speedKmH: 22,
    fuelOrBattery: 78,
    passengerLoad: "14 / 14 seats",
    status: "En Route",
  },
  {
    id: "VH-105",
    driver: "Kassahun W.",
    plate: "ET-BUS-402",
    category: "Intercity Bus",
    location: "Kality Toll Plaza (Adama Expressway)",
    speedKmH: 78,
    fuelOrBattery: 90,
    passengerLoad: "42 / 45 seats",
    status: "En Route",
  },
  {
    id: "VH-106",
    driver: "Dawit Zewdu",
    plate: "AA-3-51092",
    category: "Minibus",
    location: "Piassa Cathedral Terminal",
    speedKmH: 0,
    fuelOrBattery: 65,
    passengerLoad: "0 / 14 seats",
    status: "Surge Standby",
  },
]

export function AdminFleetTracker() {
  const [search, setSearch] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("All")

  const filtered = FLEET_DATA.filter((v) => {
    const matchesSearch =
      v.driver.toLowerCase().includes(search.toLowerCase()) ||
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === "All" || v.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5 font-inter">
      {/* Header with Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Live Fleet Telemetry & Monitoring
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time GPS tracking, battery/fuel levels, and passenger load for active units
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="group flex items-center w-52 sm:w-64 h-9 rounded-lg bg-slate-100/75 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/90 text-slate-400 ring-1 ring-slate-900/10 dark:ring-white/10 hover:ring-slate-300 dark:hover:ring-white/20 focus-within:ring-2 focus-within:ring-orange-500 dark:focus-within:ring-orange-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all shadow-xs px-2.5 gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search driver, plate, station..."
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1">
            {["All", "Minibus", "EV Taxi", "Intercity Bus"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  categoryFilter === cat
                    ? "bg-orange-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v) => (
          <div
            key={v.id}
            className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-orange-500/50 transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 font-bold text-sm">
                  {v.category === "Minibus" ? "🚐" : v.category === "EV Taxi" ? "⚡" : "🚌"}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {v.driver}
                  </h4>
                  <div className="text-[11px] font-mono text-slate-500 font-semibold">
                    {v.plate}
                  </div>
                </div>
              </div>

              <Badge
                variant={
                  v.status === "En Route"
                    ? "success"
                    : v.status === "Charging"
                    ? "warning"
                    : "secondary"
                }
                className="text-[10px] py-0.5"
              >
                {v.status}
              </Badge>
            </div>

            <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Station:</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[170px]">
                  {v.location}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Velocity:</span>
                <span className="font-semibold">{v.speedKmH} km/h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Passenger Load:</span>
                <span className="font-semibold text-orange-600">{v.passengerLoad}</span>
              </div>
            </div>

            {/* Fuel / Battery Bar */}
            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                  {v.category === "EV Taxi" ? "Battery Level" : "Fuel Level"}
                </span>
                <span className="font-bold">{v.fuelOrBattery}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    v.fuelOrBattery > 50
                      ? "bg-emerald-500"
                      : v.fuelOrBattery > 20
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${v.fuelOrBattery}%` }}
                />
              </div>
            </div>

            {/* Quick Ping Driver */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Telemetry: Latency 14ms</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info(`Radio dispatch signal sent to ${v.driver} (${v.plate})`)}
                className="text-xs h-8 px-2.5"
              >
                Ping Driver
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
