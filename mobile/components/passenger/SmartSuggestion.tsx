import { useThemeContext } from "@/context/ThemeContext"
import { MaterialIcons } from "@expo/vector-icons"
import React from "react"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import { actualThemeBackground } from "./ServiceDashbaord"

const SmartSuggestions = () => {
  const { colors } = useThemeContext() // Get theme colors

  const suggestions = [
    {
      id: 1,
      title: "Quick Booking",
      icon: "flash-on",
      iconSet: MaterialIcons,
      color: "#ea580c",
    },
    {
      id: 2,
      title: "Nearby Stations",
      icon: "location-on",
      iconSet: MaterialIcons,
      color: "#f97316",
    },
    {
      id: 3,
      title: "My Bookings",
      icon: "receipt",
      iconSet: MaterialIcons,
      color: "#fb923c",
    },
    {
      id: 4,
      title: "Payment",
      icon: "payment",
      iconSet: MaterialIcons,
      color: "#ea580c",
    },
    {
      id: 5,
      title: "Notifications",
      icon: "notifications",
      iconSet: MaterialIcons,
      color: "#f97316",
    },
  ]

  const handleSuggestionPress = (title: string) => {
    console.log(`Pressed: ${title}`)
    alert(`Action: ${title}`)
  }

  const SuggestionCard = ({
    suggestion,
  }: {
    suggestion: (typeof suggestions)[0]
  }) => {
    const IconComponent = suggestion.iconSet

    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
        className="rounded-xl px-4 py-2 mr-3 w-28 flex items-center justify-center flex-col"
        onPress={() => handleSuggestionPress(suggestion.title)}
        activeOpacity={0.7}
      >
        <View
          style={{ backgroundColor: `${suggestion.color}15` }}
          className="w-12 h-12 rounded-full justify-center items-center mb-3"
        >
          <IconComponent
            name={suggestion.icon as any}
            size={24}
            color={suggestion.color}
          />
        </View>

        <Text
          style={{ color: colors.text }}
          className="text-sm font-semibold font-geist text-center"
        >
          {suggestion.title}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <View
      style={{
        backgroundColor: actualThemeBackground(colors),
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 16,
      }}
      className="mb-6 h-fit py-4"
    >
      <View className="px-4 mb-3">
        <Text
          style={{ color: colors.mutedText }}
          className="text-lg font-semibold font-groteskBold"
        >
          Quick actions for you
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {suggestions.map((suggestion) => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} />
        ))}
      </ScrollView>
    </View>
  )
}

export default SmartSuggestions
