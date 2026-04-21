"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useChargingStations } from "@/hooks/use-charging-stations"
import { ChargingStation } from "@/types/ev"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
// Missing import
import { RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Building2,
  Plus,
  Search,
  Star,
  Zap,
  TrendingUp,
  Award,
  MapPin,
  Battery,
  Clock,
  Filter,
  ChevronLeft,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const formatRating = (value: number) => value.toFixed(1)

const getAverageRating = (station: ChargingStation) => {
  if (!station.ratings?.length) return 0
  const total = station.ratings.reduce((sum, item) => sum + item.score, 0)
  return total / station.ratings.length
}

const getActiveSessions = (station: ChargingStation) =>
  station.sessions?.filter((session) => session.status === "ACTIVE").length ?? 0

const getTotalPower = (station: ChargingStation) => {
  return station.chargingPoints?.reduce((sum, cp) => sum + cp.powerKw, 0) ?? 0
}

export default function StationsPage() {
  const router = useRouter()
  const { data, isLoading, error, refetch } = useChargingStations()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL")
  const [verifiedFilter, setVerifiedFilter] = useState<"ALL" | "YES" | "NO">(
    "ALL",
  )
  const [cityFilter, setCityFilter] = useState("ALL")

  const stations = useMemo(() => {
    const apiStations = (data ?? []) as ChargingStation[]
    return apiStations.length ? apiStations : []
  }, [data])

  const cityOptions = useMemo(() => {
    const uniqueCities = new Set(
      stations
        .map((station) => station.city?.trim())
        .filter(Boolean) as string[],
    )
    return Array.from(uniqueCities).sort((a, b) => a.localeCompare(b))
  }, [stations])

  const filteredStations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return stations.filter((station) => {
      const matchesSearch =
        !term ||
        station.name.toLowerCase().includes(term) ||
        (station.city ?? "").toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === "ALL" ? true : station.status === statusFilter

      const matchesVerified =
        verifiedFilter === "ALL"
          ? true
          : verifiedFilter === "YES"
            ? station.isVerified
            : !station.isVerified

      const matchesCity =
        cityFilter === "ALL" ? true : (station.city ?? "") === cityFilter

      return matchesSearch && matchesStatus && matchesVerified && matchesCity
    })
  }, [stations, searchTerm, statusFilter, verifiedFilter, cityFilter])

  const summary = useMemo(() => {
    const totalStations = filteredStations.length
    const activeStations = filteredStations.filter(
      (station) => station.status === "ACTIVE",
    ).length
    const verifiedStations = filteredStations.filter(
      (station) => station.isVerified,
    ).length
    const totalChargers = filteredStations.reduce(
      (sum, station) => sum + (station.chargingPoints?.length ?? 0),
      0,
    )

    const avgRating =
      totalStations > 0
        ? filteredStations.reduce(
            (sum, station) => sum + getAverageRating(station),
            0,
          ) / totalStations
        : 0

    return {
      totalStations,
      activeStations,
      verifiedStations,
      avgRating,
      totalChargers,
    }
  }, [filteredStations])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6 max-w-7xl px-4">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card
              key={i}
              className="border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <Card className="border-none shadow-none">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1 max-w-md" />
              <Skeleton className="h-10 w-[180px]" />
            </div>

            {/* Table Skeleton */}
            <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                  <TableRow>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-4 w-20" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-none shadow-lg">
          <CardContent className="py-12 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-destructive">Failed to load stations.</p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-6 px-4 md:px-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
        >
          <div className="flex items-start gap-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              className="mt-1 h-10 w-10 cursor-pointer rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80 dark:hover:bg-gray-800 transition-all duration-300"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="space-y-2">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                  <Activity className="h-3 w-3 text-green-500" />
                  Infrastructure / EV Stations
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
                  Charging Stations
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Monitor and manage charging stations across cities
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Stats Badge */}
            <Badge
              variant="secondary"
              className="hidden items-center gap-2 rounded-full px-3 py-1.5 sm:flex bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800"
            >
              <Zap className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium">
                Total Stations: {summary.totalStations}
              </span>
            </Badge>

            {/* Quick Stats Badge - Active */}
            <Badge
              variant="secondary"
              className="hidden items-center gap-2 rounded-full px-3 py-1.5 sm:flex bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800"
            >
              <Activity className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium">
                Active: {summary.activeStations}
              </span>
            </Badge>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 rounded-full border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80 transition-all duration-300"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            {/* Add Station Button */}
            <Button
              size="sm"
              className="h-9 gap-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg text-white cursor-pointer"
              onClick={() => router.push("/ev-charge-manager/stations/new")}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Station</span>
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <Card className="border-none shadow-md bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900 dark:to-green-950/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Stations
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                    {summary.totalStations}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900 dark:to-green-950/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Stations
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {summary.activeStations}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900 dark:to-green-950/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Chargers
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {summary.totalChargers}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Battery className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900 dark:to-green-950/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Verified Stations
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {summary.verifiedStations}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900 dark:to-green-950/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Average Rating
                  </p>
                  <p className="text-2xl font-bold text-amber-600">
                    {summary.avgRating > 0
                      ? formatRating(summary.avgRating)
                      : "-"}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 ">
            <div className="space-y-5">
              {/* Search Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-3.5 w-3.5 text-green-500" />
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Search
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Station name or city..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-0 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all text-sm"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              {/* Filters Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-3.5 w-3.5 text-green-500" />
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Filters
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={(value: "ALL" | "ACTIVE" | "INACTIVE") =>
                      setStatusFilter(value)
                    }
                  >
                    <SelectTrigger className="h-10 px-3 rounded-lg border-0 bg-gray-50 dark:bg-gray-800/50 text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={verifiedFilter}
                    onValueChange={(value: "ALL" | "YES" | "NO") =>
                      setVerifiedFilter(value)
                    }
                  >
                    <SelectTrigger className="h-10 px-3 rounded-lg border-0 bg-gray-50 dark:bg-gray-800/50 text-sm">
                      <SelectValue placeholder="Verification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All</SelectItem>
                      <SelectItem value="YES">Verified</SelectItem>
                      <SelectItem value="NO">Unverified</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger className="h-10 px-3 rounded-lg border-0 bg-gray-50 dark:bg-gray-800/50 text-sm">
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Cities</SelectItem>
                      {cityOptions.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters */}
              {(statusFilter !== "ALL" ||
                verifiedFilter !== "ALL" ||
                cityFilter !== "ALL") && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {statusFilter !== "ALL" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400">
                      Status: {statusFilter}
                      <button
                        onClick={() => setStatusFilter("ALL")}
                        className="hover:text-red-500"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {verifiedFilter !== "ALL" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400">
                      {verifiedFilter === "YES" ? "Verified" : "Unverified"}
                      <button
                        onClick={() => setVerifiedFilter("ALL")}
                        className="hover:text-red-500"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {cityFilter !== "ALL" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400">
                      City: {cityFilter}
                      <button
                        onClick={() => setCityFilter("ALL")}
                        className="hover:text-red-500"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stations Table - Modern Redesign */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 rounded-2xl overflow-hidden bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 backdrop-blur-sm">
            {/* Modern Header with Gradient */}
            <div className="relative overflow-hidden">
              <div className="relative px-6 py-4 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        Stations Overview
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Manage and monitor all charging stations
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md px-3 py-1">
                    <span className="font-bold">{filteredStations.length}</span>
                    <span className="ml-1 text-white/90">Active Stations</span>
                  </Badge>
                </div>
              </div>
            </div>

            <CardContent className="p-0">
              <div className="rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50/80 to-gray-100/50 dark:from-gray-900/80 dark:to-gray-900/50 border-b-2 border-gray-200/50 dark:border-gray-800/50 hover:bg-transparent">
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
                        Station Details
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                        Location
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                        Address
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                        Verification
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-center">
                        Chargers
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-center">
                        Active Sessions
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-center">
                        Rating
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStations.length ? (
                      filteredStations.map((station, index) => (
                        <motion.tr
                          key={station.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.3 }}
                          className="group hover:bg-gradient-to-r hover:from-green-50/70 hover:to-emerald-50/50 dark:hover:from-green-950/30 dark:hover:to-emerald-950/20 transition-all duration-300 cursor-pointer border-b border-gray-100/50 dark:border-gray-800/50"
                          onClick={() =>
                            router.push(
                              `/ev-charge-manager/stations/${station.id}`,
                            )
                          }
                        >
                          <TableCell className="font-medium py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                                <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                  <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                  {station.name}
                                </p>
                                <p className="text-xs font-mono text-muted-foreground">
                                  ID: {station.id}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <div className="p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <span className="font-medium text-sm">
                                {station.city ?? "-"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="text-sm truncate text-muted-foreground group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                              {station.address ?? "-"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "gap-1.5 px-2.5 py-1 text-xs font-semibold shadow-sm",
                                station.status === "ACTIVE"
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-green-500/25"
                                  : "bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0",
                              )}
                            >
                              {station.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {station.isVerified ? (
                              <Badge className="gap-1.5 bg-gradient-to-r from-emerald-50 to-green-50 text-green-700 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                                <CheckCircle2 className="h-3 w-3" />
                                <span className="text-xs font-semibold">
                                  Verified
                                </span>
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="gap-1.5 bg-gray-100 text-gray-600 border border-gray-200"
                              >
                                <XCircle className="h-3 w-3" />
                                <span className="text-xs">Unverified</span>
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-900/50 group-hover:bg-white dark:group-hover:bg-gray-900 transition-colors">
                              <Battery className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                              <span className="font-bold text-gray-900 dark:text-white">
                                {station.chargingPoints?.length ?? 0}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({getTotalPower(station)} kW)
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-900/50 group-hover:bg-white dark:group-hover:bg-gray-900 transition-colors">
                              <Activity className="h-3.5 w-3.5 text-blue-500" />
                              <span className="font-bold text-gray-900 dark:text-white">
                                {getActiveSessions(station)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                              <span className="font-bold text-gray-900 dark:text-white">
                                {station.ratings?.length
                                  ? formatRating(getAverageRating(station))
                                  : "-"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-xl border-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 hover:from-green-500 hover:to-emerald-600 hover:text-white transition-all duration-300 px-4 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(
                                  `/ev-charge-manager/stations/${station.id}`,
                                )
                              }}
                            >
                              <span className="text-sm font-semibold">
                                Details
                              </span>
                              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-16">
                          <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full blur-2xl opacity-20 animate-pulse" />
                              <div className="relative p-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                <Search className="h-12 w-12 text-muted-foreground" />
                              </div>
                            </div>
                            <div className="space-y-2 text-center">
                              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                No stations found
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Try adjusting your filters to find what you're
                                looking for.
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="default"
                              className="rounded-xl border-2 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all"
                              onClick={() => {
                                setSearchTerm("")
                                setStatusFilter("ALL")
                                setVerifiedFilter("ALL")
                                setCityFilter("ALL")
                              }}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reset all filters
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
