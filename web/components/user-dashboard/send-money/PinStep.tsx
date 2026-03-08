"use client"

import { useState, useRef, useEffect } from "react"
import { Shield, Lock, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"

interface User {
  id: string
  name: string
  phone: string
  avatar?: string
  isVerified: boolean
}

interface PinStepProps {
  receiver: User
  amount: number
  fee: number
  onSubmit: (pin: string) => void
  onBack: () => void
}

export default function PinStep({
  receiver,
  amount,
  fee,
  onSubmit,
  onBack,
}: PinStepProps) {
  const [pin, setPin] = useState<string[]>(Array(6).fill(""))
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const total = amount + fee

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    setError("")

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Submit if all digits are filled
    if (newPin.every((digit) => digit !== "") && index === 5) {
      handleSubmit(newPin.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()
    if (/^\d{4}$/.test(pastedData)) {
      const digits = pastedData.split("")
      setPin(digits)
      setError("")
      inputRefs.current[3]?.focus()
    }
  }

  const handleSubmit = async (submittedPin?: string) => {
    const finalPin = submittedPin || pin.join("")

    if (finalPin.length !== 6) {
      setError("Please enter a 4-digit PIN")
      return
    }

    setIsLoading(true)
    await onSubmit(finalPin)
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="mb-2 -ml-2">
        <ArrowLeft className="mr-2 size-4" />
        Back
      </Button>

      {/* Security Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <Shield className="size-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Security Check
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your 4-digit PIN to confirm the transfer
        </p>
      </div>

      {/* Transaction Summary */}
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    {receiver.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{receiver.name}</div>
                  <div className="text-sm text-gray-500">{receiver.phone}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ETB {amount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  + ETB {fee.toLocaleString()} fee
                </div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between font-bold">
                <span>Total to deduct</span>
                <span className="text-lg">ETB {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PIN Input */}
      <div className="space-y-4">
        <div className="flex justify-center gap-4">
          {pin.map((digit, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <input
                ref={(el) => (inputRefs.current[index] = el)}
                type={showPin ? "text" : "password"}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                maxLength={1}
                className={`
                  w-16 h-16 text-3xl font-bold text-center rounded-lg border-2
                  focus:outline-none focus:ring-2 focus:ring-emerald-500
                  ${
                    digit
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  }
                `}
              />
            </motion.div>
          ))}
        </div>

        {/* Show/Hide PIN */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPin(!showPin)}
            className="text-gray-600 dark:text-gray-400"
          >
            {showPin ? (
              <>
                <EyeOff className="mr-2 size-4" />
                Hide PIN
              </>
            ) : (
              <>
                <Eye className="mr-2 size-4" />
                Show PIN
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Lock className="size-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-blue-700 dark:text-blue-300">
                Your PIN is secure
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Never share your PIN with anyone. This transaction is encrypted.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={() => handleSubmit()}
        className="w-full py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        disabled={isLoading || pin.some((digit) => !digit)}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            Processing...
          </>
        ) : (
          <>
            <Shield className="mr-2 size-5" />
            Confirm Transfer
          </>
        )}
      </Button>
    </div>
  )
}
