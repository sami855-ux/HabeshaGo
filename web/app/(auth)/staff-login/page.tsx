"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  Download,
  AlertCircle,
  Smartphone,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { cn } from "@/lib/utils"
import type { User } from "@/types/user"
import { setAccessToken, setUser } from "@/store/slices/userSlice"
import {
  staffLoginApi,
  staffVerifyMFAApi,
  staffSetupPendingTOTPApi,
  staffEnablePendingTOTPApi,
  type StaffAuthUser,
  type StaffSetupData,
} from "@/services/staff.auth.api"

export default function StaffLoginPage() {
  const router = useRouter()
  const dispatch = useDispatch()

  // Step 1: Credentials, Step 2: 2FA Verification (if setup) or 2FA Setup (if not setup)
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1: Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockActive, setCapsLockActive] = useState(false)
  const [loginPending, setLoginPending] = useState(false)
  const [formError, setFormError] = useState("")

  // Step 2: Authenticated Staff Context
  const [mfaToken, setMfaToken] = useState("")
  const [hasTotp, setHasTotp] = useState(false)
  const [mfaUser, setMfaUser] = useState<{
    id: string
    name: string | null
    email: string
    role: string
  } | null>(null)
  const [sessionSeconds, setSessionSeconds] = useState(300)

  // Step 2A (2FA already set up): Verification state
  const [totpCode, setTotpCode] = useState("")
  const [useRecoveryPhrase, setUseRecoveryPhrase] = useState(false)
  const [recoveryPhrase, setRecoveryPhrase] = useState("")
  const [verifyPending, setVerifyPending] = useState(false)

  // Step 2B (2FA NOT set up): Inline Setup state
  const [setupData, setSetupData] = useState<StaffSetupData | null>(null)
  const [enrollmentAuthorized, setEnrollmentAuthorized] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)
  const [setupActivating, setSetupActivating] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedPhrases, setCopiedPhrases] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  // Detect Caps Lock key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState("CapsLock"))
    }
  }

  // Session countdown timer in Step 2
  useEffect(() => {
    if (step !== 2) return
    const timer = setInterval(() => {
      setSessionSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          toast.error("Session expired. Please log in again.")
          setStep(1)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [step])

  // Finalize successful authentication
  const finishLogin = (accessToken: string, user: StaffAuthUser) => {
    dispatch(setAccessToken(accessToken))
    dispatch(setUser({ user: user as unknown as User }))
    if (typeof window !== "undefined") {
      localStorage.setItem("habeshagoUser", JSON.stringify(user))
    }

    toast.success(`Welcome back, ${user.name || user.email}!`)
    setTimeout(() => {
      if (user.role === "ADMIN") router.replace("/admin")
      else if (user.role === "EV_CHARGER_MANAGER") router.replace("/ev-charge-manager")
      else if (user.role === "PARKING_MANAGER") router.replace("/admin/manage-parking")
      else router.replace("/admin")
    }, 500)
  }

  // -------------------------------------------------------------
  // STEP 1: Submit Work Email & Password
  // -------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!email || !password) {
      setFormError("Please enter both work email and password")
      return
    }

    setLoginPending(true)
    try {
      const res = await staffLoginApi({
        email: email.trim(),
        password,
      })

      if (!res.success || !res.data) {
        setFormError(res.message || "Invalid credentials or unauthorized staff role")
        toast.error(res.message || "Staff sign in failed")
        return
      }

      setMfaToken(res.data.mfaToken)
      setMfaUser(res.data.user)
      setSessionSeconds(res.data.expiresIn || (res.data.hasTotp ? 300 : 900))

      if (res.data.hasTotp) {
        // 2FA is already set up: prompt for 6-digit authenticator code
        setHasTotp(true)
        setTotpCode("")
        setUseRecoveryPhrase(false)
        setStep(2)
        toast.success("Credentials verified. Enter your 2FA code.")
      } else {
        // First enrollment must verify the emailed code before setup details
        // are disclosed.
        setHasTotp(false)
        setEnrollmentAuthorized(false)
        setSetupData(null)
        setTotpCode("")
        setStep(2)
        toast.info("Enter the verification code sent to your work email.")
      }
    } catch (err: any) {
      setFormError("An unexpected error occurred. Please try again.")
    } finally {
      setLoginPending(false)
    }
  }

  // Fetch pending setup details if needed
  const loadPendingSetup = async (token: string) => {
    setSetupLoading(true)
    try {
      const res = await staffSetupPendingTOTPApi(token)
      if (res.success && res.data) {
        setSetupData(res.data)
      } else {
        toast.error(res.message || "Failed to load 2FA setup details")
      }
    } catch {
      toast.error("Failed to load 2FA setup details")
    } finally {
      setSetupLoading(false)
    }
  }

  // -------------------------------------------------------------
  // STEP 2A: Verify 2FA Code (when 2FA is already configured)
  // -------------------------------------------------------------
  const handleVerifyTotp = async (codeToVerify?: string) => {
    const code = codeToVerify || (useRecoveryPhrase ? recoveryPhrase : totpCode)

    if (!code || !code.trim()) {
      toast.error(
        useRecoveryPhrase
          ? "Please enter your recovery phrase"
          : "Please enter the 6-digit code",
      )
      return
    }

    setVerifyPending(true)
    try {
      const res = await staffVerifyMFAApi({
        mfaToken,
        code: code.trim(),
      })

      if (!res.success || !res.data) {
        toast.error(res.message || "Invalid verification code")
        return
      }

      if (res.data.setupRequired) {
        const enrollmentToken =
          res.data.enrollmentToken || res.data.mfaToken
        if (!enrollmentToken) {
          toast.error("The server did not return an enrollment token.")
          return
        }
        setMfaToken(enrollmentToken)
        setEnrollmentAuthorized(true)
        setSessionSeconds(res.data.expiresIn || 600)
        setTotpCode("")
        await loadPendingSetup(enrollmentToken)
        toast.success("Email verified. Connect your authenticator app.")
        return
      }

      if (!res.data.accessToken) {
        toast.error("Authentication response did not include an access token.")
        return
      }
      finishLogin(res.data.accessToken, res.data.user)
    } catch {
      toast.error("2FA verification failed. Please try again.")
    } finally {
      setVerifyPending(false)
    }
  }

  // Auto-submit 6-digit TOTP code when 6 digits are typed
  useEffect(() => {
    if (
      step === 2 &&
      hasTotp &&
      !useRecoveryPhrase &&
      totpCode.length === 6 &&
      !verifyPending
    ) {
      handleVerifyTotp(totpCode)
    }
  }, [step, hasTotp, useRecoveryPhrase, totpCode])

  // -------------------------------------------------------------
  // STEP 2B: Finish Setup & Sign In (Confirmed by Alert Dialog)
  // -------------------------------------------------------------
  const handleCompleteSetup = async () => {
    if (!/^\d{6}$/.test(totpCode)) {
      toast.error("Enter the 6-digit code from your authenticator app.")
      return
    }
    setSetupActivating(true)
    try {
      const res = await staffEnablePendingTOTPApi(mfaToken, totpCode)

      if (!res.success || !res.data) {
        toast.error(res.message || "Failed to complete 2FA setup. Please try again.")
        return
      }

      toast.success("Two-factor authentication enabled successfully!")
      if (!res.data.accessToken) {
        toast.error("Authentication response did not include an access token.")
        return
      }
      finishLogin(res.data.accessToken, res.data.user)
    } catch {
      toast.error("Failed to activate 2FA. Please try again.")
    } finally {
      setSetupActivating(false)
    }
  }

  // Copy helpers
  const copyToClipboard = (text: string, type: "secret" | "phrases") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      if (type === "secret") {
        setCopiedSecret(true)
        setTimeout(() => setCopiedSecret(false), 2000)
      } else {
        setCopiedPhrases(true)
        setTimeout(() => setCopiedPhrases(false), 2000)
      }
      toast.success("Copied to clipboard!")
    }
  }

  // Download recovery phrases as .txt file
  const downloadRecoveryCard = (phrases: string[]) => {
    const content = [
      "==================================================",
      "   HABESHAGO STAFF RECOVERY PHRASES (BACKUP)     ",
      "==================================================",
      `Generated: ${new Date().toLocaleString()}`,
      `Staff Account: ${mfaUser?.email || email || "Staff Member"}`,
      "",
      "IMPORTANT NOTICE:",
      "Store these single-use recovery phrases in a secure location.",
      "If you ever lose access to your authenticator app, enter any one",
      "of these phrases on the staff login portal to authenticate.",
      "",
      "--------------------------------------------------",
      ...phrases.map((p, i) => `Phrase ${i + 1}: ${p}`),
      "--------------------------------------------------",
      "Note: Each phrase can only be used ONCE.",
      "==================================================",
    ].join("\n")

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `habeshago-staff-recovery-phrases-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Recovery phrases downloaded!")
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-50/60 text-slate-900 selection:bg-orange-500/15 selection:text-orange-900 font-inter relative">
      <div
        className={cn(
          "w-full mx-auto transition-all duration-300",
          step === 2 && !hasTotp ? "max-w-4xl lg:max-w-5xl" : "max-w-md",
        )}
      >
        <Card className="bg-white border-none rounded-2xl shadow-none overflow-hidden">
          <CardContent
            className={cn(
              "p-5 sm:p-7",
              step === 2 && !hasTotp && "p-4 sm:p-6 lg:p-7 max-h-[92vh] overflow-y-auto sm:overflow-hidden",
            )}
          >
            <AnimatePresence mode="wait">
              {step === 2 && !hasTotp && !enrollmentAuthorized && (
                <motion.div
                  key="step-email-verify"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5 font-inter"
                >
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(1)}
                      className="text-xs text-slate-600 hover:text-slate-900 -ml-2 h-7 px-2"
                    >
                      <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                      Back to Sign In
                    </Button>
                    <span className="text-xs text-slate-500">
                      {Math.floor(sessionSeconds / 60)}:
                      {(sessionSeconds % 60).toString().padStart(2, "0")}
                    </span>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="inline-flex p-2 rounded-xl bg-orange-50 text-orange-600">
                      <Mail className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Verify your work email
                    </h2>
                    <p className="text-xs text-slate-500">
                      Enter the six-digit code sent to {mfaUser?.email || email} before connecting an authenticator.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={totpCode}
                      onChange={setTotpCode}
                      disabled={verifyPending}
                    >
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button
                    onClick={() => handleVerifyTotp(totpCode)}
                    disabled={verifyPending || totpCode.length !== 6}
                    className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                  >
                    {verifyPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      "Verify Email & Continue"
                    )}
                  </Button>
                </motion.div>
              )}

              {/* -------------------------------------------------------- */}
              {/* STEP 1: EMAIL & PASSWORD CREDENTIALS                     */}
              {/* -------------------------------------------------------- */}
              {step === 1 && (
                <motion.div
                  key="step-credentials"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5 font-inter"
                >
                  <div className="text-center space-y-1.5">
                    <div className="inline-flex items-center gap-2 mb-0.5">
                      <span className="text-2xl font-extrabold tracking-tight text-slate-900 font-inter">
                        Habesha<span className="text-orange-500">Go</span>
                      </span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight font-inter">
                      Staff Sign In
                    </h1>
                    <p className="text-xs text-slate-500 font-inter">
                      Enter your work email and password to continue.
                    </p>
                  </div>

                  {formError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs animate-in fade-in font-inter">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4 font-inter">
                    {/* Work Email */}
                    <div className="space-y-1 text-left">
                      <Label
                        htmlFor="staff-email"
                        className="text-xs font-semibold text-slate-700 font-inter"
                      >
                        Work Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="staff-email"
                          type="email"
                          autoComplete="username"
                          placeholder="name@habeshago.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 text-sm rounded-xl transition-colors font-inter"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1 text-left">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="staff-password"
                          className="text-xs font-semibold text-slate-700 font-inter"
                        >
                          Password
                        </Label>
                        {capsLockActive && (
                          <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1 font-inter">
                            Caps Lock is ON
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="staff-password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="pl-10 pr-10 h-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 text-sm rounded-xl transition-colors font-inter"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Continue Button */}
                    <Button
                      type="submit"
                      disabled={loginPending}
                      className="w-full h-10 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold font-inter rounded-xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer shadow-none mt-2"
                    >
                      {loginPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin text-white" />
                          <span>Verifying Credentials...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue</span>
                          <ArrowRight className="h-4 w-4 text-white" />
                        </>
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* -------------------------------------------------------- */}
              {/* STEP 2A: 2FA PROMPT (WHEN 2FA IS ALREADY SET UP)         */}
              {/* -------------------------------------------------------- */}
              {step === 2 && hasTotp && (
                <motion.div
                  key="step-2fa-verify"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5 font-inter"
                >
                  {/* Header: Back Button & Session Timer */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStep(1)
                        setTotpCode("")
                        setRecoveryPhrase("")
                      }}
                      className="text-xs text-slate-600 hover:text-slate-900 -ml-2 h-7 px-2 flex items-center gap-1 hover:bg-slate-100 rounded-lg cursor-pointer font-inter font-medium"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to Sign In</span>
                    </Button>

                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-inter text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>
                        {Math.floor(sessionSeconds / 60)}:
                        {(sessionSeconds % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  {!useRecoveryPhrase ? (
                    /* 6-Digit Authenticator App Code */
                    <div className="space-y-4 font-inter">
                      <div className="text-center space-y-1">
                        <div className="inline-flex p-2 rounded-xl bg-orange-50 text-orange-600 mb-0.5">
                          <Smartphone className="h-4.5 w-4.5" />
                        </div>
                        <h2 className="text-base font-bold text-slate-900 tracking-tight font-inter">
                          Two-Factor Authentication
                        </h2>
                        <p className="text-xs text-slate-500 font-inter">
                          Enter the 6-digit code shown in your authenticator app
                        </p>
                      </div>

                      {/* 6-Digit Slot Input */}
                      <div className="flex justify-center py-1">
                        <InputOTP
                          maxLength={6}
                          value={totpCode}
                          onChange={(val) => setTotpCode(val)}
                          disabled={verifyPending}
                        >
                          <InputOTPGroup className="gap-2">
                            <InputOTPSlot
                              index={0}
                              className="h-11 w-9 sm:h-12 sm:w-10 text-lg font-inter font-bold bg-white border border-slate-200 rounded-lg text-slate-900 data-[active=true]:border-orange-500 data-[active=true]:ring-2 data-[active=true]:ring-orange-500/20 shadow-none"
                            />
                            <InputOTPSlot
                              index={1}
                              className="h-11 w-9 sm:h-12 sm:w-10 text-lg font-inter font-bold bg-white border border-slate-200 rounded-lg text-slate-900 data-[active=true]:border-orange-500 data-[active=true]:ring-2 data-[active=true]:ring-orange-500/20 shadow-none"
                            />
                            <InputOTPSlot
                              index={2}
                              className="h-11 w-9 sm:h-12 sm:w-10 text-lg font-inter font-bold bg-white border border-slate-200 rounded-lg text-slate-900 data-[active=true]:border-orange-500 data-[active=true]:ring-2 data-[active=true]:ring-orange-500/20 shadow-none"
                            />
                            <InputOTPSlot
                              index={3}
                              className="h-11 w-9 sm:h-12 sm:w-10 text-lg font-inter font-bold bg-white border border-slate-200 rounded-lg text-slate-900 data-[active=true]:border-orange-500 data-[active=true]:ring-2 data-[active=true]:ring-orange-500/20 shadow-none"
                            />
                            <InputOTPSlot
                              index={4}
                              className="h-11 w-9 sm:h-12 sm:w-10 text-lg font-inter font-bold bg-white border border-slate-200 rounded-lg text-slate-900 data-[active=true]:border-orange-500 data-[active=true]:ring-2 data-[active=true]:ring-orange-500/20 shadow-none"
                            />
                            <InputOTPSlot
                              index={5}
                              className="h-11 w-9 sm:h-12 sm:w-10 text-lg font-inter font-bold bg-white border border-slate-200 rounded-lg text-slate-900 data-[active=true]:border-orange-500 data-[active=true]:ring-2 data-[active=true]:ring-orange-500/20 shadow-none"
                            />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>

                      <Button
                        onClick={() => handleVerifyTotp(totpCode)}
                        disabled={verifyPending || totpCode.length !== 6}
                        className="w-full h-10 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold font-inter rounded-xl text-sm cursor-pointer shadow-none transition-colors"
                      >
                        {verifyPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin text-white" />
                        ) : (
                          "Verify & Sign In"
                        )}
                      </Button>

                      <div className="pt-1 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setUseRecoveryPhrase(true)
                            setRecoveryPhrase("")
                          }}
                          className="text-xs text-slate-500 hover:text-orange-600 font-medium font-inter inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                          <span>Lost phone? Use recovery phrase</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Single-Use Recovery Phrase Fallback */
                    <div className="space-y-4 font-inter">
                      <div className="text-center space-y-1">
                        <div className="inline-flex p-2 rounded-xl bg-orange-50 text-orange-600 mb-0.5">
                          <KeyRound className="h-4.5 w-4.5" />
                        </div>
                        <h2 className="text-base font-bold text-slate-900 tracking-tight font-inter">
                          Recovery Phrase
                        </h2>
                        <p className="text-xs text-slate-500 font-inter">
                          Enter any one of your 8 saved backup phrases
                        </p>
                      </div>

                      <div className="space-y-1 text-left">
                        <div className="relative">
                          <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            type="text"
                            placeholder="Enter single-use recovery phrase"
                            value={recoveryPhrase}
                            onChange={(e) =>
                              setRecoveryPhrase(e.target.value.toLowerCase())
                            }
                            className="pl-10 h-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 text-sm rounded-xl transition-colors font-inter"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={() => handleVerifyTotp(recoveryPhrase)}
                        disabled={verifyPending || !recoveryPhrase.trim()}
                        className="w-full h-10 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold font-inter rounded-xl text-sm cursor-pointer shadow-none transition-colors"
                      >
                        {verifyPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin text-white" />
                        ) : (
                          "Verify with Recovery Phrase"
                        )}
                      </Button>

                      <div className="pt-1 text-center">
                        <button
                          type="button"
                          onClick={() => setUseRecoveryPhrase(false)}
                          className="text-xs text-slate-500 hover:text-orange-600 font-medium font-inter inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                          <span>Back to authenticator code</span>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* -------------------------------------------------------- */}
              {/* STEP 2B: INLINE 2FA SETUP (CLEAN SIDE-BY-SIDE IN H-SCREEN) */}
              {/* -------------------------------------------------------- */}
              {step === 2 && !hasTotp && enrollmentAuthorized && (
                <motion.div
                  key="step-2fa-setup"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 font-inter"
                >
                  {/* Top Bar: Back Button & Session Timer */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 font-inter">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(1)}
                      className="text-xs text-slate-600 hover:text-slate-900 -ml-2 h-7 px-2 flex items-center gap-1 hover:bg-slate-100 rounded-lg cursor-pointer font-inter font-medium"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to Sign In</span>
                    </Button>

                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-inter text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>
                        {Math.floor(sessionSeconds / 60)}:
                        {(sessionSeconds % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  {/* Section Title & Subtitle */}
                  <div className="text-left space-y-1 font-inter">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold font-inter">
                      <ShieldCheck className="h-3.5 w-3.5 text-orange-600" />
                      <span>Two-Factor Authentication Setup</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-inter">
                      Connect Your Authenticator App
                    </h2>
                    <p className="text-xs text-slate-500 font-inter">
                      Scan the QR code with Google Authenticator or Authy, save your emergency recovery phrases offline, and complete setup.
                    </p>
                  </div>

                  {setupLoading ? (
                    <div className="py-16 text-center space-y-3 font-inter">
                      <RefreshCw className="h-7 w-7 animate-spin text-orange-500 mx-auto" />
                      <p className="text-xs text-slate-500 font-inter">
                        Generating cryptographic secret and recovery phrases...
                      </p>
                    </div>
                  ) : setupData ? (
                    /* WIDE SIDE-BY-SIDE TWO-COLUMN LAYOUT */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch pt-1 font-inter">
                      {/* ======================================================== */}
                      {/* LEFT COLUMN: SCAN QR CODE & COMPLETE SETUP (5 COLS)       */}
                      {/* ======================================================== */}
                      <div className="lg:col-span-5 flex flex-col justify-between space-y-3.5 p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-left">
                        {/* 1. QR Code */}
                        <div className="space-y-2">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-900 font-inter">
                              1. Scan with Phone App
                            </span>
                            <p className="text-[11px] text-slate-500 font-inter">
                              Open Google Authenticator or Authy and scan:
                            </p>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 inline-block shadow-xs">
                            {setupData.qrCode ? (
                              <img
                                src={setupData.qrCode}
                                alt="HabeshaGo 2FA QR Code"
                                className="w-28 h-28 sm:w-32 sm:h-32 object-contain rounded-lg mx-auto"
                              />
                            ) : (
                              <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-inter">
                                QR Unavailable
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Manual Key */}
                        <div className="space-y-1 pt-1.5 border-t border-slate-200/70">
                          <span className="text-[11px] text-slate-500 block font-inter">
                            Can&apos;t scan? Manual setup key:
                          </span>
                          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-orange-50/70 border border-orange-200/80">
                            <span className="text-[11px] font-semibold text-orange-800 font-inter tracking-wider select-all truncate pl-1">
                              {setupData.secret}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() =>
                                copyToClipboard(setupData.secret, "secret")
                              }
                              className="h-6 px-2 bg-white border-orange-200 text-orange-800 hover:bg-orange-100/60 shrink-0 text-[10px] font-inter"
                            >
                              {copiedSecret ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              <span className="ml-1">Copy</span>
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-200/70">
                          <span className="text-[11px] font-semibold text-slate-700">
                            2. Enter the current authenticator code
                          </span>
                          <Input
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={totpCode}
                            onChange={(event) =>
                              setTotpCode(
                                event.target.value.replace(/\D/g, "").slice(0, 6),
                              )
                            }
                            placeholder="000000"
                            className="h-10 text-center tracking-[0.35em] font-bold"
                          />
                        </div>

                        {/* Direct Setup Complete Button (Triggers Confirmation Alert Dialog) */}
                        <div className="pt-2 border-t border-slate-200/70">
                          <Button
                            type="button"
                            onClick={() => setConfirmDialogOpen(true)}
                            disabled={setupActivating || totpCode.length !== 6}
                            className="w-full h-10 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold font-inter rounded-xl text-sm cursor-pointer shadow-none transition-colors flex items-center justify-center gap-2"
                          >
                            {setupActivating ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                                <span>Completing Setup...</span>
                              </>
                            ) : (
                              <>
                                <span>Complete Setup & Sign In</span>
                                <ArrowRight className="h-4 w-4 text-white" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* ======================================================== */}
                      {/* RIGHT COLUMN: 8 RECOVERY PHRASES & BACKUP (7 COLS)        */}
                      {/* ======================================================== */}
                      <div className="lg:col-span-7 flex flex-col justify-between space-y-3.5 p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-left">
                        {/* Section Header & Action Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-900 font-inter">
                              3. Save 8 Backup Recovery Phrases
                            </span>
                            <p className="text-[11px] text-slate-500 font-inter">
                              Emergency offline keys if you ever lose your phone.
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() =>
                                downloadRecoveryCard(setupData.recoveryPhrases)
                              }
                              className="h-7 text-[11px] font-inter border-slate-200 hover:bg-slate-100 text-slate-700 gap-1 px-2.5 rounded-lg"
                            >
                              <Download className="h-3 w-3" />
                              <span>Download .txt</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  setupData.recoveryPhrases.join("\n"),
                                  "phrases",
                                )
                              }
                              className="h-7 text-[11px] font-inter border-slate-200 hover:bg-slate-100 text-slate-700 gap-1 px-2.5 rounded-lg"
                            >
                              {copiedPhrases ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              <span>Copy All</span>
                            </Button>
                          </div>
                        </div>

                        {/* Grid of 8 Recovery Phrases */}
                        <div className="grid grid-cols-2 gap-2 my-auto py-0.5">
                          {setupData.recoveryPhrases.map((phrase, idx) => (
                            <div
                              key={idx}
                              className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200/80 text-left flex items-center justify-between shadow-xs transition-all hover:border-slate-300"
                            >
                              <span className="text-[10px] font-bold text-slate-400 font-inter mr-2">
                                #{idx + 1}
                              </span>
                              <span className="font-semibold text-slate-800 text-xs sm:text-sm font-inter tracking-wide truncate">
                                {phrase}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Security Notice Callout */}
                        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs flex items-start gap-2 font-inter">
                          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="font-bold text-amber-950 font-inter text-[11px]">
                              Store these phrases in a secure place
                            </p>
                            <p className="text-amber-800 text-[10px] leading-relaxed font-inter">
                              If you ever lose access to your phone, any one of these recovery phrases will allow you to sign in to your staff portal.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl max-w-md font-inter">
          <AlertDialogHeader className="text-left space-y-2">
            <AlertDialogTitle className="text-base font-bold text-slate-900 font-inter">
              Confirm Two-Factor Setup
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 font-inter leading-relaxed">
                              Please ensure you scanned the QR code, saved your 8 emergency recovery phrases, and entered the current six-digit authenticator code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center justify-end gap-2 pt-2">
            <AlertDialogCancel className="h-9 px-4 text-xs font-semibold font-inter rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDialogOpen(false)
                handleCompleteSetup()
              }}
              className="h-9 px-4 text-xs bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold font-inter rounded-xl shadow-none cursor-pointer"
            >
              Confirm & Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
