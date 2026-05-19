// ShareConfirmationDialog.tsx
import React, { useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, Modal, Animated } from "react-native"
import {
  Loader2,
  Share2,
  Ticket,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react-native"

interface ShareConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedUser: any | null
  ticketData: any
  isSharing: boolean
  onConfirm: () => void
  showSuccess: boolean
  selectedTickets?: number[]
  shareError?: string | null
}

export function ShareConfirmationDialog({
  open,
  onOpenChange,
  selectedUser,
  ticketData,
  isSharing,
  onConfirm,
  showSuccess,
  selectedTickets = [],
  shareError,
}: ShareConfirmationDialogProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const spinAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (open) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }).start()
    } else {
      scaleAnim.setValue(0)
    }
  }, [open])

  useEffect(() => {
    if (isSharing && !showSuccess) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ).start()
    } else {
      spinAnim.setValue(0)
    }
  }, [isSharing, showSuccess])

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const allTickets = ticketData?.tickets || []
  const boardingStop = allTickets[0]?.boardingStop || "Unknown"
  const alightingStop = allTickets[0]?.alightingStop || "Unknown"
  const origin = boardingStop
  const destination = alightingStop

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSharing && !showSuccess) {
      onOpenChange(newOpen)
    }
  }

  const getDialogContent = () => {
    if (isSharing) {
      if (showSuccess) return "success"
      if (shareError) return "error"
      return "loading"
    }
    return "confirmation"
  }

  const contentState = getDialogContent()

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => handleOpenChange(false)}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <Animated.View
          className="bg-white rounded-3xl w-full max-w-md overflow-hidden"
          style={{ transform: [{ scale: scaleAnim }] }}
        >
          {/* Loading State */}
          {contentState === "loading" && (
            <View className="bg-gradient-to-br from-orange-500 to-amber-600 p-8">
              <View className="items-center justify-center min-h-[350px]">
                <Animated.View
                  className="mb-6"
                  style={{ transform: [{ rotate: spin }] }}
                >
                  <Loader2 size={80} color="#fff" />
                </Animated.View>

                <Animated.Text className="text-2xl font-bold text-white mb-2 text-center">
                  Sharing Ticket
                </Animated.Text>

                <Animated.Text className="text-orange-100 text-center mb-6">
                  Please wait while we securely share your ticket with{" "}
                  {selectedUser?.name?.split(" ")[0]}
                </Animated.Text>

                <View className="w-48 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <Animated.View className="h-full bg-white w-1/2" />
                </View>

                <Text className="text-xs text-orange-200 mt-6">
                  Don't close this window
                </Text>
              </View>
            </View>
          )}

          {/* Success State */}
          {contentState === "success" && (
            <View className="bg-gradient-to-br from-green-500 to-emerald-600 p-8">
              <View className="items-center justify-center min-h-[350px]">
                <Animated.View className="mb-6">
                  <CheckCircle2 size={80} color="#fff" />
                </Animated.View>

                <Animated.Text className="text-2xl font-bold text-white mb-2 text-center">
                  Shared Successfully! 🎉
                </Animated.Text>

                <Animated.Text className="text-green-100 text-center mb-4">
                  Ticket has been shared with {selectedUser?.name}
                </Animated.Text>

                <View className="bg-white/20 rounded-xl p-3 w-full mb-6">
                  <Text className="text-xs text-green-100 mb-1">Route</Text>
                  <Text className="text-sm font-semibold text-white">
                    {origin} → {destination}
                  </Text>
                </View>

                <Text className="text-xs text-green-200">
                  Redirecting to trips...
                </Text>
              </View>
            </View>
          )}

          {/* Error State */}
          {contentState === "error" && (
            <View className="bg-gradient-to-br from-red-500 to-rose-600 p-8">
              <View className="items-center justify-center min-h-[350px]">
                <XCircle size={80} color="#fff" className="mb-6" />

                <Text className="text-2xl font-bold text-white mb-2 text-center">
                  Share Failed
                </Text>

                <Text className="text-red-100 text-center mb-6">
                  {shareError || "Unable to share ticket. Please try again."}
                </Text>

                <TouchableOpacity
                  onPress={() => onOpenChange(false)}
                  className="px-6 py-2 bg-white rounded-full"
                >
                  <Text className="text-red-600 font-semibold">Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Confirmation State */}
          {contentState === "confirmation" && (
            <View className="p-6">
              <View className="items-center mb-4">
                <View className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 items-center justify-center mb-4">
                  <Share2 size={40} color="#ea580c" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 text-center">
                  Confirm Share
                </Text>
                <Text className="text-gray-500 text-center mt-2">
                  Are you sure you want to share this ticket with{" "}
                  <Text className="font-semibold text-orange-600">
                    {selectedUser?.name}
                  </Text>
                  ? This action cannot be undone.
                </Text>
              </View>

              <View className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 my-4 border border-orange-100">
                <View className="flex-row items-center gap-3 mb-3 pb-3 border-b border-orange-100">
                  <View className="p-2 bg-orange-100 rounded-lg">
                    <Ticket size={16} color="#ea580c" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-orange-600 font-medium">
                      Route
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {origin} → {destination}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3">
                  <View className="p-2 bg-orange-100 rounded-lg">
                    <User size={16} color="#ea580c" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-orange-600 font-medium">
                      Recipient
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {selectedUser?.name}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {selectedUser?.phone}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => onOpenChange(false)}
                  disabled={isSharing}
                  className="flex-1 py-3 rounded-full border-2 border-gray-300 items-center"
                >
                  <Text className="text-gray-700 font-medium">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onConfirm}
                  disabled={isSharing}
                  className="flex-1 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 items-center shadow-lg"
                >
                  <Text className="text-white font-medium">
                    Yes, Share Ticket
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  )
}
