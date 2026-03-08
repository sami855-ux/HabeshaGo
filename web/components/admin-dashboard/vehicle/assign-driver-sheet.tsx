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
import { User, Search, UserCheck } from "lucide-react"
import { Vehicle } from "@/types/vehicle"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { assignDriverForVehicle } from "@/services/vehicle.api"

// Mock driver data - Replace with your API
const mockDrivers = [
  {
    id: "cml5gfool0007wzay9f8fsulv",
    name: "John Smith",
    licenseNumber: "DL-123456",
    status: "active",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    licenseNumber: "DL-789012",
    status: "active",
  },
  {
    id: "3",
    name: "Mike Brown",
    licenseNumber: "DL-345678",
    status: "on-leave",
  },
  {
    id: "4",
    name: "Emily Davis",
    licenseNumber: "DL-901234",
    status: "active",
  },
]

interface AssignDriverSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle
  onSuccess: (driverId: string) => void
  vehicleId: string
}

export default function AssignDriverSheet({
  open,
  onOpenChange,
  vehicle,
  onSuccess,
  vehicleId,
}: AssignDriverSheetProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredDrivers = mockDrivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAssign = async () => {
    if (!selectedDriver) {
      toast.error("Please select a driver")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await assignDriverForVehicle(vehicleId, selectedDriver)

      if (res.success) {
        onSuccess(selectedDriver)
        toast.success("Driver assigned successfully")
        onOpenChange(false)
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      console.error("Failed to assign driver:", error)
      toast.error("Failed to assign driver")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md px-4">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Assign Driver
          </SheetTitle>
          <SheetDescription>
            Select a driver to assign to {vehicle.plateNumber}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-4">
            <Label>Search Drivers</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or license number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Available Drivers</Label>
            {filteredDrivers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No drivers found
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDriver === driver.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedDriver(driver.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{driver.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {driver.licenseNumber}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          driver.status === "active" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {driver.status}
                      </Badge>
                      {selectedDriver === driver.id && (
                        <UserCheck className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedDriver && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="text-sm font-medium">Selected Driver</div>
              <div className="text-sm text-muted-foreground mt-1">
                {mockDrivers.find((d) => d.id === selectedDriver)?.name}
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
            onClick={handleAssign}
            disabled={isSubmitting || !selectedDriver}
          >
            {isSubmitting ? "Assigning..." : "Assign Driver"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
