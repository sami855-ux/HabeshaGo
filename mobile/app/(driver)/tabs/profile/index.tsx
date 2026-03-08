import { useThemeContext } from "@/context/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"

export default function DriverAccount() {
  const { colors } = useThemeContext()

  // Mock data (later from API)
  const driver = {
    name: "Samuel Tale",
    role: "Driver",
    license: "DL-ETH-29384",
    experience: "5 Years",
    busNumber: "AB-4567",
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE */}
        <View
          style={{
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Ionicons
            name="person-circle"
            size={90}
            color={colors.primary}
          />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colors.text,
              marginTop: 8,
            }}
          >
            {driver.name}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.mutedText,
              marginTop: 4,
            }}
          >
            {driver.role}
          </Text>
        </View>

        {/* INFO */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
          }}
        >
          <InfoRow label="License Number" value={driver.license} />
          <InfoRow label="Experience" value={driver.experience} />
          <InfoRow label="Assigned Bus" value={driver.busNumber} />
        </View>

        {/* ACTIONS */}
        <View style={{ marginTop: 32 }}>
          <ActionButton
            icon="settings-outline"
            label="Settings"
            color={colors.text}
          />
          <ActionButton
            icon="log-out-outline"
            label="Logout"
            color={colors.error}
          />
        </View>
      </ScrollView>
    </View>
  )
}

/* ---------------- HELPERS ---------------- */

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useThemeContext()

  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          fontSize: 13,
          color: colors.mutedText,
          marginBottom: 2,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: colors.text,
        }}
      >
        {value}
      </Text>
    </View>
  )
}

function ActionButton({
  icon,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  color: string
}) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
      }}
    >
      <Ionicons name={icon} size={20} color={color} />
      <Text
        style={{
          marginLeft: 12,
          fontSize: 15,
          fontWeight: "600",
          color,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}
