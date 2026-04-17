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
import { toast } from "sonner"
import { timeAgo } from "@/lib/utils"

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

// Status Badge Component (neutral colors)
const StatusBadge = ({ status }: { status: PaymentStatus }) => {
  const variants = {
    COMPLETED: {
      label: "Completed",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    PENDING: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    FAILED: {
      label: "Failed",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    REFUNDED: {
      label: "Refunded",
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
  }

  const config = variants[status]

  return (
    <Badge variant="outline" className={`${config.className}`}>
      {config.label}
    </Badge>
  )
}

// Method Badge Component (neutral colors)
const MethodBadge = ({ method }: { method: PaymentMethod }) => {
  const variants = {
    CARD: { label: "Card", className: "bg-blue-100 text-blue-800" },
    WALLET: { label: "Wallet", className: "bg-purple-100 text-purple-800" },
    MOBILE_MONEY: {
      label: "Mobile Money",
      className: "bg-orange-100 text-orange-800",
    },
    BANK_TRANSFER: {
      label: "Bank Transfer",
      className: "bg-cyan-100 text-cyan-800",
    },
  }

  const config = variants[method]

  return (
    <Badge variant="secondary" className={`${config.className}`}>
      {config.label}
    </Badge>
  )
}

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
    header: "Reference",
    cell: (info) => (
      <span className="font-mono text-sm font-medium">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("userName", {
    header: "User Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("stationName", {
    header: "Station Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => formatCurrency(info.getValue(), info.row.original.currency),
  }),
  columnHelper.accessor("method", {
    header: "Method",
    cell: (info) => <MethodBadge method={info.getValue()} />,
  }),
  columnHelper.accessor("gateway", {
    header: "Gateway",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor("startTime", {
    header: "Start Time",
    cell: (info) => timeAgo(info.getValue()),
  }),

  columnHelper.accessor("endTime", {
    header: "End Time",
    cell: (info) => {
      const value = info.getValue()
      return value ? timeAgo(value) : "-"
    },
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
    const failed = filteredData.filter((p) => p.status === "FAILED").length
    const refunded = filteredData.filter((p) => p.status === "REFUNDED").length
    return { completed, pending, failed, refunded, total: filteredData.length }
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
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-slate-600" />
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
              <Trash2 className="mr-2 h-4 w-4" />
              Refund
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by reference, user, station..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-slate-50 p-3 dark:bg-slate-900/50">
          <p className="text-xs text-muted-foreground">Total Transactions</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-green-50 p-3 dark:bg-green-950/20">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-xl font-bold text-green-700">{stats.completed}</p>
        </div>
        <div className="rounded-lg border bg-yellow-50 p-3 dark:bg-yellow-950/20">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="rounded-lg border bg-red-50 p-3 dark:bg-red-950/20">
          <p className="text-xs text-muted-foreground">Failed</p>
          <p className="text-xl font-bold text-red-700">{stats.failed}</p>
        </div>
        <div className="rounded-lg border bg-purple-50 p-3 dark:bg-purple-950/20">
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="text-xl font-bold text-purple-700">
            {formatCurrency(totalRevenue, "USD")}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1 cursor-pointer select-none">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() === "asc" && " ↑"}
                      {header.column.getIsSorted() === "desc" && " ↓"}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
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
                        // Prevent row click when clicking on checkbox or action buttons
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
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No payments found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 py-1 text-sm">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
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
