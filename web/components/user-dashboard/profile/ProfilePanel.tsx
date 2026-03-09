"use client"

import { useRef } from "react"
import { Edit2, X, Loader2, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProfileCard from "./ProfileCard"
import ProfileForm from "./ProfileForm"
import VerificationDialog from "./VerificationDialog"
import { useProfileForm } from "@/hooks/useProfileForm"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ProfilePanel() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const {
    profile,
    setProfile,
    avatarPreview,
    setAvatarPreview,
    setAvatarFile,
    isEditing,
    setIsEditing,
    isSaving,
    hasChanges,
    loading,
    profileCompletion,
    handlePhoneChange,
    handleSave,
    handleCancel,
    verification,
    showVerificationDialog,
    setShowVerificationDialog,
    handleVerifyCode,
    handleResendCode,
    countdown,
    user,
    setVerification,
    phoneVerify,
    emailVerify,
    isSending,
  } = useProfileForm()

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please select an image file",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Please select an image under 5MB",
      })
      return
    }

    const previewUrl = URL.createObjectURL(file)

    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview)
    }

    setAvatarFile(file)
    setAvatarPreview(previewUrl)
  }

  const handleRemoveAvatar = () => {
    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview)
    }
    setAvatarFile(null)
    setAvatarPreview("")
    setProfile((prev) => ({ ...prev, avatarUrl: "" }))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleAvatarUpload(file)
    }
    event.target.value = ""
  }

  if (loading) {
    return <ProfilePanelSkeleton />
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-full hover:bg-gray-400 bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <div className="">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  My Profile
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your account information and verification
                </p>
              </div>
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
                    onClick={handleCancel}
                    disabled={!hasChanges}
                    className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/20"
                  >
                    <X className="mr-2 size-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50"
                  >
                    {isSaving ? (
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
                profile={{
                  ...profile,
                  avatarUrl: avatarPreview,
                }}
                isEditing={isEditing}
                profileCompletion={profileCompletion}
                onAvatarUpload={handleAvatarUpload}
                onRemoveAvatar={handleRemoveAvatar}
                onTriggerFileInput={() => fileInputRef.current?.click()}
              />

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
                onProfileChange={setProfile}
                onPhoneChange={handlePhoneChange}
                user={user}
                phoneVerify={phoneVerify}
                emailVerify={emailVerify}
              />
            </div>
          </div>

          {/* Verification Dialog */}
          <VerificationDialog
            open={showVerificationDialog}
            onOpenChange={setShowVerificationDialog}
            verification={verification}
            onVerify={handleVerifyCode}
            onResend={handleResendCode}
            onCodeChange={(code) =>
              setVerification((prev) => ({ ...prev, verificationCode: code }))
            }
            countdown={countdown}
            isSending={isSending}
          />
        </div>
      </div>
      <div id="recaptcha-container"></div>
    </>
  )
}

function ProfilePanelSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="flex justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
