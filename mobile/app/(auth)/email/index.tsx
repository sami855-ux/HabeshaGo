import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import {
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import AlertModal from "@/components/utils/AlertModal";

export default function EmailSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [focusedField, setFocusedField] = useState("");

  const router = useRouter();

  // Animation values
  const buttonScale = useState(new Animated.Value(1))[0];
  const cardOpacity = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(20))[0];

  useEffect(() => {
    // Animate card entrance
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showAlert = (config) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  const handleSignIn = async () => {
    animateButtonPress();

    if (!email.trim() || !password.trim()) {
      showAlert({
        type: "error",
        title: "Missing Information",
        message: "Please fill in both email and password fields to continue.",
        primaryButtonText: "Got it",
      });
      return;
    }

    if (!isValidEmail(email)) {
      showAlert({
        type: "error",
        title: "Invalid Email",
        message: "Please enter a valid email address (e.g., name@example.com).",
        primaryButtonText: "Try Again",
      });
      return;
    }

    if (password.length < 6) {
      showAlert({
        type: "warning",
        title: "Password Too Short",
        message: "Password should be at least 6 characters long for security.",
        primaryButtonText: "Understand",
      });
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      showAlert({
        type: "success",
        title: "Welcome Back! 🎉",
        message: "You have successfully signed in to your account.",
        primaryButtonText: "Continue",
        onPrimaryPress: () => {
          console.log("Navigate to home screen");
        },
      });
    } catch (error) {
      showAlert({
        type: "error",
        title: "Sign In Failed",
        message:
          "Unable to sign in. Please check your credentials and try again.",
        primaryButtonText: "Retry",
        secondaryButtonText: "Reset Password",
        onSecondaryPress: handleForgotPassword,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = () => {
    showAlert({
      type: "info",
      title: "Reset Password",
      message: "A password reset link will be sent to your email address.",
      primaryButtonText: "Send Link",
      secondaryButtonText: "Cancel",
      onPrimaryPress: () => {
        console.log("Password reset email sent to:", email);
      },
    });
  };

  const handleSignUp = () => {
    showAlert({
      type: "info",
      title: "Create Account",
      message:
        "Ready to create your account? You'll be redirected to the sign up page.",
      primaryButtonText: "Continue",
      secondaryButtonText: "Not Now",
      onPrimaryPress: () => {
        console.log("Navigate to sign up screen");
      },
    });
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: "#f8fafc" }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Enhanced Header */}
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 64,
              paddingBottom: 32,
              backgroundColor: "#00897B",
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 24,
              }}
            ></View>

            <View style={{ marginBottom: 8 }}>
              <Text
                className="font-groteskBold"
                style={{
                  fontSize: 32,
                  color: "white",
                  marginBottom: 12,
                  lineHeight: 38,
                }}
              >
                Welcome Back
              </Text>
              <Text
                className="font-geist"
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 24,
                }}
              >
                Sign in to continue your journey
              </Text>
            </View>
          </View>

          {/* Enhanced Main Content */}
          <Animated.View
            className={"rounded-md relative -top-7"}
            style={{
              opacity: cardOpacity,
              transform: [{ translateY }],
              flex: 1,
              paddingHorizontal: 10,
              paddingBottom: 32,
            }}
          >
            {/* Enhanced Input Card */}
            <View
              className="bg-white/90 pt-14"
              style={{
                borderRadius: 18,
                padding: 24,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: "#f1f5f9",
              }}
            >
              {/* Email Input */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  className="font-geist"
                  style={{
                    fontSize: 15,
                    color: "#374151",
                    marginBottom: 12,
                  }}
                >
                  Email Address
                </Text>
                <View
                  className=""
                  style={[
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      backgroundColor: "white",
                      borderWidth: 2,
                    },
                    focusedField === "email"
                      ? {
                          borderColor: "#00897B",
                          backgroundColor: "rgba(0,137,123,0.05)",
                        }
                      : { borderColor: "#f1f5f9" },
                    email && !isValidEmail(email)
                      ? { borderColor: "#FF6B6B" }
                      : {},
                  ]}
                >
                  <Mail
                    size={22}
                    color={focusedField === "email" ? "#00897B" : "#9CA3AF"}
                    style={{ marginRight: 12 }}
                  />
                  <TextInput
                    className="font-geist"
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: "#374151",
                      paddingLeft: 4,
                    }}
                    placeholder="name@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!isLoading}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                {email && !isValidEmail(email) && (
                  <Text
                    className="font-geist"
                    style={{
                      color: "#FF6B6B",
                      fontSize: 12,
                      marginTop: 8,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    Please enter a valid email address
                  </Text>
                )}
              </View>

              {/* Password Input */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  className="font-geist"
                  style={{
                    fontSize: 15,
                    color: "#374151",
                    marginBottom: 12,
                  }}
                >
                  Password
                </Text>
                <View
                  style={[
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      backgroundColor: "white",
                      borderWidth: 2,
                    },
                    focusedField === "password"
                      ? {
                          borderColor: "#00897B",
                          backgroundColor: "rgba(0,137,123,0.05)",
                        }
                      : { borderColor: "#f1f5f9" },
                  ]}
                >
                  <Lock
                    size={22}
                    color={focusedField === "password" ? "#00897B" : "#9CA3AF"}
                    style={{ marginRight: 12 }}
                  />
                  <TextInput
                    className="font-geist"
                    style={{ flex: 1, fontSize: 16, color: "#374151" }}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    editable={!isLoading}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ padding: 4, borderRadius: 8 }}
                  >
                    {showPassword ? (
                      <EyeOff size={22} color="#616161" />
                    ) : (
                      <Eye size={22} color="#616161" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember Me & Forgot Password */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 24,
                }}
              >
                <TouchableOpacity
                  onPress={() => setRememberMe(!rememberMe)}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <View
                    style={[
                      {
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        borderWidth: 2,
                        marginRight: 8,
                        alignItems: "center",
                        justifyContent: "center",
                      },
                      rememberMe
                        ? { backgroundColor: "#00897B", borderColor: "#00897B" }
                        : { borderColor: "#D1D5DB" },
                    ]}
                  >
                    {rememberMe && (
                      <Text
                        className="font-geist"
                        style={{
                          color: "white",
                          fontSize: 12,
                        }}
                      >
                        ✓
                      </Text>
                    )}
                  </View>
                  <Text
                    className="font-geist"
                    style={{ color: "#374151", fontWeight: "500" }}
                  >
                    Remember me
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text
                    className="font-geist"
                    style={{
                      color: "#00897B",
                      fontWeight: "600",
                      backgroundColor: "rgba(0,137,123,0.1)",
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 8,
                    }}
                  >
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Enhanced Sign In Button */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  onPress={handleSignIn}
                  disabled={
                    isLoading || !email || !password || !isValidEmail(email)
                  }
                  style={[
                    {
                      borderRadius: 10,
                      paddingVertical: 16,
                      paddingHorizontal: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: "#00897B",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4,
                    },
                    isLoading || !email || !password || !isValidEmail(email)
                      ? { backgroundColor: "#D1D5DB" }
                      : {
                          backgroundColor: "#00897B",
                          backgroundGradient:
                            "linear-gradient(to right, #00897B, #00796B)",
                        },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    className="font-geist"
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "600",
                      marginRight: 8,
                    }}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Enhanced Sign Up Section */}
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.8)",
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: "#f1f5f9",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  className="font-geist"
                  style={{
                    color: "#64748B",
                    marginRight: 8,
                    textAlign: "center",
                  }}
                >
                  New to our platform?
                </Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text
                    className="font-geist"
                    style={{
                      color: "#00897B",
                      fontWeight: "600",
                      backgroundColor: "rgba(0,137,123,0.1)",
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      borderRadius: 8,
                    }}
                  >
                    Create Account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Alert Modal */}
      <AlertModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        {...alertConfig}
      />
    </>
  );
}
