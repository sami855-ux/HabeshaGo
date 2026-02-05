// app/routes/[routeId]/page.tsx
"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  MapPin,
  Clock,
  DollarSign,
  Navigation,
  Bus as BusIcon,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Users,
  Loader2,
  PlayCircle,
  PauseCircle,
  AlertTriangle,
  RotateCcw,
  Edit,
  Menu,
  Calendar,
  Map,
  Eye,
  ChevronDown,
  ChevronUp,
  Package,
  Globe,
  Shield,
  BarChart,
  TrendingUp,
  Users as UsersIcon,
} from "lucide-react"
import { getRouteById, updateRoute } from "@/services/route.api"
import { toast } from "sonner"

// Types based on your Prisma schema
interface RouteMidPoint {
  id: number
  name: string
  lat: number
  lng: number
  order: number
}

interface Bus {
  id: number
  busNumber: string
  capacity: number
  status: "ACTIVE" | "MAINTENANCE" | "OUT_OF_SERVICE"
  driverId?: string
  currentStop?: string
  nextDestination?: string
  availableSeats?: number
  reservedSeats: number
  departureTime?: string
  estimatedArrival?: string
  delayMinutes: number
}

interface Route {
  id: number
  name: string
  origin: string
  destination: string
  distanceKm?: number
  estimatedTimeMin?: number
  price?: string
  currency: string
  isActive: boolean
  isSuspended: boolean
  createdAt: string
  minibuses: any[]
  midPoints: RouteMidPoint[]
  buses: Bus[]
}

interface UpdateStatusData {
  isActive?: boolean
  isSuspended?: boolean
}

const RouteDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const routeId = params.routeId as string
  const [activeTab, setActiveTab] = useState<"overview" | "buses" | "map">(
    "overview",
  )
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [expandedMidPoints, setExpandedMidPoints] = useState(false)

  // Fetch route data
  const {
    data: route,
    isLoading,
    error,
  } = useQuery<Route>({
    queryKey: ["route", routeId],
    queryFn: async () => getRouteById(routeId),
    enabled: !!routeId,
  })

  // Update route status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (data: UpdateStatusData) => {
      return await updateRoute(routeId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route", routeId] })
      toast.success("Route status updated successfully")
      setShowActionsMenu(false)
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update route status")
    },
  })

  // Format time
  const formatTime = (timeString?: string) => {
    if (!timeString) return "N/A"
    return new Date(timeString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate estimated arrival with delay
  const getAdjustedArrival = (
    estimatedArrival?: string,
    delayMinutes: number = 0,
  ) => {
    if (!estimatedArrival) return "N/A"

    const arrival = new Date(estimatedArrival)
    arrival.setMinutes(arrival.getMinutes() + delayMinutes)

    return arrival.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status badge with enhanced design
  const getStatusBadge = (isActive: boolean, isSuspended: boolean) => {
    if (isSuspended) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Suspended
        </span>
      )
    }

    return isActive ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-50 to-emerald-100 text-green-800 border border-green-200">
        <CheckCircle className="w-4 h-4 mr-2" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200">
        <XCircle className="w-4 h-4 mr-2" />
        Inactive
      </span>
    )
  }

  // Get bus status badge with enhanced design
  const getBusStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: {
        bg: "bg-gradient-to-r from-green-50 to-emerald-100",
        text: "text-green-800",
        border: "border border-green-200",
        label: "Active",
      },
      MAINTENANCE: {
        bg: "bg-gradient-to-r from-yellow-50 to-amber-100",
        text: "text-yellow-800",
        border: "border border-yellow-200",
        label: "Maintenance",
      },
      OUT_OF_SERVICE: {
        bg: "bg-gradient-to-r from-red-50 to-rose-100",
        text: "text-red-800",
        border: "border border-red-200",
        label: "Out of Service",
      },
    }

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
      >
        {config.label}
      </span>
    )
  }

  // Action handlers
  const handleActivate = () => {
    updateStatusMutation.mutate({ isActive: true, isSuspended: false })
  }

  const handleDeactivate = () => {
    updateStatusMutation.mutate({ isActive: false })
  }

  const handleSuspend = () => {
    updateStatusMutation.mutate({ isSuspended: true })
  }

  const handleResume = () => {
    updateStatusMutation.mutate({ isSuspended: false })
  }

  const handleEditRoute = () => {
    router.push(`/routes/${routeId}/edit`)
  }

  const handleViewAnalytics = () => {
    router.push(`/routes/${routeId}/analytics`)
  }

  // Get available actions based on current status
  const getAvailableActions = () => {
    if (!route) return []

    const actions = []

    if (!route.isActive) {
      actions.push({
        label: "Activate",
        icon: PlayCircle,
        onClick: handleActivate,
        className:
          "hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-100 text-green-700",
        description: "Make this route available for bookings",
      })
    }

    if (route.isActive && !route.isSuspended) {
      actions.push({
        label: "Deactivate",
        icon: PauseCircle,
        onClick: handleDeactivate,
        className:
          "hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-100 text-yellow-700",
        description: "Temporarily stop bookings for this route",
      })
    }

    if (!route.isSuspended) {
      actions.push({
        label: "Suspend",
        icon: AlertTriangle,
        onClick: handleSuspend,
        className:
          "hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-100 text-red-700",
        description: "Emergency suspension of all operations",
      })
    }

    if (route.isSuspended) {
      actions.push({
        label: "Resume",
        icon: RotateCcw,
        onClick: handleResume,
        className:
          "hover:bg-gradient-to-r hover:from-blue-50 hover:to-sky-100 text-blue-700",
        description: "Restore operations after suspension",
      })
    }

    return actions
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading route details...
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Please wait while we fetch the information
          </p>
        </div>
      </div>
    )
  }

  if (error || !route) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Route Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error ? error.message : "The requested route could not be found."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/admin/manage-route"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              ← Back to Routes
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const availableActions = getAvailableActions()
  const isMutating = updateStatusMutation.isPending

  // Calculate some statistics
  const activeBusesCount = route.buses.filter(
    (b) => b.status === "ACTIVE",
  ).length
  const totalCapacity = route.buses.reduce((sum, bus) => sum + bus.capacity, 0)
  const averageDelay =
    route.buses.length > 0
      ? Math.round(
          route.buses.reduce((sum, bus) => sum + bus.delayMinutes, 0) /
            route.buses.length,
        )
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <nav className="flex items-center space-x-2 text-sm mb-3">
                  <Link
                    href="/admin/manage-route"
                    className="text-gray-500 hover:text-gray-700 transition-colors font-medium"
                  >
                    Routes
                  </Link>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-blue-600 font-semibold">
                    {route.name}
                  </span>
                </nav>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {route.name}
                  </h1>
                  {getStatusBadge(route.isActive, route.isSuspended)}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{route.origin}</span>
                  <ChevronRight className="w-4 h-4 mx-1" />
                  <span className="font-medium">{route.destination}</span>
                  {route.distanceKm && (
                    <span className="ml-3 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                      {route.distanceKm} km
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleEditRoute}
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleViewAnalytics}
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl text-sm font-medium text-purple-700 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 shadow-sm hover:shadow"
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  Analytics
                </button>

                {availableActions.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowActionsMenu(!showActionsMenu)}
                      disabled={isMutating}
                      className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      {isMutating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Menu className="w-4 h-4 mr-2" />
                          Actions
                        </>
                      )}
                    </button>

                    {showActionsMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowActionsMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 overflow-hidden">
                          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">
                              Route Management
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Update route status and operations
                            </p>
                          </div>
                          <div className="p-2">
                            {availableActions.map((action, index) => {
                              const Icon = action.icon
                              return (
                                <button
                                  key={index}
                                  onClick={() => {
                                    action.onClick()
                                  }}
                                  disabled={isMutating}
                                  className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] ${action.className} disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center mr-3">
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div className="text-left">
                                    <div className="font-semibold">
                                      {action.label}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-0.5">
                                      {action.description}
                                    </div>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Status Alerts */}
      {route.isSuspended && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400 rounded-r-xl p-5 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-semibold text-red-800">
                  Route Suspended
                </h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>
                    This route has been temporarily suspended. All operations
                    are halted until resumed by an administrator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!route.isActive && !route.isSuspended && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-100 border-l-4 border-yellow-400 rounded-r-xl p-5 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-semibold text-yellow-800">
                  Route Inactive
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>
                    This route is currently inactive and not available for new
                    bookings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: "overview", label: "Overview", icon: Eye },
                { id: "buses", label: "Buses", icon: BusIcon },
                { id: "map", label: "Map View", icon: Map },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex-1 sm:flex-none px-6 py-4 font-medium text-sm border-b-2 flex items-center justify-center gap-2 transition-all duration-200
                      ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600 bg-blue-50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <main className="p-6 sm:p-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                        {/* <Roa className="w-6 h-6 text-blue-600" /> */}
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                        Distance
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                      {route.distanceKm ? `${route.distanceKm} km` : "N/A"}
                    </h3>
                    <p className="text-gray-600 text-sm">Total route length</p>
                  </div>

                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-green-600" />
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 bg-green-50 text-green-700 rounded-full">
                        Duration
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                      {route.estimatedTimeMin
                        ? `${Math.floor(route.estimatedTimeMin / 60)}h ${route.estimatedTimeMin % 60}m`
                        : "N/A"}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Estimated travel time
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-purple-600" />
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full">
                        Fare
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                      {route.price ? `${route.price} ${route.currency}` : "N/A"}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Standard ticket price
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-amber-600" />
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full">
                        Capacity
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                      {totalCapacity.toLocaleString()}
                    </h3>
                    <p className="text-gray-600 text-sm">Total daily seats</p>
                  </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Route Path */}
                  <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Navigation className="w-5 h-5 text-blue-600" />
                            Route Path
                          </h2>
                          <button
                            onClick={() =>
                              setExpandedMidPoints(!expandedMidPoints)
                            }
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            {expandedMidPoints ? "Show less" : "Show all"}
                            {expandedMidPoints ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="relative">
                          {/* Route Line */}
                          <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500 via-blue-400 to-red-500"></div>

                          {/* Origin */}
                          <div className="flex items-center mb-8 relative z-10">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-lg">
                                A
                              </span>
                            </div>
                            <div className="ml-6">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {route.origin}
                                </h3>
                                <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                  Origin
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mt-1">
                                Starting point of the journey
                              </p>
                            </div>
                          </div>

                          {/* Mid Points - Collapsible */}
                          {route.midPoints
                            .sort((a, b) => a.order - b.order)
                            .slice(
                              0,
                              expandedMidPoints ? route.midPoints.length : 2,
                            )
                            .map((point, index) => (
                              <div
                                key={point.id}
                                className="flex items-center mb-8 relative z-10"
                              >
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center shadow">
                                  <span className="text-white font-semibold text-sm">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="ml-6">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-gray-900">
                                      {point.name}
                                    </h3>
                                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                      Stop {index + 1}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-gray-500 text-sm mt-1">
                                    <span>Lat: {point.lat.toFixed(4)}</span>
                                    <span>Lng: {point.lng.toFixed(4)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}

                          {/* Destination */}
                          <div className="flex items-center relative z-10">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-lg">
                                B
                              </span>
                            </div>
                            <div className="ml-6">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {route.destination}
                                </h3>
                                <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                  Destination
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mt-1">
                                Final destination point
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Status & Stats */}
                  <div className="space-y-8">
                    {/* Status Card */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-gray-700" />
                          Route Status
                        </h3>
                        <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">
                          Updated {formatDate(route.createdAt)}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                Current Status
                              </p>
                              <p className="text-sm text-gray-500">
                                Route availability for bookings
                              </p>
                            </div>
                            {getStatusBadge(route.isActive, route.isSuspended)}
                          </div>
                        </div>

                        <div>
                          <p className="font-medium text-gray-900 mb-3">
                            Quick Actions
                          </p>
                          {availableActions.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2">
                              {availableActions.map((action, index) => {
                                const Icon = action.icon
                                return (
                                  <button
                                    key={index}
                                    onClick={action.onClick}
                                    disabled={isMutating}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 hover:shadow ${action.className} disabled:opacity-50 disabled:cursor-not-allowed`}
                                  >
                                    <div className="flex items-center">
                                      <Icon className="w-4 h-4 mr-3" />
                                      <span className="font-medium">
                                        {action.label}
                                      </span>
                                    </div>
                                    <div className="text-xs font-medium px-2 py-1 bg-white rounded-lg">
                                      Click
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-gray-500 text-sm">
                                All status options are configured
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm p-6">
                      <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gray-700" />
                        Quick Stats
                      </h3>
                      <div className="space-y-4">
                        {[
                          {
                            label: "Active Buses",
                            value: activeBusesCount,
                            icon: BusIcon,
                            color: "text-green-600",
                            bg: "bg-green-50",
                          },
                          {
                            label: "Total Buses",
                            value: route.buses.length,
                            icon: Package,
                            color: "text-blue-600",
                            bg: "bg-blue-50",
                          },
                          {
                            label: "Minibuses",
                            value: route.minibuses.length,
                            icon: Users,
                            color: "text-purple-600",
                            bg: "bg-purple-50",
                          },
                          {
                            label: "Mid Points",
                            value: route.midPoints.length,
                            icon: MapPin,
                            color: "text-amber-600",
                            bg: "bg-amber-50",
                          },
                          {
                            label: "Avg Delay",
                            value: `${averageDelay}m`,
                            icon: Clock,
                            color: "text-rose-600",
                            bg: "bg-rose-50",
                          },
                        ].map((stat, index) => {
                          const Icon = stat.icon
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}
                                >
                                  <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <span className="font-medium text-gray-700">
                                  {stat.label}
                                </span>
                              </div>
                              <span className="text-2xl font-bold text-gray-900">
                                {stat.value}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Buses Tab */}
            {activeTab === "buses" && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <BusIcon className="w-5 h-5 text-gray-700" />
                        Assigned Buses
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {route.buses.length} buses managing this route
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-100 text-green-800 text-sm font-medium rounded-lg border border-green-200">
                        {activeBusesCount} Active
                      </span>
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow">
                        + Add Bus
                      </button>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Bus Details
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status & Schedule
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Seats
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {route.buses.map((bus) => (
                        <tr
                          key={bus.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mr-4">
                                <BusIcon className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900">
                                    {bus.busNumber}
                                  </h4>
                                  {bus.driverId && (
                                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                      {bus.driverId}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  Capacity: {bus.capacity} seats
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-2">
                              <div>{getBusStatusBadge(bus.status)}</div>
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {formatTime(bus.departureTime)}
                                </div>
                                {bus.delayMinutes > 0 && (
                                  <div className="flex items-center gap-2 mt-1 text-amber-600">
                                    <AlertCircle className="w-4 h-4" />
                                    {bus.delayMinutes} min delay
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full"
                                    style={{
                                      width: `${((bus.availableSeats || 0) / bus.capacity) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                  {bus.availableSeats || 0}/{bus.capacity}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {bus.reservedSeats} seats reserved
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                                <Eye className="w-5 h-5" />
                              </button>
                              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                                <Edit className="w-5 h-5" />
                              </button>
                              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Map Tab */}
            {activeTab === "map" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Map className="w-5 h-5 text-gray-700" />
                    Route Map
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Interactive visualization of the route with geographical
                    context
                  </p>
                </div>
                <div className="p-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl h-96 flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Simulated Map Background */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-gray-300 rounded-full"></div>
                      <div className="absolute top-1/3 right-1/3 w-24 h-24 border-2 border-gray-300 rounded-full"></div>
                      <div className="absolute bottom-1/4 left-1/3 w-40 h-40 border-2 border-gray-300 rounded-full"></div>
                    </div>

                    <div className="relative z-10 text-center max-w-lg">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Globe className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Map Integration
                      </h3>
                      <p className="text-gray-600 mb-6">
                        This interactive map displays the complete route from
                        origin to destination, including all intermediate stops
                        with real-time geographical data.
                      </p>

                      <div className="inline-flex items-center justify-center flex-wrap gap-3 mb-8">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          <span className="font-medium text-blue-800">
                            {route.origin}
                          </span>
                        </div>

                        {route.midPoints.slice(0, 3).map((point, index) => (
                          <React.Fragment key={point.id}>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              <span className="font-medium text-gray-700">
                                {point.name}
                              </span>
                            </div>
                          </React.Fragment>
                        ))}

                        {route.midPoints.length > 3 && (
                          <>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                              <span className="font-medium text-gray-700">
                                +{route.midPoints.length - 3} more
                              </span>
                            </div>
                          </>
                        )}

                        <ChevronRight className="w-5 h-5 text-gray-400" />
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                          <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                          <span className="font-medium text-red-800">
                            {route.destination}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-center">
                        <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg">
                          Open Full Map
                        </button>
                        <button className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200">
                          Export Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default RouteDetailsPage
