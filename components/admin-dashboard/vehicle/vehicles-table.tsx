// app/vehicles/components/vehicles-table.tsx
"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Car,
  Bus,
  Truck,
  Shield,
  XCircle,
  CheckCircle,
  Wrench,
  Clock,
  Download,
  UserCheck,
  UserX,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Vehicle, VehicleType, VehicleStatus } from "@/types/vehicle"
import { useState } from "react"
import { Input } from "@/components/ui/input"

interface VehiclesTableProps {
  vehicles: Vehicle[]
  isLoading: boolean
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
  onView: (vehicle: Vehicle) => void
  onBulkAction: (action: string, vehicleIds: string[]) => void
}

export default function VehiclesTable({
  vehicles,
  isLoading,
  onEdit,
  onDelete,
  onView,
  onBulkAction,
}: VehiclesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "plateNumber", desc: false },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")

  const getTypeIcon = (type: VehicleType) => {
    switch (type) {
      case "BUS":
        return Bus
      case "MINIBUS":
        return Car
      case "TRUCK":
        return Truck
      default:
        return Car
    }
  }

  const getStatusConfig = (status: VehicleStatus, isActive: boolean) => {
    if (!isActive) {
      return {
        label: "Inactive",
        icon: XCircle,
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      }
    }

    switch (status) {
      case "ACTIVE":
        return {
          label: "Active",
          icon: CheckCircle,
          color:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        }
      case "MAINTENANCE":
        return {
          label: "Maintenance",
          icon: Wrench,
          color:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
        }
      case "OUT_OF_SERVICE":
        return {
          label: "Out of Service",
          icon: Clock,
          color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        }
      case "INACTIVE":
        return {
          label: "Inactive",
          icon: XCircle,
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        }
      default:
        return {
          label: status,
          icon: Shield,
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        }
    }
  }

  const columns: ColumnDef<Vehicle>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "plateNumber",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-medium"
          >
            Plate Number
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
              ? " ↓"
              : ""}
          </Button>
        )
      },
      cell: ({ row }) => {
        const vehicle = row.original
        return (
          <div className="font-mono font-bold flex items-center gap-2">
            {vehicle.plateNumber}
            {!vehicle.isActive && (
              <Badge variant="outline" className="text-xs h-5">
                Inactive
              </Badge>
            )}
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const vehicle = row.original
        const Icon = getTypeIcon(vehicle.type)
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span>{vehicle.type}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "model",
      header: "Model",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("model")}</span>
      ),
    },
    {
      accessorKey: "capacity",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-medium"
          >
            Capacity
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
              ? " ↓"
              : ""}
          </Button>
        )
      },
      cell: ({ row }) => {
        const capacity = row.getValue("capacity") as number
        return (
          <div className="text-right font-medium">
            {capacity} <span className="text-muted-foreground">seats</span>
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: "manufacturer",
      header: "Manufacturer",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("manufacturer")}</span>
      ),
    },
    {
      accessorKey: "year",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-medium"
          >
            Year
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
              ? " ↓"
              : ""}
          </Button>
        )
      },
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("year")}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-medium"
          >
            Status
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
              ? " ↓"
              : ""}
          </Button>
        )
      },
      cell: ({ row }) => {
        const vehicle = row.original
        const config = getStatusConfig(vehicle.status, vehicle.isActive)
        const Icon = config.icon
        return (
          <Badge
            variant="secondary"
            className={cn("gap-1.5 font-medium", config.color)}
          >
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={cn(
              "font-medium",
              !isActive &&
                "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
            )}
          >
            {isActive ? "Yes" : "No"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const vehicle = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(vehicle)}
              className="h-8 w-8"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(vehicle)}
              className="h-8 w-8"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(vehicle)}
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              title={vehicle.isActive ? "Deactivate" : "Delete"}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
      enableHiding: false,
    },
  ]

  const table = useReactTable({
    data: vehicles,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasSelectedRows = selectedRows.length > 0

  const handleBulkAction = (action: string) => {
    const selectedIds = selectedRows.map((row) => row.original.id)
    onBulkAction(action, selectedIds)
    table.resetRowSelection()
  }

  // Skeleton rows for loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Toolbar Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.id || Math.random()}>
                    {column.id === "actions" ? (
                      <div className="h-4 w-4" />
                    ) : column.id === "select" ? (
                      <Skeleton className="h-4 w-4" />
                    ) : (
                      <Skeleton className="h-4 w-24" />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.id || Math.random()}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
        <p className="text-muted-foreground">
          {"Try adjusting your search or filters"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {hasSelectedRows && (
            <div className="flex items-center gap-2 mr-4">
              <span className="text-sm text-muted-foreground">
                {selectedRows.length} selected
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    Bulk Actions
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleBulkAction("activate")}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBulkAction("deactivate")}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Deactivate Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("export")}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Selected
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleBulkAction("delete")}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search vehicles..."
              className="pl-9 w-full sm:w-64"
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      className="capitalize"
                      onSelect={(e) => {
                        e.preventDefault()
                        column.toggleVisibility(!column.getIsVisible())
                      }}
                    >
                      <Checkbox
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                        className="mr-2"
                      />
                      {column.id}
                    </DropdownMenuItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn(
                  !row.original.isActive && "bg-gray-50/50 dark:bg-gray-900/20",
                  row.getIsSelected() && "bg-primary/5"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Now using TanStack Table's built-in pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {vehicles.length}{" "}
          vehicles
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="border rounded px-2 py-1 text-sm bg-background"
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value))
            }}
          >
            {[5, 10, 20, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

// Search icon component
function SearchIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}
