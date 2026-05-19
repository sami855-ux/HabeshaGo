import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  Animated,
} from "react-native"
import { useRouter } from "expo-router"
import { ChargingStation, ChargingPoint } from "@/types/ev"
import {
  MapPin,
  Zap,
  Clock,
  Gauge,
  X,
  Navigation,
  Star,
  CheckCircle,
  TrendingUp,
  Battery,
  Calendar,
  Clock as ClockIcon,
  Wifi,
  Coffee,
  ShoppingBag,
  Shield,
  Award,
} from "lucide-react-native"
import { StatusBar } from "react-native"

const { height: SCREEN_HEIGHT } = Dimensions.get("window")

interface StationDetailsModalProps {
  station: ChargingStation | null
  onClose: () => void
}

export function StationDetailsModal({
  station,
  onClose,
}: StationDetailsModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview" | "charging">(
    "overview",
  )
  const [selectedChargingPoint, setSelectedChargingPoint] =
    useState<ChargingPoint | null>(null)
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current

  useEffect(() => {
    setSelectedChargingPoint(null)
  }, [station, activeTab])

  useEffect(() => {
    if (station) {
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        mass: 1,
        stiffness: 100,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }
  }, [station])

  if (!station) return null

  const availablePoints = station.chargingPoints.filter(
    (point) => point.status === "AVAILABLE",
  ).length

  const totalPoints = station.chargingPoints.length
  const availabilityRate =
    totalPoints > 0 ? (availablePoints / totalPoints) * 100 : 0
  const avgRating = station.ratings?.length
    ? (
        station.ratings.reduce((acc, r) => acc + r.rating, 0) /
        station.ratings.length
      ).toFixed(1)
    : null

  const maxPower = Math.max(...station.chargingPoints.map((p) => p.powerKw))

  const handleBooking = () => {
    onClose()
    router.push(`/evService/${station.id}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "#10b981"
      case "CHARGING":
        return "#f59e0b"
      case "OCCUPIED":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Available"
      case "CHARGING":
        return "Charging"
      case "OCCUPIED":
        return "Occupied"
      default:
        return status
    }
  }

  return (
    <Modal
      visible={!!station}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <StatusBar barStyle={"dark-content"} />
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.overlayBackground}
          onPress={onClose}
          activeOpacity={1}
        />
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header with Gradient Background */}
            <View style={styles.header}>
              <View style={styles.headerGradient} />

              <View style={styles.headerContent}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="#fff" />
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                  {station.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <CheckCircle size={14} color="#fff" />
                      <Text style={styles.verifiedText}>Verified Partner</Text>
                    </View>
                  )}

                  <Text style={styles.stationName}>{station.name}</Text>

                  <View style={styles.ratingAvailabilityRow}>
                    {avgRating && (
                      <View style={styles.ratingBadge}>
                        <Star size={14} color="#fbbf24" fill="#fbbf24" />
                        <Text style={styles.ratingValue}>{avgRating}</Text>
                        <Text style={styles.ratingCount}>
                          ({station.ratings?.length || 0})
                        </Text>
                      </View>
                    )}

                    <View style={styles.availabilityBadge}>
                      <TrendingUp size={14} color="#fff" />
                      <Text style={styles.availabilityText}>
                        {availabilityRate.toFixed(0)}% Available
                      </Text>
                    </View>

                    {availabilityRate < 30 && availablePoints > 0 && (
                      <View style={styles.limitedBadge}>
                        <Clock size={12} color="#fff" />
                        <Text style={styles.limitedText}>Limited Slots</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.addressContainer}>
                    <MapPin size={14} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.address}>
                      {station.address || "Address not available"}
                      {station.city && `, ${station.city}`}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "overview" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("overview")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "overview" && styles.activeTabText,
                  ]}
                >
                  Overview
                </Text>
                {activeTab === "overview" && (
                  <View style={styles.activeTabIndicator} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "charging" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("charging")}
              >
                <View style={styles.tabWithBadge}>
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "charging" && styles.activeTabText,
                    ]}
                  >
                    Charging Points
                  </Text>
                  {totalPoints > 0 && (
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsBadgeText}>{totalPoints}</Text>
                    </View>
                  )}
                </View>
                {activeTab === "charging" && (
                  <View style={styles.activeTabIndicator} />
                )}
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {activeTab === "overview" ? (
                <View style={styles.overviewContent}>
                  {/* Quick Stats */}
                  <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                      <Battery size={24} color="#059669" />
                      <Text style={styles.statValue}>
                        {maxPower}
                        <Text style={styles.statUnit}> kW</Text>
                      </Text>
                      <Text style={styles.statLabel}>Charging Speed</Text>
                    </View>

                    <View style={styles.statCard}>
                      <ClockIcon size={24} color="#059669" />
                      <Text style={styles.statValue}>24/7</Text>
                      <Text style={styles.statLabel}>Operating Hours</Text>
                    </View>
                  </View>

                  {/* Available Points Summary */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Availability</Text>
                    <View style={styles.availabilityBar}>
                      <View
                        style={[
                          styles.availabilityFill,
                          { width: `${availabilityRate}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.availabilitySummary}>
                      {availablePoints} of {totalPoints} charging points
                      available
                    </Text>
                  </View>

                  {/* Tariffs Section */}
                  {station.tariffs && station.tariffs.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Pricing & Tariffs</Text>
                      {station.tariffs.map((tariff, index) => (
                        <View key={index} style={styles.tariffCard}>
                          <Text style={styles.tariffName}>
                            {tariff.name || "Standard Rate"}
                          </Text>
                          <Text style={styles.tariffPrice}>
                            {tariff.pricePerKwh} {tariff.currency || "ETB"}/kWh
                          </Text>
                          {tariff.description && (
                            <Text style={styles.tariffDescription}>
                              {tariff.description}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.chargingContent}>
                  <View style={styles.chargingHeader}>
                    <Text style={styles.chargingTitle}>
                      Available Charging Points
                    </Text>
                    <Text style={styles.chargingSubtitle}>
                      Select a port to calculate costs and start charging
                    </Text>
                  </View>

                  {/* Charging Points Grid */}
                  <View style={styles.pointsGrid}>
                    {station.chargingPoints.map((point) => {
                      const isSelected = selectedChargingPoint?.id === point.id
                      const statusColor = getStatusColor(point.status)

                      return (
                        <TouchableOpacity
                          key={point.id}
                          style={[
                            styles.pointCard,
                            isSelected && styles.pointCardSelected,
                          ]}
                          onPress={() => setSelectedChargingPoint(point)}
                        >
                          <View
                            style={[
                              styles.pointStatus,
                              { backgroundColor: statusColor },
                            ]}
                          />
                          <Text style={styles.pointId}>Port {point.id}</Text>
                          <Text style={styles.pointType}>
                            {point.connectorType}
                          </Text>
                          <Text style={styles.pointPower}>
                            {point.powerKw} kW
                          </Text>
                          <Text
                            style={[
                              styles.pointStatusText,
                              { color: statusColor },
                            ]}
                          >
                            {getStatusText(point.status)}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>

                  {selectedChargingPoint && (
                    <View style={styles.selectedPointInfo}>
                      <Text style={styles.selectedPointTitle}>
                        Selected Charging Point
                      </Text>
                      <Text style={styles.selectedPointDetail}>
                        Type: {selectedChargingPoint.connectorType}
                      </Text>
                      <Text style={styles.selectedPointDetail}>
                        Power: {selectedChargingPoint.powerKw} kW
                      </Text>
                      <Text style={styles.selectedPointDetail}>
                        Status: {getStatusText(selectedChargingPoint.status)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Book Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.bookButton,
                  availablePoints === 0 && styles.bookButtonDisabled,
                ]}
                onPress={handleBooking}
                disabled={availablePoints === 0}
              >
                <Calendar size={20} color="#fff" />
                <Text style={styles.bookButtonText}>
                  {availablePoints === 0
                    ? "No Slots Available"
                    : "Book This Station"}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlayBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.9,
    overflow: "hidden",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    position: "relative",
    overflow: "hidden",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#059669",
  },
  headerContent: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 12 : 20,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    marginTop: 8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
    gap: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
  },
  stationName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  ratingAvailabilityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  ratingCount: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  limitedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  limitedText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  address: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    flex: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    position: "relative",
  },
  activeTab: {
    backgroundColor: "#fff",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#059669",
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#059669",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tabWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pointsBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  pointsBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
  scrollView: {
    flex: 1,
  },
  overviewContent: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#059669",
  },
  statUnit: {
    fontSize: 12,
    fontWeight: "normal",
    color: "#6b7280",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  availabilityBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  availabilityFill: {
    height: "100%",
    backgroundColor: "#059669",
    borderRadius: 4,
  },
  availabilitySummary: {
    fontSize: 14,
    color: "#6b7280",
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  amenityText: {
    fontSize: 14,
    color: "#374151",
    textTransform: "capitalize",
  },
  tariffCard: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tariffName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  tariffPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 4,
  },
  tariffDescription: {
    fontSize: 12,
    color: "#6b7280",
  },
  chargingContent: {
    padding: 20,
  },
  chargingHeader: {
    marginBottom: 20,
  },
  chargingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  chargingSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  pointsGrid: {
    gap: 12,
  },
  pointCard: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    position: "relative",
  },
  pointCardSelected: {
    borderColor: "#059669",
    backgroundColor: "#ecfdf5",
  },
  pointStatus: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pointId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  pointType: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  pointPower: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  pointStatusText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  selectedPointInfo: {
    marginTop: 20,
    backgroundColor: "#ecfdf5",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  selectedPointTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065f46",
    marginBottom: 8,
  },
  selectedPointDetail: {
    fontSize: 14,
    color: "#065f46",
    marginBottom: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
})
