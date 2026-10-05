"use client"

import React, { useState, useEffect, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  Download,
  AlertCircle,
  Smartphone,
  CheckCircle2,
  Sparkles,
  Zap,
  Car,
  SquareParking,
  FileText,
  X,
  ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { cn } from "@/lib/utils"
import { setAccessToken, setUser } from "@/store/slices/userSlice"
import {
  staffLoginApi,
  staffVerifyMFAApi,
  staffResendMFAApi,
  staffSetupTOTPApi,
  staffEnableTOTPApi,
} from "@/services/staff.auth.api"

// Role visual configurations
const ROLE_CONFIGS = [
  {
    role: "ADMIN",
    label: "Administrator",
    icon: ShieldCheck,
    color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
  },
  {
    role: "DRIVER",
    label: "Fleet Driver",
    icon: Car,
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    role: "EV_CHARGER_MANAGER",
    label: "EV Charging Manager",
    icon: Zap,
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    role: "PARKING_MANAGER",
    label: "Parking Manager",
    icon: SquareParking,
    color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  },
]

export default function StaffLoginPage() {
  const router = useRouter()
  const dispatch = useDispatch()

  // State Step: 1 = Credentials, 2 = MFA Verification
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1: Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockActive, setCapsLockActive] = useState(false)
  const [loginPending, setLoginPending] = useState(false)
  const [formError, setFormError] = useState("")

  // Step 2: MFA state
  const [mfaToken, setMfaToken] = useState("")
  const [mfaMethod, setMfaMethod] = useState<"TOTP_OR_EMAIL" | "EMAIL_OTP">(
    "EMAIL_OTP",
  )
  const [mfaUser, setMfaUser] = useState<{
    id: string
    name: string | null
    email: string
    role: string
  } | null>(null)
  const [devOtp, setDevOtp] = useState<string | null>(null)

  // Verification tab: "totp" | "phrase" | "email"
  const [mfaTab, setMfaTab] = useState<"totp" | "phrase" | "email">("totp")
  const [totpCode, setTotpCode] = useState("")
  const [recoveryPhrase, setRecoveryPhrase] = useState("")
  const [emailOtpCode, setEmailOtpCode] = useState("")
  const [verifyPending, setVerifyPending] = useState(false)

  // Resend OTP countdown (Step 2)
  const [resendCooldown, setResendCooldown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [resending, setResending] = useState(false)

  // Session expiry countdown (5 minutes = 300s)
  const [sessionSeconds, setSessionSeconds] = useState(300)

  // Setup TOTP Modal state
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)
  const [setupData, setSetupData] = useState<{
    qrCode: string
    secret: string
    recoveryPhrases: string[]
    instructions: string[]
  } | null>(null)
  const [setupTestCode, setSetupTestCode] = useState("")
  const [setupActivating, setSetupActivating] = useState(false)
  const [setupSuccess, setSetupSuccess] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedPhrases, setCopiedPhrases] = useState(false)

  // Keyboard CapsLock detection
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState("CapsLock"))
    }
  }

  // Session timer countdown in Step 2
  useEffect(() => {
    if (step !== 2) return
    const timer = setInterval(() => {
      setSessionSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          toast.error("MFA session expired. Please log in again.")
          setStep(1)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [step])

  // Email resend timer in Step 2
  useEffect(() => {
    if (step !== 2 || canResend) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [step, canResend])

  // Auto-submit 6-digit TOTP code
  useEffect(() => {
    if (mfaTab === "totp" && totpCode.length === 6 && !verifyPending) {
      handleVerifyMFA(totpCode)
    }
  }, [totpCode, mfaTab])

  // Auto-submit 6-digit Email OTP code
  useEffect(() => {
    if (mfaTab === "email" && emailOtpCode.length === 6 && !verifyPending) {
      handleVerifyMFA(emailOtpCode)
    }
  }, [emailOtpCode, mfaTab])

  // -------------------------------------------------------------
  // STEP 1: Submit Credentials
  // -------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!email || !password) {
      setFormError("Please enter both email and password")
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
        toast.error(res.message || "Staff login failed")
        return
      }

      setMfaToken(res.data.mfaToken)
      setMfaMethod(res.data.mfaMethod)
      setMfaUser(res.data.user)
      setDevOtp(res.data.devOtp || null)
      setSessionSeconds(res.data.expiresIn || 300)

      // Set initial verification tab
      if (res.data.mfaMethod === "TOTP_OR_EMAIL") {
        setMfaTab("totp")
      } else {
        setMfaTab("email")
      }

      setStep(2)
      setResendCooldown(60)
      setCanResend(false)
      toast.success("Credentials verified! Please complete MFA.")
    } catch (err: any) {
      setFormError("An unexpected error occurred. Please try again.")
    } finally {
      setLoginPending(false)
    }
  }

  // -------------------------------------------------------------
  // STEP 2: Verify MFA (TOTP / Recovery Phrase / Email OTP)
  // -------------------------------------------------------------
  const handleVerifyMFA = async (codeToVerify?: string) => {
    let code = codeToVerify
    if (!code) {
      if (mfaTab === "totp") code = totpCode
      else if (mfaTab === "phrase") code = recoveryPhrase
      else code = emailOtpCode
    }

    if (!code || !code.trim()) {
      toast.error("Please enter a verification code or recovery phrase")
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

      const { accessToken, user } = res.data

      // Save user to Redux & LocalStorage
      dispatch(setAccessToken(accessToken))
      dispatch(setUser({ user: user as any }))
      if (typeof window !== "undefined") {
        localStorage.setItem("habeshagoUser", JSON.stringify(user))
      }

      toast.success(`Welcome back, ${user.name || user.email}!`)

      // Smart redirection based on role
      setTimeout(() => {
        if (user.role === "ADMIN") {
          router.replace("/admin")
        } else if (user.role === "EV_CHARGER_MANAGER") {
          router.replace("/ev-charge-manager")
        } else if (user.role === "DRIVER") {
          router.replace("/driver")
        } else if (user.role === "PARKING_MANAGER") {
          router.replace("/admin")
        } else {
          router.replace("/admin")
        }
      }, 500)
    } catch (err: any) {
      toast.error("MFA verification failed. Please try again.")
    } finally {
      setVerifyPending(false)
    }
  }

  // -------------------------------------------------------------
  // Resend Email MFA Code
  // -------------------------------------------------------------
  const handleResendEmailMFA = async () => {
    if (!canResend || resending) return
    setResending(true)
    try {
      const res = await staffResendMFAApi(mfaToken)
      if (res.success) {
        toast.success("New verification code sent to your email!")
        if (res.data?.devOtp) {
          setDevOtp(res.data.devOtp)
        }
        setCanResend(false)
        setResendCooldown(60)
      } else {
        toast.error(res.message || "Failed to resend code")
      }
    } catch (err) {
      toast.error("Failed to resend code")
    } finally {
      setResending(false)
    }
  }

  // -------------------------------------------------------------
  // Load TOTP Setup Details (Modal)
  // -------------------------------------------------------------
  const openSetupModal = async () => {
    setShowSetupModal(true)
    setSetupSuccess(false)
    setSetupTestCode("")
    setSetupLoading(true)

    try {
      const res = await staffSetupTOTPApi()
      if (res.success && res.data) {
        setSetupData(res.data)
      } else {
        toast.error(res.message || "Failed to load 2FA setup details")
      }
    } catch (err) {
      toast.error("Failed to load 2FA setup details")
    } finally {
      setSetupLoading(false)
    }
  }

  // Confirm TOTP in Modal
  const handleEnableTOTP = async () => {
    if (!setupTestCode || setupTestCode.length !== 6) {
      toast.error("Please enter the 6-digit code from Google Authenticator")
      return
    }

    setSetupActivating(true)
    try {
      const res = await staffEnableTOTPApi(setupTestCode)
      if (res.success) {
        setSetupSuccess(true)
        toast.success("Google Authenticator successfully activated!")
      } else {
        toast.error(res.message || "Invalid 6-digit code")
      }
    } catch (err) {
      toast.error("Activation failed")
    } finally {
      setSetupActivating(false)
    }
  }

  // Copy helpers
  const copyToClipboard = (text: string, type: "secret" | "phrases") => {
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

  const downloadRecoveryCard = (phrases: string[]) => {
    const content = [
      "==================================================",
      "   HABESHAGO STAFF RECOVERY PHRASES (BACKUP)     ",
      "==================================================",
      `Generated: ${new Date().toLocaleString()}`,
      `Staff Account: ${email || "Staff Member"}`,
      "",
      "IMPORTANT NOTICE:",
      "Store these single-use recovery phrases in a secure location.",
      "If you ever lose access to Google Authenticator, enter any one",
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full px-6 py-5 max-w-7xl mx-auto flex items-center justify-between border-b border-slate-800/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="h-5 w-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                Habesha<span className="text-emerald-400">Go</span>
              </span>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5"
              >
                Staff Portal
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Enterprise Operations & Security Gateway
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/login")}
            className="text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            Passenger Login
          </Button>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>256-bit Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Staff Roles Preview Chips */}
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {ROLE_CONFIGS.map((rc) => {
              const Icon = rc.icon
              return (
                <div
                  key={rc.role}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all backdrop-blur-sm",
                    rc.color,
                  )}
                >
                  <Icon className="h-3 w-3" />
                  <span>{rc.label}</span>
                </div>
              )
            })}
          </div>

          {/* Central Glass Card */}
          <Card className="bg-slate-900/80 border-slate-800/80 shadow-2xl backdrop-blur-2xl rounded-2xl overflow-hidden">
            <CardContent className="p-7 sm:p-8">
              <AnimatePresence mode="wait">
                {/* -------------------------------------------------------- */}
                {/* STEP 1: EMAIL & PASSWORD CREDENTIALS                     */}
                {/* -------------------------------------------------------- */}
                {step === 1 && (
                  <motion.div
                    key="step-credentials"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="text-center space-y-1.5">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                        <Lock className="h-6 w-6" />
                      </div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">
                        Staff Sign In
                      </h2>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Enter your official staff credentials to begin two-factor
                        authentication.
                      </p>
                    </div>

                    {formError && (
                      <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      {/* Email Field */}
                      <div className="space-y-1.5 text-left">
                        <Label
                          htmlFor="staff-email"
                          className="text-xs font-semibold text-slate-300"
                        >
                          Work Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="staff-email"
                            type="email"
                            autoComplete="username"
                            placeholder="admin@habeshago.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 text-sm rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="staff-password"
                            className="text-xs font-semibold text-slate-300"
                          >
                            Password
                          </Label>
                          {capsLockActive && (
                            <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
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
                            className="pl-10 pr-10 h-12 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 text-sm rounded-xl"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={loginPending}
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer mt-2"
                      >
                        {loginPending ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                            <span>Verifying Credentials...</span>
                          </>
                        ) : (
                          <>
                            <span>Continue to MFA</span>
                            <ArrowRight className="h-4 w-4 text-slate-950 font-bold" />
                          </>
                        )}
                      </Button>
                    </form>

                    {/* Bottom Links */}
                    <div className="pt-2 text-center border-t border-slate-800/60 space-y-2">
                      <p className="text-xs text-slate-400">
                        First time setting up your Authenticator app?{" "}
                        <button
                          type="button"
                          onClick={openSetupModal}
                          className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                        >
                          Setup 2FA QR Code
                        </button>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Authorized staff roles only. Violators are subject to
                        monitoring and legal reporting.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* -------------------------------------------------------- */}
                {/* STEP 2: MULTI-FACTOR AUTHENTICATION (MFA)                */}
                {/* -------------------------------------------------------- */}
                {step === 2 && (
                  <motion.div
                    key="step-mfa"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    {/* Header with Back button and Session Timer */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setStep(1)
                          setTotpCode("")
                          setRecoveryPhrase("")
                          setEmailOtpCode("")
                        }}
                        className="text-xs text-slate-400 hover:text-white -ml-2 h-8 px-2 flex items-center gap-1"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Change Account</span>
                      </Button>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-mono text-slate-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>
                          {Math.floor(sessionSeconds / 60)}:
                          {(sessionSeconds % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    {/* Staff User Banner */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-left">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-white">
                          {mfaUser?.name || "Staff Member"}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {mfaUser?.email}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono uppercase"
                      >
                        {mfaUser?.role}
                      </Badge>
                    </div>

                    {/* Dev Mode Code Helper (if provided by dev server) */}
                    {devOtp && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-300 text-xs">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-amber-400" />
                          <span>Dev Code:</span>
                          <span className="font-mono font-bold tracking-widest text-amber-200">
                            {devOtp}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEmailOtpCode(devOtp)
                            setTotpCode(devOtp)
                            toast.success("Dev code auto-filled!")
                          }}
                          className="h-6 text-[10px] border-amber-500/40 text-amber-300 hover:bg-amber-500/20 px-2"
                        >
                          Auto Fill
                        </Button>
                      </div>
                    )}

                    {/* MFA Method Selection Tabs */}
                    <Tabs
                      value={mfaTab}
                      onValueChange={(val: any) => setMfaTab(val)}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-3 w-full bg-slate-950/80 border border-slate-800 rounded-xl p-1 h-auto">
                        <TabsTrigger
                          value="totp"
                          className="text-[11px] py-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950 font-semibold rounded-lg flex items-center justify-center gap-1 transition-all"
                        >
                          <Smartphone className="h-3.5 w-3.5" />
                          <span>App Code</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="phrase"
                          className="text-[11px] py-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950 font-semibold rounded-lg flex items-center justify-center gap-1 transition-all"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          <span>Recovery</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="email"
                          className="text-[11px] py-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950 font-semibold rounded-lg flex items-center justify-center gap-1 transition-all"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          <span>Email OTP</span>
                        </TabsTrigger>
                      </TabsList>

                      {/* TAB 1: Authenticator App TOTP */}
                      <TabsContent value="totp" className="mt-5 space-y-4">
                        <div className="text-center space-y-1">
                          <p className="text-sm font-semibold text-white">
                            Google Authenticator
                          </p>
                          <p className="text-xs text-slate-400">
                            Enter the 6-digit code showing on your phone app.
                          </p>
                        </div>

                        <div className="flex justify-center py-2">
                          <InputOTP
                            maxLength={6}
                            value={totpCode}
                            onChange={(val) => setTotpCode(val)}
                            disabled={verifyPending}
                          >
                            <InputOTPGroup className="gap-2">
                              <InputOTPSlot
                                index={0}
                                className="h-13 w-11 text-lg font-mono font-bold bg-slate-950/80 border-slate-800 rounded-lg text-emerald-400"
                              />
                              <InputOTPSlot
                                index={1}
                                className="h-13 w-11 text-lg font-mono font-bold bg-slate-950/80 border-slate-800 rounded-lg text-emerald-400"
                              />
                              <InputOTPSlot
                                index={2}
                                className="h-13 w-11 text-lg font-mono font-bold bg-slate-950/80 border-slate-800 rounded-lg text-emerald-400"
                              />
                              <InputOTPSlot
                                index={3}
                                className="h-13 w-11 text-lg font-mono font-bold bg-slate-950/80 border-slate-800 rounded-lg text-emerald-400"
                              />
                              <InputOTPSlot
                                index={4}
                                className="h-13 w-11 text-lg font-mono font-bold bg-slate-950/80 border-slate-800 rounded-lg text-emerald-400"
                              />
                              <InputOTPSlot
                                index={5}
                                className="h-13 w-11 text-lg font-mono font-bold bg-slate-950/80 border-slate-800 rounded-lg text-emerald-400"
                              />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>

                        <Button
                          onClick={() => handleVerifyMFA(totpCode)}
                          disabled={verifyPending || totpCode.length !== 6}
                          className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-sm cursor-pointer"
                        >
                          {verifyPending ? (
                            <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                          ) : (
                            "Verify & Enter Portal"
                          )}
                        </Button>

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={openSetupModal}
                            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                          >
                            <QrCode className="h-3 w-3" />
                            <span>Scan QR Code to setup on this device</span>
                          </button>
                        </div>
                      </TabsContent>

                      {/* TAB 2: Recovery Phrase */}
                      <TabsContent value="phrase" className="mt-5 space-y-4">
                        <div className="text-center space-y-1">
                          <p className="text-sm font-semibold text-white">
                            Single-Use Recovery Phrase
                          </p>
                          <p className="text-xs text-slate-400">
                            Lost phone? Enter any one of your 8 saved backup
                            phrases (e.g. <code>falcon-ember-482</code>).
                          </p>
                        </div>

                        <div className="space-y-1.5 text-left">
                          <div className="relative">
                            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              type="text"
                              placeholder="word-word-number (e.g. falcon-ember-482)"
                              value={recoveryPhrase}
                              onChange={(e) =>
                                setRecoveryPhrase(e.target.value.toLowerCase())
                              }
                              className="pl-10 h-12 bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500/50 font-mono text-sm rounded-xl"
                            />
                          </div>
                        </div>

                        <Button
                          onClick={() => handleVerifyMFA(recoveryPhrase)}
                          disabled={verifyPending || !recoveryPhrase.trim()}
                          className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-sm cursor-pointer"
                        >
                          {verifyPending ? (
                            <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                          ) : (
                            "Authenticate with Recovery Phrase"
                          )}
                        </Button>

                        <p className="text-[11px] text-slate-500 text-center">
                          Note: A recovery phrase is immediately burned upon
                          login and cannot be reused.
                        </p>
                      </TabsContent>

                      {/* TAB 3: Email OTP Fallback */}
                      <TabsContent value="email" className="mt-5 space-y-4">
                        <div className="text-center space-y-1">
                          <p className="text-sm font-semibold text-white">
                            Email Verification Code
                          </p>
                          <p className="text-xs text-slate-400">
                            Sent to <strong>{mfaUser?.email}</strong>
                          </p>
                        </div>

                        <div className="flex justify-center py-2">
                          <InputOTP
                            maxLength={6}
                            value={emailOtpCode}
                            onChange={(val) => setEmailOtpCode(val)}
                            disabled={verifyPending}
                          >
                            <InputOTPGroup className="gap-2">
                              <InputOTPSlot
                                index={0}
                                className="h-13 w-11 text-lg font-mono font-bold bg-slate-950/80 border-slate-800 rounded-lg text-emerald-400"
                              />
                              <InputOTPSlot
                                index={1}
                                className="h-13 w-11 text-lg font-mono font-bold bg-slate-950/80 border-slate-800 rounded-lg text-emerald-400"
                              />
                              <InputOTPSlot
                                index={2}
                                className="h-13 w-11 text-lg font-mono font-bold bg-slate-950/80 border-slate-800 rounded-lg text-emerald-400"
                              />
                              <InputOTPSlot
                                index={3}
                                className="h-13 w-11 text-lg font-mono font-bold bg-slate-950/80 border-slate-800 rounded-lg text-emerald-400"
                              />
                              <InputOTPSlot
                                index={4}
                                className="h-13 w-11 text-lg font-mono font-bold bg-slate-950/80 border-slate-800 rounded-lg text-emerald-400"
                              />
                              <InputOTPSlot
                                index={5}
                                className="h-13 w-11 text-lg font-mono font-bold bg-slate-950/80 border-slate-800 rounded-lg text-emerald-400"
                              />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>

                        <Button
                          onClick={() => handleVerifyMFA(emailOtpCode)}
                          disabled={verifyPending || emailOtpCode.length !== 6}
                          className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-sm cursor-pointer"
                        >
                          {verifyPending ? (
                            <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                          ) : (
                            "Verify Email Code"
                          )}
                        </Button>

                        <div className="flex items-center justify-center text-xs">
                          {canResend ? (
                            <button
                              type="button"
                              onClick={handleResendEmailMFA}
                              disabled={resending}
                              className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <RefreshCw
                                className={cn(
                                  "h-3 w-3",
                                  resending && "animate-spin",
                                )}
                              />
                              <span>Resend Email Code</span>
                            </button>
                          ) : (
                            <span className="text-slate-500">
                              Resend code in {resendCooldown}s
                            </span>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 2FA SETUP MODAL (SCAN QR CODE & SAVE RECOVERY PHRASES)        */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {showSetupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-y-auto max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="text-left space-y-1 mb-6">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Two-Factor Authentication Setup</span>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Google Authenticator & Backup Phrases
                </h3>
                <p className="text-xs text-slate-400">
                  Scan the QR code with Google Authenticator or Authy, and save
                  your emergency recovery phrases offline.
                </p>
              </div>

              {setupLoading ? (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw className="h-8 w-8 animate-spin text-emerald-400 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Generating cryptographic secret and recovery phrases...
                  </p>
                </div>
              ) : setupData ? (
                <div className="space-y-6">
                  {/* Step A: QR Code & Manual Secret */}
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row items-center gap-6">
                    <div className="bg-white p-3 rounded-2xl shadow-xl shrink-0">
                      {setupData.qrCode ? (
                        <img
                          src={setupData.qrCode}
                          alt="HabeshaGo Google Authenticator QR Code"
                          className="w-40 h-40 object-contain rounded-lg"
                        />
                      ) : (
                        <div className="w-40 h-40 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                          No QR Available
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 text-left">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-300">
                          1. Scan with Phone Camera
                        </span>
                        <p className="text-[11px] text-slate-400">
                          Open Google Authenticator, tap <strong>"+"</strong>,
                          and select <strong>"Scan a QR code"</strong>.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-400">
                          Can't scan? Use manual setup key:
                        </span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono font-bold text-cyan-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 select-all">
                            {setupData.secret}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(setupData.secret, "secret")
                            }
                            className="h-8 px-2.5 border-slate-700 text-slate-300 hover:text-white"
                          >
                            {copiedSecret ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step B: 8 Recovery Phrases */}
                  <div className="space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <KeyRound className="h-4 w-4 text-emerald-400" />
                          <span>2. Save 8 Emergency Recovery Phrases</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Each phrase is single-use. Store them safely in a
                          password manager or offline note.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            downloadRecoveryCard(setupData.recoveryPhrases)
                          }
                          className="h-8 text-xs border-slate-700 hover:bg-slate-800 text-slate-300 gap-1.5"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download .txt</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              setupData.recoveryPhrases.join("\n"),
                              "phrases",
                            )
                          }
                          className="h-8 text-xs border-slate-700 hover:bg-slate-800 text-slate-300 gap-1.5"
                        >
                          {copiedPhrases ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span>Copy All</span>
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {setupData.recoveryPhrases.map((phrase, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center font-mono text-xs text-emerald-300/90 shadow-sm"
                        >
                          <span className="text-[10px] text-slate-600 block">
                            #{idx + 1}
                          </span>
                          <span className="font-semibold">{phrase}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step C: Test 6-Digit Code Activation */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 text-left">
                    <span className="text-xs font-semibold text-slate-300 block">
                      3. Confirm Setup with 6-Digit Code from App
                    </span>

                    {setupSuccess ? (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                        <span>
                          Google Authenticator 2FA is now permanently enabled
                          for your staff account!
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <Input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 582910"
                          value={setupTestCode}
                          onChange={(e) =>
                            setSetupTestCode(
                              e.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          className="h-11 bg-slate-900 border-slate-800 text-center font-mono text-base font-bold tracking-widest text-emerald-400 rounded-xl"
                        />
                        <Button
                          onClick={handleEnableTOTP}
                          disabled={
                            setupActivating || setupTestCode.length !== 6
                          }
                          className="w-full sm:w-auto h-11 px-5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shrink-0 cursor-pointer text-xs"
                        >
                          {setupActivating ? (
                            <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                          ) : (
                            "Activate 2FA"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 w-full py-5 px-6 border-t border-slate-800/60 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
        <p>© {new Date().getFullYear()} HabeshaGo Inc. All rights reserved.</p>
        <div className="flex items-center gap-4 text-slate-400">
          <button
            onClick={() => router.push("/login")}
            className="hover:text-white transition-colors"
          >
            Passenger App
          </button>
          <span>•</span>
          <a
            href="mailto:support@habeshago.com"
            className="hover:text-white transition-colors"
          >
            Staff Operations Support
          </a>
        </div>
      </footer>
    </div>
  )
}
