"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDispatch, useSelector } from "react-redux"
import {
  Bus,
  Car,
  Zap,
  Ticket,
  Users,
  MapPin,
  Route,
  Battery,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Activity,
  Download,
  Filter,
  RefreshCw,
  Menu,
  Bell,
  User,
  Sun,
  Moon,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Map,
  Settings,
  FileText,
  Shield,
  Wrench,
  AlertTriangle,
  CreditCard,
  Clock,
  Calendar,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { RootState } from "@/store"

// Chart data
const ticketSalesData = [
  { day: "Mon", tickets: 1850, revenue: 12500 },
  { day: "Tue", tickets: 2150, revenue: 14500 },
  { day: "Wed", tickets: 2800, revenue: 18500 },
  { day: "Thu", tickets: 2540, revenue: 16500 },
  { day: "Fri", tickets: 3200, revenue: 21000 },
  { day: "Sat", tickets: 3847, revenue: 24500 },
  { day: "Sun", tickets: 2940, revenue: 19500 },
]

const parkingRevenueData = [
  { month: "Jan", revenue: 65000, occupancy: 65 },
  { month: "Feb", revenue: 72000, occupancy: 68 },
  { month: "Mar", revenue: 81000, occupancy: 72 },
  { month: "Apr", revenue: 89000, occupancy: 75 },
  { month: "May", revenue: 92000, occupancy: 78 },
  { month: "Jun", revenue: 98000, occupancy: 82 },
]

const routePerformanceData = [
  { route: "Route 42", performance: 92, passengers: 450 },
  { route: "Route 15", performance: 85, passengers: 320 },
  { route: "Route 7", performance: 78, passengers: 280 },
  { route: "Route 23", performance: 95, passengers: 520 },
  { route: "Route 89", performance: 88, passengers: 410 },
]

// Activity feed data
const activityData = [
  {
    id: 1,
    type: "ticket",
    description: "Ticket #T-2345 sold - ₹150",
    user: "John Doe",
    status: "completed",
  },
  {
    id: 2,
    type: "driver",
    description: "Driver check-in - Bus #B-142",
    user: "Rajesh Kumar",
    status: "active",
  },
  {
    id: 3,
    type: "maintenance",
    description: "EV Station #EV-23 maintenance completed",
    user: "Maintenance Team",
    status: "completed",
  },
  {
    id: 4,
    type: "dispute",
    description: "Refund processed - Ticket #T-1987",
    user: "Sarah Smith",
    status: "pending",
  },
  {
    id: 5,
    type: "ticket",
    description: "Monthly pass validated - User #U-789",
    user: "Amit Patel",
    status: "completed",
  },
  {
    id: 6,
    type: "driver",
    description: "Route deviation reported - Route 15",
    user: "Driver #D-45",
    status: "alert",
  },
  {
    id: 7,
    type: "maintenance",
    description: "Parking sensor calibration - Lot B",
    user: "Tech Team",
    status: "in-progress",
  },
  {
    id: 8,
    type: "ticket",
    description: "Bulk ticket purchase - Corporate account",
    user: "Corporate XYZ",
    status: "completed",
  },
  {
    id: 1,
    type: "ticket",
    description: "Ticket #T-2345 sold - ₹150",
    user: "John Doe",
    status: "completed",
  },
  {
    id: 2,
    type: "driver",
    description: "Driver check-in - Bus #B-142",
    user: "Rajesh Kumar",
    status: "active",
  },
  {
    id: 3,
    type: "maintenance",
    description: "EV Station #EV-23 maintenance completed",
    user: "Maintenance Team",
    status: "completed",
  },
]

// Reports snapshot data
const reportsData = [
  { name: "Mon", sales: 1850, revenue: 12500 },
  { name: "Tue", sales: 2150, revenue: 14500 },
  { name: "Wed", sales: 2800, revenue: 18500 },
  { name: "Thu", sales: 2540, revenue: 16500 },
  { name: "Fri", sales: 3200, revenue: 21000 },
  { name: "Sat", sales: 3847, revenue: 24500 },
  { name: "Sun", sales: 2940, revenue: 19500 },
]

const evChargingData = [
  { station: "EV-1", usage: 85, status: "active" },
  { station: "EV-2", usage: 92, status: "active" },
  { station: "EV-3", usage: 45, status: "active" },
  { station: "EV-4", usage: 78, status: "maintenance" },
  { station: "EV-5", usage: 60, status: "active" },
]

const fleetUtilizationData = [
  { hour: "6AM", utilization: 35 },
  { hour: "8AM", utilization: 85 },
  { hour: "10AM", utilization: 65 },
  { hour: "12PM", utilization: 70 },
  { hour: "2PM", utilization: 60 },
  { hour: "4PM", utilization: 80 },
  { hour: "6PM", utilization: 75 },
  { hour: "8PM", utilization: 40 },
]

// Quick access panels
const quickAccessPanels = [
  {
    title: "Manage Buses",
    icon: Bus,
    description: "Fleet management & scheduling",
    color: "bg-blue-500",
    count: 2,
    colSpan: 2,
    rowSpan: 1,
    path: "/admin/manage-bus",
  },
  {
    title: "Manage Routes",
    icon: Route,
    description: "Route planning & optimization",
    color: "bg-green-500",
    count: 23,
    colSpan: 1,
    rowSpan: 1,
    path: "/admin/manage-route",
  },
  {
    title: "Manage Parking Stations",
    icon: MapPin,
    description: "Parking lot operations",
    color: "bg-purple-500",
    count: 18,
    colSpan: 1,
    rowSpan: 2,
    path: "/admin/manage-parking",
  },
  {
    title: "Manage EV Stations",
    icon: Battery,
    description: "Charging infrastructure",
    color: "bg-emerald-500",
    count: 45,
    colSpan: 2,
    rowSpan: 1,
  },
  {
    title: "Manage Drivers/Staff",
    icon: Users,
    description: "Personnel management",
    color: "bg-amber-500",
    count: 89,
    colSpan: 1,
    rowSpan: 1,
    path: "/admin/manage-staff",
  },
  {
    title: "View Tickets",
    icon: Ticket,
    description: "Ticket sales & validations",
    color: "bg-red-500",
    count: "2.8K",
    colSpan: 2,
    rowSpan: 1,
    path: "/admin/view-ticket",
  },
]

export default function DashboardWithCharts() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.user)

  // KPI Data
  const kpis = [
    {
      title: "Buses in Operation",
      value: "142",
      subtitle: "Active today",
      change: "+8.2%",
      trend: "up",
      icon: Bus,
      details: "128 on-time • 14 delayed",
      color: "bg-primary",
    },
    {
      title: "Parking Occupancy",
      value: "78%",
      subtitle: "Spots occupied",
      change: "+2.1%",
      trend: "up",
      icon: Car,
      details: "1,240/1,600 spots",
      color: "bg-primary",
    },
    {
      title: "EV Charging Usage",
      value: "45",
      subtitle: "Active stations",
      change: "+12.5%",
      trend: "up",
      icon: Zap,
      details: "32 charging • 13 available",
      color: "bg-primary",
    },
    {
      title: "Tickets Issued",
      value: "2,847",
      subtitle: "Today",
      change: "-3.4%",
      trend: "down",
      icon: Ticket,
      details: "Online: 1,892 • Physical: 955",
      color: "bg-primary",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        )
      case "active":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Active
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        )
      case "alert":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Alert
          </Badge>
        )
      case "in-progress":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            In Progress
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ticket":
        return <Ticket className="h-4 w-4" />
      case "driver":
        return <Users className="h-4 w-4" />
      case "maintenance":
        return <Wrench className="h-4 w-4" />
      case "dispute":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div
      className={`min-h-screen rounded-2xl ${
        theme === "dark" ? "dark bg-background" : "bg-background"
      } `}
    >
      <main className="container mx-auto px-4 py-6 rounded-xl">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-foreground">
              Dashboard Analytics
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Real-time insights and visual analytics for transit management
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index} className="overflow-hidden border-none ">
              <CardHeader className="pb-1">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${kpi.color}`}>
                    <kpi.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="flex items-center gap-1">
                    {kpi.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        kpi.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {kpi.change}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <h3 className="text-2xl font-bold text-foreground">
                    {kpi.value}
                  </h3>
                  <p className="text-sm text-card-foreground">{kpi.subtitle}</p>
                  <p className="text-xs text-muted-foreground">{kpi.details}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Access Panels */}
        <div className="mb-4 min-h-96 px-2">
          <h3 className="text-xl font-semibold mb-4">Quick Access Panels</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickAccessPanels.map((panel, index) => (
              <Card
                key={index}
                onClick={() => {
                  if (panel.path) {
                    router.push(panel.path)
                  }
                }}
                className="relative border-background transition-shadow cursor-pointer h-38 hover:border-card hover:shadow-lg"
              >
                <CardContent className="p-2 px-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-3 rounded-lg ${panel.color}`}>
                      <panel.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary">{panel.count}</Badge>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{panel.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {panel.description}
                  </p>
                  {/* Arrow icon for hover */}
                  <div className="absolute right-4 z-50 top-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <ChevronRight className="w-5 h-5 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Feed */}
          <Card className="lg:col-span-2 border-none">
            <CardHeader>
              <CardTitle>Activity Feed / Recent Events</CardTitle>
              <CardDescription>
                Real-time updates on system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityData.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getActivityIcon(activity.type)}
                            <span className="capitalize">{activity.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {activity.description}
                        </TableCell>
                        <TableCell>{activity.user}</TableCell>
                        <TableCell>{activity.time}</TableCell>
                        <TableCell>{getStatusBadge(activity.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Reports Snapshot */}
          <Card className="border-none">
            <CardHeader>
              <CardTitle>Reports Snapshot</CardTitle>
              <CardDescription>Quick overview of trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Daily Ticket Sales</h4>
                  <Badge variant="outline" className="text-green-600">
                    +12.5%
                  </Badge>
                </div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportsData}>
                      <defs>
                        <linearGradient
                          id="orangeGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="hsl(34, 100%, 50%)"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="100%"
                            stopColor="hsl(34, 100%, 50%)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="hsl(34, 100%, 50%)"
                        fill="url(#orangeGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">EV Charging Usage</h4>
                  <Badge variant="outline" className="text-green-600">
                    +8.3%
                  </Badge>
                </div>
                <div className="space-y-2">
                  {evChargingData.map((station) => (
                    <div
                      key={station.station}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm w-32">{station.station}</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={station.usage}
                          className="flex-1 h-2 rounded-full bg-orange-100"
                          style={{
                            background: "#FFE5B4", // soft orange background
                          }}
                        />
                        <span className="text-sm w-10 text-right">
                          {station.usage}%
                        </span>
                        <Badge
                          variant="default"
                          className={`text-xs px-2 py-1 ${
                            station.status === "active"
                              ? "bg-orange-500 text-white"
                              : "bg-orange-200 text-orange-800"
                          }`}
                        >
                          {station.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="space-y-6 mb-8">
          {/* Row 1: Ticket Sales & Parking Revenue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ticket Sales Trend */}
            <Card className="border-none">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <LineChartIcon className="h-5 w-5 text-primary" />
                      Ticket Sales Trend
                    </CardTitle>
                    <CardDescription>
                      Weekly ticket sales and revenue
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200"
                  >
                    +12.5% this week
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ticketSalesData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--muted))"
                      />
                      <XAxis
                        dataKey="day"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      {/* Tickets Sold Line - solid orange */}
                      <Line
                        type="monotone"
                        dataKey="tickets"
                        stroke="#FF8C42" // orange color
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#FF8C42" }}
                        activeDot={{ r: 6, fill: "#FF8C42" }}
                        name="Tickets Sold"
                      />
                      {/* Revenue Line - lighter orange dashed */}
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#FFA65C" // lighter orange
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4, fill: "#FFA65C" }}
                        activeDot={{ r: 6, fill: "#FFA65C" }}
                        name="Revenue ($)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Parking Revenue Trend */}
            <Card className="border-none">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Parking Revenue & Occupancy
                    </CardTitle>
                    <CardDescription>
                      Monthly parking performance
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200"
                  >
                    +8.3% this month
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={parkingRevenueData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--muted))"
                      />
                      <XAxis
                        dataKey="month"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      {/* Revenue bars - deep orange */}
                      <Bar
                        yAxisId="left"
                        dataKey="revenue"
                        fill="#FF8C42" // deep orange
                        name="Revenue ($)"
                        radius={[4, 4, 0, 0]}
                      />
                      {/* Occupancy bars - lighter orange */}
                      <Bar
                        yAxisId="right"
                        dataKey="occupancy"
                        fill="#FFA65C" // lighter orange
                        fillOpacity={0.6}
                        name="Occupancy (%)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats Row */}
          <Card className="border-none">
            <CardHeader>
              <CardTitle>Route Performance Comparison</CardTitle>
              <CardDescription>
                Top performing routes by passenger count
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={routePerformanceData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--muted))"
                    />
                    <XAxis
                      dataKey="route"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    {/* Performance bars - deep orange */}
                    <Bar
                      yAxisId="left"
                      dataKey="performance"
                      fill="#FF8C42" // deep orange
                      name="Performance (%)"
                      radius={[4, 4, 0, 0]}
                    />
                    {/* Passengers bars - lighter orange */}
                    <Bar
                      yAxisId="right"
                      dataKey="passengers"
                      fill="#FFA65C" // lighter orange
                      fillOpacity={0.6}
                      name="Passengers"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-primary" />
                  Live Map Overview
                </CardTitle>
                <CardDescription>
                  Real-time operational insight across the city
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg h-96 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
              {/* Mock Map Content */}
              <div className="absolute inset-0 p-6">
                <div className="grid grid-cols-3 gap-4 h-full">
                  {/* Bus Locations */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                    <div className="flex items-center gap-2 mb-4">
                      <Bus className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold">Bus Locations</h4>
                      <Badge className="ml-auto">142 Active</Badge>
                    </div>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                i === 1
                                  ? "bg-green-500"
                                  : i === 2
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                            <span>Bus #{100 + i}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Route {i * 15}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Parking Stations */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-5 w-5 text-purple-500" />
                      <h4 className="font-semibold">Parking Stations</h4>
                      <Badge className="ml-auto">78% Full</Badge>
                    </div>
                    <div className="space-y-2">
                      {["Downtown", "Central", "North Side"].map(
                        (location, i) => (
                          <div
                            key={location}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                          >
                            <span>{location}</span>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={[65, 85, 45][i]}
                                className="w-20"
                              />
                              <span className="text-sm">
                                {[65, 85, 45][i]}%
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* EV Charging Stations */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                    <div className="flex items-center gap-2 mb-4">
                      <Battery className="h-5 w-5 text-emerald-500" />
                      <h4 className="font-semibold">EV Stations</h4>
                      <Badge className="ml-auto">32/45 In Use</Badge>
                    </div>
                    <div className="space-y-2">
                      {["EV-1", "EV-2", "EV-3"].map((station, i) => (
                        <div
                          key={station}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                        >
                          <span>{station}</span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                ["active", "active", "warning"][i] as any
                              }
                            >
                              {["Available", "Charging", "Maintenance"][i]}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
                  <h5 className="font-medium mb-2">Legend</h5>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Buses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm">Parking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                      <span className="text-sm">EV Stations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">On Time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">Delayed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">142</div>
                <div className="text-sm text-muted-foreground">
                  Active Buses
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">18</div>
                <div className="text-sm text-muted-foreground">
                  Parking Stations
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">45</div>
                <div className="text-sm text-muted-foreground">EV Stations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">92%</div>
                <div className="text-sm text-muted-foreground">
                  On-time Performance
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
