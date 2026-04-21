"use client"

import { useMemo, useState } from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { motion, AnimatePresence } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Download,
  Trash2,
  Mail,
  FileText,
  MoreVertical,
  CheckSquare,
  Square,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Smartphone,
  Landmark,
  Wallet,
  RefreshCw,
  XCircle,
  CheckCircle,
  Clock,
  Filter,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import { timeAgo } from "@/lib/utils"
import { cn } from "@/lib/utils"

type PaymentStatus =
  | "COMPLETED"
  | "PENDING"
  | "FAILED"
  | "REFUNDED"
  | "PROCESSING"
type PaymentMethod = "CARD" | "WALLET" | "MOBILE_MONEY" | "BANK_TRANSFER"
type PaymentGateway = "STRIPE" | "PAYPAL" | "CHAPA" | "FLUTTERWAVE" | "M-PESA"

export type Payment = {
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

// Modern Status Badge Component
const StatusBadge = ({ status }: { status: PaymentStatus }) => {
  const variants = {
    COMPLETED: {
      icon: CheckCircle,
      label: "Completed",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400",
    },
    PENDING: {
      icon: Clock,
      label: "Pending",
      className:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400",
    },
    PROCESSING: {
      icon: RefreshCw,
      label: "Processing",
      className:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400",
    },
    FAILED: {
      icon: XCircle,
      label: "Failed",
      className:
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400",
    },
    REFUNDED: {
      icon: RefreshCw,
      label: "Refunded",
      className:
        "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400",
    },
  }

  const config = variants[status] || variants.PENDING
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex w-fit items-center gap-1.5 px-2.5 py-1 font-medium",
        config.className,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

// Modern Method Badge Component
const MethodBadge = ({ method }: { method: PaymentMethod }) => {
  const variants = {
    CARD: {
      icon: CreditCard,
      label: "Card",
      className: "bg-blue-50 text-blue-700 dark:bg-blue-950/20",
    },
    WALLET: {
      icon: Wallet,
      label: "Wallet",
      className: "bg-purple-50 text-purple-700 dark:bg-purple-950/20",
    },
    MOBILE_MONEY: {
      icon: Smartphone,
      label: "Mobile Money",
      className: "bg-orange-50 text-orange-700 dark:bg-orange-950/20",
    },
    BANK_TRANSFER: {
      icon: Landmark,
      label: "Bank Transfer",
      className: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/20",
    },
  }

  const config = variants[method]
  const Icon = config.icon

  return (
    <Badge
      variant="secondary"
      className={cn(
        "flex w-fit items-center gap-1.5 px-2.5 py-1 font-medium",
        config.className,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

// Modern Stat Card Component
const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl border bg-gradient-to-br from-white to-slate-50/50 p-4 shadow-sm dark:from-slate-950 dark:to-slate-900/50"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {trend && (
          <div className="mt-1 flex items-center gap-1">
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                trend > 0 ? "text-emerald-600" : "text-red-600",
              )}
            >
              {Math.abs(trend)}% from last month
            </span>
          </div>
        )}
      </div>
      <div className={cn("rounded-full p-3", color)}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </motion.div>
)

// Column definitions with selection
const columnHelper = createColumnHelper<Payment>()

const getColumns = (
  handleViewDetails: (payment: Payment) => void,
  handleExportPayment: (payment: Payment) => void,
  handleEmailReceipt: (payment: Payment) => void,
  handleRefundPayment: (payment: Payment) => void,
) => [
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  }),
  columnHelper.accessor("reference", {
    header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer"
        onClick={() => column.toggleSorting()}
      >
        Reference
        <ArrowUpDown className="h-3 w-3" />
      </div>
    ),
    cell: (info) => (
      <span className="font-mono text-sm font-medium">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("userName", {
    header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer"
        onClick={() => column.toggleSorting()}
      >
        User
        <ArrowUpDown className="h-3 w-3" />
      </div>
    ),
    cell: (info) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-700 text-xs font-medium text-white">
          {info.getValue().charAt(0).toUpperCase()}
        </div>
        <span className="font-medium">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor("stationName", {
    header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer"
        onClick={() => column.toggleSorting()}
      >
        Station
        <ArrowUpDown className="h-3 w-3" />
      </div>
    ),
    cell: (info) => (
      <div>
        <p className="font-medium">{info.getValue()}</p>
        <p className="text-xs text-muted-foreground">
          ID: {info.row.original.stationId}
        </p>
      </div>
    ),
  }),
  columnHelper.accessor("amount", {
    header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer"
        onClick={() => column.toggleSorting()}
      >
        Amount
        <ArrowUpDown className="h-3 w-3" />
      </div>
    ),
    cell: (info) => (
      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
        {formatCurrency(info.getValue(), info.row.original.currency)}
      </span>
    ),
  }),
  columnHelper.accessor("method", {
    header: "Method",
    cell: (info) => <MethodBadge method={info.getValue()} />,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor("startTime", {
    header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer"
        onClick={() => column.toggleSorting()}
      >
        Started
        <ArrowUpDown className="h-3 w-3" />
      </div>
    ),
    cell: (info) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="text-sm">{timeAgo(info.getValue())}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{formatDateTime(info.getValue())}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>
            <FileText className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExportPayment(row.original)}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEmailReceipt(row.original)}>
            <Mail className="mr-2 h-4 w-4" />
            Email Receipt
          </DropdownMenuItem>
          {(row.original.status === "COMPLETED" ||
            row.original.status === "PENDING") && (
            <DropdownMenuItem
              onClick={() => handleRefundPayment(row.original)}
              className="text-red-600 focus:text-red-600"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refund Payment
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }),
]

interface PaymentsTableProps {
  data: Payment[]
  onRowClick?: (payment: Payment) => void
}

export function PaymentsTable({ data, onRowClick }: PaymentsTableProps) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [rowSelection, setRowSelection] = useState({})
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false)
  const [bulkAction, setBulkAction] = useState<string>("")
  const [selectedPayments, setSelectedPayments] = useState<Payment[]>([])

  // Action handlers
  const handleViewDetails = (payment: Payment) => {
    onRowClick?.(payment)
    toast.info(`Viewing payment ${payment.reference}`)
  }

  const handleExportPayment = (payment: Payment) => {
    toast.success(`Exporting payment ${payment.reference}...`)
  }

  const handleEmailReceipt = (payment: Payment) => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
      loading: `Sending receipt for ${payment.reference}...`,
      success: `Receipt sent for ${payment.reference}`,
      error: `Failed to send receipt for ${payment.reference}`,
    })
  }

  const handleRefundPayment = (payment: Payment) => {
    toast.warning(`Refund initiated for ${payment.reference}`, {
      description: `Amount: ${formatCurrency(payment.amount, payment.currency)}`,
    })
  }

  const columns = useMemo(
    () =>
      getColumns(
        handleViewDetails,
        handleExportPayment,
        handleEmailReceipt,
        handleRefundPayment,
      ),
    [],
  )

  const filteredData = useMemo(() => {
    let filtered = data

    if (globalFilter) {
      const term = globalFilter.toLowerCase()
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

    return filtered
  }, [data, globalFilter, statusFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
      sorting: [{ id: "startTime", desc: true }],
    },
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  })

  // Update selected payments when selection changes
  useMemo(() => {
    const selected = Object.keys(rowSelection)
      .map((index) => filteredData[parseInt(index)])
      .filter(Boolean)
    setSelectedPayments(selected)
  }, [rowSelection, filteredData])

  const totalRevenue = useMemo(() => {
    return filteredData.reduce((sum, payment) => {
      if (payment.status === "COMPLETED") {
        return sum + payment.amount
      }
      return sum
    }, 0)
  }, [filteredData])

  const stats = useMemo(() => {
    const completed = filteredData.filter(
      (p) => p.status === "COMPLETED",
    ).length
    const pending = filteredData.filter((p) => p.status === "PENDING").length
    const processing = filteredData.filter(
      (p) => p.status === "PROCESSING",
    ).length
    const failed = filteredData.filter((p) => p.status === "FAILED").length
    const refunded = filteredData.filter((p) => p.status === "REFUNDED").length
    return {
      completed,
      pending,
      processing,
      failed,
      refunded,
      total: filteredData.length,
    }
  }, [filteredData])

  const selectedCount = Object.keys(rowSelection).length

  const handleBulkAction = (action: string) => {
    setBulkAction(action)
    setShowBulkActionDialog(true)
  }

  const confirmBulkAction = () => {
    switch (bulkAction) {
      case "export":
        toast.success(`Exporting ${selectedCount} payments...`)
        break
      case "email":
        toast.success(`Sending receipts to ${selectedCount} customers...`)
        break
      case "refund":
        const totalAmount = selectedPayments.reduce(
          (sum, p) => sum + p.amount,
          0,
        )
        toast.warning(`Refunding ${selectedCount} payments`, {
          description: `Total amount: ${formatCurrency(totalAmount, "USD")}`,
        })
        break
    }
    table.resetRowSelection()
    setRowSelection({})
    setShowBulkActionDialog(false)
  }

  return (
    <div className="space-y-6">
      {/* Modern Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Transactions"
          value={stats.total.toLocaleString()}
          icon={FileText}
          color="bg-blue-100 text-blue-600 dark:bg-blue-950/30"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue, "ETB")}
          icon={TrendingUp}
          color="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30"
          trend={12.5}
        />
        <StatCard
          title="Completed"
          value={stats.completed.toLocaleString()}
          icon={CheckCircle}
          color="bg-green-100 text-green-600 dark:bg-green-950/30"
        />
        <StatCard
          title="Pending"
          value={stats.pending.toLocaleString()}
          icon={Clock}
          color="bg-amber-100 text-amber-600 dark:bg-amber-950/30"
        />
        <StatCard
          title="Failed"
          value={stats.failed.toLocaleString()}
          icon={XCircle}
          color="bg-red-100 text-red-600 dark:bg-red-950/30"
        />
      </div>

      {/* Bulk Actions Bar with Animation */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between rounded-lg bg-gradient-to-r from-slate-100 to-slate-50 p-3 dark:from-slate-800 dark:to-slate-900"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                <CheckSquare className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">
                {selectedCount} payment{selectedCount !== 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("export")}
                className="border-slate-300"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("email")}
                className="border-slate-300"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Receipts
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction("refund")}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refund
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Table */}
      <div className="rounded-xl border bg-white shadow-sm dark:bg-slate-950 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`border-b hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors ${
                      row.getIsSelected()
                        ? "bg-slate-50 dark:bg-slate-900/50"
                        : ""
                    }`}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 text-sm"
                        onClick={(e) => {
                          if (
                            cell.column.id === "select" ||
                            cell.column.id === "actions"
                          ) {
                            e.stopPropagation()
                          }
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-12 w-12 text-slate-300" />
                      <p>No payments found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Modern Pagination */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              filteredData.length,
            )}{" "}
            of {filteredData.length} payments
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-9 w-9 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 px-2">
              <span className="text-sm font-medium">
                {table.getState().pagination.pageIndex + 1}
              </span>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">
                {table.getPageCount()}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-9 w-9 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog
        open={showBulkActionDialog}
        onOpenChange={setShowBulkActionDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {bulkAction} {selectedCount} selected
              payment{selectedCount !== 1 ? "s" : ""}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkAction}
              className={
                bulkAction === "refund" ? "bg-red-600 hover:bg-red-700" : ""
              }
            >
              Confirm {bulkAction}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
