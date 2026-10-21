"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import {
  ShieldCheck,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  Download,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import {
  acceptStaffInvite,
  requestStaffLogin,
  verifyStaffOtp,
  verifyStaffMfaEnroll,
  type StaffVerifyOtpResponse,
  type StaffAuthSessionResponse,
} from "@/services/staff-auth"
import { establishAuthSession } from "@/services/auth-session"
import type { User, UserRole } from "@/types/user"

type StepId = "invite" | "email_otp" | "mfa_setup" | "complete"

const STEPS: { id: StepId; number: string; title: string; subtitle: string }[] = [
  {
    id: "invite",
    number: "01",
    title: "Accept Invitation",
    subtitle: "Claim your staff authorization",
  },
  {
    id: "email_otp",
    number: "02",
    title: "Corporate Email OTP",
    subtitle: "Verify authorization via one-time code",
  },
  {
    id: "mfa_setup",
    number: "03",
    title: "Authenticator MFA",
    subtitle: "Enroll hardware / TOTP security key",
  },
  {
    id: "complete",
    number: "04",
    title: "Console Access",
    subtitle: "Access operations workspace",
  },
]

function formatRoleTitle(role?: string): string {
  switch (role) {
    case "ADMIN":
      return "System Administrator"
    case "EV_CHARGER_MANAGER":
      return "EV Charging Infrastructure Manager"
    case "PARKING_MANAGER":
      return "Smart Parking Facility Manager"
    case "EMPLOYEE":
      return "Operations Staff"
    case "DISPATCHER":
      return "Fleet Operations Dispatcher"
    case "DRIVER":
      return "Fleet Commercial Driver"
    default:
      return role?.replace(/_/g, " ") || "Authorized Staff"
  }
}

function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Current Step
  const [currentStep, setCurrentStep] = React.useState<StepId>("invite")

  // Step 1: Invitation State
  const [inviteToken, setInviteToken] = React.useState("")
  const [invitedEmail, setInvitedEmail] = React.useState("")
  const [assignedRole, setAssignedRole] = React.useState<string>("EMPLOYEE")
  const [inviteAccepted, setInviteAccepted] = React.useState(false)

  // Step 2: Email OTP State
  const [emailOtp, setEmailOtp] = React.useState("")
  const [countdown, setCountdown] = React.useState(60)
  const [devOtpHint, setDevOtpHint] = React.useState<string | null>(null)

  // Step 3: MFA Enrollment State
  const [mfaData, setMfaData] = React.useState<StaffVerifyOtpResponse | null>(null)
  const [mfaCode, setMfaCode] = React.useState("")
  const [showManualSecret, setShowManualSecret] = React.useState(false)
  const [showRecoveryCodes, setShowRecoveryCodes] = React.useState(false)
  const [copiedSecret, setCopiedSecret] = React.useState(false)
  const [copiedRecovery, setCopiedRecovery] = React.useState(false)

  // Step 4: Final Session
  const [sessionUser, setSessionUser] = React.useState<StaffAuthSessionResponse["user"] | null>(null)
  const [redirectTarget, setRedirectTarget] = React.useState("/admin")

  // Shared UI Status
  const [loading, setLoading] = React.useState(false)

  // Extract initial token from query param on mount
  React.useEffect(() => {
    const tokenFromUrl = searchParams.get("token")
    if (tokenFromUrl && tokenFromUrl.trim()) {
      setInviteToken(tokenFromUrl.trim())
    }
  }, [searchParams])

  // Countdown timer for email OTP
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentStep === "email_otp" && countdown > 0) {
      interval = setInterval(() => setCountdown((prev) => prev - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [currentStep, countdown])

  const formatStaffUser = (rawUser: StaffAuthSessionResponse["user"]): User => {
    return {
      id: rawUser.id,
      name: rawUser.name || "Operations Staff",
      email: rawUser.email || null,
      phone: rawUser.phone || null,
      avaterUrl: null,
      bio: null,
      location: "Addis Ababa Operations Hub",
      role: rawUser.primaryRole,
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

  // ─────────────────────────────────────────────────────────────
  // STEP 1: Accept Invitation
  // ─────────────────────────────────────────────────────────────
  const handleAcceptInvite = async () => {
    const token = (inviteToken || searchParams.get("token") || "").trim()
    if (!token) {
      toast.error(
        "No invitation token detected in the URL. Please ensure you opened the full link sent to your email."
      )
      return
    }

    setLoading(true)

    try {
      const response = await acceptStaffInvite(token)

      const email = response.data?.email || "invited.staff@habeshago.et"
      const role = response.data?.role || "EMPLOYEE"

      setInvitedEmail(email)
      setAssignedRole(String(role))
      setInviteAccepted(true)

      toast.success("Invitation accepted successfully!")

      // Proceed to Step 2: Trigger OTP to the verified email
      await triggerEmailOtp(email)
      setCurrentStep("email_otp")
    } catch (err: unknown) {
      const customErr = err as { code?: string; message?: string }
      if (customErr.code === "INVITE_ALREADY_ACCEPTED") {
        toast.info(
          "This invitation has already been accepted. If you are completing your setup, continue with email verification."
        )
        // Allow proceeding to email OTP with the email if available
        if (invitedEmail || token.includes("@")) {
          const emailFallback = invitedEmail || token
          setInvitedEmail(emailFallback)
          setInviteAccepted(true)
        }
      } else if (customErr.code === "INVITE_EXPIRED") {
        toast.error(
          "This staff invitation token has expired. Please contact your Operations Administrator to issue a new invitation."
        )
      } else {
        toast.error(
          customErr.message ||
            "Unable to validate invitation token. Please check the link or contact operations support."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  // Helper to send OTP to the email
  const triggerEmailOtp = async (emailToSend: string) => {
    try {
      const res = await requestStaffLogin(emailToSend)
      if (res.devOtp) {
        setDevOtpHint(res.devOtp)
      }
      setCountdown(60)
    } catch (otpErr: unknown) {
      const msg =
        otpErr instanceof Error
          ? otpErr.message
          : "Failed to dispatch email verification code."
      toast.error(msg)
    }
  }

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (countdown > 0 || !invitedEmail) return
    setLoading(true)
    try {
      await triggerEmailOtp(invitedEmail)
      toast.success("New 6-digit verification code sent to your email")
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 2: Verify Email OTP
  // ─────────────────────────────────────────────────────────────
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || emailOtp).trim()
    if (!invitedEmail) {
      toast.error("Corporate email address is missing. Please start from Step 1.")
      return
    }
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.")
      return
    }

    setLoading(true)

    try {
      const res = await verifyStaffOtp(invitedEmail, code)
      setMfaData(res)

      if (res.mfaSetupRequired || res.secret) {
        // MFA setup is required for new invited staff
        setCurrentStep("mfa_setup")
        toast.success("Email verified. Proceed to configure Multi-Factor Authentication.")
      } else {
        // If MFA was already configured, direct to authenticator entry
        setCurrentStep("mfa_setup")
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Invalid or expired verification code."
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 3: Complete MFA Setup
  // ─────────────────────────────────────────────────────────────
  const handleCompleteMfaEnrollment = async (codeToVerify?: string) => {
    const code = (codeToVerify || mfaCode).trim()
    if (!mfaData?.mfaToken) {
      toast.error("MFA session token expired. Please start over from step 1.")
      return
    }
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code shown in your authenticator app.")
      return
    }

    setLoading(true)

    try {
      const session = await verifyStaffMfaEnroll(mfaData.mfaToken, code)
      setSessionUser(session.user)

      const target =
        session.user.defaultRedirect ||
        (session.user.primaryRole === "EV_CHARGER_MANAGER"
          ? "/ev-charge-manager"
          : "/admin")
      setRedirectTarget(target)

      // Establish session in auth context
      const formatted = formatStaffUser(session.user)
      await establishAuthSession(session.accessToken, formatted)

      setCurrentStep("complete")
      toast.success("Multi-Factor Authentication successfully activated!")
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Invalid authenticator code. Check your clock sync and try again."
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleCopySecret = () => {
    if (mfaData?.secret) {
      navigator.clipboard.writeText(mfaData.secret)
      setCopiedSecret(true)
      toast.success("Secret key copied to clipboard")
      setTimeout(() => setCopiedSecret(false), 2000)
    }
  }

  const handleCopyRecovery = () => {
    if (mfaData?.recoveryCodes) {
      navigator.clipboard.writeText(mfaData.recoveryCodes.join("\n"))
      setCopiedRecovery(true)
      toast.success("Recovery codes copied")
      setTimeout(() => setCopiedRecovery(false), 2000)
    }
  }

  const handleDownloadRecovery = () => {
    if (!mfaData?.recoveryCodes) return
    const content = `HABESHAGO ENTERPRISE OPERATIONS - EMERGENCY RECOVERY CODES\nEmail: ${invitedEmail}\nRole: ${assignedRole}\nDate: ${new Date().toISOString()}\n\n${mfaData.recoveryCodes.join(
      "\n"
    )}\n\nIMPORTANT: Keep these single-use recovery codes in an encrypted password vault.`
    const element = document.createElement("a")
    const file = new Blob([content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `habeshago-recovery-${invitedEmail.split("@")[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success("Recovery codes file downloaded")
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col lg:flex-row antialiased selection:bg-slate-900 selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          LEFT PANEL: Enterprise Identity & Progress Timeline
          (Frameless, seamless slate architecture, NOT a card)
         ───────────────────────────────────────────────────────────── */}
      <aside className="w-full lg:w-[380px] xl:w-[420px] bg-slate-950 text-slate-100 flex flex-col justify-center p-4 sm:p-6 lg:p-16 border-b lg:border-b-0 lg:border-r border-slate-900 shrink-0">
        {/* Mobile & Tablet Stepper (< lg) */}
        <div className="lg:hidden w-full max-w-xl mx-auto space-y-3">
          {/* Horizontal progress bar / nodes */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const isCurrent = currentStep === step.id
              const stepIndex = STEPS.findIndex((s) => s.id === currentStep)
              const isDone = stepIndex > idx

              return (
                <React.Fragment key={step.id}>
                  {/* Step node */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all shrink-0 ${
                        isDone
                          ? "bg-emerald-500 text-slate-950 ring-2 sm:ring-4 ring-emerald-500/20"
                          : isCurrent
                          ? "bg-white text-slate-950 ring-2 sm:ring-4 ring-white/10"
                          : "bg-slate-900 text-slate-500 border border-slate-800"
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.number}
                    </div>
                    {/* Tablet step title */}
                    <span
                      className={`hidden sm:block text-[11px] font-medium tracking-tight text-center max-w-[85px] truncate ${
                        isCurrent ? "text-white" : isDone ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  {/* Horizontal connector line */}
                  {idx !== STEPS.length - 1 && (
                    <div
                      className={`h-[2px] flex-1 mx-2 sm:mx-3 transition-colors ${
                        stepIndex > idx ? "bg-emerald-500/60" : "bg-slate-800"
                      }`}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>

          {/* Mobile active step label (< sm only) */}
          <div className="sm:hidden flex items-center justify-between text-xs pt-0.5">
            <span className="text-slate-300 font-medium">
              {STEPS.find((s) => s.id === currentStep)?.title}
            </span>
            <span className="text-slate-500 text-[11px]">
              {STEPS.findIndex((s) => s.id === currentStep) + 1} of {STEPS.length}
            </span>
          </div>
        </div>

        {/* Desktop Stepper (lg+) */}
        <nav aria-label="Onboarding Steps" className="hidden lg:block space-y-8">
          {STEPS.map((step, idx) => {
            const isCurrent = currentStep === step.id
            const stepIndex = STEPS.findIndex((s) => s.id === currentStep)
            const isDone = stepIndex > idx

            return (
              <div key={step.id} className="relative flex items-start gap-4 group">
                {/* Vertical connector line */}
                {idx !== STEPS.length - 1 && (
                  <div
                    className={`absolute left-[15px] top-[30px] bottom-[-24px] w-px transition-colors ${
                      isDone ? "bg-emerald-500/40" : "bg-slate-800"
                    }`}
                  />
                )}

                {/* Step Icon / Number Indicator */}
                <div
                  className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-semibold transition-all shrink-0 ${
                    isDone
                      ? "bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20"
                      : isCurrent
                      ? "bg-white text-slate-950 ring-4 ring-white/10"
                      : "bg-slate-900 text-slate-500 border border-slate-800"
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.number}
                </div>

                {/* Step Label */}
                <div className="pt-0.5 space-y-0.5">
                  <p
                    className={`text-sm font-semibold tracking-tight transition-colors ${
                      isCurrent
                        ? "text-white"
                        : isDone
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500 leading-snug">
                    {step.subtitle}
                  </p>
                </div>
              </div>
            )
          })}
        </nav>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT PANEL: Interactive Step Canvas (No Cards, Pure Canvas)
         ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col justify-center p-6 sm:p-10 lg:p-16 xl:p-20 max-w-3xl w-full mx-auto lg:mx-0">
        <div className="space-y-8 sm:space-y-10">

          {/* ─────────────────────────────────────────────────────────────
              STEP 1: Accept Invitation
             ───────────────────────────────────────────────────────────── */}
          {currentStep === "invite" && (
            <motion.div
              key="step-invite"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950">
                  Accept Staff Invitation
                </h1>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl">
                  You have been invited to join the HabeshaGo Operations team.
                  Click accept below to verify your corporate authorization and
                  initiate your two-factor security setup.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  onClick={handleAcceptInvite}
                  disabled={loading}
                  className="w-full sm:w-auto min-w-0 sm:min-w-[240px] h-12 bg-slate-950 hover:bg-slate-900 active:bg-black text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-2 px-8"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Accept Invitation & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 2: Corporate Email OTP Verification
             ───────────────────────────────────────────────────────────── */}
          {currentStep === "email_otp" && (
            <motion.div
              key="step-otp"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg w-fit">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Role Assigned: {formatRoleTitle(assignedRole)}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950">
                  Verify Corporate Email
                </h1>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl">
                  A 6-digit confirmation code was dispatched to{" "}
                  <strong className="text-slate-900 font-semibold">{invitedEmail}</strong>.
                  Enter the code below to authorize your account.
                </p>
              </div>

              {/* Dev Passcode Quick Autofill */}
              {devOtpHint && (
                <div className="py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl">
                  <span className="text-slate-600">
                    Development OTP: <strong className="text-slate-950">{devOtpHint}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailOtp(devOtpHint)
                      handleVerifyOtp(devOtpHint)
                    }}
                    className="text-xs font-semibold text-slate-950 hover:underline cursor-pointer self-start sm:self-auto"
                  >
                    Auto-Fill Code
                  </button>
                </div>
              )}

              <div className="space-y-6 pt-2">
                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    6-Digit Email Verification Code
                  </Label>
                  <InputOTP
                    maxLength={6}
                    value={emailOtp}
                    onChange={(val) => {
                      setEmailOtp(val)
                      if (val.length === 6) {
                        handleVerifyOtp(val)
                      }
                    }}
                    disabled={loading}
                    autoFocus
                  >
                    <InputOTPGroup className="gap-1.5 sm:gap-2.5">
                      <InputOTPSlot index={0} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-lg rounded-xl border-slate-200 focus:border-slate-950" />
                      <InputOTPSlot index={1} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-lg rounded-xl border-slate-200 focus:border-slate-950" />
                      <InputOTPSlot index={2} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-lg rounded-xl border-slate-200 focus:border-slate-950" />
                      <InputOTPSlot index={3} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-lg rounded-xl border-slate-200 focus:border-slate-950" />
                      <InputOTPSlot index={4} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-lg rounded-xl border-slate-200 focus:border-slate-950" />
                      <InputOTPSlot index={5} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-lg rounded-xl border-slate-200 focus:border-slate-950" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={loading || emailOtp.length !== 6}
                    className="w-full sm:w-auto h-12 bg-slate-950 hover:bg-slate-900 active:bg-black text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-2 px-6"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Verify Email Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || loading}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-950 disabled:text-slate-400 py-3 px-2 text-center transition-colors cursor-pointer"
                  >
                    {countdown > 0 ? (
                      <span>Resend code in {countdown}s</span>
                    ) : (
                      <span className="underline underline-offset-2">Resend verification code</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-6 sm:pt-8 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setCurrentStep("invite")}
                  className="inline-flex items-center gap-1.5 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Invitation Token</span>
                </button>
                <span>Code expires in 10 minutes</span>
              </div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 3: Multi-Factor Authentication (MFA / TOTP) Setup
             ───────────────────────────────────────────────────────────── */}
          {currentStep === "mfa_setup" && (
            <motion.div
              key="step-mfa"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950">
                  Enroll Authenticator App
                </h1>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl">
                  Staff accounts require multi-factor verification. Scan the QR code
                  using your preferred authenticator app (Google Authenticator,
                  Microsoft Authenticator, 1Password, or Authy).
                </p>
              </div>

              {/* Authenticator Setup Grid (Frameless, clean layout) */}
              <div className="pt-2 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* QR Code Canvas */}
                <div className="md:col-span-5 space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200 inline-block rounded-xl">
                    {mfaData?.otpauthUri ? (
                      <QRCodeSVG
                        value={mfaData.otpauthUri}
                        size={170}
                        level="M"
                        className="mx-auto"
                      />
                    ) : (
                      <div className="w-[170px] h-[170px] flex items-center justify-center text-xs text-slate-400">
                        QR Code Pending
                      </div>
                    )}
                  </div>

                  <div className="w-full max-w-xs md:max-w-none text-left">
                    <button
                      type="button"
                      onClick={() => setShowManualSecret((prev) => !prev)}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-950 inline-flex items-center gap-1.5 cursor-pointer underline underline-offset-2"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{showManualSecret ? "Hide manual secret" : "Can't scan? Enter key manually"}</span>
                    </button>

                    {showManualSecret && mfaData?.secret && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2.5 p-3 bg-slate-50 border border-slate-200 space-y-2 rounded-xl"
                      >
                        <p className="text-[11px] text-slate-500 font-medium">Account Secret Key:</p>
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-xs text-slate-900 break-all select-all font-semibold">
                            {mfaData.secret}
                          </code>
                          <button
                            type="button"
                            onClick={handleCopySecret}
                            className="p-1.5 text-slate-600 hover:text-slate-950 shrink-0 cursor-pointer"
                            title="Copy secret key"
                          >
                            {copiedSecret ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Verification Code Input Column */}
                <div className="md:col-span-7 space-y-6 w-full">
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Enter 6-Digit Authenticator Code
                    </Label>
                    <p className="text-xs text-slate-500 leading-snug">
                      Enter the 6-digit rolling numerical code currently shown in your
                      authenticator app.
                    </p>
                    <InputOTP
                      maxLength={6}
                      value={mfaCode}
                      onChange={(val) => {
                        setMfaCode(val)
                        if (val.length === 6) {
                          handleCompleteMfaEnrollment(val)
                        }
                      }}
                      disabled={loading}
                      autoFocus
                    >
                      <InputOTPGroup className="gap-1.5 sm:gap-2">
                        <InputOTPSlot index={0} className="w-10 h-12 sm:w-11 sm:h-13 text-base sm:text-lg rounded-xl border-slate-200 focus:border-slate-950" />
                        <InputOTPSlot index={1} className="w-10 h-12 sm:w-11 sm:h-13 text-base sm:text-lg rounded-xl border-slate-200 focus:border-slate-950" />
                        <InputOTPSlot index={2} className="w-10 h-12 sm:w-11 sm:h-13 text-base sm:text-lg rounded-xl border-slate-200 focus:border-slate-950" />
                        <InputOTPSlot index={3} className="w-10 h-12 sm:w-11 sm:h-13 text-base sm:text-lg rounded-xl border-slate-200 focus:border-slate-950" />
                        <InputOTPSlot index={4} className="w-10 h-12 sm:w-11 sm:h-13 text-base sm:text-lg rounded-xl border-slate-200 focus:border-slate-950" />
                        <InputOTPSlot index={5} className="w-10 h-12 sm:w-11 sm:h-13 text-base sm:text-lg rounded-xl border-slate-200 focus:border-slate-950" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleCompleteMfaEnrollment()}
                    disabled={loading || mfaCode.length !== 6}
                    className="w-full h-12 bg-slate-950 hover:bg-slate-900 active:bg-black text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm & Activate MFA</span>
                      </>
                    )}
                  </Button>

                  {/* Emergency Recovery Codes Section */}
                  {mfaData?.recoveryCodes && mfaData.recoveryCodes.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setShowRecoveryCodes((prev) => !prev)}
                          className="text-xs font-semibold text-slate-700 hover:text-slate-950 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Emergency Recovery Codes ({mfaData.recoveryCodes.length})</span>
                          {showRecoveryCodes ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>

                        {showRecoveryCodes && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCopyRecovery}
                              className="text-[11px] font-medium text-slate-600 hover:text-slate-950 inline-flex items-center gap-1 cursor-pointer"
                            >
                              {copiedRecovery ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>Copy All</span>
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={handleDownloadRecovery}
                              className="text-[11px] font-medium text-slate-600 hover:text-slate-950 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {showRecoveryCodes && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
                        >
                          <p className="text-[11px] text-slate-500 mb-2">
                            Store these single-use codes safely. If you lose your
                            authenticator device, they are the only way to recover access.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-800">
                            {mfaData.recoveryCodes.map((rc, i) => (
                              <div key={i} className="py-1 px-2 bg-white border border-slate-100 select-all rounded-lg">
                                {rc}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 4: Onboarding Complete & Access Granted
             ───────────────────────────────────────────────────────────── */}
          {currentStep === "complete" && (
            <motion.div
              key="step-complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50/60">
                  <Check className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Setup Complete
                  </span>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950">
                    You&apos;re All Set Up!
                  </h1>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl">
                    Your staff authorization has been verified and your account is secured with
                    Multi-Factor Authentication. You are ready to start managing operations.
                  </p>
                </div>
              </div>

              <div className="py-3.5 px-4 bg-emerald-50/70 border-l-2 border-emerald-500 rounded-r-xl flex items-center gap-3 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Credentials confirmed • Two-Factor Authentication active</span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Button
                  type="button"
                  onClick={() => router.push(redirectTarget)}
                  className="w-full sm:w-auto h-12 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-2 px-8"
                >
                  <span>Enter Operations Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function StaffAcceptInvitePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
            <span>Loading Staff Invitation Console...</span>
          </div>
        </div>
      }
    >
      <AcceptInviteContent />
    </React.Suspense>
  )
}
