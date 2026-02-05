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
  UserMinus,
  Car,
  Bus,
  CreditCard,
  Shield,
  XCircle,
  CheckSquare,
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
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
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

const getActionConfig = (action: AuditAction) => {
  switch (action) {
    case AuditAction.CREATE:
      return {
        color: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
        icon: UserPlus,
        iconColor: "text-emerald-600",
      }
    case AuditAction.UPDATE:
      return {
        color: "bg-blue-500/10 text-blue-700 border-blue-200",
        icon: Settings,
        iconColor: "text-blue-600",
      }
    case AuditAction.VERIFY:
      return {
        color: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
        icon: Shield,
        iconColor: "text-indigo-600",
      }
    case AuditAction.REJECT:
      return {
        color: "bg-rose-500/10 text-rose-700 border-rose-200",
        icon: XCircle,
        iconColor: "text-rose-600",
      }
    case AuditAction.ACTIVATE:
      return {
        color: "bg-teal-500/10 text-teal-700 border-teal-200",
        icon: CheckCheck,
        iconColor: "text-teal-600",
      }
    case AuditAction.DEACTIVATE:
      return {
        color: "bg-amber-500/10 text-amber-700 border-amber-200",
        icon: Ban,
        iconColor: "text-amber-600",
      }
    case AuditAction.DELETE:
      return {
        color: "bg-red-500/10 text-red-700 border-red-200",
        icon: Trash2,
        iconColor: "text-red-600",
      }
    default:
      return {
        color: "bg-gray-500/10 text-gray-700 border-gray-200",
        icon: AlertCircle,
        iconColor: "text-gray-600",
      }
  }
}

const getEntityIcon = (entityType: EntityType) => {
  switch (entityType) {
    case EntityType.DRIVER:
      return User
    case EntityType.VEHICLE:
      return Car
    case EntityType.BUS:
      return Bus
    case EntityType.WALLET:
      return CreditCard
    case EntityType.USER:
      return User
    default:
      return Settings
  }
}

const getRoleBadge = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN:
      return "bg-purple-100 text-purple-800"
    case UserRole.DRIVER:
      return "bg-blue-100 text-blue-800"
    case UserRole.PASSENGER:
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        size: 50,
      },
      {
        accessorKey: "action",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 font-medium text-gray-900 hover:text-gray-700 group"
          >
            Action
            <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />
          </button>
        ),
        cell: ({ row }) => {
          const { action } = row.original
          const config = getActionConfig(action)
          const Icon = config.icon

          return (
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${config.color} border`}>
                <Icon className={`h-4 w-4 ${config.iconColor}`} />
              </div>
              <span className="font-medium text-gray-900">{action}</span>
            </div>
          )
        },
        filterFn: "includesString",
        size: 160,
      },
      {
        accessorKey: "entityType",
        header: "Entity",
        cell: ({ row }) => {
          const { entityType, entityId } = row.original
          const EntityIcon = getEntityIcon(entityType)

          return (
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                <EntityIcon className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{entityType}</div>
                <div className="text-xs text-gray-500 font-mono mt-0.5">
                  {entityId}
                </div>
              </div>
            </div>
          )
        },
        filterFn: "includesString",
        size: 200,
      },
      {
        accessorKey: "actor",
        header: "Performed By",
        cell: ({ row }) => {
          const { actorId, actorRole } = row.original

          return (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {actorId || "System"}
                  </div>
                  {actorRole && (
                    <div
                      className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadge(actorRole)} inline-block mt-0.5`}
                    >
                      {actorRole}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        },
        size: 220,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 font-medium text-gray-900 hover:text-gray-700 group"
          >
            Timestamp
            <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />
          </button>
        ),
        cell: ({ row }) => {
          const date = row.original.createdAt

          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1 rounded-md bg-gray-50">
                  <Clock className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {format(date, "MMM dd, yyyy")}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(date, "HH:mm:ss")}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {formatDistanceToNow(date, { addSuffix: true })}
              </div>
            </div>
          )
        },
        sortingFn: "datetime",
        size: 180,
      },
      {
        accessorKey: "details",
        header: "Details",
        cell: ({ row }) => {
          const { reason, ipAddress } = row.original
          const isExpanded = expandedRows.has(row.id)

          return (
            <div className="space-y-2">
              {reason && (
                <div className="flex items-start gap-2">
                  <div className="p-1 rounded-md bg-gray-50 mt-0.5">
                    <AlertCircle className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <span className="text-sm text-gray-600 leading-relaxed">
                    {reason}
                  </span>
                </div>
              )}

              {ipAddress && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="p-1 rounded-md bg-gray-50">
                    <Globe className="h-3 w-3 text-gray-500" />
                  </div>
                  <span className="text-gray-500 font-mono">{ipAddress}</span>
                </div>
              )}

              {(row.original.oldValue || row.original.newValue) && (
                <button
                  onClick={() => {
                    const newExpanded = new Set(expandedRows)
                    if (isExpanded) {
                      newExpanded.delete(row.id)
                    } else {
                      newExpanded.add(row.id)
                    }
                    setExpandedRows(newExpanded)
                  }}
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {isExpanded ? "Hide changes" : "View changes"}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>
              )}

              {isExpanded &&
                (row.original.oldValue || row.original.newValue) && (
                  <div className="mt-3 p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      {row.original.oldValue && (
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                            Previous Value
                          </div>
                          <pre className="text-xs bg-white p-3 rounded-lg border border-gray-200 overflow-x-auto font-mono">
                            {JSON.stringify(row.original.oldValue, null, 2)}
                          </pre>
                        </div>
                      )}
                      {row.original.newValue && (
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                            New Value
                          </div>
                          <pre className="text-xs bg-white p-3 rounded-lg border border-gray-200 overflow-x-auto font-mono">
                            {JSON.stringify(row.original.newValue, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          )
        },
        size: 350,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigator.clipboard.writeText(row.original.id)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="Copy Log ID"
            >
              <Copy className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
            </button>
            <button
              onClick={() => console.log("View details:", row.original.id)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="View Details"
            >
              <Eye className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors group">
              <MoreVertical className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
            </button>
          </div>
        ),
        size: 120,
      },
    ],
    [expandedRows],
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Audit Logs
            </h1>
            <p className="text-gray-500 mt-1">
              Monitor all system activities and track changes
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search logs..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-64 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedRows.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl mb-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">
                {selectedRows.length} log{selectedRows.length !== 1 ? "s" : ""}{" "}
                selected
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onExport?.(selectedRows)}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all hover:shadow-sm font-medium text-gray-700"
              >
                <Download className="h-4 w-4" />
                Export Selected
              </button>

              <button
                onClick={() => {
                  if (
                    window.confirm(
                      `Delete ${selectedRows.length} selected audit logs? This action cannot be undone.`,
                    )
                  ) {
                    onDelete?.(selectedRows)
                  }
                }}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition-all hover:shadow-sm font-medium"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Filter by:
            </span>
          </div>

          <select
            className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
            onChange={(e) => {
              const value = e.target.value
              if (value) {
                table.getColumn("action")?.setFilterValue(value)
              } else {
                table.getColumn("action")?.setFilterValue(undefined)
              }
            }}
          >
            <option value="">All Actions</option>
            {Object.values(AuditAction).map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>

          <select
            className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
            onChange={(e) => {
              const value = e.target.value
              if (value) {
                table.getColumn("entityType")?.setFilterValue(value)
              } else {
                table.getColumn("entityType")?.setFilterValue(undefined)
              }
            }}
          >
            <option value="">All Entities</option>
            {Object.values(EntityType).map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setColumnFilters([])
              setGlobalFilter("")
              setRowSelection({})
            }}
            className="px-3.5 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all font-medium"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
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

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: columns.length }).map((_, j) => (
                    <td key={j} className="px-6 py-5">
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="inline-flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No audit logs found
                    </h3>
                    <p className="text-gray-500 max-w-md">
                      Try adjusting your search or filter criteria to find what
                      you're looking for.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/50 transition-colors duration-150"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-5">
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

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium text-gray-900">
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-gray-900">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  data.length,
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900">{data.length}</span>{" "}
              entries
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <select
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
              >
                {[10, 20, 30, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(5, table.getPageCount()) },
                (_, i) => {
                  const pageIndex = i
                  return (
                    <button
                      key={i}
                      className={`h-9 w-9 rounded-xl font-medium transition-all ${
                        table.getState().pagination.pageIndex === pageIndex
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => table.setPageIndex(pageIndex)}
                    >
                      {pageIndex + 1}
                    </button>
                  )
                },
              )}

              {table.getPageCount() > 5 && (
                <>
                  <span className="px-2 text-gray-400">...</span>
                  <button
                    className="h-9 w-9 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-all"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  >
                    {table.getPageCount()}
                  </button>
                </>
              )}
            </div>

            <button
              className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
