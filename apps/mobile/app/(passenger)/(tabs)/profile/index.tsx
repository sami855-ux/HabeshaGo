import {
  StatusBar,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Camera,
} from "lucide-react-native"

const ProfilePage = () => {
  const [name] = useState("Abebe Kebede")
  const [email] = useState("abebe@example.com")
  const [phone] = useState("+251 911 234 567")

  return (
    <>
      <StatusBar translucent barStyle="light-content" />
      <ScrollView className="flex-1 bg-gray-50">
        {/* Hero Header with Gradient */}
        <LinearGradient
          colors={["#ea580c", "#f97316", "#fb923c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="pt-16 pb-24 px-6 rounded-b-3xl"
        >
          <View className="items-center">
            {/* Avatar with Camera Button */}
            <View className="relative">
              <View className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-xl border-4 border-white/40 flex items-center justify-center">
                <User size={56} color="#FFFFFF" />
              </View>
              <TouchableOpacity className="absolute bottom-1 right-1 bg-white rounded-full p-3 shadow-lg">
                <Camera size={18} color="#ea580c" />
              </TouchableOpacity>
            </View>

            <Text className="text-white text-2xl font-groteskBold mt-5">
              {name}
            </Text>
            <Text className="text-orange-100 text-sm mt-1">Premium Member</Text>
          </View>

          {/* Stats Cards */}
          <View className="flex-row justify-around mt-8 -mb-16">
            <View className="bg-white rounded-2xl px-6 py-4 shadow-xl">
              <Text className="text-gray-500 text-xs">Total Balance</Text>
              <Text className="text-2xl font-groteskBold text-gray-800 mt-1">
                ETB 12,450
              </Text>
            </View>
            <View className="bg-white rounded-2xl px-6 py-4 shadow-xl">
              <Text className="text-gray-500 text-xs">Transactions</Text>
              <Text className="text-2xl font-groteskBold text-gray-800 mt-1">
                248
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Content Below */}
        <View className="px-6 mt-20">
          {/* Personal Info */}
          <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
            <Text className="text-lg font-groteskBold text-gray-800 mb-4">
              Personal Information
            </Text>

            <View className="flex-row items-center">
              <Phone size={20} color="#ea580c" />
              <Text className="ml-4 text-gray-700">{phone}</Text>
            </View>
            <View className="flex-row items-center">
              <MapPin size={20} color="#ea580c" />
              <Text className="ml-4 text-gray-700">Addis Ababa, Ethiopia</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
          <Text className="text-lg font-groteskBold text-gray-800 mb-4">
            Account & Settings
          </Text>

          <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <CreditCard size={22} color="#f97316" />
              <Text className="ml-4 text-gray-700">Payment Methods</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <Bell size={22} color="#f97316" />
              <Text className="ml-4 text-gray-700">Notifications</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <Shield size={22} color="#f97316" />
              <Text className="ml-4 text-gray-700">Security & Privacy</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row justify-between items-center py-4">
            <View className="flex-row items-center">
              <HelpCircle size={22} color="#f97316" />
              <Text className="ml-700">Help & Support</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity className="bg-white rounded-2xl p-5 shadow-sm flex-row items-center justify-center">
          <LogOut size={22} color="#dc2626" />
          <Text className="ml-3 text-red-600 font-groteskSemiBold">
            Log Out
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-400 text-xs mt-8 mb-10">
          Version 2.4.1 • Made with love in Ethiopia
        </Text>
      </ScrollView>
    </>
  )
}

export default ProfilePage
