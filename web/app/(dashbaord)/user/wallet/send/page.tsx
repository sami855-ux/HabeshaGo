"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Send, Shield, CheckCircle, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import PhoneNumberStep from "@/components/user-dashboard/send-money/PhoneNumberStep"
import AmountStep from "@/components/user-dashboard/send-money/AmountStep"
import PinStep from "@/components/user-dashboard/send-money/PinStep"
import SuccessStep from "@/components/user-dashboard/send-money/SuccessStep"
import { useRouter } from "next/navigation"
import { transferFunds } from "@/services/transaction"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { fetchUserWallet } from "@/store/slices/walletSlice"
import { useQueryClient } from "@tanstack/react-query"

interface User {
  id: string
  name: string
  phone: string
  avatar?: string
  isVerified: boolean
}

interface Transaction {
  id: string
  amount: number
  fee: number
  total: number
  receiver: User
  timestamp: Date
  reference: string
}

export default function SendMoneyPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { wallet, loading: walletLoading } = useAppSelector(
    (state) => state.wallet,
  )
  const [step, setStep] = useState<"phone" | "amount" | "pin" | "success">(
    "phone",
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiver, setReceiver] = useState<User | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [recentContacts, setRecentContacts] = useState<User[]>([
    { id: "1", name: "Abebe Kebede", phone: "+251912345678", isVerified: true },
    {
      id: "2",
      name: "Meron Tesfaye",
      phone: "+251923456789",
      isVerified: true,
    },
    {
      id: "3",
      name: "Dawit Solomon",
      phone: "+251934567890",
      isVerified: false,
    },
    {
      id: "4",
      name: "Selamawit Alemu",
      phone: "+251945678901",
      isVerified: true,
    },
  ])

  // Simulated user wallet balance
  const walletBalance = wallet && !walletLoading ? wallet.balance : 0
  const transactionFee = amount * 0.01 // 1% fee

  const handleAmountSubmit = (submittedAmount: number) => {
    setAmount(submittedAmount)
    setStep("pin")
  }

  const handlePinSubmit = async (pin: string) => {
    if (!receiver) return

    try {
      setIsProcessing(true)

      const res = await transferFunds(
        receiver.id,
        amount,
        pin,
        `Transfer to ${receiver.name}`,
      )

      if (!res.success || !res.data) {
        throw new Error(res.message || "Transfer failed")
      }

      toast.success("Transfer successful!", {
        description: `You have sent ETB ${amount.toLocaleString()} to ${receiver.name}.`,
      })

      //Invalidate query
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] })

      // ✅ Use backend transaction directly
      setTransaction({
        id: res.data.id,
        amount: res.data.amount,
        fee: res.data.fee,
        total: res.data.amount + transactionFee,
        receiver: receiver,
        timestamp: new Date(res.data.createdAt),
        reference: res.data.reference,
      })

      setStep("success")
      dispatch(fetchUserWallet())
    } catch (error: any) {
      console.error("Transfer failed:", error)

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Transaction failed",
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSelectRecentContact = (contact: User) => {
    setReceiver(contact)
    setStep("amount")
  }

  const handleStartNewTransfer = () => {
    setReceiver(null)
    setAmount(0)
    setTransaction(null)
    setStep("phone")
  }

  return (
    <div className="min-h-screen  rounded-2xl p-4 md:p-6">
      <div className="">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Send Money
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Transfer funds to friends, family, or businesses
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="size-6 text-emerald-600 dark:text-emerald-500" />
                  Transfer Funds
                </CardTitle>
                <CardDescription>
                  Complete the steps below to send money
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8 w-full">
                  {["phone", "amount", "pin", "success"].map((s, index) => (
                    <div key={s} className="flex items-center flex-1 ">
                      <div className="flex flex-col items-center">
                        <div
                          className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${
                            step === s
                              ? "bg-emerald-600 text-white"
                              : ["phone", "amount", "pin", "success"].indexOf(
                                    step,
                                  ) > index
                                ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                          }
                        `}
                        >
                          {step === s ||
                          ["phone", "amount", "pin", "success"].indexOf(step) >
                            index ? (
                            <CheckCircle className="size-5" />
                          ) : (
                            <span className="font-semibold">{index + 1}</span>
                          )}
                        </div>
                        <span className="text-xs mt-2 capitalize font-medium text-gray-600 dark:text-gray-400">
                          {s === "phone"
                            ? "Receiver"
                            : s === "amount"
                              ? "Amount"
                              : s}
                        </span>
                      </div>
                      {index < 3 && (
                        <div
                          className={`flex-1 h-1 mx-2 ${["phone", "amount", "pin", "success"].indexOf(step) > index ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {step === "phone" && (
                      <PhoneNumberStep
                        onSelectContact={handleSelectRecentContact}
                        recentContacts={recentContacts}
                      />
                    )}

                    {step === "amount" && receiver && (
                      <AmountStep
                        receiver={receiver}
                        balance={walletBalance}
                        onSubmit={handleAmountSubmit}
                        onBack={() => setStep("phone")}
                      />
                    )}

                    {step === "pin" && receiver && (
                      <PinStep
                        receiver={receiver}
                        amount={amount}
                        fee={transactionFee}
                        onSubmit={handlePinSubmit}
                        onBack={() => setStep("amount")}
                      />
                    )}

                    {step === "success" && transaction && (
                      <SuccessStep
                        transaction={transaction}
                        onNewTransfer={handleStartNewTransfer}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Balance */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5" />
                  Your Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "ETB",
                    minimumFractionDigits: 2,
                  }).format(walletBalance)}
                </div>

                <p className="text-emerald-100 text-sm mt-2">
                  Available for transfer
                </p>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recent Transfers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Mikael H.", amount: 1500, time: "2 hours ago" },
                  { name: "Sara T.", amount: 2500, time: "Yesterday" },
                  { name: "Daniel K.", amount: 3500, time: "2 days ago" },
                ].map((tx, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                          {tx.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{tx.name}</div>
                        <div className="text-sm text-gray-500">{tx.time}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        ETB {tx.amount.toLocaleString()}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Completed
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Shield className="size-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">
                      Double-check recipient
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Verify phone number before sending
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <Shield className="size-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Transfer limits</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Max ETB 50,000 per transaction
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
