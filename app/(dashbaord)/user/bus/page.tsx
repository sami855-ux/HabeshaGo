"use client"

import { useState } from "react"
import BusSearchForm from "@/components/user-dashboard/bus/bus-search-form"
import BusList from "@/components/user-dashboard/bus/bus-list"
import BusDetailsSheet from "@/components/user-dashboard/bus/bus-details-sheet"
import BookingPage from "@/components/user-dashboard/bus/booking-page"
import BookingConfirmation from "@/components/user-dashboard/bus/booking-confirmation"
import { Bus, Booking } from "@/types/booking"
import { searchBuses, getBusDetails } from "@/types/bus"
import { motion } from "framer-motion"

export default function HomePage() {
  const [searchParams, setSearchParams] = useState<{
    from: string
    to: string
    date: Date
    passengers: number
  } | null>(null)

  const [buses, setBuses] = useState<Bus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleSearch = async (data: {
    from: string
    to: string
    date: Date
    passengers: number
  }) => {
    setIsLoading(true)
    setSearchParams(data)

    try {
      const results = await searchBuses(
        data.from,
        data.to,
        data.date,
        data.passengers,
      )
      setBuses(results)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = async (busId: number) => {
    const bus = await getBusDetails(busId)
    if (bus) {
      setSelectedBus(bus)
      setIsSheetOpen(true)
    }
  }

  const handleBook = (busId: number) => {
    const bus = buses.find((b) => b.id === busId)
    if (bus && searchParams) {
      setSelectedBus(bus)
      setIsBooking(true)
      setIsSheetOpen(false)
    }
  }

  const handleBookingComplete = (booking: Booking) => {
    setCompletedBooking(booking)
    setIsBooking(false)
    setShowConfirmation(true)
    // In a real app, you might want to:
    // 1. Send booking data to backend
    // 2. Update user's booking history
    // 3. Send confirmation email
    console.log("Booking completed:", booking)
  }

  const handleCloseConfirmation = () => {
    setShowConfirmation(false)
    setCompletedBooking(null)
    // Reset to search page
    setSearchParams(null)
    setBuses([])
    setSelectedBus(null)
  }

  const handleBackFromBooking = () => {
    setIsBooking(false)
    setSelectedBus(null)
  }

  if (showConfirmation && completedBooking) {
    return (
      <BookingConfirmation
        booking={completedBooking}
        onClose={handleCloseConfirmation}
      />
    )
  }

  if (isBooking && selectedBus && searchParams) {
    return (
      <BookingPage
        bus={selectedBus}
        selectedDate={searchParams.date}
        passengers={searchParams.passengers}
        onBack={handleBackFromBooking}
        onBookingComplete={handleBookingComplete}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Show stats if we have bookings */}
        {completedBooking && !showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">
                  🎉 Booking Successful!
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Booking code: {completedBooking.bookingCode}
                </p>
              </div>
              <button
                onClick={() => setShowConfirmation(true)}
                className="text-sm font-medium text-green-700 dark:text-green-300 hover:underline"
              >
                View Details →
              </button>
            </div>
          </motion.div>
        )}

        {/* Search Form */}
        <div className="mb-12">
          <BusSearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Results Section */}
        {searchParams && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            {buses.length === 0 && !isLoading ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                  <span className="text-3xl">🚌</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No buses available
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  We couldn't find any buses for your selected route and date.
                  Try adjusting your search criteria.
                </p>
                <button
                  onClick={() => setSearchParams(null)}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                >
                  Search Again
                </button>
              </div>
            ) : (
              <BusList
                buses={buses}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
                onBook={handleBook}
                searchParams={searchParams}
              />
            )}
          </motion.section>
        )}

        {/* Bus Details Sheet */}
        <BusDetailsSheet
          bus={selectedBus}
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          onBook={handleBook}
        />
      </div>
    </div>
  )
}
