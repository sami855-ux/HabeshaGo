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
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, subDays, startOfMonth, endOfMonth } from "date-fns"
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
  const [sorting, setSorting] = useState<SortingState>([])
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

  // Memoize columns with selection column
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
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
      {
        id: "actions",
        header: "Details",
        cell: ({ row }) => {
          const transaction = row.original
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTransaction(transaction)
                  setSheetOpen(true)
                }}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View details</span>
              </Button>
            </div>
          )
        },
      },
    ],
    []
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

  // Update selected rows when rowSelection changes
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
    },
    {
      value: "PENDING",
      label: "Pending",
      icon: Clock,
      count: data.filter((t) => t.status === "PENDING").length,
    },
    {
      value: "FAILED",
      label: "Failed",
      icon: XCircle,
      count: data.filter((t) => t.status === "FAILED").length,
    },
  ]

  const typeOptions = [
    {
      value: "Tax",
      label: "Tax",
      icon: Banknote,
      count: data.filter((t) => t.type === "Tax").length,
    },
    {
      value: "Transfer",
      label: "Transfer",
      icon: TrendingUp,
      count: data.filter((t) => t.type === "Transfer").length,
    },
    {
      value: "Payment",
      label: "Payment",
      icon: CreditCard,
      count: data.filter((t) => t.type === "Payment").length,
    },
  ]

  // Calculate stats
  const totalAmount = data.reduce((sum, t) => sum + t.amount, 0)
  const successfulCount = data.filter((t) => t.status === "SUCCESS").length
  const successRate =
    data.length > 0 ? (successfulCount / data.length) * 100 : 0
  const pendingCount = data.filter((t) => t.status === "PENDING").length
  const averageAmount = data.length > 0 ? totalAmount / data.length : 0
  const todayAmount = data
    .filter(
      (t) =>
        format(new Date(t.date), "yyyy-MM-dd") ===
        format(new Date(), "yyyy-MM-dd")
    )
    .reduce((sum, t) => sum + t.amount, 0)

  // Update active filters
  const updateActiveFilters = () => {
    const filters: string[] = []
    const statusFilter = table.getColumn("status")?.getFilterValue() as string[]
    const typeFilter = table.getColumn("type")?.getFilterValue() as string[]

    if (statusFilter?.length) {
      filters.push(...statusFilter.map((s) => `Status: ${s}`))
    }
    if (typeFilter?.length) {
      filters.push(...typeFilter.map((t) => `Type: ${t}`))
    }
    if (globalFilter) {
      filters.push(`Search: "${globalFilter}"`)
    }
    if (dateRange.from && dateRange.to) {
      filters.push(
        `Date: ${format(dateRange.from, "MMM dd")} - ${format(
          dateRange.to,
          "MMM dd"
        )}`
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
    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const selectedData = selectedRows.length > 0 ? selectedRows : data
    const csvContent = [
      [
        "Date",
        "Reference ID",
        "Type",
        "Amount",
        "Payment Method",
        "Status",
        "Description",
      ],
      ...selectedData.map((t) => [
        format(new Date(t.date), "yyyy-MM-dd"),
        t.referenceId,
        t.type,
        t.amount,
        t.paymentMethod,
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
    a.download = `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()

    setIsExporting(false)
  }

  const handleBulkDelete = () => {
    // In a real app, you would make an API call here
    console.log(
      "Deleting transactions:",
      selectedRows.map((t) => t.id)
    )
    setShowDeleteDialog(false)
    table.resetRowSelection()
  }

  const handleQuickDateFilter = (
    range: "today" | "week" | "month" | "year"
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

  // Transaction Details Sheet Component
  const TransactionDetailsSheet = ({
    transaction,
  }: {
    transaction: Transaction
  }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "SUCCESS":
          return "bg-green-500"
        case "PENDING":
          return "bg-amber-500"
        case "FAILED":
          return "bg-red-500"
        default:
          return "bg-gray-500"
      }
    }

    const getPaymentMethodIcon = (method: string) => {
      switch (method) {
        case "Telebirr":
          return "💰"
        case "Bank":
          return "🏦"
        case "Card":
          return "💳"
        case "Manual":
          return "📝"
        default:
          return "📊"
      }
    }

    return (
      <ScrollArea className="h-full">
        <div className="p-6">
          <SheetHeader className="text-left mb-6">
            <SheetTitle className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${getStatusColor(
                  transaction.status
                )}`}
              />
              Transaction Details
            </SheetTitle>
            <SheetDescription>
              Complete information about this transaction
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-muted/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">
                    {new Intl.NumberFormat("en-ET", {
                      style: "currency",
                      currency: "ETB",
                    }).format(transaction.amount)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {transaction.type}
                  </p>
                </div>
                <Badge
                  variant={
                    transaction.status === "SUCCESS"
                      ? "success"
                      : transaction.status === "PENDING"
                      ? "warning"
                      : "destructive"
                  }
                >
                  {transaction.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {getPaymentMethodIcon(transaction.paymentMethod)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{transaction.paymentMethod}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transaction.date), "PPpp")}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transaction Information
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Reference ID</p>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm bg-muted px-2 py-1 rounded flex-1">
                      {transaction.referenceId}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        navigator.clipboard.writeText(transaction.referenceId)
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Transaction Date
                  </p>
                  <p className="font-medium">
                    {format(new Date(transaction.date), "PP")}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Payment Method
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <p className="font-medium">{transaction.paymentMethod}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Transaction Type
                  </p>
                  <p className="font-medium">{transaction.type}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Amount Breakdown */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Amount Details
              </h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("en-ET", {
                      style: "currency",
                      currency: "ETB",
                    }).format(transaction.amount)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("en-ET", {
                      style: "currency",
                      currency: "ETB",
                    }).format(transaction.amount * 0.015)}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span className="text-lg">
                    {new Intl.NumberFormat("en-ET", {
                      style: "currency",
                      currency: "ETB",
                    }).format(transaction.amount * 1.015)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Additional Information
              </h4>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{transaction.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Receipt Available
                    </p>
                    <Badge
                      variant={transaction.hasReceipt ? "success" : "secondary"}
                    >
                      {transaction.hasReceipt ? "Available" : "Not Available"}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Processed By
                    </p>
                    <p className="font-medium">System Auto</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="flex-1 gap-2">
                <Receipt className="h-4 w-4" />
                {transaction.hasReceipt
                  ? "Download Receipt"
                  : "Request Receipt"}
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            {/* Timeline */}
            <div className="space-y-4 pt-4">
              <h4 className="font-semibold text-lg">Transaction Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">Transaction Initiated</p>
                    <p className="text-sm text-muted-foreground">
                      {format(subDays(new Date(transaction.date), 1), "PPpp")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">Processing</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), "PPpp")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">
                      {transaction.status === "SUCCESS"
                        ? "Completed Successfully"
                        : transaction.status === "PENDING"
                        ? "Pending Completion"
                        : "Failed"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), "PPpp")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    )
  }

  if (isLoading) {
    return (
      <Card className="border">
        <CardHeader className="pb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border">
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
          <h1 className="text-3xl font-bold tracking-tight">
            Transaction History
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your transactions. Click on any row to view
            details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              table.resetSorting()
              table.resetColumnFilters()
              clearAllFilters()
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Reset All
          </Button>
          <Button
            className="gap-2"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Volume
                </p>
                <p className="text-2xl font-bold mt-2">
                  {new Intl.NumberFormat("en-ET", {
                    style: "currency",
                    currency: "ETB",
                    minimumFractionDigits: 0,
                  }).format(totalAmount)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +5.2% from last month
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Today
                </p>
                <p className="text-2xl font-bold mt-2">
                  {new Intl.NumberFormat("en-ET", {
                    style: "currency",
                    currency: "ETB",
                    minimumFractionDigits: 0,
                  }).format(todayAmount)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Progress value={75} className="h-1 w-16" />
                  <span className="text-xs text-muted-foreground">
                    75% of goal
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Success Rate
                </p>
                <p className="text-2xl font-bold mt-2">
                  {successRate.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {successfulCount} successful
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold mt-2">{pendingCount}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {((pendingCount / data.length) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Value
                </p>
                <p className="text-2xl font-bold mt-2">
                  {new Intl.NumberFormat("en-ET", {
                    style: "currency",
                    currency: "ETB",
                    minimumFractionDigits: 0,
                  }).format(averageAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  per transaction
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {selectedRows.length} transaction
                    {selectedRows.length !== 1 ? "s" : ""} selected
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {new Intl.NumberFormat("en-ET", {
                      style: "currency",
                      currency: "ETB",
                      minimumFractionDigits: 0,
                    }).format(
                      selectedRows.reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </Badge>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {new Set(selectedRows.map((t) => t.paymentMethod)).size}{" "}
                  payment methods
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      Bulk Actions
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      Actions for {selectedRows.length} items
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleExport} className="gap-2">
                      <Download className="h-4 w-4" />
                      Export Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Mail className="h-4 w-4" />
                      Send Receipts
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Printer className="h-4 w-4" />
                      Print Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Archive className="h-4 w-4" />
                      Archive Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => table.resetRowSelection()}
                  className="gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                {data.length} total transactions • {successRate.toFixed(1)}%
                success rate
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  table.resetSorting()
                  table.resetColumnFilters()
                  clearAllFilters()
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions by ID, amount, or description..."
                  value={globalFilter ?? ""}
                  onChange={(e) => {
                    setGlobalFilter(String(e.target.value))
                    updateActiveFilters()
                  }}
                  className="pl-10"
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
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Date Range Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
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
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Status
                    {table.getColumn("status")?.getFilterValue() && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 w-5 p-0 flex items-center justify-center"
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
                                currentFilter.filter((v) => v !== status.value)
                              )
                          }
                          updateActiveFilters()
                        }}
                        className="gap-2 justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {status.label}
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {status.count}
                        </Badge>
                      </DropdownMenuCheckboxItem>
                    )
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={
                      !(table.getColumn("status")?.getFilterValue() as string[])
                        ?.length
                    }
                    onCheckedChange={() => {
                      table.getColumn("status")?.setFilterValue([])
                      updateActiveFilters()
                    }}
                  >
                    Show All
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Type Filter */}
              <DropdownMenu onOpenChange={updateActiveFilters}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    Type
                    {table.getColumn("type")?.getFilterValue() && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 w-5 p-0 flex items-center justify-center"
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
                                currentFilter.filter((v) => v !== type.value)
                              )
                          }
                          updateActiveFilters()
                        }}
                        className="gap-2 justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {type.count}
                        </Badge>
                      </DropdownMenuCheckboxItem>
                    )
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={
                      !(table.getColumn("type")?.getFilterValue() as string[])
                        ?.length
                    }
                    onCheckedChange={() => {
                      table.getColumn("type")?.setFilterValue([])
                      updateActiveFilters()
                    }}
                  >
                    Show All
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <MoreVertical className="h-4 w-4" />
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export All
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Eye className="h-4 w-4" />
                    Column Visibility
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <FileText className="h-4 w-4" />
                    Generate Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {activeFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="gap-1 text-muted-foreground"
                >
                  <X className="h-3 w-3" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm text-muted-foreground self-center">
                Active filters:
              </span>
              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="gap-1 px-2 py-1 text-xs"
                >
                  {filter}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
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
                            currentFilter.filter((v) => v !== status)
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
                            currentFilter.filter((v) => v !== type)
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
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
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
                                header.getContext()
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
                            "group hover:bg-muted/50",
                            row.getIsSelected() && "bg-primary/5"
                          )}
                          data-state={row.getIsSelected() && "selected"}
                          onClick={(e) => {
                            // Only open sheet if not clicking on checkbox or actions
                            if (
                              !(e.target as HTMLElement).closest(
                                '[role="checkbox"], button'
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
                              className="whitespace-nowrap"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
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
                          <div className="rounded-full bg-muted p-3">
                            <Search className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">No transactions found</p>
                            <p className="text-sm text-muted-foreground">
                              Try adjusting your search or filter criteria
                            </p>
                          </div>
                          {activeFilters.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearAllFilters}
                              className="mt-2"
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
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {table.getFilteredRowModel().rows.length}
              </span>{" "}
              transactions
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page
                </span>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value))
                  }}
                >
                  <SelectTrigger className="w-20">
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
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
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
                                pageNumber && "bg-primary"
                            )}
                          >
                            {pageNumber + 1}
                          </Button>
                        )
                      }
                      return null
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
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
              undone. The total value of selected transactions is{" "}
              {new Intl.NumberFormat("en-ET", {
                style: "currency",
                currency: "ETB",
                minimumFractionDigits: 0,
              }).format(selectedRows.reduce((sum, t) => sum + t.amount, 0))}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedRows.length} transaction
              {selectedRows.length !== 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transaction Details Sheet - Single Controlled Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-lg w-full">
          {selectedTransaction && (
            <TransactionDetailsSheet transaction={selectedTransaction} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
