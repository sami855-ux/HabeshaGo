"use client"

import { useState, useMemo } from "react"
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
  Calendar,
  Clock,
  Gauge,
  CalendarDays,
  CalendarCheck,
  ShieldAlert,
  User,
  Route,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

interface BusTableProps {
  buses: Bus[]
  isMobile: boolean
  selectedRows: Record<string, boolean>
  onSelectRow: (id: number, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
}

// Enhanced Status badge
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<
    string,
    {
      label: string
      color: string
      icon: React.ComponentType<{ className?: string }>
      bgColor: string
    }
  > = {
    ACTIVE: {
      label: "Active",
      color: "text-green-700 dark:text-green-300",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      icon: CheckCircle,
    },
    UNDER_MAINTENANCE: {
      label: "Maintenance",
      color: "text-amber-700 dark:text-amber-300",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      icon: Wrench,
    },
    INACTIVE: {
      label: "Inactive",
      color: "text-red-700 dark:text-red-300",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      icon: AlertCircle,
    },
    DELAYED: {
      label: "Delayed",
      color: "text-orange-700 dark:text-orange-300",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      icon: Clock,
    },
  }

  const config = statusConfig[status] || {
    label: status,
    color: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
    icon: AlertCircle,
  }

  const Icon = config.icon
  return (
    <Badge
      variant="secondary"
      className={cn("gap-1.5 font-medium", config.bgColor, config.color)}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  )
}

// Service status indicator
const ServiceStatus = ({ bus }: { bus: Bus }) => {
  const today = new Date()
  const lastService = bus.lastServiceDate ? new Date(bus.lastServiceDate) : null
  const nextService = bus.nextServiceDate ? new Date(bus.nextServiceDate) : null
  
  if (!lastService || !nextService) {
    return (
      <Badge variant="outline" className="text-xs">
        Service N/A
      </Badge>
    )
  }

  const daysUntilService = Math.ceil(
    (nextService.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysUntilService <= 0) {
    return (
      <Badge
        variant="outline"
        className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs"
      >
        <ShieldAlert className="h-3 w-3 mr-1" />
        Service Due
      </Badge>
    )
  }

  if (daysUntilService <= 7) {
    return (
      <Badge
        variant="outline"
        className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs"
      >
        <CalendarCheck className="h-3 w-3 mr-1" />
        Soon: {daysUntilService}d
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="text-xs">
      <CalendarDays className="h-3 w-3 mr-1" />
      OK: {daysUntilService}d
    </Badge>
  )
}

// Occupancy indicator
const OccupancyIndicator = ({ bus }: { bus: Bus }) => {
  const occupied = bus.reservedSeats || 0
  const total = bus.capacity || 0
  const available = bus.availableSeats || 0
  const percentage = total > 0 ? (occupied / total) * 100 : 0

  let color = "bg-green-500"
  if (percentage >= 80) color = "bg-red-500"
  else if (percentage >= 50) color = "bg-amber-500"

  return (
    <div className="space-y-1 w-32">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Occupancy</span>
        <span className="font-medium">{occupied}/{total}</span>
      </div>
      <Progress value={percentage} className="h-2" indicatorClassName={color} />
      <div className="text-xs text-muted-foreground">
        {available} seats available
      </div>
    </div>
  )
}

// Delay indicator
const DelayIndicator = ({ minutes }: { minutes: number }) => {
  if (minutes <= 0) {
    return (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs"
      >
        <Clock className="h-3 w-3 mr-1" />
        On Time
      </Badge>
    )
  }

  if (minutes <= 15) {
    return (
      <Badge
        variant="outline"
        className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs"
      >
        <Clock className="h-3 w-3 mr-1" />
        {minutes}m late
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs"
    >
      <Clock className="h-3 w-3 mr-1" />
      {minutes}m late
    </Badge>
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



// Enhanced Mobile card component
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
    <Card className="mb-3 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(bus.id)}
              aria-label="Select bus"
            />
            <div>
              <CardTitle className="text-lg">{bus.busNumber}</CardTitle>
              <CardDescription>
                Vehicle #{bus.vehicleId || bus.id}
              </CardDescription>
            </div>
          </div>
          <StatusBadge status={bus.status} />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-4">
          {/* Driver Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-medium">
                {bus.driver?.name || bus.driverName || "Unassigned"}
              </div>
              {bus.driver?.licenseNo && (
                <div className="text-sm text-muted-foreground">
                  {bus.driver.licenseNo}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Route & Schedule */}
          {bus.route && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{bus.route.name}</span>
              </div>
              <div className="text-sm text-muted-foreground pl-6">
                {bus.route.origin} → {bus.route.destination}
              </div>
              {bus.departureTime && (
                <div className="flex items-center gap-2 text-sm pl-6">
                  <Clock className="h-3.5 w-3.5" />
                  Departure: {format(new Date(bus.departureTime), "HH:mm")}
                </div>
              )}
            </div>
          )}

          {/* Occupancy */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Occupancy</span>
              </div>
              <span className="font-medium">
                {bus.reservedSeats || 0}/{bus.capacity || 0}
              </span>
            </div>
            <Progress 
              value={bus.capacity ? ((bus.reservedSeats || 0) / bus.capacity) * 100 : 0} 
              className="h-2"
            />
            <div className="text-sm text-muted-foreground">
              {bus.availableSeats || bus.capacity} seats available
            </div>
          </div>

          {/* Service Info */}
          {(bus.lastServiceDate || bus.nextServiceDate) && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
              {bus.lastServiceDate && (
                <div>
                  <div className="text-xs text-muted-foreground">Last Service</div>
                  <div className="font-medium text-sm">
                    {format(new Date(bus.lastServiceDate), "MMM d")}
                  </div>
                </div>
              )}
              {bus.nextServiceDate && (
                <div>
                  <div className="text-xs text-muted-foreground">Next Service</div>
                  <div className="font-medium text-sm">
                    {format(new Date(bus.nextServiceDate), "MMM d")}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button variant="ghost" size="sm" className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced Mobile pagination component
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
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm text-muted-foreground text-center">
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

          <div className="flex items-center gap-2">
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={`${pageSize} per page`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function BusTable({
  buses,
  isMobile,
  selectedRows,
  onSelectRow,
  onSelectAll,
}: BusTableProps) {
  const router = useRouter()
  
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [mobilePage, setMobilePage] = useState(0)
  const [mobilePageSize, setMobilePageSize] = useState(5)
  const [globalFilter, setGlobalFilter] = useState("")

  // Filter buses based on search
  const filteredBuses = useMemo(() => {
    if (!globalFilter.trim()) return buses || []
    
    const searchTerm = globalFilter.toLowerCase()
    return (buses || []).filter(bus => 
      bus.busNumber?.toLowerCase().includes(searchTerm) ||
      bus.driverName?.toLowerCase().includes(searchTerm) ||
      bus.driver?.name?.toLowerCase().includes(searchTerm) ||
      bus.route?.name?.toLowerCase().includes(searchTerm) ||
      bus.routeName?.toLowerCase().includes(searchTerm) ||
      bus.status?.toLowerCase().includes(searchTerm) ||
      bus.vehicleId?.toString().includes(searchTerm)
    )
  }, [buses, globalFilter])

  // Safe columns definition with new useful columns
const createColumns = (): ColumnDef<Bus>[] => [
  {
    accessorKey: "busNumber",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <BusIcon className="h-4 w-4" />
        Bus Details
      </div>
    ),
    cell: ({ row }) => {
      const bus = row.original
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 flex items-center justify-center">
            <BusIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-semibold">{bus.busNumber}</div>
            <div className="text-sm text-muted-foreground">
              ID: {bus.vehicleId || bus.id}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "driver",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        Driver
      </div>
    ),
    cell: ({ row }) => {
      const bus = row.original
      const driver = bus.driver
      return (
        <div>
          <div className="font-medium">
            {driver?.name || bus.driverName || (
              <span className="text-muted-foreground italic">Unassigned</span>
            )}
          </div>
          {driver?.licenseNo && (
            <div className="text-sm text-muted-foreground">
              License: {driver.licenseNo}
            </div>
          )}
          {driver?.phone && (
            <div className="text-sm text-muted-foreground">
              {driver.phone}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "route",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <Route className="h-4 w-4" />
        Route & Schedule
      </div>
    ),
    cell: ({ row }) => {
      const bus = row.original
      const route = bus.route
      return (
        <div>
          <div className="font-medium">{route?.name || bus.routeName || "No route"}</div>
          {route && (
            <div className="text-sm text-muted-foreground">
              {route.origin} → {route.destination}
            </div>
          )}
          {bus.departureTime && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              {format(new Date(bus.departureTime), "HH:mm")}
            </div>
          )}
          {bus.estimatedArrival && (
            <div className="text-xs text-muted-foreground">
              ETA: {format(new Date(bus.estimatedArrival), "HH:mm")}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "capacity",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        Occupancy
      </div>
    ),
    cell: ({ row }) => {
      const bus = row.original
      return <OccupancyIndicator bus={bus} />
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
    id: "actions",
    header: "Actions",
    cell: ({row}) => {
      const bus = row.original
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8" onClick={() => router.push(`/admin/manage-bus/${bus.id}`)}>
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            View
          </Button>
        </div>
      )
    },
  },
]

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
    data: filteredBuses,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
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
  const mobileStartIndex = mobilePage * mobilePageSize
  const mobileEndIndex = mobileStartIndex + mobilePageSize
  const mobilePaginatedBuses = filteredBuses.slice(
    mobileStartIndex,
    mobileEndIndex
  )
  const mobileTotalPages = Math.ceil(filteredBuses.length / mobilePageSize)

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Mobile Search & Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search buses, drivers, routes..."
                  className="pl-9"
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {filteredBuses.length} buses found
                </div>
                <Select
                  value={`${mobilePageSize}`}
                  onValueChange={(value) => {
                    setMobilePageSize(Number(value))
                    setMobilePage(0)
                  }}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Show per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Show 5</SelectItem>
                    <SelectItem value="10">Show 10</SelectItem>
                    <SelectItem value="20">Show 20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

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
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <BusIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No buses found</p>
                {globalFilter && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Try different search terms
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
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
              setMobilePage(0)
            }}
            totalItems={filteredBuses.length}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop Search & Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search buses, drivers, routes, status..."
                className="pl-9"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {filteredBuses.length} buses •{" "}
                {filteredBuses.filter(b => b.status === "ACTIVE").length} active •{" "}
                {filteredBuses.filter(b => b.status === "UNDER_MAINTENANCE").length} in maintenance
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
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
                    className="hover:bg-muted/50 transition-colors"
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
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <BusIcon className="h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">No buses found</p>
                      {globalFilter && (
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search terms
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Desktop Pagination */}
      <TablePagination table={table} />
    </div>
  )
}