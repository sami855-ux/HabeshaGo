import {
  User,
  Mail,
  Phone,
  Globe,
  AlertCircle,
  CheckCircle,
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
  return (
    <Card className="border-none shadow-xl bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-gray-800/50">
      <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and contact details
        </CardDescription>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User className="size-4 text-orange-500" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={profile.name}
                      onChange={(e) =>
                        onProfileChange({
                          ...profile,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter your full name"
                      className="border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 dark:border-orange-800"
                    />
                  ) : (
                    <div className="p-2.5 rounded-md border border-orange-100 dark:border-orange-800/50 bg-white/50 dark:bg-gray-800/50">
                      {profile.name || "Not provided"}
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Mail className="size-4 text-orange-500" />
                      Email Address
                    </label>
                    {!profile.isEmailVerified && profile.email && isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onVerifyEmail}
                        className="h-6 px-2 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300"
                      >
                        <Mail className="mr-1 size-3" />
                        Verify
                      </Button>
                    )}
                  </div>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        onProfileChange({
                          ...profile,
                          email: e.target.value,
                          isEmailVerified: false,
                        })
                      }
                      placeholder="you@example.com"
                      className="border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 dark:border-orange-800"
                    />
                  ) : (
                    <div className="p-2.5 rounded-md border border-orange-100 dark:border-orange-800/50 bg-white/50 dark:bg-gray-800/50 flex items-center justify-between">
                      <span>{profile.email || "Not provided"}</span>
                      {profile.isEmailVerified && (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs">
                          <CheckCircle className="mr-1 size-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Phone className="size-4 text-orange-500" />
                      Phone Number
                    </label>
                    {profile.phone && !profile.isPhoneVerified && isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onVerifyPhone}
                        className="h-6 px-2 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300"
                      >
                        <Phone className="mr-1 size-3" />
                        Verify
                      </Button>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <div className="absolute left-3 top-3 flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            +251
                          </span>
                        </div>
                        <Input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => onPhoneChange(e.target.value)}
                          placeholder="91 234 5678"
                          className="pl-16 border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 dark:border-orange-800"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Format: +251 XX XXX XXXX
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-md border border-orange-100 dark:border-orange-800/50 bg-white/50 dark:bg-gray-800/50 flex items-center justify-between">
                      <span>{profile.phone || "Not provided"}</span>
                      {profile.isPhoneVerified && (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs">
                          <CheckCircle className="mr-1 size-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Location Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Globe className="size-4 text-orange-500" />
                    Location
                  </label>
                  {isEditing ? (
                    <Input
                      value={profile.location || ""}
                      onChange={(e) =>
                        onProfileChange({
                          ...profile,
                          location: e.target.value,
                        })
                      }
                      placeholder="Your city or country"
                      className="border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 dark:border-orange-800"
                    />
                  ) : (
                    <div className="p-2.5 rounded-md border border-orange-100 dark:border-orange-800/50 bg-white/50 dark:bg-gray-800/50">
                      {profile.location || "Not provided"}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  About You
                </label>
                {isEditing ? (
                  <Textarea
                    value={profile.bio || ""}
                    onChange={(e) =>
                      onProfileChange({
                        ...profile,
                        bio: e.target.value,
                      })
                    }
                    placeholder="Tell us a little about yourself..."
                    rows={4}
                    className="border-orange-200 focus:border-orange-500 focus:ring-orange-500/20 dark:border-orange-800 resize-none"
                  />
                ) : (
                  <div className="p-3 rounded-md border border-orange-100 dark:border-orange-800/50 bg-white/50 dark:bg-gray-800/50 min-h-[100px]">
                    {profile.bio || "No bio provided"}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="pt-4 border-t border-orange-100 dark:border-orange-800/50">
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <AlertCircle className="size-4" />
                    <span>
                      Unverified email or phone must be verified before saving.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
