"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingBag,
  Phone,
  Wifi,
  MoreVertical,
  Filter,
  ArrowUpDown,
} from "lucide-react"
import { useState } from "react"

interface Transaction {
  id: number
  title: string
  description: string
  amount: number
  type: "sent" | "received" | "purchase"
  timestamp: string
  status: "completed" | "pending" | "failed"
  icon: React.ComponentType<any>
}

export default function RecentTransactions() {
  const [transactions] = useState<Transaction[]>([
    {
      id: 1,
      title: "Sent to John Doe",
      description: "Mobile transfer",
      amount: -500.0,
      type: "sent",
      timestamp: "10:30 AM • Today",
      status: "completed",
      icon: ArrowUpRight,
    },
    {
      id: 2,
      title: "Received from Sarah",
      description: "Payment for dinner",
      amount: 1200.0,
      type: "received",
      timestamp: "Yesterday • 8:45 PM",
      status: "completed",
      icon: ArrowDownLeft,
    },
    {
      id: 3,
      title: "Supermarket Purchase",
      description: "City Mart",
      amount: -345.75,
      type: "purchase",
      timestamp: "Nov 28 • 3:15 PM",
      status: "completed",
      icon: ShoppingBag,
    },
    {
      id: 4,
      title: "Airtime Top-up",
      description: "+251 9xx xxx xxx",
      amount: -100.0,
      type: "purchase",
      timestamp: "Nov 27 • 11:20 AM",
      status: "completed",
      icon: Phone,
    },
    {
      id: 5,
      title: "Internet Bill",
      description: "Ethio Telecom",
      amount: -899.0,
      type: "purchase",
      timestamp: "Nov 26 • 2:00 PM",
      status: "pending",
      icon: Wifi,
    },
  ])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case "sent":
        return "text-red-500 bg-red-500/10"
      case "received":
        return "text-green-500 bg-green-500/10"
      case "purchase":
        return "text-blue-500 bg-blue-500/10"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Recent Transactions</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const Icon = transaction.icon
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-xl ${getIconColor(transaction.type)}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">
                      {transaction.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {transaction.timestamp}
                      </span>
                      <Badge
                        variant={getStatusVariant(transaction.status)}
                        className="text-xs"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span
                    className={`text-lg font-semibold ${
                      transaction.amount > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}ETB{" "}
                    {Math.abs(transaction.amount).toLocaleString()}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <Button variant="outline" className="w-full mt-6" asChild>
          <a href="/wallet/transactions">View All Transactions</a>
        </Button>
      </CardContent>
    </Card>
  )
}
