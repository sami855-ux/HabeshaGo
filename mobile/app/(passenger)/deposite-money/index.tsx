"use client"

import React, { useState, useEffect } from "react"
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
  Image,
  Linking,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import {
  Wallet,
  Shield,
  Lock,
  Banknote,
  ChevronLeft,
  Building,
} from "lucide-react-native"
import { useAppSelector } from "@/store"
import { initiateWalletTopup } from "@/service/payment.api"

// Import images
const telebirrImg = require("@/assets/images/telebirr.png")
const cbeImg = require("@/assets/images/cbebirr.jpeg")
const chapaImg = require("@/assets/images/amole.jpeg")

// --- Types ---
export type PaymentMethod = "chapa" | "telebirr" | "cbe" | "bank"
export type EthiopianBank =
  | "cbe"
  | "awash"
  | "dashen"
  | "abyssinia"
  | "nib"
  | "zemen"
  | "wegagen"
  | "bunna"
  | "boa"
  | "abay"
  | "berhan"
  | "debub"

interface BankDetails {
  id: EthiopianBank
  name: string
  code: string
  logo: string
  swiftCode: string
  accountLength: number
  color: string
}

// --- Constants ---
const presetAmounts = [50, 100, 200, 500, 1000, 5000]

const paymentMethods = [
  {
    id: "chapa",
    name: "Chapa",
    icon: chapaImg,
    description: "Digital Gateway",
    gateway: "chapa",
  },
  {
    id: "telebirr",
    name: "Telebirr",
    icon: telebirrImg,
    description: "Mobile Money",
    gateway: "telebirr",
  },
  {
    id: "cbe",
    name: "CBE Birr",
    icon: cbeImg,
    description: "Mobile Banking",
    gateway: "chapa",
  },
]

const ethiopianBanks: BankDetails[] = [
  {
    id: "cbe",
    name: "Commercial Bank of Ethiopia",
    code: "CBE",
    logo: "🏦",
    swiftCode: "CBETETAA",
    accountLength: 13,
    color: "bg-blue-100",
  },
  {
    id: "awash",
    name: "Awash Bank",
    code: "AWASH",
    logo: "🌊",
    swiftCode: "AWINETAA",
    accountLength: 13,
    color: "bg-green-100",
  },
  {
    id: "dashen",
    name: "Dashen Bank",
    code: "DASHEN",
    logo: "🏔️",
    swiftCode: "DASHETAA",
    accountLength: 13,
    color: "bg-purple-100",
  },
  {
    id: "abyssinia",
    name: "Bank of Abyssinia",
    code: "BOA",
    logo: "👑",
    swiftCode: "ABYSETAA",
    accountLength: 13,
    color: "bg-red-100",
  },
  {
    id: "nib",
    name: "Nib International Bank",
    code: "NIB",
    logo: "🌍",
    swiftCode: "NIBIETAA",
    accountLength: 13,
    color: "bg-orange-100",
  },
  {
    id: "zemen",
    name: "Zemen Bank",
    code: "ZEMEN",
    logo: "⏳",
    swiftCode: "ZEMEETAA",
    accountLength: 13,
    color: "bg-cyan-100",
  },
  {
    id: "wegagen",
    name: "Wegagen Bank",
    code: "WEGAGEN",
    logo: "🌱",
    swiftCode: "WEGAETAA",
    accountLength: 13,
    color: "bg-emerald-100",
  },
  {
    id: "bunna",
    name: "Bunna International Bank",
    code: "BUNNA",
    logo: "☕",
    swiftCode: "BUINETAA",
    accountLength: 13,
    color: "bg-amber-100",
  },
  {
    id: "abay",
    name: "Abay Bank",
    code: "ABAY",
    logo: "🌊",
    swiftCode: "ABAYETAA",
    accountLength: 13,
    color: "bg-sky-100",
  },
  {
    id: "berhan",
    name: "Berhan Bank",
    code: "BERHAN",
    logo: "💎",
    swiftCode: "BRHNETAA",
    accountLength: 13,
    color: "bg-indigo-100",
  },
  {
    id: "debub",
    name: "Debub Global Bank",
    code: "DEBUB",
    logo: "🌐",
    swiftCode: "DGBIETAA",
    accountLength: 13,
    color: "bg-lime-100",
  },
]

// --- Main Component ---
export default function TopUpPage() {
  const navigation = useNavigation()

  // Redux states
  const {
    wallet,
    loading: walletLoading,
    hasWallet,
  } = useAppSelector((state) => state.wallet)
  const { user, loading: userLoading } = useAppSelector((state) => state.user)

  const isPageLoading = walletLoading || userLoading

  // Form state (no zod)
  const [amount, setAmount] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("chapa")
  const [selectedBank, setSelectedBank] = useState<EthiopianBank | undefined>(
    undefined,
  )
  const [accountNumber, setAccountNumber] = useState<string>("")

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [selectedBankDetails, setSelectedBankDetails] =
    useState<BankDetails | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (selectedBank) {
      setSelectedBankDetails(
        ethiopianBanks.find((b) => b.id === selectedBank) || null,
      )
    } else {
      setSelectedBankDetails(null)
    }
  }, [selectedBank])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate amount
    const numAmount = parseFloat(amount)
    if (!amount) {
      newErrors.amount = "Amount is required"
    } else if (isNaN(numAmount) || numAmount < 10) {
      newErrors.amount = "Minimum amount is 10 ETB"
    }

    // Validate bank fields if bank method is selected
    if (paymentMethod === "bank") {
      if (!selectedBank) {
        newErrors.selectedBank = "Please select a bank"
      }
      if (!accountNumber || accountNumber.length < 10) {
        newErrors.accountNumber = "Valid account number is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getTransactionFee = (amt: number) => {
    const fees: Record<PaymentMethod, number> = {
      chapa: 0.01,
      telebirr: 0.01,
      cbe: 0.01,
      bank: 0.005,
    }
    return amt * (fees[paymentMethod] || 0.01)
  }

  const onSubmit = async () => {
    if (!validateForm()) return

    // Guard: wallet must exist
    if (!hasWallet || !wallet) {
      Alert.alert(
        "Wallet not found",
        "Please create a wallet before topping up.",
      )
      return
    }

    const numAmount = parseFloat(amount)

    setIsSubmitting(true)
    try {
      const selectedMethod = paymentMethods.find((m) => m.id === paymentMethod)

      const res = await initiateWalletTopup({
        amount: numAmount,
        gateway: selectedMethod?.gateway || "chapa",
        type: "WALLET_TOPUP",
        flow: "WALLET_TOPUP",
      })

      if (res.success && res.paymentUrl) {
        // Show alert before redirecting
        Alert.alert(
          "Redirecting to Payment",
          `Processing ETB ${numAmount.toLocaleString()} top-up\n\nYou will be redirected to complete your payment.`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => setIsSubmitting(false),
            },
            {
              text: "Continue",
              onPress: async () => {
                try {
                  // Check if URL is valid
                  const canOpen = await Linking.canOpenURL(res.paymentUrl)

                  if (canOpen) {
                    // Open URL in browser
                    await Linking.openURL(res.paymentUrl)
                  } else {
                    Alert.alert(
                      "Error",
                      "Cannot open payment link. Please check your internet connection.",
                    )
                  }
                } catch (error) {
                  console.error("Failed to open URL:", error)
                  Alert.alert(
                    "Error",
                    "Failed to open payment page. Please try again.",
                  )
                } finally {
                  setIsSubmitting(false)
                }
              },
            },
          ],
          { cancelable: false },
        )
      } else {
        Alert.alert(
          "Failed to initiate payment",
          res.message || "Please try again.",
        )
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Payment error:", error)
      Alert.alert("An error occurred", "Please try again later.")
      setIsSubmitting(false)
    }
  }

  const currentAmount = selectedAmount || (amount ? parseFloat(amount) : 0)
  const fee = getTransactionFee(currentAmount)
  const total = currentAmount + fee
  const newBalance = (wallet?.balance || 0) + currentAmount

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#f3f4f6" }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 60 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 32,
              gap: 16,
            }}
          >
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeft size={30} color="#4b5563" />
            </TouchableOpacity>
            <View>
              {isPageLoading ? (
                <View style={{ gap: 8 }}>
                  <View
                    style={{
                      width: 200,
                      height: 32,
                      backgroundColor: "#e5e7eb",
                      borderRadius: 8,
                    }}
                  />
                  <View
                    style={{
                      width: 250,
                      height: 16,
                      backgroundColor: "#e5e7eb",
                      borderRadius: 8,
                    }}
                  />
                </View>
              ) : (
                <>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#111827",
                      marginBottom: 4,
                    }}
                  >
                    Top Up, {user?.name?.split(" ")[0] || "there"} 👋
                  </Text>
                  <Text style={{ color: "#6b7280" }}>
                    Add funds securely using your preferred payment method
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={{ gap: 32 }}>
            {/* Main Form Card */}
            <View
              style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <Wallet color="#2563eb" size={20} />
                <Text
                  style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}
                >
                  Payment Details
                </Text>
              </View>

              {/* User Info */}
              {!isPageLoading && user && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    padding: 16,
                    backgroundColor: "#eff6ff",
                    borderRadius: 12,
                    marginBottom: 24,
                    borderWidth: 1,
                    borderColor: "#dbeafe",
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#2563eb",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 14,
                      }}
                    >
                      {user.name?.charAt(0) || "U"}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", color: "#111827" }}>
                      {user.name}
                    </Text>
                    <Text style={{ color: "#6b7280", fontSize: 12 }}>
                      {user.email} • {user.phone}
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: "#dcfce7",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#bbf7d0",
                    }}
                  >
                    <Text style={{ color: "#059669", fontSize: 12 }}>
                      Verified
                    </Text>
                  </View>
                </View>
              )}

              {/* Amount Selection */}
              <View style={{ gap: 16, marginBottom: 24 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}
                >
                  Select Amount
                </Text>

                {/* Preset Amounts */}
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}
                >
                  {presetAmounts.map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      onPress={() => {
                        setSelectedAmount(preset)
                        setAmount(preset.toString())
                      }}
                      style={{
                        flex: 1,
                        minWidth: "30%",
                        padding: 16,
                        borderRadius: 12,
                        alignItems: "center",
                        backgroundColor:
                          selectedAmount === preset ? "#2563eb" : "#f3f4f6",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: selectedAmount === preset ? "#fff" : "#111827",
                        }}
                      >
                        {preset >= 1000 ? `${preset / 1000}K` : preset} ETB
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          color:
                            selectedAmount === preset ? "#bfdbfe" : "#6b7280",
                        }}
                      >
                        +{(preset * 0.01).toFixed(2)} fee
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Custom Amount */}
                <View>
                  <Text
                    style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}
                  >
                    Or enter custom amount (min 10 ETB)
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#d1d5db",
                      borderRadius: 12,
                    }}
                  >
                    <View
                      style={{ paddingHorizontal: 16, paddingVertical: 12 }}
                    >
                      <Text style={{ fontWeight: "500", color: "#6b7280" }}>
                        ETB
                      </Text>
                    </View>
                    <TextInput
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        paddingRight: 16,
                        fontSize: 18,
                      }}
                      placeholder="Enter amount"
                      keyboardType="numeric"
                      value={amount}
                      onChangeText={(text) => {
                        setAmount(text)
                        setSelectedAmount(text ? parseFloat(text) : null)
                      }}
                    />
                  </View>
                  {errors.amount && (
                    <Text
                      style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}
                    >
                      {errors.amount}
                    </Text>
                  )}
                </View>
              </View>

              {/* Payment Methods */}
              <View style={{ gap: 16, marginBottom: 24 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}
                >
                  Payment Method
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}
                >
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      onPress={() =>
                        setPaymentMethod(method.id as PaymentMethod)
                      }
                      style={{
                        flex: 1,
                        minWidth: "30%",
                        padding: 16,
                        borderRadius: 12,
                        alignItems: "center",
                        borderWidth: 2,
                        borderColor:
                          paymentMethod === method.id ? "#2563eb" : "#e5e7eb",
                        backgroundColor:
                          paymentMethod === method.id ? "#eff6ff" : "#fff",
                      }}
                    >
                      <Image
                        source={method.icon}
                        style={{ width: 48, height: 48, marginBottom: 8 }}
                      />
                      <Text style={{ fontWeight: "600", color: "#111827" }}>
                        {method.name}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}
                      >
                        {method.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Bank Selection (conditional) */}
              {paymentMethod === "bank" && (
                <View style={{ gap: 16, marginBottom: 24 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Building color="#9333ea" size={20} />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      Select Your Bank
                    </Text>
                  </View>

                  {/* Bank Picker - simplified dropdown */}
                  <View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        marginBottom: 8,
                      }}
                    >
                      Choose Bank
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ flexGrow: 0 }}
                    >
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        {ethiopianBanks.map((bank) => (
                          <TouchableOpacity
                            key={bank.id}
                            onPress={() => setSelectedBank(bank.id)}
                            style={{
                              padding: 12,
                              borderRadius: 12,
                              borderWidth: 2,
                              borderColor:
                                selectedBank === bank.id
                                  ? "#9333ea"
                                  : "#e5e7eb",
                              backgroundColor:
                                selectedBank === bank.id ? "#f3e8ff" : "#fff",
                              minWidth: 140,
                            }}
                          >
                            <Text style={{ fontSize: 24 }}>{bank.logo}</Text>
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: "500",
                                marginTop: 4,
                              }}
                            >
                              {bank.name}
                            </Text>
                            <Text style={{ fontSize: 10, color: "#6b7280" }}>
                              SWIFT: {bank.swiftCode}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                    {errors.selectedBank && (
                      <Text
                        style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}
                      >
                        {errors.selectedBank}
                      </Text>
                    )}
                  </View>

                  {/* Account Number */}
                  <View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        marginBottom: 8,
                      }}
                    >
                      Account Number
                    </Text>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: "#d1d5db",
                        borderRadius: 12,
                        padding: 12,
                      }}
                      placeholder="Enter account number"
                      keyboardType="numeric"
                      value={accountNumber}
                      onChangeText={setAccountNumber}
                    />
                    {selectedBankDetails && (
                      <Text
                        style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}
                      >
                        Enter your {selectedBankDetails.name} account number
                      </Text>
                    )}
                    {errors.accountNumber && (
                      <Text
                        style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}
                      >
                        {errors.accountNumber}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* No Wallet Warning */}
              {!isPageLoading && !hasWallet && (
                <View
                  style={{
                    padding: 16,
                    backgroundColor: "#fef2f2",
                    borderRadius: 12,
                    marginBottom: 24,
                    borderWidth: 1,
                    borderColor: "#fecaca",
                  }}
                >
                  <Text style={{ color: "#dc2626", fontSize: 14 }}>
                    ⚠️ You don't have a wallet yet. Please create one before
                    topping up.
                  </Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={onSubmit}
                disabled={
                  isSubmitting || !currentAmount || isPageLoading || !hasWallet
                }
                style={{
                  padding: 20,
                  borderRadius: 12,
                  alignItems: "center",
                  backgroundColor:
                    !isSubmitting &&
                    currentAmount &&
                    !isPageLoading &&
                    hasWallet
                      ? "#2563eb"
                      : "#9ca3af",
                }}
              >
                {isSubmitting ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <ActivityIndicator color="#fff" />
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                      Processing...
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Lock color="#fff" size={20} />
                    <Text
                      style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}
                    >
                      Proceed to Payment
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Order Summary Card */}
            <View
              style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}
                >
                  Order Summary
                </Text>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    backgroundColor: "#dbeafe",
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: "#1e40af", fontSize: 12 }}>Live</Text>
                </View>
              </View>

              {/* Balance */}
              <View
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: "#6b7280", fontSize: 14 }}>
                    Current Balance
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      backgroundColor: "#e5e7eb",
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 10 }}>
                      {hasWallet ? "Active" : "No Wallet"}
                    </Text>
                  </View>
                </View>
                <Text
                  style={{ fontSize: 24, fontWeight: "bold", color: "#111827" }}
                >
                  {hasWallet
                    ? `${(wallet?.balance || 0).toLocaleString()} ETB`
                    : "— ETB"}
                </Text>
                {hasWallet && (
                  <Text
                    style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}
                  >
                    Points: {(wallet?.points || 0).toLocaleString()} pts
                  </Text>
                )}
              </View>

              {/* Details */}
              <View style={{ gap: 12, marginBottom: 20 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#6b7280", fontSize: 14 }}>
                    Top-up Amount
                  </Text>
                  <Text style={{ fontWeight: "bold", color: "#2563eb" }}>
                    {currentAmount
                      ? `${currentAmount.toLocaleString()} ETB`
                      : "0 ETB"}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#6b7280", fontSize: 14 }}>
                    Transaction Fee
                  </Text>
                  <Text style={{ color: "#374151", fontSize: 14 }}>
                    {currentAmount ? `${fee.toFixed(2)} ETB` : "0 ETB"}
                  </Text>
                </View>
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#e5e7eb",
                    marginVertical: 4,
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontWeight: "600", color: "#111827" }}>
                    Total to Pay
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#059669",
                    }}
                  >
                    {currentAmount ? `${total.toFixed(2)} ETB` : "0 ETB"}
                  </Text>
                </View>

                {/* New Balance Preview */}
                {currentAmount > 0 && hasWallet && (
                  <View
                    style={{
                      padding: 12,
                      backgroundColor: "#dcfce7",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#bbf7d0",
                      marginTop: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ color: "#059669", fontWeight: "500" }}>
                        New Balance
                      </Text>
                      <Text style={{ fontWeight: "bold", color: "#059669" }}>
                        {newBalance.toLocaleString()} ETB
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View
                style={{
                  height: 1,
                  backgroundColor: "#e5e7eb",
                  marginVertical: 20,
                }}
              />

              {/* Payment Details */}
              <View style={{ gap: 12 }}>
                <Text
                  style={{ fontWeight: "600", color: "#374151", fontSize: 14 }}
                >
                  Payment Details
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#6b7280", fontSize: 14 }}>Method</Text>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderWidth: 1,
                      borderColor: "#e5e7eb",
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontWeight: "500" }}>
                      {paymentMethods.find((m) => m.id === paymentMethod)?.name}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#6b7280", fontSize: 14 }}>
                    Processing Time
                  </Text>
                  <Text style={{ fontWeight: "500" }}>Instant</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#6b7280", fontSize: 14 }}>
                    Account
                  </Text>
                  <Text style={{ fontWeight: "500" }}>{user?.name || "—"}</Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View
              style={{
                alignItems: "center",
                gap: 8,
                marginTop: 16,
                marginBottom: 32,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Shield color="#22c55e" size={16} />
                <Text style={{ color: "#6b7280", fontSize: 12 }}>
                  Secure payment powered by
                </Text>
                <Text
                  style={{ fontWeight: "bold", color: "#1e40af", fontSize: 12 }}
                >
                  CHAPA
                </Text>
                <Text style={{ color: "#6b7280", fontSize: 12 }}>
                  • Ethiopia's Trusted Payment Gateway
                </Text>
              </View>
              <Text style={{ color: "#9ca3af", fontSize: 10 }}>
                By proceeding, you agree to our Terms of Service and Privacy
                Policy.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
