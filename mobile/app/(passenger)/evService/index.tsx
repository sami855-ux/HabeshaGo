// EVChargingDashboard.tsx
import React, { useState, useCallback } from "react"
import { useThemeContext } from "@/context/ThemeContext"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Platform,
  StatusBar,
  Modal,
  Animated,
} from "react-native"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import { axiosInstance } from "@/service/axiosInstance"
import { Search, ChevronLeft, Menu, X } from "lucide-react-native"

// import { MapSection } from './MapSection'
// import { StationList } from './StationList'
// import { StationDetailsModal } from './StationDetailsModal'
import { ChargingStation } from "@/types/ev"
import { MapSection } from "@/components/passenger/MapSection"
import { StationList } from "@/components/passenger/StationList"
import { StationDetailsModal } from "@/components/passenger/StationDetailsModal"

const fetchStations = async ({ queryKey }: any) => {
  const [_key, filters] = queryKey

  const params = new URLSearchParams()

  if (filters?.search) params.append("search", filters.search)
  if (filters?.city) params.append("city", filters.city)
  if (filters?.status) params.append("status", filters.status)
  if (filters?.verifiedOnly) params.append("verifiedOnly", "true")
  if (filters?.availableOnly) params.append("availableOnly", "true")
  if (filters?.minPower) params.append("minPower", filters.minPower)
  if (filters?.connectorTypes?.length)
    params.append("connectorTypes", filters.connectorTypes.join(","))

  if (filters?.lat && filters?.lng) {
    params.append("lat", filters.lat)
    params.append("lng", filters.lng)
    params.append("radius", filters.radius || 50)
  }

  const { data } = await axiosInstance.get(`/ev/station?${params.toString()}`)
  return data.data
}

export default function EVChargingDashboard() {
  const router = useRouter()
  const { colors, actualTheme } = useThemeContext()

  const [selectedStation, setSelectedStation] =
    useState<ChargingStation | null>(null)
  const [filters, setFilters] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileListOpen, setIsMobileListOpen] = useState(false)
  const [slideAnim] = useState(new Animated.Value(0))

  const {
    data: stations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["stations", { ...filters, search: searchQuery }],
    queryFn: fetchStations,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const handleStationSelect = useCallback((station: ChargingStation) => {
    setSelectedStation(station)
    setIsMobileListOpen(false)
  }, [])

  const handleCloseDetails = useCallback(() => {
    setSelectedStation(null)
  }, [])

  const toggleMobileList = useCallback(() => {
    if (isMobileListOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsMobileListOpen(false))
    } else {
      setIsMobileListOpen(true)
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [isMobileListOpen, slideAnim])

  const slideX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-400, 0],
  })

  const isWeb = Platform.OS === "web"

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"dark-content"} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={20} color="#374151" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Search size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stations..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => refetch()}
          />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Desktop/Tablet List - always visible on web */}
        {isWeb && (
          <View style={styles.desktopList}>
            <StationList
              stations={stations}
              isLoading={isLoading}
              onStationSelect={handleStationSelect}
              selectedStationId={selectedStation?.id}
            />
          </View>
        )}

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapSection
            stations={stations}
            onMarkerClick={handleStationSelect}
            selectedStationId={selectedStation?.id}
          />
        </View>
      </View>

      {/* Mobile List Overlay */}
      {!isWeb && (
        <Modal
          visible={isMobileListOpen}
          transparent={true}
          animationType="none"
          onRequestClose={toggleMobileList}
        >
          <View style={styles.mobileOverlay}>
            <TouchableOpacity
              style={styles.overlayBackground}
              activeOpacity={1}
              onPress={toggleMobileList}
            />
            <Animated.View
              style={[
                styles.mobileListContainer,
                { transform: [{ translateX: slideX }] },
              ]}
            >
              <View style={styles.mobileListHeader}>
                <Text style={styles.mobileListTitle}>Charging Stations</Text>
                <TouchableOpacity
                  onPress={toggleMobileList}
                  style={styles.closeButton}
                >
                  <X size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <StationList
                stations={stations}
                isLoading={isLoading}
                onStationSelect={handleStationSelect}
                selectedStationId={selectedStation?.id}
              />
            </Animated.View>
          </View>
        </Modal>
      )}

      {/* FAB for Mobile */}
      {!isWeb && !isMobileListOpen && (
        <TouchableOpacity style={styles.fab} onPress={toggleMobileList}>
          <Menu size={24} color="#fff" />
          {stations.length > 0 && (
            <View style={styles.fabBadge}>
              <Text style={styles.fabBadgeText}>{stations.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Station Details Modal */}
      <StationDetailsModal
        station={selectedStation}
        onClose={handleCloseDetails}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#10b981" />
          <Text style={styles.loadingText}>Loading stations...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <TouchableOpacity style={styles.errorOverlay} onPress={() => refetch()}>
          <Text style={styles.errorText}>
            Failed to load stations. Tap to retry.
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#111827",
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  desktopList: {
    width: 420,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  mobileOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlayBackground: {
    flex: 1,
  },
  mobileListContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "85%",
    maxWidth: 400,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mobileListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  mobileListTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#059669",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 40,
  },
  fabBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  fabBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: [{ translateX: -75 }],
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#fff",
    fontSize: 14,
  },
  errorOverlay: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: [{ translateX: -100 }],
    backgroundColor: "#ef4444",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  errorText: {
    color: "#fff",
    fontSize: 14,
  },
})
