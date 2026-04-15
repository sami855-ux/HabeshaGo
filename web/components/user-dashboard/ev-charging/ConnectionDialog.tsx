import React, { useEffect, useState } from "react"
import { X, Loader2, Zap, Wifi, Shield, AlertCircle } from "lucide-react"

interface ConnectionDialogProps {
  isOpen: boolean
  connectionStatus: "idle" | "connecting" | "connected" | "error"
  onRetry: () => void
  onClose: () => void
}

const ConnectionDialog: React.FC<ConnectionDialogProps> = ({
  isOpen,
  connectionStatus,
  onRetry,
  onClose,
}) => {
  const [animationStep, setAnimationStep] = useState(0)
  const [particles, setParticles] = useState<
    Array<{ x: number; y: number; delay: number }>
  >([])

  if (!isOpen) return null

  // Custom success checkmark SVG
  const SuccessCheckmark = () => (
    <svg
      className="w-12 h-12 text-green-500"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        className="stroke-current"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M8 12L11 15L16 9"
        className="stroke-current"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )

  // Custom success circle with check
  const SuccessCircle = () => (
    <div className="relative">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg animate-bounce">
        <SuccessCheckmark />
      </div>
      <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20" />
    </div>
  )

  // Custom connecting animation
  const ConnectingAnimation = () => (
    <div className="relative">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
        <Zap className="w-10 h-10 text-white animate-pulse" />
      </div>
      <div className="absolute inset-0 rounded-full border-4 border-blue-400 border-t-transparent animate-spin" />
      <div className="absolute -inset-2 rounded-full border border-blue-300/30 animate-pulse" />

      {/* Floating particles */}
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  )

  // Custom error animation
  const ErrorAnimation = () => (
    <div className="relative">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
        <AlertCircle className="w-12 h-12 text-white" />
      </div>
      <div className="absolute inset-0 rounded-full bg-red-500 animate-pulse opacity-30" />
      <svg className="absolute -inset-2 w-28 h-28 animate-spin-slow">
        <circle
          cx="56"
          cy="56"
          r="52"
          className="stroke-red-300/30"
          strokeWidth="2"
          fill="none"
          strokeDasharray="100 200"
        />
      </svg>
    </div>
  )

  const getStatusContent = () => {
    switch (connectionStatus) {
      case "connecting":
        return {
          title: "Establishing Connection",
          subtitle: "Securely linking to EV charging station",
          icon: <ConnectingAnimation />,
          steps: [
            {
              text: "Locating nearby charger",
              completed: animationStep >= 0,
              icon: "📍",
            },
            {
              text: "Initiating secure handshake",
              completed: animationStep >= 1,
              icon: "🔐",
            },
            {
              text: "Verifying credentials",
              completed: animationStep >= 2,
              icon: "✓",
            },
            {
              text: "Starting power flow",
              completed: animationStep >= 3,
              icon: "⚡",
            },
          ],
          showRetry: false,
        }
      case "connected":
        return {
          title: "Ready to Charge",
          subtitle: "Connection established successfully",
          icon: <SuccessCircle />,
          steps: [
            { text: "Charger detected", completed: true, icon: "✓" },
            { text: "Secure handshake complete", completed: true, icon: "✓" },
            { text: "Authentication verified", completed: true, icon: "✓" },
            { text: "Power delivery started", completed: true, icon: "✓" },
          ],
          showRetry: false,
        }
      case "error":
        return {
          title: "Connection Failed",
          subtitle: "Unable to establish connection",
          icon: <ErrorAnimation />,
          steps: [
            {
              text: "Charger unresponsive",
              completed: false,
              error: true,
              icon: "⚠",
            },
            {
              text: "Check physical connection",
              completed: false,
              error: true,
              icon: "🔌",
            },
            {
              text: "Verify charger status",
              completed: false,
              error: true,
              icon: "📡",
            },
          ],
          showRetry: true,
        }
      default:
        return {
          title: "",
          subtitle: "",
          icon: null,
          steps: [],
          showRetry: false,
        }
    }
  }

  const content = getStatusContent()

  // Custom step indicator
  const StepIndicator = ({ completed, error, icon, text, isActive }: any) => {
    if (completed) {
      return (
        <div className="flex items-center gap-3 text-sm group">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-sm">
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-gray-700 font-medium">{text}</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center gap-3 text-sm group">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-400 to-rose-500 flex items-center justify-center shadow-sm">
            <span className="text-xs text-white">!</span>
          </div>
          <span className="text-red-600 font-medium">{text}</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-3 text-sm group">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            isActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50"
          }`}
        >
          {isActive && (
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          )}
        </div>
        <span
          className={isActive ? "text-gray-900 font-medium" : "text-gray-400"}
        >
          {text}
        </span>
        {isActive && (
          <Loader2 className="w-3 h-3 text-blue-500 animate-spin ml-auto" />
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-300">
      <div className="relative max-w-xl w-full">
        {/* Glassmorphic background effect */}
        <div className="absolute inset-0 rounded-2xl shadow-2xl " />

        <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl">
          {/* Close button */}
          {connectionStatus !== "connecting" && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="p-8 text-center">
            {/* Animated Icon */}
            <div className="flex justify-center mb-8">{content.icon}</div>

            {/* Title & Subtitle */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                {content.title}
              </h2>
              <p className="text-gray-500 text-sm">{content.subtitle}</p>
            </div>

            {/* Connection Steps - Modern Design */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm">
              <div className="space-y-4">
                {content.steps.map((step, index) => (
                  <StepIndicator
                    key={index}
                    completed={step.completed}
                    error={step.error}
                    icon={step.icon}
                    text={step.text}
                    isActive={
                      connectionStatus === "connecting" &&
                      !step.completed &&
                      index === animationStep
                    }
                  />
                ))}
              </div>
            </div>

            {/* Modern Security Badges */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                <Shield className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-gray-600 font-medium">
                  256-bit SSL
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                <Wifi className="w-3 h-3 text-green-500" />
                <span className="text-xs text-gray-600 font-medium">
                  OCPP 2.0.1
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-xs text-gray-600 font-medium">
                  ISO 15118
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {content.showRetry && (
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={onRetry}
                  className="flex-1 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Retry Connection
                </button>
              </div>
            )}

            {connectionStatus === "connecting" && (
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs text-blue-600 font-medium">
                    Establishing secure tunnel...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Modern Progress Bar */}
          {connectionStatus === "connecting" && (
            <div className="absolute bottom-0 left-0 right-0">
              <div className="h-1 bg-gray-100">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${(animationStep / 3) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add custom animations to global styles */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) scale(1.5);
            opacity: 1;
          }
        }

        .animate-float {
          animation: float 2s ease-in-out infinite;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default ConnectionDialog
