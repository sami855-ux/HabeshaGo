"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Car, ChevronLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { VehicleList } from "@/components/vehicles/VehicleList"
import { AddVehicleModal } from "@/components/vehicles/AddVehicleModal"
import { ModernAlert } from "@/components/ui/modern-alert"
import { vehicleService } from "@/services/vehicleService"
import type { Vehicle } from "@/types/vehicle"
import { useRouter } from "next/navigation"

export default function MyVehiclesPage() {
  const router = useRouter()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null,
  )
  const queryClient = useQueryClient()

  const {
    data: vehicles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: vehicleService.getVehicles,
  })

  const createMutation = useMutation({
    mutationFn: vehicleService.createVehicle,
    onSuccess: (newVehicle) => {
      // 1. Invalidate vehicle list (refetch fresh data)
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })

      // 2. Optionally: directly update cache (instant UI update)
      queryClient.setQueryData(["vehicles"], (old: any) => {
        if (!old) return [newVehicle]
        return [newVehicle, ...old]
      })

      setIsAddModalOpen(false)
      setSelectedVehicleId(newVehicle.id)

      toast.success("Vehicle added successfully", {
        description: `${newVehicle.manufacturer} ${newVehicle.model} has been added to your garage.`,
      })
    },
    onError: () => {
      toast.error("Failed to add vehicle", {
        description: "Please try again.",
      })
    },
  })

  const handleAddVehicle = (data: any) => {
    createMutation.mutate(data)
  }

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicleId(vehicle.id)
    toast.success("Vehicle selected", {
      description: `${vehicle.manufacturer} ${vehicle.model} is ready for reservation.`,
    })
  }

  if (isLoading) {
    return <VehiclesSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Failed to load vehicles. Please refresh the page.
        </div>
      </div>
    )
  }

  const hasNoVehicles = vehicles.length === 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      {/* Header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4">
          {/* Back Button - First */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 h-10 w-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div>
            <p className="text-xs uppercase font-semibold text-muted-foreground">
              My Garage
            </p>
            <h1 className="text-3xl font-bold tracking-tight">My Vehicles</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your EV vehicles for charging sessions and track their
              performance.
            </p>
          </div>
        </div>

        {/* Add Vehicle Button */}
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-orange-500/25"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </header>

      {/* Empty State */}
      {hasNoVehicles && (
        <ModernAlert
          open={true}
          onOpenChange={() => {}}
          title="No Vehicles Found"
          description={
            <>
              <Car className="mx-auto h-12 w-12 mb-4 text-orange-500" />
              <p>
                You need to add a vehicle before starting a charging session.
              </p>
            </>
          }
          type="info"
          confirmLabel="Add Your First Vehicle"
          onConfirm={() => setIsAddModalOpen(true)}
          showCancel={false}
          className="max-w-md mx-auto mt-12"
        />
      )}

      {/* Vehicle List */}
      {!hasNoVehicles && (
        <VehicleList
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={handleSelectVehicle}
          onAddNew={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddVehicle}
        isSubmitting={createMutation.isPending}
      />
    </div>
  )
}

function VehiclesSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
