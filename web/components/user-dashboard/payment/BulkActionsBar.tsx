"use client"

import { useState } from "react"
import {
  CheckSquare,
  X,
  Download,
  RefreshCw,
  Ban,
  Archive,
  Printer,
  Mail,
  FileText,
  Tag,
  Shield,
  Trash2,
  ChevronDown,
} from "lucide-react"
import type { BulkAction } from "@/types/payment"

interface BulkActionsBarProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkAction: (action: BulkAction) => void
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkAction,
}: BulkActionsBarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const bulkActions = [
    {
      id: "export" as BulkAction,
      label: "Export Selected",
      icon: Download,
      color: "text-gray-700",
    },
    {
      id: "refund" as BulkAction,
      label: "Refund",
      icon: RefreshCw,
      color: "text-purple-600",
    },
    {
      id: "cancel" as BulkAction,
      label: "Cancel",
      icon: Ban,
      color: "text-red-600",
    },
    {
      id: "archive" as BulkAction,
      label: "Archive",
      icon: Archive,
      color: "text-gray-700",
    },
    {
      id: "print" as BulkAction,
      label: "Print Receipts",
      icon: Printer,
      color: "text-gray-700",
    },
    {
      id: "email" as BulkAction,
      label: "Email Details",
      icon: Mail,
      color: "text-gray-700",
    },
    {
      id: "export-csv" as BulkAction,
      label: "Export as CSV",
      icon: FileText,
      color: "text-gray-700",
    },
    {
      id: "tag" as BulkAction,
      label: "Add Tag",
      icon: Tag,
      color: "text-gray-700",
    },
    {
      id: "verify" as BulkAction,
      label: "Verify",
      icon: Shield,
      color: "text-green-600",
    },
    {
      id: "delete" as BulkAction,
      label: "Delete",
      icon: Trash2,
      color: "text-red-600",
    },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 animate-slide-up">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <CheckSquare className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">
            {selectedCount} {selectedCount === 1 ? "payment" : "payments"}{" "}
            selected
          </span>
          <button
            onClick={onClearSelection}
            className="ml-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onBulkAction("export")}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            onClick={() => onBulkAction("refund")}
            className="px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refund</span>
          </button>

          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-1"
            >
              <span>More</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsOpen(false)}
                />
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {bulkActions.slice(3).map((action) => {
                    const Icon = action.icon
                    return (
                      <button
                        key={action.id}
                        onClick={() => {
                          onBulkAction(action.id)
                          setIsOpen(false)
                        }}
                        className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center space-x-2 ${action.color}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{action.label}</span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
