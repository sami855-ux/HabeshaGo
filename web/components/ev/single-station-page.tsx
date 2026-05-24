// components/charging-stations/single-station-page.tsx
"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Zap,
  Clock,
  Calendar,
  Star,
  Shield,
  FileText,
  Image as ImageIcon,
  Activity,
  Power,
  Gauge,
  Battery,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wrench,
  Phone,
  Mail,
  Globe,
  Users,
  TrendingUp,
  Download,
  Share2,
  ChevronLeft,
} from "lucide-react"
import { format, formatDistance } from "date-fns"
import { cn } from "@/lib/utils"
import { ChargingStation } from "@/types/ev"
import { StationGallery } from "./station-gallery"
import { ChargingPointsList } from "./charging-points-list"
// import { SessionsTable } from "./sessions-table";
// import { DocumentsList } from "./documents-list";
import { TariffsCard } from "./tariffs-card"
import { StationMap } from "./station-map"
import { getEVStationById } from "@/services/ev.api"
import { SessionsTable } from "./sessions-table"
import { DocumentsList } from "./documents-list"
import { ReviewsSection } from "./reviews-section"
// import { ReviewsSection } from "./reviews-section";

interface SingleStationPageProps {
  stationId: number
}

export function SingleStationPage({ stationId }: SingleStationPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  const {
    data: station,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["station", stationId],
    queryFn: () => getEVStationById(String(stationId)),
    // enabled:
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading station details...
          </p>
        </div>
      </div>
    )
  }

  if (error || !station) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Station Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The charging station you&rsquo;re looking for doesn&rsquo;t exist or
            has been removed.
          </p>
          <Button onClick={() => router.push("/charging-stations")}>
            Back to Stations
          </Button>
        </Card>
      </div>
    )
  }

  // Calculate metrics
  const totalChargers = station.chargingPoints.length
  const availableChargers = station.chargingPoints.filter(
    (cp) => cp.status === "AVAILABLE",
  ).length
  const occupiedChargers = station.chargingPoints.filter(
    (cp) => cp.status === "OCCUPIED",
  ).length
  const faultedChargers = station.chargingPoints.filter(
    (cp) => cp.status === "FAULTED",
  ).length

  const averageRating =
    station.ratings.length > 0
      ? station.ratings.reduce((acc, r) => acc + r.rating, 0) /
        station.ratings.length
      : 0

  const totalSessions = station.sessions.length
  const activeSessions = station.sessions.filter(
    (s) => s.status === "ACTIVE",
  ).length

  const totalRevenue = station.sessions.reduce(
    (acc, s) => acc + parseFloat(s.totalCost || "0"),
    0,
  )

  const totalEnergy = station.sessions.reduce(
    (acc, s) => acc + parseFloat(s.energyConsumedKwh || "0"),
    0,
  )

  const statusConfig = {
    ACTIVE: {
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-100",
      badge: "bg-green-500",
    },
    MAINTENANCE: {
      icon: Wrench,
      color: "text-yellow-500",
      bg: "bg-yellow-100",
      badge: "bg-yellow-500",
    },
    INACTIVE: {
      icon: XCircle,
      color: "text-gray-500",
      bg: "bg-gray-100",
      badge: "bg-gray-500",
    },
  }

  const StatusIcon = statusConfig[station.status].icon

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/80 shadow-sm"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{station.name}</h1>
                <Badge
                  className={cn(
                    "text-white",
                    statusConfig[station.status].badge,
                  )}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {station.status}
                </Badge>
                {station.isVerified && (
                  <Badge
                    variant="outline"
                    className="border-blue-200 text-blue-700 bg-blue-50"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {station.address || "No address"},{" "}
                    {station.city || "No city"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Added {format(new Date(station.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              size="sm"
              onClick={() =>
                router.push(`/charging-stations/${stationId}/edit`)
              }
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Station
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chargers</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{totalChargers}</span>
                  <span className="text-xs text-green-600">
                    {availableChargers} available
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2 flex gap-2 text-xs">
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                {availableChargers} Available
              </Badge>
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200"
              >
                {occupiedChargers} Occupied
              </Badge>
              {faultedChargers > 0 && (
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 border-yellow-200"
                >
                  {faultedChargers} Faulted
                </Badge>
              )}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessions</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{totalSessions}</span>
                  {activeSessions > 0 && (
                    <Badge className="bg-green-500 text-white">
                      Active: {activeSessions}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last session:{" "}
              {station.sessions[0]
                ? format(
                    new Date(station.sessions[0].startTime),
                    "MMM dd, h:mm a",
                  )
                : "No sessions"}
            </p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <span className="text-2xl font-bold">
                  ${totalRevenue.toFixed(2)}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {totalEnergy.toFixed(1)} kWh delivered
            </p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {averageRating.toFixed(1)}
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          star <= averageRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on {station.ratings.length} reviews
            </p>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-6 w-full max-w-3xl mx-auto bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-xl p-1">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="chargers" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Chargers</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="tariffs" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Tariffs</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Images */}
              <div className="lg:col-span-2 space-y-6">
                <StationGallery
                  images={station.images}
                  stationName={station.name}
                />

                {/* Charging Points Summary */}
                <Card className="p-6 shadow-none">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Charging Points Overview
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries({
                      AVAILABLE: {
                        count: availableChargers,
                        color: "green",
                        icon: CheckCircle2,
                      },
                      OCCUPIED: {
                        count: occupiedChargers,
                        color: "red",
                        icon: Zap,
                      },
                      FAULTED: {
                        count: faultedChargers,
                        color: "yellow",
                        icon: AlertCircle,
                      },
                      OFFLINE: {
                        count: station.chargingPoints.filter(
                          (cp) => cp.status === "OFFLINE",
                        ).length,
                        color: "gray",
                        icon: Power,
                      },
                    }).map(([status, { count, color, icon: Icon }]) => (
                      <div
                        key={status}
                        className="text-center p-3 rounded-lg bg-muted/50"
                      >
                        <Icon
                          className={cn(
                            "h-6 w-6 mx-auto mb-2",
                            `text-${color}-500`,
                          )}
                        />
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-xs text-muted-foreground">
                          {status}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Recent Sessions */}
                <Card className="p-6 shadow-none">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Recent Sessions
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("sessions")}
                    >
                      View all
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {station.sessions.slice(0, 5).map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              U{session.userId.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              Session #{session.id}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(session.startTime),
                                "MMM dd, h:mm a",
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {session.energyConsumedKwh || 0} kWh
                          </p>
                          <Badge
                            className={cn(
                              session.status === "ACTIVE" && "bg-green-500",
                              session.status === "COMPLETED" && "bg-blue-500",
                              session.status === "CANCELLED" && "bg-gray-500",
                            )}
                          >
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Location Map */}
                <StationMap
                  lat={station.lat}
                  lng={station.lng}
                  name={station.name}
                  city={station.city}
                  address={station.address}
                />

                {/* Station Details */}
                <Card className="p-6 shadow-none">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Station Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Station ID</span>
                      <span className="font-medium">#{station.id}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Coordinates</span>
                      <span className="font-medium">
                        {station.lat.toFixed(4)}, {station.lng.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">
                        Total Chargers
                      </span>
                      <span className="font-medium">{totalChargers}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Power Range</span>
                      <span className="font-medium">
                        {Math.min(
                          ...station.chargingPoints.map((cp) => cp.powerKw),
                        )}{" "}
                        -{" "}
                        {Math.max(
                          ...station.chargingPoints.map((cp) => cp.powerKw),
                        )}{" "}
                        kW
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">
                        Connector Types
                      </span>
                      <div className="flex gap-1">
                        {Array.from(
                          new Set(
                            station.chargingPoints.map(
                              (cp) => cp.connectorType,
                            ),
                          ),
                        ).map((type) => (
                          <Badge key={type} variant="outline">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">
                        Last Updated
                      </span>
                      <span className="font-medium">
                        {formatDistance(
                          new Date(station.updatedAt),
                          new Date(),
                          { addSuffix: true },
                        )}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Active Tariff */}
                <TariffsCard tariffs={station.tariffs} />

                {/* Documents Summary */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Documents
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("documents")}
                    >
                      View all
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {station.documents.slice(0, 3).map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{doc.type}</span>
                        </div>
                        {doc.verified && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Verified
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Chargers Tab */}
          <TabsContent value="chargers">
            <ChargingPointsList chargingPoints={station.chargingPoints} />
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <SessionsTable sessions={station.sessions} />
          </TabsContent>

          <TabsContent value="tariffs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {station.tariffs.map((tariff) => (
                <TariffsCard key={tariff.id} tariff={tariff} detailed />
              ))}
            </div>
          </TabsContent>
          {/* Documents Tab */}
          <TabsContent value="documents">
            <DocumentsList
              documents={station.documents}
              onVerify={async (documentId, verified) => {
                // Call your API to update verification status
                await fetch(`/api/documents/${documentId}/verify`, {
                  method: "PUT",
                  body: JSON.stringify({ verified }),
                })
              }}
            />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <ReviewsSection
              ratings={station.ratings}
              stationId={station.id}
              onAddReview={async (review) => {
                // Add review API call
                await fetch("/api/reviews", {
                  method: "POST",
                  body: JSON.stringify(review),
                })
              }}
              onEditReview={async (id, review) => {
                // Edit review API call
                await fetch(`/api/reviews/${id}`, {
                  method: "PUT",
                  body: JSON.stringify(review),
                })
              }}
              onDeleteReview={async (id) => {
                // Delete review API call
                await fetch(`/api/reviews/${id}`, {
                  method: "DELETE",
                })
              }}
              onReportReview={async (id, reason) => {
                // Report review API call
                await fetch(`/api/reviews/${id}/report`, {
                  method: "POST",
                  body: JSON.stringify({ reason }),
                })
              }}
              currentUserId="user-123" // From auth context
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
