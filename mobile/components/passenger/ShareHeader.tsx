// ShareHeader.tsx
import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { ChevronLeft, Headset, Shield } from "lucide-react-native"

interface ShareHeaderProps {
  onBack: () => void
}

export function ShareHeader({ onBack }: ShareHeaderProps) {
  return (
    <View className="bg-white border-b border-gray-200 shadow-sm">
      <View className="px-4 py-4 flex-row items-start gap-4">
        <TouchableOpacity onPress={onBack} className="p-1">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>

        <View className="flex-1 gap-3">
          <View>
            <Text className="text-xs font-semibold uppercase text-gray-500 tracking-wide">
              Ticket Sharing
            </Text>
            <Text className="text-2xl font-bold text-gray-900">
              Share Your Ticket
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Transfer your ticket to a friend or family member securely and
              instantly.
            </Text>
          </View>

          <View className="flex-row gap-2">
            <View className="flex-row items-center gap-1.5 bg-gray-100 px-3 py-2 rounded-full">
              <Headset size={16} color="#6b7280" />
              <Text className="text-xs text-gray-500">24/7 support</Text>
            </View>
            <View className="flex-row items-center gap-1.5 bg-orange-50 px-3 py-2 rounded-full">
              <Shield size={16} color="#f97316" />
              <Text className="text-xs text-orange-600">Secure Transfer</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
