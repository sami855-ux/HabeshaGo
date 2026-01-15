"use client"

import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  getPaginationRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import type { Bus } from "@/types/bus"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Bus as BusIcon,
  Users,
  MapPin,
  CheckCircle,
  Wrench,
  AlertCircle,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BusTableProps {
  buses: Bus[]
  isMobile: boolean
  selectedRows: Record<string, boolean>
  onSelectRow: (id: number, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
}

// Status badge with safe access
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<
    string,
    {
      label: string
      color: string
      icon: React.ComponentType<{ className?: string }>
    }
  > = {
    ACTIVE: {
      label: "Active",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      icon: CheckCircle,
    },
    MAINTENANCE: {
      label: "Maintenance",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      icon: Wrench,
    },
    INACTIVE: {
      label: "Inactive",
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      icon: AlertCircle,
    },
  }

  const config = statusConfig[status]

  // Safe fallback for undefined status
  if (!config) {
    return <Badge variant="outline">{status}</Badge>
  }

  const Icon = config.icon
  return (
    <Badge variant="secondary" className={cn("gap-1.5", config.color)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  )
}

// Search and Filter Bar
const TableToolbar = ({ table }: { table: any }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2 flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search buses..."
            value={
              (table.getColumn("busNumber")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("busNumber")?.setFilterValue(event.target.value)
            }
            className="pl-9 w-full sm:w-64"
          />
        </div>
        <Select
          value={
            (table.getColumn("status")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) => {
            if (value === "all") {
              table.getColumn("status")?.setFilterValue(undefined)
            } else {
              table.getColumn("status")?.setFilterValue(value)
            }
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// Table Pagination
const TablePagination = ({ table }: { table: any }) => {
  return (
    <div className="flex items-center justify-between px-2 mt-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Safe columns definition
const createColumns = (): ColumnDef<Bus>[] => [
  {
    accessorKey: "busNumber",
    header: "Bus Number",
    cell: ({ row }) => {
      const bus = row.original
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <BusIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-semibold">{bus.busNumber}</div>
            <div className="text-sm text-muted-foreground">
              Vehicle #{bus.vehicleId || "N/A"}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "driverName",
    header: "Driver",
    cell: ({ row }) => {
      const driverName = row.getValue("driverName") as string
      return (
        <div className="font-medium">
          {driverName || (
            <span className="text-muted-foreground italic">Unassigned</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "routeName",
    header: "Route",
    cell: ({ row }) => {
      const bus = row.original
      return (
        <div>
          <div className="font-medium">{bus.routeName || "No route"}</div>
          {bus.currentStop && (
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {bus.currentStop} → {bus.nextDestination || "Unknown"}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
    cell: ({ row }) => {
      const capacity = row.getValue("capacity") as number
      return (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{capacity || 0} seats</span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return <StatusBadge status={status} />
    },
    filterFn: (row, id, value) => {
      return value === "all" || row.getValue(id) === value
    },
  },
  {
    accessorKey: "currentStop",
    header: "Current Location",
    cell: ({ row }) => {
      const currentStop = row.getValue("currentStop") as string
      return (
        <div className="text-sm">
          {currentStop || (
            <span className="text-muted-foreground italic">Not in service</span>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: () => {
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      )
    },
  },
]

// Mobile card component with pagination
const MobileBusCard = ({
  bus,
  isSelected,
  onSelect,
}: {
  bus: Bus
  isSelected: boolean
  onSelect: (id: number) => void
}) => {
  return (
    <div className="p-4 border rounded-lg mb-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(bus.id)}
            aria-label="Select bus"
          />
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <BusIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-semibold">{bus.busNumber}</div>
              <div className="text-sm text-muted-foreground">
                Vehicle #{bus.vehicleId || "N/A"}
              </div>
            </div>
          </div>
        </div>
        <StatusBadge status={bus.status} />
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-sm text-muted-foreground">Driver</div>
            <div className="font-medium">{bus.driverName || "Unassigned"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Capacity</div>
            <div className="font-medium flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {bus.capacity || 0} seats
            </div>
          </div>
        </div>

        {bus.routeName && (
          <div>
            <div className="text-sm text-muted-foreground">Route</div>
            <div className="font-medium">{bus.routeName}</div>
            {bus.currentStop && (
              <div className="text-sm flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {bus.currentStop} → {bus.nextDestination || "Unknown"}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  )
}

// Mobile pagination component
const MobilePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize: number
  onPageSizeChange: (size: number) => void
  totalItems: number
}) => {
  return (
    <div className="flex flex-col items-center gap-4 mt-4">
      <div className="text-sm text-muted-foreground">
        Showing {Math.min(currentPage * pageSize + 1, totalItems)}-
        {Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems}{" "}
        buses
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
            let pageNum = i
            if (currentPage > 1 && currentPage < totalPages - 2) {
              pageNum = currentPage - 1 + i
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 3 + i
            }

            if (pageNum >= 0 && pageNum < totalPages) {
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum + 1}
                </Button>
              )
            }
            return null
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Select
        value={`${pageSize}`}
        onValueChange={(value) => onPageSizeChange(Number(value))}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder={pageSize} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5 per page</SelectItem>
          <SelectItem value="10">10 per page</SelectItem>
          <SelectItem value="20">20 per page</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default function BusTable({
  buses,
  isMobile,
  selectedRows,
  onSelectRow,
  onSelectAll,
}: BusTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [mobilePage, setMobilePage] = useState(0)
  const [mobilePageSize, setMobilePageSize] = useState(5)

  // Create columns with select column
  const tableColumns: ColumnDef<Bus>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => onSelectAll(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={!!selectedRows[row.original.id]}
          onCheckedChange={(value) => onSelectRow(row.original.id, !!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
    },
    ...createColumns(),
  ]

  const table = useReactTable({
    data: buses || [],
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  // Mobile pagination calculations
  const filteredBuses = buses || []
  const mobileStartIndex = mobilePage * mobilePageSize
  const mobileEndIndex = mobileStartIndex + mobilePageSize
  const mobilePaginatedBuses = filteredBuses.slice(
    mobileStartIndex,
    mobileEndIndex
  )
  const mobileTotalPages = Math.ceil(filteredBuses.length / mobilePageSize)

  if (isMobile) {
    return (
      <div>
        {/* Mobile Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search buses..."
              className="pl-9"
              onChange={(e) => {
                // Simple mobile search - you can implement more complex filtering
                const searchTerm = e.target.value.toLowerCase()
                // This would ideally be handled by the parent component
              }}
            />
          </div>
        </div>

        {/* Mobile Bus Cards */}
        {mobilePaginatedBuses.map((bus) => (
          <MobileBusCard
            key={bus.id}
            bus={bus}
            isSelected={!!selectedRows[bus.id]}
            onSelect={onSelectRow}
          />
        ))}

        {mobilePaginatedBuses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No buses found</p>
          </div>
        )}

        {/* Mobile Pagination */}
        {mobileTotalPages > 1 && (
          <MobilePagination
            currentPage={mobilePage}
            totalPages={mobileTotalPages}
            onPageChange={setMobilePage}
            pageSize={mobilePageSize}
            onPageSizeChange={(size) => {
              setMobilePageSize(size)
              setMobilePage(0) // Reset to first page when changing page size
            }}
            totalItems={filteredBuses.length}
          />
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Desktop Table Toolbar */}
      <TableToolbar table={table} />

      {/* Desktop Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-muted/50"
                    data-state={selectedRows[row.original.id] && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="h-24 text-center"
                  >
                    No buses found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Desktop Pagination */}
      <TablePagination table={table} />
    </div>
  )
}
