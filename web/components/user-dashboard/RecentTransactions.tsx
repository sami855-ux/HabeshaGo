"use client"

import { useState, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  getPaginationRowModel,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowUpDown,
  Eye,
  Download,
  Search,
  Filter,
  PlusCircle,
  MinusCircle,
  Repeat,
  CreditCard,
  Send,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Wallet,
  Calendar,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  FileText,
  Loader2,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Receipt,
  ArrowRightLeft,
  Star,
  Gift,
  Coins,
  Ticket,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { DateRange } from "react-day-picker"
import { useRouter } from "next/navigation"
import { axiosInstance } from "@/services/axiosInstance"

// Types based on actual API response
type TransactionCategory = "WALLET" | "POINT"

type WalletTransaction = {
  id: string
  walletId: number
  category: TransactionCategory
  amount: string
  type: string
  status: string
  balanceAfter: string | null
  reference: string | null
  description: string
  metadata: Record<string, any> | null
  createdAt: string
  recipientName: string
}

type ApiResponse = {
  success: boolean
  message: string
  data: {
    transactions: WalletTransaction[]
    total: number
  }
}

// Transaction Types
const WalletTransactionType = {
  DEPOSIT: "DEPOSIT",
  WITHDRAW: "WITHDRAW",
  REFUND: "REFUND",
  ADJUSTMENT: "ADJUSTMENT",
  TRANSFER_OUT: "TRANSFER_OUT",
  TRANSFER_IN: "TRANSFER_IN",
  PAYMENT_OUT: "PAYMENT_OUT",
  PAYMENT_IN: "PAYMENT_IN",
  COMMISSION: "COMMISSION",
} as const

const PointTransactionType = {
  EARN: "EARN",
  SPEND: "SPEND",
  EXPIRE: "EXPIRE",
  ADJUSTMENT: "ADJUSTMENT",
  EARN_BOOKING: "EARN_BOOKING",
  SPEND_TICKET: "SPEND_TICKET",
} as const

type TransactionStatus = "SUCCESS" | "PENDING" | "FAILED" | "REVERSED"

// API Service
const fetchTransactions = async () => {
  const response = await axiosInstance.get("/wallet/transactions")

  const data: ApiResponse = response.data // ✅ axios uses .data

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch transactions")
  }

  return data.data.transactions
}

// Helper functions
const formatCurrency = (amount: string) => {
  const numAmount = parseFloat(amount)
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

const formatPoints = (amount: string) => {
  const numAmount = parseFloat(amount)
  return `${Math.abs(numAmount).toLocaleString()} points`
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}

const getStatusConfig = (status: string) => {
  const configs = {
    SUCCESS: {
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
      icon: CheckCircle,
      label: "Success",
    },
    PENDING: {
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
      icon: Clock,
      label: "Pending",
    },
    FAILED: {
      color:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
      icon: XCircle,
      label: "Failed",
    },
    REVERSED: {
      color:
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
      icon: RefreshCw,
      label: "Reversed",
    },
  }
  return configs[status as TransactionStatus] || configs.SUCCESS
}

const getCategoryConfig = (category: TransactionCategory) => {
  const configs = {
    WALLET: {
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      icon: Wallet,
      label: "Wallet",
    },
    POINT: {
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      icon: Star,
      label: "Points",
    },
  }
  return configs[category]
}

const getTypeConfig = (type: string, category: TransactionCategory) => {
  // Point transactions
  if (category === "POINT") {
    const pointConfigs: Record<string, any> = {
      EARN: {
        color:
          "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
        icon: PlusCircle,
        label: "Earn Points",
        trend: "positive",
        valueSuffix: "points",
      },
      EARN_BOOKING: {
        color:
          "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
        icon: Gift,
        label: "Points from Booking",
        trend: "positive",
        valueSuffix: "points",
      },
      SPEND: {
        color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
        icon: MinusCircle,
        label: "Spend Points",
        trend: "negative",
        valueSuffix: "points",
      },
      SPEND_TICKET: {
        color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
        icon: Ticket,
        label: "Points for Ticket",
        trend: "negative",
        valueSuffix: "points",
      },
      EXPIRE: {
        color:
          "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20",
        icon: AlertCircle,
        label: "Points Expired",
        trend: "negative",
        valueSuffix: "points",
      },
      ADJUSTMENT: {
        color:
          "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
        icon: Coins,
        label: "Points Adjustment",
        trend: "neutral",
        valueSuffix: "points",
      },
    }
    return (
      pointConfigs[type] || {
        color: "",
        icon: Star,
        label: type,
        trend: "neutral",
        valueSuffix: "points",
      }
    )
  }

  // Wallet transactions
  const walletConfigs: Record<string, any> = {
    DEPOSIT: {
      color:
        "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
      icon: PlusCircle,
      label: "Deposit",
      trend: "positive",
      valuePrefix: "ETB",
    },
    WITHDRAW: {
      color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
      icon: MinusCircle,
      label: "Withdrawal",
      trend: "negative",
      valuePrefix: "ETB",
    },
    REFUND: {
      color:
        "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
      icon: RefreshCw,
      label: "Refund",
      trend: "positive",
      valuePrefix: "ETB",
    },
    ADJUSTMENT: {
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
      icon: Receipt,
      label: "Adjustment",
      trend: "neutral",
      valuePrefix: "ETB",
    },
    TRANSFER_OUT: {
      color:
        "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20",
      icon: ArrowUp,
      label: "Transfer Out",
      trend: "negative",
      valuePrefix: "ETB",
    },
    TRANSFER_IN: {
      color:
        "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
      icon: ArrowDown,
      label: "Transfer In",
      trend: "positive",
      valuePrefix: "ETB",
    },
    PAYMENT_OUT: {
      color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
      icon: CreditCard,
      label: "Payment Out",
      trend: "negative",
      valuePrefix: "ETB",
    },
    PAYMENT_IN: {
      color:
        "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
      icon: CreditCard,
      label: "Payment In",
      trend: "positive",
      valuePrefix: "ETB",
    },
    COMMISSION: {
      color:
        "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20",
      icon: TrendingUp,
      label: "Commission",
      trend: "positive",
      valuePrefix: "ETB",
    },
  }
  return (
    walletConfigs[type] || {
      color: "",
      icon: Wallet,
      label: type,
      trend: "neutral",
      valuePrefix: "ETB",
    }
  )
}

// Check if transaction is positive (money/points in) or negative (money/points out)
const isPositiveTransaction = (type: string, category: TransactionCategory) => {
  if (category === "POINT") {
    const positiveTypes = ["EARN", "EARN_BOOKING"]
    return positiveTypes.includes(type)
  }

  const positiveTypes = [
    "DEPOSIT",
    "REFUND",
    "TRANSFER_IN",
    "PAYMENT_IN",
    "COMMISSION",
  ]
  return positiveTypes.includes(type)
}

const formatAmount = (
  amount: string,
  category: TransactionCategory,
  type: string,
) => {
  const config = getTypeConfig(type, category)
  const absAmount = Math.abs(parseFloat(amount))

  if (category === "POINT") {
    return `${absAmount.toLocaleString()} ${config.valueSuffix}`
  }

  return formatCurrency(absAmount.toFixed(2))
}

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  </div>
)

export default function RecentTransactions({ userId }: { userId: string }) {
  const queryClient = useQueryClient()
  const router = useRouter()

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  // React Query for data fetching
  const {
    data: transactions = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["wallet-transactions", userId],
    queryFn: fetchTransactions,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Handle view transaction details
  const handleViewDetails = (transaction: WalletTransaction) => {
    toast.info("Transaction Details", {
      description: `Viewing ${transaction.category} transaction ${transaction.reference || transaction.id}`,
    })
    console.log("Transaction details:", transaction)
  }

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return []

    let filtered = [...transactions]

    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt)
        return (
          transactionDate >= dateRange.from! && transactionDate <= dateRange.to!
        )
      })
    }

    return filtered
  }, [transactions, dateRange])

  // Define columns
  const createColumns = (
    onViewDetails: (transaction: WalletTransaction) => void,
  ): ColumnDef<WalletTransaction>[] => [
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as TransactionCategory
        const config = getCategoryConfig(category)
        const Icon = config.icon
        return (
          <Badge variant="outline" className={cn("gap-1.5", config.color)}>
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true
        return row.getValue(columnId) === filterValue
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 font-medium"
          >
            Type
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        const category = row.original.category
        const config = getTypeConfig(type, category)
        const Icon = config.icon
        return (
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg", config.color)}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="font-medium text-foreground">{config.label}</span>
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true
        return row.getValue(columnId) === filterValue
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const transaction = row.original
        return (
          <div className="space-y-1 min-w-[200px]">
            <div className="font-medium text-foreground line-clamp-1">
              {transaction.description || "No description"}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {transaction.reference && (
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
                  {transaction.reference}
                </span>
              )}
              {transaction.metadata && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {transaction.metadata.bookingId && (
                    <span>Booking #{transaction.metadata.bookingId}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "recipientName",
      header: "Recipient",
      cell: ({ row }) => {
        const recipientName = row.getValue("recipientName") as string
        return <span>{recipientName || "N/A"}</span>
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-medium"
        >
          Amount
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const amount = row.getValue("amount") as string
        const type = row.original.type
        const category = row.original.category
        const isPositive = isPositiveTransaction(type, category)
        const formattedAmount = formatAmount(amount, category, type)

        return (
          <div
            className={cn(
              "font-semibold flex items-center gap-1",
              isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400",
            )}
          >
            {isPositive ? (
              <Plus className="h-4 w-4" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
            {formattedAmount}
          </div>
        )
      },
      sortingFn: (rowA, rowB, columnId) => {
        const a = parseFloat(rowA.getValue(columnId) as string)
        const b = parseFloat(rowB.getValue(columnId) as string)
        return a - b
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const config = getStatusConfig(status)
        const Icon = config.icon
        return (
          <Badge
            variant="outline"
            className={cn("font-normal gap-1.5 px-2.5 py-0.5", config.color)}
          >
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true
        return row.getValue(columnId) === filterValue
      },
    },
    {
      accessorKey: "balanceAfter",
      header: "Balance After",
      cell: ({ row }) => {
        const balance = row.getValue("balanceAfter") as string | null
        const category = row.original.category

        if (!balance) return <span className="text-muted-foreground">—</span>

        if (category === "POINT") {
          return <span>{parseFloat(balance).toLocaleString()} points</span>
        }

        return <span className="font-medium">{formatCurrency(balance)}</span>
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-medium"
        >
          Date & Time
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const dateString = row.getValue("createdAt") as string
        return (
          <div className="space-y-1">
            <div className="text-sm">{formatDate(dateString)}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(dateString).toLocaleDateString()}
            </div>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const transaction = row.original
        return (
          <Button
            variant="default"
            size="sm"
            className="cursor-pointer"
            onClick={() =>
              router.push(`/user/wallet/transaction/${transaction.id}`)
            }
            title="View details"
          >
            <Eye className="h-4 w-4 mr-1" /> View
          </Button>
        )
      },
    },
  ]

  // Create table with actual data
  const columns = useMemo(() => createColumns(handleViewDetails), [])

  const table = useReactTable({
    data: filteredTransactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  })

  // Handle export
  const handleExport = () => {
    toast.success("Export Started", {
      description: "Your transaction history is being prepared for download.",
    })
    // In real app: implement export logic
  }

  // Handle retry
  const handleRetry = () => {
    refetch()
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!transactions.length) return null

    const successful = transactions.filter((t) => t.status === "SUCCESS").length

    const pending = transactions.filter((t) => t.status === "PENDING").length

    const failed = transactions.filter((t) => t.status === "FAILED").length

    // Calculate total inflow and outflow for wallet
    const walletTransactions = transactions.filter(
      (t) => t.category === "WALLET",
    )
    const inflow = walletTransactions
      .filter((t) => isPositiveTransaction(t.type, t.category))
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)

    const outflow = walletTransactions
      .filter((t) => !isPositiveTransaction(t.type, t.category))
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)

    // Calculate points earned and spent
    const pointTransactions = transactions.filter((t) => t.category === "POINT")
    const pointsEarned = pointTransactions
      .filter((t) => isPositiveTransaction(t.type, t.category))
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)

    const pointsSpent = pointTransactions
      .filter((t) => !isPositiveTransaction(t.type, t.category))
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)

    return {
      successful,
      pending,
      failed,
      inflow,
      outflow,
      pointsEarned,
      pointsSpent,
      totalWallet: walletTransactions.length,
      totalPoints: pointTransactions.length,
    }
  }, [transactions])

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-gray-800/50 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Wallet className="h-6 w-6 text-orange-500" />
              Transaction History
            </CardTitle>
            <CardDescription>
              Monitor and manage your wallet and points transactions
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isLoading || filteredTransactions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCw
                className={cn("h-4 w-4", isRefetching && "animate-spin")}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error State */}
        {isError && (
          <Alert
            variant="destructive"
            className="border-red-200 dark:border-red-800"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Transactions</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Failed to load transaction history. Please try again.</p>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleRetry}
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Search and Filter Bar */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select
                  value={
                    (table.getColumn("category")?.getFilterValue() as string) ??
                    "all"
                  }
                  onValueChange={(value) =>
                    table.getColumn("category")?.setFilterValue(value)
                  }
                >
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="WALLET">Wallet</SelectItem>
                    <SelectItem value="POINT">Points</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={
                    (table.getColumn("type")?.getFilterValue() as string) ??
                    "all"
                  }
                  onValueChange={(value) =>
                    table.getColumn("type")?.setFilterValue(value)
                  }
                >
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {/* Wallet Types */}
                    <SelectItem value="DEPOSIT">Deposit</SelectItem>
                    <SelectItem value="WITHDRAW">Withdrawal</SelectItem>
                    <SelectItem value="REFUND">Refund</SelectItem>
                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                    <SelectItem value="TRANSFER_OUT">Transfer Out</SelectItem>
                    <SelectItem value="TRANSFER_IN">Transfer In</SelectItem>
                    <SelectItem value="PAYMENT_OUT">Payment Out</SelectItem>
                    <SelectItem value="PAYMENT_IN">Payment In</SelectItem>
                    <SelectItem value="COMMISSION">Commission</SelectItem>
                    {/* Point Types */}
                    <SelectItem value="EARN">Earn Points</SelectItem>
                    <SelectItem value="EARN_BOOKING">
                      Points from Booking
                    </SelectItem>
                    <SelectItem value="SPEND">Spend Points</SelectItem>
                    <SelectItem value="SPEND_TICKET">
                      Points for Ticket
                    </SelectItem>
                    <SelectItem value="EXPIRE">Points Expired</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={
                    (table.getColumn("status")?.getFilterValue() as string) ??
                    "all"
                  }
                  onValueChange={(value) =>
                    table.getColumn("status")?.setFilterValue(value)
                  }
                >
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REVERSED">Reversed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter placeholder */}
              {/* <div className="flex items-center gap-4">
                <DateRangePicker
                  date={dateRange}
                  onDateChange={setDateRange}
                  className="w-full"
                />
                {dateRange && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDateRange(undefined)}
                  >
                    Clear Date
                  </Button>
                )}
              </div> */}
            </div>

            {/* Table */}
            <div className="rounded-lg border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="whitespace-nowrap"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className="hover:bg-muted/50 border-b"
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-3">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-64 text-center"
                        >
                          <div className="flex flex-col items-center justify-center gap-3 py-8">
                            <Search className="h-12 w-12 text-muted-foreground opacity-50" />
                            <div className="space-y-1">
                              <p className="text-lg font-medium">
                                No transactions found
                              </p>
                              <p className="text-muted-foreground">
                                {globalFilter ||
                                columnFilters.length > 0 ||
                                dateRange
                                  ? "Try adjusting your filters"
                                  : "No transactions in your account yet"}
                              </p>
                            </div>
                            {(globalFilter ||
                              columnFilters.length > 0 ||
                              dateRange) && (
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setGlobalFilter("")
                                  setColumnFilters([])
                                  setDateRange(undefined)
                                }}
                              >
                                Clear all filters
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredTransactions.length} of {transactions.length}{" "}
                transactions
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <Wallet className="h-4 w-4" />
                  Wallet:{" "}
                  {
                    transactions.filter((t) => t.category === "WALLET").length
                  }{" "}
                  transactions
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Points:{" "}
                  {
                    transactions.filter((t) => t.category === "POINT").length
                  }{" "}
                  transactions
                </span>
              </div>

              <div className="flex items-center gap-2">
                {(globalFilter || columnFilters.length > 0 || dateRange) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGlobalFilter("")
                      setColumnFilters([])
                      setDateRange(undefined)
                    }}
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Reset Filters
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
