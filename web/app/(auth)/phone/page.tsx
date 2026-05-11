"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"
import {
  Phone,
  Loader,
  Send,
  Key,
  Check,
  X,
  ChevronLeft,
  Clock,
  AlertCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef, useTransition, useEffect } from "react"
import { toast } from "sonner"
import { auth } from "@/lib/firebase"
import { AuthSlider } from "@/components/AuthSlider"
import { cn } from "@/lib/utils"

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth"
import { axiosInstance } from "@/services/axiosInstance"
import { useAppDispatch } from "@/store/store"
import { setAccessToken, setUser } from "@/store/slices/userSlice"
import { getMe } from "@/services/auth.user.api"

export default function PhoneLoginPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const [sendOtpPending, startSendOtp] = useTransition()
  const [verifyOtpPending, startVerifyOtp] = useTransition()

  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const confirmationResultRef = useRef<ConfirmationResult | null>(null)
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null)

  const countryCode = "+251"

  // Handle countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const getRecaptchaVerifier = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.clear()
      recaptchaRef.current = null
    }

    // Clear any leftover DOM the previous widget injected
    const container = document.getElementById("recaptcha-container")
    if (container) container.innerHTML = ""

    recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    })

    return recaptchaRef.current
  }

  // Format Ethiopian phone number
  const formatEthiopianPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`
  }

  // Validate Ethiopian phone number
  const validateEthiopianPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length !== 9) return "Phone number must be 9 digits"
    if (!cleaned.startsWith("7") && !cleaned.startsWith("9")) {
      return "Phone number must start with 7 or 9"
    }
    return ""
  }

  // Handle phone number change
  const handlePhoneChange = (value: string) => {
    const formatted = formatEthiopianPhone(value)
    setPhoneNumber(formatted)
    setPhoneError(validateEthiopianPhone(value))
  }

  const sendOtp = async () => {
    const phone = countryCode + phoneNumber.replace(/\D/g, "")
    const error = validateEthiopianPhone(phoneNumber)

    if (error) {
      setPhoneError(error)
      return
    }

    startSendOtp(async () => {
      try {
        const verifier = getRecaptchaVerifier()

        const confirmation = await signInWithPhoneNumber(auth, phone, verifier)

        confirmationResultRef.current = confirmation

        setOtpSent(true)
        setCountdown(60) // Start 60 second countdown for resend

        toast.success("OTP sent successfully", {
          description: `Verification code sent to ${phone}`,
        })
      } catch (error: any) {
        console.error(error)
        recaptchaRef.current?.clear()
        recaptchaRef.current = null
        toast.error("Failed to send OTP", {
          description:
            error.message || "Please check your phone number and try again",
        })
      }
    })
  }

  const verifyOtp = async () => {
    if (!confirmationResultRef.current) {
      setOtpError("Please request an OTP first")
      return
    }

    if (otp.length !== 6) {
      setOtpError("Please enter all 6 digits")
      return
    }

    startVerifyOtp(async () => {
      try {
        const result = await confirmationResultRef.current!.confirm(otp)
        const idToken = await result.user.getIdToken()

        const res = await axiosInstance.post("/auth/register/phone/verify", {
          idToken,
        })

        const data = res.data

        if (!res.status || res.status !== 200) {
          throw new Error(data.message)
        }

        if (data.success) {
          setOtpVerified(true)

          toast.success("Phone verified successfully", {
            description: "Redirecting to your account...",
          })

          dispatch(setAccessToken(res.data?.accessToken))

          const userRes = await getMe()

          if (userRes.success) {
            console.log(userRes.user.role)
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
        toast.error("Verification failed", {
          description: error.response?.data?.message || error.message,
        })
      }
    })
  }

  const resendOtp = async () => {
    if (countdown > 0) return

    const phone = countryCode + phoneNumber.replace(/\D/g, "")

    try {
      const verifier = getRecaptchaVerifier()

      const confirmation = await signInWithPhoneNumber(auth, phone, verifier)

      confirmationResultRef.current = confirmation
      setCountdown(60)
      setOtp("") // Clear OTP input
      setOtpError("") // Clear any errors

      toast.success("New OTP sent", {
        description: "Please check your messages",
      })
    } catch (error: any) {
      console.error(error)
      recaptchaRef.current?.clear()
      recaptchaRef.current = null
      toast.error("Failed to resend OTP", {
        description: error.message || "Please try again",
      })
    }
  }

  const clearPhone = () => {
    setPhoneNumber("")
    setPhoneError("")
  }

  const resetForm = () => {
    setOtp("")
    setOtpError("")
    setOtpSent(false)
    setOtpVerified(false)
    setCountdown(0)
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AuthSlider />

      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-none border-none bg-background">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-mozilla">
              Welcome to HabeshaGo
            </CardTitle>
            <CardDescription>
              Verify your phone number to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground -mt-2"
              onClick={() => router.push("/login")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to email login
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">
                  Phone verification
                </span>
              </div>
            </div>

            {!otpSent ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Ethiopian Phone Number
                  </Label>
                  <div className="relative">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 z-10">
                        <span className="font-medium text-primary">
                          {countryCode}
                        </span>
                        <div className="w-px h-4 bg-border" />
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="912 345 678"
                        className={cn(
                          "pl-16 h-12 pr-10 transition-all",
                          phoneError &&
                            "border-destructive focus-visible:ring-destructive",
                          phoneNumber &&
                            !phoneError &&
                            "border-green-200 focus-visible:ring-green-200",
                        )}
                        maxLength={11}
                      />

                      {/* Status icons */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {phoneNumber && !phoneError && (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                        {phoneNumber && (
                          <button
                            type="button"
                            onClick={clearPhone}
                            className="p-1 hover:bg-muted rounded-full transition-colors"
                            aria-label="Clear phone number"
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Error message */}
                    {phoneError && (
                      <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />
                        {phoneError}
                      </p>
                    )}

                    {/* Helper text */}
                    {!phoneNumber && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Enter your 9-digit Ethiopian number (starts with 7 or 9)
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={sendOtp}
                  disabled={!phoneNumber || !!phoneError || sendOtpPending}
                  className="w-full h-12 transition-all"
                  size="lg"
                >
                  {sendOtpPending ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Phone number display */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {countryCode} {phoneNumber}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {otpVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>

                {/* OTP Input */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Enter 6-digit verification code
                  </Label>

                  <div className="flex flex-col items-center gap-3">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => {
                        setOtp(value.replace(/\D/g, ""))
                        setOtpError("")
                      }}
                      disabled={verifyOtpPending || otpVerified}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>

                      <InputOTPSeparator />

                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>

                    {otpVerified && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <Check className="h-4 w-4" />
                        Code verified
                      </div>
                    )}

                    {otpError && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {otpError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Timer and resend */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {countdown > 0 ? (
                      <span className="text-sm text-muted-foreground">
                        Resend in{" "}
                        <span className="font-mono font-bold">
                          {countdown}s
                        </span>
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Code expired
                      </span>
                    )}
                  </div>

                  <Button
                    variant="link"
                    size="sm"
                    onClick={resendOtp}
                    disabled={countdown > 0 || verifyOtpPending}
                    className="h-auto p-0"
                  >
                    Resend Code
                  </Button>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={verifyOtpPending}
                    className="h-12"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Change
                  </Button>

                  <Button
                    onClick={verifyOtp}
                    disabled={
                      otp.length !== 6 || verifyOtpPending || otpVerified
                    }
                    className="h-12 transition-all"
                  >
                    {verifyOtpPending ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                        Verifying
                      </>
                    ) : otpVerified ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Footer text */}
            <div className="text-center space-y-2 pt-4">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to HabeshaGo's{" "}
                <button
                  onClick={() => toast.info("Terms of Service")}
                  className="text-primary hover:underline"
                >
                  Terms
                </button>{" "}
                &{" "}
                <button
                  onClick={() => toast.info("Privacy Policy")}
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </div>
  )
}
