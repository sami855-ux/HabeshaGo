"use client"

import { useState, useEffect } from "react"
import { X, Check, SlidersHorizontal, Calendar, DollarSign } from "lucide-react"
import { StatusBadge } from "./StatusBadge"
import { MethodIcon } from "./MethodIcon"
import type { Filters } from "@/types/payment"

interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
  filters: Filters
  onFilterChange: (filters: Filters) => void
  onClearFilters: () => void
  activeFilterCount: number
}

export function FilterSheet({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterCount,
}: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters)

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleStatusChange = (status: string, checked: boolean) => {
    setLocalFilters((prev) => ({
      ...prev,
      status: checked
        ? [...prev.status, status]
        : prev.status.filter((s) => s !== status),
    }))
  }

  const handleMethodChange = (method: string, checked: boolean) => {
    setLocalFilters((prev) => ({
      ...prev,
      method: checked
        ? [...prev.method, method]
        : prev.method.filter((m) => m !== method),
    }))
  }

  const handleFlowChange = (flow: string, checked: boolean) => {
    setLocalFilters((prev) => ({
      ...prev,
      flow: checked
        ? [...prev.flow, flow]
        : prev.flow.filter((f) => f !== flow),
    }))
  }

  const handleGatewayChange = (gateway: string, checked: boolean) => {
    setLocalFilters((prev) => ({
      ...prev,
      gateway: checked
        ? [...prev.gateway, gateway]
        : prev.gateway.filter((g) => g !== gateway),
    }))
  }

  const handleCurrencyChange = (currency: string, checked: boolean) => {
    setLocalFilters((prev) => ({
      ...prev,
      currency: checked
        ? [...prev.currency, currency]
        : prev.currency.filter((c) => c !== currency),
    }))
  }

  const handleApply = () => {
    onFilterChange(localFilters)
    onClose()
  }

  const handleClear = () => {
    const clearedFilters: Filters = {
      status: [],
      method: [],
      flow: [],
      dateRange: { from: "", to: "" },
      amountRange: { min: "", max: "" },
      gateway: [],
      currency: [],
    }
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
    onClearFilters()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/25 bg-opacity-50 transition-opacity z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <SlidersHorizontal className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              {activeFilterCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Filter Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "PENDING",
                    "SUCCESS",
                    "FAILED",
                    "CANCELLED",
                    "REFUNDED",
                  ].map((status) => (
                    <label
                      key={status}
                      className={`
                        flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                        ${
                          localFilters.status.includes(status)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={localFilters.status.includes(status)}
                        onChange={(e) =>
                          handleStatusChange(status, e.target.checked)
                        }
                        className="sr-only"
                      />
                      <StatusBadge status={status} />
                      {localFilters.status.includes(status) && (
                        <Check className="w-4 h-4 text-blue-500 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["WALLET", "TELEBIRR", "CBE", "BANK_TRANSFER", "CASH"].map(
                    (method) => (
                      <label
                        key={method}
                        className={`
                        flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                        ${
                          localFilters.method.includes(method)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }
                      `}
                      >
                        <div className="flex items-center space-x-2">
                          <MethodIcon method={method} />
                          <span className="text-sm">
                            {method.replace("_", " ")}
                          </span>
                        </div>
                        {localFilters.method.includes(method) && (
                          <Check className="w-4 h-4 text-blue-500 ml-auto" />
                        )}
                      </label>
                    ),
                  )}
                </div>
              </div>

              {/* Payment Flow Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Flow
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["WALLET_TOPUP", "WALLET_PAYMENT", "DIRECT_PAYMENT"].map(
                    (flow) => (
                      <label
                        key={flow}
                        className={`
                        flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                        ${
                          localFilters.flow.includes(flow)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }
                      `}
                      >
                        <span className="text-sm">
                          {flow.replace("_", " ")}
                        </span>
                        {localFilters.flow.includes(flow) && (
                          <Check className="w-4 h-4 text-blue-500 ml-auto" />
                        )}
                      </label>
                    ),
                  )}
                </div>
              </div>

              {/* Gateway Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Gateway
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["CHAPA", "INTERNAL"].map((gateway) => (
                    <label
                      key={gateway}
                      className={`
                        flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                        ${
                          localFilters.gateway.includes(gateway)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }
                      `}
                    >
                      <span className="text-sm">{gateway}</span>
                      {localFilters.gateway.includes(gateway) && (
                        <Check className="w-4 h-4 text-blue-500 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Currency Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Currency
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["ETB", "USD"].map((currency) => (
                    <label
                      key={currency}
                      className={`
                        flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                        ${
                          localFilters.currency.includes(currency)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }
                      `}
                    >
                      <span className="text-sm font-medium">{currency}</span>
                      {localFilters.currency.includes(currency) && (
                        <Check className="w-4 h-4 text-blue-500 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={localFilters.dateRange.from}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        dateRange: {
                          ...localFilters.dateRange,
                          from: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={localFilters.dateRange.to}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        dateRange: {
                          ...localFilters.dateRange,
                          to: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="To"
                  />
                </div>
              </div>

              {/* Amount Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  Amount Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localFilters.amountRange.min}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        amountRange: {
                          ...localFilters.amountRange,
                          min: e.target.value,
                        },
                      })
                    }
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localFilters.amountRange.max}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        amountRange: {
                          ...localFilters.amountRange,
                          max: e.target.value,
                        },
                      })
                    }
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center justify-between space-x-3">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Clear all
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
