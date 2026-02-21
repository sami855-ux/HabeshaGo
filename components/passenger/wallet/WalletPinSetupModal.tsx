// components/passenger/WalletPinSetupModal.tsx
import { useThemeContext } from "@/context/ThemeContext"
import { Eye, EyeOff, Lock, X } from "lucide-react-native"
import React, { useState } from "react"
import {
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

interface WalletPinSetupModalProps {
  isOpen: boolean
  onComplete: (pin: string) => void
  pinLoading: boolean
  onClose: () => void
  canClose?: boolean
  onSetupLater?: () => void
}

export const WalletPinSetupModal = ({
  isOpen,
  onComplete,
  pinLoading,
  onClose,
  canClose = false,
  onSetupLater,
}: WalletPinSetupModalProps) => {
  const { colors } = useThemeContext()
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)

  const handleSubmit = () => {
    if (!pin.trim()) {
      Alert.alert("Error", "Please enter a PIN")
      return
    }

    if (pin.length < 4) {
      Alert.alert("Error", "PIN must be at least 4 digits")
      return
    }

    if (pin !== confirmPin) {
      Alert.alert("Error", "PINs do not match")
      return
    }

    onComplete(pin)
  }

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View
          className="w-[90%] rounded-3xl p-6"
          style={{ backgroundColor: colors.card }}
        >
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: colors.primary + "15" }}
              >
                <Lock size={24} color={colors.primary} />
              </View>
              <View>
                <Text
                  className="text-xl font-bold font-geist"
                  style={{ color: colors.text }}
                >
                  Set Up Wallet PIN
                </Text>
                <Text
                  className="text-sm mt-1 font-geist"
                  style={{ color: colors.mutedText }}
                >
                  Create a secure PIN for your wallet
                </Text>
              </View>
            </View>
            {canClose && (
              <TouchableOpacity onPress={onClose}>
                <X size={24} color={colors.mutedText} />
              </TouchableOpacity>
            )}
          </View>

          <Text
            className="text-sm mb-4 font-geist"
            style={{ color: colors.mutedText }}
          >
            This PIN will be used to authorize transactions and secure your
            wallet.
          </Text>

          {/* PIN Input */}
          <View className="mb-4">
            <Text
              className="text-sm font-medium mb-2 font-geist"
              style={{ color: colors.text }}
            >
              Enter PIN
            </Text>
            <View
              className="rounded-xl border px-4 py-3 flex-row items-center"
              style={{ borderColor: colors.border }}
            >
              <TextInput
                className="flex-1"
                style={{ color: colors.text }}
                placeholder="Enter 4-digit PIN"
                placeholderTextColor={colors.mutedText}
                secureTextEntry={!showPin}
                value={pin}
                onChangeText={setPin}
                keyboardType="numeric"
                maxLength={4}
              />
              <TouchableOpacity onPress={() => setShowPin(!showPin)}>
                {showPin ? (
                  <EyeOff size={20} color={colors.mutedText} />
                ) : (
                  <Eye size={20} color={colors.mutedText} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm PIN Input */}
          <View className="mb-6">
            <Text
              className="text-sm font-medium mb-2 font-geist"
              style={{ color: colors.text }}
            >
              Confirm PIN
            </Text>
            <View
              className="rounded-xl border px-4 py-3 flex-row items-center"
              style={{ borderColor: colors.border }}
            >
              <TextInput
                className="flex-1"
                style={{ color: colors.text }}
                placeholder="Confirm 4-digit PIN"
                placeholderTextColor={colors.mutedText}
                secureTextEntry={!showConfirmPin}
                value={confirmPin}
                onChangeText={setConfirmPin}
                keyboardType="numeric"
                maxLength={4}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPin(!showConfirmPin)}
              >
                {showConfirmPin ? (
                  <EyeOff size={20} color={colors.mutedText} />
                ) : (
                  <Eye size={20} color={colors.mutedText} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            {onSetupLater && (
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center border"
                style={{ borderColor: colors.border }}
                onPress={onSetupLater}
                disabled={pinLoading}
              >
                <Text
                  className="font-medium font-geist"
                  style={{ color: colors.text }}
                >
                  Set Up Later
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="flex-1 py-3 rounded-xl items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={handleSubmit}
              disabled={pinLoading}
            >
              <Text className="text-white font-medium font-geist">
                {pinLoading ? "Setting up..." : "Set PIN"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
