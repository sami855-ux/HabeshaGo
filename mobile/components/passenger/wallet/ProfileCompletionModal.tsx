// components/passenger/ProfileCompletionModal.tsx
import { useThemeContext } from "@/context/ThemeContext"
import { AlertTriangle } from "lucide-react-native"
import React from "react"
import { Modal, Text, TouchableOpacity, View } from "react-native"

interface ProfileCompletionModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ProfileCompletionModal = ({
  isOpen,
  onClose,
}: ProfileCompletionModalProps) => {
  const { colors } = useThemeContext()

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
                <AlertTriangle size={24} color={colors.primary} />
              </View>
              <View>
                <Text
                  className="text-xl font-bold font-geist"
                  style={{ color: colors.text }}
                >
                  Profile Incomplete
                </Text>
                <Text
                  className="text-sm mt-1 font-geist"
                  style={{ color: colors.mutedText }}
                >
                  Complete your profile to continue
                </Text>
              </View>
            </View>
          </View>

          <Text
            className="text-base mb-6 font-geist"
            style={{ color: colors.text }}
          >
            Please verify your email and phone number to access wallet features.
          </Text>

          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={() => {
                // Navigate to profile completion page
                // router.push('/(passenger)/complete-profile')
              }}
            >
              <Text className="text-white font-medium font-geist">
                Complete Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
