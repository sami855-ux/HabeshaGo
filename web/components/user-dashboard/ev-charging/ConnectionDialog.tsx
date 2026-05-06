"use client"

import React from "react"
import { X, Loader2, Zap, Wifi, Shield, AlertCircle } from "lucide-react"

interface ConnectionDialogProps {
  isOpen: boolean
  connectionStatus: "idle" | "connecting" | "connected" | "error"
  animationStep: number
  onRetry: () => void
  onClose: () => void
}

const ConnectionDialog: React.FC<ConnectionDialogProps> = ({
  isOpen,
  connectionStatus,
  animationStep,
  onRetry,
  onClose,
}) => {
  if (!isOpen) return null

  // ===== ICONS =====

  const SuccessCheckmark = () => (
    <svg className="w-12 h-12 text-green-500" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="10"
        className="stroke-current"
        strokeWidth="2"
      />
      <path
        d="M8 12L11 15L16 9"
        className="stroke-current"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )

  const SuccessCircle = () => (
    <div className="relative">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg animate-bounce">
        <SuccessCheckmark />
      </div>
      <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20" />
    </div>
  )

  const ConnectingAnimation = () => (
    <div className="relative">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
        <Zap className="w-10 h-10 text-white animate-pulse" />
      </div>
      <div className="absolute inset-0 rounded-full border-4 border-blue-400 border-t-transparent animate-spin" />
    </div>
  )

  const ErrorAnimation = () => (
    <div className="relative">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
        <AlertCircle className="w-12 h-12 text-white" />
      </div>
      <div className="absolute inset-0 rounded-full bg-red-500 animate-pulse opacity-30" />
    </div>
  )

  const IdleAnimation = () => (
    <div className="relative">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-xl">
        <Zap className="w-10 h-10 text-white opacity-50" />
      </div>
    </div>
  )

  // ===== CONTENT =====

  const getStatusContent = () => {
    switch (connectionStatus) {
      case "connecting":
        return {
          title: "Establishing Connection",
          subtitle: "Securely linking to EV charging station",
          icon: <ConnectingAnimation />,
          steps: [
            {
              text: "Initiating secure handshake",
              completed: animationStep >= 1,
              active: animationStep === 1,
            },
            {
              text: "Verifying credentials",
              completed: animationStep >= 2,
              active: animationStep === 2,
            },
            {
              text: "Starting power flow",
              completed: animationStep >= 3,
              active: animationStep === 3,
            },
          ],
          showRetry: false,
          showClose: false,
        }

      case "connected":
        return {
          title: "Ready to Charge",
          subtitle: "Connection established successfully",
          icon: <SuccessCircle />,
          steps: [
            { text: "Charger detected", completed: true },
            { text: "Secure handshake complete", completed: true },
            { text: "Authentication verified", completed: true },
            { text: "Power delivery started", completed: true },
          ],
          showRetry: false,
          showClose: true,
        }

      case "error":
        return {
          title: "Connection Failed",
          subtitle: "Unable to establish connection",
          icon: <ErrorAnimation />,
          steps: [
            { text: "Connection timeout", error: true },
            { text: "Check physical connection", error: true },
            { text: "Verify charger is powered on", error: true },
          ],
          showRetry: true,
          showClose: true,
        }

      case "idle":
      default:
        return {
          title: "Ready to Connect",
          subtitle: "Press start to begin charging",
          icon: <IdleAnimation />,
          steps: [
            { text: "Waiting to start", pending: true },
            { text: "Press 'Start Charging' to begin", pending: true },
          ],
          showRetry: false,
          showClose: true,
        }
    }
  }

  const content = getStatusContent()

  const StepIndicator = ({ step, index }: any) => {
    const isCompleted = step.completed
    const isError = step.error
    const isActive = step.active
    const isPending = step.pending

    if (isCompleted) {
      return (
        <div className="flex items-center gap-3 text-sm">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
            ✓
          </div>
          <span className="text-gray-700 font-medium">{step.text}</span>
        </div>
      )
    }

    if (isError) {
      return (
        <div className="flex items-center gap-3 text-sm">
          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
            !
          </div>
          <span className="text-red-600 font-medium">{step.text}</span>
        </div>
      )
    }

    if (isPending) {
      return (
        <div className="flex items-center gap-3 text-sm opacity-50">
          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
          </div>
          <span className="text-gray-500">{step.text}</span>
        </div>
      )
    }

    // Active or pending step
    return (
      <div className="flex items-center gap-3 text-sm">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            isActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50"
          }`}
        >
          {isActive && (
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          )}
        </div>
        <span
          className={isActive ? "text-blue-600 font-medium" : "text-gray-500"}
        >
          {step.text}
        </span>
        {isActive && (
          <Loader2 className="w-3 h-3 animate-spin text-blue-500 ml-auto" />
        )}
      </div>
    )
  }

  // ===== UI =====

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-4xl shadow-xl relative p-6 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        {content.showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Icon */}
        <div className="flex justify-center mb-6">{content.icon}</div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center text-gray-800">
          {content.title}
        </h2>
        <p className="text-gray-500 text-center text-sm mb-6">
          {content.subtitle}
        </p>

        {/* Steps */}
        <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
          {content.steps.map((step, i) => (
            <StepIndicator key={i} step={step} index={i} />
          ))}
        </div>

        {/* Actions */}
        {content.showRetry && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onRetry}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Live status message */}
        {connectionStatus === "connecting" && (
          <p className="text-center text-xs text-blue-600 mt-4 animate-pulse font-medium">
            Establishing secure connection...
          </p>
        )}

        {connectionStatus === "idle" && (
          <p className="text-center text-xs text-gray-500 mt-4">
            Press the button below to start charging
          </p>
        )}
      </div>
    </div>
  )
}

export default ConnectionDialog
