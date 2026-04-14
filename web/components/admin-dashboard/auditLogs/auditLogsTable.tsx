"use client"

import React, { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table"
import {
  Download,
  Filter,
  Search,
  ChevronDown,
  Eye,
  Trash2,
  MoreVertical,
  RefreshCw,
  UserPlus,
  Car,
  Bus,
  CreditCard,
  Shield,
  XCircle,
  AlertCircle,
  Copy,
  ArrowUpDown,
  User,
  Clock,
  Globe,
  CheckCircle2,
  Settings,
  Ban,
  CheckCheck,
  Calendar,
  X,
  Info,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { AuditLog, AuditAction, EntityType } from "@/types/audit-log"

export enum UserRole {
  ADMIN = "ADMIN",
  PASSENGER = "PASSENGER",
  DRIVER = "DRIVER",
}

interface AuditLogsTableProps {
  data: AuditLog[]
  isLoading?: boolean
  onRefresh?: () => void
  onExport?: (selectedIds: string[]) => void
  onDelete?: (selectedIds: string[]) => void
}

// Modern Action Badge Component
const ActionBadge = ({ action }: { action: AuditAction }) => {
  const config = {
    [AuditAction.CREATE]: {
      icon: UserPlus,
      label: "Create",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
    },
    [AuditAction.UPDATE]: {
      icon: Settings,
      label: "Update",
      className:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    },
    [AuditAction.VERIFY]: {
      icon: Shield,
      label: "Verify",
      className:
        "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800",
    },
    [AuditAction.REJECT]: {
      icon: XCircle,
      label: "Reject",
      className:
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
    },
    [AuditAction.ACTIVATE]: {
      icon: CheckCheck,
      label: "Activate",
      className:
        "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800",
    },
    [AuditAction.DEACTIVATE]: {
      icon: Ban,
      label: "Deactivate",
      className:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    },
    [AuditAction.DELETE]: {
      icon: Trash2,
      label: "Delete",
      className:
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
    },
  }

  const {
    icon: Icon,
    label,
    className,
  } = config[action] || config[AuditAction.UPDATE]

  return (
    <Badge variant="outline" className={`gap-1.5 px-2.5 py-1 ${className}`}>
      <Icon className="h-3 w-3" />
      <span className="text-xs font-medium">{label}</span>
    </Badge>
  )
}

// Modern Entity Badge Component
const EntityBadge = ({ entityType }: { entityType: EntityType }) => {
  const config = {
    [EntityType.DRIVER]: {
      icon: User,
      label: "Driver",
      className:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
    },
    [EntityType.VEHICLE]: {
      icon: Car,
      label: "Vehicle",
      className:
        "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400",
    },
    [EntityType.BUS]: {
      icon: Bus,
      label: "Bus",
      className:
        "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400",
    },
    [EntityType.WALLET]: {
      icon: CreditCard,
      label: "Wallet",
      className:
        "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400",
    },
    [EntityType.USER]: {
      icon: User,
      label: "User",
      className:
        "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/50 dark:text-gray-400",
    },
  }

  const {
    icon: Icon,
    label,
    className,
  } = config[entityType] || config[EntityType.USER]

  return (
    <Badge variant="outline" className={`gap-1.5 px-2.5 py-1 ${className}`}>
      <Icon className="h-3 w-3" />
      <span className="text-sm font-medium">{label}</span>
    </Badge>
  )
}

// Modern Role Badge
const RoleBadge = ({ role }: { role: UserRole }) => {
  const config = {
    [UserRole.ADMIN]: {
      label: "Admin",
      className:
        "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400",
    },
    [UserRole.DRIVER]: {
      label: "Driver",
      className:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
    },
    [UserRole.PASSENGER]: {
      label: "Passenger",
      className:
        "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400",
    },
  }

  const { label, className } = config[role] || config[UserRole.PASSENGER]

  return (
    <Badge variant="outline" className={`px-2 py-0.5 text-xs ${className}`}>
      {label}
    </Badge>
  )
}

// Log Details Dialog Component
const LogDetailsDialog = ({
  log,
  open,
  onOpenChange,
}: {
  log: AuditLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  if (!log) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Audit Log Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about this audit event
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Log ID</p>
              <p className="text-sm font-mono font-medium">{log.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
              <p className="text-sm font-medium">
                {format(log.createdAt, "PPP 'at' p")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Action</p>
              <ActionBadge action={log.action} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Entity</p>
              <EntityBadge entityType={log.entityType} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Entity ID</p>
              <p className="text-sm font-mono">{log.entityId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Performed By</p>
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30">
                  <User className="h-3 w-3 text-emerald-600" />
                </div>
                <span className="text-sm font-medium">
                  {log.actorId || "System"}
                </span>
                {log.actorRole && <RoleBadge role={log.actorRole} />}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {(log.reason || log.ipAddress) && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Additional Information
              </h4>
              <div className="space-y-2">
                {log.reason && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                        Reason
                      </p>
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        {log.reason}
                      </p>
                    </div>
                  </div>
                )}
                {log.ipAddress && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        IP Address
                      </p>
                      <p className="text-sm font-mono">{log.ipAddress}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Changes Section */}
          {(log.oldValue || log.newValue) && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Data Changes
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                {log.oldValue && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <p className="text-xs font-medium text-red-600 dark:text-red-400">
                        Previous Value
                      </p>
                    </div>
                    <pre className="text-xs bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800 overflow-x-auto font-mono">
                      {JSON.stringify(log.oldValue, null, 2)}
                    </pre>
                  </div>
                )}
                {log.newValue && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <p className="text-xs font-medium text-green-600 dark:text-green-400">
                        New Value
                      </p>
                    </div>
                    <pre className="text-xs bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800 overflow-x-auto font-mono">
                      {JSON.stringify(log.newValue, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(log, null, 2))
              onOpenChange(false)
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy JSON
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AuditLogsTable({
  data,
  isLoading = false,
  onRefresh,
  onExport,
  onDelete,
}: AuditLogsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean
    action: "delete" | "export" | null
    selectedIds: string[]
  }>({
    open: false,
    action: null,
    selectedIds: [],
  })

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="h-4 w-4"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="h-4 w-4"
          />
        ),
        size: 40,
      },
      {
        accessorKey: "action",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold whitespace-nowrap px-2"
          >
            Action
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <ActionBadge action={row.original.action} />,
        filterFn: "includesString",
        size: 120,
      },
      {
        accessorKey: "entityType",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold whitespace-nowrap px-2"
          >
            Entity
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const { entityType, entityId } = row.original
          return (
            <div className="space-y-1">
              <EntityBadge entityType={entityType} />
            </div>
          )
        },
        filterFn: "includesString",
        size: 140,
      },
      {
        accessorKey: "actor",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold whitespace-nowrap px-2"
          >
            Performed By
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const { actorId, actorRole } = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30">
                <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {actorId || "System"}
                </div>
                {actorRole && <RoleBadge role={actorRole} />}
              </div>
            </div>
          )
        },
        size: 200,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold whitespace-nowrap px-2"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Timestamp
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.original.createdAt
          return (
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {format(date, "MMM dd, yyyy")}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {format(date, "HH:mm:ss")}
              </div>
              <div className="text-xs text-muted-foreground/70">
                {formatDistanceToNow(date, { addSuffix: true })}
              </div>
            </div>
          )
        },
        sortingFn: "datetime",
        size: 160,
      },
      {
        accessorKey: "details",
        header: "Details",
        cell: ({ row }) => {
          const { reason, ipAddress } = row.original
          return (
            <div className="space-y-2 max-w-md">
              {reason && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {reason}
                  </span>
                </div>
              )}
              {ipAddress && (
                <div className="flex items-center gap-2 text-xs">
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground font-mono">
                    {ipAddress}
                  </span>
                </div>
              )}
            </div>
          )
        },
        size: 280,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600"
              onClick={() => {
                setSelectedLog(row.original)
                setDetailsDialogOpen(true)
              }}
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(row.original.id)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Log ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedLog(row.original)
                    setDetailsDialogOpen(true)
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        size: 80,
      },
    ],
    [],
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id)

  const handleBulkAction = (action: "delete" | "export") => {
    if (selectedRows.length === 0) return
    setBulkActionDialog({
      open: true,
      action,
      selectedIds: selectedRows,
    })
  }

  const confirmBulkAction = () => {
    if (bulkActionDialog.action === "delete") {
      onDelete?.(bulkActionDialog.selectedIds)
      setRowSelection({})
    } else if (bulkActionDialog.action === "export") {
      onExport?.(bulkActionDialog.selectedIds)
    }
    setBulkActionDialog({ open: false, action: null, selectedIds: [] })
  }

  return (
    <>
      <div className="space-y-4">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 flex items-center gap-4 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs by action, entity, or details..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 rounded-full"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 rounded-full"
            >
              <Filter className="h-4 w-4" />
              Filters
              {columnFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1 rounded-full">
                  {columnFilters.length}
                </Badge>
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="rounded-full h-9 w-9"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedRows.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-full border border-blue-200 dark:border-blue-800"
            >
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                {selectedRows.length} log{selectedRows.length !== 1 ? "s" : ""}{" "}
                selected
              </span>
              <div className="h-4 w-px bg-blue-200 dark:bg-blue-800" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkAction("export")}
                className="gap-2 text-blue-700 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkAction("delete")}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </motion.div>
          )}
        </div>

        {/* Filter Bar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800">
                <Select
                  onValueChange={(value) => {
                    if (value && value !== "all") {
                      table.getColumn("action")?.setFilterValue(value)
                    } else {
                      table.getColumn("action")?.setFilterValue(undefined)
                    }
                  }}
                >
                  <SelectTrigger className="w-[140px] rounded-full">
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {Object.values(AuditAction).map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={(value) => {
                    if (value && value !== "all") {
                      table.getColumn("entityType")?.setFilterValue(value)
                    } else {
                      table.getColumn("entityType")?.setFilterValue(undefined)
                    }
                  }}
                >
                  <SelectTrigger className="w-[140px] rounded-full">
                    <SelectValue placeholder="All Entities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entities</SelectItem>
                    {Object.values(EntityType).map((entity) => (
                      <SelectItem key={entity} value={entity}>
                        {entity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setColumnFilters([])
                    setGlobalFilter("")
                  }}
                  className="rounded-full"
                >
                  Clear all
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="rounded-2xl border bg-white dark:bg-gray-950 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                        style={{ width: header.getSize() }}
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

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: columns.length }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-10 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-3">
                          <Search className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          No audit logs found
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedLog(row.original)
                        setDetailsDialogOpen(true)
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}{" "}
                to{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  data.length,
                )}{" "}
                of {data.length} entries
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page:
                </span>
                <Select
                  value={table.getState().pagination.pageSize.toString()}
                  onValueChange={(value) => table.setPageSize(Number(value))}
                >
                  <SelectTrigger className="w-20 h-8 rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 30, 50, 100].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="rounded-full"
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, table.getPageCount()) },
                  (_, i) => {
                    const pageIndex = i
                    return (
                      <Button
                        key={i}
                        variant={
                          table.getState().pagination.pageIndex === pageIndex
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => table.setPageIndex(pageIndex)}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        {pageIndex + 1}
                      </Button>
                    )
                  },
                )}

                {table.getPageCount() > 5 && (
                  <>
                    <span className="px-2 text-muted-foreground">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        table.setPageIndex(table.getPageCount() - 1)
                      }
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      {table.getPageCount()}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="rounded-full"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Log Details Dialog */}
      <LogDetailsDialog
        log={selectedLog}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog
        open={bulkActionDialog.open}
        onOpenChange={(open) =>
          setBulkActionDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkActionDialog.action === "delete"
                ? "Delete Selected Logs"
                : "Export Selected Logs"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkActionDialog.action === "delete" ? (
                <>
                  This action will permanently delete{" "}
                  <strong>{bulkActionDialog.selectedIds.length}</strong> audit
                  log
                  {bulkActionDialog.selectedIds.length > 1 ? "s" : ""}. This
                  action cannot be undone.
                </>
              ) : (
                <>
                  You are about to export{" "}
                  <strong>{bulkActionDialog.selectedIds.length}</strong> audit
                  log
                  {bulkActionDialog.selectedIds.length > 1 ? "s" : ""}. The data
                  will be downloaded as a JSON file.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkAction}
              className={
                bulkActionDialog.action === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
            >
              {bulkActionDialog.action === "delete" ? "Delete" : "Export"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
