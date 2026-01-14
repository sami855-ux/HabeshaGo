// app/vehicles/vehicles-management.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Car,
  Bus,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Wrench,
  Clock,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import VehiclesTable from "@/components/admin-dashboard/vehicle/vehicles-table"
import VehicleFormDialog from "@/components/admin-dashboard/vehicle/vehicle-form-dialog"
import FilterSheet from "@/components/admin-dashboard/vehicle/filter-sheet"
import { Vehicle, VehicleFilters } from "@/types/vehicle"

// Mock API function - replace with actual API calls
const fetchVehicles = async (
  filters: VehicleFilters = {}
): Promise<{ data: Vehicle[]; total: number }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock data
  const mockVehicles: Vehicle[] = [
    {
      id: "1",
      type: "BUS",
      model: "Volvo B8R",
      plateNumber: "ABC-123",
      capacity: 50,
      manufacturer: "Volvo",
      year: 2022,
      status: "ACTIVE",
      isActive: true,
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      busId: "bus-1",
    },
    {
      id: "2",
      type: "MINIBUS",
      model: "Toyota Coaster",
      plateNumber: "DEF-456",
      capacity: 18,
      manufacturer: "Toyota",
      year: 2023,
      status: "MAINTENANCE",
      isActive: true,
      createdAt: "2024-02-20T14:15:00Z",
      updatedAt: "2024-03-01T09:45:00Z",
      minibusId: "mini-1",
    },
    {
      id: "3",
      type: "VAN",
      model: "Ford Transit",
      plateNumber: "GHI-789",
      capacity: 12,
      manufacturer: "Ford",
      year: 2021,
      status: "OUT_OF_SERVICE",
      isActive: false,
      createdAt: "2023-11-10T08:20:00Z",
      updatedAt: "2024-02-15T16:30:00Z",
    },
    {
      id: "4",
      type: "BUS",
      model: "Mercedes-Benz Tourismo",
      plateNumber: "JKL-012",
      capacity: 55,
      manufacturer: "Mercedes-Benz",
      year: 2023,
      status: "ACTIVE",
      isActive: true,
      createdAt: "2024-01-30T11:45:00Z",
      updatedAt: "2024-01-30T11:45:00Z",
      busId: "bus-2",
    },
    {
      id: "5",
      type: "CAR",
      model: "Toyota Camry",
      plateNumber: "MNO-345",
      capacity: 5,
      manufacturer: "Toyota",
      year: 2024,
      status: "ACTIVE",
      isActive: true,
      createdAt: "2024-03-01T09:15:00Z",
      updatedAt: "2024-03-01T09:15:00Z",
    },
    {
      id: "6",
      type: "TRUCK",
      model: "Isuzu NPR",
      plateNumber: "PQR-678",
      capacity: 3,
      manufacturer: "Isuzu",
      year: 2022,
      status: "MAINTENANCE",
      isActive: true,
      createdAt: "2023-12-05T13:40:00Z",
      updatedAt: "2024-03-10T10:20:00Z",
    },
    {
      id: "7",
      type: "MINIBUS",
      model: "Hyundai County",
      plateNumber: "STU-901",
      capacity: 15,
      manufacturer: "Hyundai",
      year: 2023,
      status: "INACTIVE",
      isActive: false,
      createdAt: "2023-10-25T15:50:00Z",
      updatedAt: "2024-01-20T14:35:00Z",
      minibusId: "mini-2",
    },
    {
      id: "8",
      type: "BUS",
      model: "Scania K360",
      plateNumber: "VWX-234",
      capacity: 60,
      manufacturer: "Scania",
      year: 2024,
      status: "ACTIVE",
      isActive: true,
      createdAt: "2024-02-15T08:30:00Z",
      updatedAt: "2024-02-15T08:30:00Z",
      busId: "bus-3",
    },
  ]

  // Apply filters
  let filtered = [...mockVehicles]

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      (vehicle) =>
        vehicle.plateNumber.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.manufacturer.toLowerCase().includes(searchLower)
    )
  }

  if (filters.type) {
    filtered = filtered.filter((vehicle) => vehicle.type === filters.type)
  }

  if (filters.status) {
    filtered = filtered.filter((vehicle) => vehicle.status === filters.status)
  }

  if (typeof filters.isActive === "boolean") {
    filtered = filtered.filter(
      (vehicle) => vehicle.isActive === filters.isActive
    )
  }

  // Apply sorting
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let aVal: any = a[filters.sortBy as keyof Vehicle]
      let bVal: any = b[filters.sortBy as keyof Vehicle]

      if (filters.sortBy === "plateNumber") {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (aVal < bVal) return filters.sortOrder === "asc" ? -1 : 1
      if (aVal > bVal) return filters.sortOrder === "asc" ? 1 : -1
      return 0
    })
  }

  // Apply pagination
  const page = filters.page || 1
  const limit = filters.limit || 10
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit

  const paginated = filtered.slice(startIndex, endIndex)

  return {
    data: paginated,
    total: filtered.length,
  }
}

export default function VehiclesManagement() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [filters, setFilters] = useState<VehicleFilters>({
    page: 1,
    limit: 10,
    sortBy: "plateNumber",
    sortOrder: "asc",
  })
  const [totalVehicles, setTotalVehicles] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch vehicles on mount and when filters change
  useEffect(() => {
    loadVehicles()
  }, [filters])

  const loadVehicles = async () => {
    setIsLoading(true)
    try {
      const result = await fetchVehicles(filters)
      setVehicles(result.data)
      setTotalVehicles(result.total)
    } catch (error) {
      console.error("Failed to fetch vehicles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    // Debounce search
    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value, page: 1 }))
    }, 500)
    return () => clearTimeout(timeoutId)
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
      // API call to delete/deactivate
      console.log(
        `${vehicle.isActive ? "Deactivating" : "Deleting"} vehicle:`,
        vehicle.id
      )
      await loadVehicles() // Refresh data
    }
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleLimitChange = (limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }))
  }

  const totalPages = Math.ceil(totalVehicles / (filters.limit || 10))

  return (
    <div className="min-h-screen bg-background rounded-xl">
      {/* Header */}
      <header className="  sticky top-0 z-40 bg-background rounded-xl">
        <div className=" mx-auto px-4 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:px-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Vehicles
              </CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalVehicles}</div>
                  <p className="text-xs text-muted-foreground">
                    All registered vehicles
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Vehicles
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {vehicles.filter((v) => v.isActive).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently operational
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                In Maintenance
              </CardTitle>
              <Wrench className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {vehicles.filter((v) => v.status === "MAINTENANCE").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Under repair/service
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Out of Service
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {
                      vehicles.filter((v) => v.status === "OUT_OF_SERVICE")
                        .length
                    }
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
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by plate, model, or manufacturer..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
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
                  onClick={loadVehicles}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={cn("h-4 w-4", isLoading && "animate-spin")}
                  />
                </Button>
              </div>
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
                  Showing {vehicles.length} of {totalVehicles} vehicles
                </CardDescription>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span>Rows per page:</span>
                <select
                  className="border rounded px-2 py-1"
                  value={filters.limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  disabled={isLoading}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <VehiclesTable
              vehicles={vehicles}
              isLoading={isLoading}
              onEdit={handleEditVehicle}
              onDelete={handleDeleteVehicle}
              onView={(vehicle) => {
                // Handle view details
                console.log("Viewing vehicle:", vehicle)
              }}
            />

            {/* Pagination */}
            {!isLoading && totalVehicles > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Page {filters.page} of {totalPages}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(1)}
                    disabled={filters.page === 1 || isLoading}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={filters.page === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (filters.page! <= 3) {
                        pageNum = i + 1
                      } else if (filters.page! >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = filters.page! - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            filters.page === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isLoading}
                          className="w-8"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={filters.page === totalPages || isLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={filters.page === totalPages || isLoading}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Vehicle Form Dialog */}
      <VehicleFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        vehicle={selectedVehicle}
        onSuccess={loadVehicles}
      />
    </div>
  )
}
