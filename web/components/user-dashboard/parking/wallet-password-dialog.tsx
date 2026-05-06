"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircle, Coins, Info, Key, Shield, Wallet, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { InputOTP } from "@/components/ui/input-otp"
import { formatCurrencyIntl } from "@/lib/utils"

interface WalletPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  walletPassword: string
  setWalletPassword: (value: string) => void
  passwordError: string
  setPasswordError: (value: string) => void
  pointsToUseAmount: number
  isVerifying: boolean
  totalAmount: number
  paymentType: "wallet" | "points" | null
  onConfirm: () => void
  onCancel: () => void
}

export function WalletPasswordDialog({
  open,
  onOpenChange,
  walletPassword,
  setWalletPassword,
  passwordError,
  setPasswordError,
  pointsToUseAmount,
  isVerifying,
  totalAmount,
  paymentType,
  onConfirm,
  onCancel,
}: WalletPasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl rounded-2xl overflow-hidden p-0 border-0 shadow-2xl">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none z-50">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <DialogHeader className="px-8 pt-8 pb-2">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {paymentType === "points"
                ? "Points Redemption Authentication"
                : "Wallet Authentication"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base mt-2">
              {paymentType === "points"
                ? "Enter your 6-digit wallet password to authorize points redemption"
                : "Enter your 6-digit wallet password to complete the payment securely"}
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <div className="px-8 py-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className={`rounded-xl p-4 border backdrop-blur-sm ${
              paymentType === "points"
                ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-200/50"
                : "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-200/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-md ${
                    paymentType === "points"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600"
                  }`}
                >
                  {paymentType === "points" ? (
                    <Coins className="h-5 w-5 text-white" />
                  ) : (
                    <Wallet className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    {paymentType === "points" ? "Paying with" : "Paying with"}
                  </p>
                  <p className="font-bold text-gray-800 text-lg">
                    {paymentType === "points"
                      ? "HabeshaGo Points"
                      : "HabeshaGo Wallet"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-medium">
                  {paymentType === "points"
                    ? "Points to Redeem"
                    : "Amount to Pay"}
                </p>
                <motion.p
                  key={totalAmount}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className={`font-bold text-2xl ${
                    paymentType === "points"
                      ? "text-amber-600"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                  }`}
                >
                  {paymentType === "points"
                    ? `${Math.ceil(pointsToUseAmount * 2)} pts`
                    : formatCurrencyIntl(totalAmount)}
                </motion.p>
                {paymentType === "points" && (
                  <p className="text-xs text-gray-400 mt-1">
                    ≈ {formatCurrencyIntl(pointsToUseAmount)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Info message for points payment */}
          {paymentType === "points" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 rounded-lg p-3 border border-blue-200"
            >
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Points Redemption Details:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>1 point = {formatCurrencyIntl(0.5)}</li>
                    <li>Points cannot be refunded once redeemed</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
              <Key className="h-4 w-4 text-blue-500" />
              Wallet Password (6-digit code)
            </Label>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={walletPassword}
                onChange={(value) => {
                  setWalletPassword(value)
                  if (passwordError) setPasswordError("")
                }}
                autoFocus={true}
                render={({ slots }) => (
                  <div className="flex gap-3 justify-center">
                    {slots.map((slot, idx) => (
                      <div key={idx} className="relative">
                        <div
                          className={`w-14 h-14 flex items-center justify-center text-2xl font-mono font-bold text-center rounded-xl border-2 transition-all duration-200 ${
                            walletPassword.length === idx + 1
                              ? "border-blue-500 ring-4 ring-blue-500/20 bg-blue-50/50"
                              : slot.isActive
                                ? "border-blue-400 ring-2 ring-blue-500/20"
                                : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          {slot.char ?? slot.placeholderChar ?? ""}
                          {slot.hasFakeCaret && (
                            <div className="w-px h-5 bg-black animate-pulse" />
                          )}
                        </div>

                        {idx < slots.length - 1 && (
                          <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-1 h-1 rounded-full bg-gray-300"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>

            {passwordError && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-red-500 flex items-center justify-center gap-1.5 bg-red-50 p-2 rounded-lg"
              >
                <AlertCircle className="h-3 w-3" />
                {passwordError}
              </motion.p>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-8 pb-8">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 rounded-xl h-12 border-2 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={walletPassword.length !== 6 || isVerifying}
            className={`flex-1 rounded-xl h-12 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              paymentType === "points"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            } text-white`}
          >
            {isVerifying ? (
              <div className="flex items-center gap-2 justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Verifying...
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                {paymentType === "points"
                  ? "Confirm Points Redemption"
                  : "Confirm Payment"}
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
