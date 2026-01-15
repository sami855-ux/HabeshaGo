"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Loader, Mail, Shield, Timer, CheckCircle, XCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useState, useTransition, useEffect, useRef } from "react"
import { toast } from "sonner"
import { useDispatch } from "react-redux"
import { setAccessToken, setUser } from "@/store/slices/userSlice"
import { getUserById } from "@/services/user.api"
import { AppDispatch } from "@/store"
import { getMe, verifyOTP } from "@/services/auth.user.api"

function VerifyPage() {
  const dispatch = useDispatch<AppDispatch>()
  const params = useSearchParams()
  const router = useRouter()

  const [otp, setOtp] = useState("")
  const [verifyPending, startTransition] = useTransition()
  const [resendCooldown, setResendCooldown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle")
  const [attempts, setAttempts] = useState(0)

  const firstSlotRef = useRef<HTMLInputElement>(null)

  const email = params.get("email") as string
  const isOtpCompleted = otp.length === 6
  const emailPrefix = email ? email.split("@")[0] : ""
  const maskedEmail = email
    ? `${emailPrefix.substring(0, 3)}***@${email.split("@")[1]}`
    : ""

  // Auto-focus OTP input on mount
  useEffect(() => {
    if (firstSlotRef.current) {
      firstSlotRef.current.focus()
    }
  }, [])

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (isOtpCompleted && !verifyPending && verificationStatus === "idle") {
      // Clear any existing timeout
      const timer = setTimeout(() => {
        verifyAccount()
      }, 500) // Small delay for better UX

      return () => clearTimeout(timer)
    }
  }, [isOtpCompleted, verifyPending, verificationStatus])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendCooldown])

  // Handle OTP change
  const handleOtpChange = (value: string) => {
    setOtp(value)
    setVerificationStatus("idle")
  }

  // Resend OTP
  const resendOtp = async () => {
    if (!canResend) return

    try {
    } catch (error) {
      toast.error("Error resending OTP")
    }
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const verifyAccount = () => {
    if (attempts >= 3) {
      toast.error("Too many attempts. Please request a new OTP.")
      return
    }

    setVerificationStatus("verifying")
    startTransition(async () => {
      try {
        const res = await verifyOTP({ email, code: otp })

        if (res.success) {
          toast.success("Otp verifyed successfully")
          setVerificationStatus("success")

          dispatch(setAccessToken(res.data?.accessToken))

          const userRes = await getMe()

          console.log(userRes)

          if (userRes.success) {
            dispatch(setUser(userRes.user))

            //Dynamic route based on the role
            if (userRes.user.role === "PASSENGER") {
              router.push("/user")
            }
            if (userRes.user.role === "ADMIN") {
              router.push("/admin")
            }
          }
        }

        // Clear OTP on error (except last attempt)
        if (attempts < 2) {
          setTimeout(() => {
            setOtp("")
            if (firstSlotRef.current) {
              firstSlotRef.current.focus()
            }
          }, 500)
        }
      } catch (error) {
        console.log(error?.reponse.data.message || "dhgsjhakj")
        setVerificationStatus("error")
        toast.error("Verification failed. Please try again.")
      }
    })
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isOtpCompleted) {
      e.preventDefault()
      verifyAccount()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md mx-auto border-none shadow-none">
        <CardHeader className="space-y-4 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold">
                Verify your email
              </CardTitle>
              <CardDescription className="pt-2">
                Enter the 6-digit verification code sent to
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{maskedEmail}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OTP Input Section */}
          <div className="space-y-4">
            <div
              className="flex flex-col items-center space-y-4"
              onKeyDown={handleKeyDown}
            >
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                className="gap-3"
                disabled={verifyPending || verificationStatus === "verifying"}
              >
                <InputOTPGroup>
                  <InputOTPSlot
                    index={0}
                    ref={firstSlotRef}
                    className={`h-12 w-12 text-lg font-semibold ${
                      verificationStatus === "error"
                        ? "border-destructive animate-shake"
                        : ""
                    }`}
                  />
                  <InputOTPSlot
                    index={1}
                    className={`h-12 w-12 text-lg font-semibold ${
                      verificationStatus === "error"
                        ? "border-destructive animate-shake"
                        : ""
                    }`}
                  />
                  <InputOTPSlot
                    index={2}
                    className={`h-12 w-12 text-lg font-semibold ${
                      verificationStatus === "error"
                        ? "border-destructive animate-shake"
                        : ""
                    }`}
                  />
                </InputOTPGroup>
                <InputOTPGroup>
                  <InputOTPSlot
                    index={3}
                    className={`h-12 w-12 text-lg font-semibold ${
                      verificationStatus === "error"
                        ? "border-destructive animate-shake"
                        : ""
                    }`}
                  />
                  <InputOTPSlot
                    index={4}
                    className={`h-12 w-12 text-lg font-semibold ${
                      verificationStatus === "error"
                        ? "border-destructive animate-shake"
                        : ""
                    }`}
                  />
                  <InputOTPSlot
                    index={5}
                    className={`h-12 w-12 text-lg font-semibold ${
                      verificationStatus === "error"
                        ? "border-destructive animate-shake"
                        : ""
                    }`}
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Auto-verify notice */}
            {isOtpCompleted &&
              verificationStatus === "idle" &&
              !verifyPending && (
                <div className="text-center text-sm text-primary animate-pulse">
                  Auto-verifying...
                </div>
              )}

            {/* Attempts counter */}
            {attempts > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                Attempts: {attempts}/3
              </div>
            )}
          </div>

          {/* Verify Button */}
          <Button
            className="w-full"
            disabled={
              verifyPending ||
              !isOtpCompleted ||
              verificationStatus === "verifying"
            }
            onClick={verifyAccount}
            size="lg"
          >
            {verifyPending || verificationStatus === "verifying" ? (
              <>
                <Loader className="animate-spin mr-2 size-4" />
                Verifying...
              </>
            ) : (
              "Verify Account"
            )}
          </Button>

          {/* Resend OTP Section */}
          <div className="pt-4 border-t">
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Timer className="h-4 w-4" />
                <span>
                  {canResend ? (
                    "Ready to resend"
                  ) : (
                    <>
                      Resend available in{" "}
                      <span className="font-medium text-foreground">
                        {formatTime(resendCooldown)}
                      </span>
                    </>
                  )}
                </span>
              </div>

              <Button
                variant="outline"
                onClick={resendOtp}
                disabled={!canResend || verificationStatus === "verifying"}
                className="w-full border-none bg-transparent"
              >
                Resend OTP
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VerifyPage
