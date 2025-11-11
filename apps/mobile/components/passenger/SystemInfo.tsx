import { MaterialIcons } from "@expo/vector-icons"
import React, { useEffect, useRef, useState } from "react"
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const SystemInfoCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)
  const { width: screenWidth } = Dimensions.get("window")

  const systemInfo = [
    {
      id: 1,
      title: "Real-time Tracking",
      description: "Live GPS tracking for all buses and charging stations",
      icon: "gps-fixed",
      color: "#ea580c",
      backgroundImage:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    },
    {
      id: 2,
      title: "Secure Payments",
      description: "Multiple payment options with bank-level security",
      icon: "security",
      color: "#f97316",
      backgroundImage:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    },
    {
      id: 3,
      title: "24/7 Support",
      description: "Round-the-clock customer service and technical support",
      icon: "support-agent",
      color: "#fb923c",
      backgroundImage:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    },
    {
      id: 4,
      title: "Smart Notifications",
      description: "Instant alerts for bookings, delays, and promotions",
      icon: "notifications-active",
      color: "#ea580c",
      backgroundImage:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    },
    {
      id: 5,
      title: "Eco-Friendly",
      description: "Supporting green transportation and EV infrastructure",
      icon: "eco",
      color: "#f97316",
      backgroundImage:
        "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
    },
  ]

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % systemInfo.length
      setCurrentIndex(nextIndex)

      scrollViewRef.current?.scrollTo({
        x: nextIndex * (screenWidth - 32),
        animated: true,
      })
    }, 3000) // Change slide every 3 seconds

    return () => clearInterval(interval)
  }, [currentIndex, systemInfo.length, screenWidth])

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x
    const index = Math.round(contentOffset / (screenWidth - 32))
    setCurrentIndex(index)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    scrollViewRef.current?.scrollTo({
      x: index * (screenWidth - 32),
      animated: true,
    })
  }

  return (
    <View className="mb-8">
      {/* Carousel Container */}
      <View className="relative">
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          decelerationRate="fast"
        >
          {systemInfo.map((item) => (
            <ImageBackground
              key={item.id}
              source={{ uri: item.backgroundImage }}
              imageStyle={{ borderRadius: 16 }}
              style={{
                width: screenWidth - 32,
                marginHorizontal: 8,
                borderRadius: 16,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              {/* Overlay for better text readability */}
              <View
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  padding: 24,
                  borderRadius: 16,
                  minHeight: 200,
                }}
              >
                <View
                  className="w-16 h-16 rounded-2xl justify-center items-center mb-4"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <MaterialIcons
                    name={item.icon as any}
                    size={32}
                    color={item.color}
                  />
                </View>

                <Text
                  className="text-2xl font-groteskBold  mb-2"
                  style={{ color: "#FFFFFF" }}
                >
                  {item.title}
                </Text>

                <Text className="text-sm leading-6 text-white">
                  {item.description}
                </Text>
              </View>
            </ImageBackground>
          ))}
        </ScrollView>

        {/* Dots Indicator */}
        <View className="flex-row justify-center mt-4 space-x-2 gap-2">
          {systemInfo.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? "bg-orange-500" : "bg-gray-300"
              }`}
            />
          ))}
        </View>
      </View>
    </View>
  )
}

export default SystemInfoCarousel
