"use client"

import * as React from "react"
import {
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Phone,
  Car
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

export interface PendingDriver {
  id: string
  name: string
  avatar: string
  phone: string
  kebeleId: string
  licenseGrade: string
  vehicleModel: string
  plateNumber: string
  corridorRequested: string
  submissionDate: string
}

const INITIAL_DRIVERS: PendingDriver[] = [
  {
    id: "DRV-901",
    name: "Solomon Getachew",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    phone: "+251 91 189 2034",
    kebeleId: "AA-K03-91823",
    licenseGrade: "Grade 3 (Public Minibus)",
    vehicleModel: "Toyota HiAce 2018 (14 Seats)",
    plateNumber: "AA-3-61920",
    corridorRequested: "Bole ↔ Megenagna Express",
    submissionDate: "Today, 09:30 AM",
  },
  {
    id: "DRV-902",
    name: "Hanna Worku",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    phone: "+251 92 841 0294",
    kebeleId: "AA-K08-41092",
    licenseGrade: "Grade 2 (Commercial Taxi)",
    vehicleModel: "BYD Atto 3 EV (Electric)",
    plateNumber: "AA-EV-108",
    corridorRequested: "Kazanchis ↔ Bole Airport",
    submissionDate: "Yesterday, 4:15 PM",
  },
  {
    id: "DRV-903",
    name: "Girma Belay",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
    phone: "+251 94 991 3820",
    kebeleId: "AA-K01-77291",
    licenseGrade: "Grade 3 (Minibus / Shuttle)",
    vehicleModel: "Toyota HiAce 2020 (White)",
    plateNumber: "AA-3-55910",
    corridorRequested: "Piassa ↔ Mexico Square",
    submissionDate: "Oct 11, 11:00 AM",
  },
]

interface AdminDriverApprovalsProps {
  onCountChange?: (count: number) => void
}

export function AdminDriverApprovals({ onCountChange }: AdminDriverApprovalsProps) {
  const [drivers, setDrivers] = React.useState<PendingDriver[]>(INITIAL_DRIVERS)

  const handleApprove = (driver: PendingDriver) => {
    setDrivers((prev) => prev.filter((d) => d.id !== driver.id))
    onCountChange?.(drivers.length - 1)
    toast.success(
      `Driver ${driver.name} approved! Driver app credentials SMS sent to ${driver.phone}.`
    )
  }

  const handleReject = (driver: PendingDriver) => {
    setDrivers((prev) => prev.filter((d) => d.id !== driver.id))
    onCountChange?.(drivers.length - 1)
    toast.error(`Application for ${driver.name} rejected.`)
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5 font-inter">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-orange-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Driver Verification & Onboarding Queue
            </h3>
            {drivers.length > 0 && (
              <Badge className="bg-amber-500 text-white text-xs">
                {drivers.length} Pending
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review Kebele identification, driving license grade, and vehicle inspection documents
          </p>
        </div>
      </div>

      {drivers.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            All Applications Reviewed
          </h4>
          <p className="text-xs text-slate-500">
            No pending driver onboarding requests in the queue.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {drivers.map((d) => (
            <div
              key={d.id}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <Avatar className="size-11 border-2 border-orange-500/30 shrink-0">
                  <AvatarImage src={d.avatar} />
                  <AvatarFallback className="bg-orange-500 text-white font-bold text-xs">
                    {d.name[0]}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {d.name}
                    </h4>
                    <span className="text-xs text-slate-400">#{d.id}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 dark:text-slate-400 mt-1">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{d.phone}</span>
                    </div>
                    <div>
                      Kebele ID: <span className="font-semibold text-slate-900 dark:text-white">{d.kebeleId}</span>
                    </div>
                    <div>
                      License: <span className="font-semibold text-slate-900 dark:text-white">{d.licenseGrade}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-slate-400" />
                      <span>{d.vehicleModel} ({d.plateNumber})</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="orange" className="text-[10px]">
                      Corridor: {d.corridorRequested}
                    </Badge>
                    <span className="text-[10px] text-slate-400">
                      Applied {d.submissionDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Button
                  onClick={() => handleReject(d)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-slate-200 dark:border-slate-800 text-xs h-9"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  <span>Reject</span>
                </Button>
                <Button
                  onClick={() => handleApprove(d)}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  <span>Approve & Activate</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
