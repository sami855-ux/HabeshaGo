"use client"

import { TrendingUp, DollarSign, Clock, Users, Download } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Button } from "../../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { cn } from "../../../../lib/utils";

// Mock analytics data
const dailyRevenue = [
  { date: "Apr 15", revenue: 1850, sessions: 42 },
  { date: "Apr 16", revenue: 2100, sessions: 48 },
  { date: "Apr 17", revenue: 1950, sessions: 45 },
  { date: "Apr 18", revenue: 2400, sessions: 56 },
  { date: "Apr 19", revenue: 2650, sessions: 61 },
  { date: "Apr 20", revenue: 2900, sessions: 68 },
  { date: "Apr 21", revenue: 3100, sessions: 72 },
  { date: "Apr 22", revenue: 2845, sessions: 65 },
];

const peakHours = [
  { hour: "6 AM", sessions: 12 },
  { hour: "8 AM", sessions: 45 },
  { hour: "10 AM", sessions: 38 },
  { hour: "12 PM", sessions: 52 },
  { hour: "2 PM", sessions: 48 },
  { hour: "4 PM", sessions: 61 },
  { hour: "6 PM", sessions: 75 },
  { hour: "8 PM", sessions: 42 },
  { hour: "10 PM", sessions: 28 },
];

const lotPerformance = [
  { name: "Downtown Plaza", value: 35, color: "#3b82f6" },
  { name: "Airport Parking", value: 30, color: "#8b5cf6" },
  { name: "Mall Center", value: 20, color: "#10b981" },
  { name: "City Center", value: 15, color: "#f59e0b" },
];

const lotStats = [
  {
    name: "Downtown Plaza",
    totalSessions: 1245,
    revenue: 6225,
    avgDuration: "3.2h",
    occupancyRate: 78,
  },
  {
    name: "Airport Parking",
    totalSessions: 1089,
    revenue: 8712,
    avgDuration: "5.8h",
    occupancyRate: 65,
  },
  {
    name: "Mall Center",
    totalSessions: 892,
    revenue: 3568,
    avgDuration: "2.4h",
    occupancyRate: 54,
  },
  {
    name: "City Center",
    totalSessions: 645,
    revenue: 4193.5,
    avgDuration: "3.8h",
    occupancyRate: 72,
  },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Reports</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            View detailed analytics and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="7days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Revenue
              </p>
              <h3 className="text-2xl font-bold mt-1">$18,699</h3>
              <p className="text-sm text-green-600 mt-1">+12.5%</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Sessions
              </p>
              <h3 className="text-2xl font-bold mt-1">3,871</h3>
              <p className="text-sm text-green-600 mt-1">+8.2%</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg. Duration
              </p>
              <h3 className="text-2xl font-bold mt-1">3.8h</h3>
              <p className="text-sm text-green-600 mt-1">+5.1%</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Unique Users
              </p>
              <h3 className="text-2xl font-bold mt-1">1,247</h3>
              <p className="text-sm text-green-600 mt-1">+15.3%</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Trend */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hours Analysis */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold mb-4">Peak Hours Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lot Performance Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold mb-4">Lot Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={lotPerformance}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {lotPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Sessions Trend */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Daily Sessions Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lot Statistics Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold">Parking Lot Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Lot Name
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Sessions
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Revenue
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg. Duration
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Occupancy Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {lotStats.map((lot, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="py-4 px-6 font-medium">{lot.name}</td>
                  <td className="py-4 px-6">
                    {lot.totalSessions.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 font-semibold text-green-600">
                    ${lot.revenue.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">{lot.avgDuration}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                        <div
                          className={cn(
                            "h-2 rounded-full",
                            lot.occupancyRate >= 70
                              ? "bg-green-500"
                              : "bg-orange-500",
                          )}
                          style={{ width: `${lot.occupancyRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {lot.occupancyRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
