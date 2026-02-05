"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TripCard from "@/components/user-dashboard/trip/TripCard"
import TripSkeleton from "@/components/user-dashboard/trip/TripSkeleton"
import TripsEmptyState from "@/components/user-dashboard/trip/TripsEmptyState"
import { Trip, TripCategory } from "@/types/trips"
import { fetchTrips } from "@/types/mockTrips"

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState<TripCategory>("upcoming")

  const {
    data: trips,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trips"],
    queryFn: fetchTrips,
  })

  // Filter trips based on active tab
  const filterTrips = (trips: Trip[] | undefined, category: TripCategory) => {
    if (!trips) return []

    const now = new Date()
    return trips.filter((trip) => {
      const departureTime = new Date(trip.departureTime)

      if (category === "upcoming") {
        return departureTime > now && trip.status !== "CANCELLED"
      } else {
        return departureTime <= now || trip.status === "CANCELLED"
      }
    })
  }

  const upcomingTrips = filterTrips(trips, "upcoming")
  const pastTrips = filterTrips(trips, "past")

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Trips
          </h1>
          <p className="text-gray-600">
            Please try refreshing the page or contact support if the problem
            persists.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
        <p className="text-gray-600 mt-2">
          Manage your upcoming journeys and view past travels
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="upcoming"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TripCategory)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-8">
          <TabsTrigger value="upcoming">
            Upcoming Trips ({upcomingTrips.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Trips ({pastTrips.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Trips Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <TripSkeleton key={i} />
              ))}
            </div>
          ) : upcomingTrips.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {upcomingTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} category="upcoming" />
              ))}
            </div>
          ) : (
            <TripsEmptyState category="upcoming" />
          )}
        </TabsContent>

        {/* Past Trips Tab */}
        <TabsContent value="past" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <TripSkeleton key={i} />
              ))}
            </div>
          ) : pastTrips.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {pastTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} category="past" />
              ))}
            </div>
          ) : (
            <TripsEmptyState category="past" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
