"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/store"
import { fetchUserWallet, setWallet } from "@/store/slices/walletSlice"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Fingerprint,
  Lock,
  RefreshCw,
  Shield,
  Wallet,
  Key,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Mail,
} from "lucide-react"

// API Services
import { updateBiometricAPI, changePinAPI } from "@/services/wallet.api"
import { sendVerificationEmailAPI, verifyCodeAPI } from "@/services/user.api"
import VerificationDialog from "@/components/user-dashboard/profile/VerificationDialog"
import { VerificationState } from "@/types/user"

export default function WalletSettingsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Wallet state
  const {
    wallet,
    loading: walletLoading,
    error: walletError,
  } = useAppSelector((state) => state.wallet)

  // User state for email
  const { user } = useAppSelector((state) => state.user)

  // Local states
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [showNewPin, setShowNewPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false)
  const [isChangingPin, setIsChangingPin] = useState(false)
  const [isUpdatingBiometric, setIsUpdatingBiometric] = useState(false)
  const [pinChangeError, setPinChangeError] = useState("")
  const [isSendingOTP, setIsSendingOTP] = useState(false)

  // OTP Verification states
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [verification, setVerification] = useState<VerificationState>({
    isVerifying: false,
    verificationCode: "",
    timerActive: false,
    canResend: false,
    attempts: 0,
    verificationMethod: "email",
    currentVerificationType: "email",
    tempValue: user?.email || "",
  })
  const [countdown, setCountdown] = useState(60)
  const [pendingPinChange, setPendingPinChange] = useState(false)

  // Load wallet data and initialize states
  useEffect(() => {
    if (!wallet) {
      dispatch(fetchUserWallet())
    } else {
      setIsBiometricEnabled(wallet.biometricEnabled || false)
    }
  }, [wallet, dispatch])

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (verification.timerActive && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0 && verification.timerActive) {
      setVerification((prev) => ({
        ...prev,
        timerActive: false,
        canResend: true,
      }))
      setCountdown(60)
    }
    return () => clearTimeout(timer)
  }, [verification.timerActive, countdown])

  // Reset verification when dialog closes
  useEffect(() => {
    if (!showVerificationDialog) {
      setVerification((prev) => ({
        ...prev,
        verificationCode: "",
        isVerifying: false,
        timerActive: false,
        canResend: false,
        attempts: 0,
      }))
      setCountdown(60)
    }
  }, [showVerificationDialog])

  // Handle biometric toggle
  const handleBiometricToggle = async (enabled: boolean) => {
    try {
      setIsUpdatingBiometric(true)

      const response = await updateBiometricAPI(enabled)

      if (response.success) {
        setIsBiometricEnabled(enabled)

        toast.success(
          enabled
            ? "Biometric authentication enabled"
            : "Biometric authentication disabled",
          {
            description: enabled
              ? "You can now use biometrics to access your wallet"
              : "Biometric access has been disabled for your wallet",
          },
        )
      } else {
        throw new Error(
          response.message || "Failed to update biometric settings",
        )
      }
    } catch (error: any) {
      setIsBiometricEnabled(!enabled)

      toast.error("Failed to update biometric settings", {
        description:
          error?.response?.data?.message || error.message || "Please try again",
      })
    } finally {
      setIsUpdatingBiometric(false)
    }
  }

  // Send OTP for verification
  const handleSendOTP = async () => {
    if (!user?.email) {
      toast.error("Email not found", {
        description: "Please update your email address first",
      })
      return
    }

    try {
      setIsSendingOTP(true)

      // Reset verification state completely
      setVerification({
        isVerifying: false,
        verificationCode: "",
        timerActive: true,
        canResend: false,
        attempts: 0,
        verificationMethod: "email",
        currentVerificationType: "email",
        tempValue: user.email || "",
      })
      setCountdown(60)
      setShowVerificationDialog(true)

      console.log("Sending verification email to:", user.email)

      const response = await sendVerificationEmailAPI()

      console.log("Send verification response:", response)

      if (response?.success) {
        toast.success("Verification code sent", {
          description: `A 6-digit code has been sent to ${user.email}`,
        })
      } else {
        throw new Error(response?.message || "Failed to send verification code")
      }
    } catch (error: any) {
      console.error("Send OTP error:", error)
      toast.error("Failed to send verification code", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Please try again",
      })
      setShowVerificationDialog(false)
    } finally {
      setIsSendingOTP(false)
    }
  }

  // Verify OTP code
  const handleVerifyOTP = async () => {
    console.log(
      "handleVerifyOTP called with code:",
      verification.verificationCode,
    )

    if (verification.verificationCode.length !== 6) {
      console.log("Invalid code length:", verification.verificationCode.length)
      toast.error("Invalid code", {
        description: "Please enter the complete 6-digit code",
      })
      return
    }

    // Set verifying state
    setVerification((prev) => ({ ...prev, isVerifying: true }))

    try {
      console.log("Calling verifyCodeAPI with:", {
        code: verification.verificationCode,
        type: "email",
      })

      const response = await verifyCodeAPI(
        verification.verificationCode,
        "email",
      )

      console.log("verifyCodeAPI response:", response)

      if (response?.success) {
        console.log("Verification successful")

        toast.success("Identity verified", {
          description:
            "Your identity has been verified. You can now change your PIN.",
        })

        // Close dialog
        setShowVerificationDialog(false)

        // Proceed with PIN change after successful verification
        if (pendingPinChange) {
          console.log("Proceeding with PIN change")
          await proceedWithPinChange()
          setPendingPinChange(false)
        }

        // Reset verification state after a delay
        setTimeout(() => {
          setVerification({
            isVerifying: false,
            verificationCode: "",
            timerActive: false,
            canResend: false,
            attempts: 0,
            verificationMethod: "email",
            currentVerificationType: "email",
            tempValue: user?.email || "",
          })
        }, 500)
      } else {
        console.log("Verification failed:", response)

        const newAttempts = verification.attempts + 1

        setVerification((prev) => ({
          ...prev,
          attempts: newAttempts,
          verificationCode: "",
          isVerifying: false,
        }))

        if (newAttempts >= 3) {
          toast.error("Too many attempts", {
            description: response?.message || "Please request a new code",
          })
          setVerification((prev) => ({
            ...prev,
            timerActive: false,
            canResend: true,
          }))
        } else {
          toast.error("Invalid code", {
            description: response?.message || `Attempt ${newAttempts} of 3`,
          })
        }
      }
    } catch (error: any) {
      console.error("Verification error:", error)

      const newAttempts = verification.attempts + 1

      setVerification((prev) => ({
        ...prev,
        attempts: newAttempts,
        verificationCode: "",
        isVerifying: false,
      }))

      if (newAttempts >= 3) {
        toast.error("Verification failed", {
          description: "Maximum attempts reached. Please request a new code.",
        })
        setVerification((prev) => ({
          ...prev,
          timerActive: false,
          canResend: true,
        }))
      } else {
        toast.error("Verification failed", {
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Please try again",
        })
      }
    }
  }
  // Resend OTP code
  const handleResendOTP = async () => {
    try {
      setVerification((prev) => ({
        ...prev,
        canResend: false,
        timerActive: true,
        verificationCode: "",
      }))
      setCountdown(60)

      const response = await sendVerificationEmailAPI()

      if (response.success) {
        toast.success("New code sent", {
          description: "A new verification code has been sent to your email",
        })
      }
    } catch (error) {
      toast.error("Failed to resend code", {
        description: "Please try again",
      })
      setVerification((prev) => ({
        ...prev,
        timerActive: false,
        canResend: true,
      }))
    }
  }

  // Proceed with PIN change after OTP verification
  const proceedWithPinChange = async () => {
    try {
      setIsChangingPin(true)
      setPinChangeError("")

      const response = await changePinAPI("", newPin)

      if (response.success) {
        setNewPin("")
        setConfirmPin("")

        toast.success("PIN changed successfully", {
          description: "Your wallet PIN has been updated",
        })

        dispatch(setWallet(response?.wallet))
      } else {
        throw new Error(response.message || "Failed to change PIN")
      }
    } catch (error: any) {
      setPinChangeError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to change PIN. Please try again.",
      )

      toast.error("Failed to change PIN", {
        description: error?.response?.data?.message || "Please try again",
      })
    } finally {
      setIsChangingPin(false)
    }
  }

  // Handle PIN change submission (starts OTP verification)
  const handlePinChange = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs first
    if (!newPin || !confirmPin) {
      setPinChangeError("All fields are required")
      return
    }

    if (newPin.length !== 6 || confirmPin.length !== 6) {
      setPinChangeError("PIN must be 6 digits")
      return
    }

    if (!/^\d+$/.test(newPin) || !/^\d+$/.test(confirmPin)) {
      setPinChangeError("PIN must contain only numbers")
      return
    }

    if (newPin !== confirmPin) {
      setPinChangeError("PINs do not match")
      return
    }

    // Set pending pin change flag
    setPendingPinChange(true)
    setPinChangeError("")

    // Start OTP verification process
    await handleSendOTP()
  }

  // Handle back navigation
  const handleBack = () => {
    router.push("/user/wallet")
  }

  // Loading skeleton
  if (walletLoading || !wallet) {
    return (
      <div className="px-4 py-8 mx-0 md:mx-4 ">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Security Settings Skeleton */}
            <Card className="border-none shadow-none">
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* PIN Change Skeleton */}
            <Card className="border-none shadow-none">
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-6">
            {/* Wallet Info Skeleton */}
            <Card className="border-none shadow-none">
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Support Skeleton */}
            <Card className="border-none shadow-none">
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (walletError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Wallet Settings</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{walletError}</p>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => dispatch(fetchUserWallet())}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button onClick={handleBack} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Wallet
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 mx-2 md:mx-4">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={handleBack} className="mb-4 -ml-3">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Wallet
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-500/10">
            <Shield className="h-6 w-6 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold">Wallet Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your wallet security, biometric authentication, and PIN
          settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Security Settings Card */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-orange-500" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure your wallet security preferences
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Biometric Authentication */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                    <Fingerprint className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      Biometric Authentication
                      {isBiometricEnabled && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Use fingerprint or face ID to access your wallet
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isUpdatingBiometric ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Switch
                      checked={isBiometricEnabled}
                      onCheckedChange={handleBiometricToggle}
                      disabled={isUpdatingBiometric}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  )}
                </div>
              </div>

              {/* Device Authorization */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30">
                    <Smartphone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-medium">Device Authorization</div>
                    <div className="text-sm text-muted-foreground">
                      Manage authorized devices for wallet access
                    </div>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                >
                  1 Device
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Change PIN Card */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-orange-500" />
                Change Wallet PIN
              </CardTitle>
              <CardDescription>
                Update your 6-digit wallet PIN for enhanced security
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handlePinChange} className="space-y-4">
                {pinChangeError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{pinChangeError}</AlertDescription>
                  </Alert>
                )}

                {/* OTP Verification Info */}
                <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border border-blue-200 dark:border-blue-800">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <AlertTitle>Identity Verification Required</AlertTitle>
                  <AlertDescription>
                    For security, you'll need to verify your identity via email
                    OTP before changing your PIN.
                  </AlertDescription>
                </Alert>

                {/* New PIN */}
                <div className="space-y-2">
                  <Label htmlFor="newPin">New PIN</Label>
                  <div className="relative">
                    <Input
                      id="newPin"
                      type={showNewPin ? "text" : "password"}
                      value={newPin}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                        setNewPin(value)
                        setPinChangeError("")
                      }}
                      placeholder="Enter new 6-digit PIN"
                      className="pr-10"
                      disabled={isChangingPin}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowNewPin(!showNewPin)}
                      disabled={isChangingPin}
                    >
                      {showNewPin ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Confirm New PIN */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPin">Confirm New PIN</Label>
                  <div className="relative">
                    <Input
                      id="confirmPin"
                      type={showConfirmPin ? "text" : "password"}
                      value={confirmPin}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                        setConfirmPin(value)
                        setPinChangeError("")
                      }}
                      placeholder="Confirm new 6-digit PIN"
                      className="pr-10"
                      disabled={isChangingPin}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      disabled={isChangingPin}
                    >
                      {showConfirmPin ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Security Tips */}
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
                  <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Security Tips
                  </h4>
                  <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                    <li>
                      • Choose a PIN that's hard to guess but easy for you to
                      remember
                    </li>
                    <li>
                      • Don't use sequences like 123456 or repeated digits like
                      000000
                    </li>
                    <li>• Don't share your PIN with anyone</li>
                    <li>• Memorize your PIN - don't write it down</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  disabled={isChangingPin || !newPin || !confirmPin}
                >
                  {isChangingPin ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing PIN...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Verify & Change PIN
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Wallet Info & Actions */}
        <div className="space-y-6">
          {/* Wallet Information Card */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-orange-500" />
                Wallet Information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Wallet ID</span>
                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                  {wallet.id}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant={wallet.isActive ? "default" : "secondary"}
                  className={cn(
                    wallet.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                  )}
                >
                  {wallet.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Lock Status
                </span>
                <Badge
                  variant={wallet.isLocked ? "destructive" : "outline"}
                  className={cn(
                    wallet.isLocked
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                  )}
                >
                  {wallet.isLocked ? "Locked" : "Unlocked"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Currency</span>
                <span className="font-medium">{wallet.currency}</span>
              </div>

              <Separator />

              <div className="pt-2">
                <div className="text-sm text-muted-foreground mb-2">
                  Security Score
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      wallet.biometricEnabled && wallet.pinHash
                        ? "bg-green-500"
                        : wallet.pinHash
                          ? "bg-yellow-500"
                          : "bg-red-500",
                    )}
                    style={{
                      width:
                        wallet.biometricEnabled && wallet.pinHash
                          ? "100%"
                          : wallet.pinHash
                            ? "75%"
                            : "50%",
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                  <span>Basic</span>
                  <span>Enhanced</span>
                  <span>Maximum</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Actions Card */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/user/wallet/transactions")}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                View Transaction History
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/user/wallet/help")}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Get Security Help
              </Button>

              {wallet.isLocked && (
                <Button
                  variant="outline"
                  className="w-full justify-start border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400"
                  onClick={() => {
                    toast.info("Wallet unlock feature coming soon")
                  }}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Unlock Wallet
                </Button>
              )}

              <Separator className="my-2" />

              <div className="text-xs text-muted-foreground">
                <p className="mb-1">
                  Last updated:{" "}
                  {new Date(
                    wallet.updatedAt || Date.now(),
                  ).toLocaleDateString()}
                </p>
                <p>Need help? Contact support at support@negari.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verification Dialog */}
      <VerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        verification={verification}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        onCodeChange={(code) =>
          setVerification((prev) => ({ ...prev, verificationCode: code }))
        }
        countdown={countdown}
        isSending={isSendingOTP} // Add this prop
      />
    </div>
  )
}
