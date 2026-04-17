"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  RefreshCw,
  AlertCircle,
  DollarSign,
  CreditCard,
  Smartphone,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  FileText,
} from "lucide-react"
import { toast } from "sonner"
import { timeAgo } from "@/lib/utils"
import { PaymentsTable } from "@/components/ev-owner/paymentTable"

// Types
type PaymentStatus = "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED"
type PaymentMethod = "CARD" | "WALLET" | "MOBILE_MONEY" | "BANK_TRANSFER"
type PaymentGateway = "STRIPE" | "PAYPAL" | "CHAPA" | "FLUTTERWAVE" | "M-PESA"

type Payment = {
  id: string
  reference: string
  userName: string
  userId: string
  stationName: string
  stationId: number
  amount: number
  currency: string
  method: PaymentMethod
  gateway: PaymentGateway
  status: PaymentStatus
  reservationCode: string
  startTime: string
  endTime: string | null
  createdAt: string
  updatedAt: string
}

// Mock Data
const MOCK_PAYMENTS: Payment[] = [
  {
    id: "pay_001",
    reference: "EV-2024-0001",
    userName: "John Doe",
    userId: "user-001",
    stationName: "Green Valley EV Hub",
    stationId: 1,
    amount: 25.5,
    currency: "USD",
    method: "CARD",
    gateway: "STRIPE",
    status: "COMPLETED",
    reservationCode: "RES-001",
    startTime: "2024-01-15T09:00:00Z",
    endTime: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "pay_002",
    reference: "EV-2024-0002",
    userName: "Jane Smith",
    userId: "user-002",
    stationName: "Emerald Charge Point",
    stationId: 2,
    amount: 42.75,
    currency: "USD",
    method: "WALLET",
    gateway: "PAYPAL",
    status: "COMPLETED",
    reservationCode: "RES-002",
    startTime: "2024-01-15T11:00:00Z",
    endTime: "2024-01-15T12:45:00Z",
    createdAt: "2024-01-15T11:00:00Z",
    updatedAt: "2024-01-15T12:45:00Z",
  },
  {
    id: "pay_003",
    reference: "EV-2024-0003",
    userName: "Mike Johnson",
    userId: "user-003",
    stationName: "Sustainable Energy Station",
    stationId: 3,
    amount: 18.3,
    currency: "USD",
    method: "MOBILE_MONEY",
    gateway: "M-PESA",
    status: "PENDING",
    reservationCode: "RES-003",
    startTime: "2024-01-15T13:00:00Z",
    endTime: null,
    createdAt: "2024-01-15T13:00:00Z",
    updatedAt: "2024-01-15T13:15:00Z",
  },
  {
    id: "pay_004",
    reference: "EV-2024-0004",
    userName: "Sarah Williams",
    userId: "user-004",
    stationName: "Green Valley EV Hub",
    stationId: 1,
    amount: 67.2,
    currency: "USD",
    method: "CARD",
    gateway: "STRIPE",
    status: "FAILED",
    reservationCode: "RES-004",
    startTime: "2024-01-14T15:00:00Z",
    endTime: null,
    createdAt: "2024-01-14T15:00:00Z",
    updatedAt: "2024-01-14T15:05:00Z",
  },
  {
    id: "pay_005",
    reference: "EV-2024-0005",
    userName: "David Brown",
    userId: "user-005",
    stationName: "Solaris Charging Plaza",
    stationId: 4,
    amount: 35.9,
    currency: "USD",
    method: "BANK_TRANSFER",
    gateway: "FLUTTERWAVE",
    status: "COMPLETED",
    reservationCode: "RES-005",
    startTime: "2024-01-14T16:30:00Z",
    endTime: "2024-01-14T18:00:00Z",
    createdAt: "2024-01-14T16:30:00Z",
    updatedAt: "2024-01-14T18:00:00Z",
  },
  {
    id: "pay_006",
    reference: "EV-2024-0006",
    userName: "Emily Davis",
    userId: "user-006",
    stationName: "EcoPoint Downtown",
    stationId: 5,
    amount: 12.45,
    currency: "USD",
    method: "WALLET",
    gateway: "PAYPAL",
    status: "REFUNDED",
    reservationCode: "RES-006",
    startTime: "2024-01-13T10:00:00Z",
    endTime: "2024-01-13T11:00:00Z",
    createdAt: "2024-01-13T10:00:00Z",
    updatedAt: "2024-01-13T11:30:00Z",
  },
  {
    id: "pay_007",
    reference: "EV-2024-0007",
    userName: "Chris Wilson",
    userId: "user-007",
    stationName: "Green Valley EV Hub",
    stationId: 1,
    amount: 53.25,
    currency: "USD",
    method: "CARD",
    gateway: "STRIPE",
    status: "COMPLETED",
    reservationCode: "RES-007",
    startTime: "2024-01-13T14:00:00Z",
    endTime: "2024-01-13T16:15:00Z",
    createdAt: "2024-01-13T14:00:00Z",
    updatedAt: "2024-01-13T16:15:00Z",
  },
  {
    id: "pay_008",
    reference: "EV-2024-0008",
    userName: "Amanda Lee",
    userId: "user-008",
    stationName: "Emerald Charge Point",
    stationId: 2,
    amount: 28.9,
    currency: "USD",
    method: "MOBILE_MONEY",
    gateway: "M-PESA",
    status: "PENDING",
    reservationCode: "RES-008",
    startTime: "2024-01-13T17:00:00Z",
    endTime: null,
    createdAt: "2024-01-13T17:00:00Z",
    updatedAt: "2024-01-13T17:10:00Z",
  },
  {
    id: "pay_009",
    reference: "EV-2024-0009",
    userName: "Robert Taylor",
    userId: "user-009",
    stationName: "Sustainable Energy Station",
    stationId: 3,
    amount: 44.5,
    currency: "USD",
    method: "CARD",
    gateway: "FLUTTERWAVE",
    status: "COMPLETED",
    reservationCode: "RES-009",
    startTime: "2024-01-12T09:30:00Z",
    endTime: "2024-01-12T11:45:00Z",
    createdAt: "2024-01-12T09:30:00Z",
    updatedAt: "2024-01-12T11:45:00Z",
  },
  {
    id: "pay_010",
    reference: "EV-2024-0010",
    userName: "Lisa Anderson",
    userId: "user-010",
    stationName: "Solaris Charging Plaza",
    stationId: 4,
    amount: 31.75,
    currency: "USD",
    method: "WALLET",
    gateway: "PAYPAL",
    status: "FAILED",
    reservationCode: "RES-010",
    startTime: "2024-01-12T12:00:00Z",
    endTime: null,
    createdAt: "2024-01-12T12:00:00Z",
    updatedAt: "2024-01-12T12:08:00Z",
  },
]

// API Service
const paymentsAPI = {
  getPayments: async (): Promise<Payment[]> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return MOCK_PAYMENTS
  },
}

// Custom hook
const usePaymentsQuery = () => {
  return useQuery({
    queryKey: ["payments"],
    queryFn: paymentsAPI.getPayments,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  })
}

// Helper functions
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString()
}

// Status Badge Component
const StatusBadge = ({ status }: { status: PaymentStatus }) => {
  const variants = {
    COMPLETED: {
      icon: CheckCircle,
      label: "Completed",
      className: "bg-green-100 text-green-700 border-green-200",
    },
    PENDING: {
      icon: Clock,
      label: "Pending",
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    FAILED: {
      icon: XCircle,
      label: "Failed",
      className: "bg-red-100 text-red-700 border-red-200",
    },
    REFUNDED: {
      icon: RefreshCw,
      label: "Refunded",
      className: "bg-gray-100 text-gray-700 border-gray-200",
    },
  }

  const config = variants[status]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 px-2 py-1 ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

// Method Badge Component
const MethodBadge = ({ method }: { method: PaymentMethod }) => {
  const variants = {
    CARD: {
      icon: CreditCard,
      label: "Card",
      className: "bg-blue-100 text-blue-700",
    },
    WALLET: {
      icon: DollarSign,
      label: "Wallet",
      className: "bg-purple-100 text-purple-700",
    },
    MOBILE_MONEY: {
      icon: Smartphone,
      label: "Mobile Money",
      className: "bg-orange-100 text-orange-700",
    },
    BANK_TRANSFER: {
      icon: Building,
      label: "Bank Transfer",
      className: "bg-cyan-100 text-cyan-700",
    },
  }

  const config = variants[method]
  const Icon = config.icon

  return (
    <Badge
      variant="secondary"
      className={`flex items-center gap-1 px-2 py-1 ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

// Main Component
export default function PaymentsPage() {
  const router = useRouter()
  const {
    data: payments = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = usePaymentsQuery()
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  const handleExport = () => {
    toast.success("Export started", {
      description: "Your payment data is being exported...",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6 max-w-7xl">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load payments. Please try again.</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-3 w-3" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto py-6 space-y-6 max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="mt-1 h-10 w-10 cursor-pointer rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80"
                onClick={() => router.back()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Financial Management
                  </p>
                  <h1 className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-slate-100 dark:to-slate-400 md:text-3xl">
                    Payments
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage and track all station payments and transactions
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="secondary"
                className="hidden items-center gap-2 rounded-full px-3 py-1.5 sm:flex bg-emerald-50 text-emerald-700 border-emerald-200"
              >
                <DollarSign className="h-3 w-3" />
                <span className="text-xs font-medium">
                  Total:{" "}
                  {formatCurrency(
                    payments.reduce(
                      (sum, p) =>
                        p.status === "COMPLETED" ? sum + p.amount : sum,
                      0,
                    ),
                    "USD",
                  )}
                </span>
              </Badge>

              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-full border-emerald-200 bg-white shadow-sm hover:bg-emerald-50"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-full border-emerald-200 bg-white shadow-sm hover:bg-emerald-50"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-none">
            <CardContent className="pt-6">
              <PaymentsTable data={payments} onRowClick={setSelectedPayment} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
