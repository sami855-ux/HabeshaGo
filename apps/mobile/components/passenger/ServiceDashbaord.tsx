import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons"
import React from "react"
import { Text, TouchableOpacity, View } from "react-native"

const ServiceDashboardGrid = () => {
  const services = [
    {
      id: 1,
      title: "Digital Bus & Ticketing",
      icon: "directions-bus",
      iconSet: MaterialIcons,
      color: "#ea580c",
    },
    {
      id: 2,
      title: "EV Charging",
      icon: "charging-station",
      iconSet: FontAwesome5,
      color: "#f97316",
    },
    {
      id: 3,
      title: "Parking System",
      icon: "local-parking",
      iconSet: MaterialIcons,
      color: "#fb923c",
    },
    {
      id: 4,
      title: "Employee Shuttle",
      icon: "people-outline",
      iconSet: Ionicons,
      color: "#ea580c",
    },
  ]

  const handleServicePress = (serviceTitle: string) => {
    alert(`Opening ${serviceTitle}`)
  }

  const ServiceGridCard = ({ service }: { service: (typeof services)[0] }) => {
    const IconComponent = service.iconSet

    return (
      <TouchableOpacity
        className="bg-white rounded-xl p-6 m-2 flex-1 min-w-[46%] h-36 items-center shadow-sm border border-gray-100"
        onPress={() => handleServicePress(service.title)}
        activeOpacity={0.7}
      >
        <View
          className="w-16 h-16 rounded-2xl justify-center items-center mb-4"
          style={{ backgroundColor: `${service.color}20` }}
        >
          <IconComponent name={service.icon} size={28} color={service.color} />
        </View>

        <Text className="text-base font-semibold font-geist text-gray-900 text-center mb-2">
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
    <View className="bg-white">
      {/* Services Grid */}
      <View className="flex-row flex-wrap justify-between w-full">
        {services.map((service) => (
          <ServiceGridCard key={service.id} service={service} />
        ))}
      </View>
    </View>
  )
}

export default ServiceDashboardGrid
