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
import { ProfileData, User as UserType } from "@/types/user"

interface ProfileFormProps {
  profile: ProfileData
  isEditing: boolean
  user: UserType | null
  onProfileChange: (profile: ProfileData) => void
  onPhoneChange: (value: string) => void
  onVerifyPhone: () => void
  onVerifyEmail: () => void
  emailVerify: () => void
  phoneVerify: () => void
}

export default function ProfileForm({
  profile,
  isEditing,
  user,
  onProfileChange,
  onPhoneChange,
  onVerifyPhone,
  onVerifyEmail,
  emailVerify,
  phoneVerify,
}: ProfileFormProps) {
  const [phoneInput, setPhoneInput] = useState("")

  useEffect(() => {
    if (profile.phone) {
      const withoutCode = profile.phone.replace("+251", "").trim()
      setPhoneInput(withoutCode)
    } else {
      setPhoneInput("")
    }
  }, [profile.phone])

  /** core logic */
  const showEmailVerified = profile.email && user && user.emailVerified

  const showPhoneVerified = profile.phone && user && user.phoneVerified

  const showEmailVerifyButton = isEditing && profile.email && !showEmailVerified

  const showPhoneVerifyButton = profile.phone && !showPhoneVerified

  console.log(showPhoneVerifyButton)

  const handlePhoneInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "")

      console.log(rawValue, rawValue.length)
      // if (rawValue.length <= 10) {
      setPhoneInput(rawValue)

      const fullNumber = rawValue ? `+251${rawValue}` : ""

      onPhoneChange(fullNumber)

      onProfileChange({
        ...profile,
        phone: fullNumber,
      })
      // }
    },
    [onPhoneChange, onProfileChange, profile],
  )

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    onProfileChange({ ...profile, [name]: value })
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
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
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
                />
              ) : (
                <div className="px-3 py-2 text-sm rounded-md border bg-muted/50">
                  {profile.name || "Not provided"}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email Address
              </label>

              {isEditing ? (
                <div className="relative">
                  <Input
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => {
                      onProfileChange({
                        ...profile,
                        email: e.target.value,
                      })
                    }}
                    placeholder="you@example.com"
                  />

                  {showEmailVerified && (
                    <Badge
                      variant="outline"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-50 text-green-700 border-green-200 gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}

                  {showEmailVerifyButton && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={emailVerify}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100"
                    >
                      <AlertCircle className="mr-1 w-3 h-3" />
                      Verify
                    </Button>
                  )}
                </div>
              ) : (
                <div className="px-3 py-2 text-sm rounded-md border bg-muted/50">
                  {profile.email || "Not provided"}
                  {showEmailVerified && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-green-50 text-green-700 border-green-200"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone Number
              </label>

              {isEditing ? (
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <span className="text-sm text-muted-foreground font-medium">
                      +251
                    </span>
                  </div>

                  <Input
                    value={phoneInput}
                    onChange={handlePhoneInputChange}
                    placeholder="91 234 5678"
                    className="pl-14"
                  />

                  {showPhoneVerified && (
                    <Badge
                      variant="outline"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-50 text-green-700 border-green-200 gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}

                  {showPhoneVerifyButton && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={phoneVerify}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100"
                    >
                      <AlertCircle className="mr-1 w-3 h-3" />
                      Verify
                    </Button>
                  )}
                </div>
              ) : (
                <div className="px-3 py-2 text-sm rounded-md border bg-muted/50">
                  {profile.phone || "Not provided"}
                  {showPhoneVerified && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-green-50 text-green-700 border-green-200"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Location */}
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
                />
              ) : (
                <div className="px-3 py-2 text-sm rounded-md border bg-muted/50">
                  {profile.location || "Not provided"}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
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
              />
            ) : (
              <div className="px-3 py-2 text-sm rounded-md border bg-muted/50 min-h-[100px]">
                {profile.bio || "No bio provided"}
              </div>
            )}
          </div>

          {isEditing && (showEmailVerifyButton || showPhoneVerifyButton) && (
            <div className="p-3 rounded-lg text-sm border bg-amber-50 border-amber-200">
              <p className="font-medium text-amber-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Verification required before saving
              </p>
              <ul className="text-xs mt-1 text-amber-600 list-disc list-inside">
                {showEmailVerifyButton && <li>Email needs verification</li>}
                {showPhoneVerifyButton && <li>Phone needs verification</li>}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
