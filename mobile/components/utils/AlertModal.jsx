import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  ChevronRight,
} from "lucide-react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AlertModal = ({
  visible = false,
  type = "info", // 'success', 'error', 'warning', 'info'
  title,
  message,
  primaryButtonText = "Confirm",
  secondaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
  onClose,
  showCloseButton = true,
  overlayClose = true, // Changed default to true
  animationType = "fade",
  icon,
  customIcon,
  buttonDirection = "horizontal", // 'horizontal' or 'vertical'
  theme = "light", // 'light' or 'dark'
  maxWidth = 400, // Maximum width for larger screens
  minWidth = 300, // Minimum width
}) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;

  // Calculate responsive width
  const modalWidth = React.useMemo(() => {
    const screenPadding = 48; // 24px on each side
    const availableWidth = SCREEN_WIDTH - screenPadding;

    // Use the smaller of: available screen width, maxWidth, but not less than minWidth
    return Math.min(Math.max(availableWidth, minWidth), maxWidth);
  }, [SCREEN_WIDTH, maxWidth, minWidth]);

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 150,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIconConfig = () => {
    const config = {
      success: { icon: CheckCircle, color: "#43A047", bgColor: "#E8F5E8" },
      error: { icon: XCircle, color: "#E53935", bgColor: "#FFEBEE" },
      warning: { icon: AlertTriangle, color: "#FF9800", bgColor: "#FFF3E0" },
      info: { icon: Info, color: "#00897B", bgColor: "#E0F2F1" },
    };
    return config[type] || config.info;
  };

  const getThemeColors = () => {
    return theme === "dark"
      ? {
          bg: "#263238",
          surface: "#37474F",
          textPrimary: "#ECEFF1",
          textSecondary: "#B0BEC5",
          border: "#455A64",
        }
      : {
          bg: "#FFFFFF",
          surface: "#FAFAFA",
          textPrimary: "#212121",
          textSecondary: "#616161",
          border: "#E0E0E0",
        };
  };

  const themeColors = getThemeColors();
  const iconConfig = getIconConfig();
  const IconComponent = customIcon || iconConfig.icon;

  const handleOverlayPress = () => {
    if (overlayClose && onClose) {
      onClose();
    }
  };

  const handlePrimaryPress = () => {
    if (onPrimaryPress) {
      onPrimaryPress();
    }
    if (onClose) {
      onClose();
    }
  };

  const handleSecondaryPress = () => {
    if (onSecondaryPress) {
      onSecondaryPress();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View className="flex-1 justify-center items-center px-6">
        {/* Overlay - Now directly clickable */}
        <TouchableOpacity
          className="absolute inset-0 bg-black/50"
          onPress={handleOverlayPress}
          activeOpacity={1}
        >
          <Animated.View style={{ opacity: opacityValue }} className="flex-1" />
        </TouchableOpacity>

        {/* Modal Content */}
        <Animated.View
          style={{
            transform: [{ scale: scaleValue }],
            opacity: opacityValue,
            width: modalWidth,
            maxWidth: "100%",
          }}
          className={`rounded-2xl overflow-hidden ${
            theme === "dark" ? "bg-deepBlueGray" : "bg-white"
          } shadow-2xl`}
        >
          {/* Header - Icon Row */}
          <View
            className={`p-6 pb-0 ${theme === "dark" ? "bg-deepBlueGray" : "bg-white"}`}
          >
            <View className="flex-row items-center justify-between mb-4">
              {/* Status Icon */}
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: iconConfig.bgColor }}
              >
                <IconComponent size={24} color={iconConfig.color} />
              </View>

              {/* Close Button */}
              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
                >
                  <X
                    size={18}
                    color={theme === "dark" ? "#ECEFF1" : "#616161"}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Content - Text Below Icons */}
          <View
            className={`px-6 pb-6 ${theme === "dark" ? "bg-deepBlueGray" : "bg-white"}`}
          >
            <Text
              className={`text-xl mb-3 font-groteskBold ${
                theme === "dark" ? "text-offWhite" : "text-charcoal"
              }`}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            {message && (
              <Text
                className={`text-base leading-6 font-geist ${
                  theme === "dark" ? "text-offWhite/80" : "text-slateGray"
                }`}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {message}
              </Text>
            )}
          </View>

          {/* Buttons */}
          <View
            className={`p-4 border-t ${
              theme === "dark" ? "border-gray-600" : "border-gray-100"
            }`}
            style={{
              flexDirection:
                buttonDirection === "vertical" ? "column" : "row-reverse",
              gap: 12,
            }}
          >
            {/* Primary Button */}
            <TouchableOpacity
              onPress={handlePrimaryPress}
              className={`flex-row items-center justify-center py-4 px-6 rounded-xl ${
                type === "success"
                  ? "bg-[#21af50]"
                  : type === "error"
                    ? "bg-red-400"
                    : type === "warning"
                      ? "bg-amber-500"
                      : "bg-deepTeal"
              } ${buttonDirection === "horizontal" ? "flex-1" : "w-full"}`}
            >
              <Text className="text-white font-geist text-lg font-semibold mr-2">
                {primaryButtonText}
              </Text>
              <ChevronRight size={16} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Secondary Button */}
            {secondaryButtonText && (
              <TouchableOpacity
                onPress={handleSecondaryPress}
                className={`py-4 px-6 rounded-xl border ${
                  theme === "dark"
                    ? "bg-deepBlueGray border-gray-600"
                    : "bg-white border-gray-300"
                } ${buttonDirection === "horizontal" ? "flex-1" : "w-full"}`}
              >
                <Text
                  className={`text-center text-base font-semibold font-inter ${
                    theme === "dark" ? "text-offWhite" : "text-charcoal"
                  }`}
                >
                  {secondaryButtonText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default AlertModal;
