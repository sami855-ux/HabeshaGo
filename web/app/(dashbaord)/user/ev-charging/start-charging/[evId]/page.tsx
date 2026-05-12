"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import ConnectionDialog from "@/components/user-dashboard/ev-charging/ConnectionDialog"
import ReservationDetails from "@/components/user-dashboard/ev-charging/ReservationDetails"
import VerificationPanel from "@/components/user-dashboard/ev-charging/VerificationPanel"
import { getReservationById } from "@/services/ev-reservation"
import { getSocket } from "@/services/socket"
import { toast } from "sonner"

// ✅ formatter (unchanged)
const formatReservation = (reservation: any) => {
  const station = reservation.chargingPoint?.station

  const now = new Date()
  const activeTariff = station?.tariffs?.find(
    (t: any) =>
      new Date(t.validFrom) <= now &&
      (!t.validTo || new Date(t.validTo) >= now),
  )

  const pricePerKwh = activeTariff ? Number(activeTariff.pricePerKwh) : 0

  const start = new Date(reservation.startTime)

  return {
    id: reservation.id,
    stationName: station?.name,
    chargerId: `CH-${reservation.chargingPoint?.id}`,
    connectorType: reservation.chargingPoint?.connectorType,
    reservedDate: start.toISOString().split("T")[0],
    reservedTime: start.toTimeString().slice(0, 5),
    address: station?.address,
    validUntil: reservation.expiresAt || reservation.endTime,
    status: reservation.status.toLowerCase(),
    pricePerKwh,
    slotNumber: reservation.chargingPoint?.slotNumber,
    powerKw: reservation.chargingPoint?.powerKw,
    targetKwh: reservation.targetKwh,
    paymentStatus: reservation.paymentStatus,
    stationId: station?.id,
    stationCode: reservation.chargingPoint?.slotNumber,
  }
}

const StartCharging: React.FC = () => {
  const router = useRouter()
  const params = useParams()

  const reservationId = params?.evId ? Number(params.evId) : null

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reservation", reservationId],
    queryFn: () => getReservationById(reservationId),
    enabled: !!reservationId,
  })

  const socket = getSocket()
  const reservation = data ? formatReservation(data) : null

  const [isVerified, setIsVerified] = useState(false)
  const [verificationMethod, setVerificationMethod] = useState<
    "qr" | "manual" | null
  >(null)

  const [showConnectionDialog, setShowConnectionDialog] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle")

  const [animationStep, setAnimationStep] = useState(0)
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null)

  const [connectionTimeout, setConnectionTimeout] =
    useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!socket) return

    const handleChargingStatus = (data: any) => {
      console.log("📡 Received charging-status event:", data)
      if (data.status === "error") {
        setConnectionStatus("error")
        setAnimationStep(0)

        setShowConnectionDialog(true)

        toast.error(data.message || "Failed to start charging session")

        return
      }
      if (data.status === "connecting") {
        setConnectionStatus("connecting")
        setAnimationStep(data.step || 0)

        if (connectionTimeout) {
          clearTimeout(connectionTimeout)
          setConnectionTimeout(null)
        }
      }

      if (data.status === "connected") {
        setConnectionStatus("connected")

        if (data.sessionId) {
          setActiveSessionId(data.sessionId)
        }

        setTimeout(() => {
          setShowConnectionDialog(false)

          // 🔥 PASS IT TO NEXT PAGE
          router.push(
            `/user/ev-charging/moniter-session?sessionId=${data.sessionId}`,
          )
        }, 1500)
      }

      if (data.status === "error") {
        setConnectionStatus("error")

        if (connectionTimeout) {
          clearTimeout(connectionTimeout)
          setConnectionTimeout(null)
        }
      }
    }

    socket.on("charging-status", handleChargingStatus)

    socket.on("connect", () => {
      console.log("🔌 Socket connected successfully")
    })

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected")
    })

    socket.on("connect_error", (error) => {
      console.log("❌ Socket connection error:", error)
    })

    return () => {
      socket.off("charging-status", handleChargingStatus)
      socket.off("connect")
      socket.off("disconnect")
      socket.off("connect_error")

      if (connectionTimeout) {
        clearTimeout(connectionTimeout)
      }
    }
  }, [socket, router, connectionTimeout])

  // ================= HANDLERS =================
  const handleVerificationSuccess = (method: "qr" | "manual") => {
    setIsVerified(true)
    setVerificationMethod(method)
  }

  const handleStartCharging = () => {
    if (!isVerified || !reservation || !socket) return

    setConnectionStatus("connecting")
    setAnimationStep(0)
    setShowConnectionDialog(true)

    socket.emit("start-charging", {
      reservationId: reservation.id,
    })

    const timeout = setTimeout(() => {
      setConnectionStatus((prev) => (prev === "connecting" ? "error" : prev))
    }, 30000)

    setConnectionTimeout(timeout)
  }

  const handleRetryConnection = () => {
    if (!socket || !reservation) return

    if (connectionTimeout) clearTimeout(connectionTimeout)

    setConnectionStatus("connecting")
    setAnimationStep(0)

    socket.emit("start-charging", {
      reservationId: Number(params.evId),
    })

    const timeout = setTimeout(() => {
      setConnectionStatus((prev) => (prev === "connecting" ? "error" : prev))
    }, 30000)

    setConnectionTimeout(timeout)
  }

  const handleBack = () => router.back()

  const handleCloseDialog = () => {
    setShowConnectionDialog(false)
    setConnectionStatus("idle")
    setAnimationStep(0)

    if (connectionTimeout) {
      clearTimeout(connectionTimeout)
      setConnectionTimeout(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading reservation...
      </div>
    )
  }

  if (isError || !reservation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500">
        <p>Failed to load reservation</p>
        <button
          onClick={handleBack}
          className="mt-4 text-sm text-gray-600 underline"
        >
          Go Back
        </button>
      </div>
    )
  }

  const isReservationExpired = new Date(reservation.validUntil) < new Date()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-500 mb-8 hover:text-gray-700 transition-colors"
        >
          ← Back
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          <ReservationDetails reservation={reservation} />

          <VerificationPanel
            reservation={reservation}
            isReservationExpired={isReservationExpired}
            isVerified={isVerified}
            onVerificationSuccess={handleVerificationSuccess}
            onStartCharging={handleStartCharging}
            onBack={handleBack}
          />
        </div>
      </div>

      <ConnectionDialog
        isOpen={showConnectionDialog}
        connectionStatus={connectionStatus}
        onRetry={handleRetryConnection}
        onClose={handleCloseDialog}
        animationStep={animationStep}
      />
    </div>
  )
}

// Icons
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const WifiIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
)

const LeafIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 2C8 2 4 5 4 10c0 5 4 8 8 8s8-3 8-8c0-5-4-8-8-8z" />
    <path d="M12 2v18" />
    <path d="M12 10l-3-3" />
    <path d="M12 10l3-3" />
  </svg>
)

export default StartCharging
