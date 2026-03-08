"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
  ArrowUpDown,
  Check,
  ChevronDown,
  Clock,
  Download,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  UserX,
  X,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { fetchAllDriver } from "@/services/driver.api"
import { useRouter } from "next/navigation"

// Types
type Driver = {
  id: string
  userId: string
  licenseNo: string
  experience: number
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING"
  driverLicenseUrl: string
  licenseStatus: "VERIFIED" | "PENDING" | "REJECTED"
  idType: "PASSPORT" | "DRIVING_LICENSE" | "NATIONAL_ID"
  idFrontUrl: string
  idBackUrl: string
  idStatus: "VERIFIED" | "PENDING" | "REJECTED"
  verifiedById: string
  verifiedAt: string | null
  rejectionReason: string | null
  isOnDuty: boolean
  lastActiveAt: string | null
  rating: number
  totalTrips: number
  complaintsCount: number
  vehicleId: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    phone: string
    avatarUrl: string
    location: string
  }
  vehicle: any | null
}

type BulkAction = {
  label: string
  value: string
  icon: React.ReactNode
}

const updateDriverStatus = async ({
  driverIds,
  status,
  reason,
}: {
  driverIds: string[]
  status: Driver["status"]
  reason?: string
}) => {
  const response = await fetch("/api/admin/drivers/status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ driverIds, status, reason }),
  })
  if (!response.ok) throw new Error("Failed to update driver status")
  return response.json()
}

const deleteDrivers = async (driverIds: string[]) => {
  const response = await fetch("/api/admin/drivers", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ driverIds }),
  })
  if (!response.ok) throw new Error("Failed to delete drivers")
  return response.json()
}

// Bulk Actions
const bulkActions: BulkAction[] = [
  {
    label: "Activate",
    value: "ACTIVE",
    icon: <UserCheck className="h-4 w-4" />,
  },
  {
    label: "Suspend",
    value: "SUSPENDED",
    icon: <ShieldAlert className="h-4 w-4" />,
  },
  {
    label: "Delete",
    value: "DELETE",
    icon: <Trash2 className="h-4 w-4" />,
  },
  {
    label: "Export",
    value: "EXPORT",
    icon: <Download className="h-4 w-4" />,
  },
]

export default function DriversPage() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [bulkAction, setBulkAction] = useState<string>("")
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // React Query for data fetching
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["drivers"],
    queryFn: fetchAllDriver,
  })

  const drivers = data || []

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: updateDriverStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] })
      toast.success("Driver status updated successfully")
      setShowBulkDialog(false)
      setBulkAction("")
      setRowSelection({})
      setSelectedDrivers([])
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDrivers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] })
      toast.success("Drivers deleted successfully")
      setShowDeleteDialog(false)
      setBulkAction("")
      setRowSelection({})
      setSelectedDrivers([])
    },
    onError: (error) => {
      toast.error(`Failed to delete drivers: ${error.message}`)
    },
  })

  // Table Columns
  const columns: ColumnDef<Driver>[] = [
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
      accessorKey: "user.name",
      header: "Driver",
      cell: ({ row }) => {
        const driver = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {driver.user.avatarUrl ? (
                <img
                  src={driver.user.avatarUrl}
                  alt={driver.user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-sm">{driver.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {driver.user.email}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "licenseNo",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            License No
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("licenseNo")}</div>
      ),
    },
    {
      accessorKey: "experience",
      header: "Experience",
      cell: ({ row }) => (
        <div className="text-center">
          <span className="font-medium">{row.getValue("experience")}</span>
          <span className="text-xs text-muted-foreground ml-1">years</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as Driver["status"]
        const isOnDuty = row.original.isOnDuty

        const statusConfig = {
          ACTIVE: {
            label: "Active",
            variant: "default" as const,
            icon: ShieldCheck,
          },
          INACTIVE: {
            label: "Inactive",
            variant: "secondary" as const,
            icon: UserX,
          },
          SUSPENDED: {
            label: "Suspended",
            variant: "destructive" as const,
            icon: ShieldAlert,
          },
          PENDING: {
            label: "Pending",
            variant: "outline" as const,
            icon: Clock,
          },
        }

        const config = statusConfig[status]
        const Icon = config.icon

        return (
          <div className="flex items-center gap-2">
            <Badge variant={config.variant} className="gap-1">
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
            {status === "ACTIVE" && isOnDuty && (
              <Badge variant="default" className="bg-green-500">
                On Duty
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "licenseStatus",
      header: "License Status",
      cell: ({ row }) => {
        const status = row.getValue("licenseStatus") as Driver["licenseStatus"]
        const statusConfig = {
          VERIFIED: { label: "Verified", variant: "default" as const },
          PENDING: { label: "Pending", variant: "outline" as const },
          REJECTED: { label: "Rejected", variant: "destructive" as const },
        }
        return (
          <Badge variant={statusConfig[status]?.variant}>
            {statusConfig[status]?.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "idStatus",
      header: "ID Status",
      cell: ({ row }) => {
        const status = row.getValue("idStatus") as Driver["idStatus"]
        const statusConfig = {
          VERIFIED: { label: "Verified", variant: "default" as const },
          PENDING: { label: "Pending", variant: "outline" as const },
          REJECTED: { label: "Rejected", variant: "destructive" as const },
        }
        return (
          <Badge variant={statusConfig[status]?.variant}>
            {statusConfig[status]?.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "totalTrips",
      header: "Trips",
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.getValue("totalTrips")}
        </div>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => {
        const rating = parseFloat(row.getValue("rating"))
        return (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className={`h-3 w-3 ${
                    star <= rating
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </div>
              ))}
            </div>
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return (
          <div className="text-sm">
            <div>{format(date, "MMM d, yyyy")}</div>
            <div className="text-xs text-muted-foreground">
              {format(date, "HH:mm")}
            </div>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const driver = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/admin/fleet/drivers/${driver.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  router.push(`/admin/fleet/drivers/${driver.id}/edit`)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  /* Handle verify */
                }}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Verify Documents
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  /* Handle assign vehicle */
                }}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Assign Vehicle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  /* Handle delete */
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Initialize table
  const table = useReactTable({
    data: drivers,
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

  // Update selected drivers when row selection changes
  useEffect(() => {
    const selectedRows = table.getSelectedRowModel().rows
    const selectedIds = selectedRows.map((row) => row.original.id)
    setSelectedDrivers(selectedIds)
  }, [rowSelection, table])

  // Handle bulk action
  const handleBulkAction = async () => {
    if (!bulkAction || selectedDrivers.length === 0) return

    if (bulkAction === "DELETE") {
      setShowDeleteDialog(true)
      return
    }

    if (bulkAction === "EXPORT") {
      // Handle export
      toast.info("Export functionality coming soon")
      setBulkAction("")
      return
    }

    // Handle status updates
    setShowBulkDialog(true)
  }

  const confirmBulkUpdate = () => {
    if (bulkAction === "ACTIVE" || bulkAction === "SUSPENDED") {
      updateStatusMutation.mutate({
        driverIds: selectedDrivers,
        status: bulkAction as Driver["status"],
      })
    }
  }

  const confirmDelete = () => {
    deleteMutation.mutate(selectedDrivers)
  }

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    table.getColumn("user.name")?.setFilterValue(value)
  }

  // Stats
  const stats = {
    total: drivers.length,
    active: drivers.filter((d) => d.status === "ACTIVE").length,
    pending: drivers.filter((d) => d.status === "PENDING").length,
    suspended: drivers.filter((d) => d.status === "SUSPENDED").length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading drivers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <ShieldAlert className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Failed to load drivers</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Driver Management
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor all drivers in the system
          </p>
        </div>
        <Button onClick={() => router.push("/admin/fleet/drivers/add-driver")}>
          <User className="mr-2 h-4 w-4" />
          Add New Driver
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Drivers
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active
                </p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Suspended
                </p>
                <p className="text-2xl font-bold">{stats.suspended}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>All Drivers</CardTitle>
              <CardDescription>
                Manage driver accounts, verify documents, and assign vehicles
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"].map(
                    (status) => (
                      <DropdownMenuCheckboxItem
                        key={status}
                        checked={
                          table.getColumn("status")?.getFilterValue() === status
                        }
                        onCheckedChange={(checked) =>
                          table
                            .getColumn("status")
                            ?.setFilterValue(checked ? status : undefined)
                        }
                      >
                        {status}
                      </DropdownMenuCheckboxItem>
                    ),
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      table.getColumn("status")?.setFilterValue(undefined)
                    }
                  >
                    Clear Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Columns
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions Bar */}
          {selectedDrivers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {selectedDrivers.length} driver
                  {selectedDrivers.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Bulk actions" />
                  </SelectTrigger>
                  <SelectContent>
                    {bulkActions.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        <div className="flex items-center gap-2">
                          {action.icon}
                          {action.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleBulkAction} disabled={!bulkAction}>
                  Apply
                </Button>
                <Button variant="ghost" onClick={() => setRowSelection({})}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drivers by name, email, or license..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={
                (table
                  .getColumn("licenseStatus")
                  ?.getFilterValue() as string) || "ALL"
              }
              onValueChange={(value) =>
                table
                  .getColumn("licenseStatus")
                  ?.setFilterValue(value === "ALL" ? undefined : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="License Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All License Status</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
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
                      No drivers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {table.getFilteredRowModel().rows.length} of{" "}
              {drivers.length} driver{drivers.length !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: table.getPageCount() },
                  (_, i) => i + 1,
                ).map((page) => (
                  <Button
                    key={page}
                    variant={
                      table.getState().pagination.pageIndex === page - 1
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => table.setPageIndex(page - 1)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark {selectedDrivers.length} driver
              {selectedDrivers.length > 1 ? "s" : ""} as{" "}
              {bulkAction.toLowerCase()}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkDialog(false)}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBulkUpdate}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {selectedDrivers.length} driver
              {selectedDrivers.length > 1 ? "s" : ""} and remove all associated
              data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
