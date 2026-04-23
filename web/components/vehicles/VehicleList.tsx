"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  Car,
  Plug,
  Battery,
  Pencil,
  Trash2,
  CheckCircle,
  Zap,
  Gauge,
  Calendar,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Vehicle } from "@/types/vehicle"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ModernAlert } from "@/components/ui/modern-alert"

interface VehicleListProps {
  vehicles: Vehicle[]
  selectedVehicleId: number | null
  onSelectVehicle: (vehicle: Vehicle) => void
  onAddNew: () => void
  onEdit?: (vehicle: Vehicle) => void
  onDelete?: (vehicleId: number) => Promise<void>
  isDeleting?: boolean
}

const connectorTypeLabels: Record<string, { label: string; icon: string }> = {
  TYPE2: { label: "Type 2", icon: "🔌" },
  CCS: { label: "CCS", icon: "⚡" },
  CHADEMO: { label: "CHAdeMO", icon: "🔋" },
}

const vehicleTypeIcons: Record<string, string> = {
  BUS: "🚌",
  MINIBUS: "🚐",
  TAXI: "🚕",
  VAN: "🚐",
  TRUCK: "🚛",
}

export function VehicleList({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onEdit,
  onDelete,
  isDeleting = false,
}: VehicleListProps) {
  const [hoveredVehicleId, setHoveredVehicleId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const handleDeleteClick = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (vehicleToDelete && onDelete) {
      await onDelete(vehicleToDelete.id)
      setDeleteDialogOpen(false)
      setVehicleToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setVehicleToDelete(null)
  }

  const handleEditClick = (vehicle: Vehicle) => {
    if (onEdit) {
      onEdit(vehicle)
    }
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {vehicles.map((vehicle) => {
            const isSelected = selectedVehicleId === vehicle.id
            const isHovered = hoveredVehicleId === vehicle.id
            const vehicleTypeIcon = vehicleTypeIcons[vehicle.type] || "🚗"
            const connectorInfo = connectorTypeLabels[
              vehicle.connectorType
            ] || {
              label: vehicle.connectorType,
              icon: "🔌",
            }

            return (
              <motion.div
                key={vehicle.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                whileHover={{ y: -4 }}
                onHoverStart={() => setHoveredVehicleId(vehicle.id)}
                onHoverEnd={() => setHoveredVehicleId(null)}
              >
                <Card
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 py-0",
                    "hover:shadow-xl hover:shadow-orange-500/10",
                    isSelected
                      ? "border-2 border-orange-200 shadow-lg shadow-orange-500/20"
                      : "border border-gray-200 dark:border-gray-800",
                    isHovered && "ring-2 ring-orange-500/20",
                  )}
                >
                  {/* Gradient Background */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
                      isSelected
                        ? "from-orange-50 via-transparent to-transparent dark:from-orange-950/20 opacity-100"
                        : isHovered
                          ? "from-gray-50 via-transparent to-transparent dark:from-gray-800/20 opacity-100"
                          : "opacity-0",
                    )}
                  />

                  {/* Vehicle Image or Placeholder */}
                  {vehicle.vehicleImageUrl ? (
                    <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      <img
                        src={vehicle.vehicleImageUrl}
                        alt={`${vehicle.manufacturer} ${vehicle.model}`}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-orange-500 text-white border-none shadow-lg">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Selected
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative h-48 w-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/20 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-6xl">{vehicleTypeIcon}</span>
                        <p className="text-sm text-muted-foreground mt-2">
                          No Image Available
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-orange-500 text-white border-none shadow-lg">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Selected
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  <CardHeader className="pb-3 relative">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{vehicleTypeIcon}</span>
                          <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                            {vehicle.manufacturer} {vehicle.model}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            {vehicle.plateNumber}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 relative">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <Battery className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Battery
                          </p>
                          <p className="font-semibold">
                            {vehicle.capacity} kWh
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <Plug className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Connector
                          </p>
                          <p className="font-semibold flex items-center gap-1">
                            <span>{connectorInfo.icon}</span>
                            {connectorInfo.label}
                          </p>
                        </div>
                      </div>

                      {vehicle.year && (
                        <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Year
                            </p>
                            <p className="font-semibold">{vehicle.year}</p>
                          </div>
                        </div>
                      )}

                      {vehicle.mileage !== undefined && vehicle.mileage > 0 && (
                        <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                          <Gauge className="h-4 w-4 text-orange-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Mileage
                            </p>
                            <p className="font-semibold">
                              {vehicle.mileage.toLocaleString()} km
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {vehicle.vin && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span className="font-mono">VIN: {vehicle.vin}</span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex gap-2 pt-2 pb-4 relative">
                    <Button
                      onClick={() => onSelectVehicle(vehicle)}
                      className={cn(
                        "flex-1 transition-all duration-300",
                        isSelected
                          ? "bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 hover:from-orange-200 hover:to-orange-100 border border-orange-300 dark:from-orange-950/50 dark:to-orange-900/30 dark:text-orange-400"
                          : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg hover:shadow-orange-500/25",
                      )}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        <>
                          <Car className="h-4 w-4 mr-2" />
                          Select Vehicle
                        </>
                      )}
                    </Button>

                    {/* Delete Button - Made more visible */}
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => handleDeleteClick(vehicle)}
                      className="transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 px-4"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Empty state */}
        {vehicles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full"
          >
            <Card className="border-dashed border-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Car className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Vehicles Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add your first vehicle to start charging
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Modern Alert Dialog for Delete Confirmation */}
      <ModernAlert
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Vehicle"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-orange-600">
              {vehicleToDelete?.manufacturer} {vehicleToDelete?.model}
            </span>
            ? This action cannot be undone and will remove the vehicle from your
            garage.
          </>
        }
        type="danger"
        confirmLabel="Delete Vehicle"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isConfirming={isDeleting}
        confirmText="Deleting"
        icon={<Trash2 className="h-7 w-7 text-red-600" />}
      />
    </>
  )
}
