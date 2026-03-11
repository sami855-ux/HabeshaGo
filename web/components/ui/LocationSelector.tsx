"use client"

import { ethiopiaRegions } from "@/data/ethiopian-regions"
import { useEffect, useState, useCallback, useMemo } from "react"

interface LocationSelectorProps {
  locationString?: string
  onChange: (location: string) => void
  className?: string
}

interface Region {
  name: string
  zones?: Zone[]
}

interface Zone {
  name: string
  cities?: (string | { name: string })[]
}

export function LocationSelector({
  locationString = "",
  onChange,
  className = "",
}: LocationSelectorProps) {
  const [region, setRegion] = useState("")
  const [zone, setZone] = useState("")
  const [city, setCity] = useState("")

  // Parse the existing location string
  useEffect(() => {
    if (locationString) {
      const parts = locationString.split(",").map((p) => p.trim())
      setRegion(parts[0] || "")
      setZone(parts[1] || "")
      setCity(parts[2] || "")
    } else {
      // Reset all fields when locationString is empty
      setRegion("")
      setZone("")
      setCity("")
    }
  }, [locationString])

  // Memoized helper functions
  const selectedRegion = useMemo(
    () => ethiopiaRegions.find((r: Region) => r.name === region),
    [region],
  )

  const zones = useMemo(() => selectedRegion?.zones || [], [selectedRegion])

  const selectedZone = useMemo(
    () => zones.find((z: Zone) => z.name === zone),
    [zones, zone],
  )

  const cities = useMemo(
    () =>
      selectedZone?.cities?.map((c) => (typeof c === "string" ? c : c.name)) ||
      [],
    [selectedZone],
  )

  const handleUpdate = useCallback(
    (newRegion: string, newZone: string, newCity: string) => {
      const combined = [newRegion, newZone, newCity].filter(Boolean).join(", ")
      onChange(combined)
    },
    [onChange],
  )

  const handleRegionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newRegion = e.target.value
      setRegion(newRegion)
      setZone("")
      setCity("")
      handleUpdate(newRegion, "", "")
    },
    [handleUpdate],
  )

  const handleZoneChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newZone = e.target.value
      setZone(newZone)
      setCity("")
      handleUpdate(region, newZone, "")
    },
    [region, handleUpdate],
  )

  const handleCityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCity = e.target.value
      setCity(newCity)
      handleUpdate(region, zone, newCity)
    },
    [region, zone, handleUpdate],
  )

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Region Selector */}
      <div className="space-y-1">
        <label
          htmlFor="region-select"
          className="text-sm font-medium text-gray-700"
        >
          Region
        </label>
        <select
          id="region-select"
          value={region}
          onChange={handleRegionChange}
          className="w-full border rounded-md p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          aria-label="Select region"
        >
          <option value="">Select Region</option>
          {ethiopiaRegions.map((r: Region) => (
            <option key={r.name} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Zone Selector */}
      <div className="space-y-1">
        <label
          htmlFor="zone-select"
          className="text-sm font-medium text-gray-700"
        >
          Zone
        </label>
        <select
          id="zone-select"
          value={zone}
          onChange={handleZoneChange}
          disabled={!region}
          className="w-full border rounded-md p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label="Select zone"
        >
          <option value="">Select Zone</option>
          {zones.map((z: Zone) => (
            <option key={z.name} value={z.name}>
              {z.name}
            </option>
          ))}
        </select>
        {region && zones.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">
            No zones available for this region
          </p>
        )}
      </div>

      {/* City Selector */}
      <div className="space-y-1">
        <label
          htmlFor="city-select"
          className="text-sm font-medium text-gray-700"
        >
          City
        </label>
        <select
          id="city-select"
          value={city}
          onChange={handleCityChange}
          disabled={!zone}
          className="w-full border rounded-md p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label="Select city"
        >
          <option value="">Select City</option>
          {cities.map((c: string) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {zone && cities.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">
            No cities available for this zone
          </p>
        )}
      </div>

      {/* Display current selection summary */}
      {locationString && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm text-gray-600">
          <span className="font-medium">Selected: </span>
          {locationString}
        </div>
      )}
    </div>
  )
}
