import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Phone,
  Clock,
  Key,
} from "lucide-react-native"
import React, { useState, useRef, useEffect } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native"
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha"

import AlertModal from "@/components/utils/AlertModal"
import { useThemeContext } from "@/context/ThemeContext"
import { useRouter } from "expo-router"
import app, { auth } from "@/lib/firebase"
import { signInWithPhoneNumber, ConfirmationResult } from "firebase/auth"

import { useAppDispatch } from "@/store"
import { setAccessToken, setUser } from "@/store/slices/userSlice"
import { axiosInstance } from "@/service/axiosInstance"
import { getMe } from "@/service/auth"
import { saveRefreshToken } from "@/lib/refreshToken"

const PhoneNumberScreen = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { colors, actualTheme } = useThemeContext()
  const isDark = actualTheme === "dark"

  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null)
  const confirmationResultRef = useRef<ConfirmationResult | null>(null)

  // ─── Phone step state ───────────────────────────────────────────────────────
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [isPhoneValid, setIsPhoneValid] = useState(false)
  const [phoneError, setPhoneError] = useState("")

  // ─── OTP step state ─────────────────────────────────────────────────────────
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [otpError, setOtpError] = useState("")
  const [otpVerified, setOtpVerified] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // ─── Loading state ──────────────────────────────────────────────────────────
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)

  // ─── Alert modal ────────────────────────────────────────────────────────────
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertConfig, setAlertConfig] = useState<any>({})

  const otpRefs = useRef<(TextInput | null)[]>([])

  const countryCode = "+251"

  // ─── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // ─── Phone validation ────────────────────────────────────────────────────────
  const validatePhone = (raw: string) => {
    const clean = raw.replace(/\D/g, "")
    if (clean.length < 9) return ""
    if (clean.length === 9 && (clean.startsWith("9") || clean.startsWith("7")))
      return ""
    return "Phone number must start with 9 or 7"
  }

  const formatPhone = (text: string) => {
    const clean = text.replace(/\D/g, "").slice(0, 9)
    if (clean.length <= 3) return clean
    if (clean.length <= 6) return `${clean.slice(0, 3)} ${clean.slice(3)}`
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`
  }

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhone(text)
    setPhoneNumber(formatted)
    const clean = text.replace(/\D/g, "")
    const error = validatePhone(clean)
    setPhoneError(error)
    setIsPhoneValid(clean.length === 9 && !error)
  }

  // ─── Send OTP - FIXED ────────────────────────────────────────────────────────
  const sendOtp = async () => {
    const clean = phoneNumber.replace(/\D/g, "")
    const error = validatePhone(clean)
    if (error) {
      setPhoneError(error)
      return
    }

    const fullPhone = countryCode + clean
    setSendingOtp(true)

    try {
      // Check if recaptcha verifier exists
      if (!recaptchaVerifier.current) {
        throw new Error("reCAPTCHA not initialized")
      }

      console.log("Sending OTP to:", fullPhone)

      // Send OTP - this will automatically show reCAPTCHA if needed
      const confirmation = await signInWithPhoneNumber(
        auth,
        fullPhone,
        recaptchaVerifier.current,
      )

      console.log("OTP sent successfully")
      confirmationResultRef.current = confirmation
      setOtpSent(true)
      setCountdown(60)

      showAlert({
        type: "success",
        title: "Code Sent",
        message: `Verification code sent to ${fullPhone}`,
        primaryButtonText: "OK",
      })
    } catch (e: any) {
      console.error("Send OTP error:", e)

      let errorMessage = "Please check your number and try again."
      if (e.code === "auth/invalid-phone-number") {
        errorMessage = "Invalid phone number format."
      } else if (e.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later."
      } else if (e.code === "auth/quota-exceeded") {
        errorMessage = "SMS quota exceeded. Please try again later."
      } else if (e.message) {
        errorMessage = e.message
      }

      showAlert({
        type: "error",
        title: "Failed to Send Code",
        message: errorMessage,
        primaryButtonText: "OK",
      })
    } finally {
      setSendingOtp(false)
    }
  }

  // ─── Resend OTP ──────────────────────────────────────────────────────────────
  const resendOtp = async () => {
    if (countdown > 0) return

    const clean = phoneNumber.replace(/\D/g, "")
    const fullPhone = countryCode + clean

    setSendingOtp(true)
    try {
      if (!recaptchaVerifier.current) {
        throw new Error("reCAPTCHA not initialized")
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        fullPhone,
        recaptchaVerifier.current,
      )

      confirmationResultRef.current = confirmation
      setOtp(["", "", "", "", "", ""])
      setOtpError("")
      setCountdown(60)
      otpRefs.current[0]?.focus()

      showAlert({
        type: "success",
        title: "Code Resent",
        message: `A new code was sent to ${fullPhone}`,
        primaryButtonText: "OK",
      })
    } catch (e: any) {
      console.error("Resend error:", e)
      showAlert({
        type: "error",
        title: "Failed to Resend",
        message: e.message || "Please try again.",
        primaryButtonText: "OK",
      })
    } finally {
      setSendingOtp(false)
    }
  }

  // ─── Verify OTP ──────────────────────────────────────────────────────────────
  const verifyOtp = async () => {
    console.log("🔐 Verifying OTP:", code)
    if (!confirmationResultRef.current) {
      setOtpError("Please request a code first")
      return
    }
    const code = otp.join("")
    if (code.length !== 6) {
      setOtpError("Please enter all 6 digits")
      return
    }

    setVerifyingOtp(true)
    try {
      console.log("🔐 Verifying OTP:", code)

      const result = await confirmationResultRef.current.confirm(code)
      console.log("✅ Firebase confirmation successful")

      const idToken = await result.user.getIdToken()
      console.log("🔑 ID Token obtained")

      console.log("📡 Sending verification request to backend...")
      const res = await axiosInstance.post("/auth/app/register/phone/verify", {
        idToken,
      })

      console.log("📦 Backend response:", JSON.stringify(res.data, null, 2))

      const data = res.data

      if (res.status !== 200 || !data.success) {
        console.error("❌ Verification failed:", data.message)
        throw new Error(data.message || "Verification failed")
      }

      console.log("✅ Verification successful!")

      // Save access token
      if (data.accessToken) {
        console.log("💾 Saving access token...")
        dispatch(setAccessToken(data.accessToken))
        console.log("✅ Access token saved")
      }

      // Save refresh token - CHECK WHERE IT IS IN RESPONSE
      let refreshTokenToSave = null

      // Try different possible locations for refresh token
      if (data.res?.refreshToken) {
        refreshTokenToSave = data.res.refreshToken
        console.log("📍 Found refresh token in data.res.refreshToken")
      } else if (data.refreshToken) {
        refreshTokenToSave = data.refreshToken
        console.log("📍 Found refresh token in data.refreshToken")
      } else if (data.data?.refreshToken) {
        refreshTokenToSave = data.data.refreshToken
        console.log("📍 Found refresh token in data.data.refreshToken")
      } else if (data.refresh_token) {
        refreshTokenToSave = data.refresh_token
        console.log("📍 Found refresh token in data.refresh_token")
      }

      if (refreshTokenToSave) {
        console.log("💾 Saving refresh token to SecureStore...")
        await saveRefreshToken(refreshTokenToSave)
        console.log("✅ Refresh token saved successfully")
      } else {
        console.warn(
          "⚠️ No refresh token found in response. Response structure:",
          Object.keys(data),
        )
      }

      setOtpVerified(true)

      // Fetch user data
      console.log("👤 Fetching user data...")
      const userRes = await getMe()
      console.log(
        "👤 User data response:",
        userRes.success ? "Success" : "Failed",
      )

      if (userRes.success) {
        console.log("✅ User data fetched successfully")
        dispatch(setUser({ user: userRes.user }))

        showAlert({
          type: "success",
          title: "Login Successful",
          message: `Welcome back, ${userRes.user.name || "User"}!`,
          primaryButtonText: "Continue",
          onPrimaryPress: () => {
            console.log("🚀 Navigating to dashboard...")
            setTimeout(() => {
              if (userRes.user.role === "PASSENGER") {
                router.push("/(passenger)/(tabs)")
              } else {
                router.push("/(driver)/tabs")
              }
            }, 500)
          },
        })
      } else {
        console.error("❌ Failed to fetch user data:", userRes)
        throw new Error("Failed to fetch user information")
      }
    } catch (e: any) {
      console.error("❌ Verification error:", e)
      setOtpError(e?.response?.data?.message || e.message || "Invalid code")
    } finally {
      setVerifyingOtp(false)
    }
  }

  const handleOtpChange = (val: string, i: number) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    setOtpError("")
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
    if (next.every((d) => d !== "") && i === 5 && !verifyingOtp) {
      verifyOtpWithCode(next.join(""))
    }
  }

  const handleOtpKeyPress = (e: any, i: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus()
    }
  }

  const verifyOtpWithCode = async (code: string) => {
    if (!confirmationResultRef.current) return
    setVerifyingOtp(true)
    try {
      const result = await confirmationResultRef.current.confirm(code)
      const idToken = await result.user.getIdToken()
      const res = await axiosInstance.post("/auth/app/register/phone/verify", {
        idToken,
      })
      const data = res.data
      if (res.status !== 200 || !data.success) throw new Error(data.message)
      setOtpVerified(true)
      dispatch(setAccessToken(data.accessToken))

      console.log(data)
      await saveRefreshToken(data.refreshToken)

      const userRes = await getMe()
      if (userRes.success) {
        dispatch(setUser({ user: userRes.user }))
        setTimeout(() => {
          if (userRes.user.role === "PASSENGER")
            router.push("/(passenger)/(tabs)")
          else router.push("/(driver)/tabs")
        }, 800)
      }
    } catch (e: any) {
      setOtpError(e?.response?.data?.message || e.message || "Invalid code")
    } finally {
      setVerifyingOtp(false)
    }
  }

  const resetToPhone = () => {
    setOtpSent(false)
    setOtp(["", "", "", "", "", ""])
    setOtpError("")
    setOtpVerified(false)
    setCountdown(0)
    confirmationResultRef.current = null
  }

  const showAlert = (config: any) => {
    setAlertConfig(config)
    setAlertVisible(true)
  }

  const getInputBorderColor = () => {
    if (phoneError && phoneNumber.replace(/\D/g, "").length >= 9)
      return colors.error
    if (isFocused) return colors.primary
    return colors.border
  }

  const isContinueDisabled = !isPhoneValid || sendingOtp

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* reCAPTCHA Modal */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        attemptInvisibleVerification={false}
        title="Verify you're human"
        cancelLabel="Cancel"
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View
              style={{
                flex: 1,
                paddingHorizontal: 24,
                paddingVertical: 64,
                justifyContent: "space-between",
              }}
            >
              {/* ── Header ── */}
              <View style={{ alignItems: "center", marginBottom: 48 }}>
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
                  style={{
                    fontSize: 28,
                    fontWeight: "700",
                    textAlign: "center",
                    color: colors.text,
                    marginBottom: 12,
                  }}
                >
                  {otpSent
                    ? "Enter Verification Code"
                    : "Continue With Your Phone"}
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    textAlign: "center",
                    paddingHorizontal: 16,
                    lineHeight: 24,
                    color: colors.mutedText,
                  }}
                >
                  {otpSent
                    ? `We sent a 6-digit code to ${countryCode} ${phoneNumber}`
                    : "We'll send you a verification code to confirm your phone number."}
                </Text>
              </View>

              {/* ── STEP 1: Phone input ── */}
              {!otpSent && (
                <View style={{ marginBottom: 32 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      marginBottom: 8,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      color: colors.mutedText,
                    }}
                  >
                    Phone Number
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderRadius: 12,
                      height: 56,
                      paddingHorizontal: 16,
                      borderWidth: 2,
                      borderColor: getInputBorderColor(),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: colors.text,
                      }}
                    >
                      {countryCode}
                    </Text>
                    <View
                      style={{
                        width: 1,
                        height: 24,
                        marginHorizontal: 12,
                        backgroundColor: colors.border,
                      }}
                    />
                    <TextInput
                      style={{ flex: 1, fontSize: 15, color: colors.text }}
                      placeholder="912 345 678"
                      placeholderTextColor={colors.mutedText}
                      value={phoneNumber}
                      onChangeText={handlePhoneChange}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      keyboardType="phone-pad"
                      maxLength={11}
                      autoComplete="tel"
                    />
                    {isPhoneValid && (
                      <CheckCircle
                        size={20}
                        color={colors.success ?? "#059669"}
                      />
                    )}
                  </View>

                  {!!phoneError &&
                    phoneNumber.replace(/\D/g, "").length >= 9 && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 6,
                          marginLeft: 4,
                        }}
                      >
                        <AlertCircle size={14} color={colors.error} />
                        <Text
                          style={{
                            fontSize: 13,
                            marginLeft: 4,
                            color: colors.error,
                          }}
                        >
                          {phoneError}
                        </Text>
                      </View>
                    )}

                  <Text
                    style={{
                      marginTop: 8,
                      marginLeft: 4,
                      fontSize: 12,
                      fontStyle: "italic",
                      color: colors.mutedText,
                    }}
                  >
                    Format: 9XX XXX XXX or 7XX XXX XXX
                  </Text>
                </View>
              )}

              {/* ── STEP 2: OTP input ── */}
              {otpSent && (
                <View style={{ marginBottom: 32 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 12,
                      borderRadius: 10,
                      marginBottom: 24,
                      backgroundColor: isDark ? colors.card : "#f3f4f6",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Phone size={16} color={colors.mutedText} />
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "500",
                          color: colors.text,
                        }}
                      >
                        {countryCode} {phoneNumber}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={resetToPhone}>
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.primary,
                          fontWeight: "600",
                        }}
                      >
                        Change
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      gap: 10,
                      marginBottom: 16,
                    }}
                  >
                    {otp.map((digit, i) => (
                      <TextInput
                        key={i}
                        ref={(r) => (otpRefs.current[i] = r)}
                        value={digit}
                        onChangeText={(v) => handleOtpChange(v, i)}
                        onKeyPress={(e) => handleOtpKeyPress(e, i)}
                        maxLength={1}
                        keyboardType="number-pad"
                        secureTextEntry={!otpVerified}
                        editable={!verifyingOtp && !otpVerified}
                        style={{
                          width: 46,
                          height: 56,
                          borderWidth: 2,
                          borderRadius: 10,
                          textAlign: "center",
                          fontSize: 22,
                          fontWeight: "600",
                          color: colors.text,
                          borderColor: digit
                            ? otpVerified
                              ? (colors.success ?? "#059669")
                              : colors.primary
                            : colors.border,
                          backgroundColor: digit
                            ? isDark
                              ? colors.card
                              : otpVerified
                                ? "#ECFDF5"
                                : "#EEF2FF"
                            : "transparent",
                        }}
                      />
                    ))}
                  </View>

                  {otpVerified && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        marginBottom: 12,
                      }}
                    >
                      <CheckCircle
                        size={16}
                        color={colors.success ?? "#059669"}
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          color: colors.success ?? "#059669",
                          fontWeight: "500",
                        }}
                      >
                        Code verified
                      </Text>
                    </View>
                  )}

                  {!!otpError && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        marginBottom: 12,
                      }}
                    >
                      <AlertCircle size={14} color={colors.error} />
                      <Text style={{ fontSize: 13, color: colors.error }}>
                        {otpError}
                      </Text>
                    </View>
                  )}

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Clock size={14} color={colors.mutedText} />
                      <Text style={{ fontSize: 13, color: colors.mutedText }}>
                        {countdown > 0 ? (
                          <>
                            Resend in{" "}
                            <Text style={{ fontWeight: "700" }}>
                              {countdown}s
                            </Text>
                          </>
                        ) : (
                          "Code expired"
                        )}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={resendOtp}
                      disabled={countdown > 0 || sendingOtp || verifyingOtp}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color:
                            countdown > 0 || sendingOtp
                              ? colors.mutedText
                              : colors.primary,
                        }}
                      >
                        {sendingOtp ? "Sending..." : "Resend Code"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ── Primary action button ── */}
              {!otpSent ? (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 56,
                    borderRadius: 12,
                    backgroundColor: isContinueDisabled
                      ? colors.border
                      : colors.primary,
                  }}
                  onPress={sendOtp}
                  disabled={isContinueDisabled}
                >
                  {sendingOtp ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          marginRight: 8,
                          color: isContinueDisabled ? colors.mutedText : "#fff",
                        }}
                      >
                        Send Verification Code
                      </Text>
                      <ArrowRight
                        size={20}
                        color={isContinueDisabled ? colors.mutedText : "#fff"}
                      />
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 56,
                    borderRadius: 12,
                    backgroundColor:
                      otp.join("").length < 6 || verifyingOtp || otpVerified
                        ? colors.border
                        : colors.primary,
                  }}
                  onPress={verifyOtp}
                  disabled={
                    otp.join("").length < 6 || verifyingOtp || otpVerified
                  }
                >
                  {verifyingOtp ? (
                    <ActivityIndicator color="#fff" />
                  ) : otpVerified ? (
                    <>
                      <CheckCircle
                        size={20}
                        color="#fff"
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#fff",
                        }}
                      >
                        Verified
                      </Text>
                    </>
                  ) : (
                    <>
                      <Key
                        size={20}
                        color={
                          otp.join("").length < 6 ? colors.mutedText : "#fff"
                        }
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color:
                            otp.join("").length < 6 ? colors.mutedText : "#fff",
                        }}
                      >
                        Verify Code
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <View style={{ marginTop: 32 }}>
                <Text
                  style={{
                    fontSize: 11,
                    textAlign: "center",
                    color: colors.mutedText,
                  }}
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
