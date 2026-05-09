import { useState, useEffect } from "react"
import { Coordinates } from "@/types/map-user"

export function useUserLocation() {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLoading(false)
      },
      (error) => {
        setError(error.message)
        setLoading(false)
        // Default to a fallback location (e.g., city center)
        setUserLocation({ lat: 40.7128, lng: -74.006 }) // NYC as fallback
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    )
  }, [])

  return { userLocation, error, loading }
}
