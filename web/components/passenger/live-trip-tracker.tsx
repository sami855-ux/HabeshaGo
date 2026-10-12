"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Phone,
  MessageSquare,
  ShieldAlert,
  X,
  CheckCircle,
  Star,
  MapPin,
  Clock,
  Car,
  Key,
  Share2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

interface LiveTripTrackerProps {
  origin: string
  destination: string
  vehicleName: string
  plateNumber?: string
  fareETB: number
  onCancelTrip: () => void
  onOpenPass: () => void
}

export function LiveTripTracker({
  origin,
  destination,
  vehicleName,
  plateNumber = "AA-3-94281",
  fareETB,
  onCancelTrip,
  onOpenPass,
}: LiveTripTrackerProps) {
  const [step, setStep] = React.useState<number>(2) // 1: Dispatched, 2: Arriving, 3: In Transit, 4: Completed
  const [countdown, setCountdown] = React.useState(180) // 3 mins

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white dark:bg-slate-900 rounded-2xl border-2 border-orange-500/40 p-5 shadow-2xl space-y-5 font-inter"
    >
      {/* Header with Status Badge & Ride PIN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="size-3 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Driver is on the way
              </h3>
              <Badge variant="success" className="text-xs">
                Arriving in {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">Bole Corridor fast line dispatch</p>
          </div>
        </div>

        {/* Security PIN for boarding verification */}
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-3 py-1.5 rounded-xl">
          <Key className="w-4 h-4 text-amber-600" />
          <div className="text-left">
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
              Ride Verification PIN
            </div>
            <div className="text-base font-black text-amber-900 dark:text-amber-300 tracking-widest">
              5 9 1 2
            </div>
          </div>
        </div>
      </div>

      {/* Driver & Vehicle Information */}
      <div className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar className="size-12 border-2 border-orange-500">
            <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces" />
            <AvatarFallback className="bg-orange-500 text-white font-bold">AK</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Abebe Kebede</h4>
              <span className="flex items-center text-xs font-semibold text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" /> 4.93
              </span>
            </div>
            <p className="text-xs text-slate-500">{vehicleName} • 1,420 trips</p>
            <div className="mt-1">
              <span className="text-[11px] font-mono font-bold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-800 dark:text-slate-200">
                {plateNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Driver Quick Communication Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full size-9 p-0 border-slate-300 dark:border-slate-700 hover:text-emerald-600"
            onClick={() => toast.info("Calling driver Abebe at +251 91 123 4567...")}
            title="Call Driver"
          >
            <Phone className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full size-9 p-0 border-slate-300 dark:border-slate-700 hover:text-orange-600"
            onClick={() => toast.info("Opening in-app chat with driver...")}
            title="Message Driver"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Trip Progress Stepper */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span className="text-emerald-600">1. Dispatched</span>
          <span className="text-orange-600 font-bold">2. Arriving</span>
          <span className="text-slate-400">3. In Transit</span>
          <span className="text-slate-400">4. Dropped Off</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-orange-500 h-full w-1/2 transition-all duration-500 rounded-full" />
        </div>
      </div>

      {/* Route Summary */}
      <div className="text-xs space-y-1.5 py-1 text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span className="truncate">From: <strong>{origin}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-orange-500" />
          <span className="truncate">To: <strong>{destination}</strong></span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onOpenPass}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-xl"
          >
            View QR Boarding Pass
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href)
              toast.success("Live trip tracking link copied to clipboard!")
            }}
            className="text-xs rounded-xl gap-1"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Trip</span>
          </Button>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            onCancelTrip()
            toast.info("Ride cancelled without fee")
          }}
          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
        >
          Cancel Ride
        </Button>
      </div>
    </motion.div>
  )
}
