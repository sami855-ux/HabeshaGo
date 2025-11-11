import { MaterialIcons } from "@expo/vector-icons"
import React from "react"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"

const SmartSuggestions = () => {
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
    // Add your action logic here
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
        className="bg-white rounded-xl px-4 py-2 mr-3 w-28  border border-gray-100 flex items-center justify-center flex-col"
        onPress={() => handleSuggestionPress(suggestion.title)}
        activeOpacity={0.7}
      >
        <View
          className="w-12 h-12 rounded-full justify-center items-center mb-3"
          style={{ backgroundColor: `${suggestion.color}15` }}
        >
          <IconComponent
            name={suggestion.icon as any}
            size={24}
            color={suggestion.color}
          />
        </View>

        <Text className="text-sm font-semibold font-geist text-gray-900 text-center">
          {suggestion.title}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <View className="mb-6">
      <View className="px-4 mb-3">
        <Text className="text-lg font-semibold font-groteskBold text-gray-600">
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
