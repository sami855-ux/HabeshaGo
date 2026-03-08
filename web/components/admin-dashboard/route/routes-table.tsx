"use client"

import React, { useState, useMemo, useEffect } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  MapPin,
  Route,
  Clock,
  Car,
  Bus,
  Map,
  Trash2,
  Download,
  Upload,
  Mail,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Route as RouteType } from "@/types/route"
import RouteDialog from "@/components/admin-dashboard/route/route-dialog"
import DeleteConfirmationDialog from "@/components/admin-dashboard/route/delete-confirmation-dialog"
import { useAllRoutesQuery } from "@/hooks/useGetAllRoutes"
import { useRouter } from "next/navigation"

// Status badge mapping
const statusConfig = {
  active: {
    label: "Active",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    icon: CheckCircle,
  },
  inactive: {
    label: "Inactive",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    icon: XCircle,
  },
}

export const suspensionStatusConfig = {
  true: {
    label: "Suspended",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    icon: Ban,
  },
  false: {
    label: "Operational",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    icon: Activity,
  },
}

// Skeleton Loading Component
const TableSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-9 w-32 bg-blue-600 dark:bg-blue-700 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
              <TableRow className="border-b">
                {[...Array(8)].map((_, i) => (
                  <TableHead key={i}>
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(6)].map((_, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  {[...Array(8)].map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="space-y-2">
                        <div
                          className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                          style={{
                            width:
                              cellIndex === 0
                                ? "40px"
                                : cellIndex === 1
                                  ? "180px"
                                  : cellIndex === 2
                                    ? "120px"
                                    : cellIndex === 3
                                      ? "120px"
                                      : cellIndex === 4
                                        ? "100px"
                                        : cellIndex === 5
                                          ? "100px"
                                          : cellIndex === 6
                                            ? "80px"
                                            : "100px",
                          }}
                        ></div>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            ></div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

// Empty State Component
const EmptyState = ({ onCreate }: { onCreate: () => void }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search routes..."
              className="pl-9 w-full sm:w-64"
              disabled
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2" disabled>
            <Filter className="h-4 w-4" />
            Filter Active
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" disabled>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="gap-2" disabled>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={onCreate}
          >
            <Plus className="h-4 w-4" />
            New Route
          </Button>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden">
        <div className="h-96 flex flex-col items-center justify-center p-6">
          <Route className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Routes Found</h3>
          <p className="text-muted-foreground text-center mb-4 max-w-md">
            Get started by creating your first transportation route. Add origin,
            destination, mid-points, and vehicle assignments.
          </p>
          <Button
            size="sm"
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={onCreate}
          >
            <Plus className="h-4 w-4" />
            Create First Route
          </Button>
        </div>
      </div>
    </div>
  )
}

// Error State Component
const ErrorState = ({
  onRetry,
  error,
}: {
  onRetry: () => void
  error: any
}) => {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 p-6 text-center">
        <div className="mb-4 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Error Loading Routes</h3>
          <p className="text-sm mt-1">
            {error?.message || "Failed to load routes. Please try again."}
          </p>
          {error && (
            <p className="text-xs mt-2 opacity-75">
              Error details: {JSON.stringify(error)}
            </p>
          )}
        </div>
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    </div>
  )
}

// Helper function to extract routes from API response
const extractRoutesFromResponse = (data: any): RouteType[] => {
  if (!data) return []

  console.log("Extracting routes from:", data)

  // Handle different API response structures
  if (Array.isArray(data)) {
    return data
  } else if (data && typeof data === "object") {
    // If response has a data property that's an array
    if (Array.isArray(data.data)) {
      return data.data
    }
    // If response has a routes property
    else if (Array.isArray(data.routes)) {
      return data.routes
    }
    // If response has a results property
    else if (Array.isArray(data.results)) {
      return data.results
    }
  }

  console.warn("Unexpected API response structure:", data)
  return []
}

export default function RoutesTable() {
  const router = useRouter()

  const { data: apiResponse, isLoading, error, refetch } = useAllRoutesQuery()
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Log the API response for debugging
  useEffect(() => {
    if (apiResponse) {
      console.log("API Response Structure:", apiResponse)
      console.log("Is Array?", Array.isArray(apiResponse))
      console.log("Type:", typeof apiResponse)
    }
  }, [apiResponse])

  // Extract routes from API response
  const routes = useMemo(() => {
    const extractedRoutes = extractRoutesFromResponse(apiResponse)

    // Transform data if needed
    return extractedRoutes.map((route) => ({
      ...route,
      busCount: route.busCount || 0,
      minibusCount: route.minibusCount || 0,
      midPoints: route.midPoints || [],
    }))
  }, [apiResponse])

  // Table columns
  const columns: ColumnDef<RouteType>[] = [
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
      accessorKey: "name",
      header: "Route ID",
      cell: ({ row }) => {
        const route = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Route className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">
                {route.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {route.midPoints?.length || 0} mid-points
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "origin",
      header: "Origin",
      cell: ({ row }) => {
        const route = row.original
        return (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{route.origin}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "destination",
      header: "Destination",
      cell: ({ row }) => {
        const route = row.original
        return (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{route.destination}</span>
          </div>
        )
      },
    },
    {
      id: "distanceTime",
      header: "Distance & Time",
      cell: ({ row }) => {
        const route = row.original
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Route className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">
                {route.distanceKm ? `${route.distanceKm} km` : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">
                {route.estimatedTimeMin
                  ? `${route.estimatedTimeMin} min`
                  : "N/A"}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      id: "vehicles",
      header: "Vehicles",
      cell: ({ row }) => {
        const route = row.original
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Bus className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">
                {route.busCount || 0} buses
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">
                {route.minibusCount || 0} minibuses
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        const config = isActive ? statusConfig.active : statusConfig.inactive
        const Icon = config.icon
        return (
          <Badge variant="secondary" className={cn("gap-1.5", config.color)}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "isSuspended",
      header: "Suspended",
      cell: ({ row }) => {
        const isSuspended = row.getValue("isSuspended") as boolean
        const config = isSuspended
          ? suspensionStatusConfig[isSuspended]
          : suspensionStatusConfig[isSuspended]
        const Icon = config.icon
        return (
          <Badge variant="secondary" className={cn("gap-1.5", config.color)}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return (
          <div className="text-sm">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const route = row.original
        const [isDialogOpen, setIsDialogOpen] = useState(false)
        const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

        return (
          <>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => router.push(`/admin/manage-route/${route.id}`)}
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
            </div>

            <RouteDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              route={route}
              isEdit={true}
            />

            <DeleteConfirmationDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
              route={route}
            />
          </>
        )
      },
    },
  ]

  const table = useReactTable({
    data: routes,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasSelectedRows = selectedRows.length > 0

  const handleBulkAction = (action: string) => {
    const selectedIds = selectedRows.map((row) => row.original.id)
    console.log(`Bulk ${action}:`, selectedIds)
    // Implement bulk action logic here
  }

  const handleExport = () => {
    const selectedData = hasSelectedRows
      ? selectedRows.map((row) => row.original)
      : routes

    console.log("Exporting:", selectedData)
    // Implement export logic here
  }

  // Show skeleton while loading
  if (isLoading) {
    return <TableSkeleton />
  }

  // Show error state
  if (error) {
    return <ErrorState onRetry={() => refetch()} error={error} />
  }

  // Show empty state
  if (routes.length === 0) {
    return <EmptyState onCreate={() => setIsCreateDialogOpen(true)} />
  }

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search routes..."
              className="pl-9 w-full sm:w-64"
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              const activeFilter = table.getColumn("isActive")?.getFilterValue()
              if (activeFilter === true) {
                table.getColumn("isActive")?.setFilterValue(undefined)
              } else {
                table.getColumn("isActive")?.setFilterValue(true)
              }
            }}
          >
            <Filter className="h-4 w-4" />
            Filter Active
          </Button>
        </div>

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
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Activate Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBulkAction("deactivate")}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
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

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => console.log("Import clicked")}
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-blue-600 hover:bg-blue-700 cursor-pointer"
            onClick={() => router.push("/admin/manage-route/add-new-route")}
          >
            <Plus className="h-4 w-4" />
            New Route
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="font-semibold">
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Route className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No routes found.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        Create New Route
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Table Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} of {routes.length}{" "}
          routes
        </div>

        <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">Page</span>
            <span className="text-sm font-medium">
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          </div>
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

        <div className="flex items-center gap-2">
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
              {[5, 10, 20, 30, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Create Route Dialog */}
      <RouteDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        isEdit={false}
      />
    </div>
  )
}
