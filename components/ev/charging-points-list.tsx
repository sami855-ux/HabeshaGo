// components/charging-stations/charging-points-list.tsx
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Zap,
  Power,
  Gauge,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChargingPointsListProps {
  chargingPoints: any[];
}

export function ChargingPointsList({ chargingPoints }: ChargingPointsListProps) {
  const statusConfig = {
    AVAILABLE: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-100", badge: "bg-green-500" },
    OCCUPIED: { icon: Zap, color: "text-blue-500", bg: "bg-blue-100", badge: "bg-blue-500" },
    FAULTED: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-100", badge: "bg-yellow-500" },
    OFFLINE: { icon: Power, color: "text-gray-500", bg: "bg-gray-100", badge: "bg-gray-500" },
  };

  return (
    <Card className="p-6 shadow-none">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Zap className="h-6 w-6 text-primary" />
        Charging Points
      </h2>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Connector</TableHead>
              <TableHead>Power</TableHead>
              <TableHead>Speed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Specs</TableHead>
              <TableHead>Avg. Session</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chargingPoints.map((point) => {
              const StatusIcon = statusConfig[point.status].icon;
              return (
                <TableRow key={point.id}>
                  <TableCell className="font-medium">#{point.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{point.connectorType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      {point.powerKw} kW
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      point.chargingSpeed === "SUPER_FAST" && "bg-purple-500",
                      point.chargingSpeed === "FAST" && "bg-blue-500",
                      point.chargingSpeed === "SLOW" && "bg-green-500",
                    )}>
                      {point.chargingSpeed}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-white", statusConfig[point.status].badge)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {point.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{point.slotNumber || "N/A"}</TableCell>
                  <TableCell>
                    {point.maxVoltage && point.maxCurrent && (
                      <span className="text-xs text-muted-foreground">
                        {point.maxVoltage}V / {point.maxCurrent}A
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {point.averageSessionDuration && (
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        {point.averageSessionDuration} min
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}