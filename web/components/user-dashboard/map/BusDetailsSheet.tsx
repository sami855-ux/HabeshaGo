"use client"

import { BusDetails, fetchBusDetails } from "@/lib/mock-data"
import { useEffect, useState } from "react"

interface BusDetailsSheetProps {
  isOpen: boolean
  onClose: () => void
  busId: string | null
  busName?: string
}

export default function BusDetailsSheet({
  isOpen,
  onClose,
  busId,
  busName,
}: BusDetailsSheetProps) {
  const [busDetails, setBusDetails] = useState<BusDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && busId) {
      const loadBusDetails = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const data = await fetchBusDetails(busId)
          setBusDetails(data)
        } catch (err) {
          setError("Failed to load bus details")
          console.error(err)
        } finally {
          setIsLoading(false)
        }
      }
      loadBusDetails()
    }
  }, [isOpen, busId])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl z-50 transform transition-transform duration-300 ease-in-out max-h-[80vh] overflow-y-auto">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="p-6 pt-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">
              <p>{error}</p>
              <button
                onClick={() =>
                  busId && fetchBusDetails(busId).then(setBusDetails)
                }
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : busDetails ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">
                {busName || `Bus ${busDetails.routeName}`}
              </h2>

              {/* Status Badge */}
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  busDetails.status === "on-time"
                    ? "bg-green-100 text-green-700"
                    : busDetails.status === "delayed"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {busDetails.status.toUpperCase()}
              </div>

              {/* Route Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-semibold">
                    {busDetails.routeId} - {busDetails.routeName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Next Stop:</span>
                  <span className="font-semibold">{busDetails.nextStop}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Est. Arrival:</span>
                  <span className="font-semibold text-blue-600">
                    {busDetails.estimatedArrival}
                  </span>
                </div>
              </div>

              {/* Driver Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-lg">Driver Information</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Name:</span>
                  <span>{busDetails.driverName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Contact:</span>
                  <span>{busDetails.driverPhone}</span>
                </div>
              </div>

              {/* Bus Stats */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-lg">Bus Statistics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-600 text-sm">Capacity</span>
                    <p className="font-semibold">
                      {busDetails.passengersCount}/{busDetails.capacity}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Speed</span>
                    <p className="font-semibold">{busDetails.speed} km/h</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Fuel Level</span>
                    <div className="mt-1">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                          style={{ width: `${busDetails.fuelLevel}%` }}
                        />
                      </div>
                      <span className="text-xs">{busDetails.fuelLevel}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">
                      Last Maintenance
                    </span>
                    <p className="font-semibold text-sm">
                      {busDetails.lastMaintenance}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
