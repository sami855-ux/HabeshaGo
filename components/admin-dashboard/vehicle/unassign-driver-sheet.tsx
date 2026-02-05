// app/vehicles/components/unassign-driver-sheet.tsx
"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { User, AlertTriangle } from "lucide-react"
import { Vehicle } from "@/types/vehicle"
import { useState } from "react"
import { toast } from "sonner"
import { unassignDriverForVehicle } from "@/services/vehicle.api"

interface UnassignDriverSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle
  onSuccess: () => void
  vehicleId: string
}

export default function UnassignDriverSheet({
  open,
  onOpenChange,
  vehicle,
  onSuccess,
  vehicleId,
}: UnassignDriverSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reason, setReason] = useState("")

  const handleUnassign = async () => {
    setIsSubmitting(true)
    try {
      const res = await unassignDriverForVehicle(vehicleId)

      if (res.success) {
        onSuccess()
        toast.success("Driver unassigned successfully")
        onOpenChange(false)
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      console.error("Failed to unassign driver:", error)
      toast.error("Failed to unassign driver")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md px-4">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Unassign Driver
          </SheetTitle>
          <SheetDescription>
            Remove the currently assigned driver from {vehicle.plateNumber}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-medium">Current Driver</div>
                <div className="text-sm text-muted-foreground">
                  John Smith (DL-123456)
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>Please provide a reason for unassigning the driver</span>
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason (e.g., driver reassignment, vacation, etc.)"
              className="w-full p-3 border rounded-lg text-sm min-h-[100px] resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleUnassign}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? "Unassigning..." : "Unassign Driver"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
