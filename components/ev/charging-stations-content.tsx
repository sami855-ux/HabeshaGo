"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Loader2, MapPin, Table, Filter, Download, Plus } from "lucide-react";
import { useChargingStations } from "@/hooks/use-charging-stations"
import { ChargingStationsTable } from "./charging-stations-table";
import { BulkActionsBar } from "@/components/ev/bulk-actions-bar";
import { useStationFilters } from "@/hooks/use-station-filters"
import { ChargingStationsMap } from "./charging-stations-map";
import { FilterSheet } from "@/components/ev/filter-sheet";
import { ExportDialog } from "@/components/ev/export-dialog"

export function ChargingStationsContent() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("table");
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  const { data: stations, isLoading, error, refetch } = useChargingStations();
  const { filters, setFilters, filteredStations } = useStationFilters(stations || []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Charging Stations</h1>
          <p className="text-muted-foreground">
            Manage and monitor all charging stations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" className="cursor-pointer" onClick={() => router.push("/admin/infrastructure/ev-stations/new") }>
            <Plus className="h-4 w-4 mr-2" />
            Create New Station
          </Button>
          <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={() => setIsExportOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
            console.log("Delete stations:", selectedStations);
          }}
          onBulkDisable={() => {
            // Handle bulk disable
            console.log("Disable stations:", selectedStations);
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
  );
}