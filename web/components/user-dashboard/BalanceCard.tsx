import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Lock,
  Fingerprint,
  Wallet,
  Eye,
  EyeOff,
  Plus,
  ArrowUpRight,
  CreditCard,
  QrCode,
  MoreVertical,
  TrendingUp,
  Gift,
  Star,
  Zap,
  Award,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface WalletBalanceCardProps {
  balance: number
  currency?: string
  habeshaPoints: number
  pointsLabel?: string
  isActive: boolean
  isLocked: boolean
  biometricEnabled: boolean
  className?: string
  onFundWallet?: () => void
  onViewTransactions?: () => void
  onViewPoints?: () => void
  showBalance?: boolean
  toggleBalanceVisibility?: () => void
  showPoints?: boolean
  togglePointsVisibility?: () => void
}

export function WalletBalanceCard({
  balance,
  currency = "ETB",
  habeshaPoints = 0,
  pointsLabel = "Habesha Points",
  isActive,
  isLocked,
  biometricEnabled,
  className,
  onFundWallet,
  onViewTransactions,
  onViewPoints,
  showBalance = true,
  toggleBalanceVisibility,
  showPoints = true,
  togglePointsVisibility,
}: WalletBalanceCardProps) {
  const formattedBalance = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance)

  const formattedPoints = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(habeshaPoints)

  return (
    <div
      className={cn("relative rounded-2xl overflow-hidden w-full", className)}
    >
      {/* Orange background with patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600">
        {/* Subtle geometric pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
      </div>

      {/* Content card */}
      <Card className="relative rounded-2xl border-none bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-2xl overflow-hidden">
        <CardContent className="space-y-4">
          {/* Balances Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Monetary Balance Card */}
            <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800/50 dark:to-gray-900/50 border border-orange-100 dark:border-orange-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30">
                    <Wallet className="size-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Available Balance
                  </div>
                </div>
                {toggleBalanceVisibility && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleBalanceVisibility}
                    className="h-7 w-7 p-0 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  >
                    {showBalance ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white font-grotesk">
                    {showBalance ? formattedBalance : "••••••"}
                  </div>
                  <div className="text-lg font-medium text-orange-600 dark:text-orange-400">
                    {currency}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium font-mozilla">
                  <TrendingUp className="size-3" />
                  +$45.20 today
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last transaction: 10:30 AM
              </div>
            </div>

            {/* Habesha Points Card */}
            <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30">
                    <Sparkles className="size-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {pointsLabel}
                  </div>
                </div>
                {togglePointsVisibility && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePointsVisibility}
                    className="h-7 w-7 p-0 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  >
                    {showPoints ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white font-grotesk">
                    {showPoints ? formattedPoints : "••••••"}
                  </div>
                  <div className="flex items-center gap-1 text-lg font-medium text-purple-600 dark:text-purple-400">
                    <Star className="size-4 fill-purple-600 dark:fill-purple-400" />
                    Points
                  </div>
                </div>
                <div className="text-xs font-medium text-purple-600 dark:text-purple-400 font-mozilla">
                  ≈ {(habeshaPoints * 0.01).toFixed(2)} {currency} value
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Redeemable for rewards
                </div>
                {onViewPoints && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onViewPoints}
                    className="h-6 px-2 text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    View
                    <ArrowUpRight className="size-2.5 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Security Status */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Security & Settings
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm">
                <div
                  className={cn(
                    "p-2 rounded-md",
                    biometricEnabled
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
                  )}
                >
                  <Fingerprint className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Biometric
                  </div>
                  <div
                    className={cn(
                      "text-xs",
                      biometricEnabled
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-500 dark:text-gray-400",
                    )}
                  >
                    {biometricEnabled ? "Enabled" : "Disabled"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm">
                <div
                  className={cn(
                    "p-2 rounded-md",
                    isLocked
                      ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
                  )}
                >
                  <Shield className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Status
                  </div>
                  <div
                    className={cn(
                      "text-xs",
                      isLocked
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {isLocked ? "Locked" : "Active"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
