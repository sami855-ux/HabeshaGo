import { useState } from "react"
import { toast } from "sonner"
import { VerificationState } from "@/types/Profile"

// Firebase
import { auth } from "@/lib/firebase"
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth"
import { sendVerificationEmailAPI, verifyCodeAPI } from "@/services/user.api"
import { useAppDispatch } from "@/store/store"
import { fetchCurrentUser } from "@/store/slices/userSlice"
import { axiosInstance } from "@/services/axiosInstance"

interface UseProfileVerificationProps {
  onVerificationSuccess: (type: "phone" | "email") => void
}

export function useProfileVerification({
  onVerificationSuccess,
}: UseProfileVerificationProps) {
  const dispatch = useAppDispatch()

  const [isSending, setSending] = useState(false)
  const [verification, setVerification] = useState<VerificationState>({
    isVerifying: false,
    verificationCode: "",
    timerActive: false,
    canResend: false,
    attempts: 0,
    verificationMethod: "email",
    currentVerificationType: null,
    tempValue: "",
  })

  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [countdown, setCountdown] = useState(60)

  // Firebase confirmation result (only for phone)
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null)

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setVerification((prev) => ({
            ...prev,
            canResend: true,
            timerActive: false,
          }))
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }

  const setupRecaptcha = () => {
    try {
      // Clear any existing verifier
      if ((window as any).recaptchaVerifier) {
        try {
          ;(window as any).recaptchaVerifier.clear()
        } catch (e) {
          // Ignore clear error
        }
        ;(window as any).recaptchaVerifier = null
      }

      // Check if container exists, if not create it
      let container = document.getElementById("recaptcha-container")
      if (!container) {
        container = document.createElement("div")
        container.id = "recaptcha-container"
        container.style.position = "fixed"
        container.style.bottom = "0"
        container.style.right = "0"
        container.style.zIndex = "9999"
        document.body.appendChild(container)
      }

      // Create new verifier
      ;(window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
          "expired-callback": () => {
            // reCAPTCHA expired
          },
        },
      )

      return (window as any).recaptchaVerifier
    } catch (error) {
      throw error
    }
  }

  const formatPhone = (phone: string) => {
    if (phone.startsWith("0")) {
      return "+251" + phone.slice(1)
    }
    return phone
  }

  const handleSendVerificationCode = async (
    method: "sms" | "email" = "sms",
    value: string,
    type: "phone" | "email",
  ) => {
    setVerification((prev) => ({
      ...prev,
      verificationMethod: method,
      timerActive: true,
      canResend: false,
      attempts: 0,
      verificationCode: "",
      currentVerificationType: type,
      tempValue: value,
    }))

    setShowVerificationDialog(true)
    setSending(true)
    try {
      // PHONE VERIFICATION - Use Firebase
      if (type === "phone") {
        // Small delay to ensure dialog is rendered
        await new Promise((resolve) => setTimeout(resolve, 100))

        const recaptcha = setupRecaptcha()
        const formattedPhone = formatPhone(value)

        const result = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          recaptcha,
        )
        setConfirmationResult(result)
      }
      // EMAIL VERIFICATION - Use your API
      else if (type === "email") {
        // Call your API to send verification email
        await sendVerificationEmailAPI()
      }

      startCountdown()

      toast.success(`Verification code sent to your ${type}`, {
        description: `Enter the 6-digit code sent to ${value}`,
      })
    } catch (error: any) {
      console.error("Send verification error:", error)

      toast.error("Failed to send code", {
        description: error?.message || "Please try again",
      })

      setVerification((prev) => ({
        ...prev,
        timerActive: false,
        canResend: true,
      }))
    } finally {
      setSending(false)
    }
  }

  const handleVerifyCode = async () => {
    console.log("🔵 [VERIFY] Starting verification process", {
      verificationCode: verification.verificationCode,
      currentVerificationType: verification.currentVerificationType,
      tempValue: verification.tempValue,
      attempts: verification.attempts,
      hasConfirmationResult: !!confirmationResult,
    })

    if (verification.verificationCode.length !== 6) {
      console.warn(
        "⚠️ [VERIFY] Invalid code length:",
        verification.verificationCode.length,
      )
      toast.error("Invalid code!", {
        description: "Please enter the complete 6-digit code",
      })
      return
    }

    setVerification((prev) => ({ ...prev, isVerifying: true }))

    try {
      const { currentVerificationType, tempValue, verificationCode } =
        verification

      console.log("🟢 [VERIFY] Verification data:", {
        type: currentVerificationType,
        value: tempValue,
        code: verificationCode,
        timestamp: new Date().toISOString(),
      })

      // PHONE VERIFICATION - Use Firebase
      if (currentVerificationType === "phone") {
        console.log("📱 [VERIFY] Starting phone verification")

        if (!confirmationResult) {
          setVerification((prev) => ({
            ...prev,
            timerActive: false,
            canResend: true,
            isVerifying: false,
          }))
          return
        }

        try {
          const result = await confirmationResult.confirm(verificationCode)

          const idToken = await result.user.getIdToken()
          console.log("✅ [VERIFY] ID token obtained", {
            tokenLength: idToken.length,
          })

          console.log("📱 [VERIFY] Sending verification to backend...")
          const res = await axiosInstance.post("/users/me/phone/verify", {
            idToken,
          })

          console.log("✅ [VERIFY] Backend verification response:", {
            status: res.status,
            data: res.data,
          })

          const data = res.data
        } catch (firebaseError: any) {
          console.error("❌ [VERIFY] Firebase confirmation error:", {
            code: firebaseError.code,
            message: firebaseError.message,
            stack: firebaseError.stack,
          })
          return
        }
      }
      // EMAIL VERIFICATION - Use your API
      else if (currentVerificationType === "email") {
        try {
          await verifyCodeAPI(verificationCode, "email")

          console.log("✅ [VERIFY] Email verification successful")
        } catch (emailError: any) {
          console.error("❌ [VERIFY] Email verification error:", {
            message: emailError.message,
            response: emailError.response?.data,
            status: emailError.response?.status,
          })
          return
        }
      }

      setVerification((prev) => ({
        ...prev,
        timerActive: false,
        isVerifying: false,
      }))

      toast.success(`${currentVerificationType} verified successfully!`)

      onVerificationSuccess(currentVerificationType!)

      setShowVerificationDialog(false)

      dispatch(fetchCurrentUser())
    } catch (error: any) {
      console.error(
        "❌ [VERIFY] Verification error caught in main try-catch:",
        {
          error,
          message: error.message,
          code: error.code,
          response: error.response?.data,
          stack: error.stack,
        },
      )

      const newAttempts = verification.attempts + 1
      console.warn("⚠️ [VERIFY] Incrementing attempts:", {
        oldAttempts: verification.attempts,
        newAttempts,
      })

      setVerification((prev) => ({
        ...prev,
        attempts: newAttempts,
        verificationCode: "",
        isVerifying: false,
      }))

      if (newAttempts >= 3) {
        console.warn("⚠️ [VERIFY] Max attempts reached (3), requiring new code")

        toast.error("Too many attempts!", {
          description: "Please request a new code",
        })

        setVerification((prev) => ({
          ...prev,
          timerActive: false,
          canResend: true,
        }))
      } else {
        console.log(`🟡 [VERIFY] Failed attempt ${newAttempts} of 3`)

        // More specific error messages based on error type
        let errorMessage = "Invalid code!"
        let errorDescription = `Attempt ${newAttempts} of 3`

        if (error.code === "auth/invalid-verification-code") {
          errorDescription = "The code you entered is incorrect"
        } else if (error.code === "auth/code-expired") {
          errorDescription = "This code has expired. Please request a new one"
          // Reset timer for expired code
          setVerification((prev) => ({
            ...prev,
            timerActive: false,
            canResend: true,
          }))
        } else if (error.response?.status === 400) {
          errorDescription =
            error.response.data?.message || "Verification failed"
        }

        toast.error(errorMessage, {
          description: errorDescription,
        })
      }
    } finally {
      console.log("🏁 [VERIFY] Verification process completed")
    }
  }

  const handleResendCode = async () => {
    await handleSendVerificationCode(
      verification.verificationMethod,
      verification.tempValue,
      verification.currentVerificationType!,
    )
  }

  return {
    verification,
    showVerificationDialog,
    setShowVerificationDialog,
    handleSendVerificationCode,
    handleVerifyCode,
    handleResendCode,
    setVerification,
    countdown,
    isSending,
  }
}
