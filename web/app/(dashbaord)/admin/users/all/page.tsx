"use client"

import { useState, useMemo } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Home,
  Users,
  Plus,
  Download,
  Car,
  UserCog,
  RefreshCw,
  ChevronLeft,
} from "lucide-react"
import { UserTable } from "@/components/admin-dashboard/UserTable"
import type { UserTableData, UserStatus, Theme, BadgeTheme } from "@/types/user"
import { useUsers } from "@/hooks/useAllUsers"
import { useDeleteUser } from "@/hooks/deleteUser"
import { set } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export default function UserManagementPage() {
  const { data: users, isLoading, error, refetch } = useUsers()
  const deleteUserMutation = useDeleteUser()

  const router = useRouter()

  const [theme, setTheme] = useState<Theme>("light")
  const [badgeTheme, setBadgeTheme] = useState<BadgeTheme>("colorful")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [userToAction, setUserToAction] = useState<string | null>(null)
  const [actionType, setActionType] = useState<"delete" | "suspend" | null>(
    null,
  )
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isRefetching, setIsRefetching] = useState(false)

  // Local table data derived from fetched users
  const [tableData, setTableData] = useState<UserTableData[]>([])

  // Update tableData whenever users change
  useMemo(() => {
    if (users) {
      const mappedData = users.map((user) => ({
        ...user,
        tableStatus: user.isSuspended
          ? "suspended"
          : user.emailVerified && user.phoneVerified
            ? "active"
            : "inactive",
        lastLogin: user.sessions?.[0]?.createdAt ?? null,
      }))
      setTableData(mappedData)
    }
  }, [users])

  // Calculate stats
  const stats = useMemo(() => {
    const total = tableData.length
    const active = tableData.filter((u) => u.tableStatus === "active").length
    const suspended = tableData.filter(
      (u) => u.tableStatus === "suspended",
    ).length
    const inactive = tableData.filter(
      (u) => u.tableStatus === "inactive",
    ).length
    const admins = tableData.filter((u) => u.role === "ADMIN").length
    const drivers = tableData.filter((u) => u.role === "DRIVER").length
    const passengers = tableData.filter((u) => u.role === "PASSENGER").length
    const totalBalance = tableData.reduce(
      (sum, user) => sum + (user.wallet?.balance || 0),
      0,
    )
    const totalBookings = tableData.reduce(
      (sum, user) => sum + (user.bookings?.length || 0),
      0,
    )

    return {
      total,
      active,
      suspended,
      inactive,
      admins,
      drivers,
      passengers,
      totalBalance,
      totalBookings,
    }
  }, [tableData])

  // Filter data
  const filteredData = useMemo(() => {
    return tableData.filter((user) => {
      if (statusFilter !== "all" && user.tableStatus !== statusFilter)
        return false
      if (roleFilter !== "all" && user.role !== roleFilter) return false
      return true
    })
  }, [tableData, statusFilter, roleFilter])

  const handleDeleteUser = (userId: string) => {
    setUserToAction(userId)
    setActionType("delete")
    setDeleteDialogOpen(true)
  }

  const handleRefresh = () => {
    try {
      setIsRefetching(true)
      refetch()
    } catch (error) {
      console.error("Error during refetch:", error)
    } finally {
      setIsRefetching(false)
    }
  }

  const handleSuspendUser = (userId: string) => {
    setUserToAction(userId)
    setActionType("suspend")
    setSuspendDialogOpen(true)
  }

  const handleUnsuspendUser = (userId: string) => {
    setTableData((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, isSuspended: false, tableStatus: "active" }
          : user,
      ),
    )
  }

  const handleBulkAction = (action: string, userIds: string[]) => {
    if (action === "delete") {
      setTableData((prev) => prev.filter((user) => !userIds.includes(user.id)))
    } else if (action === "suspend") {
      setTableData((prev) =>
        prev.map((user) =>
          userIds.includes(user.id)
            ? { ...user, isSuspended: true, tableStatus: "suspended" }
            : user,
        ),
      )
    }
  }

  const confirmAction = () => {
    if (!userToAction || !actionType) return

    if (actionType === "delete") {
      deleteUserMutation.mutate(userToAction)
    } else if (actionType === "suspend") {
      setTableData((prev) =>
        prev.map((user) =>
          user.id === userToAction
            ? { ...user, isSuspended: true, tableStatus: "suspended" }
            : user,
        ),
      )
    }

    setDeleteDialogOpen(false)
    setSuspendDialogOpen(false)
    setUserToAction(null)
    setActionType(null)
  }

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Role",
      "Status",
      "Balance",
      "Created At",
    ]
    const csvData = filteredData.map((user) => [
      user.id,
      user.name || "",
      user.email || "",
      user.phone || "",
      user.role,
      user.tableStatus,
      user.wallet?.balance || 0,
      new Date(user.createdAt).toLocaleDateString(),
    ])
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `users_export_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  if (isLoading) return <LoadingSkeleton />
  if (error)
    return (
      <div className="text-red-600">Failed to load users: {error.message}</div>
    )

  return (
    <div
      className={`container mx-auto p-4 md:p-6 space-y-6 ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            className="mt-1 h-10 w-10 cursor-pointer rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80 dark:hover:bg-gray-800"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Administration
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
                User Management
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage all users, drivers, and administrators in the system
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Stats Badge */}
          <Badge
            variant="secondary"
            className="hidden items-center gap-2 rounded-full px-3 py-1.5 sm:flex"
          >
            <Users className="h-3 w-3" />
            <span className="text-xs font-medium">Total Users: 1,234</span>
          </Badge>

          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-full border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80"
            onClick={handleRefresh}
            disabled={isRefetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            size="sm"
            className="h-9 gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md transition-all hover:scale-105 hover:shadow-lg"
            onClick={exportToCSV}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </header>

      {/* Role Distribution */}
      <Card className="border-none">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RoleCard
              icon={<UserCog className="h-5 w-5 text-purple-600" />}
              label="Admins"
              count={stats.admins}
              total={stats.total}
              color="purple"
            />
            <RoleCard
              icon={<Car className="h-5 w-5 text-blue-600" />}
              label="Drivers"
              count={stats.drivers}
              total={stats.total}
              color="blue"
            />
            <RoleCard
              icon={<Users className="h-5 w-5 text-green-600" />}
              label="Passengers"
              count={stats.passengers}
              total={stats.total}
              color="green"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters and Table */}
      <Card className="border-none p-0">
        <CardHeader className="p-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>User List</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value: UserStatus | "all") =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px]">
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <UserTable
            data={filteredData}
            isLoading={isLoading}
            onDelete={handleDeleteUser}
            onSuspend={handleSuspendUser}
            onUnsuspend={handleUnsuspendUser}
            onBulkAction={handleBulkAction}
            theme={theme}
            badgeTheme={badgeTheme}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and remove all associated data including bookings,
              reservations, and wallet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User Account</AlertDialogTitle>
            <AlertDialogDescription>
              This user will be unable to access their account. They will be
              logged out immediately and cannot make new bookings or
              reservations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Suspend Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function RoleCard({
  icon,
  label,
  count,
  total,
  color,
}: {
  icon: React.ReactNode
  label: string
  count: number
  total: number
  color: string
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg bg-${color}-500/5`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-full bg-${color}-100 flex items-center justify-center`}
        >
          {icon}
        </div>
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        {((count / total) * 100).toFixed(1)}%
      </div>
    </div>
  )
}

function LoadingSkeleton() {
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
