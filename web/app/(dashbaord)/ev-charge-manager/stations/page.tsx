"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useChargingStations } from "@/hooks/use-charging-stations"
import { ChargingStation } from "@/types/ev"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Building2, Plus, Search, Star, Zap } from "lucide-react"

const formatRating = (value: number) => value.toFixed(1)

const sampleStations: ChargingStation[] = [
  {
    id: 9001,
    name: "Bole EV Hub",
    address: "Bole Road, Near Edna Mall",
    city: "Addis Ababa",
    lat: 8.997,
    lng: 38.7868,
    status: "ACTIVE",
    isVerified: true,
    chargingPoints: [
      {
        id: 10001,
        stationId: 9001,
        connectorType: "CCS",
        powerKw: 120,
        status: "AVAILABLE",
        chargingSpeed: "SUPER_FAST",
        createdAt: "2026-04-01T10:00:00.000Z",
        updatedAt: "2026-04-01T10:00:00.000Z",
      },
      {
        id: 10002,
        stationId: 9001,
        connectorType: "TYPE2",
        powerKw: 60,
        status: "OCCUPIED",
        chargingSpeed: "FAST",
        createdAt: "2026-04-01T10:00:00.000Z",
        updatedAt: "2026-04-01T10:00:00.000Z",
      },
    ],
    tariffs: [],
    sessions: [
      {
        id: 11001,
        vehicleId: 1,
        stationId: 9001,
        chargingPointId: 10001,
        startTime: "2026-04-02T09:00:00.000Z",
        status: "ACTIVE",
        userId: "user-1",
        createdAt: "2026-04-02T09:00:00.000Z",
        updatedAt: "2026-04-02T09:00:00.000Z",
      },
    ],
    ratings: [
      {
        id: 12001,
        userId: "user-11",
        stationId: 9001,
        score: 5,
        comment: "Great location and fast charging.",
        createdAt: "2026-04-02T10:00:00.000Z",
        updatedAt: "2026-04-02T10:00:00.000Z",
      },
    ],
    documents: [],
    images: [],
    createdAt: "2026-04-01T08:00:00.000Z",
    updatedAt: "2026-04-02T10:00:00.000Z",
  },
  {
    id: 9002,
    name: "Piassa Charge Point",
    address: "Churchill Avenue",
    city: "Addis Ababa",
    lat: 9.034,
    lng: 38.7484,
    status: "INACTIVE",
    isVerified: false,
    chargingPoints: [
      {
        id: 10003,
        stationId: 9002,
        connectorType: "CHADEMO",
        powerKw: 50,
        status: "OFFLINE",
        chargingSpeed: "FAST",
        createdAt: "2026-04-01T10:00:00.000Z",
        updatedAt: "2026-04-01T10:00:00.000Z",
      },
    ],
    tariffs: [],
    sessions: [],
    ratings: [],
    documents: [],
    images: [],
    createdAt: "2026-04-01T08:00:00.000Z",
    updatedAt: "2026-04-01T08:00:00.000Z",
  },
  {
    id: 9003,
    name: "Megenagna Fast Charge",
    address: "Megenagna Square",
    city: "Addis Ababa",
    lat: 9.0192,
    lng: 38.8091,
    status: "ACTIVE",
    isVerified: true,
    chargingPoints: [
      {
        id: 10004,
        stationId: 9003,
        connectorType: "CCS",
        powerKw: 150,
        status: "AVAILABLE",
        chargingSpeed: "SUPER_FAST",
        createdAt: "2026-04-01T10:00:00.000Z",
        updatedAt: "2026-04-01T10:00:00.000Z",
      },
      {
        id: 10005,
        stationId: 9003,
        connectorType: "TYPE2",
        powerKw: 22,
        status: "AVAILABLE",
        chargingSpeed: "SLOW",
        createdAt: "2026-04-01T10:00:00.000Z",
        updatedAt: "2026-04-01T10:00:00.000Z",
      },
    ],
    tariffs: [],
    sessions: [],
    ratings: [
      {
        id: 12002,
        userId: "user-22",
        stationId: 9003,
        score: 4,
        comment: "Clean station.",
        createdAt: "2026-04-02T10:00:00.000Z",
        updatedAt: "2026-04-02T10:00:00.000Z",
      },
    ],
    documents: [],
    images: [],
    createdAt: "2026-04-01T08:00:00.000Z",
    updatedAt: "2026-04-02T10:00:00.000Z",
  },
]

const getAverageRating = (station: ChargingStation) => {
  if (!station.ratings?.length) return 0
  const total = station.ratings.reduce((sum, item) => sum + item.score, 0)
  return total / station.ratings.length
}

const getActiveSessions = (station: ChargingStation) =>
  station.sessions?.filter((session) => session.status === "ACTIVE").length ?? 0

export default function StationsPage() {
  const router = useRouter()
  const { data, isLoading, error, refetch } = useChargingStations()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">(
    "ALL",
  )
  const [verifiedFilter, setVerifiedFilter] = useState<"ALL" | "YES" | "NO">("ALL")
  const [cityFilter, setCityFilter] = useState("ALL")

  const stations = useMemo(() => {
    const apiStations = (data ?? []) as ChargingStation[]
    return apiStations.length ? apiStations : sampleStations
  }, [data])

  const cityOptions = useMemo(() => {
    const uniqueCities = new Set(
      stations.map((station) => station.city?.trim()).filter(Boolean) as string[],
    )
    return Array.from(uniqueCities).sort((a, b) => a.localeCompare(b))
  }, [stations])

  const filteredStations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return stations.filter((station) => {
      const matchesSearch =
        !term ||
        station.name.toLowerCase().includes(term) ||
        (station.city ?? "").toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === "ALL" ? true : station.status === statusFilter

      const matchesVerified =
        verifiedFilter === "ALL"
          ? true
          : verifiedFilter === "YES"
            ? station.isVerified
            : !station.isVerified

      const matchesCity =
        cityFilter === "ALL" ? true : (station.city ?? "") === cityFilter

      return matchesSearch && matchesStatus && matchesVerified && matchesCity
    })
  }, [stations, searchTerm, statusFilter, verifiedFilter, cityFilter])

  const summary = useMemo(() => {
    const totalStations = filteredStations.length
    const activeStations = filteredStations.filter(
      (station) => station.status === "ACTIVE",
    ).length
    const verifiedStations = filteredStations.filter(
      (station) => station.isVerified,
    ).length

    const avgRating =
      totalStations > 0
        ? filteredStations.reduce((sum, station) => sum + getAverageRating(station), 0) /
          totalStations
        : 0

    return { totalStations, activeStations, verifiedStations, avgRating }
  }, [filteredStations])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading stations...
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-destructive">Failed to load stations.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stations</h1>
          <p className="text-muted-foreground">
            Monitor and manage charging stations across cities.
          </p>
        </div>
        <Button onClick={() => router.push("/admin/infrastructure/ev-stations/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Station
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Stations</p>
              <p className="text-2xl font-bold">{summary.totalStations}</p>
            </div>
            <Building2 className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Stations</p>
              <p className="text-2xl font-bold">{summary.activeStations}</p>
            </div>
            <Zap className="h-5 w-5 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Verified Stations</p>
              <p className="text-2xl font-bold">{summary.verifiedStations}</p>
            </div>
            <Badge variant="outline">Yes</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-2xl font-bold">
                {summary.avgRating > 0 ? formatRating(summary.avgRating) : "-"}
              </p>
            </div>
            <Star className="h-5 w-5 text-amber-500" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or city"
              className="pl-9"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value: "ALL" | "ACTIVE" | "INACTIVE") =>
              setStatusFilter(value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">ACTIVE</SelectItem>
              <SelectItem value="INACTIVE">INACTIVE</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={verifiedFilter}
            onValueChange={(value: "ALL" | "YES" | "NO") => setVerifiedFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Verified" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Verification</SelectItem>
              <SelectItem value="YES">Yes</SelectItem>
              <SelectItem value="NO">No</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Cities</SelectItem>
              {cityOptions.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stations List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Number of Chargers</TableHead>
                  <TableHead>Active Sessions</TableHead>
                  <TableHead>Average Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStations.length ? (
                  filteredStations.map((station) => (
                    <TableRow key={station.id}>
                      <TableCell className="font-medium">{station.name}</TableCell>
                      <TableCell>{station.city ?? "-"}</TableCell>
                      <TableCell>{station.address ?? "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            station.status === "ACTIVE" ? "default" : "secondary"
                          }
                        >
                          {station.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={station.isVerified ? "outline" : "secondary"}>
                          {station.isVerified ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>{station.chargingPoints?.length ?? 0}</TableCell>
                      <TableCell>{getActiveSessions(station)}</TableCell>
                      <TableCell>
                        {station.ratings?.length
                          ? formatRating(getAverageRating(station))
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/ev-charge-manager/stations/${station.id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No stations found with the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
