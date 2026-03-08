"use client"

import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
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
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  Mail,
  Phone,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User2,
  Key,
  Wallet,
  Copy,
  Filter,
  ChevronDown,
  Download,
  Users,
  UserCheck,
  UserX,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import type {
  User,
  UserTableData,
  UserStatus,
  UserRole,
  BadgeTheme,
} from "@/types/user"
import { UserDetailSheet } from "./UserDetailSheet"
import {
  getStatusBadge,
  getRoleBadge,
  getVerificationBadge,
} from "@/lib/badge-utils"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface UserTableProps {
  data: UserTableData[]
  isLoading?: boolean
  onDelete?: (userId: string) => void
  onEdit?: (user: User) => void
  onSuspend?: (userId: string) => void
  onUnsuspend?: (userId: string) => void
  onBulkAction?: (action: string, userIds: string[]) => void
  theme?: "light" | "dark"
  badgeTheme?: BadgeTheme
}

// Custom filter functions
const emailVerifiedFilter: FilterFn<any> = (row, columnId, value) => {
  if (value === "all") return true
  return row.original.emailVerified === (value === "verified")
}

const phoneVerifiedFilter: FilterFn<any> = (row, columnId, value) => {
  if (value === "all") return true
  return row.original.phoneVerified === (value === "verified")
}

const twoFactorFilter: FilterFn<any> = (row, columnId, value) => {
  if (value === "all") return true
  return row.original.twoFactorEnabled === (value === "enabled")
}

const walletBalanceFilter: FilterFn<any> = (row, columnId, value) => {
  const balance = row.original.wallet?.balance || 0
  if (value === "all") return true
  if (value === "has-balance") return balance > 0
  if (value === "no-balance") return balance === 0
  if (value === "high-balance") return balance > 100
  return true
}

const activityFilter: FilterFn<any> = (row, columnId, value) => {
  const user = row.original
  const bookings = user.bookings?.length || 0
  const reservations =
    (user.minibusReservations?.length || 0) +
    (user.parkingReservations?.length || 0)

  if (value === "all") return true
  if (value === "active") return bookings > 0 || reservations > 0
  if (value === "inactive") return bookings === 0 && reservations === 0
  return true
}

export function UserTable({
  data,
  isLoading = false,
  onDelete,
  onEdit,
  onSuspend,
  onUnsuspend,
  onBulkAction,
  theme = "light",
  badgeTheme = "default",
}: UserTableProps) {
  const [openSheetUserId, setOpenSheetUserId] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [pageSize, setPageSize] = useState(20)
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean
    action: "suspend" | "delete" | null
    selectedIds: string[]
  }>({
    open: false,
    action: null,
    selectedIds: [],
  })

  // Filter states
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [emailVerificationFilter, setEmailVerificationFilter] =
    useState<string>("all")
  const [phoneVerificationFilter, setPhoneVerificationFilter] =
    useState<string>("all")
  const [twoFactorFilterValue, setTwoFactorFilterValue] =
    useState<string>("all")
  const [walletFilter, setWalletFilter] = useState<string>("all")
  const [activityFilterValue, setActivityFilterValue] = useState<string>("all")

  const handleCopyId = (userId: string) => {
    navigator.clipboard.writeText(userId)
    toast.success("User ID copied to clipboard")
  }

  // Apply filters
  const applyFilters = () => {
    const filters: ColumnFiltersState = []

    if (roleFilter !== "all") {
      filters.push({ id: "role", value: roleFilter })
    }

    if (statusFilter !== "all") {
      filters.push({ id: "status", value: statusFilter })
    }

    if (emailVerificationFilter !== "all") {
      filters.push({
        id: "emailVerified",
        value: emailVerificationFilter,
        filterFn: emailVerifiedFilter,
      })
    }

    if (phoneVerificationFilter !== "all") {
      filters.push({
        id: "phoneVerified",
        value: phoneVerificationFilter,
        filterFn: phoneVerifiedFilter,
      })
    }

    if (twoFactorFilterValue !== "all") {
      filters.push({
        id: "twoFactorEnabled",
        value: twoFactorFilterValue,
        filterFn: twoFactorFilter,
      })
    }

    if (walletFilter !== "all") {
      filters.push({
        id: "walletBalance",
        value: walletFilter,
        filterFn: walletBalanceFilter,
      })
    }

    if (activityFilterValue !== "all") {
      filters.push({
        id: "activity",
        value: activityFilterValue,
        filterFn: activityFilter,
      })
    }

    setColumnFilters(filters)
  }

  // Clear all filters
  const clearFilters = () => {
    setRoleFilter("all")
    setStatusFilter("all")
    setEmailVerificationFilter("all")
    setPhoneVerificationFilter("all")
    setTwoFactorFilterValue("all")
    setWalletFilter("all")
    setActivityFilterValue("all")
    setColumnFilters([])
  }

  const handleBulkActionClick = (action: "suspend" | "delete") => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id)

    if (selectedIds.length === 0) {
      toast.error("No users selected")
      return
    }

    setBulkActionDialog({
      open: true,
      action,
      selectedIds,
    })
  }

  const confirmBulkAction = () => {
    if (!bulkActionDialog.action) return

    onBulkAction?.(bulkActionDialog.action, bulkActionDialog.selectedIds)
    setBulkActionDialog({ open: false, action: null, selectedIds: [] })
    toast.success(
      `${bulkActionDialog.selectedIds.length} users ${
        bulkActionDialog.action === "delete" ? "deleted" : "suspended"
      }`
    )
  }

  const columns = useMemo<ColumnDef<UserTableData>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="h-4 w-4"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="h-4 w-4"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold whitespace-nowrap px-2"
          >
            <User2 className="mr-2 h-4 w-4" />
            User
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                {user.avaterUrl ? (
                  <img
                    src={user.avaterUrl}
                    alt={user.name || "User"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <User2 className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">
                  {user.name || "Unnamed User"}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-xs text-muted-foreground truncate">
                    ID: {user.id.slice(0, 8)}...
                  </div>
                  {user.role === "ADMIN" && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        },
        size: 220,
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold whitespace-nowrap px-2"
          >
            <Mail className="mr-2 h-4 w-4" />
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{user.email || "—"}</span>
              </div>
              {user.email && (
                <div className="pl-6">
                  {getVerificationBadge(user.emailVerified, badgeTheme)}
                </div>
              )}
            </div>
          )
        },
        size: 200,
      },
      {
        accessorKey: "phone",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold whitespace-nowrap px-2"
          >
            <Phone className="mr-2 h-4 w-4" />
            Phone
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{user.phone || "—"}</span>
              </div>
              {user.phone && (
                <div className="pl-6">
                  {getVerificationBadge(user.phoneVerified, badgeTheme)}
                </div>
              )}
            </div>
          )
        },
        size: 160,
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold whitespace-nowrap px-2"
          >
            Role
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => getRoleBadge(row.getValue("role"), badgeTheme),
        size: 120,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold whitespace-nowrap px-2"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="space-y-1">
              {getStatusBadge(user.tableStatus, badgeTheme)}
            </div>
          )
        },
        size: 140,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold whitespace-nowrap px-2"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm">
            {format(new Date(row.getValue("createdAt")), "MMM dd, yyyy")}
          </div>
        ),
        size: 130,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original

          return (
            <div className="flex items-center gap-1">
              {/* Eye button to open detail sheet */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 gap-1.5 bg-blue-500 hover:bg-blue-300 text-white cursor-pointer"
                onClick={() => setOpenSheetUserId(user.id)}
              >
                <Eye className="h-3.5 w-3.5" />
                View
              </Button>

              {/* Three Dots Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>User Actions</DropdownMenuLabel>

                  <DropdownMenuItem
                    className="cursor-pointer flex items-center"
                    onClick={() => handleCopyId(user.id)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy ID
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onEdit?.(user)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit User
                  </DropdownMenuItem>

                  {user.isSuspended ? (
                    <DropdownMenuItem
                      className="cursor-pointer text-green-600"
                      onClick={() => onUnsuspend?.(user.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Unsuspend User
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      className="cursor-pointer text-yellow-600"
                      onClick={() => onSuspend?.(user.id)}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Suspend User
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer text-blue-600"
                    onClick={() => {
                      console.log("Send verification to:", user.email)
                      toast.info("Verification email sent")
                    }}
                    disabled={!user.email}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send Verification
                  </DropdownMenuItem>

                  {!user.twoFactorEnabled && (
                    <DropdownMenuItem
                      className="cursor-pointer text-purple-600"
                      onClick={() => {
                        console.log("Enable 2FA for:", user.id)
                        toast.info("2FA setup initiated")
                      }}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      Enable 2FA
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={() => onDelete?.(user.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
        size: 100,
      },
    ],
    [badgeTheme, onDelete, onEdit, onSuspend, onUnsuspend]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  })

  // Update page size when changed
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    table.setPageSize(size)
  }

  const selectedRowsCount = Object.keys(rowSelection).length

  // Get the user for the detail sheet
  const sheetUser = useMemo(() => {
    if (!openSheetUserId) return null
    return data.find((user) => user.id === openSheetUserId) || null
  }, [openSheetUserId, data])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse bg-muted rounded-md" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className={`space-y-4 ${theme === "dark" ? "dark" : ""}`}>
        {/* Advanced Filter Controls */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 flex items-center gap-4 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, phone, or ID..."
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-9"
                />
              </div>

              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {columnFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {columnFilters.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
            </div>

            {selectedRowsCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  {selectedRowsCount} selected
                </span>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        Bulk Actions
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleBulkActionClick("suspend")}
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Suspend Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkActionClick("delete")}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Activate Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        Export Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Export CSV</DropdownMenuItem>
                      <DropdownMenuItem>Export Excel</DropdownMenuItem>
                      <DropdownMenuItem>Export JSON</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </div>

          <SheetContent className="w-[400px] sm:w-[640px] overflow-y-auto px-6">
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
            </SheetHeader>

            <div className="space-y-6 py-6">
              {/* Role Filter */}
              <div className="space-y-3">
                <Label>Role</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="DRIVER">Driver</SelectItem>
                    <SelectItem value="PASSENGER">Passenger</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-3">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email Verification Filter */}
              <div className="space-y-3">
                <Label>Email Verification</Label>
                <Select
                  value={emailVerificationFilter}
                  onValueChange={setEmailVerificationFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by email verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="not-verified">Not Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Verification Filter */}
              <div className="space-y-3">
                <Label>Phone Verification</Label>
                <Select
                  value={phoneVerificationFilter}
                  onValueChange={setPhoneVerificationFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by phone verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="not-verified">Not Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Two-Factor Authentication Filter */}
              <div className="space-y-3">
                <Label>Two-Factor Authentication</Label>
                <Select
                  value={twoFactorFilterValue}
                  onValueChange={setTwoFactorFilterValue}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by 2FA status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Wallet Balance Filter */}
              <div className="space-y-3">
                <Label>Wallet Balance</Label>
                <Select value={walletFilter} onValueChange={setWalletFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by wallet balance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="has-balance">Has Balance</SelectItem>
                    <SelectItem value="no-balance">No Balance</SelectItem>
                    <SelectItem value="high-balance">
                      High Balance ($100+)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Activity Filter */}
              <div className="space-y-3">
                <Label>User Activity</Label>
                <Select
                  value={activityFilterValue}
                  onValueChange={setActivityFilterValue}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active Users</SelectItem>
                    <SelectItem value="inactive">Inactive Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Filter Toggles */}
              <div className="space-y-4 pt-4 border-t">
                <Label>Quick Filters</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="suspended-only" className="text-sm">
                      Suspended Users Only
                    </Label>
                    <Switch
                      id="suspended-only"
                      checked={statusFilter === "suspended"}
                      onCheckedChange={(checked) =>
                        setStatusFilter(checked ? "suspended" : "all")
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="admins-only" className="text-sm">
                      Admins Only
                    </Label>
                    <Switch
                      id="admins-only"
                      checked={roleFilter === "ADMIN"}
                      onCheckedChange={(checked) =>
                        setRoleFilter(checked ? "ADMIN" : "all")
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => {
                    applyFilters()
                    setShowFilters(false)
                  }}
                  className="flex-1"
                >
                  Apply Filters
                </Button>
              </div>

              {/* Active Filters */}
              {columnFilters.length > 0 && (
                <div className="pt-4 border-t">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Active Filters ({columnFilters.length})
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {columnFilters.map((filter, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {filter.id}: {filter.value as string}
                        <button
                          onClick={() => {
                            const newFilters = columnFilters.filter(
                              (_, i) => i !== index
                            )
                            setColumnFilters(newFilters)
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
                        minWidth: header.column.columnDef.size
                          ? `${header.column.columnDef.size}px`
                          : undefined,
                      }}
                      className="px-2 py-3"
                    >
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
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-2 py-3">
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
                    <div className="flex flex-col items-center justify-center py-6">
                      <User2 className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No users found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination with Page Size Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {table.getRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} users
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => handlePageSizeChange(Number(value))}
              >
                <SelectTrigger className="h-8 w-20">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
                { length: Math.min(5, table.getPageCount()) },
                (_, i) => {
                  const pageNumber = i + 1
                  return (
                    <Button
                      key={pageNumber}
                      variant={
                        table.getState().pagination.pageIndex + 1 === pageNumber
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => table.setPageIndex(pageNumber - 1)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNumber}
                    </Button>
                  )
                }
              )}
              {table.getPageCount() > 5 && (
                <span className="text-sm text-muted-foreground px-2">...</span>
              )}
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
      </div>

      {/* User Detail Sheet - Fixed to show when clicking View Details */}
      {sheetUser && (
        <UserDetailSheet
          user={sheetUser}
          theme={theme}
          badgeTheme={badgeTheme}
          open={openSheetUserId !== null}
          onOpenChange={(open) => {
            if (!open) setOpenSheetUserId(null)
          }}
        />
      )}

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog
        open={bulkActionDialog.open}
        onOpenChange={(open) =>
          setBulkActionDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkActionDialog.action === "delete"
                ? "Delete Selected Users"
                : "Suspend Selected Users"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkActionDialog.action === "delete" ? (
                <>
                  This action will permanently delete{" "}
                  <strong>{bulkActionDialog.selectedIds.length}</strong> user
                  {bulkActionDialog.selectedIds.length > 1 ? "s" : ""} and all
                  their associated data including bookings, reservations, and
                  wallet information. This action cannot be undone.
                </>
              ) : (
                <>
                  This action will suspend{" "}
                  <strong>{bulkActionDialog.selectedIds.length}</strong> user
                  {bulkActionDialog.selectedIds.length > 1 ? "s" : ""}.
                  Suspended users will be unable to access their accounts, make
                  new bookings, or perform any actions until unsuspended.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkAction}
              className={
                bulkActionDialog.action === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }
            >
              {bulkActionDialog.action === "delete"
                ? "Delete Users"
                : "Suspend Users"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
