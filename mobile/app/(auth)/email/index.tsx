import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import {
  Mail,
  ArrowRight,
  Clock,
  RotateCcw,
  CheckCircle2,
  Shield,
  Sparkles,
  Zap,
  Lock,
} from "lucide-react-native";
import AlertModal from "@/components/utils/AlertModal";

const { width } = Dimensions.get("window");

const ContinueWithEmail = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [activeInput, setActiveInput] = useState(0);

  const inputRefs = useRef([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  // Function to show alert modal
  const showAlert = (config) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  // Pulse animation for CTA button
  useEffect(() => {
    if (!codeSent && email.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [email, codeSent]);

  // Progress animation for timer
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (60 - timeLeft) / 60,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  useEffect(() => {
    if (codeSent) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [codeSent]);

  useEffect(() => {
    if (!codeSent || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, codeSent]);

  const handleContinue = async () => {
    if (!email) {
      triggerShake();
      Alert.alert("Oops!", "Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      triggerShake();
      showAlert({
        type: "error",
        title: "Invalid Email",
        message: "Please enter a valid email address",
        primaryButtonText: "Got it",
      });
      // Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setCodeSent(true);
      setTimeLeft(60);
      // Focus first code input
      setTimeout(() => inputRefs.current[0]?.focus(), 500);
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error",
        message: "Failed to send verification code. Please try again",
        primaryButtonText: "Got it",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);

    // Auto-advance to next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (newCode.every((digit) => digit !== "") && index === 5) {
      handleVerifyCode();
    }
  };

  const handleCodeKeyPress = (e: any, index: number) => {
    if (
      e.nativeEvent.key === "Backspace" &&
      !verificationCode[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = () => {
    const code = verificationCode.join("");
    if (code.length !== 6) {
      triggerShake();

      Alert.alert("Incomplete Code", "Please enter all 6 digits");
      return;
    }

    Alert.alert("Success!", "Your email has been verified successfully! 🎉");
  };

  const handleResendCode = async () => {
    if (timeLeft > 0) return;

    setIsResending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setTimeLeft(60);
      setVerificationCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      Alert.alert("Code Sent!", "New verification code has been sent!");
    } catch (error) {
      Alert.alert("Error", "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 justify-center bg-white">
            {/* Animated Background Elements */}
            <View className="absolute bottom-40 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl" />

            {/* Header */}
            <View className="items-center mb-12">
              <Animated.View
                className="w-28 h-28 bg-black/5 rounded-full items-center justify-center mb-6 shadow-2xl shadow-purple-500/30"
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <Shield size={36} color="#A78BFA" />
              </Animated.View>

              <Text className="text-4xl font-groteskBold text-light-text-primary mb-3 text-center">
                {codeSent ? "Verify Your Email" : "Continue With Email!"}
              </Text>
              <Text className="text-lg text-light-text-secondary font-geist text-center leading-6 mb-2">
                {codeSent
                  ? `We've sent a magic code to`
                  : "Enter your email to continue your journey"}
              </Text>
              {codeSent && (
                <View className="flex-row items-center mt-2 bg-white/10 px-4 py-2 rounded-full">
                  <Mail size={16} color="#222" />
                  <Text className="text-lg font-semibold text-light-text-primary font-geist ml-2">
                    {email}
                  </Text>
                </View>
              )}
            </View>

            <Animated.View
              style={{
                transform: [{ translateX: shakeAnim }],
              }}
            >
              {/* Email Input */}
              <View className="mb-8">
                <View className="flex-row items-center mb-3">
                  <Mail size={18} color="#222" />
                  <Text className="text-sm font-semibold font-geist text-light-text-primary ml-2">
                    EMAIL ADDRESS
                  </Text>
                </View>
                <View className="relative">
                  <TextInput
                    className="w-full bg-white/10 border-2 border-gray-200 rounded-lg px-6 py-3 text-lg font-medium text-gray-700 font-geist placeholder-purple-300"
                    placeholder="your@email.com"
                    placeholderTextColor="#777"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!isLoading && !codeSent}
                  />
                  {email && (
                    <TouchableOpacity
                      className="absolute right-4 top-5 bg-white/20 w-6 h-6 rounded-full items-center justify-center"
                      onPress={() => setEmail("")}
                    >
                      <Text className="text-light-text-secondary text-sm font-bold">
                        x
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Verification Code Input - Animated */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
                className={codeSent ? "block" : "hidden"}
              >
                <View className="mb-6">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <Lock size={18} color="#222" />
                      <Text className="text-sm font-semibold font-geist text-light-text-primary ml-2">
                        6-DIGIT VERIFICATION CODE
                      </Text>
                    </View>
                    <View className="flex-row items-center  bg-white/10 px-3 py-1 rounded-full">
                      <Clock
                        size={14}
                        color={timeLeft > 10 ? "#139419" : "#EF4444"}
                      />
                      <Text
                        className={`text-sm font-groteskBold ml-1 ${timeLeft > 10 ? "text-green-600" : "text-red-400"}`}
                      >
                        {formatTime(timeLeft)}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View className="w-full bg-white/10 rounded-full h-1 mb-6 overflow-hidden">
                    <Animated.View
                      style={{ width: progressWidth }}
                      className="h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-full"
                    />
                  </View>

                  {/* Code Inputs Grid */}
                  <View className="flex-row justify-between mb-6">
                    {verificationCode.map((digit, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => inputRefs.current[index]?.focus()}
                        className={`w-12 h-14 rounded-xl border-2 items-center justify-center ${
                          activeInput === index
                            ? "border-green-600 bg-green-400/20"
                            : digit
                              ? "border-green-400 bg-green-400/20"
                              : "border-black/25 bg-white/5"
                        }`}
                      >
                        <TextInput
                          ref={(ref) => (inputRefs.current[index] = ref)}
                          className="w-full text-center text-light-text-primary font-groteskBold text-xl "
                          value={digit}
                          onChangeText={(text) => handleCodeChange(text, index)}
                          onKeyPress={(e) => handleCodeKeyPress(e, index)}
                          onFocus={() => setActiveInput(index)}
                          keyboardType="number-pad"
                          maxLength={1}
                          selectTextOnFocus
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Resend Code */}
                  <View className="flex-row justify-center items-center space-x-3 mb-6">
                    <Text className="text-light-text-primary text-sm">
                      Didn't receive the code?
                    </Text>
                    <TouchableOpacity
                      onPress={handleResendCode}
                      disabled={timeLeft > 0 || isResending}
                      className="flex-row items-center space-x-4 bg-white/10 px-4 py-2 rounded-full"
                    >
                      <RotateCcw
                        size={16}
                        color={
                          timeLeft > 0 || isResending ? "#6B7280" : "#A78BFA"
                        }
                      />
                      <Text
                        className={`text-sm font-semibold pl-2 ${
                          timeLeft > 0 || isResending
                            ? "text-gray-400"
                            : "text-red-500"
                        }`}
                      >
                        {isResending ? "Sending..." : "Resend Code"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </Animated.View>

            {/* Action Buttons */}
            <View className="space-y-4">
              {!codeSent ? (
                <Animated.View>
                  <TouchableOpacity
                    className={`w-full bg-green-500 rounded-lg py-4 flex-row items-center justify-center shadow-2xl shadow-purple-500/40 ${
                      isLoading ? "opacity-80" : ""
                    }`}
                    onPress={handleContinue}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <View className="flex-row items-center">
                        <Text className="text-light-text-inverse font-geist text-lg mr-3">
                          Sending Magic Code...
                        </Text>
                      </View>
                    ) : (
                      <>
                        <Text className="text-light-text-inverse font-geist text-lg">
                          Send Verification Code
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <TouchableOpacity
                  className="w-full bg-green-500 rounded-lg py-4 flex-row items-center justify-center shadow-2xl shadow-green-400/30"
                  onPress={handleVerifyCode}
                  disabled={verificationCode.join("").length !== 6}
                >
                  <Text className="text-white font-geist text-lg">
                    Verify & Continue
                  </Text>
                </TouchableOpacity>
              )}

              {codeSent && (
                <TouchableOpacity
                  className="w-full border-2 border-white/20 rounded-2xl py-4 mt-2"
                  onPress={() => {
                    setCodeSent(false);
                    setVerificationCode(["", "", "", "", "", ""]);
                  }}
                >
                  <Text className="text-light-text-primary font-geist font-semibold text-center text-base">
                    Change Email Address
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Security Footer */}
            <View className="mt-12 px-4">
              <View className="flex-row items-center justify-center mb-3">
                <Shield size={14} color="#222" />
                <Text className="text-sm text-light-text-secondary text-center ml-2">
                  Your data is securely encrypted and protected
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Alert Modal - Add this at the end */}
      <AlertModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        {...alertConfig}
      />
    </>
  );
};

export default ContinueWithEmail;
