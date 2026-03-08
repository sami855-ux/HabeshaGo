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

interface UseProfileVerificationProps {
  onVerificationSuccess: (type: "phone" | "email") => void
}

export function useProfileVerification({
  onVerificationSuccess,
}: UseProfileVerificationProps) {
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

  // Firebase confirmation result
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
    if (!(window as any).recaptchaVerifier) {
      ;(window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        },
      )
    }

    return (window as any).recaptchaVerifier
  }

  const formatPhone = (phone: string) => {
    if (phone.startsWith("0")) {
      return "+251" + phone.slice(1)
    }
    return phone
  }

  const handleSendVerificationCode = async (
    method: "sms" | "call" | "email" = "sms",
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

    try {
      // FIREBASE SMS
      if (type === "phone") {
        const recaptcha = setupRecaptcha()

        const formattedPhone = formatPhone(value)

        const result = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          recaptcha,
        )

        setConfirmationResult(result)
      }

      startCountdown()

      toast.success(`Verification code sent to your ${type}`, {
        description: `Enter the 6-digit code sent to ${value}`,
      })
    } catch (error: any) {
      toast.error("Failed to send code", {
        description: error?.message || "Please try again",
      })

      setVerification((prev) => ({
        ...prev,
        timerActive: false,
        canResend: true,
      }))
    }
  }

  const handleVerifyCode = async () => {
    if (verification.verificationCode.length !== 6) {
      toast.error("Invalid code!", {
        description: "Please enter the complete 6-digit code",
      })
      return
    }

    setVerification((prev) => ({ ...prev, isVerifying: true }))

    try {
      // FIREBASE VERIFY
      if (
        verification.currentVerificationType === "phone" &&
        confirmationResult
      ) {
        await confirmationResult.confirm(verification.verificationCode)

        setVerification((prev) => ({
          ...prev,
          timerActive: false,
          isVerifying: false,
        }))

        toast.success(
          `${verification.currentVerificationType} verified successfully!`,
        )

        onVerificationSuccess(verification.currentVerificationType!)
        setShowVerificationDialog(false)

        return
      }
    } catch (error: any) {
      const newAttempts = verification.attempts + 1

      setVerification((prev) => ({
        ...prev,
        attempts: newAttempts,
        verificationCode: "",
        isVerifying: false,
      }))

      if (newAttempts >= 3) {
        toast.error("Too many attempts!", {
          description: "Please request a new code",
        })

        setVerification((prev) => ({
          ...prev,
          timerActive: false,
          canResend: true,
        }))
      } else {
        toast.error("Invalid code!", {
          description: `Attempt ${newAttempts} of 3`,
        })
      }
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
  }
}
