"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import {
  Upload,
  User,
  IdCard,
  Car,
  AlertCircle,
  Loader2,
  CheckCircle,
  X,
  Shield,
  Building,
  Phone,
  Mail,
  Search,
  Eye,
  FileText,
  Globe,
  Home,
  ArrowLeft,
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form as ShadcnForm,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Custom Components
import { ImageUploader } from "@/components/admin-dashboard/driver/ImageUploader"
import { axiosInstance } from "@/services/axiosInstance"

// Mockup Data
const mockUsers = [
  {
    id: "cmkoh7np700001wh5jspnf9w9",
    name: "Sam Smith",
    email: "samiux85567@gmail.com",
    phone: "251978109304",
    avatarUrl:
      "https://res.cloudinary.com/dxxovha85/image/upload/v1769426727/negari/avatars/mzixz2qj99def69sceuo.png",
    emailVerified: true,
    location: "Addis Ababa",
  },
  {
    id: "user_2",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "251911223344",
    avatarUrl: null,
    emailVerified: true,
    location: "Addis Ababa",
  },
  {
    id: "user_3",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "251922334455",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop",
    emailVerified: false,
    location: "Dire Dawa",
  },
  {
    id: "user_4",
    name: "Mike Johnson",
    email: "mike.j@example.com",
    phone: "251933445566",
    avatarUrl: null,
    emailVerified: true,
    location: "Bahir Dar",
  },
  {
    id: "user_5",
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    phone: "251944556677",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    emailVerified: true,
    location: "Addis Ababa",
  },
]

// Mockup API Functions
const fetchUsers = async (search?: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (!search) {
    return { data: mockUsers }
  }

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search),
  )

  return { data: filteredUsers }
}

// Create driver with FormData
const createDriver = async (formData: FormData) => {
  console.log(formData)
  const response = await axiosInstance.post("/drivers", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  if (response.data.success) {
    toast.success("Driver created successfully!", {
      description: `${response.data.data.licenseNo} has been registered.`,
    })
    console.log(response.data)
    return response.data.data
  } else {
    toast.error("Failed to create driver", {
      description: response.data.message || "Please try again",
    })
    return {}
  }

  // // Log what would be sent
  // const formDataObj: Record<string, any> = {}
  // formData.forEach((value, key) => {
  //   if (value instanceof File) {
  //     formDataObj[key] = {
  //       name: value.name,
  //       type: value.type,
  //       size: value.size,
  //       isFile: true,
  //     }
  //   } else {
  //     formDataObj[key] = value
  //   }
  // })

  // console.log("FormData contents:", formDataObj)

  // // Simulate successful creation
  // return {
  //   driver: {
  //     id: `driver_${Date.now()}`,
  //     licenseNo: formData.get("licenseNo"),
  //     userId: formData.get("userId"),
  //     experience: formData.get("experience"),
  //     idType: formData.get("idType"),
  //     // These URLs would come from your backend after file upload
  //     driverLicenseUrl: `https://cdn.yourapp.com/drivers/${Date.now()}_license.jpg`,
  //     idFrontUrl: `https://cdn.yourapp.com/drivers/${Date.now()}_id_front.jpg`,
  //     idBackUrl: `https://cdn.yourapp.com/drivers/${Date.now()}_id_back.jpg`,
  //   },
  // }
}

// ID Type Enum
enum IdType {
  PASSPORT = "PASSPORT",
  NATIONAL_ID = "NATIONAL_ID",
  KEBELE_ID = "KEBELE_ID",
}

// ID Type Labels
const idTypeLabels = {
  [IdType.NATIONAL_ID]: "National ID",
  [IdType.PASSPORT]: "Passport",
  [IdType.KEBELE_ID]: "Kebele ID",
}

const idTypeIcons = {
  [IdType.NATIONAL_ID]: <Building className="h-4 w-4" />,
  [IdType.PASSPORT]: <Globe className="h-4 w-4" />,
  [IdType.KEBELE_ID]: <Home className="h-4 w-4" />,
}

// Custom file validation schema
const fileSchema = z
  .instanceof(File, { message: "File is required" })
  .refine(
    (file) => {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/pdf",
      ]
      return validTypes.includes(file.type)
    },
    {
      message: "Invalid file type. Please upload JPG, PNG, or PDF files.",
    },
  )
  .refine(
    (file) => {
      const maxSize = 5 * 1024 * 1024 // 5MB
      return file.size <= maxSize
    },
    {
      message: "File size too large. Maximum size is 5MB.",
    },
  )

// Form Schema
const driverFormSchema = z.object({
  userId: z.string({
    required_error: "Please select a user",
  }),
  licenseNo: z
    .string({
      required_error: "License number is required",
    })
    .regex(/^ETH-DL-[A-Z0-9-]+$/, {
      message: "License number must follow ETH-DL-XXXX format",
    }),
  experience: z.coerce
    .number({
      required_error: "Experience is required",
      invalid_type_error: "Experience must be a number",
    })
    .min(0, "Experience cannot be negative")
    .max(50, "Experience cannot exceed 50 years"),
  driverLicenseFile: fileSchema,
  idType: z.nativeEnum(IdType, {
    required_error: "Please select an ID type",
  }),
  idFrontFile: fileSchema,
  idBackFile: fileSchema,
  additionalNotes: z.string().optional(),
})

type DriverFormValues = z.infer<typeof driverFormSchema>

export default function CreateDriverPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isUserSelectOpen, setIsUserSelectOpen] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  )
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({})

  // Fetch users query (using mock data)
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    refetch,
  } = useQuery({
    queryKey: ["users", searchQuery],
    queryFn: () => fetchUsers(searchQuery),
    enabled: isUserSelectOpen,
  })

  const users = usersData?.data || []

  // Form with FormProvider
  const methods = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      userId: "",
      licenseNo: "",
      experience: 0,
      driverLicenseFile: undefined as any, // Will be set when file is uploaded
      idType: IdType.NATIONAL_ID,
      idFrontFile: undefined as any,
      idBackFile: undefined as any,
      additionalNotes: "",
    },
    mode: "onChange",
  })

  const { watch, formState, handleSubmit, setValue, reset } = methods

  // Create driver mutation (now uses FormData)
  const createDriverMutation = useMutation({
    mutationFn: createDriver,
    onSuccess: (data) => {
      toast.success("Driver created successfully!", {
        description: `${data?.licenseNo} has been registered.`,
      })
      reset()
      setSelectedUser(null)
      setFilePreviews({})

      // // Redirect to drivers list
      // setTimeout(() => {
      //   router.push("/admin/drivers")
      // }, 1500)
    },
    onError: (error: Error) => {
      toast.error("Failed to create driver", {
        description: error.message || "Please try again",
      })
    },
  })

  // Handle file upload - stores File object and creates preview
  const handleFileUpload = (
    file: File,
    fieldName: "driverLicenseFile" | "idFrontFile" | "idBackFile",
  ) => {
    try {
      setUploadingFiles((prev) => new Set(prev).add(fieldName))
      setUploadProgress((prev) => ({ ...prev, [fieldName]: 0 }))

      // Create a local preview immediately
      const reader = new FileReader()
      reader.onload = () => {
        // Store preview URL
        setFilePreviews((prev) => ({
          ...prev,
          [fieldName]: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)

      // Store the File object in the form
      setValue(fieldName, file, { shouldValidate: true })

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const current = prev[fieldName] || 0
          const increment = Math.random() * 30
          const newProgress = Math.min(current + increment, 90)
          return { ...prev, [fieldName]: newProgress }
        })
      }, 100)

      // Simulate API upload delay
      setTimeout(() => {
        clearInterval(progressInterval)
        setUploadProgress((prev) => ({ ...prev, [fieldName]: 100 }))

        toast.success("File uploaded successfully")

        setTimeout(() => {
          setUploadingFiles((prev) => {
            const newSet = new Set(prev)
            newSet.delete(fieldName)
            return newSet
          })
          setUploadProgress((prev) => {
            const newProgress = { ...prev }
            delete newProgress[fieldName]
            return newProgress
          })
        }, 500)
      }, 1500)
    } catch (error) {
      toast.error("Failed to upload file", {
        description:
          error instanceof Error ? error.message : "Please try again",
      })
      setUploadingFiles((prev) => {
        const newSet = new Set(prev)
        newSet.delete(fieldName)
        return newSet
      })
    }
  }

  const onSubmit = (data: DriverFormValues) => {
    // Create FormData object for file upload
    const formData = new FormData()

    // Append form fields
    formData.append("userId", data.userId)
    formData.append("licenseNo", data.licenseNo)
    formData.append("experience", data.experience.toString())
    formData.append("idType", data.idType)
    if (data.additionalNotes) {
      formData.append("additionalNotes", data.additionalNotes)
    }

    // Append files - these are the actual File objects
    if (data.driverLicenseFile) {
      formData.append("driverLicense", data.driverLicenseFile)
    }
    if (data.idFrontFile) {
      formData.append("idFront", data.idFrontFile)
    }
    if (data.idBackFile) {
      formData.append("idBack", data.idBackFile)
    }

    console.log("Submitting FormData with files:", {
      userId: data.userId,
      licenseNo: data.licenseNo,
      experience: data.experience,
      idType: data.idType,
      driverLicenseFile: data.driverLicenseFile?.name,
      idFrontFile: data.idFrontFile?.name,
      idBackFile: data.idBackFile?.name,
    })

    createDriverMutation.mutate(formData)
  }

  const handleUserSelect = (user: any) => {
    setValue("userId", user.id, { shouldValidate: true })
    setSelectedUser(user)
    setIsUserSelectOpen(false)
    toast.info("User selected", {
      description: `${user.name} has been selected`,
    })
  }

  // Helper function to get file preview
  const getFilePreview = (
    fieldName: "driverLicenseFile" | "idFrontFile" | "idBackFile",
  ) => {
    return filePreviews[fieldName] || null
  }

  // Get current file from form
  const getCurrentFile = (
    fieldName: "driverLicenseFile" | "idFrontFile" | "idBackFile",
  ) => {
    return watch(fieldName)
  }

  // Load some demo data on component mount for testing
  useEffect(() => {
    // Set some demo data for testing
    setValue("licenseNo", "ETH-DL-2023-458921")
    setValue("experience", 5)
  }, [setValue])

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-3 items-center">
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
            <h1 className="text-3xl font-bold tracking-tight">
              Register New Driver
            </h1>
            <p className="text-muted-foreground">
              Add a new driver to the system with proper verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={createDriverMutation.isPending || !formState.isValid}
            className="relative"
          >
            {createDriverMutation.isPending && (
              <div className="absolute inset-0 bg-primary/50 rounded-md flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
            <CheckCircle className="mr-2 h-4 w-4" />
            Register Driver
          </Button>
        </div>
      </div>

      {/* File Upload Notice */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Files are stored as File objects and will be submitted using FormData
          for proper backend handling.
        </AlertDescription>
      </Alert>

      {/* Wrap entire form content in FormProvider */}
      <FormProvider {...methods}>
        {/* Wrap with Shadcn Form for form context */}
        <ShadcnForm {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Form Tabs */}
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="space-x-2">
                  <User className="h-4 w-4" />
                  <span>Basic Info</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="space-x-2">
                  <IdCard className="h-4 w-4" />
                  <span>Documents</span>
                </TabsTrigger>
                <TabsTrigger value="preview" className="space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Review</span>
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Left Column - User Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle>User Selection</CardTitle>
                      <CardDescription>
                        Select an existing user to register as a driver
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={methods.control}
                        name="userId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select User</FormLabel>
                            <FormControl>
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      placeholder="Search users by name or email..."
                                      value={searchQuery}
                                      onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                      }
                                      onFocus={() => setIsUserSelectOpen(true)}
                                      className="pl-9"
                                      readOnly
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsUserSelectOpen(true)}
                                  >
                                    Browse Users
                                  </Button>
                                </div>

                                {selectedUser && (
                                  <Card className="border-primary/20 bg-primary/5">
                                    <CardContent className="pt-4">
                                      <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-primary">
                                          {selectedUser.avatarUrl ? (
                                            <img
                                              src={selectedUser.avatarUrl}
                                              alt={selectedUser.name}
                                              className="h-full w-full object-cover"
                                            />
                                          ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-primary/10">
                                              <User className="h-6 w-6 text-primary" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <p className="font-semibold truncate">
                                              {selectedUser.name}
                                            </p>
                                            {selectedUser.emailVerified && (
                                              <Badge
                                                variant="default"
                                                className="h-5"
                                              >
                                                Verified
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Mail className="h-3 w-3" />
                                            <span className="truncate">
                                              {selectedUser.email}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Phone className="h-3 w-3" />
                                            <span>{selectedUser.phone}</span>
                                          </div>
                                          <div className="text-xs text-muted-foreground mt-1">
                                            Location: {selectedUser.location}
                                          </div>
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedUser(null)
                                            setValue("userId", "", {
                                              shouldValidate: true,
                                            })
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}

                                {!selectedUser && (
                                  <div className="text-center p-4 border-2 border-dashed rounded-lg">
                                    <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                      No user selected. Click "Browse Users" to
                                      select one.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* User Selection Dialog */}
                      <Dialog
                        open={isUserSelectOpen}
                        onOpenChange={setIsUserSelectOpen}
                      >
                        <DialogContent className="max-w-2xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Select User</DialogTitle>
                            <DialogDescription>
                              Choose a user to register as a driver. Verified
                              users are recommended.
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search users by name, email, or phone..."
                                value={searchQuery}
                                onChange={(e) => {
                                  setSearchQuery(e.target.value)
                                  refetch()
                                }}
                                className="pl-9"
                              />
                            </div>

                            <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                              {isLoadingUsers ? (
                                <div className="flex items-center justify-center p-8">
                                  <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                              ) : users.length > 0 ? (
                                <div className="divide-y">
                                  {users.map((user: any) => (
                                    <button
                                      key={user.id}
                                      className="w-full p-4 hover:bg-muted/50 cursor-pointer transition-colors text-left"
                                      onClick={() => handleUserSelect(user)}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                          {user.avatarUrl ? (
                                            <img
                                              src={user.avatarUrl}
                                              alt={user.name}
                                              className="h-full w-full object-cover"
                                            />
                                          ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-primary/10">
                                              <User className="h-5 w-5 text-primary" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <p className="font-medium truncate">
                                              {user.name}
                                            </p>
                                            {user.emailVerified && (
                                              <Badge
                                                variant="outline"
                                                className="h-5 text-xs"
                                              >
                                                Verified
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="h-3 w-3" />
                                            <span className="truncate">
                                              {user.email}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Phone className="h-3 w-3" />
                                            <span>{user.phone}</span>
                                          </div>
                                          <div className="text-xs text-muted-foreground mt-1">
                                            {user.location}
                                          </div>
                                        </div>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleUserSelect(user)
                                          }}
                                        >
                                          Select
                                        </Button>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                  <p>No users found</p>
                                  <p className="text-sm mt-2">
                                    Try a different search term
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsUserSelectOpen(false)}
                            >
                              Cancel
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Separator />

                      {/* Driver Information */}
                      <FormField
                        control={methods.control}
                        name="licenseNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground font-mono">
                                  ETH-DL-
                                </div>
                                <Input
                                  placeholder="2023-458921"
                                  {...field}
                                  className="font-mono pl-20"
                                  onChange={(e) => {
                                    field.onChange(`ETH-DL-${e.target.value}`)
                                  }}
                                  value={field.value.replace("ETH-DL-", "")}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Must follow ETH-DL-XXXX-XXXX format
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={methods.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="range"
                                  min="0"
                                  max="50"
                                  step="1"
                                  {...field}
                                  className="flex-1"
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value)
                                    field.onChange(value)
                                  }}
                                />
                                <div className="w-16 text-center">
                                  <span className="text-lg font-bold">
                                    {field.value}
                                  </span>
                                  <span className="text-sm text-muted-foreground ml-1">
                                    yrs
                                  </span>
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Drag the slider to set professional driving
                              experience
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Right Column - Additional Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Information</CardTitle>
                      <CardDescription>
                        Provide additional details about the driver
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={methods.control}
                        name="idType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Identification Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select ID type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.values(IdType).map((type) => (
                                  <SelectItem key={type} value={type}>
                                    <div className="flex items-center gap-2">
                                      {idTypeIcons[type]}
                                      {idTypeLabels[type]}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Type of identification document
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={methods.control}
                        name="additionalNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any additional information about the driver...
Example:
- Has experience with electric vehicles
- Speaks multiple languages
- Special training completed"
                                className="min-h-[140px] font-mono text-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Optional notes for internal reference
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          All drivers will be marked as PENDING until their
                          documents are verified by the admin team.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Upload</CardTitle>
                    <CardDescription>
                      Upload required documents for driver verification
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
                            <p className="text-sm text-muted-foreground">
                              Front side with clear details
                            </p>
                          </div>
                          <Badge variant="outline">Required</Badge>
                        </div>

                        <FormField
                          control={methods.control}
                          name="driverLicenseFile"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <ImageUploader
                                  onFileUpload={(file) => {
                                    handleFileUpload(file, "driverLicenseFile")
                                  }}
                                  isUploading={uploadingFiles.has(
                                    "driverLicenseFile",
                                  )}
                                  uploadProgress={
                                    uploadProgress.driverLicenseFile || 0
                                  }
                                  currentImage={getFilePreview(
                                    "driverLicenseFile",
                                  )}
                                  accept="image/*,.pdf"
                                  maxSize={5 * 1024 * 1024} // 5MB
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {getCurrentFile("driverLicenseFile") && (
                          <div className="text-xs text-muted-foreground px-1">
                            File:{" "}
                            <span className="font-medium">
                              {getCurrentFile("driverLicenseFile")?.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ID Front */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              <IdCard className="h-4 w-4" />
                              {watch("idType")
                                ? idTypeLabels[watch("idType") as IdType]
                                : "ID"}{" "}
                              Front
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Clear front side image
                            </p>
                          </div>
                          <Badge variant="outline">Required</Badge>
                        </div>

                        <FormField
                          control={methods.control}
                          name="idFrontFile"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <ImageUploader
                                  onFileUpload={(file) => {
                                    handleFileUpload(file, "idFrontFile")
                                  }}
                                  isUploading={uploadingFiles.has(
                                    "idFrontFile",
                                  )}
                                  uploadProgress={
                                    uploadProgress.idFrontFile || 0
                                  }
                                  currentImage={getFilePreview("idFrontFile")}
                                  accept="image/*,.pdf"
                                  maxSize={5 * 1024 * 1024} // 5MB
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {getCurrentFile("idFrontFile") && (
                          <div className="text-xs text-muted-foreground px-1">
                            File:{" "}
                            <span className="font-medium">
                              {getCurrentFile("idFrontFile")?.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ID Back */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              <IdCard className="h-4 w-4" />
                              {watch("idType")
                                ? idTypeLabels[watch("idType") as IdType]
                                : "ID"}{" "}
                              Back
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Clear back side image
                            </p>
                          </div>
                          <Badge variant="outline">Required</Badge>
                        </div>

                        <FormField
                          control={methods.control}
                          name="idBackFile"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <ImageUploader
                                  onFileUpload={(file) => {
                                    handleFileUpload(file, "idBackFile")
                                  }}
                                  isUploading={uploadingFiles.has("idBackFile")}
                                  uploadProgress={
                                    uploadProgress.idBackFile || 0
                                  }
                                  currentImage={getFilePreview("idBackFile")}
                                  accept="image/*,.pdf"
                                  maxSize={5 * 1024 * 1024} // 5MB
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {getCurrentFile("idBackFile") && (
                          <div className="text-xs text-muted-foreground px-1">
                            File:{" "}
                            <span className="font-medium">
                              {getCurrentFile("idBackFile")?.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-800">
                        <Shield className="h-4 w-4" />
                        Document Requirements
                      </h4>
                      <ul className="space-y-1 text-sm text-blue-700">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          All images must be clear and readable
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          File size should not exceed 5MB per file
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          Accepted formats: JPG, PNG, PDF
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          Make sure all text is visible and not cropped
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Review Tab */}
              <TabsContent value="preview">
                <Card>
                  <CardHeader>
                    <CardTitle>Review & Submit</CardTitle>
                    <CardDescription>
                      Review all information before submitting
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {/* Summary */}
                      <div className="grid gap-6 lg:grid-cols-3">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                              Driver Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <dl className="space-y-3">
                              <div>
                                <dt className="text-xs text-muted-foreground">
                                  Selected User
                                </dt>
                                <dd className="font-medium">
                                  {selectedUser?.name || "No user selected"}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs text-muted-foreground">
                                  License Number
                                </dt>
                                <dd className="font-medium font-mono text-primary">
                                  {watch("licenseNo") || "Not provided"}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs text-muted-foreground">
                                  Experience
                                </dt>
                                <dd className="font-medium">
                                  {watch("experience")} years
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs text-muted-foreground">
                                  ID Type
                                </dt>
                                <dd className="font-medium">
                                  {watch("idType")
                                    ? idTypeLabels[watch("idType") as IdType]
                                    : "Not selected"}
                                </dd>
                              </div>
                            </dl>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                              Document Status
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <dl className="space-y-3">
                              {[
                                {
                                  field: "driverLicenseFile" as const,
                                  label: "Driver's License",
                                },
                                {
                                  field: "idFrontFile" as const,
                                  label: "ID Front",
                                },
                                {
                                  field: "idBackFile" as const,
                                  label: "ID Back",
                                },
                              ].map(({ field, label }) => {
                                const file = getCurrentFile(field)

                                return (
                                  <div
                                    key={field}
                                    className="flex items-center justify-between"
                                  >
                                    <dt className="text-xs text-muted-foreground">
                                      {label}
                                    </dt>
                                    <dd>
                                      {file ? (
                                        <Badge
                                          variant="default"
                                          className="gap-1"
                                        >
                                          <CheckCircle className="h-3 w-3" />
                                          {file.name}
                                        </Badge>
                                      ) : (
                                        <Badge
                                          variant="destructive"
                                          className="gap-1"
                                        >
                                          <AlertCircle className="h-3 w-3" />
                                          Required
                                        </Badge>
                                      )}
                                    </dd>
                                  </div>
                                )
                              })}
                            </dl>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                              Verification Status
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  Initial Status
                                </span>
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-50"
                                >
                                  PENDING
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  Auto-approval
                                </span>
                                <span className="text-xs font-medium">
                                  Disabled
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  Requires Review
                                </span>
                                <span className="text-xs font-medium">Yes</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Document Preview */}
                      <div>
                        <h3 className="font-semibold mb-4">Document Preview</h3>
                        <div className="grid gap-4 lg:grid-cols-3">
                          {[
                            {
                              field: "driverLicenseFile" as const,
                              label: "Driver's License",
                              preview: getFilePreview("driverLicenseFile"),
                            },
                            {
                              field: "idFrontFile" as const,
                              label: watch("idType")
                                ? `${idTypeLabels[watch("idType") as IdType]} Front`
                                : "ID Front",
                              preview: getFilePreview("idFrontFile"),
                            },
                            {
                              field: "idBackFile" as const,
                              label: watch("idType")
                                ? `${idTypeLabels[watch("idType") as IdType]} Back`
                                : "ID Back",
                              preview: getFilePreview("idBackFile"),
                            },
                          ].map(({ field, label, preview }) => {
                            const file = getCurrentFile(field)

                            return (
                              <Card key={field} className="overflow-hidden">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium">
                                    {label}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {file && preview ? (
                                    <div className="aspect-square overflow-hidden rounded-lg border-2 border-primary/20 bg-muted/30">
                                      {file.type === "application/pdf" ? (
                                        <div className="h-full w-full flex flex-col items-center justify-center p-4">
                                          <FileText className="h-12 w-12 text-primary mb-2" />
                                          <p className="text-sm font-medium text-center truncate max-w-full">
                                            {file.name}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            PDF Document
                                          </p>
                                        </div>
                                      ) : (
                                        <img
                                          src={preview}
                                          alt={label}
                                          className="h-full w-full object-contain p-2"
                                        />
                                      )}
                                    </div>
                                  ) : (
                                    <div className="aspect-square flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/10">
                                      <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
                                      <p className="text-sm text-muted-foreground text-center">
                                        No document uploaded
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </div>

                      {/* Submit Section */}
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>File Upload Notice:</strong> Files will be
                          sent as File objects using FormData. This allows
                          proper file upload to your backend API.
                        </AlertDescription>
                      </Alert>

                      <div className="flex items-center justify-between gap-4 pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          <p>Ready to register this driver?</p>
                          <p className="text-xs mt-1">
                            All required fields must be completed before
                            submission.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/admin/drivers")}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={
                              createDriverMutation.isPending ||
                              !formState.isValid
                            }
                            className="min-w-[200px] relative"
                          >
                            {createDriverMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Driver...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Register Driver
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </ShadcnForm>
      </FormProvider>
    </div>
  )
}
