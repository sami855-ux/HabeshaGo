"use client"

import { useState, useEffect, useMemo } from "react"
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
} from "@tanstack/react-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  UserCheck,
  UserX,
  Check,
  ChevronUp,
  ChevronDown,
  Home,
  Users,
  ArrowUpDown,
  Calendar,
  Mail,
  User,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"

// Types
type UserStatus = "active" | "pending" | "inactive"
type UserRole = "admin" | "user" | "guest"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastLogin: Date
  createdAt: Date
}

const UserManagementPage = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [data, setData] = useState<User[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all")

  // Mock data - replace with your API call
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
        status: "active",
        lastLogin: new Date("2024-01-15"),
        createdAt: new Date("2024-01-01"),
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        role: "user",
        status: "pending",
        lastLogin: new Date("2024-01-14"),
        createdAt: new Date("2024-01-02"),
      },
      {
        id: "3",
        name: "Bob Johnson",
        email: "bob@example.com",
        role: "guest",
        status: "inactive",
        lastLogin: new Date("2024-01-10"),
        createdAt: new Date("2024-01-03"),
      },
      {
        id: "4",
        name: "Alice Brown",
        email: "alice@example.com",
        role: "user",
        status: "active",
        lastLogin: new Date("2024-01-12"),
        createdAt: new Date("2024-01-04"),
      },
      {
        id: "5",
        name: "Charlie Wilson",
        email: "charlie@example.com",
        role: "admin",
        status: "pending",
        lastLogin: new Date("2024-01-11"),
        createdAt: new Date("2024-01-05"),
      },
      {
        id: "6",
        name: "Diana Prince",
        email: "diana@example.com",
        role: "user",
        status: "active",
        lastLogin: new Date("2024-01-09"),
        createdAt: new Date("2024-01-06"),
      },
      {
        id: "7",
        name: "Ethan Hunt",
        email: "ethan@example.com",
        role: "guest",
        status: "inactive",
        lastLogin: new Date("2024-01-08"),
        createdAt: new Date("2024-01-07"),
      },
      {
        id: "8",
        name: "Fiona Gallagher",
        email: "fiona@example.com",
        role: "user",
        status: "active",
        lastLogin: new Date("2024-01-07"),
        createdAt: new Date("2024-01-08"),
      },
      {
        id: "9",
        name: "George Miller",
        email: "george@example.com",
        role: "admin",
        status: "pending",
        lastLogin: new Date("2024-01-06"),
        createdAt: new Date("2024-01-09"),
      },
      {
        id: "10",
        name: "Hannah Baker",
        email: "hannah@example.com",
        role: "user",
        status: "active",
        lastLogin: new Date("2024-01-05"),
        createdAt: new Date("2024-01-10"),
      },
    ]

    setTimeout(() => {
      setData(mockUsers)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Helper functions for badges
  const getStatusBadge = (status: UserStatus) => {
    const variants = {
      active: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
      pending:
        "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200",
      inactive: "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200",
    }

    const icons = {
      active: <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />,
      pending: <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />,
      inactive: <div className="w-2 h-2 rounded-full bg-gray-500 mr-2" />,
    }

    const labels = {
      active: "Active",
      pending: "Pending",
      inactive: "Inactive",
    }

    return (
      <Badge
        variant="outline"
        className={`${variants[status]} flex items-center w-fit`}
      >
        {icons[status]}
        {labels[status]}
      </Badge>
    )
  }

  const getRoleBadge = (role: UserRole) => {
    const variants = {
      admin: "bg-purple-100 text-purple-800 border-purple-200",
      user: "bg-blue-100 text-blue-800 border-blue-200",
      guest: "bg-gray-100 text-gray-800 border-gray-200",
    }

    return (
      <Badge variant="outline" className={variants[role]}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    )
  }

  // Define columns
  const columns: ColumnDef<User>[] = useMemo(
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
        accessorKey: "id",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="font-semibold"
            >
              ID
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="font-mono text-sm">#{row.getValue("id")}</div>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="font-semibold"
            >
              <User className="mr-2 h-4 w-4" />
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">{row.getValue("name")}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="font-semibold"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            {row.getValue("email")}
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => getRoleBadge(row.getValue("role")),
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="font-semibold"
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => getStatusBadge(row.getValue("status")),
        filterFn: (row, columnId, filterValue) => {
          if (filterValue === "all") return true
          return row.getValue(columnId) === filterValue
        },
      },
      {
        accessorKey: "lastLogin",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="font-semibold"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Last Login
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) =>
          format(new Date(row.getValue("lastLogin")), "MMM dd, yyyy"),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="font-semibold"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Created At
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) =>
          format(new Date(row.getValue("createdAt")), "MMM dd, yyyy"),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit User
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => {
                    setUserToDelete(user.id)
                    setDeleteDialogOpen(true)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    []
  )

  // Initialize table
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
        pageSize: 10,
      },
    },
  })

  // Apply status filter
  useEffect(() => {
    const statusColumn = table.getColumn("status")
    if (statusColumn) {
      if (statusFilter === "all") {
        statusColumn.setFilterValue(undefined)
      } else {
        statusColumn.setFilterValue(statusFilter)
      }
    }
  }, [statusFilter, table])

  // Handlers
  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteUser = () => {
    if (userToDelete) {
      setData((prev) => prev.filter((user) => user.id !== userToDelete))
      setRowSelection((prev) => {
        const newSelection = { ...prev }
        delete newSelection[userToDelete]
        return newSelection
      })
    }
    setDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  const handleBulkAction = (action: "activate" | "deactivate" | "delete") => {
    const selectedRows = table.getSelectedRowModel().rows
    const selectedUserIds = selectedRows.map((row) => row.original.id)

    if (action === "delete") {
      setData((prev) =>
        prev.filter((user) => !selectedUserIds.includes(user.id))
      )
      table.resetRowSelection()
    } else {
      setData((prev) =>
        prev.map((user) =>
          selectedUserIds.includes(user.id)
            ? { ...user, status: action === "activate" ? "active" : "inactive" }
            : user
        )
      )
    }
  }

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Role",
      "Status",
      "Last Login",
      "Created At",
    ]
    const data = table
      .getFilteredRowModel()
      .rows.map((row) => [
        row.original.id,
        row.original.name,
        row.original.email,
        row.original.role,
        row.original.status,
        format(row.original.lastLogin, "yyyy-MM-dd"),
        format(row.original.createdAt, "yyyy-MM-dd"),
      ])

    const csvContent = [
      headers.join(","),
      ...data.map((row) => row.join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `users_export_${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
  }

  const selectedRowsCount = Object.keys(rowSelection).length

  // Calculate stats
  const stats = useMemo(() => {
    const total = data.length
    const active = data.filter((u) => u.status === "active").length
    const pending = data.filter((u) => u.status === "pending").length
    const inactive = data.filter((u) => u.status === "inactive").length
    const last7Days = data.filter((u) => {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return new Date(u.createdAt) >= sevenDaysAgo
    }).length

    return { total, active, pending, inactive, last7Days }
  }, [data])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div
      className={`container mx-auto rounded-2xl p-2 md:p-4 space-y-6 ${theme === "dark" ? "dark bg-background" : "bg-background"}`}
    >
      {/* Header / Page Title */}
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="flex items-center gap-2 hover:text-primary"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">All Users</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
            <p className="text-muted-foreground mt-2">
              Manage and monitor all user accounts in your system
            </p>
          </div>

          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none">
          <CardContent className="pt-6 ">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <Users className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none">
          <CardContent className="pt-6 border-none">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.active}</div>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none">
          <CardContent className="pt-6 border-none">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-sm text-muted-foreground">Pending Users</p>
              </div>
              <Loader2 className="h-8 w-8 text-yellow-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none">
          <CardContent className="pt-6 border-none">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.last7Days}</div>
                <p className="text-sm text-muted-foreground">Last 7 Days</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="border-none">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 border-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or ID..."
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value: UserStatus | "all") =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger className="w-[180px] border-none">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {selectedRowsCount > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">
                    {selectedRowsCount} selected
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Bulk Actions
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
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
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("delete")}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="gap-2 border-none"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-none">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
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
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-muted/50 transition-colors py-3"
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
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {table.getRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} users
            </div>
            <div className="flex items-center gap-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        table.previousPage()
                      }}
                      className={
                        !table.getCanPreviousPage()
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: table.getPageCount() }, (_, i) => i + 1)
                    .slice(
                      Math.max(0, table.getState().pagination.pageIndex - 2),
                      Math.min(
                        table.getPageCount(),
                        table.getState().pagination.pageIndex + 3
                      )
                    )
                    .map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            table.setPageIndex(page - 1)
                          }}
                          isActive={
                            table.getState().pagination.pageIndex === page - 1
                          }
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        table.nextPage()
                      }}
                      className={
                        !table.getCanNextPage()
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="flex items-center gap-2">
                <span className="text-sm">Rows per page:</span>
                <Select
                  value={table.getState().pagination.pageSize.toString()}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value))
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={pageSize.toString()}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default UserManagementPage
