import { Phone, Mail, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { CountdownCircleTimer } from "react-countdown-circle-timer"
import { VerificationState } from "@/types/user"

interface VerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  verification: VerificationState
  onVerifyCode: () => void
  onResendCode: () => void
  onVerificationCodeChange: (code: string) => void
}

export default function VerificationDialog({
  open,
  onOpenChange,
  verification,
  onVerifyCode,
  onResendCode,
  onVerificationCodeChange,
}: VerificationDialogProps) {
  const getTitle = () => {
    if (verification.currentVerificationType === "phone") {
      return "Verify Phone Number"
    } else if (verification.currentVerificationType === "email") {
      return "Verify Email Address"
    }
    return "Verify"
  }

  const getIcon = () => {
    if (verification.currentVerificationType === "phone") {
      return <Phone className="size-5 text-orange-500" />
    } else if (verification.currentVerificationType === "email") {
      return <Mail className="size-5 text-orange-500" />
    }
    return null
  }

  const handleCodeInput = (index: number, value: string) => {
    const newCode = verification.verificationCode.split("")
    newCode[index] = value
    onVerificationCodeChange(newCode.join(""))

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(
        `input:nth-child(${index + 2})`,
      ) as HTMLInputElement
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (
      e.key === "Backspace" &&
      !verification.verificationCode[index] &&
      index > 0
    ) {
      const prevInput = document.querySelector(
        `input:nth-child(${index})`,
      ) as HTMLInputElement
      prevInput?.focus()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-none bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-gray-800/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Enter the 6-digit verification code sent to {verification.tempValue}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Timer */}
          <div className="flex justify-center">
            <CountdownCircleTimer
              isPlaying={verification.timerActive}
              duration={120}
              colors={["#f97316", "#fbbf24", "#ef4444"]}
              colorsTime={[120, 60, 0]}
              size={80}
              strokeWidth={6}
              onComplete={() => {
                // Timer completion handled in parent
                return { shouldRepeat: false }
              }}
            >
              {({ remainingTime }) => (
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.floor(remainingTime / 60)}:
                    {remainingTime % 60 < 10 ? "0" : ""}
                    {remainingTime % 60}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    seconds
                  </div>
                </div>
              )}
            </CountdownCircleTimer>
          </div>

          {/* OTP Input */}
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={verification.verificationCode[index] || ""}
                  onChange={(e) => handleCodeInput(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-orange-800 dark:focus:border-orange-500 bg-white dark:bg-gray-800"
                />
              ))}
            </div>

            {verification.attempts > 0 && (
              <p className="text-center text-sm text-red-600 dark:text-red-400">
                Invalid code. {3 - verification.attempts} attempts remaining.
              </p>
            )}
          </div>

          {/* Resend Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Didn't receive the code?
              </span>
              <Button
                variant="link"
                size="sm"
                onClick={onResendCode}
                disabled={!verification.canResend}
                className="text-orange-600 dark:text-orange-400"
              >
                {verification.canResend ? "Resend Code" : "Wait for timer"}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300"
          >
            Cancel
          </Button>
          <Button
            onClick={onVerifyCode}
            disabled={verification.verificationCode.length !== 6}
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            <Check className="mr-2 size-4" />
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
