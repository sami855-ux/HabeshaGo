import { useThemeContext } from "@/context/ThemeContext"
import { getWalletTransactions } from "@/service/wallet.api"
import { useAppSelector } from "@/store"
import {
  TransactionStatus,
  TransactionType,
  WalletTransactionDTO,
} from "@/types/transaction"
import { useRouter } from "expo-router"
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Download,
  Filter,
  QrCode,
  RefreshCw,
  Send,
} from "lucide-react-native"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

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
  return date.toLocaleDateString("en-ET", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const TransactionItem = ({
  transaction,
  onPress,
}: {
  transaction: WalletTransactionDTO
  onPress: () => void
}) => {
  const { colors } = useThemeContext()
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
      onPress={onPress}
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
        <Text
          className="text-xs mt-1 font-geist"
          style={{ color: colors.mutedText }}
        >
          {formatDate(transaction.createdAt)}
        </Text>
      </View>

      <View className="items-end mr-2">
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
      <ChevronRight size={20} color={colors.mutedText} />
    </TouchableOpacity>
  )
}

export default function AllTransactionsPage() {
  const router = useRouter()
  const { colors, actualTheme } = useThemeContext()
  const { hasWallet } = useAppSelector((state) => state.wallet)

  const [transactions, setTransactions] = useState<WalletTransactionDTO[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<
    WalletTransactionDTO[]
  >([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  const filters = [
    { id: "all", label: "All" },
    { id: "inflow", label: "Money In" },
    { id: "outflow", label: "Money Out" },
    { id: "success", label: "Success" },
    { id: "pending", label: "Pending" },
  ]

  const loadTransactions = async () => {
    try {
      const response = await getWalletTransactions()
      const allTransactions = response.transactions || []
      // Sort by date (newest first)
      const sorted = allTransactions.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      setTransactions(sorted)
      applyFilter(sorted, activeFilter)
    } catch (error) {
      console.error("Failed to load transactions:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const applyFilter = (txs: WalletTransactionDTO[], filterId: string) => {
    let filtered = [...txs]

    switch (filterId) {
      case "inflow":
        filtered = txs.filter((tx) =>
          [
            TransactionType.DEPOSIT,
            TransactionType.REFUND,
            TransactionType.TRANSFER_IN,
            TransactionType.PAYMENT_IN,
          ].includes(tx.type),
        )
        break
      case "outflow":
        filtered = txs.filter((tx) =>
          [
            TransactionType.WITHDRAW,
            TransactionType.TRANSFER_OUT,
            TransactionType.PAYMENT_OUT,
          ].includes(tx.type),
        )
        break
      case "success":
        filtered = txs.filter((tx) => tx.status === TransactionStatus.SUCCESS)
        break
      case "pending":
        filtered = txs.filter((tx) => tx.status === TransactionStatus.PENDING)
        break
      default:
        filtered = txs
    }

    setFilteredTransactions(filtered)
  }

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId)
    applyFilter(transactions, filterId)
    setShowFilterMenu(false)
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadTransactions()
  }

  useEffect(() => {
    if (hasWallet) {
      loadTransactions()
    }
  }, [hasWallet])

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
        {/* Header */}
        <View
          className="pt-16 px-4 pb-4"
          style={{ backgroundColor: colors.card }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.primary + "15" }}
              >
                <ArrowLeft size={22} color={colors.primary} />
              </TouchableOpacity>
              <Text
                className="text-2xl font-groteskBold"
                style={{ color: colors.text }}
              >
                All Transactions
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowFilterMenu(!showFilterMenu)}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary + "15" }}
            >
              <Filter size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Filter Menu */}
          {showFilterMenu && (
            <View
              className="absolute top-24 right-4 rounded-xl p-2 z-10 shadow-lg"
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  className="px-4 py-3 rounded-lg"
                  style={{
                    backgroundColor:
                      activeFilter === filter.id
                        ? colors.primary + "15"
                        : "transparent",
                  }}
                  onPress={() => handleFilterChange(filter.id)}
                >
                  <Text
                    className="font-geist"
                    style={{
                      color:
                        activeFilter === filter.id
                          ? colors.primary
                          : colors.text,
                    }}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Transactions List */}
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : filteredTransactions.length > 0 ? (
            <View className="mt-4">
              {filteredTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onPress={() =>
                    router.push({
                      pathname: "/(passenger)/transaction-details",
                      params: { id: transaction.id },
                    })
                  }
                />
              ))}
            </View>
          ) : (
            <View className="py-12 items-center">
              <Text
                className="text-base font-geist text-center"
                style={{ color: colors.mutedText }}
              >
                No transactions found
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  )
}
