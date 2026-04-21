"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Search,
  RefreshCw,
  Zap,
  MapPin,
  Activity,
  ChevronLeft,
  AlertCircle,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { axiosInstance } from "@/services/axiosInstance"
import { ModernAlert } from "@/components/ui/modern-alert"
import { ChargersTable } from "@/components/ev-owner/ChargersTable"

// Types
export type ChargingPoint = {
  id: number
  stationId: number
  connectorType: string
  powerKw: number
  status: "AVAILABLE" | "OCCUPIED" | "FAULTED" | "OFFLINE"
  slotNumber?: string
  chargingSpeed: "SUPER_FAST" | "FAST" | "SLOW" | "ULTRA_FAST"
  averageSessionDuration?: number
  maxVoltage?: number
  maxCurrent?: number
  createdAt: string
  isAvailable: boolean
  isFastCharger: boolean
  stationName: string
  stationAddress?: string
  stationCity?: string
  stationLat?: number
  stationLng?: number
  stationStatus?: string
  stationVerified?: boolean
}

export type ChargerRow = ChargingPoint
export type ChargerUiStatus = "AVAILABLE" | "CHARGING" | "FAULT" | "OFFLINE"

// API functions
const fetchChargers = async (): Promise<ChargerRow[]> => {
  try {
    const response = await axiosInstance.get("/ev/station/points")
    return response.data?.data || response.data
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch chargers",
    )
  }
}

const toggleChargerStatus = async ({
  id,
  enabled,
}: {
  id: number
  enabled: boolean
}) => {
  const response = await fetch(`/api/chargers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to update charger")
  }
  const data = await response.json()
  return data.data || data
}

// Helper function to map status to UI status
export const toUiStatus = (
  status: ChargingPoint["status"],
): ChargerUiStatus => {
  switch (status) {
    case "AVAILABLE":
      return "AVAILABLE"
    case "OCCUPIED":
      return "CHARGING"
    case "FAULTED":
      return "FAULT"
    case "OFFLINE":
      return "OFFLINE"
    default:
      return "FAULT"
  }
}

// Stats cards component
const StatsCards = ({ chargers }: { chargers: ChargerRow[] }) => {
  const stats = useMemo(() => {
    const total = chargers.length
    const available = chargers.filter(
      (c) => c.status === "AVAILABLE" && c.isAvailable,
    ).length
    const charging = chargers.filter((c) => c.status === "OCCUPIED").length
    const fault = chargers.filter((c) => c.status === "FAULTED").length
    const offline = chargers.filter(
      (c) => c.status === "OFFLINE" || !c.isAvailable,
    ).length
    const totalPower = chargers.reduce((sum, c) => sum + c.powerKw, 0)
    const fastChargers = chargers.filter((c) => c.isFastCharger).length

    return {
      total,
      available,
      charging,
      fault,
      offline,
      totalPower,
      fastChargers,
    }
  }, [chargers])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="border-blue-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Chargers
              </p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Zap className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Available
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.available}
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Sessions
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.charging}
              </p>
            </div>
            <MapPin className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Fast Chargers
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.fastChargers}
              </p>
            </div>
            <Zap className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Capacity
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {stats.totalPower} kW
              </p>
            </div>
            <Zap className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main component
export default function ChargersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [connectorFilter, setConnectorFilter] = useState("ALL")
  const [showDisableAlert, setShowDisableAlert] = useState(false)
  const [selectedCharger, setSelectedCharger] = useState<ChargerRow | null>(
    null,
  )

  // React Query: Fetch chargers
  const {
    data: chargers = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["chargers"],
    queryFn: fetchChargers,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  // React Query: Toggle charger status mutation
  const toggleMutation = useMutation({
    mutationFn: toggleChargerStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chargers"] })
      setShowDisableAlert(false)
      setSelectedCharger(null)
    },
  })

  const handleToggleEnabled = (charger: ChargerRow) => {
    setSelectedCharger(charger)
    setShowDisableAlert(true)
  }

  const confirmToggle = () => {
    if (selectedCharger) {
      const isDisabled = !selectedCharger.isAvailable
      toggleMutation.mutate({ id: selectedCharger.id, enabled: !isDisabled })
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  // Filter data based on status and connector type
  const filteredData = useMemo(() => {
    let filtered = [...chargers]

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((charger) => {
        const uiStatus = toUiStatus(charger.status)
        return uiStatus === statusFilter
      })
    }

    if (connectorFilter !== "ALL") {
      filtered = filtered.filter(
        (charger) => charger.connectorType === connectorFilter,
      )
    }

    return filtered
  }, [chargers, statusFilter, connectorFilter])

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <TableSkeleton />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load chargers"}
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => refetch()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="mt-1 h-10 w-10 cursor-pointer rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                EV Infrastructure
              </p>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Charging Points
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage charging points across all stations.
                {chargers.length > 0 && ` ${chargers.length} total chargers`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="secondary"
            className="hidden items-center gap-2 rounded-full px-3 py-1.5 sm:flex bg-blue-50 text-blue-700 border-blue-200"
          >
            <span className="text-xs font-medium">
              Active{" "}
              {
                chargers.filter(
                  (c) => c.status === "AVAILABLE" && c.isAvailable,
                ).length
              }
            </span>
          </Badge>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-full border-blue-200 bg-white shadow-sm hover:bg-blue-50"
            onClick={handleRefresh}
            disabled={isRefetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            size="sm"
            className="h-9 gap-2 rounded-full bg-blue-600 shadow-md transition-all hover:bg-blue-700"
            onClick={() =>
              router.push("/ev-charge-manager/chargers/new-charger-point")
            }
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Charger</span>
          </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <StatsCards chargers={chargers} />

      {/* Main Content */}
      <Card className="border-blue-100 shadow-none border-none">
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
              <Input
                className="pl-9 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Search by slot, connector, station, or location..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-blue-200 focus:ring-blue-500">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="CHARGING">Charging</SelectItem>
                <SelectItem value="FAULT">Fault</SelectItem>
                <SelectItem value="OFFLINE">Offline</SelectItem>
              </SelectContent>
            </Select>

            <Select value={connectorFilter} onValueChange={setConnectorFilter}>
              <SelectTrigger className="w-[180px] border-blue-200 focus:ring-blue-500">
                <SelectValue placeholder="Connector Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Connectors</SelectItem>
                <SelectItem value="CCS">CCS</SelectItem>
                <SelectItem value="TYPE2">TYPE2</SelectItem>
                <SelectItem value="CHADEMO">CHADEMO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ChargersTable
            data={filteredData}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            onToggleStatus={handleToggleEnabled}
            isToggling={toggleMutation.isPending}
            togglingId={toggleMutation.variables?.id}
          />
        </CardContent>
      </Card>

      {/* Modern Alert Dialog for Enable/Disable Confirmation */}
      <ModernAlert
        open={showDisableAlert}
        onOpenChange={setShowDisableAlert}
        title={
          selectedCharger?.isAvailable ? "Disable Charger" : "Enable Charger"
        }
        description={
          selectedCharger?.isAvailable ? (
            <>
              Are you sure you want to disable charger{" "}
              <span className="font-semibold">
                {selectedCharger?.slotNumber || `Slot-${selectedCharger?.id}`}
              </span>{" "}
              at{" "}
              <span className="font-semibold">
                {selectedCharger?.stationName}
              </span>
              ?
              <br />
              This will make it unavailable for new charging sessions.
            </>
          ) : (
            <>
              Are you sure you want to enable charger{" "}
              <span className="font-semibold">
                {selectedCharger?.slotNumber || `Slot-${selectedCharger?.id}`}
              </span>{" "}
              at{" "}
              <span className="font-semibold">
                {selectedCharger?.stationName}
              </span>
              ?
              <br />
              This will make it available for charging sessions again.
            </>
          )
        }
        type={selectedCharger?.isAvailable ? "warning" : "success"}
        confirmLabel={selectedCharger?.isAvailable ? "Disable" : "Enable"}
        cancelLabel="Cancel"
        onConfirm={confirmToggle}
        onCancel={() => {
          setShowDisableAlert(false)
          setSelectedCharger(null)
        }}
        isConfirming={toggleMutation.isPending}
        confirmText={selectedCharger?.isAvailable ? "Disabling" : "Enabling"}
      />
    </div>
  )
}

// Loading skeleton component
const TableSkeleton = () => (
  <div className="rounded-md border border-blue-100">
    <table className="w-full">
      <thead className="bg-blue-50">
        <tr>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <th key={i} className="px-4 py-3">
              <Skeleton className="h-4 w-20 bg-blue-100" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[1, 2, 3, 4, 5].map((i) => (
          <tr key={i} className="border-b border-blue-100">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((j) => (
              <td key={j} className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
