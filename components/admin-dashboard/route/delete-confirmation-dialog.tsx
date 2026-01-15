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
import { Route } from "@/types/route"
import { AlertTriangle } from "lucide-react"

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: Route
}

export default function DeleteConfirmationDialog({
  open,
  onOpenChange,
  route,
}: DeleteConfirmationDialogProps) {
  const handleDelete = () => {
    console.log("Deleting route:", route.id)
    // TODO: Implement delete API call
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDialogTitle>Delete Route</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to delete route <strong>{route.name}</strong>?
            This action cannot be undone. This will remove:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Route information</li>
              <li>{route.midPoints.length} mid-point(s)</li>
              <li>All associated data</li>
            </ul>
            {route.busCount > 0 && (
              <p className="mt-2 text-amber-600 dark:text-amber-400">
                ⚠️ Warning: This route has {route.busCount} bus(es) and{" "}
                {route.minibusCount} minibus(es) assigned.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Route
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
