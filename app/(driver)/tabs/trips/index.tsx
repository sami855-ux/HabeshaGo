import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useThemeContext } from "@/context/ThemeContext";
import { MapPin, Flag } from "lucide-react-native";

type TripStatus = "ongoing" | "completed" | "cancelled";

export default function DriverTrips() {
  const { colors } = useThemeContext();
  const [activeTab, setActiveTab] = useState<TripStatus>("ongoing");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Text style={[styles.title, { color: colors.text }]}>Trips</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TabButton
          label="Ongoing"
          active={activeTab === "ongoing"}
          onPress={() => setActiveTab("ongoing")}
        />
        <TabButton
          label="Completed"
          active={activeTab === "completed"}
          onPress={() => setActiveTab("completed")}
        />
        <TabButton
          label="Cancelled"
          active={activeTab === "cancelled"}
          onPress={() => setActiveTab("cancelled")}
        />
      </View>

      {/* Trip List */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "ongoing" && (
          <TripCard
            status="ONGOING"
            pickup="Piassa, Addis Ababa"
            dropoff="Bole Atlas"
            fare="ETB 320"
          />
        )}

        {activeTab === "completed" && (
          <>
            <TripCard
              status="COMPLETED"
              pickup="Mexico, Addis"
              dropoff="CMC"
              fare="ETB 450"
            />
            <TripCard
              status="COMPLETED"
              pickup="Merkato"
              dropoff="Ayat"
              fare="ETB 610"
            />
          </>
        )}

        {activeTab === "cancelled" && (
          <TripCard
            status="CANCELLED"
            pickup="Kazanchis"
            dropoff="Bole"
            fare="—"
          />
        )}

        {/* Space for bottom tabs */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

/* ================= COMPONENTS ================= */

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useThemeContext();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabBtn, active && { backgroundColor: colors.primary }]}
    >
      <Text
        style={{
          color: active ? "#fff" : colors.text,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function TripCard({
  pickup,
  dropoff,
  fare,
  status,
}: {
  pickup: string;
  dropoff: string;
  fare: string;
  status: "ONGOING" | "COMPLETED" | "CANCELLED";
}) {
  const { colors } = useThemeContext();

  const statusColor =
    status === "ONGOING"
      ? colors.primary
      : status === "COMPLETED"
        ? colors.success
        : colors.error;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {/* Status */}
      <Text style={[styles.status, { color: statusColor }]}>{status}</Text>

      {/* Locations */}
      <View style={styles.row}>
        <MapPin size={18} color={colors.primary} />
        <Text style={[styles.location, { color: colors.text }]}>{pickup}</Text>
      </View>

      <View style={styles.row}>
        <Flag size={18} color={colors.primary} />
        <Text style={[styles.location, { color: colors.text }]}>{dropoff}</Text>
      </View>

      {/* Fare */}
      <Text style={[styles.fare, { color: colors.text }]}>Fare: {fare}</Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 16,
    paddingTop:24
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  tabBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },

  list: {
    paddingBottom: 20,
  },

  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },

  status: {
    fontWeight: "700",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },

  location: {
    fontSize: 14,
    fontWeight: "500",
  },

  fare: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "700",
  },
});
