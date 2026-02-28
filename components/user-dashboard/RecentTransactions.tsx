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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { DateRange } from "react-day-picker"
import { getWalletTransactions } from "@/services/wallet.api"
import {
  WalletTransactionDTO,
  TransactionType,
  TransactionStatus,
} from "@/types/transaction"
import { useRouter } from "next/navigation"

// API Service - now uses actual API types
const fetchTransactions = async (): Promise<{
  transactions: WalletTransactionDTO[]
}> => {
  // Using the actual API service
  const response = await getWalletTransactions()
  return { transactions: response.transactions || [] }
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

const getStatusConfig = (status: TransactionStatus) => {
  const configs = {
    [TransactionStatus.SUCCESS]: {
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
      icon: CheckCircle,
      label: "Success",
    },
    [TransactionStatus.PENDING]: {
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
      icon: Clock,
      label: "Pending",
    },
    [TransactionStatus.FAILED]: {
      color:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
      icon: XCircle,
      label: "Failed",
    },
    [TransactionStatus.REVERSED]: {
      color:
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
      icon: RefreshCw,
      label: "Reversed",
    },
  }
  return configs[status] || configs[TransactionStatus.PENDING]
}

const getTypeConfig = (type: TransactionType) => {
  const configs = {
    [TransactionType.DEPOSIT]: {
      color:
        "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
      icon: PlusCircle,
      label: "Deposit",
      trend: "positive",
    },
    [TransactionType.WITHDRAW]: {
      color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
      icon: MinusCircle,
      label: "Withdrawal",
      trend: "negative",
    },
    [TransactionType.REFUND]: {
      color:
        "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
      icon: RefreshCw,
      label: "Refund",
      trend: "positive",
    },
    [TransactionType.ADJUSTMENT]: {
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
      icon: Receipt,
      label: "Adjustment",
      trend: "neutral",
    },
    [TransactionType.TRANSFER_OUT]: {
      color:
        "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20",
      icon: ArrowUp,
      label: "Transfer Out",
      trend: "negative",
    },
    [TransactionType.TRANSFER_IN]: {
      color:
        "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
      icon: ArrowDown,
      label: "Transfer In",
      trend: "positive",
    },
    [TransactionType.PAYMENT_OUT]: {
      color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
      icon: CreditCard,
      label: "Payment Out",
      trend: "negative",
    },
    [TransactionType.PAYMENT_IN]: {
      color:
        "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
      icon: CreditCard,
      label: "Payment In",
      trend: "positive",
    },
  }
  return (
    configs[type] || { color: "", icon: Wallet, label: type, trend: "neutral" }
  )
}

// Check if transaction is positive (money in) or negative (money out)
const isPositiveTransaction = (type: TransactionType) => {
  const positiveTypes = [
    TransactionType.DEPOSIT,
    TransactionType.REFUND,
    TransactionType.TRANSFER_IN,
    TransactionType.PAYMENT_IN,
  ]
  return positiveTypes.includes(type)
}

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
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

export default function RecentTransactions() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  // React Query for data fetching
  const {
    data: transactionsData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: fetchTransactions,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Handle view transaction details
  const handleViewDetails = (transaction: WalletTransactionDTO) => {
    toast.info("Transaction Details", {
      description: `Viewing transaction ${transaction.reference}`,
    })
    // In real app: open modal or navigate to detail page
    console.log("Transaction details:", transaction)
  }

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    if (!transactionsData?.transactions) return []

    let filtered = transactionsData.transactions

    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt)
        return (
          transactionDate >= dateRange.from! && transactionDate <= dateRange.to!
        )
      })
    }

    return filtered
  }, [transactionsData?.transactions, dateRange])

  // Define columns
  const createColumns = (
    onViewDetails: (transaction: WalletTransactionDTO) => void,
  ): ColumnDef<WalletTransactionDTO>[] => [
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
        const type = row.getValue("type") as TransactionType
        const config = getTypeConfig(type)
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
              <span className="font-mozilla bg-muted px-1.5 py-0.5 rounded">
                {transaction.reference}
              </span>
              {transaction.metadata && <FileText className="h-3 w-3" />}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "recipientName",
      header: "Recipient Name",
      cell: ({ row }) => {
        const recipientName = row.getValue("recipientName") as string | null
        return <p>{recipientName ?? "No recipient name"}</p>
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true
        return row.getValue(columnId) === filterValue
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
        const amount = parseFloat(row.getValue("amount") as string)
        const type = row.original.type
        const isPositive = isPositiveTransaction(type)

        return (
          <div
            className={cn(
              "font-semibold flex items-center gap-1 font-grotesk ",
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
            {formatCurrency(Math.abs(amount).toFixed(2))}
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
        const status = row.getValue("status") as TransactionStatus
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-medium"
        >
          Balance After
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
        const balance = row.getValue("balanceAfter") as string
        return <div className="font-medium">{formatCurrency(balance)}</div>
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
            variant={"default"}
            className=" cursor-pointer"
            onClick={() =>
              router.push(`/user/wallet/transaction/${transaction.id}`)
            }
            title="View details"
          >
            <Eye className="h-4 w-4" /> View
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
    if (!transactionsData?.transactions) return null

    const successful = transactionsData.transactions.filter(
      (t) => t.status === TransactionStatus.SUCCESS,
    ).length

    const pending = transactionsData.transactions.filter(
      (t) => t.status === TransactionStatus.PENDING,
    ).length

    const failed = transactionsData.transactions.filter(
      (t) => t.status === TransactionStatus.FAILED,
    ).length

    // Calculate total inflow and outflow
    const inflow = transactionsData.transactions
      .filter((t) => isPositiveTransaction(t.type))
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)

    const outflow = transactionsData.transactions
      .filter((t) => !isPositiveTransaction(t.type))
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)

    return { successful, pending, failed, inflow, outflow }
  }, [transactionsData])

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
              Monitor and manage your wallet transactions
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
        {/* Statistics Cards */}
        {statistics && !isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-100 dark:border-green-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Successful</p>
                  <p className="text-2xl font-bold">{statistics.successful}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border border-yellow-100 dark:border-yellow-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{statistics.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10 border border-red-100 dark:border-red-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold">{statistics.failed}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border border-blue-100 dark:border-blue-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Inflow</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(statistics.inflow.toFixed(2))}
                  </p>
                </div>
                <ArrowDown className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-100 dark:border-purple-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Outflow</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(statistics.outflow.toFixed(2))}
                  </p>
                </div>
                <ArrowUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <SelectItem value={TransactionType.DEPOSIT}>
                      Deposit
                    </SelectItem>
                    <SelectItem value={TransactionType.WITHDRAW}>
                      Withdrawal
                    </SelectItem>
                    <SelectItem value={TransactionType.REFUND}>
                      Refund
                    </SelectItem>
                    <SelectItem value={TransactionType.ADJUSTMENT}>
                      Adjustment
                    </SelectItem>
                    <SelectItem value={TransactionType.TRANSFER_OUT}>
                      Transfer Out
                    </SelectItem>
                    <SelectItem value={TransactionType.TRANSFER_IN}>
                      Transfer In
                    </SelectItem>
                    <SelectItem value={TransactionType.PAYMENT_OUT}>
                      Payment Out
                    </SelectItem>
                    <SelectItem value={TransactionType.PAYMENT_IN}>
                      Payment In
                    </SelectItem>
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
                    <SelectItem value={TransactionStatus.SUCCESS}>
                      Success
                    </SelectItem>
                    <SelectItem value={TransactionStatus.PENDING}>
                      Pending
                    </SelectItem>
                    <SelectItem value={TransactionStatus.FAILED}>
                      Failed
                    </SelectItem>
                    <SelectItem value={TransactionStatus.REVERSED}>
                      Reversed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter (if you have a DateRangePicker component) */}
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
                                  : "No transactions in your wallet yet"}
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
                Showing {filteredTransactions.length} transactions
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
              <div>Total transactions: {filteredTransactions.length}</div>

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
