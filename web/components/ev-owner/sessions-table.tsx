"use client"

import { useMemo } from "react"
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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"

export type SessionRow = {
  id: number
  vehicleId: number
  stationId: number
  chargingPointId: number
  userId: string
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
      className: "border-blue-500 text-blue-600",
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

const columns = [
  columnHelper.accessor("userId", {
    header: "User",
    cell: (info) => <div className="font-medium">{info.getValue()}</div>,
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
]

interface SessionsTableProps {
  data: SessionRow[]
  onRowClick: (session: SessionRow) => void
}

export function SessionsTable({ data, onRowClick }: SessionsTableProps) {
  const table = useReactTable({
    data,
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
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
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
                  No sessions found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.length > 0 && (
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
              data.length,
            )}{" "}
            of {data.length} sessions
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
  )
}
