import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { Car, Train, Globe, Apple } from "lucide-react-native";
import { FontAwesome } from "@expo/vector-icons"; // For Google
import { AntDesign } from "@expo/vector-icons";

export default function Welcome() {
  return (
    <ImageBackground
      source={require("@/assets/images/222.jpg")}
      resizeMode="cover"
      className="w-full h-full absolute top-0 left-0 flex items-center justify-end"
    >
      <View className="w-[97%] h-[48vh] bg-white/85 rounded-[34px] px-7 py-8">
        <Train color={"black"} size={25} />
        <Text className="font-interBold text-3xl pt-5">Get Started</Text>
        <Text className="font-inter pt-2 text-gray-900 tracking-wide">
          Your gateway to seamless transportation solutions. Explore, connect,
          and move smarter.
        </Text>
        <TouchableOpacity className="w-full h-16 bg-black/90 rounded-xl mt-5 flex justify-center items-center">
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
            <AntDesign name="apple" size={28} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
