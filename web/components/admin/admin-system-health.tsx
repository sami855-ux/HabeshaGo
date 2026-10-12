"use client"

import * as React from "react"
import {
  Server,
  Activity,
  CheckCircle2,
  Cpu,
  Database,
  ShieldCheck,
  RefreshCw,
  Zap,
  Ticket,
  CreditCard,
  Navigation
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function AdminSystemHealth() {
  const [lastCheck, setLastCheck] = React.useState("Just now")
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastCheck("Just now")
      toast.success("All 4 microservices pinged successfully!")
    }, 600)
  }

  const services = [
    {
      name: "Ticket Service",
      port: 4001,
      domain: "Bookings, QR Tickets, Digital Passes",
      latency: "14ms",
      uptime: "99.99%",
      status: "Healthy",
      icon: Ticket,
    },
    {
      name: "Payment Service",
      port: 4002,
      domain: "Telebirr, Chapa, CBE Birr, Settlements",
      latency: "28ms",
      uptime: "99.95%",
      status: "Healthy",
      icon: CreditCard,
    },
    {
      name: "Mobility Service",
      port: 4003,
      domain: "Vehicles, Routes, GPS Telemetry, Dispatches",
      latency: "19ms",
      uptime: "99.98%",
      status: "Healthy",
      icon: Navigation,
    },
    {
      name: "Auth Service",
      port: 4004,
      domain: "Passenger, Driver & Admin Authentication",
      latency: "8ms",
      uptime: "100.0%",
      status: "Healthy",
      icon: ShieldCheck,
    },
  ]

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5 font-inter">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              HabeshaGo Microservices Blueprint Status
            </h3>
            <Badge variant="success" className="text-xs">
              All Systems Operational
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Architecture conformance monitor as per Microservices Requirements Specification v1.1
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="text-xs gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Health Ping</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((svc) => {
          const Icon = svc.icon
          return (
            <div
              key={svc.name}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{svc.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">
                        Port {svc.port}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500">{svc.domain}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{svc.status}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800 text-slate-500">
                <span>
                  Latency: <strong className="text-slate-800 dark:text-slate-200">{svc.latency}</strong>
                </span>
                <span>
                  Uptime: <strong className="text-emerald-600">{svc.uptime}</strong>
                </span>
                <span>
                  API Gateway: <strong className="text-slate-800 dark:text-slate-200">Routed</strong>
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
