"use client"

import { TransactionTable } from "@/components/user-dashboard/transactions/TransactionTable"
import { Transaction } from "@/lib/types"
import { subDays } from "date-fns"
import { Suspense } from "react"

// Mock data generator aligned with WalletTransaction model
function generateMockTransactions(): Transaction[] {
  const types: Transaction["type"][] = ["Payment", "Transfer", "Tax"]

  const statuses: Transaction["status"][] = ["SUCCESS", "PENDING", "FAILED"]

  let runningBalance = 50000

  return Array.from({ length: 50 }, (_, i) => {
    const amount = Math.floor(Math.random() * 5000) + 100
    const isCredit = Math.random() > 0.5

    runningBalance += isCredit ? amount : -amount

    return {
      id: i + 1,
      walletId: 1,

      amount,
      balanceAfter: runningBalance,

      type: isCredit ? "TRANSFER_IN" : "PAYMENT",
      status: statuses[Math.floor(Math.random() * statuses.length)],

      reference: `TXN-${String(i + 1000).padStart(6, "0")}`,
      description: isCredit ? "Incoming transfer" : "Payment for ticket",

      metadata: {
        source: isCredit ? "Telebirr" : "Ticketing",
      },

      createdAt: subDays(new Date(), Math.floor(Math.random() * 30)),
    }
  })
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
  const mockTransactions = generateMockTransactions()

  // Useful stats (optional)
  const totalAmount = mockTransactions.reduce((sum, t) => sum + t.amount, 0)

  const successfulCount = mockTransactions.filter(
    (t) => t.status === "SUCCESS",
  ).length

  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* Main Table */}
        <Suspense fallback={<TransactionTableSkeleton />}>
          <TransactionTable data={mockTransactions} />
        </Suspense>

        {/* Help Section */}
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
                href="mailto:support@habeshago.com"
                className="text-primary hover:underline"
              >
                support@habeshago.com
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
