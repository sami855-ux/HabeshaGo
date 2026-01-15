"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Car,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  XCircle,
  Wrench,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import VehiclesTable from "@/components/admin-dashboard/vehicle/vehicles-table"
import VehicleFormDialog from "@/components/admin-dashboard/vehicle/vehicle-form-dialog"
import FilterSheet from "@/components/admin-dashboard/vehicle/filter-sheet"
import { Vehicle, VehicleFilters } from "@/types/vehicle"
import { useAllVehicles } from "@/hooks/useGetAllVehicle"
import { getVehicleStats, VehicleStats } from "@/services/vehicle.api"
import { useQuery } from "@tanstack/react-query"

export default function VehiclesManagement() {
  const router = useRouter()
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [filters, setFilters] = useState<VehicleFilters>({
    page: 1,
    limit: 10,
    sortBy: "plateNumber",
    sortOrder: "asc",
  })
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch vehicles using React Query hook
  const { data: vehiclesData, isLoading, refetch } = useAllVehicles()

  const { data: stats, isLoading: isStatsLoading } = useQuery<VehicleStats>({
    queryKey: ["vehicles", "stats"],
    queryFn: () => getVehicleStats(),
  })

  console.log("vehiclesData:", vehiclesData) // Debug log

  // Since vehiclesData is directly an array, use it directly
  const vehicles = vehiclesData || []
  const totalVehicles = vehicles.length

  console.log("vehicles array:", vehicles) // Debug log
  console.log("vehicles length:", vehicles.length) // Debug log

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    // debounce
    setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value, page: 1 }))
    }, 300)
  }

  const handleAddVehicle = () => {
    setSelectedVehicle(null)
    setIsFormDialogOpen(true)
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsFormDialogOpen(true)
  }

  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    if (
      confirm(
        `Are you sure you want to ${
          vehicle.isActive ? "deactivate" : "delete"
        } ${vehicle.plateNumber}?`
      )
    ) {
      console.log(
        `${vehicle.isActive ? "Deactivating" : "Deleting"} vehicle`,
        vehicle.id
      )
      await refetch() // Refresh vehicles
    }
  }

  return (
    <div className="min-h-screen bg-background rounded-xl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background rounded-xl">
        <div className="mx-auto px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="p-2 rounded-lg bg-primary/10">
              <Car className="h-6 w-6 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Vehicle Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage buses, minibuses, and transport vehicles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button onClick={handleAddVehicle} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:px-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Vehicles
              </CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading || isStatsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.totalVehicles || totalVehicles}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All registered vehicles
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Vehicles
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              {isLoading || isStatsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats?.activeVehicles ||
                      vehicles.filter((v) => v.isActive).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently operational
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                In Maintenance
              </CardTitle>
              <Wrench className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              {isLoading || isStatsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {stats?.maintenanceVehicles ||
                      vehicles.filter((v) => v.status === "MAINTENANCE").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Under repair/service
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Out of Service
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              {isLoading || isStatsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {stats?.outOfServiceVehicles ||
                      vehicles.filter((v) => v.status === "OUT_OF_SERVICE")
                        .length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Temporarily unavailable
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by plate, model, or manufacturer..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <FilterSheet
                filters={filters}
                onFiltersChange={(newFilters) =>
                  setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
                }
                onReset={() =>
                  setFilters({
                    page: 1,
                    limit: 10,
                    sortBy: "plateNumber",
                    sortOrder: "asc",
                  })
                }
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn("h-4 w-4", isLoading && "animate-spin")}
                />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Vehicles</CardTitle>
                <CardDescription>
                  Showing {vehicles.length} vehicles
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <VehiclesTable
              vehicles={vehicles}
              isLoading={isLoading}
              onEdit={handleEditVehicle}
              onDelete={handleDeleteVehicle}
              onView={(vehicle) => console.log("Viewing vehicle:", vehicle)}
              onBulkAction={(action, vehicleIds) => {
                console.log("Bulk action:", action, vehicleIds)
                // implement API call here
              }}
            />
          </CardContent>
        </Card>
      </main>

      {/* Vehicle Form Dialog */}
      <VehicleFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        vehicle={selectedVehicle}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
