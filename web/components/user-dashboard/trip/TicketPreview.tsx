import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bus,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Ticket,
  Gift,
} from "lucide-react"

interface TicketPreviewProps {
  ticket: typeof import("@/data/mock-audit-logs").mockTicketData
}

export function TicketPreview({ ticket }: TicketPreviewProps) {
  return (
    <Card className="rounded-3xl shadow-xl border-0 overflow-hidden sticky top-24">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Ticket className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              Ticket to Share
            </CardTitle>
            <CardDescription className="text-amber-100 text-sm">
              Booking #{ticket.bookingCode}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl p-6">
          {/* Ticket Header */}
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-orange-500 text-white border-0 px-3 py-1">
              <Bus className="h-3 w-3 mr-1" />
              {ticket.bus.name}
            </Badge>
            <Badge variant="outline" className="bg-white/50 backdrop-blur-sm">
              Seat {ticket.seatNumber}
            </Badge>
          </div>

          {/* Route with Time */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-xs font-medium text-gray-600">
                    Departure
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {ticket.route.origin}
                </p>
                <p className="text-sm text-orange-600 font-medium">
                  {ticket.departureTime}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-orange-400 flex-shrink-0" />
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs font-medium text-gray-600">
                    Arrival
                  </span>
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                </div>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {ticket.route.destination}
                </p>
                <p className="text-sm text-amber-600 font-medium">
                  {ticket.departureTime}
                </p>
              </div>
            </div>

            {/* Journey Line */}
            <div className="relative h-1 bg-gray-200 rounded-full mt-2">
              <div className="absolute top-0 left-0 h-1 w-1/2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
              <Calendar className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium">{ticket.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-medium">10h 30m</p>
              </div>
            </div>
          </div>

          {/* Boarding Points */}
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
              <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Boarding Point</p>
                <p className="font-medium">{ticket.boardingStop}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
              <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Alighting Point</p>
                <p className="font-medium">{ticket.alightingStop}</p>
              </div>
            </div>
          </div>

          {/* Perforated Edge Effect */}
          <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-16 bg-white dark:bg-gray-950 rounded-r-full border-y border-r border-orange-200" />
          <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-16 bg-white dark:bg-gray-950 rounded-l-full border-y border-l border-orange-200" />
        </div>

        {/* Share Info */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Gift className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-400">
                Share with Confidence
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-500 mt-1">
                This ticket will be securely transferred. The recipient will get
                instant notification and can use it immediately.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
