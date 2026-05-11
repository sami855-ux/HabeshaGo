"use client";

import { Card } from "@/components/ui/card";
import {
  MapPin,
  Grid,
  Calendar,
  Activity,
  TrendingUp,
  DollarSign,
  Car,
  Clock,
} from "lucide-react";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchParkingLots,
  fetchAllReservations,
  fetchActiveSessions,
  fetchDailyReport,
} from "@/store/slices/parkingAdminSlice";

export default function Dashboard() {
  const dispatch = useDispatch<any>();

  const { lots, reservations, sessions, dailyReport, loading } = useSelector(
    (state: any) => state.parking,
  );

  useEffect(() => {
    dispatch(fetchParkingLots());
    dispatch(fetchAllReservations());
    dispatch(fetchActiveSessions());

    const today = new Date().toISOString().split("T")[0];
    dispatch(fetchDailyReport(today));
  }, [dispatch]);

  /* ================= DATA ================= */

  const totalLots = lots?.length || 0;

  const totalSlots =
    lots?.reduce(
      (sum: number, lot: any) => sum + (lot.slots?.length || 0),
      0,
    ) || 0;

  const activeReservations =
    reservations?.filter((r: any) => r.status === "CONFIRMED")?.length || 0;

  const activeSessions =
    sessions?.filter((s: any) => s.status === "ACTIVE")?.length || 0;

  const revenue = dailyReport?.totalRevenue || 0;

  const occupancy =
    totalSlots > 0 ? Math.round((activeSessions / totalSlots) * 100) : 0;

  const stats = [
    {
      label: "Parking Lots",
      value: totalLots,
      icon: MapPin,
      color: "text-blue-500",
    },
    {
      label: "Total Slots",
      value: totalSlots,
      icon: Grid,
      color: "text-purple-500",
    },
    {
      label: "Active Reservations",
      value: activeReservations,
      icon: Calendar,
      color: "text-yellow-500",
    },
    {
      label: "Active Sessions",
      value: activeSessions,
      icon: Activity,
      color: "text-green-500",
    },
    {
      label: "Today's Revenue",
      value: `$${revenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-500",
    },
    {
      label: "Occupancy Rate",
      value: `${occupancy}%`,
      icon: TrendingUp,
      color: "text-pink-500",
    },
  ];

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
        <p className="text-gray-500">Real-time parking system analytics</p>
      </div>

      {/* KPI GRID */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;

          return (
            <Card
              key={s.label}
              className="p-4 flex flex-col gap-2 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${s.color}`} />
                {occupancy > 80 && s.label === "Occupancy Rate" && (
                  <span className="text-xs text-red-500 font-medium">High</span>
                )}
              </div>

              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </Card>
          );
        })}
      </div>

      {/* SECOND ROW */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* SYSTEM STATUS */}
        <Card className="p-5 space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Car className="w-4 h-4" />
            System Status
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Active Sessions</span>
              <span className="font-semibold">{activeSessions}</span>
            </div>

            <div className="flex justify-between">
              <span>Active Reservations</span>
              <span className="font-semibold">{activeReservations}</span>
            </div>

            <div className="flex justify-between">
              <span>Occupancy</span>
              <span className="font-semibold">{occupancy}%</span>
            </div>
          </div>
        </Card>

        {/* REVENUE */}
        <Card className="p-5 space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Revenue Summary
          </h2>

          <div className="text-3xl font-bold text-emerald-500">
            ${revenue.toFixed(2)}
          </div>

          <p className="text-sm text-gray-500">Total earnings today</p>
        </Card>

        {/* TIME INFO */}
        <Card className="p-5 space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Live Info
          </h2>

          <p className="text-sm text-gray-500">System running normally</p>

          <div className="text-sm space-y-1">
            <p>✔ Backend API Active</p>
            <p>✔ Database Connected</p>
            <p>✔ Real-time Updates Enabled</p>
          </div>
        </Card>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <p className="text-sm text-gray-500">Loading dashboard data...</p>
      )}
    </div>
  );
}
