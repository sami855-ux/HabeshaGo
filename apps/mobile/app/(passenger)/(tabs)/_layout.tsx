import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import { Tabs } from "expo-router"
import { Platform, Text, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

// Custom tab bar component for glass effect
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets()
  const bottomPadding = Math.max(insets.bottom, 12)

  return (
    <View
      style={{
        flexDirection: "row",
        position: "absolute",
        bottom: bottomPadding / 2,
        left: 0,
        right: 0,
        backgroundColor: "transparent",
        paddingHorizontal: 0,
        paddingBottom: bottomPadding / 10,
        zIndex: 10,
      }}
    >
      <BlurView
        intensity={20}
        tint="light"
        style={{
          flexDirection: "row",
          backgroundColor:
            Platform.OS === "ios"
              ? "rgba(255, 255, 255, 0.4)"
              : "rgba(255, 255, 255, 0.9)",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: "hidden",
          marginHorizontal: 0,
          marginBottom: 4,
          paddingBottom:
            Platform.OS === "ios"
              ? bottomPadding
              : Math.max(bottomPadding - 4, 10),
          paddingTop: 12,
          height: Platform.OS === "ios" ? 85 : 70,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          // shadowColor: "#ea580c",
          // shadowOpacity: 0.2,
          // shadowRadius: 12,
          // shadowOffset: { width: 0, height: 8 },
          // elevation: 8,
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key]
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name

          const isFocused = state.index === index

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            })
          }

          const iconName = () => {
            switch (route.name) {
              case "index":
                return isFocused ? "home" : "home-outline"
              case "map/index":
                return isFocused ? "map" : "map-outline"
              case "payment/index":
                return isFocused ? "card" : "card-outline"
              case "activity/index":
                return isFocused ? "time" : "time-outline"
              case "profile/index":
                return isFocused ? "person-circle" : "person-circle-outline"
              default:
                return "home-outline"
            }
          }

          return (
            <TouchableOpacity
              key={index}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.9}
              onPress={onPress}
              onLongPress={onLongPress}
            >
              <View
                className="rounded-full"
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: isFocused ? 16 : 12,
                  paddingVertical: isFocused ? 10 : 8,
                  backgroundColor: isFocused ? "transparent" : "transparent",
                  minWidth: 68,
                }}
              >
                <Ionicons
                  name={iconName()}
                  size={24}
                  color={isFocused ? "#ea580c" : "#6B7280"}
                />
                <Text
                  style={{
                    color: isFocused ? "#ea580c" : "#6B7280",
                    fontSize: 12,
                    fontWeight: "500",
                    marginTop: 4,
                  }}
                >
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </BlurView>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="payment/index"
        options={{
          title: "Payment",
        }}
      />
      <Tabs.Screen
        name="activity/index"
        options={{
          title: "Activity",
        }}
      />
      <Tabs.Screen
        name="map/index"
        options={{
          title: "Map",
        }}
      />

      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Account",
        }}
      />
    </Tabs>
  )
}
