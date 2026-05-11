"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { Search, Activity, CheckCircle, DollarSign, Clock } from "lucide-react";

import {
  fetchAllSessions,
  endSession,
  getSessionCost,
} from "@/store/slices/parkingAdminSlice";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Sessions() {
  const dispatch = useDispatch<any>();

  const { sessions = [], loading } = useSelector((state: any) => state.parking);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchAllSessions());
  }, [dispatch]);

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    return sessions.filter((s: any) => {
      const q = searchQuery.toLowerCase();

      return (
        s?.slot?.slotNumber?.toLowerCase?.().includes(q) ||
        s?.slot?.parkingLot?.name?.toLowerCase?.().includes(q)
      );
    });
  }, [sessions, searchQuery]);

  /* ================= BADGES ================= */

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;

      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;

      case "PAID":
        return <Badge className="bg-purple-100 text-purple-800">Paid</Badge>;

      default:
        return <Badge>{status}</Badge>;
    }
  };

  /* ================= STATS ================= */

  const activeCount = sessions.filter((s: any) => s.status === "ACTIVE").length;

  const completedCount = sessions.filter(
    (s: any) => s.status === "COMPLETED",
  ).length;

  const totalRevenue = sessions.reduce((sum: number, s: any) => {
    const revenue =
      (s.durationMinutes || 0) * (s.slot?.parkingLot?.pricePerMinute || 0);

    return sum + revenue;
  }, 0);

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-semibold">Parking Sessions</h1>

        <p className="text-muted-foreground">
          Monitor and manage parking sessions
        </p>
      </div>

      {/* SEARCH */}

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

          <Input
            placeholder="Search by lot or slot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* STATS */}

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-green-600" />

            <div>
              <p className="text-2xl font-bold">{activeCount}</p>

              <p className="text-sm text-gray-500">Active Sessions</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600" />

            <div>
              <p className="text-2xl font-bold">{completedCount}</p>

              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />

            <div>
              <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>

              <p className="text-sm text-gray-500">Revenue</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-orange-600" />

            <div>
              <p className="text-2xl font-bold">{sessions.length}</p>

              <p className="text-sm text-gray-500">Total Sessions</p>
            </div>
          </div>
        </Card>
      </div>

      {/* TABLE */}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Lot</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Entry</TableHead>
              <TableHead>Exit</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center p-6">
                  Loading sessions...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center p-6">
                  No sessions found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s: any) => {
                const revenue =
                  (s.durationMinutes || 0) *
                  (s.slot?.parkingLot?.pricePerMinute || 0);

                return (
                  <TableRow key={s.id}>
                    <TableCell>#{s.id?.slice(0, 6)}</TableCell>

                    <TableCell>{s.slot?.parkingLot?.name || "-"}</TableCell>

                    <TableCell>{s.slot?.slotNumber || "-"}</TableCell>

                    <TableCell>
                      {s.entryTime
                        ? new Date(s.entryTime).toLocaleString()
                        : "-"}
                    </TableCell>

                    <TableCell>
                      {s.exitTime ? new Date(s.exitTime).toLocaleString() : "-"}
                    </TableCell>

                    <TableCell>{s.durationMinutes || 0} min</TableCell>

                    <TableCell>{getStatusBadge(s.status)}</TableCell>

                    <TableCell className="font-semibold">
                      ${revenue.toFixed(2)}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        {s.status === "ACTIVE" && (
                          <Button
                            size="sm"
                            onClick={() => dispatch(endSession(s.id))}
                          >
                            End
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            dispatch(getSessionCost(s.id)).then((res: any) => {
                              const data = res.payload;

                              alert(
                                `Cost: $${data?.cost || 0}\nDuration: ${data?.duration || 0} min`,
                              );
                            })
                          }
                        >
                          Cost
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
