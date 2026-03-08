import { LinearGradient } from "expo-linear-gradient"
import { Award, Eye, EyeOff, Shield, TrendingUp } from "lucide-react-native"
import { Text, TouchableOpacity, View } from "react-native"

export const WalletCard = ({
  wallet,
  showBalance,
  onToggleBalance,
  onAddMoney,
  onWithdraw,
  isPasswordSet = true,
}: {
  wallet: {
    balance: number
    currency: string
    isActive: boolean
    isLocked: boolean
    habeshaPoints: number
    biometricEnabled: boolean
  }
  showBalance: boolean
  onToggleBalance: () => void
  onAddMoney: () => void
  onWithdraw: () => void
  isPasswordSet?: boolean
}) => {
  const formatBalance = (balance: number, currency: string) => {
    return `${currency} ${balance.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <View className="rounded-2xl overflow-hidden">
      <LinearGradient
        colors={["#EA580C", "#F97316", "#FB923C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="p-6"
      >
        {/* Header with Balance and Eye Toggle */}
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-white/80 text-sm font-geist">
              Current Balance
            </Text>
            <View className="flex-row items-center mt-2">
              <Text className="text-white text-4xl font-groteskBold">
                {showBalance
                  ? formatBalance(wallet.balance, wallet.currency)
                  : `${wallet.currency} ••••••`}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={onToggleBalance}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            {showBalance ? (
              <EyeOff size={20} color="#FFFFFF" />
            ) : (
              <Eye size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Status Indicators */}
        <View className="flex-row gap-3 mb-6">
          {wallet.isActive && (
            <View className="bg-green-500/20 rounded-full px-3 py-1 flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-green-400 mr-2" />
              <Text className="text-white text-xs font-geist">Active</Text>
            </View>
          )}
          {wallet.isLocked && (
            <View className="bg-red-500/20 rounded-full px-3 py-1 flex-row items-center">
              <Shield size={12} color="#FCA5A5" />
              <Text className="text-white text-xs font-geist ml-1">Locked</Text>
            </View>
          )}
          {wallet.biometricEnabled && (
            <View className="bg-blue-500/20 rounded-full px-3 py-1">
              <Text className="text-white text-xs font-geist">Biometric</Text>
            </View>
          )}
        </View>

        {/* Points and Stats Row */}
        <View className="flex-row justify-between">
          <View className="bg-white/10 rounded-xl px-4 py-3 flex-1 mr-2">
            <View className="flex-row items-center mb-1">
              <Award size={16} color="#FFD700" />
              <Text className="text-white/70 text-xs ml-1 font-geist">
                Habesha Points
              </Text>
            </View>
            <Text className="text-white text-xl font-groteskBold">
              {wallet.habeshaPoints.toLocaleString()}
            </Text>
          </View>

          <View className="bg-white/10 rounded-xl px-4 py-3 flex-1 ml-2">
            <View className="flex-row items-center mb-1">
              <TrendingUp size={16} color="#4ADE80" />
              <Text className="text-white/70 text-xs ml-1 font-geist">
                Monthly Interest
              </Text>
            </View>
            <Text className="text-white text-xl font-groteskBold">
              {showBalance
                ? `${wallet.currency} ${(wallet.balance * 0.02).toFixed(2)}`
                : "••••••"}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  )
}
