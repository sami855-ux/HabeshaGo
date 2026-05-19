import React from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
} from "react-native"
import {
  CheckCircle,
  Send,
  Home,
  Share2,
  Download,
  Copy,
  Clock,
} from "lucide-react-native"
import * as Clipboard from "expo-clipboard"

interface Transaction {
  id: string
  amount: number
  fee: number
  total: number
  receiver: {
    id: string
    name: string
    phone: string
    isVerified: boolean
  }
  timestamp: Date
  reference: string
}

interface SuccessStepProps {
  transaction: Transaction
  onNewTransfer: () => void
}

export default function SuccessStep({
  transaction,
  onNewTransfer,
}: SuccessStepProps) {
  // Safely format numbers with fallbacks
  const formatAmount = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return "0.00"
    }
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "Just now"
    try {
      const d = typeof date === "string" ? new Date(date) : date
      if (isNaN(d.getTime())) return "Just now"
      return d.toLocaleString()
    } catch {
      return "Just now"
    }
  }

  const handleCopyReference = async () => {
    if (transaction?.reference) {
      await Clipboard.setStringAsync(transaction.reference)
      Alert.alert("Copied!", "Reference code copied to clipboard")
    }
  }

  const handleShare = async () => {
    if (!transaction) return
    try {
      await Share.share({
        message: `💰 Transfer Successful!\n\nSent ETB ${formatAmount(transaction.amount)} to ${transaction.receiver.name}\nReference: ${transaction.reference}\nDate: ${formatDate(transaction.timestamp)}`,
        title: "Transfer Receipt",
      })
    } catch (error) {
      console.log("Share error:", error)
    }
  }

  const handleDownloadReceipt = () => {
    if (!transaction) return

    const receipt = `
╔════════════════════════════════════════╗
║         MONEY TRANSFER RECEIPT         ║
╠════════════════════════════════════════╣
║                                        ║
║  ✓ TRANSFER SUCCESSFUL                 ║
║                                        ║
║  Transaction ID: ${transaction.id || "N/A"}    ║
║  Reference: ${transaction.reference || "N/A"}      ║
║  Date: ${formatDate(transaction.timestamp)}     ║
║                                        ║
║  ──────────────────────────────────    ║
║                                        ║
║  Sent to: ${transaction.receiver?.name || "N/A"}        ║
║  Phone: ${transaction.receiver?.phone || "N/A"}      ║
║                                        ║
║  ──────────────────────────────────    ║
║                                        ║
║  Amount: ETB ${formatAmount(transaction.amount)}       ║
║  Fee:    ETB ${formatAmount(transaction.fee)}        ║
║  Total:  ETB ${formatAmount(transaction.total)}       ║
║                                        ║
║  ──────────────────────────────────    ║
║                                        ║
║  Status: ✅ COMPLETED                   ║
║                                        ║
╚════════════════════════════════════════╝
    `

    // For iOS/Android, show receipt in alert or implement file download
    Alert.alert("Receipt Generated", "Receipt content copied to clipboard", [
      {
        text: "Copy Receipt",
        onPress: async () => {
          await Clipboard.setStringAsync(receipt)
          Alert.alert("Copied!", "Receipt copied to clipboard")
        },
      },
      { text: "OK" },
    ])
  }

  // If transaction is missing, show error state
  if (!transaction || !transaction.receiver) {
    return (
      <View style={{ alignItems: "center", gap: 24, padding: 20 }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: "#fee2e2",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 48 }}>⚠️</Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827" }}>
          Something went wrong
        </Text>
        <Text style={{ color: "#6b7280", textAlign: "center" }}>
          Unable to load transaction details. Please check your transaction
          history.
        </Text>
        <TouchableOpacity
          onPress={onNewTransfer}
          style={{
            backgroundColor: "#059669",
            padding: 16,
            borderRadius: 12,
            width: "100%",
            marginTop: 20,
          }}
        >
          <Text
            style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ alignItems: "center", gap: 24, paddingVertical: 20 }}>
      {/* Success Animation Icon */}
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: "#d1fae5",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#059669",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <CheckCircle size={56} color="#059669" />
      </View>

      {/* Success Message */}
      <View style={{ alignItems: "center", gap: 8 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827" }}>
          Transfer Successful!
        </Text>
        <Text style={{ color: "#6b7280", textAlign: "center", fontSize: 16 }}>
          {formatAmount(transaction.amount)} ETB sent to{" "}
          {transaction.receiver.name}
        </Text>
      </View>

      {/* Transaction Details Card */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 20,
          width: "100%",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        <Text
          style={{
            color: "#6b7280",
            textAlign: "center",
            marginBottom: 16,
            fontSize: 14,
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Transaction Details
        </Text>

        <View style={{ gap: 12 }}>
          {/* Receiver Info */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#f3f4f6",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#d1fae5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#059669" }}
              >
                {transaction.receiver.name?.charAt(0) || "?"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", color: "#111827" }}>
                {transaction.receiver.name}
              </Text>
              <Text style={{ fontSize: 12, color: "#6b7280" }}>
                {transaction.receiver.phone}
              </Text>
            </View>
            {transaction.receiver.isVerified && (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  backgroundColor: "#d1fae5",
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontSize: 10, color: "#059669" }}>Verified</Text>
              </View>
            )}
          </View>

          {/* Amount Details */}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: "#6b7280" }}>Amount</Text>
            <Text style={{ fontWeight: "600", color: "#111827" }}>
              ETB {formatAmount(transaction.amount)}
            </Text>
          </View>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: "#6b7280" }}>Transaction Fee (1%)</Text>
            <Text style={{ color: "#d97706" }}>
              ETB {formatAmount(transaction.fee)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: "#e5e7eb",
            }}
          >
            <Text
              style={{ fontWeight: "bold", color: "#111827", fontSize: 16 }}
            >
              Total Deducted
            </Text>
            <Text
              style={{ fontWeight: "bold", color: "#059669", fontSize: 18 }}
            >
              ETB {formatAmount(transaction.total)}
            </Text>
          </View>

          {/* Reference & Time */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingTop: 8,
              marginTop: 4,
              borderTopWidth: 1,
              borderTopColor: "#f3f4f6",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Clock size={12} color="#9ca3af" />
              <Text style={{ fontSize: 10, color: "#9ca3af" }}>
                {formatDate(transaction.timestamp)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCopyReference}
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Text style={{ fontSize: 10, color: "#6b7280" }}>
                Ref: {transaction.reference?.slice(0, 12)}...
              </Text>
              <Copy size={12} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Estimated Arrival */}
      <View
        style={{
          backgroundColor: "#eff6ff",
          borderRadius: 12,
          padding: 12,
          width: "100%",
          borderWidth: 1,
          borderColor: "#dbeafe",
        }}
      >
        <Text style={{ color: "#3b82f6", textAlign: "center", fontSize: 13 }}>
          ✨ Funds will arrive instantly. The recipient has been notified.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
        <TouchableOpacity
          onPress={handleShare}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <Share2 size={20} color="#6b7280" />
          <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            Share
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDownloadReceipt}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <Download size={20} color="#6b7280" />
          <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            Receipt
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNewTransfer}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <Home size={20} color="#6b7280" />
          <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            Home
          </Text>
        </TouchableOpacity>
      </View>

      {/* Send Money Again Button */}
      <TouchableOpacity
        onPress={onNewTransfer}
        style={{
          backgroundColor: "#059669",
          padding: 18,
          borderRadius: 12,
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          shadowColor: "#059669",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Send size={20} color="#fff" />
        <Text
          style={{
            color: "#fff",
            textAlign: "center",
            fontWeight: "600",
            fontSize: 16,
          }}
        >
          Send Money Again
        </Text>
      </TouchableOpacity>

      {/* Support Link */}
      <TouchableOpacity>
        <Text style={{ fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
          Need help? Contact Support
        </Text>
      </TouchableOpacity>
    </View>
  )
}
