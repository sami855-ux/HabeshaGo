"use client";

import { Card } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import {
  fetchParkingLots,
  fetchLotStats,
} from "@/store/slices/parkingAdminSlice";

export default function LotStatistics() {
  const dispatch = useDispatch<any>();

  const { lots, lotStats, loading } = useSelector(
    (state: any) => state.parking,
  );

  const [selectedLot, setSelectedLot] = useState("");

  useEffect(() => {
    dispatch(fetchParkingLots());
  }, [dispatch]);

  useEffect(() => {
    if (selectedLot) {
      dispatch(fetchLotStats(selectedLot));
    }
  }, [selectedLot, dispatch]);

  const occupancyData = lotStats?.occupancyData || [];

  const revenueData = lotStats?.revenueData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Lot Statistics</h1>

        <p className="text-muted-foreground">
          Real-time analytics per parking lot
        </p>
      </div>

      <Card className="p-4">
        <Label>Select Parking Lot</Label>

        <Select value={selectedLot} onValueChange={setSelectedLot}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Choose lot" />
          </SelectTrigger>

          <SelectContent>
            {lots.map((lot: any) => (
              <SelectItem key={lot.id} value={lot.id}>
                {lot.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p>Active Sessions</p>

          <p className="text-2xl font-bold">{lotStats?.activeSessions || 0}</p>
        </Card>

        <Card className="p-4">
          <p>Total Revenue</p>

          <p className="text-2xl font-bold">${lotStats?.revenue || 0}</p>
        </Card>

        <Card className="p-4">
          <p>Total Sessions</p>

          <p className="text-2xl font-bold">{lotStats?.totalSessions || 0}</p>
        </Card>

        <Card className="p-4">
          <p>Completed</p>

          <p className="text-2xl font-bold">
            {lotStats?.completedSessions || 0}
          </p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Hourly Occupancy</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="hour" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="occupancy"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">Revenue Trend</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="hour" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
