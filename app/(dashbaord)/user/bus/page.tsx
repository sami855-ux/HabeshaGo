"use client";

import { useState, useRef, useEffect } from "react";
import BusSearchForm from "@/components/user-dashboard/bus/bus-search-form";
import BusList from "@/components/user-dashboard/bus/bus-list";
import BusDetailsSheet from "@/components/user-dashboard/bus/bus-details-sheet";
import BookingPage from "@/components/user-dashboard/bus/booking-page";
import BookingConfirmation from "@/components/user-dashboard/bus/booking-confirmation";
import { motion } from "framer-motion";
import { searchBusesAPI } from "@/services/bus.api";
import { toast } from "sonner";

// Define the correct types based on the data structure
interface BusSchedule {
  scheduleId: number;
  startTime: string;
  endTime: string;
  availableSeats: number;
}

interface BusRoute {
  id: number;
  name: string;
  price: string;
  currency: string;
  estimatedTimeMin: number;
  midPoints: string[];
}

interface BusVehicle {
  id: number;
  plateNumber: string;
  vin: string;
  type: string;
  model: string;
  manufacturer: string;
  year: number;
  capacity: number;
  vehicleImageUrl: string;
  status: string;
  mileage: number;
  ownerName: string | null;
  ownerPhone: string | null;
  gpsDeviceId: string;
  createdAt: string;
  updatedAt: string;
}

interface BusDriver {
  id: string;
  userId: string;
  licenseNo: string;
  experience: number;
  status: string;
  driverLicenseUrl: string;
  licenseStatus: string;
  idType: string;
  idFrontUrl: string;
  idBackUrl: string;
  idStatus: string;
  verifiedById: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  isOnDuty: boolean;
  lastActiveAt: string | null;
  rating: number;
  totalTrips: number;
  complaintsCount: number;
  createdAt: string;
}

interface BusData {
  id: number;
  busNumber: string;
  capacity: number;
  reservedSeats: number;
  currentStop: string | null;
  nextDestination: string | null;
  status: "ACTIVE" | "UNDER_MAINTENANCE" | "ON_TRIP" | "OFF_DUTY";
  departureTime: string | null;
  estimatedArrival: string | null;
  delayMinutes: number;
  lastServiceDate: string;
  nextServiceDate: string;
  driver: BusDriver;
  vehicle: BusVehicle;
  route: BusRoute;
}

interface BusListItem {
  bus: BusData;
  nearestSchedule: BusSchedule;
}

interface Booking {
  id: string;
  bookingCode: string;
  busId: number;
  scheduleId: number;
  passengerCount: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function HomePage() {
  const [searchParams, setSearchParams] = useState<{
    from: string;
    to: string;
    date: Date;
    time: string;
    passengers: number;
  } | null>(null);

  const [buses, setBuses] = useState<BusListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<BusSchedule | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(
    null,
  );
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Refs for scrolling
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchTriggeredRef = useRef(false);
  const initialLoadRef = useRef(true);

  // Scroll to results when buses are loaded
  useEffect(() => {
    // Only scroll if:
    // 1. We have buses
    // 2. Not loading
    // 3. Search was triggered (not initial load)
    // 4. Results ref exists
    if (
      buses.length > 0 &&
      !isLoading &&
      searchTriggeredRef.current &&
      resultsRef.current
    ) {
      // Small delay to ensure DOM is fully rendered and animations complete
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Add a visual highlight effect
        resultsRef.current?.classList.add("scroll-highlight");
        setTimeout(() => {
          resultsRef.current?.classList.remove("scroll-highlight");
        }, 1000);

        // Reset the search triggered flag
        searchTriggeredRef.current = false;
      }, 500);
    }
  }, [buses, isLoading]);

  const handleSearch = async (data: {
    from: string;
    to: string;
    date: Date;
    time: string;
    passengers: number;
  }) => {
    const [hour, minute] = data.time.split(":").map(Number);
    const fullDateTime = new Date(data.date);
    fullDateTime.setHours(hour, minute, 0, 0);

    const dataNew = {
      from: data.from,
      to: data.to,
      passengers: data.passengers,
      date: fullDateTime,
      time: data.time,
    };

    setIsLoading(true);
    setSearchParams(data);
    // Set flag that search was triggered
    searchTriggeredRef.current = true;

    try {
      const res = await searchBusesAPI(dataNew);

      if (!res?.success) {
        console.log(res);
        toast.error("Search failed", {
          description:
            res?.message || "Unable to fetch buses. Please try again.",
        });
        setBuses([]);
        return;
      }

      const buses = Array.isArray(res.data) ? res.data : [];
      console.log(buses);
      setBuses(buses);

      if (buses.length === 0) {
        toast.info("No buses found", {
          description: "Try adjusting your route or date.",
        });
      } else {
        toast.success("Buses found", {
          description: `${buses.length} result${buses.length > 1 ? "s" : ""} available.`,
        });
      }
    } catch (error) {
      console.error("Search failed:", error);

      toast.error("Something went wrong", {
        description: "Please check your connection and try again.",
      });

      setBuses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (busId: number) => {
    const busItem = buses.find((item) => item.bus.id === busId);

    if (busItem) {
      setSelectedBus(busItem.bus);
      setSelectedSchedule(busItem.nearestSchedule);
      setIsSheetOpen(true);
    }
  };

  const handleBook = (busId: number, scheduleId: number) => {
    const busItem = buses.find((item) => item.bus.id === busId);

    if (busItem && searchParams) {
      setSelectedBus(busItem.bus);
      setSelectedSchedule(busItem.nearestSchedule);
      setIsBooking(true);
      setIsSheetOpen(false);
    }
  };

  const handleBookingComplete = (booking: Booking) => {
    setCompletedBooking(booking);
    setIsBooking(false);
    setShowConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setCompletedBooking(null);
    setSearchParams(null);
    setBuses([]);
    setSelectedBus(null);
    setSelectedSchedule(null);
  };

  const handleBackFromBooking = () => {
    setIsBooking(false);
    setSelectedBus(null);
    setSelectedSchedule(null);
  };

  const handleBookAnother = () => {
    setShowConfirmation(false);
    setCompletedBooking(null);
    // Keep search params to show search form
  };

  if (showConfirmation && completedBooking && selectedBus && searchParams) {
    return (
      <BookingConfirmation
        booking={completedBooking}
        bus={selectedBus}
        selectedDate={searchParams.date}
        selectedTime={searchParams.time}
        onClose={handleCloseConfirmation}
        onBookAnother={handleBookAnother}
        onBack={handleBackFromBooking}
      />
    );
  }

  if (isBooking && selectedBus && selectedSchedule && searchParams) {
    return (
      <BookingPage
        bus={selectedBus}
        schedule={selectedSchedule}
        selectedDate={searchParams.date}
        selectedTime={searchParams.time}
        passengers={searchParams.passengers}
        onBack={handleBackFromBooking}
        onBookingComplete={handleBookingComplete}
      />
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-8">
        {/* Success Banner */}
        {completedBooking && !showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800 shadow-lg"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-800 dark:text-green-300">
                    Booking Successful!
                  </h3>
                  <p className="text-green-600 dark:text-green-400">
                    Booking code:{" "}
                    <span className="font-mono font-bold">
                      {completedBooking.bookingCode}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="px-6 py-2 bg-white dark:bg-gray-800 text-green-700 dark:text-green-300 rounded-lg font-medium hover:bg-green-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                >
                  View Details
                </button>
                <button
                  onClick={handleBookAnother}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm"
                >
                  Book Another
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search Form */}
        <div className="mb-12">
          <BusSearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Results Section with Ref */}
        {searchParams && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12 scroll-mt-24" // scroll-mt-24 adds margin top when scrolling to account for fixed header
          >
            {/* No Results State */}
            {!isLoading && buses.length === 0 && (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  <span className="text-4xl">🚌</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">No buses available</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  We couldn't find any buses for your selected route and date.
                  Try adjusting your search criteria.
                </p>
                <button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
                >
                  Modify Search
                </button>
              </div>
            )}

            {/* Bus List */}
            {!isLoading && buses.length > 0 && (
              <BusList
                buses={buses}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
                onBook={handleBook}
                searchParams={searchParams}
              />
            )}
          </motion.div>
        )}

        {/* Bus Details Sheet */}
        <BusDetailsSheet
          bus={selectedBus}
          schedule={selectedSchedule}
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          onBook={handleBook}
          searchParams={searchParams || undefined}
        />
      </div>

      {/* Add global styles for scroll highlight */}
      <style jsx global>{`
        .scroll-highlight {
          animation: highlightPulse 1s ease-in-out;
        }

        @keyframes highlightPulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
            box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.3);
          }
          100% {
            opacity: 1;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}
