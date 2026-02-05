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
  FilterFn,
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
  DropdownMenuCheckboxItem,
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
  Search,
  BarChart3,
  MapPin,
  Battery,
  Calendar,
  Gauge,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Vehicle, VehicleType, VehicleStatus } from "@/types/vehicle"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
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
    // Map "UNDER_MAINTENANCE" to "MAINTENANCE" for compatibility
    const normalizedStatus =
      status === "UNDER_MAINTENANCE" ? "MAINTENANCE" : status

    if (!isActive) {
      return {
        label: "Inactive",
        icon: XCircle,
        variant: "secondary" as const,
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      }
    }

    switch (normalizedStatus) {
      case "ACTIVE":
        return {
          label: "Active",
          icon: CheckCircle,
          variant: "default" as const,
          className:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        }
      case "MAINTENANCE":
        return {
          label: "Maintenance",
          icon: Wrench,
          variant: "secondary" as const,
          className:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
        }
      case "OUT_OF_SERVICE":
        return {
          label: "Out of Service",
          icon: Clock,
          variant: "destructive" as const,
          className:
            "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        }
      case "INACTIVE":
        return {
          label: "Inactive",
          icon: XCircle,
          variant: "secondary" as const,
          className:
            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        }
      default:
        return {
          label: status,
          icon: Shield,
          variant: "outline" as const,
          className:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        }
    }
  }

  const formatMileage = (mileage: number) => {
    return mileage >= 1000
      ? `${(mileage / 1000).toFixed(1)}k km`
      : `${mileage} km`
  }

  const getMileageStatus = (mileage: number) => {
    if (mileage > 100000) return "high"
    if (mileage > 50000) return "medium"
    return "low"
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
          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "plateNumber",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-medium flex items-center gap-1"
          >
            Plate Number
            {column.getIsSorted() === "asc"
              ? "↑"
              : column.getIsSorted() === "desc"
                ? "↓"
                : ""}
          </Button>
        )
      },
      cell: ({ row }) => {
        const vehicle = row.original
        return (
          <div className="flex flex-col gap-1">
            <div className="font-mono font-bold text-sm flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  vehicle.isActive ? "bg-green-500" : "bg-gray-400",
                )}
              />
              {vehicle.plateNumber}
            </div>
            <div className="text-xs text-muted-foreground truncate max-w-[120px]">
              {vehicle.vin || "No VIN"}
            </div>
          </div>
        )
      },
      enableSorting: true,
      filterFn: "includesString",
      size: 160,
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-medium"
          >
            Type
            {column.getIsSorted() === "asc"
              ? "↑"
              : column.getIsSorted() === "desc"
                ? "↓"
                : ""}
          </Button>
        )
      },
      cell: ({ row }) => {
        const vehicle = row.original
        const Icon = getTypeIcon(vehicle.type)
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="text-sm">{vehicle.type}</span>
          </div>
        )
      },
      size: 100,
    },
    {
      accessorKey: "model",
      header: "Model",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("model")}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.manufacturer}
          </span>
        </div>
      ),
      size: 140,
    },
    {
      accessorKey: "year",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-medium flex items-center gap-1"
          >
            <Calendar className="h-3.5 w-3.5" />
            Year
            {column.getIsSorted() === "asc"
              ? "↑"
              : column.getIsSorted() === "desc"
                ? "↓"
                : ""}
          </Button>
        )
      },
      cell: ({ row }) => {
        const year = row.getValue("year") as number
        const currentYear = new Date().getFullYear()
        const age = currentYear - year
        return (
          <div className="flex flex-col">
            <span className="font-medium">{year}</span>
            <span
              className={cn(
                "text-xs",
                age <= 3
                  ? "text-green-600"
                  : age <= 8
                    ? "text-amber-600"
                    : "text-red-600",
              )}
            >
              {age === 0 ? "New" : `${age}yr`}
            </span>
          </div>
        )
      },
      enableSorting: true,
      size: 80,
    },
    {
      accessorKey: "capacity",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-medium flex items-center gap-1"
          >
            <UserCheck className="h-3.5 w-3.5" />
            Capacity
            {column.getIsSorted() === "asc"
              ? "↑"
              : column.getIsSorted() === "desc"
                ? "↓"
                : ""}
          </Button>
        )
      },
      cell: ({ row }) => {
        const capacity = row.getValue("capacity") as number
        return (
          <div className="flex items-center justify-end gap-2">
            <div className="flex flex-col items-end">
              <span className="font-medium">{capacity}</span>
              <span className="text-xs text-muted-foreground">seats</span>
            </div>
            {capacity >= 20 && (
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  L
                </span>
              </div>
            )}
          </div>
        )
      },
      enableSorting: true,
      size: 100,
    },
    {
      accessorKey: "mileage",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-medium flex items-center gap-1"
          >
            <Gauge className="h-3.5 w-3.5" />
            Mileage
            {column.getIsSorted() === "asc"
              ? "↑"
              : column.getIsSorted() === "desc"
                ? "↓"
                : ""}
          </Button>
        )
      },
      cell: ({ row }) => {
        const mileage = (row.getValue("mileage") as number) || 0
        const status = getMileageStatus(mileage)
        return (
          <div className="flex flex-col">
            <span className="font-medium">{formatMileage(mileage)}</span>
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  status === "high"
                    ? "bg-red-500"
                    : status === "medium"
                      ? "bg-amber-500"
                      : "bg-green-500",
                )}
              />
              <span className="text-xs text-muted-foreground capitalize">
                {status}
              </span>
            </div>
          </div>
        )
      },
      enableSorting: true,
      size: 100,
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-medium flex items-center gap-1"
          >
            Status
            {column.getIsSorted() === "asc"
              ? "↑"
              : column.getIsSorted() === "desc"
                ? "↓"
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
            variant={config.variant}
            className={cn("gap-1.5 font-medium px-2 py-1", config.className)}
          >
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        )
      },
      enableSorting: true,
      filterFn: "includesString",
      size: 140,
    },
    {
      accessorKey: "gpsDeviceId",
      header: "GPS",
      cell: ({ row }) => {
        const gpsId = row.getValue("gpsDeviceId") as string
        return gpsId ? (
          <Badge variant="outline" className="gap-1 text-xs">
            <MapPin className="h-3 w-3" />
            {gpsId}
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-xs bg-gray-50">
            <AlertCircle className="h-3 w-3" />
            No GPS
          </Badge>
        )
      },
      size: 120,
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as string
        return date ? (
          <div className="text-sm">
            {format(new Date(date), "MMM d, yyyy")}
            <div className="text-xs text-muted-foreground">
              {format(new Date(date), "h:mm a")}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
      size: 120,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const vehicle = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/admin/infrastructure/vehicle/${vehicle.id}`)
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(vehicle)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Vehicle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MapPin className="mr-2 h-4 w-4" />
                Track Location
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(vehicle)}
                className="text-red-600 dark:text-red-400 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {vehicle.isActive ? "Deactivate" : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableHiding: false,
      size: 60,
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

  // Quick stats
  const stats = {
    total: vehicles.length,
    active: vehicles.filter((v) => v.isActive).length,
    maintenance: vehicles.filter(
      (v) => v.status === "UNDER_MAINTENANCE" || v.status === "MAINTENANCE",
    ).length,
    averageMileage:
      vehicles.length > 0
        ? Math.round(
            vehicles.reduce((sum, v) => sum + ((v as any).mileage || 0), 0) /
              vehicles.length,
          )
        : 0,
  }

  // Skeleton rows for loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>

        {/* Toolbar Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.id || Math.random()}
                    style={{ width: (column as any).size }}
                  >
                    <Skeleton className="h-4 w-3/4" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
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
      <div className="text-center py-12 space-y-4">
        <Car className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
        <div>
          <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Start by adding your first vehicle or try adjusting your search
            filters
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Car className="h-4 w-4" />
          Add First Vehicle
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card border rounded-lg">
        <div className="flex items-center gap-3">
          {hasSelectedRows ? (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-2">
                {selectedRows.length} selected
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="gap-2">
                    Bulk Actions
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleBulkAction("maintenance")}
                  >
                    <Wrench className="mr-2 h-4 w-4" />
                    Mark for Maintenance
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkAction("export")}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBulkAction("delete")}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => table.resetRowSelection()}
                className="h-8 px-2"
              >
                Clear
              </Button>
            </div>
          ) : (
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search vehicles, VIN, model..."
                className="pl-9"
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              {[
                "ACTIVE",
                "MAINTENANCE",
                "UNDER_MAINTENANCE",
                "OUT_OF_SERVICE",
                "INACTIVE",
              ].map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={columnFilters.some(
                    (f) => f.id === "status" && f.value === status,
                  )}
                  onCheckedChange={() => {
                    const currentFilter = columnFilters.find(
                      (f) => f.id === "status",
                    )
                    if (currentFilter?.value === status) {
                      setColumnFilters(
                        columnFilters.filter((f) => f.id !== "status"),
                      )
                    } else {
                      setColumnFilters([
                        ...columnFilters.filter((f) => f.id !== "status"),
                        { id: "status", value: status },
                      ])
                    }
                  }}
                >
                  {status.replace("_", " ")}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "mileage"
                        ? "Mileage"
                        : column.id === "gpsDeviceId"
                          ? "GPS Device"
                          : column.id === "updatedAt"
                            ? "Last Updated"
                            : column.id
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              // Export functionality
              const csvContent =
                "data:text/csv;charset=utf-8," +
                table
                  .getHeaderGroups()[0]
                  .headers.map((h) => h.column.columnDef.header)
                  .join(",") +
                "\n" +
                table
                  .getRowModel()
                  .rows.map((row) =>
                    row
                      .getVisibleCells()
                      .map((cell) => cell.getValue())
                      .join(","),
                  )
                  .join("\n")
              const encodedUri = encodeURI(csvContent)
              const link = document.createElement("a")
              link.setAttribute("href", encodedUri)
              link.setAttribute("download", "vehicles.csv")
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: header.column.getSize() }}
                        className="whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      !row.original.isActive && "opacity-60",
                      row.getIsSelected() && "bg-primary/5",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className="py-3"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Car className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No vehicles match your search criteria
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card border rounded-lg">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium">{table.getRowModel().rows.length}</span>{" "}
          of <span className="font-medium">{vehicles.length}</span> vehicles
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
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

          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 px-2">
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
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
