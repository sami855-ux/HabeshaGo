"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  CreditCard,
  ShieldCheck,
  CheckCircle2
} from "lucide-react"
import { toast } from "sonner"

interface PassengerWalletProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  balance: number
  onTopUpSuccess: (addedAmount: number) => void
}

export function PassengerWalletModal({
  open,
  onOpenChange,
  balance,
  onTopUpSuccess,
}: PassengerWalletProps) {
  const [amount, setAmount] = React.useState<number>(250)
  const [provider, setProvider] = React.useState<"telebirr" | "chapa" | "cbe">("telebirr")
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleTopUp = () => {
    if (amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      onTopUpSuccess(amount)
      toast.success(`Successfully loaded ${amount} ETB via ${provider.toUpperCase()}!`)
      onOpenChange(false)
    }, 800)
  }

  const transactions = [
    {
      id: "tx-1",
      title: "Telebirr Instant Reload",
      type: "credit",
      amount: 500,
      date: "Today, 10:20 AM",
      status: "Settled",
    },
    {
      id: "tx-2",
      title: "Bole Corridor Shuttle #9421",
      type: "debit",
      amount: 28,
      date: "Yesterday, 6:15 PM",
      status: "Completed",
    },
    {
      id: "tx-3",
      title: "City Comfort Ride (Belta)",
      type: "debit",
      amount: 185,
      date: "Oct 10, 2:30 PM",
      status: "Completed",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-inter">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600">
              <Wallet className="w-5 h-5" />
            </span>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              HabeshaGo Mobility Wallet
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Zero-fee micro-payments for minibuses, taxis, and intercity coaches
          </DialogDescription>
        </DialogHeader>

        {/* Current Balance Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Available Balance</span>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
              Active & Protected
            </Badge>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold tracking-tight">
                {balance.toFixed(2)}
              </span>
              <span className="ml-1.5 text-orange-400 font-bold text-sm">ETB</span>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>480 GoPoints</span>
              </div>
              <span className="text-[10px] text-slate-400">48 ETB ride voucher</span>
            </div>
          </div>
        </div>

        {/* Top-up Options */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Select Top-Up Channel
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setProvider("telebirr")}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                provider === "telebirr"
                  ? "border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              <span className="size-2 rounded-full bg-sky-500" />
              <span>Telebirr</span>
            </button>

            <button
              type="button"
              onClick={() => setProvider("chapa")}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                provider === "chapa"
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>Chapa Pay</span>
            </button>

            <button
              type="button"
              onClick={() => setProvider("cbe")}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                provider === "cbe"
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              <span className="size-2 rounded-full bg-purple-500" />
              <span>CBE Birr</span>
            </button>
          </div>

          {/* Quick Amount presets */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[100, 250, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt)}
                className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  amount === amt
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                +{amt}
              </button>
            ))}
          </div>

          <Button
            onClick={handleTopUp}
            disabled={isProcessing}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-11 rounded-xl shadow-md mt-2"
          >
            {isProcessing ? "Connecting to Gateway..." : `Top Up ${amount} ETB Now`}
          </Button>
        </div>

        {/* Recent Transactions List */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Recent Activity
          </div>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-md ${
                      tx.type === "credit"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {tx.type === "credit" ? (
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {tx.title}
                    </div>
                    <div className="text-[10px] text-slate-400">{tx.date}</div>
                  </div>
                </div>

                <div
                  className={`font-bold ${
                    tx.type === "credit"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  {tx.type === "credit" ? `+${tx.amount}` : `-${tx.amount}`} ETB
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
