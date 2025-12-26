import { useThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

interface DriverInfo {
  name: string;
  profileImage: string;
  wallet: number;
  assignedBus?: {
    busNumber: string;
    status: string;
    capacity: number;
    currentStop?: string;
    nextDestination?: string;
  };
  todayTrips: number;
}

export default function DriverHome() {
  const router = useRouter();
  const { colors, actualTheme } = useThemeContext();
  const [driver, setDriver] = useState<DriverInfo | null>(null);

  const gradientColors =
    actualTheme === "dark"
      ? ["#4C1D95", "#9333EA", "#C084FC"]
      : ["#F472B6", "#EC4899", "#DB2777"];

  useEffect(() => {
    const fetchDriver = async () => {
      // TODO: Replace with real API call
      setDriver({
        name: "Samuel Tale.",
        profileImage: "https://randomuser.me/api/portraits/men/75.jpg",
        wallet: 1850.5,
        todayTrips: 4,
        assignedBus: {
          busNumber: "ETH-1223",
          status: "ACTIVE",
          capacity: 45,
          currentStop: "Bole",
          nextDestination: "Piassa",
        },
      });
    };
    fetchDriver();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const startTrip = () => {
    // TODO: Trigger trip start + live tracking logic
    Alert.alert("Trip Started", "Live tracking is now active!");
    // Here you could update DB / WebSocket / GPS tracking
  };

  const goToWallet = () => {
    router.push("/(driver)/tabs/earning"); // navigate to Earning page
  };

  if (!driver) return null;

  return (
    <>
      <StatusBar
        translucent
        barStyle={actualTheme === "dark" ? "light-content" : "dark-content"}
      />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-6 pb-10 h-80 pt-10 mb-3"
        >
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <Image
                source={{ uri: driver.profileImage }}
                className="w-14 h-14 rounded-full border-2 border-white mr-3"
              />
              <View>
                <Text className="text-sm font-jakarta text-white">
                  {getGreeting()}
                </Text>
                <Text className="text-xl font-groteskBold text-white">
                  {driver.name}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <TouchableOpacity
                className="bg-white/20 p-3 rounded-full mr-3"
                onPress={() => router.push("/(driver)/driverSearch")}
              >
                <Search size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-white/20 p-3 rounded-full"
                onPress={() => router.push("/(driver)/qrScanner")}
              >
                <Ionicons
                  name="qr-code-outline"
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.card }}
          >
            <Text
              className="text-base font-geist mb-1"
              style={{ color: colors.text }}
            >
              Wallet Balance
            </Text>
            <Text
              className="text-2xl font-groteskBold mb-2"
              style={{ color: colors.text }}
            >
              ${driver.wallet.toFixed(2)}
            </Text>

            {driver.assignedBus && (
              <View className="mt-3">
                <Text
                  className="text-sm font-jakarta mb-1"
                  style={{ color: colors.mutedText }}
                >
                  Assigned Bus
                </Text>
                <Text
                  className="text-lg font-groteskBold"
                  style={{ color: colors.text }}
                >
                  {driver.assignedBus.busNumber} • {driver.assignedBus.status}
                </Text>
                <Text
                  className="text-sm font-jakarta mt-1"
                  style={{ color: colors.mutedText }}
                >
                  {driver.assignedBus.currentStop} →{" "}
                  {driver.assignedBus.nextDestination}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <ScrollView
          className="flex-1 -mt-8"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              paddingTop: 24,
            }}
          >
            <View className="px-4 mb-6">
              <Text
                className="text-lg font-geist mb-2"
                style={{ color: colors.text }}
              >
                Today's Trips
              </Text>
              {driver.todayTrips > 0 ? (
                <Text
                  className="text-sm font-jakarta"
                  style={{ color: colors.mutedText }}
                >
                  You have {driver.todayTrips} trips scheduled today.
                </Text>
              ) : (
                <Text
                  className="text-sm font-jakarta"
                  style={{ color: colors.mutedText }}
                >
                  No trips scheduled today.
                </Text>
              )}
            </View>

            <View className="flex-row justify-around px-4">
              <TouchableOpacity
                className="flex-1 mx-2 p-4 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
                onPress={startTrip}
              >
                <Ionicons name="car-sport" size={24} color="#fff" />
                <Text className="text-white font-jakarta mt-1">Start Trip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 mx-2 p-4 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
                onPress={goToWallet}
              >
                <Ionicons name="wallet" size={24} color="#fff" />
                <Text className="text-white font-jakarta mt-1">Wallet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
