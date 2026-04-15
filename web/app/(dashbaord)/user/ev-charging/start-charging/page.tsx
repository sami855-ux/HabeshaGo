"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import ConnectionDialog from "@/components/user-dashboard/ev-charging/ConnectionDialog"
import ReservationDetails from "@/components/user-dashboard/ev-charging/ReservationDetails"
import VerificationPanel from "@/components/user-dashboard/ev-charging/VerificationPanel"

// Mock reservation data (API ready)
const MOCK_RESERVATION = {
  id: "res_123456",
  stationName: "EV Gateway Station",
  chargerId: "CH-42",
  connectorType: "CCS Combo 2",
  reservedDate: "2024-05-15",
  reservedTime: "14:30",
  address: "123 Electric Ave, Silicon Valley, CA 94025",
  validUntil: "2026-05-15T15:00:00Z",
  status: "active",
  pricePerKwh: 0.45,
}

const StartCharging: React.FC = () => {
  const router = useRouter()
  const [reservation] = useState(MOCK_RESERVATION)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationMethod, setVerificationMethod] = useState<
    "qr" | "manual" | null
  >(null)
  const [showConnectionDialog, setShowConnectionDialog] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle")

  const isReservationExpired = new Date(reservation.validUntil) < new Date()

  const handleVerificationSuccess = (method: "qr" | "manual") => {
    setIsVerified(true)
    setVerificationMethod(method)
  }

  const handleStartCharging = () => {
    if (!isVerified) return
    setShowConnectionDialog(true)
    setConnectionStatus("connecting")

    // Simulate connection process
    setTimeout(() => {
      setConnectionStatus("connected")

      // Navigate after successful connection
      setTimeout(() => {
        setShowConnectionDialog(false)
        router.push("/user/ev-charging/moniter-session")
      }, 1500)
    }, 2500)
  }

  const handleRetryConnection = () => {
    setConnectionStatus("connecting")
    setTimeout(() => {
      setConnectionStatus("connected")
      setTimeout(() => {
        setShowConnectionDialog(false)
        router.push("/user/ev-charging/moniter-session")
      }, 1500)
    }, 2500)
  }

  const handleBack = () => {
    console.log("Navigate back to My Reservations")
    router.back()
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        {/* Navigation */}
        <button
          onClick={handleBack}
          className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-all duration-200"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Back to tickets</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Start Charging
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Verify your reservation and begin your session
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Reservation Details */}
          <div className="lg:col-span-1">
            <ReservationDetails reservation={reservation} />
          </div>

          {/* Right Column - Verification & Action */}
          <div className="lg:col-span-2">
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

        {/* Trust & Safety */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <ShieldIcon className="w-3 h-3" />
            <span>Secure connection</span>
          </div>
          <div className="w-px h-3 bg-gray-200" />
          <div className="flex items-center gap-1">
            <WifiIcon className="w-3 h-3" />
            <span>OCPP 2.0.1</span>
          </div>
          <div className="w-px h-3 bg-gray-200" />
          <div className="flex items-center gap-1">
            <LeafIcon className="w-3 h-3" />
            <span>Carbon neutral</span>
          </div>
        </div>
      </div>

      {/* Connection Dialog */}
      <ConnectionDialog
        isOpen={showConnectionDialog}
        connectionStatus={connectionStatus}
        onRetry={handleRetryConnection}
        onClose={() => setShowConnectionDialog(false)}
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
