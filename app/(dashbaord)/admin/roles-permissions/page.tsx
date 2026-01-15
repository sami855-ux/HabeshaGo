"use client"

import { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Filter,
  Columns,
  CheckSquare,
  Square,
  Settings,
  Shield,
  Users,
  Eye,
  Edit,
  Trash,
  Save,
  RefreshCw,
} from "lucide-react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

// Mock data - Roles as columns, Permissions as rows
const mockRoles = [
  {
    id: "super-admin",
    name: "Super Admin",
    description: "Full system access",
    userCount: 3,
    color:
      "bg-red-500/10 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  },
  {
    id: "fleet-manager",
    name: "Fleet Manager",
    description: "Manage vehicles and drivers",
    userCount: 12,
    color:
      "bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
  {
    id: "customer-support",
    name: "Customer Support",
    description: "Handle user inquiries",
    userCount: 25,
    color:
      "bg-green-500/10 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  },
  {
    id: "finance-manager",
    name: "Finance Manager",
    description: "Handle payments and reports",
    userCount: 8,
    color:
      "bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
  },
  {
    id: "driver",
    name: "Driver",
    description: "Basic driver access",
    userCount: 1500,
    color:
      "bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access",
    userCount: 5,
    color:
      "bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
  },
]

const mockPermissionCategories = [
  {
    id: "user-management",
    name: "User Management",
    permissions: [
      {
        id: "users.view",
        name: "View Users",
        description: "View all user accounts",
      },
      {
        id: "users.create",
        name: "Create Users",
        description: "Create new user accounts",
      },
      {
        id: "users.edit",
        name: "Edit Users",
        description: "Modify user information",
      },
      {
        id: "users.delete",
        name: "Delete Users",
        description: "Remove user accounts",
      },
      {
        id: "users.roles",
        name: "Manage Roles",
        description: "Assign roles to users",
      },
    ],
  },
  {
    id: "vehicle-management",
    name: "Vehicle Management",
    permissions: [
      {
        id: "vehicles.view",
        name: "View Vehicles",
        description: "View all vehicles in fleet",
      },
      {
        id: "vehicles.create",
        name: "Add Vehicles",
        description: "Add new vehicles to fleet",
      },
      {
        id: "vehicles.edit",
        name: "Edit Vehicles",
        description: "Modify vehicle details",
      },
      {
        id: "vehicles.delete",
        name: "Remove Vehicles",
        description: "Remove vehicles from fleet",
      },
      {
        id: "vehicles.maintenance",
        name: "Manage Maintenance",
        description: "Schedule and track maintenance",
      },
    ],
  },
  {
    id: "ride-management",
    name: "Ride Management",
    permissions: [
      {
        id: "rides.view",
        name: "View Rides",
        description: "View all ride bookings",
      },
      {
        id: "rides.create",
        name: "Create Rides",
        description: "Create manual ride bookings",
      },
      {
        id: "rides.edit",
        name: "Edit Rides",
        description: "Modify ride details",
      },
      {
        id: "rides.cancel",
        name: "Cancel Rides",
        description: "Cancel ride bookings",
      },
      {
        id: "rides.dispatch",
        name: "Dispatch Rides",
        description: "Assign drivers to rides",
      },
    ],
  },
  {
    id: "payment-management",
    name: "Payment Management",
    permissions: [
      {
        id: "payments.view",
        name: "View Payments",
        description: "View all payment transactions",
      },
      {
        id: "payments.process",
        name: "Process Payments",
        description: "Process manual payments",
      },
      {
        id: "payments.refund",
        name: "Issue Refunds",
        description: "Refund payments to users",
      },
      {
        id: "payments.invoice",
        name: "Generate Invoices",
        description: "Create payment invoices",
      },
    ],
  },
  {
    id: "analytics",
    name: "Analytics & Reports",
    permissions: [
      {
        id: "analytics.view",
        name: "View Analytics",
        description: "Access analytics dashboard",
      },
      {
        id: "reports.generate",
        name: "Generate Reports",
        description: "Generate custom reports",
      },
      {
        id: "data.export",
        name: "Export Data",
        description: "Export system data",
      },
    ],
  },
  {
    id: "settings",
    name: "System Settings",
    permissions: [
      {
        id: "settings.general",
        name: "General Settings",
        description: "Modify general platform settings",
      },
      {
        id: "settings.integrations",
        name: "Manage Integrations",
        description: "Configure third-party integrations",
      },
      {
        id: "settings.notifications",
        name: "Notification Settings",
        description: "Configure notification settings",
      },
    ],
  },
]

// Flatten permissions for table rows
const allPermissions = mockPermissionCategories.flatMap((category) =>
  category.permissions.map((permission) => ({
    ...permission,
    categoryId: category.id,
    categoryName: category.name,
  }))
)

// Initial permissions state
const initialPermissionsState = Object.fromEntries(
  allPermissions.map((permission) => [
    permission.id,
    Object.fromEntries(
      mockRoles.map((role) => [
        role.id,
        // Set default permissions based on role
        role.id === "super-admin"
          ? true
          : role.id === "fleet-manager"
          ? permission.id.includes("vehicle") || permission.id.includes("ride")
          : role.id === "customer-support"
          ? permission.id.includes("user") || permission.id.includes("ride")
          : role.id === "finance-manager"
          ? permission.id.includes("payment") ||
            permission.id.includes("analytics")
          : role.id === "driver"
          ? permission.id === "rides.view" || permission.id === "vehicles.view"
          : role.id === "viewer"
          ? permission.id.includes("view")
          : false,
      ])
    ),
  ])
)

// Define table columns
type PermissionRow = {
  id: string
  name: string
  description: string
  categoryId: string
  categoryName: string
}

export default function PermissionsMatrix() {
  const [permissions, setPermissions] = useState(initialPermissionsState)
  const [searchQuery, setSearchQuery] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Define columns
  const columns = useMemo<ColumnDef<PermissionRow>[]>(
    () => [
      {
        accessorKey: "categoryName",
        header: () => (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Category</span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="font-medium text-foreground">
            {row.original.categoryName}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: () => (
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Permission</span>
          </div>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-foreground">
              {row.original.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {row.original.description}
            </div>
          </div>
        ),
      },
      ...mockRoles.map((role) => ({
        id: role.id,
        header: () => (
          <div className="flex flex-col items-center space-y-2">
            <div className="text-center">
              <div className="font-medium text-foreground">{role.name}</div>
              <div className="text-xs text-muted-foreground">
                {role.userCount} users
              </div>
            </div>
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleBulkToggleRole(role.id, true)}
                    >
                      <CheckSquare className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enable all permissions for {role.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleBulkToggleRole(role.id, false)}
                    >
                      <Square className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Disable all permissions for {role.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ),
        cell: ({ row }) => {
          const permissionId = row.original.id
          const roleId = role.id
          const isEnabled = permissions[permissionId]?.[roleId] || false

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() =>
                        handlePermissionToggle(permissionId, roleId)
                      }
                      className="data-[state=checked]:bg-primary"
                      aria-label={`Toggle ${row.original.name} for ${role.name}`}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isEnabled ? "Disable" : "Enable"} {row.original.name} for{" "}
                    {role.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {row.original.description}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        },
        enableSorting: false,
      })),
    ],
    [permissions]
  )

  // Filter data based on search and category
  const filteredData = useMemo(() => {
    let data = allPermissions

    if (selectedCategory) {
      data = data.filter((item) => item.categoryId === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.categoryName.toLowerCase().includes(query)
      )
    }

    return data
  }, [searchQuery, selectedCategory])

  // Initialize table
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  })

  // Handlers
  const handlePermissionToggle = (permissionId: string, roleId: string) => {
    setPermissions((prev) => ({
      ...prev,
      [permissionId]: {
        ...prev[permissionId],
        [roleId]: !prev[permissionId]?.[roleId],
      },
    }))
  }

  const handleBulkToggleRole = (roleId: string, enable: boolean) => {
    setPermissions((prev) => {
      const newState = { ...prev }
      Object.keys(newState).forEach((permissionId) => {
        newState[permissionId] = {
          ...newState[permissionId],
          [roleId]: enable,
        }
      })
      return newState
    })
  }

  const handleBulkToggleCategory = (categoryId: string, enable: boolean) => {
    const categoryPermissions = allPermissions
      .filter((p) => p.categoryId === categoryId)
      .map((p) => p.id)

    setPermissions((prev) => {
      const newState = { ...prev }
      categoryPermissions.forEach((permissionId) => {
        newState[permissionId] = {
          ...newState[permissionId],
          ...Object.fromEntries(mockRoles.map((role) => [role.id, enable])),
        }
      })
      return newState
    })
  }

  const handleResetToDefaults = () => {
    setPermissions(initialPermissionsState)
  }

  const handleSavePermissions = () => {
    // In a real app, this would call an API
    console.log("Saving permissions:", permissions)
    alert("Permissions saved successfully!")
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 rounded-xl">
      <TooltipProvider>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Permissions Matrix
              </h1>
              <p className="text-muted-foreground">
                Manage permissions across all roles in a single view
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleResetToDefaults}
                className="border-border"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Defaults
              </Button>
              <Button
                onClick={handleSavePermissions}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Controls */}
          <Card className="border-none">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search permissions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-background border-input"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-input">
                      <Filter className="mr-2 h-4 w-4" />
                      {selectedCategory
                        ? mockPermissionCategories.find(
                            (c) => c.id === selectedCategory
                          )?.name
                        : "All Categories"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-card border-border w-56"
                  >
                    <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                      All Categories
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {mockPermissionCategories.map((category) => (
                      <DropdownMenuItem
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Column Visibility */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-input">
                      <Columns className="mr-2 h-4 w-4" />
                      Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-card border-border"
                  >
                    <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id === "categoryName"
                            ? "Category"
                            : column.id === "name"
                            ? "Permission"
                            : mockRoles.find((r) => r.id === column.id)?.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Category Quick Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {mockPermissionCategories.map((category) => {
                  const categoryPermissions = allPermissions.filter(
                    (p) => p.categoryId === category.id
                  )
                  const totalPermissions =
                    categoryPermissions.length * mockRoles.length
                  const enabledPermissions = categoryPermissions.reduce(
                    (count, p) => {
                      return (
                        count +
                        Object.values(permissions[p.id] || {}).filter(Boolean)
                          .length
                      )
                    },
                    0
                  )

                  return (
                    <TooltipProvider key={category.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-auto py-2 px-3 border-border"
                            onClick={() =>
                              handleBulkToggleCategory(
                                category.id,
                                enabledPermissions < totalPermissions / 2
                              )
                            }
                          >
                            <Badge variant="secondary" className="mr-2">
                              {enabledPermissions}/{totalPermissions}
                            </Badge>
                            {category.name}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{category.name} Permissions</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Click to{" "}
                            {enabledPermissions < totalPermissions / 2
                              ? "enable all"
                              : "disable all"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Permissions Matrix Table */}
          <Card className="border-none overflow-hidden">
            <CardContent className="p-0">
              <div className="relative overflow-auto">
                <div className="min-w-[800px]">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr
                          key={headerGroup.id}
                          className="border-b bg-muted/50"
                        >
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              colSpan={header.colSpan}
                              className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 sticky top-0 bg-card border-border"
                              style={{
                                minWidth:
                                  header.id === "categoryName"
                                    ? "200px"
                                    : header.id === "name"
                                    ? "300px"
                                    : mockRoles.some((r) => r.id === header.id)
                                    ? "150px"
                                    : "auto",
                                left:
                                  header.id === "categoryName"
                                    ? "0"
                                    : header.id === "name"
                                    ? "200px"
                                    : "auto",
                                zIndex:
                                  header.id === "categoryName"
                                    ? 30
                                    : header.id === "name"
                                    ? 20
                                    : 10,
                              }}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <tr
                            key={row.id}
                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                          >
                            {row.getVisibleCells().map((cell) => (
                              <td
                                key={cell.id}
                                className="p-4 align-middle [&:has([role=checkbox])]:pr-0 bg-card"
                                style={{
                                  left:
                                    cell.column.id === "categoryName"
                                      ? "0"
                                      : cell.column.id === "name"
                                      ? "200px"
                                      : "auto",
                                  position:
                                    cell.column.id === "categoryName" ||
                                    cell.column.id === "name"
                                      ? "sticky"
                                      : "relative",
                                  zIndex:
                                    cell.column.id === "categoryName"
                                      ? 20
                                      : cell.column.id === "name"
                                      ? 10
                                      : 1,
                                  backgroundColor: "inherit",
                                }}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No permissions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legend & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={true}
                    disabled
                    className="data-[state=checked]:bg-primary"
                  />
                  <span className="text-sm text-foreground">
                    Enabled permission
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={false} disabled />
                  <span className="text-sm text-foreground">
                    Disabled permission
                  </span>
                </div>
                <Separator />
                <div className="text-sm text-muted-foreground">
                  Click any switch to toggle permission for that role
                </div>
              </CardContent>
            </Card>

            <Card className="border-border md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Role Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockRoles.map((role) => {
                    const totalPermissions = allPermissions.length
                    const enabledPermissions = Object.values(
                      permissions
                    ).reduce((count, rolePerms) => {
                      return count + (rolePerms[role.id] ? 1 : 0)
                    }, 0)
                    const percentage = Math.round(
                      (enabledPermissions / totalPermissions) * 100
                    )

                    return (
                      <div
                        key={role.id}
                        className={`p-4 rounded-lg border ${role.color}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-foreground">
                            {role.name}
                          </h3>
                          <Badge variant="secondary">
                            {role.userCount} users
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {role.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Permissions</span>
                            <span className="font-medium">
                              {enabledPermissions}/{totalPermissions}
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                handleBulkToggleRole(role.id, true)
                              }
                            >
                              Enable All
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                handleBulkToggleRole(role.id, false)
                              }
                            >
                              Disable All
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {mockRoles.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Roles
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {allPermissions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Permissions
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {Object.values(permissions).reduce((total, rolePerms) => {
                      return (
                        total + Object.values(rolePerms).filter(Boolean).length
                      )
                    }, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Enabled Permissions
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {mockRoles.reduce(
                      (total, role) => total + role.userCount,
                      0
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Users
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TooltipProvider>
    </div>
  )
}
