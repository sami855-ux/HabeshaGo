"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, WifiOff, ArrowUpDown } from "lucide-react"
import {
  ChargerRow,
  toUiStatus,
} from "@/app/(dashbaord)/ev-charge-manager/chargers/page"

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    AVAILABLE: {
      label: "Available",
      className: "border-green-200 text-green-600 bg-green-50",
    },
    CHARGING: {
      label: "Charging",
      className: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    FAULT: {
      label: "Fault",
      className: "bg-red-600 text-white",
    },
    OFFLINE: {
      label: "Offline",
      className: "bg-gray-400 text-white",
    },
  }

  const config = variants[status as keyof typeof variants] || variants.FAULT

  return <Badge className={config.className}>{config.label}</Badge>
}

interface ChargersTableProps {
  data: ChargerRow[]
  globalFilter: string
  setGlobalFilter: (value: string) => void
  onToggleStatus: (charger: ChargerRow) => void
  isToggling: boolean
  togglingId?: number
}

export function ChargersTable({
  data,
  onToggleStatus,
  isToggling,
  togglingId,
}: ChargersTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])

  // Define table columns
  const columns: ColumnDef<ChargerRow>[] = useMemo(
    () => [
      {
        accessorKey: "slotNumber",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-blue-900 hover:text-blue-700"
          >
            Slot Number
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => row.original.slotNumber || `Slot-${row.original.id}`,
      },
      {
        accessorKey: "stationName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-blue-900 hover:text-blue-700"
          >
            Station
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <Button
            variant="link"
            className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800"
            onClick={() =>
              router.push(
                `/ev-charge-manager/stations/${row.original.stationId}`,
              )
            }
          >
            {row.original.stationName}
          </Button>
        ),
      },
      {
        accessorKey: "stationAddress",
        header: ({ column }) => (
          <Button variant="ghost" className="text-blue-900 hover:text-blue-700">
            Location
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const address = row.original.stationAddress
          const city = row.original.stationCity
          return (
            <span className="text-muted-foreground">
              {address}
              {city ? `, ${city}` : ""}
            </span>
          )
        },
      },
      {
        accessorKey: "connectorType",
        header: ({ column }) => (
          <Button variant="ghost" className="text-blue-900 hover:text-blue-700">
            Connector Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <Badge variant="outline" className="border-blue-200 text-blue-700">
            {row.original.connectorType}
          </Badge>
        ),
      },
      {
        accessorKey: "powerKw",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-blue-900 hover:text-blue-700"
          >
            Power (kW)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.powerKw} kW</span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button variant="ghost" className="text-blue-900 hover:text-blue-700">
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const uiStatus = toUiStatus(row.original.status)
          return <StatusBadge status={uiStatus} />
        },
      },
      {
        accessorKey: "chargingSpeed",
        header: ({ column }) => (
          <Button variant="ghost" className="text-blue-900 hover:text-blue-700">
            Charging Speed
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {row.original.chargingSpeed.replace("_", " ")}
          </Badge>
        ),
      },
      {
        accessorKey: "isFastCharger",
        header: ({ column }) => (
          <Button variant="ghost" className="text-blue-900 hover:text-blue-700">
            Fast Charger
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <Badge
            variant={row.original.isFastCharger ? "default" : "secondary"}
            className={
              row.original.isFastCharger
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }
          >
            {row.original.isFastCharger ? "Yes" : "No"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: ({ column }) => (
          <Button variant="ghost" className="text-blue-900 hover:text-blue-700">
            Actions
          </Button>
        ),
        cell: ({ row }) => {
          const charger = row.original
          const isDisabled = !charger.isAvailable
          const isTogglingThis = isToggling && togglingId === charger.id

          return (
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  router.push(
                    `/ev-charge-manager/stations/${charger.stationId}?chargerId=${charger.id}`,
                  )
                }
                className="border-blue-200 hover:bg-blue-50"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant={isDisabled ? "default" : "secondary"}
                onClick={() => onToggleStatus(charger)}
                disabled={isTogglingThis}
                className={
                  !isDisabled
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }
              >
                {isTogglingThis ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : isDisabled ? (
                  "Enable"
                ) : (
                  "Disable"
                )}
              </Button>
            </div>
          )
        },
      },
    ],
    [router, onToggleStatus, isToggling, togglingId],
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <>
      <div className="rounded-md border border-blue-100 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left">
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
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-blue-100 hover:bg-blue-50/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
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
                <td colSpan={columns.length} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <WifiOff className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No chargers found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}{" "}
            of {table.getFilteredRowModel().rows.length} chargers
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-blue-200 hover:bg-blue-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-blue-200 hover:bg-blue-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
