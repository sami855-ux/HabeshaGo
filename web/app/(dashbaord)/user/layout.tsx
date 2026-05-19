"use client"

import React, { useEffect, useState } from "react"
import { SidebarProvider, useSidebar } from "@/context/sidebar-context"
import { fetchUserWallet } from "@/store/slices/walletSlice"
import Sidebar from "@/components/user-dashboard/Sidebar"
import Header from "@/components/user-dashboard/Header"
import { useRequireRole } from "@/hooks/useRequireRole"
import IntroOverlay from "@/components/IntroOverlay"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { useOAuthExchange } from "@/hooks/useOAuthExchange"
import { cn } from "@/lib/utils"
import {
  Bell,
  Check,
  LayoutDashboard,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react"

function UserLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()
  const dispatch = useAppDispatch()
  const { isReady, isAuthenticated } = useAppSelector((state) => state.user)

  useEffect(() => {
    // ✅ only fetch wallet once auth is fully resolved and user is authenticated
    if (!isReady || !isAuthenticated) return
    dispatch(fetchUserWallet())
  }, [isReady, isAuthenticated, dispatch])

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
        <main className="flex-1 overflow-auto p-1 md:p-3 bg-background">
          <div className="bg-background p-2">{children}</div>
        </main>
      </div>
    </div>
  )
}

function UserLayout({ children }: { children: React.ReactNode }) {
  useRequireRole(["PASSENGER"])
  useOAuthExchange()

  return (
    <SidebarProvider>
      <IntroOverlay />
      <UserLayoutContent>{children}</UserLayoutContent>
    </SidebarProvider>
  )
}

const STEPS = [
  {
    icon: ShieldCheck,
    label: "Verifying your identity",
    desc: "Checking your credentials",
  },
  {
    icon: LayoutDashboard,
    label: "Building your dashboard",
    desc: "Configuring your workspace",
  },
  { icon: Wallet, label: "Loading your wallet", desc: "Fetching your balance" },
  {
    icon: Bell,
    label: "Setting up notifications",
    desc: "Applying your preferences",
  },
]

type StepState = "idle" | "active" | "done"

function AccountSetupLoader() {
  const [stepStates, setStepStates] = useState<StepState[]>([
    "active",
    "idle",
    "idle",
    "idle",
  ])
  const [msgIndex, setMsgIndex] = useState(0)
  const [finished, setFinished] = useState(false)

  const messages = [
    "Verifying your identity…",
    "Building your dashboard…",
    "Loading your wallet…",
    "Setting up notifications…",
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
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted">
          {!finished && (
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-muted-foreground animate-spin" />
          )}
          {finished ? (
            <Check className="h-6 w-6 text-green-500" />
          ) : (
            <User className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        <div className="text-center">
          <p className="text-[15px] font-medium transition-all duration-300">
            {messages[msgIndex]}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {finished ? "Redirecting you now…" : "This only takes a moment"}
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
                <div className="w-full flex items-center gap-3 rounded-lg bg-muted/50 px-3.5 py-3 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                    <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium">{s.label}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {s.desc}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] text-blue-700 dark:bg-blue-900 dark:text-blue-300">
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
                <p className="text-[13px] font-medium">
                  Everything&apos;s ready
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Taking you to your dashboard
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full flex items-center gap-2.5">
          <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-foreground/30 rounded-full transition-all duration-700 ease-in-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[12px] text-muted-foreground w-8 text-right">
            {pct}%
          </span>
        </div>
      </div>
    </div>
  )
}

export default UserLayout
