import {
  User,
  Shield,
  CheckCircle,
  Phone,
  Mail,
  Camera,
  Loader2,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { User as UserType } from "@/types/user"

interface ProfileCardProps {
  user: UserType | null
  profile: {
    name: string
    email: string
    phone: string
    avatarUrl: string
    isPhoneVerified: boolean
    isEmailVerified: boolean
  }
  isEditing: boolean
  isUploading: boolean
  profileCompletion: number
  onAvatarUpload: (file: File) => void
  onRemoveAvatar: () => void
}

export default function ProfileCard({
  user,
  profile,
  isEditing,
  isUploading,
  profileCompletion,
  onAvatarUpload,
  onRemoveAvatar,
}: ProfileCardProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onAvatarUpload(file)
    }
  }

  return (
    <Card className="border-none shadow-xl bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-gray-800/50">
      <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

      <CardHeader className="pb-4">
        <CardTitle className="text-gray-900 dark:text-white">
          Profile Overview
        </CardTitle>
        <CardDescription>Your account information at a glance</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <Avatar className="size-32 border-4 border-white dark:border-gray-800 shadow-lg">
              {profile.avatarUrl ? (
                <AvatarImage
                  src={profile.avatarUrl}
                  alt={profile.name || "Profile"}
                />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-3xl text-orange-600 dark:text-orange-400">
                {profile.name ? (
                  profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                ) : (
                  <User className="size-12" />
                )}
              </AvatarFallback>
            </Avatar>

            {isEditing && (
              <motion.label
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                className="absolute bottom-2 right-2 cursor-pointer p-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:from-orange-600 hover:to-amber-600"
              >
                {isUploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </motion.label>
            )}
          </div>

          {profile.avatarUrl && isEditing && (
            <button
              onClick={onRemoveAvatar}
              className="mt-2 text-sm text-red-600 hover:text-red-700 hover:underline dark:text-red-400"
            >
              Remove Photo
            </button>
          )}
        </div>

        {/* User Role */}
        <div className="text-center">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white capitalize">
            {user?.role?.toLowerCase() || "passenger"}
          </Badge>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Member since {new Date(user?.createdAt || "").toLocaleDateString()}
          </p>
        </div>

        {/* Verification Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30">
                {profile.isPhoneVerified ? (
                  <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Phone className="size-4 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Phone Number
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {profile.isPhoneVerified ? "Verified" : "Not Verified"}
                </div>
              </div>
            </div>
            <Badge
              className={
                profile.isPhoneVerified ? "bg-emerald-500" : "bg-amber-500"
              }
            >
              {profile.isPhoneVerified ? "✓" : "!"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border border-blue-100 dark:border-blue-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                {profile.isEmailVerified ? (
                  <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Mail className="size-4 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Email Address
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {profile.isEmailVerified ? "Verified" : "Not Verified"}
                </div>
              </div>
            </div>
            <Badge
              className={
                profile.isEmailVerified ? "bg-emerald-500" : "bg-amber-500"
              }
            >
              {profile.isEmailVerified ? "✓" : "!"}
            </Badge>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        {user?.twoFactorEnabled && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border border-orange-100 dark:border-orange-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30">
                <Shield className="size-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  2FA Enabled
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Extra security layer
                </div>
              </div>
            </div>
            <Badge className="bg-green-500">Active</Badge>
          </div>
        )}

        {/* Profile Stats */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Profile Completion
              </span>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {profileCompletion}%
              </span>
            </div>
            <Progress
              value={profileCompletion}
              className={cn(
                "h-2 bg-orange-100 dark:bg-orange-900/30",
                "[&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-amber-500",
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
