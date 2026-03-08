"use client"

import { useCallback, useEffect, useState } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Pencil,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { ProfileData, User as UserType } from "@/types/user"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ProfileFormProps {
  profile: ProfileData
  isEditing: boolean
  user: UserType | null
  onProfileChange: (profile: ProfileData) => void
  onPhoneChange: (value: string) => void
  onVerifyPhone: () => void
  onVerifyEmail: () => void
}

export default function ProfileForm({
  profile,
  isEditing,
  user,
  onProfileChange,
  onPhoneChange,
  onVerifyPhone,
  onVerifyEmail,
}: ProfileFormProps) {
  const [phoneInput, setPhoneInput] = useState("")
  const [emailChanged, setEmailChanged] = useState(false)
  const [phoneChanged, setPhoneChanged] = useState(false)

  // Initialize phone input without country code
  useEffect(() => {
    if (profile.phone) {
      const withoutCode = profile.phone.replace("+251", "").trim()
      setPhoneInput(withoutCode)
    }
  }, [profile.phone])

  // Track changes
  useEffect(() => {
    if (user) {
      setEmailChanged(profile.email !== user.email)
      setPhoneChanged(profile.phone !== user.phone)
    }
  }, [profile.email, profile.phone, user])

  const handlePhoneInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Get only digits from input
      const rawValue = e.target.value.replace(/\D/g, "")

      // Limit to 9 digits (Ethiopian phone numbers are 9 digits)
      if (rawValue.length <= 9) {
        setPhoneInput(rawValue)

        // Update parent with full number including country code
        const fullNumber = rawValue ? `+251${rawValue}` : ""
        onPhoneChange(fullNumber)
      }
    },
    [onPhoneChange],
  )

  const formatPhoneDisplay = (value: string) => {
    if (!value) return ""

    // Format as: 91 234 5678
    const parts = []
    if (value.length >= 2) {
      parts.push(value.slice(0, 2))
      if (value.length >= 5) {
        parts.push(value.slice(2, 5))
        if (value.length >= 9) {
          parts.push(value.slice(5, 9))
        } else if (value.length > 5) {
          parts.push(value.slice(5))
        }
      } else if (value.length > 2) {
        parts.push(value.slice(2))
      }
    } else {
      parts.push(value)
    }

    return parts.join(" ")
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    onProfileChange({ ...profile, [name]: value })
  }

  const needsEmailVerification = () => {
    return (
      (emailChanged || !profile.isEmailVerified) &&
      profile.email &&
      profile.email.trim() !== ""
    )
  }

  const needsPhoneVerification = () => {
    return (
      (phoneChanged || !profile.isPhoneVerified) &&
      profile.phone &&
      profile.phone.trim() !== ""
    )
  }

  const getFieldStatus = (field: "email" | "phone") => {
    if (!isEditing) return null

    const hasValue =
      field === "email"
        ? profile.email && profile.email.trim() !== ""
        : profile.phone && profile.phone.trim() !== ""

    if (!hasValue) return null

    const isVerified =
      field === "email" ? profile.isEmailVerified : profile.isPhoneVerified

    const isChanged = field === "email" ? emailChanged : phoneChanged

    if (isVerified && !isChanged) {
      return "verified"
    }

    if (!isVerified || isChanged) {
      return "unverified"
    }

    return null
  }

  const FieldWrapper = ({
    children,
    field,
    onVerify,
    verifyLabel,
  }: {
    children: React.ReactNode
    field: "email" | "phone"
    onVerify?: () => void
    verifyLabel?: string
  }) => {
    const status = getFieldStatus(field)
    const showVerifyButton = status === "unverified" && onVerify

    return (
      <div className="relative">
        {children}
        <AnimatePresence>
          {status === "verified" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800 gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </Badge>
            </motion.div>
          )}

          {showVerifyButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onVerify}
                className="h-7 px-2 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50"
              >
                <AlertCircle className="mr-1 w-3 h-3" />
                {verifyLabel || "Verify"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <Card className="border shadow-sm bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Profile Information</CardTitle>
            <CardDescription className="mt-1">
              Update your personal information and contact details
            </CardDescription>
          </div>
          {isEditing && (
            <Badge variant="outline" className="text-xs bg-muted">
              <Pencil className="w-3 h-3 mr-1" />
              Editing mode
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={isEditing ? "edit" : "view"}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-5">
              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={cn(
                        "transition-all",
                        "focus-visible:ring-1 focus-visible:ring-ring",
                      )}
                    />
                  ) : (
                    <div className="px-3 py-2 text-sm rounded-md border bg-muted/50">
                      {profile.name || (
                        <span className="text-muted-foreground italic">
                          Not provided
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email Address
                  </label>
                  <FieldWrapper
                    field="email"
                    onVerify={onVerifyEmail}
                    verifyLabel="Verify email"
                  >
                    {isEditing ? (
                      <Input
                        name="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => {
                          onProfileChange({
                            ...profile,
                            email: e.target.value,
                            isEmailVerified: false,
                          })
                        }}
                        placeholder="you@example.com"
                        className={cn(
                          "transition-all pr-24",
                          "focus-visible:ring-1 focus-visible:ring-ring",
                        )}
                      />
                    ) : (
                      <div className="px-3 py-2 text-sm rounded-md border bg-muted/50">
                        {profile.email || (
                          <span className="text-muted-foreground italic">
                            Not provided
                          </span>
                        )}
                      </div>
                    )}
                  </FieldWrapper>
                  {isEditing && needsEmailVerification() && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ Email needs verification
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Phone Number
                  </label>
                  <FieldWrapper
                    field="phone"
                    onVerify={onVerifyPhone}
                    verifyLabel="Verify phone"
                  >
                    {isEditing ? (
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                          <span className="text-sm text-muted-foreground font-medium">
                            +251
                          </span>
                        </div>
                        <Input
                          value={phoneInput}
                          onChange={handlePhoneInputChange}
                          placeholder="91 234 5678"
                          className={cn(
                            "pl-14 transition-all",
                            "focus-visible:ring-1 focus-visible:ring-ring",
                          )}
                        />
                      </div>
                    ) : (
                      <div className="px-3 py-2 text-sm rounded-md border bg-muted/50">
                        {profile.phone || (
                          <span className="text-muted-foreground italic">
                            Not provided
                          </span>
                        )}
                      </div>
                    )}
                  </FieldWrapper>
                  {isEditing && needsPhoneVerification() && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ Phone number needs verification
                    </p>
                  )}
                </div>

                {/* Location Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Location
                  </label>
                  {isEditing ? (
                    <Input
                      name="location"
                      value={profile.location || ""}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className={cn(
                        "transition-all",
                        "focus-visible:ring-1 focus-visible:ring-ring",
                      )}
                    />
                  ) : (
                    <div className="px-3 py-2 text-sm rounded-md border bg-muted/50">
                      {profile.location || (
                        <span className="text-muted-foreground italic">
                          Not provided
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">
                  About You
                </label>
                {isEditing ? (
                  <Textarea
                    name="bio"
                    value={profile.bio || ""}
                    onChange={handleChange}
                    placeholder="Tell us a little about yourself..."
                    rows={4}
                    className={cn(
                      "resize-none transition-all",
                      "focus-visible:ring-1 focus-visible:ring-ring",
                    )}
                  />
                ) : (
                  <div className="px-3 py-2 text-sm rounded-md border bg-muted/50 min-h-[100px]">
                    {profile.bio || (
                      <span className="text-muted-foreground italic">
                        No bio provided
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Verification Status Summary */}
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex items-start gap-2 p-3 rounded-lg text-sm border",
                    needsEmailVerification() || needsPhoneVerification()
                      ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                      : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
                  )}
                >
                  {needsEmailVerification() || needsPhoneVerification() ? (
                    <>
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                      <div className="text-amber-700 dark:text-amber-400">
                        <p className="font-medium">
                          Verification required before saving
                        </p>
                        <ul className="text-xs mt-1 list-disc list-inside opacity-90">
                          {needsEmailVerification() && (
                            <li>
                              Email {emailChanged ? "changed" : "not verified"}
                            </li>
                          )}
                          {needsPhoneVerification() && (
                            <li>
                              Phone {phoneChanged ? "changed" : "not verified"}
                            </li>
                          )}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
                      <div className="text-green-700 dark:text-green-400">
                        <p className="font-medium">All verified</p>
                        <p className="text-xs mt-0.5 opacity-90">
                          Your contact information is verified and ready to
                          save.
                        </p>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
