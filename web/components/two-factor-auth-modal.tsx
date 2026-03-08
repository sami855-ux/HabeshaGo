// components/two-factor-auth-modal.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, Mail, Smartphone, Key } from "lucide-react"

export type OTPMethod = "email" | "sms" | "authenticator"

interface TwoFactorAuthModalProps {
  // Modal state
  open: boolean
  onOpenChange: (open: boolean) => void

  // Callbacks
  onVerified: () => void
  onClose?: () => void

  // OTP Configuration
  userId?: string
  sessionId?: string
  otpRequestEndpoint: string
  otpVerifyEndpoint: string
  otpMethod?: OTPMethod
  otpLength?: number

  // UI Customization
  title?: string
  description?: string
  actionName?: string
  showResendButton?: boolean
  resendCooldown?: number // in seconds

  // Optional pre-verification callback
  onBeforeVerify?: () => Promise<void> | void
}

export function TwoFactorAuthModal({
  open,
  onOpenChange,
  onVerified,
  onClose,
  userId,
  sessionId,
  otpRequestEndpoint,
  otpVerifyEndpoint,
  otpMethod = "email",
  otpLength = 6,
  title = "Two-Factor Authentication",
  description = "Please enter the verification code sent to your device.",
  actionName = "verify",
  showResendButton = true,
  resendCooldown = 30,
  onBeforeVerify,
}: TwoFactorAuthModalProps) {
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(""))
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [countdown, setCountdown] = useState(resendCooldown)
  const [isCountdownActive, setIsCountdownActive] = useState(true)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Method display configuration
  const methodConfig = {
    email: {
      icon: Mail,
      label: "Email",
      message: "Check your email for the verification code.",
    },
    sms: {
      icon: Smartphone,
      label: "SMS",
      message: "Check your phone for the SMS verification code.",
    },
    authenticator: {
      icon: Key,
      label: "Authenticator App",
      message: "Enter the code from your authenticator app.",
    },
  }

  const currentMethod = methodConfig[otpMethod]

  // Countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isCountdownActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsCountdownActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isCountdownActive, countdown])

  // Request OTP when modal opens
  useEffect(() => {
    if (open) {
      requestOtp()
      resetForm()
      // Focus first input when modal opens
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [open])

  const resetForm = () => {
    setOtp(Array(otpLength).fill(""))
    setError("")
    setSuccess("")
    setCountdown(resendCooldown)
    setIsCountdownActive(true)
  }

  const requestOtp = async () => {
    try {
      setError("")
      setSuccess("Sending verification code...")

      const response = await fetch(otpRequestEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          sessionId,
          method: otpMethod,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send verification code")
      }

      setSuccess(`Verification code sent to your ${currentMethod.label}`)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Failed to send verification code. Please try again.")
      console.error("OTP request error:", err)
    }
  }

  const resendOtp = async () => {
    if (isResending || isCountdownActive) return

    setIsResending(true)
    setError("")

    try {
      await requestOtp()
      setCountdown(resendCooldown)
      setIsCountdownActive(true)
    } finally {
      setIsResending(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit if all digits are entered
    if (newOtp.every((digit) => digit !== "") && index === otpLength - 1) {
      handleVerify()
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move focus to previous input on backspace
      inputRefs.current[index - 1]?.focus()
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    if (e.key === "ArrowRight" && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()

    if (!/^\d+$/.test(pastedData)) {
      setError("Please paste only numbers")
      return
    }

    const digits = pastedData.slice(0, otpLength).split("")
    const newOtp = [...otp]

    digits.forEach((digit, index) => {
      if (index < otpLength) {
        newOtp[index] = digit
      }
    })

    setOtp(newOtp)

    // Focus the last filled input
    const lastFilledIndex = Math.min(digits.length - 1, otpLength - 1)
    inputRefs.current[lastFilledIndex]?.focus()
  }

  const handleVerify = async () => {
    const otpString = otp.join("")

    if (otpString.length !== otpLength) {
      setError(`Please enter ${otpLength} digit code`)
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Optional pre-verification hook
      if (onBeforeVerify) {
        await Promise.resolve(onBeforeVerify())
      }

      const response = await fetch(otpVerifyEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          sessionId,
          otp: otpString,
          method: otpMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Verification failed")
      }

      if (data.success) {
        setSuccess("Verification successful!")
        setTimeout(() => {
          onVerified()
          onOpenChange(false)
          resetForm()
        }, 1000)
      } else {
        setError(data.message || "Invalid verification code")
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Verification failed. Please try again."
      )
      console.error("OTP verification error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
    onClose?.()
  }

  const IconComponent = currentMethod.icon

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-xl bg-background text-foreground border-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Method indicator */}
          <div className="flex items-center justify-center gap-2 mb-6 p-3 rounded-lg bg-muted/50">
            <IconComponent className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{currentMethod.message}</span>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <AlertDescription className="text-green-800 dark:text-green-200">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* OTP Input */}
          <div className="space-y-3">
            <Label htmlFor="otp-input" className="text-base">
              Enter {otpLength}-digit code
            </Label>
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-background border-border focus:border-primary focus:ring-primary"
                  aria-label={`Digit ${index + 1} of ${otpLength}`}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Resend OTP Section */}
          {showResendButton && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={resendOtp}
                disabled={isResending || isCountdownActive}
                className="text-primary hover:text-primary/80"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : isCountdownActive ? (
                  `Resend in ${countdown}s`
                ) : (
                  "Resend code"
                )}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="space-x-3 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-border hover:bg-muted cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              `Confirm ${actionName}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
