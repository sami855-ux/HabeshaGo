import AlertModal from "@/components/utils/AlertModal"
import { sendOtp, verifyOtp } from "@/lib/auth-client"
import { useTheme } from "@react-navigation/native"
import { useRouter } from "expo-router"
import { Clock, RotateCcw, Shield } from "lucide-react-native"
import React, { useEffect, useRef, useState } from "react"
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

const { width } = Dimensions.get("window")

const ContinueWithEmail = () => {
  const router = useRouter()
  const { colors, dark } = useTheme()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState(Array(6).fill(""))
  const [timeLeft, setTimeLeft] = useState(60)
  const [isResending, setIsResending] = useState(false)
  const [activeInput, setActiveInput] = useState(0)

  const inputRefs = useRef([])
  const pulseAnim = useRef(new Animated.Value(1)).current
  const shakeAnim = useRef(new Animated.Value(0)).current
  const progressAnim = useRef(new Animated.Value(0)).current

  const [alertVisible, setAlertVisible] = useState(false)
  const [alertConfig, setAlertConfig] = useState({})

  const showAlert = (config) => {
    setAlertConfig(config)
    setAlertVisible(true)
  }

  // Map your existing orangeColors to theme colors
  const orangeColors = {
    primary: "#F97316",
    primaryLight: "#FDBA74",
    primaryDark: "#EA580C",
    background: colors.background,
    card: colors.card,
    text: colors.text,
    textSecondary: dark ? "#9CA3AF" : "#6B7280",
    border: colors.border,
    error: "#EF4444",
    success: "#10B981",
  }

  // Pulse animation for CTA button
  useEffect(() => {
    if (!codeSent && email.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start()
    } else {
      pulseAnim.setValue(1)
    }
  }, [email, codeSent])

  // Progress animation for timer
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (60 - timeLeft) / 60,
      duration: 1000,
      useNativeDriver: false,
    }).start()
  }, [timeLeft])

  useEffect(() => {
    if (!codeSent || timeLeft <= 0) return
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, codeSent])

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleContinue = async () => {
    router.push("/(passenger)/(tabs)")
    if (!email) {
      triggerShake()
      showAlert({
        type: "error",
        title: "Email Required",
        message: "Please enter your email address to continue.",
        primaryButtonText: "Got it",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      triggerShake()
      showAlert({
        type: "error",
        title: "Invalid Email",
        message: `Oops! It looks like the email address you entered isn’t valid.
  
  Please check for typos or missing characters and try again.`,
        primaryButtonText: "Got it",
      })
      return
    }

    setIsLoading(true)

    try {
      console.log(email)
      // ✅ REAL API CALL (no better-auth)
      await sendOtp(email)

      setCodeSent(true)
      setTimeLeft(60)
      setVerificationCode(Array(6).fill(""))

      showAlert({
        type: "success",
        title: "OTP Sent",
        message: "We’ve sent a 6-digit verification code to your email.",
        primaryButtonText: "Continue",
      })

      setTimeout(() => inputRefs.current[0]?.focus(), 500)
    } catch (error) {
      showAlert({
        type: "error",
        title: "Sending Failed",
        message:
          error?.message ||
          "Failed to send verification code. Please try again.",
        primaryButtonText: "Got it",
      })
      console.log("Send OTP Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeChange = (text, index) => {
    const newCode = [...verificationCode]
    newCode[index] = text
    setVerificationCode(newCode)
    if (text && index < 5) inputRefs.current[index + 1]?.focus()
    if (newCode.every((d) => d !== "") && index === 5) handleVerifyCode()
  }

  const handleCodeKeyPress = (e, index) => {
    if (
      e.nativeEvent.key === "Backspace" &&
      !verificationCode[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyCode = async () => {
    const code = verificationCode.join("")

    // console.log(code.length)
    // if (code.length !== 6) {
    //   triggerShake()
    //   showAlert({
    //     type: "error",
    //     title: "Incomplete Code",
    //     message: "Please enter all 6 digits.",
    //     primaryButtonText: "Got it",
    //   })
    //   return
    // }

    setIsLoading(true)

    try {
      const data = await verifyOtp(email, code)

      if (data.success) {
        showAlert({
          type: "success",
          title: "Verified Successfully",
          message: "Your email has been verified and you are now signed in.",
          primaryButtonText: "Continue",
        })

        console.log("✅ Login Success:", data)

        // ✅ OPTIONAL: navigate to home/dashboard
        // router.replace("/(tabs)")
        router.push("/(passenger)/(tabs)")
      } else {
        showAlert({
          type: "error",
          title: "Verifaction Error",
          message: "Your email has been verified and you are now signed in.",
          primaryButtonText: "Continue",
        })
      }
    } catch (error: any) {
      triggerShake()

      showAlert({
        type: "error",
        title: "Verification Failed",
        message:
          error?.message ||
          "Invalid or expired code. Please request a new one.",
        primaryButtonText: "Try Again",
      })

      console.log("❌ Verify OTP Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (timeLeft > 0) return
    setIsResending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setTimeLeft(60)
      setVerificationCode(Array(6).fill(""))
      inputRefs.current[0]?.focus()
      Alert.alert("Code Sent!", "New verification code has been sent!")
    } catch (error) {
      Alert.alert("Error", "Failed to resend code. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  })

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={dark ? "light-content" : "dark-content"}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        style={{ backgroundColor: orangeColors.background }}
      >
        <ScrollView
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            className="flex-1 px-6 justify-center"
            style={{ backgroundColor: orangeColors.background }}
          >
            {/* Header */}
            <View className="items-center mb-12">
              <Animated.View
                className="w-20 h-20 rounded-2xl items-center justify-center mb-6 border"
                style={{
                  backgroundColor: orangeColors.primary + "15",
                  borderColor: orangeColors.primary + "30",
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <Shield size={32} color={orangeColors.primary} />
              </Animated.View>

              <Text
                className="text-3xl font-groteskBold text-center mb-3"
                style={{ color: orangeColors.text }}
              >
                {codeSent ? "Verify Your Email" : "Continue with Email"}
              </Text>
              <Text
                className="text-base text-center font-geist leading-6"
                style={{ color: orangeColors.textSecondary }}
              >
                {codeSent
                  ? `Please enter the 6-digit code we sent to ${email}. Make sure to enter the code exactly as received to verify your email.`
                  : "Please provide your email address so we can send you a verification code to login to your account."}
              </Text>
            </View>

            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              {/* Email Input */}
              {!codeSent && (
                <View className="mb-8">
                  <Text
                    className="text-sm font-geist font-semibold mb-2"
                    style={{ color: orangeColors.text }}
                  >
                    Email Adreses
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-4 text-base font-geist"
                      style={{ color: orangeColors.text }}
                      placeholder="example@email.com"
                      placeholderTextColor={orangeColors.textSecondary}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      editable={!isLoading}
                    />
                    {email && (
                      <TouchableOpacity
                        className="absolute right-4 top-4 w-5 h-5 rounded-full items-center justify-center bg-gray-200 dark:bg-gray-600"
                        onPress={() => setEmail("")}
                      >
                        <Text className="text-gray-500 dark:text-gray-400 text-xs font-bold">
                          ×
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* Verification Code Input */}
              {codeSent && (
                <View className="mb-8">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text
                      className="text-sm font-geist font-semibold"
                      style={{ color: orangeColors.text }}
                    ></Text>
                    <View className="flex-row items-center bg-white dark:bg-gray-900 px-3 py-2 rounded-2xl border border-gray-300 dark:border-gray-600">
                      <Clock
                        size={14}
                        color={
                          timeLeft > 10
                            ? orangeColors.success
                            : orangeColors.error
                        }
                      />
                      <Text
                        className={`text-sm font-groteskBold ml-2 ${
                          timeLeft > 10 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {formatTime(timeLeft)}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1 mb-6 overflow-hidden">
                    <Animated.View
                      style={{ width: progressWidth }}
                      className={`h-full rounded-full ${
                        timeLeft > 10 ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                  </View>

                  {/* Code Inputs Grid */}
                  <View className="flex-row justify-between mb-6">
                    {verificationCode.map((digit, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => inputRefs.current[index]?.focus()}
                        className={`w-11 h-12 rounded-xl border-2 items-center justify-center bg-white dark:bg-gray-900 ${
                          activeInput === index
                            ? "border-orange-500"
                            : digit
                              ? "border-green-500"
                              : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        <TextInput
                          ref={(ref) => (inputRefs.current[index] = ref)}
                          className="w-full text-center font-groteskBold text-lg"
                          style={{ color: orangeColors.text }}
                          value={digit}
                          onChangeText={(text) => handleCodeChange(text, index)}
                          onKeyPress={(e) => handleCodeKeyPress(e, index)}
                          onFocus={() => setActiveInput(index)}
                          keyboardType="number-pad"
                          maxLength={1}
                          selectTextOnFocus
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Resend Code */}
                  <View className="flex-row justify-center items-center">
                    <Text
                      className="text-sm mr-3"
                      style={{ color: orangeColors.textSecondary }}
                    >
                      Did not receive the code?
                    </Text>
                    <TouchableOpacity
                      onPress={handleResendCode}
                      disabled={timeLeft > 0 || isResending}
                      className={`flex-row items-center px-4 py-2 rounded-2xl ${
                        timeLeft > 0 || isResending
                          ? "bg-gray-100 dark:bg-gray-800"
                          : "bg-orange-50 dark:bg-orange-900/20"
                      }`}
                    >
                      <RotateCcw
                        size={16}
                        color={
                          timeLeft > 0 || isResending
                            ? orangeColors.textSecondary
                            : orangeColors.primary
                        }
                      />
                      <Text
                        className={`text-sm font-semibold ml-2 ${
                          timeLeft > 0 || isResending
                            ? "text-gray-400"
                            : "text-orange-600 dark:text-orange-400"
                        }`}
                      >
                        {isResending ? "Sending..." : "Resend Code"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Animated.View>

            {/* Action Buttons */}
            <View className="gap-4">
              {!codeSent ? (
                <Animated.View>
                  <TouchableOpacity
                    className={`w-full bg-orange-500 rounded-xl py-4 flex-row items-center justify-center ${
                      isLoading ? "opacity-80" : ""
                    }`}
                    onPress={handleContinue}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <View className="flex-row items-center">
                        <Text className="text-white font-geist text-lg mr-3">
                          Sending Code...
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-white font-geist text-lg font-semibold">
                        Sigin In
                      </Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <TouchableOpacity
                  className="w-full bg-orange-500 rounded-xl py-4 flex-row items-center justify-center"
                  onPress={handleVerifyCode}
                  disabled={verificationCode.join("").length !== 6}
                >
                  <Text className="text-white font-geist text-lg font-semibold">
                    Verify
                  </Text>
                </TouchableOpacity>
              )}

              {codeSent && (
                <TouchableOpacity
                  className="w-full border-1 border-gray-300 dark:border-gray-900 rounded-xl py-4"
                  onPress={() => {
                    setCodeSent(false)
                    setVerificationCode(Array(6).fill(""))
                  }}
                >
                  <Text
                    className="text-center font-geist font-semibold text-base"
                    style={{ color: orangeColors.text }}
                  >
                    Change Email Address
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Security Footer */}
            <View className="mt-12">
              <View className="flex-row items-center justify-center">
                <Shield size={14} color={orangeColors.textSecondary} />
                <Text
                  className="text-sm text-center ml-2"
                  style={{ color: orangeColors.textSecondary }}
                >
                  Your data is securely encrypted and protected
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Alert Modal */}
      <AlertModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        {...alertConfig}
      />
    </>
  )
}

export default ContinueWithEmail
