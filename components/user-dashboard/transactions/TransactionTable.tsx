"use client"

import { useState, useMemo, useEffect } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table"
import { Transaction } from "@/lib/types"
import { columns } from "./columns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  TrendingUp,
  CreditCard,
  Banknote,
  RefreshCw,
  X,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Check,
  ChevronDown,
  MoreVertical,
  FileText,
  Mail,
  Printer,
  Trash2,
  Eye,
  Archive,
  AlertCircle,
  Users,
  BarChart3,
  ExternalLink,
  Copy,
  Receipt,
  File,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Sparkles,
  Hash,
  MessageCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  isToday,
  isYesterday,
} from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TransactionTableProps {
  data: Transaction[]
  isLoading?: boolean
}

type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

export function TransactionTable({
  data,
  isLoading = false,
}: TransactionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [isExporting, setIsExporting] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Transaction[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")

  // Enhanced columns with orange theme
  const tableColumns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-[2px] data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px] data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "typeIcon",
        header: "Type",
        cell: ({ row }) => {
          const transaction = row.original
          const isCredit = transaction.type === "TRANSFER_IN"

          return (
            <div
              className={cn(
                "p-2 rounded-lg",
                isCredit
                  ? "bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20"
                  : "bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20",
              )}
            >
              {isCredit ? (
                <ArrowDownRight className="size-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <ArrowUpRight className="size-4 text-orange-600 dark:text-orange-400" />
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "reference",
        header: "Reference",
        cell: ({ row }) => {
          const transaction = row.original
          return (
            <div className="font-mono font-medium text-sm">
              {transaction.reference}
            </div>
          )
        },
      },
      {
        accessorKey: "type",
        header: "Transaction Type",
        cell: ({ row }) => {
          const transaction = row.original
          const isCredit = transaction.type === "TRANSFER_IN"

          return (
            <div className="space-y-1">
              <div className="font-medium">
                {transaction.type === "TRANSFER_IN"
                  ? "Money Received"
                  : "Payment"}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {transaction.description}
              </div>
            </div>
          )
        },
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue?.length) return true
          const type = row.getValue(columnId) as string
          return filterValue.includes(type)
        },
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
          const transaction = row.original
          const isCredit = transaction.type === "TRANSFER_IN"

          return (
            <div
              className={cn(
                "font-bold ",
                isCredit
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-orange-600 dark:text-orange-400",
              )}
            >
              {isCredit ? "+" : "-"}ETB {transaction.amount.toLocaleString()}
            </div>
          )
        },
      },
      {
        accessorKey: "balanceAfter",
        header: "Balance",
        cell: ({ row }) => {
          const transaction = row.original
          return (
            <div className="font-medium ">
              ETB {transaction.balanceAfter.toLocaleString()}
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const transaction = row.original

          const statusConfig = {
            SUCCESS: {
              label: "Success",
              color: "bg-emerald-500",
              text: "text-emerald-700 dark:text-emerald-300",
              bg: "bg-emerald-50 dark:bg-emerald-900/20",
              border: "border-emerald-200 dark:border-emerald-800",
              icon: CheckCircle,
            },
            PENDING: {
              label: "Pending",
              color: "bg-amber-500",
              text: "text-amber-700 dark:text-amber-300",
              bg: "bg-amber-50 dark:bg-amber-900/20",
              border: "border-amber-200 dark:border-amber-800",
              icon: Clock,
            },
            FAILED: {
              label: "Failed",
              color: "bg-red-500",
              text: "text-red-700 dark:text-red-300",
              bg: "bg-red-50 dark:bg-red-900/20",
              border: "border-red-200 dark:border-red-800",
              icon: XCircle,
            },
          }

          const config = statusConfig[transaction.status]
          const Icon = config.icon

          return (
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 px-3 py-1.5",
                config.bg,
                config.border,
                config.text,
              )}
            >
              <Icon className="size-3.5" />
              {config.label}
            </Badge>
          )
        },
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue?.length) return true
          const status = row.getValue(columnId) as string
          return filterValue.includes(status)
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt)
          const isTodayDate = isToday(date)
          const isYesterdayDate = isYesterday(date)

          return (
            <div className="space-y-1">
              <div className="font-medium">
                {isTodayDate
                  ? "Today"
                  : isYesterdayDate
                    ? "Yesterday"
                    : format(date, "MMM dd")}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {format(date, "hh:mm a")}
              </div>
            </div>
          )
        },
      },
      {
        id: "actions",
        header: "Details",
        cell: ({ row }) => {
          const transaction = row.original
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedTransaction(transaction)
                setSheetOpen(true)
              }}
              className="h-8 w-8 p-0 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              <Eye className="size-4 text-orange-600 dark:text-orange-400" />
              <span className="sr-only">View details</span>
            </Button>
          )
        },
      },
    ],
    [],
  )

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  useEffect(() => {
    const selected = table.getSelectedRowModel().rows.map((row) => row.original)
    setSelectedRows(selected)
    setShowBulkActions(selected.length > 0)
  }, [rowSelection, table])

  // Status and Type filter options
  const statusOptions = [
    {
      value: "SUCCESS",
      label: "Success",
      icon: CheckCircle,
      count: data.filter((t) => t.status === "SUCCESS").length,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      value: "PENDING",
      label: "Pending",
      icon: Clock,
      count: data.filter((t) => t.status === "PENDING").length,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      value: "FAILED",
      label: "Failed",
      icon: XCircle,
      count: data.filter((t) => t.status === "FAILED").length,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
  ]

  const typeOptions = [
    {
      value: "TRANSFER_IN",
      label: "Money In",
      icon: ArrowDownRight,
      count: data.filter((t) => t.type === "TRANSFER_IN").length,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      value: "PAYMENT",
      label: "Payment",
      icon: ArrowUpRight,
      count: data.filter((t) => t.type === "PAYMENT").length,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
  ]

  // Calculate stats
  const totalIn = data
    .filter((t) => t.type === "TRANSFER_IN")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalOut = data
    .filter((t) => t.type === "PAYMENT")
    .reduce((sum, t) => sum + t.amount, 0)

  const netFlow = totalIn - totalOut
  const successfulCount = data.filter((t) => t.status === "SUCCESS").length
  const successRate =
    data.length > 0 ? (successfulCount / data.length) * 100 : 0
  const pendingCount = data.filter((t) => t.status === "PENDING").length

  const todayTransactions = data.filter((t) => isToday(new Date(t.createdAt)))
  const todayIn = todayTransactions
    .filter((t) => t.type === "TRANSFER_IN")
    .reduce((sum, t) => sum + t.amount, 0)
  const todayOut = todayTransactions
    .filter((t) => t.type === "PAYMENT")
    .reduce((sum, t) => sum + t.amount, 0)

  const updateActiveFilters = () => {
    const filters: string[] = []
    const statusFilter = table.getColumn("status")?.getFilterValue() as string[]
    const typeFilter = table.getColumn("type")?.getFilterValue() as string[]

    if (statusFilter?.length) {
      filters.push(...statusFilter.map((s) => `Status: ${s}`))
    }
    if (typeFilter?.length) {
      filters.push(
        ...typeFilter.map(
          (t) => `Type: ${t === "TRANSFER_IN" ? "Money In" : "Payment"}`,
        ),
      )
    }
    if (globalFilter) {
      filters.push(`Search: "${globalFilter}"`)
    }
    if (dateRange.from && dateRange.to) {
      filters.push(
        `Date: ${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`,
      )
    }
    setActiveFilters(filters)
  }

  const clearAllFilters = () => {
    setGlobalFilter("")
    table.getColumn("status")?.setFilterValue([])
    table.getColumn("type")?.setFilterValue([])
    setDateRange({ from: undefined, to: undefined })
    setActiveFilters([])
    table.resetRowSelection()
  }

  const handleExport = async () => {
    setIsExporting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const selectedData = selectedRows.length > 0 ? selectedRows : data
    const csvContent = [
      [
        "Date",
        "Reference",
        "Type",
        "Amount",
        "Balance",
        "Status",
        "Description",
      ],
      ...selectedData.map((t) => [
        format(new Date(t.createdAt), "yyyy-MM-dd HH:mm"),
        t.reference,
        t.type === "TRANSFER_IN" ? "Money In" : "Payment",
        t.amount,
        t.balanceAfter,
        t.status,
        t.description,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `habeshago_transactions_${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()

    setIsExporting(false)
  }

  const handleBulkDelete = () => {
    console.log(
      "Deleting transactions:",
      selectedRows.map((t) => t.id),
    )
    setShowDeleteDialog(false)
    table.resetRowSelection()
  }

  const handleQuickDateFilter = (
    range: "today" | "week" | "month" | "year",
  ) => {
    const today = new Date()
    switch (range) {
      case "today":
        setDateRange({ from: today, to: today })
        break
      case "week":
        setDateRange({ from: subDays(today, 7), to: today })
        break
      case "month":
        setDateRange({ from: startOfMonth(today), to: endOfMonth(today) })
        break
      case "year":
        setDateRange({ from: new Date(today.getFullYear(), 0, 1), to: today })
        break
    }
    updateActiveFilters()
  }

  // Transaction Details Sheet
  const TransactionDetailsSheet = ({
    transaction,
  }: {
    transaction: Transaction
  }) => {
    const isCredit = transaction.type === "TRANSFER_IN"

    return (
      <ScrollArea className="h-full">
        <div className="p-6">
          <SheetHeader className="text-left mb-6">
            <div className="flex items-center justify-between mb-2">
              <SheetTitle className="text-xl">Transaction Details</SheetTitle>
              <Badge
                variant={
                  transaction.status === "SUCCESS"
                    ? "success"
                    : transaction.status === "PENDING"
                      ? "warning"
                      : "destructive"
                }
                className="px-3 py-1"
              >
                {transaction.status}
              </Badge>
            </div>
            <SheetDescription>
              Complete information about this transaction
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            {/* Amount Card */}
            <Card
              className={cn(
                "border-none",
                isCredit
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
                  : "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20",
              )}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/80 dark:bg-gray-900/50 mb-4">
                    {isCredit ? (
                      <ArrowDownRight className="size-8 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <ArrowUpRight className="size-8 text-orange-600 dark:text-orange-400" />
                    )}
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {isCredit ? "+" : "-"}ETB{" "}
                    {transaction.amount.toLocaleString()}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {isCredit ? "Money Received" : "Payment"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {transaction.description}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="size-5 text-orange-500" />
                Transaction Information
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Reference ID
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded flex-1">
                      {transaction.reference}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      onClick={() =>
                        navigator.clipboard.writeText(transaction.reference)
                      }
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Date & Time
                  </p>
                  <p className="font-medium">
                    {format(new Date(transaction.createdAt), "PPpp")}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Type
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1.5",
                      isCredit
                        ? "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                        : "border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300",
                    )}
                  >
                    {isCredit ? (
                      <>
                        <ArrowDownRight className="size-3" />
                        Money In
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="size-3" />
                        Payment
                      </>
                    )}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Source
                  </p>
                  <p className="font-medium">
                    {transaction.metadata?.source || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Balance Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Wallet className="size-5 text-orange-500" />
                Balance Information
              </h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Previous Balance
                  </span>
                  <span className="font-medium">
                    ETB{" "}
                    {(
                      transaction.balanceAfter -
                      (isCredit ? -transaction.amount : transaction.amount)
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Transaction Amount
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      isCredit ? "text-emerald-600" : "text-orange-600",
                    )}
                  >
                    {isCredit ? "+" : "-"}ETB{" "}
                    {transaction.amount.toLocaleString()}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between items-center font-bold">
                  <span>New Balance</span>
                  <span className="text-lg text-gray-900 dark:text-white">
                    ETB {transaction.balanceAfter.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="flex-1 gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                <Receipt className="size-4" />
                Download Receipt
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20"
              >
                <Printer className="size-4" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    )
  }

  if (isLoading) {
    return (
      <Card className="border-none shadow-xl bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="pb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-none">
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-7 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight ">
            Transaction History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all your transactions. Click on any row to view
            details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className="bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="table" className="gap-2">
                <FileText className="size-4" />
                Table
              </TabsTrigger>
              <TabsTrigger value="grid" className="gap-2">
                <Hash className="size-4" />
                Grid
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Stats Cards - Orange Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Volume */}
        <Card className="border-none bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Volume
                </p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  ETB {(totalIn + totalOut).toLocaleString()}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {data.length} transactions
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center">
                <DollarSign className="size-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Flow */}
        <Card className="border-none bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Net Flow
                </p>
                <p
                  className={cn(
                    "text-2xl font-bold mt-2",
                    netFlow >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-orange-600 dark:text-orange-400",
                  )}
                >
                  {netFlow >= 0 ? "+" : "-"}ETB{" "}
                  {Math.abs(netFlow).toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Progress
                    value={totalIn ? (totalIn / (totalIn + totalOut)) * 100 : 0}
                    className={cn(
                      "h-1 w-16",
                      netFlow >= 0
                        ? "bg-emerald-200 dark:bg-emerald-900/30"
                        : "bg-orange-200 dark:bg-orange-900/30",
                    )}
                  />
                  <span className="text-xs text-gray-500">
                    {totalIn
                      ? ((totalIn / (totalIn + totalOut)) * 100).toFixed(0)
                      : 0}
                    % in
                  </span>
                </div>
              </div>
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center",
                  netFlow >= 0
                    ? "bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30"
                    : "bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30",
                )}
              >
                <TrendingUp
                  className={cn(
                    "size-5",
                    netFlow >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-orange-600 dark:text-orange-400",
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Activity */}
        <Card className="border-none bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Today
                </p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {todayTransactions.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  +ETB {todayIn.toLocaleString()} / -ETB{" "}
                  {todayOut.toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center">
                <Sparkles className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card className="border-none bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Success Rate
                </p>
                <p className="text-2xl font-bold mt-2 text-green-600 dark:text-green-400">
                  {successRate.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {successfulCount} successful
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="border-none bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending
                </p>
                <p className="text-2xl font-bold mt-2 text-amber-600 dark:text-amber-400">
                  {pendingCount}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {((pendingCount / data.length) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                <Clock className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-900/10 dark:to-amber-900/10">
          <CardContent className="py-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedRows.length} transaction
                    {selectedRows.length !== 1 ? "s" : ""} selected
                  </span>
                  <Badge
                    variant="outline"
                    className="ml-2 border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300"
                  >
                    ETB{" "}
                    {selectedRows
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString()}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/20"
                    >
                      Bulk Actions
                      <ChevronDown className="size-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      Actions for {selectedRows.length} items
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleExport} className="gap-2">
                      <Download className="size-4" />
                      Export Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Mail className="size-4" />
                      Send Receipts
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Printer className="size-4" />
                      Print Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="gap-2 text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="size-4" />
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => table.resetRowSelection()}
                  className="gap-1 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <X className="size-3" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table Card */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-gray-800/50">
        <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-gray-900 dark:text-white">
                Transactions
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {data.length} total transactions • {successRate.toFixed(1)}%
                success rate
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 "
                onClick={() => {
                  table.resetSorting()
                  table.resetColumnFilters()
                  clearAllFilters()
                }}
              >
                <RefreshCw className="size-4" />
                Reset Filters
              </Button>
              <Button
                className="gap-2"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="size-4" />
                    Export
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search by reference, description..."
                  value={globalFilter ?? ""}
                  onChange={(e) => {
                    setGlobalFilter(String(e.target.value))
                    updateActiveFilters()
                  }}
                  className="pl-10 "
                />
                {globalFilter && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setGlobalFilter("")
                      updateActiveFilters()
                    }}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Date Range Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 ">
                    <Calendar className="size-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd")} -{" "}
                          {format(dateRange.to, "LLL dd")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Date Range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 border-b">
                    <div className="flex gap-2">
                      {["today", "week", "month", "year"].map((range) => (
                        <Button
                          key={range}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickDateFilter(range as any)}
                          className="capitalize"
                        >
                          {range}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) => {
                      setDateRange({
                        from: range?.from,
                        to: range?.to,
                      })
                      updateActiveFilters()
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              {/* Status Filter */}
              <DropdownMenu onOpenChange={updateActiveFilters}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 ">
                    <Filter className="size-4" />
                    Status
                    {table.getColumn("status")?.getFilterValue() && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                      >
                        {
                          (
                            table
                              .getColumn("status")
                              ?.getFilterValue() as string[]
                          ).length
                        }
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {statusOptions.map((status) => {
                    const Icon = status.icon
                    return (
                      <DropdownMenuCheckboxItem
                        key={status.value}
                        checked={(
                          table
                            .getColumn("status")
                            ?.getFilterValue() as string[]
                        )?.includes(status.value)}
                        onCheckedChange={(checked) => {
                          const currentFilter =
                            (table
                              .getColumn("status")
                              ?.getFilterValue() as string[]) || []
                          if (checked) {
                            table
                              .getColumn("status")
                              ?.setFilterValue([...currentFilter, status.value])
                          } else {
                            table
                              .getColumn("status")
                              ?.setFilterValue(
                                currentFilter.filter((v) => v !== status.value),
                              )
                          }
                          updateActiveFilters()
                        }}
                        className="gap-2 justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={cn("size-4", status.color)} />
                          {status.label}
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {status.count}
                        </Badge>
                      </DropdownMenuCheckboxItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Type Filter */}
              <DropdownMenu onOpenChange={updateActiveFilters}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 ">
                    <CreditCard className="size-4" />
                    Type
                    {table.getColumn("type")?.getFilterValue() && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                      >
                        {
                          (
                            table
                              .getColumn("type")
                              ?.getFilterValue() as string[]
                          ).length
                        }
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {typeOptions.map((type) => {
                    const Icon = type.icon
                    return (
                      <DropdownMenuCheckboxItem
                        key={type.value}
                        checked={(
                          table.getColumn("type")?.getFilterValue() as string[]
                        )?.includes(type.value)}
                        onCheckedChange={(checked) => {
                          const currentFilter =
                            (table
                              .getColumn("type")
                              ?.getFilterValue() as string[]) || []
                          if (checked) {
                            table
                              .getColumn("type")
                              ?.setFilterValue([...currentFilter, type.value])
                          } else {
                            table
                              .getColumn("type")
                              ?.setFilterValue(
                                currentFilter.filter((v) => v !== type.value),
                              )
                          }
                          updateActiveFilters()
                        }}
                        className="gap-2 justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={cn("size-4", type.color)} />
                          {type.label}
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {type.count}
                        </Badge>
                      </DropdownMenuCheckboxItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {activeFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="gap-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                >
                  <X className="size-3" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 self-center">
                Active filters:
              </span>
              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="gap-1 px-2 py-1 text-xs bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800"
                >
                  {filter}
                  <X
                    className="size-3 cursor-pointer hover:text-orange-800 dark:hover:text-orange-200"
                    onClick={() => {
                      if (filter.startsWith("Status:")) {
                        const status = filter.replace("Status: ", "")
                        const currentFilter =
                          (table
                            .getColumn("status")
                            ?.getFilterValue() as string[]) || []
                        table
                          .getColumn("status")
                          ?.setFilterValue(
                            currentFilter.filter((v) => v !== status),
                          )
                      } else if (filter.startsWith("Type:")) {
                        const type = filter.replace("Type: ", "")
                        const currentFilter =
                          (table
                            .getColumn("type")
                            ?.getFilterValue() as string[]) || []
                        table
                          .getColumn("type")
                          ?.setFilterValue(
                            currentFilter.filter((v) => v !== type),
                          )
                      } else if (filter.startsWith("Search:")) {
                        setGlobalFilter("")
                      } else if (filter.startsWith("Date:")) {
                        setDateRange({ from: undefined, to: undefined })
                      }
                      updateActiveFilters()
                    }}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Table */}
          <div className="rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="bg-orange-50/50 dark:bg-orange-900/10"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="whitespace-nowrap font-semibold text-gray-900 dark:text-white"
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
                    table.getRowModel().rows.map((row) => {
                      const transaction = row.original
                      return (
                        <TableRow
                          key={row.id}
                          className={cn(
                            "group hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors",
                            row.getIsSelected() &&
                              "bg-orange-50 dark:bg-orange-900/20",
                          )}
                          data-state={row.getIsSelected() && "selected"}
                          onClick={(e) => {
                            if (
                              !(e.target as HTMLElement).closest(
                                '[role="checkbox"], button',
                              )
                            ) {
                              setSelectedTransaction(transaction)
                              setSheetOpen(true)
                            }
                          }}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className="whitespace-nowrap py-4"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={tableColumns.length}
                        className="h-48 text-center"
                      >
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3">
                            <Search className="size-8 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              No transactions found
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Try adjusting your search or filter criteria
                            </p>
                          </div>
                          {activeFilters.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearAllFilters}
                              className="mt-2 border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300"
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

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length,
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {table.getFilteredRowModel().rows.length}
              </span>{" "}
              transactions
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Rows per page
                </span>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value))
                  }}
                >
                  <SelectTrigger className="w-20 border-orange-200 dark:border-orange-800">
                    <SelectValue
                      placeholder={String(table.getState().pagination.pageSize)}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 w-8 border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/20"
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <div className="flex items-center gap-1 mx-2">
                  {Array.from(
                    { length: Math.min(5, table.getPageCount()) },
                    (_, i) => {
                      const pageNumber =
                        table.getState().pagination.pageIndex + i - 2
                      if (
                        pageNumber >= 0 &&
                        pageNumber < table.getPageCount()
                      ) {
                        return (
                          <Button
                            key={pageNumber}
                            variant={
                              table.getState().pagination.pageIndex ===
                              pageNumber
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => table.setPageIndex(pageNumber)}
                            className={cn(
                              "h-8 w-8",
                              table.getState().pagination.pageIndex ===
                                pageNumber &&
                                "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
                            )}
                          >
                            {pageNumber + 1}
                          </Button>
                        )
                      }
                      return null
                    },
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 w-8 border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/20"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Transactions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRows.length} transaction
              {selectedRows.length !== 1 ? "s" : ""}? This action cannot be
              undone. The total value of selected transactions is ETB{" "}
              {selectedRows
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              Delete {selectedRows.length} transaction
              {selectedRows.length !== 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transaction Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="sm:max-w-lg w-full border-l border-orange-200 dark:border-orange-800"
        >
          {selectedTransaction && (
            <TransactionDetailsSheet transaction={selectedTransaction} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
