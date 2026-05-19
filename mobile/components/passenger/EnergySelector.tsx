import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native"
import Slider from "@react-native-community/slider"
import {
  Gauge,
  BatteryCharging,
  Timer,
  Leaf,
  Minus,
  Plus,
} from "lucide-react-native"

interface ChargingPoint {
  id: number
  powerKw: number
}

interface EnergySelectorProps {
  selectedPoint: ChargingPoint | null | undefined
  energyKwh: number
  setEnergyKwh: (value: number) => void
  pricePerKwh: number
  estimatedTimeMin: number | undefined
  setEstimatedTimeMin: (value: number) => void
  vehicleCapacity?: number
}

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

const getProgressColor = (kwh: number) => {
  if (kwh <= 20) return "#10b981"
  if (kwh <= 50) return "#059669"
  if (kwh <= 80) return "#0d9488"
  if (kwh <= 120) return "#10b981"
  return "#f59e0b"
}

export function EnergySelector({
  selectedPoint,
  energyKwh,
  setEnergyKwh,
  pricePerKwh,
  estimatedTimeMin,
  setEstimatedTimeMin,
  vehicleCapacity,
}: EnergySelectorProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  useEffect(() => {
    if (!selectedPoint) return

    const time = Math.ceil((energyKwh / selectedPoint.powerKw) * 60)
    setEstimatedTimeMin(time)
  }, [energyKwh, selectedPoint, setEstimatedTimeMin])

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  if (!selectedPoint) return null

  const co2Saved = (energyKwh * 0.4).toFixed(1)
  const totalPrice = (energyKwh * pricePerKwh).toFixed(2)
  const maxKwh = vehicleCapacity ? Math.min(150, vehicleCapacity * 1.2) : 150
  const recommendedKwh = vehicleCapacity
    ? Math.floor(vehicleCapacity * 0.8)
    : 35

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconContainer}>
            <Gauge size={20} color="#10b981" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Set Your Energy Requirement</Text>
            <Text style={styles.cardSubtitle}>
              Adjust to match your EV&apos;s battery needs
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          {/* ENERGY CONTROL */}
          <View style={styles.energyControl}>
            <View style={styles.energyInfo}>
              <View style={styles.energyIconContainer}>
                <BatteryCharging size={24} color="#10b981" />
              </View>
              <View>
                <Text style={styles.energyLabel}>Energy Amount</Text>
                <View style={styles.energyValueRow}>
                  <Text style={styles.energyValue}>{energyKwh}</Text>
                  <Text style={styles.energyUnit}>kWh</Text>
                </View>
              </View>
            </View>

            <View style={styles.energyButtons}>
              <TouchableOpacity
                style={styles.energyButton}
                onPress={() => setEnergyKwh(Math.max(5, energyKwh - 5))}
              >
                <Minus size={16} color="#10b981" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.energyButton}
                onPress={() => setEnergyKwh(Math.min(maxKwh, energyKwh + 5))}
              >
                <Plus size={16} color="#10b981" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Slider */}
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              value={energyKwh}
              onValueChange={setEnergyKwh}
              minimumValue={5}
              maximumValue={maxKwh}
              step={1}
              minimumTrackTintColor={getProgressColor(energyKwh)}
              maximumTrackTintColor="#e5e7eb"
              thumbTintColor="#10b981"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelMin}>5 kWh</Text>
              <Text style={styles.sliderLabelMax}>{maxKwh} kWh</Text>
            </View>
          </View>

          {/* Range Indicator */}
          <View style={styles.rangeContainer}>
            <View style={styles.rangeHeader}>
              <Text style={styles.rangeLabel}>Range Indicator</Text>
              <Text style={styles.rangeValue}>
                {Math.round(energyKwh * 5)}–{Math.round(energyKwh * 7)} km
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${(energyKwh / maxKwh) * 100}%`,
                    backgroundColor: getProgressColor(energyKwh),
                  },
                ]}
              />
            </View>
            {vehicleCapacity && (
              <View style={styles.recommendedContainer}>
                <Text style={styles.recommendedText}>
                  Recommended: {recommendedKwh} kWh (
                  {Math.round((recommendedKwh / vehicleCapacity) * 100)}% of
                  your battery)
                </Text>
              </View>
            )}
          </View>

          {/* STATS */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Timer size={20} color="#10b981" />
              <View>
                <Text style={styles.statLabel}>Time</Text>
                <Text style={styles.statValue}>
                  {formatTime(estimatedTimeMin || 0)}
                </Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Leaf size={20} color="#10b981" />
              <View>
                <Text style={styles.statLabel}>CO₂ Saved</Text>
                <Text style={styles.statValue}>{co2Saved} kg</Text>
              </View>
            </View>
          </View>

          {/* PRICE */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Estimated Cost</Text>
            <Text style={styles.priceValue}>{totalPrice} ETB</Text>
          </View>
        </View>
      </View>
    </Animated.View>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#ecfdf5",
    borderBottomWidth: 1,
    borderBottomColor: "#d1fae5",
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  cardContent: {
    padding: 16,
  },
  energyControl: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  energyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  energyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
  },
  energyLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  energyValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  energyValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#10b981",
  },
  energyUnit: {
    fontSize: 14,
    color: "#6b7280",
  },
  energyButtons: {
    flexDirection: "row",
    gap: 8,
  },
  energyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  sliderContainer: {
    marginBottom: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  sliderLabelMin: {
    fontSize: 12,
    color: "#9ca3af",
  },
  sliderLabelMax: {
    fontSize: 12,
    color: "#9ca3af",
  },
  rangeContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  rangeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rangeLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  rangeValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10b981",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  recommendedContainer: {
    marginTop: 8,
  },
  recommendedText: {
    fontSize: 11,
    color: "#6b7280",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    padding: 16,
    borderRadius: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: "#374151",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10b981",
  },
})
