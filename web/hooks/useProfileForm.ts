import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/store"
import { updateUser } from "@/store/slices/userSlice"
import { toast } from "sonner"
import { ProfileData, VerificationState } from "@/types/Profile"
import { updateMyProfileAPI } from "@/services/user.api"
import { useProfileVerification } from "./useProfileVerification"

export function useProfileForm() {
  const dispatch = useDispatch()
  const { user, loading } = useSelector((state: RootState) => state.user)

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

  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(
    null,
  )
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleVerificationSuccess = (type: "phone" | "email") => {
    setProfile((prev) => ({
      ...prev,
      [`is${type === "phone" ? "Phone" : "Email"}Verified`]: true,
    }))

    // If both are verified or just completed needed verifications, save
    if (
      (type === "phone" && !verification.pendingEmailVerification) ||
      (type === "email" && !profile.isPhoneVerified)
    ) {
      saveProfileData()
    }
  }

  const {
    verification,
    showVerificationDialog,
    setShowVerificationDialog,
    handleSendVerificationCode,
    handleVerifyCode,
    handleResendCode,
    countdown,
    setVerification,
    isSending,
  } = useProfileVerification({
    onVerificationSuccess: handleVerificationSuccess,
  })

  // Load user data from Redux store
  useEffect(() => {
    if (user) {
      const userProfile = {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatarUrl: user.avaterUrl || "",
        isPhoneVerified: user.phoneVerified || false,
        isEmailVerified: user.emailVerified || false,
        bio: user.bio || "",
        location: user.location || "",
        language: "English",
      }
      setProfile(userProfile)
      setOriginalProfile(userProfile)
      setAvatarPreview(user.avaterUrl || "")
    }
  }, [user])

  // Check for changes
  useEffect(() => {
    if (!originalProfile || !isEditing) {
      setHasChanges(false)
      return
    }

    const hasProfileChanges = (
      Object.keys(profile) as Array<keyof ProfileData>
    ).some((key) => {
      if (key === "isPhoneVerified" || key === "isEmailVerified") return false
      return profile[key] !== originalProfile[key]
    })

    const hasAvatarChanges = avatarFile !== null
    setHasChanges(hasProfileChanges || hasAvatarChanges)
  }, [profile, originalProfile, avatarFile, isEditing])

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

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

  const validateProfile = () => {
    // Phone validation
    if (!profile.phone || profile.phone.trim() === "") {
      toast.error("Phone number required!", {
        description: "Please enter your phone number.",
      })
      return false
    }

    const cleanedPhone = profile.phone.replace(/\D/g, "").replace(/^251/, "")
    const phoneRegex = /^(9[1-9]|7[0-9])[0-9]{7}$/

    if (!phoneRegex.test(cleanedPhone)) {
      toast.error("Invalid phone number!", {
        description:
          "Please enter a valid Ethiopian phone number (9x xxx xxxx or 7x xxx xxxx)",
      })
      return false
    }

    // Email validation
    if (!profile.email || profile.email.trim() === "") {
      toast.error("Email required!", {
        description: "Please enter your email address.",
      })
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profile.email)) {
      toast.error("Invalid email address!", {
        description: "Please enter a valid email address",
      })
      return false
    }

    return true
  }
  const phoneVerify = async () => {
    await handleSendVerificationCode("sms", profile.phone, "phone")
  }

  const emailVerify = async () => {
    await handleSendVerificationCode("email", profile.email, "email")
  }

  const handleSave = async () => {
    if (!validateProfile()) return

    const phoneChanged = profile.phone !== user?.phone
    const emailChanged = profile.email !== user?.email

    const needsPhoneVerification = phoneChanged || !profile.isPhoneVerified
    const needsEmailVerification = emailChanged || !profile.isEmailVerified

    // If no changes to verified fields, save directly
    if (!needsPhoneVerification && !needsEmailVerification) {
      await saveProfileData()
      return
    }

    // Start verification process
    if (needsPhoneVerification) {
      await handleSendVerificationCode("sms", profile.phone, "phone")
      if (needsEmailVerification) {
        setVerification((prev) => ({ ...prev, pendingEmailVerification: true }))
      }
    } else if (needsEmailVerification) {
      await handleSendVerificationCode("email", profile.email, "email")
    }
  }

  const saveProfileData = async () => {
    setIsSaving(true)

    try {
      const formData = new FormData()
      formData.append("email", profile.email)
      formData.append("phone", profile.phone)
      formData.append("name", profile.name)
      formData.append("bio", profile.bio || "")
      formData.append("location", profile.location || "")

      if (avatarFile) {
        formData.append("avatar", avatarFile)
      }

      const res = await updateMyProfileAPI(formData)

      dispatch(
        updateUser({
          ...user,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone,
          avaterUrl: res.user.avaterUrl,
          emailVerified: res.user.emailVerified,
          phoneVerified: res.user.phoneVerified,
          bio: res.user.bio,
          location: res.user.location,
        }),
      )

      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview)
      }

      toast.success("Profile updated successfully!")

      setOriginalProfile(profile)
      setAvatarFile(null)
      setIsEditing(false)
    } catch (error: any) {
      toast.error("Failed to update profile", {
        description: error?.response?.data?.message || "Please try again later",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile)
      setAvatarPreview(user?.avaterUrl || "")
      setAvatarFile(null)
    }
    setIsEditing(false)
  }

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

  return {
    profile,
    setProfile,
    avatarPreview,
    setAvatarPreview,
    avatarFile,
    setAvatarFile,
    isEditing,
    setIsEditing,
    isSaving,
    hasChanges,
    loading,
    profileCompletion: profileCompletion(),
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
  }
}
