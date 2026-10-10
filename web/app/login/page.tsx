"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import {
  Loader,
  CheckCircle,
  AlertCircle,
  Mail,
  X,
  ArrowRight,
  ArrowLeft,
  Key,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Timer,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  useCallback,
} from "react"
import { toast } from "sonner"
import { FcGoogle } from "react-icons/fc"
import { register, verifyOTP, establishAuthSession } from "@/services"
import { AuthSlider } from "@/components/auth"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const COMMON_EMAIL_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "hotmail.com",
  "mail.com",
  "icloud.com",
  "protonmail.com",
]

const EMAIL_PROVIDERS = {
  gmail: { domain: "gmail.com", color: "text-red-500" },
  outlook: { domain: "outlook.com", color: "text-blue-500" },
  yahoo: { domain: "yahoo.com", color: "text-purple-500" },
  hotmail: { domain: "hotmail.com", color: "text-blue-400" },
  icloud: { domain: "icloud.com", color: "text-gray-500" },
}

export default function LoginPage() {
  const router = useRouter()

  const [googlePending] = useTransition()
  const [emailPending, startEmail] = useTransition()
  const [verifyPending, startVerify] = useTransition()

  // Step 1 = Email input, Step 2 = OTP verification
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isValidEmail, setIsValidEmail] = useState(false)
  const [touched, setTouched] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)

  // OTP state
  const [otp, setOtp] = useState("")
  const [resendCooldown, setResendCooldown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle")
  const [attempts, setAttempts] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const otpContainerRef = useRef<HTMLDivElement>(null)

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const generateSuggestions = useCallback((value: string) => {
    if (!value) return []
    const [localPart, domain] = value.split("@")
    if (domain !== undefined) {
      return COMMON_EMAIL_DOMAINS.filter((d) =>
        d.toLowerCase().startsWith(domain.toLowerCase()),
      )
        .map((d) => `${localPart}@${d}`)
        .slice(0, 4)
    }
    if (localPart.length > 2) {
      return COMMON_EMAIL_DOMAINS.map((d) => `${localPart}@${d}`).slice(0, 4)
    }
    return []
  }, [])

  useEffect(() => {
    const isValid = validateEmail(email)
    setIsValidEmail(isValid)

    if (email && !isValid) {
      const newSuggestions = generateSuggestions(email)
      setSuggestions(newSuggestions)
      setShowSuggestions(newSuggestions.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    if (touched) setEmailError("")
    setSelectedSuggestionIndex(-1)
  }, [email, generateSuggestions, touched])

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Resend timer for OTP
  useEffect(() => {
    if (step === 2 && resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (step === 2) {
      setCanResend(true)
    }
  }, [step, resendCooldown])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault()
          handleSuggestionClick(suggestions[selectedSuggestionIndex])
        }
        break
      case "Escape":
        setShowSuggestions(false)
        break
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setEmail(suggestion)
    setShowSuggestions(false)
    setTouched(true)
  }

  const handleBlur = () => {
    setTouched(true)
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address")
    }

    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false)
      }
    }, 200)
  }

  const clearEmail = () => {
    setEmail("")
    setEmailError("")
    setSuggestions([])
    setShowSuggestions(false)
    setIsValidEmail(false)
    inputRef.current?.focus()
  }

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      setEmailError("Enter a valid email address")
      return
    }

    startEmail(async () => {
      const res = await register({ email })
      if (!res.success) {
        setEmailError(res.message || "Failed to send verification code")
        toast.error(res.message || "Failed to send verification code")
        return
      }
      toast.success("Verification code sent to your email")
      setStep(2)
      setResendCooldown(60)
      setCanResend(false)
      setOtp("")
      setVerificationStatus("idle")
    })
  }

  const verifyAccount = useCallback(() => {
    if (attempts >= 3) {
      toast.error("Too many attempts. Please request a new code.")
      return
    }

    setVerificationStatus("verifying")
    startVerify(async () => {
      try {
        const res = await verifyOTP({ email, code: otp })

        if (res.success) {
          setVerificationStatus("success")
          toast.success("Welcome back! Signed in successfully.")
          await establishAuthSession(res.data.accessToken)
          setTimeout(() => router.push("/"), 700)
          return
        }

        throw new Error(res.message || "Invalid verification code")
      } catch (error: unknown) {
        setVerificationStatus("error")
        toast.error(
          error instanceof Error ? error.message : "Invalid verification code",
        )
        setAttempts((prev) => prev + 1)
      }
    })
  }, [attempts, email, otp, router])

  // Auto-verify when OTP has 6 digits
  useEffect(() => {
    if (otp.length === 6 && !verifyPending && verificationStatus === "idle") {
      const timer = setTimeout(verifyAccount, 400)
      return () => clearTimeout(timer)
    }
  }, [otp, verifyAccount, verifyPending, verificationStatus])

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
    } catch {
      toast.error("Failed to resend code")
    }
  }

  const signInWithGoogle = async () => {
    try {
      window.location.href = "/api/auth/google"
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "Google sign in failed")
    }
  }

  const getProviderInfo = (suggestion: string) => {
    const domain = suggestion.split("@")[1]
    return Object.values(EMAIL_PROVIDERS).find((p) => p.domain === domain)
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden flex bg-slate-50/50 text-slate-900 selection:bg-orange-500/15 selection:text-orange-900 font-sans">
      {/* Left Side: Visual Showcase Slider */}
      <AuthSlider />

      {/* Right Side: Clean Centered Login Card */}
      <div className="flex w-full lg:w-1/2 h-full items-center justify-center p-6 sm:p-10 overflow-y-auto lg:overflow-hidden font-sans">
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-white border-none shadow-none rounded-2xl overflow-hidden">
            <CardContent className="p-7 sm:p-9 space-y-6">
              {/* Back to Home Link */}
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Home</span>
                </Link>

                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setOtp("")
                      setVerificationStatus("idle")
                    }}
                    className="text-xs text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
                  >
                    Change Email
                  </button>
                )}
              </div>

              {step === 1 ? (
                <>
                  {/* Header */}
                  <div className="text-center space-y-1.5">
                    <div className="flex lg:hidden items-center justify-center gap-2 mb-2">
                      <span className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
                        Habesha<span className="text-orange-500">Go</span>
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sans">
                      Welcome back
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-sans">
                      Sign in to your HabeshaGo account
                    </p>
                  </div>

                  {/* Google Action */}
                  <div className="space-y-2.5">
                    <Button
                      onClick={signInWithGoogle}
                      variant="outline"
                      type="button"
                      disabled={googlePending}
                      className="w-full h-11 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-colors cursor-pointer shadow-none flex items-center justify-center gap-2.5"
                    >
                      <FcGoogle className="h-5 w-5 shrink-0" />
                      <span>Continue with Google</span>
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-[11px] text-slate-400 uppercase tracking-wider">
                      <span className="bg-white px-3 font-medium">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  {/* Email Form */}
                  <form onSubmit={submitEmail} className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <Label
                        htmlFor="email"
                        className="text-xs font-semibold text-slate-700"
                      >
                        Email address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          ref={inputRef}
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onFocus={() =>
                            suggestions.length > 0 && setShowSuggestions(true)
                          }
                          onBlur={handleBlur}
                          placeholder="name@example.com"
                          className={cn(
                            "pl-10 h-11 pr-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 text-sm rounded-xl transition-colors",
                            isValidEmail &&
                              "border-emerald-300 focus-visible:border-emerald-500",
                            emailError &&
                              "border-red-300 focus-visible:border-red-500",
                          )}
                          aria-invalid={!!emailError}
                        />

                        {/* Status icon / Clear button */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {isValidEmail && (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          )}
                          {email && (
                            <button
                              type="button"
                              onClick={clearEmail}
                              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                              aria-label="Clear email"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Suggestions dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                          <div
                            ref={suggestionsRef}
                            className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 text-left"
                          >
                            <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              Suggested emails
                            </div>
                            {suggestions.map((suggestion, index) => {
                              const provider = getProviderInfo(suggestion)
                              return (
                                <button
                                  key={suggestion}
                                  type="button"
                                  onClick={() =>
                                    handleSuggestionClick(suggestion)
                                  }
                                  onMouseEnter={() =>
                                    setSelectedSuggestionIndex(index)
                                  }
                                  className={cn(
                                    "w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors text-xs text-slate-700 cursor-pointer",
                                    selectedSuggestionIndex === index &&
                                      "bg-slate-50 text-orange-600",
                                  )}
                                >
                                  <Mail
                                    className={cn(
                                      "h-3.5 w-3.5 shrink-0",
                                      provider?.color || "text-slate-400",
                                    )}
                                  />
                                  <span className="flex-1 font-medium truncate">
                                    {suggestion}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {emailError && (
                        <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{emailError}</span>
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={emailPending || !isValidEmail}
                      className="w-full h-11 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-none flex items-center justify-center gap-2"
                    >
                      {emailPending ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin text-white" />
                          <span>Sending verification code...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue with Email</span>
                          <ArrowRight className="h-4 w-4 text-white" />
                        </>
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                /* Step 2: OTP Verification */
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="inline-flex p-3 rounded-2xl bg-orange-50 text-orange-600 mb-1">
                      <AnimatePresence mode="wait">
                        {verificationStatus === "success" ? (
                          <motion.div
                            key="success"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
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

                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      Enter verification code
                    </h2>
                    <p className="text-xs text-slate-500">
                      We sent a 6-digit code to{" "}
                      <span className="font-semibold text-slate-800">
                        {email}
                      </span>
                    </p>
                  </div>

                  <div ref={otpContainerRef} className="space-y-4">
                    <div className="flex justify-center py-1">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(val) => {
                          if (/^\d*$/.test(val)) {
                            setOtp(val)
                            setVerificationStatus("idle")
                          }
                        }}
                        disabled={
                          verifyPending || verificationStatus === "success"
                        }
                      >
                        <InputOTPGroup className="gap-2 sm:gap-2.5">
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className={cn(
                                "h-12 w-10 sm:h-13 sm:w-11 text-lg font-bold bg-white border border-slate-200 rounded-xl text-slate-900 transition-all font-sans shadow-none",
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

                    <Button
                      onClick={verifyAccount}
                      disabled={
                        verifyPending ||
                        otp.length < 6 ||
                        verificationStatus === "success"
                      }
                      className={cn(
                        "w-full h-11 text-sm font-semibold rounded-xl shadow-none transition-colors cursor-pointer",
                        verificationStatus === "success"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-orange-500 hover:bg-orange-600 text-white",
                      )}
                    >
                      {verifyPending ? (
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
                          <span>Verify &amp; Sign In</span>
                        </div>
                      )}
                    </Button>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Timer className="h-3.5 w-3.5 text-slate-400" />
                        <span>Expires in</span>
                        <span className="font-semibold text-slate-700">
                          {Math.floor(resendCooldown / 60)}:
                          {(resendCooldown % 60).toString().padStart(2, "0")}
                        </span>
                      </div>

                      {canResend ? (
                        <button
                          type="button"
                          onClick={resendOtp}
                          className="text-orange-600 hover:text-orange-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Resend code</span>
                        </button>
                      ) : (
                        <span className="text-slate-400">
                          Resend in {resendCooldown}s
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
