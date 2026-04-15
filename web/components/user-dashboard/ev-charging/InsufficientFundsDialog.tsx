// components/InsufficientFundsDialog.tsx
"use client"

import React from "react"
import { AlertTriangle, Wallet, DollarSign, Plus, X } from "lucide-react"

interface InsufficientFundsDialogProps {
  isOpen: boolean
  onClose: () => void
  requiredAmount: number
  currentBalance: number
  onAddFunds: () => void
}

const InsufficientFundsDialog: React.FC<InsufficientFundsDialogProps> = ({
  isOpen,
  onClose,
  requiredAmount,
  currentBalance,
  onAddFunds,
}) => {
  if (!isOpen) return null

  const deficit = requiredAmount - currentBalance

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

          {/* Warning icon */}
          <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-10 h-10 text-amber-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900">
            Insufficient Funds
          </h2>
          <p className="text-gray-500 mt-2">
            You don&apos;t have enough balance in your wallet to resume
            charging.
          </p>

          {/* Balance Details */}
          <div className="mt-6 bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Required Amount</span>
              </div>
              <span className="font-semibold text-gray-900 text-lg">
                ${requiredAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">Current Balance</span>
              </div>
              <span className="font-semibold text-red-600">
                ${currentBalance.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Deficit</span>
                <span className="font-semibold text-amber-600">
                  ${deficit.toFixed(2)} short
                </span>
              </div>
            </div>
          </div>

          {/* Warning message */}
          <div className="mt-4 p-3 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-700">
              Please add funds to your wallet to continue with the charging
              session.
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onAddFunds}
              className="flex-1 py-2.5 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Funds ($50)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InsufficientFundsDialog
