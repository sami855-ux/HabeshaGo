import React, { useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native"
import { ChargingStation } from "@/types/ev"
import {
  Zap,
  MapPin,
  Gauge,
  Battery,
  Clock,
  Star,
  BadgeCheck,
  TrendingUp,
} from "lucide-react-native"

interface StationListProps {
  stations: ChargingStation[]
  isLoading: boolean
  onStationSelect: (station: ChargingStation) => void
  selectedStationId?: number
}

function LoadingSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((i) => {
        return (
          <Animated.View key={i}>
            <View style={styles.skeletonContent} />
          </Animated.View>
        )
      })}
    </View>
  )
}

function AnimatedCard({ children, delay, isSelected, onPress }: any) {
  const scaleAnim = useRef(new Animated.Value(0.95)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const translateYAnim = useRef(new Animated.Value(20)).current

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[styles.card, isSelected && styles.selectedCard]}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  )
}

export function StationList({
  stations,
  isLoading,
  onStationSelect,
  selectedStationId,
}: StationListProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {stations?.map((station, index) => {
        const availablePoints = station.chargingPoints.filter(
          (cp) => cp.status === "AVAILABLE",
        ).length

        const totalPoints = station.chargingPoints.length
        const hasAvailable = availablePoints > 0

        const maxPower = Math.max(
          ...station.chargingPoints.map((cp) => cp.powerKw),
        )

        const avgRating = station.ratings?.length
          ? (
              station.ratings.reduce((acc, r) => acc + r.score, 0) /
              station.ratings.length
            ).toFixed(1)
          : null

        const isSelected = selectedStationId === station.id

        return (
          <AnimatedCard
            key={station.id}
            delay={index * 50}
            isSelected={isSelected}
            onPress={() => onStationSelect(station)}
          >
            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                hasAvailable ? styles.statusLive : styles.statusBusy,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  hasAvailable ? styles.dotLive : styles.dotBusy,
                ]}
              />
              <Text style={styles.statusText}>
                {hasAvailable ? "Live" : "Busy"}
              </Text>
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={1}>
                    {station.name}
                  </Text>
                  {station.isVerified && (
                    <BadgeCheck size={16} color="#10b981" />
                  )}
                </View>

                <View style={styles.addressRow}>
                  <MapPin size={14} color="#6b7280" />
                  <Text style={styles.address} numberOfLines={1}>
                    {station.address}
                  </Text>
                </View>

                {/* Rating */}
                {avgRating && (
                  <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        color={
                          star <= Number(avgRating) ? "#fbbf24" : "#e5e7eb"
                        }
                        fill={star <= Number(avgRating) ? "#fbbf24" : "none"}
                      />
                    ))}
                    <Text style={styles.ratingText}>
                      ({station.ratings?.length || 0})
                    </Text>
                  </View>
                )}
              </View>

              {/* Availability Tags */}
              <View style={styles.tagsRow}>
                <View
                  style={[
                    styles.tag,
                    hasAvailable ? styles.tagLive : styles.tagBusy,
                  ]}
                >
                  <Zap size={14} color={hasAvailable ? "#047857" : "#6b7280"} />
                  <Text
                    style={[
                      styles.tagText,
                      hasAvailable ? styles.tagTextLive : styles.tagTextBusy,
                    ]}
                  >
                    {availablePoints}/{totalPoints} Available
                  </Text>
                </View>

                <View style={[styles.tag, styles.tagPower]}>
                  <Gauge size={14} color="#6d28d9" />
                  <Text style={styles.tagTextPower}>{maxPower}kW</Text>
                </View>
              </View>

              {/* Connector Types */}
              <View style={styles.connectorsRow}>
                {Array.from(
                  new Set(station.chargingPoints.map((cp) => cp.connectorType)),
                ).map((type) => (
                  <View key={type} style={styles.connectorTag}>
                    <Text style={styles.connectorText}>{type}</Text>
                  </View>
                ))}
              </View>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Clock size={14} color="#6b7280" />
                  <Text style={styles.statText}>~30 min</Text>
                </View>

                <View style={styles.statItem}>
                  <Battery size={14} color="#6b7280" />
                  <Text style={styles.statText}>
                    {station.chargingPoints.length}
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <TrendingUp size={14} color="#6b7280" />
                  <Text style={styles.statText}>
                    {station.tariffs?.[0]?.pricePerKwh ?? "--"}
                  </Text>
                </View>
              </View>
            </View>
          </AnimatedCard>
        )
      })}

      {/* Empty State */}
      {stations?.length === 0 && (
        <AnimatedView style={styles.emptyContainer}>
          <Zap size={32} color="#f97316" />
          <Text style={styles.emptyText}>No stations found</Text>
        </AnimatedView>
      )}
    </ScrollView>
  )
}

// Helper AnimatedView component
function AnimatedView({ children, style }: any) {
  const opacityAnim = useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  return (
    <Animated.View style={[style, { opacity: opacityAnim }]}>
      {children}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  skeletonContent: {
    height: 140,
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  selectedCard: {
    borderColor: "#f97316",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
    zIndex: 1,
  },
  statusLive: {
    backgroundColor: "#ecfdf5",
  },
  statusBusy: {
    backgroundColor: "#f3f4f6",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotLive: {
    backgroundColor: "#10b981",
  },
  dotBusy: {
    backgroundColor: "#6b7280",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#374151",
  },
  cardContent: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  address: {
    fontSize: 13,
    color: "#6b7280",
    flex: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  tagLive: {
    backgroundColor: "#ecfdf5",
  },
  tagBusy: {
    backgroundColor: "#f3f4f6",
  },
  tagPower: {
    backgroundColor: "#faf5ff",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  tagTextLive: {
    color: "#047857",
  },
  tagTextBusy: {
    color: "#4b5563",
  },
  tagTextPower: {
    color: "#6d28d9",
  },
  connectorsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  connectorTag: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectorText: {
    fontSize: 11,
    color: "#4b5563",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#f9fafb",
    paddingVertical: 10,
    borderRadius: 12,
  },
  statText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
  },
})
