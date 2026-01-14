// app/drivers/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Car,
  Bus,
  MapPin,
  Calendar,
  Phone,
  Mail,
  User,
  Shield,
  Edit,
  Trash2,
  Key,
  Clock,
  Award,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  CarFront,
  Users,
  Activity,
  BarChart3,
  Settings,
  Download,
  Printer,
  Share2,
  MoreVertical,
  Plus,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for a single driver
const mockDriver = {
  id: "1",
  userId: "user-1",
  licenseNo: "DL-789456",
  experience: 5,
  assignedBus: {
    id: "bus-1",
    busNumber: "Bus #42",
    plateNumber: "ABC-123",
    capacity: 50,
    currentRoute: "Downtown Express",
    status: "ACTIVE" as const,
  },
  assignedMinibus: null,
  user: {
    id: "user-1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    status: "ACTIVE" as const,
    createdAt: "2024-01-15T10:30:00Z",
  },
}

// Skeleton Loading Components
function HeaderSkeleton() {
  return (
    <div className="border-b bg-card sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="p-2 rounded-lg bg-primary/10">
              <Skeleton className="h-6 w-6 rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex flex-col items-center sm:items-start gap-4">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="space-y-2 text-center sm:text-left">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="space-y-2 mt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>

              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="space-y-2 mt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="space-y-2 mt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>

              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="flex flex-wrap gap-2 mt-2">
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AssignmentCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border">
              <Skeleton className="h-5 w-32 mb-3" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PerformanceCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border text-center">
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
              <Skeleton className="h-2 w-2 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}

function VehicleInfoSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
          <Separator className="my-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

function DocumentsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
        <Skeleton className="h-10 w-full mt-2" />
      </CardContent>
    </Card>
  )
}

// Main Component
export default function DriverDetailsPage({ driverId }: { driverId: string }) {
  const router = useRouter()
  const [driver, setDriver] = useState(mockDriver)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: driver.user.name,
    email: driver.user.email,
    phone: driver.user.phone,
    licenseNo: driver.licenseNo,
    experience: driver.experience?.toString() || "",
    assignedBusId: driver.assignedBus?.id || "",
    assignedMinibusId: "",
    status: driver.user.status,
  })

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500) // Simulate 1.5s loading time

    return () => clearTimeout(timer)
  }, [])

  // Available buses and minibuses for assignment
  const availableBuses = [
    {
      id: "bus-1",
      name: "Bus #42",
      plate: "ABC-123",
      route: "Downtown Express",
    },
    { id: "bus-2", name: "Bus #18", plate: "DEF-456", route: "Northside Loop" },
    { id: "bus-3", name: "Bus #7", plate: "GHI-789", route: "Airport Shuttle" },
  ]

  const availableMinibuses = [
    {
      id: "mini-1",
      name: "Minibus #3",
      plate: "JKL-012",
      route: "Campus Circuit",
    },
    {
      id: "mini-2",
      name: "Minibus #5",
      plate: "MNO-345",
      route: "Hospital Route",
    },
  ]

  const handleEdit = () => {
    console.log("Editing driver:", driverId)
    setIsEditDialogOpen(false)

    // Update local state
    setDriver({
      ...driver,
      licenseNo: formData.licenseNo,
      experience: parseInt(formData.experience) || undefined,
      assignedBus: availableBuses.find((b) => b.id === formData.assignedBusId)
        ? {
            id: formData.assignedBusId,
            busNumber:
              availableBuses.find((b) => b.id === formData.assignedBusId)
                ?.name || "",
            plateNumber:
              availableBuses.find((b) => b.id === formData.assignedBusId)
                ?.plate || "",
            capacity: 50,
            currentRoute:
              availableBuses.find((b) => b.id === formData.assignedBusId)
                ?.route || "",
            status: "ACTIVE" as const,
          }
        : undefined,
      user: {
        ...driver.user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
      },
    })
  }

  const handleDelete = () => {
    console.log("Deleting driver:", driverId)
    setIsDeleteDialogOpen(false)
    router.push("/drivers")
  }

  const handleResetPassword = () => {
    console.log("Resetting password for:", driverId)
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderSkeleton />
        <main className="container mx-auto px-4 py-6 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <ProfileCardSkeleton />
              <AssignmentCardSkeleton />
              <PerformanceCardSkeleton />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <QuickActionsSkeleton />
              <VehicleInfoSkeleton />
              <DocumentsSkeleton />
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Loaded State
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div className="p-2 rounded-lg bg-primary/10">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Driver Details
                </h1>
                <p className="text-sm text-muted-foreground">
                  ID: {driverId} • Manage driver information and assignments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Driver Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the driver account and remove all associated data from our
                      servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                onClick={() => setIsEditDialogOpen(true)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Driver
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Driver Profile & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Driver Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Driver Profile</span>
                  <Badge
                    variant={
                      driver.user.status === "ACTIVE"
                        ? "default"
                        : "destructive"
                    }
                    className="gap-1"
                  >
                    {driver.user.status === "ACTIVE" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {driver.user.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex flex-col items-center sm:items-start gap-4">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                      <AvatarImage src={driver.user.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-2xl">
                        {driver.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl font-bold">{driver.user.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Driver ID: {driverId}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Contact Information
                        </Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{driver.user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{driver.user.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          License & Experience
                        </Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              License: {driver.licenseNo}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {driver.experience || 0} years experience
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Account Information
                        </Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Joined{" "}
                              {new Date(
                                driver.user.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span>Driver ID: {driver.userId}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Quick Actions
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={handleResetPassword}
                          >
                            <Key className="h-4 w-4" />
                            Reset Password
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => setIsEditDialogOpen(true)}
                          >
                            <Edit className="h-4 w-4" />
                            Edit Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Assignment Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="h-5 w-5" />
                  Current Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {driver.assignedBus ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Bus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span className="font-bold text-lg">
                              Bus Assignment
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-blue-500/10 text-blue-700 dark:text-blue-300"
                          >
                            Active
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Bus Number:
                            </span>
                            <span className="font-medium">
                              {driver.assignedBus.busNumber}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Plate Number:
                            </span>
                            <span className="font-medium">
                              {driver.assignedBus.plateNumber}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Current Route:
                            </span>
                            <span className="font-medium">
                              {driver.assignedBus.currentRoute}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Capacity:
                            </span>
                            <span className="font-medium">
                              {driver.assignedBus.capacity} passengers
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border bg-muted/50">
                        <h4 className="font-semibold mb-3">
                          Assignment Details
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Shift Status:</span>
                            <Badge className="bg-green-500/10 text-green-700 dark:text-green-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              On Duty
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Last Trip:</span>
                            <span className="text-sm font-medium">
                              2 hours ago
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Next Maintenance:</span>
                            <span className="text-sm font-medium">15 days</span>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Reassign Vehicle
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CarFront className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Current Assignment
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      This driver is not currently assigned to any vehicle.
                    </p>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Assign a Vehicle
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance & Activity Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance & Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      98%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      On-time Performance
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      42
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Trips This Month
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      4.8
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average Rating
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Recent Activity</h4>
                  {[
                    {
                      action: "Started morning shift",
                      time: "Today, 6:00 AM",
                      type: "shift",
                    },
                    {
                      action: "Completed Route #42",
                      time: "Yesterday, 5:30 PM",
                      type: "trip",
                    },
                    {
                      action: "Vehicle inspection passed",
                      time: "Yesterday, 8:00 AM",
                      type: "maintenance",
                    },
                    {
                      action: "Updated license information",
                      time: "2 days ago",
                      type: "profile",
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50"
                    >
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          activity.type === "shift"
                            ? "bg-green-500"
                            : activity.type === "trip"
                            ? "bg-blue-500"
                            : activity.type === "maintenance"
                            ? "bg-amber-500"
                            : "bg-purple-500"
                        )}
                      />
                      <div className="flex-1">
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Details */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Key className="h-4 w-4" />
                  Reset Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Users className="h-4 w-4" />
                  View Team Members
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Performance Report
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Account Settings
                </Button>
                <Separator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full justify-start gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the driver account and remove all associated data
                        from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Vehicle Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CarFront className="h-4 w-4" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {driver.assignedBus ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Type:
                      </span>
                      <span className="font-medium">Standard Bus</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Make/Model:
                      </span>
                      <span className="font-medium">Volvo B8R</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Year:
                      </span>
                      <span className="font-medium">2022</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Fuel Type:
                      </span>
                      <span className="font-medium">Diesel</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Mileage:
                      </span>
                      <span className="font-medium">45,678 km</span>
                    </div>
                    <Separator className="my-2" />
                    <Button variant="outline" className="w-full gap-2">
                      <CarFront className="h-4 w-4" />
                      View Vehicle Details
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CarFront className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No vehicle assigned
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    name: "Driver License",
                    status: "Verified",
                    date: "2024-01-15",
                  },
                  {
                    name: "Medical Certificate",
                    status: "Expiring Soon",
                    date: "2024-03-15",
                  },
                  {
                    name: "Training Certification",
                    status: "Verified",
                    date: "2023-11-20",
                  },
                  {
                    name: "Background Check",
                    status: "Verified",
                    date: "2024-01-10",
                  },
                ].map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated: {doc.date}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        doc.status === "Verified" ? "default" : "destructive"
                      }
                      className="text-xs"
                    >
                      {doc.status}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full gap-2 mt-2">
                  <Plus className="h-4 w-4" />
                  Upload Document
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Edit Driver Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Driver Information
            </DialogTitle>
            <DialogDescription>
              Update driver details and assignments. All fields marked with *
              are required.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleEdit()
            }}
          >
            <div className="grid gap-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Driver Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Driver Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-licenseNo">
                      License Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-licenseNo"
                      value={formData.licenseNo}
                      onChange={(e) =>
                        setFormData({ ...formData, licenseNo: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-experience">Experience (Years)</Label>
                    <Input
                      id="edit-experience"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Vehicle Assignment */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Bus className="h-4 w-4" />
                  Vehicle Assignment
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignedBus">Assigned Bus</Label>
                    <Select
                      value={formData.assignedBusId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, assignedBusId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a bus" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {availableBuses.map((bus) => (
                          <SelectItem key={bus.id} value={bus.id}>
                            {bus.name} - {bus.plate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignedMinibus">Assigned Minibus</Label>
                    <Select
                      value={formData.assignedMinibusId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, assignedMinibusId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a minibus" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {availableMinibuses.map((minibus) => (
                          <SelectItem key={minibus.id} value={minibus.id}>
                            {minibus.name} - {minibus.plate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Status */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                <div className="space-y-0.5">
                  <Label className="text-base">Account Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Set the driver's account status
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      formData.status === "ACTIVE" ? "default" : "destructive"
                    }
                  >
                    {formData.status === "ACTIVE" ? "Active" : "Suspended"}
                  </Badge>
                  <Switch
                    checked={formData.status === "ACTIVE"}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        status: checked ? "ACTIVE" : "SUSPENDED",
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Delete Driver Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              driver account and remove all associated data from our servers
              including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Driver profile information</li>
                <li>Assignment history</li>
                <li>Performance records</li>
                <li>All related documents</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
