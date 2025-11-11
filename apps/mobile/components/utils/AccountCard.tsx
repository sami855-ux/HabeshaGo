import { useRouter } from "expo-router"
import { ChevronRight, Eye, EyeOff } from "lucide-react-native"
import React, { useState } from "react"
import { Animated, Text, TouchableOpacity, View } from "react-native"

const AccountCard = () => {
  const [isAmountVisible, setIsAmountVisible] = useState(true)
  const [isPointsVisible, setIsPointsVisible] = useState(true)
  const router = useRouter()
  const scaleAnim = useState(new Animated.Value(1))[0]

  const arrowAnim = useState(new Animated.Value(0))[0]

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(arrowAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(arrowAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleShowMore = () => {
    router.push("/points-details")
  }

  return (
    <View className="flex-1 bg-transparent mx-4 rounded-2xl z-10 w-full">
      {/* Main Card Content */}
      <View className="flex-row justify-between items-center h-24 px-6 w-full">
        {/* Account Balance */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-sm font-jakarta">
              Account Balance
            </Text>
            <TouchableOpacity
              onPress={() => setIsAmountVisible(!isAmountVisible)}
              className="p-1"
            >
              {isAmountVisible ? (
                <EyeOff size={16} color="white" />
              ) : (
                <Eye size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>
          <Text className="text-3xl font-groteskBold mb-3 mt-1 text-white">
            {isAmountVisible ? "2,458.00" : "••••"}
          </Text>
          <Text className="text-blue-100 text-xs font-medium">
            +2.5% from last month
          </Text>
        </View>

        {/* Vertical Divider */}
        <View className="h-12 w-px bg-blue-50/50 mx-6" />

        {/* Rewards */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-sm font-jakarta">
              Your Rewards
            </Text>
            <TouchableOpacity
              onPress={() => setIsPointsVisible(!isPointsVisible)}
              className="p-1"
            >
              {isPointsVisible ? (
                <EyeOff size={16} color="white" />
              ) : (
                <Eye size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>
          <Text className="text-2xl font-groteskBold text-white my-2">
            {isPointsVisible ? "1,250 pts" : "•••• pts"}
          </Text>
          <Text className="text-purple-100 text-xs font-medium">
            +150 pts this week
          </Text>
        </View>
      </View>

      <Animated.View
        style={{ transform: [{ scale: scaleAnim }] }}
        className="mt-6 self-center"
      >
        <TouchableOpacity
          onPress={handleShowMore}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="flex-row items-center justify-center bg-transparent border border-white/30 py-2 px-6 rounded-xl"
          activeOpacity={0.8}
        >
          <Text className="text-white font-jakartaBold text-base mr-2">
            View More
          </Text>
          <Animated.View
            style={{
              transform: [
                {
                  translateX: arrowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 4],
                  }),
                },
              ],
            }}
          >
            <ChevronRight size={18} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

export default AccountCard
