"use client"

import { useState, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/store"
import { updateUser } from "@/store/slices/userSlice"
import { toast } from "sonner"
import { Loader2, Edit2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProfileCard from "@/components/user-dashboard/profile/ProfileCard"
import ProfileForm from "@/components/user-dashboard/profile/ProfileForm"
import VerificationDialog from "@/components/user-dashboard/profile/VerificationDialog"
import { ProfileData, VerificationState } from "@/types/user"
import { updateMyProfileAPI } from "@/services/user.api"

export default function ProfilePanel() {
  const dispatch = useDispatch()
  const { user, loading } = useSelector((state: RootState) => state.user)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    avatarUrl: "",
    bio: "",
    location: "",
    language: "English",
    isPhoneVerified: false,
    isEmailVerified: false,
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Verification State
  const [verification, setVerification] = useState<VerificationState>({
    isVerifying: false,
    verificationCode: "",
    timerActive: false,
    canResend: false,
    attempts: 0,
    verificationMethod: "email",
    currentVerificationType: null,
    tempValue: "",
  })

  const [showVerificationDialog, setShowVerificationDialog] = useState(false)

  // Load user data from Redux store
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatarUrl: user.avaterUrl || "",
        isPhoneVerified: user.phoneVerified,
        isEmailVerified: user.emailVerified,
        bio: user.bio || "",
        location: user.location || "",
        language: "English",
      })
      setAvatarPreview(user.avaterUrl || "")
    }
  }, [user])

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  // Profile completion calculation
  const profileCompletion = () => {
    const fields = [
      profile.name,
      profile.email,
      profile.phone,
      avatarPreview,
      profile.bio,
      profile.location,
    ]
    const completed = fields.filter(
      (field) => field && field.trim() !== "",
    ).length
    return Math.round((completed / fields.length) * 100)
  }

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/\D/g, "")

    if (!cleaned.startsWith("251")) {
      cleaned = "251" + cleaned
    }

    const match = cleaned.match(/^(\d{3})(\d{2})(\d{3})(\d{4})$/)
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`
    }

    const partialMatch = cleaned.match(/^(\d{3})(\d{2})(\d{3})(\d{0,4})$/)
    if (partialMatch) {
      const formatted = `+${partialMatch[1]} ${partialMatch[2]} ${partialMatch[3]}${partialMatch[4] ? " " + partialMatch[4] : ""}`
      return formatted.trim()
    }

    return `+${cleaned}`
  }

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "")

    if (!cleaned.startsWith("251")) {
      const formatted = `+251 ${cleaned.replace("251", "")}`
      setProfile((prev) => ({ ...prev, phone: formatted }))
    } else {
      setProfile((prev) => ({ ...prev, phone: formatPhoneNumber(cleaned) }))
    }
  }

  const handleSaveProfile = async () => {
    // First, ensure phone number is filled and valid
    if (!profile.phone || profile.phone.trim() === "") {
      toast.error("Phone number required!", {
        description: "Please enter your phone number before saving.",
      })
      return
    }

    // Validate phone number format
    const cleanedPhone = profile.phone.replace(/\D/g, "").replace(/^251/, "")
    const phoneRegex = /^(9[1-9]|7[0-9])[0-9]{7}$/

    if (!phoneRegex.test(cleanedPhone)) {
      toast.error("Invalid phone number!", {
        description:
          "Please enter a valid Ethiopian phone number (9x xxx xxxx or 7x xxx xxxx)",
      })
      return
    }

    // Check if email is filled and valid (required for verification)
    if (!profile.email || profile.email.trim() === "") {
      toast.error("Email required!", {
        description:
          "Please enter your email address to receive verification codes.",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profile.email)) {
      toast.error("Invalid email address!", {
        description: "Please enter a valid email address",
      })
      return
    }

    // Determine what needs verification
    const phoneChanged = profile.phone !== user?.phone
    const emailChanged = profile.email !== user?.email

    const needsPhoneVerification = phoneChanged || !profile.isPhoneVerified
    const needsEmailVerification = emailChanged || !profile.isEmailVerified

    const needsAnyVerification =
      needsPhoneVerification || needsEmailVerification

    if (!needsAnyVerification) {
      // If nothing needs verification, save directly
      await saveProfileData()
      return
    }

    // Show what needs verification
    if (needsPhoneVerification && needsEmailVerification) {
      toast.info("Phone & Email verification required", {
        description: "We'll verify your phone number first, then your email.",
        duration: 4000,
      })

      // Start with phone verification
      setVerification((prev) => ({
        ...prev,
        currentVerificationType: "phone",
        pendingEmailVerification: needsEmailVerification,
        tempValue: profile.phone,
      }))
    } else if (needsPhoneVerification) {
      setVerification((prev) => ({
        ...prev,
        currentVerificationType: "phone",
        pendingEmailVerification: false,
        tempValue: profile.phone,
      }))
    } else if (needsEmailVerification) {
      setVerification((prev) => ({
        ...prev,
        currentVerificationType: "email",
        pendingEmailVerification: false,
        tempValue: profile.email,
      }))
    }

    // Always send verification code via email
    handleSendVerificationCode("email")
  }

  const saveProfileData = async () => {
    setIsLoading(true)

    try {
      // Prepare form data for file upload
      const formData = new FormData()

      // Add text fields
      formData.append("email", profile.email)
      formData.append("phone", profile.phone.replace(/\D/g, ""))
      formData.append("name", profile.name)
      formData.append("bio", profile.bio || "")
      formData.append("location", profile.location || "")

      // Add avatar file if exists
      if (avatarFile) {
        formData.append("avatar", avatarFile)
      }

      // 🔹 Call backend with FormData
      const res = await updateMyProfileAPI(formData)

      // 🔹 Update Redux store with backend response
      dispatch(
        updateUser({
          ...user,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone,
          avaterUrl: res.user.avaterUrl,
          emailVerified: res.user.emailVerified,
          phoneVerified: res.user.phoneVerified,
        }),
      )

      // Clean up temporary preview URL
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview)
      }

      toast.success("Profile updated successfully!", {
        description: "Your profile information has been saved.",
      })
    } catch (error: any) {
      console.error("Save profile error:", error)

      toast.error("Failed to update profile", {
        description: error?.response?.data?.message || "Please try again later",
      })
    } finally {
      setIsLoading(false)
      setIsEditing(false)
    }
  }

  const handleSendVerificationCode = async (
    method: "sms" | "call" | "email" = "email",
  ) => {
    setVerification((prev) => ({
      ...prev,
      verificationMethod: method,
      timerActive: true,
      canResend: false,
      attempts: 0,
      verificationCode: "",
    }))

    setShowVerificationDialog(true)

    // Simulate sending verification code via email
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const verificationType =
      verification.currentVerificationType === "phone"
        ? "phone number"
        : "email address"

    toast.success(`Verification code sent to your ${verificationType}`, {
      description: `Enter the 6-digit code sent to ${verificationType === "email address" ? profile.email : profile.phone} to verify your ${verificationType}`,
    })
  }

  const handleVerifyCode = async () => {
    if (verification.verificationCode.length !== 6) {
      toast.error("Invalid code!", {
        description: "Please enter the complete 6-digit code",
      })
      return
    }

    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Mock verification - in real app, validate with backend
    if (verification.verificationCode === "123456") {
      // Update verification status based on what we're verifying
      if (verification.currentVerificationType === "phone") {
        setProfile((prev) => ({
          ...prev,
          isPhoneVerified: true,
        }))
      } else if (verification.currentVerificationType === "email") {
        setProfile((prev) => ({
          ...prev,
          isEmailVerified: true,
        }))
      }

      setVerification((prev) => ({
        ...prev,
        timerActive: false,
      }))

      const verifiedType =
        verification.currentVerificationType === "phone"
          ? "phone number"
          : "email address"

      toast.success(`${verifiedType} verified successfully!`, {
        description: `Your ${verifiedType} has been verified and will be saved.`,
      })

      setShowVerificationDialog(false)

      // Save profile after verification
      await saveProfileData()
    } else {
      const newAttempts = verification.attempts + 1
      setVerification((prev) => ({
        ...prev,
        attempts: newAttempts,
        verificationCode: "",
      }))

      if (newAttempts >= 3) {
        toast.error("Too many attempts!", {
          description: "Please request a new code",
        })
        setVerification((prev) => ({
          ...prev,
          timerActive: false,
          canResend: true,
        }))
      } else {
        toast.error("Invalid code!", {
          description: `Attempt ${newAttempts} of 3`,
        })
      }
    }
  }

  const handleResendCode = async () => {
    await handleSendVerificationCode(verification.verificationMethod)
  }

  const handleAvatarUpload = async (file: File) => {
    setIsUploading(true)

    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type", {
          description: "Please select an image file",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please select an image under 5MB",
        })
        return
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)

      // Clean up old preview if it was a blob URL
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview)
      }

      setAvatarFile(file)
      setAvatarPreview(previewUrl)

      toast.success("Profile picture selected!", {
        description: "Click Save Changes to upload your new profile picture.",
      })
    } catch (error) {
      toast.error("Failed to process image", {
        description: "Please try again",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = () => {
    // Clean up preview URL if it was a blob URL
    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview)
    }

    setAvatarFile(null)
    setAvatarPreview("")

    // Also clear the avatarUrl in profile for form state
    setProfile((prev) => ({ ...prev, avatarUrl: "" }))

    toast.info("Profile picture removed", {
      description: "You can upload a new picture anytime.",
    })
  }

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleAvatarUpload(file)
    }
    // Reset file input to allow selecting same file again
    event.target.value = ""
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reset to original user data
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatarUrl: user.avaterUrl || "",
        isPhoneVerified: user.phoneVerified,
        isEmailVerified: user.emailVerified,
        bio: user.bio || "",
        location: user.location || "",
        language: "English",
      })

      // Clean up any temporary preview URLs
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview)
      }

      setAvatarFile(null)
      setAvatarPreview(user.avaterUrl || "")
    }
  }

  // Show loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your account information and verification
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                <Edit2 className="mr-2 size-4" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/20"
                >
                  <X className="mr-2 size-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <ProfileCard
              user={user}
              profile={{
                ...profile,
                avatarUrl: avatarPreview, // Use preview URL for display
              }}
              isEditing={isEditing}
              isUploading={isUploading}
              profileCompletion={profileCompletion()}
              onAvatarUpload={handleAvatarUpload}
              onRemoveAvatar={handleRemoveAvatar}
            />

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <ProfileForm
              profile={profile}
              isEditing={isEditing}
              user={user}
              onProfileChange={setProfile}
              onPhoneChange={handlePhoneChange}
              onVerifyPhone={() => {
                setVerification((prev) => ({
                  ...prev,
                  currentVerificationType: "phone",
                  tempValue: profile.phone,
                }))
                handleSendVerificationCode("email") // Always use email for phone verification
              }}
              onVerifyEmail={() => {
                setVerification((prev) => ({
                  ...prev,
                  currentVerificationType: "email",
                  tempValue: profile.email,
                }))
                handleSendVerificationCode("email")
              }}
            />
          </div>
        </div>

        {/* Verification Dialog */}
        <VerificationDialog
          open={showVerificationDialog}
          onOpenChange={setShowVerificationDialog}
          verification={verification}
          onVerifyCode={handleVerifyCode}
          onResendCode={handleResendCode}
          onVerificationCodeChange={(code) =>
            setVerification((prev) => ({ ...prev, verificationCode: code }))
          }
          profileEmail={profile.email} // Pass email to show in dialog
        />
      </div>
    </div>
  )
}
