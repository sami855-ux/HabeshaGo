"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Camera,
  Headphones,
  X,
  ChevronRight,
  Check,
  Sparkle,
  User2,
  Smartphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

// Inspired by Stripe's dashboard and Vercel's design system
const checklistItems = [
  {
    id: "fullName",
    label: "Full Name",
    description: "Set your full name so we can personalize your bookings",
    icon: User2,
    action: "Add name",
  },
  {
    id: "bio",
    label: "Bio / About You",
    description: "Tell us a little about yourself to improve recommendations",
    icon: User,
    action: "Add bio",
  },
  {
    id: "photo",
    label: "Profile Photo",
    description: "Help staff and other users recognize you",
    icon: Camera,
    action: "Upload photo",
  },
  {
    id: "phoneNumber",
    label: "Phone Number",
    description: "Add your phone number to receive booking updates and OTPs",
    icon: Smartphone,
    action: "Add phone",
  },
]

export function ProfileCompletionDialog() {
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(true)
  const [completed, setCompleted] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // Mock completion - in reality, this would come from your user data
  useEffect(() => {
    // Simulate 40% complete (2 out of 5 items - but we have 3, so adjust)
    // For demo, let's say photo and interests are done
    setCompleted(["photo", "interests"])
  }, [])

  // Compute progress percentage
  useEffect(() => {
    const percentage = (completed.length / checklistItems.length) * 100
    const timer = setTimeout(() => setProgress(percentage), 200)
    return () => clearTimeout(timer)
  }, [completed])

  // Handle dismiss with localStorage
  const handleRemindLater = () => {
    localStorage.setItem("profilePromptDismissed", "true")
    setIsOpen(false)
  }

  // Don't show if previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem("profilePromptDismissed")
    if (dismissed === "true") setIsOpen(false)
  }, [])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center px-6 py-2 z-100"
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
        }}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-3xl" // Wider container
        >
          <Card className="border-0 shadow-2xl overflow-hidden bg-white dark:bg-zinc-900">
            {/* Decorative elements */}

            <CardContent className="relative p-8 py-4">
              {/* Header with user avatar - more personal */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Avatar className="h-16 w-16 border-2 border-white dark:border-zinc-800 shadow-lg">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="User"
                      />
                      <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-500 text-white text-lg">
                        JD
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Complete your profile
                      </h2>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-md">
                        Add these details to unlock personalized features and
                        better connections
                      </p>
                    </motion.div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRemindLater}
                  className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Progress section - more detailed */}
              <div className="mb-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Profile strength
                    </span>
                    <Badge
                      variant={progress === 100 ? "default" : "secondary"}
                      className={`
                        ${
                          progress === 100
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        }
                      `}
                    >
                      {progress === 100
                        ? "Complete"
                        : `${Math.round(progress)}% complete`}
                    </Badge>
                  </div>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {completed.length}/{checklistItems.length} done
                  </span>
                </div>
                <Progress
                  value={progress}
                  className="h-2 bg-zinc-200 dark:bg-zinc-700 [&>div]:bg-orange-500"
                />
              </div>

              {/* Checklist items - more sophisticated layout */}
              <div className="space-y-3 mb-8">
                {checklistItems.map((item) => {
                  const isCompleted = completed.includes(item.id)
                  const isHovered = hoveredItem === item.id
                  const Icon = item.icon

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * checklistItems.indexOf(item) }}
                      onHoverStart={() => setHoveredItem(item.id)}
                      onHoverEnd={() => setHoveredItem(null)}
                      className={`
                        group relative flex items-center gap-4 p-4 rounded-xl
                        transition-all duration-200
                        ${
                          isCompleted
                            ? "bg-zinc-50 dark:bg-zinc-800/50"
                            : "bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800"
                        }
                      `}
                    >
                      {/* Status indicator */}
                      <motion.div
                        animate={{ scale: isHovered ? 1.1 : 1 }}
                        className={`
                          relative flex items-center justify-center w-10 h-10 rounded-xl
                          transition-all duration-200
                          ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/50 dark:group-hover:text-indigo-400"
                          }
                        `}
                      >
                        <Icon size={20} />
                        {isCompleted && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"
                          >
                            <Check size={10} className="text-white" />
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                            {item.label}
                          </h3>
                          {!isCompleted && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-4 px-1 border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400"
                            >
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      {/* Action button */}
                      <motion.div
                        animate={{ x: isHovered ? 0 : 5 }}
                        className={`
                          flex items-center gap-1 text-sm font-medium
                          ${
                            isCompleted
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-indigo-600 dark:text-indigo-400"
                          }
                        `}
                      >
                        {isCompleted ? (
                          <span className="flex items-center gap-1">
                            Completed <Check size={14} />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            {item.action}{" "}
                            <ChevronRight
                              size={14}
                              className={
                                isHovered
                                  ? "translate-x-0.5 transition-transform"
                                  : ""
                              }
                            />
                          </span>
                        )}
                      </motion.div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Action buttons - sophisticated layout */}
              <div className="flex items-center gap-4 pt-2">
                <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button
                    size="lg"
                    className="w-full bg-linear-to-r cursor-pointer from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium py-6 text-base shadow-lg hover:shadow-xl transition-all"
                    onClick={() => {
                      //   window.location.href = "/settings/profile"
                      router.push("/user/Profile")
                    }}
                  >
                    Continue setup
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 py-6 px-8 text-base hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    onClick={handleRemindLater}
                  >
                    Later
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
