"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Clock, TrendingUp } from "lucide-react";

import { fetchPeakHours } from "@/store/slices/parkingAdminSlice";

export default function PeakHours() {
  const dispatch = useDispatch<any>();

  const { peakHours, loading } = useSelector((state: any) => state.parking);

  useEffect(() => {
    dispatch(fetchPeakHours());
  }, [dispatch]);

  /* ================= SAFE DATA ================= */

  const hourlyTraffic = peakHours?.hourlyTraffic || [];

  const hourlyData = hourlyTraffic.map((sessions: number, i: number) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    sessions,
    occupancy: Math.min(100, sessions * 5), // simple scaling
  }));

  const peakHourIndex =
    peakHours?.peakHour ?? hourlyTraffic.indexOf(Math.max(...hourlyTraffic, 0));

  const busiestHour =
    peakHourIndex >= 0 ? `${String(peakHourIndex).padStart(2, "0")}:00` : "--";

  const peakHoursTop = [...hourlyData]
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5);

  const peakOccupancy =
    peakHoursTop.length > 0
      ? Math.max(...peakHoursTop.map((h) => h.occupancy))
      : 0;

  const getBarColor = (value: number) => {
    if (value >= 90) return "#ef4444";
    if (value >= 70) return "#f59e0b";
    if (value >= 50) return "#3b82f6";
    return "#10b981";
  };

  /* ================= UI ================= */

  if (loading) {
    return <p className="p-6">Loading peak hours...</p>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Peak Hours Analysis</h1>
        <p className="text-gray-500">Identify busiest times using real data</p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Busiest Hour</p>
          <p className="text-xl font-bold">{busiestHour}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-500">Peak Occupancy</p>
          <p className="text-xl font-bold">{peakOccupancy}%</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-500">Peak Window</p>
          <p className="text-xl font-bold">
            {peakHoursTop.length > 0
              ? `${peakHoursTop[0].hour} - ${
                  peakHoursTop[peakHoursTop.length - 1].hour
                }`
              : "--"}
          </p>
        </Card>
      </div>

      {/* CHART */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold">Hourly Usage</h2>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="occupancy">
              {hourlyData.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.occupancy)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* TOP 5 */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold">Top 5 Peak Hours</h2>

        <div className="space-y-3">
          {peakHoursTop.map((h, idx) => (
            <div
              key={h.hour}
              className="flex justify-between p-3 bg-gray-50 rounded"
            >
              <span>
                {idx + 1}. {h.hour}
              </span>
              <span>{h.sessions} sessions</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
