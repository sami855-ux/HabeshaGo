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
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <Share2 className="h-8 w-8 text-orange-600" />
          </div>
          <AlertDialogTitle className="text-center text-2xl">
            Confirm Share
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Are you sure you want to share this ticket with{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {selectedUser?.name}
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 my-4">
          <div className="flex items-center gap-3 mb-3">
            <Ticket className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">
              {ticketData.route.origin} → {ticketData.route.destination}
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
            className="rounded-full px-8 h-12"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSharing}
            className="rounded-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-8 h-12"
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
      </AlertDialogContent>
    </AlertDialog>
  )
}
