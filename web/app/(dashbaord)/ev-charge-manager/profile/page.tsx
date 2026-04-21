"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Shadcn/ui components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

// Icons
import {
  User,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Camera,
  Save,
  Edit2,
  X,
  CheckCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ProfileFormData {
  name: string
  email: string
  phone: string
  location: string
  bio: string
  role: "Ev Manger"
}

interface UserProfile extends ProfileFormData {
  id: string
  avaterUrl?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProfileFormData, string>>
  >({})

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      bio: "",
      role: "Ev Manger",
    },
  })

  const watchRole = watch("role")

  // Fetch profile data
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        reset({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
          bio: data.bio || "",
          role: data.role || "PASSENGER",
        })
        if (data.avaterUrl) {
          setAvatarPreview(data.avaterUrl)
        }
      } else if (response.status === 401) {
        router.push("/login")
      }
    } catch (error) {
      toast.error("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (data: ProfileFormData): boolean => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {}

    if (data.name && data.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Invalid email address"
    }
    if (data.phone && !/^\+?[0-9]{10,15}$/.test(data.phone)) {
      newErrors.phone = "Invalid phone number"
    }
    if (data.bio && data.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!validateForm(data)) {
      toast.error("Please fix the errors in the form")
      return
    }

    setIsLoading(true)
    try {
      // Upload avatar if selected
      let avatarUrl = profile?.avaterUrl
      if (avatarFile) {
        const formData = new FormData()
        formData.append("avatar", avatarFile)
        const uploadResponse = await fetch("/api/profile/avatar", {
          method: "POST",
          body: formData,
        })
        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json()
          avatarUrl = url
        }
      }

      // Update profile
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, avaterUrl: avatarUrl }),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        toast.success("Profile updated successfully")
        setIsEditing(false)
        setAvatarFile(null)
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to update profile")
      }
    } catch (error) {
      toast.error("An error occurred while updating profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Avatar size must be less than 5MB")
        return
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file")
        return
      }
      setAvatarFile(file)
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setAvatarFile(null)
    setErrors({})
    if (profile) {
      reset({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        location: profile.location || "",
        bio: profile.bio || "",
        role: profile.role || "PASSENGER",
      })
      setAvatarPreview(profile.avaterUrl || "")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800"
      case "DRIVER":
        return "bg-green-100 text-green-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-1">
                Manage your personal information
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Avatar & Role */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-blue-100">
                      <AvatarImage src={avatarPreview || profile?.avaterUrl} />
                      <AvatarFallback className="bg-blue-600 text-white text-2xl">
                        {profile?.name ? (
                          getInitials(profile.name)
                        ) : (
                          <User className="w-12 h-12" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition">
                        <Camera className="w-4 h-4 text-white" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    )}
                  </div>

                  <div className="text-center">
                    <h2 className="text-xl font-semibold">
                      {profile?.name || "Anonymous User"}
                    </h2>
                    <Badge
                      className={`mt-2 ${getRoleBadgeColor(profile?.role || "PASSENGER")}`}
                    >
                      {profile?.role || "Ev Manager"}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="w-full space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="truncate">{profile?.email}</span>
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile?.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Update your personal details below"
                    : "View your profile information"}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        {...register("name")}
                        disabled={!isEditing}
                        placeholder="Enter your full name"
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        disabled={!isEditing}
                        placeholder="Enter your email"
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        disabled={!isEditing}
                        placeholder="+1234567890"
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">{errors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        {...register("location")}
                        disabled={!isEditing}
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      {...register("bio")}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className={errors.bio ? "border-red-500" : ""}
                    />
                    {errors.bio && (
                      <p className="text-sm text-red-500">{errors.bio}</p>
                    )}
                    {watch("bio") && (
                      <p className="text-xs text-gray-500">
                        {watch("bio").length}/500 characters
                      </p>
                    )}
                  </div>
                </CardContent>

                {isEditing && (
                  <CardFooter className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEdit}
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !isDirty}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                )}
              </form>
            </Card>

            {/* Additional Sections */}
            {!isEditing && profile?.bio && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{profile.bio}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
