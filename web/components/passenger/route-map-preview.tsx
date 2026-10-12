"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  MapPin,
  Navigation2,
  Layers,
  Maximize2,
  Compass,
  AlertTriangle,
  Radio,
  Flame
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface RouteMapPreviewProps {
  origin: string
  destination: string
  vehicleType?: string
}

export function RouteMapPreview({
  origin,
  destination,
  vehicleType = "Toyota HiAce Minibus",
}: RouteMapPreviewProps) {
  const [trafficActive, setTrafficActive] = React.useState(true)
  const [viewMode, setViewMode] = React.useState<"standard" | "satellite">("standard")

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl bg-slate-900 font-inter">
      {/* Map Background with stylised SVG roads */}
      <div className="absolute inset-0 bg-[#0f172a] overflow-hidden">
        {/* Subtle grid and contour lines */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
            backgroundSize: "40px 40px, 80px 80px, 80px 80px",
          }}
        />

        {/* SVG stylized road network of Addis Ababa (Bole - Meskel - Piassa) */}
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Secondary streets */}
          <path
            d="M 50,300 C 200,320 300,150 450,220 C 600,290 750,200 850,250"
            stroke="#1e293b"
            strokeWidth="12"
            fill="none"
          />
          <path
            d="M 200,50 C 220,200 350,350 420,550"
            stroke="#1e293b"
            strokeWidth="10"
            fill="none"
          />
          <path
            d="M 650,50 C 600,200 500,400 450,580"
            stroke="#1e293b"
            strokeWidth="8"
            fill="none"
          />

          {/* Bole Road / Africa Avenue - Main Arterial Highway */}
          <path
            id="main-corridor"
            d="M 160,480 C 280,420 360,340 460,260 C 560,180 640,150 720,130"
            stroke="#334155"
            strokeWidth="20"
            fill="none"
            strokeLinecap="round"
          />

          {/* Traffic flow layer */}
          {trafficActive && (
            <path
              d="M 160,480 C 280,420 360,340 460,260 C 560,180 640,150 720,130"
              stroke="#10b981"
              strokeWidth="6"
              strokeDasharray="16,8"
              fill="none"
              strokeLinecap="round"
              className="animate-pulse"
            />
          )}

          {/* Active Navigation Path (Glowing Orange Gradient) */}
          <path
            d="M 200,450 C 290,400 380,330 460,260 C 520,210 590,170 650,150"
            stroke="#f97316"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            className="filter drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]"
          />

          {/* Intersecting landmark rings */}
          <circle cx="200" cy="450" r="16" fill="rgba(16, 185, 129, 0.2)" />
          <circle cx="200" cy="450" r="7" fill="#10b981" />

          <circle cx="650" cy="150" r="18" fill="rgba(249, 115, 22, 0.2)" />
          <circle cx="650" cy="150" r="8" fill="#f97316" />

          {/* Waypoint (e.g. Olympia / Meskel interchange) */}
          <circle cx="460" cy="260" r="5" fill="#94a3b8" />
        </svg>

        {/* Animated Moving Vehicle marker along path */}
        <motion.div
          className="absolute z-20 flex items-center justify-center"
          initial={{ left: "26%", top: "72%" }}
          animate={{
            left: ["26%", "42%", "58%", "78%"],
            top: ["72%", "56%", "42%", "26%"],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute -inset-2 rounded-full bg-orange-500/40 animate-ping" />
            <div className="size-9 rounded-full bg-slate-900 border-2 border-orange-500 shadow-xl flex items-center justify-center text-white text-xs font-bold">
              🚐
            </div>
            <div className="absolute -bottom-6 bg-slate-900/90 text-[10px] text-white px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap border border-slate-700">
              3 min away
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-30 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Badge className="bg-slate-900/90 backdrop-blur-md text-white border-slate-700 text-xs py-1 px-3 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>GPS Live Tracking</span>
          </Badge>
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md text-slate-300 text-xs px-2.5 py-1 rounded-md border border-slate-700">
            <Compass className="w-3 h-3 text-orange-400" />
            <span>Corridor 1 • Bole Road</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setTrafficActive(!trafficActive)}
            className={`p-2 rounded-lg backdrop-blur-md text-xs font-semibold border transition-all ${
              trafficActive
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-slate-900/80 border-slate-700 text-slate-400"
            }`}
            title="Toggle Live Traffic"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Telemetry Card (Uber HUD style) */}
      <div className="absolute bottom-3 left-3 right-3 z-30 bg-slate-900/95 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-slate-800 text-white shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Navigation2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-emerald-400">7.8 km</span>
                <span>•</span>
                <span>Est. 19 mins</span>
                <span>•</span>
                <span className="text-orange-400">Light Traffic</span>
              </div>
              <div className="text-sm font-bold text-white truncate max-w-[280px] sm:max-w-md">
                {origin.split(",")[0]} → {destination.split(",")[0]}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700">
              Corridor Lanes Priority
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
