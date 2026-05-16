// EditProfileScreen.tsx
import { useThemeContext } from "@/context/ThemeContext"
import { setUser, updateUser } from "@/store/slices/userSlice"
import { updateMyProfileAPI } from "@/service/user.api"
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
import { useAppDispatch, useAppSelector } from "@/store"

interface ProfileData {
  name: string
  email: string
  phone: string
  location: string
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
  const dispatch = useAppDispatch()
  const { user, loading: isUserLoading } = useAppSelector((state) => state.user)

  // Profile state
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    avatarUri: null,
  })

  // UI state
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [tempAvatar, setTempAvatar] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<any>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load profile from Redux on mount
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        avatarUri: user.avaterUrl || null,
      })
    }
  }, [user])

  // Check for unsaved changes
  useEffect(() => {
    if (!user) return

    const initialProfile = {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      location: user.location || "",
      bio: user.bio || "",
      avatarUri: user.avaterUrl || null,
    }

    const hasChanges =
      JSON.stringify(profile) !== JSON.stringify(initialProfile) ||
      avatarFile !== null
    setHasUnsavedChanges(hasChanges)
  }, [profile, user, avatarFile])

  // Convert image URI to FormData compatible file
  const uriToBlob = async (uri: string): Promise<Blob> => {
    const response = await fetch(uri)
    const blob = await response.blob()
    return blob
  }

  // Prepare avatar file for upload
  const prepareAvatarFile = async (uri: string) => {
    try {
      const blob = await uriToBlob(uri)
      const filename = uri.split("/").pop() || "avatar.jpg"
      const fileType = blob.type || "image/jpeg"

      // Create File object for FormData
      const file = new File([blob], filename, { type: fileType })
      setAvatarFile(file)
    } catch (error) {
      console.error("Error preparing avatar file:", error)
      showToast("Failed to prepare image file")
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
          [{ text: "OK" }],
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
        await prepareAvatarFile(result.assets[0].uri)
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
          [{ text: "OK" }],
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
        await prepareAvatarFile(result.assets[0].uri)
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
  }

  // Save profile to backend using API
  const saveProfileData = async () => {
    setIsSaving(true)

    try {
      const formData = new FormData()
      formData.append("email", profile.email)
      formData.append("phone", profile.phone)
      formData.append("name", profile.name)
      formData.append("bio", profile.bio || "")
      formData.append("location", profile.location || "")

      if (avatarFile) {
        formData.append("avatar", avatarFile)
      }

      console.log("Saving profile with data:", {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        hasAvatar: !!avatarFile,
      })

      const response = await updateMyProfileAPI(formData)

      dispatch(
        updateUser({
          ...user,
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone,
          avaterUrl: response.user.avaterUrl,
          emailVerified: response.user.emailVerified,
          phoneVerified: response.user.phoneVerified,
          bio: response.user.bio,
          location: response.user.location,
        }),
      )

      setIsSaving(false)
      setIsEditing(false)
      setAvatarFile(null)
      setTempAvatar(null)
      showToast("Profile updated successfully!")
      setHasUnsavedChanges(false)
    } catch (error: any) {
      console.error("Error saving profile:", error)
      setIsSaving(false)
      showToast(error?.message || "Failed to save profile. Please try again.")
    }
  }

  // Cancel editing
  const cancelEditing = () => {
    if (!hasUnsavedChanges) {
      setIsEditing(false)
      return
    }

    Alert.alert(
      "Discard Changes",
      "Are you sure you want to discard all changes?",
      [
        {
          text: "Continue Editing",
          style: "cancel",
        },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            // Reset to original user data
            if (user) {
              setProfile({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                location: user.location || "",
                bio: user.bio || "",
                avatarUri: user.avaterUrl || null,
              })
              setAvatarFile(null)
              setTempAvatar(null)
            }
            setIsEditing(false)
            showToast("Changes discarded")
          },
        },
      ],
    )
  }

  // Loading state
  if (isUserLoading) {
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
        {/* Header with Profile Title and Edit Button */}
        <View className="px-5 pt-6 pb-4">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1">
              <Text
                className="text-2xl font-groteskBold"
                style={{ color: colors.text }}
              >
                Profile
              </Text>
              <Text
                className="text-base mt-2 font-geist"
                style={{ color: colors.mutedText }}
              >
                {isEditing
                  ? "Edit your personal information"
                  : "View your profile details"}
              </Text>
            </View>

            {/* Edit/Save Button */}
            {!isEditing ? (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                className="flex-row items-center gap-2 px-4 py-2 rounded-xl"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <Edit2 size={18} color={colors.primary} />
                <Text style={{ color: colors.primary }} className="font-medium">
                  Edit
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={cancelEditing}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl"
                  style={{ backgroundColor: `${colors.error}15` }}
                >
                  <Text style={{ color: colors.error }} className="font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={saveProfileData}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="px-4 py-2 rounded-xl"
                  style={{
                    backgroundColor: hasUnsavedChanges
                      ? colors.primary
                      : `${colors.mutedText}30`,
                    opacity: isSaving || !hasUnsavedChanges ? 0.7 : 1,
                  }}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white font-medium">Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Profile Image Card */}
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
                onPress={() => isEditing && setShowImageModal(true)}
                className="relative"
                activeOpacity={isEditing ? 0.8 : 1}
                disabled={!isEditing}
              >
                <View
                  className="w-28 h-28 rounded-full border-4 overflow-hidden"
                  style={{
                    backgroundColor: `${colors.primary}10`,
                    borderColor: colors.card,
                  }}
                >
                  {tempAvatar || profile.avatarUri ? (
                    <Image
                      source={{
                        uri: tempAvatar || profile.avatarUri || undefined,
                      }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="flex-1 items-center justify-center">
                      <User size={48} color={colors.mutedText} />
                    </View>
                  )}

                  {/* Edit overlay - only show when editing */}
                  {isEditing && (
                    <View
                      className="absolute inset-0 items-center justify-center"
                      style={{ backgroundColor: "#00000040" }}
                    >
                      <Edit2 size={24} color="#FFFFFF" />
                    </View>
                  )}
                </View>

                {/* Camera badge - only show when editing */}
                {isEditing && (
                  <View
                    className="absolute bottom-2 right-2 w-10 h-10 rounded-full items-center justify-center border-2"
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.background,
                    }}
                  >
                    <Camera size={16} color={colors.primary} />
                  </View>
                )}
              </TouchableOpacity>

              {isEditing && (
                <TouchableOpacity
                  onPress={() => setShowImageModal(true)}
                  className="mt-4 p-3.5 rounded-xl active:opacity-80"
                  style={{ backgroundColor: `${colors.border}20` }}
                >
                  <View className="flex-row items-center">
                    <Upload size={16} color={colors.primary} />
                    <Text
                      className="font-medium text-sm font-geist ml-2"
                      style={{ color: colors.primary }}
                    >
                      Change Profile Photo
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Form Section */}
        <View className="mb-8">
          <View className="px-5 mb-3">
            <Text
              className="text-xs font-semibold font-groteskBold uppercase tracking-wider"
              style={{ color: colors.mutedText }}
            >
              Personal Information
            </Text>
          </View>

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
                  {isEditing ? (
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
                  ) : (
                    <Text
                      className="text-base font-geist"
                      style={{ color: colors.text }}
                    >
                      {profile.name || "Not provided"}
                    </Text>
                  )}
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
                  {isEditing ? (
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
                  ) : (
                    <Text
                      className="text-base font-geist"
                      style={{ color: colors.text }}
                    >
                      {profile.email || "Not provided"}
                    </Text>
                  )}
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
                  {isEditing ? (
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
                  ) : (
                    <Text
                      className="text-base font-geist"
                      style={{ color: colors.text }}
                    >
                      {profile.phone || "Not provided"}
                    </Text>
                  )}
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
                  {isEditing ? (
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
                  ) : (
                    <Text
                      className="text-base font-geist"
                      style={{ color: colors.text }}
                    >
                      {profile.location || "Not provided"}
                    </Text>
                  )}
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
                  {isEditing ? (
                    <>
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
                      <View className="flex-row justify-end mt-2">
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
                    </>
                  ) : (
                    <Text
                      className="text-base font-geist"
                      style={{ color: colors.text }}
                    >
                      {profile.bio || "No bio provided"}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Account Information Section */}
        <View className="mb-8">
          <View className="px-5 mb-3">
            <Text
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: colors.mutedText }}
            >
              Account Information
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
              <View className="flex-row items-center mb-3">
                <ShieldCheck size={16} color={colors.primary} />
                <Text
                  className="text-sm ml-3 font-medium"
                  style={{ color: colors.text }}
                >
                  Account Status
                </Text>
              </View>
              <View className="ml-6">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm" style={{ color: colors.mutedText }}>
                    Role
                  </Text>
                  <Text
                    className="text-sm font-medium"
                    style={{ color: colors.text }}
                  >
                    {user?.role || "PASSENGER"}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm" style={{ color: colors.mutedText }}>
                    Email Verified
                  </Text>
                  <Text
                    className="text-sm font-medium"
                    style={{
                      color: user?.emailVerified ? "#10b981" : colors.error,
                    }}
                  >
                    {user?.emailVerified ? "Yes" : "No"}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm" style={{ color: colors.mutedText }}>
                    Phone Verified
                  </Text>
                  <Text
                    className="text-sm font-medium"
                    style={{
                      color: user?.phoneVerified ? "#10b981" : colors.error,
                    }}
                  >
                    {user?.phoneVerified ? "Yes" : "No"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Privacy Note */}
        <View className="mb-8">
          <View
            className="rounded-2xl mx-5 border overflow-hidden"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
          >
            <View className="px-4 py-3.5">
              <View className="flex-row items-center">
                <Info size={16} color={colors.primary} />
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

      {/* Image Upload Modal */}
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
            }}
          />

          <View
            className="rounded-t-3xl p-6 pb-8"
            style={{
              backgroundColor: colors.card,
            }}
          >
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
                }}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${colors.border}30` }}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

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

            <View className="gap-3 mb-8">
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

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowImageModal(false)
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
                  <Check size={20} color="#FFFFFF" />
                  <Text className="text-white font-semibold font-geist ml-2">
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
