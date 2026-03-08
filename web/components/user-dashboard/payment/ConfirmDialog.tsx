"use client"

import { AlertTriangle, AlertCircle, Info } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "warning" | "info"
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const colors = {
    danger: {
      icon: AlertTriangle,
      iconColor: "text-red-600",
      bgColor: "bg-red-100",
      buttonColor: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: AlertCircle,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-100",
      buttonColor: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      icon: Info,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
  }

  const config = colors[type]
  const Icon = config.icon

  return (
    <>
      <div
        className="fixed inset-0 bg-black/25 bg-opacity-50 z-50"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 max-w-md w-full p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-2 rounded-full ${config.bgColor}`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        <p className="text-gray-500 mb-6">{message}</p>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${config.buttonColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>
  )
}
