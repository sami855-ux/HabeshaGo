"use client"

import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react";
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
} from "recharts";
import { Button } from "../../../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";

const dailyRevenue = [
  { date: "Apr 15", revenue: 1850, transactions: 42 },
  { date: "Apr 16", revenue: 2100, transactions: 48 },
  { date: "Apr 17", revenue: 1950, transactions: 45 },
  { date: "Apr 18", revenue: 2400, transactions: 56 },
  { date: "Apr 19", revenue: 2650, transactions: 61 },
  { date: "Apr 20", revenue: 2900, transactions: 68 },
  { date: "Apr 21", revenue: 3100, transactions: 72 },
  { date: "Apr 22", revenue: 2845, transactions: 65 },
];

const monthlyComparison = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
];

export default function Revenue() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Revenue Report</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Track and analyze revenue performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="this-month">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Revenue
              </p>
              <h3 className="text-2xl font-bold mt-1">$19,795</h3>
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
                Avg. Per Day
              </p>
              <h3 className="text-2xl font-bold mt-1">$2,474</h3>
              <p className="text-sm text-green-600 mt-1">+8.2%</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This Week
              </p>
              <h3 className="text-2xl font-bold mt-1">$17,245</h3>
              <p className="text-sm text-green-600 mt-1">+15.3%</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Growth Rate
              </p>
              <h3 className="text-2xl font-bold mt-1">+12.5%</h3>
              <p className="text-sm text-green-600 mt-1">vs last month</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold">Daily Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Date
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Revenue
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Transactions
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg. per Transaction
                </th>
              </tr>
            </thead>
            <tbody>
              {dailyRevenue.map((day, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="py-4 px-6 font-medium">{day.date}</td>
                  <td className="py-4 px-6 font-semibold text-green-600">
                    ${day.revenue.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">{day.transactions}</td>
                  <td className="py-4 px-6">
                    ${(day.revenue / day.transactions).toFixed(2)}
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
