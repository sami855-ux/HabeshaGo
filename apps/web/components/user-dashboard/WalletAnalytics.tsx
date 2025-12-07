"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, PieChart, BarChart3 } from "lucide-react"
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

const categoryData = [
  { name: "Transfers", value: 35, color: "hsl(var(--primary))" },
  { name: "Bills", value: 25, color: "hsl(var(--primary) / 0.8)" },
  { name: "Shopping", value: 20, color: "hsl(var(--primary) / 0.6)" },
  { name: "Airtime", value: 15, color: "hsl(var(--primary) / 0.4)" },
  { name: "Transport", value: 5, color: "hsl(var(--primary) / 0.2)" },
]

const monthlyData = [
  { month: "Sep", income: 4000, expenses: 2400 },
  { month: "Oct", income: 3000, expenses: 1398 },
  { month: "Nov", income: 9800, expenses: 2000 },
  { month: "Dec", income: 3908, expenses: 2780 },
]

export default function WalletAnalytics() {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-foreground">ETB 16,708</p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-foreground">ETB 8,245</p>
              </div>
              <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-red-600 mt-2">-3.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {categoryData.map((category) => (
              <div key={category.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {category.name}
                </span>
                <span className="text-sm font-medium ml-auto">
                  {category.value}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Monthly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <Bar
                  dataKey="income"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  fill="hsl(var(--primary) / 0.6)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
