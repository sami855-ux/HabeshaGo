"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Phone,
  MessageSquare,
  RotateCw,
  Check,
  X,
  Clock,
  Smartphone,
  Key,
  Info,
  ChevronLeft,
} from "lucide-react"

export default function PhoneLoginPage() {
  const router = useRouter()

  const [phoneNumber, setPhoneNumber] = useState("978109304")
  const [phoneError, setPhoneError] = useState("")
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showInvalidDialog, setShowInvalidDialog] = useState(false)

  const phoneInputRef = useRef<HTMLInputElement>(null)
  const countryCode = "+251" // Fixed to Ethiopia

  // Handle countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Format Ethiopian phone number
  const formatEthiopianPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "")

    // Ethiopian format: 9XX XXX XXX or 7XX XXX XXX
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`
  }

  // Validate Ethiopian phone number - simplified
  const validateEthiopianPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "")

    if (cleaned.length !== 9) {
      return "Phone number must be 9 digits"
    }

    // Must start with 7 or 9
    if (!cleaned.startsWith("7") && !cleaned.startsWith("9")) {
      return "Phone number must start with 7 or 9"
    }

    // For numbers starting with 7, ensure second digit is valid
    if (cleaned.startsWith("7")) {
      const secondDigit = cleaned.charAt(1)
      if (
        !["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(
          secondDigit
        )
      ) {
        return "Invalid phone number format"
      }
    }

    // For numbers starting with 9, ensure second digit is valid
    if (cleaned.startsWith("9")) {
      const secondDigit = cleaned.charAt(1)
      if (
        !["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(secondDigit)
      ) {
        return "Invalid phone number format"
      }
    }

    return ""
  }

  // Handle phone number change
  const handlePhoneChange = (value: string) => {
    const formatted = formatEthiopianPhone(value)
    setPhoneNumber(formatted)

    if (value) {
      const error = validateEthiopianPhone(value)
      setPhoneError(error)
    } else {
      setPhoneError("")
    }
  }

  // Handle OTP change
  const handleOtpChange = (value: string) => {
    setOtp(value)
    setOtpError("")

    // Auto-submit when 6 digits are entered
    if (value.length === 6) {
      verifyOtp()
    }
  }

  // Send OTP
  const sendOtp = async () => {
    const fullPhoneNumber = countryCode + phoneNumber.replace(/\D/g, "")
    const error = validateEthiopianPhone(phoneNumber)

    if (error) {
      setPhoneError(error)
      phoneInputRef.current?.focus()
      return
    }

    setIsSendingOtp(true)
    setPhoneError("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real app, you would call:
      // await authClient.phoneOtp.sendVerificationOtp({
      //   phone: fullPhoneNumber,
      //   type: "sign-in",
      // })

      setOtpSent(true)
      setCountdown(60) // 60 seconds countdown
      toast.success("OTP sent to your phone", {
        description: `Sent to ${fullPhoneNumber}`,
        icon: <MessageSquare className="w-4 h-4" />,
      })
    } catch (error) {
      toast.error("Failed to send OTP", {
        description: "Please check your phone number and try again",
      })
    } finally {
      setIsSendingOtp(false)
    }
  }

  // Verify OTP
  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter all 6 digits")
      return
    }

    setIsVerifyingOtp(true)
    setOtpError("")

    try {
      // Simulate API verification
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real app, you would call:
      // await authClient.phoneOtp.verifyOtp({
      //   phone: countryCode + phoneNumber.replace(/\D/g, ''),
      //   otp,
      //   type: "sign-in",
      // })

      setOtpVerified(true)
      toast.success("Phone verified successfully", {
        description: "Redirecting to your account...",
        icon: <Check className="w-4 h-4" />,
      })

      // Redirect to home page
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (error) {
      setOtpError("Invalid OTP. Please try again.")
      setShowInvalidDialog(true)
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  // Resend OTP
  const resendOtp = async () => {
    if (countdown > 0) return

    setCountdown(60)

    try {
      await sendOtp()
      toast.info("New OTP sent", {
        description: "Check your messages again",
      })
    } catch (error) {
      toast.error("Failed to resend OTP")
    }
  }

  // Reset form
  const resetForm = () => {
    setOtp("")
    setOtpSent(false)
    setOtpVerified(false)
    setCountdown(0)
    setPhoneError("")
    setOtpError("")
    phoneInputRef.current?.focus()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <Card className="w-full max-w-md mx-auto border shadow-xl">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="gap-1">
              🇪🇹 +251
            </Badge>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl text-center font-bold">
              Phone Verification
            </CardTitle>
            <CardDescription className="text-center">
              Enter your Ethiopian phone number to receive OTP
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Ethiopian Phone Number
            </Label>

            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <span className="font-medium text-primary">+251</span>
                <div className="w-px h-4 bg-border" />
              </div>
              <Input
                ref={phoneInputRef}
                type="tel"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="7XX XXX XXX or 9XX XXX XXX"
                className={`pl-16 h-12 ${phoneError ? "border-destructive" : ""}`}
                disabled={otpSent}
                maxLength={11} // Including spaces
              />

              {phoneNumber && !phoneError && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
              )}
            </div>
          </div>

          {/* Example Numbers */}
          {!phoneNumber && (
            <div className="bg-muted/50 p-3 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Enter your 9-digit Ethiopian number starting with 7 or 9:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePhoneChange("711234567")}
                  className="justify-start h-8"
                >
                  7XX XXX XXX
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePhoneChange("978109304")}
                  className="justify-start h-8"
                >
                  9XX XXX XXX
                </Button>
              </div>
            </div>
          )}

          {/* Send OTP Button */}
          {!otpSent ? (
            <Button
              onClick={sendOtp}
              disabled={isSendingOtp || !phoneNumber || !!phoneError}
              className="w-full h-12 gap-2"
              size="lg"
            >
              {isSendingOtp ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  Send OTP via SMS
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              {/* OTP Input Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2 justify-center">
                  <Key className="w-4 h-4" />
                  Enter 6-digit OTP
                </Label>

                <div className="flex flex-col items-center space-y-4">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={handleOtpChange}
                    disabled={isVerifyingOtp || otpVerified}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="h-14 w-14 text-xl" />
                      <InputOTPSlot index={1} className="h-14 w-14 text-xl" />
                      <InputOTPSlot index={2} className="h-14 w-14 text-xl" />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} className="h-14 w-14 text-xl" />
                      <InputOTPSlot index={4} className="h-14 w-14 text-xl" />
                      <InputOTPSlot index={5} className="h-14 w-14 text-xl" />
                    </InputOTPGroup>
                  </InputOTP>

                  {otpError && (
                    <p className="text-sm text-destructive text-center">
                      {otpError}
                    </p>
                  )}

                  {otp.length === 6 && !isVerifyingOtp && !otpVerified && (
                    <p className="text-sm text-muted-foreground text-center">
                      Press Enter or wait to verify automatically
                    </p>
                  )}
                </div>
              </div>

              {/* Countdown and Resend */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {countdown > 0 ? (
                    <>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Resend in{" "}
                        <span className="font-mono font-bold">
                          {countdown}s
                        </span>
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      Code expires in 10 minutes
                    </span>
                  )}
                </div>

                <Button
                  variant="link"
                  size="sm"
                  onClick={resendOtp}
                  disabled={countdown > 0 || isVerifyingOtp}
                  className="gap-1"
                >
                  <RotateCw
                    className={`w-3 h-3 ${countdown > 0 ? "" : "animate-pulse"}`}
                  />
                  Resend Code
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={isVerifyingOtp}
                  className="gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Change Number
                </Button>

                <Button
                  onClick={verifyOtp}
                  disabled={otp.length !== 6 || isVerifyingOtp || otpVerified}
                  className="gap-2"
                >
                  {isVerifyingOtp ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : otpVerified ? (
                    <>
                      <Check className="w-4 h-4" />
                      Verified!
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Verify Code
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <Button
              variant="link"
              onClick={() => router.push("/login")}
              className="h-auto p-0 cursor-pointer"
            >
              ← Use email instead
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Loading Overlay */}
      {(isSendingOtp || isVerifyingOtp) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-96">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <RotateCw className="w-12 h-12 animate-spin text-primary" />
                  <Phone className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-medium">
                    {isSendingOtp ? "Sending OTP..." : "Verifying OTP..."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isSendingOtp
                      ? "Sending verification code to your phone..."
                      : "Please wait while we verify your code"}
                  </p>
                </div>
                <Skeleton className="h-2 w-48" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invalid OTP Dialog */}
      <AlertDialog open={showInvalidDialog} onOpenChange={setShowInvalidDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <X className="w-5 h-5 text-destructive" />
              Invalid Verification Code
            </AlertDialogTitle>
            <AlertDialogDescription>
              The verification code you entered is incorrect. Please try again
              or request a new code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOtp("")}>
              Try Again
            </AlertDialogCancel>
            <AlertDialogAction onClick={resendOtp} disabled={countdown > 0}>
              Send New Code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
