"use client"

import type { Payment } from "../types"

interface SummaryCardsProps {
  data: Payment[]
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const totalAmount = data.reduce((sum, p) => sum + p.amount, 0)
  const successCount = data.filter((p) => p.status === "SUCCESS").length
  const successRate = data.length > 0 ? (successCount / data.length) * 100 : 0
  const avgAmount = data.length > 0 ? totalAmount / data.length : 0
  const pendingCount = data.filter((p) => p.status === "PENDING").length
  const pendingAmount = data
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500 mb-1">Total Payments</p>
        <p className="text-2xl font-bold text-gray-900">
          {formatCurrency(totalAmount, "ETB")}
        </p>
        <p className="text-xs text-gray-400 mt-1">{data.length} transactions</p>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500 mb-1">Success Rate</p>
        <p className="text-2xl font-bold text-green-600">
          {successRate.toFixed(1)}%
        </p>
        <p className="text-xs text-gray-400 mt-1">{successCount} successful</p>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500 mb-1">Average Payment</p>
        <p className="text-2xl font-bold text-gray-900">
          {formatCurrency(avgAmount, "ETB")}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500 mb-1">Pending Payments</p>
        <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        <p className="text-xs text-gray-400 mt-1">
          {formatCurrency(pendingAmount, "ETB")}
        </p>
      </div>
    </div>
  )
}
