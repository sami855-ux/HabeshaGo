"use client"

import React, { useEffect, useState } from "react"
import Sidebar from "@/components/admin-dashboard/Sidebar"
import Header from "@/components/admin-dashboard/Header"
import { useRequireRole } from "@/hooks/useRequireRole"
import { SidebarProvider, useSidebar } from "@/context/sidebar-context"
import { useOAuthExchange } from "@/hooks/useOAuthExchange"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/store"
import {
  Bell,
  Check,
  LayoutDashboard,
  ShieldCheck,
  Users,
  Settings,
  BarChart3,
} from "lucide-react"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()
  const dispatch = useAppDispatch()
  const { isReady, isAuthenticated } = useAppSelector((state) => state.user)

  // ✅ block render until auth is resolved
  if (!isReady) {
    return <AccountSetupLoader />
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          isCollapsed ? "lg:ml-20" : "lg:ml-64",
        )}
      >
        <Header />
        <main className="flex-1 overflow-auto p-1 md:p-3 bg-card">
          <div className="bg-card">{children}</div>
        </main>
      </div>
    </div>
  )
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  useRequireRole(["ADMIN"])
  useOAuthExchange()

  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  )
}

const STEPS = [
  {
    icon: ShieldCheck,
    label: "Verifying admin credentials",
    desc: "Checking your access level",
  },
  {
    icon: LayoutDashboard,
    label: "Loading admin dashboard",
    desc: "Configuring your workspace",
  },
  {
    icon: Users,
    label: "Fetching user data",
    desc: "Loading user analytics",
  },
  {
    icon: BarChart3,
    label: "Loading statistics",
    desc: "Preparing reports",
  },
  {
    icon: Settings,
    label: "Applying permissions",
    desc: "Setting up your controls",
  },
  {
    icon: Bell,
    label: "Configuring alerts",
    desc: "Setting up notifications",
  },
]

type StepState = "idle" | "active" | "done"

export function AccountSetupLoader() {
  const [stepStates, setStepStates] = useState<StepState[]>([
    "active",
    "idle",
    "idle",
    "idle",
    "idle",
    "idle",
  ])
  const [msgIndex, setMsgIndex] = useState(0)
  const [finished, setFinished] = useState(false)

  const messages = [
    "Verifying admin credentials…",
    "Loading admin dashboard…",
    "Fetching user data…",
    "Loading statistics…",
    "Applying permissions…",
    "Configuring alerts…",
    "You're all set!",
  ]

  useEffect(() => {
    let step = 0

    const advance = () => {
      if (step >= STEPS.length) {
        setFinished(true)
        return
      }

      setStepStates((prev) => prev.map((s, i) => (i === step ? "active" : s)))
      setMsgIndex(step)

      setTimeout(() => {
        setStepStates((prev) => prev.map((s, i) => (i === step ? "done" : s)))
        step++
        setTimeout(() => {
          if (step < STEPS.length) {
            advance()
          } else {
            setMsgIndex(STEPS.length)
            setFinished(true)
          }
        }, 600)
      }, 1800)
    }

    advance()
  }, [])

  const pct = Math.round(
    (stepStates.filter((s) => s === "done").length / STEPS.length) * 100,
  )
  const current = stepStates.findIndex((s) => s === "active")

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted">
          {!finished && (
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          )}
          {finished ? (
            <Check className="h-6 w-6 text-green-500" />
          ) : (
            <ShieldCheck className="h-6 w-6 text-primary" />
          )}
        </div>

        <div className="text-center">
          <p className="text-[15px] font-medium transition-all duration-300">
            {messages[msgIndex]}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {finished
              ? "Redirecting you to admin panel…"
              : "This only takes a moment"}
          </p>
        </div>

        {!finished && (
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}

        <div className="w-full min-h-[56px] flex items-center justify-center">
          {current >= 0 &&
            (() => {
              const s = STEPS[current]
              const Icon = s.icon
              return (
                <div className="w-full flex items-center gap-3 rounded-lg bg-muted/50 px-3.5 py-3 animate-in slide-in-from-bottom-2 duration-300 border border-border">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium">{s.label}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {s.desc}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                    In progress
                  </span>
                </div>
              )
            })()}
          {finished && (
            <div className="w-full flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-3.5 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium">Admin access granted</p>
                <p className="text-[12px] text-muted-foreground">
                  Taking you to the admin dashboard
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full flex items-center gap-2.5">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary/50 rounded-full transition-all duration-700 ease-in-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[12px] text-muted-foreground w-8 text-right font-mono">
            {pct}%
          </span>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
