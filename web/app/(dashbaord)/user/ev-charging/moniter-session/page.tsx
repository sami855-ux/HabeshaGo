"use client"

import React, { useState, useRef, useEffect } from "react"
import { ArrowLeft, Wallet } from "lucide-react"
import SessionMonitor from "@/components/user-dashboard/ev-charging/SessionMonitor"
import SessionControls from "@/components/user-dashboard/ev-charging/SessionControls"
import SessionDialogs from "@/components/user-dashboard/ev-charging/SessionDialogs"
import { useRouter } from "next/navigation"

// Mock session data (API ready)
const MOCK_SESSION = {
  id: "sess_789012",
  stationName: "EV Gateway Station",
  chargerId: "CH-42",
  connectorType: "CCS Combo 2",
  address: "123 Electric Ave, Silicon Valley, CA 94025",
  startedAt: new Date().toISOString(),
  vehicleInfo: {
    model: "Tesla Model Y",
    batteryCapacity: 75,
    currentBattery: 42,
    estimatedRange: 168,
  },
  chargingStats: {
    currentPower: 142,
    voltage: 408,
    current: 348,
    energyDelivered: 0,
    sessionCost: 0,
    carbonSaved: 0,
    maxPower: 250,
  },
  status: "charging",
  targetEnergy: 3,
  pricePerKwh: 0.45,
}

// Mock wallet balance
let MOCK_WALLET_BALANCE = 45.5

const MainPage: React.FC = () => {
  const router = useRouter()

  const [session, setSession] = useState(MOCK_SESSION)
  const [timeElapsed, setTimeElapsed] = useState("00:00:00")
  const [walletBalance, setWalletBalance] = useState(MOCK_WALLET_BALANCE)
  const [finalCost, setFinalCost] = useState(0)

  // Dialog states
  const [showTargetReachedDialog, setShowTargetReachedDialog] = useState(false)
  const [showResumeDialog, setShowResumeDialog] = useState(false)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [showInsufficientFundsDialog, setShowInsufficientFundsDialog] =
    useState(false)
  const [showModernAlert, setShowModernAlert] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    type: "pause" | "stop" | "resume"
    onConfirm: () => void
  } | null>(null)

  const [resumeAmount, setResumeAmount] = useState(10)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDialogLoading, setIsDialogLoading] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date>(new Date(session.startedAt))
  const pausedDurationRef = useRef<number>(0)
  const pauseStartTimeRef = useRef<number | null>(null)

  // Format time helper
  const formatTime = (seconds: number): string => {
    const totalSeconds = Math.floor(seconds)
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Update elapsed time
  const updateElapsedTime = () => {
    if (session.status === "charging") {
      const now = new Date()
      const elapsed =
        (now.getTime() - startTimeRef.current.getTime()) / 1000 -
        pausedDurationRef.current
      setTimeElapsed(formatTime(Math.max(0, elapsed)))
    }
  }

  // Timer effects
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (session.status === "charging") {
      timerRef.current = setInterval(updateElapsedTime, 1000)
      updateElapsedTime()
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [session.status])

  useEffect(() => {
    if (session.status === "paused" && pauseStartTimeRef.current === null) {
      pauseStartTimeRef.current = Date.now()
    } else if (
      session.status === "charging" &&
      pauseStartTimeRef.current !== null
    ) {
      pausedDurationRef.current +=
        (Date.now() - pauseStartTimeRef.current) / 1000
      pauseStartTimeRef.current = null
    }
  }, [session.status])

  // Simulate real-time data updates
  useEffect(() => {
    if (updateIntervalRef.current) clearInterval(updateIntervalRef.current)
    const targetReached =
      session.chargingStats.energyDelivered >= session.targetEnergy

    if (session.status === "charging" && !targetReached) {
      updateIntervalRef.current = setInterval(() => {
        const power = 142 + (Math.random() - 0.5) * 15
        const energyIncrement = (power / 3600) * 3

        setSession((prev) => {
          const newEnergyDelivered =
            prev.chargingStats.energyDelivered + energyIncrement
          const newBatteryPercentage = Math.min(
            100,
            prev.vehicleInfo.currentBattery +
              (energyIncrement / prev.vehicleInfo.batteryCapacity) * 100,
          )

          return {
            ...prev,
            vehicleInfo: {
              ...prev.vehicleInfo,
              currentBattery: newBatteryPercentage,
              estimatedRange: Math.round(
                prev.vehicleInfo.estimatedRange +
                  (energyIncrement / prev.vehicleInfo.batteryCapacity) * 268,
              ),
            },
            chargingStats: {
              ...prev.chargingStats,
              currentPower: Math.round(power),
              voltage: 408 + Math.floor(Math.random() * 10 - 5),
              current: 348 + Math.floor(Math.random() * 15 - 7),
              energyDelivered: Number(newEnergyDelivered.toFixed(2)),
              sessionCost: Number(
                (newEnergyDelivered * prev.pricePerKwh).toFixed(2),
              ),
              carbonSaved: Number((newEnergyDelivered * 0.35).toFixed(1)),
              maxPower: prev.chargingStats.maxPower,
            },
          }
        })
      }, 3000)
    }
    return () => {
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current)
    }
  }, [session.status])

  // Auto-stop when target is reached
  useEffect(() => {
    const targetReached =
      session.chargingStats.energyDelivered >= session.targetEnergy
    if (
      targetReached &&
      session.status === "charging" &&
      !showTargetReachedDialog
    ) {
      setShowTargetReachedDialog(true)
      setSession((prev) => ({ ...prev, status: "completed" }))
    }
  }, [
    session.chargingStats.energyDelivered,
    session.status,
    session.targetEnergy,
    showTargetReachedDialog,
  ])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsRefreshing(false)
  }

  const handlePauseResume = () => {
    if (session.status === "charging") {
      setAlertConfig({
        type: "pause",
        onConfirm: async () => {
          setShowModernAlert(false)
          // Pause logic
          await new Promise((resolve) => setTimeout(resolve, 800))
          setSession((prev) => ({ ...prev, status: "paused" }))
          setAlertConfig(null)
        },
      })
      setShowModernAlert(true)
    } else if (session.status === "paused") {
      setAlertConfig({
        type: "resume",
        onConfirm: async () => {
          setShowModernAlert(false)
          // Resume logic
          await new Promise((resolve) => setTimeout(resolve, 800))
          setSession((prev) => ({ ...prev, status: "charging" }))
          setAlertConfig(null)
        },
      })
      setShowModernAlert(true)
    }
  }

  const handleManualStop = () => {
    setAlertConfig({
      type: "stop",
      onConfirm: async () => {
        setShowModernAlert(false)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setSession((prev) => ({ ...prev, status: "completed" }))
        setFinalCost(session.chargingStats.sessionCost)
        setShowCompletionDialog(true)
        setAlertConfig(null)
      },
    })
    setShowModernAlert(true)
  }

  const checkSufficientFunds = (amount: number): boolean => {
    return walletBalance >= amount
  }

  const processPayment = async (amount: number): Promise<boolean> => {
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500))
    if (walletBalance >= amount) {
      const newBalance = walletBalance - amount
      setWalletBalance(newBalance)
      MOCK_WALLET_BALANCE = newBalance
      return true
    }
    return false
  }

  const handleResumeWithNewTarget = async () => {
    const additionalCost = resumeAmount * session.pricePerKwh

    if (!checkSufficientFunds(additionalCost)) {
      setShowResumeDialog(false)
      setShowInsufficientFundsDialog(true)
      return
    }

    const paymentSuccess = await processPayment(additionalCost)

    if (paymentSuccess) {
      setSession((prev) => ({
        ...prev,
        status: "charging",
        targetEnergy: prev.targetEnergy + resumeAmount,
      }))
      setShowResumeDialog(false)
      setResumeAmount(10)
    } else {
      setShowResumeDialog(false)
      setShowInsufficientFundsDialog(true)
    }
  }

  const handleBack = () => {
    console.log("Navigate back to dashboard")
    router.back()
  }

  const targetReached =
    session.chargingStats.energyDelivered >= session.targetEnergy
  const remainingToTarget = Math.max(
    0,
    session.targetEnergy - session.chargingStats.energyDelivered,
  )
  const targetProgress =
    (session.chargingStats.energyDelivered / session.targetEnergy) * 100

  return (
    <div className="min-h-screen ">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Back to Tickets</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm">
              <Wallet className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">
                ETB {walletBalance.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition"
            >
              <RefreshIcon
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Monitor Session
            </h1>
            <StatusBadge status={session.status} />
          </div>
          <p className="text-gray-500 text-lg">
            Real-time charging data and session controls
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Live Stats */}
          <div className="lg:col-span-2 space-y-6">
            <SessionMonitor
              session={session}
              timeElapsed={timeElapsed}
              targetReached={targetReached}
              remainingToTarget={remainingToTarget}
              targetProgress={targetProgress}
            />
          </div>

          {/* Right Column - Vehicle & Controls */}
          <div className="space-y-6">
            <SessionControls
              session={session}
              walletBalance={walletBalance}
              onPauseResume={handlePauseResume}
              onStop={handleManualStop}
            />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <SessionDialogs
        showTargetReachedDialog={showTargetReachedDialog}
        showResumeDialog={showResumeDialog}
        showCompletionDialog={showCompletionDialog}
        showInsufficientFundsDialog={showInsufficientFundsDialog}
        showModernAlert={showModernAlert}
        session={session}
        timeElapsed={timeElapsed}
        walletBalance={walletBalance}
        finalCost={finalCost}
        resumeAmount={resumeAmount}
        isDialogLoading={isDialogLoading}
        alertConfig={alertConfig}
        onCloseTargetDialog={() => {
          setShowTargetReachedDialog(false)
          setFinalCost(session.chargingStats.sessionCost)
          setShowCompletionDialog(true)
        }}
        onResumeFromTarget={() => {
          setShowTargetReachedDialog(false)
          setShowResumeDialog(true)
        }}
        onCloseResumeDialog={() => setShowResumeDialog(false)}
        onResumeAmountChange={setResumeAmount}
        onConfirmResume={handleResumeWithNewTarget}
        onCloseCompletionDialog={() => setShowCompletionDialog(false)}
        onCloseInsufficientFundsDialog={() =>
          setShowInsufficientFundsDialog(false)
        }
        onAddFunds={() => {
          const newBalance = walletBalance + 50
          setWalletBalance(newBalance)
          MOCK_WALLET_BALANCE = newBalance
          setShowInsufficientFundsDialog(false)
          setShowResumeDialog(true)
        }}
        onCloseModernAlert={() => {
          setShowModernAlert(false)
          setAlertConfig(null)
        }}
        onConfirmModernAlert={() => {
          if (alertConfig) {
            alertConfig.onConfirm()
          }
        }}
        setIsDialogLoading={setIsDialogLoading}
      />
    </div>
  )
}

// Helper icon components
const RefreshIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
    <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
  </svg>
)

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    charging: {
      label: "Charging",
      color: "bg-green-50 text-green-700",
      icon: <ZapIcon className="w-3 h-3" />,
    },
    paused: {
      label: "Paused",
      color: "bg-amber-50 text-amber-700",
      icon: <PauseIcon className="w-3 h-3" />,
    },
    completed: {
      label: "Completed",
      color: "bg-blue-50 text-blue-700",
      icon: <CheckIcon className="w-3 h-3" />,
    },
  }
  const config = statusConfig[status as keyof typeof statusConfig]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

const ZapIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
  </svg>
)

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

const PauseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
)

export default MainPage
