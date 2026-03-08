import { useThemeContext } from "@/context/ThemeContext"
import { getTransactionById } from "@/service/wallet.api"
import {
  TransactionStatus,
  TransactionType,
  WalletTransactionDTO,
} from "@/types/transaction"
import { useLocalSearchParams, useRouter } from "expo-router"
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Check,
  Copy,
  CreditCard,
  Download,
  FileText,
  Hash,
  QrCode,
  RefreshCw,
  Send,
  User,
} from "lucide-react-native"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
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

const getStatusBgColor = (status: TransactionStatus) => {
  switch (status) {
    case TransactionStatus.SUCCESS:
      return "#10B98120"
    case TransactionStatus.PENDING:
      return "#F59E0B20"
    case TransactionStatus.FAILED:
      return "#EF444420"
    case TransactionStatus.REVERSED:
      return "#6B728020"
    default:
      return "#6B728020"
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
    value: Math.abs(numAmount).toLocaleString("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    isInflow,
    symbol: isInflow ? "+" : "-",
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return {
    full: date.toLocaleDateString("en-ET", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    date: date.toLocaleDateString("en-ET", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-ET", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  }
}

const DetailRow = ({
  icon: Icon,
  label,
  value,
  onCopy,
}: {
  icon: any
  label: string
  value: string
  onCopy?: () => void
}) => {
  const { colors } = useThemeContext()

  return (
    <View className="flex-row items-center py-3">
      <View className="w-8 h-8 items-center justify-center mr-3">
        <Icon size={18} color={colors.mutedText} />
      </View>
      <View className="flex-1">
        <Text
          className="text-xs font-geist"
          style={{ color: colors.mutedText }}
        >
          {label}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text
            className="text-base font-geist flex-1"
            style={{ color: colors.text }}
          >
            {value}
          </Text>
          {onCopy && (
            <TouchableOpacity onPress={onCopy} className="ml-2">
              <Copy size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

export default function TransactionDetailsPage() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { colors, actualTheme } = useThemeContext()

  const [transaction, setTransaction] = useState<WalletTransactionDTO | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadTransaction = async () => {
      try {
        setLoading(true)
        const data = await getTransactionById(Number(id))
        setTransaction(data)
      } catch (error) {
        console.error("Failed to load transaction:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadTransaction()
    }
  }, [id])

  const handleCopy = (text: string) => {
    // Copy to clipboard
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusBarStyle =
    actualTheme === "dark" ? "light-content" : "dark-content"

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!transaction) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <Text style={{ color: colors.text }}>Transaction not found</Text>
      </View>
    )
  }

  const Icon = getTransactionIcon(transaction.type)
  const {
    value: amountValue,
    isInflow,
    symbol,
  } = formatAmount(transaction.amount, transaction.type)
  const dateFormatted = formatDate(transaction.createdAt)

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
              Transaction Details
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Amount Card */}
          <View
            className="mt-6 rounded-2xl p-6 items-center"
            style={{ backgroundColor: colors.card }}
          >
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
              style={{ backgroundColor: colors.primary + "15" }}
            >
              <Icon size={32} color={colors.primary} />
            </View>

            <Text
              className="text-sm font-geist"
              style={{ color: colors.mutedText }}
            >
              {isInflow ? "Money Received" : "Money Sent"}
            </Text>

            <Text
              className="text-4xl font-groteskBold mt-2"
              style={{ color: colors.text }}
            >
              {symbol} ETB {amountValue}
            </Text>

            <View
              className="mt-4 px-4 py-2 rounded-full"
              style={{ backgroundColor: getStatusBgColor(transaction.status) }}
            >
              <Text
                className="text-sm font-medium font-geist"
                style={{ color: getStatusColor(transaction.status) }}
              >
                {transaction.status}
              </Text>
            </View>
          </View>

          {/* Transaction Details */}
          <View
            className="mt-4 rounded-2xl p-5"
            style={{ backgroundColor: colors.card }}
          >
            <Text
              className="text-lg font-geist mb-2"
              style={{ color: colors.text }}
            >
              Transaction Information
            </Text>

            {transaction.recipientName && (
              <DetailRow
                icon={User}
                label="Recipient"
                value={transaction.recipientName}
              />
            )}

            <DetailRow
              icon={Hash}
              label="Transaction ID"
              value={`#${transaction.id}`}
              onCopy={() => handleCopy(transaction.id.toString())}
            />

            <DetailRow
              icon={FileText}
              label="Reference"
              value={transaction.reference}
              onCopy={() => handleCopy(transaction.reference)}
            />

            <DetailRow
              icon={Calendar}
              label="Date"
              value={dateFormatted.full}
            />

            {transaction.description && (
              <DetailRow
                icon={FileText}
                label="Description"
                value={transaction.description}
              />
            )}

            <DetailRow
              icon={CreditCard}
              label="Wallet ID"
              value={`#${transaction.walletId}`}
            />

            {transaction.metadata && (
              <DetailRow
                icon={FileText}
                label="Additional Info"
                value={JSON.stringify(transaction.metadata)}
              />
            )}
          </View>

          {/* Balance After */}
          <View
            className="mt-4 mb-8 rounded-2xl p-5"
            style={{ backgroundColor: colors.card }}
          >
            <Text
              className="text-sm font-geist"
              style={{ color: colors.mutedText }}
            >
              Balance After Transaction
            </Text>
            <Text
              className="text-2xl font-groteskBold mt-1"
              style={{ color: colors.text }}
            >
              ETB{" "}
              {parseFloat(transaction.balanceAfter).toLocaleString("en-ET", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          {/* Copy Success Toast */}
          {copied && (
            <View className="absolute bottom-8 left-4 right-4 items-center">
              <View
                className="px-4 py-2 rounded-full flex-row items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Check size={16} color="#FFFFFF" />
                <Text className="text-white font-geist ml-2">
                  Copied to clipboard
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  )
}
