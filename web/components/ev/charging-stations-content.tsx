"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import {
  Loader2,
  MapPin,
  Table,
  Filter,
  Download,
  Plus,
  ChevronLeft,
} from "lucide-react"
import { useChargingStations } from "@/hooks/use-charging-stations"
import { ChargingStationsTable } from "./charging-stations-table"
import { BulkActionsBar } from "@/components/ev/bulk-actions-bar"
import { useStationFilters } from "@/hooks/use-station-filters"
import { ChargingStationsMap } from "./charging-stations-map"
import { FilterSheet } from "@/components/ev/filter-sheet"
import { ExportDialog } from "@/components/ev/export-dialog"

export function ChargingStationsContent() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("table")
  const [selectedStations, setSelectedStations] = useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)

  const { data: stations, isLoading, error, refetch } = useChargingStations()
  const { filters, setFilters, filteredStations } = useStationFilters(
    stations || [],
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="p-6 text-center">
          <p className="text-destructive">Error loading stations</p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            className="mt-1 h-10 w-10 cursor-pointer rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80 dark:hover:bg-gray-800"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Title Section */}
          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Infrastructure
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
                Charging Stations
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage and monitor all charging stations in the network
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Create Button */}
          <Button
            size="sm"
            className="h-9 gap-2 rounded-full bg-linear-to-r from-emerald-600 to-teal-600 shadow-md transition-all hover:scale-105 hover:shadow-lg"
            onClick={() => router.push("/admin/infrastructure/ev-stations/new")}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Station</span>
          </Button>

          {/* Filters */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-full border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80"
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>

          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-full border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80"
            onClick={() => setIsExportOpen(true)}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Map View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <ChargingStationsTable
            data={filteredStations}
            selectedStations={selectedStations}
            setSelectedStations={setSelectedStations}
            filters={filters}
            setFilters={setFilters}
          />
        </TabsContent>

        <TabsContent value="map">
          <ChargingStationsMap stations={filteredStations} />
        </TabsContent>
      </Tabs>

      {/* Bulk Actions Bar */}
      {selectedStations.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedStations.length}
          onClearSelection={() => setSelectedStations([])}
          onBulkDelete={() => {
            // Handle bulk delete
            console.log("Delete stations:", selectedStations)
          }}
          onBulkDisable={() => {
            // Handle bulk disable
            console.log("Disable stations:", selectedStations)
          }}
        />
      )}

      {/* Filter Sheet */}
      <FilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        onApplyFilters={setFilters}
        stations={stations || []}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        data={filteredStations}
      />
    </div>
  )
}
