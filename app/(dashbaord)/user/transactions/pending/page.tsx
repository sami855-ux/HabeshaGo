"use client"

import PendingTransactionTable from "@/components/user-dashboard/transactions/pending-transaction"
import { Transaction } from "@/lib/types"
import { subDays } from "date-fns"
import { Suspense } from "react"
import { Bell, AlertTriangle, Clock, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Mock data generator with more pending transactions
function generateMockTransactions(): Transaction[] {
  const types: Transaction["type"][] = ["Tax", "Transfer", "Payment"]
  const methods: Transaction["paymentMethod"][] = [
    "Telebirr",
    "Bank",
    "Card",
    "Manual",
  ]

  return Array.from({ length: 75 }, (_, i) => {
    // Generate more pending transactions for this page
    const status: Transaction["status"] =
      i < 45 ? "PENDING" : i < 60 ? "SUCCESS" : "FAILED"

    return {
      id: `pending_txn_${i + 1}`,
      date: subDays(new Date(), Math.floor(Math.random() * 14)), // Recent dates for pending
      referenceId: `PEND${String(i + 2000).padStart(6, "0")}`,
      type: types[Math.floor(Math.random() * types.length)],
      amount: Math.floor(Math.random() * 15000) + 100, // Higher amounts for visibility
      paymentMethod: methods[Math.floor(Math.random() * methods.length)],
      status,
      description: `Pending ${types[
        Math.floor(Math.random() * types.length)
      ].toLowerCase()} transaction`,
      hasReceipt: Math.random() > 0.5,
      counterparty: `Counterparty ${String.fromCharCode(65 + (i % 26))}`,
      category: ["Business", "Personal", "Investment"][i % 3] as
        | "Business"
        | "Personal"
        | "Investment",
    }
  })
}

// Loading skeleton specific for pending transactions
function PendingTransactionSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-muted rounded-lg" />
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-4 w-96 bg-muted rounded" />
          </div>
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-7 w-32 bg-muted rounded" />
                </div>
                <div className="h-10 w-10 bg-muted rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="h-10 w-full bg-muted rounded-lg" />

      {/* Table skeleton */}
      <div className="space-y-4">
        <div className="h-12 w-full bg-muted rounded" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 w-full bg-muted rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}

// Pending transaction tips component
function PendingTransactionTips() {
  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2 text-amber-800 dark:text-amber-300">
              Pending Transaction Tips
            </h3>
            <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-400">
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  Most pending transactions complete within 24-48 hours
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Use the "Expedite" option for urgent transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <Bell className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Enable notifications to track completion status</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Quick actions component
function PendingQuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" className="gap-2">
        <Bell className="h-4 w-4" />
        Enable All Notifications
      </Button>
      <Button variant="outline" className="gap-2">
        <Zap className="h-4 w-4" />
        Bulk Expedite
      </Button>
      <Button variant="outline" className="gap-2">
        <Clock className="h-4 w-4" />
        Set Reminders
      </Button>
    </div>
  )
}

export default function PendingTransactionsPage() {
  // Generate mock data with more pending transactions
  const mockTransactions = generateMockTransactions()

  // Filter for pending transactions
  const pendingTransactions = mockTransactions.filter(
    (t) => t.status === "PENDING"
  )
  const totalPendingAmount = pendingTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  )
  const avgPendingTime =
    pendingTransactions.length > 0
      ? Math.floor(
          pendingTransactions.reduce((sum, t) => {
            const hoursSince =
              Math.abs(
                subDays(new Date(), 7).getTime() - new Date(t.date).getTime()
              ) /
              (1000 * 60 * 60)
            return sum + hoursSince
          }, 0) / pendingTransactions.length
        )
      : 0

  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* Main Table with Suspense */}
        <Suspense fallback={<PendingTransactionSkeleton />}>
          <PendingTransactionTable data={mockTransactions} />
        </Suspense>

        {/* Help/Info Section - Updated for pending transactions */}
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">
                Need help with pending transactions?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Contact our support team for assistance with transaction delays,
                expediting requests, or status inquiries.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="text-sm">
                  <span className="font-medium">Priority Support: </span>
                  <a
                    href="tel:+251911000001"
                    className="text-primary hover:underline"
                  >
                    +251 911 000 001
                  </a>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Email: </span>
                  <a
                    href="mailto:pending-support@example.com"
                    className="text-primary hover:underline"
                  >
                    pending-support@example.com
                  </a>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Clock className="h-4 w-4" />
                Check Status
              </Button>
              <Button className="gap-2">
                <Zap className="h-4 w-4" />
                Expedite Request
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
