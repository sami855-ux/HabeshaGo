"use client";

import { useEffect, useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { Search } from "lucide-react";

import {
  fetchAllReservations,
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  markNoShow,
} from "@/store/slices/parkingAdminSlice";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Reservations() {
  const dispatch = useDispatch<any>();

  const { reservations = [], loading } = useSelector(
    (state: any) => state.parking,
  );

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchAllReservations());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return reservations.filter((r: any) => {
      const q = searchQuery.toLowerCase();

      return (
        r?.slot?.slotNumber?.toLowerCase?.().includes(q) ||
        r?.parkingLot?.name?.toLowerCase?.().includes(q) ||
        r?.user?.email?.toLowerCase?.().includes(q)
      );
    });
  }, [reservations, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;

      case "CANCELLED":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;

      case "NO_SHOW":
        return <Badge className="bg-red-100 text-red-800">No Show</Badge>;

      case "EXPIRED":
        return <Badge className="bg-yellow-100 text-yellow-800">Expired</Badge>;

      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reservations</h1>

        <p className="text-muted-foreground">Manage parking reservations</p>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

          <Input
            placeholder="Search reservations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Lot</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center p-6">
                  Loading reservations...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center p-6">
                  No reservations found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>#{r.id?.slice(0, 6)}</TableCell>

                  <TableCell>{r.user?.email || "-"}</TableCell>

                  <TableCell>{r.parkingLot?.name || "-"}</TableCell>

                  <TableCell>{r.slot?.slotNumber || "-"}</TableCell>

                  <TableCell>
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                  </TableCell>

                  <TableCell>
                    {r.expiresAt ? new Date(r.expiresAt).toLocaleString() : "-"}
                  </TableCell>

                  <TableCell>{getStatusBadge(r.status)}</TableCell>

                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {r.status === "CONFIRMED" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => dispatch(checkInReservation(r.id))}
                          >
                            Check In
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => dispatch(cancelReservation(r.id))}
                          >
                            Cancel
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => dispatch(markNoShow(r.id))}
                          >
                            No Show
                          </Button>
                        </>
                      )}

                      {r.status === "ACTIVE" && (
                        <Button
                          size="sm"
                          onClick={() => dispatch(checkOutReservation(r.id))}
                        >
                          Check Out
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
