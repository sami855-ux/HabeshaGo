"use client"

import { Bus } from "@/types/map-user"
import { useEffect, useRef, useState } from "react"

interface BusDetailsSheetProps {
  isOpen: boolean
  onClose: () => void
  bus: Bus | null
}

export default function BusDetailsSheet({
  isOpen,
  onClose,
  bus,
}: BusDetailsSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)
  const isDragging = useRef(false)
  const [animation, setAnimation] = useState(false)

  console.log(bus)

  useEffect(() => {
    const dragEl = dragRef.current
    const sheetEl = sheetRef.current
    if (!dragEl || !sheetEl) return

    const onStart = (clientY: number) => {
      isDragging.current = true
      startY.current = clientY
      sheetEl.style.transition = "none"
    }

    const onMove = (clientY: number) => {
      if (!isDragging.current) return
      currentY.current = Math.max(0, clientY - startY.current)
      sheetEl.style.transform = `translateY(${currentY.current}px)`
    }

    const onEnd = () => {
      if (!isDragging.current) return
      isDragging.current = false
      sheetEl.style.transition = "transform 0.3s ease"
      if (currentY.current > 120) {
        onClose()
      } else {
        sheetEl.style.transform = "translateY(0)"
      }
      currentY.current = 0
    }

    const onMouseDown = (e: MouseEvent) => onStart(e.clientY)
    const onMouseMove = (e: MouseEvent) => onMove(e.clientY)
    const onMouseUp = () => onEnd()
    const onTouchStart = (e: TouchEvent) => onStart(e.touches[0].clientY)
    const onTouchMove = (e: TouchEvent) => onMove(e.touches[0].clientY)
    const onTouchEnd = () => onEnd()

    dragEl.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    dragEl.addEventListener("touchstart", onTouchStart)
    window.addEventListener("touchmove", onTouchMove)
    window.addEventListener("touchend", onTouchEnd)

    return () => {
      dragEl.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
      dragEl.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      setAnimation(true)
    } else {
      setAnimation(false)
    }
  }, [isOpen])

  if (!isOpen || !bus) return null

  const occupancyPercent = Math.round(
    ((bus.passengersCount ?? 0) / (bus.capacity ?? 1)) * 100,
  )

  const isDelayed = (bus.delayMinutes ?? 0) > 0

  const statusLabel = isDelayed ? `Delayed ${bus.delayMinutes} min` : "On Time"

  const initials = bus.driverName
    ? bus.driverName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "?"

  const headingLabel = (deg: number) => {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    return dirs[Math.round(deg / 45) % 8]
  }

  const getOccupancyColor = () => {
    if (occupancyPercent < 50) return "bg-green-500"
    if (occupancyPercent < 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600"
    if (rating >= 3) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          animation ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden bg-white max-h-[80vh] overflow-y-auto transition-transform duration-300 ${
          animation ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          boxShadow: "0 -8px 40px rgba(0,0,0,0.12)",
        }}
      >
        {/* Drag handle */}
        <div
          ref={dragRef}
          className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none hover:bg-gray-50 transition-colors"
        >
          <div className="w-12 h-1 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all z-10"
        >
          <svg
            className="w-5 h-5"
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

        {/* Main Content */}
        <div className="px-5 pt-2 pb-6">
          {/* Bus Info Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center shadow-sm">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#185FA5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="13" rx="2" />
                <path d="M3 10h18" />
                <path d="M8 19v2M16 19v2" />
                <circle cx="7.5" cy="15.5" r="1" fill="#185FA5" stroke="none" />
                <circle
                  cx="16.5"
                  cy="15.5"
                  r="1"
                  fill="#185FA5"
                  stroke="none"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-gray-900 font-bold text-xl leading-tight">
                  {bus.busNumber}
                </p>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isDelayed
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>
              <p className="text-gray-500 text-sm">{bus.routeName}</p>
            </div>
          </div>

          {/* Stop Info Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">Current stop</p>
              <p className="text-gray-900 text-sm font-semibold truncate">
                {bus.currentStop ?? "—"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">Next stop</p>
              <p className="text-gray-900 text-sm font-semibold truncate">
                {bus.nextDestination ?? "—"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">ETA</p>
              <p className="text-gray-900 text-sm font-semibold">
                {bus.estimatedArrival != null
                  ? `${bus.estimatedArrival} min`
                  : "—"}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              {
                label: "Speed",
                value: `${bus.speed}`,
                unit: "km/h",
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
              },
              {
                label: "Heading",
                value: `${bus.heading}°`,
                unit: headingLabel(bus.heading ?? 0),
                icon: "M12 2L9 9h6L12 2zM12 22l-3-7h6l-3 7z",
              },
              {
                label: "Rating",
                value: `${bus.averageRating?.toFixed(1)}`,
                unit: "★",
                icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
              },
            ].map(({ label, value, unit, icon }) => (
              <div
                key={label}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 text-center hover:shadow-md transition-shadow"
              >
                <svg
                  className="w-4 h-4 text-gray-400 mx-auto mb-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={icon}
                  />
                </svg>
                <p className="text-xs text-gray-500 font-medium mb-1">
                  {label}
                </p>
                <p className="text-lg font-bold text-gray-900 leading-tight">
                  {value}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{unit}</p>
              </div>
            ))}
          </div>

          {/* Driver Section */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden  transition-shadow mb-3">
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Driver
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {bus.driverName ?? "Unassigned"}
                </p>
                <p className="text-xs text-gray-400">
                  Driver ID: {bus.driverId ?? "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Capacity Section */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden  transition-shadow mb-3">
            <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
                    />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Capacity
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {bus.capacity}
              </span>
            </div>
          </div>

          {/* Rating Section */}
          {bus.averageRating && (
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden  transition-shadow mb-3">
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Rating
                </p>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-2xl font-bold ${getRatingColor(bus.averageRating)}`}
                  >
                    {bus.averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-400">/ 5.0</span>
                  <span className="ml-auto text-sm text-gray-500">
                    {bus.totalRatings}{" "}
                    {bus.totalRatings === 1 ? "review" : "reviews"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Location Section */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden  transition-shadow mb-3">
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Location
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className="text-sm text-gray-500">Latitude</span>
                <span className="text-sm font-mono font-semibold text-gray-900">
                  {bus.location.lat.toFixed(6)}°
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className="text-sm text-gray-500">Longitude</span>
                <span className="text-sm font-mono font-semibold text-gray-900">
                  {bus.location.lng.toFixed(6)}°
                </span>
              </div>
            </div>
            <div className="px-4 py-2.5 bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(bus.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-4 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}
