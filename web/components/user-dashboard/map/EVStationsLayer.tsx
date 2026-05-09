"use client"

import { useEffect, useState, useRef } from "react"
import L from "leaflet"
import { Coordinates } from "@/types/map-user"
import { calculateDistance } from "@/lib/utils"
import { useQueryParams } from "@/hooks/useQueryParams"
import { axiosInstance } from "@/services/axiosInstance"

const API_BASE = process.env.NEXT_PUBLIC_API_URL

interface Tariff {
  pricePerKwh: string
  pricePerMinute: string | null
  idleFeePerMinute: string | null
  currency: string
}

interface ChargingPoint {
  id: number
  connectorType: string
  powerKw: number
  status: "AVAILABLE" | "OCCUPIED" | "FAULTED" | "OFFLINE"
  chargingSpeed: string
  slotNumber: string | null
}

interface Rating {
  id: number
  score: number
  comment: string | null
  createdAt: string
}

interface StationDetail {
  id: number
  name: string
  address: string | null
  city: string | null
  lat: number
  lng: number
  status: string
  isVerified: boolean
  totalPoints: number
  availablePoints: number
  totalSessions: number
  averageRating: number | null
  totalRatings: number
  activeTariff: Tariff | null
  chargingPoints: ChargingPoint[]
  images: { id: number; url: string; caption: string | null }[]
  recentRatings: {
    id: number
    score: number
    comment: string | null
    createdAt: string
  }[]
  distanceKm?: number
}

interface NearbyStation {
  id: number
  name: string
  address: string | null
  city: string | null
  lat: number
  lng: number
  status: string
  isVerified: boolean
  distanceKm: number
  totalPoints: number
  availablePoints: number
  activeTariff: Tariff | null
  thumbnail: string | null
  totalRatings: number
}

interface EVStationsLayerProps {
  map: L.Map
  userLocation: Coordinates
}

// Sheet

function EVStationSheet({
  station,
  onClose,
}: {
  station: StationDetail | null
  onClose: () => void
}) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)
  const isDragging = useRef(false)

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
      if (currentY.current > 120) onClose()
      else sheetEl.style.transform = "translateY(0)"
      currentY.current = 0
    }

    const md = (e: MouseEvent) => onStart(e.clientY)
    const mm = (e: MouseEvent) => onMove(e.clientY)
    const mu = () => onEnd()
    const ts = (e: TouchEvent) => onStart(e.touches[0].clientY)
    const tm = (e: TouchEvent) => onMove(e.touches[0].clientY)
    const te = () => onEnd()

    dragEl.addEventListener("mousedown", md)
    window.addEventListener("mousemove", mm)
    window.addEventListener("mouseup", mu)
    dragEl.addEventListener("touchstart", ts)
    window.addEventListener("touchmove", tm)
    window.addEventListener("touchend", te)

    return () => {
      dragEl.removeEventListener("mousedown", md)
      window.removeEventListener("mousemove", mm)
      window.removeEventListener("mouseup", mu)
      dragEl.removeEventListener("touchstart", ts)
      window.removeEventListener("touchmove", tm)
      window.removeEventListener("touchend", te)
    }
  }, [station, onClose])

  if (!station) return null

  const availablePoints =
    station.availablePoints ??
    station.chargingPoints.filter((p) => p.status === "AVAILABLE").length
  const totalPoints = station.totalPoints ?? station.chargingPoints.length
  const totalSessions = station.sessions?.length ?? 0
  const totalRatings = station.ratings?.length ?? 0

  const averageRating: number | null =
    (station as any).averageRating ??
    (totalRatings > 0
      ? parseFloat(
          (
            station.ratings.reduce((s, r) => s + r.score, 0) / totalRatings
          ).toFixed(1),
        )
      : null)

  const now = new Date()
  const activeTariff =
    station.tariffs
      .filter(
        (t) =>
          new Date(t.validFrom) <= now &&
          (!t.validTo || new Date(t.validTo) >= now),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0] ?? null

  const statusIcon = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <svg
            className="w-4 h-4 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )
      case "OCCUPIED":
        return (
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
        )
      case "FAULTED":
        return (
          <svg
            className="w-4 h-4 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        )
      default:
        return (
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636L12 12m0 0l-6.364 6.364M12 12l6.364 6.364M12 12L5.636 5.636"
            />
          </svg>
        )
    }
  }

  const speedLabel: Record<string, string> = {
    SLOW: "Slow · AC",
    FAST: "Fast · DC",
    RAPID: "Rapid · DC",
    ULTRA_RAPID: "Ultra · DC",
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[38px] border border-gray-200 max-h-[80vh] overflow-y-auto bg-white"
        style={{
          transition: "transform 0.3s ease",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.08)",
        }}
      >
        {/* Drag handle */}
        <div
          ref={dragRef}
          className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="w-9 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header - No background color, just border and icons */}
        <div className="px-4 pt-2 pb-5 relative border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            {/* EV Charger Icon */}
            <div className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1D9E75"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v2" />
                <path d="M14 9h4c.6 0 1 .4 1 1v8c0 .6-.4 1-1 1h-2" />
                <circle cx="7" cy="18" r="2" />
                <circle cx="17" cy="18" r="2" />
                <path d="M9 18h5" />
                <path d="M16 8l2 3-2 3" />
                <path d="M12 2v4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 text-base leading-tight">
                  {station.name}
                </p>
                {station.isVerified && (
                  <span className="text-xs border border-green-200 text-green-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <svg
                      className="w-2.5 h-2.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
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
                {station.address ?? station.city ?? "—"}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full border">
              {availablePoints > 0 ? (
                <>
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-green-700">
                    Available
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5 text-red-600"
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
                  <span className="text-xs font-semibold text-red-700">
                    Full
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <div>
                <p className="text-gray-400 text-[11px]">Available</p>
                <p className="text-gray-900 text-sm font-semibold mt-0.5">
                  {availablePoints} / {totalPoints}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-gray-400 text-[11px]">Price / kWh</p>
                <p className="text-gray-900 text-sm font-semibold mt-0.5">
                  {activeTariff
                    ? `${parseFloat(activeTariff.pricePerKwh).toFixed(2)} ${activeTariff.currency}`
                    : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <div>
                <p className="text-gray-400 text-[11px]">Distance</p>
                <p className="text-gray-900 text-sm font-semibold mt-0.5">
                  {station.distanceKm != null
                    ? `${station.distanceKm.toFixed(1)} km`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards - No backgrounds, just borders */}
        <div className="grid grid-cols-3 gap-2 px-3 pt-3">
          {[
            {
              label: "Rating",
              icon: (
                <svg
                  className="w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ),
              value: averageRating ? `${averageRating} ★` : "—",
              unit: `${totalRatings} reviews`,
            },
            {
              label: "Sessions",
              icon: (
                <svg
                  className="w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 8v4l3 3M12 2a10 10 0 100 20 10 10 0 000-20z"
                  />
                </svg>
              ),
              value: totalSessions.toString(),
              unit: "total",
            },
            {
              label: "Points",
              icon: (
                <svg
                  className="w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M8 7h8M8 11h6M8 15h4"
                  />
                </svg>
              ),
              value: totalPoints.toString(),
              unit: "connectors",
            },
          ].map(({ label, icon, value, unit }) => (
            <div
              key={label}
              className="border border-gray-100 rounded-xl p-3 text-center"
            >
              <div className="flex justify-center mb-1">{icon}</div>
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="text-base font-semibold text-gray-900 leading-tight">
                {value}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{unit}</p>
            </div>
          ))}
        </div>

        <div className="px-3 pb-4 space-y-2 mt-2">
          {/* Charging points */}
          {station.chargingPoints.length > 0 && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-gray-100">
                <svg
                  className="w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Charging points
                </p>
              </div>
              {station.chargingPoints.map((point) => (
                <div
                  key={point.id}
                  className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center">
                      <svg
                        className="w-3.5 h-3.5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {point.connectorType} · {point.powerKw} kW
                      </p>
                      <p className="text-xs text-gray-400">
                        {speedLabel[point.chargingSpeed] ?? point.chargingSpeed}
                        {point.slotNumber ? ` · Slot ${point.slotNumber}` : ""}
                        {point.maxVoltage ? ` · ${point.maxVoltage}V` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {statusIcon(point.status)}
                    <span className="text-xs font-medium text-gray-600 ml-0.5">
                      {point.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tariff */}
          {activeTariff && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-gray-100">
                <svg
                  className="w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Pricing
                </p>
              </div>
              {[
                {
                  label: "Per kWh",
                  value: `${parseFloat(activeTariff.pricePerKwh).toFixed(2)} ${activeTariff.currency}`,
                },
                activeTariff.pricePerMinute
                  ? {
                      label: "Per minute",
                      value: `${parseFloat(activeTariff.pricePerMinute).toFixed(4)} ${activeTariff.currency}`,
                    }
                  : null,
                activeTariff.idleFeePerMinute
                  ? {
                      label: "Idle fee / min",
                      value: `${parseFloat(activeTariff.idleFeePerMinute).toFixed(4)} ${activeTariff.currency}`,
                    }
                  : null,
              ]
                .filter(Boolean)
                .map((row) => (
                  <div
                    key={row!.label}
                    className="flex justify-between items-center px-3.5 py-2.5 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-sm text-gray-500">{row!.label}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {row!.value}
                    </span>
                  </div>
                ))}
            </div>
          )}

          {/* Ratings */}
          {station.ratings.length > 0 && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-gray-100">
                <svg
                  className="w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Reviews
                </p>
                <span className="ml-auto text-xs text-gray-400">
                  {averageRating ? `${averageRating} avg` : ""}
                </span>
              </div>
              {station.ratings.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="px-3.5 py-2.5 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${i < r.score ? "text-yellow-400" : "text-gray-200"}`}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-xs text-gray-600">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Navigate */}
          <button
            // onClick={() =>}
            className="w-[75%] py-3 border border-[#1D9E75] mx-auto rounded-xl font-semibold bg-[#1D9E75] text-white transition-all flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            Book on Station
          </button>
        </div>
      </div>
    </>
  )
}

// Layer

export default function EVStationsLayer({
  map,
  userLocation,
}: EVStationsLayerProps) {
  const [stations, setStations] = useState<NearbyStation[]>([])
  const [selectedStation, setSelectedStation] = useState<StationDetail | null>(
    null,
  )
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const { getParam } = useQueryParams()

  // Load nearby stations
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get("/ev/station/nearby", {
          params: {
            lat: userLocation.lat,
            lng: userLocation.lng,
            radius: 15,
          },
        })
        console.log("some ev stations", data)
        setStations(data.data ?? [])
      } catch (err) {
        console.error("Failed to load EV stations", err)
      }
    }
    load()
  }, [userLocation])

  // Fetch full detail on click
  const openStation = async (id: number, distanceKm: number) => {
    setLoadingId(id)
    try {
      const { data } = await axiosInstance.get(`/ev/station/${id}`)
      const raw = data.data

      const availablePoints = raw.chargingPoints.filter(
        (p: ChargingPoint) => p.status === "AVAILABLE",
      ).length

      const averageRating =
        raw.ratings.length > 0
          ? parseFloat(
              (
                raw.ratings.reduce(
                  (sum: number, r: Rating) => sum + r.score,
                  0,
                ) / raw.ratings.length
              ).toFixed(1),
            )
          : null

      setSelectedStation({
        ...raw,
        totalPoints: raw.chargingPoints.length,
        availablePoints,
        averageRating,
        distanceKm,
      })
    } catch (err) {
      console.error("Failed to load station detail", err)
    } finally {
      setLoadingId(null)
    }
  }

  // Create markers
  useEffect(() => {
    if (!map || stations.length === 0) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const markerType = getParam("type") || "all"
    const searchQuery = getParam("search")?.toLowerCase()

    const filtered = stations.filter((s) => {
      if (markerType !== "all" && markerType !== "ev") return false
      if (searchQuery) {
        return (
          s.name.toLowerCase().includes(searchQuery) ||
          (s.address ?? "").toLowerCase().includes(searchQuery)
        )
      }
      return true
    })

    filtered.forEach((station) => {
      const hasAvailable = station.availablePoints > 0

      const icon = L.divIcon({
        className: "",
        html: `
    <div style="
      position: relative;
      width: 44px;
      height: 56px;
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <div style="
        width: 44px;
        height: 44px;
        background: #1D9E75;
        border-radius: 50% 50% 50% 4px;
        border: 3px solid #ffffff;
        box-shadow: 0 3px 12px rgba(0,0,0,0.4), 0 0 0 2px #1D9E75;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      ">
        <div style="
          width: 28px;
          height: 28px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v2"/>
            <path d="M14 9h4c.6 0 1 .4 1 1v8c0 .6-.4 1-1 1h-2"/>
            <circle cx="7" cy="18" r="2"/>
            <circle cx="17" cy="18" r="2"/>
            <path d="M9 18h5"/>
            <path d="M16 8l2 3-2 3"/>
          </svg>
        </div>
      </div>

      <div style="
        margin-top: 4px;
        background: #1D9E75;
        color: white;
        font-size: 10px;
        font-weight: 700;
        font-family: sans-serif;
        padding: 2px 7px;
        border-radius: 99px;
        white-space: nowrap;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        letter-spacing: 0.02em;
      ">${station.availablePoints}/${station.totalPoints}</div>
    </div>
  `,
        iconSize: [44, 72],
        iconAnchor: [22, 44],
      })

      const marker = L.marker([station.lat, station.lng], {
        icon,
        interactive: true,
      }).addTo(map)

      marker.on("click", () => openStation(station.id, station.distanceKm))
      markersRef.current.push(marker)
    })

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
    }
  }, [map, stations, getParam])

  return (
    <>
      {/* Loading indicator */}
      {loadingId !== null && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-full px-4 py-2 shadow-lg text-sm text-gray-600 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
          Loading station...
        </div>
      )}

      <EVStationSheet
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
      />
    </>
  )
}
