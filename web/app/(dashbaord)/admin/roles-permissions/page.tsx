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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Zap,
  ChevronLeft,
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
import { motion, AnimatePresence } from "framer-motion"

// Mock data - Roles as columns, Permissions as rows
const mockRoles = [
  {
    id: "admin",
    name: "Admin",
    description: "Full system access",
    userCount: 3,
    color:
      "bg-red-500/10 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    icon: Shield,
  },
  {
    id: "fleet-manager",
    name: "EV Charger Station Manager",
    description: "Manage vehicles and drivers",
    userCount: 12,
    color:
      "bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    icon: Settings,
  },
  {
    id: "customer-support",
    name: "Customer Support",
    description: "Handle user inquiries",
    userCount: 25,
    color:
      "bg-green-500/10 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    icon: Users,
  },
  {
    id: "finance-manager",
    name: "Parking Station Manager",
    description: "Handle payments and reports",
    userCount: 8,
    color:
      "bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
    icon: TrendingUp,
  },
  {
    id: "driver",
    name: "Driver/Operator",
    description: "Basic driver access",
    userCount: 1500,
    color:
      "bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    icon: Zap,
  },
  {
    id: "viewer",
    name: "Viewer/Users",
    description: "Read-only access",
    userCount: 5,
    color:
      "bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
    icon: Eye,
  },
]

const mockPermissionCategories = [
  {
    id: "user-management",
    name: "User Management",
    icon: Users,
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
    icon: Settings,
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
    icon: Zap,
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
    icon: TrendingUp,
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
    icon: TrendingUp,
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
    icon: Settings,
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
  })),
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
            ? permission.id.includes("vehicle") ||
              permission.id.includes("ride")
            : role.id === "customer-support"
              ? permission.id.includes("user") || permission.id.includes("ride")
              : role.id === "finance-manager"
                ? permission.id.includes("payment") ||
                  permission.id.includes("analytics")
                : role.id === "driver"
                  ? permission.id === "rides.view" ||
                    permission.id === "vehicles.view"
                  : role.id === "viewer"
                    ? permission.id.includes("view")
                    : false,
      ]),
    ),
  ]),
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
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveProgress, setSaveProgress] = useState(0)

  // Calculate changes summary
  const changesSummary = useMemo(() => {
    let totalChanges = 0
    let roleChanges: Record<string, number> = {}

    Object.keys(permissions).forEach((permissionId) => {
      Object.keys(permissions[permissionId]).forEach((roleId) => {
        const current = permissions[permissionId][roleId]
        const initial = initialPermissionsState[permissionId]?.[roleId]
        if (current !== initial) {
          totalChanges++
          roleChanges[roleId] = (roleChanges[roleId] || 0) + 1
        }
      })
    })

    return {
      totalChanges,
      roleChanges,
      hasChanges: totalChanges > 0,
    }
  }, [permissions])

  // Define columns
  const columns = useMemo<ColumnDef<PermissionRow>[]>(
    () => [
      {
        accessorKey: "categoryName",
        header: () => (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span className="text-foreground">Category</span>
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
            <Settings className="h-4 w-4 text-emerald-500" />
            <span className="text-foreground">Permission</span>
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
                      className="h-6 w-6 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30"
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
                      className="h-6 w-6 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30"
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
                      className="data-[state=checked]:bg-emerald-500 data-[state=checked]:shadow-md transition-all duration-200"
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
    [permissions],
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
          item.categoryName.toLowerCase().includes(query),
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

  const handleSavePermissions = async () => {
    setSaveDialogOpen(true)
    setIsSaving(true)
    setSaveSuccess(false)
    setSaveError(null)
    setSaveProgress(0)

    // Simulate API call with progress
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSaveProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      clearInterval(progressInterval)
      setSaveProgress(100)

      // In a real app, this would call an API
      console.log("Saving permissions:", permissions)

      await new Promise((resolve) => setTimeout(resolve, 500))
      setSaveSuccess(true)
    } catch (error) {
      setSaveError("Failed to save permissions. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCloseDialog = () => {
    if (saveSuccess) {
      // Update initial state to match current
      // In a real app, you would persist the changes
    }
    setSaveDialogOpen(false)
    setSaveProgress(0)
    setSaveSuccess(false)
    setSaveError(null)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <TooltipProvider>
        <div className="space-y-6">
          {/* Header */}
          <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8">
            <div className="flex items-start gap-4">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="icon"
                className="mt-1 h-9 w-9 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80 dark:hover:bg-gray-800"
                onClick={() => window.history.back()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Role Management
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
                  Permissions Matrix
                </h1>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Manage permissions across all roles in a single view
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Quick Stats Badge */}
              <Badge
                variant="secondary"
                className="hidden items-center gap-2 rounded-full px-3 py-1.5 sm:flex"
              >
                <Shield className="h-3 w-3" />
                <span className="text-xs font-medium">
                  {mockRoles.length} Roles • {allPermissions.length} Permissions
                </span>
              </Badge>

              {/* Action Buttons */}
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-full border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80"
                onClick={handleResetToDefaults}
                disabled={!changesSummary.hasChanges}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>

              <Button
                size="sm"
                className="h-9 gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50"
                onClick={handleSavePermissions}
                disabled={!changesSummary.hasChanges || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Save Changes</span>
              </Button>
            </div>
          </header>

          {/* Controls */}
          {/* Controls */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    <Input
                      placeholder="Search permissions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-background border-input focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-input hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      {selectedCategory
                        ? mockPermissionCategories.find(
                            (c) => c.id === selectedCategory,
                          )?.name
                        : "All Categories"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-card border-border w-56"
                  >
                    <DropdownMenuLabel className="text-emerald-600 dark:text-emerald-400">
                      Filter by Category
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setSelectedCategory(null)}
                      className="focus:bg-emerald-50 focus:text-emerald-600 dark:focus:bg-emerald-950/30"
                    >
                      All Categories
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {mockPermissionCategories.map((category) => (
                      <DropdownMenuItem
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className="focus:bg-emerald-50 focus:text-emerald-600 dark:focus:bg-emerald-950/30"
                      >
                        {category.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Column Visibility */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-input hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                    >
                      <Columns className="mr-2 h-4 w-4" />
                      Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-card border-border"
                  >
                    <DropdownMenuLabel className="text-emerald-600 dark:text-emerald-400">
                      Toggle Columns
                    </DropdownMenuLabel>
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
                          className="focus:bg-emerald-50 focus:text-emerald-600 dark:focus:bg-emerald-950/30"
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
                  const CategoryIcon = category.icon
                  const categoryPermissions = allPermissions.filter(
                    (p) => p.categoryId === category.id,
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
                    0,
                  )
                  const percentage = Math.round(
                    (enabledPermissions / totalPermissions) * 100,
                  )

                  return (
                    <TooltipProvider key={category.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-auto py-2 px-3 border-border gap-2 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all duration-200 group"
                            onClick={() =>
                              handleBulkToggleCategory(
                                category.id,
                                enabledPermissions < totalPermissions / 2,
                              )
                            }
                          >
                            <CategoryIcon className="h-3 w-3 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                            <span className="text-sm text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                              {category.name}
                            </span>
                            <Badge
                              variant="secondary"
                              className="ml-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                            >
                              {percentage}%
                            </Badge>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{category.name} Permissions</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {enabledPermissions}/{totalPermissions} enabled
                          </p>
                          <p className="text-xs text-muted-foreground">
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
          <Card className="border-none shadow-sm overflow-hidden">
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
                                      : mockRoles.some(
                                            (r) => r.id === header.id,
                                          )
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
                                    header.getContext(),
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
                                  cell.getContext(),
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
        </div>
      </TooltipProvider>

      {/* Save Changes Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : saveSuccess ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : saveError ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {isSaving
                ? "Saving Permissions..."
                : saveSuccess
                  ? "Changes Saved!"
                  : saveError
                    ? "Save Failed"
                    : "Confirm Changes"}
            </DialogTitle>
            <DialogDescription>
              {isSaving
                ? "Please wait while we save your permission changes..."
                : saveSuccess
                  ? "Your permission changes have been successfully saved."
                  : saveError
                    ? saveError
                    : `You have ${changesSummary.totalChanges} permission change${
                        changesSummary.totalChanges !== 1 ? "s" : ""
                      } that will be applied.`}
            </DialogDescription>
          </DialogHeader>

          {isSaving && (
            <div className="space-y-3 py-4">
              <Progress value={saveProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {saveProgress < 30 && "Preparing changes..."}
                {saveProgress >= 30 && saveProgress < 60 && "Updating roles..."}
                {saveProgress >= 60 &&
                  saveProgress < 90 &&
                  "Applying permissions..."}
                {saveProgress >= 90 && "Finalizing..."}
              </p>
            </div>
          )}

          {!isSaving &&
            !saveSuccess &&
            !saveError &&
            changesSummary.hasChanges && (
              <div className="space-y-4 py-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="text-sm font-medium mb-2">Changes Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Total changes:
                      </span>
                      <span className="font-medium">
                        {changesSummary.totalChanges}
                      </span>
                    </div>
                    <Separator />
                    {Object.entries(changesSummary.roleChanges).map(
                      ([roleId, count]) => {
                        const role = mockRoles.find((r) => r.id === roleId)
                        return (
                          <div
                            key={roleId}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {role?.name}:
                            </span>
                            <span className="font-medium">{count} changes</span>
                          </div>
                        )
                      },
                    )}
                  </div>
                </div>
              </div>
            )}

          <DialogFooter>
            {!isSaving && (
              <Button variant="outline" onClick={handleCloseDialog}>
                {saveSuccess ? "Close" : "Cancel"}
              </Button>
            )}
            {!isSaving && !saveSuccess && !saveError && (
              <Button onClick={handleSavePermissions} className="bg-primary">
                Confirm & Save
              </Button>
            )}
            {saveError && (
              <Button onClick={handleSavePermissions} className="bg-primary">
                Try Again
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
