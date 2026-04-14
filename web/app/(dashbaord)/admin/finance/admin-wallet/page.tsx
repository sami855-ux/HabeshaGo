"use client"

import { useState } from "react"
import {
  Wallet,
  Clock,
  TrendingUp,
  ArrowDownCircle,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  ChevronLeft,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

// shadcn/ui components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"

// --- Mock Data ---
const earningsData = [
  { date: "Jan 1", earnings: 12500 },
  { date: "Jan 2", earnings: 14800 },
  { date: "Jan 3", earnings: 13200 },
  { date: "Jan 4", earnings: 16700 },
  { date: "Jan 5", earnings: 18900 },
  { date: "Jan 6", earnings: 17400 },
  { date: "Jan 7", earnings: 20300 },
  { date: "Jan 8", earnings: 19200 },
  { date: "Jan 9", earnings: 21500 },
  { date: "Jan 10", earnings: 22800 },
  { date: "Jan 11", earnings: 24100 },
  { date: "Jan 12", earnings: 23400 },
  { date: "Jan 13", earnings: 25600 },
  { date: "Jan 14", earnings: 24900 },
]

// Mock withdrawal transactions (ONLY withdrawals)
const withdrawalData = [
  {
    id: "WD-001",
    amount: 5000,
    status: "COMPLETED",
    date: "2026-01-10",
    method: "Bank Transfer",
    reference: "TRF-2026-001",
  },
  {
    id: "WD-002",
    amount: 3000,
    status: "PENDING",
    date: "2026-01-12",
    method: "PayPal",
    reference: "PYPL-2026-002",
  },
  {
    id: "WD-003",
    amount: 7500,
    status: "COMPLETED",
    date: "2026-01-05",
    method: "Bank Transfer",
    reference: "TRF-2026-003",
  },
  {
    id: "WD-004",
    amount: 2000,
    status: "FAILED",
    date: "2026-01-08",
    method: "Credit Card",
    reference: "CC-2026-004",
  },
  {
    id: "WD-005",
    amount: 4500,
    status: "PENDING",
    date: "2026-01-11",
    method: "Bank Transfer",
    reference: "TRF-2026-005",
  },
  {
    id: "WD-006",
    amount: 6200,
    status: "COMPLETED",
    date: "2026-01-03",
    method: "PayPal",
    reference: "PYPL-2026-006",
  },
  {
    id: "WD-007",
    amount: 1800,
    status: "FAILED",
    date: "2026-01-09",
    method: "Credit Card",
    reference: "CC-2026-007",
  },
  {
    id: "WD-008",
    amount: 8900,
    status: "COMPLETED",
    date: "2026-01-01",
    method: "Bank Transfer",
    reference: "TRF-2026-008",
  },
]

// --- Custom Tooltip for Chart ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95"
      >
        <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
          {label}
        </p>
        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
          ETB {payload[0].value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">earnings</p>
      </motion.div>
    )
  }
  return null
}

// --- Wallet Card Component ---
const WalletCard = ({
  title,
  amount,
  icon: Icon,
  trend,
  delay = 0,
}: {
  title: string
  amount: number
  icon: any
  trend?: string
  delay?: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <Card className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
        {/* Decorative green dot pattern */}
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </p>
              <p className="text-3xl font-bold tracking-normal text-gray-900 dark:text-white font-grotesk">
                ETB {amount.toLocaleString()}
              </p>
              {trend && (
                <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span>{trend}</span>
                </p>
              )}
            </div>
            <div className="rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 p-3 shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// --- Status Badge Component ---
const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    COMPLETED: {
      color:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      icon: CheckCircle,
      label: "Completed",
    },
    PENDING: {
      color:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      icon: Clock,
      label: "Pending",
    },
    FAILED: {
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      icon: XCircle,
      label: "Failed",
    },
  }

  const variant = variants[status as keyof typeof variants]
  const Icon = variant?.icon || AlertCircle

  return (
    <Badge
      className={`flex w-fit items-center gap-1 rounded-full px-2 py-1 font-normal ${variant?.color}`}
    >
      <Icon className="h-3 w-3" />
      <span className="text-xs">{variant?.label || status}</span>
    </Badge>
  )
}

// --- Withdrawal Request Dialog ---
const WithdrawalDialog = ({
  availableBalance,
  onRequest,
}: {
  availableBalance: number
  onRequest: (amount: number) => void
}) => {
  const [amount, setAmount] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = () => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }
    if (numAmount > availableBalance) {
      setError("Amount exceeds available balance")
      return
    }
    if (numAmount < 100) {
      setError("Minimum withdrawal amount is $100")
      return
    }
    onRequest(numAmount)
    setIsOpen(false)
    setAmount("")
    setError("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md hover:scale-105 hover:shadow-lg">
          <ArrowDownCircle className="mr-2 h-4 w-4" />
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request Withdrawal</DialogTitle>
          <DialogDescription>
            Enter the amount you wish to withdraw from your available balance.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Available Balance
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ETB {availableBalance.toLocaleString()}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setError("")
                }}
                className="pl-7"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              💡 Withdrawals are processed within 2-3 business days. Minimum
              withdrawal: $100
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Request Withdrawal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// --- Main Component ---
export default function AdminWalletDashboard() {
  const router = useRouter()
  const [withdrawals, setWithdrawals] = useState(withdrawalData)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const itemsPerPage = 5

  // Wallet calculations
  const availableBalance = 24850 // Current available balance
  const pendingBalance = withdrawals
    .filter((w) => w.status === "PENDING")
    .reduce((sum, w) => sum + w.amount, 0)
  const totalEarned = 185750 // Total platform earnings
  const totalWithdrawn = withdrawals
    .filter((w) => w.status === "COMPLETED")
    .reduce((sum, w) => sum + w.amount, 0)

  // Filter withdrawals by status
  const filteredWithdrawals = withdrawals.filter((w) =>
    statusFilter === "all" ? true : w.status === statusFilter.toUpperCase(),
  )

  // Sort by date (latest first)
  const sortedWithdrawals = [...filteredWithdrawals].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  // Pagination
  const totalPages = Math.ceil(sortedWithdrawals.length / itemsPerPage)
  const paginatedWithdrawals = sortedWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleWithdrawalRequest = (amount: number) => {
    // Add new withdrawal request
    const newWithdrawal = {
      id: `WD-${String(withdrawals.length + 1).padStart(3, "0")}`,
      amount: amount,
      status: "PENDING",
      date: new Date().toISOString().split("T")[0],
      method: "Bank Transfer",
      reference: `TRF-${Date.now()}`,
    }
    setWithdrawals([newWithdrawal, ...withdrawals])
    // Show success message (in production, use toast)
    alert(`Withdrawal request of $${amount} submitted successfully!`)
  }

  const walletCards = [
    {
      title: "Available Balance",
      amount: availableBalance,
      icon: Wallet,
      trend: "Ready for withdrawal",
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },
    {
      title: "Pending Balance",
      amount: pendingBalance,
      icon: Clock,
      trend: "Awaiting processing",
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
    },
    {
      title: "Total Earned",
      amount: totalEarned,
      icon: TrendingUp,
      trend: "All-time earnings",
      gradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
    },
    {
      title: "Total Withdrawn",
      amount: totalWithdrawn,
      icon: ArrowDownCircle,
      trend: "Lifetime withdrawals",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
    },
  ]

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        {/* Header Section */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between my-2 mb-4">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80 dark:hover:bg-gray-800"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Finance
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
                Admin Wallet
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage and track platform earnings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <WithdrawalDialog
              availableBalance={availableBalance}
              onRequest={handleWithdrawalRequest}
            />

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </header>

        {/* Wallet Overview Cards */}
        <div className="mb-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {walletCards.map((card, idx) => (
            <WalletCard key={card.title} {...card} delay={idx * 0.1} />
          ))}
        </div>

        {/* Earnings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="overflow-hidden rounded-2xl border-0 shadow-none bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                Earnings Overview
              </CardTitle>
              <CardDescription>Daily platform earnings trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={earningsData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="earningsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                      className="dark:stroke-gray-800"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      dy={10}
                      interval={2}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickFormatter={(value) => `$${value / 1000}k`}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#earningsGradient)"
                      activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Withdrawal Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="rounded-2xl border-0 bg-white/80 shadow-none backdrop-blur-sm dark:bg-gray-900/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                  Withdrawal Transactions
                </CardTitle>
                <CardDescription>
                  History of all withdrawal requests
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] rounded-xl">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => {
                    // Export functionality
                    console.log("Export withdrawals")
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              {paginatedWithdrawals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                    <ArrowDownCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
                    No Withdrawal Records
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Withdrawal requests will appear here once submitted
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 dark:border-gray-800">
                          <TableHead className="font-semibold">
                            Transaction ID
                          </TableHead>
                          <TableHead className="font-semibold">
                            Amount
                          </TableHead>
                          <TableHead className="font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold hidden md:table-cell">
                            Method
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedWithdrawals.map((withdrawal) => (
                          <TableRow
                            key={withdrawal.id}
                            className="border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                          >
                            <TableCell className=" text-sm font-medium">
                              {withdrawal.id}
                            </TableCell>
                            <TableCell className="font-semibold text-gray-900 dark:text-white">
                              ETB {withdrawal.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={withdrawal.status} />
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                              {format(
                                new Date(withdrawal.date),
                                "MMM dd, yyyy",
                              )}
                            </TableCell>
                            <TableCell className="hidden text-sm text-gray-600 dark:text-gray-400 md:table-cell">
                              {withdrawal.method}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
                      <p className="text-sm text-gray-500">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(
                          currentPage * itemsPerPage,
                          sortedWithdrawals.length,
                        )}{" "}
                        of {sortedWithdrawals.length} transactions
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className="rounded-xl"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                          className="rounded-xl"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <Card className="rounded-xl border-0 bg-white/60 backdrop-blur-sm dark:bg-gray-900/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Last withdrawal</span>
                <span className="text-sm font-medium">
                  {withdrawals[0]
                    ? format(new Date(withdrawals[0].date), "MMM dd, yyyy")
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 bg-white/60 backdrop-blur-sm dark:bg-gray-900/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Pending withdrawals
                </span>
                <span className="text-sm font-medium text-amber-600">
                  {withdrawals.filter((w) => w.status === "PENDING").length}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 bg-white/60 backdrop-blur-sm dark:bg-gray-900/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Success rate</span>
                <span className="text-sm font-medium text-emerald-600">
                  {Math.round(
                    (withdrawals.filter((w) => w.status === "COMPLETED")
                      .length /
                      withdrawals.length) *
                      100,
                  )}
                  %
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
