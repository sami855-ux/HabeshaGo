"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { VerificationState } from "@/types/Profile"
import {
  Loader2,
  Mail,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface VerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  verification: VerificationState
  onVerify: () => void
  onResend: () => void
  onCodeChange: (code: string) => void
  countdown: number
  isSending?: boolean
}

export default function VerificationDialog({
  open,
  onOpenChange,
  verification,
  onVerify,
  onResend,
  onCodeChange,
  countdown,
  isSending = false,
}: VerificationDialogProps) {
  const isPhoneVerification = verification.currentVerificationType === "phone"
  const [inputValue, setInputValue] = useState("")
  const autoSubmitRef = useRef(false)

  // Sync with parent state - only when dialog opens or verification changes
  useEffect(() => {
    if (open) {
      setInputValue(verification.verificationCode)
    }
  }, [open, verification.verificationCode])

  // Handle auto-submit separately
  useEffect(() => {
    if (!open) return

    if (
      inputValue.length === 6 &&
      !verification.isVerifying &&
      !autoSubmitRef.current &&
      !verification.attempts &&
      !isSending
    ) {
      console.log("Auto-submitting verification code:", inputValue)
      autoSubmitRef.current = true

      onCodeChange(inputValue)
      console.log(inputValue)
      // Use setTimeout to avoid state conflicts
      setTimeout(() => {
        onVerify()
        // Reset auto-submit flag after verification
        setTimeout(() => {
          autoSubmitRef.current = false
        }, 1000)
      }, 300)
    }
  }, [
    inputValue,
    verification.isVerifying,
    verification.attempts,
    isSending,
    onVerify,
    open,
    onCodeChange,
  ])

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value)
      onCodeChange(value)
    },
    [onCodeChange],
  )

  const handleVerifyClick = () => {
    autoSubmitRef.current = true
    onVerify()
    setTimeout(() => {
      autoSubmitRef.current = false
    }, 1000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getAttemptsMessage = () => {
    if (verification.attempts === 0) return null
    const remaining = 3 - verification.attempts
    if (remaining === 0)
      return "No attempts remaining. Please request a new code."
    return `${remaining} attempt${remaining > 1 ? "s" : ""} remaining`
  }

  const isComplete = inputValue.length === 6
  const isDisabled =
    verification.isVerifying || autoSubmitRef.current || isSending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md z-[100] p-0 overflow-hidden gap-0">
        {/* Simple header with icon */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-full",
                isPhoneVerification
                  ? "bg-blue-100 dark:bg-blue-900/30"
                  : "bg-purple-100 dark:bg-purple-900/30",
              )}
            >
              {isPhoneVerification ? (
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg">
                Verify your{" "}
                {isPhoneVerification ? "phone number" : "email address"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Enter the 6-digit code sent to
              </DialogDescription>
            </div>
          </div>
          <p className="text-sm font-medium text-foreground bg-muted rounded-lg px-3 py-1.5 mt-2 break-all">
            {verification.tempValue}
          </p>
        </DialogHeader>

        <div className="p-6 pt-0 space-y-5">
          {/* Sending indicator */}
          {isSending && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Sending verification code...
              </span>
            </div>
          )}

          {/* OTP Input Group - only show when not sending */}
          {!isSending && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground/80">
                Verification code
              </label>
              <InputOTP
                value={inputValue}
                onChange={handleInputChange}
                maxLength={6}
                disabled={isDisabled}
                className="w-full justify-center"
                autoFocus
              >
                <InputOTPGroup className="gap-2 w-full justify-center">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className={cn(
                        "w-11 h-12 text-lg font-semibold rounded-md border transition-all",
                        "focus-visible:ring-1 focus-visible:ring-ring",
                        "data-[active]:border-primary data-[active]:shadow-sm",
                        isComplete &&
                          !isDisabled &&
                          "border-green-500 dark:border-green-500",
                        isDisabled && "opacity-50 cursor-not-allowed",
                      )}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              {/* Status indicator */}
              {verification.isVerifying && (
                <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying code...</span>
                </div>
              )}

              {isComplete &&
                !verification.isVerifying &&
                !autoSubmitRef.current && (
                  <div className="flex items-center justify-center gap-1.5 text-sm text-green-600 dark:text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Code entered - click verify</span>
                  </div>
                )}

              {autoSubmitRef.current && (
                <div className="flex items-center justify-center gap-1.5 text-sm text-blue-600 dark:text-blue-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Auto-submitting...</span>
                </div>
              )}
            </div>
          )}

          {/* Timer and Resend - always show */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Code expires in</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-medium tabular-nums">
                {formatTime(countdown)}
              </span>
              <Button
                variant="link"
                size="sm"
                onClick={onResend}
                disabled={verification.timerActive || isDisabled || isSending}
                className="h-auto p-0 text-sm font-medium text-primary hover:text-primary/80"
              >
                Resend
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {verification.attempts > 0 && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-destructive font-medium">
                  Invalid code
                </p>
                <p className="text-xs text-destructive/80 mt-0.5">
                  {getAttemptsMessage()}
                </p>
              </div>
            </div>
          )}

          {/* Manual Verify Button */}
          {!isSending &&
            isComplete &&
            !verification.isVerifying &&
            !autoSubmitRef.current && (
              <Button onClick={handleVerifyClick} className="w-full">
                Verify Code
              </Button>
            )}

          {/* Help Text */}
          <p className="text-xs text-center text-muted-foreground">
            Didn't receive the code? Check your spam folder or{" "}
            <button
              onClick={onResend}
              disabled={verification.timerActive || isDisabled || isSending}
              className="text-primary hover:underline disabled:opacity-50 disabled:no-underline"
            >
              request a new one
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
