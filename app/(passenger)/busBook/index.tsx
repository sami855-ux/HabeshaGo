import { BusList } from "@/components/bus/busList"
import { SearchRoute } from "@/components/bus/SearchRoute"
import { useThemeContext } from "@/context/ThemeContext"
import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import React, { useEffect, useState } from "react"
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

export default function BusBookingPage() {
  const router = useRouter()
  const { colors, actualTheme } = useThemeContext()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 100)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <View
        className="flex-1 p-6 space-y-6"
        style={{ backgroundColor: colors.background }}
      >
        <View
          className="h-32 w-full rounded-2xl"
          style={{ backgroundColor: colors.card }}
        />
        <View
          className="h-64 w-full rounded-2xl"
          style={{ backgroundColor: colors.card }}
        />
        <View
          className="h-96 w-full rounded-2xl"
          style={{ backgroundColor: colors.card }}
        />
      </View>
    )
  }

  const statusBarStyle =
    actualTheme === "dark" ? "light-content" : "dark-content"

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={statusBarStyle}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* Header */}
        <View
          className="px-6 pt-16 pb-8"
          style={{ backgroundColor: colors.card }}
        >
          <View className="flex flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary + "15" }}
            >
              <ChevronLeft size={24} color={colors.primary} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text
                className="text-2xl font-groteskBold"
                style={{ color: colors.text }}
              >
                Bus Booking
              </Text>
              <Text
                className="mt-1 text-sm font-geist"
                style={{ color: colors.mutedText }}
              >
                Find, book, and manage your bus journeys effortlessly
              </Text>
            </View>
          </View>
        </View>

        {/* Search Section */}
        <View className="px-3 -mt-4">
          <SearchRoute />
        </View>

        {/* Bus List Section */}
        <View className="px-2 pt-6">
          <BusList />
        </View>
      </ScrollView>
    </>
  )
}
