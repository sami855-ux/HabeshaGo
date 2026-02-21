import AlertModal from "@/components/utils/AlertModal"
import { useThemeContext } from "@/context/ThemeContext"
import { saveRefreshToken } from "@/lib/refreshToken"
import { continueWithEmail, getMe, verifyOtp } from "@/service/auth"
import { useAppDispatch } from "@/store"
import {
  saveUserToStorage,
  setAccessToken,
  setUser,
} from "@/store/slices/userSlice"
import { useRouter } from "expo-router"
import { Clock, RotateCcw, Shield } from "lucide-react-native"
import React, { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
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
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { colors, actualTheme } = useThemeContext()
  const dark = actualTheme === "dark"

  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState(Array(6).fill(""))
  const [timeLeft, setTimeLeft] = useState(60)
  const [isResending, setIsResending] = useState(false)
  const [activeInput, setActiveInput] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)

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

  // Extended colors based on your theme
  const themeColors = {
    // Your theme colors
    ...colors,

    // Additional colors for OTP UI
    primaryLight: dark ? "rgba(234, 88, 12, 0.1)" : "rgba(234, 88, 12, 0.08)",
    primaryLighter: dark
      ? "rgba(234, 88, 12, 0.15)"
      : "rgba(234, 88, 12, 0.12)",
    errorLight: dark ? "rgba(255, 59, 48, 0.1)" : "rgba(255, 59, 48, 0.08)",
    successLight: dark ? "rgba(52, 199, 89, 0.1)" : "rgba(52, 199, 89, 0.08)",
    warning: "#F59E0B",
    warningLight: dark ? "rgba(245, 158, 11, 0.1)" : "rgba(245, 158, 11, 0.08)",
    gray100: dark ? "#2C2C2E" : "#F3F4F6",
    gray200: dark ? "#3A3A3C" : "#E5E7EB",
    gray300: dark ? "#48484A" : "#D1D5DB",
    gray400: dark ? "#636366" : "#9CA3AF",
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
        ]),
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
        message: `Oops! It looks like the email address you entered isn't valid.
  
Please check for typos or missing characters and try again.`,
        primaryButtonText: "Got it",
      })
      return
    }

    setIsLoading(true)

    try {
      console.log("Sending OTP to:", email)
      const res = await continueWithEmail(email)

      console.log("OTP response:", res)
      if (res.success) {
        setCodeSent(true)
        setTimeLeft(60)
        setVerificationCode(Array(6).fill(""))

        showAlert({
          type: "success",
          title: "OTP Sent",
          message: "We've sent a 6-digit verification code to your email.",
          primaryButtonText: "Continue",
        })

        setTimeout(() => inputRefs.current[0]?.focus(), 500)
      } else {
        showAlert({
          type: "error",
          title: "OTP Failed",
          message:
            res.message ||
            "Failed to send verification code. Please try again.",
          primaryButtonText: "Try Again",
        })
      }
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

    // Only allow digits
    const digit = text.replace(/[^0-9]/g, "")
    newCode[index] = digit

    setVerificationCode(newCode)

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-verify when last digit is entered
    // if (digit && index === 5) {
    //   const fullCode = newCode.join("")
    //   if (fullCode.length === 6) {
    //     handleVerifyCode()
    //   }
    // }
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

    console.log("Verifying code:", code)

    // Validate OTP length
    console.log(code.length)
    if (code.length !== 6) {
      triggerShake()
      showAlert({
        type: "error",
        title: "Incomplete Code",
        message: "Please enter all 6 digits of the verification code.",
        primaryButtonText: "Got it",
      })
      return
    }

    setIsVerifying(true)

    try {
      const data = await verifyOtp(email, code)

      if (data.success) {
        showAlert({
          type: "success",
          title: "Verified Successfully",
          message: "Your email has been verified and you are now signed in.",
          primaryButtonText: "Continue",
        })

        dispatch(setAccessToken(data?.accessToken))

        const userRes = await getMe()

        if (userRes.success) {
          await new Promise((resolve) => {
            dispatch(saveUserToStorage({ user: userRes.user }))

            dispatch(setUser(userRes.user))
            // small delay for state to propagate
            setTimeout(resolve, 0)
          })

          if (userRes.user.role === "PASSENGER") {
            router.push("/(passenger)/(tabs)")
          } else if (userRes.user.role === "DRIVER") {
            router.push("/(driver)/tabs")
          }
        }

        await saveRefreshToken(data.refreshToken)
      } else {
        showAlert({
          type: "error",
          title: "Verification Failed",
          message:
            data.message || "Invalid verification code. Please try again.",
          primaryButtonText: "Try Again",
        })

        // Clear OTP and refocus first input
        setVerificationCode(Array(6).fill(""))
        setTimeout(() => inputRefs.current[0]?.focus(), 500)
      }
    } catch (error) {
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

      // Clear OTP and refocus first input
      setVerificationCode(Array(6).fill(""))
      setTimeout(() => inputRefs.current[0]?.focus(), 500)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    if (timeLeft > 0 || isResending) return

    setIsResending(true)
    try {
      const res = await continueWithEmail(email)

      if (res.success) {
        setTimeLeft(60)
        setVerificationCode(Array(6).fill(""))
        setTimeout(() => inputRefs.current[0]?.focus(), 300)

        showAlert({
          type: "success",
          title: "Code Sent",
          message: "A new verification code has been sent to your email.",
          primaryButtonText: "Got it",
        })
      } else {
        showAlert({
          type: "error",
          title: "Resend Failed",
          message: "Failed to resend code. Please try again.",
          primaryButtonText: "Try Again",
        })
      }
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error",
        message: "Failed to resend code. Please try again.",
        primaryButtonText: "Got it",
      })
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
        style={{ backgroundColor: themeColors.background }}
      >
        <ScrollView
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            className="flex-1 px-6 justify-center"
            style={{ backgroundColor: themeColors.background }}
          >
            {/* Header */}
            <View className="items-center mb-12">
              <Animated.View
                className="w-20 h-20 rounded-2xl items-center justify-center mb-6 border"
                style={{
                  backgroundColor: themeColors.primaryLighter,
                  borderColor: themeColors.primary + "40",
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <Shield size={32} color={themeColors.primary} />
              </Animated.View>

              <Text
                className="text-3xl font-groteskBold text-center mb-3"
                style={{ color: themeColors.text }}
              >
                {codeSent ? "Verify Your Email" : "Continue with Email"}
              </Text>
              <Text
                className="text-base text-center font-geist leading-6 px-4"
                style={{ color: themeColors.mutedText }}
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
                    style={{ color: themeColors.text }}
                  >
                    Email Address
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="w-full border rounded-xl px-4 py-4 text-base font-geist"
                      style={{
                        color: themeColors.text,
                        backgroundColor: themeColors.card,
                        borderColor: themeColors.border,
                      }}
                      placeholder="example@email.com"
                      placeholderTextColor={themeColors.mutedText}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      editable={!isLoading}
                    />
                    {email && (
                      <TouchableOpacity
                        className="absolute right-4 top-4 w-5 h-5 rounded-full items-center justify-center"
                        style={{ backgroundColor: themeColors.gray200 }}
                        onPress={() => setEmail("")}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{ color: themeColors.mutedText }}
                        >
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
                      style={{ color: themeColors.text }}
                    >
                      Verification Code
                    </Text>
                    <View
                      className="flex-row items-center px-3 py-2 rounded-2xl border"
                      style={{
                        backgroundColor: themeColors.card,
                        borderColor: themeColors.border,
                      }}
                    >
                      <Clock
                        size={14}
                        color={
                          timeLeft > 10
                            ? themeColors.success
                            : themeColors.error
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
                  <View
                    className="w-full rounded-full h-1 mb-6 overflow-hidden"
                    style={{ backgroundColor: themeColors.gray200 }}
                  >
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
                        className={`w-12 h-14 rounded-xl border-2 items-center justify-center ${
                          activeInput === index
                            ? "border-orange-500"
                            : digit
                              ? "border-green-500"
                              : "border-gray-300 dark:border-gray-600"
                        }`}
                        style={{
                          backgroundColor: themeColors.card,
                          borderColor:
                            activeInput === index
                              ? themeColors.primary
                              : digit
                                ? themeColors.success
                                : themeColors.border,
                        }}
                      >
                        <TextInput
                          ref={(ref) => (inputRefs.current[index] = ref)}
                          className="w-full text-center font-groteskBold text-xl"
                          style={{ color: themeColors.text }}
                          value={digit}
                          onChangeText={(text) => handleCodeChange(text, index)}
                          onKeyPress={(e) => handleCodeKeyPress(e, index)}
                          onFocus={() => setActiveInput(index)}
                          keyboardType="number-pad"
                          maxLength={1}
                          selectTextOnFocus
                          editable={!isVerifying}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Resend Code */}
                  <View className="flex-row justify-center items-center">
                    <Text
                      className="text-sm mr-3"
                      style={{ color: themeColors.mutedText }}
                    >
                      Did not receive the code?
                    </Text>
                    <TouchableOpacity
                      onPress={handleResendCode}
                      disabled={timeLeft > 0 || isResending}
                      className={`flex-row items-center px-4 py-2 rounded-2xl ${
                        timeLeft > 0 || isResending
                          ? themeColors.gray100
                          : themeColors.primaryLight
                      }`}
                      style={{
                        backgroundColor:
                          timeLeft > 0 || isResending
                            ? themeColors.gray100
                            : themeColors.primaryLight,
                      }}
                    >
                      <RotateCcw
                        size={16}
                        color={
                          timeLeft > 0 || isResending
                            ? themeColors.mutedText
                            : themeColors.primary
                        }
                      />
                      <Text
                        className={`text-sm font-semibold ml-2 ${
                          timeLeft > 0 || isResending
                            ? themeColors.mutedText
                            : themeColors.primary
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
                    className={`w-full rounded-xl py-4 flex-row items-center justify-center ${
                      isLoading ? "opacity-80" : ""
                    }`}
                    style={{ backgroundColor: themeColors.primary }}
                    onPress={handleContinue}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <View className="flex-row items-center justify-center">
                        <ActivityIndicator
                          size="small"
                          color="#FFFFFF"
                          className="mr-3"
                        />
                        <Text className="text-white font-geist text-lg">
                          Sending code...
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-white font-geist text-lg font-semibold">
                        Sign In
                      </Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <TouchableOpacity
                  className="w-full rounded-xl py-4 flex-row items-center justify-center"
                  style={{
                    backgroundColor: themeColors.primary,
                    opacity: verificationCode.join("").length === 6 ? 1 : 0.5,
                  }}
                  onPress={handleVerifyCode}
                  disabled={
                    verificationCode.join("").length !== 6 || isVerifying
                  }
                >
                  {isVerifying ? (
                    <View className="flex-row items-center justify-center">
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                        className="mr-3"
                      />
                      <Text className="text-white font-geist text-lg">
                        Verifying...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-white font-geist text-lg font-semibold">
                      Verify & Continue
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {codeSent && (
                <TouchableOpacity
                  className="w-full border rounded-xl py-4"
                  style={{
                    borderColor: themeColors.border,
                    backgroundColor: themeColors.card,
                  }}
                  onPress={() => {
                    setCodeSent(false)
                    setVerificationCode(Array(6).fill(""))
                  }}
                  disabled={isVerifying}
                >
                  <Text
                    className="text-center font-geist font-semibold text-base"
                    style={{ color: themeColors.text }}
                  >
                    Change Email Address
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Security Footer */}
            <View className="mt-12">
              <View className="flex-row items-center justify-center">
                <Shield size={14} color={themeColors.mutedText} />
                <Text
                  className="text-sm text-center ml-2"
                  style={{ color: themeColors.mutedText }}
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
