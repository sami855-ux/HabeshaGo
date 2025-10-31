import React from "react";
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Train } from "lucide-react-native";
import { FontAwesome } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Make status bar blend into the background */}
      <StatusBar translucent backgroundColor="transparent" />

      <ImageBackground
        source={require("@/assets/images/222.jpg")}
        resizeMode="cover"
        style={styles.background}
      >
        <View className="w-[97%] h-[48vh] bg-white/85 rounded-[34px] px-7 py-8">
          <Train color={"black"} size={25} />
          <Text className="font-interBold text-3xl pt-5">Get Started</Text>
          <Text className="font-inter pt-2 text-gray-900 tracking-wide">
            Your gateway to seamless transportation solutions. Explore, connect,
            and move smarter.
          </Text>

          <TouchableOpacity
            className="w-full h-16 bg-black/90 rounded-xl mt-5 flex justify-center items-center"
            onPress={() => {
              router.push("/auth/phone");
            }}
          >
            <Text className="font-inter text-lg text-white">
              Continue with Phone
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="w-full h-16 bg-black/10 rounded-xl mt-4 flex justify-center items-center">
            <Text className="font-interBold text-lg text-black">
              Continue with Email
            </Text>
          </TouchableOpacity>

          <View className="w-full h-16 flex justify-center gap-4 flex-row mt-4">
            <TouchableOpacity className="w-[47%] h-full bg-black/10 rounded-xl flex items-center justify-center">
              <FontAwesome name="google" size={27} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity className="w-[47%] h-full bg-black/10 rounded-xl flex items-center justify-center">
              <AntDesign name="apple" size={28} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    width: width,
    height: height,
    justifyContent: "flex-end",
    alignItems: "center",
  },
});
