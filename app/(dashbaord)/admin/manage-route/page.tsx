"use client"

import React from "react"
import RoutesTable from "@/components/admin-dashboard/route/routes-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Route, MapPin, BarChart, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getRouteStats } from "@/services/route.api"

// Skeleton component for stats cards
const StatsCardSkeleton = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </CardContent>
    </Card>
  )
}

// Skeleton for the main table section
const TableSectionSkeleton = () => {
  return (
    <Card className="border-none">
      <CardHeader>
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table Toolbar Skeleton */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-9 w-32 bg-blue-600 dark:bg-blue-700 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Table Header Skeleton */}
          <div className="rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <div className="border-b bg-gray-50 dark:bg-gray-800/50 p-4">
                <div className="flex gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Table Rows Skeleton */}
              <div className="divide-y">
                {[...Array(5)].map((_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {[...Array(8)].map((_, cellIndex) => (
                        <div key={cellIndex}>
                          <div
                            className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                            style={{
                              width:
                                cellIndex === 0
                                  ? "40px"
                                  : cellIndex === 1
                                  ? "180px"
                                  : cellIndex === 2
                                  ? "120px"
                                  : cellIndex === 3
                                  ? "120px"
                                  : cellIndex === 4
                                  ? "100px"
                                  : cellIndex === 5
                                  ? "100px"
                                  : cellIndex === 6
                                  ? "80px"
                                  : "100px",
                            }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table Footer Skeleton */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                ></div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RoutesManagementPage() {
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["route-stats"],
    queryFn: getRouteStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Use actual data from API or fallback to loading state
  const stats = statsData || {
    totalRoutes: 0,
    activeRoutes: 0,
    totalDistance: 0,
    totalMidPoints: 0,
  }

  return (
    <div className="mx-auto p-6 space-y-6 bg-background rounded-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Routes Management
          </h1>
          <p className="text-muted-foreground">
            Manage transportation routes, mid-points, and assignments
          </p>
        </div>
      </div>

      {/* Stats Cards with Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingStats ? (
          // Show skeleton for all stats cards while loading
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          // Show actual stats cards when loaded
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Routes
                </CardTitle>
                <Route className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRoutes}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeRoutes} active,{" "}
                  {stats.totalRoutes - stats.activeRoutes} inactive
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Routes
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeRoutes}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalRoutes > 0
                    ? `${Math.round(
                        (stats.activeRoutes / stats.totalRoutes) * 100
                      )}% of total`
                    : "No routes yet"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Distance
                </CardTitle>
                <Route className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalDistance} km
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalRoutes > 0
                    ? `Average ${Math.round(
                        stats.totalDistance / stats.totalRoutes
                      )} km per route`
                    : "No routes yet"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Mid-points
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMidPoints}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalRoutes > 0
                    ? `Average ${Math.round(
                        stats.totalMidPoints / stats.totalRoutes
                      )} per route`
                    : "No routes yet"}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Routes Table - Show skeleton for entire table section if stats are loading */}
      {isLoadingStats ? (
        <TableSectionSkeleton />
      ) : (
        <Card className="border-none">
          <CardHeader>
            <CardTitle>All Routes</CardTitle>
            <CardDescription>
              View, create, edit, and manage all transportation routes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RoutesTable />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
