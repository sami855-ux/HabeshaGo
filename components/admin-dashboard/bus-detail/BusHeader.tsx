import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Users, MapPin, Clock } from "lucide-react"
import type { Bus } from "@/types/bus"

interface BusHeaderProps {
  bus: Bus
}

export function BusHeader({ bus }: BusHeaderProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const statusConfig = {
    ACTIVE: { label: "Active", variant: "default" as const },
    INACTIVE: { label: "Inactive", variant: "secondary" as const },
    MAINTENANCE: { label: "Maintenance", variant: "destructive" as const },
  }

  const status = statusConfig[bus.status]

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Bus {bus.busNumber}
              </h1>
              <Badge variant={status.variant}>{status.label}</Badge>
              {bus.isActive && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-muted-foreground">Live</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Capacity: {bus.capacity} seats</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>Since {new Date(bus.createdAt).getFullYear()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-right">
            {bus.currentStop && bus.nextDestination && (
              <div className="flex items-center justify-end gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {bus.currentStop} → {bus.nextDestination}
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Updated {formatDate(bus.updatedAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
