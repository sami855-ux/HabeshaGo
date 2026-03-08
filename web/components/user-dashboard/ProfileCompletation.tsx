"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  User,
  Shield,
  Smartphone,
  MapPin,
  FileText,
  CheckCircle,
  Sparkles,
  Zap,
  ShieldCheck,
  Target,
  Clock,
  Award,
  Mail,
  Camera,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface ProfileCompletionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileCompletionModal({
  isOpen,
  onClose,
}: ProfileCompletionModalProps) {
  const router = useRouter()

  const handleClose = (open: boolean) => {
    if (!open) {
      onClose()
      router.back() // 👈 redirect where you want
    }
  }
  const handleCompleteProfile = () => {
    router.push("/user/Profile")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="bg-black/20 backdrop-blur-sm z-100" />

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden p-0 border-0 rounded-2xl z-100">
        {/* Modern orange gradient header */}
        <div className="relative w-full h-48 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-12 -translate-y-12 blur-xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-400/20 rounded-full translate-x-20 translate-y-20 blur-xl" />

          <div className="relative h-full flex flex-col items-center justify-center px-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/30"
            >
              <Target className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">
                Action Required
              </span>
            </motion.div>

            <h3 className="text-white font-bold text-2xl md:text-3xl mb-3 text-center">
              Complete Your Profile
            </h3>
            <p className="text-white/90 text-sm text-center max-w-md mx-auto">
              Unlock premium features and enhanced security with a verified
              profile
            </p>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Steps with orange accent */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                Quick Setup Steps
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  icon: User,
                  title: "Personal Details",
                  desc: "Name, contact info & preferences",
                  color: "from-orange-400 to-amber-400",
                  completed: true,
                  time: "1 min",
                },
                {
                  icon: Mail,
                  title: "Email Verification",
                  desc: "Verify your email to secure your account",
                  color: "from-orange-500 to-amber-500",
                  completed: false,
                  time: "1 min",
                },
                {
                  icon: Smartphone,
                  title: "Phone Verification",
                  desc: "Verify your phone to receive booking updates & OTPs",
                  color: "from-amber-500 to-orange-500",
                  completed: false,
                  time: "1 min",
                },
                {
                  icon: Camera,
                  title: "Profile Picture",
                  desc: "Upload a profile photo so staff and other users recognize you",
                  color: "from-orange-600 to-amber-600",
                  completed: false,
                  time: "1 min",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                  className={`
                    relative group cursor-pointer rounded-xl p-4 border
                    ${
                      item.completed
                        ? "border-orange-200 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-900/10 dark:to-amber-900/10 dark:border-orange-800/30"
                        : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 bg-white dark:bg-gray-800/50"
                    }
                    transition-all duration-200 hover:shadow-lg
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                        p-2 rounded-lg bg-gradient-to-br ${item.color} shadow-sm
                        ${item.completed ? "opacity-100" : "opacity-90 group-hover:opacity-100"}
                      `}
                      >
                        <item.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                            {item.title}
                          </h4>
                          {item.completed && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {item.desc}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {item.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!item.completed && (
                      <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-orange-500 transition-colors" />
                    )}
                  </div>

                  {!item.completed && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Time estimate */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Total time: 5 minutes</span>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              Fast & Easy
            </Badge>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-0 flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-400 dark:hover:border-gray-600"
          >
            Complete Later
          </Button>
          <motion.div className="w-full sm:w-auto">
            <Button
              onClick={handleCompleteProfile}
              className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-700 hover:via-amber-700 hover:to-orange-700 text-white cursor-pointer "
            >
              Start Profile Setup
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
