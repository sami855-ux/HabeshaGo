import { useThemeContext } from "@/context/ThemeContext"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import {
  Bell,
  Calendar,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileText,
  Plus,
  QrCode,
  Send,
  Settings,
  Smartphone,
  Star,
  TrendingUp,
  Upload,
  Wallet,
  Zap,
} from "lucide-react-native"
import React, { useState } from "react"
import {
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"

const { width } = Dimensions.get("window")

const PaymentPage = () => {
  const router = useRouter()
  const { colors, actualTheme } = useThemeContext()
  const [showBalance, setShowBalance] = useState(true)
  const [showFABModal, setShowFABModal] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Sample data
  const transactions = [
    {
      id: 1,
      type: "sent",
      title: "Paid to Yohannes",
      description: "For dinner",
      time: "2 hours ago",
      amount: -150.0,
      status: "Completed",
      icon: Send,
    },
    {
      id: 2,
      type: "received",
      title: "From Alex",
      description: "Payment for project",
      time: "1 day ago",
      amount: 200.0,
      status: "Completed",
      icon: Download,
    },
    {
      id: 3,
      type: "bill",
      title: "Electricity Bill",
      description: "Monthly utility",
      time: "2 days ago",
      amount: -75.5,
      status: "Pending",
      icon: FileText,
    },
    {
      id: 4,
      type: "qr",
      title: "Coffee Shop",
      description: "QR Payment",
      time: "3 days ago",
      amount: -35.0,
      status: "Completed",
      icon: QrCode,
    },
  ]

  const quickActions = [
    { icon: Send, label: "Send", color: colors.primary },
    { icon: Wallet, label: "Top-up", color: colors.primary },
    { icon: Download, label: "Request", color: colors.primary },
    { icon: QrCode, label: "Scan QR", color: colors.primary },
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

  const formatAmount = (amount: number) => {
    return `ETB ${Math.abs(amount).toLocaleString("en-ET")}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "#10B981"
      case "Pending":
        return "#F59E0B"
      case "Failed":
        return "#EF4444"
      default:
        return "#6B7280"
    }
  }

  const TransactionItem = ({ transaction }: any) => {
    const Icon = transaction.icon
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        className="flex-row items-center py-4 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mr-4"
          style={{ backgroundColor: colors.primary + "15" }}
        >
          <Icon size={22} color={colors.primary} />
        </View>

        <View className="flex-1">
          <Text
            className="font-semibold text-base font-geist"
            style={{ color: colors.text }}
          >
            {transaction.title}
          </Text>
          <Text
            className="text-sm mt-1 font-geist"
            style={{ color: colors.mutedText }}
          >
            {transaction.description}
          </Text>
          <Text
            className="text-xs mt-1 font-geist"
            style={{ color: colors.mutedText }}
          >
            {transaction.time}
          </Text>
        </View>

        <View className="items-end">
          <Text
            className={`font-semibold text-base font-geist ${
              transaction.amount < 0 ? "text-red-500" : "text-green-500"
            }`}
          >
            {transaction.amount < 0 ? "-" : "+"}
            {formatAmount(transaction.amount)}
          </Text>
          <View
            className="px-3 py-1 rounded-full mt-2"
            style={{
              backgroundColor: getStatusColor(transaction.status) + "20",
              alignSelf: "flex-end",
            }}
          >
            <Text
              className="text-xs font-medium font-geist"
              style={{ color: getStatusColor(transaction.status) }}
            >
              {transaction.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const QuickActionItem = ({ action }: any) => {
    const Icon = action.icon
    return (
      <TouchableOpacity className="items-center" activeOpacity={0.7}>
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
                <TouchableOpacity
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary + "15" }}
                  onPress={() => router.push("/(passenger)/finicialSetting")}
                >
                  <Settings size={23} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Balance Card */}
            <View className="rounded-2xl overflow-hidden">
              <LinearGradient
                colors={["#EA580C", "#F97316", "#FB923C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="p-6"
              >
                <View className="flex-row justify-between items-center mb-8">
                  <View>
                    <Text className="text-white/80 text-sm font-geist">
                      Current Balance
                    </Text>
                    <Text className="text-white text-4xl font-groteskBold mt-2">
                      {showBalance ? "ETB 12,450.75" : "••••••"}
                    </Text>
                    <Text className="text-white/70 text-xs mt-3 font-geist italic">
                      Last updated: Today, 14:30
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setShowBalance(!showBalance)}
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

                <View className="flex-row gap-4">
                  <TouchableOpacity
                    className="flex-1 bg-white rounded-xl py-4 flex-row justify-center items-center"
                    activeOpacity={0.8}
                  >
                    <Plus size={20} color="#EA580C" />
                    <Text className="text-orange-600 font-semibold text-base ml-2 font-geist">
                      Add Money
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 bg-white/20 rounded-xl py-4 flex-row justify-center items-center border border-white/30"
                    activeOpacity={0.8}
                  >
                    <Upload size={20} color="#FFFFFF" />
                    <Text className="text-white font-semibold text-base ml-2 font-geist">
                      Withdraw
                    </Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>

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
                        <Text className="text-white  text-lg font-geist">
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

          {/* Recent Transactions */}
          <View className="px-3 mb-24">
            <View
              className="rounded-2xl p-5"
              style={{ backgroundColor: colors.card }}
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text
                  className="text-lg font-geist"
                  style={{ color: colors.text }}
                >
                  Recent Transactions
                </Text>
                <TouchableOpacity className="flex-row items-center">
                  <Text
                    className="text-sm font-medium mr-2 font-geist"
                    style={{ color: colors.primary }}
                  >
                    View All
                  </Text>
                  <ChevronRight size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View
                className="flex-row rounded-xl p-1 mb-6"
                style={{ backgroundColor: colors.border }}
              >
                {["all", "sent", "received"].map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    className="flex-1 py-2 rounded-lg items-center"
                    style={{
                      backgroundColor:
                        activeTab === tab ? colors.primary : "transparent",
                    }}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text
                      className="font-medium text-sm capitalize font-geist"
                      style={{
                        color: activeTab === tab ? "#FFFFFF" : colors.mutedText,
                      }}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Transactions List */}
              <View>
                {transactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

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

        {/* FAB Button */}
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
          onPress={() => setShowFABModal(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </>
  )
}

export default PaymentPage
