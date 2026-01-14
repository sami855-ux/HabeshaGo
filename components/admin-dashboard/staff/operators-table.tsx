// app/operators-management/components/operators-table.tsx
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
  //   Charging,
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
  ArrowLeft,
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

// Types
export type Role = "DRIVER" | "PARKING_OPERATOR" | "EV_OPERATOR" | "STAFF"
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
}

// Mock data
const mockOperators: Operator[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    role: "DRIVER",
    assignment: "Bus #42 • Route A",
    status: "PENDING",
    createdAt: "2024-01-15",
    licenseNumber: "DL-789456",
    assignedBus: "Bus #42",
    assignedRoute: "Route A",
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah@example.com",
    phone: "+1 (555) 987-6543",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    role: "PARKING_OPERATOR",
    assignment: "Downtown Garage",
    status: "PENDING",
    createdAt: "2024-02-20",
    assignedParkingArea: "Downtown Garage",
    shift: "Morning (6AM-2PM)",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael@example.com",
    phone: "+1 (555) 456-7890",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    role: "EV_OPERATOR",
    assignment: "Station #5",
    status: "OFFLINE",
    createdAt: "2024-03-10",
    assignedChargingStation: "Station #5",
    chargerType: "DC Fast Charger",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@example.com",
    phone: "+1 (555) 234-5678",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    role: "STAFF",
    assignment: "Operations",
    status: "ACTIVE",
    createdAt: "2024-01-05",
  },
  {
    id: "5",
    name: "Robert Wilson",
    email: "robert@example.com",
    phone: "+1 (555) 345-6789",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    role: "DRIVER",
    assignment: "Bus #18 • Route C",
    status: "SUSPENDED",
    createdAt: "2024-02-28",
    licenseNumber: "DL-123789",
    assignedBus: "Bus #18",
    assignedRoute: "Route C",
  },
  {
    id: "6",
    name: "Lisa Rodriguez",
    email: "lisa@example.com",
    phone: "+1 (555) 567-8901",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    role: "PARKING_OPERATOR",
    assignment: "Airport Parking",
    status: "ACTIVE",
    createdAt: "2024-03-15",
    assignedParkingArea: "Airport Parking",
    shift: "Night (10PM-6AM)",
  },
  {
    id: "7",
    name: "David Kim",
    email: "david@example.com",
    phone: "+1 (555) 678-9012",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    role: "EV_OPERATOR",
    assignment: "Station #12",
    status: "ACTIVE",
    createdAt: "2024-01-30",
    assignedChargingStation: "Station #12",
    chargerType: "AC Slow Charger",
  },
  {
    id: "8",
    name: "Maria Garcia",
    email: "maria@example.com",
    phone: "+1 (555) 789-0123",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    role: "STAFF",
    assignment: "Administration",
    status: "OFFLINE",
    createdAt: "2024-02-10",
  },
]

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
}

// Table columns

export default function OperatorsTable() {
  const router = useRouter()

  const [data, setData] = useState<Operator[]>(mockOperators)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // Filter out USER role from data
  const filteredData = useMemo(() => {
    return data.filter((operator) => operator.role !== "USER")
  }, [data])

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
                {operator.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">
                {operator.name}
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
        const config = roleConfig[role]
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
              return <Shield className="h-4 w-4" />
          }
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
            className={cn("font-medium", config.color)}
          >
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
                    // disabled={isPending}
                    className={`flex items-center gap-2 h-8 px-3 text-white cursor-pointer
              ${
                isPending ? "bg-yellow-500 " : "bg-blue-600 hover:bg-blue-700 "
              }`}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-white">
                      {isPending ? "Approve" : "View"}
                    </span>
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  <p>{isPending ? "Approval Pending" : "View Bus Details"}</p>
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
                  Reassign
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

  const table = useReactTable({
    data: filteredData,
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

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search operators..."
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
                      <Shield className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No operators found.
                      </p>
                      <Button variant="outline" size="sm">
                        Add New Operator
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
          {filteredData.length} operators
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
