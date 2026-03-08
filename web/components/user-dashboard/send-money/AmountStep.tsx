"use client"

import { useState } from "react"
import { User, Wallet, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { motion } from "framer-motion"

interface User {
  id: string
  name: string
  phone: string
  avatar?: string
  isVerified: boolean
}

interface AmountStepProps {
  receiver: User
  balance: number
  onSubmit: (amount: number) => void
  onBack: () => void
}

export default function AmountStep({
  receiver,
  balance,
  onSubmit,
  onBack,
}: AmountStepProps) {
  const [amount, setAmount] = useState<string>("")
  const [customAmount, setCustomAmount] = useState<string>("")

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFloat(amount || customAmount)
    if (numAmount > 0 && numAmount <= balance * 0.9) {
      // 90% of balance max
      onSubmit(numAmount)
    }
  }

  const handleQuickAmount = (amt: number) => {
    setAmount(amt.toString())
    setCustomAmount("")
  }

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value)
    setAmount("")
  }

  const handleSliderChange = (value: number[]) => {
    const amt = Math.min(value[0], balance * 0.9)
    setAmount(amt.toString())
    setCustomAmount("")
  }

  const maxAmount = balance * 0.9
  const selectedAmount = parseFloat(amount || customAmount) || 0
  const fee = selectedAmount * 0.01
  const total = selectedAmount + fee

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="mb-2 -ml-2">
        <ArrowLeft className="mr-2 size-4" />
        Back
      </Button>

      {/* Receiver Info */}
      <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-lg">
                  {receiver.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-lg">{receiver.name}</div>
                <div className="text-gray-600 dark:text-gray-400">
                  {receiver.phone}
                </div>
              </div>
            </div>
            {receiver.isVerified && (
              <Badge className="bg-emerald-500 hover:bg-emerald-600">
                Verified User
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter Amount (ETB)
          </label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-2xl font-bold text-gray-500">
              ETB
            </div>
            <Input
              type="number"
              placeholder="0.00"
              value={customAmount}
              onChange={(e) => handleCustomAmount(e.target.value)}
              className="pl-16 py-6 text-lg font-bold "
              min="1"
              max={maxAmount}
              step="0.01"
            />
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Quick Select
          </div>
          <div className="grid grid-cols-3 gap-3">
            {quickAmounts.map((amt) => (
              <motion.button
                key={amt}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAmount(amt)}
                className={`
                  p-3 rounded-lg font-medium transition-all
                  ${
                    amount === amt.toString()
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }
                `}
              >
                ETB {amt.toLocaleString()}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Slider */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Amount</span>
            <span className="font-medium">
              ETB {selectedAmount.toLocaleString()}
            </span>
          </div>
          <Slider
            defaultValue={[0]}
            max={maxAmount}
            step={100}
            value={[parseFloat(amount) || 0]}
            onValueChange={handleSliderChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>ETB 0</span>
            <span>ETB {maxAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Summary */}
        <Card className="bg-gray-50 dark:bg-gray-800/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Amount</span>
              <span className="font-bold">
                ETB {selectedAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Transaction Fee (1%)
              </span>
              <span className="text-amber-600 dark:text-amber-400">
                ETB {fee.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-3 border-t">
              <span>Total</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                ETB {total.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Balance Warning */}
        {selectedAmount > balance && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-300">
                  Insufficient Balance
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Your available balance is ETB {balance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          disabled={selectedAmount <= 0 || selectedAmount > balance}
        >
          Continue to Security Check
        </Button>
      </form>
    </div>
  )
}
