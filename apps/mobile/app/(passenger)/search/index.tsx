import {
  ArrowUp,
  Clock,
  Filter,
  Flame,
  MapPin,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  X,
} from "lucide-react-native"
import React, { useState } from "react"
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState([
    "Nearby bus stations",
    "Light rail schedule",
    "Traffic updates",
    "Parking availability",
  ])
  const [trendingSearches, setTrendingSearches] = useState([
    { name: "Electric taxi services", trend: "trending" },
    { name: "Smart parking zones", trend: "popular" },
    { name: "Bus route 12 (Megenagna–CMC)", trend: "rising" },
    { name: "E-bike rentals", trend: "new" },
  ])

  const colors = ["#00796B", "#FFB300", "#66BB6A"]

  const clearSearch = () => {
    setSearchQuery("")
  }

  const removeRecentSearch = (index: number) => {
    setRecentSearches((prev) => prev.filter((_, i) => i !== index))
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "trending":
        return <Flame size={14} color={colors[0]} />
      case "popular":
        return <Star size={14} color={colors[1]} />
      case "rising":
        return <ArrowUp size={14} color={colors[2]} />
      case "new":
        return <Sparkles size={14} color={colors[0]} />
      default:
        return <TrendingUp size={14} color={colors[1]} />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "trending":
        return "text-teal-700"
      case "popular":
        return "text-amber-600"
      case "rising":
        return "text-green-600"
      case "new":
        return "text-teal-700"
      default:
        return "text-amber-600"
    }
  }

  return (
    <View className="flex-1 bg-white pt-12">
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Header */}
      <View className="px-6 pb-6">
        <Text className="text-3xl font-groteskBold text-gray-900 mb-2">
          Discover
        </Text>
        <Text className="text-gray-500 font-jakarta">
          Find transport, routes, and smart city updates
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-6 pb-6">
        <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
          <Search size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 font-jakarta text-gray-900 text-base"
            placeholder="Search transport, routes, or stations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} className="p-1">
              <X size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
          <View className="w-px h-6 bg-gray-300 mx-3" />
          <TouchableOpacity className="p-1">
            <Filter size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <View className="px-6 pb-8">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Clock size={18} color="#374151" />
                <Text className="text-gray-900 font-geist text-lg ml-2">
                  Recent Searches
                </Text>
              </View>
              <TouchableOpacity>
                <Text className="text-teal-700 font-jakarta text-sm">
                  Clear all
                </Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-3 gap-1">
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                >
                  <View className="flex-row items-center">
                    <Text className="text-gray-700 font-jakarta ml-3">
                      {search}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeRecentSearch(index)}
                    className="p-1"
                  >
                    <X size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Trending Searches */}
        <View className="px-6 pb-8">
          <View className="flex-row items-center mb-4">
            <TrendingUp size={18} color="#374151" />
            <Text className="text-gray-900 font-geist text-lg ml-2">
              Trending Now
            </Text>
          </View>

          <View className="space-y-3 gap-1">
            {trendingSearches.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl px-4 py-4 border border-teal-100"
              >
                <View className="flex-row items-center">
                  <MapPin size={16} color={colors[0]} />
                  <Text className="text-gray-900 font-jakartaBold ml-3">
                    {item.name}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  {getTrendIcon(item.trend)}
                  <Text
                    className={`font-jakarta text-xs ml-1 ${getTrendColor(item.trend)}`}
                  >
                    {item.trend.charAt(0).toUpperCase() + item.trend.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default SearchPage
