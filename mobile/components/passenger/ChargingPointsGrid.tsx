import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
} from "react-native"
import {
  Zap,
  Timer,
  CheckCircle,
  Clock,
  AlertCircle,
  Flame,
} from "lucide-react-native"

interface ChargingPoint {
  id: number
  stationId: number
  connectorType: string
  powerKw: number
  status: string
  averageSessionDuration: number
  slotNumber: string
  chargingSpeed: string
  createdAt: string
  updatedAt: string
}

interface Vehicle {
  id: number
  manufacturer: string
  model: string
  connectorType: string
  capacity: number
  plateNumber: string
  year: number
}

interface ChargingPointsGridProps {
  chargingPoints: ChargingPoint[]
  selectedPointId: number | null
  onSelectPoint: (pointId: number) => void
  selectedVehicle?: Vehicle | null
  handleChangeVehicle: () => void
}

const getSpeedBadge = (speed: string) => {
  switch (speed) {
    case "ULTRA_FAST":
      return {
        label: "Ultra-Fast",
        color: "#10b981",
        bgColor: "#d1fae5",
        icon: Flame,
      }
    case "FAST":
      return {
        label: "Fast",
        color: "#059669",
        bgColor: "#a7f3d0",
        icon: Zap,
      }
    default:
      return {
        label: "Standard",
        color: "#6b7280",
        bgColor: "#f3f4f6",
        icon: Clock,
      }
  }
}

export function ChargingPointsGrid({
  chargingPoints,
  selectedPointId,
  onSelectPoint,
  selectedVehicle,
  handleChangeVehicle,
}: ChargingPointsGridProps) {
  const [showMismatchDialog, setShowMismatchDialog] = useState(false)
  const [pendingPointId, setPendingPointId] = useState<number | null>(null)
  const [pendingConnectorType, setPendingConnectorType] = useState<string>("")
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [])

  // Filter points that match the selected vehicle's connector type
  const matchingPoints = selectedVehicle
    ? chargingPoints.filter(
        (p) =>
          p.connectorType === selectedVehicle.connectorType &&
          p.status === "AVAILABLE",
      )
    : []

  const availablePoints = chargingPoints.filter((p) => p.status === "AVAILABLE")
  const hasMatchingPoints = matchingPoints.length > 0
  const hasAnyAvailablePoints = availablePoints.length > 0

  // Handle point selection with validation
  const handlePointSelection = (
    pointId: number,
    pointConnectorType: string,
  ) => {
    if (
      selectedVehicle &&
      pointConnectorType !== selectedVehicle.connectorType
    ) {
      setPendingPointId(pointId)
      setPendingConnectorType(pointConnectorType)
      setShowMismatchDialog(true)
      return
    }
    onSelectPoint(pointId)
  }

  const handleCloseMismatchDialog = () => {
    setShowMismatchDialog(false)
    setPendingPointId(null)
    setPendingConnectorType("")
  }

  // If no matching points found for the selected vehicle
  if (selectedVehicle && !hasMatchingPoints) {
    return (
      <>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <View style={styles.card}>
            <View style={styles.warningHeader}>
              <AlertCircle size={24} color="#d97706" />
              <Text style={styles.warningTitle}>
                No Compatible Charging Points
              </Text>
            </View>
            <Text style={styles.warningSubtitle}>
              Your {selectedVehicle.manufacturer} {selectedVehicle.model}{" "}
              requires {selectedVehicle.connectorType} connector
            </Text>

            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Zap size={40} color="#d97706" />
              </View>
              <Text style={styles.emptyTitle}>
                No {selectedVehicle.connectorType} Charging Points Available
              </Text>
              <Text style={styles.emptySubtitle}>
                This station doesn't have any available charging points
                compatible with your vehicle's connector type.
              </Text>

              <View style={styles.emptyButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => handleChangeVehicle()}
                >
                  <Text style={styles.primaryButtonText}>
                    Browse Other Stations
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleChangeVehicle}
                >
                  <Text style={styles.secondaryButtonText}>
                    Add/Change Vehicle
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Show all available points but disabled */}
              <View style={styles.incompatiblePointsContainer}>
                <Text style={styles.incompatiblePointsTitle}>
                  Available charging points at this station:
                </Text>
                <View style={styles.incompatiblePointsGrid}>
                  {chargingPoints.map((point) => {
                    const isCompatible =
                      point.connectorType === selectedVehicle.connectorType
                    return (
                      <View
                        key={point.id}
                        style={[
                          styles.incompatiblePointCard,
                          !isCompatible && styles.incompatiblePointDisabled,
                        ]}
                      >
                        <View style={styles.incompatiblePointHeader}>
                          <Text style={styles.incompatiblePointNumber}>
                            {point.slotNumber}
                          </Text>
                          <View style={styles.incompatiblePointBadge}>
                            <Text style={styles.incompatiblePointBadgeText}>
                              {point.connectorType}
                            </Text>
                          </View>
                          {!isCompatible && (
                            <View style={styles.incompatibleTag}>
                              <Text style={styles.incompatibleTagText}>
                                Incompatible
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.incompatiblePointDetails}>
                          {point.powerKw} kW • {point.chargingSpeed}
                        </Text>
                      </View>
                    )
                  })}
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Mismatch Dialog */}
        <Modal
          visible={showMismatchDialog}
          transparent
          animationType="fade"
          onRequestClose={handleCloseMismatchDialog}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <AlertCircle size={24} color="#d97706" />
                <Text style={styles.modalTitle}>Incompatible Connector</Text>
              </View>
              <Text style={styles.modalDescription}>
                This charging point is not compatible with your vehicle.
              </Text>
              <View style={styles.modalInfoBox}>
                <Text style={styles.modalInfoText}>
                  <Text style={styles.modalInfoLabel}>Your Vehicle:</Text>{" "}
                  {selectedVehicle?.manufacturer} {selectedVehicle?.model}
                </Text>
                <Text style={styles.modalInfoText}>
                  <Text style={styles.modalInfoLabel}>Requires Connector:</Text>{" "}
                  <Text style={styles.modalHighlight}>
                    {selectedVehicle?.connectorType}
                  </Text>
                </Text>
                <Text style={styles.modalInfoText}>
                  <Text style={styles.modalInfoLabel}>Selected Point:</Text>{" "}
                  {pendingConnectorType}
                </Text>
              </View>
              <Text style={styles.modalSuggestion}>
                Please select a charging point with{" "}
                {selectedVehicle?.connectorType} connector or add a different
                vehicle.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCloseMismatchDialog}
              >
                <Text style={styles.modalButtonText}>Understood</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    )
  }

  return (
    <>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Select Your Charging Point</Text>
            {selectedVehicle && (
              <Text style={styles.cardSubtitle}>
                Compatible with your {selectedVehicle.manufacturer}{" "}
                {selectedVehicle.model} ({selectedVehicle.connectorType})
              </Text>
            )}
            <Text style={styles.cardSubtitleLight}>
              {hasMatchingPoints
                ? `${matchingPoints.length} compatible point${matchingPoints.length !== 1 ? "s" : ""} available`
                : `Choose from ${availablePoints.length} available charging spots`}
            </Text>
          </View>

          <View style={styles.pointsGrid}>
            {chargingPoints.map((point, index) => {
              const isSelected = selectedPointId === point.id
              const isOccupied = point.status === "OCCUPIED"
              const isCompatible = selectedVehicle
                ? point.connectorType === selectedVehicle.connectorType
                : true
              const isDisabled =
                isOccupied || (selectedVehicle && !isCompatible)
              const speedInfo = getSpeedBadge(point.chargingSpeed)
              const SpeedIcon = speedInfo.icon

              const cardAnim = useRef(new Animated.Value(0)).current
              const scaleAnim = useRef(new Animated.Value(0.95)).current

              useEffect(() => {
                Animated.parallel([
                  Animated.timing(cardAnim, {
                    toValue: 1,
                    delay: index * 50,
                    duration: 300,
                    useNativeDriver: true,
                  }),
                  Animated.spring(scaleAnim, {
                    toValue: 1,
                    delay: index * 50,
                    friction: 8,
                    useNativeDriver: true,
                  }),
                ]).start()
              }, [])

              // If vehicle is selected and point is not compatible, disable it
              if (selectedVehicle && !isCompatible) {
                return (
                  <Animated.View
                    key={point.id}
                    style={[
                      styles.pointCard,
                      styles.pointCardIncompatible,
                      {
                        opacity: cardAnim,
                        transform: [{ scale: scaleAnim }],
                      },
                    ]}
                  >
                    <View style={styles.incompatibleBadge}>
                      <Text style={styles.incompatibleBadgeText}>
                        Incompatible
                      </Text>
                    </View>
                    <View style={styles.pointContent}>
                      <View style={styles.pointHeader}>
                        <View>
                          <Text style={styles.pointNumberIncompatible}>
                            {point.slotNumber}
                          </Text>
                          <View style={styles.speedBadgeIncompatible}>
                            <SpeedIcon size={10} color="#9ca3af" />
                            <Text style={styles.speedBadgeTextIncompatible}>
                              {speedInfo.label}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.pointIconIncompatible}>
                          <Zap size={20} color="#9ca3af" />
                        </View>
                      </View>
                      <View style={styles.pointDetails}>
                        <View style={styles.pointDetailRow}>
                          <Text style={styles.pointDetailLabel}>Connector</Text>
                          <Text style={styles.pointDetailValueIncompatible}>
                            {point.connectorType}
                          </Text>
                        </View>
                        <View style={styles.pointDetailRow}>
                          <Text style={styles.pointDetailLabel}>Required:</Text>
                          <Text style={styles.pointDetailValueRequired}>
                            {selectedVehicle.connectorType}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                )
              }

              return (
                <Animated.View
                  key={point.id}
                  style={[
                    styles.pointCard,
                    isSelected && styles.pointCardSelected,
                    isDisabled && styles.pointCardDisabled,
                    {
                      opacity: cardAnim,
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      !isDisabled &&
                      handlePointSelection(point.id, point.connectorType)
                    }
                    disabled={isDisabled}
                  >
                    {isOccupied && (
                      <View style={styles.occupiedBadge}>
                        <Text style={styles.occupiedBadgeText}>Occupied</Text>
                      </View>
                    )}
                    {selectedVehicle && isCompatible && !isOccupied && (
                      <View style={styles.compatibleBadge}>
                        <Text style={styles.compatibleBadgeText}>
                          Compatible
                        </Text>
                      </View>
                    )}
                    <View style={styles.pointContent}>
                      <View style={styles.pointHeader}>
                        <View>
                          <Text
                            style={[
                              styles.pointNumber,
                              isDisabled && styles.pointNumberDisabled,
                            ]}
                          >
                            {point.slotNumber}
                          </Text>
                          <View
                            style={[
                              styles.speedBadge,
                              { backgroundColor: speedInfo.bgColor },
                            ]}
                          >
                            <SpeedIcon size={10} color={speedInfo.color} />
                            <Text
                              style={[
                                styles.speedBadgeText,
                                { color: speedInfo.color },
                              ]}
                            >
                              {speedInfo.label}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={[
                            styles.pointIcon,
                            point.chargingSpeed === "ULTRA_FAST" &&
                              styles.pointIconUltraFast,
                            point.chargingSpeed === "FAST" &&
                              styles.pointIconFast,
                          ]}
                        >
                          <Zap
                            size={20}
                            color={
                              point.chargingSpeed === "ULTRA_FAST"
                                ? "#10b981"
                                : point.chargingSpeed === "FAST"
                                  ? "#059669"
                                  : "#9ca3af"
                            }
                          />
                        </View>
                      </View>

                      <View style={styles.pointDetails}>
                        <View style={styles.pointDetailRow}>
                          <Text style={styles.pointDetailLabel}>Connector</Text>
                          <Text style={styles.pointDetailValue}>
                            {point.connectorType}
                          </Text>
                        </View>
                        <View style={styles.pointDetailRow}>
                          <Text style={styles.pointDetailLabel}>Max Power</Text>
                          <Text style={styles.pointDetailValueHighlight}>
                            {point.powerKw} kW
                          </Text>
                        </View>
                        <View style={styles.pointDetailRow}>
                          <Text style={styles.pointDetailLabel}>Est. Time</Text>
                          <View style={styles.estTimeContainer}>
                            <Timer size={12} color="#10b981" />
                            <Text style={styles.pointDetailValue}>
                              {point.averageSessionDuration} min
                            </Text>
                          </View>
                        </View>
                      </View>

                      {isSelected && !isDisabled && (
                        <View style={styles.selectedIndicator}>
                          <CheckCircle size={12} color="#10b981" />
                          <Text style={styles.selectedIndicatorText}>
                            Ready for charging
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              )
            })}
          </View>
        </View>
      </Animated.View>

      {/* Mismatch Dialog */}
      <Modal
        visible={showMismatchDialog}
        transparent
        animationType="fade"
        onRequestClose={handleCloseMismatchDialog}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AlertCircle size={24} color="#d97706" />
              <Text style={styles.modalTitle}>Incompatible Connector</Text>
            </View>
            <Text style={styles.modalDescription}>
              This charging point is not compatible with your vehicle.
            </Text>
            <View style={styles.modalInfoBox}>
              <Text style={styles.modalInfoText}>
                <Text style={styles.modalInfoLabel}>Your Vehicle:</Text>{" "}
                {selectedVehicle?.manufacturer} {selectedVehicle?.model}
              </Text>
              <Text style={styles.modalInfoText}>
                <Text style={styles.modalInfoLabel}>Requires Connector:</Text>{" "}
                <Text style={styles.modalHighlight}>
                  {selectedVehicle?.connectorType}
                </Text>
              </Text>
              <Text style={styles.modalInfoText}>
                <Text style={styles.modalInfoLabel}>Selected Point:</Text>{" "}
                {pendingConnectorType}
              </Text>
            </View>
            <Text style={styles.modalSuggestion}>
              Please select a charging point with{" "}
              {selectedVehicle?.connectorType} connector or add a different
              vehicle.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCloseMismatchDialog}
            >
              <Text style={styles.modalButtonText}>Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#10b981",
    marginBottom: 2,
  },
  cardSubtitleLight: {
    fontSize: 12,
    color: "#6b7280",
  },
  pointsGrid: {
    padding: 16,
    gap: 12,
  },
  pointCard: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  pointCardSelected: {
    borderColor: "#10b981",
    backgroundColor: "#ecfdf5",
  },
  pointCardDisabled: {
    opacity: 0.6,
  },
  pointCardIncompatible: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
  },
  pointContent: {
    padding: 16,
  },
  pointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  pointNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  pointNumberIncompatible: {
    fontSize: 18,
    fontWeight: "700",
    color: "#9ca3af",
    marginBottom: 6,
  },
  pointNumberDisabled: {
    color: "#9ca3af",
  },
  speedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    alignSelf: "flex-start",
  },
  speedBadgeIncompatible: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    backgroundColor: "#f3f4f6",
    alignSelf: "flex-start",
  },
  speedBadgeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  speedBadgeTextIncompatible: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9ca3af",
  },
  pointIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  pointIconUltraFast: {
    backgroundColor: "#d1fae5",
  },
  pointIconFast: {
    backgroundColor: "#a7f3d0",
  },
  pointIconIncompatible: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  pointDetails: {
    gap: 8,
  },
  pointDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointDetailLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  pointDetailValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  pointDetailValueIncompatible: {
    fontSize: 13,
    fontWeight: "500",
    color: "#9ca3af",
  },
  pointDetailValueRequired: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10b981",
  },
  pointDetailValueHighlight: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10b981",
  },
  estTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  selectedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#d1fae5",
  },
  selectedIndicatorText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#10b981",
  },
  occupiedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fee2e2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  occupiedBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#dc2626",
  },
  compatibleBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#10b981",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  compatibleBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  incompatibleBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  incompatibleBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9ca3af",
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "#fffbeb",
    borderBottomWidth: 1,
    borderBottomColor: "#fde68a",
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400e",
  },
  warningSubtitle: {
    fontSize: 13,
    color: "#92400e",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  secondaryButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
  },
  incompatiblePointsContainer: {
    width: "100%",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  incompatiblePointsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 12,
  },
  incompatiblePointsGrid: {
    gap: 12,
  },
  incompatiblePointCard: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  incompatiblePointDisabled: {
    opacity: 0.6,
  },
  incompatiblePointHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  incompatiblePointNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  incompatiblePointBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  incompatiblePointBadgeText: {
    fontSize: 10,
    color: "#6b7280",
  },
  incompatibleTag: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  incompatibleTagText: {
    fontSize: 10,
    color: "#dc2626",
  },
  incompatiblePointDetails: {
    fontSize: 12,
    color: "#9ca3af",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    width: "90%",
    maxWidth: 340,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  modalInfoBox: {
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 6,
  },
  modalInfoText: {
    fontSize: 13,
    color: "#92400e",
  },
  modalInfoLabel: {
    fontWeight: "600",
  },
  modalHighlight: {
    fontWeight: "700",
    color: "#d97706",
  },
  modalSuggestion: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
})
