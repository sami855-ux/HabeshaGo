import { useThemeContext } from "@/context/ThemeContext"
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React from "react"
import { Text, TouchableOpacity, View } from "react-native"

const ServiceDashboardGrid = () => {
  const router = useRouter()
  const { colors } = useThemeContext() // Get colors from theme

  const services = [
    {
      id: "bus",
      title: "Ticket Bus",
      icon: "directions-bus",
      iconSet: MaterialIcons,
      color: "#ea580c",
    },
    {
      id: "ev",
      title: "EV Charging",
      icon: "charging-station",
      iconSet: FontAwesome5,
      color: "#f97316",
    },
    {
      id: "parking",
      title: "Parking System",
      icon: "local-parking",
      iconSet: MaterialIcons,
      color: "#fb923c",
    },
    {
      id: "my-vehicle",
      title: "My Vehicle",
      icon: "car-sport-outline",
      iconSet: Ionicons,
      color: "#ea580c",
    },
  ]

  const handleServicePress = (serviceTitle: string) => {
    if (serviceTitle === "bus") {
      router.push("/(passenger)/busBook")
    } else if (serviceTitle === "my-vehicle") {
      router.push("/vehicle")
    }
  }

  const ServiceGridCard = ({ service }: { service: (typeof services)[0] }) => {
    const IconComponent = service.iconSet

    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
        className="rounded-xl p-6 m-2 flex-1 min-w-[46%] h-36 items-center shadow-sm"
        onPress={() => handleServicePress(service.id)}
        activeOpacity={0.7}
      >
        <View
          style={{ backgroundColor: `${service.color}20` }}
          className="w-16 h-16 rounded-2xl justify-center items-center mb-4"
        >
          <IconComponent name={service.icon} size={28} color={service.color} />
        </View>

        <Text
          style={{ color: colors.text }}
          className="text-base font-semibold font-geist text-center mb-2"
        >
          {service.title}
        </Text>

        <View className="absolute top-4 right-4">
          <MaterialIcons
            name="arrow-forward"
            size={16}
            color={service.color}
            className="opacity-70"
          />
        </View>
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
    >
      {/* Services Grid */}
      <View className="flex-row flex-wrap justify-between w-full">
        {services.map((service) => (
          <ServiceGridCard key={service.id} service={service} />
        ))}
      </View>
    </View>
  )
}

// Utility: slightly lighter background than the card for the container
export const actualThemeBackground = (colors: any) => {
  // Dark mode stays subtle, light mode gets very soft background
  if (colors.background === "#1A1A1A") return "#1A1A1A" // slightly lighter dark container
  return "#FFFFFF" // softer, very light background for light mode
}

export default ServiceDashboardGrid
