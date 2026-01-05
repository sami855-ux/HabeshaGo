import { useThemeContext } from "@/context/ThemeContext"
import { useRouter } from "expo-router"
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Lock,
  Wallet,
  X,
} from "lucide-react-native"
import React, { useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

export default function PaymentPage() {
  const router = useRouter()
  const { colors, actualTheme } = useThemeContext()

  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [walletPin, setWalletPin] = useState("")
  const [addTravelProtection, setAddTravelProtection] = useState(true)
  const [addCancellationProtection, setAddCancellationProtection] =
    useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  // Calculate booking details
  const calculateBookingDetails = () => {
    const baseFare = 1299
    const taxes = 259
    const convenienceFee = 49
    const discount = -200
    const travelProtection = addTravelProtection ? 99 : 0
    const cancellationProtection = addCancellationProtection ? 149 : 0

    const total =
      baseFare +
      taxes +
      convenienceFee +
      discount +
      travelProtection +
      cancellationProtection

    return {
      from: "Addis Ababa",
      to: "Addama",
      date: "Dec 15, 2024",
      time: "08:30 AM",
      duration: "2h 30m",
      bus: "Express Travels ET-7890",
      seats: ["A1", "A2"],
      operator: "Express Travels",
      baseFare,
      taxes,
      convenienceFee,
      discount,
      travelProtection,
      cancellationProtection,
      total,
    }
  }

  const bookingDetails = calculateBookingDetails()

  const handleWalletPayment = () => {
    if (!termsAccepted) {
      Alert.alert(
        "Terms Required",
        "Please accept the Terms of Service to continue"
      )
      return
    }

    if (walletPin.length !== 6) {
      Alert.alert("Invalid PIN", "Please enter your 6-digit wallet PIN")
      return
    }

    setProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false)
      setSuccess(true)
      //   router.push("/payment/success")
    }, 2000)
  }

  const statusBarStyle =
    actualTheme === "dark" ? "light-content" : "dark-content"

  const PinDigit = ({ digit, index }: { digit?: string; index: number }) => (
    <View
      style={{
        width: 50,
        height: 50,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: digit ? colors.primary : colors.border,
        backgroundColor: colors.card,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 2,
      }}
    >
      {digit && (
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: colors.primary,
          }}
        />
      )}
    </View>
  )

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={statusBarStyle}
      />

      <ScrollView
        className="flex-1 pt-10"
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        <View className="p-4 gap-4 pb-20">
          {/* Header with Timer */}
          <View className="flex-row justify-between items-center ">
            <View>
              <Text
                className="text-2xl font-groteskBold"
                style={{ color: colors.text }}
              >
                Complete Payment
              </Text>
              <Text
                className="text-sm mt-1 font-geist"
                style={{ color: colors.mutedText }}
              >
                Secure wallet payment • Travel protection included
              </Text>
            </View>
          </View>

          <View className="flex-col lg:flex-row gap-4">
            {/* Left Column - Payment Details */}
            <View className="flex-1 space-y-4">
              {/* Wallet Payment Card */}
              <View
                className="rounded-2xl"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <View className="p-6">
                  {/* Modern Card Header with subtle gradient effect */}
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center gap-3">
                      <View
                        className="p-3 rounded-xl"
                        style={{
                          backgroundColor: colors.primary + "15",
                          transform: [{ rotate: "-5deg" }],
                        }}
                      >
                        <Wallet size={24} color={colors.primary} />
                      </View>
                      <View>
                        <Text
                          className="text-xl font-geist font-bold"
                          style={{ color: colors.text }}
                        >
                          Wallet Payment
                        </Text>
                        <Text
                          className="text-xs font-geist mt-1"
                          style={{ color: colors.mutedText }}
                        >
                          Secure transaction
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Instruction with modern typography */}
                  <Text
                    className="text-base mb-8 font-geist leading-relaxed"
                    style={{ color: colors.mutedText }}
                  >
                    Enter your{" "}
                    <Text
                      style={{
                        color: colors.primary,
                        fontFamily: "Geist-Bold",
                      }}
                    >
                      secure PIN
                    </Text>{" "}
                    to complete payment
                  </Text>

                  {/* PIN Input Section */}
                  <View className="space-y-6">
                    <View>
                      <View className="flex-row justify-between items-center mb-4">
                        <Text
                          className="text-base font-geist font-semibold"
                          style={{ color: colors.text }}
                        >
                          Wallet PIN
                        </Text>
                        <Text
                          className="text-sm font-geist"
                          style={{ color: colors.mutedText }}
                        >
                          {walletPin.length}/6
                        </Text>
                      </View>

                      {/* Modern PIN Digits with subtle animation */}
                      <View className="flex-row justify-center gap-3 mb-4">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <View key={index}>
                            <View
                              className="w-14 h-16 rounded-2xl items-center justify-center border-2"
                              style={{
                                backgroundColor: colors.background,
                                borderColor: walletPin[index]
                                  ? colors.primary
                                  : colors.border + "20",
                                shadowColor: walletPin[index]
                                  ? colors.primary
                                  : colors.border,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: walletPin[index] ? 0.2 : 0.1,
                                shadowRadius: 4,
                                elevation: walletPin[index] ? 3 : 1,
                              }}
                            >
                              {walletPin[index] ? (
                                <View
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: colors.primary }}
                                />
                              ) : (
                                <Text
                                  className="text-xl font-geist font-bold"
                                  style={{ color: colors.mutedText + "10" }}
                                >
                                  •
                                </Text>
                              )}
                            </View>
                            {index === 2 && (
                              <View className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                                <Text
                                  className="text-xs text-center font-geist"
                                  style={{ color: colors.mutedText + "60" }}
                                >
                                  —
                                </Text>
                              </View>
                            )}
                          </View>
                        ))}
                      </View>

                      {/* Hidden TextInput - Enhanced with better accessibility */}
                      <TextInput
                        className="absolute opacity-0 w-full h-16"
                        value={walletPin}
                        onChangeText={(text) => {
                          const numericText = text.replace(/[^0-9]/g, "")
                          if (numericText.length <= 6) setWalletPin(numericText)
                        }}
                        keyboardType="number-pad"
                        maxLength={6}
                        secureTextEntry
                        autoFocus
                        autoComplete="off"
                        autoCorrect={false}
                      />

                      <Text
                        className="text-sm text-center mt-6 font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        Enter the 6-digit PIN you set for your wallet
                      </Text>
                    </View>

                    {/* Modern Security Banner */}
                    <View
                      className="flex-row items-center gap-4 p-4 rounded-2xl border my-2"
                      style={{
                        backgroundColor: "#10B98108",
                        borderColor: "#10B98130",
                        borderWidth: 1,
                      }}
                    >
                      <View
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: "#10B98115" }}
                      >
                        <Lock size={18} color="#10B981" />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-sm font-geist font-semibold mb-1"
                          style={{ color: "#10B981" }}
                        >
                          Bank-level encryption
                        </Text>
                        <Text
                          className="text-xs font-geist"
                          style={{ color: "#10B981" + "CC" }}
                        >
                          Your PIN is end-to-end encrypted for maximum security
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Modern Forgot PIN Button */}
                  <TouchableOpacity
                    className="mt-8 p-4 rounded-xl active:opacity-80"
                    style={{ backgroundColor: colors.primary + "0A" }}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-center gap-2">
                      <Text
                        className="text-sm font-geist font-semibold text-center"
                        style={{ color: colors.primary }}
                      >
                        Forgot wallet PIN?
                      </Text>
                      <ArrowRight size={14} color={colors.primary} />
                    </View>
                    <Text
                      className="text-xs text-center mt-1 font-geist"
                      style={{ color: colors.primary + "99" }}
                    >
                      Reset it securely here
                    </Text>
                  </TouchableOpacity>

                  {/* Decorative Elements */}
                  <View
                    className="absolute top-0 right-0 w-32 h-32 rounded-full"
                    style={{
                      backgroundColor: colors.primary + "05",
                      transform: [{ translateX: 60 }, { translateY: -60 }],
                    }}
                  />
                  <View
                    className="absolute bottom-10 left-0 w-24 h-24 rounded-full"
                    style={{
                      backgroundColor: colors.primary + "03",
                      transform: [{ translateX: -40 }, { translateY: 20 }],
                    }}
                  />
                </View>
              </View>

              {/* Security Guarantee Card */}
              <View
                className="rounded-2xl  mt-2"
                style={{
                  backgroundColor: colors.card,
                }}
              >
                <View className="p-5">
                  <View className="flex-row items-center gap-4">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary + "15" }}
                    >
                      <BadgeCheck size={24} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="font-semibold text-base font-geist"
                        style={{ color: colors.text }}
                      >
                        Payment Security Guarantee
                      </Text>
                      <Text
                        className="text-sm mt-1 font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        Your payment is protected with bank-level encryption. We
                        never store your PIN.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Right Column - Booking Summary */}
            <View className="w-full lg:w-96 space-y-4">
              {/* Booking Summary Card */}
              <View
                className="rounded-2xl border"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <View className="p-5">
                  <View className="flex-row justify-between items-center mb-6">
                    <Text
                      className="text-lg font-geist"
                      style={{ color: colors.text }}
                    >
                      Booking Summary
                    </Text>
                    <View
                      className="flex-row items-center gap-2 px-3 py-1 rounded-full"
                      style={{ backgroundColor: colors.primary + "15" }}
                    >
                      <Wallet size={14} color={colors.primary} />
                      <Text
                        className="text-xs font-medium font-geist"
                        style={{ color: colors.primary }}
                      >
                        Wallet Payment
                      </Text>
                    </View>
                  </View>

                  {/* Route Info */}
                  <View className="space-y-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text
                          className="font-semibold text-base font-geist"
                          style={{ color: colors.text }}
                        >
                          {bookingDetails.from}
                        </Text>
                      </View>
                      <ChevronRight size={16} color={colors.mutedText} />
                      <View className="flex-1 items-end">
                        <Text
                          className="font-semibold text-base font-geist"
                          style={{ color: colors.text }}
                        >
                          {bookingDetails.to}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row justify-between">
                      <View>
                        <Text
                          className="text-sm font-geist"
                          style={{ color: colors.text }}
                        >
                          {bookingDetails.date}
                        </Text>
                        <Text
                          className="text-sm mt-1 font-geist"
                          style={{ color: colors.mutedText }}
                        >
                          {bookingDetails.time}
                        </Text>
                      </View>
                      <View>
                        <Text
                          className="text-sm font-medium font-geist"
                          style={{ color: colors.text }}
                        >
                          {bookingDetails.duration}
                        </Text>
                        <Text
                          className="text-sm mt-1 font-geist"
                          style={{ color: colors.mutedText }}
                        >
                          {bookingDetails.seats.length} seats
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    className="h-px my-4"
                    style={{ backgroundColor: colors.border }}
                  />

                  {/* Price Breakdown */}
                  <View className="gap-2">
                    <View className="flex-row justify-between">
                      <Text
                        className="text-sm font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        Base Fare
                      </Text>
                      <Text
                        className="text-sm font-medium font-groteskBold"
                        style={{ color: colors.text }}
                      >
                        ETB {bookingDetails.baseFare}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text
                        className="text-sm font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        Taxes & Fees
                      </Text>
                      <Text
                        className="text-sm font-medium font-groteskBold"
                        style={{ color: colors.text }}
                      >
                        ETB {bookingDetails.taxes}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text
                        className="text-sm"
                        style={{ color: colors.mutedText }}
                      >
                        Convenience Fee
                      </Text>
                      <Text
                        className="text-sm font-medium font-groteskBold"
                        style={{ color: colors.text }}
                      >
                        ETB {bookingDetails.convenienceFee}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-sm" style={{ color: "#10B981" }}>
                        Discount Applied
                      </Text>
                      <Text
                        className="text-sm font-medium font-groteskBold"
                        style={{ color: "#10B981" }}
                      >
                        ETB {bookingDetails.discount}
                      </Text>
                    </View>
                  </View>

                  <View
                    className="h-px my-4"
                    style={{ backgroundColor: colors.border }}
                  />

                  {/* Total Amount */}
                  <View className="space-y-3">
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text
                          className="font-bold text-lg font-geist"
                          style={{ color: colors.text }}
                        >
                          Total Amount
                        </Text>
                        <Text
                          className="text-sm font-geist"
                          style={{ color: colors.mutedText }}
                        >
                          Including protection plans
                        </Text>
                      </View>
                      <Text
                        className="text-3xl font-groteskBold"
                        style={{ color: colors.primary }}
                      >
                        ETB {bookingDetails.total}
                      </Text>
                    </View>
                  </View>

                  {/* Terms & Conditions */}
                  <TouchableOpacity
                    className="flex-row items-start gap-3 my-6"
                    onPress={() => setTermsAccepted(!termsAccepted)}
                  >
                    <View
                      className={`w-5 h-5 rounded-md border items-center justify-center mt-0.5 ${
                        termsAccepted ? "bg-primary" : ""
                      }`}
                      style={{
                        borderColor: termsAccepted
                          ? colors.primary
                          : colors.border,
                      }}
                    >
                      {termsAccepted && (
                        <CheckCircle2 size={12} color="#FFFFFF" />
                      )}
                    </View>
                    <Text
                      className="text-xs flex-1 mt-1 font-geist"
                      style={{ color: colors.text }}
                    >
                      I agree to the{" "}
                      <Text
                        style={{ color: colors.primary }}
                        onPress={() => setShowTermsModal(true)}
                      >
                        Terms of Service, Privacy Policy
                      </Text>
                      , and authorize this charge
                    </Text>
                  </TouchableOpacity>

                  {/* Pay Button */}
                  <TouchableOpacity
                    className={`mt-6 py-4 rounded-xl items-center justify-center flex-row ${
                      processing || walletPin.length !== 6 || !termsAccepted
                        ? "opacity-50"
                        : ""
                    }`}
                    style={{ backgroundColor: colors.primary }}
                    onPress={handleWalletPayment}
                    disabled={
                      processing || walletPin.length !== 6 || !termsAccepted
                    }
                  >
                    {processing ? (
                      <>
                        <ActivityIndicator
                          color="#FFFFFF"
                          size="small"
                          className="mr-2"
                        />
                        <Text className="text-white font-semibold text-base">
                          Processing Payment...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Wallet size={20} color="#FFFFFF" />
                        <Text className="text-white ml-2 font-semibold text-base font-geist">
                          Pay ETB {bookingDetails.total}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Terms Modal */}
      <Modal
        visible={showTermsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="rounded-t-3xl p-6 max-h-3/4"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                Terms & Conditions
              </Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ color: colors.text, lineHeight: 20 }}>
                {`By proceeding with this payment, you agree to:\n\n1. Authorize the charge of ETB ${bookingDetails.total} to your wallet\n2. Accept our Terms of Service and Privacy Policy\n3. Acknowledge that all fees are non-refundable unless stated otherwise\n4. Confirm you are the authorized wallet holder\n\nYour PIN is encrypted and we never store it. All transactions are protected with bank-level security.`}
              </Text>
            </ScrollView>

            <TouchableOpacity
              className="mt-6 py-3 rounded-xl items-center justify-center"
              style={{ backgroundColor: colors.primary }}
              onPress={() => {
                setTermsAccepted(true)
                setShowTermsModal(false)
              }}
            >
              <Text className="text-white font-semibold">Accept Terms</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  )
}
