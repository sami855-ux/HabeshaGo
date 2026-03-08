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
import { LogOut } from "lucide-react"

interface LogoutModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
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
}: LogoutModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background text-foreground border-none">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-destructive/10 dark:bg-destructive/20">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              className="border-border hover:bg-muted cursor-pointer"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent text-white" />
                  Logging out...
                </span>
              ) : (
                <span className="flex items-center gap-2 cursor-pointer text-white">
                  <LogOut className="h-4 w-4" />
                  {confirmText}
                </span>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
