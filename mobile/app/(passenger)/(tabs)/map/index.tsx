import { BusTrackingSheet } from "@/components/passenger/map/BusTrackingSheet"
import { MapControls } from "@/components/passenger/map/MapControls"
import { MyTripsSheet } from "@/components/passenger/map/MyTripsSheet"
import { useThemeContext } from "@/context/ThemeContext"
import {
  Bus,
  mockBuses,
  mockReports,
  mockTrips,
  Report,
  Trip,
} from "@/types/map"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import * as Location from "expo-location"
import {
  Car,
  Droplet,
  FileText,
  Rotate3d,
  Shield,
  Zap,
} from "lucide-react-native"
import React, { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import MapView, {
  Circle,
  LatLng,
  MapPressEvent,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps"

const { width, height } = Dimensions.get("window")

const categoryConfig = {
  traffic: {
    icon: Car,
    color: "#3b82f6",
    darkColor: "#1d4ed8",
  },
  power: {
    icon: Zap,
    color: "#f59e0b",
    darkColor: "#d97706",
  },
  road: {
    icon: Rotate3d,
    color: "#ef4444",
    darkColor: "#dc2626",
  },
  safety: {
    icon: Shield,
    color: "#8b5cf6",
    darkColor: "#7c3aed",
  },
  water: {
    icon: Droplet,
    color: "#06b6d4",
    darkColor: "#0891b2",
  },
  other: {
    icon: FileText,
    color: "#6b7280",
    darkColor: "#4b5563",
  },
}

// Zoom controls component
const ZoomControls = ({
  mapRef,
  colors,
}: {
  mapRef: React.RefObject<MapView>
  colors: any
}) => {
  const handleZoomIn = () => {
    mapRef.current?.getCamera().then((camera) => {
      camera.zoom = (camera.zoom || 12) + 1
      mapRef.current?.animateCamera(camera, { duration: 300 })
    })
  }

  const handleZoomOut = () => {
    mapRef.current?.getCamera().then((camera) => {
      camera.zoom = (camera.zoom || 12) - 1
      mapRef.current?.animateCamera(camera, { duration: 300 })
    })
  }

  return (
    <View className="absolute bottom-32 right-4 gap-2">
      <TouchableOpacity
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{
          backgroundColor: colors.card,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        }}
        onPress={handleZoomIn}
        activeOpacity={0.7}
      >
        <Feather name="plus" size={20} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{
          backgroundColor: colors.card,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        }}
        onPress={handleZoomOut}
        activeOpacity={0.7}
      >
        <Feather name="minus" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  )
}

const MapScreen: React.FC = () => {
  const { colors, actualTheme } = useThemeContext()
  const mapRef = useRef<MapView>(null)
  const bottomSheetAnim = useRef(new Animated.Value(height)).current
  const tripsSheetAnim = useRef(new Animated.Value(height)).current

  // Location state
  const [userLocation, setUserLocation] = useState<LatLng | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mapReady, setMapReady] = useState(false)

  // Reports state
  const [reports, setReports] = useState<Report[]>(mockReports)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [heatmapMode, setHeatmapMode] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState({
    traffic: true,
    power: true,
    road: true,
    safety: true,
    water: true,
    other: true,
  })

  // Buses state
  const [buses, setBuses] = useState<Bus[]>(mockBuses)
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null)
  const [nearbyBuses, setNearbyBuses] = useState<Bus[]>([])
  const [showNearbyBuses, setShowNearbyBuses] = useState(false)

  // Trips state
  const [trips, setTrips] = useState<Trip[]>(mockTrips)
  const [activeTracking, setActiveTracking] = useState<Trip | null>(null)
  const [showMyTrips, setShowMyTrips] = useState(false)

  // Add report state
  const [isAddingReport, setIsAddingReport] = useState(false)
  const [newReportLocation, setNewReportLocation] = useState<LatLng | null>(
    null,
  )
  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    category: "traffic" as Report["category"],
    severity: "medium" as "low" | "medium" | "high",
  })

  // Addis Ababa coordinates with higher zoom level
  const ADDIS_CENTER: Region = {
    latitude: 9.032,
    longitude: 38.7468,
    latitudeDelta: 0.01, // Increased zoom
    longitudeDelta: 0.01, // Increased zoom
  }

  // Get user location
  useEffect(() => {
    ;(async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") {
          Alert.alert(
            "Permission denied",
            "Location permission is required for full functionality",
          )
          return
        }

        let location = await Location.getCurrentPositionAsync({})
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })

        // Find nearby buses
        findNearbyBuses({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })
      } catch (error) {
        console.error("Error getting location:", error)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  // Handle map long press
  const handleMapLongPress = (event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent
    setNewReportLocation(coordinate)
    setIsAddingReport(true)
  }

  // Handle add report
  const handleAddReport = () => {
    if (!reportForm.title.trim() || !newReportLocation) return

    const newReport: Report = {
      id: Date.now().toString(),
      title: reportForm.title,
      description: reportForm.description,
      category: reportForm.category,
      status: "open",
      timestamp: new Date(),
      location: newReportLocation,
      severity: reportForm.severity,
      votes: 0,
    }

    setReports([newReport, ...reports])
    setReportForm({
      title: "",
      description: "",
      category: "traffic",
      severity: "medium",
    })
    setIsAddingReport(false)
    setNewReportLocation(null)
    Alert.alert("Success", "Report added successfully!")
  }

  // Simulate bus movement
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          if (bus.status === "active") {
            // Simulate movement along a route
            return {
              ...bus,
              location: {
                latitude: bus.location.latitude + (Math.random() - 0.5) * 0.001,
                longitude:
                  bus.location.longitude + (Math.random() - 0.5) * 0.001,
              },
            }
          }
          return bus
        }),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Update nearby buses when location changes or buses move
  useEffect(() => {
    if (userLocation && showNearbyBuses) {
      findNearbyBuses(userLocation)
    }
  }, [userLocation, buses, showNearbyBuses])

  const findNearbyBuses = (location: LatLng) => {
    const nearby = buses.filter((bus) => {
      if (bus.status !== "active") return false

      const distance =
        Math.sqrt(
          Math.pow(bus.location.latitude - location.latitude, 2) +
            Math.pow(bus.location.longitude - location.longitude, 2),
        ) * 111 // Rough conversion to km

      return distance < 2 // Within 2km
    })
    setNearbyBuses(nearby)
  }

  // Sheet animations
  const showBottomSheet = (report: Report) => {
    setSelectedReport(report)
    Animated.spring(bottomSheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start()
  }

  const hideBottomSheet = () => {
    Animated.spring(bottomSheetAnim, {
      toValue: height,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start(() => {
      setSelectedReport(null)
    })
  }

  const showTripsSheet = () => {
    setShowMyTrips(true)
    Animated.spring(tripsSheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start()
  }

  const hideTripsSheet = () => {
    Animated.spring(tripsSheetAnim, {
      toValue: height,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start(() => {
      setShowMyTrips(false)
    })
  }

  const handleStartTracking = (trip: Trip) => {
    setActiveTracking(trip)
    hideTripsSheet()

    // Find the bus for this trip
    const bus = buses.find((b) => b.id === trip.busId)
    if (bus) {
      setSelectedBus(bus)

      // Animate to bus location with higher zoom
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: bus.location.latitude,
            longitude: bus.location.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          },
          1000,
        )
      }
    }
  }

  const handleStopTracking = () => {
    setActiveTracking(null)
    setSelectedBus(null)
  }

  const handleBusPress = (bus: Bus) => {
    setSelectedBus(bus)
    showBottomSheetForBus(bus)
  }

  const showBottomSheetForBus = (bus: Bus) => {
    Animated.spring(bottomSheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start()
  }

  const focusOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000,
      )

      // Show nearby buses
      setShowNearbyBuses(true)
    }
  }

  // Filter reports by category
  const filteredReports = reports.filter(
    (report) => categoryFilter[report.category],
  )

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 font-geist" style={{ color: colors.text }}>
          Loading map...
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={ADDIS_CENTER}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onLongPress={handleMapLongPress}
        onMapReady={() => setMapReady(true)}
        customMapStyle={actualTheme === "dark" ? darkMapStyle : []}
      >
        {/* Heatmap */}
        {heatmapMode &&
          reports.map((report, index) => {
            const intensity = Math.min(
              reports.filter(
                (r) =>
                  Math.sqrt(
                    Math.pow(
                      r.location.latitude - report.location.latitude,
                      2,
                    ) +
                      Math.pow(
                        r.location.longitude - report.location.longitude,
                        2,
                      ),
                  ) *
                    100 <
                  1,
              ).length / 10,
              1,
            )

            return (
              <Circle
                key={`heat-${index}`}
                center={report.location}
                radius={500 + intensity * 1000}
                fillColor={`rgba(239, 68, 68, ${intensity * 0.3})`}
                strokeColor={`rgba(239, 68, 68, ${intensity * 0.5})`}
                strokeWidth={1}
              />
            )
          })}

        {/* Report Markers - Keep emojis for reports as they're category indicators */}
        {filteredReports.map((report) => {
          const config = categoryConfig[report.category]
          const IconComponent = config.icon
          return (
            <Marker
              key={report.id}
              coordinate={report.location}
              onPress={() => showBottomSheet(report)}
            >
              <View className="items-center justify-center">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{
                    backgroundColor:
                      actualTheme === "dark" ? config.darkColor : config.color,
                    transform: [
                      { scale: selectedReport?.id === report.id ? 1.2 : 1 },
                    ],
                    shadowColor: colors.text,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                >
                  <IconComponent size={30} color="#FFFFFF" />
                </View>
                {report.severity === "high" && (
                  <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                )}
              </View>
            </Marker>
          )
        })}

        {/* Bus Markers - Clean icons without background */}
        {(showNearbyBuses ? nearbyBuses : buses).map((bus) => (
          <Marker
            key={bus.id}
            coordinate={bus.location}
            onPress={() => handleBusPress(bus)}
          >
            <Animated.View
              className="items-center justify-center"
              style={{
                transform: [
                  {
                    scale: selectedBus?.id === bus.id ? 1.2 : 1,
                  },
                ],
              }}
            >
              {/* Bus icon without background */}
              <MaterialCommunityIcons
                name="bus"
                size={32}
                color={colors.primary}
              />

              {/* Active indicator dot */}
              {bus.status === "active" && (
                <View className="absolute -top-1 -right-1">
                  <View className="w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </View>
              )}
            </Animated.View>
          </Marker>
        ))}

        {/* New report marker preview */}
        {newReportLocation && !isAddingReport && (
          <Marker coordinate={newReportLocation}>
            <View className="items-center justify-center">
              <View
                className="w-12 h-12 rounded-full items-center justify-center border-4"
                style={{
                  backgroundColor: colors.primary + "40",
                  borderColor: colors.primary,
                }}
              >
                <Feather name="plus" size={24} color={colors.primary} />
              </View>
            </View>
          </Marker>
        )}

        {/* Active Tracking Path */}
        {activeTracking && selectedBus && (
          <Circle
            center={selectedBus.location}
            radius={100}
            fillColor={colors.primary + "20"}
            strokeColor={colors.primary}
            strokeWidth={2}
          />
        )}
      </MapView>

      {/* Header */}
      <View className="absolute top-16 left-6 right-6">
        <View
          className="rounded-2xl px-4 py-3 flex-row items-center"
          style={{
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white text-lg font-groteskBold">HG</Text>
          </View>
          <View className="flex-1">
            <Text
              className="text-sm font-geist"
              style={{ color: colors.mutedText }}
            >
              Welcome to
            </Text>
            <Text
              className="text-lg font-groteskBold"
              style={{ color: colors.text }}
            >
              HabeshaGo
            </Text>
          </View>
          <TouchableOpacity
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: colors.background }}
          >
            <Feather name="bell" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Zoom Controls */}
      <ZoomControls mapRef={mapRef} colors={colors} />

      {/* Map Controls */}
      <MapControls
        userLocation={userLocation}
        heatmapMode={heatmapMode}
        setHeatmapMode={setHeatmapMode}
        showMyTrips={showMyTrips}
        setShowMyTrips={showTripsSheet}
        focusOnUserLocation={focusOnUserLocation}
        colors={colors}
      />

      {/* My Trips Sheet */}
      <MyTripsSheet
        trips={trips}
        activeTracking={activeTracking}
        onStartTracking={handleStartTracking}
        onStopTracking={handleStopTracking}
        animValue={tripsSheetAnim}
        colors={colors}
        onClose={() => {
          Animated.spring(tripsSheetAnim, {
            toValue: height,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start()
        }}
      />

      {/* Bus Tracking Sheet */}
      <BusTrackingSheet
        selectedBus={selectedBus}
        activeTracking={activeTracking}
        onClose={() => {
          setSelectedBus(null)
          hideBottomSheet()
        }}
        onStopTracking={handleStopTracking}
        animValue={bottomSheetAnim}
        colors={colors}
      />

      {/* Add report hint */}
      {!isAddingReport && (
        <View className="absolute bottom-6 left-6 right-32">
          <View
            className="rounded-xl px-4 py-3"
            style={{ backgroundColor: colors.card }}
          >
            <Text className="text-sm font-geist" style={{ color: colors.text }}>
              📍 <Text className="font-groteskBold">Long press</Text> on map to
              add a report
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

// Dark map style
const darkMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
]

export default MapScreen
