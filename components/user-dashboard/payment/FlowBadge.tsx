"use client"

const flowColors = {
  WALLET_TOPUP: "bg-blue-100 text-blue-800",
  WALLET_PAYMENT: "bg-indigo-100 text-indigo-800",
  DIRECT_PAYMENT: "bg-purple-100 text-purple-800",
}

interface FlowBadgeProps {
  flow: string
}

export function FlowBadge({ flow }: FlowBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${flowColors[flow as keyof typeof flowColors] || "bg-gray-100"}`}
    >
      {flow.replace("_", " ")}
    </span>
  )
}
