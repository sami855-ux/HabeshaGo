"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import { Coordinates } from "@/types/map-user"

interface UserLocationMarkerProps {
  map: L.Map
  userLocation: Coordinates
  accuracy?: number // Optional accuracy radius in meters
}

export default function UserLocationMarker({
  map,
  userLocation,
  accuracy = 10,
}: UserLocationMarkerProps) {
  const markerRef = useRef<L.Marker | null>(null)
  const accuracyCircleRef = useRef<L.Circle | null>(null)

  useEffect(() => {
    if (!map) return

    let isMounted = true

    const initializeMarker = () => {
      if (!isMounted) return

      try {
        // Check if map is still valid and has container
        if (!map.getContainer()) {
          console.warn("Map container not available")
          return
        }

        // Remove existing marker and accuracy circle if any
        if (markerRef.current) {
          markerRef.current.remove()
          markerRef.current = null
        }

        // if (accuracyCircleRef.current) {
        //   accuracyCircleRef.current.remove()
        //   accuracyCircleRef.current = null
        // }

        // Create accuracy circle (shows location precision)
        const accuracyCircle = L.circle([userLocation.lat, userLocation.lng], {
          radius: accuracy,
          color: "#3b82f6",
          weight: 1,
          opacity: 0.3,
          fillColor: "#3b82f6",
          fillOpacity: 0.1,
          interactive: false,
        }).addTo(map)

        accuracyCircleRef.current = accuracyCircle

        // Create enhanced custom icon for user location
        const userIcon = L.divIcon({
          className: "user-location-marker",
          html: `
            <div class="relative flex items-center justify-center">
              <!-- Outer pulse ring -->
              <div class="absolute h-16 w-16 rounded-full bg-blue-400/30 animate-ping"></div>
              
              <!-- Inner pulse ring (delayed) -->
              <div class="absolute h-8 w-8 rounded-full bg-blue-500/40 animate-ping" style="animation-delay: 0.5s"></div>
              
              <!-- Core marker -->
              <div class="relative h-7 w-7 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
                <!-- Inner dot for depth -->
                <div class="h-3 w-3 rounded-full bg-white"></div>
              </div>
              
              <!-- Direction indicator (optional - shows heading if available) -->
              <div class="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full">
                <div class="w-0.5 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -20],
          // className: "cursor-pointer transition-transform hover:scale-110",
        })

        // Create and add marker
        const marker = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(map)

        // Enhanced popup with more information
        marker
          .bindPopup(
            `
          <div class="p- min-w-[200px]">
            <div class="flex items-center gap-2 mb-2">
              <div class="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
              <h3 class="font-semibold text-gray-900 font-geist">Your Location</h3>
            </div>
            
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-gray-500">Latitude:</span>
                <span class="font-grotesk not-only:font-medium">${userLocation.lat.toFixed(6)}°</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500">Longitude:</span>
                <span class="font-medium font-grotesk">${userLocation.lng.toFixed(6)}°</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500">Accuracy:</span>
                <span class="font-medium text-green-600 font-grotesk">±${accuracy}m</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500">Updated:</span>
                <span class="font-medium font-grotesk">${new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div class="mt-3 pt-2 border-t border-gray-100">
              <p class="text-xs text-gray-400">
                This is your current location. The blue circle shows accuracy radius.
              </p>
            </div>
          </div>
        `,
            {
              className: "custom-popup rounded-lg shadow-xl",
              maxWidth: 280,
              minWidth: 200,
            },
          )
          .openPopup()

        markerRef.current = marker

        console.log("User location marker added successfully")
      } catch (error) {
        console.error("Error adding user location marker:", error)
      }
    }

    // Check map readiness
    const checkMapReady = () => {
      try {
        if (map.getPane("markerPane")) {
          initializeMarker()
        } else {
          map.whenReady(() => {
            setTimeout(initializeMarker, 50)
          })
        }
      } catch (error) {
        console.warn("Error checking map readiness:", error)
        setTimeout(initializeMarker, 200)
      }
    }

    checkMapReady()

    return () => {
      isMounted = false
      if (markerRef.current) {
        try {
          markerRef.current.remove()
        } catch (error) {
          console.warn("Error removing marker:", error)
        }
        markerRef.current = null
      }
      if (accuracyCircleRef.current) {
        try {
          accuracyCircleRef.current.remove()
        } catch (error) {
          console.warn("Error removing accuracy circle:", error)
        }
        accuracyCircleRef.current = null
      }
    }
  }, [map, userLocation, accuracy])

  return null
}
