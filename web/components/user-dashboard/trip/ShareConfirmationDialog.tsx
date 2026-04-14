"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Loader2,
  Share2,
  Ticket,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ShareConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedUser: any | null
  ticketData: any
  isSharing: boolean
  onConfirm: () => void
  showSuccess: boolean
  shareError?: string | null
}

export function ShareConfirmationDialog({
  open,
  onOpenChange,
  selectedUser,
  ticketData,
  isSharing,
  onConfirm,
  showSuccess,
  shareError,
}: ShareConfirmationDialogProps) {
  const allTickets = ticketData.tickets || []

  // Get boarding and alighting stops (use first ticket as reference)
  const boardingStop = allTickets[0]?.boardingStop || "Unknown"
  const alightingStop = allTickets[0]?.alightingStop || "Unknown"

  // Extract origin and destination from stops
  const origin = boardingStop
  const destination = alightingStop

  const bus = ticketData.bus
  const route = bus?.route

  // Custom handler for onOpenChange that prevents closing while sharing
  const handleOpenChange = (newOpen: boolean) => {
    // Only allow closing if not sharing and not showing success
    if (!isSharing && !showSuccess) {
      onOpenChange(newOpen)
    }
    // If sharing or showing success, do nothing - dialog stays open
  }

  // Determine which state to show
  const getDialogContent = () => {
    if (isSharing) {
      if (showSuccess) {
        return "success"
      } else if (shareError) {
        return "error"
      } else {
        return "loading"
      }
    }
    return "confirmation"
  }

  const contentState = getDialogContent()

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="rounded-3xl max-w-md p-0 overflow-hidden border-0 shadow-2xl">
        <AnimatePresence mode="wait">
          {/* Loading State */}
          {contentState === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-to-br from-orange-500 to-amber-600 p-8"
            >
              <div className="flex flex-col items-center justify-center min-h-[350px] text-white">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mb-6"
                >
                  <div className="relative">
                    <Loader2 className="h-20 w-20" />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 rounded-full bg-white/20"
                    />
                  </div>
                </motion.div>

                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold mb-2 text-center"
                >
                  Sharing Ticket
                </motion.h3>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-orange-100 text-center mb-6 max-w-[250px]"
                >
                  Please wait while we securely share your ticket with{" "}
                  {selectedUser?.name?.split(" ")[0]}
                </motion.p>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 1.5, repeat: Infinity }}
                  className="w-48 h-1.5 bg-white/30 rounded-full overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-white"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center gap-2 mt-6 text-xs text-orange-200"
                >
                  <div className="w-1 h-1 bg-orange-200 rounded-full" />
                  <span>Don't close this window</span>
                  <div className="w-1 h-1 bg-orange-200 rounded-full" />
                </motion.div>

                {/* Animated dots */}
                <motion.div className="flex gap-1 mt-3">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 bg-white rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {contentState === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 p-8"
            >
              <div className="flex flex-col items-center justify-center min-h-[350px] text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mb-6"
                >
                  <div className="relative">
                    <CheckCircle2 className="h-20 w-20" />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="absolute inset-0 rounded-full bg-white/30"
                    />
                  </div>
                </motion.div>

                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold mb-2 text-center"
                >
                  Shared Successfully! 🎉
                </motion.h3>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-green-100 text-center mb-4"
                >
                  Ticket has been shared with {selectedUser?.name}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/20 rounded-xl p-3 w-full max-w-[250px] mb-6"
                >
                  <div className="text-xs text-green-100 mb-1">Route</div>
                  <div className="text-sm font-semibold">
                    {origin} → {destination}
                  </div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xs text-green-200"
                >
                  Redirecting to trips...
                </motion.p>

                {/* Confetti-like animation */}
                <motion.div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      initial={{
                        x: "50%",
                        y: "50%",
                        scale: 0,
                      }}
                      animate={{
                        x: `${Math.random() * 200 - 100}%`,
                        y: `${Math.random() * 200 - 100}%`,
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1,
                        delay: i * 0.05,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {contentState === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-red-500 to-rose-600 p-8"
            >
              <div className="flex flex-col items-center justify-center min-h-[350px] text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mb-6"
                >
                  <XCircle className="h-20 w-20" />
                </motion.div>

                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold mb-2 text-center"
                >
                  Share Failed
                </motion.h3>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-red-100 text-center mb-6"
                >
                  {shareError || "Unable to share ticket. Please try again."}
                </motion.p>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => onOpenChange(false)}
                  className="px-6 py-2 bg-white text-red-600 rounded-full font-semibold hover:bg-red-50 transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Confirmation State */}
          {contentState === "confirmation" && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <AlertDialogHeader>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mb-4"
                >
                  <Share2 className="h-10 w-10 text-orange-600" />
                </motion.div>

                <AlertDialogTitle className="text-center text-2xl font-bold text-gray-900 dark:text-white">
                  Confirm Share
                </AlertDialogTitle>

                <AlertDialogDescription className="text-center text-gray-600 dark:text-gray-400">
                  Are you sure you want to share this ticket with{" "}
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {selectedUser?.name}
                  </span>
                  ? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl p-4 my-4 border border-orange-100 dark:border-orange-800"
              >
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-orange-100 dark:border-orange-800">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Ticket className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      Route
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {origin} → {destination}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <User className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      Recipient
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {selectedUser?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedUser?.phone}
                    </p>
                  </div>
                </div>
              </motion.div>

              <AlertDialogFooter className="flex gap-3 sm:justify-center">
                <AlertDialogCancel
                  disabled={isSharing}
                  className={cn(
                    "rounded-full px-8 h-12 transition-all border-2 hover:bg-gray-100 dark:hover:bg-gray-800",
                    isSharing && "opacity-50 cursor-not-allowed",
                  )}
                >
                  Cancel
                </AlertDialogCancel>
                {/* // In the confirmation state section of your dialog, update the AlertDialogAction: */}
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault() // Prevent default behavior
                    onConfirm() // Call the handleShare function
                  }}
                  disabled={isSharing}
                  className={cn(
                    "rounded-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-8 h-12 transition-all shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30",
                    isSharing && "opacity-50 cursor-not-allowed",
                  )}
                >
                  Yes, Share Ticket
                </AlertDialogAction>
              </AlertDialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </AlertDialogContent>
    </AlertDialog>
  )
}
