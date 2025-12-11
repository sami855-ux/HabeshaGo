import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Info,
  XCircle,
} from "lucide-react-native"
import React from "react"
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

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
  overlayClose = true,
  animationType = "fade",
  icon,
  customIcon,
  buttonDirection = "horizontal", // 'horizontal' or 'vertical'
  theme = "light", // 'light' or 'dark'
  maxWidth = 400,
  minWidth = 300,
}) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current
  const opacityValue = React.useRef(new Animated.Value(0)).current

  // Calculate responsive width
  const modalWidth = React.useMemo(() => {
    const screenPadding = 48
    const availableWidth = SCREEN_WIDTH - screenPadding
    return Math.min(Math.max(availableWidth, minWidth), maxWidth)
  }, [SCREEN_WIDTH, maxWidth, minWidth])

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
      ]).start()
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
      ]).start()
    }
  }, [visible])

  const getIconConfig = () => {
    const config = {
      success: {
        icon: CheckCircle,
        color: "#10B981",
        bgColor: theme === "dark" ? "#064E3B" : "#D1FAE5",
        description: "Operation completed successfully",
      },
      error: {
        icon: XCircle,
        color: "#EF4444",
        bgColor: theme === "dark" ? "#7F1D1D" : "#FEE2E2",
        description: "An error occurred that needs your attention",
      },
      warning: {
        icon: AlertTriangle,
        color: "#F59E0B",
        bgColor: theme === "dark" ? "#78350F" : "#FEF3C7",
        description: "Important information requiring your review",
      },
      info: {
        icon: Info,
        color: "#3B82F6",
        bgColor: theme === "dark" ? "#1E3A8A" : "#DBEAFE",
        description: "Informational message for your reference",
      },
    }
    return config[type] || config.info
  }

  const getThemeColors = () => {
    return theme === "dark"
      ? {
          // Dark theme colors
          background: "#0F172A", // slate-900
          surface: "#1E293B", // slate-800
          card: "#334155", // slate-700
          textPrimary: "#F1F5F9", // slate-100
          textSecondary: "#94A3B8", // slate-400
          textTertiary: "#64748B", // slate-500
          border: "#475569", // slate-600
          overlay: "rgba(15, 23, 42, 0.8)",
        }
      : {
          // Light theme colors
          background: "#FFFFFF",
          surface: "#F8FAFC", // slate-50
          card: "#F1F5F9", // slate-100
          textPrimary: "#0F172A", // slate-900
          textSecondary: "#475569", // slate-600
          textTertiary: "#64748B", // slate-500
          border: "#E2E8F0", // slate-200
          overlay: "rgba(0, 0, 0, 0.5)",
        }
  }

  const themeColors = getThemeColors()
  const iconConfig = getIconConfig()
  const IconComponent = customIcon || iconConfig.icon

  const handleOverlayPress = () => {
    if (overlayClose && onClose) {
      onClose()
    }
  }

  const handlePrimaryPress = () => {
    if (onPrimaryPress) {
      onPrimaryPress()
    }
    if (onClose) {
      onClose()
    }
  }

  const handleSecondaryPress = () => {
    if (onSecondaryPress) {
      onSecondaryPress()
    }
    if (onClose) {
      onClose()
    }
  }

  const getButtonColors = () => {
    const colors = {
      success: {
        primary: theme === "dark" ? "#059669" : "#10B981", // green-600/green-500
        hover: theme === "dark" ? "#047857" : "#059669", // green-700/green-600
      },
      error: {
        primary: theme === "dark" ? "#DC2626" : "#EF4444", // red-600/red-500
        hover: theme === "dark" ? "#B91C1C" : "#DC2626", // red-700/red-600
      },
      warning: {
        primary: theme === "dark" ? "#D97706" : "#F59E0B", // amber-600/amber-500
        hover: theme === "dark" ? "#B45309" : "#D97706", // amber-700/amber-600
      },
      info: {
        primary: theme === "dark" ? "#2563EB" : "#3B82F6", // blue-600/blue-500
        hover: theme === "dark" ? "#1D4ED8" : "#2563EB", // blue-700/blue-600
      },
    }
    return colors[type] || colors.info
  }

  const buttonColors = getButtonColors()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View className="flex-1 justify-center items-center px-6">
        {/* Overlay */}
        <TouchableOpacity
          className="absolute inset-0"
          style={{ backgroundColor: themeColors.overlay }}
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
          className="rounded-2xl overflow-hidden shadow-2xl w-[75vw]"
          style={{ backgroundColor: themeColors.background }}
        >
          {/* Header - Icon Row */}
          <View
            className="p-6 pb-0"
            style={{ backgroundColor: themeColors.background }}
          >
            <View className="flex-row items-center justify-between mb-4">
              {/* Status Icon with Description */}
              <View className="flex-row items-center flex-1 mr-4">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: iconConfig.bgColor }}
                >
                  <IconComponent size={24} color={iconConfig.color} />
                </View>
              </View>
            </View>
          </View>

          {/* Content - Text Below Icons */}
          <View
            className="px-6 pb-6"
            style={{ backgroundColor: themeColors.background }}
          >
            <Text
              className="text-xl mb-3 font-groteskBold leading-7"
              style={{ color: themeColors.textPrimary }}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            {message && (
              <Text
                className="text-base leading-6 font-geist"
                style={{ color: themeColors.textSecondary }}
                numberOfLines={6}
                ellipsizeMode="tail"
              >
                {message}
              </Text>
            )}
          </View>

          {/* Action Section */}
          <View
            className="p-4 border-t"
            style={{
              borderTopColor: themeColors.border,
              backgroundColor: themeColors.surface,
              flexDirection:
                buttonDirection === "vertical" ? "column" : "row-reverse",
              gap: 12,
            }}
          >
            {/* Primary Button */}
            <TouchableOpacity
              onPress={handlePrimaryPress}
              className={`flex-row items-center justify-center py-4 px-6 rounded-xl ${
                buttonDirection === "horizontal" ? "flex-1" : "w-full"
              }`}
              style={{ backgroundColor: buttonColors.primary }}
            >
              <Text className="text-white font-geist text-base font-semibold mr-2">
                {primaryButtonText}
              </Text>
              <ChevronRight size={16} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Secondary Button */}
            {secondaryButtonText && (
              <TouchableOpacity
                onPress={handleSecondaryPress}
                className={`py-4 px-6 rounded-xl border ${
                  buttonDirection === "horizontal" ? "flex-1" : "w-full"
                }`}
                style={{
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border,
                }}
              >
                <Text
                  className="text-center text-base font-semibold font-geist"
                  style={{ color: themeColors.textPrimary }}
                >
                  {secondaryButtonText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

export default AlertModal
