"use client"

import { Eye, EyeOff, TrendingUp, Coins, Award } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function BalanceCard() {
  const [balanceVisible, setBalanceVisible] = useState(true)

  const walletData = {
    money: {
      total: 15430.75,
      currency: "ETB",
      usdEquivalent: 279.85,
      weeklyChange: 850.5,
      label: "Money Balance",
    },
    points: {
      total: 2875,
      weeklyChange: 320,
      value: 143.75,
      label: "Reward Points",
    },
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formatPoints = (points: number) => {
    return points.toLocaleString("en-US")
  }

  return (
    <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600">
      <CardContent className="p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-semibold">Wallet Balance</h2>
            <p className="text-sm text-white/80">Addis Pulse • Updated now</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
          >
            {balanceVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Two Column Layout with Flex */}
        <div className="flex justify-between items-start gap-6">
          {/* Money Column */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white/10">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/90">
                  {walletData.money.label}
                </p>
                <div className="flex items-center gap-1 text-green-300">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs">
                    +{formatCurrency(walletData.money.weeklyChange)}
                  </span>
                </div>
              </div>
            </div>

            {balanceVisible ? (
              <div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-semibold mr-2">
                    {walletData.money.currency}
                  </span>
                  <span className="text-4xl font-bold">
                    {formatCurrency(walletData.money.total)}
                  </span>
                </div>
                <p className="text-sm text-white/80 mt-2">
                  ≈ ${walletData.money.usdEquivalent.toFixed(2)} USD
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-10 bg-white/20 rounded-lg animate-pulse"></div>
                <div className="h-4 w-28 bg-white/20 rounded animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-32 bg-white/20 self-stretch" />

          {/* Points Column */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white/10">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/90">
                  {walletData.points.label}
                </p>
                <div className="flex items-center gap-1 text-green-300">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs">
                    +{walletData.points.weeklyChange} pts
                  </span>
                </div>
              </div>
            </div>

            {balanceVisible ? (
              <div>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">
                    {formatPoints(walletData.points.total)}
                  </span>
                  <span className="text-2xl font-semibold ml-2">pts</span>
                </div>
                <p className="text-sm text-white/80 mt-2">
                  ≈ {formatCurrency(walletData.points.value)} ETB value
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-10 bg-white/20 rounded-lg animate-pulse"></div>
                <div className="h-4 w-28 bg-white/20 rounded animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
