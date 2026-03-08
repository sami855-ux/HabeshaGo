"use client"

import { useUser } from "@/context/user-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { ArrowRight, Gift, Shield, Star, X, Zap } from "lucide-react-native"
import React from "react"
import { Dimensions, Modal, Text, TouchableOpacity, View } from "react-native"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

export default function ProfileCompletionModal() {
  const router = useRouter()
  const { showProfileModal, setShowProfileModal } = useUser()

  const handleCompleteNow = () => {
    setShowProfileModal(false)
    router.push("/(passenger)/set-update")
  }

  const handleSkip = () => {
    setShowProfileModal(false)
  }

  // Styles
  const styles = {
    modalBackground: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },
    modalContainer: {
      width: "100%",
      maxWidth: 380,
      maxHeight: "98%",
      backgroundColor: "#ffffff",
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
    headerGradient: {
      paddingTop: 40,
      paddingBottom: 24,
      paddingHorizontal: 24,
      alignItems: "center",
    },
    iconContainer: {
      width: 96,
      height: 96,
      backgroundColor: "rgba(255,255,255,0.2)",
      backdropFilter: "blur(10px)",
      borderRadius: 48,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 4,
      borderColor: "rgba(255,255,255,0.3)",
      marginBottom: 16,
    },
    innerIcon: {
      width: 80,
      height: 80,
      backgroundColor: "#ffffff",
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#ffffff",
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 18,
      color: "rgba(255,255,255,0.9)",
      textAlign: "center",
    },
    contentContainer: {
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    statsCard: {
      backgroundColor: "#fef3c7",
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: "#fde68a",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#d97706",
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: "#92400e",
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#1f2937",
      textAlign: "center",
      marginBottom: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    featuresGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 32,
    },
    featureCard: {
      width: "48%",
      backgroundColor: "#fffbeb",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#fef3c7",
      alignItems: "center",
    },
    featureIcon: {
      marginBottom: 12,
    },
    featureText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#78350f",
      textAlign: "center",
    },
    benefitItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    benefitIcon: {
      marginRight: 12,
      marginTop: 2,
    },
    benefitText: {
      fontSize: 16,
      color: "#374151",
      flex: 1,
    },
    testimonialCard: {
      backgroundColor: "#eff6ff",
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: "#dbeafe",
    },
    quoteMark: {
      fontSize: 32,
      color: "#9ca3af",
      marginBottom: 8,
    },
    testimonialText: {
      fontSize: 16,
      color: "#374151",
      fontStyle: "italic",
      marginBottom: 16,
    },
    testimonialAuthor: {
      flexDirection: "row",
      alignItems: "center",
    },
    authorAvatar: {
      width: 40,
      height: 40,
      backgroundColor: "#f97316",
      borderRadius: 20,
      marginRight: 12,
    },
    authorName: {
      fontSize: 16,
      fontWeight: "600",
      color: "#111827",
    },
    authorRole: {
      fontSize: 14,
      color: "#6b7280",
    },
    buttonContainer: {
      paddingHorizontal: 24,
      paddingBottom: 24,
      paddingTop: 16,
    },
    primaryButton: {
      borderRadius: 16,
      paddingVertical: 20,
      paddingHorizontal: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      shadowColor: "#f97316",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    primaryButtonText: {
      fontSize: 17,
      color: "#ffffff",
      marginRight: 12,
    },
    secondaryButton: {
      paddingVertical: 16,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: "#d1d5db",
      alignItems: "center",
      marginBottom: 16,
    },
    secondaryButtonText: {
      fontSize: 16,
      color: "#6b7280",
    },
    helpText: {
      fontSize: 14,
      color: "#9ca3af",
      textAlign: "center",
    },
    closeButton: {
      position: "absolute",
      top: 16,
      right: 16,
      width: 40,
      height: 40,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    floatingBadge: {
      position: "absolute",
      bottom: -12,
      left: "50%",
      transform: [{ translateX: -50 }],
      backgroundColor: "#f97316",
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    badgeText: {
      color: "#ffffff",
      fontWeight: "bold",
      fontSize: 12,
    },
  }

  const features = [
    { icon: <Shield size={24} color="#d97706" />, text: "Enhanced Security" },
    { icon: <Gift size={24} color="#d97706" />, text: "Personalized Offers" },
    { icon: <Zap size={24} color="#d97706" />, text: "Faster Access" },
    { icon: <Star size={24} color="#d97706" />, text: "Premium Features" },
  ]

  const benefits = [
    "Get personalized recommendations",
    "Unlock premium features",
    "Earn rewards and badges",
    "Join exclusive events",
    "Priority customer support",
  ]

  return (
    <Modal
      visible={showProfileModal}
      animationType="fade"
      transparent={true}
      onRequestClose={handleSkip}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {/* Header with Gradient */}
          <LinearGradient
            colors={["#f97316", "#fb923c", "#fdba74"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            {/* Floating Badge */}
            <View style={styles.floatingBadge}>
              <Text style={styles.badgeText}>2 MIN SETUP</Text>
            </View>

            {/* Main Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.innerIcon}>
                <Zap size={48} color="#f97316" />
              </View>
            </View>

            {/* Titles */}
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Unlock the full experience</Text>
          </LinearGradient>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {/* Primary Button */}
            <TouchableOpacity onPress={handleCompleteNow} className="mt-4">
              <LinearGradient
                colors={["#f97316", "#ea580c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText} className="font-geist">
                  Complete Profile Now
                </Text>
                <ArrowRight size={24} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Secondary Button */}
            <TouchableOpacity
              onPress={handleSkip}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText} className="font-geist">
                I'll do it later
              </Text>
            </TouchableOpacity>

            {/* Help Text */}
            <Text style={styles.helpText}>
              Takes only 2 minutes • Your data is secure
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity onPress={handleSkip} style={styles.closeButton}>
            <X size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
