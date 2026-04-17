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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Trash2,
  FileText,
  Mail,
  MoreVertical,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

export type SessionRow = {
  id: number
  vehicleId: number
  stationId: number
  chargingPointId: number
  userId: string
  userName?: string
  userEmail?: string
  userAvatar?: string
  startTime: string
  endTime: string | null
  energyConsumedKwh: string
  energyCost: string
  timeCost: string
  idleFee: string
  totalCost: string
  status: "ACTIVE" | "COMPLETED" | "CANCELLED"
  createdAt: string
  updatedAt: string
  stationName: string
  stationLocation: string
  chargerLabel: string
  chargerDetails?: {
    id: number
    connectorType: string
    powerKw: number
    status: string
    chargingSpeed: string
    slotNumber?: string
    maxVoltage?: number
    maxCurrent?: number
  }
}

// Helper functions
const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "-"

const formatNumber = (value?: string | null) => Number(value ?? 0)

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)

// Get user initials
const getUserInitials = (userId: string, userName?: string) => {
  if (userName) {
    const names = userName.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return userName.substring(0, 2).toUpperCase()
  }
  return userId.substring(0, 2).toUpperCase()
}

// Get random color for user avatar
const getUserColor = (userId: string) => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
  ]
  const index = userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

// User Avatar Component
const UserAvatar = ({
  userId,
  userName,
}: {
  userId: string
  userName?: string
}) => {
  const initials = getUserInitials(userId, userName)
  const colorClass = getUserColor(userId)

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white ${colorClass}`}
      >
        {initials}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{userName || userId}</span>
        {userName && (
          <span className="text-xs text-muted-foreground">{userId}</span>
        )}
      </div>
    </div>
  )
}

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    ACTIVE: {
      variant: "default" as const,
      label: "Active",
      className: "bg-green-600",
    },
    COMPLETED: {
      variant: "outline" as const,
      label: "Completed",
      className: "border-blue-200 text-blue-600",
    },
    CANCELLED: {
      variant: "secondary" as const,
      label: "Cancelled",
      className: "",
    },
  }

  const config = variants[status as keyof typeof variants] || variants.COMPLETED

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}

// Column definitions
const columnHelper = createColumnHelper<SessionRow>()

const getColumns = (
  handleViewDetails: (session: SessionRow) => void,
  handleExportSession: (session: SessionRow) => void,
  handleEmailReceipt: (session: SessionRow) => void,
  handleCancelSession: (session: SessionRow) => void,
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
  columnHelper.accessor("userId", {
    header: "User",
    cell: (info) => (
      <UserAvatar
        userId={info.getValue()}
        userName={info.row.original.userName}
      />
    ),
  }),
  columnHelper.accessor("chargerLabel", {
    header: "Charger",
    cell: (info) => (
      <div className="flex flex-col">
        <span>{info.getValue()}</span>
        <span className="text-xs text-muted-foreground">
          {info.row.original.stationName}
        </span>
      </div>
    ),
  }),
  columnHelper.accessor("startTime", {
    header: "Start Time",
    cell: (info) => formatDateTime(info.getValue()),
  }),
  columnHelper.accessor("endTime", {
    header: "End Time",
    cell: (info) => formatDateTime(info.getValue()),
  }),
  columnHelper.accessor("energyConsumedKwh", {
    header: "Energy (kWh)",
    cell: (info) => formatNumber(info.getValue()),
  }),
  columnHelper.accessor("totalCost", {
    header: "Total Cost",
    cell: (info) => formatCurrency(formatNumber(info.getValue())),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
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
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>
            <FileText className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExportSession(row.original)}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEmailReceipt(row.original)}>
            <Mail className="mr-2 h-4 w-4" />
            Email Receipt
          </DropdownMenuItem>
          {row.original.status === "ACTIVE" && (
            <DropdownMenuItem
              onClick={() => handleCancelSession(row.original)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Cancel Session
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }),
]

interface SessionsTableProps {
  data: SessionRow[] | undefined
  onRowClick: (session: SessionRow) => void
  onBulkAction?: (action: string, selectedRows: SessionRow[]) => void
}

export function SessionsTable({
  data = [],
  onRowClick,
  onBulkAction,
}: SessionsTableProps) {
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false)
  const [bulkAction, setBulkAction] = useState<string>("")
  const [selectedRows, setSelectedRows] = useState<SessionRow[]>([])
  const [rowSelection, setRowSelection] = useState({})

  // Ensure data is always an array
  const safeData = useMemo(() => data || [], [data])

  // Action handlers
  const handleViewDetails = (session: SessionRow) => {
    onRowClick(session)
    toast.info(`Viewing session #${session.id}`)
  }

  const handleExportSession = (session: SessionRow) => {
    toast.success(`Exporting session #${session.id}...`)
    // Implement export logic
  }

  const handleEmailReceipt = (session: SessionRow) => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
      loading: `Sending receipt for session #${session.id}...`,
      success: `Receipt sent for session #${session.id}`,
      error: `Failed to send receipt for session #${session.id}`,
    })
  }

  const handleCancelSession = (session: SessionRow) => {
    toast.warning(`Session #${session.id} cancelled`, {
      description: "The session has been cancelled successfully.",
    })
  }

  const columns = useMemo(
    () =>
      getColumns(
        handleViewDetails,
        handleExportSession,
        handleEmailReceipt,
        handleCancelSession,
      ),
    [],
  )

  const table = useReactTable({
    data: safeData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  })

  // Update selected rows when selection changes
  useMemo(() => {
    const selected = Object.keys(rowSelection)
      .map((index) => safeData[parseInt(index)])
      .filter(Boolean)
    setSelectedRows(selected)
  }, [rowSelection, safeData])

  // Get the rows from the table
  const rows = table.getRowModel().rows
  const selectedCount = Object.keys(rowSelection).length

  const handleBulkAction = (action: string) => {
    setBulkAction(action)
    setShowBulkActionDialog(true)
  }

  const confirmBulkAction = () => {
    if (onBulkAction) {
      onBulkAction(bulkAction, selectedRows)
    } else {
      // Default bulk actions with sonner toasts
      switch (bulkAction) {
        case "export":
          toast.success(`Exporting ${selectedRows.length} sessions...`)
          break
        case "delete":
          toast.error(`${selectedRows.length} sessions have been deleted.`, {
            description: "This action cannot be undone.",
          })
          break
        case "email":
          toast.success(`Receipts sent for ${selectedRows.length} sessions.`)
          break
      }
    }
    table.resetRowSelection()
    setRowSelection({})
    setShowBulkActionDialog(false)
  }

  if (safeData.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 dark:border-slate-800">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => {
                const headerDef = column.columnDef
                return (
                  <TableHead key={index}>
                    {typeof headerDef.header === "string"
                      ? headerDef.header
                      : "Column"}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-muted-foreground"
              >
                No sessions found matching your filters.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Bulk Actions Bar */}
        {selectedCount > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-medium dark:bg-slate-700">
                {selectedCount}
              </div>
              <span className="text-sm font-medium">
                session{selectedCount !== 1 ? "s" : ""} selected
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
                onClick={() => handleBulkAction("delete")}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-slate-700 dark:text-slate-300"
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
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`cursor-pointer transition-colors ${
                    row.getIsSelected()
                      ? "bg-slate-100 dark:bg-slate-800/80"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                  onClick={() => onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
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
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {safeData.length > 0 && (
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
                safeData.length,
              )}{" "}
              of {safeData.length} sessions
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="border-slate-200"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="border-slate-200"
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
                className="border-slate-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="border-slate-200"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog
        open={showBulkActionDialog}
        onOpenChange={setShowBulkActionDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {bulkAction} {selectedRows.length}{" "}
              selected session{selectedRows.length !== 1 ? "s" : ""}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkAction}
              className={
                bulkAction === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-slate-900 hover:bg-slate-800"
              }
            >
              Confirm {bulkAction}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
