import AccountCard from "@/components/utils/AccountCard"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Search } from "lucide-react-native"
import { Image, StatusBar, Text, TouchableOpacity, View } from "react-native"

const PassengerHome = () => {
  const router = useRouter()

  return (
    <View className="bg-white h-screen">
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Gradient Header Section */}
      <LinearGradient
        colors={["#ea580c", "#f97316", "#fb923c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-6 pb-10 h-80 pt-10"
      >
        {/* Top Row: Profile + Search */}
        <View className="flex-row justify-between items-center mb-9">
          {/* Left: Profile + Greeting */}
          <View className="flex-row items-center">
            <Image
              source={{
                uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCIyTZVXyb90oYHRiiX6YkNUc0CnzGwWjI3Q&s",
              }}
              className="w-14 h-14 rounded-full border-2 border-white mr-3"
            />
            <View>
              <Text className="text-white text-sm font-jakarta">
                {getGreeting()}
              </Text>
              <Text className="text-white text-xl font-groteskBold">
                Samuel Tale
              </Text>
            </View>
          </View>

          {/* Right: Search Button */}
          <TouchableOpacity
            className="bg-white/20 p-3 rounded-full"
            onPress={() => router.push("/(passenger)/search")}
          >
            <Search size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Account Summary Card */}
        <AccountCard />
      </LinearGradient>
    </View>
  )
}

const getGreeting = () => {
  const currentHour = new Date().getHours()

  let greeting = ""

  if (currentHour < 12) {
    greeting = "Good morning"
  } else if (currentHour < 18) {
    greeting = "Good afternoon"
  } else {
    greeting = "Good evening"
  }

  return `${greeting}`
}

export default PassengerHome
