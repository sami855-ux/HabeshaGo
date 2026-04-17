"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Search,
  WifiOff,
  RefreshCw,
  Zap,
  MapPin,
  Activity,
  ChevronLeft,
  ChevronRight,
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

// Types
type ChargingPoint = {
  id: number
  connectorType: string
  powerKw: number
  status: "AVAILABLE" | "OCCUPIED" | "FAULTED" | "OFFLINE"
  chargingSpeed: "SUPER_FAST" | "FAST" | "SLOW" | "ULTRA_FAST"
  slotNumber?: string
  createdAt: string
  updatedAt: string
  enabled?: boolean
}

type ChargingStation = {
  id: number
  name: string
  location?: string
  chargingPoints: ChargingPoint[]
}

type ChargerRow = ChargingPoint & {
  stationId: number
  stationName: string
  stationLocation?: string
}

type ChargerUiStatus = "AVAILABLE" | "CHARGING" | "FAULT" | "OFFLINE"

// Mock Data
const MOCK_STATIONS: ChargingStation[] = [
  {
    id: 1,
    name: "Green Valley EV Hub",
    location: "123 Green Street, Downtown",
    chargingPoints: [
      {
        id: 101,
        connectorType: "CCS",
        powerKw: 150,
        status: "AVAILABLE",
        chargingSpeed: "ULTRA_FAST",
        slotNumber: "A-01",
        enabled: true,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: 102,
        connectorType: "CCS",
        powerKw: 150,
        status: "OCCUPIED",
        chargingSpeed: "ULTRA_FAST",
        slotNumber: "A-02",
        enabled: true,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: 103,
        connectorType: "TYPE2",
        powerKw: 22,
        status: "AVAILABLE",
        chargingSpeed: "FAST",
        slotNumber: "A-03",
        enabled: true,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
    ],
  },
  {
    id: 2,
    name: "Emerald Charge Point",
    location: "456 Park Avenue",
    chargingPoints: [
      {
        id: 201,
        connectorType: "CHADEMO",
        powerKw: 50,
        status: "FAULTED",
        chargingSpeed: "FAST",
        slotNumber: "B-01",
        enabled: false,
        createdAt: "2024-02-20T10:00:00Z",
        updatedAt: "2024-02-20T10:00:00Z",
      },
      {
        id: 202,
        connectorType: "CCS",
        powerKw: 120,
        status: "AVAILABLE",
        chargingSpeed: "SUPER_FAST",
        slotNumber: "B-02",
        enabled: true,
        createdAt: "2024-02-20T10:00:00Z",
        updatedAt: "2024-02-20T10:00:00Z",
      },
      {
        id: 203,
        connectorType: "TYPE2",
        powerKw: 11,
        status: "OCCUPIED",
        chargingSpeed: "SLOW",
        slotNumber: "B-03",
        enabled: true,
        createdAt: "2024-02-20T10:00:00Z",
        updatedAt: "2024-02-20T10:00:00Z",
      },
      {
        id: 204,
        connectorType: "CCS",
        powerKw: 120,
        status: "AVAILABLE",
        chargingSpeed: "SUPER_FAST",
        slotNumber: "B-04",
        enabled: true,
        createdAt: "2024-02-20T10:00:00Z",
        updatedAt: "2024-02-20T10:00:00Z",
      },
    ],
  },
  {
    id: 3,
    name: "Sustainable Energy Station",
    location: "789 Eco Boulevard",
    chargingPoints: [
      {
        id: 301,
        connectorType: "CCS",
        powerKw: 180,
        status: "AVAILABLE",
        chargingSpeed: "ULTRA_FAST",
        slotNumber: "C-01",
        enabled: true,
        createdAt: "2024-03-10T10:00:00Z",
        updatedAt: "2024-03-10T10:00:00Z",
      },
      {
        id: 302,
        connectorType: "TYPE2",
        powerKw: 22,
        status: "OCCUPIED",
        chargingSpeed: "FAST",
        slotNumber: "C-02",
        enabled: true,
        createdAt: "2024-03-10T10:00:00Z",
        updatedAt: "2024-03-10T10:00:00Z",
      },
      {
        id: 303,
        connectorType: "CCS",
        powerKw: 180,
        status: "OFFLINE",
        chargingSpeed: "ULTRA_FAST",
        slotNumber: "C-03",
        enabled: false,
        createdAt: "2024-03-10T10:00:00Z",
        updatedAt: "2024-03-10T10:00:00Z",
      },
    ],
  },
]

// Helper function to convert stations to charger rows
const getMockChargers = (): ChargerRow[] => {
  return MOCK_STATIONS.flatMap((station) =>
    station.chargingPoints.map((point) => ({
      ...point,
      stationId: station.id,
      stationName: station.name,
      stationLocation: station.location,
    })),
  )
}

// Status badge component with green/emerald theme
const StatusBadge = ({ status }: { status: ChargerUiStatus }) => {
  const variants = {
    AVAILABLE: {
      variant: "outline" as const,
      label: "Available",
      className: "border-emerald-200 text-emerald-600 bg-emerald-50",
    },
    CHARGING: {
      variant: "default" as const,
      label: "Charging",
      className: "bg-green-600 hover:bg-green-700",
    },
    FAULT: {
      variant: "destructive" as const,
      label: "Fault",
      className: "bg-red-600",
    },
    OFFLINE: {
      variant: "secondary" as const,
      label: "Offline",
      className: "bg-gray-400",
    },
  }

  const config = variants[status] || variants.FAULT

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}

// Loading skeleton
const TableSkeleton = () => (
  <div className="rounded-md border border-emerald-100">
    <Table>
      <TableHeader className="bg-emerald-50">
        <TableRow>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <TableHead key={i}>
              <Skeleton className="h-4 w-20 bg-emerald-100" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3, 4, 5].map((i) => (
          <TableRow key={i}>
            {[1, 2, 3, 4, 5, 6, 7].map((j) => (
              <TableCell key={j}>
                <Skeleton className="h-4 w-24" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
)

// Filter bar component
const FilterBar = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  connectorFilter,
  setConnectorFilter,
}: any) => {
  const connectors = ["ALL", "CCS", "TYPE2", "CHADEMO"]

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
        <Input
          className="pl-9 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
          placeholder="Search by slot, connector, or station..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px] border-emerald-200 focus:ring-emerald-500">
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
        <SelectTrigger className="w-[180px] border-emerald-200 focus:ring-emerald-500">
          <SelectValue placeholder="Connector Type" />
        </SelectTrigger>
        <SelectContent>
          {connectors.map((connector) => (
            <SelectItem key={connector} value={connector}>
              {connector === "ALL" ? "All Connectors" : connector}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// Stats cards component
const StatsCards = ({ chargers }: { chargers: ChargerRow[] }) => {
  const stats = useMemo(() => {
    const total = chargers.length
    const available = chargers.filter(
      (c) => c.status === "AVAILABLE" && c.enabled !== false,
    ).length
    const charging = chargers.filter((c) => c.status === "OCCUPIED").length
    const fault = chargers.filter((c) => c.status === "FAULTED").length
    const offline = chargers.filter(
      (c) => c.status === "OFFLINE" || c.enabled === false,
    ).length
    const totalPower = chargers.reduce((sum, c) => sum + c.powerKw, 0)

    return { total, available, charging, fault, offline, totalPower }
  }, [chargers])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-emerald-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Chargers
              </p>
              <p className="text-2xl font-bold text-emerald-900">
                {stats.total}
              </p>
            </div>
            <Zap className="h-8 w-8 text-emerald-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Available
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {stats.available}
              </p>
            </div>
            <Activity className="h-8 w-8 text-emerald-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Sessions
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.charging}
              </p>
            </div>
            <MapPin className="h-8 w-8 text-emerald-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Capacity
              </p>
              <p className="text-2xl font-bold text-emerald-900">
                {stats.totalPower} kW
              </p>
            </div>
            <Zap className="h-8 w-8 text-emerald-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main component
export default function ChargersPage() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [connectorFilter, setConnectorFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [disabledChargerIds, setDisabledChargerIds] = useState<Set<number>>(
    new Set(),
  )
  const itemsPerPage = 10

  // Use mock data
  const chargers = useMemo(() => getMockChargers(), [])

  const handleToggleEnabled = (chargerId: number) => {
    setDisabledChargerIds((prev) => {
      const next = new Set(prev)
      if (next.has(chargerId)) next.delete(chargerId)
      else next.add(chargerId)
      return next
    })
  }

  const filteredChargers = useMemo(() => {
    let filtered = chargers.map((charger) => ({
      ...charger,
      enabled: !disabledChargerIds.has(charger.id),
    }))

    const term = searchTerm.trim().toLowerCase()
    if (term) {
      filtered = filtered.filter((charger) => {
        const slot = charger.slotNumber ?? `Slot-${charger.id}`
        return (
          slot.toLowerCase().includes(term) ||
          charger.connectorType.toLowerCase().includes(term) ||
          charger.stationName.toLowerCase().includes(term) ||
          charger.stationLocation?.toLowerCase().includes(term)
        )
      })
    }

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
  }, [chargers, searchTerm, statusFilter, connectorFilter, disabledChargerIds])

  // Pagination
  const totalPages = Math.ceil(filteredChargers.length / itemsPerPage)
  const paginatedChargers = filteredChargers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

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
        <StatsCards chargers={[]} />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <TableSkeleton />
          </CardContent>
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

          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                EV Infrastructure
              </p>
              <h1 className=" text-2xl font-bold tracking-tight md:text-3xl">
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
          {/* Quick Stats Badge */}
          <Badge
            variant="secondary"
            className="hidden items-center gap-2 rounded-full px-3 py-1.5 sm:flex bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            <span className="text-xs font-medium">
              Active{" "}
              {
                chargers.filter(
                  (c) => c.status === "AVAILABLE" && c.enabled !== false,
                ).length
              }
            </span>
          </Badge>

          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-full border-emerald-200 bg-white shadow-sm hover:bg-emerald-50 dark:border-gray-800 dark:bg-gray-900/80"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            size="sm"
            className="h-9 gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 shadow-md transition-all hover:scale-105 hover:shadow-lg"
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
      <Card className="border-emerald-100 shadow-none border-none">
        <CardContent className="space-y-4 pt-6">
          <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            connectorFilter={connectorFilter}
            setConnectorFilter={setConnectorFilter}
          />

          <div className="rounded-md border border-emerald-100 overflow-x-auto">
            <Table>
              <TableHeader className="bg-emerald-50">
                <TableRow>
                  <TableHead className="text-emerald-900">
                    Slot Number
                  </TableHead>
                  <TableHead className="text-emerald-900">Station</TableHead>
                  <TableHead className="text-emerald-900">Location</TableHead>
                  <TableHead className="text-emerald-900">
                    Connector Type
                  </TableHead>
                  <TableHead className="text-emerald-900">Power (kW)</TableHead>
                  <TableHead className="text-emerald-900">Status</TableHead>
                  <TableHead className="text-emerald-900">
                    Charging Speed
                  </TableHead>
                  <TableHead className="text-right text-emerald-900">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedChargers.length > 0 ? (
                  paginatedChargers.map((charger) => {
                    const uiStatus = toUiStatus(charger.status)
                    const isDisabled = !charger.enabled

                    return (
                      <TableRow
                        key={charger.id}
                        className="hover:bg-emerald-50/50"
                      >
                        <TableCell className="font-medium ">
                          {charger.slotNumber ?? `Slot-${charger.id}`}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            className="p-0 h-auto font-normal "
                            onClick={() =>
                              router.push(
                                `/ev-charge-manager/stations/${charger.stationId}`,
                              )
                            }
                          >
                            {charger.stationName}
                          </Button>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {charger.stationLocation}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-emerald-00 text-emerald-700"
                          >
                            {charger.connectorType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {charger.powerKw} kW
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={uiStatus} />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-700"
                          >
                            {charger.chargingSpeed.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/ev-charge-manager/stations/${charger.stationId}?chargerId=${charger.id}`,
                                )
                              }
                              className="border-emerald-200 hover:bg-emerald-50"
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant={isDisabled ? "default" : "secondary"}
                              onClick={() => handleToggleEnabled(charger.id)}
                              className={
                                !isDisabled
                                  ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                  : "bg-gradient-to-r from-emerald-600 to-green-600"
                              }
                            >
                              {isDisabled ? "Enable" : "Disable"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <WifiOff className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No chargers found.
                        </p>
                        {(searchTerm ||
                          statusFilter !== "ALL" ||
                          connectorFilter !== "ALL") && (
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchTerm("")
                              setStatusFilter("ALL")
                              setConnectorFilter("ALL")
                            }}
                            className="text-emerald-600"
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredChargers.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredChargers.length)}{" "}
                of {filteredChargers.length} chargers
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="border-emerald-200 hover:bg-emerald-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="border-emerald-200 hover:bg-emerald-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to map status to UI status
const toUiStatus = (status: ChargingPoint["status"]): ChargerUiStatus => {
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
