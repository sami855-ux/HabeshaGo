import { useThemeContext } from "@/context/ThemeContext"
import { Feather, Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
import React, { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TextInput,
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

// Types
type ReportCategory =
  | "traffic"
  | "power"
  | "road"
  | "safety"
  | "water"
  | "other"
type ReportStatus = "open" | "resolved" | "in-progress"

interface Report {
  id: string
  title: string
  description: string
  category: ReportCategory
  status: ReportStatus
  timestamp: Date
  location: LatLng
  severity: "low" | "medium" | "high"
  votes: number
}

interface CategoryFilter {
  traffic: boolean
  power: boolean
  road: boolean
  safety: boolean
  water: boolean
  other: boolean
}

// Mock data
const mockReports: Report[] = [
  {
    id: "1",
    title: "Major Traffic Jam",
    description: "Heavy traffic on Bole Road towards airport",
    category: "traffic",
    status: "open",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    location: { latitude: 9.0227, longitude: 38.7468 },
    severity: "high",
    votes: 42,
  },
  {
    id: "2",
    title: "Power Outage",
    description: "No electricity in Kazanchis area since morning",
    category: "power",
    status: "open",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    location: { latitude: 9.0152, longitude: 38.7618 },
    severity: "medium",
    votes: 28,
  },
  {
    id: "3",
    title: "Road Damage",
    description: "Large pothole on Churchill Avenue",
    category: "road",
    status: "in-progress",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    location: { latitude: 9.03, longitude: 38.755 },
    severity: "medium",
    votes: 15,
  },
  {
    id: "4",
    title: "Street Light Not Working",
    description: "Dark stretch on Sierra Leone Street",
    category: "safety",
    status: "open",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    location: { latitude: 9.0255, longitude: 38.7505 },
    severity: "low",
    votes: 8,
  },
  {
    id: "5",
    title: "Water Pipe Burst",
    description: "Water leakage near Hilton Hotel",
    category: "water",
    status: "resolved",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    location: { latitude: 9.035, longitude: 38.758 },
    severity: "high",
    votes: 31,
  },
]

// Category configurations
const categoryConfig = {
  traffic: { icon: "🚗", color: "#3b82f6", darkColor: "#1d4ed8" },
  power: { icon: "⚡", color: "#f59e0b", darkColor: "#d97706" },
  road: { icon: "🛣️", color: "#ef4444", darkColor: "#dc2626" },
  safety: { icon: "👮", color: "#8b5cf6", darkColor: "#7c3aed" },
  water: { icon: "💧", color: "#06b6d4", darkColor: "#0891b2" },
  other: { icon: "📋", color: "#6b7280", darkColor: "#4b5563" },
}

const statusConfig = {
  open: { label: "Open", color: "#ef4444", icon: "alert-circle" },
  resolved: { label: "Resolved", color: "#10b981", icon: "check-circle" },
  "in-progress": { label: "In Progress", color: "#f59e0b", icon: "clock" },
}

const severityConfig = {
  high: { label: "High", color: "#ef4444" },
  medium: { label: "Medium", color: "#f59e0b" },
  low: { label: "Low", color: "#10b981" },
}

const MapScreen: React.FC = () => {
  const { colors, actualTheme } = useThemeContext()
  const mapRef = useRef<MapView>(null)
  const bottomSheetAnim = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current
  const filterSheetAnim = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current

  const [userLocation, setUserLocation] = useState<LatLng | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [reports, setReports] = useState<Report[]>(mockReports)
  const [isLoading, setIsLoading] = useState(true)
  const [mapReady, setMapReady] = useState(false)
  const [heatmapMode, setHeatmapMode] = useState(false)
  const [newReportLocation, setNewReportLocation] = useState<LatLng | null>(
    null
  )
  const [isAddingReport, setIsAddingReport] = useState(false)
  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    category: "traffic" as ReportCategory,
    severity: "medium" as "low" | "medium" | "high",
  })
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>({
    traffic: true,
    power: true,
    road: true,
    safety: true,
    water: true,
    other: true,
  })

  // Addis Ababa coordinates
  const ADDIS_CENTER: Region = {
    latitude: 9.032,
    longitude: 38.7468,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }

  // Get user location
  useEffect(() => {
    ;(async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") {
          Alert.alert(
            "Permission denied",
            "Location permission is required for full functionality"
          )
          return
        }

        let location = await Location.getCurrentPositionAsync({})
        setUserLocation({
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

  // Show bottom sheet
  const showBottomSheet = (report: Report) => {
    setSelectedReport(report)
    Animated.spring(bottomSheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start()
  }

  // Hide bottom sheet
  const hideBottomSheet = () => {
    Animated.spring(bottomSheetAnim, {
      toValue: Dimensions.get("window").height,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start(() => {
      setSelectedReport(null)
    })
  }

  // Show filter sheet
  const showFilterSheet = () => {
    Animated.spring(filterSheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start()
  }

  // Hide filter sheet
  const hideFilterSheet = () => {
    Animated.spring(filterSheetAnim, {
      toValue: Dimensions.get("window").height,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start()
  }

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

  // Filter reports by category
  const filteredReports = reports.filter(
    (report) => categoryFilter[report.category]
  )

  // Calculate heatmap intensity
  const calculateHeatmapIntensity = (location: LatLng) => {
    const nearbyReports = reports.filter((r) => {
      const distance =
        Math.sqrt(
          Math.pow(r.location.latitude - location.latitude, 2) +
            Math.pow(r.location.longitude - location.longitude, 2)
        ) * 100
      return distance < 1 // Within 1km
    })
    return Math.min(nearbyReports.length / 10, 1)
  }

  // Render markers
  const renderMarkers = () => {
    return filteredReports.map((report) => {
      const config = categoryConfig[report.category]
      const isSelected = selectedReport?.id === report.id

      return (
        <Marker
          key={report.id}
          coordinate={report.location}
          onPress={() => showBottomSheet(report)}
        >
          <View
            className={`items-center justify-center ${isSelected ? "scale-125" : ""}`}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center border-2"
              style={{
                backgroundColor:
                  actualTheme === "dark" ? config.darkColor : config.color,
                borderColor: colors.background,
                transform: [{ scale: isSelected ? 1.2 : 1 }],
                shadowColor: colors.text,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <Text className="text-lg">{config.icon}</Text>
            </View>
            {report.severity === "high" && (
              <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white" />
            )}
          </View>
        </Marker>
      )
    })
  }

  // Render heatmap
  const renderHeatmap = () => {
    if (!heatmapMode) return null

    return reports.map((report, index) => {
      const intensity = calculateHeatmapIntensity(report.location)
      const radius = 500 + intensity * 1000 // 500m to 1500m

      return (
        <Circle
          key={`heat-${index}`}
          center={report.location}
          radius={radius}
          fillColor={`rgba(239, 68, 68, ${intensity * 0.3})`}
          strokeColor={`rgba(239, 68, 68, ${intensity * 0.5})`}
          strokeWidth={1}
        />
      )
    })
  }

  // Render bottom sheet
  const renderBottomSheet = () => {
    if (!selectedReport) return null

    const config = categoryConfig[selectedReport.category]
    const status = statusConfig[selectedReport.status]
    const severity = severityConfig[selectedReport.severity]
    const timeAgo = Math.floor(
      (Date.now() - selectedReport.timestamp.getTime()) / (1000 * 60 * 60)
    )

    return (
      <Animated.View
        style={{
          transform: [{ translateY: bottomSheetAnim }],
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Dimensions.get("window").height * 0.5,
        }}
      >
        <View
          className="rounded-t-3xl pt-4 px-6 h-full"
          style={{ backgroundColor: colors.card }}
        >
          {/* Drag handle */}
          <View
            className="w-12 h-1 rounded-full self-center mb-4"
            style={{ backgroundColor: colors.border }}
          />

          {/* Close button */}
          <TouchableOpacity
            onPress={hideBottomSheet}
            className="absolute right-6 top-4 z-10"
          >
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category header */}
            <View className="flex-row items-center mb-4">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{
                  backgroundColor:
                    actualTheme === "dark" ? config.darkColor : config.color,
                }}
              >
                <Text className="text-2xl">{config.icon}</Text>
              </View>
              <View className="flex-1">
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  {selectedReport.title}
                </Text>
                <Text className="text-sm" style={{ color: colors.mutedText }}>
                  {timeAgo === 0 ? "Just now" : `${timeAgo}h ago`}
                </Text>
              </View>
            </View>

            {/* Status & Severity */}
            <View className="flex-row mb-6">
              <View
                className="px-4 py-2 rounded-full mr-3"
                style={{ backgroundColor: status.color + "20" }}
              >
                <Text style={{ color: status.color }} className="font-semibold">
                  {status.label}
                </Text>
              </View>
              <View
                className="px-4 py-2 rounded-full"
                style={{ backgroundColor: severity.color + "20" }}
              >
                <Text
                  style={{ color: severity.color }}
                  className="font-semibold"
                >
                  {severity.label} Priority
                </Text>
              </View>
            </View>

            {/* Description */}
            <Text
              className="text-base mb-6 leading-6"
              style={{ color: colors.text }}
            >
              {selectedReport.description}
            </Text>

            {/* Details */}
            <View className="space-y-4 mb-6">
              <View className="flex-row items-center">
                <Feather
                  name="map-pin"
                  size={20}
                  color={colors.mutedText}
                  style={{ marginRight: 12 }}
                />
                <Text className="text-sm" style={{ color: colors.text }}>
                  Bole, Addis Ababa
                </Text>
              </View>
              <View className="flex-row items-center">
                <Feather
                  name="thumbs-up"
                  size={20}
                  color={colors.mutedText}
                  style={{ marginRight: 12 }}
                />
                <Text className="text-sm" style={{ color: colors.text }}>
                  {selectedReport.votes} people confirmed this
                </Text>
              </View>
              <View className="flex-row items-center">
                <Feather
                  name="clock"
                  size={20}
                  color={colors.mutedText}
                  style={{ marginRight: 12 }}
                />
                <Text className="text-sm" style={{ color: colors.text }}>
                  Reported {timeAgo === 0 ? "just now" : `${timeAgo} hours ago`}
                </Text>
              </View>
            </View>

            {/* Action buttons */}
            <View className="flex-row space-x-3 mb-8">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: colors.primary + "20" }}
              >
                <Text
                  style={{ color: colors.primary }}
                  className="font-semibold"
                >
                  Confirm
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: colors.border }}
              >
                <Text style={{ color: colors.text }} className="font-semibold">
                  Share
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Animated.View>
    )
  }

  // Render filter sheet
  const renderFilterSheet = () => {
    return (
      <Animated.View
        style={{
          transform: [{ translateY: filterSheetAnim }],
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Dimensions.get("window").height * 0.6,
        }}
      >
        <View
          className="rounded-t-3xl pt-4 px-6 h-full"
          style={{ backgroundColor: colors.card }}
        >
          {/* Drag handle */}
          <View
            className="w-12 h-1 rounded-full self-center mb-4"
            style={{ backgroundColor: colors.border }}
          />

          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Filter Reports
            </Text>
            <TouchableOpacity onPress={hideFilterSheet}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Categories */}
            <Text
              className="text-sm font-semibold mb-4"
              style={{ color: colors.mutedText }}
            >
              CATEGORIES
            </Text>
            <View className="space-y-3 mb-8">
              {Object.entries(categoryConfig).map(([key, config]) => (
                <TouchableOpacity
                  key={key}
                  className="flex-row items-center justify-between py-3"
                  onPress={() =>
                    setCategoryFilter((prev) => ({
                      ...prev,
                      [key]: !prev[key as keyof CategoryFilter],
                    }))
                  }
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-10 h-10 rounded-lg items-center justify-center mr-4"
                      style={{
                        backgroundColor:
                          actualTheme === "dark"
                            ? config.darkColor
                            : config.color,
                      }}
                    >
                      <Text className="text-lg">{config.icon}</Text>
                    </View>
                    <Text className="text-base" style={{ color: colors.text }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                  </View>
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      categoryFilter[key as keyof CategoryFilter]
                        ? "border-primary"
                        : "border-gray-300"
                    }`}
                    style={{
                      backgroundColor: categoryFilter[
                        key as keyof CategoryFilter
                      ]
                        ? colors.primary
                        : "transparent",
                    }}
                  >
                    {categoryFilter[key as keyof CategoryFilter] && (
                      <Feather name="check" size={14} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Heatmap Toggle */}
            <Text
              className="text-sm font-semibold mb-4"
              style={{ color: colors.mutedText }}
            >
              MAP MODE
            </Text>
            <View className="flex-row items-center justify-between py-3 mb-8">
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-lg items-center justify-center mr-4"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <Ionicons name="flame" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text className="text-base" style={{ color: colors.text }}>
                    Heatmap Mode
                  </Text>
                  <Text className="text-sm" style={{ color: colors.mutedText }}>
                    Show high-activity areas
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setHeatmapMode(!heatmapMode)}
                className={`w-12 h-6 rounded-full ${heatmapMode ? "bg-primary" : "bg-gray-300"}`}
              >
                <Animated.View
                  className="w-6 h-6 rounded-full bg-white absolute top-0"
                  style={{
                    left: heatmapMode ? 24 : 0,
                  }}
                />
              </TouchableOpacity>
            </View>

            {/* Clear All button */}
            <TouchableOpacity
              className="py-4 rounded-xl items-center mb-8"
              style={{ backgroundColor: colors.border }}
              onPress={() =>
                setCategoryFilter({
                  traffic: false,
                  power: false,
                  road: false,
                  safety: false,
                  water: false,
                  other: false,
                })
              }
            >
              <Text style={{ color: colors.text }} className="font-semibold">
                Clear All Filters
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Animated.View>
    )
  }

  // Render add report modal
  const renderAddReportModal = () => {
    if (!isAddingReport) return null

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddingReport}
        onRequestClose={() => setIsAddingReport(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="rounded-t-3xl pt-4 px-6 pb-8"
            style={{
              backgroundColor: colors.card,
              minHeight: Dimensions.get("window").height * 0.7,
            }}
          >
            {/* Drag handle */}
            <View
              className="w-12 h-1 rounded-full self-center mb-4"
              style={{ backgroundColor: colors.border }}
            />

            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                Report an Issue
              </Text>
              <TouchableOpacity onPress={() => setIsAddingReport(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Title */}
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.mutedText }}
              >
                TITLE
              </Text>
              <TextInput
                className="rounded-xl px-4 py-3 mb-4"
                style={{
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                placeholder="What's the issue?"
                placeholderTextColor={colors.mutedText}
                value={reportForm.title}
                onChangeText={(text) =>
                  setReportForm((prev) => ({ ...prev, title: text }))
                }
              />

              {/* Description */}
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.mutedText }}
              >
                DESCRIPTION
              </Text>
              <TextInput
                className="rounded-xl px-4 py-3 mb-4"
                style={{
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                  height: 100,
                  textAlignVertical: "top",
                }}
                placeholder="Provide more details..."
                placeholderTextColor={colors.mutedText}
                multiline
                numberOfLines={4}
                value={reportForm.description}
                onChangeText={(text) =>
                  setReportForm((prev) => ({ ...prev, description: text }))
                }
              />

              {/* Category */}
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.mutedText }}
              >
                CATEGORY
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                <View className="flex-row space-x-3">
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <TouchableOpacity
                      key={key}
                      className={`px-4 py-3 rounded-xl ${reportForm.category === key ? "border-2" : ""}`}
                      style={{
                        backgroundColor:
                          reportForm.category === key
                            ? actualTheme === "dark"
                              ? config.darkColor
                              : config.color
                            : colors.background,
                        borderColor:
                          actualTheme === "dark"
                            ? config.darkColor
                            : config.color,
                      }}
                      onPress={() =>
                        setReportForm((prev) => ({
                          ...prev,
                          category: key as ReportCategory,
                        }))
                      }
                    >
                      <Text
                        className="font-semibold"
                        style={{
                          color:
                            reportForm.category === key
                              ? "#FFFFFF"
                              : colors.text,
                        }}
                      >
                        {config.icon}{" "}
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Severity */}
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.mutedText }}
              >
                SEVERITY
              </Text>
              <View className="flex-row space-x-3 mb-8">
                {(["low", "medium", "high"] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    className={`flex-1 py-3 rounded-xl items-center ${reportForm.severity === level ? "border-2" : ""}`}
                    style={{
                      backgroundColor:
                        reportForm.severity === level
                          ? severityConfig[level].color + "20"
                          : colors.background,
                      borderColor: severityConfig[level].color,
                    }}
                    onPress={() =>
                      setReportForm((prev) => ({ ...prev, severity: level }))
                    }
                  >
                    <Text
                      className="font-semibold"
                      style={{
                        color:
                          reportForm.severity === level
                            ? severityConfig[level].color
                            : colors.text,
                      }}
                    >
                      {severityConfig[level].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Submit button */}
              <TouchableOpacity
                className="py-4 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
                onPress={handleAddReport}
                disabled={!reportForm.title.trim()}
              >
                <Text className="text-white font-bold text-lg">
                  Submit Report
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    )
  }

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4" style={{ color: colors.text }}>
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
        // onLongPress={handleMapLongPress}
        onMapReady={() => setMapReady(true)}
        customMapStyle={actualTheme === "dark" ? darkMapStyle : []}
      >
        {renderHeatmap()}
        {renderMarkers()}

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
            <Text className="text-white text-lg font-bold">AP</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm" style={{ color: colors.mutedText }}>
              Welcome to
            </Text>
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Addis Pulse
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

      {/* Floating buttons */}
      <View className="absolute bottom-6 right-6 space-y-4">
        {/* My Location button */}
        <TouchableOpacity
          className="w-14 h-14 rounded-full items-center justify-center"
          style={{
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
          onPress={() => {
            if (userLocation && mapRef.current) {
              mapRef.current.animateToRegion(
                {
                  ...userLocation,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                1000
              )
            }
          }}
        >
          <Feather name="navigation" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Filter button */}
        <TouchableOpacity
          className="w-14 h-14 rounded-full items-center justify-center"
          style={{
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
          onPress={showFilterSheet}
        >
          <Feather name="filter" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Heatmap toggle button */}
        <TouchableOpacity
          className="w-14 h-14 rounded-full items-center justify-center"
          style={{
            backgroundColor: heatmapMode ? colors.primary : colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
          onPress={() => setHeatmapMode(!heatmapMode)}
        >
          <Ionicons
            name="flame"
            size={24}
            color={heatmapMode ? "#FFFFFF" : colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom sheet */}
      {renderBottomSheet()}
      {renderFilterSheet()}
      {renderAddReportModal()}

      {/* Add report hint */}
      {!isAddingReport && (
        <View className="absolute bottom-6 left-6 right-32">
          <View
            className="rounded-xl px-4 py-3"
            style={{ backgroundColor: colors.card }}
          >
            <Text className="text-sm" style={{ color: colors.text }}>
              📍 <Text className="font-semibold">Long press</Text> on map to add
              a report
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
    stylers: [
      {
        color: "#242f3e",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#746855",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#242f3e",
      },
    ],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#263c3f",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#6b9a76",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#38414e",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#212a37",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9ca5b3",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#746855",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#1f2835",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#f3d19c",
      },
    ],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [
      {
        color: "#2f3948",
      },
    ],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#17263c",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#515c6d",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#17263c",
      },
    ],
  },
]

export default MapScreen
