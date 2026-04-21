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
  XCircle,
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

// Updated SessionRow type based on actual API response
export type SessionStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "WAITING"
  | "IN_PROGRESS"

export type SessionRow = {
  id: number
  stationId: number
  chargingPointId: number
  vehicleId: number
  userId: string

  startTime: string
  endTime: string | null
  status: SessionStatus

  energyConsumedKwh: number
  durationMinutes: number

  energyCost: number
  timeCost: number
  idleFee: number
  totalCost: number

  stationName: string
  stationAddress: string
  stationCity: string

  connectorType: string
  powerKw: number
  slotNumber: string
  chargingSpeed: string

  userName: string
  userEmail: string

  createdAt: string
}

// Helper functions
const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "-"

const formatNumber = (value?: number | null) => value ?? 0

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)

const formatDuration = (minutes: number) => {
  if (!minutes || minutes === 0) return "-"
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

// Get user initials
const getUserInitials = (userName: string, userEmail: string) => {
  if (userName) {
    const names = userName.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return userName.substring(0, 2).toUpperCase()
  }
  return userEmail.substring(0, 2).toUpperCase()
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
  userName,
  userEmail,
}: {
  userName: string
  userEmail: string
}) => {
  const initials = getUserInitials(userName, userEmail)
  const colorClass = getUserColor(userEmail)

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white ${colorClass}`}
      >
        {initials}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{userName}</span>
        <span className="text-xs text-muted-foreground">{userEmail}</span>
      </div>
    </div>
  )
}

// Status Badge Component
const StatusBadge = ({ status }: { status: SessionStatus }) => {
  const variants = {
    ACTIVE: {
      variant: "default" as const,
      label: "Active",
      className: "bg-green-600",
    },
    IN_PROGRESS: {
      variant: "default" as const,
      label: "In Progress",
      className: "bg-blue-600",
    },
    COMPLETED: {
      variant: "outline" as const,
      label: "Completed",
      className: "border-blue-200 text-blue-600",
    },
    CANCELLED: {
      variant: "secondary" as const,
      label: "Cancelled",
      className: "bg-red-100 text-red-700 border-red-200",
    },
    WAITING: {
      variant: "secondary" as const,
      label: "Waiting",
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
  }

  const config = variants[status] || variants.COMPLETED

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
  columnHelper.accessor("userName", {
    header: "User",
    cell: (info) => (
      <UserAvatar
        userName={info.getValue()}
        userEmail={info.row.original.userEmail}
      />
    ),
  }),
  columnHelper.accessor("slotNumber", {
    header: "Charger",
    cell: (info) => (
      <div className="flex flex-col">
        <span className="font-medium">{info.getValue()}</span>
        <span className="text-xs text-muted-foreground">
          {info.row.original.connectorType} • {info.row.original.powerKw} kW
        </span>
      </div>
    ),
  }),
  columnHelper.accessor("stationName", {
    header: "Station",
    cell: (info) => (
      <div className="flex flex-col">
        <span>{info.getValue()}</span>
        <span className="text-xs text-muted-foreground">
          {info.row.original.stationCity}
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
  columnHelper.accessor("durationMinutes", {
    header: "Duration",
    cell: (info) => formatDuration(info.getValue()),
  }),
  columnHelper.accessor("energyConsumedKwh", {
    header: "Energy (kWh)",
    cell: (info) => formatNumber(info.getValue()).toFixed(1),
  }),
  columnHelper.accessor("totalCost", {
    header: "Total Cost",
    cell: (info) => formatCurrency(info.getValue()),
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
          {(row.original.status === "ACTIVE" ||
            row.original.status === "IN_PROGRESS") && (
            <DropdownMenuItem
              onClick={() => handleCancelSession(row.original)}
              className="text-red-600 focus:text-red-600"
            >
              <XCircle className="mr-2 h-4 w-4" />
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
  onCancelSession?: (session: SessionRow) => Promise<void>
}

export function SessionsTable({
  data = [],
  onRowClick,
  onBulkAction,
  onCancelSession,
}: SessionsTableProps) {
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedSessionForCancel, setSelectedSessionForCancel] =
    useState<SessionRow | null>(null)
  const [bulkAction, setBulkAction] = useState<string>("")
  const [selectedRows, setSelectedRows] = useState<SessionRow[]>([])
  const [rowSelection, setRowSelection] = useState({})
  const [isCancelling, setIsCancelling] = useState(false)

  // Ensure data is always an array
  const safeData = useMemo(() => data || [], [data])

  // Action handlers
  const handleViewDetails = (session: SessionRow) => {
    onRowClick(session)
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

  const handleCancelSessionClick = (session: SessionRow) => {
    setSelectedSessionForCancel(session)
    setShowCancelDialog(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedSessionForCancel) return

    setIsCancelling(true)
    try {
      if (onCancelSession) {
        await onCancelSession(selectedSessionForCancel)
        toast.success(
          `Session #${selectedSessionForCancel.id} cancelled successfully`,
        )
      } else {
        // Default behavior
        toast.warning(`Session #${selectedSessionForCancel.id} cancelled`, {
          description: "The session has been cancelled successfully.",
        })
      }
      setShowCancelDialog(false)
      setSelectedSessionForCancel(null)
    } catch (error) {
      toast.error(`Failed to cancel session #${selectedSessionForCancel.id}`, {
        description:
          error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const columns = useMemo(
    () =>
      getColumns(
        handleViewDetails,
        handleExportSession,
        handleEmailReceipt,
        handleCancelSessionClick,
      ),
    [onCancelSession],
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
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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

      {/* Cancel Session Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this charging session?
              {selectedSessionForCancel && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm font-medium">Session Details:</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Station: {selectedSessionForCancel.stationName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Charger: {selectedSessionForCancel.slotNumber} (
                    {selectedSessionForCancel.connectorType})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    User: {selectedSessionForCancel.userName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Started:{" "}
                    {formatDateTime(selectedSessionForCancel.startTime)}
                  </p>
                </div>
              )}
              <p className="mt-3">
                This action will stop the charging session immediately and
                cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isCancelling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Session"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
