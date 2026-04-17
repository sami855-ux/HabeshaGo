"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useChargingStations } from "@/hooks/use-charging-stations"
import { ChargingPoint, ChargingStation } from "@/types/ev"
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
import { Plus, Search } from "lucide-react"

type ChargerRow = ChargingPoint & {
  stationId: number
  stationName: string
}

type ChargerUiStatus = "AVAILABLE" | "CHARGING" | "FAULT"

const sampleChargers: ChargerRow[] = [
  {
    id: 20001,
    stationId: 9001,
    stationName: "Bole EV Hub",
    connectorType: "CCS",
    powerKw: 120,
    status: "AVAILABLE",
    chargingSpeed: "SUPER_FAST",
    slotNumber: "A-01",
    createdAt: "2026-04-01T10:00:00.000Z",
    updatedAt: "2026-04-01T10:00:00.000Z",
  },
  {
    id: 20002,
    stationId: 9001,
    stationName: "Bole EV Hub",
    connectorType: "TYPE2",
    powerKw: 60,
    status: "OCCUPIED",
    chargingSpeed: "FAST",
    slotNumber: "A-02",
    createdAt: "2026-04-01T10:00:00.000Z",
    updatedAt: "2026-04-01T10:00:00.000Z",
  },
  {
    id: 20003,
    stationId: 9002,
    stationName: "Piassa Charge Point",
    connectorType: "CHADEMO",
    powerKw: 50,
    status: "FAULTED",
    chargingSpeed: "FAST",
    slotNumber: "B-01",
    createdAt: "2026-04-01T10:00:00.000Z",
    updatedAt: "2026-04-01T10:00:00.000Z",
  },
]

const toUiStatus = (status: ChargingPoint["status"]): ChargerUiStatus => {
  if (status === "AVAILABLE") return "AVAILABLE"
  if (status === "OCCUPIED") return "CHARGING"
  return "FAULT"
}

export default function ChargersPage() {
  const router = useRouter()
  const { data, isLoading, error, refetch } = useChargingStations()

  const [searchTerm, setSearchTerm] = useState("")
  const [disabledChargerIds, setDisabledChargerIds] = useState<Set<number>>(new Set())

  const chargers = useMemo(() => {
    const stations = (data ?? []) as ChargingStation[]
    const rows = stations.flatMap((station) =>
      (station.chargingPoints ?? []).map(
        (point): ChargerRow => ({
          ...point,
          stationId: station.id,
          stationName: station.name,
        }),
      ),
    )
    return rows.length ? rows : sampleChargers
  }, [data])

  const filteredChargers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return chargers
    return chargers.filter((charger) => {
      const slot = charger.slotNumber ?? `Slot-${charger.id}`
      return (
        slot.toLowerCase().includes(term) ||
        charger.connectorType.toLowerCase().includes(term) ||
        charger.stationName.toLowerCase().includes(term)
      )
    })
  }, [chargers, searchTerm])

  const handleToggleEnabled = (chargerId: number) => {
    setDisabledChargerIds((prev) => {
      const next = new Set(prev)
      if (next.has(chargerId)) next.delete(chargerId)
      else next.add(chargerId)
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading chargers...
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
            <p className="text-destructive">Failed to load chargers.</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Chargers</h1>
          <p className="text-muted-foreground">
            Manage charging points across all stations.
          </p>
        </div>
        <Button onClick={() => router.push("/ev-charge-manager/stations")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Charger
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Charging Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by slot, connector, or station"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slot Number</TableHead>
                  <TableHead>Connector Type</TableHead>
                  <TableHead>Power (kW)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Charging Speed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChargers.length ? (
                  filteredChargers.map((charger) => {
                    const uiStatus = toUiStatus(charger.status)
                    const isDisabled = disabledChargerIds.has(charger.id)
                    return (
                      <TableRow key={charger.id}>
                        <TableCell className="font-medium">
                          {charger.slotNumber ?? `Slot-${charger.id}`}
                        </TableCell>
                        <TableCell>{charger.connectorType}</TableCell>
                        <TableCell>{charger.powerKw}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              uiStatus === "AVAILABLE"
                                ? "outline"
                                : uiStatus === "CHARGING"
                                  ? "default"
                                  : "destructive"
                            }
                          >
                            {uiStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{charger.chargingSpeed}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/ev-charge-manager/stations/${charger.stationId}`,
                                )
                              }
                            >
                              Edit Charger
                            </Button>
                            <Button
                              size="sm"
                              variant={isDisabled ? "default" : "secondary"}
                              onClick={() => handleToggleEnabled(charger.id)}
                            >
                              {isDisabled ? "Enable Charger" : "Disable Charger"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No chargers found.
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
