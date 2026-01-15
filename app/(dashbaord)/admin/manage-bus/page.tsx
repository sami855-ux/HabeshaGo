"use client"

import { useState, useEffect } from "react"
import { Plus, RefreshCw, Download, Upload, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import BusStats from "@/components/admin-dashboard/BusStats"
import BusTable from "@/components/admin-dashboard/BusTable"
import BulkActions from "@/components/admin-dashboard/BulkActions"
import FiltersSheet from "@/components/admin-dashboard/FiltersSheet"
import LoadingSkeleton from "@/components/admin-dashboard/LoadingSkeleton"
import { useAllBusesQuery } from "@/hooks/useGetAllBuses"

// Dummy data as fallback
const dummyBuses = [
  {
    id: 1,
    busNumber: "AA-101",
    capacity: 45,
    status: "ACTIVE" as const,
    driverId: "DRV001",
    routeId: 1,
    currentStop: "Megenagna",
    nextDestination: "Merkato",
    isActive: true,
    vehicleId: 101,
    driverName: "John Smith",
    routeName: "City Center - Airport",
    fuelLevel: 85,
    lastMaintenance: "2024-02-10",
    nextMaintenance: "2024-03-10",
    totalTrips: 156,
    avgSpeed: 45,
    location: { lat: 9.03, lng: 38.768 },
  },
  {
    id: 2,
    busNumber: "AA-102",
    capacity: 35,
    status: "MAINTENANCE" as const,
    driverId: "DRV002",
    routeId: 2,
    currentStop: "Bole",
    nextDestination: "Megenagna",
    isActive: true,
    vehicleId: 102,
    driverName: "Maria Garcia",
    routeName: "Bole - Piassa",
    fuelLevel: 40,
    lastMaintenance: "2024-02-15",
    nextMaintenance: "2024-03-15",
    totalTrips: 89,
    avgSpeed: 38,
    location: { lat: 9.005, lng: 38.8 },
  },
  {
    id: 3,
    busNumber: "AA-103",
    capacity: 50,
    status: "ACTIVE" as const,
    driverId: "DRV003",
    routeId: 3,
    currentStop: "Merkato",
    nextDestination: "Lideta",
    isActive: true,
    vehicleId: 103,
    driverName: "Ahmed Mohammed",
    routeName: "Merkato - Gurd Shola",
    fuelLevel: 92,
    lastMaintenance: "2024-02-12",
    nextMaintenance: "2024-03-12",
    totalTrips: 123,
    avgSpeed: 42,
    location: { lat: 9.025, lng: 38.75 },
  },
  {
    id: 4,
    busNumber: "AA-104",
    capacity: 40,
    status: "INACTIVE" as const,
    driverId: null,
    routeId: null,
    currentStop: null,
    nextDestination: null,
    isActive: false,
    vehicleId: 104,
    driverName: null,
    routeName: null,
    fuelLevel: 15,
    lastMaintenance: "2024-02-05",
    nextMaintenance: "2024-03-05",
    totalTrips: 67,
    avgSpeed: 0,
    location: null,
  },
]

// Helper function to extract bus data from API response
const extractBusData = (apiData: any) => {
  if (!apiData) return []

  // Handle different API response structures
  if (Array.isArray(apiData)) {
    return apiData.map((bus) => ({
      id: bus.id,
      busNumber: bus.busNumber,
      capacity: bus.capacity,
      status: bus.status,
      driverId: bus.driverId,
      routeId: bus.routeId,
      currentStop: bus.currentStop,
      nextDestination: bus.nextDestination,
      isActive: bus.isActive,
      vehicleId: bus.vehicleId,
      driverName: bus.driver?.name || bus.driverName,
      routeName: bus.route?.name || bus.routeName,
      // Add other fields with fallbacks
      fuelLevel: bus.fuelLevel || 0,
      lastMaintenance: bus.lastMaintenance,
      nextMaintenance: bus.nextMaintenance,
      totalTrips: bus.totalTrips || 0,
      avgSpeed: bus.avgSpeed || 0,
      location: bus.location || null,
    }))
  }

  // If it's an object with a data property
  if (apiData && typeof apiData === "object" && Array.isArray(apiData.data)) {
    return apiData.data.map((bus) => ({
      id: bus.id,
      busNumber: bus.busNumber,
      capacity: bus.capacity,
      status: bus.status,
      driverId: bus.driverId,
      routeId: bus.routeId,
      currentStop: bus.currentStop,
      nextDestination: bus.nextDestination,
      isActive: bus.isActive,
      vehicleId: bus.vehicleId,
      driverName: bus.driver?.name || bus.driverName,
      routeName: bus.route?.name || bus.routeName,
      fuelLevel: bus.fuelLevel || 0,
      lastMaintenance: bus.lastMaintenance,
      nextMaintenance: bus.nextMaintenance,
      totalTrips: bus.totalTrips || 0,
      avgSpeed: bus.avgSpeed || 0,
      location: bus.location || null,
    }))
  }

  // If no valid data structure, return empty array
  console.warn("Unexpected API response structure:", apiData)
  return []
}

export default function BusManagementPage() {
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [routeFilter, setRouteFilter] = useState("all")
  const [driverFilter, setDriverFilter] = useState("all")
  const [isMobile, setIsMobile] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})
  const [useDummyData, setUseDummyData] = useState(false)

  // Check for mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // React Query for data fetching
  const {
    data: apiResponse,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useAllBusesQuery()

  console.log("API Response:", apiResponse)

  // Handle API errors
  useEffect(() => {
    if (error) {
      console.error("Error fetching buses:", error)
      setUseDummyData(true)
    }
  }, [error])

  // Extract and transform data from API or use dummy data
  const buses = useDummyData
    ? dummyBuses
    : extractBusData(apiResponse).length > 0
    ? extractBusData(apiResponse)
    : dummyBuses // Fallback to dummy data if API returns empty

  // Get unique values for filters
  const uniqueRoutes = Array.from(
    new Set(buses.map((bus) => bus.routeName).filter(Boolean))
  )
  const uniqueDrivers = Array.from(
    new Set(buses.map((bus) => bus.driverName).filter(Boolean))
  )

  // Filter buses
  const filteredBuses = buses.filter((bus) => {
    const searchLower = search.toLowerCase()
    const matchesSearch =
      !search ||
      bus.busNumber.toLowerCase().includes(searchLower) ||
      bus.driverName?.toLowerCase().includes(searchLower) ||
      bus.routeName?.toLowerCase().includes(searchLower) ||
      bus.currentStop?.toLowerCase().includes(searchLower)

    const matchesStatus = statusFilter === "all" || bus.status === statusFilter
    const matchesRoute = routeFilter === "all" || bus.routeName === routeFilter
    const matchesDriver =
      driverFilter === "all" || bus.driverName === driverFilter

    return matchesSearch && matchesStatus && matchesRoute && matchesDriver
  })

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    const selectedIds = Object.keys(selectedRows).map((id) => parseInt(id))

    switch (action) {
      case "activate":
        console.log("Activating buses:", selectedIds)
        setSelectedRows({})
        // TODO: Implement API call for bulk activation
        break
      case "maintenance":
        console.log("Setting buses to maintenance:", selectedIds)
        setSelectedRows({})
        // TODO: Implement API call for bulk maintenance
        break
      case "deactivate":
        console.log("Deactivating buses:", selectedIds)
        setSelectedRows({})
        // TODO: Implement API call for bulk deactivation
        break
      case "delete":
        console.log("Deleting buses:", selectedIds)
        setSelectedRows({})
        // TODO: Implement API call for bulk deletion
        break
      case "export":
        console.log("Exporting buses:", selectedIds)
        // Implement export logic
        break
      case "clear":
        setSelectedRows({})
        break
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    refetch()
    setSelectedRows({})
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="bg-background mx-auto p-4 md:p-6 rounded-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bus Management</h1>
          <p className="text-muted-foreground">
            Manage your fleet of {filteredBuses.length} buses
            {useDummyData && (
              <span className="ml-2 text-amber-600 text-sm">
                (Using dummy data)
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => console.log("Import clicked")}
            className="flex items-center gap-2"
            disabled={isRefetching}
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            variant="outline"
            onClick={() => handleBulkAction("export")}
            className="flex items-center gap-2"
            disabled={isRefetching}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefetching}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={() => router.push("/admin/manage-bus/add-bus")}
            className="flex items-center gap-2 cursor-pointer"
            disabled={isRefetching}
          >
            <Plus className="h-4 w-4" />
            Add Bus
          </Button>
        </div>
      </div>

      {/* Stats */}
      <BusStats buses={buses} />

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search buses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isRefetching}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-2"
          disabled={isRefetching}
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Active Filters Display */}
      {(statusFilter !== "all" ||
        routeFilter !== "all" ||
        driverFilter !== "all") && (
        <div className="flex flex-wrap gap-2 mb-4">
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {statusFilter}
              <button
                onClick={() => setStatusFilter("all")}
                className="ml-1"
                disabled={isRefetching}
              >
                ×
              </button>
            </Badge>
          )}
          {routeFilter !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Route: {routeFilter}
              <button
                onClick={() => setRouteFilter("all")}
                className="ml-1"
                disabled={isRefetching}
              >
                ×
              </button>
            </Badge>
          )}
          {driverFilter !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Driver: {driverFilter}
              <button
                onClick={() => setDriverFilter("all")}
                className="ml-1"
                disabled={isRefetching}
              >
                ×
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter("all")
              setRouteFilter("all")
              setDriverFilter("all")
            }}
            disabled={isRefetching}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={Object.keys(selectedRows).length}
        onBulkAction={handleBulkAction}
        disabled={isRefetching}
      />

      {/* Bus Table */}
      <BusTable
        buses={filteredBuses}
        isMobile={isMobile}
        selectedRows={selectedRows}
        onSelectRow={(id, selected) => {
          if (!isRefetching) {
            setSelectedRows((prev) => ({
              ...prev,
              [id]: selected,
            }))
          }
        }}
        onSelectAll={(selected) => {
          if (!isRefetching) {
            if (selected) {
              const allSelected = filteredBuses.reduce(
                (acc, bus) => ({
                  ...acc,
                  [bus.id]: true,
                }),
                {}
              )
              setSelectedRows(allSelected)
            } else {
              setSelectedRows({})
            }
          }
        }}
        isRefetching={isRefetching}
      />

      {/* Filters Sheet */}
      <FiltersSheet
        open={showFilters}
        onOpenChange={setShowFilters}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        routeFilter={routeFilter}
        setRouteFilter={setRouteFilter}
        driverFilter={driverFilter}
        setDriverFilter={setDriverFilter}
        uniqueRoutes={uniqueRoutes}
        uniqueDrivers={uniqueDrivers}
        onClearAll={() => {
          setStatusFilter("all")
          setRouteFilter("all")
          setDriverFilter("all")
        }}
        disabled={isRefetching}
      />
    </div>
  )
}
