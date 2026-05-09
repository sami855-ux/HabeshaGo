"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import { Coordinates } from "@/types/map-user"

const LOCATION_CACHE_KEY = "user_location_cache"
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

interface CachedLocation {
  lat: number
  lng: number
  accuracy: number
  timestamp: number
}

interface UserLocationMarkerProps {
  map: L.Map
  userLocation: Coordinates
  accuracy?: number
}

function getCachedLocation(): CachedLocation | null {
  try {
    const raw = localStorage.getItem(LOCATION_CACHE_KEY)
    if (!raw) return null
    const parsed: CachedLocation = JSON.parse(raw)
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(LOCATION_CACHE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function setCachedLocation(lat: number, lng: number, accuracy: number) {
  try {
    const payload: CachedLocation = {
      lat,
      lng,
      accuracy,
      timestamp: Date.now(),
    }
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(payload))
  } catch {
    // localStorage unavailable — silently ignore
  }
}

function buildUserIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        position: relative;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <!-- Outer pulse -->
        <div style="
          position: absolute;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.15);
          animation: user-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>

        <!-- Mid ring -->
        <div style="
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.2);
          animation: user-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          animation-delay: 0.4s;
        "></div>

        <!-- Core dot -->
        <div style="
          position: relative;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 8px rgba(59,130,246,0.6), 0 0 0 1px rgba(59,130,246,0.3);
          z-index: 10;
        "></div>
      </div>

      <style>
        @keyframes user-ping {
          0%   { transform: scale(0.8); opacity: 0.8; }
          70%  { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      </style>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -28],
  })
}

function buildPopupContent(
  lat: number,
  lng: number,
  accuracy: number,
  fromCache: boolean,
) {
  return `
    <div style="min-width: 200px; font-family: system-ui, sans-serif; padding: 4px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></div>
        <p style="font-weight: 600; font-size: 14px; color: #111; margin: 0;">Your location</p>
        ${fromCache ? `<span style="margin-left: auto; font-size: 10px; background: #f3f4f6; color: #6b7280; padding: 2px 6px; border-radius: 99px;">Cached</span>` : ""}
      </div>

      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280;">Latitude</span>
          <span style="font-weight: 500; font-family: monospace;">${lat.toFixed(6)}°</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280;">Longitude</span>
          <span style="font-weight: 500; font-family: monospace;">${lng.toFixed(6)}°</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280;">Accuracy</span>
          <span style="font-weight: 500; color: #22c55e;">±${accuracy}m</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280;">Updated</span>
          <span style="font-weight: 500;">${new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #f3f4f6;">
        <p style="font-size: 11px; color: #9ca3af; margin: 0;">
          Blue circle indicates GPS accuracy radius.
        </p>
      </div>
    </div>
  `
}

export default function UserLocationMarker({
  map,
  userLocation,
  accuracy = 10,
}: UserLocationMarkerProps) {
  const markerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)
  const pulseCircleRef = useRef<L.Circle | null>(null)

  useEffect(() => {
    if (!map) return

    let isMounted = true

    const init = () => {
      if (!isMounted) return

      try {
        // Clean up previous
        markerRef.current?.remove()
        circleRef.current?.remove()
        pulseCircleRef.current?.remove()
        markerRef.current = null
        circleRef.current = null
        pulseCircleRef.current = null

        const cached = getCachedLocation()
        const fromCache =
          cached !== null &&
          cached.lat === userLocation.lat &&
          cached.lng === userLocation.lng

        // Cache the current location
        setCachedLocation(userLocation.lat, userLocation.lng, accuracy)

        // Accuracy circle
        const circle = L.circle([userLocation.lat, userLocation.lng], {
          radius: accuracy,
          color: "#3b82f6",
          weight: 1,
          opacity: 0.4,
          fillColor: "#3b82f6",
          fillOpacity: 0.08,
          interactive: false,
        }).addTo(map)

        circleRef.current = circle

        // Marker
        const marker = L.marker([userLocation.lat, userLocation.lng], {
          icon: buildUserIcon(),
          zIndexOffset: 1000,
          interactive: true,
        }).addTo(map)

        marker.bindPopup(
          buildPopupContent(
            userLocation.lat,
            userLocation.lng,
            accuracy,
            fromCache,
          ),
          {
            className: "modern-popup",
            maxWidth: 260,
            minWidth: 210,
            closeButton: true,
          },
        )

        markerRef.current = marker
      } catch (err) {
        console.error("UserLocationMarker error:", err)
      }
    }

    // Wait for map to be ready
    if (map.getPane("markerPane")) {
      init()
    } else {
      map.whenReady(() => setTimeout(init, 50))
    }

    return () => {
      isMounted = false
      try {
        markerRef.current?.remove()
      } catch {}
      try {
        circleRef.current?.remove()
      } catch {}
      try {
        pulseCircleRef.current?.remove()
      } catch {}
      markerRef.current = null
      circleRef.current = null
      pulseCircleRef.current = null
    }
  }, [map, userLocation, accuracy])

  return null
}
