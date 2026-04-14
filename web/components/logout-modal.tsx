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
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { LogOut, RefreshCw } from "lucide-react"

interface LogoutModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  className?: string
}

export function LogoutModal({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading = false,
  title = "Logout Confirmation",
  description = "Are you sure you want to logout? You'll need to sign in again to access your account.",
  confirmText = "Logout",
  cancelText = "Cancel",
  showCancel = true,
  className,
}: LogoutModalProps) {
  const handleCancel = () => {
    onOpenChange(false)
  }

  const config = {
    bgColor: "bg-destructive/10 dark:bg-destructive/20",
    iconColor: "text-destructive",
    confirmBg: "bg-destructive hover:bg-destructive/90",
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn("rounded-3xl", className)}>
        <AlertDialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={cn(
              "mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4",
              config.bgColor,
            )}
          >
            <LogOut className={cn("h-7 w-7", config.iconColor)} />
          </motion.div>

          <AlertDialogTitle className="text-center text-xl font-bold">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter
          className={cn(
            "flex gap-3 sm:justify-center",
            !showCancel && "sm:justify-center",
          )}
        >
          {showCancel && (
            <AlertDialogCancel
              onClick={handleCancel}
              disabled={isLoading}
              className="rounded-full px-6 min-w-[100px] border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {cancelText}
            </AlertDialogCancel>
          )}

          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "rounded-full px-6 min-w-[100px] text-white transition-all",
              config.confirmBg,
              isLoading && "opacity-90 cursor-not-allowed",
            )}
          >
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
                <span>{confirmText}...</span>
              </motion.div>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
