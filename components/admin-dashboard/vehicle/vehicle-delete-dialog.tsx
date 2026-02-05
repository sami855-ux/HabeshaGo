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
import { Car, AlertTriangle, Loader2 } from "lucide-react"
import { Vehicle } from "@/types/vehicle"
import { deleteVehicle } from "@/services/vehicle.api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

interface VehicleDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle
  onSuccess: () => void
  vehicleId: string
}

export default function VehicleDeleteDialog({
  open,
  onOpenChange,
  vehicle,
  onSuccess,
  vehicleId,
}: VehicleDeleteDialogProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteVehicle(vehicleId)

      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["vehicles"] })
        toast.success("Vehicle deleted successfully")
        onSuccess()
        onOpenChange(false)
        router.back()
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      console.error("Failed to delete vehicle:", error)
      toast.error("Failed to delete vehicle. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Reset loading state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsDeleting(false)
    }
    onOpenChange(open)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            vehicle <span className="font-bold">{vehicle.plateNumber}</span> and
            remove all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <Car className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">{vehicle.plateNumber}</p>
              <p className="text-sm text-muted-foreground">
                {vehicle.model} • {vehicle.manufacturer}
              </p>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Vehicle"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
