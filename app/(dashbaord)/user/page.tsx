"use client"

import { RootState } from "@/store"
import {
  Bus,
  ParkingCircle,
  Zap,
  Navigation,
  MapPin,
  Battery,
  Briefcase,
  ArrowRight,
  Bell,
  Calendar,
  Clock,
  TrendingUp,
  User,
  Settings,
  CreditCard,
  History,
  HelpCircle,
  MoreVertical,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Wallet,
  Star,
  Users,
  Cloud,
  Thermometer,
  Wind,
  Droplets,
  Sun,
  Moon,
  Map,
  Heart,
  Home,
  Building,
  School,
  ShoppingBag,
  X,
  Filter,
  RefreshCw,
  Maximize2,
  Navigation as NavIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { useState, useEffect } from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Weather interface
interface WeatherData {
  temp: number
  condition: string
  humidity: number
  windSpeed: number
  icon: string
}

// Map location interface
interface MapLocation {
  id: string
  name: string
  type: "bus" | "parking" | "charging" | "shuttle"
  coordinates: { lat: number; lng: number }
  distance: string
  status: "available" | "busy" | "maintenance"
}

// Favorite destination interface
interface FavoriteDestination {
  id: string
  name: string
  type: "home" | "work" | "school" | "other"
  address: string
  travelTime: string
  distance: string
  isFavorite: boolean
}

// Recharts data
const weeklyUsageData = [
  { day: "Mon", bus: 42, parking: 35, charging: 28, shuttle: 15 },
  { day: "Tue", bus: 56, parking: 42, charging: 32, shuttle: 18 },
  { day: "Wed", bus: 38, parking: 28, charging: 25, shuttle: 12 },
  { day: "Thu", bus: 61, parking: 48, charging: 38, shuttle: 22 },
  { day: "Fri", bus: 72, parking: 55, charging: 45, shuttle: 28 },
  { day: "Sat", bus: 45, parking: 38, charging: 30, shuttle: 20 },
  { day: "Sun", bus: 32, parking: 25, charging: 20, shuttle: 10 },
]

const monthlyStatsData = [
  { month: "Jan", trips: 210, savings: 85, co2: 32 },
  { month: "Feb", trips: 195, savings: 78, co2: 30 },
  { month: "Mar", trips: 230, savings: 92, co2: 35 },
  { month: "Apr", trips: 248, savings: 124, co2: 42 },
  { month: "May", trips: 265, savings: 142, co2: 48 },
  { month: "Jun", trips: 280, savings: 168, co2: 52 },
]

const serviceDistributionData = [
  { name: "Bus", value: 45, color: "#f97316" },
  { name: "Parking", value: 25, color: "#eab308" },
  { name: "EV Charging", value: 15, color: "#84cc16" },
  { name: "Shuttle", value: 10, color: "#3b82f6" },
  { name: "Other", value: 5, color: "#8b5cf6" },
]

const progressData = [
  { label: "Bus Usage", value: 75 },
  { label: "Parking Occupancy", value: 45 },
  { label: "EV Charging", value: 60 },
  { label: "Shuttle Service", value: 30 },
]

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-4">
        <p className="font-bold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function Page() {
  const { user, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.user
  )

  const [weather, setWeather] = useState<WeatherData>({
    temp: 22,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    icon: "cloud",
  })

  const [mapLocations, setMapLocations] = useState<MapLocation[]>([
    {
      id: "1",
      name: "Central Bus Station",
      type: "bus",
      coordinates: { lat: 40.7128, lng: -74.006 },
      distance: "0.5 mi",
      status: "available",
    },
    {
      id: "2",
      name: "Downtown Parking",
      type: "parking",
      coordinates: { lat: 40.7589, lng: -73.9851 },
      distance: "1.2 mi",
      status: "busy",
    },
    {
      id: "3",
      name: "EV Station Plaza",
      type: "charging",
      coordinates: { lat: 40.7505, lng: -73.9934 },
      distance: "0.8 mi",
      status: "available",
    },
    {
      id: "4",
      name: "Main Shuttle Hub",
      type: "shuttle",
      coordinates: { lat: 40.7549, lng: -73.984 },
      distance: "1.5 mi",
      status: "available",
    },
    {
      id: "5",
      name: "Westside Bus Stop",
      type: "bus",
      coordinates: { lat: 40.7812, lng: -73.9665 },
      distance: "2.3 mi",
      status: "maintenance",
    },
  ])

  const [favorites, setFavorites] = useState<FavoriteDestination[]>([
    {
      id: "1",
      name: "Home",
      type: "home",
      address: "123 Main St",
      travelTime: "15 min",
      distance: "3.2 mi",
      isFavorite: true,
    },
    {
      id: "2",
      name: "Office",
      type: "work",
      address: "456 Business Ave",
      travelTime: "25 min",
      distance: "5.8 mi",
      isFavorite: true,
    },
    {
      id: "3",
      name: "University",
      type: "school",
      address: "789 Campus Dr",
      travelTime: "20 min",
      distance: "4.5 mi",
      isFavorite: true,
    },
    {
      id: "4",
      name: "Shopping Mall",
      type: "other",
      address: "101 Retail Blvd",
      travelTime: "18 min",
      distance: "4.1 mi",
      isFavorite: false,
    },
    {
      id: "5",
      name: "Gym",
      type: "other",
      address: "202 Fitness Rd",
      travelTime: "12 min",
      distance: "2.7 mi",
      isFavorite: false,
    },
  ])

  const [notifications] = useState([
    {
      id: 1,
      message: "Bus #204 is arriving in 5 mins",
      time: "2 min ago",
      read: false,
    },
    {
      id: 2,
      message: "Parking reservation confirmed",
      time: "1 hour ago",
      read: true,
    },
    {
      id: 3,
      message: "EV charging session completed",
      time: "3 hours ago",
      read: true,
    },
    {
      id: 4,
      message: "Weather alert: Rain expected",
      time: "1 day ago",
      read: false,
    },
  ])

  const [recentActivity] = useState([
    {
      id: 1,
      action: "Bus ticket purchased",
      amount: "$4.50",
      time: "10:30 AM",
      type: "transport",
    },
    {
      id: 2,
      action: "Parking payment",
      amount: "$12.00",
      time: "Yesterday",
      type: "parking",
    },
    {
      id: 3,
      action: "EV charging started",
      amount: "$8.75",
      time: "2 days ago",
      type: "charging",
    },
    {
      id: 4,
      action: "Monthly pass renewed",
      amount: "$89.99",
      time: "3 days ago",
      type: "subscription",
    },
  ])

  const [activeTab, setActiveTab] = useState<
    "all" | "bus" | "parking" | "charging" | "shuttle"
  >("all")
  const [mapView, setMapView] = useState<"map" | "list">("map")
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    null
  )
  const [showFullMap, setShowFullMap] = useState(false)

  console.log(user, isAuthenticated, loading)
  const router = useRouter()

  const quickActions = [
    {
      id: "bus",
      title: "Ticket a Bus",
      description: "Instantly book or check bus schedules",
      icon: Bus,
      color: "bg-gradient-to-br from-orange-500 to-amber-500",
    },
    {
      id: "charging",
      title: "EV Charging",
      description: "Find stations + start charging",
      icon: Zap,
      color: "bg-gradient-to-br from-orange-400 to-amber-400",
    },
    {
      id: "parking",
      title: "Parking",
      description: "Locate, reserve, or pay for parking",
      icon: ParkingCircle,
      color: "bg-gradient-to-br from-orange-600 to-amber-600",
    },
    {
      id: "employment",
      title: "Shuttle Employment",
      description: "Apply or check shuttle job openings",
      icon: Briefcase,
      color: "bg-gradient-to-br from-orange-700 to-amber-700",
    },
    {
      id: "wallet",
      title: "Digital Wallet",
      description: "Check balance & add funds",
      icon: Wallet,
      color: "bg-gradient-to-br from-amber-500 to-yellow-500",
    },
    {
      id: "history",
      title: "Trip History",
      description: "View past trips & receipts",
      icon: History,
      color: "bg-gradient-to-br from-orange-600 to-red-500",
    },
  ]

  const handleAction = (actionId: string) => {
    router.push(`/user/${actionId}`)
  }

  const toggleFavorite = (id: string) => {
    setFavorites(
      favorites.map((fav) =>
        fav.id === id ? { ...fav, isFavorite: !fav.isFavorite } : fav
      )
    )
  }

  const getWeatherIcon = () => {
    switch (weather.icon) {
      case "sun":
        return <Sun className="size-8 text-yellow-500" />
      case "cloud":
        return <Cloud className="size-8 text-gray-500" />
      case "rain":
        return <Droplets className="size-8 text-blue-500" />
      default:
        return <Cloud className="size-8 text-gray-500" />
    }
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "bus":
        return <Bus className="size-5" />
      case "parking":
        return <ParkingCircle className="size-5" />
      case "charging":
        return <Zap className="size-5" />
      case "shuttle":
        return <Navigation className="size-5" />
      default:
        return <MapPin className="size-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "busy":
        return "bg-yellow-500"
      case "maintenance":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getFavoriteIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="size-5" />
      case "work":
        return <Building className="size-5" />
      case "school":
        return <School className="size-5" />
      default:
        return <ShoppingBag className="size-5" />
    }
  }

  // Simulate weather data fetch
  useEffect(() => {
    const fetchWeather = () => {
      // In real app, fetch from weather API
      const conditions = ["sun", "cloud", "rain"]
      const randomCondition =
        conditions[Math.floor(Math.random() * conditions.length)]
      setWeather({
        temp: Math.floor(Math.random() * 15) + 15, // 15-30°C
        condition:
          randomCondition === "sun"
            ? "Sunny"
            : randomCondition === "cloud"
            ? "Cloudy"
            : "Rainy",
        humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
        windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
        icon: randomCondition,
      })
    }

    fetchWeather()
    const interval = setInterval(fetchWeather, 300000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome Header with Weather */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name || "User"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your transportation services today
          </p>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Bus Transport */}
            <div className="p-4 border rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Bus className="size-4" />
                    <h1 className="font-geist text-sm tracking-wide">
                      TOTAL BUS TRIPS
                    </h1>
                  </div>
                  <p className="text-3xl font-bold py-1">248</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="px-2 py-1 rounded-full bg-white/20 text-xs font-medium">
                      +12% this month
                    </div>
                    <TrendingUp className="size-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Parking Card */}
            <div className="p-4 border rounded-lg bg-background">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-md bg-orange-50 dark:bg-orange-900/20">
                      <ParkingCircle className="size-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h1 className="font-geist text-sm text-muted-foreground tracking-wide">
                      MONTHLY SAVINGS
                    </h1>
                  </div>
                  <p className="text-3xl font-bold text-foreground py-1">
                    $124
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="size-3 text-amber-500" />
                    <span className="text-xs text-muted-foreground">
                      Using smart parking
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Balance */}
            <div className="p-4 border rounded-lg bg-background">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="size-4 text-green-600" />
                    <h1 className="font-geist text-sm text-muted-foreground tracking-wide">
                      WALLET BALANCE
                    </h1>
                  </div>
                  <p className="text-3xl font-bold text-foreground py-1">
                    $85.50
                  </p>
                  <button className="text-xs text-green-600 hover:text-green-700 font-medium mt-2">
                    + Add Funds
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recharts Graphs Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Usage Line Chart */}
            <div className="border rounded-lg p-6 bg-background">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Weekly Usage
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Transportation patterns this week
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      activeTab === "all"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30"
                        : "hover:bg-accent"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab("bus")}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      activeTab === "bus"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30"
                        : "hover:bg-accent"
                    }`}
                  >
                    Bus
                  </button>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyUsageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="bus"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="parking"
                      stroke="#eab308"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="charging"
                      stroke="#84cc16"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Stats Area Chart */}
            <div className="border rounded-lg p-6 bg-background">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Monthly Statistics
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Year-to-date performance
                  </p>
                </div>
                <button className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700">
                  View details <ChevronRight className="size-4" />
                </button>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyStatsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="trips"
                      stackId="1"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="savings"
                      stackId="1"
                      stroke="#eab308"
                      fill="#eab308"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="co2"
                      stackId="1"
                      stroke="#84cc16"
                      fill="#84cc16"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Real-time Map Section */}
          <div className="border rounded-lg bg-background overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Real-time Map
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Nearby transportation services
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMapView("map")}
                    className={`p-2 rounded-lg ${
                      mapView === "map" ? "bg-accent" : "hover:bg-accent"
                    }`}
                  >
                    <Map className="size-5" />
                  </button>
                  <button
                    onClick={() => setMapView("list")}
                    className={`p-2 rounded-lg ${
                      mapView === "list" ? "bg-accent" : "hover:bg-accent"
                    }`}
                  >
                    <List className="size-5" />
                  </button>
                  <button
                    onClick={() => setShowFullMap(true)}
                    className="p-2 rounded-lg hover:bg-accent"
                  >
                    <Maximize2 className="size-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-accent">
                    <RefreshCw className="size-5" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 mt-4">
                {["all", "bus", "parking", "charging", "shuttle"].map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setActiveTab(type as any)}
                      className={`px-3 py-1 rounded-full text-sm capitalize ${
                        activeTab === type
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30"
                          : "hover:bg-accent"
                      }`}
                    >
                      {type}
                    </button>
                  )
                )}
              </div>
            </div>

            {mapView === "map" ? (
              <div className="p-6">
                {/* Map Visualization (Simulated) */}
                <div className="relative h-64 bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg overflow-hidden">
                  {/* Simulated Map Points */}
                  {mapLocations
                    .filter(
                      (loc) => activeTab === "all" || loc.type === activeTab
                    )
                    .map((location, index) => (
                      <button
                        key={location.id}
                        onClick={() => setSelectedLocation(location)}
                        className={`absolute p-2 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 ${
                          selectedLocation?.id === location.id
                            ? "scale-110 ring-2 ring-orange-500"
                            : ""
                        }`}
                        style={{
                          left: `${20 + index * 15}%`,
                          top: `${30 + index * 10}%`,
                        }}
                      >
                        <div
                          className={`p-2 rounded-full ${getStatusColor(
                            location.status
                          )}`}
                        >
                          {getLocationIcon(location.type)}
                        </div>
                        <div
                          className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                            location.status === "available"
                              ? "bg-green-100 text-green-800"
                              : location.status === "busy"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {location.distance}
                        </div>
                      </button>
                    ))}

                  {/* Center marker (user location) */}
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="p-3 rounded-full bg-blue-500 text-white shadow-lg">
                      <NavIcon className="size-6" />
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 rounded bg-background border text-xs">
                      You are here
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm border rounded-lg p-3">
                    <div className="flex items-center gap-4">
                      {["available", "busy", "maintenance"].map((status) => (
                        <div key={status} className="flex items-center gap-1">
                          <div
                            className={`size-3 rounded-full ${getStatusColor(
                              status
                            )}`}
                          />
                          <span className="text-xs capitalize">{status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selected Location Details */}
                {selectedLocation && (
                  <div className="mt-4 p-4 border rounded-lg bg-accent/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          {getLocationIcon(selectedLocation.type)}
                          <h3 className="font-bold">{selectedLocation.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedLocation.distance} away •{" "}
                          {selectedLocation.status}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedLocation(null)}
                        className="p-1 hover:bg-accent rounded"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                        Get Directions
                      </button>
                      <button className="flex-1 px-4 py-2 border rounded-lg hover:bg-accent">
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* List View */
              <div className="p-6">
                <div className="space-y-3">
                  {mapLocations
                    .filter(
                      (loc) => activeTab === "all" || loc.type === activeTab
                    )
                    .map((location) => (
                      <div
                        key={location.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => setSelectedLocation(location)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${getStatusColor(
                              location.status
                            )}`}
                          >
                            {getLocationIcon(location.type)}
                          </div>
                          <div>
                            <h3 className="font-medium">{location.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {location.distance} • {location.status}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              location.status === "available"
                                ? "bg-green-100 text-green-800"
                                : location.status === "busy"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {location.status}
                          </span>
                          <ArrowRight className="size-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-card p-6 rounded-lg border">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">
                Quick Actions
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                One-tap access to essential services
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  className="group relative overflow-hidden rounded-xl border bg-gray-100 dark:bg-[#17171a] p-4 text-left transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className={`${action.color} p-2 rounded-lg w-fit`}>
                      <action.icon className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-orange-600">
                        {action.title}
                      </h3>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Service Status */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">Service status</div>
                <div className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-green-500" />
                  <span className="text-foreground">All operational</span>
                </div>
              </div>
            </div>
          </div>

          {/* Favorite Destinations */}
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Favorite Destinations
                </h2>
                <p className="text-sm text-muted-foreground">
                  Quick access to frequent locations
                </p>
              </div>
              <button className="p-2 hover:bg-accent rounded-lg">
                <Filter className="size-5" />
              </button>
            </div>

            <div className="space-y-3">
              {favorites.map((destination) => (
                <div
                  key={destination.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(destination.id)
                      }}
                      className="p-1.5 rounded-md hover:bg-accent"
                    >
                      <Heart
                        className={`size-4 ${
                          destination.isFavorite
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      {getFavoriteIcon(destination.type)}
                    </div>
                    <div>
                      <h3 className="font-medium">{destination.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {destination.address}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{destination.travelTime}</p>
                    <p className="text-xs text-muted-foreground">
                      {destination.distance}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-2 border rounded-lg text-sm font-medium hover:bg-accent transition-colors">
              + Add New Destination
            </button>
          </div>

          {/* Service Distribution Pie Chart */}
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Service Distribution
                </h2>
                <p className="text-sm text-muted-foreground">
                  Usage across services
                </p>
              </div>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {serviceDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {serviceDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-medium ml-auto">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Notifications
                </h2>
                <p className="text-sm text-muted-foreground">
                  {notifications.filter((n) => !n.read).length} unread
                </p>
              </div>
              <button className="text-sm text-orange-600 hover:text-orange-700">
                Mark all read
              </button>
            </div>

            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer ${
                    !notification.read
                      ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200"
                      : "hover:bg-accent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!notification.read ? (
                      <AlertCircle className="size-5 text-orange-600 shrink-0" />
                    ) : (
                      <CheckCircle className="size-5 text-green-600 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Map Modal */}
      {showFullMap && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-xl font-bold">Interactive Map</h2>
              <p className="text-sm text-muted-foreground">
                Full view of transportation services
              </p>
            </div>
            <button
              onClick={() => setShowFullMap(false)}
              className="p-2 hover:bg-accent rounded-lg"
            >
              <X className="size-6" />
            </button>
          </div>

          <div className="flex-1 p-4">
            {/* Enhanced Map Visualization */}
            <div className="relative w-full h-full bg-gradient-to-br from-blue-100 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl overflow-hidden">
              {/* Add more detailed map visualization here */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Map className="size-24 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium">Interactive Map View</p>
                  <p className="text-sm text-muted-foreground">
                    Real-time service locations
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex justify-between">
              <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                Plan Route
              </button>
              <button className="px-6 py-3 border rounded-lg hover:bg-accent">
                Filter Services
              </button>
              <button className="px-6 py-3 border rounded-lg hover:bg-accent">
                Save Map View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Page

// List icon component
function List(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  )
}
