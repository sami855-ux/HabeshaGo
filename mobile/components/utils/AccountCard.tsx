import { useThemeContext } from "@/context/ThemeContext"
import { useAppSelector } from "@/store"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import {
  AlertCircle,
  ArrowRight,
  Award,
  Eye,
  EyeOff,
  Lock,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react-native"
import React, { useEffect, useState } from "react"
import {
  Animated,
  Dimensions,
  Easing,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const { width } = Dimensions.get("window")

export const formatCurrencyAbbr = (amount) => {
  if (!amount && amount !== 0) return "0 ETB"
  if (amount >= 1e6) return (amount / 1e6).toFixed(1) + "M ETB"
  if (amount >= 1e3) return (amount / 1e3).toFixed(1) + "K ETB"
  return amount.toLocaleString() + " ETB"
}

// Skeleton Component
const AccountCardSkeleton = () => {
  const pulseAnim = useState(new Animated.Value(1))[0]

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1200,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]),
    )
    pulse.start()
    return () => pulse.stop()
  }, [])

  return (
    <View
      className="flex-1 mx-4 rounded-2xl overflow-hidden"
      style={{ height: 200 }}
    >
      <View className="flex-1 bg-white">
        <Animated.View style={{ opacity: pulseAnim }} className="flex-1 p-6">
          {/* Header Skeleton */}
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-[#E8EDF2]" />
              <View className="w-32 h-4 rounded-md bg-[#E8EDF2]" />
            </View>
            <View className="w-8 h-8 rounded-full bg-[#E8EDF2]" />
          </View>

          {/* Content Skeleton - Modern layout with glassmorphism effect */}
          <View className="flex-row justify-between">
            <View className="flex-1 mr-4">
              <View className="w-24 h-3 rounded-md bg-[#E8EDF2] mb-3" />
              <View className="w-32 h-8 rounded-xl bg-[#E8EDF2] mb-2" />
              <View className="w-20 h-3 rounded-md bg-[#E8EDF2]" />
            </View>
            <View className="flex-1">
              <View className="w-20 h-3 rounded-md bg-[#E8EDF2] mb-3" />
              <View className="w-28 h-8 rounded-xl bg-[#E8EDF2] mb-2" />
              <View className="w-16 h-3 rounded-md bg-[#E8EDF2]" />
            </View>
          </View>

          {/* Modern Button Skeleton */}
          <View className="absolute bottom-6 left-6 right-6">
            <View className="w-full h-10 rounded-xl bg-[#E8EDF2]" />
          </View>
        </Animated.View>
      </View>
    </View>
  )
}

const AccountCard = () => {
  const { colors } = useThemeContext()
  const router = useRouter()

  // Separate wallet state
  const {
    wallet,
    loading: walletLoading,
    hasWallet,
  } = useAppSelector((state) => state.wallet)

  const [isAmountVisible, setIsAmountVisible] = useState(true)
  const [isPointsVisible, setIsPointsVisible] = useState(true)
  const [scaleAnim] = useState(new Animated.Value(1))
  const [arrowAnim] = useState(new Animated.Value(0))
  const [glowAnim] = useState(new Animated.Value(0))

  // Parse wallet data
  const walletData = wallet
    ? {
        balance:
          typeof wallet.balance === "string"
            ? parseFloat(wallet.balance) || 0
            : Number(wallet.balance) || 0,
        currency: wallet.currency || "ETB",
        isActive: wallet.isActive ?? true,
        isLocked: wallet.isLocked ?? false,
        habeshaPoints: wallet.points || 0,
        biometricEnabled: wallet.biometricEnabled ?? false,
        tier: wallet.tier || "Bronze",
        cashback: wallet.cashback || 2.5,
        rewardRate: wallet.rewardRate || 1,
        wallet: wallet,
      }
    : null

  // Format currency helper
  const formatCurrency = (amount: number, currency: string = "ETB") => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Format points with comma
  const formatPoints = (points: number) => {
    return points.toLocaleString() + " pts"
  }

  // Get gradient based on tier
  const getTierGradient = () => {
    switch (walletData?.tier) {
      case "Bronze":
        return ["#CD7F32", "#B87333"] as const
      case "Silver":
        return ["#C0C0C0", "#A8A9AD"] as const
      case "Gold":
        return ["#FFD700", "#FFA500"] as const
      case "Platinum":
        return ["#E5E4E2", "#B4C5D9"] as const
      default:
        return ["#3B82F6", "#2563EB"] as const
    }
  }

  useEffect(() => {
    // Arrow bounce animation
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 },
    )

    // Glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
      { iterations: -1 },
    )

    bounceAnimation.start()
    glowAnimation.start()

    return () => {
      bounceAnimation.stop()
      glowAnimation.stop()
    }
  }, [arrowAnim, glowAnim])

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start()
  }

  const handleShowMore = () => {
    // router.push("/points-details")
  }

  const arrowTranslateX = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 5],
  })

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  })

  // Show skeleton while loading
  if (walletLoading) {
    return <AccountCardSkeleton />
  }

  // No wallet state
  if (!walletData) {
    return (
      <View
        className="flex-1 mx-4 rounded-3xl overflow-hidden"
        style={{ height: 200 }}
      >
        <LinearGradient
          colors={["#3B82F6", "#1E40AF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 p-6 justify-center items-center"
        >
          <View className="bg-white/20 rounded-2xl p-4 mb-4">
            <Wallet size={40} color="#ffffff" />
          </View>
          <Text className="text-white text-xl font-geistBold text-center mb-2">
            No Wallet Found
          </Text>
          <Text className="text-blue-100 text-sm font-geist text-center mb-6">
            Create a wallet to start earning rewards and make payments
          </Text>
          <TouchableOpacity
            // onPress={() => router.push("/create-wallet")}
            className="bg-white px-8 py-4 rounded-xl flex-row items-center gap-2"
          >
            <Text style={{ color: colors.primary }} className="font-geistBold">
              Create Wallet
            </Text>
            <ArrowRight size={18} color={colors.primary} />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    )
  }

  // Locked wallet state
  if (walletData.isLocked) {
    return (
      <View
        className="flex-1 mx-4 rounded-3xl overflow-hidden"
        style={{ height: 200 }}
      >
        <LinearGradient
          colors={["#EF4444", "#DC2626"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 p-6 justify-center items-center"
        >
          <View className="bg-white/20 rounded-2xl p-4 mb-4">
            <Lock size={40} color="#ffffff" />
          </View>
          <Text className="text-white text-xl font-geist text-center mb-2">
            Wallet Locked
          </Text>
          <Text className="text-red-100 text-sm font-geist text-center mb-6">
            Your wallet is currently locked. Please contact support for
            assistance.
          </Text>
          <TouchableOpacity
            // onPress={() => router.push("/support")}
            className="bg-white px-8 py-4 rounded-xl flex-row items-center gap-2"
          >
            <Text style={{ color: colors.primary }} className="font-geistBold">
              Contact Support
            </Text>
            <ArrowRight size={18} color={colors.primary} />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    )
  }

  // Inactive wallet state
  if (!walletData.isActive) {
    return (
      <View
        className="flex-1 mx-4 rounded-3xl overflow-hidden"
        style={{ height: 200 }}
      >
        <LinearGradient
          colors={["#6B7280", "#4B5563"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 p-6 justify-center items-center"
        >
          <View className="bg-white/20 rounded-2xl p-4 mb-4">
            <AlertCircle size={40} color="#ffffff" />
          </View>
          <Text className="text-white text-xl font-geistBold text-center mb-2">
            Wallet Inactive
          </Text>
          <Text className="text-gray-100 text-sm font-geist text-center mb-6">
            Please activate your wallet to start using it
          </Text>
          <TouchableOpacity
            // onPress={() => router.push("/activate-wallet")}
            className="bg-white px-8 py-4 rounded-xl flex-row items-center gap-2"
          >
            <Text style={{ color: colors.primary }} className="font-geistBold">
              Activate Now
            </Text>
            <ArrowRight size={18} color={colors.primary} />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    )
  }

  const gradientColors = getTierGradient()

  return (
    <View
      className="flex-1 mx-4 rounded-3xl overflow-hidden"
      style={{ height: 240 }}
    >
      {/* Main Card Content */}
      <View className="flex-1 p-5">
        {/* Balance and Rewards Row */}
        <View className="flex-row justify-between items-start mb-4 gap-3">
          {/* Account Balance */}
          <View className="flex-1 ">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-white/70 text-xs font-geist uppercase tracking-wider">
                Balance
              </Text>
              <TouchableOpacity
                onPress={() => setIsAmountVisible(!isAmountVisible)}
                className="p-1"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {isAmountVisible ? (
                  <EyeOff size={14} color="rgba(255,255,255,0.7)" />
                ) : (
                  <Eye size={14} color="rgba(255,255,255,0.7)" />
                )}
              </TouchableOpacity>
            </View>
            <Text
              className="text-3xl font-groteskBold text-white"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {isAmountVisible
                ? formatCurrencyAbbr(walletData.balance)
                : "••••••"}
            </Text>
            <View className="flex-row items-center">
              <TrendingUp size={10} color="#86efac" />
              <Text className="text-green-300 text-[10px] font-geist ml-1">
                +2.5% this month
              </Text>
            </View>
          </View>

          {/* Vertical Divider with Blur */}
          <BlurView intensity={20} tint="light" className="w-px h-12 mx-3" />

          {/* Rewards */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-white/70 text-xs font-geist uppercase tracking-wider">
                Rewards
              </Text>
              <TouchableOpacity
                onPress={() => setIsPointsVisible(!isPointsVisible)}
                className="p-1"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {isPointsVisible ? (
                  <EyeOff size={14} color="rgba(255,255,255,0.7)" />
                ) : (
                  <Eye size={14} color="rgba(255,255,255,0.7)" />
                )}
              </TouchableOpacity>
            </View>
            <View className="flex-row items-baseline gap-1 mb-1">
              <Text
                className="text-3xl font-groteskBold text-white"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {isPointsVisible
                  ? formatPoints(walletData.habeshaPoints)
                  : "•••• pts"}
              </Text>
              <Star size={14} color="#FFD700" fill="#FFD700" />
            </View>
            <View className="flex-row items-center">
              <Award size={10} color="#d8b4fe" />
              <Text className="text-purple-200 text-[10px] font-geist ml-1">
                +150 this week
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default AccountCard
