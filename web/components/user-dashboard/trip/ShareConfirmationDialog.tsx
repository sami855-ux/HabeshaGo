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
import { Loader2, Share2, Ticket, User } from "lucide-react"

interface ShareConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedUser: any | null
  ticketData: any
  isSharing: boolean
  onConfirm: () => void
}

export function ShareConfirmationDialog({
  open,
  onOpenChange,
  selectedUser,
  ticketData,
  isSharing,
  onConfirm,
}: ShareConfirmationDialogProps) {
  const bus = ticketData.bus
  const route = bus?.route

  const origin =
    route?.origin || ticketData.boardingStop?.split(" ")[0] || "Origin"
  const destination =
    route?.destination ||
    ticketData.alightingStop?.split(" ")[0] ||
    "Destination"

  // Custom handler for onOpenChange that prevents closing while sharing
  const handleOpenChange = (newOpen: boolean) => {
    // Only allow closing if not sharing
    if (!isSharing) {
      onOpenChange(newOpen)
    }
    // If sharing, do nothing - dialog stays open
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="rounded-3xl max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <Share2 className="h-8 w-8 text-orange-600" />
          </div>
          <AlertDialogTitle className="text-center text-2xl">
            {isSharing ? "Sharing Ticket..." : "Confirm Share"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {isSharing ? (
              "Please wait while we share your ticket..."
            ) : (
              <>
                Are you sure you want to share this ticket with{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedUser?.name}
                </span>
                ? This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 my-4">
          <div className="flex items-center gap-3 mb-3">
            <Ticket className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">
              {origin} → {destination}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-orange-600" />
            <span className="text-sm">
              {selectedUser?.name} • {selectedUser?.phone}
            </span>
          </div>
        </div>

        <AlertDialogFooter className="flex gap-3 sm:justify-center">
          <AlertDialogCancel
            disabled={isSharing}
            className={cn(
              "rounded-full px-8 h-12 transition-all",
              isSharing && "opacity-50 cursor-not-allowed",
            )}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSharing}
            className={cn(
              "rounded-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-8 h-12 transition-all",
              isSharing && "opacity-50 cursor-not-allowed",
            )}
          >
            {isSharing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              "Yes, Share Ticket"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>

        {/* Optional: Add a loading overlay or spinner when sharing */}
        {isSharing && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-3xl flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Sharing ticket...
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Please don't close this window
              </p>
            </div>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
