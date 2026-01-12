"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Home,
  Users,
  Plus,
  Download,
  UserCheck,
  UserX,
  AlertTriangle,
  Wallet,
  Car,
  Bus,
  ParkingSquare,
  Filter,
  UserCog,
} from "lucide-react"
import { UserTable } from "@/components/admin-dashboard/UserTable"
import type {
  User,
  UserTableData,
  UserStatus,
  Theme,
  BadgeTheme,
} from "@/types/user"
import { mockUsers } from "@/lib/mock-data"

export default function UserManagementPage() {
  const [theme, setTheme] = useState<Theme>("light")
  const [badgeTheme, setBadgeTheme] = useState<BadgeTheme>("colorful")
  const [data, setData] = useState<UserTableData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [userToAction, setUserToAction] = useState<string | null>(null)
  const [actionType, setActionType] = useState<"delete" | "suspend" | null>(
    null
  )
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const tableData = mockUsers.map((user) => ({
        ...user,
        tableStatus: user.isSuspended
          ? "suspended"
          : user.emailVerified && user.phoneVerified
          ? "active"
          : "inactive",
      }))
      setData(tableData)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Calculate stats
  const stats = useMemo(() => {
    const total = data.length
    const active = data.filter((u) => u.tableStatus === "active").length
    const suspended = data.filter((u) => u.tableStatus === "suspended").length
    const inactive = data.filter((u) => u.tableStatus === "inactive").length
    const admins = data.filter((u) => u.role === "ADMIN").length
    const drivers = data.filter((u) => u.role === "DRIVER").length
    const passengers = data.filter((u) => u.role === "PASSENGER").length
    const totalBalance = data.reduce(
      (sum, user) => sum + (user.wallet?.balance || 0),
      0
    )
    const totalBookings = data.reduce(
      (sum, user) => sum + (user.bookings?.length || 0),
      0
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
  }, [data])

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((user) => {
      if (statusFilter !== "all" && user.tableStatus !== statusFilter)
        return false
      if (roleFilter !== "all" && user.role !== roleFilter) return false
      return true
    })
  }, [data, statusFilter, roleFilter])

  const handleDeleteUser = (userId: string) => {
    setUserToAction(userId)
    setActionType("delete")
    setDeleteDialogOpen(true)
  }

  const handleSuspendUser = (userId: string) => {
    setUserToAction(userId)
    setActionType("suspend")
    setSuspendDialogOpen(true)
  }

  const handleUnsuspendUser = (userId: string) => {
    setData((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, isSuspended: false, tableStatus: "active" }
          : user
      )
    )
  }

  const handleBulkAction = (action: string, userIds: string[]) => {
    if (action === "delete") {
      setData((prev) => prev.filter((user) => !userIds.includes(user.id)))
    } else if (action === "suspend") {
      setData((prev) =>
        prev.map((user) =>
          userIds.includes(user.id)
            ? { ...user, isSuspended: true, tableStatus: "suspended" }
            : user
        )
      )
    }
  }

  const confirmAction = () => {
    if (!userToAction || !actionType) return

    if (actionType === "delete") {
      setData((prev) => prev.filter((user) => user.id !== userToAction))
    } else if (actionType === "suspend") {
      setData((prev) =>
        prev.map((user) =>
          user.id === userToAction
            ? { ...user, isSuspended: true, tableStatus: "suspended" }
            : user
        )
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

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div
      className={`container mx-auto p-4 md:p-6 space-y-6 ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      {/* Header */}
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Management
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage all users, drivers, and administrators in the system
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportToCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>

            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <Card className="border-none">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <UserCog className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Admins</p>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {((stats.admins / stats.total) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Car className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Drivers</p>
                  <p className="text-2xl font-bold">{stats.drivers}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {((stats.drivers / stats.total) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Passengers</p>
                  <p className="text-2xl font-bold">{stats.passengers}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {((stats.passengers / stats.total) * 100).toFixed(1)}%
              </div>
            </div>
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
