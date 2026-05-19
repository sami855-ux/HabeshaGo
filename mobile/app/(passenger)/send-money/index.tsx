import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { fetchUserWallet } from "@/store/slices/walletSlice"
import { useQueryClient } from "@tanstack/react-query"
import { useAppDispatch, useAppSelector } from "@/store"
import { transferFunds } from "@/service/transaction.api"
import { ChevronLeft } from "lucide-react-native"
import PhoneNumberStep from "@/components/passenger/PhoneNumberStep"
import PinStep from "@/components/passenger/PinStep"
import SuccessStep from "@/components/passenger/SuccessStep"

// --- Types ---
interface User {
  id: string
  name: string
  phone: string
  avatar?: string
  isVerified: boolean
}

interface Transaction {
  id: string
  amount: number
  fee: number
  total: number
  receiver: User
  timestamp: Date
  reference: string
}

// --- Main Component ---
export default function SendMoneyScreen() {
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { wallet, loading: walletLoading } = useAppSelector(
    (state) => state.wallet,
  )

  const [step, setStep] = useState<"phone" | "amount" | "pin" | "success">(
    "phone",
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiver, setReceiver] = useState<User | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [recentContacts, setRecentContacts] = useState<User[]>([
    { id: "1", name: "Abebe Kebede", phone: "+251912345678", isVerified: true },
    {
      id: "2",
      name: "Meron Tesfaye",
      phone: "+251923456789",
      isVerified: true,
    },
    {
      id: "3",
      name: "Dawit Solomon",
      phone: "+251934567890",
      isVerified: false,
    },
    {
      id: "4",
      name: "Selamawit Alemu",
      phone: "+251945678901",
      isVerified: true,
    },
  ])

  const walletBalance = wallet && !walletLoading ? wallet.balance : 0
  const transactionFee = amount * 0.01

  const handleAmountSubmit = (submittedAmount: number) => {
    setAmount(submittedAmount)
    setStep("pin")
  }

  const handlePinSubmit = async (pin: string) => {
    if (!receiver) return

    try {
      setIsProcessing(true)

      const res = await transferFunds(
        receiver.id,
        amount,
        pin,
        `Transfer to ${receiver.name}`,
      )

      if (!res.success || !res.data) {
        throw new Error(res.message || "Transfer failed")
      }

      Alert.alert(
        "Success",
        `You have sent ETB ${amount.toLocaleString()} to ${receiver.name}.`,
      )

      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] })

      setTransaction({
        id: res.data.id,
        amount: res.data.amount,
        fee: res.data.fee,
        total: res.data.amount + transactionFee,
        receiver: receiver,
        timestamp: new Date(res.data.createdAt),
        reference: res.data.reference,
      })

      setStep("success")
      dispatch(fetchUserWallet())
    } catch (error: any) {
      console.error("Transfer failed:", error)
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Transaction failed",
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSelectRecentContact = (contact: User) => {
    setReceiver(contact)
    setStep("amount")
  }

  const handleStartNewTransfer = () => {
    setReceiver(null)
    setAmount(0)
    setTransaction(null)
    setStep("phone")
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#f3f4f6" }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 60,
            paddingBottom: 24,
          }}
        >
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginBottom: 16 }}
            >
              <ChevronLeft size={14} />
            </TouchableOpacity>
            <Text
              style={{ fontSize: 32, fontWeight: "bold", color: "#111827" }}
            >
              Send Money
            </Text>
            <Text style={{ color: "#6b7280", marginTop: 4 }}>
              Transfer funds securely
            </Text>
          </View>

          {/* Progress Steps */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 32,
            }}
          >
            {["phone", "amount", "pin", "success"].map((s, idx) => {
              const isActive = step === s
              const isCompleted =
                ["phone", "amount", "pin", "success"].indexOf(step) > idx
              return (
                <View key={s} style={{ flex: 1, alignItems: "center" }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isActive
                        ? "#059669"
                        : isCompleted
                          ? "#a7f3d0"
                          : "#d1d5db",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: isActive ? "#fff" : "#374151",
                      }}
                    >
                      {idx + 1}
                    </Text>
                  </View>
                  <Text
                    style={{ fontSize: 10, marginTop: 4, color: "#6b7280" }}
                  >
                    {s}
                  </Text>
                </View>
              )
            })}
          </View>

          {/* Step Content */}
          {step === "phone" && (
            <PhoneNumberStep
              recentContacts={recentContacts}
              onSelectContact={handleSelectRecentContact}
            />
          )}
          {step === "amount" && receiver && (
            <AmountStep
              receiver={receiver}
              balance={walletBalance}
              onSubmit={handleAmountSubmit}
              onBack={() => setStep("phone")}
            />
          )}
          {step === "pin" && receiver && (
            <PinStep
              receiver={receiver}
              amount={amount}
              fee={transactionFee}
              onSubmit={handlePinSubmit}
              onBack={() => setStep("amount")}
              isProcessing={isProcessing}
            />
          )}
          {step === "success" && transaction && (
            <SuccessStep
              transaction={transaction}
              onNewTransfer={handleStartNewTransfer}
            />
          )}

          {/* Sidebar Info (simplified for mobile) */}
          <View style={{ marginTop: 24, gap: 16 }}>
            <View
              style={{
                backgroundColor: "#059669",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <Text
                style={{ color: "#fff", fontWeight: "bold", marginBottom: 8 }}
              >
                Your Balance
              </Text>
              <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>
                ETB {walletBalance.toLocaleString()}
              </Text>
            </View>
            <View
              style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16 }}
            >
              <Text style={{ fontWeight: "bold", marginBottom: 12 }}>
                Recent Transfers
              </Text>
              {[
                { name: "Mikael H.", amount: 1500 },
                { name: "Sara T.", amount: 2500 },
                { name: "Daniel K.", amount: 3500 },
              ].map((tx, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 8,
                  }}
                >
                  <Text>{tx.name}</Text>
                  <Text style={{ fontWeight: "bold" }}>
                    ETB {tx.amount.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// --- Sub-components ---

// function PhoneNumberStep({
//   recentContacts,
//   onSelectContact,
// }: {
//   recentContacts: User[]
//   onSelectContact: (contact: User) => void
// }) {
//   const [phone, setPhone] = useState("")

//   return (
//     <View style={{ gap: 20 }}>
//       <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 20 }}>
//         <Text style={{ fontWeight: "500", marginBottom: 8 }}>
//           Enter Phone Number
//         </Text>
//         <TextInput
//           style={{
//             borderWidth: 1,
//             borderColor: "#d1d5db",
//             borderRadius: 8,
//             padding: 12,
//             fontSize: 16,
//           }}
//           placeholder="+251 91 234 5678"
//           keyboardType="phone-pad"
//           value={phone}
//           onChangeText={setPhone}
//         />
//         <TouchableOpacity
//           style={{
//             backgroundColor: "#059669",
//             padding: 16,
//             borderRadius: 8,
//             marginTop: 16,
//           }}
//         >
//           <Text
//             style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}
//           >
//             Search
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   )
// }

function AmountStep({
  receiver,
  balance,
  onSubmit,
  onBack,
}: {
  receiver: User
  balance: number
  onSubmit: (amount: number) => void
  onBack: () => void
}) {
  const [amount, setAmount] = useState("")
  const numericAmount = parseFloat(amount) || 0
  const fee = numericAmount * 0.01
  const total = numericAmount + fee
  const quickAmounts = [100, 500, 1000, 2000, 5000]

  return (
    <View style={{ gap: 20 }}>
      <TouchableOpacity onPress={onBack}>
        <Text style={{ color: "#059669" }}>← Back</Text>
      </TouchableOpacity>

      <View
        style={{
          backgroundColor: "#ecfdf5",
          borderRadius: 12,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#a7f3d0",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#047857", fontWeight: "bold", fontSize: 18 }}>
            {receiver.name.charAt(0)}
          </Text>
        </View>
        <View style={{ marginLeft: 12 }}>
          <Text style={{ fontWeight: "600" }}>{receiver.name}</Text>
          <Text style={{ color: "#6b7280", fontSize: 12 }}>
            {receiver.phone}
          </Text>
        </View>
      </View>

      <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 20 }}>
        <Text style={{ fontWeight: "500", marginBottom: 8 }}>Amount (ETB)</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 8,
            padding: 12,
            fontSize: 24,
            fontWeight: "bold",
          }}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginTop: 16,
          }}
        >
          {quickAmounts.map((amt) => (
            <TouchableOpacity
              key={amt}
              onPress={() => setAmount(amt.toString())}
              style={{
                backgroundColor: "#f3f4f6",
                padding: 12,
                borderRadius: 8,
                width: "30%",
                marginBottom: 8,
                alignItems: "center",
              }}
            >
              <Text>ETB {amt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {numericAmount > 0 && (
          <View
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: "#e5e7eb",
              gap: 8,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ color: "#6b7280" }}>Amount</Text>
              <Text>ETB {numericAmount.toLocaleString()}</Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ color: "#6b7280" }}>Fee (1%)</Text>
              <Text style={{ color: "#d97706" }}>
                ETB {fee.toLocaleString()}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: "#e5e7eb",
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Total</Text>
              <Text style={{ fontWeight: "bold", color: "#059669" }}>
                ETB {total.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={() => onSubmit(numericAmount)}
          disabled={numericAmount <= 0 || numericAmount > balance}
          style={{
            backgroundColor:
              numericAmount > 0 && numericAmount <= balance
                ? "#059669"
                : "#9ca3af",
            padding: 16,
            borderRadius: 8,
            marginTop: 20,
          }}
        >
          <Text
            style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
