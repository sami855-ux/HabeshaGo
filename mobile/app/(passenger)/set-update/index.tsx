"use client"

import { useThemeContext } from "@/context/ThemeContext"
import * as ImagePicker from "expo-image-picker"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import {
  Award,
  Calendar,
  Camera,
  CheckCircle,
  ChevronLeft,
  Globe,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  Upload,
  User,
  Zap,
} from "lucide-react-native"
import React, { useEffect, useState } from "react"
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

export default function ProfileSetupPage() {
  const router = useRouter()
  const { colors, actualTheme } = useThemeContext()
  const statusBarStyle =
    actualTheme === "dark" ? "light-content" : "dark-content"

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    bio: "",
    profileImage: null as string | null,
  })

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedGender, setSelectedGender] = useState("")

  // Calculate form completion progress
  useEffect(() => {
    const fields = Object.values(formData)
    const completedFields = fields.filter((field) =>
      typeof field === "string" ? field.trim().length > 0 : field !== null
    ).length
    setProgress(Math.round((completedFields / fields.length) * 100))
  }, [formData])

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow access to your photos")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled) {
        setFormData({ ...formData, profileImage: result.assets[0].uri })
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image")
      console.error(error)
    }
  }

  const handleSave = async () => {
    // Validation
    if (!formData.fullName.trim()) {
      Alert.alert("Error", "Please enter your full name")
      return
    }

    if (!formData.email.trim()) {
      Alert.alert("Error", "Please enter your email")
      return
    }

    if (!formData.phone.trim()) {
      Alert.alert("Error", "Please enter your phone number")
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      Alert.alert("🎉 Success!", "Your profile has been saved successfully!", [
        {
          text: "Continue",
          onPress: () => router.back(),
        },
      ])
    } catch (error) {
      Alert.alert("Error", "Failed to save profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    {
      icon: <Shield size={20} color={colors.success} />,
      title: "Enhanced Security",
      description: "Verified accounts get priority protection",
    },
    {
      icon: <Award size={20} color="#F59E0B" />,
      title: "Exclusive Rewards",
      description: "Earn badges and special offers",
    },
    {
      icon: <Zap size={20} color="#3B82F6" />,
      title: "Faster Access",
      description: "Quick verification for transactions",
    },
    {
      icon: <Globe size={20} color="#8B5CF6" />,
      title: "Global Features",
      description: "Access to international services",
    },
  ]

  // Dynamic styles based on theme
  const styles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerBg: {
      backgroundColor: colors.background,
    },
    headerText: {
      color: colors.text,
    },
    subheaderText: {
      color: colors.mutedText,
    },
    progressBg: {
      backgroundColor: actualTheme === "dark" ? "#374151" : "#E5E7EB",
    },
    progressFill: {
      backgroundColor: colors.primary,
    },
    progressText: {
      color: colors.mutedText,
    },
    profileBorder: {
      borderColor: colors.background,
    },
    cameraBg: {
      backgroundColor: actualTheme === "dark" ? "#1F2937" : "#FFFFFF",
      borderColor: actualTheme === "dark" ? "#374151" : "#E5E7EB",
    },
    uploadButton: {
      backgroundColor: actualTheme === "dark" ? "#1F2937" : "#F3F4F6",
    },
    uploadText: {
      color: colors.text,
    },
    benefitsCard: {
      backgroundColor: actualTheme === "dark" ? "#1F2937" : "#EFF6FF",
      borderColor: actualTheme === "dark" ? "#374151" : "#DBEAFE",
    },
    benefitsTitle: {
      color: colors.text,
    },
    benefitTitle: {
      color: colors.text,
    },
    benefitDesc: {
      color: colors.mutedText,
    },
    labelText: {
      color: colors.text,
    },
    inputContainer: {
      backgroundColor: actualTheme === "dark" ? "#1F2937" : "#F9FAFB",
      borderColor: actualTheme === "dark" ? "#374151" : "#D1D5DB",
    },
    inputText: {
      color: colors.text,
    },
    genderButton: {
      backgroundColor: actualTheme === "dark" ? "#1F2937" : "#FEF3C7",
      borderColor: actualTheme === "dark" ? "#4B5563" : "#FDE68A",
    },
    genderButtonSelected: {
      backgroundColor: actualTheme === "dark" ? "#7C2D12" : "#FFEDD5",
      borderColor: colors.primary,
    },
    genderText: {
      color: actualTheme === "dark" ? "#D1D5DB" : "#78350F",
    },
    genderTextSelected: {
      color: colors.primary,
    },
    bioCounter: {
      color: colors.mutedText,
    },
    securityCard: {
      backgroundColor: actualTheme === "dark" ? "#1E3A8A" : "#DBEAFE",
      borderColor: actualTheme === "dark" ? "#1E40AF" : "#93C5FD",
    },
    securityTitle: {
      color: colors.text,
    },
    securityText: {
      color: colors.mutedText,
    },
    footerBorder: {
      borderTopColor: colors.border,
    },
  }

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={statusBarStyle}
      />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 16,
            ...styles.headerBg,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: actualTheme === "dark" ? "#1F2937" : "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <ChevronLeft size={24} color={colors.icon} />
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  ...styles.headerText,
                }}
              >
                Complete Profile
              </Text>
              <Text
                style={{ fontSize: 16, marginTop: 8, ...styles.subheaderText }}
              >
                Let's personalize your experience
              </Text>
            </View>

            <View
              style={{
                backgroundColor: actualTheme === "dark" ? "#7C2D12" : "#FFEDD5",
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  color: actualTheme === "dark" ? "#FBBF24" : "#92400E",
                  fontWeight: "bold",
                  fontSize: 14,
                }}
              >
                {progress}%
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View
            style={{
              height: 8,
              borderRadius: 4,
              overflow: "hidden",
              marginBottom: 4,
              ...styles.progressBg,
            }}
          >
            <View
              style={{
                height: "100%",
                borderRadius: 4,
                ...styles.progressFill,
              }}
              style={{ width: `${progress}%` }}
            />
          </View>
          <Text
            style={{ fontSize: 12, textAlign: "right", ...styles.progressText }}
          >
            {progress}% complete
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Profile Picture Section */}
          <View
            style={{
              alignItems: "center",
              paddingHorizontal: 24,
              marginBottom: 32,
            }}
          >
            <TouchableOpacity
              onPress={pickImage}
              style={{ position: "relative" }}
              activeOpacity={0.8}
            >
              <View
                style={{
                  width: 128,
                  height: 128,
                  borderRadius: 64,
                  overflow: "hidden",
                  borderWidth: 4,
                  borderColor: colors.background,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
                {formData.profileImage ? (
                  <Image
                    source={{ uri: formData.profileImage }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={["#FBBF24", "#F59E0B"]}
                    style={{
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <User size={48} color="white" />
                  </LinearGradient>
                )}
              </View>

              <View
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  width: 40,
                  height: 40,
                  backgroundColor:
                    actualTheme === "dark" ? "#1F2937" : "#FFFFFF",
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: actualTheme === "dark" ? "#374151" : "#E5E7EB",
                }}
              >
                <Camera size={18} color={colors.icon} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickImage}
              style={{
                marginTop: 16,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: actualTheme === "dark" ? "#1F2937" : "#F3F4F6",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Upload
                size={16}
                color={colors.icon}
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {formData.profileImage ? "Change Photo" : "Upload Photo"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={{ paddingHorizontal: 24 }}>
            {/* Full Name */}
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <User
                  size={18}
                  color={colors.icon}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ fontWeight: "600", color: colors.text }}>
                  Full Name *
                </Text>
              </View>
              <TextInput
                value={formData.fullName}
                onChangeText={(text) =>
                  setFormData({ ...formData, fullName: text })
                }
                placeholder="Enter your full name"
                placeholderTextColor={colors.mutedText}
                style={{
                  width: "100%",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor:
                    actualTheme === "dark" ? "#1F2937" : "#F9FAFB",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: actualTheme === "dark" ? "#374151" : "#D1D5DB",
                  color: colors.text,
                  fontSize: 16,
                }}
              />
            </View>

            {/* Email */}
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Mail
                  size={18}
                  color={colors.icon}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ fontWeight: "600", color: colors.text }}>
                  Email Address *
                </Text>
              </View>
              <TextInput
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                placeholder="Enter your email"
                placeholderTextColor={colors.mutedText}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  width: "100%",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor:
                    actualTheme === "dark" ? "#1F2937" : "#F9FAFB",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: actualTheme === "dark" ? "#374151" : "#D1D5DB",
                  color: colors.text,
                  fontSize: 16,
                }}
              />
            </View>

            {/* Phone */}
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Phone
                  size={18}
                  color={colors.icon}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ fontWeight: "600", color: colors.text }}>
                  Phone Number *
                </Text>
              </View>
              <TextInput
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                placeholder="Enter your phone number"
                placeholderTextColor={colors.mutedText}
                keyboardType="phone-pad"
                style={{
                  width: "100%",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor:
                    actualTheme === "dark" ? "#1F2937" : "#F9FAFB",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: actualTheme === "dark" ? "#374151" : "#D1D5DB",
                  color: colors.text,
                  fontSize: 16,
                }}
              />
            </View>

            {/* Address */}
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <MapPin
                  size={18}
                  color={colors.icon}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ fontWeight: "600", color: colors.text }}>
                  Address
                </Text>
              </View>
              <TextInput
                value={formData.address}
                onChangeText={(text) =>
                  setFormData({ ...formData, address: text })
                }
                placeholder="Enter your address"
                placeholderTextColor={colors.mutedText}
                multiline
                numberOfLines={3}
                style={{
                  width: "100%",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor:
                    actualTheme === "dark" ? "#1F2937" : "#F9FAFB",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: actualTheme === "dark" ? "#374151" : "#D1D5DB",
                  color: colors.text,
                  fontSize: 16,
                  minHeight: 100,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Date of Birth */}
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Calendar
                  size={18}
                  color={colors.icon}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ fontWeight: "600", color: colors.text }}>
                  Date of Birth
                </Text>
              </View>
              <TextInput
                value={formData.dateOfBirth}
                onChangeText={(text) =>
                  setFormData({ ...formData, dateOfBirth: text })
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.mutedText}
                style={{
                  width: "100%",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor:
                    actualTheme === "dark" ? "#1F2937" : "#F9FAFB",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: actualTheme === "dark" ? "#374151" : "#D1D5DB",
                  color: colors.text,
                  fontSize: 16,
                }}
              />
            </View>

            {/* Gender Selection */}
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Gender
              </Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                {["Male", "Female", "Prefer not to say"].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    onPress={() => setSelectedGender(gender)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      borderWidth: 2,
                      alignItems: "center",
                      ...(selectedGender === gender
                        ? {
                            backgroundColor:
                              actualTheme === "dark" ? "#7C2D12" : "#FFEDD5",
                            borderColor: colors.primary,
                          }
                        : {
                            backgroundColor:
                              actualTheme === "dark" ? "#1F2937" : "#FEF3C7",
                            borderColor:
                              actualTheme === "dark" ? "#4B5563" : "#FDE68A",
                          }),
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "500",
                        fontSize: 14,
                        ...(selectedGender === gender
                          ? { color: colors.primary }
                          : {
                              color:
                                actualTheme === "dark" ? "#D1D5DB" : "#78350F",
                            }),
                      }}
                    >
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bio */}
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Bio (Optional)
              </Text>
              <TextInput
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                placeholder="Tell us about yourself..."
                placeholderTextColor={colors.mutedText}
                multiline
                numberOfLines={4}
                style={{
                  width: "100%",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor:
                    actualTheme === "dark" ? "#1F2937" : "#F9FAFB",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: actualTheme === "dark" ? "#374151" : "#D1D5DB",
                  color: colors.text,
                  fontSize: 16,
                  minHeight: 120,
                  textAlignVertical: "top",
                }}
                maxLength={200}
              />
              <Text
                style={{
                  textAlign: "right",
                  fontSize: 12,
                  marginTop: 4,
                  color: colors.mutedText,
                }}
              >
                {formData.bio.length}/200 characters
              </Text>
            </View>

            {/* Security Notice */}
            <View
              style={{
                backgroundColor: actualTheme === "dark" ? "#1E3A8A" : "#DBEAFE",
                borderRadius: 12,
                padding: 16,
                marginBottom: 32,
                borderWidth: 1,
                borderColor: actualTheme === "dark" ? "#1E40AF" : "#93C5FD",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Lock
                  size={18}
                  color="#3B82F6"
                  style={{ marginRight: 12, marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontWeight: "600",
                      color: colors.text,
                      marginBottom: 4,
                    }}
                  >
                    Your data is secure
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.mutedText }}>
                    We use end-to-end encryption to protect your personal
                    information. Your data will only be used to enhance your
                    experience.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingBottom: 24,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={{
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: loading ? "#9CA3AF" : colors.primary,
              opacity: loading ? 0.7 : 1,
            }}
            activeOpacity={0.9}
          >
            {loading ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderWidth: 2,
                    borderColor: "rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: 10,
                    marginRight: 12,
                  }}
                />
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 18 }}
                >
                  Saving...
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <CheckCircle
                  size={20}
                  color="white"
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 18 }}
                >
                  Save Profile
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Text
            style={{
              textAlign: "center",
              fontSize: 14,
              marginTop: 16,
              color: colors.mutedText,
            }}
          >
            You can update your profile anytime in Settings
          </Text>
        </View>
      </SafeAreaView>
    </>
  )
}
