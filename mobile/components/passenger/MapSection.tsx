// MapSection.tsx
import React, { useEffect, useRef } from "react"
import { View, StyleSheet, Platform } from "react-native"
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps"
import { ChargingStation, StationStatus } from "@/types/ev"
import { ArrowLeft } from "lucide-react-native"

interface MapSectionProps {
  stations: ChargingStation[]
  onMarkerClick: (station: ChargingStation) => void
  selectedStationId?: number
}

const getMarkerColor = (
  status: StationStatus,
  hasAvailablePoints: boolean,
): string => {
  if (status === "ACTIVE") {
    return hasAvailablePoints ? "#10b981" : "#f59e0b"
  }
  if (status === "MAINTENANCE") return "#eab308"
  return "#ef4444"
}

export function MapSection({
  stations,
  onMarkerClick,
  selectedStationId,
}: MapSectionProps) {
  const mapRef = useRef<MapView>(null)

  // Fit map to show all markers when stations change
  useEffect(() => {
    if (stations.length > 0 && mapRef.current) {
      const coordinates = stations.map((station) => ({
        latitude: station.lat,
        longitude: station.lng,
      }))

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        },
        animated: true,
      })
    }
  }, [stations])

  // Center map on selected station
  useEffect(() => {
    if (selectedStationId && mapRef.current) {
      const station = stations.find((s) => s.id === selectedStationId)
      if (station) {
        const region = {
          latitude: station.lat,
          longitude: station.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
        mapRef.current.animateToRegion(region, 500)
      }
    }
  }, [selectedStationId, stations])

  const initialRegion: Region = {
    latitude: stations[0]?.lat || 9.0192,
    longitude: stations[0]?.lng || 38.7468,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  }

  // For web fallback when react-native-maps isn't available
  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <View style={styles.webFallback}>
          <ArrowLeft size={14} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
      >
        {stations.map((station) => {
          const hasAvailable = station.chargingPoints.some(
            (cp) => cp.status === "AVAILABLE",
          )
          const color = getMarkerColor(station.status, hasAvailable)
          const isSelected = station.id === selectedStationId

          return (
            <Marker
              key={station.id}
              coordinate={{
                latitude: station.lat,
                longitude: station.lng,
              }}
              onPress={() => onMarkerClick(station)}
              title={station.name}
              description={`${station.address} | ${hasAvailable ? "Available" : "Busy"}`}
              pinColor={color}
              opacity={isSelected ? 1 : 0.85}
              tracksViewChanges={false}
            />
          )
        })}
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  webFallback: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  webFallbackText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  webFallbackSubtext: {
    fontSize: 14,
    color: "#6b7280",
  },
})
