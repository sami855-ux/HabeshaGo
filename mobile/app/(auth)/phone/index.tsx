import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Phone,
  ArrowRight,
} from "lucide-react-native";

import AlertModal from "@/components/utils/AlertModal";

const PhoneNumberScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  // Function to show alert modal
  const showAlert = (config) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  const validatePhoneNumber = (number: string) => {
    // Remove any non-digit characters
    const cleanNumber = number.replace(/\D/g, "");

    // Ethiopian number validation: must start with 9 or 7 and be 9 digits after country code
    if (cleanNumber.length === 9) {
      const firstDigit = cleanNumber.charAt(0);
      return firstDigit === "9" || firstDigit === "7";
    }
    return false;
  };

  const handlePhoneNumberChange = (text: string) => {
    // Remove any non-digit characters
    const cleanText = text.replace(/\D/g, "");

    // Format the number as user types
    let formattedText = "";
    if (cleanText.length > 0) {
      formattedText = cleanText;
      if (cleanText.length > 3) {
        formattedText = `${cleanText.slice(0, 3)} ${cleanText.slice(3)}`;
      }
      if (cleanText.length > 6) {
        formattedText = `${cleanText.slice(0, 3)} ${cleanText.slice(3, 6)} ${cleanText.slice(6, 9)}`;
      }
    }

    setPhoneNumber(formattedText);

    // Validate the number (without spaces)
    const isValidNumber = validatePhoneNumber(cleanText);
    setIsValid(isValidNumber);
  };

  const handleContinue = () => {
    const cleanNumber = phoneNumber.replace(/\D/g, "");

    if (!validatePhoneNumber(cleanNumber)) {
      showAlert({
        type: "error",
        title: "Invalid Phone Number",
        message:
          "Please enter a valid Ethiopian phone number starting with 9 or 7 (e.g., 978109304)",
        primaryButtonText: "Got it",
      });
      return;
    }

    const fullNumber = `+251${cleanNumber}`;

    showAlert({
      type: "success",
      title: "Code Sent!",
      message: `Verification code has been sent to ${fullNumber}`,
      primaryButtonText: "Enter Code",
      onPrimaryPress: () => {
        // Navigate to OTP verification screen
        console.log("Navigate to OTP screen");
        // router.push('/verify-otp');
      },
    });
  };

  const getInputBorderColor = () => {
    if (!isValid && phoneNumber.length >= 9) return "border-red-500";
    if (isFocused) return "border-blue-500";
    return "border-gray-300";
  };

  const isContinueDisabled =
    !isValid || phoneNumber.replace(/\D/g, "").length < 9;

  return (
    <>
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            className="flex-1"
          >
            <View className="flex-1 px-6 py-16 justify-between">
              {/* Header Section */}
              <View className="items-center mb-12">
                <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center mb-6">
                  <Phone size={32} color="#007AFF" />
                </View>
                <Text className="text-3xl font-groteskBold  text-gray-900 mb-3 text-center">
                  Continue With Your Phone
                </Text>
                <Text className="text-base font-geist text-gray-600 text-center leading-6 px-4">
                  We'll send you a verification code to confirm your phone
                  number
                </Text>
              </View>

              {/* Phone Input Section */}
              <View className="mb-8">
                <Text className="text-xs font-geist font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                  Phone Number
                </Text>

                <View
                  className={`flex-row items-center border-2 rounded-xl bg-white h-14 px-4 ${getInputBorderColor()}`}
                >
                  {/* Country Code */}
                  <TouchableOpacity className="flex-row items-center min-w-16">
                    <Text className="text-base font-semibold text-gray-900 mr-1 font-geist pl-4">
                      +251
                    </Text>
                  </TouchableOpacity>

                  {/* Separator */}
                  <View className="w-px h-6 bg-gray-300 mx-3" />

                  {/* Phone Number Input */}
                  <View className="flex-1 flex-row items-center">
                    <TextInput
                      className="flex-1 text-base font-medium text-gray-900 py-2 font-geist"
                      placeholder="912 345 678"
                      placeholderTextColor="#9CA3AF"
                      value={phoneNumber}
                      onChangeText={handlePhoneNumberChange}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      keyboardType="phone-pad"
                      maxLength={11}
                      autoComplete="tel"
                    />

                    {/* Validation Icon */}
                    {isValid && phoneNumber.replace(/\D/g, "").length === 9 && (
                      <CheckCircle size={20} color="#10B981" className="ml-2" />
                    )}
                  </View>
                </View>

                {/* Validation Message */}
                {!isValid && phoneNumber.replace(/\D/g, "").length >= 9 && (
                  <View className="flex-row items-center mt-2 ml-1">
                    <AlertCircle size={16} color="#EF4444" />
                    <Text className="text-sm text-red-500 ml-1 font-geist">
                      Phone number must start with 9 or 7
                    </Text>
                  </View>
                )}

                {/* Format Hint */}
                <View className="mt-2 ml-1">
                  <Text className="text-sm text-gray-500 italic font-geist">
                    Format: 9XX XXX XXX or 7XX XXX XXX
                  </Text>
                </View>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                className={`flex-row items-center justify-center h-14 rounded-xl ${
                  isContinueDisabled ? "bg-gray-300" : "bg-blue-500"
                }`}
                onPress={handleContinue}
                disabled={isContinueDisabled}
              >
                <Text
                  className={`text-base font-semibold mr-2 font-geist ${
                    isContinueDisabled ? "text-gray-500" : "text-white"
                  }`}
                >
                  Continue
                </Text>
                <ArrowRight
                  size={20}
                  color={isContinueDisabled ? "#9CA3AF" : "#FFFFFF"}
                />
              </TouchableOpacity>

              {/* Footer */}
              <View className="mt-8">
                <Text className="text-xs text-gray-500 text-center font-geist">
                  By continuing, you agree to our{" "}
                  <Text className="text-blue-500">Terms of Service</Text> and{" "}
                  <Text className="text-blue-500">Privacy Policy</Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Alert Modal - Add this at the end */}
      <AlertModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        {...alertConfig}
      />
    </>
  );
};

export default PhoneNumberScreen;
