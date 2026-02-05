// app/vehicles/components/update-mileage-sheet.tsx
"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gauge, TrendingUp } from "lucide-react"
import { Vehicle } from "@/types/vehicle"
import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { updateVehicleMileage } from "@/services/vehicle.api"

interface UpdateMileageSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle
  onSuccess: (mileage: number) => void
  vehicleId: string
}

export default function UpdateMileageSheet({
  open,
  onOpenChange,
  vehicle,
  onSuccess,
  vehicleId,
}: UpdateMileageSheetProps) {
  const [mileage, setMileage] = useState<string>(vehicle.mileage.toString())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const newMileage = parseInt(mileage)

    if (isNaN(newMileage) || newMileage < 0) {
      toast.error("Please enter a valid mileage")
      return
    }

    if (newMileage === vehicle.mileage) {
      onOpenChange(false)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await updateVehicleMileage(vehicleId, Number(mileage))

      if (res.success) {
        onSuccess(newMileage)
        toast.success(`Mileage updated to ${newMileage.toLocaleString()} km`)
        onOpenChange(false)
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      console.error("Failed to update mileage:", error)
      toast.error("Failed to update vehicle mileage")
    } finally {
      setIsSubmitting(false)
    }
  }

  const mileageChange = parseInt(mileage) - vehicle.mileage

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md px-4">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Update Vehicle Mileage
          </SheetTitle>
          <SheetDescription>
            Current mileage:{" "}
            <span className="font-medium">
              {vehicle.mileage.toLocaleString()} km
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-4">
            <Label htmlFor="mileage">New Mileage (km)</Label>
            <div className="relative">
              <Gauge className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="mileage"
                type="number"
                min="0"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="pl-9 text-lg"
                placeholder="Enter mileage"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the current odometer reading in kilometers
            </p>
          </div>

          {!isNaN(parseInt(mileage)) && mileageChange !== 0 && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Mileage Change</div>
                  <div className="text-2xl font-bold">
                    {mileageChange > 0 ? "+" : ""}
                    {mileageChange.toLocaleString()} km
                  </div>
                </div>
                <TrendingUp
                  className={cn(
                    "h-8 w-8",
                    mileageChange > 0 ? "text-green-500" : "text-red-500",
                  )}
                />
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {mileageChange > 0 ? "Increase" : "Decrease"} from previous
                reading
              </div>
            </div>
          )}
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
            className="flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting || parseInt(mileage) === vehicle.mileage}
          >
            {isSubmitting ? "Updating..." : "Update Mileage"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
