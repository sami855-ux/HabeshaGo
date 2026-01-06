"use client"

import { TransactionTable } from "@/components/user-dashboard/transactions/TransactionTable"
import { Transaction } from "@/lib/types"
import { subDays } from "date-fns"
import { Suspense } from "react"

// Mock data generator - moved outside component for better performance
function generateMockTransactions(): Transaction[] {
  const types: Transaction["type"][] = ["Tax", "Transfer", "Payment"]
  const methods: Transaction["paymentMethod"][] = [
    "Telebirr",
    "Bank",
    "Card",
    "Manual",
  ]
  const statuses: Transaction["status"][] = ["SUCCESS", "PENDING", "FAILED"]

  return Array.from({ length: 50 }, (_, i) => ({
    id: `txn_${i + 1}`,
    date: subDays(new Date(), Math.floor(Math.random() * 30)),
    referenceId: `REF${String(i + 1000).padStart(6, "0")}`,
    type: types[Math.floor(Math.random() * types.length)],
    amount: Math.floor(Math.random() * 10000) + 100,
    paymentMethod: methods[Math.floor(Math.random() * methods.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    description: `Transaction for ${types[
      Math.floor(Math.random() * types.length)
    ].toLowerCase()}`,
    hasReceipt: Math.random() > 0.3,
    counterparty: `Counterparty ${String.fromCharCode(65 + (i % 26))}`,
    category: ["Business", "Personal", "Investment"][i % 3] as
      | "Business"
      | "Personal"
      | "Investment",
  }))
}

// Loading component for better UX
function TransactionTableSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>
      <div className="space-y-4">
        <div className="h-12 bg-muted rounded" />
        <div className="h-64 bg-muted rounded" />
        <div className="h-12 bg-muted rounded" />
      </div>
    </div>
  )
}

export default function TransactionHistoryPage() {
  // Generate mock data once on component mount
  const mockTransactions = generateMockTransactions()

  // Calculate some statistics for better UX
  const totalAmount = mockTransactions.reduce((sum, t) => sum + t.amount, 0)
  const successfulCount = mockTransactions.filter(
    (t) => t.status === "SUCCESS"
  ).length

  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* Main Table with Suspense */}
        <Suspense fallback={<TransactionTableSkeleton />}>
          <TransactionTable data={mockTransactions} />
        </Suspense>

        {/* Help/Info Section */}
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-2">
            Need help with your transactions?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you have questions about any transaction, please contact our
            support team.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="text-sm">
              <span className="font-medium">Support Email: </span>
              <a
                href="mailto:support@example.com"
                className="text-primary hover:underline"
              >
                support@example.com
              </a>
            </div>
            <div className="text-sm">
              <span className="font-medium">Support Phone: </span>
              <a
                href="tel:+251911000000"
                className="text-primary hover:underline"
              >
                +251 911 000 000
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
