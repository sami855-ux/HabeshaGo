// EditProfileScreen.tsx
import { useThemeContext } from "@/context/ThemeContext"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as ImagePicker from "expo-image-picker"
import {
  Camera,
  Check,
  ChevronRight,
  Edit2,
  Globe,
  Info,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Upload,
  User,
  X,
} from "lucide-react-native"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

interface ProfileData {
  name: string
  email: string
  phone: string
  location: string
  website: string
  bio: string
  avatarUri: string | null
}

// Show Toast function
const showToast = (message: string, duration: number = ToastAndroid.SHORT) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, duration)
  } else {
    Alert.alert("Info", message)
  }
}

const EditProfileScreen: React.FC = () => {
  const { colors, actualTheme } = useThemeContext()

  // Profile state
  const [profile, setProfile] = useState<ProfileData>({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "alexjohnson.design",
    bio: "Product designer passionate about creating beautiful, functional interfaces. Coffee enthusiast ☕️",
    avatarUri: null,
  })

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [tempAvatar, setTempAvatar] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load profile on mount
  useEffect(() => {
    loadProfile()
  }, [])

  // Check for unsaved changes
  useEffect(() => {
    const initialProfile = {
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      website: "alexjohnson.design",
      bio: "Product designer passionate about creating beautiful, functional interfaces. Coffee enthusiast ☕️",
      avatarUri: null,
    }

    const hasChanges =
      JSON.stringify(profile) !== JSON.stringify(initialProfile)
    setHasUnsavedChanges(hasChanges)
  }, [profile])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const savedProfile = await AsyncStorage.getItem("userProfile")
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Pick image from gallery
  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to upload photos.",
          [{ text: "OK" }]
        )
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setTempAvatar(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      showToast("Failed to pick image. Please try again.")
    }
  }

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera permissions to take photos.",
          [{ text: "OK" }]
        )
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setTempAvatar(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error taking photo:", error)
      showToast("Failed to take photo. Please try again.")
    }
  }

  // Save profile image
  const saveProfileImage = () => {
    if (tempAvatar) {
      setProfile((prev) => ({ ...prev, avatarUri: tempAvatar }))
      showToast("Profile photo updated")
    }
    setShowImageModal(false)
    setTempAvatar(null)
  }

  // Save profile
  const saveProfile = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      await AsyncStorage.setItem("userProfile", JSON.stringify(profile))
      setIsSaving(false)
      showToast("Profile updated successfully!")
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error("Error saving profile:", error)
      setIsSaving(false)
      showToast("Failed to save profile. Please try again.")
    }
  }

  // Reset changes
  const resetChanges = () => {
    if (!hasUnsavedChanges) return

    Alert.alert(
      "Reset Changes",
      "Are you sure you want to discard all changes?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            // Reset to initial state
            setProfile({
              name: "Alex Johnson",
              email: "alex.johnson@example.com",
              phone: "+1 (555) 123-4567",
              location: "San Francisco, CA",
              website: "alexjohnson.design",
              bio: "Product designer passionate about creating beautiful, functional interfaces. Coffee enthusiast ☕️",
              avatarUri: null,
            })
            showToast("Changes reset")
          },
        },
      ]
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            className="mt-4 text-base font-medium font-geist"
            style={{ color: colors.text }}
          >
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header with Large Title - Consistent with Biometric Page */}
        <View className="px-5 pt-6 pb-4">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1">
              <Text
                className="text-2xl font-groteskBold"
                style={{ color: colors.text }}
              >
                Edit Profile
              </Text>
              <Text
                className="text-base mt-2 font-geist"
                style={{ color: colors.mutedText }}
              >
                Update your personal information and profile picture
              </Text>
            </View>
          </View>
        </View>

        {/* Profile Image Card - Consistent Styling */}
        <View className="px-5 mb-6">
          <View
            className="rounded-2xl p-5 border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
          >
            <View className="items-center">
              <TouchableOpacity
                onPress={() => setShowImageModal(true)}
                className="relative"
                activeOpacity={0.8}
              >
                <View
                  className="w-28 h-28 rounded-full border-4 overflow-hidden"
                  style={{
                    backgroundColor: `${colors.primary}10`,
                    borderColor: colors.card,
                  }}
                >
                  {profile.avatarUri ? (
                    <Image
                      source={{ uri: profile.avatarUri }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="flex-1 items-center justify-center">
                      <User size={48} color={colors.mutedText} />
                    </View>
                  )}

                  {/* Edit overlay */}
                  <View
                    className="absolute inset-0 items-center justify-center"
                    style={{ backgroundColor: "#00000040" }}
                  >
                    <Edit2 size={24} color="#FFFFFF" />
                  </View>
                </View>

                {/* Camera badge */}
                <View
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full items-center justify-center border-2"
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.background,
                  }}
                >
                  <Camera size={16} color={colors.primary} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowImageModal(true)}
                className="mt-4 p-3.5 rounded-xl active:opacity-80"
                style={{ backgroundColor: `${colors.border}20` }}
              >
                <View className="flex-row items-center">
                  <Upload size={16} color={colors.primary} className="mr-2" />
                  <Text
                    className="font-medium text-sm font-geist ml-2"
                    style={{ color: colors.primary }}
                  >
                    Change Profile Photo
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Form Section - Consistent with Biometric Page */}
        <View className="mb-8">
          {/* Section Header */}
          <View className="px-5 mb-3">
            <Text
              className="text-xs font-semibold font-groteskBold uppercase tracking-wider"
              style={{ color: colors.mutedText }}
            >
              Personal Information
            </Text>
          </View>

          {/* Form Container */}
          <View
            className="rounded-2xl mx-5 border overflow-hidden"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
          >
            {/* Name Field */}
            <View
              className="px-4 py-3.5"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: `${colors.border}80`,
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: `${colors.primary}10` }}
                >
                  <User size={18} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-medium mb-1 font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    Full Name
                  </Text>
                  <TextInput
                    value={profile.name}
                    onChangeText={(text) =>
                      setProfile((prev) => ({ ...prev, name: text }))
                    }
                    className="text-base font-geist"
                    style={{ color: colors.text }}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.mutedText}
                  />
                </View>
              </View>
            </View>

            {/* Email Field */}
            <View
              className="px-4 py-3.5"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: `${colors.border}80`,
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: `#3b82f620` }}
                >
                  <Mail size={18} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-medium mb-1 font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    Email Address
                  </Text>
                  <TextInput
                    value={profile.email}
                    onChangeText={(text) =>
                      setProfile((prev) => ({ ...prev, email: text }))
                    }
                    className="text-base font-geist"
                    style={{ color: colors.text }}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.mutedText}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            {/* Phone Field */}
            <View
              className="px-4 py-3.5"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: `${colors.border}80`,
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: `#10b98120` }}
                >
                  <Phone size={18} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-medium mb-1 font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    Phone Number
                  </Text>
                  <TextInput
                    value={profile.phone}
                    onChangeText={(text) =>
                      setProfile((prev) => ({ ...prev, phone: text }))
                    }
                    className="text-base font-geist"
                    style={{ color: colors.text }}
                    placeholder="Enter your phone number"
                    placeholderTextColor={colors.mutedText}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            {/* Location Field */}
            <View
              className="px-4 py-3.5"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: `${colors.border}80`,
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: `#8b5cf620` }}
                >
                  <MapPin size={18} color="#8b5cf6" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-medium mb-1 font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    Location
                  </Text>
                  <TextInput
                    value={profile.location}
                    onChangeText={(text) =>
                      setProfile((prev) => ({ ...prev, location: text }))
                    }
                    className="text-base font-geist"
                    style={{ color: colors.text }}
                    placeholder="Enter your location"
                    placeholderTextColor={colors.mutedText}
                  />
                </View>
              </View>
            </View>

            {/* Website Field */}
            <View
              className="px-4 py-3.5"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: `${colors.border}80`,
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: `#f59e0b20` }}
                >
                  <Globe size={18} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-medium mb-1 font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    Website
                  </Text>
                  <TextInput
                    value={profile.website}
                    onChangeText={(text) =>
                      setProfile((prev) => ({ ...prev, website: text }))
                    }
                    className="text-base font-geist"
                    style={{ color: colors.text }}
                    placeholder="Enter your website"
                    placeholderTextColor={colors.mutedText}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            {/* Bio Field */}
            <View className="px-4 py-3.5">
              <View className="flex-row items-start">
                <View
                  className="w-10 h-10 rounded-lg items-center justify-center mr-3 mt-1"
                  style={{ backgroundColor: `${colors.success}20` }}
                >
                  <ShieldCheck size={18} color={colors.success} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-medium mb-1 font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    Bio
                  </Text>
                  <TextInput
                    value={profile.bio}
                    onChangeText={(text) =>
                      setProfile((prev) => ({ ...prev, bio: text }))
                    }
                    className="text-base min-h-[80px] font-geist"
                    style={{ color: colors.text }}
                    placeholder="Tell us about yourself..."
                    placeholderTextColor={colors.mutedText}
                    multiline
                    textAlignVertical="top"
                  />
                  <View className="flex-row justify-between items-center mt-2">
                    <Text
                      className="text-xs font-geist"
                      style={{ color: colors.mutedText }}
                    >
                      Brief introduction
                    </Text>
                    <Text
                      className="text-xs font-geist"
                      style={{
                        color:
                          profile.bio.length > 200
                            ? colors.error
                            : colors.mutedText,
                      }}
                    >
                      {profile.bio.length}/200
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-5 mb-8">
          <View className="flex-row gap-3">
            {/* Reset Button */}
            <TouchableOpacity
              onPress={resetChanges}
              disabled={!hasUnsavedChanges}
              className="flex-1 rounded-xl py-3.5 border items-center justify-center"
              style={{
                borderColor: colors.border,
                opacity: hasUnsavedChanges ? 1 : 0.5,
              }}
            >
              <Text
                className="font-medium font-geist"
                style={{ color: colors.text }}
              >
                Reset
              </Text>
            </TouchableOpacity>

            {/* Save Button */}
            <TouchableOpacity
              onPress={saveProfile}
              disabled={isSaving || !hasUnsavedChanges}
              className="flex-1 rounded-xl font-geist py-3.5 items-center justify-center"
              style={{
                backgroundColor: hasUnsavedChanges
                  ? colors.primary
                  : `${colors.mutedText}30`,
                opacity: isSaving || !hasUnsavedChanges ? 0.7 : 1,
              }}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold font-geist">
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Information Section */}
        <View className="mb-8">
          <View className="px-5 mb-3">
            <Text
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: colors.mutedText }}
            >
              Privacy & Security
            </Text>
          </View>

          <View
            className="rounded-2xl mx-5 border overflow-hidden"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
          >
            <View className="px-4 py-3.5">
              <View className="flex-row items-center">
                <Info size={16} color={colors.primary} className="mr-3" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm" style={{ color: colors.mutedText }}>
                    Your information is securely stored and never shared with
                    third parties.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Image Upload Modal - Enhanced */}
      <Modal
        visible={showImageModal}
        animationType="slide"
        transparent
        statusBarTranslucent
      >
        <View className="flex-1 justify-end">
          <View
            className="absolute inset-0"
            style={{ backgroundColor: "#00000080" }}
            onTouchEnd={() => {
              setShowImageModal(false)
              setTempAvatar(null)
            }}
          />

          <View
            className="rounded-t-3xl p-6 pb-8"
            style={{
              backgroundColor: colors.card,
            }}
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text
                className="text-xl font-groteskBold"
                style={{ color: colors.text }}
              >
                Profile Photo
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowImageModal(false)
                  setTempAvatar(null)
                }}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${colors.border}30` }}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Preview */}
            {tempAvatar && (
              <View className="items-center mb-6">
                <View
                  className="w-28 h-28 rounded-full border-4 overflow-hidden"
                  style={{
                    borderColor: colors.border,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <Image
                    source={{ uri: tempAvatar }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <Text
                  className="text-sm mt-3 font-medium font-geist"
                  style={{ color: colors.mutedText }}
                >
                  Preview
                </Text>
              </View>
            )}

            {/* Options */}
            <View className="gap-3 mb-8">
              {/* Take Photo */}
              <TouchableOpacity
                onPress={takePhoto}
                className="flex-row items-center p-4 rounded-xl active:opacity-80"
                style={{
                  backgroundColor: `${colors.primary}10`,
                  borderWidth: 1,
                  borderColor: `${colors.primary}20`,
                }}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Camera size={22} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text
                    className="font-semibold text-base font-geist"
                    style={{ color: colors.text }}
                  >
                    Take Photo
                  </Text>
                  <Text
                    className="text-sm mt-1 font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    Use your camera to take a new photo
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.mutedText} />
              </TouchableOpacity>

              {/* Choose from Gallery */}
              <TouchableOpacity
                onPress={pickImage}
                className="flex-row items-center p-4 rounded-xl active:opacity-80"
                style={{
                  backgroundColor: `${colors.primary}10`,
                  borderWidth: 1,
                  borderColor: `${colors.primary}20`,
                }}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Upload size={22} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text
                    className="font-semibold text-base font-geist"
                    style={{ color: colors.text }}
                  >
                    Choose from Gallery
                  </Text>
                  <Text
                    className="text-sm mt-1 font-geist"
                    style={{ color: colors.mutedText }}
                  >
                    Select a photo from your gallery
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.mutedText} />
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => {
                  setShowImageModal(false)
                  setTempAvatar(null)
                }}
                className="flex-1 rounded-xl py-3.5 border items-center justify-center active:opacity-80"
                style={{
                  borderColor: colors.border,
                  backgroundColor: `${colors.border}10`,
                }}
              >
                <Text
                  className="font-medium font-geist"
                  style={{ color: colors.text }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              {/* Save Button */}
              <TouchableOpacity
                onPress={saveProfileImage}
                disabled={!tempAvatar}
                className="flex-1 rounded-xl py-3.5 items-center justify-center active:opacity-80"
                style={{
                  backgroundColor: tempAvatar
                    ? colors.primary
                    : `${colors.mutedText}30`,
                  opacity: tempAvatar ? 1 : 0.5,
                }}
              >
                <View className="flex-row items-center">
                  <Check size={20} color="#FFFFFF" className="mr-2" />
                  <Text className="text-white font-semibold font-geist">
                    Use This Photo
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default EditProfileScreen
