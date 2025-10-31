import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { ArrowRight, Phone, ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import AlertModal from "../../../components/utils/AlertModal";

export default function PhoneAuth() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const router = useRouter();

  const COUNTRY_CODE = "+251";
  const PHONE_NUMBER_LENGTH = 9;

  const showAlert = (config) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  const handleContinue = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    const cleanedPhone = phoneNumber.replace(/\D/g, "");

    if (cleanedPhone.length !== PHONE_NUMBER_LENGTH) {
      Alert.alert("Error", "Please enter a valid 9-digit phone number");
      return;
    }

    if (!cleanedPhone.startsWith("9")) {
      Alert.alert("Error", "Ethiopian phone numbers must start with 9");
      return;
    }

    const fullPhoneNumber = `${COUNTRY_CODE}${cleanedPhone}`;
    setIsLoading(true);

    try {
      console.log("Full phone number:", fullPhoneNumber);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showAlert({
        type: "success",
        title: "Code Sent!",
        message: `Verification code has been sent to ${formatDisplayNumber(cleanedPhone)}`,
        primaryButtonText: "Enter Code",
        onPrimaryPress: () => {
          // Navigate to OTP screen
          console.log("Navigate to OTP screen");
        },
      });
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to send verification code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (text) => {
    const cleaned = text.replace(/\D/g, "");
    const limited = cleaned.slice(0, PHONE_NUMBER_LENGTH);

    let formatted = limited;
    if (limited.length > 3 && limited.length <= 6) {
      formatted = `${limited.slice(0, 3)} ${limited.slice(3)}`;
    } else if (limited.length > 6) {
      formatted = `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6, 9)}`;
    }

    setPhoneNumber(formatted);
  };

  const formatDisplayNumber = (number) => {
    const cleaned = number.replace(/\D/g, "");
    if (cleaned.length <= 3) return `${COUNTRY_CODE} ${cleaned}`;
    if (cleaned.length <= 6)
      return `${COUNTRY_CODE} ${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${COUNTRY_CODE} ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Back Button */}
          <View className="px-6 pb-8 pt-7">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center mb-8 bg-transparent"
            >
              <ChevronLeft size={28} color="#00897B" />
              <Text className="text-deepTeal text-lg font-inter ml-2 bg-transparent">
                Back
              </Text>
            </TouchableOpacity>

            {/* Welcome Section */}
            <View className="mb-2">
              <Text className="text-4xl font-bold text-charcoal font-jakarta mb-3">
                Welcome
              </Text>
              <Text className="text-lg text-slateGray  leading-6 font-jakarta">
                Enter your phone number to continue. We'll send you a
                verification code.
              </Text>
            </View>
          </View>

          {/* Main Content */}
          <View className="flex-1 bg-mistGray rounded-t-3xl px-3 pt-6 pb-6">
            {/* Phone Input Card */}
            <View className="bg-white rounded-2xl p-6 mb-8">
              <Text className="text-sm font-semibold text-charcoal mb-4 font-inter uppercase tracking-wide">
                Phone Number
              </Text>

              {/* Input Container */}
              <View className="border-2 border-gray-100 rounded-xl px-3 py-3 bg-white mb-3">
                <View className="flex-row items-center">
                  <View className="flex-row items-center bg-deepTeal/10 rounded-lg px-3 py-2 mr-3">
                    <Phone size={18} color="#00897B" />
                    <Text className="text-deepTeal font-semibold ml-2 font-inter">
                      {COUNTRY_CODE}
                    </Text>
                  </View>

                  <View className="flex-1 flex-row items-center">
                    <Text className="text-lg text-charcoal font-inter mr-1">
                      |
                    </Text>
                    <TextInput
                      className="flex-1 text-lg text-charcoal font-inter py-2"
                      placeholder="9 12 345 678"
                      placeholderTextColor="#9CA3AF"
                      value={phoneNumber}
                      onChangeText={formatPhoneNumber}
                      keyboardType="phone-pad"
                      maxLength={11}
                      autoFocus
                      editable={!isLoading}
                    />
                  </View>
                </View>
              </View>

              {/* Helper Text */}
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-slateGray font-inter">
                  Ethiopian number starting with 9
                </Text>
                <Text className="text-xs text-slateGray font-inter">
                  {phoneNumber.replace(/\D/g, "").length}/{PHONE_NUMBER_LENGTH}
                </Text>
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              onPress={handleContinue}
              disabled={
                isLoading ||
                phoneNumber.replace(/\D/g, "").length !== PHONE_NUMBER_LENGTH
              }
              className={`rounded-xl py-5 px-6 shadow-lg mb-4 flex-row items-center justify-center ${
                isLoading ||
                phoneNumber.replace(/\D/g, "").length !== PHONE_NUMBER_LENGTH
                  ? "bg-gray-300"
                  : "bg-deepTeal"
              }`}
            >
              <Text className="text-white text-lg font-semibold font-inter mr-2">
                {isLoading ? "Sending Code..." : "Continue"}
              </Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="text-slateGray font-inter mx-4">OR</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Alternative Options */}
            <TouchableOpacity
              onPress={() => {
                /* Alternative action */
              }}
              className="rounded-xl py-4 px-6 border-2 border-limeGreen/25 bg-limeGreen/10 mb-4"
            >
              <Text className="text-charcoal text-center text-base font-semibold font-inter">
                Sign In with Email
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            <View className="mt-8 px-4">
              <Text className="text-center text-slateGray text-xs font-inter leading-5">
                By continuing, you agree to our{" "}
                <Text className="text-deepTeal font-semibold">
                  Terms of Service
                </Text>{" "}
                and{" "}
                <Text className="text-deepTeal font-semibold">
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AlertModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        type="success"
        title="Verification Code Sent!"
        message="We've sent a 6-digit verification code to your phone number. Please check your messages and enter the code to continue."
        primaryButtonText="Enter Code"
        secondaryButtonText="Resend Code"
        maxWidth={380} // Custom max width
        minWidth={320} // Custom min width
      />
    </>
  );
}
