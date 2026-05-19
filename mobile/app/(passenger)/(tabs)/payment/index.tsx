import { RecentTransactions } from "@/components/passenger/TransactionList"
import { WalletCard } from "@/components/passenger/WalletCard"
import { ProfileCompletionModal } from "@/components/passenger/wallet/ProfileCompletionModal"
import { WalletPinSetupModal } from "@/components/passenger/wallet/WalletPinSetupModal"
import { useThemeContext } from "@/context/ThemeContext"
import { createUserWallet, getWalletTransactions } from "@/service/wallet.api"
import { useAppDispatch, useAppSelector } from "@/store"
import { fetchCurrentUser } from "@/store/slices/userSlice"
// import { fetchCurrentUser } from "@/store/slices/userSlice"
import { fetchUserWallet, setWallet } from "@/store/slices/walletSlice"
import { WalletTransactionDTO } from "@/types/transaction"
import { useRouter } from "expo-router"
import {
  AlertTriangle,
  Bell,
  Calendar,
  Download,
  Eye,
  EyeOff,
  Lock,
  Plus,
  QrCode,
  RefreshCw,
  Send,
  Settings,
  Smartphone,
  Star,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from "lucide-react-native"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"

const { width } = Dimensions.get("window")

const PaymentPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { colors, actualTheme } = useThemeContext()

  // State
  const [transactions, setTransactions] = useState<WalletTransactionDTO[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  const [showFABModal, setShowFABModal] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isPasswordSet, setIsPasswordSet] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // Get wallet state from Redux
  const {
    wallet,
    loading: walletLoading,
    hasWallet,
  } = useAppSelector((state) => state.wallet)

  // User state
  const { user, loading: userLoading } = useAppSelector((state) => state.user)

  // Check if profile is complete (email and phone verified)
  const isProfileComplete = user?.emailVerified && user?.phoneVerified

  // Check if PIN is set (has pinHash)
  const hasPinSet = wallet?.pinHash && wallet.pinHash.trim() !== ""

  // Initialize user and wallet data
  useEffect(() => {
    const initialize = async () => {
      try {
        // Fetch user and wallet data if not already loaded
        if (!user && !userLoading) {
          await dispatch(fetchCurrentUser()).unwrap()
        }
        if (!wallet && !walletLoading && hasWallet) {
          await dispatch(fetchUserWallet()).unwrap()
        }
      } catch (err) {
        setError("Failed to load user data")
        console.error("Initialization error:", err)
      } finally {
        setIsInitializing(false)
      }
    }

    initialize()
  }, [])

  // Check profile completion and wallet status
  useEffect(() => {
    if (!isInitializing && !userLoading && !walletLoading) {
      // Check profile completion first
      if (!isProfileComplete) {
        // Show profile completion modal
        setShowPasswordModal(false) // Close any other modals
        // We'll handle this in the render with ProfileCompletionModal
      }
      // Then check wallet/PIN status
      else if (!hasWallet || !hasPinSet) {
        // Delay slightly for better UX
        const timer = setTimeout(() => {
          setShowPinModal(true)
        }, 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [
    isInitializing,
    userLoading,
    walletLoading,
    isProfileComplete,
    hasWallet,
    hasPinSet,
  ])

  // Load transactions when wallet is ready
  useEffect(() => {
    const loadTransactions = async () => {
      if (!hasWallet || !hasPinSet) return

      try {
        setTransactionsLoading(true)
        const response = await getWalletTransactions()

        // Get all transactions and sort by date (newest first)
        const allTransactions = response.transactions || []
        const sortedTransactions = [...allTransactions].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )

        // Show only the latest 5 transactions
        setTransactions(sortedTransactions.slice(0, 5))
      } catch (error) {
        console.error("Failed to load transactions:", error)
      } finally {
        setTransactionsLoading(false)
      }
    }

    loadTransactions()
  }, [hasWallet, hasPinSet])

  const quickActions = [
    { icon: Send, label: "Send", color: colors.primary, route: "send-money" },
    {
      icon: Wallet,
      label: "Top-up",
      color: colors.primary,
      route: "deposite-money",
    },
    { icon: QrCode, label: "Scan QR", color: colors.primary, route: "" },
  ]

  const promotions = [
    {
      id: 1,
      title: "10% Cashback",
      subtitle: "On all transport rides",
      icon: TrendingUp,
      color: colors.primary,
    },
    {
      id: 2,
      title: "Free Transfer",
      subtitle: "First 3 transfers this month",
      icon: Zap,
      color: colors.primary,
    },
    {
      id: 3,
      title: "50% Off",
      subtitle: "Movie tickets weekend",
      icon: Calendar,
      color: colors.primary,
    },
  ]

  const FABActions = [
    { icon: Plus, label: "Add Money", color: colors.primary },
    { icon: Send, label: "Send Money", color: colors.primary },
    { icon: QrCode, label: "Pay QR", color: colors.primary },
    { icon: Download, label: "Request", color: colors.primary },
  ]

  const handlePinComplete = async (pin: string) => {
    try {
      setPinLoading(true)
      const res = await createUserWallet(pin)

      dispatch(setWallet(res))
      setShowPinModal(false)

      Alert.alert("Success", "Wallet created successfully!")
    } catch (err) {
      Alert.alert("Error", "Failed to create wallet. Please try again.")
      console.error("PIN setup error:", err)
    } finally {
      setPinLoading(false)
    }
  }

  const handleSetPassword = async () => {
    if (!password.trim()) {
      Alert.alert("Error", "Please enter a password")
      return
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }

    setIsPasswordSet(true)
    setShowPasswordModal(false)
    setPassword("")
    setConfirmPassword("")
    Alert.alert("Success", "Wallet password set successfully!")
  }

  const handleAddMoney = () => {
    if (!isPasswordSet) {
      setShowPasswordModal(true)
      return
    }
    // Handle add money logic
    console.log("Add money")
  }

  const handleWithdraw = () => {
    if (!isPasswordSet) {
      setShowPasswordModal(true)
      return
    }
    // Handle withdraw logic
    console.log("Withdraw")
  }

  const QuickActionItem = ({ action }: any) => {
    const Icon = action.icon
    return (
      <TouchableOpacity
        className="items-center"
        activeOpacity={0.7}
        onPress={() => {
          // if (!hasWallet || !hasPinSet) {
          //   setShowPinModal(true)
          //   return
          // }
          // if (!isPasswordSet) {
          //   setShowPasswordModal(true)
          //   return
          // }
          router.push(`/${action.route}`)
        }}
      >
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
          style={{ backgroundColor: colors.primary + "15" }}
        >
          <Icon size={24} color={colors.primary} />
        </View>
        <Text
          className="text-sm font-medium font-geist"
          style={{ color: colors.text }}
        >
          {action.label}
        </Text>
      </TouchableOpacity>
    )
  }

  const statusBarStyle =
    actualTheme === "dark" ? "light-content" : "dark-content"

  // Combined loading state
  const isLoading = walletLoading || userLoading || isInitializing

  if (isLoading) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={statusBarStyle}
        />
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View
            className="pt-16 px-4 pb-8"
            style={{ backgroundColor: colors.card }}
          >
            <View className="h-[200px] rounded-2xl items-center justify-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={statusBarStyle}
        />
        <View className="flex-1 justify-center items-center px-4">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.primary + "15" }}
          >
            <AlertTriangle size={32} color={colors.primary} />
          </View>
          <Text
            className="text-xl font-groteskBold mb-2"
            style={{ color: colors.text }}
          >
            Error Loading Wallet
          </Text>
          <Text
            className="text-base text-center mb-6"
            style={{ color: colors.mutedText }}
          >
            {error}
          </Text>
          <TouchableOpacity
            className="px-6 py-3 rounded-xl"
            style={{ backgroundColor: colors.primary }}
            onPress={() => {
              setError(null)
              setIsInitializing(true)
              dispatch(fetchCurrentUser())
              dispatch(fetchUserWallet())
            }}
          >
            <Text className="text-white font-geist">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (!user) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={statusBarStyle}
        />
        <View className="flex-1 justify-center items-center px-4">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.primary + "15" }}
          >
            <Wallet size={32} color={colors.primary} />
          </View>
          <Text
            className="text-xl font-groteskBold mb-2"
            style={{ color: colors.text }}
          >
            User Not Found
          </Text>
          <Text
            className="text-base text-center mb-6"
            style={{ color: colors.mutedText }}
          >
            Please log in to access your wallet
          </Text>
          <TouchableOpacity
            className="px-6 py-3 rounded-xl"
            style={{ backgroundColor: colors.primary }}
            // onPress={() => router.push("/(auth)/login")}
          >
            <Text className="text-white font-geist">Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={statusBarStyle}
      />

      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View
            className="pt-16 px-4 pb-8"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text
                  className="text-3xl font-groteskBold"
                  style={{ color: colors.text }}
                >
                  Wallet
                </Text>
                <Text
                  className="text-base mt-2 font-geist"
                  style={{ color: colors.mutedText }}
                >
                  Manage your payments and transactions
                </Text>
              </View>

              <View className="flex-row items-center space-x-4">
                {hasWallet && (
                  <TouchableOpacity
                    className="w-12 h-12 rounded-full items-center justify-center mr-2"
                    style={{ backgroundColor: colors.primary + "15" }}
                    onPress={() => {
                      dispatch(fetchUserWallet())
                    }}
                  >
                    <RefreshCw size={20} color={colors.primary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary + "15" }}
                  onPress={() => router.push("/(passenger)/finicialSetting")}
                >
                  <Settings size={23} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Wallet Setup Warning */}
            {!hasWallet && (
              <View
                className="mb-4 rounded-xl p-4"
                style={{
                  backgroundColor: colors.primary + "15",
                  borderWidth: 1,
                  borderColor: colors.primary + "30",
                }}
              >
                <View className="flex-row items-center mb-2">
                  <Lock size={20} color={colors.primary} />
                  <Text
                    className="text-base font-groteskBold ml-2"
                    style={{ color: colors.primary }}
                  >
                    Wallet Setup Required
                  </Text>
                </View>
                <Text className="text-sm mb-3" style={{ color: colors.text }}>
                  You need to set up your wallet PIN to start using wallet
                  features.
                </Text>
                <TouchableOpacity
                  className="py-2 px-4 rounded-lg self-start"
                  style={{ backgroundColor: colors.primary }}
                  onPress={() => setShowPinModal(true)}
                >
                  <Text className="text-white font-geist">Set Up Now</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* PIN Setup Reminder */}
            {hasWallet && !hasPinSet && !showPinModal && (
              <View
                className="mb-4 rounded-xl p-4"
                style={{
                  backgroundColor: "#3B82F620",
                  borderWidth: 1,
                  borderColor: "#3B82F640",
                }}
              >
                <View className="flex-row items-center mb-2">
                  <Lock size={20} color="#3B82F6" />
                  <Text
                    className="text-base font-groteskBold ml-2"
                    style={{ color: "#3B82F6" }}
                  >
                    Wallet Security Required
                  </Text>
                </View>
                <Text className="text-sm mb-3" style={{ color: colors.text }}>
                  Set up your wallet PIN to secure your transactions.
                </Text>
                <TouchableOpacity
                  className="py-2 px-4 rounded-lg self-start"
                  style={{ backgroundColor: "#3B82F6" }}
                  onPress={() => setShowPinModal(true)}
                >
                  <Text className="text-white font-geist">Set PIN Now</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Balance Card with Wallet Data */}
            {hasWallet && hasPinSet ? (
              <WalletCard
                wallet={{
                  balance: wallet?.balance || 0,
                  currency: wallet?.currency || "ETB",
                  isActive: wallet?.isActive ?? true,
                  isLocked: wallet?.isLocked ?? false,
                  habeshaPoints: wallet?.points || 0,
                  biometricEnabled: wallet?.biometricEnabled ?? false,
                }}
                showBalance={showBalance}
                onToggleBalance={() => setShowBalance(!showBalance)}
                onAddMoney={handleAddMoney}
                onWithdraw={handleWithdraw}
                isPasswordSet={isPasswordSet}
              />
            ) : (
              <View
                className="h-[200px] rounded-2xl items-center justify-center border-2 border-dashed"
                style={{ borderColor: colors.border }}
              >
                <View
                  className="w-16 h-16 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: colors.primary + "15" }}
                >
                  <Wallet size={32} color={colors.primary} />
                </View>
                <Text
                  className="text-lg font-groteskBold mb-2"
                  style={{ color: colors.text }}
                >
                  No Wallet Yet
                </Text>
                <Text
                  className="text-sm text-center px-6 mb-4"
                  style={{ color: colors.mutedText }}
                >
                  Set up your wallet PIN to create your digital wallet
                </Text>
                <TouchableOpacity
                  className="px-6 py-3 rounded-xl"
                  style={{ backgroundColor: colors.primary }}
                  onPress={() => setShowPinModal(true)}
                >
                  <Text className="text-white font-geist">Set Up Wallet</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Only show these sections if wallet exists and PIN is set */}
          {hasWallet && hasPinSet && (
            <>
              {/* Quick Actions */}
              <View className="px-6 py-6">
                <View className="flex-row justify-between">
                  {quickActions.map((action, index) => (
                    <QuickActionItem key={index} action={action} />
                  ))}
                </View>
              </View>

              {/* Linked Accounts */}
              <View className="px-3 mb-6">
                <View
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: colors.card }}
                >
                  <View className="flex-row justify-between items-center mb-5">
                    <Text
                      className="text-lg font-geist"
                      style={{ color: colors.text }}
                    >
                      Linked Accounts
                    </Text>
                    <TouchableOpacity>
                      <Text
                        className="text-sm font-medium font-geist"
                        style={{ color: colors.primary }}
                      >
                        Manage
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="space-y-4">
                    {/* Bank Account */}
                    <TouchableOpacity
                      className="flex-row items-center py-4"
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <View
                        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                        style={{ backgroundColor: colors.primary + "15" }}
                      >
                        <Bell size={22} color={colors.primary} />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="font-semibold text-base font-geist"
                          style={{ color: colors.text }}
                        >
                          Commercial Bank of Ethiopia
                        </Text>
                        <Text
                          className="text-sm mt-1 font-geist"
                          style={{ color: colors.mutedText }}
                        >
                          Account •••• 4582
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Mobile Money */}
                    <TouchableOpacity className="flex-row items-center py-4">
                      <View
                        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                        style={{ backgroundColor: colors.primary + "15" }}
                      >
                        <Smartphone size={22} color={colors.primary} />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="font-semibold text-base font-geist"
                          style={{ color: colors.text }}
                        >
                          Telebirr
                        </Text>
                        <Text
                          className="text-sm mt-1 font-geist"
                          style={{ color: colors.mutedText }}
                        >
                          Wallet •••• 0912
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Promotions */}
              <View className="px-3 mb-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text
                    className="text-lg font-geist"
                    style={{ color: colors.text }}
                  >
                    Promotions
                  </Text>
                  <TouchableOpacity>
                    <Text
                      className="text-sm font-medium font-geist"
                      style={{ color: colors.primary }}
                    >
                      View All
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="gap-4"
                >
                  {promotions.map((promo) => {
                    const Icon = promo.icon
                    return (
                      <TouchableOpacity
                        key={promo.id}
                        className="rounded-2xl p-5 w-64 mx-2"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <View className="flex-row items-center mb-3">
                          <View
                            className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                          >
                            <Icon size={24} color="#FFFFFF" />
                          </View>
                          <View>
                            <Text className="text-white text-lg font-geist">
                              {promo.title}
                            </Text>
                            <Text className="text-white/90 text-sm mt-1 font-geist">
                              {promo.subtitle}
                            </Text>
                          </View>
                        </View>
                        <View className="absolute bottom-4 right-4">
                          <Star size={18} color="#FFFFFF" />
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>
              </View>
            </>
          )}

          {/* Transactions Section - Show even if wallet exists but PIN not set */}
          {hasWallet && transactionsLoading ? (
            <View className="px-3 mb-24">
              <View
                className="rounded-2xl p-5 items-center justify-center"
                style={{ backgroundColor: colors.card }}
              >
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            </View>
          ) : hasWallet && hasPinSet ? (
            <RecentTransactions
              transactions={transactions}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onViewAll={() => {
                router.push("/(passenger)/all-transaction")
              }}
            />
          ) : null}
        </ScrollView>

        {/* FAB Button - Only show if wallet exists and PIN is set */}
        {hasWallet && hasPinSet && (
          <TouchableOpacity
            className="absolute bottom-8 right-8 w-14 h-14 rounded-full items-center justify-center shadow-lg"
            style={{
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
            onPress={() => {
              if (!isPasswordSet) {
                setShowPasswordModal(true)
                return
              }
              setShowFABModal(true)
            }}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* FAB Modal */}
        <Modal
          visible={showFABModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFABModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowFABModal(false)}>
            <View className="flex-1 bg-black/50 justify-end">
              <View
                className="rounded-t-3xl p-6 mb-16 mx-6"
                style={{ backgroundColor: colors.card }}
              >
                <Text
                  className="text-xl font-bold mb-6 text-center"
                  style={{ color: colors.text }}
                >
                  Quick Actions
                </Text>
                <View className="flex-row flex-wrap justify-between">
                  {FABActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <TouchableOpacity
                        key={index}
                        className="w-1/2 items-center py-4"
                        onPress={() => {
                          setShowFABModal(false)
                          if (!isPasswordSet) {
                            setShowPasswordModal(true)
                            return
                          }
                          // Handle action navigation here
                        }}
                      >
                        <View
                          className="w-14 h-14 rounded-xl items-center justify-center mb-3"
                          style={{ backgroundColor: colors.primary + "15" }}
                        >
                          <Icon size={22} color={colors.primary} />
                        </View>
                        <Text
                          className="text-sm font-medium text-center"
                          style={{ color: colors.text }}
                        >
                          {action.label}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Transaction Password Modal */}
        <Modal
          visible={showPasswordModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View
              className="w-[90%] rounded-3xl p-6"
              style={{ backgroundColor: colors.card }}
            >
              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: colors.primary + "15" }}
                  >
                    <Lock size={24} color={colors.primary} />
                  </View>
                  <View>
                    <Text
                      className="text-xl font-bold font-geist"
                      style={{ color: colors.text }}
                    >
                      Secure Your Wallet
                    </Text>
                    <Text
                      className="text-sm mt-1 font-geist"
                      style={{ color: colors.mutedText }}
                    >
                      Set up a password for transactions
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                  <X size={24} color={colors.mutedText} />
                </TouchableOpacity>
              </View>

              <Text
                className="text-sm mb-4 font-geist"
                style={{ color: colors.mutedText }}
              >
                For security purposes, please set up a password to secure your
                wallet transactions.
              </Text>

              {/* Password Input */}
              <View className="mb-4">
                <Text
                  className="text-sm font-medium mb-2 font-geist"
                  style={{ color: colors.text }}
                >
                  New Password
                </Text>
                <View
                  className="rounded-xl border px-4 py-3 flex-row items-center"
                  style={{ borderColor: colors.border }}
                >
                  <TextInput
                    className="flex-1"
                    style={{ color: colors.text }}
                    placeholder="Enter password"
                    placeholderTextColor={colors.mutedText}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={colors.mutedText} />
                    ) : (
                      <Eye size={20} color={colors.mutedText} />
                    )}
                  </TouchableOpacity>
                </View>
                <Text
                  className="text-xs mt-1 font-geist"
                  style={{ color: colors.mutedText }}
                >
                  Must be at least 6 characters
                </Text>
              </View>

              {/* Confirm Password Input */}
              <View className="mb-6">
                <Text
                  className="text-sm font-medium mb-2 font-geist"
                  style={{ color: colors.text }}
                >
                  Confirm Password
                </Text>
                <View
                  className="rounded-xl border px-4 py-3 flex-row items-center"
                  style={{ borderColor: colors.border }}
                >
                  <TextInput
                    className="flex-1"
                    style={{ color: colors.text }}
                    placeholder="Confirm password"
                    placeholderTextColor={colors.mutedText}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={colors.mutedText} />
                    ) : (
                      <Eye size={20} color={colors.mutedText} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl items-center border"
                  style={{ borderColor: colors.border }}
                  onPress={() => setShowPasswordModal(false)}
                >
                  <Text
                    className="font-medium font-geist"
                    style={{ color: colors.text }}
                  >
                    Skip for now
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: colors.primary }}
                  onPress={handleSetPassword}
                >
                  <Text className="text-white font-medium font-geist">
                    Set Password
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={!isProfileComplete}
        onClose={() => {
          Alert.alert(
            "Profile Incomplete",
            "Please complete your profile to continue",
            [{ text: "OK" }],
          )
        }}
      />

      {/* PIN Setup Modal */}
      <WalletPinSetupModal
        isOpen={showPinModal}
        onComplete={handlePinComplete}
        pinLoading={pinLoading}
        onClose={() => {
          Alert.alert(
            "PIN Required",
            "You must set up a PIN to use wallet features",
            [{ text: "OK" }],
          )
          setShowPinModal(false)
        }}
        canClose={hasPinSet}
        onSetupLater={() => {
          Alert.alert(
            "Limited Functionality",
            "Some wallet features will be unavailable without PIN",
            [{ text: "OK" }],
          )
          setShowPinModal(false)
        }}
      />
    </>
  )
}

export default PaymentPage
