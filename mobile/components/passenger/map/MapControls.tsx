import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { LatLng } from "react-native-maps"

interface MapControlsProps {
  userLocation: LatLng | null
  heatmapMode: boolean
  setHeatmapMode: (value: boolean) => void
  showMyTrips: boolean
  setShowMyTrips: () => void
  focusOnUserLocation: () => void
  colors: any
}

export const MapControls = ({
  userLocation,
  heatmapMode,
  setHeatmapMode,
  showMyTrips,
  setShowMyTrips,
  focusOnUserLocation,
  colors,
}: MapControlsProps) => {
  return (
    <View className="absolute bottom-32 left-8 gap-3 z-50">
      {/* My Location button */}
      <TouchableOpacity
        className="w-12 h-12 rounded-2xl items-center justify-center relative overflow-hidden"
        style={{
          backgroundColor: colors.card,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
          borderWidth: 1,
          borderColor: colors.primary + "20",
        }}
        onPress={focusOnUserLocation}
        activeOpacity={0.7}
      >
        <View
          className="absolute inset-0 opacity-10"
          style={{ backgroundColor: colors.primary }}
        />
        <Ionicons name="locate" size={22} color={colors.primary} />

        {/* Live indicator dot */}
        {userLocation && (
          <View className="absolute -top-1 -right-1">
            <View className="w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
          </View>
        )}
      </TouchableOpacity>

      {/* My Trips button */}
      <TouchableOpacity
        className="w-12 h-12 rounded-2xl items-center justify-center relative overflow-hidden"
        style={{
          backgroundColor: showMyTrips ? colors.primary : colors.card,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
          borderWidth: showMyTrips ? 0 : 1,
          borderColor: colors.primary + "20",
        }}
        onPress={setShowMyTrips}
        activeOpacity={0.7}
      >
        {!showMyTrips && (
          <View
            className="absolute inset-0 opacity-10"
            style={{ backgroundColor: colors.primary }}
          />
        )}

        <MaterialCommunityIcons
          name="bag-suitcase"
          size={22}
          color={showMyTrips ? "#FFFFFF" : colors.primary}
        />

        {/* Trip count badge */}
        {!showMyTrips && (
          <View
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white text-[10px] font-bold px-1">3</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Heatmap button */}
      <TouchableOpacity
        className="w-12 h-12 rounded-2xl items-center justify-center relative overflow-hidden"
        style={{
          backgroundColor: heatmapMode ? colors.primary : colors.card,
          shadowColor: heatmapMode ? colors.primary : "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: heatmapMode ? 0.3 : 0.15,
          shadowRadius: heatmapMode ? 12 : 8,
          elevation: 8,
          borderWidth: heatmapMode ? 0 : 1,
          borderColor: colors.primary + "20",
        }}
        onPress={() => setHeatmapMode(!heatmapMode)}
        activeOpacity={0.7}
      >
        {!heatmapMode && (
          <View
            className="absolute inset-0 opacity-10"
            style={{ backgroundColor: colors.primary }}
          />
        )}

        <MaterialCommunityIcons
          name="thermometer"
          size={22}
          color={heatmapMode ? "#FFFFFF" : colors.primary}
        />
      </TouchableOpacity>

      {/* Decorative zoom indicator */}
      <View className="absolute -left-16 top-16 h-20 w-12 items-end justify-around">
        <View
          className="w-8 h-[2px] rounded-full"
          style={{ backgroundColor: colors.primary + "30" }}
        />
        <View
          className="w-6 h-[2px] rounded-full"
          style={{ backgroundColor: colors.primary + "20" }}
        />
        <View
          className="w-4 h-[2px] rounded-full"
          style={{ backgroundColor: colors.primary + "10" }}
        />
      </View>

      {/* Trips label */}
      {!showMyTrips && (
        <View
          className="absolute -left-20 top-32 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: colors.card }}
        >
          <Text
            className="text-xs font-medium"
            style={{ color: colors.primary }}
          >
            Trips
          </Text>
        </View>
      )}
    </View>
  )
}
