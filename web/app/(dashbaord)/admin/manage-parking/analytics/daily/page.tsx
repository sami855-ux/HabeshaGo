"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchDailyReport } from "@/store/slices/parkingAdminSlice";

export default function DailyReport() {
  const dispatch = useDispatch<any>();
  const { report: dailyReport, loading } = useSelector(
    (state: any) => state.parking,
  );

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    dispatch(fetchDailyReport(date));
  }, [dispatch, date]);

  const sessions = dailyReport?.sessions || [];

  const totalRevenue = dailyReport?.totalRevenue || 0;
  const totalSessions = dailyReport?.totalSessions || 0;

  const avgDuration =
    sessions.length > 0
      ? Math.round(
          sessions.reduce(
            (sum: number, s: any) => sum + (s.durationMinutes || 0),
            0,
          ) / sessions.length,
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Daily Report</h1>
          <p className="text-gray-500">Real-time parking analytics</p>
        </div>

        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* DATE */}
      <Card className="p-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <Button onClick={() => dispatch(fetchDailyReport(date))}>
            Refresh
          </Button>
        </div>
      </Card>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p>Total Sessions</p>
          <p className="text-xl font-bold">{totalSessions}</p>
        </Card>

        <Card className="p-4">
          <p>Revenue</p>
          <p className="text-xl font-bold">${totalRevenue}</p>
        </Card>

        <Card className="p-4">
          <p>Avg Duration</p>
          <p className="text-xl font-bold">{avgDuration} min</p>
        </Card>

        <Card className="p-4">
          <p>Active</p>
          <p className="text-xl font-bold">{dailyReport?.active || 0}</p>
        </Card>
      </div>

      {/* TABLE */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lot</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sessions.map((s: any) => {
              const revenue =
                (s.durationMinutes || 0) *
                (s.slot?.parkingLot?.pricePerMinute || 0);

              return (
                <TableRow key={s.id}>
                  <TableCell>{s.slot?.parkingLot?.name}</TableCell>
                  <TableCell>{s.slot?.slotNumber}</TableCell>
                  <TableCell>{s.durationMinutes || 0} min</TableCell>
                  <TableCell className="font-semibold">
                    ${revenue.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
