// BiometricAuthSettings.tsx
import AlertModal from "@/components/utils/AlertModal"
import { useThemeContext } from "@/context/ThemeContext"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as LocalAuthentication from "expo-local-authentication"
import {
  AlertCircle,
  ChevronRight,
  Fingerprint,
  Info,
  Lock,
  ScanFace,
  ShieldAlert,
  ShieldCheck,
  SmartphoneIcon,
  Wallet,
} from "lucide-react-native"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  ScrollView,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

// Types for biometric settings
interface BiometricSettings {
  biometricLoginEnabled: boolean
  biometricPaymentsEnabled: boolean
}

// Constants for AsyncStorage keys
const STORAGE_KEYS = {
  BIOMETRIC_LOGIN: "biometric_login_enabled",
  BIOMETRIC_PAYMENTS: "biometric_payments_enabled",
}

// Custom IOS Toggle Component
const IOSToggle = ({
  value,
  onValueChange,
  disabled = false,
}: {
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
}) => {
  const { colors } = useThemeContext()
  const [animation] = useState(new Animated.Value(value ? 1 : 0))
  const [isAnimating, setIsAnimating] = useState(false)

  const handlePress = () => {
    if (isAnimating || disabled) return

    setIsAnimating(true)
    const newValue = !value

    Animated.timing(animation, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setIsAnimating(false)
      onValueChange(newValue)
    })
  }

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  })

  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#D1D1D6", colors.primary],
  })

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      className="w-[51px] h-[31px]"
      disabled={disabled}
    >
      <Animated.View
        className="w-[47px] h-[27px] rounded-[16px] justify-center"
        style={{
          backgroundColor,
          opacity: disabled ? 0.5 : isAnimating ? 0.8 : 1,
        }}
      >
        <Animated.View
          className="w-6 h-6 rounded-[13.5px] bg-white"
          style={{
            transform: [{ translateX }],
          }}
        />
      </Animated.View>
    </TouchableOpacity>
  )
}

// Show Toast function
const showToast = (message: string, duration: number = ToastAndroid.SHORT) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, duration)
  } else {
    // Fallback for iOS - could use a different approach here
    Alert.alert("Info", message)
  }
}

const BiometricAuthSettings: React.FC = () => {
  const { colors, actualTheme } = useThemeContext()

  // State management
  const [isBiometricAvailable, setIsBiometricAvailable] =
    useState<boolean>(false)
  const [biometricType, setBiometricType] = useState<string>("Not Available")
  const [biometricSettings, setBiometricSettings] = useState<BiometricSettings>(
    {
      biometricLoginEnabled: false,
      biometricPaymentsEnabled: false,
    }
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false)
  const [biometricIcon, setBiometricIcon] = useState<React.ReactNode>(
    <AlertCircle size={24} />
  )

  const [alertVisible, setAlertVisible] = useState(false)
  const [alertConfig, setAlertConfig] = useState({})

  const showAlert = (config) => {
    setAlertConfig(config)
    setAlertVisible(true)
  }

  // Load saved settings on component mount
  useEffect(() => {
    checkBiometricAvailability()
    loadSavedSettings()
  }, [])

  /**
   * Check if biometric hardware is available and supported
   */
  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const isEnrolled = await LocalAuthentication.isEnrolledAsync()

      if (hasHardware && isEnrolled) {
        setIsBiometricAvailable(true)

        // Get supported authentication types
        const supportedTypes =
          await LocalAuthentication.supportedAuthenticationTypesAsync()

        // Determine biometric type
        if (
          supportedTypes.includes(
            LocalAuthentication.AuthenticationType.FINGERPRINT
          )
        ) {
          setBiometricType("Touch ID")
          setBiometricIcon(<Fingerprint size={24} color={colors.primary} />)
        } else if (
          supportedTypes.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
          )
        ) {
          setBiometricType("Face ID")
          setBiometricIcon(<ScanFace size={24} color={colors.primary} />)
        } else {
          setBiometricType("Biometric")
          setBiometricIcon(<ShieldCheck size={24} color={colors.primary} />)
        }
      } else {
        setIsBiometricAvailable(false)
        setBiometricType("Not Available")
        setBiometricIcon(<AlertCircle size={24} color={colors.mutedText} />)
      }
    } catch (error) {
      console.error("Error checking biometric availability:", error)
      setIsBiometricAvailable(false)
      setBiometricType("Error")
      showToast("Error checking biometric capabilities")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Load saved biometric preferences from AsyncStorage
   */
  const loadSavedSettings = async () => {
    try {
      const [loginEnabled, paymentsEnabled] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_LOGIN),
        AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_PAYMENTS),
      ])

      setBiometricSettings({
        biometricLoginEnabled: loginEnabled === "true",
        biometricPaymentsEnabled: paymentsEnabled === "true",
      })
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  /**
   * Save biometric preference to AsyncStorage
   */
  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString())
    } catch (error) {
      console.error("Error saving setting:", error)
      showToast("Failed to save setting")
    }
  }

  /**
   * Trigger biometric authentication
   */
  const triggerBiometricAuth = async (
    purpose: "login" | "payment"
  ): Promise<boolean> => {
    if (!isBiometricAvailable) {
      showToast("Biometric authentication not available")
      return false
    }

    setIsAuthenticating(true)

    try {
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: `${purpose === "login" ? "Sign in to your account" : "Confirm payment"}`,
        cancelLabel: "Cancel",
        fallbackLabel: "Use Passcode",
        disableDeviceFallback: false,
      })

      if (authResult.success) {
        showToast(`${biometricType} verified successfully`)
        return true
      } else {
        if (authResult.error === "user_cancel") {
          showToast("Authentication cancelled")
        } else if (authResult.error === "not_enrolled") {
          showToast("No biometrics enrolled on device")
        } else {
          showToast("Authentication failed. Please try again")
        }
        return false
      }
    } catch (error) {
      console.error("Biometric authentication error:", error)
      showToast("Authentication error occurred")
      return false
    } finally {
      setIsAuthenticating(false)
    }
  }

  /**
   * Handle biometric login toggle
   */
  const handleLoginToggle = async (value: boolean) => {
    if (value) {
      // When turning ON, require biometric authentication
      const isAuthenticated = await triggerBiometricAuth("login")

      if (isAuthenticated) {
        const newSettings = {
          ...biometricSettings,
          biometricLoginEnabled: true,
        }
        setBiometricSettings(newSettings)
        await saveSetting(STORAGE_KEYS.BIOMETRIC_LOGIN, true)

        // If payments was previously enabled but login disabled, keep payments disabled
        if (
          !biometricSettings.biometricLoginEnabled &&
          biometricSettings.biometricPaymentsEnabled
        ) {
          const updatedSettings = {
            ...newSettings,
            biometricPaymentsEnabled: false,
          }
          setBiometricSettings(updatedSettings)
          await saveSetting(STORAGE_KEYS.BIOMETRIC_PAYMENTS, false)
        }
      }
    } else {
      // When turning OFF, show confirmation
      showAlert({
        type: "warning",
        title: "Disable Biometric Login",
        message:
          "Disabling biometric login will also disable biometric payments. Continue?",
        primaryButtonText: "Disable",
        secondaryButtonText: "Cancel",
        onPrimaryPress: () => {
          const newSettings = {
            biometricLoginEnabled: false,
            biometricPaymentsEnabled: false,
          }
          setBiometricSettings(newSettings)
          Promise.all([
            saveSetting(STORAGE_KEYS.BIOMETRIC_LOGIN, false),
            saveSetting(STORAGE_KEYS.BIOMETRIC_PAYMENTS, false),
          ])
          showToast("Biometric login disabled")
          setAlertVisible(false)
        },
      })
    }
  }

  /**
   * Handle biometric payments toggle
   */
  const handlePaymentsToggle = async (value: boolean) => {
    if (!biometricSettings.biometricLoginEnabled) {
      return
    }

    if (value) {
      // When turning ON, require biometric authentication
      const isAuthenticated = await triggerBiometricAuth("payment")

      if (isAuthenticated) {
        const newSettings = {
          ...biometricSettings,
          biometricPaymentsEnabled: true,
        }
        setBiometricSettings(newSettings)
        await saveSetting(STORAGE_KEYS.BIOMETRIC_PAYMENTS, true)
      }
    } else {
      // When turning OFF, just disable
      const newSettings = {
        ...biometricSettings,
        biometricPaymentsEnabled: false,
      }
      setBiometricSettings(newSettings)
      await saveSetting(STORAGE_KEYS.BIOMETRIC_PAYMENTS, false)
      showToast("Biometric payments disabled")
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            className="mt-4 text-base font-medium"
            style={{ color: colors.text }}
          >
            Checking device capabilities...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* Header with Large Title - Apple Style */}
          <View className="px-5 pt-4 pb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text
                className="text-2xl font-groteskBold "
                style={{ color: colors.text }}
              >
                Face ID & Passcode
              </Text>
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <ShieldAlert size={20} color={colors.primary} />
              </View>
            </View>

            <Text
              className="text-base leading-6 font-geist"
              style={{ color: colors.mutedText }}
            >
              Use {biometricType.toLowerCase()} for faster, more secure access
              to your account and payments.
            </Text>
          </View>

          {/* Device Status Card - Apple Style */}
          <View className="px-5 mb-6">
            <View
              className="rounded-2xl p-5 border"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${colors.primary}20` }}
                  >
                    {biometricIcon}
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-semibold"
                      style={{ color: colors.text }}
                    >
                      {biometricType}
                    </Text>
                    <Text
                      className="text-sm mt-1"
                      style={{ color: colors.mutedText }}
                    >
                      {isBiometricAvailable
                        ? "Available on this device"
                        : "Not available"}
                    </Text>
                  </View>
                </View>
                <View
                  className="px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: isBiometricAvailable
                      ? `${colors.success}20`
                      : `${colors.error}20`,
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{
                      color: isBiometricAvailable
                        ? colors.success
                        : colors.error,
                    }}
                  >
                    {isBiometricAvailable ? "Ready" : "Offline"}
                  </Text>
                </View>
              </View>

              {!isBiometricAvailable && (
                <TouchableOpacity
                  className="mt-4 p-3.5 rounded-xl active:opacity-80"
                  style={{ backgroundColor: `${colors.border}20` }}
                  onPress={checkBiometricAvailability}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="font-medium text-sm"
                      style={{ color: colors.primary }}
                    >
                      Check biometric availability
                    </Text>
                    <ChevronRight size={16} color={colors.primary} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Settings Section - Apple Style List */}
          <View className="mb-8">
            {/* Section Header */}
            <View className="px-5 mb-3">
              <Text
                className="text-xs font-semibold uppercase tracking-wider font-groteskBold"
                style={{ color: colors.mutedText }}
              >
                Biometric Settings
              </Text>
            </View>

            {/* Settings List Container */}
            <View
              className="rounded-2xl mx-5 border overflow-hidden"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              {/* Biometric Login Option */}
              <View
                className="px-4 py-3.5"
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: `${colors.border}80`,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                      style={{ backgroundColor: `#3b82f620` }}
                    >
                      <Lock size={18} color={colors.icon} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="font-medium text-base font-geist"
                        style={{ color: colors.text }}
                      >
                        Login with {biometricType}
                      </Text>
                      <Text
                        className="text-sm mt-0.5 font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        Sign in faster without OTP
                      </Text>
                    </View>
                  </View>
                  <IOSToggle
                    value={biometricSettings.biometricLoginEnabled}
                    onValueChange={handleLoginToggle}
                    disabled={!isBiometricAvailable || isAuthenticating}
                  />
                </View>
                {!isBiometricAvailable && (
                  <Text
                    className="text-xs mt-2 ml-12 font-geist"
                    style={{ color: colors.error }}
                  >
                    Biometric authentication is not available on this device
                  </Text>
                )}
              </View>

              {/* Biometric Payments Option */}
              <View className="px-4 py-3.5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                      style={{
                        backgroundColor: biometricSettings.biometricLoginEnabled
                          ? `#8b5cf620`
                          : `${colors.mutedText}20`,
                      }}
                    >
                      <Wallet
                        size={18}
                        color={
                          biometricSettings.biometricLoginEnabled
                            ? colors.icon
                            : colors.mutedText
                        }
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="font-medium text-base font-geist"
                        style={{
                          color: biometricSettings.biometricLoginEnabled
                            ? colors.text
                            : colors.mutedText,
                        }}
                      >
                        Require for Payments
                      </Text>
                      <Text
                        className="text-sm mt-0.5 font-geist"
                        style={{
                          color: biometricSettings.biometricLoginEnabled
                            ? colors.mutedText
                            : `${colors.mutedText}AA`,
                        }}
                      >
                        Extra security for transactions
                      </Text>
                      {!biometricSettings.biometricLoginEnabled && (
                        <Text
                          className="text-xs mt-1"
                          style={{ color: colors.primary }}
                        >
                          Enable biometric login first
                        </Text>
                      )}
                    </View>
                  </View>
                  <IOSToggle
                    value={biometricSettings.biometricPaymentsEnabled}
                    onValueChange={handlePaymentsToggle}
                    disabled={
                      !biometricSettings.biometricLoginEnabled ||
                      !isBiometricAvailable ||
                      isAuthenticating
                    }
                  />
                </View>
              </View>
            </View>
          </View>

          {/* System Info Footer */}
          <View className="px-5">
            <View
              className="rounded-xl p-4 border"
              style={{
                backgroundColor: `${colors.mutedText}10`,
                borderColor: `${colors.border}50`,
              }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <SmartphoneIcon
                    size={14}
                    color={colors.mutedText}
                    className="mr-2"
                  />
                  <Text
                    className="text-xs font-medium font-geist ml-1"
                    style={{ color: colors.mutedText }}
                  >
                    System Information
                  </Text>
                </View>
                <Text
                  className="text-xs font-grotesk"
                  style={{ color: colors.mutedText }}
                >
                  v1.0 • {new Date().getFullYear()}
                </Text>
              </View>
              <Text
                className="text-xs font-geist"
                style={{ color: colors.mutedText }}
              >
                {biometricType} •{" "}
                {actualTheme === "dark" ? "Dark Mode" : "Light Mode"} • Secure
                Connection
              </Text>
            </View>
          </View>

          {/* Help Link */}
          <TouchableOpacity className="mx-5 mt-6">
            <View className="flex-row items-center justify-center py-3">
              <Info size={16} color={colors.primary} className="mr-2" />
              <Text
                className="font-medium text-sm ml-1 font-geist"
                style={{ color: colors.primary }}
              >
                Learn more about biometric security
              </Text>
              <ChevronRight size={16} color={colors.primary} className="ml-1" />
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Authentication Overlay */}
        {isAuthenticating && (
          <View className="absolute inset-0 justify-center items-center">
            <View
              className="absolute inset-0"
              style={{ backgroundColor: "#00000080" }}
            />
            <View
              className="rounded-2xl p-6 mx-5 max-w-sm shadow-xl border"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <ActivityIndicator
                size="large"
                color={colors.primary}
                className="mb-4"
              />
              <Text
                className="text-center font-semibold text-lg mb-2 font-geist"
                style={{ color: colors.text }}
              >
                Authenticate with {biometricType}
              </Text>
              <Text
                className="text-center text-sm font-geist"
                style={{ color: colors.mutedText }}
              >
                Look at your device or use your fingerprint to continue
              </Text>
            </View>
          </View>
        )}
      </SafeAreaView>

      {/* Alert Modal */}
      <AlertModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        {...alertConfig}
      />
    </>
  )
}

export default BiometricAuthSettings
