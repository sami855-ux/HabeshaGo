"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Car, AlertCircle, Phone, User, Gauge, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Vehicle,
  VehicleFormData,
  VehicleType,
  VehicleStatus,
} from "@/types/vehicle"
import { useCreateVehicle } from "@/hooks/useCreateVehicle"
import { toast } from "sonner"

interface VehicleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle | null
  onSuccess: () => void
}

const vehicleTypes: { value: VehicleType; label: string }[] = [
  { value: "BUS", label: "Bus" },
  { value: "MINIBUS", label: "Minibus" },
  { value: "VAN", label: "Van" },
  { value: "CAR", label: "Car" },
  { value: "TRUCK", label: "Truck" },
]

const vehicleStatuses: { value: VehicleStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "UNDER_MAINTENANCE", label: "Under Maintenance" },
  { value: "OUT_OF_SERVICE", label: "Out of Service" },
  { value: "INACTIVE", label: "Inactive" },
]

export default function VehicleFormDialog({
  open,
  onOpenChange,
  vehicle,
  onSuccess,
}: VehicleFormDialogProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    type: "BUS",
    model: "",
    plateNumber: "",
    vin: "",
    capacity: 20,
    manufacturer: "",
    year: new Date().getFullYear(),
    status: "ACTIVE",
    mileage: 0,
    ownerName: "",
    ownerPhone: "",
    gpsDeviceId: "",
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // React Query mutation for creating a vehicle
  const createVehicleMutation = useCreateVehicle({
    onSuccess: (data) => {
      console.log("Vehicle created:", data)
      toast.success("Vehicle created successfully!")
      onSuccess()
      onOpenChange(false)
    },
    onError: (error: any) => {
      console.error("Failed to save vehicle:", error)
      toast.error(
        error?.response?.data?.error ||
          "An error occurred while saving the vehicle.",
      )
    },
  })

  useEffect(() => {
    if (vehicle) {
      setFormData({
        type: vehicle.type,
        model: vehicle.model,
        plateNumber: vehicle.plateNumber,
        vin: vehicle.vin || "",
        capacity: vehicle.capacity,
        manufacturer: vehicle.manufacturer,
        year: vehicle.year,
        status: vehicle.status,
        mileage: (vehicle as any).mileage || 0,
        ownerName: vehicle.ownerName || "",
        ownerPhone: vehicle.ownerPhone || "",
        gpsDeviceId: vehicle.gpsDeviceId || "",
        isActive: vehicle.isActive,
      })
    } else {
      // Reset form for new vehicle
      setFormData({
        type: "BUS",
        model: "",
        plateNumber: "",
        vin: "",
        capacity: 20,
        manufacturer: "",
        year: new Date().getFullYear(),
        status: "ACTIVE",
        mileage: 0,
        ownerName: "",
        ownerPhone: "",
        gpsDeviceId: "",
        isActive: true,
      })
    }
    setErrors({})
  }, [vehicle, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = "Plate number is required"
    }

    if (!formData.model.trim()) {
      newErrors.model = "Model is required"
    }

    if (formData.capacity <= 0) {
      newErrors.capacity = "Capacity must be greater than 0"
    }

    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = "Manufacturer is required"
    }

    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = "Year is invalid"
    }

    if (formData.mileage < 0) {
      newErrors.mileage = "Mileage cannot be negative"
    }

    // Validate VIN format if provided
    if (formData.vin && formData.vin.length !== 17) {
      newErrors.vin = "VIN must be 17 characters"
    }

    // Validate phone number format if provided
    if (formData.ownerPhone && !/^[\d\s\-\+\(\)]+$/.test(formData.ownerPhone)) {
      newErrors.ownerPhone = "Invalid phone number format"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Prepare the data - remove empty optional fields
      const submitData: any = { ...formData }

      // Clean up optional fields - remove if empty
      if (!submitData.vin) delete submitData.vin
      if (!submitData.ownerName) delete submitData.ownerName
      if (!submitData.ownerPhone) delete submitData.ownerPhone
      if (!submitData.gpsDeviceId) delete submitData.gpsDeviceId
      if (submitData.mileage === 0) delete submitData.mileage

      if (vehicle) {
        // TODO: Implement updateVehicle mutation here
        console.log("Updating vehicle:", submitData)
        // Simulate update
        setTimeout(() => {
          toast.success("Vehicle updated successfully!")
          onSuccess()
          onOpenChange(false)
          setIsSubmitting(false)
        }, 1000)
      } else {
        // Create new vehicle
        createVehicleMutation.mutate(submitData)
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred")
      setIsSubmitting(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            {vehicle ? "Edit Vehicle" : "Add New Vehicle"}
          </DialogTitle>
          <DialogDescription>
            {vehicle
              ? `Update details for ${vehicle.plateNumber}`
              : "Enter vehicle details below. All fields marked with * are required."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Basic Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">
                    Vehicle Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: VehicleType) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger id="type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">
                    Model <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    placeholder="e.g., Coaster, Sprinter"
                    className={errors.model ? "border-destructive" : ""}
                  />
                  {errors.model && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.model}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plateNumber">
                    Plate Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="plateNumber"
                    value={formData.plateNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        plateNumber: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g., AA-12345"
                    className={errors.plateNumber ? "border-destructive" : ""}
                  />
                  {errors.plateNumber && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.plateNumber}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vin">
                    VIN Number{" "}
                    <span className="text-xs text-muted-foreground">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id="vin"
                    value={formData.vin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vin: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g., 1HGCM82633A123456"
                    maxLength={17}
                    className={errors.vin ? "border-destructive" : ""}
                  />
                  {errors.vin ? (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.vin}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      17-character Vehicle Identification Number
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">
                    Manufacturer <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) =>
                      setFormData({ ...formData, manufacturer: e.target.value })
                    }
                    placeholder="e.g., Toyota, Mercedes"
                    className={errors.manufacturer ? "border-destructive" : ""}
                  />
                  {errors.manufacturer && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.manufacturer}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">
                    Year <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.year.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, year: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="year" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.year && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.year}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">
                    Capacity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    max="200"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: parseInt(e.target.value) || 0,
                      })
                    }
                    className={errors.capacity ? "border-destructive" : ""}
                  />
                  {errors.capacity && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.capacity}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Number of seats/passengers
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mileage">
                    Current Mileage{" "}
                    <span className="text-xs text-muted-foreground">
                      (Optional)
                    </span>
                  </Label>
                  <div className="relative">
                    <Gauge className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="mileage"
                      type="number"
                      min="0"
                      value={formData.mileage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mileage: parseInt(e.target.value) || 0,
                        })
                      }
                      className={cn(
                        "pl-9",
                        errors.mileage ? "border-destructive" : "",
                      )}
                      placeholder="0"
                    />
                  </div>
                  {errors.mileage && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.mileage}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Current mileage in kilometers
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Owner Information (Optional) */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Owner Information{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (Optional)
                </span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) =>
                        setFormData({ ...formData, ownerName: e.target.value })
                      }
                      placeholder="e.g., John Doe"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerPhone">Owner Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="ownerPhone"
                      value={formData.ownerPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, ownerPhone: e.target.value })
                      }
                      placeholder="e.g., +1234567890"
                      className={cn(
                        "pl-9",
                        errors.ownerPhone ? "border-destructive" : "",
                      )}
                    />
                  </div>
                  {errors.ownerPhone && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.ownerPhone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* GPS & Status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">GPS & Status</h3>
                <Badge variant="outline" className="text-xs">
                  Optional
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gpsDeviceId">GPS Device ID</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="gpsDeviceId"
                      value={formData.gpsDeviceId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gpsDeviceId: e.target.value,
                        })
                      }
                      placeholder="e.g., GPS-001"
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    GPS tracking device identifier
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Vehicle Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: VehicleStatus) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            {status.value === "ACTIVE" && (
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                            )}
                            {status.value === "UNDER_MAINTENANCE" && (
                              <div className="w-2 h-2 rounded-full bg-amber-500" />
                            )}
                            {status.value === "MAINTENANCE" && (
                              <div className="w-2 h-2 rounded-full bg-amber-500" />
                            )}
                            {status.value === "OUT_OF_SERVICE" && (
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                            )}
                            {status.value === "INACTIVE" && (
                              <div className="w-2 h-2 rounded-full bg-gray-500" />
                            )}
                            {status.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                <div className="space-y-0.5">
                  <Label className="text-base">Vehicle Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Active vehicles can be assigned to routes
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={formData.isActive ? "default" : "secondary"}
                    className={cn(
                      !formData.isActive &&
                        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                    )}
                  >
                    {formData.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="space-x-2 sm:gap-0 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || createVehicleMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createVehicleMutation.isLoading}
            >
              {isSubmitting || createVehicleMutation.isLoading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  {vehicle ? "Updating..." : "Creating..."}
                </>
              ) : vehicle ? (
                "Update Vehicle"
              ) : (
                "Create Vehicle"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
