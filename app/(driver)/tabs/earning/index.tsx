import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useThemeContext } from "@/context/ThemeContext";
import { Wallet, ArrowDownCircle } from "lucide-react-native";

export default function DriverEarning() {
  const { colors } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>Earnings</Text>

        {/* Wallet Card */}
        <View style={[styles.walletCard, { backgroundColor: colors.card }]}>
          <View style={styles.walletRow}>
            <Wallet color={colors.primary} size={26} />
            <Text style={[styles.walletText, { color: colors.text }]}>
              Wallet Balance
            </Text>
          </View>

          <Text style={[styles.balance, { color: colors.text }]}>
            ETB 4,850.00
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <SummaryCard label="Today" value="ETB 650" />
          <SummaryCard label="This Week" value="ETB 2,150" />
          <SummaryCard label="This Month" value="ETB 4,850" />
        </View>

        {/* Recent Activity */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Trips
        </Text>

        <View style={[styles.tripItem, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text }}>Trip #1245</Text>
          <Text style={{ color: colors.success }}>+ ETB 120</Text>
        </View>

        <View style={[styles.tripItem, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text }}>Trip #1244</Text>
          <Text style={{ color: colors.success }}>+ ETB 200</Text>
        </View>

        {/* Spacer so content doesn't touch withdraw button */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Withdraw Button (ABOVE Bottom Tabs) */}
      <View
        style={[
          styles.withdrawContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <TouchableOpacity
          style={[styles.withdrawBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <ArrowDownCircle color="#fff" size={20} />
          <Text style={styles.withdrawText}>Request Payout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ================= COMPONENT ================= */

function SummaryCard({ label, value }: { label: string; value: string }) {
  const { colors } = useThemeContext();

  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
      <Text
        style={{
          color: colors.primary,
          fontWeight: "600",
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
        {value}
      </Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 20,
    paddingTop: 24
  },

  walletCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },

  walletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  walletText: {
    fontSize: 16,
    fontWeight: "600",
  },

  balance: {
    fontSize: 30,
    fontWeight: "800",
    marginTop: 12,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  summaryCard: {
    width: "31%",
    padding: 14,
    borderRadius: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  tripItem: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  withdrawContainer: {
    position: "absolute",
    bottom: 94, // ✅ ABOVE bottom tab bar
    left: 16,
    right: 16,
  },

  withdrawBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 4,
  },

  withdrawText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
