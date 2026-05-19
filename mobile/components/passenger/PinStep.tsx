import React, { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
} from "react-native"
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowLeft,
  AlertCircle,
} from "lucide-react-native"

interface User {
  id: string
  name: string
  phone: string
  isVerified: boolean
}

interface PinStepProps {
  receiver: User
  amount: number
  fee: number
  onSubmit: (pin: string) => void
  onBack: () => void
  isProcessing: boolean
}

export default function PinStep({
  receiver,
  amount,
  fee,
  onSubmit,
  onBack,
  isProcessing,
}: PinStepProps) {
  const [pin, setPin] = useState(["", "", "", "", "", ""])
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState("")
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null)
  const inputs = useRef<(TextInput | null)[]>([])

  const total = amount + fee
  const isPinComplete = pin.every((digit) => digit !== "")

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (isPinComplete && !isProcessing) {
      const timer = setTimeout(() => {
        handleSubmit()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [pin, isProcessing])

  const handleChange = (text: string, index: number) => {
    // Only allow numbers
    if (text.length > 0 && !/^\d$/.test(text)) return

    const newPin = [...pin]
    newPin[index] = text
    setPin(newPin)
    setError("")

    // Auto-focus next input
    if (text && index < 5) {
      inputs.current[index + 1]?.focus()
    }

    // Auto-clear error when user starts typing
    if (error) setError("")
  }

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace to go to previous input
    if (e.nativeEvent.key === "Backspace" && !pin[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = async () => {
    try {
      const pastedText = await Clipboard.getString()
      if (pastedText && /^\d{6}$/.test(pastedText)) {
        const digits = pastedText.split("")
        setPin(digits)
        setError("")
        // Auto-submit after paste
        setTimeout(() => handleSubmit(), 100)
      }
    } catch (error) {
      console.log("Paste error:", error)
    }
  }

  const handleSubmit = () => {
    if (!isPinComplete) {
      setError("Please enter your 6-digit PIN")
      return
    }

    const pinCode = pin.join("")
    Keyboard.dismiss()
    onSubmit(pinCode)
  }

  const handleClear = () => {
    setPin(["", "", "", "", "", ""])
    setError("")
    inputs.current[0]?.focus()
  }

  const formatAmount = (value: number) => {
    return `ETB ${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <View style={{ gap: 24 }}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={onBack}
        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        disabled={isProcessing}
      >
        <ArrowLeft size={20} color="#059669" />
        <Text style={{ color: "#059669", fontWeight: "500" }}>
          Back to Amount
        </Text>
      </TouchableOpacity>

      {/* Header Section */}
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#d1fae5",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            shadowColor: "#059669",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Shield size={40} color="#059669" />
        </View>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#111827",
            marginBottom: 8,
          }}
        >
          Enter Your PIN
        </Text>
        <Text
          style={{
            color: "#6b7280",
            textAlign: "center",
            fontSize: 14,
            paddingHorizontal: 24,
          }}
        >
          For your security, please confirm this transaction with your 6-digit
          PIN
        </Text>
      </View>

      {/* Transaction Summary */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: "#6b7280",
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Transaction Details
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View>
            <Text style={{ fontWeight: "600", fontSize: 16, color: "#111827" }}>
              {receiver.name}
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
              {receiver.phone}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#059669" }}
            >
              {formatAmount(amount)}
            </Text>
            {receiver.isVerified && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 4,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#059669",
                  }}
                />
                <Text style={{ fontSize: 10, color: "#059669" }}>
                  Verified User
                </Text>
              </View>
            )}
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "#f3f4f6",
          }}
        >
          <Text style={{ color: "#6b7280", fontSize: 14 }}>
            Transaction Fee (1%)
          </Text>
          <Text style={{ color: "#d97706", fontWeight: "500" }}>
            {formatAmount(fee)}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
          }}
        >
          <Text style={{ fontWeight: "600", color: "#111827", fontSize: 16 }}>
            Total to Deduct
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: 18, color: "#059669" }}>
            {formatAmount(total)}
          </Text>
        </View>
      </View>

      {/* PIN Input Section */}
      <View style={{ gap: 16 }}>
        {/* PIN Boxes */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 12,
            paddingHorizontal: 8,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() => inputs.current[idx]?.focus()}
            >
              <View
                style={{
                  width: 52,
                  height: 60,
                  borderWidth: 2,
                  borderColor: pin[idx]
                    ? error
                      ? "#dc2626"
                      : "#059669"
                    : "#d1d5db",
                  borderRadius: 12,
                  backgroundColor: pin[idx] ? "#ecfdf5" : "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: pin[idx] ? "#059669" : "transparent",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: pin[idx] ? 1 : 0,
                }}
              >
                <TextInput
                  ref={(ref) => (inputs.current[idx] = ref)}
                  style={{
                    width: "100%",
                    height: "100%",
                    textAlign: "center",
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#111827",
                  }}
                  keyboardType="numeric"
                  maxLength={1}
                  secureTextEntry={!showPin}
                  value={pin[idx]}
                  onChangeText={(text) => handleChange(text, idx)}
                  onKeyPress={(e) => handleKeyPress(e, idx)}
                  editable={!isProcessing}
                  autoFocus={idx === 0}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* PIN Controls */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 24,
          }}
        >
          <TouchableOpacity
            onPress={() => setShowPin(!showPin)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingVertical: 8,
            }}
          >
            {showPin ? (
              <EyeOff size={18} color="#6b7280" />
            ) : (
              <Eye size={18} color="#6b7280" />
            )}
            <Text style={{ color: "#6b7280", fontSize: 14 }}>
              {showPin ? "Hide" : "Show"} PIN
            </Text>
          </TouchableOpacity>

          {pin.some((d) => d !== "") && (
            <TouchableOpacity
              onPress={handleClear}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: "#ef4444", fontSize: 14 }}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Error Message */}
        {error && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: 12,
              backgroundColor: "#fef2f2",
              borderRadius: 12,
              marginTop: 8,
            }}
          >
            <AlertCircle size={16} color="#dc2626" />
            <Text
              style={{ color: "#dc2626", fontSize: 13, textAlign: "center" }}
            >
              {error}
            </Text>
          </View>
        )}

        {/* Attempts Warning */}
        {attemptsLeft !== null && attemptsLeft <= 2 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: 12,
              backgroundColor: "#fffbeb",
              borderRadius: 12,
            }}
          >
            <Text
              style={{ color: "#d97706", fontSize: 12, textAlign: "center" }}
            >
              ⚠️ {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""}{" "}
              remaining. After 3 failed attempts, your account will be locked.
            </Text>
          </View>
        )}
      </View>

      {/* Security Tips */}
      <View
        style={{
          backgroundColor: "#eff6ff",
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: "#dbeafe",
        }}
      >
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Lock size={20} color="#2563eb" />
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontWeight: "600", color: "#1e40af", marginBottom: 4 }}
            >
              Secure Transaction
            </Text>
            <Text style={{ fontSize: 12, color: "#3b82f6", lineHeight: 16 }}>
              Your PIN is encrypted and never stored. This transaction is
              protected by bank-grade security.
            </Text>
          </View>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!isPinComplete || isProcessing}
        style={{
          backgroundColor:
            isPinComplete && !isProcessing ? "#059669" : "#9ca3af",
          padding: 18,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          shadowColor:
            isPinComplete && !isProcessing ? "#059669" : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: isPinComplete && !isProcessing ? 2 : 0,
        }}
      >
        {isProcessing ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
              Processing...
            </Text>
          </>
        ) : (
          <>
            <Lock size={20} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
              Confirm & Send {formatAmount(amount)}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Help Text */}
      <Text
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "#9ca3af",
          marginTop: 8,
        }}
      >
        Forgot PIN? Contact customer support
      </Text>
    </View>
  )
}
