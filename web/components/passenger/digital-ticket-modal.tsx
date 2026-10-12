"use client"

import * as React from "react"
import { QRCodeSVG } from "qrcode.react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  Share2,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Bus,
  ShieldCheck,
  CreditCard,
  QrCode
} from "lucide-react"
import { toast } from "sonner"

interface DigitalTicketModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticketData?: {
    id: string
    passengerName: string
    routeFrom: string
    routeTo: string
    seatNumber: string
    departureTime: string
    vehicle: string
    plate: string
    fareETB: number
    paymentChannel: string
  }
}

export function DigitalTicketModal({
  open,
  onOpenChange,
  ticketData = {
    id: "HG-ET-90428",
    passengerName: "Selamawit Tadesse",
    routeFrom: "Bole Medhanealem",
    routeTo: "Meskel Square Central",
    seatNumber: "04",
    departureTime: "Today, 11:45 AM",
    vehicle: "Toyota HiAce Express Shuttle",
    plate: "AA-3-94281",
    fareETB: 28,
    paymentChannel: "Telebirr SuperApp",
  },
}: DigitalTicketModalProps) {
  const qrPayload = JSON.stringify({
    ticketId: ticketData.id,
    passenger: ticketData.passengerName,
    route: `${ticketData.routeFrom} -> ${ticketData.routeTo}`,
    seat: ticketData.seatNumber,
    valid: true,
  })

  const handleDownload = () => {
    toast.success("Boarding pass downloaded to your device!")
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "HabeshaGo Digital Pass",
        text: `My HabeshaGo ticket ${ticketData.id} for ${ticketData.routeTo}`,
      }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(ticketData.id)
      toast.success("Ticket ID copied to clipboard!")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-slate-900 text-white border-slate-800 font-inter">
        <DialogHeader className="p-6 pb-2 text-left bg-gradient-to-br from-orange-600 to-amber-600 font-inter">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight font-inter text-white">
                Habesha<span className="text-slate-900">Go</span>
              </span>
              <Badge className="bg-white/20 text-white hover:bg-white/30 text-[10px]">
                Official Digital Pass
              </Badge>
            </div>
            <span className="text-xs font-mono font-bold text-white/90">
              #{ticketData.id}
            </span>
          </div>
          <DialogTitle className="text-lg font-bold text-white mt-2">
            Boarding Pass & QR Ticket
          </DialogTitle>
          <DialogDescription className="text-white/80 text-xs">
            Present this QR code to the vehicle conductor or scanner gate.
          </DialogDescription>
        </DialogHeader>

        {/* Boarding Pass Body (Airline / Flixbus Style) */}
        <div className="p-6 space-y-6">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl shadow-inner">
            <QRCodeSVG
              value={qrPayload}
              size={170}
              level="H"
              includeMargin={true}
              fgColor="#0f172a"
            />
            <p className="mt-2 text-[11px] font-mono font-bold text-slate-700">
              SCAN TO VERIFY BOARDING
            </p>
          </div>

          {/* Ticket Information Grid */}
          <div className="space-y-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Passenger
                </span>
                <span className="font-bold text-white text-sm">
                  {ticketData.passengerName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Seat Number
                </span>
                <span className="font-extrabold text-orange-400 text-base">
                  Seat {ticketData.seatNumber}
                </span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-700 pt-3 grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  From (Pickup)
                </span>
                <span className="font-semibold text-white">
                  {ticketData.routeFrom}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  To (Destination)
                </span>
                <span className="font-semibold text-white">
                  {ticketData.routeTo}
                </span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-700 pt-3 grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Departure Time
                </span>
                <span className="font-semibold text-emerald-400">
                  {ticketData.departureTime}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Assigned Vehicle
                </span>
                <span className="font-semibold text-white">
                  {ticketData.plate}
                </span>
              </div>
            </div>

            {/* Payment badge */}
            <div className="border-t border-slate-700 pt-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Paid via {ticketData.paymentChannel}</span>
              </span>
              <span className="font-extrabold text-sm text-white">
                {ticketData.fareETB} ETB
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white text-xs h-10 gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Save Pass</span>
            </Button>
            <Button
              onClick={handleShare}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-10 gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Ticket</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
