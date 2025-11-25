import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import {
  Settings,
  Eye,
  EyeOff,
  Plus,
  Send,
  Download,
  Upload,
  QrCode,
  FileText,
  Phone,
  Wifi,
  Car,
  Star,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react-native"
import React, { useState } from "react"
import {
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from "react-native"

const PaymentPage = () => {
  const router = useRouter()
  const [showBalance, setShowBalance] = useState(true)
  const [showFABModal, setShowFABModal] = useState(false)

  // Sample data
  const transactions = [
    {
      id: 1,
      type: "sent",
      title: "Paid to Yohannes",
      time: "2 hours ago",
      amount: -150.0,
      status: "Completed",
    },
    {
      id: 2,
      type: "received",
      title: "From Alex",
      time: "1 day ago",
      amount: 200.0,
      status: "Completed",
    },
    {
      id: 3,
      type: "bill",
      title: "Electricity Bill",
      time: "2 days ago",
      amount: -75.5,
      status: "Pending",
    },
    {
      id: 4,
      type: "qr",
      title: "Coffee Shop",
      time: "3 days ago",
      amount: -35.0,
      status: "Completed",
    },
  ]

  const quickActions = [
    { icon: Send, label: "Send Money", color: "#3B82F6" },
    { icon: Download, label: "Request Money", color: "#10B981" },
    { icon: FileText, label: "Pay Bills", color: "#F59E0B" },
    { icon: QrCode, label: "Scan QR", color: "#8B5CF6" },
  ]

  const promotions = [
    {
      id: 1,
      title: "10% Cashback",
      subtitle: "On all transport",
      color: "#EC4899",
    },
    {
      id: 2,
      title: "Free Transfer",
      subtitle: "First 3 transfers",
      color: "#06B6D4",
    },
    { id: 3, title: "50% Off", subtitle: "Movie tickets", color: "#84CC16" },
  ]

  const FABActions = [
    { icon: Plus, label: "Add Money", color: "#3B82F6" },
    { icon: Send, label: "Send Money", color: "#10B981" },
    { icon: QrCode, label: "Pay QR", color: "#F59E0B" },
    { icon: Download, label: "Request Money", color: "#8B5CF6" },
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

  return (
    <>
      <StatusBar translucent={true} barStyle={"dark-content"} />

      <View className="flex-1 bg-white">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="pt-12 p-6 bg-white">
            <View className="flex flex-row justify-between items-center">
              <View>
                <Text className="text-3xl font-groteskBold text-gray-700">
                  Payment
                </Text>
                <Text className="text-base font-geist text-gray-500 pt-2">
                  Our multi-layered security keeps you safe.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/(passenger)/finicialSetting")}
                className="p-2"
              >
                <Settings size={24} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. Wallet Balance Card */}
          <View className="mx-4 mt-1 mb-6">
            {/* This outer View + overflow-hidden ensures gradient respects round corners */}
            <View className="rounded-3xl overflow-hidden shadow-2xl">
              <LinearGradient
                colors={["#ea580c", "#f97316", "#fb923c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="p-6"
              >
                {/* Balance Header */}
                <View className="flex-row justify-between items-start mb-6 pt-4">
                  <View>
                    <Text className="text-white/80 text-sm font-geist">
                      Current Balance
                    </Text>
                    <Text className="text-white text-4xl font-groteskBold mt-2">
                      {showBalance ? "ETB 12,450.75" : "••••••"}
                    </Text>
                    <Text className="text-white/70 text-xs font-geist mt-3">
                      Last updated: Today, 14:30
                    </Text>
                  </View>

                  <TouchableOpacity
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={() => setShowBalance(!showBalance)}
                  >
                    {showBalance ? (
                      <EyeOff size={26} color="#FFFFFF" />
                    ) : (
                      <Eye size={26} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>

                <View className="py-3"></View>
                {/* Action Buttons */}
                <View className="flex-row gap-4 mt-2">
                  <TouchableOpacity className="flex-1 bg-white rounded-2xl py-4 flex-row justify-center items-center shadow-lg">
                    <Plus size={22} color="#ea580c" />
                    <Text className="text-orange-600 font-groteskSemiBold text-base ml-2">
                      Add Money
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity className="flex-1 bg-white/20 backdrop-blur-xl rounded-2xl py-4 flex-row justify-center items-center border border-white/30">
                    <Upload size={22} color="#FFFFFF" />
                    <Text className="text-white font-groteskSemiBold text-base ml-2">
                      Withdraw
                    </Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* 3. Quick Actions Row */}
          <View className="px-6 mb-8 mt-4">
            <View className="flex-row justify-between">
              {quickActions.map((action, index) => (
                <TouchableOpacity key={index} className="items-center">
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <action.icon size={24} color={action.color} />
                  </View>
                  <Text className="text-gray-700 text-xs font-geistSemiBold text-center">
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 4. Linked Accounts Summary */}
          <View className="px-6 mb-6">
            <View className="bg-white rounded-xl p-4 border border-gray-100">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-groteskBold text-gray-800">
                  Linked Accounts
                </Text>
                <TouchableOpacity>
                  <Text className="text-blue-600 text-sm font-geistSemiBold">
                    Manage
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between gap-16">
                {/* Bank Account */}
                <View className="flex-row items-center flex-1 w-fit">
                  <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center mr-3">
                    <Text className="text-gray-600 font-geistBold text-xs">
                      BANK
                    </Text>
                  </View>
                  <View>
                    <Text className="text-gray-800 font-geistSemiBold">
                      Commercial Bank of Ethiopia
                    </Text>
                    <Text className="text-gray-500 text-xs font-geist">
                      **** 4582
                    </Text>
                  </View>
                </View>

                {/* Mobile Money */}
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-green-100 rounded-lg items-center justify-center mr-3">
                    <Text className="text-green-600 font-geistBold text-xs">
                      T
                    </Text>
                  </View>
                  <View>
                    <Text className="text-gray-800 font-geistSemiBold">
                      Telebirr
                    </Text>
                    <Text className="text-gray-500 text-xs font-geist">
                      **** 0912
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 6. Promotions / Rewards */}
          <View className="px-6 mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-groteskBold text-gray-800">
                Promotions
              </Text>
              <TouchableOpacity>
                <Text className="text-blue-600 text-sm font-geistSemiBold">
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="gap-4"
            >
              {promotions.map((promo) => (
                <TouchableOpacity
                  key={promo.id}
                  className="rounded-xl p-4 w-48 mx-1"
                  style={{ backgroundColor: promo.color }}
                >
                  <Text className="text-white font-groteskBold text-lg mb-1">
                    {promo.title}
                  </Text>
                  <Text className="text-white/90 text-sm font-geist">
                    {promo.subtitle}
                  </Text>
                  <View className="absolute bottom-3 right-3">
                    <Star size={16} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 7. Recent Transactions Feed */}
          <View className="px-6 mb-20">
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-groteskBold text-gray-800">
                  Recent Transactions
                </Text>
                <TouchableOpacity>
                  <MoreHorizontal size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {transactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
                >
                  <View
                    className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${
                      transaction.type === "sent"
                        ? "bg-red-100"
                        : transaction.type === "received"
                          ? "bg-green-100"
                          : transaction.type === "bill"
                            ? "bg-orange-100"
                            : "bg-purple-100"
                    }`}
                  >
                    {transaction.type === "sent" && (
                      <Upload size={16} color="#EF4444" />
                    )}
                    {transaction.type === "received" && (
                      <Download size={16} color="#10B981" />
                    )}
                    {transaction.type === "bill" && (
                      <FileText size={16} color="#F59E0B" />
                    )}
                    {transaction.type === "qr" && (
                      <QrCode size={16} color="#8B5CF6" />
                    )}
                  </View>

                  <View className="flex-1">
                    <Text className="text-gray-800 font-geistSemiBold">
                      {transaction.title}
                    </Text>
                    <Text className="text-gray-500 text-xs font-geist">
                      {transaction.time}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text
                      className={`font-geistSemiBold ${
                        transaction.amount < 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {transaction.amount < 0 ? "-" : "+"}
                      {formatAmount(transaction.amount)}
                    </Text>
                    <Text
                      className="text-xs font-geist"
                      style={{ color: getStatusColor(transaction.status) }}
                    >
                      {transaction.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity className="flex-row justify-center items-center pt-4">
                <Text className="text-blue-600 font-geistSemiBold text-center">
                  View All Transactions
                </Text>
                <ChevronRight size={16} color="#3B82F6" />
              </TouchableOpacity>
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
              <View className="bg-white rounded-t-3xl p-6 mb-16 mx-6">
                <Text className="text-xl font-groteskBold text-gray-800 mb-6 text-center">
                  Quick Actions
                </Text>
                <View className="flex-row flex-wrap justify-between">
                  {FABActions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      className="w-1/2 items-center py-4"
                      onPress={() => {
                        setShowFABModal(false)
                        // Handle action navigation here
                      }}
                    >
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center mb-2"
                        style={{ backgroundColor: `${action.color}15` }}
                      >
                        <action.icon size={20} color={action.color} />
                      </View>
                      <Text className="text-gray-700 text-sm font-geistSemiBold text-center">
                        {action.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </>
  )
}

export default PaymentPage
