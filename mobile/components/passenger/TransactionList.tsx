// RecentTransactions.tsx
import { useThemeContext } from "@/context/ThemeContext"
import {
  TransactionStatus,
  TransactionType,
  WalletTransactionDTO,
} from "@/types/transaction"
import { useRouter } from "expo-router"
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Download,
  QrCode,
  RefreshCw,
  Send,
} from "lucide-react-native"
import React from "react"
import { Text, TouchableOpacity, View } from "react-native"

interface RecentTransactionsProps {
  transactions: WalletTransactionDTO[]
  activeTab: string
  onTabChange: (tab: string) => void
  onViewAll: () => void
}

const getTransactionIcon = (type: TransactionType) => {
  switch (type) {
    case TransactionType.DEPOSIT:
      return Download
    case TransactionType.WITHDRAW:
      return Send
    case TransactionType.REFUND:
      return RefreshCw
    case TransactionType.TRANSFER_IN:
    case TransactionType.PAYMENT_IN:
      return ArrowDownLeft
    case TransactionType.TRANSFER_OUT:
    case TransactionType.PAYMENT_OUT:
      return ArrowUpRight
    case TransactionType.ADJUSTMENT:
      return RefreshCw
    default:
      return QrCode
  }
}

const getTransactionTitle = (transaction: WalletTransactionDTO) => {
  if (transaction.recipientName) {
    return transaction.recipientName
  }

  switch (transaction.type) {
    case TransactionType.DEPOSIT:
      return "Money Added"
    case TransactionType.WITHDRAW:
      return "Money Withdrawn"
    case TransactionType.REFUND:
      return "Refund Received"
    case TransactionType.ADJUSTMENT:
      return "Balance Adjustment"
    case TransactionType.TRANSFER_IN:
      return "Transfer Received"
    case TransactionType.TRANSFER_OUT:
      return "Transfer Sent"
    case TransactionType.PAYMENT_IN:
      return "Payment Received"
    case TransactionType.PAYMENT_OUT:
      return "Payment Sent"
    default:
      return "Transaction"
  }
}

const getStatusColor = (status: TransactionStatus) => {
  switch (status) {
    case TransactionStatus.SUCCESS:
      return "#10B981"
    case TransactionStatus.PENDING:
      return "#F59E0B"
    case TransactionStatus.FAILED:
      return "#EF4444"
    case TransactionStatus.REVERSED:
      return "#6B7280"
    default:
      return "#6B7280"
  }
}

const formatAmount = (amount: string, type: TransactionType) => {
  const numAmount = parseFloat(amount)
  const isInflow = [
    TransactionType.DEPOSIT,
    TransactionType.REFUND,
    TransactionType.TRANSFER_IN,
    TransactionType.PAYMENT_IN,
  ].includes(type)

  return {
    value: `ETB ${Math.abs(numAmount).toLocaleString("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    isInflow,
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  } else if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString("en-ET", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }
}

const TransactionItem = ({
  transaction,
}: {
  transaction: WalletTransactionDTO
}) => {
  const { colors } = useThemeContext()
  const router = useRouter()

  const Icon = getTransactionIcon(transaction.type)
  const title = getTransactionTitle(transaction)
  const { value: amountValue, isInflow } = formatAmount(
    transaction.amount,
    transaction.type,
  )

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
          {title}
        </Text>
        {transaction.description && (
          <Text
            className="text-sm mt-1 font-geist"
            style={{ color: colors.mutedText }}
          >
            {transaction.description}
          </Text>
        )}
        <Text
          className="text-xs mt-1 font-geist"
          style={{ color: colors.mutedText }}
        >
          {formatDate(transaction.createdAt)}
        </Text>
      </View>

      <View className="items-end">
        <Text
          className={`font-semibold text-base font-geist ${
            isInflow ? "text-green-500" : "text-red-500"
          }`}
        >
          {isInflow ? "+" : "-"}
          {amountValue}
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

export const RecentTransactions = ({
  transactions,
  activeTab,
  onTabChange,
  onViewAll,
}: RecentTransactionsProps) => {
  const { colors } = useThemeContext()

  const tabs = [
    { id: "all", label: "All" },
    { id: "inflow", label: "Money In" },
    { id: "outflow", label: "Money Out" },
  ]

  const filteredTransactions = transactions.filter((transaction) => {
    if (activeTab === "all") return true

    const isInflow = [
      TransactionType.DEPOSIT,
      TransactionType.REFUND,
      TransactionType.TRANSFER_IN,
      TransactionType.PAYMENT_IN,
    ].includes(transaction.type)

    return activeTab === "inflow" ? isInflow : !isInflow
  })

  return (
    <View className="px-3 mb-24">
      <View
        className="rounded-2xl p-5"
        style={{ backgroundColor: colors.card }}
      >
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg font-geist" style={{ color: colors.text }}>
            Recent Transactions
          </Text>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={onViewAll}
          >
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
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className="flex-1 py-2 rounded-lg items-center"
              style={{
                backgroundColor:
                  activeTab === tab.id ? colors.primary : "transparent",
              }}
              onPress={() => onTabChange(tab.id)}
            >
              <Text
                className="font-medium text-sm font-geist"
                style={{
                  color: activeTab === tab.id ? "#FFFFFF" : colors.mutedText,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions List */}
        <View>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <View className="py-8 items-center">
              <Text
                className="text-base font-geist"
                style={{ color: colors.mutedText }}
              >
                No transactions found
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
