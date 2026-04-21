"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  ChevronLeft,
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
  Receipt,
  Calendar,
  User,
  MapPin,
  Hash,
  Link,
  TrendingUp,
  Timer,
  Mail,
} from "lucide-react"
import { toast } from "sonner"
import { timeAgo, formatCurrencyIntl } from "@/lib/utils"
import { axiosInstance } from "@/services/axiosInstance"
import { Payment, PaymentsTable } from "@/components/ev-owner/paymentTable"

// Types
export type PaymentStatus =
  | "COMPLETED"
  | "PENDING"
  | "FAILED"
  | "REFUNDED"
  | "PROCESSING"
export type PaymentMethod = "CARD" | "WALLET" | "MOBILE_MONEY" | "BANK_TRANSFER"
export type PaymentGateway =
  | "STRIPE"
  | "PAYPAL"
  | "CHAPA"
  | "FLUTTERWAVE"
  | "M_PESA"

// API Service
const paymentsAPI = {
  getPayments: async (): Promise<Payment[]> => {
    try {
      const response = await axiosInstance.get(
        "/ev/reservation/manager/payments",
      )

      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data.map((payment: any) => ({
          id: payment.id,
          reference: payment.reference,
          userName: payment.userName,
          userId: payment.userId,
          stationName: payment.stationName,
          stationId: payment.stationId,
          amount: Number(payment.amount),
          currency: payment.currency || "USD",
          method: payment.method,
          gateway: payment.gateway,
          status: payment.status,
          reservationCode: payment.reservationCode,
          sessionId: payment.sessionId,
          startTime: payment.startTime,
          endTime: payment.endTime,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          metadata: payment.metadata,
        }))
      }

      return []
    } catch (error: any) {
      console.error("Error fetching payments:", error)
      throw new Error(
        error?.response?.data?.message || "Failed to fetch payments",
      )
    }
  },

  exportPayments: async (filters?: any): Promise<Blob> => {
    try {
      const response = await axiosInstance.get("/ev/payments/export", {
        params: filters,
        responseType: "blob",
      })
      return response.data
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to export payments",
      )
    }
  },
}

// Custom hook for payments query
const usePaymentsQuery = () => {
  return useQuery({
    queryKey: ["payments"],
    queryFn: paymentsAPI.getPayments,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
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
    PROCESSING: {
      icon: RefreshCw,
      label: "Processing",
      className: "bg-blue-100 text-blue-700 border-blue-200",
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

  const config = variants[status] || variants.PENDING
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

// Payment Details Sheet Component
const PaymentDetailsSheet = ({
  payment,
  open,
  onOpenChange,
}: {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  if (!payment) return null

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600"
      case "PENDING":
        return "text-yellow-600"
      case "PROCESSING":
        return "text-blue-600"
      case "FAILED":
        return "text-red-600"
      case "REFUNDED":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  const InfoRow = ({ label, value, icon: Icon }: any) => (
    <div className="flex items-start justify-between py-3 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <div className="font-medium text-right">{value || "-"}</div>
    </div>
  )

  const handleDownloadReceipt = () => {
    toast.success(`Downloading receipt for ${payment.reference}`)
  }

  const handleEmailReceipt = () => {
    toast.success(`Receipt sent to ${payment.userName}`)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment Details
          </SheetTitle>
          <SheetDescription>
            Complete information about payment #{payment.reference}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Payment Status Card */}
          <div className="rounded-lg border bg-linear-to-br from-white to-slate-50 p-4 dark:from-slate-950 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <div className="mt-1">
                  <StatusBadge status={payment.status} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p
                  className={`text-2xl font-bold ${getStatusColor(payment.status)}`}
                >
                  {formatCurrencyIntl(payment.amount, payment.currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="rounded-lg border">
            <div className="border-b bg-slate-50 px-4 py-3 dark:bg-slate-900">
              <h3 className="font-semibold">Payment Information</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <InfoRow
                label="Reference Number"
                value={payment.reference}
                icon={Hash}
              />
              <InfoRow
                label="Reservation Code"
                value={payment.reservationCode}
                icon={Link}
              />
              <InfoRow
                label="Payment Method"
                value={
                  <div className="flex items-center justify-end gap-2">
                    <MethodBadge method={payment.method} />
                    <span className="text-xs text-muted-foreground">
                      via {payment.gateway}
                    </span>
                  </div>
                }
                icon={CreditCard}
              />
              <InfoRow
                label="Transaction Date"
                value={timeAgo(payment.createdAt)}
                icon={Calendar}
              />
              <InfoRow
                label="Last Updated"
                value={timeAgo(payment.updatedAt)}
                icon={Clock}
              />
            </div>
          </div>

          {/* Customer Information */}
          <div className="rounded-lg border">
            <div className="border-b bg-slate-50 px-4 py-3 dark:bg-slate-900">
              <h3 className="font-semibold">Customer Information</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <InfoRow
                label="Customer Name"
                value={payment.userName}
                icon={User}
              />
              <InfoRow label="Customer ID" value={payment.userId} icon={Hash} />
            </div>
          </div>

          {/* Station Information */}
          <div className="rounded-lg border">
            <div className="border-b bg-slate-50 px-4 py-3 dark:bg-slate-900">
              <h3 className="font-semibold">Station Information</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <InfoRow
                label="Station Name"
                value={payment.stationName}
                icon={MapPin}
              />
              <InfoRow
                label="Station ID"
                value={payment.stationId}
                icon={Hash}
              />
            </div>
          </div>

          {/* Session Information (if available) */}
          {(payment.startTime || payment.endTime) && (
            <div className="rounded-lg border">
              <div className="border-b bg-slate-50 px-4 py-3 dark:bg-slate-900">
                <h3 className="font-semibold">Session Information</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {payment.startTime && (
                  <InfoRow
                    label="Start Time"
                    value={timeAgo(payment.startTime)}
                    icon={Calendar}
                  />
                )}
                {payment.endTime && (
                  <InfoRow
                    label="End Time"
                    value={timeAgo(payment.endTime)}
                    icon={Clock}
                  />
                )}
                {payment.startTime && payment.endTime && (
                  <InfoRow
                    label="Duration"
                    value={`${Math.ceil(
                      (new Date(payment.endTime).getTime() -
                        new Date(payment.startTime).getTime()) /
                        (1000 * 60),
                    )} minutes`}
                    icon={Timer}
                  />
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDownloadReceipt}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleEmailReceipt}
            >
              <Mail className="mr-2 h-4 w-4" />
              Email Receipt
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Loading Skeleton Component
const PaymentsPageSkeleton = () => {
  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl px-4">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-32 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-28" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Skeleton */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Skeleton className="h-10 flex-1 max-w-md" />
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[180px]" />
          </div>

          {/* Table Skeleton */}
          <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <th key={i} className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-200 dark:border-slate-800"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Skeleton */}
          <div className="flex items-center justify-between mt-4">
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Component
export default function PaymentsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [methodFilter, setMethodFilter] = useState<string>("ALL")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const {
    data: payments = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = usePaymentsQuery()

  // Filter payments based on search and filters
  const filteredPayments = useMemo(() => {
    let filtered = [...payments]

    const term = searchTerm.trim().toLowerCase()
    if (term) {
      filtered = filtered.filter(
        (payment) =>
          payment.reference.toLowerCase().includes(term) ||
          payment.userName.toLowerCase().includes(term) ||
          payment.stationName.toLowerCase().includes(term) ||
          payment.reservationCode.toLowerCase().includes(term),
      )
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((payment) => payment.status === statusFilter)
    }

    if (methodFilter !== "ALL") {
      filtered = filtered.filter((payment) => payment.method === methodFilter)
    }

    return filtered
  }, [payments, searchTerm, statusFilter, methodFilter])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTransactions = filteredPayments.length
    const totalRevenue = filteredPayments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + p.amount, 0)
    const successRate =
      filteredPayments.length > 0
        ? (filteredPayments.filter((p) => p.status === "COMPLETED").length /
            filteredPayments.length) *
          100
        : 0
    const averageTransaction =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    return {
      totalTransactions,
      totalRevenue,
      successRate,
      averageTransaction,
    }
  }, [filteredPayments])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const blob = await paymentsAPI.exportPayments({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        method: methodFilter !== "ALL" ? methodFilter : undefined,
        search: searchTerm || undefined,
      })

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `payments_export_${new Date().toISOString()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Export completed", {
        description: "Your payment data has been exported successfully.",
      })
    } catch (error) {
      toast.error("Export failed", {
        description:
          error instanceof Error ? error.message : "Failed to export payments",
      })
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return <PaymentsPageSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 max-w-7xl px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between flex-wrap gap-4">
            <span>
              {error instanceof Error
                ? error.message
                : "Failed to load payments. Please try again."}
            </span>
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
    <div className="min-h-screen">
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
                  <h1 className="bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-slate-100 dark:to-slate-400 md:text-3xl">
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
                  Total: {formatCurrencyIntl(stats.totalRevenue, "USD")}
                </span>
              </Badge>

              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-full border-emerald-200 bg-white shadow-sm hover:bg-emerald-50"
                onClick={handleExport}
                disabled={isExporting || filteredPayments.length === 0}
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isExporting ? "Exporting..." : "Export"}
                </span>
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
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by reference, user, station..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Methods</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="WALLET">Wallet</SelectItem>
                    <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <PaymentsTable
                data={filteredPayments}
                onRowClick={setSelectedPayment}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment Details Sheet */}
      <PaymentDetailsSheet
        payment={selectedPayment}
        open={!!selectedPayment}
        onOpenChange={(open) => !open && setSelectedPayment(null)}
      />
    </div>
  )
}
