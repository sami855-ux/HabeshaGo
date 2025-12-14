import { useThemeContext } from "@/context/ThemeContext"
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Info,
  LucideIcon,
  XCircle,
} from "lucide-react-native"
import React, { useEffect, useMemo, useRef } from "react"
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

interface AlertModalProps {
  visible?: boolean
  type?: "success" | "error" | "warning" | "info"
  title: string
  message?: string
  primaryButtonText?: string
  secondaryButtonText?: string
  onPrimaryPress?: () => void
  onSecondaryPress?: () => void
  onClose?: () => void
  showCloseButton?: boolean
  overlayClose?: boolean
  animationType?: "fade" | "slide" | "none"
  icon?: LucideIcon
  customIcon?: LucideIcon
  buttonDirection?: "horizontal" | "vertical"
  theme?: "light" | "dark" | "system"
  maxWidth?: number
  minWidth?: number
}

interface IconConfig {
  icon: LucideIcon
  color: string
  bgColor: string
  description: string
}

interface ButtonColors {
  primary: string
  hover: string
}

interface ModalColors {
  background: string
  surface: string
  card: string
  textPrimary: string
  textSecondary: string
  border: string
  overlay: string
}

const AlertModal: React.FC<AlertModalProps> = ({
  visible = false,
  type = "info",
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
  buttonDirection = "horizontal",
  theme: themeProp = "system",
  maxWidth = 400,
  minWidth = 300,
}) => {
  const { actualTheme: contextTheme, colors: themeColors } = useThemeContext()

  // Use prop theme if provided, otherwise use context theme
  const themeMode = themeProp === "system" ? contextTheme : themeProp
  const isDark = themeMode === "dark"

  const scaleValue = useRef(new Animated.Value(0)).current
  const opacityValue = useRef(new Animated.Value(0)).current

  // Calculate responsive width
  const modalWidth = useMemo(() => {
    const screenPadding = 48
    const availableWidth = SCREEN_WIDTH - screenPadding
    return Math.min(Math.max(availableWidth, minWidth), maxWidth)
  }, [SCREEN_WIDTH, maxWidth, minWidth])

  useEffect(() => {
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

  const getIconConfig = (): IconConfig => {
    const config: Record<string, IconConfig> = {
      success: {
        icon: CheckCircle,
        color: isDark ? "#34C759" : "#10B981",
        bgColor: isDark ? "#1C3B2A" : "#D1FAE5",
        description: "Operation completed successfully",
      },
      error: {
        icon: XCircle,
        color: isDark ? "#FF453A" : "#EF4444",
        bgColor: isDark ? "#3C1C1C" : "#FEE2E2",
        description: "An error occurred that needs your attention",
      },
      warning: {
        icon: AlertTriangle,
        color: isDark ? "#FF9F0A" : "#F59E0B",
        bgColor: isDark ? "#3C2D1C" : "#FEF3C7",
        description: "Important information requiring your review",
      },
      info: {
        icon: Info,
        color: isDark ? "#0A84FF" : "#3B82F6",
        bgColor: isDark ? "#1C2C3C" : "#DBEAFE",
        description: "Informational message for your reference",
      },
    }
    return config[type] || config.info
  }

  const getModalColors = (): ModalColors => {
    return {
      background: themeColors.background,
      surface: isDark ? "#2C2C2E" : "#F8F9FB",
      card: themeColors.card,
      textPrimary: themeColors.text,
      textSecondary: themeColors.mutedText,
      border: themeColors.border,
      overlay: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
    }
  }

  const modalColors = getModalColors()
  const iconConfig = getIconConfig()
  const IconComponent = customIcon || iconConfig.icon

  const handleOverlayPress = (): void => {
    if (overlayClose && onClose) {
      onClose()
    }
  }

  const handlePrimaryPress = (): void => {
    if (onPrimaryPress) {
      onPrimaryPress()
    }
    if (onClose) {
      onClose()
    }
  }

  const handleSecondaryPress = (): void => {
    if (onSecondaryPress) {
      onSecondaryPress()
    }
    if (onClose) {
      onClose()
    }
  }

  const getButtonColors = (): ButtonColors => {
    const colors: Record<string, ButtonColors> = {
      success: {
        primary: isDark ? "#30D158" : "#10B981",
        hover: isDark ? "#269944" : "#059669",
      },
      error: {
        primary: isDark ? "#FF453A" : "#EF4444",
        hover: isDark ? "#D92D20" : "#DC2626",
      },
      warning: {
        primary: isDark ? "#FF9F0A" : "#F59E0B",
        hover: isDark ? "#D97F06" : "#D97706",
      },
      info: {
        primary: isDark ? "#0A84FF" : "#3B82F6",
        hover: isDark ? "#0066CC" : "#2563EB",
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
          style={{ backgroundColor: modalColors.overlay }}
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
            backgroundColor: modalColors.background,
          }}
          className="rounded-2xl overflow-hidden shadow-2xl w-[75vw]"
        >
          {/* Header - Icon Row */}
          <View
            className="p-6 pb-0"
            style={{ backgroundColor: modalColors.background }}
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
            style={{ backgroundColor: modalColors.background }}
          >
            <Text
              className="text-xl mb-3 font-groteskBold leading-7"
              style={{ color: modalColors.textPrimary }}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            {message && (
              <Text
                className="text-base leading-6 font-geist"
                style={{ color: modalColors.textSecondary }}
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
              borderTopColor: modalColors.border,
              backgroundColor: modalColors.surface,
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
                  backgroundColor: modalColors.background,
                  borderColor: modalColors.border,
                }}
              >
                <Text
                  className="text-center text-base font-semibold font-geist"
                  style={{ color: modalColors.textPrimary }}
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
