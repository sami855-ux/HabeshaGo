"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import {
  Loader,
  Mail,
  Shield,
  Timer,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Key,
  AlertCircle,
  Copy,
  RefreshCw,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useState, useTransition, useEffect, useRef, Suspense } from "react"
import { toast } from "sonner"
import { useDispatch } from "react-redux"
import { setAccessToken, setUser } from "@/store/slices/userSlice"
import { AppDispatch } from "@/store"
import { getMe, verifyOTP, register } from "@/services/auth.user.api"
import { AuthSlider } from "@/components/AuthSlider"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

function VerifyPageContent() {
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
  const [copied, setCopied] = useState(false)

  const firstSlotRef = useRef<HTMLInputElement>(null)
  const otpContainerRef = useRef<HTMLDivElement>(null)

  const email = params.get("email") as string
  const isOtpCompleted = otp.length === 6
  const emailPrefix = email ? email.split("@")[0] : ""
  const emailDomain = email ? email.split("@")[1] : ""
  const maskedEmail = email
    ? `${emailPrefix.substring(0, 2)}${"•".repeat(Math.min(emailPrefix.length - 2, 4))}@${emailDomain}`
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
      const timer = setTimeout(() => {
        verifyAccount()
      }, 500)

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

  // Handle paste event
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      const pastedText = e.clipboardData?.getData("text")
      if (pastedText && /^\d+$/.test(pastedText)) {
        setOtp(pastedText.slice(0, 6))
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [])

  const handleOtpChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setOtp(value)
      setVerificationStatus("idle")
    }
  }

  const resendOtp = async () => {
    if (!canResend || !email) return

    try {
      const res = await register({ email })
      if (!res?.success) {
        toast.error(res?.message || "Failed to resend code")
        return
      }
      setResendCooldown(60)
      setCanResend(false)
      setAttempts(0)
      setOtp("")
      toast.success("New verification code sent!")
    } catch (error) {
      toast.error("Failed to resend code")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const copyEmail = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Email copied to clipboard")
  }

  const verifyAccount = () => {
    if (attempts >= 3) {
      toast.error("Too many attempts. Please request a new code.")
      return
    }

    setVerificationStatus("verifying")
    startTransition(async () => {
      try {
        const res = await verifyOTP({ email, code: otp })

        if (res.success) {
          setVerificationStatus("success")
          toast.success("Email verified successfully!")

          dispatch(setAccessToken(res.data?.accessToken))

          const userRes = await getMe()

          if (userRes.success) {
            dispatch(setUser({ user: userRes.user }))
            if (typeof window !== "undefined") {
              localStorage.setItem("habeshagoUser", JSON.stringify(userRes.user))
            }

            setTimeout(() => {
              if (userRes.user.role === "PASSENGER") {
                router.push("/user")
              } else if (userRes.user.role === "EV_CHARGER_MANAGER") {
                router.push("/ev-charge-manager")
              } else if (userRes.user.role === "PARKING_MANAGER") {
                router.push("/admin/manage-parking")
              } else {
                router.push("/admin")
              }
            }, 800)
          }
        }
      } catch (error: any) {
        console.log(error)
        setVerificationStatus("error")
        toast.error(
          error?.response?.data?.message || "Invalid verification code",
        )
        setAttempts((prev) => prev + 1)

        if (otpContainerRef.current) {
          otpContainerRef.current.classList.add("animate-shake")
          setTimeout(() => {
            otpContainerRef.current?.classList.remove("animate-shake")
          }, 500)
        }
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isOtpCompleted) {
      e.preventDefault()
      verifyAccount()
    }
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden flex bg-slate-50/50 text-slate-900 selection:bg-orange-500/15 selection:text-orange-900 font-inter">
      {/* Left Side: Visual Showcase Slider */}
      <AuthSlider />

      {/* Right Side: Clean Centered Verify Card (No Scrolling) */}
      <div className="flex w-full lg:w-1/2 h-full items-center justify-center p-6 sm:p-10 overflow-hidden font-inter">
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-white border-none rounded-2xl shadow-none overflow-hidden">
            <CardContent className="p-7 sm:p-9 space-y-6">
              {/* Back Button */}
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer font-inter"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>

              {/* Header */}
              <div className="text-center space-y-2">
                <div className="flex lg:hidden items-center justify-center gap-2 mb-2">
                  <span className="text-2xl font-extrabold tracking-tight text-slate-900 font-inter">
                    Habesha<span className="text-orange-500">Go</span>
                  </span>
                </div>

                <div className="inline-flex p-3 rounded-2xl bg-orange-50 text-orange-600 mb-1">
                  <AnimatePresence mode="wait">
                    {verificationStatus === "success" ? (
                      <motion.div
                        key="success"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                      >
                        <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                      </motion.div>
                    ) : verificationStatus === "error" ? (
                      <motion.div
                        key="error"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <XCircle className="h-7 w-7 text-red-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Shield className="h-7 w-7 text-orange-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-inter">
                  Verify your email
                </h1>

                <p className="text-xs sm:text-sm text-slate-500 font-inter">
                  We've sent a 6-digit code to
                </p>

                {/* Email Chip */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs mt-1">
                  <Mail className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <span className="font-semibold text-slate-800 font-inter">
                    {maskedEmail || email || "your email"}
                  </span>
                  {email && (
                    <button
                      type="button"
                      onClick={copyEmail}
                      className="p-1 hover:bg-slate-200/70 rounded-md text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Copy email"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* OTP Input Section */}
              <div
                ref={otpContainerRef}
                className="space-y-4"
                onKeyDown={handleKeyDown}
              >
                <div className="flex justify-center py-1">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={handleOtpChange}
                    disabled={
                      verifyPending ||
                      verificationStatus === "verifying" ||
                      verificationStatus === "success"
                    }
                  >
                    <InputOTPGroup className="gap-2 sm:gap-2.5">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          ref={index === 0 ? firstSlotRef : undefined}
                          className={cn(
                            "h-12 w-10 sm:h-13 sm:w-11 text-lg font-bold bg-white border border-slate-200 rounded-xl text-slate-900 transition-all font-inter shadow-none",
                            "data-[active=true]:border-orange-500 data-[active=true]:ring-2 data-[active=true]:ring-orange-500/20",
                            verificationStatus === "error" &&
                              "border-red-400 bg-red-50/30 text-red-700",
                            verificationStatus === "success" &&
                              "border-emerald-500 bg-emerald-50/30 text-emerald-700",
                          )}
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {/* Status / Feedback Messages */}
                <div className="text-center min-h-[20px]">
                  <AnimatePresence mode="wait">
                    {verificationStatus === "verifying" && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="flex items-center justify-center gap-1.5 text-xs text-orange-600 font-medium font-inter"
                      >
                        <Loader className="h-3.5 w-3.5 animate-spin" />
                        <span>Verifying your code...</span>
                      </motion.div>
                    )}

                    {isOtpCompleted &&
                      verificationStatus === "idle" &&
                      !verifyPending && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-1.5 text-xs text-orange-600 font-medium font-inter"
                        >
                          <Loader className="h-3 w-3 animate-spin" />
                          <span>Auto-verifying...</span>
                        </motion.div>
                      )}

                    {attempts > 0 && verificationStatus === "idle" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center gap-1.5 text-xs text-red-600 font-medium font-inter"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{3 - attempts} attempts remaining</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Verify Button */}
                <Button
                  className={cn(
                    "w-full h-11 text-sm font-semibold rounded-xl shadow-none transition-colors cursor-pointer font-inter",
                    verificationStatus === "success"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white",
                  )}
                  disabled={
                    verifyPending ||
                    !isOtpCompleted ||
                    verificationStatus === "verifying" ||
                    verificationStatus === "success"
                  }
                  onClick={verifyAccount}
                >
                  {verifyPending || verificationStatus === "verifying" ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="animate-spin h-4 w-4 text-white" />
                      <span>Verifying...</span>
                    </div>
                  ) : verificationStatus === "success" ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                      <span>Verified!</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Key className="h-4 w-4 text-white" />
                      <span>Verify Code</span>
                    </div>
                  )}
                </Button>

                {/* Resend & Expiry Timer Row (No Progress Bar) */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-inter">
                  <div className="flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5 text-slate-400" />
                    <span>Expires in</span>
                    <span
                      className={cn(
                        "font-semibold text-slate-700 font-inter",
                        resendCooldown < 10 && "text-red-500 animate-pulse",
                      )}
                    >
                      {formatTime(resendCooldown)}
                    </span>
                  </div>

                  {canResend ? (
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={verificationStatus === "verifying"}
                      className="text-orange-600 hover:text-orange-700 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer font-inter"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Resend code</span>
                    </button>
                  ) : (
                    <span className="text-slate-400 font-inter">
                      Resend in {resendCooldown}s
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  )
}
