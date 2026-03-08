"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import {
  ArrowLeft,
  Loader2,
  Save,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Car,
  IdCard,
  AlertCircle,
  X,
  CheckCircle,
  Calendar,
  Shield,
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

import { fetchDriverById } from "@/services/driver.api"
import { axiosInstance } from "@/services/axiosInstance"
import axios from "axios"

// Types
enum Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
}

enum VerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

enum IdType {
  PASSPORT = "PASSPORT",
  NATIONAL_ID = "NATIONAL_ID",
  KEBELE_ID = "KEBELE_ID",
  DRIVING_LICENSE = "DRIVING_LICENSE",
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
  user: {
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
  vehicle: {
    id: string
    plateNumber: string
    model: string
    brand: string
    year: number
    color: string
    capacity: number
    vehicleType: string
    status: string
  } | null
}

// Form Schema
const driverFormSchema = z.object({
  // User Information
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  bio: z.string().optional(),

  // Driver Information
  licenseNo: z.string().min(5, "License number must be at least 5 characters"),
  experience: z.coerce.number().min(0).max(50).optional(),
  status: z.nativeEnum(Status),
  isOnDuty: z.boolean().default(false),

  // Verification Information
  idType: z
    .nativeEnum(IdType)
    .or(z.literal("NOT_PROVIDED"))
    .optional()
    .nullable(),

  // Vehicle Assignment
  vehicleId: z.string().or(z.literal("NO_VEHICLE")).optional().nullable(),
})

type DriverFormValues = z.infer<typeof driverFormSchema>

// API Functions
const updateDriver = async (
  driverId: string,
  data: Partial<DriverFormValues>,
) => {
  return {}
}

const uploadDocument = async (
  driverId: string,
  file: File,
  type: "license" | "id_front" | "id_back" | "avatar",
) => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("type", type)

  return {}
}

const fetchAvailableVehicles = async () => {
  return {}
}

// Helper functions
const getStatusConfig = (status: Status) => {
  const configs = {
    [Status.ACTIVE]: {
      label: "Active",
      variant: "default" as const,
      color: "bg-green-500",
    },
    [Status.INACTIVE]: {
      label: "Inactive",
      variant: "secondary" as const,
      color: "bg-gray-500",
    },
    [Status.SUSPENDED]: {
      label: "Suspended",
      variant: "destructive" as const,
      color: "bg-red-500",
    },
    [Status.PENDING]: {
      label: "Pending",
      variant: "outline" as const,
      color: "bg-yellow-500",
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

export default function EditDriverPage() {
  const params = useParams()
  const router = useRouter()
  const driverId = params.driverId as string

  const [isUploading, setIsUploading] = useState(false)
  const [uploadType, setUploadType] = useState<
    "license" | "id_front" | "id_back" | "avatar" | null
  >(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch driver data
  const {
    data: driverResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["driver", driverId],
    queryFn: () => fetchDriverById(driverId),
    enabled: !!driverId,
  })

  const driver = driverResponse

  // Fetch available vehicles
  const { data: vehiclesResponse } = useQuery({
    queryKey: ["available-vehicles"],
    queryFn: fetchAvailableVehicles,
  })

  const availableVehicles = vehiclesResponse?.data || []

  // Initialize form
  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      bio: "",
      licenseNo: "",
      experience: 0,
      status: Status.PENDING,
      isOnDuty: false,
      idType: "NOT_PROVIDED",
      vehicleId: "NO_VEHICLE",
    },
  })

  // Update form when driver data loads
  useEffect(() => {
    if (driver) {
      form.reset({
        name: driver.user.name,
        email: driver.user.email,
        phone: driver.user.phone,
        location: driver.user.location || "",
        bio: driver.user.bio || "",
        licenseNo: driver.licenseNo || "",
        experience: driver.experience || 0,
        status: driver.status,
        isOnDuty: driver.isOnDuty,
        idType: driver.idType || "NOT_PROVIDED",
        vehicleId: driver.vehicle?.id || "NO_VEHICLE",
      })
    }
  }, [driver, form])

  // Mutations
  const updateDriverMutation = useMutation({
    mutationFn: (data: Partial<DriverFormValues>) =>
      updateDriver(driverId, data),
    onSuccess: () => {
      toast.success("Driver updated successfully")
      refetch()
    },
    onError: (error: Error) => {
      toast.error("Failed to update driver", {
        description: error.message,
      })
    },
  })

  const uploadMutation = useMutation({
    mutationFn: ({ file, type }: { file: File; type: typeof uploadType }) => {
      if (!type) throw new Error("Upload type required")
      return uploadDocument(driverId, file, type)
    },
    onSuccess: (response, variables) => {
      toast.success("File uploaded successfully")
      refetch()

      // Update form based on upload type
      if (variables.type === "avatar") {
        // Avatar URL would be in user object, need to refresh
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to upload file", {
        description: error.message,
      })
    },
    onSettled: () => {
      setIsUploading(false)
      setUploadType(null)
    },
  })

  // Form submission
  const onSubmit = (data: DriverFormValues) => {
    // Convert special values back to null for API
    const apiData = {
      ...data,
      idType: data.idType === "NOT_PROVIDED" ? null : data.idType,
      vehicleId: data.vehicleId === "NO_VEHICLE" ? null : data.vehicleId,
    }
    updateDriverMutation.mutate(apiData)
  }

  // File upload handler
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: typeof uploadType,
  ) => {
    const file = event.target.files?.[0]
    if (!file || !type) return

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Maximum file size is 5MB",
      })
      return
    }

    // Validate file type
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ]
    if (!validImageTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload JPEG, PNG, or PDF files only",
      })
      return
    }

    setIsUploading(true)
    uploadMutation.mutate({ file, type })
  }

  // Delete document handler
  const handleDeleteDocument = async (
    type: "license" | "id_front" | "id_back",
  ) => {
    try {
      await axiosInstance.delete(
        `/api/admin/drivers/${driverId}/documents/${type}`,
      )
      toast.success("Document deleted successfully")
      refetch()
    } catch (error) {
      toast.error("Failed to delete document")
    }
  }

  // Handle delete driver
  const handleDeleteDriver = async () => {
    try {
      await axios.delete(`/api/admin/drivers/${driverId}`)
      toast.success("Driver deleted successfully")
      router.push("/admin/drivers")
    } catch (error) {
      toast.error("Failed to delete driver")
    } finally {
      setShowDeleteConfirm(false)
    }
  }

  if (isLoading) {
    return <EditDriverSkeleton />
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="-ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Driver</h1>
            <p className="text-muted-foreground">
              Update driver information and documents
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/drivers/${driverId}`)}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateDriverMutation.isPending}
          >
            {updateDriverMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Avatar and Status */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Picture</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                      <div className="relative">
                        <div className="h-32 w-32 rounded-full overflow-hidden bg-muted">
                          {driver.user.avatarUrl ? (
                            <Image
                              src={driver.user.avatarUrl}
                              alt={driver.user.name}
                              className="h-full w-full object-cover"
                              width={128}
                              height={128}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary/10">
                              <User className="h-16 w-16 text-primary" />
                            </div>
                          )}
                        </div>
                        <label
                          htmlFor="avatar-upload"
                          className="absolute bottom-0 right-0"
                        >
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full"
                            type="button"
                            onClick={() => setUploadType("avatar")}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <input
                            id="avatar-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "avatar")}
                          />
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4 text-center">
                        Upload a clear photo of the driver
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Driver Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.values(Status).map((status) => {
                                  const config = getStatusConfig(status)
                                  return (
                                    <SelectItem key={status} value={status}>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`h-2 w-2 rounded-full ${config.color}`}
                                        />
                                        {config.label}
                                      </div>
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isOnDuty"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>On Duty</FormLabel>
                              <FormDescription>
                                Mark driver as currently on duty
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Rating</span>
                          <Badge variant="outline" className="gap-1">
                            <span className="font-semibold">
                              {driver.rating.toFixed(1)}
                            </span>
                            <span className="text-muted-foreground">/5.0</span>
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Total Trips
                          </span>
                          <span className="font-medium">
                            {driver.totalTrips}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Joined</span>
                          <span className="text-sm">
                            {new Date(driver.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Form Fields */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update driver's personal details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Full Name
                                </div>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  Email
                                </div>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="john@example.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                {driver.user.emailVerified ? (
                                  <span className="text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Verified
                                  </span>
                                ) : (
                                  <span className="text-yellow-600">
                                    Not verified
                                  </span>
                                )}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  Phone Number
                                </div>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="+251 912 345 678"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                {driver.user.phoneVerified ? (
                                  <span className="text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Verified
                                  </span>
                                ) : (
                                  <span className="text-yellow-600">
                                    Not verified
                                  </span>
                                )}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  Location
                                </div>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Addis Ababa" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us about the driver's experience..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Brief description of driver's experience and
                              qualifications
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Driver Information</CardTitle>
                      <CardDescription>
                        Update driver's professional details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="licenseNo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <div className="flex items-center gap-2">
                                  <IdCard className="h-4 w-4" />
                                  License Number
                                </div>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="ETH-DL-2023-123456"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  Experience (years)
                                </div>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max="50"
                                  placeholder="5"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="idType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || "NOT_PROVIDED"}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ID type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="NOT_PROVIDED">
                                  Not Provided
                                </SelectItem>
                                {Object.values(IdType).map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {getIdTypeLabel(type)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>
                    Upload and manage driver documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 lg:grid-cols-3">
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
                              variant={
                                driver.licenseStatus ===
                                VerificationStatus.APPROVED
                                  ? "default"
                                  : driver.licenseStatus ===
                                      VerificationStatus.REJECTED
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {driver.licenseStatus.toLowerCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {driver.driverLicenseUrl ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  window.open(
                                    driver.driverLicenseUrl!,
                                    "_blank",
                                  )
                                }
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteDocument("license")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <label htmlFor="license-upload">
                              <Button size="sm" variant="outline" asChild>
                                <span>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload
                                </span>
                              </Button>
                              <input
                                id="license-upload"
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileUpload(e, "license")}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {driver.driverLicenseUrl ? (
                        <div className="aspect-video rounded-lg border overflow-hidden bg-muted">
                          <img
                            src={driver.driverLicenseUrl}
                            alt="Driver's License"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                          <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
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
                          <h3 className="font-semibold">
                            {getIdTypeLabel(driver.idType)} Front
                          </h3>
                          <div className="mt-1">
                            <Badge
                              variant={
                                driver.idStatus === VerificationStatus.APPROVED
                                  ? "default"
                                  : driver.idStatus ===
                                      VerificationStatus.REJECTED
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {driver.idStatus.toLowerCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {driver.idFrontUrl ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  window.open(driver.idFrontUrl!, "_blank")
                                }
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteDocument("id_front")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <label htmlFor="id-front-upload">
                              <Button size="sm" variant="outline" asChild>
                                <span>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload
                                </span>
                              </Button>
                              <input
                                id="id-front-upload"
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) =>
                                  handleFileUpload(e, "id_front")
                                }
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {driver.idFrontUrl ? (
                        <div className="aspect-video rounded-lg border overflow-hidden bg-muted">
                          <img
                            src={driver.idFrontUrl}
                            alt="ID Front"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                          <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
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
                          <h3 className="font-semibold">
                            {getIdTypeLabel(driver.idType)} Back
                          </h3>
                          <div className="mt-1">
                            <Badge
                              variant={
                                driver.idStatus === VerificationStatus.APPROVED
                                  ? "default"
                                  : driver.idStatus ===
                                      VerificationStatus.REJECTED
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {driver.idStatus.toLowerCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {driver.idBackUrl ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  window.open(driver.idBackUrl!, "_blank")
                                }
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteDocument("id_back")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <label htmlFor="id-back-upload">
                              <Button size="sm" variant="outline" asChild>
                                <span>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload
                                </span>
                              </Button>
                              <input
                                id="id-back-upload"
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileUpload(e, "id_back")}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {driver.idBackUrl ? (
                        <div className="aspect-video rounded-lg border overflow-hidden bg-muted">
                          <img
                            src={driver.idBackUrl}
                            alt="ID Back"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                          <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                            <p className="text-sm text-muted-foreground mt-2">
                              No ID back uploaded
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Alert className="mt-6">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Documents must be clear and legible. Maximum file size is
                      5MB. Supported formats: JPEG, PNG, PDF.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vehicle Tab */}
            <TabsContent value="vehicle">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Assignment</CardTitle>
                  <CardDescription>
                    Assign or change driver's vehicle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Current Vehicle */}
                    {driver.vehicle && (
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold">Current Vehicle</h3>
                          <Badge variant="outline">
                            {driver.vehicle.vehicleType}
                          </Badge>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Plate Number
                            </p>
                            <p className="font-medium">
                              {driver.vehicle.plateNumber}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Model
                            </p>
                            <p className="font-medium">
                              {driver.vehicle.brand} {driver.vehicle.model}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Year
                            </p>
                            <p className="font-medium">{driver.vehicle.year}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Capacity
                            </p>
                            <p className="font-medium">
                              {driver.vehicle.capacity} seats
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Vehicle Selection */}
                    <FormField
                      control={form.control}
                      name="vehicleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign Vehicle</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || "NO_VEHICLE"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a vehicle" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="NO_VEHICLE">
                                No vehicle
                              </SelectItem>
                              {availableVehicles.map((vehicle) => (
                                <SelectItem key={vehicle.id} value={vehicle.id}>
                                  <div className="flex items-center justify-between">
                                    <span>{vehicle.plateNumber}</span>
                                    <span className="text-sm text-muted-foreground ml-4">
                                      {vehicle.brand} {vehicle.model} •{" "}
                                      {vehicle.capacity} seats
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select a vehicle from the available pool
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {availableVehicles.length === 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No available vehicles. All vehicles are currently
                          assigned or under maintenance.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage driver account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-4">Verification Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Verification</p>
                          <p className="text-sm text-muted-foreground">
                            {driver.user.email}
                          </p>
                        </div>
                        {driver.user.emailVerified ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Not Verified
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Phone Verification</p>
                          <p className="text-sm text-muted-foreground">
                            {driver.user.phone}
                          </p>
                        </div>
                        {driver.user.phoneVerified ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Not Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="rounded-lg border border-destructive p-4">
                    <h3 className="font-semibold text-destructive mb-4">
                      Danger Zone
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">Delete Driver Account</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete this driver account and all
                          associated data. This action cannot be undone.
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Delete Driver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Driver</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this driver? This action cannot be
              undone. All driver data including trips and documents will be
              permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDriver}>
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Skeleton component for loading state
function EditDriverSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Skeleton className="h-32 w-32 rounded-full" />
                <Skeleton className="h-4 w-48 mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
