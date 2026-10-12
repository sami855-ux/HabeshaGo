"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Eye,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  Clock,
  Car,
  Filter
} from "lucide-react"
import { toast } from "sonner"

export interface BookingRecord {
  id: string
  passenger: {
    name: string
    avatar: string
    phone: string
  }
  service: "Minibus" | "City Comfort" | "Green EV" | "Intercity"
  driver: string
  vehiclePlate: string
  route: string
  fareETB: number
  paymentMethod: "Telebirr" | "Chapa" | "CBE Birr" | "Cash"
  status: "In Transit" | "Completed" | "Scheduled" | "Delayed"
  timestamp: string
}

const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: "HG-8902",
    passenger: {
      name: "Selamawit Tadesse",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
      phone: "+251 91 120 4892",
    },
    service: "Minibus",
    driver: "Abebe Kebede",
    vehiclePlate: "AA-3-94281",
    route: "Bole Medhanealem → Meskel Square",
    fareETB: 28,
    paymentMethod: "Telebirr",
    status: "In Transit",
    timestamp: "3 mins ago",
  },
  {
    id: "HG-8901",
    passenger: {
      name: "Yonas Berhanu",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      phone: "+251 92 344 8192",
    },
    service: "City Comfort",
    driver: "Ermias Haile",
    vehiclePlate: "AA-2-41902",
    route: "Piassa → Kazanchis UNECA",
    fareETB: 185,
    paymentMethod: "Chapa",
    status: "Completed",
    timestamp: "14 mins ago",
  },
  {
    id: "HG-8900",
    passenger: {
      name: "Meron Assefa",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
      phone: "+251 94 509 3318",
    },
    service: "Green EV",
    driver: "Tewodros G.",
    vehiclePlate: "AA-EV-092",
    route: "Bole Airport → Sarbet AU",
    fareETB: 155,
    paymentMethod: "Telebirr",
    status: "In Transit",
    timestamp: "18 mins ago",
  },
  {
    id: "HG-8899",
    passenger: {
      name: "Dawit Mengistu",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
      phone: "+251 91 802 7411",
    },
    service: "Intercity",
    driver: "Kassahun W.",
    vehiclePlate: "ET-BUS-402",
    route: "Addis Ababa → Hawassa Express",
    fareETB: 380,
    paymentMethod: "CBE Birr",
    status: "Scheduled",
    timestamp: "25 mins ago",
  },
  {
    id: "HG-8898",
    passenger: {
      name: "Bethlehem Girma",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
      phone: "+251 93 118 9024",
    },
    service: "Minibus",
    driver: "Mulugeta T.",
    vehiclePlate: "AA-3-71829",
    route: "CMC Michael → Stadium",
    fareETB: 35,
    paymentMethod: "Telebirr",
    status: "Completed",
    timestamp: "42 mins ago",
  },
]

export function AdminBookingsTable() {
  const [filter, setFilter] = React.useState<string>("All")
  const [bookings, setBookings] = React.useState<BookingRecord[]>(INITIAL_BOOKINGS)

  const filtered = filter === "All" ? bookings : bookings.filter((b) => b.status === filter)

  const handleRefund = (id: string, amount: number) => {
    toast.success(`Refund of ${amount} ETB processed via Telebirr gateway for #${id}`)
  }

  const handleReassign = (id: string) => {
    toast.info(`Dispatched reassign request for trip #${id}`)
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4 font-inter">
      {/* Table Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Live Dispatches & Bookings Feed
          </h3>
          <p className="text-xs text-slate-500">
            Real-time multimodal trip orders dispatched across Addis Ababa
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {["All", "In Transit", "Completed", "Scheduled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === f
                  ? "bg-orange-500 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-950/60">
            <TableRow>
              <TableHead className="font-bold text-xs">Trip ID</TableHead>
              <TableHead className="font-bold text-xs">Passenger</TableHead>
              <TableHead className="font-bold text-xs">Service & Driver</TableHead>
              <TableHead className="font-bold text-xs">Route</TableHead>
              <TableHead className="font-bold text-xs">Fare & Channel</TableHead>
              <TableHead className="font-bold text-xs">Status</TableHead>
              <TableHead className="text-right font-bold text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => (
              <TableRow key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-950/40">
                {/* ID & Time */}
                <TableCell>
                  <div className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    #{b.id}
                  </div>
                  <div className="text-[10px] text-slate-400">{b.timestamp}</div>
                </TableCell>

                {/* Passenger */}
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-7">
                      <AvatarImage src={b.passenger.avatar} />
                      <AvatarFallback className="text-[10px] bg-orange-500 text-white">
                        {b.passenger.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {b.passenger.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{b.passenger.phone}</div>
                    </div>
                  </div>
                </TableCell>

                {/* Service & Driver */}
                <TableCell>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white">
                    {b.service}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {b.driver} • <span className="font-mono">{b.vehiclePlate}</span>
                  </div>
                </TableCell>

                {/* Route */}
                <TableCell className="max-w-[200px] truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                  {b.route}
                </TableCell>

                {/* Fare & Channel */}
                <TableCell>
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {b.fareETB} ETB
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold">
                    {b.paymentMethod}
                  </div>
                </TableCell>

                {/* Status Badge */}
                <TableCell>
                  <Badge
                    variant={
                      b.status === "In Transit"
                        ? "warning"
                        : b.status === "Completed"
                        ? "success"
                        : "secondary"
                    }
                    className="text-[10px] py-0.5 px-2 font-semibold"
                  >
                    {b.status}
                  </Badge>
                </TableCell>

                {/* Actions Dropdown */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 text-xs">
                      <DropdownMenuItem
                        onClick={() => toast.info(`Viewing telemetry for ${b.id}`)}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleReassign(b.id)}
                        className="cursor-pointer"
                      >
                        <RefreshCw className="mr-2 h-3.5 w-3.5" />
                        <span>Reassign Driver</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRefund(b.id, b.fareETB)}
                        className="text-red-600 cursor-pointer"
                      >
                        <RotateCcw className="mr-2 h-3.5 w-3.5" />
                        <span>Issue Refund</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
