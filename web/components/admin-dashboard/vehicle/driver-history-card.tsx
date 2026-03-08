// app/vehicles/components/driver-history-card.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { User, Calendar } from "lucide-react"
import { format } from "date-fns"

interface DriverHistoryCardProps {
  vehicleId: string
}

export default function DriverHistoryCard({
  vehicleId,
}: DriverHistoryCardProps) {
  // Mock driver history data
  const driverHistory = [
    {
      id: "1",
      driverName: "John Smith",
      licenseNumber: "DL-123456",
      assignedDate: "2024-01-15T10:00:00Z",
      unassignedDate: "2024-02-01T14:30:00Z",
      status: "completed",
    },
    {
      id: "2",
      driverName: "Sarah Johnson",
      licenseNumber: "DL-789012",
      assignedDate: "2024-02-02T09:15:00Z",
      unassignedDate: null,
      status: "active",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Driver Assignment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead>Unassigned Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {driverHistory.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>
                  <div className="font-medium">{assignment.driverName}</div>
                  <div className="text-sm text-muted-foreground">
                    {assignment.licenseNumber}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {format(new Date(assignment.assignedDate), "MMM d, yyyy")}
                  </div>
                </TableCell>
                <TableCell>
                  {assignment.unassignedDate ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {format(
                        new Date(assignment.unassignedDate),
                        "MMM d, yyyy",
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      assignment.status === "active" ? "default" : "secondary"
                    }
                  >
                    {assignment.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
