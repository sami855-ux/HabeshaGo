import { BusIcon, Users, MapPin, Eye, Edit, MoreVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { Bus } from "@/types/bus"
import {
  ColorfulStatusBadge,
  ColorfulUnassignedBadge,
  ColorfulNoRouteBadge,
} from "./badge-utils"
import { Badge } from "@/components/ui/badge"

interface MobileBusCardProps {
  bus: Bus
  isSelected: boolean
  onSelect: (id: number) => void
}

export default function MobileBusCard({
  bus,
  isSelected,
  onSelect,
}: MobileBusCardProps) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start gap-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(bus.id)}
              aria-label="Select bus"
              className="mt-1"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BusIcon className="h-4 w-4" />
                <h3 className="font-semibold">{bus.busNumber}</h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{bus.capacity} seats</span>
              </div>
            </div>
          </div>
          <ColorfulStatusBadge status={bus.status} />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Driver:</span>
            {bus.driverName ? (
              <span className="font-medium">{bus.driverName}</span>
            ) : (
              <ColorfulUnassignedBadge />
            )}
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Route:</span>
            {bus.routeName ? (
              <Badge variant="secondary">Route {bus.routeName}</Badge>
            ) : (
              <ColorfulNoRouteBadge />
            )}
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Stop:</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {bus.currentStop || "N/A"}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => (window.location.href = `/admin/buses/${bus.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
