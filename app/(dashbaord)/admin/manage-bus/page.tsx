"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, RefreshCw, Download, Upload, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { dummyBuses } from "@/lib/mock-data"
import BusStats from "@/components/admin-dashboard/BusStats"
import BusTable from "@/components/admin-dashboard/BusTable"
import BulkActions from "@/components/admin-dashboard/BulkActions"
import FiltersSheet from "@/components/admin-dashboard/FiltersSheet"
import LoadingSkeleton from "@/components/admin-dashboard/LoadingSkeleton"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { ro } from "@faker-js/faker"
import { useRouter } from "next/navigation"
import { useAllBuses } from "@/hooks/useAllBus"

export default function BusManagementPage() {
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [routeFilter, setRouteFilter] = useState("all")
  const [driverFilter, setDriverFilter] = useState("all")
  const [isMobile, setIsMobile] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})

  // Check for mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // React Query for data fetching
  const {
    data: buses = [],
    isLoading,
    isRefetching,
    refetch,
  } = useAllBuses()

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
        break
      case "maintenance":
        console.log("Setting buses to maintenance:", selectedIds)
        setSelectedRows({})
        break
      case "deactivate":
        console.log("Deactivating buses:", selectedIds)
        setSelectedRows({})
        break
      case "delete":
        console.log("Deleting buses:", selectedIds)
        setSelectedRows({})
        break
      case "export":
        console.log("Exporting buses:", selectedIds)
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
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bus Management</h1>
          <p className="text-muted-foreground">
            Manage your fleet of {filteredBuses.length} buses
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => console.log("Import clicked")}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            variant="outline"
            onClick={() => console.log("Export clicked")}
            className="flex items-center gap-2"
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
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-2"
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
              <button onClick={() => setStatusFilter("all")} className="ml-1">
                ×
              </button>
            </Badge>
          )}
          {routeFilter !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Route: {routeFilter}
              <button onClick={() => setRouteFilter("all")} className="ml-1">
                ×
              </button>
            </Badge>
          )}
          {driverFilter !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Driver: {driverFilter}
              <button onClick={() => setDriverFilter("all")} className="ml-1">
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
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={Object.keys(selectedRows).length}
        onBulkAction={handleBulkAction}
      />

      {/* Bus Table */}
      <BusTable
        buses={filteredBuses}
        isMobile={isMobile}
        selectedRows={selectedRows}
        onSelectRow={(id, selected) => {
          setSelectedRows((prev) => ({
            ...prev,
            [id]: selected,
          }))
        }}
        onSelectAll={(selected) => {
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
        }}
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
      />
    </div>
  )
}
