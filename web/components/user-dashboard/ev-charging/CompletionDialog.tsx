// components/CompletionDialog.tsx
"use client"

import React from "react"
import {
  CheckCircle,
  BatteryCharging,
  Clock,
  DollarSign,
  Wallet,
  X,
} from "lucide-react"

interface CompletionDialogProps {
  isOpen: boolean
  onClose: () => void
  energyDelivered: number
  totalCost: number
  timeElapsed: string
  walletBalance: number
}

const CompletionDialog: React.FC<CompletionDialogProps> = ({
  isOpen,
  onClose,
  energyDelivered,
  totalCost,
  timeElapsed,
  walletBalance,
}) => {
  if (!isOpen) return null

  const newBalance = walletBalance - totalCost

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="relative p-6 text-center">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success icon */}
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900">
            Charging Complete! 🎉
          </h2>
          <p className="text-gray-500 mt-2">
            Your charging session has been successfully completed.
          </p>

          {/* Session Summary */}
          <div className="mt-6 bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <BatteryCharging className="w-4 h-4" />
                <span className="text-sm">Energy Delivered</span>
              </div>
              <span className="font-semibold text-gray-900">
                {energyDelivered.toFixed(2)} kWh
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Time Elapsed</span>
              </div>
              <span className="font-semibold text-gray-900 font-mono">
                {timeElapsed}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Total Cost</span>
              </div>
              <span className="font-semibold text-gray-900 text-lg">
                ${totalCost.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-3 mt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm">Wallet Balance</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500 line-through mr-2">
                    ${walletBalance.toFixed(2)}
                  </span>
                  <span className="font-bold text-green-600">
                    ${newBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Eco impact message */}
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              🌱 You saved approximately {(energyDelivered * 0.35).toFixed(1)}{" "}
              kg of CO₂ emissions!
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose()
                // Navigate to dashboard or receipt page
                console.log("View receipt")
              }}
              className="flex-1 py-2.5 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              View Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompletionDialog
