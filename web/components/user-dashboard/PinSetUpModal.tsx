"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Lock, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface WalletPinSetupModalProps {
  isOpen: boolean
  onComplete: (pin: string) => Promise<void> | void
  onClose: () => void
  canClose?: boolean
  onSetupLater?: () => void
  pinLoading?: boolean
}

export function WalletPinSetupModal({
  isOpen,
  onComplete,
  onClose,
  canClose = true,
  onSetupLater,
  pinLoading = false,
}: WalletPinSetupModalProps) {
  const [step, setStep] = useState<"enter" | "confirm">("enter")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [error, setError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetState()
    }
  }, [isOpen])

  const resetState = () => {
    setStep("enter")
    setPin("")
    setConfirmPin("")
    setError("")
    setIsSubmitting(false)
  }

  const validatePin = (pinToValidate: string): boolean => {
    if (pinToValidate.length !== 6) {
      setError("PIN must be exactly 6 digits")
      return false
    }
    if (!/^\d+$/.test(pinToValidate)) {
      setError("PIN must contain only numbers")
      return false
    }
    if (/(\d)\1{5}/.test(pinToValidate)) {
      setError("PIN cannot be all the same digit")
      return false
    }
    if (
      /(012345|123456|234567|345678|456789|567890|678901|789012|890123|901234)/.test(
        pinToValidate,
      )
    ) {
      setError("PIN cannot be a simple sequence")
      return false
    }
    return true
  }

  const handlePinChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 6)
    setPin(numericValue)
    setError("")

    // Auto-advance to confirm step when 6 digits entered
    if (numericValue.length === 6 && validatePin(numericValue)) {
      setTimeout(() => {
        setStep("confirm")
      }, 300)
    }
  }

  const handleConfirmPinChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 6)
    setConfirmPin(numericValue)
    setError("")
  }

  const handleBack = () => {
    setStep("enter")
    setConfirmPin("")
    setError("")
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError("")

    try {
      // Validate the entered PIN
      if (!validatePin(pin)) {
        setIsSubmitting(false)
        return
      }

      // Check if confirmation PIN matches
      if (pin !== confirmPin) {
        setError("PINs do not match. Please try again.")
        setIsSubmitting(false)
        return
      }

      // Validate confirmation PIN
      if (!validatePin(confirmPin)) {
        setIsSubmitting(false)
        return
      }

      // Call the completion handler
      await onComplete(pin)

      // Reset state on success
      resetState()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to set PIN. Please try again.",
      )
      setIsSubmitting(false)
    }
  }

  const getPinStrength = (pin: string) => {
    if (pin.length === 0) return { strength: 0, text: "Enter 6-digit PIN" }
    if (pin.length < 6) return { strength: 25, text: "Too short" }

    let strength = 25 // Base strength for correct length

    // Check for unique digits
    const uniqueDigits = new Set(pin).size
    if (uniqueDigits >= 4) strength += 25

    // Check for no repeating patterns
    if (!/(\d)\1{2,}/.test(pin)) strength += 25

    // Check for no sequences
    if (
      !/(012|123|234|345|456|567|678|789)/.test(pin) &&
      !/(987|876|765|654|543|432|321|210)/.test(pin)
    ) {
      strength += 25
    }

    const texts = {
      25: "Weak",
      50: "Fair",
      75: "Good",
      100: "Strong",
    }

    return {
      strength: Math.min(strength, 100),
      text: texts[strength as keyof typeof texts] || "Weak",
    }
  }

  const pinStrength = getPinStrength(pin)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && canClose) {
          onClose()
        }
      }}
    >
      <DialogOverlay className="bg-black/40 backdrop-blur-xs" />
      <DialogContent className="max-w-md md:max-w-xl py-6 sm:py-10 ">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {step === "enter" ? "Set Wallet PIN" : "Confirm Wallet PIN"}
          </DialogTitle>
          <DialogDescription>
            {step === "enter"
              ? "Create a 6-digit PIN to secure your wallet transactions"
              : "Re-enter your PIN to confirm"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive" className="py-3">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* PIN Entry Step */}
          {step === "enter" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">Enter 6-digit PIN</Label>
                <Input
                  id="pin"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="000000"
                  className="text-center text-2xl font-mono tracking-widest h-14"
                  maxLength={6}
                  autoFocus
                  disabled={isSubmitting || pinLoading}
                />
                <div className="text-sm text-muted-foreground">
                  Use numbers only, no letters or symbols
                </div>
              </div>

              {/* PIN Strength Indicator */}
              {pin.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>PIN Strength:</span>
                    <span
                      className={cn(
                        "font-medium",
                        pinStrength.strength >= 75
                          ? "text-green-600"
                          : pinStrength.strength >= 50
                            ? "text-yellow-600"
                            : "text-red-600",
                      )}
                    >
                      {pinStrength.text}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
                        pinStrength.strength >= 75
                          ? "bg-green-500"
                          : pinStrength.strength >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500",
                      )}
                      style={{ width: `${pinStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Requirements List */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Requirements:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li
                    className={cn(
                      "flex items-center gap-2",
                      pin.length === 6 ? "text-green-600" : "",
                    )}
                  >
                    {pin.length === 6 ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    Exactly 6 digits
                  </li>
                  <li
                    className={cn(
                      "flex items-center gap-2",
                      /^\d+$/.test(pin) ? "text-green-600" : "",
                    )}
                  >
                    {/^\d+$/.test(pin) ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    Numbers only (0-9)
                  </li>
                  <li
                    className={cn(
                      "flex items-center gap-2",
                      !/(\d)\1{5}/.test(pin) ? "text-green-600" : "",
                    )}
                  >
                    {!/(\d)\1{5}/.test(pin) ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    Not all same digit
                  </li>
                  <li
                    className={cn(
                      "flex items-center gap-2",
                      !/(012345|123456|234567|345678|456789|567890|678901|789012|890123|901234)/.test(
                        pin,
                      )
                        ? "text-green-600"
                        : "",
                    )}
                  >
                    {!/(012345|123456|234567|345678|456789|567890|678901|789012|890123|901234)/.test(
                      pin,
                    ) ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    Not a simple sequence
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* PIN Confirmation Step */}
          {step === "confirm" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confirmPin">Confirm your 6-digit PIN</Label>
                <Input
                  id="confirmPin"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={confirmPin}
                  onChange={(e) => handleConfirmPinChange(e.target.value)}
                  placeholder="000000"
                  className="text-center text-2xl font-mono tracking-widest h-14"
                  maxLength={6}
                  autoFocus
                  disabled={isSubmitting || pinLoading}
                />
                <div className="text-sm text-muted-foreground">
                  Re-enter the same 6-digit PIN
                </div>
              </div>

              {/* Match Indicator */}
              {confirmPin.length === 6 && (
                <div
                  className={cn(
                    "flex items-center gap-2 text-sm p-3 rounded-lg",
                    pin === confirmPin
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
                  )}
                >
                  {pin === confirmPin ? (
                    <>
                      <Check className="h-4 w-4" />
                      PINs match! Ready to secure your wallet.
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      PINs do not match. Please check and try again.
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-3 w-3" />
                Your PIN will be encrypted and securely stored
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <div className="flex gap-2">
              {step === "confirm" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting || pinLoading}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {step === "enter" ? (
                <Button
                  type="button"
                  onClick={() => {
                    if (validatePin(pin)) {
                      setStep("confirm")
                    }
                  }}
                  disabled={pin.length !== 6 || isSubmitting || pinLoading}
                  className="flex-1"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    pin !== confirmPin ||
                    confirmPin.length !== 6 ||
                    isSubmitting ||
                    pinLoading
                  }
                  className="flex-1"
                >
                  {isSubmitting || pinLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Securing Wallet...
                    </>
                  ) : (
                    "Secure Wallet"
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="text-xs text-muted-foreground text-center border-t pt-4">
            <p>
              ⚠️ Remember: Do not share your PIN with anyone. HabeshaGo will
              never ask for your PIN.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
