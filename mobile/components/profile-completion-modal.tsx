import { useAppSelector } from "@/store"
import { useThemeContext } from "@/context/ThemeContext"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useState, useEffect } from "react"
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native"

const { height } = Dimensions.get("window")

type StepKey = "name" | "email" | "phone" | "emailVerified" | "phoneVerified"

interface Step {
  key: StepKey
  label: string
  description: string
  icon: keyof typeof Ionicons.glyphMap
  action: string
  route: string
}

const STEPS: Step[] = [
  {
    key: "name",
    label: "Add your name",
    description: "Let others know who you are.",
    icon: "person-outline",
    action: "Add Name",
    route: "/(passenger)/profile/edit",
  },
  {
    key: "email",
    label: "Add your email",
    description: "Required for account security and receipts.",
    icon: "mail-outline",
    action: "Add Email",
    route: "/(passenger)/profile",
  },
  {
    key: "phone",
    label: "Add your phone",
    description: "Needed for booking confirmations.",
    icon: "call-outline",
    action: "Add Phone",
    route: "/(passenger)/profile",
  },
  {
    key: "emailVerified",
    label: "Verify your email",
    description: "Confirm ownership of your email address.",
    icon: "checkmark-circle-outline",
    action: "Verify Email",
    route: "/(passenger)/profile",
  },
  {
    key: "phoneVerified",
    label: "Verify your phone",
    description: "Confirm your phone number via OTP.",
    icon: "shield-checkmark-outline",
    action: "Verify Phone",
    route: "/(passenger)/profile",
  },
]

/**
 * Returns incomplete steps for the user.
 * emailVerified / phoneVerified steps only appear if the underlying
 * email / phone value already exists (no point verifying nothing).
 */
function getIncompleteSteps(user: {
  name: string | null
  email: string | null
  phone: string | null
  emailVerified: boolean
  phoneVerified: boolean
}) {
  return STEPS.filter((step) => {
    if (step.key === "name") return !user.name
    if (step.key === "email") return !user.email
    if (step.key === "phone") return !user.phone
    if (step.key === "emailVerified") return !!user.email && !user.emailVerified
    if (step.key === "phoneVerified") return !!user.phone && !user.phoneVerified
    return false
  })
}

const ProfileCompletionModal = () => {
  const { user } = useAppSelector((state) => state.user)
  const { colors, actualTheme } = useThemeContext()
  const router = useRouter()

  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const slideAnim = useState(new Animated.Value(height))[0]

  const incompleteSteps = user ? getIncompleteSteps(user) : []
  const totalSteps = STEPS.length
  const completedCount = totalSteps - incompleteSteps.length
  const completionPercent = Math.round((completedCount / totalSteps) * 100)
  const isFullyComplete = incompleteSteps.length === 0

  useEffect(() => {
    // Show the modal only when profile is incomplete and user hasn't dismissed it
    if (!isFullyComplete && !dismissed) {
      setVisible(true)
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start()
    }
  }, [isFullyComplete, dismissed])

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false)
      setDismissed(true)
    })
  }

  const handleAction = (route: string) => {
    handleDismiss()
    router.push(route as never)
  }

  if (isFullyComplete || !visible) return null

  const gradientColors: [string, string] =
    actualTheme === "dark" ? ["#FFB300", "#FF6F00"] : ["#ea580c", "#f97316"]

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleDismiss}
    >
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleDismiss}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          // Prevent backdrop tap from closing when tapping the sheet
        >
          <TouchableOpacity activeOpacity={1}>
            <View
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                paddingBottom: 40,
                maxHeight: height * 0.82,
              }}
            >
              {/* Handle bar */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.border ?? "#ccc",
                  alignSelf: "center",
                  marginTop: 12,
                  marginBottom: 20,
                }}
              />

              {/* Header */}
              <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: "800",
                        color: colors.text,
                        marginBottom: 4,
                      }}
                    >
                      Complete your profile
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.icon ?? "#888",
                        lineHeight: 20,
                      }}
                    >
                      {incompleteSteps.length} step
                      {incompleteSteps.length !== 1 ? "s" : ""} remaining to
                      unlock the full experience.
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleDismiss}>
                    <Ionicons
                      name="close-circle"
                      size={28}
                      color={colors.icon ?? "#888"}
                    />
                  </TouchableOpacity>
                </View>

                {/* Progress bar */}
                <View style={{ marginTop: 16 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.icon ?? "#888",
                        fontWeight: "600",
                      }}
                    >
                      {completedCount}/{totalSteps} complete
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: gradientColors[0],
                        fontWeight: "700",
                      }}
                    >
                      {completionPercent}%
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 8,
                      backgroundColor: actualTheme === "dark" ? "#333" : "#eee",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <LinearGradient
                      colors={gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        height: "100%",
                        width: `${completionPercent}%`,
                        borderRadius: 4,
                      }}
                    />
                  </View>
                </View>
              </View>

              {/* Steps list */}
              <View style={{ paddingHorizontal: 24, gap: 12 }}>
                {incompleteSteps.map((step, index) => (
                  <View
                    key={step.key}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor:
                        actualTheme === "dark" ? "#1a1a1a" : "#f9f9f9",
                      borderRadius: 16,
                      padding: 14,
                      borderWidth: 1,
                      borderColor:
                        actualTheme === "dark" ? "#2a2a2a" : "#efefef",
                    }}
                  >
                    {/* Icon bubble */}
                    <LinearGradient
                      colors={gradientColors}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Ionicons name={step.icon} size={20} color="#fff" />
                    </LinearGradient>

                    {/* Text */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "700",
                          color: colors.text,
                          marginBottom: 2,
                        }}
                      >
                        {step.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.icon ?? "#888",
                        }}
                      >
                        {step.description}
                      </Text>
                    </View>

                    {/* CTA */}
                    <TouchableOpacity
                      onPress={() => handleAction(step.route)}
                      style={{
                        backgroundColor: gradientColors[0],
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 10,
                        marginLeft: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: "700",
                        }}
                      >
                        {step.action}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Dismiss link */}
              <TouchableOpacity
                onPress={handleDismiss}
                style={{ alignItems: "center", marginTop: 20 }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.icon ?? "#999",
                    textDecorationLine: "underline",
                  }}
                >
                  Remind me later
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  )
}

export default ProfileCompletionModal
