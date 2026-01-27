"use client"

import { CheckCircle, Download, Share2, Copy, Home, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
// import confetti from "canvas-confetti"
import { useState } from "react"

interface Transaction {
  id: string
  amount: number
  fee: number
  total: number
  receiver: {
    name: string
    phone: string
  }
  timestamp: Date
  reference: string
}

interface SuccessStepProps {
  transaction: Transaction
  onNewTransfer: () => void
}

export default function SuccessStep({
  transaction,
  onNewTransfer,
}: SuccessStepProps) {
  const handleCopyReference = () => {
    navigator.clipboard.writeText(transaction.reference)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Money Transfer Successful",
        text: `I just sent ETB ${transaction.amount.toLocaleString()} to ${transaction.receiver.name}`,
      })
    }
  }

  const handleDownload = () => {
    // Create a simple receipt text
    const receipt = `
      Money Transfer Receipt
      ======================
      Transaction ID: ${transaction.id}
      Reference: ${transaction.reference}
      Date: ${transaction.timestamp.toLocaleDateString()}
      Time: ${transaction.timestamp.toLocaleTimeString()}
      
      Sent to: ${transaction.receiver.name}
      Phone: ${transaction.receiver.phone}
      
      Amount: ETB ${transaction.amount.toLocaleString()}
      Fee: ETB ${transaction.fee.toLocaleString()}
      Total: ETB ${transaction.total.toLocaleString()}
      
      Status: ✅ Completed
    `

    const blob = new Blob([receipt], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `receipt-${transaction.reference}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  //   // Trigger confetti on component mount
  //   useState(() => {
  //     confetti({
  //       particleCount: 100,
  //       spread: 70,
  //       origin: { y: 0.6 }
  //     })
  //   })

  return (
    <div className="space-y-6">
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 10, stiffness: 100 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle className="size-16 text-emerald-600 dark:text-emerald-400" />
        </div>
      </motion.div>

      {/* Success Message */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Transfer Successful!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your money has been sent to {transaction.receiver.name}
        </p>
      </div>

      {/* Transaction Details */}
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Amount */}
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                ETB {transaction.amount.toLocaleString()}
              </div>
              <div className="text-gray-500 dark:text-gray-400 mt-1">
                Amount transferred
              </div>
            </div>

            {/* Receiver */}
            <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Avatar className="size-12">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                  {transaction.receiver.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold">{transaction.receiver.name}</div>
                <div className="text-sm text-gray-500">
                  {transaction.receiver.phone}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Transaction ID
                </span>
                <span className="font-mono font-medium">{transaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Reference
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{transaction.reference}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCopyReference}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Date & Time
                </span>
                <span>{transaction.timestamp.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <Badge className="bg-emerald-500 hover:bg-emerald-600">
                  Completed
                </Badge>
              </div>
              <div className="flex justify-between font-bold pt-3 border-t">
                <span>Total Deducted</span>
                <span>ETB {transaction.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="flex flex-col h-16"
          onClick={handleShare}
        >
          <Share2 className="size-5 mb-1" />
          <span className="text-xs">Share</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col h-16"
          onClick={handleDownload}
        >
          <Download className="size-5 mb-1" />
          <span className="text-xs">Receipt</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col h-16"
          onClick={() => (window.location.href = "/")}
        >
          <Home className="size-5 mb-1" />
          <span className="text-xs">Home</span>
        </Button>
      </div>

      {/* New Transfer Button */}
      <Button
        onClick={onNewTransfer}
        className="w-full py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
      >
        <Send className="mr-2 size-5" />
        Send Money Again
      </Button>

      {/* Estimated Arrival */}
      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💫 Funds will arrive instantly. The recipient has been notified.
        </p>
      </div>
    </div>
  )
}
