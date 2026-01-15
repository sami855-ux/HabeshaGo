"use client"

import React, { useState, useMemo } from "react"
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
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Key,
  UserCheck,
  UserX,
  Bus,
  MapPin,
  Calendar,
  Download,
  Upload,
  Trash2,
  Mail,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import FilterSheet from "./filter-sheet"
import { FaChargingStation } from "react-icons/fa"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { useDriversQuery } from "@/hooks/fetchAllDriver"

// Types
export type Role =
  | "DRIVER"
  | "PARKING_OPERATOR"
  | "EV_OPERATOR"
  | "STAFF"
  | "PASSENGER"
export type Status = "ACTIVE" | "OFFLINE" | "SUSPENDED" | "PENDING"

export interface Operator {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  role: Role
  assignment: string
  status: Status
  createdAt: string
  licenseNumber?: string
  assignedBus?: string
  assignedRoute?: string
  assignedParkingArea?: string
  shift?: string
  assignedChargingStation?: string
  chargerType?: string
  experience?: number
  vehicleId?: string | null
  userId?: string
}

// Types for API response
interface User {
  id: string
  name: string
  email: string
  password: string | null
  phone: string | null
  role: "PASSENGER" | "DRIVER" | "ADMIN" | "STAFF"
  image: string | null
  emailVerified: boolean
  phoneVerified: boolean
  isSuspended: boolean
  suspendedAt: string | null
  suspendedBy: string | null
  suspensionReason: string | null
  twoFactorEnabled: boolean
  twoFactorSecret: string | null
  createdAt: string
  updatedAt: string
}

interface DriverData {
  id: string
  userId: string
  licenseNo: string
  experience: number
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  vehicleId: string | null
  assignedRoute: string | null
  assignedParkingArea: string | null
  shift: string | null
  assignedChargingStation: string | null
  chargerType: string | null
  createdAt: string
  user: User
  assignedBus: string | null
  assignedMinibus: string | null
}

interface ApiResponse {
  success: boolean
  statusCode: number
  message: string
  data: DriverData[]
}

// Role badge mapping
const roleConfig = {
  DRIVER: {
    label: "Driver",
    icon: Bus,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  PARKING_OPERATOR: {
    label: "Parking Operator",
    icon: MapPin,
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  EV_OPERATOR: {
    label: "EV Operator",
    icon: FaChargingStation,
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  },
  STAFF: {
    label: "Staff",
    icon: Shield,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  PASSENGER: {
    label: "Passenger",
    icon: Shield,
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  },
}

// Status badge mapping
const statusConfig = {
  ACTIVE: {
    label: "Active",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  OFFLINE: {
    label: "Offline",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  SUSPENDED: {
    label: "Suspended",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
  PENDING: {
    label: "Pending",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  INACTIVE: {
    label: "Inactive",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  },
}

// Transform API data to Operator format
const transformDriverData = (driverData: DriverData): Operator => {
  const statusMap = {
    ACTIVE: "ACTIVE" as Status,
    INACTIVE: "OFFLINE" as Status,
    SUSPENDED: "SUSPENDED" as Status,
  }

  // Determine assignment based on driver data
  let assignment = ""

  // Since this is driver data, treat them all as DRIVERs in the UI
  if (driverData.assignedBus || driverData.assignedMinibus) {
    const bus = driverData.assignedBus || driverData.assignedMinibus
    assignment = `${bus} • ${driverData.assignedRoute || "No Route"}`
  } else {
    assignment = "No Bus Assigned • No Route"
  }

  // Format phone number
  const phone = driverData.user.phone || "No phone"

  return {
    id: driverData.id,
    userId: driverData.userId,
    name: driverData.user.name,
    email: driverData.user.email,
    phone: phone,
    avatar: driverData.user.image || undefined,
    // Always treat them as DRIVER in the UI since they are in the drivers data
    role: "DRIVER" as Role,
    assignment: assignment,
    status: statusMap[driverData.status] || "OFFLINE",
    createdAt: driverData.createdAt,
    licenseNumber: driverData.licenseNo,
    assignedBus:
      driverData.assignedBus || driverData.assignedMinibus || undefined,
    assignedRoute: driverData.assignedRoute || undefined,
    assignedParkingArea: driverData.assignedParkingArea || undefined,
    shift: driverData.shift || undefined,
    assignedChargingStation: driverData.assignedChargingStation || undefined,
    chargerType: driverData.chargerType || undefined,
    experience: driverData.experience,
    vehicleId: driverData.vehicleId,
  }
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
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
              <TableRow className="border-b">
                {[...Array(7)].map((_, i) => (
                  <TableHead key={i}>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  {[...Array(7)].map((_, cellIndex) => (
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
                                ? "100px"
                                : cellIndex === 3
                                ? "150px"
                                : cellIndex === 4
                                ? "80px"
                                : cellIndex === 5
                                ? "120px"
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

// Table columns
const columns: ColumnDef<Operator>[] = [
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
    header: "Name",
    cell: ({ row }) => {
      const operator = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white shadow">
            <AvatarImage src={operator.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              {operator?.name
                ? operator?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {operator?.name}
            </span>
            <span className="text-sm text-muted-foreground">
              {operator.email}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as Role
      const config = roleConfig[role] || roleConfig.DRIVER
      const Icon = config.icon
      return (
        <Badge
          variant="secondary"
          className={cn("gap-1.5 font-medium", config.color)}
        >
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
    accessorKey: "assignment",
    header: "Assignment",
    cell: ({ row }) => {
      const operator = row.original
      const getAssignmentIcon = () => {
        switch (operator.role) {
          case "DRIVER":
            return <Bus className="h-4 w-4" />
          case "PARKING_OPERATOR":
            return <MapPin className="h-4 w-4" />
          case "EV_OPERATOR":
            return <FaChargingStation className="h-4 w-4" />
          default:
            return <Bus className="h-4 w-4" />
        }
      }

      // Show driver-specific assignment
      if (operator.role === "DRIVER") {
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {getAssignmentIcon()}
              <span className="font-medium">{operator.assignment}</span>
            </div>
            {operator.licenseNumber && (
              <span className="text-xs text-muted-foreground">
                License: {operator.licenseNumber}
              </span>
            )}
            {operator.experience && (
              <span className="text-xs text-muted-foreground">
                Experience: {operator.experience} years
              </span>
            )}
          </div>
        )
      }

      return (
        <div className="flex items-center gap-2">
          {getAssignmentIcon()}
          <span className="font-medium">{operator.assignment}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Status
      const config = statusConfig[status]
      return (
        <Badge
          variant="secondary"
          className={cn(
            "font-medium",
            config?.color || "bg-gray-100 text-gray-800"
          )}
        >
          {config?.label || status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const operator = row.original
      const isPending = operator.status === "PENDING"

      const handleClick = () => {
        if (isPending) return
        else {
          router.push(`/admin/manage-staff/${operator.id}`)
        }
      }
      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleClick}
                  className={`flex items-center gap-2 h-8 px-3 text-white cursor-pointer
                    ${
                      isPending
                        ? "bg-yellow-500 "
                        : "bg-blue-600 hover:bg-blue-700 "
                    }`}
                >
                  <Eye className="h-4 w-4" />
                  <span className="text-white">
                    {isPending ? "Approve" : "View"}
                  </span>
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>{isPending ? "Approval Pending" : "View Driver Details"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-semibold">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Edit className="h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Mail className="h-4 w-4" />
                Send Message
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Key className="h-4 w-4" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <RefreshCw className="h-4 w-4" />
                Reassign Vehicle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {operator.status === "SUSPENDED" ? (
                <DropdownMenuItem className="gap-2 cursor-pointer text-green-600 dark:text-green-400">
                  <UserCheck className="h-4 w-4" />
                  Activate Account
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 dark:text-red-400">
                  <UserX className="h-4 w-4" />
                  Suspend Account
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

export default function OperatorsTable() {
  const router = useRouter()
  const { data: apiResponse, isLoading, error, refetch } = useDriversQuery()
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // Transform data from API
  const transformedData = useMemo(() => {
    if (!apiResponse) return []

    return apiResponse.map(transformDriverData)
  }, [apiResponse])

  const table = useReactTable({
    data: transformedData,
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

  // Show skeleton while loading
  if (isLoading) {
    return <TableSkeleton />
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 p-6 text-center">
          <div className="mb-4 text-red-600 dark:text-red-400">
            <Shield className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Error Loading Data</h3>
            <p className="text-sm mt-1">
              Failed to load drivers. Please try again.
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search drivers..."
              className="pl-9 w-full sm:w-64"
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
            />
          </div>

          <FilterSheet
            open={filterSheetOpen}
            onOpenChange={setFilterSheetOpen}
            table={table}
          />

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setFilterSheetOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filters
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
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("suspend")}>
                    <UserX className="mr-2 h-4 w-4" />
                    Suspend Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("email")}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
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

          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Import
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
                              header.getContext()
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
                          cell.getContext()
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
                      <Bus className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No drivers found.</p>
                      <Button variant="outline" size="sm">
                        Add New Driver
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
          Showing {table.getFilteredRowModel().rows.length} of{" "}
          {transformedData.length} drivers
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
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
