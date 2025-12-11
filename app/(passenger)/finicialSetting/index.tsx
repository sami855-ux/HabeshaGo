import { useThemeContext } from "@/context/ThemeContext"
import { useRouter } from "expo-router"
import {
  AlertCircle,
  Banknote,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Lock,
  ShieldCheck,
  Upload,
  Wallet,
} from "lucide-react-native"
import { useState } from "react"
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const { width } = Dimensions.get("window")

const IOSToggle = ({
  value,
  onValueChange,
}: {
  value: boolean
  onValueChange: (value: boolean) => void
}) => {
  const { colors } = useThemeContext()
  const [animation] = useState(new Animated.Value(value ? 1 : 0))
  const [isAnimating, setIsAnimating] = useState(false)

  const handlePress = () => {
    if (isAnimating) return
    setIsAnimating(true)
    const newValue = !value

    Animated.spring(animation, {
      toValue: newValue ? 1 : 0,
      tension: 200,
      friction: 20,
      useNativeDriver: false,
    }).start(() => {
      setIsAnimating(false)
      onValueChange(newValue)
    })
  }

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  })

  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  })

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={{ width: 51, height: 31 }}
    >
      <Animated.View
        style={{
          width: 51,
          height: 31,
          borderRadius: 16,
          backgroundColor,
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }}
      >
        <Animated.View
          style={{
            width: 27,
            height: 27,
            borderRadius: 13.5,
            backgroundColor: "#FFFFFF",
            transform: [{ translateX }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 2,
            elevation: 4,
          }}
        />
      </Animated.View>
    </TouchableOpacity>
  )
}

const SettingItem = ({
  icon: Icon,
  title,
  subtitle,
  value,
  onPress,
  showToggle = false,
  toggleValue = false,
  onToggleChange,
  showChevron = true,
}: any) => {
  const { colors } = useThemeContext()

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center py-4"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: colors.primary + "15" }}
      >
        <Icon size={20} color={colors.primary} />
      </View>

      <View className="flex-1">
        <Text
          className="text-base font-semibold font-geist"
          style={{ color: colors.text }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            className="text-sm mt-1 font-geist"
            style={{ color: colors.mutedText }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {value && !showToggle && (
        <Text
          className="text-sm mr-2 font-geist"
          style={{ color: colors.mutedText }}
        >
          {value}
        </Text>
      )}

      {showToggle ? (
        <IOSToggle value={toggleValue} onValueChange={onToggleChange} />
      ) : showChevron ? (
        <ChevronRight size={20} color={colors.mutedText} />
      ) : null}
    </TouchableOpacity>
  )
}

const SectionHeader = ({ title }: any) => {
  const { colors } = useThemeContext()

  return (
    <View className="mb-4">
      <Text
        className="text-base font-grotesk tracking-tight"
        style={{ color: colors.text }}
      >
        {title}
      </Text>
    </View>
  )
}

const FinancialSettings = () => {
  const router = useRouter()
  const { colors, actualTheme } = useThemeContext()

  // State for various toggles and settings
  const [requirePin, setRequirePin] = useState(true)
  const [requireBiometric, setRequireBiometric] = useState(true)
  const [internationalTransactions, setInternationalTransactions] =
    useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [autoBillPayments, setAutoBillPayments] = useState(false)
  const [spendingInsights, setSpendingInsights] = useState(true)
  const [transactionAlerts, setTransactionAlerts] = useState(true)
  const [showFeesModal, setShowFeesModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  const handleResetSettings = () => {
    setShowResetModal(false)
    Alert.alert(
      "Settings Reset",
      "All financial settings have been restored to defaults",
      [{ text: "OK", style: "default" }]
    )
  }

  const statusBarStyle =
    actualTheme === "dark" ? "light-content" : "dark-content"

  return (
    <>
      <StatusBar
        translucent={true}
        barStyle={statusBarStyle}
        backgroundColor="transparent"
      />

      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Header */}
        <View
          className="pt-16 pb-8 px-6"
          style={{ backgroundColor: colors.primary }}
        >
          <View className="flex-row items-center mb-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View className="flex-1 ml-4">
              <Text className="text-2xl font-medium text-white font-geist">
                Financial Settings
              </Text>
              <Text className="text-white/90 mt-1 text-base font-geist">
                Manage your payment preferences and security
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 -mt-4">
          {/* Wallet Preferences */}
          <View
            className="rounded-2xl p-5 mb-6"
            style={{
              backgroundColor: colors.card,
            }}
          >
            <SectionHeader title="Wallet Preferences" />

            <SettingItem
              icon={CreditCard}
              title="Default Top up Method"
              subtitle="Card ending in 4242"
              value="Edit"
              onPress={() => {}}
            />

            <SettingItem
              icon={Upload}
              title="Auto Top-up"
              subtitle="Add funds when balance is low"
              showToggle
              toggleValue={autoSave}
              onToggleChange={setAutoSave}
            />

            <SettingItem
              icon={Bell}
              title="Transaction Alerts"
              subtitle="Get notified for all transactions"
              showToggle
              toggleValue={transactionAlerts}
              onToggleChange={setTransactionAlerts}
            />
          </View>

          {/* Security & Privacy */}
          <View
            className="rounded-2xl p-5 mb-6"
            style={{
              backgroundColor: colors.card,
            }}
          >
            <SectionHeader title="Security & Privacy" />

            <SettingItem
              icon={Lock}
              title="Require PIN for Payments"
              subtitle="Extra security for all transactions"
              showToggle
              toggleValue={requirePin}
              onToggleChange={setRequirePin}
            />

            <SettingItem
              icon={ShieldCheck}
              title="Biometric Authentication"
              subtitle="Use fingerprint or face ID"
              showToggle
              toggleValue={requireBiometric}
              onToggleChange={setRequireBiometric}
            />
          </View>

          {/* Spending Controls */}
          <View
            className="rounded-2xl p-5 mb-6"
            style={{
              backgroundColor: colors.card,
            }}
          >
            <SectionHeader title="Spending Controls" />

            <SettingItem
              icon={Wallet}
              title="Daily Spending Limit"
              value="ETB 50,000"
              onPress={() => {}}
            />

            <SettingItem
              icon={BarChart3}
              title="Spending Insights"
              subtitle="Weekly reports and analytics"
              showToggle
              toggleValue={spendingInsights}
              onToggleChange={setSpendingInsights}
            />
          </View>

          {/* Advanced Settings */}
          <View
            className="rounded-2xl p-5 mb-8"
            style={{
              backgroundColor: colors.card,
            }}
          >
            <SectionHeader title="Advanced" />

            <SettingItem
              icon={FileText}
              title="Export Statements"
              subtitle="Last 6 months"
              onPress={() => {}}
            />

            <TouchableOpacity
              className="flex-row items-center justify-center py-4 mt-4 rounded-xl"
              style={{
                backgroundColor: colors.error + "10",
                borderWidth: 1,
                borderColor: colors.error + "30",
              }}
              onPress={() => setShowResetModal(true)}
            >
              <AlertCircle size={20} color={colors.error} />
              <Text
                className="font-semibold ml-3 text-base font-geist"
                style={{ color: colors.error }}
              >
                Reset All Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modern Fees Modal */}
      <Modal
        visible={showFeesModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFeesModal(false)}
      >
        <View
          className="flex-1 justify-center items-center p-6"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <View
            className="rounded-2xl p-6 w-full max-w-sm"
            style={{
              backgroundColor: colors.card,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 15,
            }}
          >
            <View className="items-center mb-6">
              <View
                className="w-14 h-14 rounded-xl items-center justify-center mb-4"
                style={{ backgroundColor: colors.primary + "15" }}
              >
                <Banknote size={28} color={colors.primary} />
              </View>
              <Text
                className="text-xl font-bold text-center"
                style={{ color: colors.text }}
              >
                Transaction Fees
              </Text>
              <Text
                className="text-center mt-2 text-sm"
                style={{ color: colors.mutedText }}
              >
                Transparent pricing for all transactions
              </Text>
            </View>

            <View className="space-y-3 mb-8">
              <View
                className="flex-row justify-between items-center py-3 border-b"
                style={{ borderBottomColor: colors.border }}
              >
                <Text style={{ color: colors.text }} className="text-sm">
                  Local Transfers
                </Text>
                <Text
                  className="font-semibold text-sm"
                  style={{ color: colors.primary }}
                >
                  0.5%
                </Text>
              </View>
              <View
                className="flex-row justify-between items-center py-3 border-b"
                style={{ borderBottomColor: colors.border }}
              >
                <Text style={{ color: colors.text }} className="text-sm">
                  International Transfers
                </Text>
                <Text
                  className="font-semibold text-sm"
                  style={{ color: colors.primary }}
                >
                  2.0%
                </Text>
              </View>
              <View
                className="flex-row justify-between items-center py-3 border-b"
                style={{ borderBottomColor: colors.border }}
              >
                <Text style={{ color: colors.text }} className="text-sm">
                  ATM Withdrawals
                </Text>
                <Text
                  className="font-semibold text-sm"
                  style={{ color: colors.primary }}
                >
                  1.0%
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-3">
                <Text style={{ color: colors.text }} className="text-sm">
                  Peer-to-Peer
                </Text>
                <Text
                  className="font-semibold text-sm"
                  style={{ color: colors.success }}
                >
                  Free
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="py-3 rounded-lg"
              style={{ backgroundColor: colors.primary }}
              onPress={() => setShowFeesModal(false)}
              activeOpacity={0.8}
            >
              <Text className="text-white text-center font-semibold text-base">
                Got it
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modern Reset Modal */}
      <Modal
        visible={showResetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View
          className="flex-1 justify-center items-center p-6"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <View
            className="rounded-2xl p-6 w-full max-w-sm"
            style={{
              backgroundColor: colors.card,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 15,
            }}
          >
            <View className="items-center mb-6">
              <View
                className="w-14 h-14 rounded-xl items-center justify-center mb-4"
                style={{ backgroundColor: colors.error + "15" }}
              >
                <AlertCircle size={28} color={colors.error} />
              </View>
              <Text
                className="text-xl font-geist text-center"
                style={{ color: colors.text }}
              >
                Reset Settings?
              </Text>
              <Text
                className="text-center mt-2 text-sm px-2 font-geist "
                style={{ color: colors.mutedText }}
              >
                This will restore all financial settings to their factory
                defaults. This action cannot be undone.
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg"
                style={{ backgroundColor: colors.border }}
                onPress={() => setShowResetModal(false)}
                activeOpacity={0.8}
              >
                <Text
                  className="text-center font-semibold font-geist text-base"
                  style={{ color: colors.text }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg"
                style={{ backgroundColor: colors.error }}
                onPress={handleResetSettings}
                activeOpacity={0.8}
              >
                <Text className="text-white text-center font-geist font-semibold text-base">
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

export default FinancialSettings
