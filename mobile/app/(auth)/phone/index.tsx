import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Phone,
} from "lucide-react-native"
import React, { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

import AlertModal from "@/components/utils/AlertModal"
import { useThemeContext } from "@/context/ThemeContext"
import { useRouter } from "expo-router"

const PhoneNumberScreen = () => {
  const router = useRouter()
  const { colors, actualTheme } = useThemeContext()

  const isDark = actualTheme === "dark"

  const [phoneNumber, setPhoneNumber] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertConfig, setAlertConfig] = useState({})

  const showAlert = (config: any) => {
    setAlertConfig(config)
    setAlertVisible(true)
  }

  const validatePhoneNumber = (number: string) => {
    const clean = number.replace(/\D/g, "")
    if (clean.length === 9) {
      const firstDigit = clean.charAt(0)
      return firstDigit === "9" || firstDigit === "7"
    }
    return false
  }

  const handlePhoneNumberChange = (text: string) => {
    const clean = text.replace(/\D/g, "")
    let formatted = ""

    if (clean.length > 0) {
      formatted = clean
      if (clean.length > 3) {
        formatted = `${clean.slice(0, 3)} ${clean.slice(3)}`
      }
      if (clean.length > 6) {
        formatted = `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(
          6,
          9
        )}`
      }
    }

    setPhoneNumber(formatted)
    setIsValid(validatePhoneNumber(clean))
  }

  const handleContinue = () => {
    router.push("/(driver)/tabs")
    const clean = phoneNumber.replace(/\D/g, "")

    if (!validatePhoneNumber(clean)) {
      showAlert({
        type: "error",
        title: "Invalid Phone Number",
        message:
          "Please enter a valid Ethiopian phone number starting with 9 or 7 (e.g., 978109304)",
        primaryButtonText: "Got it",
      })
      return
    }

    const full = `+251${clean}`

    showAlert({
      type: "success",
      title: "Code Sent!",
      message: `Verification code has been sent to ${full}`,
      primaryButtonText: "Enter Code",
    })
  }

  // Dynamic border color using theme colors
  const getInputBorderColor = () => {
    if (!isValid && phoneNumber.replace(/\D/g, "").length >= 9)
      return colors.error
    if (isFocused) return colors.primary
    return colors.border
  }

  const isContinueDisabled =
    !isValid || phoneNumber.replace(/\D/g, "").length < 9

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-1 px-6 py-16 justify-between">
              {/* Header */}
              <View className="items-center mb-12">
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 24,
                    backgroundColor: isDark ? colors.card : "#E8F0FF",
                  }}
                >
                  <Phone size={32} color={colors.primary} />
                </View>

                <Text
                  className="text-3xl font-groteskBold mb-3 text-center"
                  style={{ color: colors.text }}
                >
                  Continue With Your Phone
                </Text>

                <Text
                  className="text-base font-geist text-center px-4 leading-6"
                  style={{ color: colors.mutedText }}
                >
                  We'll send you a verification code to confirm your phone
                  number.
                </Text>
              </View>

              {/* Input */}
              <View className="mb-8">
                <Text
                  className="text-xs font-geist font-semibold mb-2 uppercase tracking-wider"
                  style={{ color: colors.mutedText }}
                >
                  Phone Number
                </Text>

                <View
                  className="flex-row items-center rounded-xl h-14 px-4"
                  style={{
                    borderWidth: 2,
                    borderColor: getInputBorderColor(),
                    backgroundColor: "transparent",
                  }}
                >
                  <Text
                    className="text-base font-semibold mr-1 font-geist pl-4"
                    style={{ color: colors.text }}
                  >
                    +251
                  </Text>

                  <View
                    style={{
                      width: 1,
                      height: 24,
                      marginHorizontal: 12,
                      backgroundColor: colors.border,
                    }}
                  />

                  <View className="flex-1 flex-row items-center">
                    <TextInput
                      className="flex-1 text-base font-medium py-2 font-geist"
                      style={{ color: colors.text }}
                      placeholder="912 345 678"
                      placeholderTextColor={colors.mutedText}
                      value={phoneNumber}
                      onChangeText={handlePhoneNumberChange}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      keyboardType="phone-pad"
                      maxLength={11}
                      autoComplete="tel"
                    />

                    {isValid && phoneNumber.replace(/\D/g, "").length === 9 && (
                      <CheckCircle size={20} color={colors.success} />
                    )}
                  </View>
                </View>

                {!isValid && phoneNumber.replace(/\D/g, "").length >= 9 && (
                  <View className="flex-row items-center mt-2 ml-1">
                    <AlertCircle size={16} color={colors.error} />
                    <Text
                      className="text-sm ml-1 font-geist"
                      style={{ color: colors.error }}
                    >
                      Phone number must start with 9 or 7
                    </Text>
                  </View>
                )}

                <Text
                  className="mt-2 ml-1 text-sm italic font-geist"
                  style={{ color: colors.mutedText }}
                >
                  Format: 9XX XXX XXX or 7XX XXX XXX
                </Text>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                className="flex-row items-center justify-center h-14 rounded-xl"
                style={{
                  backgroundColor: isContinueDisabled
                    ? colors.border
                    : colors.primary,
                }}
                onPress={handleContinue}
                disabled={isContinueDisabled}
              >
                <Text
                  className="text-base font-semibold mr-2 font-geist"
                  style={{
                    color: isContinueDisabled ? colors.mutedText : "#FFFFFF",
                  }}
                >
                  Continue
                </Text>

                <ArrowRight
                  size={20}
                  color={isContinueDisabled ? colors.mutedText : "#FFFFFF"}
                />
              </TouchableOpacity>

              {/* Footer */}
              <View className="mt-8">
                <Text
                  className="text-xs text-center font-geist"
                  style={{ color: colors.mutedText }}
                >
                  By continuing, you agree to our{" "}
                  <Text style={{ color: colors.primary }}>
                    Terms of Service
                  </Text>{" "}
                  and{" "}
                  <Text style={{ color: colors.primary }}>Privacy Policy</Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <AlertModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        {...alertConfig}
      />
    </>
  )
}

export default PhoneNumberScreen
