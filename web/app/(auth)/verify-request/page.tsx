"use client"

import { Button } from "@/components/ui/button"
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
  Smartphone,
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
import { getMe, verifyOTP } from "@/services/auth.user.api"
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
    if (!canResend) return

    try {
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

            setTimeout(() => {
              if (userRes.user.role === "PASSENGER") {
                router.push("/user")
              }
              if (userRes.user.role === "ADMIN") {
                router.push("/admin")
              }
            }, 1000)
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
    <div className="min-h-screen flex bg-background text-foreground">
      <AuthSlider />

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full lg:w-1/2 items-center justify-center px-8 py-4"
      >
        <div className="w-full max-w-md">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => router.back()}
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </motion.button>

          {/* Header */}
          <div className="mb-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div
                className={cn(
                  "inline-flex p-3 rounded-2xl bg-gradient-to-br relative",
                  verificationStatus === "success"
                    ? "from-green-500/20 to-emerald-500/20"
                    : verificationStatus === "error"
                      ? "from-destructive/20 to-rose-500/20"
                      : "from-primary/20 to-primary/5",
                )}
              >
                <AnimatePresence mode="wait">
                  {verificationStatus === "success" ? (
                    <motion.div
                      key="success"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                    >
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </motion.div>
                  ) : verificationStatus === "error" ? (
                    <motion.div
                      key="error"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <XCircle className="h-8 w-8 text-destructive" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Shield className="h-8 w-8 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-2"
            >
              Verify your email
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground"
            >
              We've sent a 6-digit code to
            </motion.p>
          </div>

          {/* Email Display */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-accent  transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="font-mono text-sm text-foreground">
                    {maskedEmail}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Check your inbox
                  </p>
                </div>
              </div>
              <button
                onClick={copyEmail}
                className="p-2 hover:bg-muted rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </motion.div>

          {/* OTP Input Section */}
          <motion.div
            ref={otpContainerRef}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <div
              className="flex flex-col items-center"
              onKeyDown={handleKeyDown}
            >
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                className="gap-3"
                disabled={
                  verifyPending ||
                  verificationStatus === "verifying" ||
                  verificationStatus === "success"
                }
              >
                <InputOTPGroup>
                  {[0, 1, 2].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      ref={index === 0 ? firstSlotRef : undefined}
                      className={cn(
                        "h-16 w-16 text-2xl font-bold border-2 transition-all duration-200",
                        verificationStatus === "error"
                          ? "border-destructive bg-destructive/5"
                          : verificationStatus === "success"
                            ? "border-green-500 bg-green-500/5"
                            : "border-slate-200 dark:border-slate-800 focus:border-primary",
                      )}
                    />
                  ))}
                </InputOTPGroup>
                <InputOTPGroup>
                  {[3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className={cn(
                        "h-16 w-16 text-2xl font-bold border-2 transition-all duration-200",
                        verificationStatus === "error"
                          ? "border-destructive bg-destructive/5"
                          : verificationStatus === "success"
                            ? "border-green-500 bg-green-500/5"
                            : "border-slate-200 dark:border-slate-800 focus:border-primary",
                      )}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Status Messages */}
            <div className="mt-6 text-center min-h-[40px]">
              <AnimatePresence mode="wait">
                {verificationStatus === "verifying" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center justify-center gap-2 text-primary"
                  >
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Verifying your code...</span>
                  </motion.div>
                )}

                {isOtpCompleted &&
                  verificationStatus === "idle" &&
                  !verifyPending && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2 text-primary"
                    >
                      <Loader className="h-3 w-3 animate-spin" />
                      <span className="text-sm">Auto-verifying...</span>
                    </motion.div>
                  )}

                {attempts > 0 && verificationStatus === "idle" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                  >
                    <AlertCircle className="h-3 w-3" />
                    <span>{3 - attempts} attempts remaining</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Verify Button */}
            <Button
              className={cn(
                "w-full h-14 text-base font-semibold mt-4 relative overflow-hidden group",
                verificationStatus === "success" &&
                  "bg-green-500 hover:bg-green-600",
              )}
              disabled={
                verifyPending ||
                !isOtpCompleted ||
                verificationStatus === "verifying" ||
                verificationStatus === "success"
              }
              onClick={verifyAccount}
              size="lg"
            >
              <AnimatePresence mode="wait">
                {verifyPending || verificationStatus === "verifying" ? (
                  <motion.div
                    key="verifying"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader className="animate-spin h-5 w-5" />
                    Verifying...
                  </motion.div>
                ) : verificationStatus === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Verified!
                  </motion.div>
                ) : (
                  <motion.div
                    key="verify"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Key className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    Verify Account
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* Resend Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            {/* Timer Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  Code expires in
                </span>
                <span
                  className={cn(
                    "font-mono font-medium",
                    resendCooldown < 10 && "text-destructive animate-pulse",
                  )}
                >
                  {formatTime(resendCooldown)}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: `${(resendCooldown / 60) * 100}%` }}
                  className={cn(
                    "h-full rounded-full",
                    resendCooldown < 10 ? "bg-destructive" : "bg-primary",
                  )}
                />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={resendOtp}
              disabled={
                !canResend ||
                verificationStatus === "verifying" ||
                verificationStatus === "success"
              }
              className="w-full h-12 border-2 hover:bg-muted/50 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={cn(
                  "mr-2 h-4 w-4",
                  canResend &&
                    "group-hover:rotate-180 transition-transform duration-500",
                )}
              />
              Resend Code
            </Button>

            {/* Help Text */}
            <p className="text-xs text-center text-muted-foreground">
              Didn't receive the code? Check your spam folder or{" "}
              <button
                onClick={() => toast.info("Contacting support...")}
                className="text-primary hover:underline font-medium"
              >
                contact support
              </button>
            </p>

            {/* Device Trust */}
            <div className="flex items-center justify-center gap-2 pt-4 text-xs text-muted-foreground border-t border-slate-200 dark:border-slate-800">
              <Smartphone className="h-3 w-3" />
              <span>Trust this device? You won't need to verify again</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
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
