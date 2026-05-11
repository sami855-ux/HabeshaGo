"use client"

import { useState } from "react";
import { Calendar, MapPin, Clock, XCircle, CheckCircle, LogIn, LogOut } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { cn } from "../../../../lib/utils";

// Mock data - replace with API: GET /api/parking/reservations/me
const mockReservations = [
  {
    id: "RES-001",
    lotName: "Morningstar Plaza",
    slotNumber: "A1",
    startTime: "2026-04-25T14:00:00",
    endTime: "2026-04-25T18:00:00",
    status: "confirmed",
    cost: 20.0,
  },
  {
    id: "RES-002",
    lotName: "Airport Parking",
    slotNumber: "L5",
    startTime: "2026-04-22T09:00:00",
    endTime: "2026-04-23T09:00:00",
    status: "active",
    cost: 192.0,
  },
  {
    id: "RES-003",
    lotName: "Mall Center",
    slotNumber: "M12",
    startTime: "2026-04-21T10:00:00",
    endTime: "2026-04-21T14:00:00",
    status: "completed",
    cost: 16.0,
  },
];

export default function MyReservations() {
  const [reservations, setReservations] = useState(mockReservations);
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredReservations = reservations.filter((res) =>
    statusFilter === "all" || res.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "completed":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // API Integration functions
  const handleCheckIn = async (reservationId: string) => {
    // POST /api/parking/reservations/:id/check-in
    console.log("Check-in:", reservationId);
  };

  const handleCheckOut = async (reservationId: string) => {
    // POST /api/parking/reservations/:id/check-out
    console.log("Check-out:", reservationId);
  };

  const handleCancel = async (reservationId: string) => {
    // PATCH /api/parking/reservations/:id/cancel
    console.log("Cancel:", reservationId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Reservations</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Manage your parking reservations
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          New Reservation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold mt-1">{reservations.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">
            {reservations.filter(r => r.status === "confirmed").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {reservations.filter(r => r.status === "active").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          <p className="text-2xl font-bold mt-1 text-gray-600">
            {reservations.filter(r => r.status === "completed").length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{reservation.id}</h3>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize",
                        getStatusColor(reservation.status)
                      )}
                    >
                      {reservation.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {reservation.lotName} - Slot {reservation.slotNumber}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${reservation.cost.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Total Cost</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Start Time</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(reservation.startTime)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">End Time</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(reservation.endTime)}
                </p>
              </div>
            </div>

            {/* Actions */}
            {reservation.status === "confirmed" && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleCheckIn(reservation.id)}
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Check In
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleCancel(reservation.id)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            )}
            {reservation.status === "active" && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleCheckOut(reservation.id)}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Check Out
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No reservations found.
        </div>
      )}
    </div>
  );
}
