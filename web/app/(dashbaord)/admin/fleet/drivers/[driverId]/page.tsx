"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Globe,
  Home,
  IdCard,
  Loader2,
  MapPin,
  MoreHorizontal,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Truck,
  User,
  UserCheck,
  UserX,
  X,
  AlertCircle,
  Building,
  Car,
  Mail,
  Phone,
} from "lucide-react"
import { format } from "date-fns"

// UI Components
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
// Add missing import
import { Info } from "lucide-react"

// API Service
import { fetchDriverById } from "@/services/driver.api"
import { axiosInstance } from "@/services/axiosInstance"

// Types
enum Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
}

enum VerificationStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

enum IdType {
  PASSPORT = "PASSPORT",
  NATIONAL_ID = "NATIONAL_ID",
  KEBELE_ID = "KEBELE_ID",
  DRIVING_LICENSE = "DRIVING_LICENSE",
}

type User = {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl: string | null
  location: string | null
  bio: string | null
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
}

type Vehicle = {
  id: string
  plateNumber: string
  model: string
  brand: string
  year: number
  color: string
  capacity: number
  vehicleType: string
  status: string
}

type Driver = {
  id: string
  userId: string
  licenseNo: string
  experience: number | null
  status: Status
  driverLicenseUrl: string | null
  licenseStatus: VerificationStatus
  idType: IdType | null
  idFrontUrl: string | null
  idBackUrl: string | null
  idStatus: VerificationStatus
  verifiedById: string | null
  verifiedAt: string | null
  rejectionReason: string | null
  isOnDuty: boolean
  lastActiveAt: string | null
  rating: number
  totalTrips: number
  complaintsCount: number
  vehicleId: string | null
  createdAt: string
  updatedAt: string
  user: User
  vehicle: Vehicle | null
}

type UpdateVerificationPayload = {
  licenseStatus?: VerificationStatus
  idStatus?: VerificationStatus
  rejectionReason?: string
}

type UpdateStatusPayload = {
  status: Status
  reason?: string
}

export const updateVerification = async (
  driverId: string,
  data: UpdateVerificationPayload,
) => {
  try {
    const response = await axiosInstance.post(
      `/drivers/${driverId}/verify`,
      data,
    )

    return response.data.data
  } catch (error: any) {
    console.error("Update verification API error:", error)

    // Prefer backend error message if available
    throw new Error(
      error?.response?.data?.message ||
        "Failed to update driver verification status",
    )
  }
}

const updateDriverStatus = async (
  driverId: string,
  data: UpdateStatusPayload,
) => {
  return {}
}

const assignVehicle = async (driverId: string, vehicleId: string) => {
  return {}
}

const downloadDocuments = async (
  driverId: string,
  documentType: "license" | "id",
): Promise<Blob> => {
  const response = await fetch(
    `/api/admin/drivers/${driverId}/documents/${documentType}/download`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error("Failed to download document")
  }

  return await response.blob()
}

// Helper functions
const getStatusConfig = (status: Status) => {
  const configs = {
    [Status.ACTIVE]: {
      label: "Active",
      variant: "default" as const,
      icon: ShieldCheck,
      color: "bg-green-500",
      textColor: "text-green-700",
    },
    [Status.INACTIVE]: {
      label: "Inactive",
      variant: "secondary" as const,
      icon: UserX,
      color: "bg-gray-500",
      textColor: "text-gray-700",
    },
    [Status.SUSPENDED]: {
      label: "Suspended",
      variant: "destructive" as const,
      icon: ShieldAlert,
      color: "bg-red-500",
      textColor: "text-red-700",
    },
    [Status.PENDING]: {
      label: "Pending",
      variant: "outline" as const,
      icon: Clock,
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
    },
  }
  return configs[status]
}

const getVerificationConfig = (status: VerificationStatus) => {
  const configs = {
    [VerificationStatus.VERIFIED]: {
      label: "Approved",
      variant: "default" as const,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    [VerificationStatus.PENDING]: {
      label: "Pending",
      variant: "outline" as const,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    [VerificationStatus.REJECTED]: {
      label: "Rejected",
      variant: "destructive" as const,
      icon: X,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
  }
  return configs[status]
}

const getIdTypeLabel = (idType: IdType | null) => {
  if (!idType) return "Not Provided"

  const labels = {
    [IdType.NATIONAL_ID]: "National ID",
    [IdType.PASSPORT]: "Passport",
    [IdType.KEBELE_ID]: "Kebele ID",
    [IdType.DRIVING_LICENSE]: "Driving License",
  }
  return labels[idType]
}

const getIdTypeIcon = (idType: IdType | null) => {
  if (!idType) return <IdCard className="h-4 w-4" />

  const icons = {
    [IdType.NATIONAL_ID]: <Building className="h-4 w-4" />,
    [IdType.PASSPORT]: <Globe className="h-4 w-4" />,
    [IdType.KEBELE_ID]: <Home className="h-4 w-4" />,
    [IdType.DRIVING_LICENSE]: <Car className="h-4 w-4" />,
  }
  return icons[idType]
}

const formatPhoneNumber = (phone: string): string => {
  if (!phone) return ""
  const cleaned = phone.replace(/\D/g, "")
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `+251 ${match[1]} ${match[2]} ${match[3]}`
  }
  return phone
}

export default function DriverDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const driverId = params.driverId as string

  const [rejectionReason, setRejectionReason] = useState("")
  const [approvalNotes, setApprovalNotes] = useState("")
  const [approvalType, setApprovalType] = useState<"license" | "id" | null>(
    null,
  )
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null)
  const [statusReason, setStatusReason] = useState("")
  const [isAssignVehicleOpen, setIsAssignVehicleOpen] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("")

  // Fetch driver data with error handling
  const {
    data: driverResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["driver", driverId],
    queryFn: () => fetchDriverById(driverId),
    retry: 2,
    retryDelay: 1000,
  })

  const driver = driverResponse

  // Mutations
  const verificationMutation = useMutation({
    mutationFn: ({
      type,
      status,
    }: {
      type: "license" | "id"
      status: VerificationStatus
    }) => {
      const payload: UpdateVerificationPayload = {
        [type === "license" ? "licenseStatus" : "idStatus"]: status,
      }

      if (status === VerificationStatus.REJECTED) {
        payload.rejectionReason = rejectionReason
      }

      return updateVerification(driverId, payload)
    },
    onSuccess: (response) => {
      toast.success("Verification updated successfully")
      queryClient.invalidateQueries({ queryKey: ["driver", driverId] })
      setIsApproveOpen(false)
      setIsRejectOpen(false)
      setRejectionReason("")
      setApprovalNotes("")
      setApprovalType(null)
    },
    onError: (error: Error) => {
      toast.error("Failed to update verification", {
        description: error.message,
      })
    },
  })

  const statusMutation = useMutation({
    mutationFn: (data: UpdateStatusPayload) =>
      updateDriverStatus(driverId, data),
    onSuccess: () => {
      toast.success("Driver status updated successfully")
      queryClient.invalidateQueries({ queryKey: ["driver", driverId] })
      setIsStatusOpen(false)
      setSelectedStatus(null)
      setStatusReason("")
    },
    onError: (error: Error) => {
      toast.error("Failed to update driver status", {
        description: error.message,
      })
    },
  })

  const vehicleAssignmentMutation = useMutation({
    mutationFn: (vehicleId: string) => assignVehicle(driverId, vehicleId),
    onSuccess: () => {
      toast.success("Vehicle assigned successfully")
      queryClient.invalidateQueries({ queryKey: ["driver", driverId] })
      setIsAssignVehicleOpen(false)
      setSelectedVehicleId("")
    },
    onError: (error: Error) => {
      toast.error("Failed to assign vehicle", {
        description: error.message,
      })
    },
  })

  const handleDownloadDocument = async (type: "license" | "id") => {
    try {
      const blob = await downloadDocuments(driverId, type)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${driver?.user.name}_${type}_${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Document downloaded successfully")
    } catch (error) {
      toast.error("Failed to download document")
    }
  }

  const handleApprove = (type: "license" | "id") => {
    setApprovalType(type)
    setIsApproveOpen(true)
  }

  const handleReject = (type: "license" | "id") => {
    setApprovalType(type)
    setIsRejectOpen(true)
  }

  const confirmApprove = () => {
    if (!approvalType) return
    verificationMutation.mutate({
      type: approvalType,
      status: VerificationStatus.VERIFIED,
    })
  }

  const confirmReject = () => {
    if (!approvalType || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }
    verificationMutation.mutate({
      type: approvalType,
      status: VerificationStatus.REJECTED,
    })
  }

  const confirmStatusChange = () => {
    if (!selectedStatus) return
    statusMutation.mutate({
      status: selectedStatus,
      reason: statusReason,
    })
  }

  const confirmVehicleAssignment = () => {
    if (!selectedVehicleId) {
      toast.error("Please select a vehicle")
      return
    }
    vehicleAssignmentMutation.mutate(selectedVehicleId)
  }

  if (isLoading) {
    return <DriverDetailsSkeleton />
  }

  if (error || !driver) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4 max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-lg font-medium text-destructive">
              Failed to load driver
            </p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Driver not found"}
            </p>
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/drivers")}
              >
                Back to Drivers
              </Button>
              <Button onClick={() => refetch()}>
                <Loader2 className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(driver.status)
  const licenseConfig = getVerificationConfig(driver.licenseStatus)
  const idConfig = getVerificationConfig(driver.idStatus)

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="-ml-2"
            >
              ← Back
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              Driver Details
            </h1>
          </div>
          <p className="text-muted-foreground">
            View and manage driver information and documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="mr-2 h-4 w-4" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Driver Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/admin/fleet/drivers/${driverId}/edit`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Driver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsStatusOpen(true)}>
                <UserCheck className="mr-2 h-4 w-4" />
                Change Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsAssignVehicleOpen(true)}>
                <Truck className="mr-2 h-4 w-4" />
                Assign Vehicle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setIsStatusOpen(true)}
              >
                <UserX className="mr-2 h-4 w-4" />
                Suspend Driver
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Driver Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge
                variant={statusConfig.variant}
                className="gap-1 font-medium"
              >
                <statusConfig.icon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
              {driver.isOnDuty && (
                <Badge variant="default" className="bg-green-500">
                  On Duty
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">License:</span>
              <Badge variant={licenseConfig.variant} className="gap-1">
                <licenseConfig.icon className="h-3 w-3" />
                {licenseConfig.label}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">ID:</span>
              <Badge variant={idConfig.variant} className="gap-1">
                <idConfig.icon className="h-3 w-3" />
                {idConfig.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold">{driver.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {driver.totalTrips} trips
              </span>
            </div>
            <div className="mt-2">
              <Progress value={driver.rating * 20} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Joined:</span>
                <span className="text-sm font-medium">
                  {format(new Date(driver.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Experience:</span>
                <span className="text-sm font-medium">
                  {driver.experience || 0} years
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Complaints:</span>
                <span className="text-sm font-medium">
                  {driver.complaintsCount}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="trips">Trips & Activity</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - User Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* User Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Driver Profile</CardTitle>
                  <CardDescription>
                    Personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {driver.user.avatarUrl ? (
                        <img
                          src={driver.user.avatarUrl}
                          alt={driver.user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/10">
                          <User className="h-10 w-10 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold">
                          {driver.user.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified User
                          </Badge>
                          {driver.user.emailVerified && (
                            <Badge variant="outline" className="gap-1">
                              <Mail className="h-3 w-3" />
                              Email Verified
                            </Badge>
                          )}
                          {driver.user.phoneVerified && (
                            <Badge variant="outline" className="gap-1">
                              <Phone className="h-3 w-3" />
                              Phone Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>Email</span>
                          </div>
                          <p className="font-medium">{driver.user.email}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>Phone</span>
                          </div>
                          <p className="font-medium">
                            {formatPhoneNumber(driver.user.phone)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>Location</span>
                          </div>
                          <p className="font-medium">
                            {driver.user.location || "Not specified"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <IdCard className="h-4 w-4" />
                            <span>License Number</span>
                          </div>
                          <p className="font-medium font-mono">
                            {driver.licenseNo || "Not provided"}
                          </p>
                        </div>
                      </div>

                      {driver.user.bio && (
                        <div className="pt-4 border-t">
                          <h4 className="font-medium mb-2">Bio</h4>
                          <p className="text-sm text-muted-foreground">
                            {driver.user.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Assignment */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Vehicle Assignment</CardTitle>
                      <CardDescription>
                        Currently assigned vehicle information
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAssignVehicleOpen(true)}
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Change Vehicle
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {driver.vehicle ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Car className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {driver.vehicle.plateNumber}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {driver.vehicle.brand} {driver.vehicle.model} •{" "}
                            {driver.vehicle.year} • {driver.vehicle.color}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {driver.vehicle.vehicleType}
                            </Badge>
                            <Badge variant="outline">
                              Capacity: {driver.vehicle.capacity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Car className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        No vehicle assigned
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setIsAssignVehicleOpen(true)}
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Assign Vehicle
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Verification & Actions */}
            <div className="space-y-6">
              {/* Verification Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Document Verification</CardTitle>
                  <CardDescription>
                    Review and verify driver documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Driver's License Verification */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span className="font-medium">Driver's License</span>
                      </div>
                      <Badge variant={licenseConfig.variant} className="gap-1">
                        <licenseConfig.icon className="h-3 w-3" />
                        {licenseConfig.label}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleApprove("license")}
                        disabled={
                          driver.licenseStatus === VerificationStatus.VERIFIED
                        }
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleReject("license")}
                        disabled={
                          driver.licenseStatus === VerificationStatus.REJECTED
                        }
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* ID Verification */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getIdTypeIcon(driver.idType)}
                        <span className="font-medium">
                          {getIdTypeLabel(driver.idType)}
                        </span>
                      </div>
                      <Badge variant={idConfig.variant} className="gap-1">
                        <idConfig.icon className="h-3 w-3" />
                        {idConfig.label}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleApprove("id")}
                        disabled={
                          driver.idStatus === VerificationStatus.VERIFIED
                        }
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleReject("id")}
                        disabled={
                          driver.idStatus === VerificationStatus.REJECTED
                        }
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Verification History */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">
                      Verification History
                    </h4>
                    <div className="space-y-1 text-sm">
                      {driver.verifiedAt ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Verified by:
                            </span>
                            <span className="font-medium">Admin</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Verified at:
                            </span>
                            <span className="font-medium">
                              {format(
                                new Date(driver.verifiedAt),
                                "MMM d, yyyy HH:mm",
                              )}
                            </span>
                          </div>
                        </>
                      ) : (
                        <p className="text-muted-foreground">
                          Not verified yet
                        </p>
                      )}
                      {driver.rejectionReason && (
                        <div>
                          <span className="text-muted-foreground">
                            Rejection Reason:
                          </span>
                          <p className="font-medium text-destructive mt-1">
                            {driver.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleDownloadDocument("license")}
                    disabled={!driver.driverLicenseUrl}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download License
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleDownloadDocument("id")}
                    disabled={!driver.idFrontUrl}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download ID
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    View Trip History
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    View Complaints
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Verification</CardTitle>
              <CardDescription>
                Review driver documents and update verification status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Driver's License */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Driver's License
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={licenseConfig.variant}
                          className="gap-1"
                        >
                          <licenseConfig.icon className="h-3 w-3" />
                          {licenseConfig.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          License No: {driver.licenseNo}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove("license")}
                        disabled={
                          driver.licenseStatus === VerificationStatus.VERIFIED
                        }
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject("license")}
                        disabled={
                          driver.licenseStatus === VerificationStatus.REJECTED
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {driver.driverLicenseUrl ? (
                    <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={driver.driverLicenseUrl}
                        alt="Driver's License"
                        className="h-full w-full object-contain p-4"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg border border-dashed border-muted-foreground/25 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground mt-2">
                          No license uploaded
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ID Front */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {getIdTypeIcon(driver.idType)}
                        {getIdTypeLabel(driver.idType)} Front
                      </h3>
                      <div className="mt-1">
                        <Badge variant={idConfig.variant} className="gap-1">
                          <idConfig.icon className="h-3 w-3" />
                          {idConfig.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove("id")}
                        disabled={
                          driver.idStatus === VerificationStatus.VERIFIED
                        }
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject("id")}
                        disabled={
                          driver.idStatus === VerificationStatus.REJECTED
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {driver.idFrontUrl ? (
                    <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={driver.idFrontUrl}
                        alt="ID Front"
                        className="h-full w-full object-contain p-4"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg border border-dashed border-muted-foreground/25 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground mt-2">
                          No ID front uploaded
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ID Back */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {getIdTypeIcon(driver.idType)}
                        {getIdTypeLabel(driver.idType)} Back
                      </h3>
                      <div className="mt-1">
                        <Badge variant={idConfig.variant} className="gap-1">
                          <idConfig.icon className="h-3 w-3" />
                          {idConfig.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove("id")}
                        disabled={
                          driver.idStatus === VerificationStatus.VERIFIED
                        }
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject("id")}
                        disabled={
                          driver.idStatus === VerificationStatus.REJECTED
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {driver.idBackUrl ? (
                    <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={driver.idBackUrl}
                        alt="ID Back"
                        className="h-full w-full object-contain p-4"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg border border-dashed border-muted-foreground/25 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground mt-2">
                          No ID back uploaded
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-800">
                  <Shield className="h-4 w-4" />
                  Verification Guidelines
                </h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>✓ Check that all information is clearly visible</li>
                  <li>✓ Verify that the license number matches our records</li>
                  <li>✓ Ensure ID documents are not expired</li>
                  <li>✓ Confirm that photos match the driver's appearance</li>
                  <li>✓ Check for any signs of tampering or editing</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs can be implemented similarly */}
        <TabsContent value="trips">
          <Card>
            <CardHeader>
              <CardTitle>Trip History</CardTitle>
              <CardDescription>
                Driver's recent trips and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Trip history will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>
                Driver's account activity and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Activity history will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals and Sheets remain similar but with real API integration */}
      {/* Approval Sheet */}
      <Sheet open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <SheetContent className="px-3 py-2">
          <SheetHeader>
            <SheetTitle>Approve Document</SheetTitle>
            <SheetDescription>
              Confirm approval of{" "}
              {approvalType === "license"
                ? "Driver's License"
                : getIdTypeLabel(driver.idType)}
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Once approved, this document will be marked as verified and the
                driver will be able to use it for verification purposes.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="notes">Approval Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this approval..."
                className="min-h-[100px]"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
            </div>
          </div>
          <SheetFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveOpen(false)}
              disabled={verificationMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApprove}
              disabled={verificationMutation.isPending}
            >
              {verificationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Document
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Rejection Sheet */}
      <Sheet open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <SheetContent className="px-3 py-2">
          <SheetHeader>
            <SheetTitle>Reject Document</SheetTitle>
            <SheetDescription>
              Provide a reason for rejecting{" "}
              {approvalType === "license"
                ? "Driver's License"
                : getIdTypeLabel(driver.idType)}
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertDescription>
                The driver will be notified about the rejection and will need to
                upload new documents.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this document is being rejected..."
                className="min-h-[120px]"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Provide clear reasons so the driver knows what to fix
              </p>
            </div>
          </div>
          <SheetFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectOpen(false)}
              disabled={verificationMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={
                verificationMutation.isPending || !rejectionReason.trim()
              }
            >
              {verificationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Reject Document
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Status Change Dialog */}
      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Driver Status</DialogTitle>
            <DialogDescription>
              Update the current status of the driver
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Select Status</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(Status).map((status) => {
                  const config = getStatusConfig(status)
                  const Icon = config.icon

                  return (
                    <Button
                      key={status}
                      type="button"
                      variant={
                        selectedStatus === status ? "default" : "outline"
                      }
                      className="justify-start h-auto py-3"
                      onClick={() => setSelectedStatus(status)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{config.label}</div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-reason">
                Reason for Change (Optional)
              </Label>
              <Textarea
                id="status-reason"
                placeholder="Add any notes about this status change..."
                className="min-h-[80px]"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusOpen(false)}
              disabled={statusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
              disabled={statusMutation.isPending || !selectedStatus}
            >
              {statusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Update Status
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Vehicle Dialog */}
      <Dialog open={isAssignVehicleOpen} onOpenChange={setIsAssignVehicleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Vehicle</DialogTitle>
            <DialogDescription>
              Select a vehicle to assign to this driver
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Only available vehicles will be shown here.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Select Vehicle</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                >
                  <option value="">Select a vehicle</option>
                  {/* This would be populated from a real API call */}
                  <option value="vehicle-1">ABC-123 | Toyota Hiace</option>
                  <option value="vehicle-2">XYZ-789 | Nissan Urvan</option>
                  <option value="vehicle-3">DEF-456 | Mercedes Sprinter</option>
                </select>
              </div>

              {driver.vehicle && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Current vehicle assignment will be removed.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignVehicleOpen(false)}
              disabled={vehicleAssignmentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmVehicleAssignment}
              disabled={
                vehicleAssignmentMutation.isPending || !selectedVehicleId
              }
            >
              {vehicleAssignmentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Assign Vehicle
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Skeleton component for loading state
function DriverDetailsSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-48" />
          </div>
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
