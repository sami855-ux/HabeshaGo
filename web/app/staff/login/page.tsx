"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import {
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import {
  requestStaffLogin,
  verifyStaffOtp,
  verifyStaffMfaChallenge,
  verifyStaffMfaEnroll,
  verifyStaffMfaRecovery,
  DEMO_STAFF_ACCOUNT,
  type StaffVerifyOtpResponse,
  type StaffAuthSessionResponse,
} from "@/services/staff-auth"
import { establishAuthSession } from "@/services/auth-session"
import type { User } from "@/types/user"

type AuthStage =
  | "email"
  | "email_otp"
  | "mfa_challenge"
  | "mfa_setup"
  | "mfa_recovery"
  | "success"

export default function StaffLoginPage() {
  const router = useRouter()

  // Form States
  const [stage, setStage] = React.useState<AuthStage>("email")
  const [email, setEmail] = React.useState("")
  const [emailOtp, setEmailOtp] = React.useState("")
  const [mfaCode, setMfaCode] = React.useState("")
  const [recoveryCode, setRecoveryCode] = React.useState("")

  // Loading & Feedback
  const [loading, setLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [devOtpHint, setDevOtpHint] = React.useState<string | null>(null)

  // MFA Data from Backend
  const [mfaSessionData, setMfaSessionData] =
    React.useState<StaffVerifyOtpResponse | null>(null)

  // Resend Countdown
  const [countdown, setCountdown] = React.useState(60)
  const [copiedSecret, setCopiedSecret] = React.useState(false)
  const [copiedCodes, setCopiedCodes] = React.useState(false)
  const [showManualKey, setShowManualKey] = React.useState(false)
  const [showRecoveryCodes, setShowRecoveryCodes] = React.useState(false)

  const [authenticatedStaff, setAuthenticatedStaff] =
    React.useState<StaffAuthSessionResponse["user"] | null>(null)

  // Resend Timer
  React.useEffect(() => {
    let timer: NodeJS.Timeout
    if (stage === "email_otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [stage, countdown])

  const formatStaffUser = (rawUser: StaffAuthSessionResponse["user"]): User => {
    return {
      id: rawUser.id,
      name: rawUser.name || "Operations Staff",
      email: rawUser.email || null,
      phone: rawUser.phone || null,
      avaterUrl: null,
      bio: null,
      location: "Addis Ababa Central Command",
      role: rawUser.primaryRole,
      primaryRole: rawUser.primaryRole,
      roles: rawUser.roles || [rawUser.primaryRole],
      defaultRedirect: rawUser.defaultRedirect || "/admin",
      emailVerified: true,
      phoneVerified: false,
      twoFactorEnabled: true,
      isSuspended: false,
      suspendedAt: null,
      suspendedBy: null,
      suspensionReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  // 1. Submit Work Email
  const handleEmailSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid work email address.")
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const result = await requestStaffLogin(email)
      if (result.devOtp) {
        setDevOtpHint(result.devOtp)
      }
      setCountdown(60)
      setStage("email_otp")
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Authentication request failed."
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // 2. Verify Email OTP
  const handleVerifyEmailOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || emailOtp
    if (!code || code.length !== 6) {
      setErrorMessage("Enter the complete 6-digit code.")
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const result = await verifyStaffOtp(email, code)
      setMfaSessionData(result)

      if (result.mfaSetupRequired) {
        setStage("mfa_setup")
      } else {
        setStage("mfa_challenge")
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Verification code rejected."
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // 3A. Confirm First-Time MFA Enrollment
  const handleVerifyMfaEnroll = async () => {
    if (!mfaSessionData?.mfaToken) {
      setErrorMessage("Session expired. Please start over.")
      return
    }
    if (!mfaCode || mfaCode.length !== 6) {
      setErrorMessage("Enter the 6-digit code from your authenticator app.")
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const session = await verifyStaffMfaEnroll(
        mfaSessionData.mfaToken,
        mfaCode
      )
      await finalizeStaffSession(session)
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Authenticator verification failed."
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // 3B. Verify Existing TOTP Challenge
  const handleVerifyMfaChallenge = async () => {
    if (!mfaSessionData?.mfaToken) {
      setErrorMessage("Session expired. Please start over.")
      return
    }
    if (!mfaCode || mfaCode.length !== 6) {
      setErrorMessage("Enter the 6-digit code from your authenticator app.")
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const session = await verifyStaffMfaChallenge(
        mfaSessionData.mfaToken,
        mfaCode
      )
      await finalizeStaffSession(session)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Invalid authenticator code."
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // 3C. Emergency Recovery Code
  const handleVerifyMfaRecovery = async () => {
    if (!mfaSessionData?.mfaToken) {
      setErrorMessage("Session expired. Please start over.")
      return
    }
    if (!recoveryCode || recoveryCode.trim().length < 8) {
      setErrorMessage("Enter a valid backup recovery code.")
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const session = await verifyStaffMfaRecovery(
        mfaSessionData.mfaToken,
        recoveryCode
      )
      await finalizeStaffSession(session)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Recovery code rejected."
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Finalize Session
  const finalizeStaffSession = async (session: StaffAuthSessionResponse) => {
    setAuthenticatedStaff(session.user)
    setStage("success")

    const user = formatStaffUser(session.user)
    await establishAuthSession(session.accessToken, user, session.refreshToken)

    toast.success(`Signed in as ${session.user.name || "Staff Member"}`)

    const targetUrl = session.user.defaultRedirect || "/admin"
    setTimeout(() => {
      router.push(targetUrl)
    }, 900)
  }

  const handleCopySecret = () => {
    if (mfaSessionData?.secret) {
      navigator.clipboard.writeText(mfaSessionData.secret)
      setCopiedSecret(true)
      toast.success("Secret key copied to clipboard")
      setTimeout(() => setCopiedSecret(false), 2000)
    }
  }

  const handleCopyRecoveryCodes = () => {
    if (mfaSessionData?.recoveryCodes) {
      navigator.clipboard.writeText(mfaSessionData.recoveryCodes.join("\n"))
      setCopiedCodes(true)
      toast.success("Recovery codes copied")
      setTimeout(() => setCopiedCodes(false), 2000)
    }
  }

  const handleDownloadRecoveryCodes = () => {
    if (!mfaSessionData?.recoveryCodes) return
    const content = `HABESHAGO ENTERPRISE OPERATIONS - EMERGENCY RECOVERY CODES\nAccount: ${email}\nDate: ${new Date().toISOString()}\n\n${mfaSessionData.recoveryCodes.join(
      "\n"
    )}\n\nKeep these single-use codes safely stored.`
    const element = document.createElement("a")
    const file = new Blob([content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `habeshago-recovery-${email.split("@")[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success("Recovery codes downloaded")
  }

  const fillDemoAccount = () => {
    setEmail(DEMO_STAFF_ACCOUNT.email)
    setErrorMessage(null)
    toast.info(`Filled demo account: ${DEMO_STAFF_ACCOUNT.email}`)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between items-center p-6 sm:p-10 font-inter antialiased selection:bg-slate-900 selection:text-white">
      {/* Top Spacer */}
      <div className="w-full h-4 sm:h-8" />

      {/* Main Spacious Container: Wider (max-w-[480px]), No Border, No Shadow */}
      <main className="w-full max-w-[480px] mx-auto my-auto space-y-7">
        {/* Brand & Dynamic Title */}
        <div className="space-y-3">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg tracking-tight">
            H
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {stage === "email" && "Sign in to HabeshaGo Staff"}
              {stage === "email_otp" && "Check your work email"}
              {stage === "mfa_challenge" && "Two-step verification"}
              {stage === "mfa_setup" && "Set up authenticator"}
              {stage === "mfa_recovery" && "Emergency recovery"}
              {stage === "success" && "Verification complete"}
            </h1>

            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              {stage === "email" &&
                "Enter your corporate email address to access operations."}
              {stage === "email_otp" && (
                <span>
                  We sent a 6-digit code to{" "}
                  <strong className="text-slate-900 font-semibold">{email}</strong>
                </span>
              )}
              {stage === "mfa_challenge" &&
                "Enter the 6-digit code from your authenticator app."}
              {stage === "mfa_setup" &&
                "Register an authenticator app to protect your staff account."}
              {stage === "mfa_recovery" &&
                "Enter one of your single-use backup recovery codes."}
              {stage === "success" && "Opening Operations Console..."}
            </p>
          </div>

          {/* Single Clean Demo Trigger Button */}
          {stage === "email" && (
            <div className="pt-0.5">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Demo account: {DEMO_STAFF_ACCOUNT.email}</span>
              </button>
            </div>
          )}
        </div>

        {/* Error Callout */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-red-50 text-red-800 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-red-700 leading-snug">{errorMessage}</p>
          </motion.div>
        )}

        {/* STAGE 1: Email Form */}
        {stage === "email" && (
          <motion.form
            key="stage-email"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleEmailSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label
                htmlFor="work-email"
                className="text-xs font-semibold text-slate-700"
              >
                Corporate work email
              </Label>
              <Input
                id="work-email"
                type="email"
                required
                placeholder="name@habeshago.et"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 px-4 bg-slate-50/60 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                disabled={loading}
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => router.push("/staff/accept-invite")}
                className="text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Received an invitation link?{" "}
                <span className="underline underline-offset-2 font-medium">
                  Accept invite token
                </span>
              </button>
            </div>
          </motion.form>
        )}

        {/* STAGE 2: Email OTP */}
        {stage === "email_otp" && (
          <motion.div
            key="stage-otp"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            {/* Dev Passcode Quick Fill */}
            {devOtpHint && (
              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Dev code: <strong className="text-slate-900 font-semibold">{devOtpHint}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmailOtp(devOtpHint)
                    handleVerifyEmailOtp(devOtpHint)
                  }}
                  className="text-xs font-semibold text-slate-900 hover:underline cursor-pointer"
                >
                  Auto-fill code
                </button>
              </div>
            )}

            {/* 6-Digit OTP */}
            <div className="space-y-3.5 flex flex-col items-center py-1">
              <InputOTP
                maxLength={6}
                value={emailOtp}
                onChange={(val) => {
                  setEmailOtp(val)
                  if (val.length === 6) {
                    handleVerifyEmailOtp(val)
                  }
                }}
                autoFocus
              >
                <InputOTPGroup className="gap-2.5 sm:gap-3">
                  <InputOTPSlot
                    index={0}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                  <InputOTPSlot
                    index={1}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                  <InputOTPSlot
                    index={2}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                  <InputOTPSlot
                    index={3}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                  <InputOTPSlot
                    index={4}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                  <InputOTPSlot
                    index={5}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                </InputOTPGroup>
              </InputOTP>

              <div className="flex items-center justify-between w-full text-xs text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStage("email")
                    setEmailOtp("")
                    setErrorMessage(null)
                  }}
                  className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Change email
                </button>

                {countdown > 0 ? (
                  <span className="text-slate-400">
                    Resend in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleEmailSubmit()}
                    className="text-slate-900 hover:underline font-semibold cursor-pointer"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </div>

            <Button
              type="button"
              disabled={loading || emailOtp.length !== 6}
              onClick={() => handleVerifyEmailOtp()}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                "Verify code"
              )}
            </Button>
          </motion.div>
        )}

        {/* STAGE 3A: First-Time MFA Enrollment */}
        {stage === "mfa_setup" && mfaSessionData && (
          <motion.div
            key="stage-setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            {/* QR Barcode */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl space-y-2.5">
              <div className="p-3 bg-white rounded-xl">
                <QRCodeSVG
                  value={
                    mfaSessionData.otpauthUri ||
                    `otpauth://totp/HabeshaGo:${email}?secret=JBSWY3DPEHPK3PXP`
                  }
                  size={156}
                  level="H"
                />
              </div>
              <p className="text-xs text-slate-500 text-center">
                Scan barcode using Google Authenticator or Microsoft Authenticator
              </p>
            </div>

            {/* Collapsible Manual Setup Key */}
            <div className="rounded-xl p-3 bg-slate-50 text-xs space-y-2">
              <button
                type="button"
                onClick={() => setShowManualKey(!showManualKey)}
                className="w-full flex items-center justify-between text-slate-700 hover:text-slate-900 font-medium cursor-pointer"
              >
                <span>Can't scan barcode? Enter key manually</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    showManualKey ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showManualKey && (
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200/60">
                  <span className="text-xs font-semibold text-slate-900 tracking-wide">
                    {mfaSessionData.secret || "JBSWY3DPEHPK3PXP"}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="text-xs text-slate-700 hover:text-slate-900 font-medium cursor-pointer inline-flex items-center gap-1"
                  >
                    {copiedSecret ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy</span>
                  </button>
                </div>
              )}
            </div>

            {/* Collapsible Emergency Backup Codes */}
            <div className="rounded-xl p-3 bg-slate-50 text-xs space-y-2">
              <button
                type="button"
                onClick={() => setShowRecoveryCodes(!showRecoveryCodes)}
                className="w-full flex items-center justify-between text-slate-700 hover:text-slate-900 font-medium cursor-pointer"
              >
                <span>Save emergency recovery codes</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    showRecoveryCodes ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showRecoveryCodes && (
                <div className="pt-2.5 space-y-2.5 border-t border-slate-200/60">
                  <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-800">
                    {(
                      mfaSessionData.recoveryCodes || [
                        "9482-1049",
                        "8391-4820",
                        "5729-1940",
                        "3829-5019",
                        "4920-8402",
                        "7193-2948",
                        "6820-1948",
                        "5928-3019",
                      ]
                    ).map((c, i) => (
                      <div
                        key={i}
                        className="p-1.5 bg-white rounded text-center font-medium"
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyRecoveryCodes}
                      className="text-xs text-slate-700 hover:text-slate-900 font-medium cursor-pointer underline"
                    >
                      Copy all codes
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleDownloadRecoveryCodes}
                      className="text-xs text-slate-700 hover:text-slate-900 font-medium cursor-pointer underline"
                    >
                      Download TXT
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Code Input */}
            <div className="space-y-2.5 flex flex-col items-center pt-1">
              <Label className="text-xs font-semibold text-slate-700 text-center">
                Enter 6-digit code shown in your authenticator app
              </Label>

              <InputOTP
                maxLength={6}
                value={mfaCode}
                onChange={(v) => {
                  setMfaCode(v)
                  if (v.length === 6) {
                    handleVerifyMfaEnroll()
                  }
                }}
                autoFocus
              >
                <InputOTPGroup className="gap-2.5 sm:gap-3">
                  <InputOTPSlot
                    index={0}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                  <InputOTPSlot
                    index={1}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                  <InputOTPSlot
                    index={2}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                  <InputOTPSlot
                    index={3}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                  <InputOTPSlot
                    index={4}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                  <InputOTPSlot
                    index={5}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="button"
              disabled={loading || mfaCode.length !== 6}
              onClick={handleVerifyMfaEnroll}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                "Complete setup & sign in"
              )}
            </Button>
          </motion.div>
        )}

        {/* STAGE 3B: Existing TOTP Challenge */}
        {stage === "mfa_challenge" && (
          <motion.div
            key="stage-challenge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <div className="space-y-3.5 flex flex-col items-center py-1">
              <InputOTP
                maxLength={6}
                value={mfaCode}
                onChange={(v) => {
                  setMfaCode(v)
                  if (v.length === 6) {
                    handleVerifyMfaChallenge()
                  }
                }}
                autoFocus
              >
                <InputOTPGroup className="gap-2.5 sm:gap-3">
                  <InputOTPSlot
                    index={0}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                  <InputOTPSlot
                    index={1}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                  <InputOTPSlot
                    index={2}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                  <InputOTPSlot
                    index={3}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                  <InputOTPSlot
                    index={4}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                  <InputOTPSlot
                    index={5}
                    className="w-12 h-13 text-lg font-bold bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl focus:bg-white"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="button"
              disabled={loading || mfaCode.length !== 6}
              onClick={handleVerifyMfaChallenge}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                "Verify & sign in"
              )}
            </Button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setStage("mfa_recovery")
                  setErrorMessage(null)
                }}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Use an emergency recovery code
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 3C: Emergency Recovery Code */}
        {stage === "mfa_recovery" && (
          <motion.div
            key="stage-recovery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label
                htmlFor="recovery-input"
                className="text-xs font-semibold text-slate-700"
              >
                Single-use recovery code
              </Label>
              <Input
                id="recovery-input"
                type="text"
                placeholder="9482-1049"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                className="h-11 bg-slate-50/60 border-slate-200 tracking-wider text-base text-slate-900 text-center rounded-xl focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900"
                autoFocus
              />
            </div>

            <div className="flex gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStage("mfa_challenge")
                  setRecoveryCode("")
                  setErrorMessage(null)
                }}
                className="flex-1 h-11 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </Button>
              <Button
                type="button"
                disabled={loading || !recoveryCode}
                onClick={handleVerifyMfaRecovery}
                className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* STAGE 4: Success & Session Established */}
        {stage === "success" && (
          <motion.div
            key="stage-success"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-4 flex flex-col items-center justify-center text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Authenticated
              </h3>
              {authenticatedStaff && (
                <p className="text-xs text-slate-500 mt-1">
                  Welcome back, {authenticatedStaff.name} ({authenticatedStaff.primaryRole})
                </p>
              )}
            </div>
            <div className="w-36 h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
              <motion.div
                className="h-full bg-slate-900"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.9 }}
              />
            </div>
          </motion.div>
        )}
      </main>

      {/* Bottom Spacer */}
      <div className="w-full h-4 sm:h-8" />
    </div>
  )
}
